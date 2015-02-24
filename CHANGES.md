## v 0.7.0

### Breaking Changes

#### .required & .requiredEvent
The api for `.required` has changed. It no longer triggers stateReady(). It now accepts a function that is executed when the events passed into it as an array are completed.

The new syntax is:
	action.required(['event-1', 'event-2'], function (eventDataArray) {
		//eventDataArray contains
		// [
		//		event-1 data,
		//		event-2 data
		// ]
	});

That means that where you passed handlers for each event to the individual `action.requiredEvent` calls in the past you now need to handle them as seperate `.on`, `.once`, `.listen` or `.listenOnce` calls. This makes the syntax roughly the equivilant of `Promise.all`. 

We are also deprecating and removing `.requiredEvent` for the more clear `.required`. Tangentially this means that the `stateReady` function is no longer present or needed. Hopefully this makes for a better api in the future, sorry for the breaking change for your old code.

example of change: http://recordit.co/YZQLHxYPli

`.required` now retusn a function that can be used to cancel the state for which it will trigger. So if you decide based on another state that maybe you don't want it to trigger if it hasn't already, then simply execute the function it returns and it will dissapear.

These new features are because of the replacement of the builtin .require with [event-state](https://github.com/ansble/event-state)