var eventMe = require('./action.events')
	, viewMe = require('./action.view')
	, modelMe = require('./action.model')
	, utils = require('./action.utils')
	, routeMe = require('./action.route')

	, action = ['!'] = 📣 = eventMe({
		eventStore: {}
		, eventMe: eventMe
		, routeMe: routeMe
		, viewMe: viewMe
		, clone: utils.clone
		, Error: utils.Error
	});

📣.listen('template:get', function(templateID){
    📣.emit('template:set:' + templateID, 📣.templates[templateID]);
});

📣.listen('global:error', function(errorIn) {
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
    // 📣.trace(errorIn.createdBy.emitterId);
    // throw errorIn;
});

module.exports = 📣;