var starRating = {
	content : _.template('<div class="starRating">' + '<span class="glyphicon glyphicon-star-empty" title="<%- hint1 %>"></span>' + '<span class="glyphicon glyphicon-star-empty" title="<%- hint2 %>"></span>' + '<span class="glyphicon glyphicon-star-empty" title="<%- hint3 %>"></span>' + '<span class="glyphicon glyphicon-star-empty" title="<%- hint4 %>"></span>' + '<span class="glyphicon glyphicon-star-empty" title="<%- hint5 %>"></span>' + '<input type="hidden" name="score" value="3">' + '</div>')
};

(function($) {

	$.fn.rating = function(options) {
		var methods = {
			init : function() {
				// This is the easiest way to have default options.
				var settings = $.extend({
					// These are the defaults.
					hints : ["schlecht", "geht so", "okay", "gut", "wow"]
				}, options);

				var val = starRating.content({
					hint1 : settings.hints[0],
					hint2 : settings.hints[1],
					hint3 : settings.hints[2],
					hint4 : settings.hints[3],
					hint5 : settings.hints[4]
				});

				//_.bindAll(starRating, 'mouseOver');
				return $(val).html();
			},
			mouseOver : function() {
				// fuellen des Sterns, ueber dem der Mauszeiger ist
				toggleClasses(true);

				// fuellt die vorhergehenden Sterne aus
				$(this).prevAll().each(function() {
					toggleClasses(true);
				});

				// entfernt ausgefuellte Sterne in nachvolgenden Elementen
				$(this).nextAll().each(function() {
					toggleClasses(false);
				});
			}
			
		};
		
			methods.init();
	};

	function toggleClasses(prev) {
		if (prev) {
			$(this).removeClass('glyphicon-star-empty');
			$(this).addClass('glyphicon-star');
		} else {
			$(this).removeClass('glyphicon-star');
			$(this).addClass('glyphicon-star-empty');
		}
	}

})(jQuery);
