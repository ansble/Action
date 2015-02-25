var eventMe = require('./action.events')
    , utils = require('./action.utils')
    , ajaxMe = require('./action.ajax');

var modelMe = function (objectIn) {
    'use strict';

    //this is the module for creating a data model object
    var newModel = utils.compose(eventMe, ajaxMe)
        , attributes = {}
        , changes = []
        , teardown = function () {
            newModel.tearDown.apply(newModel); //this is a little bit messy
            newModel.clear();

            Object.getOwnPropertyNames(newModel).forEach(function (key) {
                newModel[key] = undefined;
            });
        };

    newModel.super = {};

    newModel.get = function (attributeName) {
        return attributes[attributeName];
    };

    newModel.set = function (attributeName, attributeValue) {
        var that = this;

        if(typeof attributeName === 'object'){
            //well... this is an object... iterate and rock on
            Object.getOwnPropertyNames(attributeName).forEach(function (key) {
                if(key !== 'tearDown' && key !== 'fetch' && key !== 'save' && typeof attributeName[key] !== 'function'){
                    if(typeof attributeValue === 'object'){
                        attributes[attributeName] = (Array.isArray(attributeName[key])) ? [] : {};
                        utils.clone(attributes[attributeName], attributeName[key]);
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
            });
        } else if(attributeName !== 'tearDown' && attributeName !== 'fetch' && attributeName !== 'save'){
            if(typeof attributeValue === 'object'){
                attributes[attributeName] = (Array.isArray(attributeValue)) ? [] : {};
                utils.clone(attributes[attributeName], attributeValue);
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
    };

    newModel.flatten = function () {
        return attributes;
    };

    newModel.toJSON = function () {
        return JSON.stringify(attributes);
    };

    newModel.fetch = function (setVariableName, successFunction, errorFunction, flushCache) {
        var that = this
            , requestUrl = that.url
            , useLocal = that.get('cacheLocal') && action.useLocalCache && !flushCache;

        if(typeof requestUrl !== 'undefined'){
            //make the request for the model
            if(useLocal){
                window.localforage.getItem(window.btoa(that.url), function(data){
                    if(data === null){
                        //this doesn't exist locally...
                        that.ajaxGet(setVariableName, function(dataIn){
                            var localData = dataIn
                                , articleId = that.url;

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
            that.emit('global:error', new utils.errorObj('http', 'No URL defined', that));
            if(typeof errorFunction === 'function'){
                errorFunction.apply(that);
            }
        }
    };

    newModel.save = function () {
        //TODO make this talk to a server with the URL
        //TODO make it only mark the saved changes clear
        var that = this
            , requestUrl = that.url
            , id = that.get('id')
            , type = (typeof id === 'undefined') ? 'post' : 'put'

            , oReq = new XMLHttpRequest();

        if(typeof requestUrl !== 'undefined'){
            oReq.onload = function () {
                if(this.status === 200 || this.status === 302){
                    that.clearChanges();
                    that.set(data);
                    that.emit(that.get('dataEvent'), data);

                }else if(this.status === 500 || this.status === 400){
                    that.emit('global:error', new utils.errorObj('http', 'Error in request', that));
                }
            };

            oReq.submittedData = that.flatten();

            oReq.open(type, requestUrl, true);
            oReq.send();
        } else {
            that.emit('global:error', new utils.errorObj('http', 'No URL defined', that));
        }
    };

    newModel.clearChanges = function () {
        changes = [];
    };

    newModel.getChanges = function () {
        return changes;
    };

    newModel.clear = function () {
        attributes = {};
    };


    if(typeof newModel.tearDown === 'function'){
        newModel.super.tearDown = teardown;
    } else {
        newModel.tearDown = teardown;
    }

    if(typeof objectIn.data !== 'undefined'){
        newModel.set(objectIn.data); //set the inital attributes
        delete objectIn.data;
    }

    //iterate over the passed in object and set the values on the returned object
    Object.getOwnPropertyNames(objectIn).forEach(function (key) {
        if(typeof newModel[key] !== 'undefined'){
            newModel.super[key] = newModel[key];
        }

        newModel[key] = objectIn[key];
    });

    newModel.onLocal('attribute:changed', function (nameIn) {
        changes.push(nameIn);
    }, newModel);

    newModel.on(newModel.get('requestEvent'), function () {
        this.fetch();
    }, newModel);

    if(typeof newModel.init === 'function'){
        newModel.init.apply(newModel);
    }

    return newModel;
};

module.exports = modelMe;