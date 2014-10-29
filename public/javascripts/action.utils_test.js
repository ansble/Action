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

    it('should clone a basic object correctly', function(){
        var obj = {
                name: 'daniel'
                , job: 'code monkey'
            }
            , obj2 = action.clone(obj);

        assert.notStrictEqual(obj2, obj);
    });

    it('should clone a complex object correctly', function(){
        var obj = {
                name: 'daniel'
                , job: 'code monkey'
                , roles: [
                    'author'
                    , 'dude'
                    , 'cyclist'
                ]
                , attrib: {
                    maker: true
                    , builder: true
                }
            }
            , obj2 = action.clone(obj);

        assert.notStrictEqual(obj2, obj);
        assert.notStrictEqual(obj2.attrib, obj.attrib);
        assert.isObject(obj2.attrib);
        assert.isArray(obj2.roles);
        assert.strictEqual(obj2.roles[0], obj.roles[0]);
        assert.strictEqual(obj2.attrib.maker, obj.attrib.maker);

    });

    it('should clone an object by reference if two objects are passed in', function(){
        var obj = {
                name: 'daniel'
                , job: 'code monkey'
                , roles: [
                    'author'
                    , 'dude'
                    , 'cyclist'
                ]
                , attrib: {
                    maker: true
                    , builder: true
                }
            }
            , obj2 = {};

        action.clone(obj2, obj);

        assert.notStrictEqual(obj2, obj);
        assert.notStrictEqual(obj2.attrib, obj.attrib);
        assert.isObject(obj2.attrib);
        assert.isArray(obj2.roles);
        assert.strictEqual(obj2.roles[0], obj.roles[0]);
        assert.strictEqual(obj2.attrib.maker, obj.attrib.maker);
    });
    describe('compose function tests', function(){

        it('should return a composed object', function(){
            var t = {sam:true, bob:false}
                , x = {rachel: true, caleb:true, joel: false}
                , tx = action.compose(t, x);

            assert.isObject(tx);
            assert.strictEqual(tx.sam, true);
            assert.strictEqual(tx.caleb, true);
            assert.strictEqual(tx.rachel, true);
            assert.strictEqual(tx.joel, false);
            assert.strictEqual(tx.bob, false);
        });

        it('should execute functions passed into it', function(){
            var t = action.compose(
                {sam:true, bob:false}, 
                {rachel: true, caleb:true, joel: false}, 
                function(){
                    this.self = function(){
                        alert('self');
                    }
                });

            assert.isFunction(t.self);
        });

        it('should clone complex objects to sever the reference', function(){
            var t = {sam:true, bob:false, obj: {calendar: 'somehere'}}
                , x = {rachel: true, caleb:true, joel: false}
                , tx = action.compose(t, x);

            assert.notStrictEqual(t.obj, tx.obj);
        });
    })
});
