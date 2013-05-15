//TODO list
//	6. trace function
//	8. Private events module (local to the object)

var action = function(){
	var action = {
		eventMe: function(functionIn){
			var returnFunction = functionIn
				, localEvents = {};

			returnFunction.emitterId = Math.ceil(Math.random() * 10000);

			returnFunction.emit = function(eventNameIn, eventDataIn){
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

			returnFunction.listen = function(eventName, functionIn, scope){
				//check to see if we are getting an object or a number in the data
				//	if it is just a number then we are dealing with the
				//	emitterID only.
				var i
					, newCheck = true
					, eventStack;

				if(typeof action.eventStore[eventName] !== 'undefined'){
					//already exists check to see if the function is already bound
					eventStack = action.eventStore[eventName];

					for(i = 0; i < eventStack.length; i ++){
						if(eventStack[i].call === functionIn && eventStack[i].once === false){
							newCheck = false;
							break;
						}
					}

					console.log(newCheck);

					if(newCheck){
						if(typeof scope !== 'undefined'){
							eventStack.push({once: false, call: functionIn, scope: scope});
						}else{
							eventStack.push({once: false, call:functionIn});
						}
					}

				} else{
					//new event
					action.eventStore[eventName] = []; //use an array to store functions
					if(typeof scope !== 'undefined'){
						action.eventStore[eventName].push({once: false, call: functionIn, scope: scope});
					}else{
						action.eventStore[eventName].push({once: false, call: functionIn});
					}
				}
			}

			returnFunction.listenOnce = function(eventName, functionIn, scope){
				//same thing as .listen() but is only triggered once
				var i
					, newCheck = true
					, eventStack;

				if(typeof action.eventStore[eventName] !== 'undefined'){
					//already exists check to see if the function is already bound
					eventStack = action.eventStore[eventName];

					for(i = 0; i < eventStack.length; i ++){
						if(eventStack[i].call === functionIn && eventStack[i].once === true){
							newCheck = false;
							break;
						}
					}

					console.log(newCheck);

					if(newCheck){
						eventStack.push({once:true, call: functionIn});
					}

				} else{
					//new event
					action.eventStore[eventName] = []; //use an array to store functions
					action.eventStore[eventName].push({once:true, call: functionIn});
				}
			}

			returnFunction.silence = function(eventName, functionIn, once){
				var i;

				for(i = 0; i < action.eventStore[eventName].length; i ++){
					if(typeof once === 'boolean'){
						if(functionIn === action.eventStore[eventName][i].call && action.eventStore[eventName][i].once === once){
							action.eventStore[eventName].splice(i,1)
						}
					} else {
						if(functionIn === action.eventStore[eventName][i].call){
							action.eventStore[eventName].splice(i,1)
						}
					}
				}
			}

			return returnFunction;
		}

		, eventStore: {}

		, trace: function(emitterId){
			//log out the function that has the emitterId attached

		}
	};

	//add an events hook for global dealing with events...
	action.events = action.eventMe({});

	//return the tweaked function
	return action;
}(this);