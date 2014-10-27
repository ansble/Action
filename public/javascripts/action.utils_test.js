var assert = chai.assert;

describe('The Utilities Module', function(){

    it('should return an Error constructor', function(){
        assert.isFunction(action.Error);
    });

    it('should create an error object correctly', function(){
        var err = new action.Error('test'
            , 'an error occured yo'
            , {}
            , {}
        );

        assert.isString(err.type);
        assert.isString(err.message);
        assert.isObject(err.createdBy);
        assert.isObject(err.errorObject);
    });

    it('should clone an object correctly', function(){
        assert.strictEqual(true, false);
    });

});
