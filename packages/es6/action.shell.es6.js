(function(__exports__, __dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var eventMe = __dependency1__.eventMe;
  var modelMe = __dependency2__.modelMe;
  var routeMe = __dependency3__.routeMe;
  var clone = __dependency4__.clone;
  var Error = __dependency4__.Error;
  var viewMe = __dependency5__.viewMe;

  var action = eventMe({
  	eventStore: {}
  	, eventMe: eventMe
  	, routeMe: routeMe
  	, viewMe: viewMe
  	, clone: clone
  	, Error: error
  });

  action.listen('template:get', function(templateID){
      action.emit('template:set:' + templateID, action.templates[templateID]);
  });

  action.listen('global:error', function(errorIn) {
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


  __exports__.action = action;
})(window, window../action.events, window../action.model, window../action.route, window../action.utils, window../action.view);