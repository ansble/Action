"use strict";
Object.defineProperties(exports, {
  eventMe: {get: function() {
      return eventMe;
    }},
  __esModule: {value: true}
});
var eventMe = function(objectIn) {
  'use strict';
  var returnObject = objectIn,
      localEvents = {};
  returnObject.emitterId = Math.ceil(Math.random() * 10000);
  returnObject.eventStore = {};
  returnObject.emit = function(eventNameIn, eventDataIn, localFlag) {
    var that = this,
        eventStack,
        functionToCall,
        i,
        isLocal = (typeof localFlag !== 'undefined' && localFlag);
    if (isLocal) {
      eventStack = that.eventStore[eventNameIn];
    } else {
      eventStack = action.eventStore[eventNameIn];
    }
    if (typeof eventStack !== 'undefined') {
      for (i = 0; i < eventStack.length; i++) {
        if (typeof eventStack[i].scope !== 'undefined') {
          eventStack[i].call.apply(eventStack[i].scope, [eventDataIn, that.emitterId]);
        } else {
          eventStack[i].call(eventDataIn, that.emitterId);
        }
        if (eventStack[i].once) {
          that.silence(eventNameIn, eventStack[i].call, true, isLocal);
        }
      }
    }
  };
  returnObject.emitLocal = function(eventNameIn, eventDataIn) {
    var that = this;
    that.emit(eventNameIn, eventDataIn, true);
  };
  returnObject.listen = function(eventNameIn, handlerIn, scopeIn, onceIn, localFlagIn) {
    var that = this,
        i,
        newCheck = true,
        eventName = eventNameIn,
        handler = handlerIn,
        scope = scopeIn,
        local = localFlagIn,
        once = onceIn,
        eventStack,
        newEvent;
    if (typeof eventNameIn === 'object') {
      eventName = eventNameIn.eventName;
      handler = eventNameIn.handler;
      scope = eventNameIn.scope;
      once = eventNameIn.once;
      local = eventNameIn.local;
    }
    eventStack = (typeof local !== 'undefined' && local) ? that.eventStore[eventNameIn] : action.eventStore[eventNameIn];
    newEvent = (typeof local !== 'undefined' && local) ? that : action;
    if (typeof eventStack !== 'undefined') {
      for (i = 0; i < eventStack.length; i++) {
        if (eventStack[i].call === handler && eventStack[i].once === false) {
          newCheck = false;
          break;
        }
      }
      if (newCheck && typeof scopeIn !== 'undefined') {
        eventStack.push({
          once: false,
          call: handler,
          scope: scope
        });
      } else if (newCheck) {
        eventStack.push({
          once: false,
          call: handler
        });
      }
    } else {
      newEvent.eventStore[eventName] = [];
      if (typeof scopeIn !== 'undefined') {
        newEvent.eventStore[eventName].push({
          once: false,
          call: handler,
          scope: scope
        });
      } else {
        newEvent.eventStore[eventName].push({
          once: false,
          call: handler
        });
      }
    }
  };
  returnObject.listenLocal = function(eventNameIn, handlerIn, scopeIn, onceIn) {
    var that = this;
    if (typeof eventNameIn === 'object') {
      eventNameIn.local = true;
      that.listen(eventNameIn);
    } else {
      that.listen({
        eventName: eventNameIn,
        handler: handlerIn,
        scope: scopeIn,
        once: onceIn,
        local: true
      });
    }
  };
  returnObject.listenOnce = function(eventNameIn, handlerIn, scopeIn, localFlagIn) {
    var that = this,
        i,
        newCheck = true,
        eventStack,
        newEvent,
        eventName = eventNameIn,
        handler = handlerIn,
        scope = scopeIn,
        localFlag = localFlagIn;
    if (typeof eventNameIn === 'object') {
      eventName = eventNameIn.eventName;
      handler = eventNameIn.handler;
      scope = eventNameIn.scope;
      localFlag = eventNameIn.local;
    }
    if (typeof localFlag !== 'undefined' && localFlag) {
      eventStack = that.eventStore[eventName];
      newEvent = that;
    } else {
      eventStack = action.eventStore[eventName];
      newEvent = action;
    }
    if (typeof eventStack !== 'undefined') {
      for (i = 0; i < eventStack.length; i++) {
        if (eventStack[i].call === handler && eventStack[i].once === true) {
          newCheck = false;
          break;
        }
      }
      if (newCheck) {
        eventStack.push({
          once: true,
          call: handler,
          scope: scope
        });
      }
    } else {
      newEvent.eventStore[eventNameIn] = [];
      newEvent.eventStore[eventNameIn].push({
        once: true,
        call: handler,
        scope: scope
      });
    }
  };
  returnObject.listenOnceLocal = function(eventNameIn, handlerIn, scopeIn) {
    var that = this;
    if (typeof eventNameIn === 'object') {
      eventNameIn.local = true;
      that.listenLocal(eventNameIn);
    } else {
      that.listenLocal({
        eventName: eventNameIn,
        handler: handlerIn,
        scope: scopeIn,
        local: true
      });
    }
  };
  returnObject.silence = function(eventNameIn, handlerIn, onceIn, scopeIn, localFlagIn) {
    var that = this,
        i,
        truthy = false,
        eventName = eventNameIn,
        handler = handlerIn,
        once = onceIn,
        scope = scopeIn,
        localFlag = localFlagIn,
        store;
    if (typeof eventNameIn === 'object') {
      eventName = eventNameIn.eventName;
      handler = eventNameIn.handler;
      once = eventNameIn.once;
      scope = eventNameIn.scope;
      localFlag = eventNameIn.local;
    }
    store = (typeof localFlag === 'undefined' || !localFlag) ? action : that;
    if (typeof store.eventStore[eventName] === 'undefined') {
      return;
    }
    for (i = 0; i < store.eventStore[eventName].length; i++) {
      truthy = false;
      if (typeof handler !== 'undefined') {
        if (typeof scope !== 'undefined') {
          if (typeof once === 'boolean') {
            truthy = (handler === store.eventStore[eventName][i].call && scope === store.eventStore[eventName][i].scope && once === store.eventStore[eventName][i].once);
          } else {
            truthy = (handler === store.eventStore[eventName][i].call && scope === store.eventStore[eventName][i].scope);
          }
        } else {
          if (typeof once === 'boolean') {
            truthy = (handler === store.eventStore[eventName][i].call && store.eventStore[eventName][i].once === once);
          } else {
            truthy = (handler === store.eventStore[eventName][i].call);
          }
        }
      } else {
        store.eventStore[eventName] = [];
        break;
      }
      if (truthy) {
        store.eventStore[eventName].splice(i, 1);
      }
    }
  };
  returnObject.silenceLocal = function(eventNameIn, handlerIn, onceIn, scopeIn) {
    var that = this;
    if (typeof eventNameIn === 'object') {
      eventNameIn.local = true;
      that.silence(eventNameIn);
    } else {
      that.silence({
        eventName: eventNameIn,
        handler: handlerIn,
        once: onceIn,
        scope: scopeIn,
        local: true
      });
    }
  };
  returnObject.requiredEvent = function(name, callback, context, fireMultipleIn) {
    var that = this,
        stateUpdate;
    that._fireMultiple = (typeof fireMultipleIn !== 'undefined') ? fireMultipleIn : false;
    if (typeof that.stateEvents === 'undefined') {
      that.stateEvents = {};
    }
    if (typeof that._triggeredStateReady === 'undefined') {
      that._triggeredStateReady = false;
    }
    that.stateEvents[name] = false;
    stateUpdate = that.stateUpdate(name, that.stateEvents);
    that.listen(name, callback, context);
    that.listen(name, stateUpdate, that);
  };
  returnObject.stateUpdate = function(nameIn, stateEventsIn) {
    var name = nameIn,
        stateEvents = stateEventsIn,
        that = this;
    return function() {
      var truthy = true,
          key;
      if (typeof stateEvents[name] !== 'undefined') {
        stateEvents[name] = true;
        for (key in stateEvents) {
          truthy = truthy && stateEvents[key];
        }
        if (truthy) {
          if (!that._triggeredStateReady || that._fireMultiple) {
            setTimeout(that.stateReady.apply(that), 100);
            that._triggeredStateReady = true;
          }
        }
      }
    };
  };
  returnObject.stateReady = function() {
    console.log('ready!');
  };
  returnObject.listen('system:trace', function(emitterIDIn) {
    var that = this;
    if (that.emitterId === emitterIDIn) {
      action.traced = that;
    }
  }, returnObject);
  if (typeof returnObject.init === 'function') {
    returnObject.init.apply(returnObject);
  }
  return returnObject;
};
;

"use strict";
Object.defineProperties(exports, {
  modelMe: {get: function() {
      return modelMe;
    }},
  __esModule: {value: true}
});
var $__action_46_events__,
    $__action_46_utils__;
var eventMe = ($__action_46_events__ = require("./action.events"), $__action_46_events__ && $__action_46_events__.__esModule && $__action_46_events__ || {default: $__action_46_events__}).eventMe;
var $__1 = ($__action_46_utils__ = require("./action.utils"), $__action_46_utils__ && $__action_46_utils__.__esModule && $__action_46_utils__ || {default: $__action_46_utils__}),
    clone = $__1.clone,
    Error = $__1.Error;
var modelMe = function(objectIn) {
  'use strict';
  var that = this,
      newModel = eventMe({}),
      attributes = {},
      changes = [];
  newModel.super = {};
  newModel.get = function(attributeName) {
    return attributes[attributeName];
  };
  newModel.set = function(attributeName, attributeValue) {
    var that = this,
        key;
    if (typeof attributeName === 'object') {
      for (key in attributeName) {
        if (attributeName.hasOwnProperty(key)) {
          if (key !== 'destroy' && key !== 'fetch' && key !== 'save' && typeof attributeName[key] !== 'function') {
            if (typeof attributeValue === 'object') {
              attributes[attributeName] = (Array.isArray(attributeName[key])) ? [] : {};
              clone(attributes[attributeName], attributeName[key]);
            } else {
              attributes[key] = attributeName[key];
            }
            that.emitLocal('attribute:changed', key);
          } else {
            if (typeof that[key] === 'function' && !that.super[key]) {
              that.super[key] = that[key].bind(that);
            }
            that[key] = attributeName[key];
          }
        }
      }
    } else {
      if (attributeName !== 'destroy' && attributeName !== 'fetch' && attributeName !== 'save') {
        if (typeof attributeValue === 'object') {
          attributes[attributeName] = (Array.isArray(attributeValue)) ? [] : {};
          clone(attributes[attributeName], attributeValue);
        } else {
          attributes[attributeName] = attributeValue;
        }
        that.emitLocal('attribute:changed', attributeName);
      } else {
        if (typeof that[attributeName] === 'function') {
          that.super[attributeName] = that[attributeName].bind(that);
        }
        that[attributeName] = attributeValue;
      }
    }
  };
  newModel.flatten = function() {
    return attributes;
  };
  newModel.fetch = function(setVariableName, successFunction, errorFunction, flushCache) {
    var that = this,
        requestUrl = that.get('url'),
        useLocal = that.get('cacheLocal') && action.useLocalCache && !flushCache;
    if (typeof requestUrl !== 'undefined') {
      if (useLocal) {
        window.localforage.getItem(window.btoa(that.get('url')), function(data) {
          if (data === null) {
            that.ajaxGet(setVariableName, function(dataIn) {
              var localData = dataIn,
                  articleId = that.get('url');
              window.localforage.setItem(window.btoa(articleId), localData, function() {});
            });
          } else {
            that.emit(that.get('dataEvent'), data);
          }
        });
      } else {
        that.ajaxGet(setVariableName, successFunction);
      }
    } else {
      that.emit('global:error', new Error('http', 'No URL defined', that));
      if (typeof errorFunction === 'function') {
        errorFunction.apply(that);
      }
    }
  };
  newModel.ajaxGet = function(setVariableName, successFunction) {
    var that = this,
        requestUrl = that.get('url'),
        oReq = new XMLHttpRequest();
    oReq.onload = function() {
      var data = JSON.parse(this.responseText);
      if (this.status === 200 || this.status === 302) {
        that.emit(that.get('dataEvent'), data);
        if (typeof setVariableName === 'string') {
          that.set(setVariableName, data);
        } else {
          that.set(data);
        }
        if (typeof successFunction === 'function') {
          successFunction.apply(that, [data]);
        }
      } else if (this.status === 400) {} else if (this.status === 500) {
        that.emit('global:error', new Error('http', 'Error in request', that));
      }
    };
    oReq.onerror = function(xhr, errorType, error) {
      that.emit('global:error', new Error('http', 'Error in request type: ' + errorType, that, error));
    };
    oReq.open('get', requestUrl, true);
    oReq.send();
  };
  newModel.save = function() {
    var that = this,
        requestUrl = that.get('url'),
        id = that.get('id'),
        type = (typeof id === 'undefined') ? 'post' : 'put',
        oReq = new XMLHttpRequest();
    if (typeof requestUrl !== 'undefined') {
      oReq.onload = function() {
        if (this.status === 200 || this.status === 302) {
          that.clearChanges();
          that.set(data);
          that.emit(that.get('dataEvent'), data);
        } else if (this.status === 500 || this.status === 400) {
          that.emit('global:error', new Error('http', 'Error in request', that));
        }
      };
      oReq.submittedData = that.flatten();
      oReq.open(type, requestUrl, true);
      oReq.send();
    } else {
      action.emit('global:error', new Error('http', 'No URL defined', that));
    }
  };
  newModel.clearChanges = function() {
    changes = [];
  };
  newModel.getChanges = function() {
    return changes;
  };
  newModel.clear = function() {
    attributes = {};
  };
  newModel.destroy = function() {
    var that = this,
        key;
    setTimeout(function() {}, 0);
    for (key in that) {}
  };
  newModel.set(objectIn);
  newModel.listenLocal('attribute:changed', function(nameIn) {
    changes.push(nameIn);
  }, newModel);
  newModel.listen(newModel.get('requestEvent'), function() {
    this.fetch();
  }, newModel);
  if (typeof newModel.init === 'function') {
    newModel.init.apply(newModel);
  }
  return newModel;
};
;

"use strict";
Object.defineProperties(exports, {
  routeMe: {get: function() {
      return routeMe;
    }},
  __esModule: {value: true}
});
var $__action_46_events__;
var eventMe = ($__action_46_events__ = require("./action.events"), $__action_46_events__ && $__action_46_events__.__esModule && $__action_46_events__ || {default: $__action_46_events__}).eventMe;
var routeMe = function(objectIn) {
  var that = this,
      events = that.eventMe({}),
      init = function() {
        var that = this,
            atags = document.querySelectorAll('a'),
            body = document,
            i = 0;
        body.addEventListener('click', function(e) {
          var elem = e.toElement,
              location;
          if (elem.tagName.toLowerCase() === 'a') {
            location = elem.attributes.href.textContent;
            if (location.match(/http:/)) {
              return {};
            } else {
              events.emit('state:change', location);
              e.preventDefault();
            }
          }
        });
      };
  init();
  return {};
};
;

"use strict";
Object.defineProperties(exports, {
  action: {get: function() {
      return action;
    }},
  __esModule: {value: true}
});
var $__action_46_events__,
    $__action_46_model__,
    $__action_46_route__,
    $__action_46_utils__,
    $__action_46_view__;
var eventMe = ($__action_46_events__ = require("./action.events"), $__action_46_events__ && $__action_46_events__.__esModule && $__action_46_events__ || {default: $__action_46_events__}).eventMe;
var modelMe = ($__action_46_model__ = require("./action.model"), $__action_46_model__ && $__action_46_model__.__esModule && $__action_46_model__ || {default: $__action_46_model__}).modelMe;
var routeMe = ($__action_46_route__ = require("./action.route"), $__action_46_route__ && $__action_46_route__.__esModule && $__action_46_route__ || {default: $__action_46_route__}).routeMe;
var $__3 = ($__action_46_utils__ = require("./action.utils"), $__action_46_utils__ && $__action_46_utils__.__esModule && $__action_46_utils__ || {default: $__action_46_utils__}),
    clone = $__3.clone,
    Error = $__3.Error;
var viewMe = ($__action_46_view__ = require("./action.view"), $__action_46_view__ && $__action_46_view__.__esModule && $__action_46_view__ || {default: $__action_46_view__}).viewMe;
var action = eventMe({
  eventStore: {},
  eventMe: eventMe,
  routeMe: routeMe,
  viewMe: viewMe,
  clone: clone,
  Error: error
});
action.listen('template:get', function(templateID) {
  action.emit('template:set:' + templateID, action.templates[templateID]);
});
action.listen('global:error', function(errorIn) {
  console.group('An Error occured in an object with emitterid: ' + errorIn.createdBy.emitterId);
  console.log('It was a ' + errorIn.type + 'error.');
  if (typeof errorIn.errorObject === 'string') {
    console.log('It says: ' + errorIn.errorObject);
    console.log('and: ' + errorIn.message);
  } else {
    console.log('It says: ' + errorIn.message);
  }
  console.log('The Whole Enchilada (object that caused this mess):');
  console.dir(errorIn.createdBy);
  if (typeof errorIn.createdBy.flatten === 'function') {
    console.log('Just the Lettuce (attributes):');
    console.dir(errorIn.createdBy.flatten());
  }
  if (typeof errorIn.errorObject === 'object') {
    console.log('Oh look an Error Object!:');
    console.dir(errorIn.errorObject);
  }
  console.groupEnd();
});
;

"use strict";
Object.defineProperties(exports, {
  Error: {get: function() {
      return Error;
    }},
  clone: {get: function() {
      return clone;
    }},
  __esModule: {value: true}
});
var Error = function(typeIn, messageIn, objectIn, errorObjectIn) {
  'use strict';
  return {
    type: typeIn,
    message: messageIn,
    createdBy: objectIn,
    errorObject: errorObjectIn
  };
},
    clone = function(objectIn, cloneMe) {
      'use strict';
      var key;
      for (key in cloneMe) {
        if (cloneMe.hasOwnProperty(key)) {
          if (typeof cloneMe[key] === 'object') {
            objectIn[key] = (Array.isArray(cloneMe[key])) ? [] : {};
            action.clone(objectIn[key], cloneMe[key]);
          } else {
            objectIn[key] = cloneMe[key];
          }
        }
      }
    };
;

"use strict";
Object.defineProperties(exports, {
  viewMe: {get: function() {
      return viewMe;
    }},
  __esModule: {value: true}
});
var $__action_46_events__;
var eventMe = ($__action_46_events__ = require("./action.events"), $__action_46_events__ && $__action_46_events__.__esModule && $__action_46_events__ || {default: $__action_46_events__}).eventMe;
var viewMe = function(objectIn) {
  var that = this,
      newView = eventMe(objectIn);
  if (typeof newView.render === 'undefined') {
    throw 'render is required for a view';
  }
  newView.stateReady = function() {
    newView.render.apply(newView);
  };
  newView.requiredEvent('data:set:' + newView.dataID, function(dataIn) {
    this.viewData = dataIn;
  }, newView);
  newView.requiredEvent('template:set:' + newView.templateID, function(templateIn) {
    this.template = templateIn;
  }, newView);
  if (typeof newView.destroy === 'undefined') {
    newView.destroy = function() {};
  }
  newView.listen('state:change', function(stateID) {
    var that = this;
    if (stateID === that.stateEvent || stateID.replace('/', '') === that.stateEvent) {
      that.emit('template:get', that.templateID);
      that.emit('data:get:' + that.dataID);
    }
  }, newView);
  return newView;
};
;
