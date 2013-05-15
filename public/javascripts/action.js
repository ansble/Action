var action = function(){
	var action = {
		eventMe: function(objectIn){
			var returnObject = objectIn
				, localEvents = {};

			returnObject.emitterId = Math.ceil(Math.random() * 10000);

			returnObject.emit = function(eventNameIn, eventDataIn){
				//add the emitterID to this thing
				var eventStack
					, functionToCall
					, i;

				if(typeof eventDataIn !== 'undefined'){
					//we have some event data
					eventData.payload = eventDataIn;
				}

				//emit the event
				if(typeof action.eventStore[eventNameIn] !== 'undefined'){
					eventStack = action.eventStore[eventNameIn];

					for(i = 0; i < eventStack.length; i ++){
						if(typeof eventStack[i].scope !== 'undefined'){
							eventStack[i].call.apply(eventStack[i].scope,[eventDataIn, this.emitterId]);
						}else{
							eventStack[i].call(eventDataIn, this.emitterId);
						}

						
						if(eventStack[i].once){
							this.silence(eventNameIn, eventStack[i].call, true);
						}
					}
				}
			};

			returnObject.emitLocal = function(eventNameIn, eventDataIn){
				//add the emitterID to this thing
				var eventStack
					, functionToCall
					, i;

				if(typeof eventDataIn !== 'undefined'){
					//we have some event data
					eventData.payload = eventDataIn;
				}

				//emit the event
				if(typeof this.eventStore[eventNameIn] !== 'undefined'){
					eventStack = this.eventStore[eventNameIn];

					for(i = 0; i < eventStack.length; i ++){
						if(typeof eventStack[i].scope !== 'undefined'){
							eventStack[i].call.apply(eventStack[i].scope,[eventDataIn, this.emitterId]);
						}else{
							eventStack[i].call(eventDataIn, this.emitterId);
						}

						
						if(eventStack[i].once){
							this.silence(eventNameIn, eventStack[i].call, true);
						}
					}
				}
			};

			returnObject.listen = function(eventNameIn, functionIn, scopeIn, localFlagIn){
				//check to see if we are getting an object or a number in the data
				//	if it is just a number then we are dealing with the
				//	emitterID only.
				var i
					, newCheck = true
					, eventStack = action.eventStore[eventNameIn]
					, newEvent = action;

				if(typeof eventStack !== 'undefined'){
					//already exists check to see if the function is already bound

					for(i = 0; i < eventStack.length; i ++){
						if(eventStack[i].call === functionIn && eventStack[i].once === false){
							newCheck = false;
							break;
						}
					}

					if(newCheck){
						if(typeof scopeIn !== 'undefined'){
							eventStack.push({once: false, call: functionIn, scope: scopeIn});
						}else{
							eventStack.push({once: false, call:functionIn});
						}
					}

				} else{
					//new event
					newEvent.eventStore[eventNameIn] = []; //use an array to store functions
					if(typeof scopeIn !== 'undefined'){
						newEvent.eventStore[eventNameIn].push({once: false, call: functionIn, scope: scopeIn});
					}else{
						newEvent.eventStore[eventNameIn].push({once: false, call: functionIn});
					}
				}
			}

			returnObject.listenLocal = function(eventNameIn, functionIn, scopeIn){
				//check to see if we are getting an object or a number in the data
				//	if it is just a number then we are dealing with the
				//	emitterID only.
				var i
					, newCheck = true
					, eventStack;

				if(typeof this.eventStore[eventNameIn] !== 'undefined'){
					//already exists check to see if the function is already bound
					eventStack = this.eventStore[eventNameIn];

					for(i = 0; i < eventStack.length; i ++){
						if(eventStack[i].call === functionIn && eventStack[i].once === false){
							newCheck = false;
							break;
						}
					}

					if(newCheck){
						if(typeof scopeIn !== 'undefined'){
							eventStack.push({once: false, call: functionIn, scope: scopeIn});
						}else{
							eventStack.push({once: false, call:functionIn});
						}
					}

				} else{
					//new event
					this.eventStore[eventNameIn] = []; //use an array to store functions
					if(typeof scopeIn !== 'undefined'){
						this.eventStore[eventNameIn].push({once: false, call: functionIn, scope: scopeIn});
					}else{
						this.eventStore[eventNameIn].push({once: false, call: functionIn});
					}
				}
			}

			returnObject.listenOnce = function(eventNameIn, functionIn, scopeIn){
				//same thing as .listen() but is only triggered once
				var i
					, newCheck = true
					, eventStack;

				if(typeof action.eventStore[eventNameIn] !== 'undefined'){
					//already exists check to see if the function is already bound
					eventStack = action.eventStore[eventNameIn];

					for(i = 0; i < eventStack.length; i ++){
						if(eventStack[i].call === functionIn && eventStack[i].once === true){
							newCheck = false;
							break;
						}
					}

					console.log(newCheck);

					if(newCheck){
						eventStack.push({once:true, call: functionIn, scope: scopeIn});
					}

				} else{
					//new event
					action.eventStore[eventNameIn] = []; //use an array to store functions
					action.eventStore[eventNameIn].push({once:true, call: functionIn, scope: scopeIn});
				}
			}

			returnObject.listenOnceLocal = function(eventNameIn, functionIn, scopeIn){
				//same thing as .listen() but is only triggered once
				var i
					, newCheck = true
					, eventStack;

				if(typeof this.eventStore[eventNameIn] !== 'undefined'){
					//already exists check to see if the function is already bound
					eventStack = this.eventStore[eventNameIn];

					for(i = 0; i < eventStack.length; i ++){
						if(eventStack[i].call === functionIn && eventStack[i].once === true){
							newCheck = false;
							break;
						}
					}

					console.log(newCheck);

					if(newCheck){
						eventStack.push({once:true, call: functionIn, scope: scopeIn});
					}

				} else{
					//new event
					this.eventStore[eventNameIn] = []; //use an array to store functions
					this.eventStore[eventNameIn].push({once:true, call: functionIn, scope: scopeIn});
				}
			}

			returnObject.silence = function(eventNameIn, handlerIn, onceIn, scopeIn, localFlagIn){
				//localize variables
				var i
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
				store = (typeof localFlag === 'undefined' || !localFlag) ? action : this;

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
			}

			returnObject.silenceLocal = function(eventNameIn, handlerIn, onceIn, scopeIn){
				//essentially a convenience function.
				if(typeof eventNameIn === 'object'){
					this.silence(eventNameIn);
				}else{					
					this.silence({
						eventName: eventNameIn
						, handler: handlerIn
						, once: onceIn
						, scope: scopeIn
						, local: true
					});
				}
			}

			returnObject.eventStore = {};

			return returnObject;
		}

		, eventStore: {}

		, trace: function(emitterIdIn){
			//log out the function that has the emitterId attached

		}
	};

	//add an events hook for global dealing with events...
	action.events = action.eventMe({});

	//return the tweaked function
	return action;
}(this);