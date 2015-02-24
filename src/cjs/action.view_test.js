var assert = chai.assert;

describe('The View Module: viewMe', function(){
	'use strict';

	var view, view2;

	beforeEach(function(){
		console = {
			log: function(stuff){
				console.thrown = stuff;
			}
			, group: function(){}
			, dir: function(){}
			, groupEnd: function(){}
		};

		view = action.viewMe({
			renderCnt: 0
			, templateId: 'tom'
			, dataId: 'bicycle'
			, viewId: 'katie'
            , stateEvents: 'route:daniel'
            , element: {}

			, render: function(){
				this.element = document.createElement('p');

				this.element.classList.add('view__child');
                this.element.classList.add('view__first');

				document.body.appendChild(this.element);

				this.renderCnt++;
			}
		});

        view2 = action.viewMe({
            renderCnt: 0
            , templateId: 'tom'
            , dataId: 'bicycle'
            , viewId: 'katie'
            , stateEvents: ['route:daniel', 'route:katie']

            , render: function(){
                this.element = document.createElement('p');

                this.element.classList.add('view__child');
                this.element.classList.add('view__second');

                document.body.appendChild(this.element);

                this.renderCnt++;
            }
        });

        action.templates = {'tom': function(){ return '<p>tom</p>';}};
	});

	it('should be defined', function(){
		assert.isDefined(action.viewMe);
		assert.isFunction(action.viewMe);
	});

	it('should throw an error if no render function is passed in', function(){
		action.viewMe({
			templateId: 'roger'
			, viewId: 'katie'
			, dataId: 'sam'
		});

		assert.isDefined(console.thrown);
	});

	it('should throw an error if no dataId is passed in', function(){
		action.viewMe({
			render: function(){}
			, viewId: 'katie'
			, templateId: 'roger'
		});

		assert.isDefined(console.thrown);
	});

	it('should throw an error if no templateId is passed in', function(){
		action.viewMe({
			render: function(){}
			, dataId: 'sam'
			, viewId: 'katie'
		});

		assert.isDefined(console.thrown);
	});

	it('should throw an error if no viewId is passed in', function(){
		action.viewMe({
			render: function(){}
			, dataId: 'sam'
			, templateId: 'roger'
		});

		assert.isDefined(console.thrown);
	});

    it('should throw an error if no stateEvent is passed in', function(){
        action.viewMe({
            render: function(){}
            , dataId: 'sam'
            , templateId: 'roger'
        });

        assert.isDefined(console.thrown);
    });

	it('should allow either a string or an array of strings as values for stateEvent', function(){
        assert.isArray(view.stateEvents);
        assert.isArray(view2.stateEvents);
    });

	it('should trigger the gets for template and data when a state event it cares about is fired', function(){
        var testCnt = 0;

        action.listen('data:get:bicycle', function(){
            testCnt++;
        });

        action.listen('template:get', function(id){
            if (id === 'tom') {
                testCnt++;
            }
        });

        action.emit('state:change', 'route:daniel');

        assert.strictEqual(testCnt > 4, true);
    });

	it('should trigger render when all required events are complete', function(){

		action.emit('data:set:bicycle', {bike: true});
		action.emit('template:set:tom', function(){});

		assert.strictEqual(view.renderCnt, 1);
	});

	it('should trigger render when all required events are complete and required data retriggers', function(){

		action.emit('data:set:bicycle', {bike: true});
		action.emit('template:set:tom', function(){});
		action.emit('data:set:bicycle', {bike: true});
		action.emit('data:set:bicycle', {bike: true});

		assert.strictEqual(view.renderCnt, 3);
	});

	it('should emit a rendered event when it has rendered', function(){
		var emitTest = false;

		action.listen('rendered:katie', function(){
			emitTest = true;
		});

		action.emit('data:set:bicycle', {bike: true});
		action.emit('template:set:tom', function(){});

		assert.strictEqual(emitTest, true);
		assert.strictEqual(view.renderCnt, 1);
	});

	it('should emit a data:changed event when save() is called if there is a value that has changed', function () {
		var emitTest = false;

		action.listen('data:changed:bicycle', function(){
			emitTest = true;
		});

		view.set('caleb', 'awesome');

		view.save();

		assert.strictEqual(emitTest, true);
	});

	it('should not emit a data:changed event when save() is called if nothing has changed', function () {
		var emitTest = false;

		action.listen('data:changed:bicycle', function(){
			emitTest = true;
		});

		view.save();

		assert.strictEqual(emitTest, false);
	});

	it('should hide itself when a different route triggers', function(done){
		//trigger the data event since there is no real model
		action.emit('data:set:bicycle', {bike: true});
        
        action.emit('state:change', 'route:daniel');
        action.emit('state:change', 'route:katie');
        
        setTimeout(function(){
        	assert.strictEqual(view.element.style.display, 'none');
        	done();
        }, 50);
    });

	describe('Parent Views', function(){
		it('should have a function for registering child views', function(){
			assert.isFunction(view.registerChild);
		});

		it('should have a function for listing child views', function(){
			assert.isFunction(view.listChildren);
		});

		it('should emit an event for each registered child after rendering that contains a dom node', function(){
			var emitTest = false
				, dom;

			action.listen('target:set:travis', function(domElem){
				emitTest = true;
				dom = domElem;
			});

			view.registerChild('travis', '.view__child');

			action.emit('data:set:bicycle', {bike: true});
			action.emit('template:set:tom', function(){});
			action.emit('target:set:katie', document.querySelector('body'));

			assert.strictEqual(emitTest, true);
			assert.strictEqual(dom.classList.contains('view__child'), true);
		});

        it('should emit an event that tells its children to destroy themselves');
	});
});
