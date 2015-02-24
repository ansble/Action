var modelMe = require('./action.model')
    , utils = require('./action.utils')

    , viewMe = function (objectIn) {
        'use strict';

        var that = this
            , newView = modelMe(objectIn)
            , children = []

            , isMyState = function (stateId) {
                var chk = newView.stateEvents.filter(function (evnt) {
                    return evnt === stateId || evnt === stateId.replace('/', '');
                });

                return (chk.length > 0);
            }

            , renderStack = [];

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

        if(typeof newView.stateEvents !== 'string' && !Array.isArray(newView.stateEvents)){
            that.emit('global:error', new utils.Error('required param', 'stateEvents is required for a view and must be an array', that));
            return;
        }

        //make sure that stateEvents is an array
        if(typeof newView.stateEvents === 'string'){
            newView.stateEvents = [newView.stateEvents];
        }

       renderStack.push(function(){
            var that = this;

            that.emit('rendered:' + that.viewId);

            children.forEach(function (child) {
                that.emit('target:set:' + child.viewId, document.querySelector(child.selector));
            });
        });

        if(typeof newView.render === 'function'){
            //now with a renderStack to allow multiple things to be done on render
            renderStack.push(newView.render);
        } else if(Array.isArray(newView.render)){
            //an array of render functions... cool
            renderStack = renderStack.concat(newView.render);
        }

        //overwrite the existing render so that it renders the full render stack
        newView.render = function () {
            renderStack.forEach(function (renderer) {
                if(typeof renderer === 'function'){
                    renderer.apply(newView, []);
                }
            });
        };


        if(newView.getElement){
            //hook up the destroy method for this view
            newView.listen('destroy:' + newView.viewId, function(){
                newView.destroy();
            }, newView);

            newView.required([
                        'data:set:' + newView.dataId
                        , 'template:set:' + newView.templateId
                        , 'target:set:' + newView.viewId
                    ], function (eventData) {
                this.set(eventData[0]);
                this.template = eventData[1];

                this.render.apply(this);
            }, newView, true);
        } else {
            newView.required(['data:set:' + newView.dataId, 'template:set:' + newView.templateId], function (eventData) {
                this.set(eventData[0]);
                this.template = eventData[1];
                this.element = eventData[2];

                this.render.apply(newView);
            }, newView, true);
        }

        if(typeof newView.destroy === 'undefined'){
            newView.destroy = function(){
                //deal with events outside the DOM
                newView.tearDown();

                //notify children to tear themselves down
                children.forEach(function (child) {
                    newView.emit('destroy:' + child.viewId);
                });

                //deal with the DOM
                newView.element.remove();
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
            if(isMyState(stateId)){
                if(typeof newView.template !== 'function'){
                    newView.emit('template:get', newView.templateId);
                }

                newView.emit('data:get:' + newView.dataId);
            } else if (typeof newView.element !== 'undefined' && newView.element.style.display !== 'none') {
                newView.element.style.display = 'none';
            }
        }, newView);

        return newView;
    };

module.exports = viewMe;
