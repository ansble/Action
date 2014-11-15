var modelMe = require('./action.model')
    , utils = require('./action.utils')

    , viewMe = function (objectIn) {
        'use strict';

        var that = this
            , _stateReady = (typeof objectIn.stateReady === 'function')
            , newView = modelMe(objectIn)
            , children = [];

        if(typeof newView.render === 'undefined'){
            that.emit('global:error', new utils.Error('required param', 'render() is required for a view', that));
            return;
        }

        if(typeof newView.templateId === 'undefined'){
            that.emit('global:error', new utils.Error('required param', 'templateId is required for a view', that));
            return;
        }

        if(typeof newView.dataId === 'undefined'){
            that.emit('global:error', new utils.Error('required param', 'dataId is required for a view', that));
            return;
        }

        if(typeof newView.viewId === 'undefined'){
            that.emit('global:error', new utils.Error('required param', 'viewId is required for a view', that));
            return;
        }

        //TODO: should require a stateEvent which can be either
        //  a string or an array of strings containing the event
        //  or events that this view cares about

        if(_stateReady){
            newView.super.stateReady = function(){
                newView.render.apply(newView);
            };
        } else {
            newView.stateReady = function(){
                newView.render.apply(newView);
            };
        }

        newView.super.render = newView.render;

        //TODO: maybe render is no longer required. It defaults to executing the template on the
        //  data and targeting the element. Instead the template, data and target (or a target elem) 
        //  events are required.

        newView.render = function(){
            newView.super.render.apply(newView);
            newView.emit('rendered:' + newView.viewId);

            children.forEach(function (child) {
                newView.emit('target:set:' + child.viewId, document.querySelector(child.selector));
            });
        };

        //require event for the data
        newView.requiredEvent('data:set:' + newView.dataId, function(dataIn){
            this.set(dataIn);
        }, newView, true);

        //required event for the template
        newView.requiredEvent('template:set:' + newView.templateId, function(templateIn){
            this.template = templateIn;
        }, newView, true);

        if(newView.getElement){
            newView.requiredEvent('target:set:' + newView.viewId, function(elementIn){
                this.element = elementIn;
            });

            newView.listen('destroy:' + newView.viewId, function(){
                this.destroy();
            }, newView);
        }

        if(typeof newView.destroy === 'undefined'){
            newView.destroy = function(){
                //deal with events outside the DOM
                this.tearDown()

                //notify children to tear themselves down
                children.forEach(function (child) {
                    this.emit('destroy:' + child.viewId);
                });

                //deal with the DOM
                this.element.remove();
            };
        }
        
        newView.registerChild = function(viewIdIn, selectorIn){
            children.push({
                selector: selectorIn
                , viewId: viewIdIn
            });
        };

        newView.listChildren = function(){
            return children;
        };

        newView.save = function () {
            var that = this;
            if(that.getChanges().length > 0){
                //there have been changes to persist
                that.emit('data:changed:' + that.dataId, that.flatten());
                that.clearChanges();
            }
        };

        newView.listen('state:change', function(stateId){
            var that = this;

            if(stateId === that.stateEvent || stateId.replace('/', '') === that.stateEvent){
                that.emit('template:get', that.templateId);
                that.emit('data:get:' + that.dataId);
            } else if (typeof that.element !== 'undefined' && that.elemtn.style.display !== 'none') {
                that.element.style.display = 'none';
            }
        }, newView);

        return newView;
    };

module.exports = viewMe;