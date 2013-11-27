/* 
 * Diese Datei dient dazu den Konami Code abzufangen und anschliessend ggf. ein Easeter Egg auszufuehren
 * Der Konami Code besteht aus:
 * 		Pfeil hoch, Pfeil hoch, 
 * 		Pfeil runter, Pfeil runter, 
 * 		Pfeil links, Pfeil rechts, 
 * 		Pfeil links, Pfeil rechts, 
 * 		"b", "a"  
 */

var zerg;
$(document).ready(function() {
	$(window).konami();
});

/* Definiere eine JQuery-Funktion namens konami, die ueberprueft, ob der Benutzer den Konami Code eigegeben hat */
jQuery.fn.konami = function() {
	  var keys     = [];
    var konami  = '38,38,40,40,37,39,37,39,66,65';
 
   $(this).keydown(function(event) {
                keys.push( event.keyCode );
                if ( keys.toString().indexOf( konami ) >= 0 ){
                    // Easter Egg ist auszufuehren, wenn Konami Code eigegeben wurde
                    if (!zerg) {
						zerg = new ZergRush(20);
					}
                    // leere das Array wieder
                    keys = [];
                }
            }
        );
};
