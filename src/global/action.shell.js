import { eventMe } from './action.events';
import { modelMe } from './action.model';
import { routeMe } from './action.route';
import { clone, Error } from './action.utils';
import { viewMe } from './action.view';

var action = {
	eventStore: {}
	, eventMe: eventMe
	, routeMe: routeMe
	, viewMe: viewMe
    , modelMe: modelMe
	, clone: clone
	, Error: Error
};

action = eventMe(action);

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

window.action = action;