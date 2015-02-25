//do some setup for testing
action.modelMe({
    data: {
        name: 'Ang Lee'
        , role: 'Director'
    }

    , init: function(){
        'use strict';

        var that = this;

        that.on('cast:movie', function () {
            that.castingCall();

            //wait a little while...
            setTimeout(that.castingSelection(), 500);
        });
    }

    , castingCall: function(){
        'use strict';

        this.emit('actor:cast');
    }

    , castingSelection: function(){
        'use strict';

        this.emit('actor:choose');
    }
});

action.eventMe({
    actors: []

    , init: function(){
        'use strict';

        var that = this;

        that.on('actor:me', function(actor){
            var i = 0
                , fresh = true;

            for(i=0; i < that.actors.length; i++){
                fresh = that.actors[i].get('name') !== actor.get('name') && fresh;
            }

            if(fresh){
                that.actors.push(actor);
            }
        });

        that.on('actor:choose', function(){
            var rand = Math.floor(Math.random() * (that.actors.length ));

            that.emit('actor:change', that.actors[rand]);
        });
    }
});

action.on('actor:change', function(actor){
    'use strict';
    
    $('.currentActorName').text(actor.get('name'));
});