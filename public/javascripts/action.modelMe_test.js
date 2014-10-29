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
            , url: '/foo/bar'
		});
	});

	afterEach(function(){
		if(typeof model !== 'undefined' && typeof model.tearDown !== 'undefined'){
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
		assert.isFunction(model.tearDown);
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
		// assert.notEqual(model.super.fetch, model.fetch);
	});

    it('should be destroyed by .tearDown()', function(){
        var console = {
            log: function(param){
                console.result = param;
            }
        };

        model.listen('test', function(){
            console.log('test failed');
        });

        model.tearDown();
        action.emit('test');

        assert.isUndefined(console.result);
        assert.strictEqual(model.toString(), {}.toString());
        assert.isUndefined(model.url);

        assert.isUndefined(model.get);
        assert.isUndefined(model.set);
        assert.isUndefined(model.flatten);
        assert.isUndefined(model.fetch);
        assert.isUndefined(model.ajaxGet);
        assert.isUndefined(model.save);
        assert.isUndefined(model.clearChanges);
        assert.isUndefined(model.getChanges);
        assert.isUndefined(model.clear);
        assert.isUndefined(model.tearDown);
        assert.isUndefined(model.super);

        //event side of things
        assert.isUndefined(model.listen);
        assert.isUndefined(model.emit);
        assert.isUndefined(model.listenLocal);
        assert.isUndefined(model.emitLocal);
        assert.isUndefined(model.listenOnce);
        assert.isUndefined(model.listenOnceLocal);
        assert.isUndefined(model.silence);
        assert.isUndefined(model.silenceLocal);
        assert.isUndefined(model.requiredEvent);
        assert.isUndefined(model.stateReady);
        assert.isUndefined(model.eventStore);
    });

    it('should keep track of changes to it\'s internal state', function(){
        model.set('sam', true);

        assert.isArray(model.getChanges());
        assert.strictEqual(model.getChanges()[0], 'sam');
    });

    it('should keep empty of changes to it\'s internal state with clearChanges()', function(){
        model.set('sam', true);

        assert.isArray(model.getChanges());
        assert.strictEqual(model.getChanges()[0], 'sam');

        model.clearChanges();

        assert.strictEqual(model.getChanges().length, 0);
    });

    it('should wipe attributes with clear()', function(){
        model.set('sam', true);

        assert.strictEqual(model.get('sam'), true);
        model.clear();
        assert.isUndefined(model.get('sam'));
    });

    it('should save itself to the url provided with .save()', function(){
        //TODO: make this real
        // assert.strictEqual(true, false);
    });

    it('should get itself from the url provided with fetch()', function(){
        //TODO: make this real
        // assert.strictEqual(true, false);
    });

    it('should get data from the server with ajaxGet', function(){
        //TODO: make this real
        // assert.strictEqual(true, false);
    });
});
