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

#### deprecations and API changes
All deprecations will be removed completely in the next version (0.8.0) so start refactoring! And stop using them. They will throw a warning in the console if the old syntax is used. The API for all deprecations is the same except where noted (see .required above).

- `.on` replaces `.listen`
- `.once` replaces `.listenOnce`
- `.onLocal` replaces `.listenLocal`
- `.onceLocal` replaces `.listenOnceLocal`
- `.off` replaces `.silence`
- `.offLocal` replaces `.silenceLocal`
- `.requiredEvent` has been replaced by `.required`. Breaking syntax change and requiredEvent has been removed completely. See the section above outlining the changes.

#### Teardown Stack
Teardown functions now get pushed onto a stack and all of them get called. This allows for multiple teardown functions to be used.

#### Render Stack
Render functions now get pushed onto a render stack and all of them get called when .render() is called

### Non-breaking changes

- Parents now teardown their child views correctly
