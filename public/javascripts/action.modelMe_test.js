var assert = chai.assert;

describe('The Model Module: modelMe', function(){
	
	beforeEach(function(){
		data = {
			daniel: 'creator'
			, parts: [
				'string'
				, 'events'
				, 'models'
			]
		};

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

	it('should have a private data store', function(){
		assert.isUndefined(model.data);
	});

	it('should add passed in data to it\'s data store', function(){
		//see beforeEach above
		assert.strictEqual(model.get('daniel'), 'creator');
	});

	it('set should add data to it\'s data store', function(){
		model.set('katie', 'Ramona');

		assert.strictEqual(model.get('katie'), 'Ramona');
	});

	it('get should get data from it\'s data store which is private', function(){
		assert.strictEqual(model.get('daniel'), 'creator');
	});

	it('flatten should return the private data store', function(){
		assert.strictEqual(JSON.stringify(data), JSON.stringify(model.flatten()));
	});

	it('should return a JSON string of the private data store', function(){
		assert.strictEqual(JSON.stringify(data), model.toJSON());
	});

	it('should move base functions to `super` if you overwrite them', function(){
		var model = action.modelMe({
			fetch: function(){
				this.fetched = true;
			}
		});

		assert.isFunction(model.fetch);
		assert.isFunction(model.super.fetch);
		assert.notEqual(model.super.fetch, model.fetch);
	});
});