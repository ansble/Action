//TODO list
//	1. provide scoping for passed in functions
//	4. once then silent listeners
//	5. constructor function for functions
//	6. trace function
//	7. move the proto mods into the constructor
//	8. Private events module (local to the object)

var action = function(){
	var action = {
		newFunction: function(functionIn){
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
						eventStack[i](eventDataIn, this.emitterId);
					}
				}
			};

			returnFunction.listen = function(eventName, functionIn){
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
						if(eventStack[i] === functionIn){
							newCheck = false;
							break;
						}
					}

					console.log(newCheck);

					if(newCheck){
						eventStack.push(functionIn);
					}

				} else{
					//new event
					action.eventStore[eventName] = []; //use an array to store functions
					action.eventStore[eventName].push(functionIn);
				}
			}

			returnFunction.silence = function(eventName, functionIn){
				var i;

				for(i = 0; i < action.eventStore[eventName]; i ++){
					if(functionIn === action.eventStore[eventName][i]){
						action.eventStore[eventName].splice(i,1)
					}
				}
			}

			return returnFunction;
		}

		, eventStore: {}
	};

	action.events = action.newFunction(function(){})

	return action;
}(this);