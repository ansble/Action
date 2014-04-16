//do some setup for testing
angLee = action.modelMe({
    name: 'Ang Lee'
    , role: 'Director'

    , init: function(){
        var that = this;

        that.listen('cast:movie', function () {
            that.castingCall();

            //wait a little while...
            setTimeout(that.castingSelection(), 500);
        });
    }

    , castingCall: function(){
        this.emit('actor:cast');
    }

    , castingSelection: function(){
        this.emit('actor:choose');
    }
});

currentActor = action.eventMe({
    actors: []

    , init: function(){
        var that = this;

        that.listen('actor:me', function(actor){
            var i = 0
                , fresh = true;

            for(i=0; i < that.actors.length; i++){
                fresh = that.actors[i].get('name') !== actor.get('name') && fresh;
            }

            if(fresh){
                that.actors.push(actor);
            }
        });

        that.listen('actor:choose', function(){
            var rand = Math.floor(Math.random() * (that.actors.length ));

            that.emit('actor:change', that.actors[rand]);
        });
    }
});

action.listen('actor:change', function(actor){
    $('.currentActorName').text(actor.get('name'));
});