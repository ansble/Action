var modelMe = require('./action.model')
    , utils = require('./action.utils')

    , viewMe = function (objectIn) {
        'use strict';

        var that = this
            , _stateReady = (typeof objectIn.stateReady === 'function')
            , newView = modelMe(objectIn)
            , children = {};

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

            Object.getOwnPropertyNames(children).forEach(function (childEvent) {
                newView.emit(childEvent, document.querySelector(children[childEvent]));
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

        if(typeof newView.targetId !== 'undefined'){
            newView.requiredEvent('target:set:' + newView.targetId, function(elementIn){
                this.element = elementIn;
            });
        }

        if(typeof newView.destroy === 'undefined'){
            newView.destroy = function(){
                //TODO: write this out/figure it out
            };
        }
        
        newView.registerChild = function(eventIn, selectorIn){
            children[eventIn] = selectorIn;
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
            }
        }, newView);

        return newView;
    };

module.exports = viewMe;