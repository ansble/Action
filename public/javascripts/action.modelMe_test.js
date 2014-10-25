var assert = chai.assert;

describe('The Model Module: modelMe', function(){
	
	beforeEach(function(){
		model = action.modelMe({
			data: {
				daniel: 'creator'
				, parts: [
					'string'
					, 'events'
					, 'models'
				]
			}
		});
	});

	afterEach(function(){
		if(typeof evnt !== 'undefined'){
			model.tearDown();
			model = {};
		}
	});

	it('should be defined as a function', function(){
		assert.isFunction(action.modelMe);
	});

	it('should create a correctly formed model with events and model parts', function(){
		//model bits
		assert.isFunction(model.get);
		assert.isFunction(model.set);
		assert.isFunction(model.flatten);
		assert.isFunction(model.fetch);
		assert.isFunction(model.ajaxGet);
		assert.isFunction(model.save);
		assert.isFunction(model.clearChanges);
		assert.isFunction(model.getChanges);
		assert.isFunction(model.clear);
		assert.isFunction(model.destroy);
		assert.isObject(model.super);

		//event side of things
		assert.isFunction(model.listen);
		assert.isFunction(model.emit);
		assert.isFunction(model.listenLocal);
		assert.isFunction(model.emitLocal);
		assert.isFunction(model.listenOnce);
		assert.isFunction(model.listenOnceLocal);
		assert.isFunction(model.silence);
		assert.isFunction(model.silenceLocal);
		assert.isFunction(model.requiredEvent);
		assert.isFunction(model.stateReady);
		assert.isObject(model.eventStore);
	});

	it('should add data to it\'s data store which is private and only accessible through .get()', function(){
		assert.strictEqual(model.get('daniel'), 'creator');
		assert.isUndefined(model.data);
	});
});