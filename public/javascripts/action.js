(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ajaxMe =  function (objectIn) {
    'use strict';

    var obj = objectIn || {};

    obj.ajaxGet = function(setVariableName, successFunction, urlIn){
        var that = this
            , requestUrl = urlIn || that.url// + '?' + Date.now()

            , oReq = new XMLHttpRequest();

        oReq.onload = function(){
                    var data = JSON.parse(this.responseText);

                    if(this.status.match(/^[23][0-9][0-9]$/)){
                        that.emit(that.get('dataEvent'), data);

                        if(typeof setVariableName === 'string'){
                            that.set(setVariableName, data);
                        }else{
                            that.set(data);
                        }

                        if(typeof successFunction === 'function'){
                            successFunction.apply(that, [data]);
                        }
                    }else if(this.status.match(/^[4][0-9][0-9]$/)){

                    }else if(this.status.match(/^[5][0-9][0-9]$/)){
                        that.emit('global:error', new action.Error('http', 'Error in request', that));
                    }
                };

        oReq.onerror = function(xhr, errorType, error){
                    that.emit('global:error', new action.Error('http', 'Error in request type: ' + errorType, that, error));
                };

        oReq.open('get', requestUrl, true);
        oReq.send();
    };


    return obj;
};

module.exports = ajaxMe;
},{}],2:[function(require,module,exports){
var eventMe = function (objectIn) {
    'use strict';

    var returnObject = objectIn
        , localEvents = {}
        , myEvents = [];

    //set an emitter id for troubleshooting
    returnObject.emitterId = Math.ceil(Math.random() * 10000);

    //create the lcoal event Store
    returnObject.eventStore = {};

    returnObject.emit = function(eventNameIn, eventDataIn, localFlag){
        var that = this
            , functionToCall
            , eventStack = (typeof localFlag !== 'undefined' && localFlag) ? that.eventStore[eventNameIn] : action.eventStore[eventNameIn];

        //emit the event
        if(typeof eventStack !== 'undefined'){
            eventStack.forEach(function (listener) {
                if(typeof listener.scope !== 'undefined'){
                    listener.call.apply(listener.scope,[eventDataIn, that.emitterId]);
                }else{
                    listener.call(eventDataIn, that.emitterId);
                }

                if(listener.once){
                    that.silence({
                        eventName: eventNameIn
                        , scope: listener.scope
                        , handler: listener.call
                        , once: listener.once
                        , local: listener.local
                    });
                }
            });
        }
    };

    returnObject.emitLocal = function(eventNameIn, eventDataIn){
        var that = this;

        that.emit(eventNameIn, eventDataIn, true);
    };

    returnObject.listen = function(eventNameIn, handlerIn, scopeIn, onceIn, localFlagIn){
        var that = this
            , newCheck = true

            //attribute holders and such
            , eventName = eventNameIn
            , handler = handlerIn
            , scope = scopeIn
            , local = localFlagIn
            , once = onceIn

            //variables for later
            , eventStack
            , newEvent;

        if(typeof eventNameIn === 'object'){
            //we have an object to split up dude
            eventName = eventNameIn.eventName;
            handler = eventNameIn.handler;
            scope = eventNameIn.scope;
            once = (typeof eventNameIn.once !== 'undefined') ? eventNameIn.once : false;
            local = (typeof eventNameIn.local !== 'undefined') ? eventNameIn.local : false;
        }

        eventStack = (typeof local !== 'undefined' && local) ? that.eventStore[eventName] : action.eventStore[eventName];
        newEvent = (typeof local !== 'undefined' && local) ? that : action;

        if(typeof eventStack !== 'undefined'){
            //already exists check to see if the function is already bound
            eventStack.some(function (listener) {
                if(listener.call.toString() === handler.toString() && listener.once === false){
                    newCheck = false;
                    return true;
                }
            });

            if(newCheck && typeof scope !== 'undefined'){
                    eventStack.push({once: once, call: handler, scope: scope, local: local});
            }else if(newCheck){
                    eventStack.push({once: once, call:handler, local: local});
            }

        } else {
            //new event
            newEvent.eventStore[eventName] = []; //use an array to store functions
            if(typeof scope !== 'undefined'){
                newEvent.eventStore[eventName].push({once: once, call: handler, scope: scope, local: local});
            }else{
                newEvent.eventStore[eventName].push({once: once, call: handler, local: local});
            }
        }

        myEvents.push({eventName: eventName, once: once, call: handler, scope: scope, local:local});
    };

    returnObject.listenLocal = function(eventNameIn, handlerIn, scopeIn, onceIn){
        var that = this;

        //convenience function for local listens
        if(typeof eventNameIn === 'object'){
            eventNameIn.local = true;
            that.listen(eventNameIn);
        } else {
            that.listen({
                eventName: eventNameIn
                , handler: handlerIn
                , scope: scopeIn
                , once: onceIn
                , local: true
            });
        }
    };

    returnObject.listenOnce = function(eventNameIn, handlerIn, scopeIn, localFlagIn){
        //same thing as .listen() but is only triggered once
        var that = this;

        if(typeof eventNameIn === 'object'){
            eventNameIn.once = true;
            that.listen(eventNameIn);
        }else{
            that.listen({
                eventName: eventNameIn
                , handler: handlerIn
                , scope: scopeIn
                , once: true
            });
        }
    };

    returnObject.listenOnceLocal = function(eventNameIn, handlerIn, scopeIn){
        var that = this;

        //same thing as .listen() but is only triggered once
        if(typeof eventNameIn === 'object'){
            eventNameIn.local = true;
            eventNameIn.once = true;
            that.listen(eventNameIn);
        }else{
            that.listen({
                eventName: eventNameIn
                , handler: handlerIn
                , scope: scopeIn
                , local: true
                , once: true
            });
        }
    };

    returnObject.silence = function(eventNameIn, handlerIn, onceIn, localFlagIn, scopeIn){
        //localize variables
        var that = this
            , i
            , eventName = eventNameIn
            , handler = handlerIn
            , once = onceIn
            , scope = scopeIn
            , localFlag = localFlagIn
            , store;

        if(typeof eventNameIn === 'object'){
            // passed in a collection of params instead of params
            eventName = eventNameIn.eventName;
            handler = eventNameIn.handler;
            once = eventNameIn.once;
            scope = eventNameIn.scope;
            localFlag = eventNameIn.local;
        }

        //local or global event store?
        store = (typeof localFlag === 'undefined' || !localFlag) ? action : that;

        if(typeof store.eventStore[eventName] === 'undefined'){
            //if there is no event with that name... return nothing
            return;
        }

        if(typeof handler !== 'undefined'){
            //there is an event that matches... proceed
            store.eventStore[eventName] = store.eventStore[eventName].filter(function(listener){
                var isMatch = !!(handler.toString() === listener.call.toString());

                //function is passed in
                if(typeof scope !== 'undefined'){
                    //scope is passed in...
                    isMatch = !!(isMatch && scope);

                    if(typeof once === 'boolean'){
                        // function + scope + once provides the match
                        isMatch = !!(isMatch && once === listener.once);
                    }
                } else if (typeof once === 'boolean'){
                    isMatch = !!( isMatch && listener.once === once);
                }

                return !isMatch;
            });

        } else {
            //no function unbind everything by resetting
            store.eventStore[eventName] = [];
        }
    };

    returnObject.silenceLocal = function(eventNameIn, handlerIn, onceIn, scopeIn){
        var that = this;

        //essentially a convenience function.
        if(typeof eventNameIn === 'object'){
            eventNameIn.local = true;
            that.silence(eventNameIn);
        }else{
            that.silence({
                eventName: eventNameIn
                , handler: handlerIn
                , once: onceIn
                , scope: scopeIn
                , local: true
            });
        }
    };

    //Event Based state machine
    returnObject.requiredEvent = function(name, callback, context, fireMultipleIn){
        var that = this

            , stateUpdate = function(nameIn, stateEventsIn){
                var name = nameIn
                    , stateEvents = stateEventsIn;

                return function(){
                    var truthy = true
                        , key;

                    if(typeof stateEvents[name] !== 'undefined'){
                        stateEvents[name] = true;

                        for(key in stateEvents){
                            truthy = truthy && stateEvents[key];
                        }

                        if(truthy){
                            if(!that._triggeredStateReady || that._fireMultiple){
                                //feels like a little bit of a hack.
                                //  lets the data finish propogating before triggering the call
                                setTimeout(that.stateReady.apply(that), 100);
                                that._triggeredStateReady = true;
                            }
                        }
                    }
                };
            };

        that._fireMultiple = (typeof fireMultipleIn !== 'undefined') ? fireMultipleIn : false;

        //init some hidden storage if needed
        if(typeof that.stateEvents === 'undefined'){
            that.stateEvents = {};
        }

        if(typeof that._triggeredStateReady === 'undefined'){
            that._triggeredStateReady = false;
        }

        that.stateEvents[name] = false;

        that.listen(name, callback, context);
        that.listen(name, stateUpdate(name, that.stateEvents), that);
    };

    returnObject.tearDown = function(){
        //this needs to destroy the listeners... which is important
        var that = this;

        myEvents.forEach(function(listener){
            that.silence(listener);
            action.silence(listener)
        });
    };

    if(typeof returnObject.stateReady === 'undefined'){
        returnObject.stateReady = function(){
            //this is a default action when all required events have been completed.
            //  needs to be overridden if you want to do something real
            console.log('ready!');
        };
    }

    returnObject.listen('system:trace', function(emitterIdIn){
        var that = this;

        if(that.emitterId === emitterIdIn){
            that.emit('system:addTraced', that);
        }
    }, returnObject);

    //execute the init function if it exists
    if(typeof returnObject.init === 'function'){
        returnObject.init.apply(returnObject);
    }

    return returnObject;
};

module.exports = eventMe;
},{}],3:[function(require,module,exports){
var eventMe = require('./action.events')
    , utils = require('./action.utils')
    , ajaxMe = require('./action.ajax');

var modelMe = function (objectIn) {
    'use strict';

    //this is the module for creating a data model object
    var that = this
        , newModel = that.compose(eventMe, ajaxMe)
        , attributes = {}
        , changes = [];

    newModel.super = {};

    newModel.get = function(attributeName){
        return attributes[attributeName];
    };

    newModel.set = function(attributeName, attributeValue){
        var that = this
            , key;

        if(typeof attributeName === 'object'){
            //well... this is an object... iterate and rock on
            for(key in attributeName){
                if(attributeName.hasOwnProperty(key)){
                    //this attribute does not belong to the prototype. Good.

                    //TODO: maybe make this do a deep copy to prevent
                    //  pass by reference or switch to clone()
                    if(key !== 'tearDown' && key !== 'fetch' && key !== 'save' && typeof attributeName[key] !== 'function'){
                        if(typeof attributeValue === 'object'){
                            attributes[attributeName] = (Array.isArray(attributeName[key])) ? [] : {};
                            action.clone(attributes[attributeName], attributeName[key]);
                        }else{
                            attributes[key] = attributeName[key];
                        }
                        that.emitLocal('attribute:changed', key);
                    } else {
                        if(typeof that[key] === 'function' && !that.super[key]){
                            //wrap the super version in a closure so that we can
                            //  still execute it correctly
                            that.super[key] = that[key].bind(that);
                        }

                        that[key] = attributeName[key];
                    }
                }
            }
        } else{
            if(attributeName !== 'tearDown' && attributeName !== 'fetch' && attributeName !== 'save'){
                if(typeof attributeValue === 'object'){
                    attributes[attributeName] = (Array.isArray(attributeValue)) ? [] : {};
                    action.clone(attributes[attributeName], attributeValue);
                }else{
                    attributes[attributeName] = attributeValue;
                }

                that.emitLocal('attribute:changed', attributeName);
            } else {
                if(typeof that[attributeName] === 'function'){
                    //wrap the super version in a closure so that we can
                    //  still execute it correctly
                    that.super[attributeName] = that[attributeName].bind(that);
                }
                that[attributeName] = attributeValue;
            }
        }
    };

    newModel.flatten = function(){
        return attributes;
    };

    newModel.toJSON = function(){
        return JSON.stringify(attributes);
    };

    newModel.fetch = function(setVariableName, successFunction, errorFunction, flushCache){
        var that = this
            , requestUrl = that.url
            , useLocal = that.get('cacheLocal') && action.useLocalCache && !flushCache;

        if(typeof requestUrl !== 'undefined'){
            //make the request for the model
            if(useLocal){
                window.localforage.getItem(window.btoa(that.url), function(data){
                    if(data === null){
                        //this doesn't exist locally...
                        that.ajaxGet(setVariableName, function(dataIn){
                            var localData = dataIn
                                , articleId = that.url;

                            window.localforage.setItem(window.btoa(articleId), localData, function(){
                                // console.log('data done');
                            });
                        });
                    }else{
                        //it does exist!
                        that.emit(that.get('dataEvent'), data);
                    }
                });
            } else {
                that.ajaxGet(setVariableName, successFunction);
            }
        } else {
            that.emit('global:error', new action.Error('http', 'No URL defined', that));
            if(typeof errorFunction === 'function'){
                errorFunction.apply(that);
            }
        }
    };

    newModel.save = function(){
        //TODO make this talk to a server with the URL
        //TODO make it only mark the saved changes clear
        var that = this
            , requestUrl = that.url
            , id = that.get('id')
            , type = (typeof id === 'undefined') ? 'post' : 'put'

            , oReq = new XMLHttpRequest();

        if(typeof requestUrl !== 'undefined'){
            oReq.onload = function(){
                if(this.status === 200 || this.status === 302){
                    that.clearChanges();
                    that.set(data);
                    that.emit(that.get('dataEvent'), data);

                }else if(this.status === 500 || this.status === 400){
                    that.emit('global:error', new action.Error('http', 'Error in request', that));
                }
            };

            oReq.submittedData = that.flatten();

            oReq.open(type, requestUrl, true);
            oReq.send();
        } else {
            action.emit('global:error', new action.Error('http', 'No URL defined', that));
        }
    }

    newModel.clearChanges = function(){
        changes = [];
    }

    newModel.getChanges = function(){
        return changes;
    }

    newModel.clear = function(){
        attributes = {};
    }

    newModel.super.tearDownEvents = newModel.tearDown;

    newModel.tearDown = function(){
        var that = this
            , key;

        that.super.tearDownEvents.apply(newModel); //this is a little bit messy
        that.clear();
        Object.getOwnPropertyNames(newModel).forEach(function(key){
            newModel[key] = undefined;
        });
    }

    if(typeof objectIn.data !== 'undefined'){
        newModel.set(objectIn.data); //set the inital attributes
        delete objectIn.data;
    }

    //iterate over the passed in object and set the values on the returned object
    Object.getOwnPropertyNames(objectIn).forEach(function(key){
        if(typeof newModel[key] !== 'undefined'){
            newModel.super[key] = newModel[key];
        }

        newModel[key] = objectIn[key];
    });

    newModel.listenLocal('attribute:changed', function(nameIn){
        changes.push(nameIn);
    }, newModel);

    newModel.listen(newModel.get('requestEvent'), function(){
        this.fetch();
    }, newModel);

    if(typeof newModel.init === 'function'){
        newModel.init.apply(newModel);
    }

    return newModel;
};

module.exports = modelMe;
},{"./action.ajax":1,"./action.events":2,"./action.utils":5}],4:[function(require,module,exports){
var eventMe = require('./action.events')

    , routeMe = function(objectIn){
        var that = this
            , events = that.eventMe({})

            , init = function(){
                var that = this
                    , atags = document.querySelectorAll('a')
                    , body = document
                    , i = 0;

                body.addEventListener('click', function(e){
                   // var location = this.attributes.href.textContent;
                    var elem = e.toElement
                        , location;

                    if(elem.tagName.toLowerCase() === 'a'){
                        location = elem.attributes.href.textContent;

                        if(location.match(/http:/)){
                            return {};
                        }else{
                            //emit the state:event
                            events.emit('state:change', location);
                            e.preventDefault();
                        }
                    }
                });
            };

            init();

        return {};
    };

module.exports = routeMe
},{"./action.events":2}],5:[function(require,module,exports){
var Error =  function (typeIn, messageIn, objectIn, errorObjectIn) {
        'use strict';

        return {
            type: typeIn
            , message: messageIn
            , createdBy: objectIn
            , errorObject: errorObjectIn
        }
    }

    //a clone function
    , clone =  function (objectIn, cloneMe) {
        'use strict';

        var obj = objectIn
            , clone = cloneMe;

        if(typeof clone === 'undefined'){
            clone = objectIn;
            obj = {};
        }

        //wipe out any existing parts of the object before the clone
        Object.getOwnPropertyNames(obj).forEach(function (key) {
            if(key !== 'length'){
                obj[key] = undefined;
            }
        });

        Object.getOwnPropertyNames(clone).forEach(function (key) {
            if (typeof clone[key] === 'object'){
                //set up the object for iteration later
                obj[key] = (Array.isArray(clone[key])) ? [] : {};

                action.clone(obj[key], clone[key]);
            }else{
                obj[key] = clone[key];
            }
        });

        return obj;
    }

    , compose = function () {
        'use strict';

        var obj = {}
            , i = 0
            , currObj = {}
            , that = this;

        for(i = 0; i < arguments.length; i++){
            if(typeof arguments[i] === 'object' && !Array.isArray(arguments[i])){
                currObj = arguments[i];

                Object.getOwnPropertyNames(currObj).forEach(function(property){
                    if(typeof currObj[property] === 'object'){
                        obj[property] = that.clone(currObj[property]);
                    } else {
                        obj[property] = currObj[property];
                    }
                });
            } else if (typeof arguments[i] === 'function') {
                //this is a function apply it
                arguments[i].call(obj, obj);
            }
        }

        return obj;
    };

module.exports = {Error: Error, clone: clone, compose: compose};
},{}],6:[function(require,module,exports){
var eventMe = require('./action.events')
    , utils = require('./action.utils')

    , viewMe = function (objectIn) {
        'use strict';

        var that = this
            , _stateReady = (typeof objectIn.stateReady === 'function')
            , newView = that.modelMe(objectIn)
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
                newView.emit(childEvent, children[childEvent]);
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
},{"./action.events":2,"./action.utils":5}],7:[function(require,module,exports){
var eventMe = require('./action.events')
	, viewMe = require('./action.view')
	, modelMe = require('./action.model')
	, utils = require('./action.utils')
	, routeMe = require('./action.route');

//setup the object before we event it to prevent issues with action.eventStore not existing
window.action = {
	eventStore: {}
	, eventMe: eventMe
	, routeMe: routeMe
	, viewMe: viewMe
    , modelMe: modelMe
	, clone: utils.clone
    , compose: utils.compose
	, Error: utils.Error
    , init: function(){
        'use strict';

        this.listen('template:get', function(templateID){
            this.emit('template:set:' + templateID, this.templates[templateID]);
        });

        this.listen('global:error', function(errorIn) {
            
            console.group('An Error occured in an object with emitterid: ' + errorIn.createdBy.emitterId);
            console.log('It was a ' + errorIn.type + 'error.');

            if(typeof errorIn.errorObject === 'string'){
                console.log('It says: ' + errorIn.errorObject);
                console.log('and: ' + errorIn.message);
            } else {
                console.log('It says: ' + errorIn.message);
            }

            console.log('The Whole Enchilada (object that caused this mess):');
            console.dir(errorIn.createdBy);

            if(typeof errorIn.createdBy.flatten === 'function'){
                console.log('Just the Lettuce (attributes):');
                console.dir(errorIn.createdBy.flatten());
            }

            if(typeof errorIn.errorObject === 'object'){
                console.log('Oh look an Error Object!:');
                console.dir(errorIn.errorObject);
            }

            console.groupEnd();
            // this.trace(errorIn.createdBy.emitterId);
            // throw errorIn;
        });
    }
};

window.action = eventMe(window.action);

},{"./action.events":2,"./action.model":3,"./action.route":4,"./action.utils":5,"./action.view":6}]},{},[7])