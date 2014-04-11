//do some setup for testing
dennisHoffman = action.modelMe({
    name: 'Dennis Hoffman'
    , role: 'actor'

    , init: function(){
        this.listen('actor:change', function(){
            alert('pick me! Dennis Hoffman');
        });
    }
});

sandraBullock = action.modelMe({
    name: 'Sandra Bullock'
    , role: 'actress'

    , init: function(){
        this.listen('actor:change', function(){
            alert('Choose me! Sandra Bullock');
        });
    }
});

angLee = action.modelMe({
    name: 'Ang Lee'
    , role: 'Director'
});