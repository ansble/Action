$(function(){
    'use strict';
    
    action.on('actor:change', function(actor){
        $('#actorImage').attr('src', actor.get('image'));
    });
});