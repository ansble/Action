var action = {
	init: function(){
		//TODO list
		//	1. provide scoping for passed in functions
		//	2. silence (remove function)
		//	3. add in emitterID
		//	4. once then silent listeners
		//	5. constructor function for functions
		//	6. trace function
		//	7. move the proto mods into the constructor

		var that = this;

		Function.prototype.emit = function(eventNameIn, eventDataIn){
			//add the emitterID to this thing
			var eventStack
				, functionToCall
				, i;

			if(typeof eventDataIn !== 'undefined'){
				//we have some event data
				eventData.payload = eventDataIn;
			}

			//emit the event
			if(typeof that.eventStore[eventNameIn] !== 'undefined'){
				eventStack = that.eventStore[eventNameIn];

				for(i = 0; i < eventStack.length; i ++){
					eventStack[i](eventDataIn, this.emitterId);
				}
			}
		};

		Function.prototype.listen = function(eventName, functionIn){
			//check to see if we are getting an object or a number in the data
			//	if it is just a number then we are dealing with the
			//	emitterID only.
			var i
				, newCheck = true
				, eventStack;

			if(typeof that.eventStore[eventName] !== 'undefined'){
				//already exists check to see if the function is already bound
				eventStack = that.eventStore[eventName];

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
				that.eventStore[eventName] = []; //use an array to store functions
				that.eventStore[eventName].push(functionIn);
			}
		}

		Function.prototype.silence = function(functionIn){

		}
	}

	, events: function()}{}

	, eventStore: {}
};

action.init();