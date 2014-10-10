import { eventMe } from './action.events';
import { clone, Error } from './action.utils';

var modelMe = function(objectIn){
        'use strict';

        //this is the module for creating a data model object
        var that = this
            , newModel = eventMe({})
            , attributes = {}
            , changes = [];

        newModel.super = {};

        newModel.get = function(attributeName){
            return attributes[attributeName];
        };

        newModel.set = function(attributeName, attributeValue){
            var that = this
                , key;

            if(typeof attributeName === 'object'){
                //well... this is an object... iterate and rock on
                for(key in attributeName){
                    if(attributeName.hasOwnProperty(key)){
                        //this attribute does not belong to the prototype. Good.

                        //TODO: maybe make this do a deep copy to prevent
                        //  pass by reference or switch to clone()
                        if(key !== 'destroy' && key !== 'fetch' && key !== 'save' && typeof attributeName[key] !== 'function'){
                            if(typeof attributeValue === 'object'){
                                attributes[attributeName] = (Array.isArray(attributeName[key])) ? [] : {};
                                clone(attributes[attributeName], attributeName[key]);
                            }else{
                                attributes[key] = attributeName[key];
                            }
                            that.emitLocal('attribute:changed', key);
                        } else {
                            if(typeof that[key] === 'function' && !that.super[key]){
                                //wrap the super version in a closure so that we can
                                //  still execute it correctly
                                that.super[key] = that[key].bind(that);
                            }

                            that[key] = attributeName[key];
                        }
                    }
                }
            } else{
                if(attributeName !== 'destroy' && attributeName !== 'fetch' && attributeName !== 'save'){
                    if(typeof attributeValue === 'object'){
                        attributes[attributeName] = (Array.isArray(attributeValue)) ? [] : {};
                        clone(attributes[attributeName], attributeValue);
                    }else{
                        attributes[attributeName] = attributeValue;
                    }

                    that.emitLocal('attribute:changed', attributeName);
                } else {
                    if(typeof that[attributeName] === 'function'){
                        //wrap the super version in a closure so that we can
                        //  still execute it correctly
                        that.super[attributeName] = that[attributeName].bind(that);
                    }
                    that[attributeName] = attributeValue;
                }
            }
        }

        newModel.flatten = function(){
            return attributes;
        }

        newModel.fetch = function(setVariableName, successFunction, errorFunction, flushCache){
            var that = this
                , requestUrl = that.get('url')
                , useLocal = that.get('cacheLocal') && action.useLocalCache && !flushCache;

            if(typeof requestUrl !== 'undefined'){
                //make the request for the model
                if(useLocal){
                    window.localforage.getItem(window.btoa(that.get('url')), function(data){
                        if(data === null){
                            //this doesn't exist locally...
                            that.ajaxGet(setVariableName, function(dataIn){
                                var localData = dataIn
                                    , articleId = that.get('url');

                                window.localforage.setItem(window.btoa(articleId), localData, function(){
                                    // console.log('data done');
                                });
                            });
                        }else{
                            //it does exist!
                            that.emit(that.get('dataEvent'), data);
                        }
                    });
                } else {
                    that.ajaxGet(setVariableName, successFunction);
                }
            } else {
                that.emit('global:error', new Error('http', 'No URL defined', that));
                if(typeof errorFunction === 'function'){
                    errorFunction.apply(that);
                }
            }
        };

        newModel.ajaxGet = function(setVariableName, successFunction){
            var that = this
                , requestUrl = that.get('url')// + '?' + Date.now()

                , oReq = new XMLHttpRequest();

            oReq.onload = function(){
                        var data = JSON.parse(this.responseText);

                        //TODO: make the statuses more generic
                        if(this.status === 200 || this.status === 302){
                            that.emit(that.get('dataEvent'), data);

                            if(typeof setVariableName === 'string'){
                                that.set(setVariableName, data);
                            }else{
                                that.set(data);
                            }

                            if(typeof successFunction === 'function'){
                                successFunction.apply(that, [data]);
                            }
                        }else if(this.status === 400){

                        }else if(this.status === 500){
                            that.emit('global:error', new Error('http', 'Error in request', that));
                        }
                    };

            oReq.onerror = function(xhr, errorType, error){
                        that.emit('global:error', new Error('http', 'Error in request type: ' + errorType, that, error));
                    };

            oReq.open('get', requestUrl, true);
            oReq.send();
        };

        newModel.save = function(){
            //TODO make this talk to a server with the URL
            //TODO make it only mark the saved changes clear
            var that = this
                , requestUrl = that.get('url')
                , id = that.get('id')
                , type = (typeof id === 'undefined') ? 'post' : 'put'

                , oReq = new XMLHttpRequest();

            if(typeof requestUrl !== 'undefined'){
                oReq.onload = function(){
                    if(this.status === 200 || this.status === 302){
                        that.clearChanges();
                        that.set(data);
                        that.emit(that.get('dataEvent'), data);

                    }else if(this.status === 500 || this.status === 400){
                        that.emit('global:error', new Error('http', 'Error in request', that));
                    }
                };

                oReq.submittedData = that.flatten();

                oReq.open(type, requestUrl, true);
                oReq.send();

                // $.ajax({
                //     type: type
                //     , url: requestUrl + '/' + id
                //     , data: that.flatten()
                //     , success: function(data, status){
                //         //only do this on success...
                //         that.clearChanges();

                //         //update the model with stuff from the server
                //         that.set(data);

                //         //emit the data event for this model to refresh everyone's values
                //         that.emit(that.get('dataEvent'), data);
                //     }
                //     , error: function(){
                //         that.emit('global:error', new action.Error('http', 'Error in request', that));
                //     }
                // });
            } else {
                action.emit('global:error', new Error('http', 'No URL defined', that));
            }
        }

        newModel.clearChanges = function(){
            changes = [];
        }

        newModel.getChanges = function(){
            return changes;
        }

        newModel.clear = function(){
            attributes = {};
        }

        newModel.destroy = function(){
            //TODO not really working... should get rid of this thing
            //  and all of its parameters
            var that = this
                , key;

            setTimeout(function(){
                // delete me;
            },0); // not quite working...

            for(key in that){
                // delete this[key];
            }

            //TODO this still doesn't kill the attributes or changes
            //  private data
        }

        newModel.set(objectIn); //set the inital attributes

        newModel.listenLocal('attribute:changed', function(nameIn){
            changes.push(nameIn);
        }, newModel); //maybe eliminate this 'this'

        newModel.listen(newModel.get('requestEvent'), function(){
            this.fetch();
        }, newModel);

        if(typeof newModel.init === 'function'){
            newModel.init.apply(newModel);
        }

        return newModel;
    };

export { modelMe }