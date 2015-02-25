var model = require('./action.model.js')
	, eventMe = require('./action.events')
	, utils = require('./action.utils')
	
	, collectionMe = function (urlIn, dataIn) {
		'use strict';

		var url
			, collection = eventMe({
				storage: []
			});

		//three possible signatures for the function
		//	(url, data)
		//	(url)
		//	(data)
		//	({url, data})
		if(typeof urlIn === 'object' && Array.isArray(urlIn)){
			collection.storage = urlIn;
		} else if(typeof urlIn === 'object'){
			url = urlIn.url;
			collection.storage = urlIn.collection;
		} else if(typeof urlIn === 'string'){
			url = urlIn;

			if(typeof dataIn !== 'undefined'){
				collection.storage = dataIn;
			}
		} else {
			//this is not handled because we gotta have something!

			collection.emit('global:error', new utils.Error('required param', 'collections require an array of data, or a url to be created', collection));
            return;
		}

	};

module.exports = collectionMe;