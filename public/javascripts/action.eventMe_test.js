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

	it('should execute the assigned listeners when global events are triggered', function(){
		var evnt = action.eventMe({
			init: function(){
				var that = this;

				that.listen('global1', function(){
					this.global1 = true;
				}, that);
			}
		});

		evnt.listen('global2', function(){
			this.global2 = true
		}, evnt);

		action.emit('global1');
		action.emit('global2');

		assert.strictEqual(evnt.global1, true);
		assert.strictEqual(evnt.global2, true);
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

	it('should return the same object that it accepted', function(){
		var evntObj = {
			samwise: true
			, boromir: false
		};

		assert.strictEqual(evntObj, action.eventMe(evntObj));
		assert.isFunction(evntObj.listen);
		assert.isFunction(evntObj.emit);
	});

	it('should not overwrite the stateready function if passed in', function(){
		var evntObj = {
			stateReady: function(){
				return true;
			}
		};

		assert.strictEqual(evntObj.stateReady.toString(), action.eventMe(evntObj).stateReady.toString());
	});

	it('should listen to local events', function(){
		var evntObj = action.eventMe({});

		evntObj.listenLocal('sam:wise', function(){
			this.sam = 'wise';
		}, evntObj);

		evntObj.emitLocal('sam:wise');

		assert.isDefined(evntObj.sam);
		assert.strictEqual(evntObj.sam, 'wise');
	});

	it('local events should ignore global events', function(){
		var evntObj = action.eventMe({});

		evntObj.listenLocal('sam:wise', function(){
			this.sam = 'wise';
		}, evntObj);

		action.emit('sam:wise');

		assert.isUndefined(evntObj.sam);
	});

	it('global events should ignore local events', function(){
		var evntObj = action.eventMe({});

		evntObj.listen('sam:wise', function(){
			this.sam = 'wise';
		}, evntObj);

		evntObj.emitLocal('sam:wise');

		assert.isUndefined(evntObj.sam);
	});

	it('global once should ignore events after their first emit', function(){
		var evntObj = action.eventMe({
			sam: 0
		});

		evntObj.listenOnce('sam:wise', function(){
			this.sam++;
		}, evntObj);

		evntObj.emit('sam:wise');
		evntObj.emit('sam:wise');
		evntObj.emit('sam:wise');

		assert.strictEqual(evntObj.sam, 1);
	});

	it('local once should ignore events after their first emit', function(){
		var evntObj = action.eventMe({
			sam: 0
		});

		evntObj.listenOnceLocal('sam:wise', function(){
			this.sam++;
		}, evntObj);

		evntObj.emitLocal('sam:wise');
		evntObj.emitLocal('sam:wise');
		evntObj.emitLocal('sam:wise');

		assert.strictEqual(evntObj.sam, 1);
	});

	it('should return itself by event if it\'s emitterid is emitted with the system:trace event', function(){
		var evntObj = action.eventMe({})
			, emitterid = evntObj.emitterId
			, emitObj = {};

		//noop console.log()
		console.log = function(){};

		action.listen('system:addTraced', function(objIn){
			emitObj = objIn;
		});

		action.emit('system:trace', emitterid);
		assert.strictEqual(evntObj, emitObj);
	});

	it('should not return itself by event if a different emitterid is emitted with the system:trace event', function(){
		var evntObj = action.eventMe({})
			, notMyEmitter = 1234
			, emitObj = {};

		//noop console.log()
		console.log = function(){};

		action.listen('system:addTraced', function(objIn){
			emitObj = objIn;
		});

		action.emit('system:trace', notMyEmitter);
		assert.notStrictEqual(evntObj, emitObj);
	});

	it('should silence all of a global event through silence when passed the event', function(){
		var text = 0;

		console.log = function(textIn){
			text++;
		};
		
		action.listen('show:me', function(){
			console.log('show');
		});

		action.listen('show:me', function(){
			console.log('show it');
		});

		action.emit('show:me');
		assert.strictEqual(text, 2);

		action.silence('show:me');

		action.emit('show:me');
		assert.strictEqual(text, 2);
	});

	it('should silence all of a local event through silence when passed the event', function(){
		var text = 0
			, evntObj = action.eventMe({});

		console.log = function(textIn){
			text++;
		};
		
		evntObj.listenLocal('show:me', function(){
			console.log('show');
		});

		evntObj.listenLocal('show:me', function(){
			console.log('show it');
		});

		evntObj.emitLocal('show:me');
		assert.strictEqual(text, 2);

		evntObj.silenceLocal('show:me');

		evntObj.emitLocal('show:me');
		assert.strictEqual(text, 2);
	});

	it('should silence only a specific function in a global event stack through silence when passed the event and function', function(){
		var text = 0
			, evntObj = action.eventMe({});

		console.log = function(textIn){
			text++;
		};
		
		evntObj.listen('show:me', function(){
			console.log('show');
		});

		evntObj.listen('show:me', function(){
			console.log('show it');
		});

		evntObj.emit('show:me');
		assert.strictEqual(text, 2);

		evntObj.silence('show:me', function(){
			console.log('show it');
		});

		evntObj.emit('show:me');
		assert.strictEqual(text, 3);
	});

	it('should silence only a specific function in a local event stack through silence when passed the event and function', function(){
		var text = 0
			, evntObj = action.eventMe({});

		console.log = function(textIn){
			text++;
		};
		
		evntObj.listenLocal('show:me', function(){
			console.log('show');
		});

		evntObj.listenLocal('show:me', function(){
			console.log('show it');
		});

		evntObj.emitLocal('show:me');
		assert.strictEqual(text, 2);

		evntObj.silenceLocal('show:me', function(){
			console.log('show it');
		});

		evntObj.emitLocal('show:me');
		assert.strictEqual(text, 3);
	});

	it('should silence only a specific function in a global event stack through silence when passed the event, function and scope', function(){
		var text = 0
			, evntObj = action.eventMe({})
			, scope = {};

		console.log = function(textIn){
			text++;
		};
		
		evntObj.listen('show:me', function(){
			console.log('show');
		}, scope);

		evntObj.listen('show:me', function(){
			console.log('show it');
		});

		evntObj.emit('show:me');
		assert.strictEqual(text, 2);

		evntObj.silence('show:me', function(){
			console.log('show it');
		}, scope);

		evntObj.emit('show:me');
		assert.strictEqual(text, 3);
	});

	it('should silence only a specific function in a local event stack through silence when passed the event, function and scope', function(){
		var text = 0
			, evntObj = action.eventMe({});

		console.log = function(textIn){
			text++;
		};
		
		evntObj.listenLocal('show:me', function(){
			console.log('show');
		});

		evntObj.listenLocal('show:me', function(){
			console.log('show it');
		});

		evntObj.emitLocal('show:me');
		assert.strictEqual(text, 2);

		evntObj.silenceLocal('show:me', function(){
			console.log('show it');
		});

		evntObj.emitLocal('show:me');
		assert.strictEqual(text, 4);
	});
});