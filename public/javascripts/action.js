(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//TODO: use .off when .on is used to register

var required = function (eventsArrayIn, callback, scopeIn, multiple) {
		'use strict';

		var that = this
			, scope = scopeIn || {}
			, eventData = []
			, updateData = []
			, called = false
			, listen = that.once || that.one || that.on //use once if available, one, if available, and lastly on if available.
			, silence = that.off || that.removeListener
			, isOn = (listen === that.on) //are we using .on?

			, clear = function () {
				//this function silences listeners once they are not needed anymore

				eventsArrayIn.forEach(function (event) {
					silence.apply(that,[event, updateData[eventsArrayIn.indexOf(event)]]);
				});

				eventData = undefined;
			}

			, updateState = function (eventName) {
				// this function handles updating the whether or not an event has been triggered
				//	it returns a function that holds onto the eventName in closure scope
				var index = eventsArrayIn.indexOf(eventName);

				return function (data) {
					eventData[index] = data; //update the data array
					stateCheck(); //check to see if all the events have triggered
				};
			}

			, stateCheck = function () {
				//the state check function... it checks to see if all the events have triggered
				var ready = true;
				
				eventsArrayIn.forEach(function (event) {
					ready = ready && (typeof eventData[eventsArrayIn.indexOf(event)] !== 'undefined');
				});

				if(ready && !called){ //have all events triggered? and has the callback been called before?
					//yep... apply the callback
					callback.apply(scope, [eventData]);

					//if we aren't dealing with a set of events we want to trigger multiple times then
					//	mark called true so we don't call the callback mulitple times
					if(!multiple){
						called = true;
						
						if(isOn){ //if we used .on to bind then unbind the listeners we created
							clear();
						}
					}
				}
			};

		if(multiple){ //if it is supposed to trigger muliple times then we need to use .on not .once or .one
			listen = that.on;
		}

		//setup the listeners for each event
		eventsArrayIn.forEach(function (event) {
			var index = eventsArrayIn.indexOf(event);
			updateData[index] = updateState(event);
			listen.apply(that, [event, updateData[index]]);
		});

		//returns a function that clears the event listeners
		return {cancel: clear};
	};

module.exports = required;
},{}],2:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  if (!global.localStorage) return false;
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
var required = require('event-state')
    , deprecate = require('util-deprecate')
    , eventMe = function (objectIn) {
    'use strict';

    var returnObject = objectIn
        , myEvents = [];

    //set an emitter id for troubleshooting
    returnObject.emitterId = Math.ceil(Math.random() * 10000);

    //create the lcoal event Store
    returnObject.eventStore = {};

    returnObject.emit = function(eventNameIn, eventDataIn, localFlag){
        var that = this
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
                    that.off({
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
        returnObject.emit(eventNameIn, eventDataIn, true);
    };

    returnObject.on = function(eventNameIn, handlerIn, scopeIn, onceIn, localFlagIn){
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
    //Old API backward compat
    returnObject.listen = deprecate(returnObject.on, '.listen is deprecated, use .on instead');

    returnObject.onLocal = function(eventNameIn, handlerIn, scopeIn, onceIn){
        var that = this;

        //convenience function for local listens
        if(typeof eventNameIn === 'object'){
            eventNameIn.local = true;
            that.on(eventNameIn);
        } else {
            that.on({
                eventName: eventNameIn
                , handler: handlerIn
                , scope: scopeIn
                , once: onceIn
                , local: true
            });
        }
    };

    returnObject.listenLocal = deprecate(returnObject.onLocal, '.listenLocal is deprecated, use .onLocal instead');

    returnObject.once = function(eventNameIn, handlerIn, scopeIn, localFlagIn){
        //same thing as .listen() but is only triggered once
        var that = this;

        if(typeof eventNameIn === 'object'){
            eventNameIn.once = true;
            that.on(eventNameIn);
        }else{
            that.on({
                eventName: eventNameIn
                , handler: handlerIn
                , scope: scopeIn
                , once: true
                , local: localFlagIn
            });
        }
    };
    //Old API backward compat
    returnObject.listenOnce = deprecate(returnObject.once, '.listenOnce is deprecated, use .once instead');

    returnObject.onceLocal = function(eventNameIn, handlerIn, scopeIn){
        var that = this;

        //same thing as .listen() but is only triggered once
        if(typeof eventNameIn === 'object'){
            eventNameIn.local = true;
            eventNameIn.once = true;
            that.on(eventNameIn);
        }else{
            that.on({
                eventName: eventNameIn
                , handler: handlerIn
                , scope: scopeIn
                , local: true
                , once: true
            });
        }
    };
    //Old API backward compat
    returnObject.listenOnceLocal = deprecate(returnObject.onceLocal, '.listenOnceLocal is deprecated, use .onceLocal instead');

    returnObject.off = function(eventNameIn, handlerIn, onceIn, localFlagIn, scopeIn){
        //localize variables
        var that = this
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
                var isMatch = (handler.toString() === listener.call.toString());

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
    //move towards new API while supporting old API
    returnObject.silence = deprecate(returnObject.off, '.silence is deprecated, use .off instead');

    returnObject.offLocal = function(eventNameIn, handlerIn, onceIn, scopeIn){
        var that = this;

        //essentially a convenience function.
        if(typeof eventNameIn === 'object'){
            eventNameIn.local = true;
            that.off(eventNameIn);
        }else{
            that.off({
                eventName: eventNameIn
                , handler: handlerIn
                , once: onceIn
                , scope: scopeIn
                , local: true
            });
        }
    };

    returnObject.silenceLocal = deprecate(returnObject.offLocal, '.silenceLocal is deprecated, use .offLocal instead');

    //Event Based state machine
    returnObject.required = required;

    returnObject.tearDown = function(){
        //this needs to destroy the listeners... which is important
        var that = this;

        myEvents.forEach(function(listener){
            that.off(listener);
            action.off(listener);
        });
    };

    returnObject.on('system:trace', function(emitterIdIn){
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

},{"event-state":1,"util-deprecate":2}],5:[function(require,module,exports){
var eventMe = require('./action.events')
    , utils = require('./action.utils')
    , ajaxMe = require('./action.ajax');

var modelMe = function (objectIn) {
    'use strict';

    //this is the module for creating a data model object
    var newModel = utils.compose(eventMe, ajaxMe)
        , attributes = {}
        , changes = [];

    newModel.super = {};

    newModel.get = function (attributeName) {
        return attributes[attributeName];
    };

    newModel.set = function (attributeName, attributeValue) {
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
                            utils.clone(attributes[attributeName], attributeName[key]);
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
                    utils.clone(attributes[attributeName], attributeValue);
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

    newModel.flatten = function () {
        return attributes;
    };

    newModel.toJSON = function () {
        return JSON.stringify(attributes);
    };

    newModel.fetch = function (setVariableName, successFunction, errorFunction, flushCache) {
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
            that.emit('global:error', new utils.Error('http', 'No URL defined', that));
            if(typeof errorFunction === 'function'){
                errorFunction.apply(that);
            }
        }
    };

    newModel.save = function () {
        //TODO make this talk to a server with the URL
        //TODO make it only mark the saved changes clear
        var that = this
            , requestUrl = that.url
            , id = that.get('id')
            , type = (typeof id === 'undefined') ? 'post' : 'put'

            , oReq = new XMLHttpRequest();

        if(typeof requestUrl !== 'undefined'){
            oReq.onload = function () {
                if(this.status === 200 || this.status === 302){
                    that.clearChanges();
                    that.set(data);
                    that.emit(that.get('dataEvent'), data);

                }else if(this.status === 500 || this.status === 400){
                    that.emit('global:error', new utils.Error('http', 'Error in request', that));
                }
            };

            oReq.submittedData = that.flatten();

            oReq.open(type, requestUrl, true);
            oReq.send();
        } else {
            that.emit('global:error', new utils.Error('http', 'No URL defined', that));
        }
    };

    newModel.clearChanges = function () {
        changes = [];
    };

    newModel.getChanges = function () {
        return changes;
    };

    newModel.clear = function () {
        attributes = {};
    };

    newModel.super.tearDownEvents = newModel.tearDown;

    newModel.tearDown = function () {
        var that = this;

        that.super.tearDownEvents.apply(newModel); //this is a little bit messy
        that.clear();
        Object.getOwnPropertyNames(newModel).forEach(function (key) {
            newModel[key] = undefined;
        });
    };

    if(typeof objectIn.data !== 'undefined'){
        newModel.set(objectIn.data); //set the inital attributes
        delete objectIn.data;
    }

    //iterate over the passed in object and set the values on the returned object
    Object.getOwnPropertyNames(objectIn).forEach(function (key) {
        if(typeof newModel[key] !== 'undefined'){
            newModel.super[key] = newModel[key];
        }

        newModel[key] = objectIn[key];
    });

    newModel.onLocal('attribute:changed', function (nameIn) {
        changes.push(nameIn);
    }, newModel);

    newModel.on(newModel.get('requestEvent'), function () {
        this.fetch();
    }, newModel);

    if(typeof newModel.init === 'function'){
        newModel.init.apply(newModel);
    }

    return newModel;
};

module.exports = modelMe;
},{"./action.ajax":3,"./action.events":4,"./action.utils":7}],6:[function(require,module,exports){
var eventMe = require('./action.events')

    , routeMe = function () {
        'use strict';

        var events = eventMe({});

        (function(){
            var that = this
                , atags = document.querySelectorAll('a')
                , body = document
                , i = 0;

            body.addEventListener('click', function (e) {
               // var location = this.attributes.href.textContent;
                var elem = e.target
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
        })();

        return {};
    };

module.exports = routeMe;
},{"./action.events":4}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
            newView.on('destroy:' + newView.viewId, function(){
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

        newView.on('state:change', function(stateId){
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

},{"./action.model":5,"./action.utils":7}],9:[function(require,module,exports){
var eventMe = require('./action.events')
	, viewMe = require('./action.view')
	, modelMe = require('./action.model')
	, utils = require('./action.utils')
	, routeMe = require('./action.route')
    , ajaxMe = require('./action.ajax');

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
    , ajaxMe: ajaxMe
    , init: function(){
        'use strict';

        var that = this;

        that.listen('template:get', function(templateID){
            that.emit('template:set:' + templateID, that.templates[templateID]);
        }, that);

        that.listen('global:error', function(errorIn) {
            
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
        }, that);
    }
};

window.action = eventMe(window.action);

},{"./action.ajax":3,"./action.events":4,"./action.model":5,"./action.route":6,"./action.utils":7,"./action.view":8}]},{},[9])