(function(__exports__, __dependency1__) {
  "use strict";
  var eventMe = __dependency1__.eventMe;

  var viewMe = function(objectIn){
      var that = this
          , newView = eventMe(objectIn);

      if(typeof newView.render === 'undefined'){
          throw 'render is required for a view';
      }

      newView.stateReady = function(){
          newView.render.apply(newView);
      };

      //require event for the data
      newView.requiredEvent('data:set:' + newView.dataID, function(dataIn){
          this.viewData = dataIn;
      }, newView);

      //required event for the template
      newView.requiredEvent('template:set:' + newView.templateID, function(templateIn){
          this.template = templateIn;
      }, newView);

      if(typeof newView.destroy === 'undefined'){
          newView.destroy = function(){
              //TODO: write this out/figure it out
          };
      }

      newView.listen('state:change', function(stateID){
          var that = this;

          if(stateID === that.stateEvent || stateID.replace('/', '') === that.stateEvent){
              that.emit('template:get', that.templateID);
              that.emit('data:get:' + that.dataID);
          }
      }, newView);

      return newView;
  };

  __exports__.viewMe = viewMe;
})(window, window../action.events);