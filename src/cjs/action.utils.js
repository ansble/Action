var errorObj =  function (typeIn, messageIn, objectIn, errorObjectIn) {
        'use strict';

        return {
            type: typeIn
            , message: messageIn
            , createdBy: objectIn
            , errorObject: errorObjectIn
        };
    }

    //a clone function
    , clone =  function (objectIn, cloneMe) {
        'use strict';

        var obj = objectIn
            , clone = cloneMe;

        if(typeof clone === 'undefined'){
            clone = objectIn;
            obj = {};
        }

        //wipe out any existing parts of the object before the clone
        Object.getOwnPropertyNames(obj).forEach(function (key) {
            if(key !== 'length'){
                obj[key] = undefined;
            }
        });

        Object.getOwnPropertyNames(clone).forEach(function (key) {
            if (typeof clone[key] === 'object'){
                //set up the object for iteration later
                obj[key] = (Array.isArray(clone[key])) ? [] : {};

                action.clone(obj[key], clone[key]);
            }else{
                obj[key] = clone[key];
            }
        });

        return obj;
    }

    , compose = function () {
        'use strict';

        var obj = {}
            , i = 0
            , currObj = {}
            , that = this

            , setProperty = function (property) {
                if(typeof currObj[property] === 'object'){
                    obj[property] = that.clone(currObj[property]);
                } else {
                    obj[property] = currObj[property];
                }
            };

        for(i = 0; i < arguments.length; i++){
            if(typeof arguments[i] === 'object' && !Array.isArray(arguments[i])){
                currObj = arguments[i];

                Object.getOwnPropertyNames(currObj).forEach(setProperty);
            } else if (typeof arguments[i] === 'function') {
                //this is a function apply it
                arguments[i].call(obj, obj);
            }
        }

        return obj;
    };

module.exports = {errorObj: errorObj, clone: clone, compose: compose};