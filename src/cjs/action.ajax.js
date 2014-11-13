var ajaxMe =  function (objectIn) {
    'use strict';

    var obj = objectIn || {};

    obj.ajaxGet = function(setVariableName, successFunction, urlIn){
        var that = this
            , requestUrl = urlIn || that.url// + '?' + Date.now()

            , oReq = new XMLHttpRequest();

        oReq.onload = function(){
                    var data = JSON.parse(this.responseText);

                    if(this.status.match(/^[23][0-9][0-9]$/)){
                        that.emit(that.get('dataEvent'), data);

                        if(typeof setVariableName === 'string'){
                            that.set(setVariableName, data);
                        }else{
                            that.set(data);
                        }

                        if(typeof successFunction === 'function'){
                            successFunction.apply(that, [data]);
                        }
                    }else if(this.status.match(/^[4][0-9][0-9]$/)){

                    }else if(this.status.match(/^[5][0-9][0-9]$/)){
                        that.emit('global:error', new action.Error('http', 'Error in request', that));
                    }
                };

        oReq.onerror = function(xhr, errorType, error){
                    that.emit('global:error', new action.Error('http', 'Error in request type: ' + errorType, that, error));
                };

        oReq.open('get', requestUrl, true);
        oReq.send();
    };


    return obj;
};

module.exports = ajaxMe;