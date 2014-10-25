var assert = chai.assert;

describe('The Event Module: eventMe', function(){
	
	beforeEach(function(){
		evnt = action.eventMe({});
		evnt2 = action.eventMe({});
		evnt3 = action.eventMe({});
	});

	afterEach(function(){
		action.silence('show:me');

		if(typeof evnt !== 'undefined'){
			evnt.tearDown();
			evnt = {};
		}
	});

	it('should be defined as a function', function(){
		assert.isFunction(action.eventMe);
	});

	it('should be have a numeric emitterid', function(){
		assert.isNumber(evnt.emitterId);
	});

	it('should be have a unique emitterid', function(){
		assert.notEqual(evnt.emitterId, evnt2.emitterId);
		assert.notEqual(evnt.emitterId, evnt3.emitterId);
		assert.notEqual(evnt2.emitterId, evnt3.emitterId);
	});

	it('should add events to an empty object', function(){
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
		evnt.listen('global1', function(){
			this.global1 = true;
		}, evnt);

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
		evnt.listenLocal('sam:wise', function(){
			this.sam = 'wise';
		}, evnt);

		evnt.emitLocal('sam:wise');

		assert.isDefined(evnt.sam);
		assert.strictEqual(evnt.sam, 'wise');
	});

	it('local events should ignore global events', function(){
		evnt.listenLocal('sam:wise', function(){
			this.sam = 'wise';
		}, evnt);

		action.emit('sam:wise');

		assert.isUndefined(evnt.sam);
	});

	it('global events should ignore local events', function(){
		evnt.listen('sam:wise', function(){
			this.sam = 'wise';
		}, evnt);

		evnt.emitLocal('sam:wise');

		assert.isUndefined(evnt.sam);
	});

	it('global once should ignore events after their first emit', function(){
		var evnt = action.eventMe({
			sam: 0
		});

		evnt.listenOnce('sam:wise', function(){
			this.sam++;
		}, evnt);

		evnt.emit('sam:wise');
		evnt.emit('sam:wise');
		evnt.emit('sam:wise');

		assert.strictEqual(evnt.sam, 1);
	});

	it('local once should ignore events after their first emit', function(){
		var evnt = action.eventMe({
			sam: 0
		});

		evnt.listenOnceLocal('sam:wise', function(){
			this.sam++;
		}, evnt);

		evnt.emitLocal('sam:wise');
		evnt.emitLocal('sam:wise');
		evnt.emitLocal('sam:wise');

		assert.strictEqual(evnt.sam, 1);
	});

	it('should return itself by event if it\'s emitterid is emitted with the system:trace event', function(){
		var evnt = action.eventMe({})
			, emitterid = evnt.emitterId
			, emitObj = {};

		//noop console.log()
		console.log = function(){};

		action.listen('system:addTraced', function(objIn){
			emitObj = objIn;
		});

		action.emit('system:trace', emitterid);
		assert.strictEqual(evnt, emitObj);
	});

	it('should not return itself by event if a different emitterid is emitted with the system:trace event', function(){
		var evnt = action.eventMe({})
			, notMyEmitter = 1234
			, emitObj = {};

		//noop console.log()
		console.log = function(){};

		action.listen('system:addTraced', function(objIn){
			emitObj = objIn;
		});

		action.emit('system:trace', notMyEmitter);
		assert.notStrictEqual(evnt, emitObj);
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
		var text = 0;

		console.log = function(textIn){
			text++;
		};
		
		evnt.listenLocal('show:me', function(){
			console.log('show');
		});

		evnt.listenLocal('show:me', function(){
			console.log('show it');
		});

		evnt.emitLocal('show:me');
		assert.strictEqual(text, 2);

		evnt.silenceLocal('show:me');

		evnt.emitLocal('show:me');
		assert.strictEqual(text, 2);
	});

	it('should silence only a specific function in a global event stack through silence when passed the event and function', function(){
		var text = 0;

		console.log = function(textIn){
			text++;
		};
		
		evnt.listen('show:me', function(){
			console.log('show');
		});

		evnt.listen('show:me', function(){
			console.log('show it');
		});

		evnt.emit('show:me');
		assert.strictEqual(text, 2);

		evnt.silence('show:me', function(){
			console.log('show it');
		});

		evnt.emit('show:me');
		assert.strictEqual(text, 3);
	});

	it('should silence only a specific function in a local event stack through silence when passed the event and function', function(){
		var text = 0;

		console.log = function(textIn){
			text++;
		};
		
		evnt.listenLocal('show:me', function(){
			console.log('show');
		});

		evnt.listenLocal('show:me', function(){
			console.log('show it');
		});

		evnt.emitLocal('show:me');
		assert.strictEqual(text, 2);

		evnt.silenceLocal('show:me', function(){
			console.log('show it');
		});

		evnt.emitLocal('show:me');
		assert.strictEqual(text, 3);
	});

	it('should silence only a specific function in a global event stack through silence when passed the event, function and scope', function(){
		var text = 0
			, scope = {};

		console.log = function(textIn){
			text++;
		};


		assert.strictEqual(text, 0);
		
		evnt.listen('show:me', function(){
			console.log('show');
		}, scope);

		evnt.listen('show:me', function(){
			console.log('show it');
		});

		evnt.emit('show:me');
		assert.strictEqual(text, 2);

		evnt.silence('show:me', function(){
			console.log('show it');
		}, scope);

		evnt.emit('show:me');
		assert.strictEqual(text, 3);
	});

	it('should silence only a specific function in a local event stack through silence when passed the event, function and scope', function(){
		var text = 0
			, scope = {};

		console.log = function(textIn){
			text++;
		};
		
		evnt.listenLocal('show:me', function(){
			console.log('show');
		}, scope);

		evnt.listenLocal('show:me', function(){
			console.log('show it');
		}, scope);

		evnt.emitLocal('show:me');
		assert.strictEqual(text, 2);

		evnt.silenceLocal('show:me', function(){
			console.log('show it');
		}, scope);

		evnt.emitLocal('show:me');
		assert.strictEqual(text, 3);
	});
});