(function(__exports__) {
  "use strict";
  var Error =  function(typeIn, messageIn, objectIn, errorObjectIn){
          'use strict';

          return {
              type: typeIn
              , message: messageIn
              , createdBy: objectIn
              , errorObject: errorObjectIn
          }
      }

      //a clone function
      , clone =  function(objectIn, cloneMe){
          'use strict';
          
          var key;

          for(key in cloneMe){
              if(cloneMe.hasOwnProperty(key)){
                  //good to copy this one...
                  if (typeof cloneMe[key] === 'object'){
                      //set up the object for iteration later
                      objectIn[key] = (Array.isArray(cloneMe[key])) ? [] : {};

                      action.clone(objectIn[key], cloneMe[key]);
                  }else{
                      objectIn[key] = cloneMe[key];
                  }
              }
          }
      };

  __exports__.Error = Error;
  __exports__.clone = clone;
})(window);