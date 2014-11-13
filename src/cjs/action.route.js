var eventMe = require('./action.events')

    , routeMe = function () {
        'use strict';

        var events = eventMe({});

        (function(){
            var that = this
                , atags = document.querySelectorAll('a')
                , body = document
                , i = 0;

            body.addEventListener('click', function (e) {
               // var location = this.attributes.href.textContent;
                var elem = e.target
                    , location;

                if(elem.tagName.toLowerCase() === 'a'){
                    location = elem.attributes.href.textContent;

                    if(location.match(/http:/)){
                        return {};
                    }else{
                        //emit the state:event
                        events.emit('state:change', location);
                        e.preventDefault();
                    }
                }
            });
        })();

        return {};
    };

module.exports = routeMe