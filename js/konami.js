$(document).ready(function() {
	$(window).konami();
});


jQuery.fn.konami = function() {
	  var keys     = [];
    var konami  = '38,38,40,40,37,39,37,39,66,65';
 
   $(this).keydown(function(event) {
                keys.push( event.keyCode );
                if ( keys.toString().indexOf( konami ) >= 0 ){
                    // do something when the konami code is executed
                    alert("Easter Egg");
                    // empty the array containing the key sequence entered by the user
                    keys = [];
                }
            }
        );
};
