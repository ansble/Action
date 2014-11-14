var assert = chai.assert;

describe('The View Module: viewMe', function(){
	
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
			
			, render: function(){
				var elem = document.createElement('p');

				elem.classList.add('view__child');

				document.body.appendChild(elem);

				this.renderCnt++;
			}
		});
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

	it('should allow either a string or an array of strings as values for stateEvent');

	it('should trigger the gets for template and data when a state event it cares about is fired');

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

	it('should hide itself when a different route triggers');

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

			action.listen('render:katie', function(domElem){
				emitTest = true;
				dom = domElem;
			});

			view.registerChild('render:katie', '.view__child');

			action.emit('data:set:bicycle', {bike: true});
			action.emit('template:set:tom', function(){});

			assert.strictEqual(emitTest, true);
			assert.strictEqual(dom.classList.contains('view__child'), true);
		});
	});
});