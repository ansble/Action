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
	});

	it('should be defined', function(){
		assert.isDefined(action.viewMe);
		assert.isFunction(action.viewMe);
	});	

	it('should throw an error if no render function is passed in', function(){
		action.viewMe({});

		assert.isDefined(console.thrown);
	});

	it('should trigger render when all required events are complete', function(){
		var view = action.viewMe({
			renderCnt: 0
			, templateId: 'tom'
			, dataId: 'bicycle'
			
			, render: function(){
				this.renderCnt++;
			}
		});

		action.emit('data:set:bicycle', {bike: true});
		action.emit('template:set:tom', function(){});

		assert.strictEqual(view.renderCnt, 1);
	});

	it('should trigger render when all required events are complete and required data retriggers', function(){
		var view = action.viewMe({
			renderCnt: 0
			, templateId: 'tom'
			, dataId: 'bicycle'
			
			, render: function(){
				this.renderCnt++;
			}
		});

		action.emit('data:set:bicycle', {bike: true});
		action.emit('template:set:tom', function(){});
		action.emit('data:set:bicycle', {bike: true});
		action.emit('data:set:bicycle', {bike: true});

		assert.strictEqual(view.renderCnt, 3);
	});
});