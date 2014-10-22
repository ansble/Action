(function(__exports__) {
  "use strict";
   var eventMe = function(objectIn){
      'use strict';

      var returnObject = objectIn
          , localEvents = {};

      //set an emitter id for troubleshooting
      returnObject.emitterId = Math.ceil(Math.random() * 10000);

      //create the lcoal event Store
      returnObject.eventStore = {};

      returnObject.emit = function(eventNameIn, eventDataIn, localFlag){
          var that = this
              , eventStack
              , functionToCall
              , i
              , isLocal = (typeof localFlag !== 'undefined' && localFlag);

          if(isLocal){
              eventStack = that.eventStore[eventNameIn];
          } else {
              eventStack = action.eventStore[eventNameIn];
          }

          //emit the event
          if(typeof eventStack !== 'undefined'){
              for(i = 0; i < eventStack.length; i ++){
                  if(typeof eventStack[i].scope !== 'undefined'){
                      eventStack[i].call.apply(eventStack[i].scope,[eventDataIn, that.emitterId]);
                  }else{
                      eventStack[i].call(eventDataIn, that.emitterId);
                  }

                  if(eventStack[i].once){
                      that.silence(eventNameIn, eventStack[i].call, true, isLocal);
                  }
              }
          }
      };

      returnObject.emitLocal = function(eventNameIn, eventDataIn){
          var that = this;

          that.emit(eventNameIn, eventDataIn, true);
      };

      returnObject.listen = function(eventNameIn, handlerIn, scopeIn, onceIn, localFlagIn){
          var that = this
              , i
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
              once = eventNameIn.once;
              local = eventNameIn.local;
          }

          eventStack = (typeof local !== 'undefined' && local) ? that.eventStore[eventNameIn] : action.eventStore[eventNameIn];
          newEvent = (typeof local !== 'undefined' && local) ? that : action;

          if(typeof eventStack !== 'undefined'){
              //already exists check to see if the function is already bound

              for(i = 0; i < eventStack.length; i ++){
                  if(eventStack[i].call === handler && eventStack[i].once === false){
                      newCheck = false;
                      break;
                  }
              }

              if(newCheck && typeof scopeIn !== 'undefined'){
                      eventStack.push({once: false, call: handler, scope: scope});
              }else if(newCheck){
                      eventStack.push({once: false, call:handler});
              }

          } else {
              //new event
              newEvent.eventStore[eventName] = []; //use an array to store functions
              if(typeof scopeIn !== 'undefined'){
                  newEvent.eventStore[eventName].push({once: false, call: handler, scope: scope});
              }else{
                  newEvent.eventStore[eventName].push({once: false, call: handler});
              }
          }
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
          var that = this
              , i
              , newCheck = true
              , eventStack
              , newEvent

              , eventName = eventNameIn
              , handler = handlerIn
              , scope = scopeIn
              , localFlag = localFlagIn;

          if(typeof eventNameIn === 'object'){
              eventName = eventNameIn.eventName;
              handler = eventNameIn.handler;
              scope = eventNameIn.scope;
              localFlag = eventNameIn.local;
          }

          if(typeof localFlag !== 'undefined' && localFlag){
              //make it local!
              eventStack = that.eventStore[eventName];
              newEvent = that;
          }else{
              eventStack = action.eventStore[eventName];
              newEvent = action;
          }

          if(typeof eventStack !== 'undefined'){
              //already exists check to see if the function is already bound

              for(i = 0; i < eventStack.length; i ++){
                  if(eventStack[i].call === handler && eventStack[i].once === true){
                      newCheck = false;
                      break;
                  }
              }

              if(newCheck){
                  eventStack.push({once:true, call: handler, scope: scope});
              }

          } else{
              //new event
              newEvent.eventStore[eventNameIn] = []; //use an array to store functions
              newEvent.eventStore[eventNameIn].push({once:true, call: handler, scope: scope});
          }
      };

      returnObject.listenOnceLocal = function(eventNameIn, handlerIn, scopeIn){
          var that = this;

          //same thing as .listen() but is only triggered once
          if(typeof eventNameIn === 'object'){
              eventNameIn.local = true;
              that.listenLocal(eventNameIn);
          }else{
              that.listenLocal({
                  eventName: eventNameIn
                  , handler: handlerIn
                  , scope: scopeIn
                  , local: true
              });
          }
      };

      returnObject.silence = function(eventNameIn, handlerIn, onceIn, scopeIn, localFlagIn){
          //localize variables
          var that = this
              , i
              , truthy = false
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
              //if there is no event with a name... return nothing
              return;
          }

          //there is an event that matches... proceed
          for(i = 0; i < store.eventStore[eventName].length; i ++){
              //reset this variable
              truthy = false;

              if(typeof handler !== 'undefined'){
                  //function is passed in
                  if(typeof scope !== 'undefined'){
                      //scope is passed in...
                      if(typeof once === 'boolean'){
                          // function + scope + once provides the match
                          truthy = (handler === store.eventStore[eventName][i].call && scope === store.eventStore[eventName][i].scope && once === store.eventStore[eventName][i].once);
                      } else {
                          //function + scope provides the match
                          truthy = (handler === store.eventStore[eventName][i].call && scope === store.eventStore[eventName][i].scope);
                      }
                  } else {
                      //function + once in for the match
                      if(typeof once === 'boolean'){
                          truthy = (handler === store.eventStore[eventName][i].call && store.eventStore[eventName][i].once === once);
                      } else {
                          truthy = (handler === store.eventStore[eventName][i].call);
                      }
                  }
              } else {
                  //no function unbind everything by resetting
                  store.eventStore[eventName] = [];

                  //and exit
                  break;
              }

              if(truthy){
                  //remove this bad boy
                  store.eventStore[eventName].splice(i,1);
              }

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
              , stateUpdate;

          that._fireMultiple = (typeof fireMultipleIn !== 'undefined') ? fireMultipleIn : false;

          //init some hidden storage if needed
          if(typeof that.stateEvents === 'undefined'){
              that.stateEvents = {};
          }

          if(typeof that._triggeredStateReady === 'undefined'){
              that._triggeredStateReady = false;
          }

          that.stateEvents[name] = false;

          stateUpdate = that.stateUpdate(name, that.stateEvents);

          that.listen(name, callback, context);
          that.listen(name, stateUpdate, that);
      };

      returnObject.stateUpdate = function(nameIn, stateEventsIn){
          var name = nameIn
              , stateEvents = stateEventsIn
              , that = this;

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

      returnObject.stateReady = function(){
          //this is a default action when all required events have been completed.
          //  needs to be overridden if you want to do something real
          console.log('ready!');
      };

      returnObject.listen('system:trace', function(emitterIDIn){
          var that = this;

          if(that.emitterId === emitterIDIn){
              // that.emit('system:addTraced', that);
              action.traced = that;
          }
      }, returnObject);

      //execute the init function if it exists
      if(typeof returnObject.init === 'function'){
          returnObject.init.apply(returnObject);
      }

      return returnObject;
  };

  __exports__.eventMe = eventMe;
})(window);