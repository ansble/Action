var eventMe = require('./action.events')
	, viewMe = require('./action.view')
	, modelMe = require('./action.model')
	, utils = require('./action.utils')
	, routeMe = require('./action.route');

//setup the object before we event it to prevent issues with action.eventStore not existing
window.action = {
	eventStore: {}
	, eventMe: eventMe
	, routeMe: routeMe
	, viewMe: viewMe
    , modelMe: modelMe
	, clone: utils.clone
    , compose: utils.compose
	, Error: utils.Error
    , init: function(){
        'use strict';

        this.listen('template:get', function(templateID){
            this.emit('template:set:' + templateID, this.templates[templateID]);
        });

        this.listen('global:error', function(errorIn) {
            
            console.group('An Error occured in an object with emitterid: ' + errorIn.createdBy.emitterId);
            console.log('It was a ' + errorIn.type + 'error.');

            if(typeof errorIn.errorObject === 'string'){
                console.log('It says: ' + errorIn.errorObject);
                console.log('and: ' + errorIn.message);
            } else {
                console.log('It says: ' + errorIn.message);
            }

            console.log('The Whole Enchilada (object that caused this mess):');
            console.dir(errorIn.createdBy);

            if(typeof errorIn.createdBy.flatten === 'function'){
                console.log('Just the Lettuce (attributes):');
                console.dir(errorIn.createdBy.flatten());
            }

            if(typeof errorIn.errorObject === 'object'){
                console.log('Oh look an Error Object!:');
                console.dir(errorIn.errorObject);
            }

            console.groupEnd();
            // this.trace(errorIn.createdBy.emitterId);
            // throw errorIn;
        });
    }
};

window.action = eventMe(window.action);
