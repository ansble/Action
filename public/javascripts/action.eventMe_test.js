var assert = chai.assert;

describe('The Event Module: eventMe', function(){
	it('should be defined as a function', function(){
		assert.isFunction(action.eventMe);
	});

	it('should be have a numeric emitterid', function(){
		var evnt = action.eventMe({});
		assert.isNumber(evnt.emitterId);
	});

	it('should be have a unique emitterid', function(){
		var evnt = action.eventMe({})
			, evnt2 = action.eventMe({})
			, evnt3 = action.eventMe({});

		assert.notEqual(evnt.emitterId, evnt2.emitterId);
		assert.notEqual(evnt.emitterId, evnt3.emitterId);
		assert.notEqual(evnt2.emitterId, evnt3.emitterId);
	});

	it('should add events to an empty object', function(){
		var evnt = action.eventMe({});

		assert.isFunction(evnt.listen);
		assert.isFunction(evnt.emit);
		assert.isFunction(evnt.listenLocal);
		assert.isFunction(evnt.emitLocal);
		assert.isFunction(evnt.listenOnce);
		assert.isFunction(evnt.listenOnceLocal);
		assert.isFunction(evnt.silence);
		assert.isFunction(evnt.silenceLocal);
		assert.isFunction(evnt.requiredEvent);
		assert.isFunction(evnt.stateReady);
		assert.isFunction(evnt.stateUpdate);
		assert.isObject(evnt.eventStore);
	});

	it('should execute the init function before returning the object', function(){
		var evnt = action.eventMe({
			init: function(){
				this.executed = true;
			}
		});

		assert.strictEqual(evnt.executed, true);
	});

	it('should fire stateReady() when all required events are heard', function(){
		var evnt = action.eventMe({
			init: function(){
				var that = this;

				that.requiredEvent('event1', function(){
					that.event1 = true;
				});

				that.requiredEvent('event2', function(){
					that.event2 = true;
				});
			}
			, stateReady: function(){
				this.something = 'Ready!';
			}
		});

		assert.isUndefined(evnt.event1);
		assert.isUndefined(evnt.event2);
		assert.isUndefined(evnt.ready);

		action.emit('event1');

		assert.strictEqual(evnt.event1, true);
		assert.isUndefined(evnt.event2);
		assert.isUndefined(evnt.ready);

		action.emit('event2');

		assert.strictEqual(evnt.event1, true);
		assert.strictEqual(evnt.event2, true);
		assert.strictEqual(evnt._triggeredStateReady, true);
		assert.strictEqual(evnt.something, 'Ready!');
	});
});