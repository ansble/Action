$(function(){
    $('#changeActors').click(function(){
        action.emit('cast:movie');
    });
});