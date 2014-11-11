var eventMe = require('./action.events')
	, viewMe = require('./action.view')
	, modelMe = require('./action.model')
	, utils = require('./action.utils')
	, routeMe = require('./action.route')

	, action = eventMe({
		eventStore: {}
		, eventMe: eventMe
		, routeMe: routeMe
		, viewMe: viewMe
		, clone: utils.clone
		, Error: utils.Error
	});

action.listen('template:get', function(templateID){
    'use strict';

    action.emit('template:set:' + templateID, action.templates[templateID]);
});

action.listen('global:error', function(errorIn) {
    'use strict';
    
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
    // action.trace(errorIn.createdBy.emitterId);
    // throw errorIn;
});

if(typeof window !== 'undefined'){
    window.action = action;
} else {
    module.exports = action;
}
