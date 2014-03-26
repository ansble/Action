define(function() {
    return {
        dependencies: function(requiredIn, callbackIn, context, argObject, customFetchName) {
            var required = requiredIn //The array of dependencies
                ,
                callback = callbackIn //The Callback Function
                ,
                closureFunction;

            if (typeof context === 'undefined') {
                context = this;
            }

            //Sanity Checks!
            if (typeof callback !== 'function') {
                console.warn('Pass in a Callback Function please...');
                return false;
            }

            if (!required instanceof Array) {
                if (typeof required === 'object') {
                    required = [required];
                } else {
                    console.warn('Pass in an array please...');
                    return false;
                }
            }
            //End Sanity Checks!

            closureFunction = function() {
                var truthy = true,
                    index, r;

                this._calledBack = 0;

                for (index = 0; index < required.length; index++) {
                    if (required[index].isError()) {
                        //throw 'Error fetching dependency';
                    } else if (!required[index].isReady() && !required[index].isPending() && typeof customFetchName === 'string') {
                        //this object is not ready or pending...
                        required[index][customFetchName](argObject);
                    } else if (!required[index].isReady() && !required[index].isPending()) {
                        //this object is not ready or pending...
                        required[index].fetch(argObject);
                    }

                    truthy = truthy && required[index].isReady();
                }

                if (truthy) {
                    //everything is ready!!!!
                    //banish our listeners first
                    for (r = 0; r < required.length; r++) {
                        //r for romeo
                        required[r].off('statusChange', closureFunction, context);
                    }

                    //  trigger that callback ->
                    this._calledBack++;
                    if (this._calledBack <= 1) {
                        callback.call(context, {}, {});
                    }

                }
            };

            for (var i = 0; i < required.length; i++) {
                required[i].update(undefined);
                required[i].on('statusChange', closureFunction, context);
            }

            closureFunction();
        }
    };
});