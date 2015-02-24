var required = require('event-state')
    , eventMe = function (objectIn) {
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
    returnObject.listen = returnObject.on;

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

    returnObject.once = function(eventNameIn, handlerIn, scopeIn, localFlagIn){
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
    //Old API backward compat
    returnObject.listenOnce = returnObject.once;

    returnObject.onceLocal = function(eventNameIn, handlerIn, scopeIn){
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
    //Old API backward compat
    returnObject.listenOnceLocal = returnObject.onceLocal;

    returnObject.off = function(eventNameIn, handlerIn, onceIn, localFlagIn, scopeIn){
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
    //move towards new API while supporting old API
    returnObject.silence = returnObject.off;

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
    returnObject.required = required;

    returnObject.tearDown = function(){
        //this needs to destroy the listeners... which is important
        var that = this;

        myEvents.forEach(function(listener){
            that.silence(listener);
            action.silence(listener)
        });
    };

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
