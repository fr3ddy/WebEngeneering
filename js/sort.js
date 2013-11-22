$(document).ready(function() {
	$('#sortTitleASC').on("click", function() {

		if (filter.movieTitleSorted != 'true' && filter.movieRatingSorted == null) {//alphabetische Sortierung von A zu Z und Ratingfilter nicht aktiv
			sortTitleAlphabet(true);
			filter.movieTitleSorted = 'true';
			$('#sortTitleASC').removeClass('sortInactive');
			$('#sortTitleDESC').addClass('sortInactive');
		} else if (filter.movieTitleSorted == 'true' && filter.movieRatingSorted == null) {//alphabetische Sortierung von A zu Z aktiv und Ratingfilter nicht aktiv
			removeSort();
			filter.movieTitleSorted = null;
			$('#sortTitleASC').addClass('sortInactive');
		} else if (filter.movieTitleSorted != 'true' && filter.movieRatingSorted != null) {//alphabetische Sortierung von A zu Z inaktiv und Ratingfilter aktiv
			filter.movieTitleSorted = 'true';
			$('#sortTitleASC').removeClass('sortInactive');
			$('#sortTitleDESC').addClass('sortInactive');
			sortTitleAlphabet(true);

			//Loescht die Rating-Sortierung
			filter.movieRatingSorted = null;
			$('#sortRatingASC').addClass('sortInactive');
			$('#sortRatingDESC').addClass('sortInactive');

		}
	});

	$('#sortTitleDESC').on("click", function() {
		if (filter.movieTitleSorted != 'false' && filter.movieRatingSorted == null) {//alphabetische Sortierung von Z zu A und Ratingfilter nicht aktiv
			sortTitleAlphabet(false);
			filter.movieTitleSorted = 'false';
			$('#sortTitleDESC').removeClass('sortInactive');
			$('#sortTitleASC').addClass('sortInactive');
		} else if (filter.movieTitleSorted == 'false' && filter.movieRatingSorted == null) {//alphabetische Sortierung von Z zu A aktiv und Ratingfilter nicht aktiv
			removeSort();
			filter.movieTitleSorted = null;
			$('#sortTitleDESC').addClass('sortInactive');
		} else if (filter.movieTitleSorted != 'false' && filter.movieRatingSorted != null) {//alphabetische Sortierung von Z zu A inaktiv und Ratingfilter aktiv
			filter.movieTitleSorted = 'false';
			$('#sortTitleDESC').removeClass('sortInactive');
			$('#sortTitleASC').addClass('sortInactive');
			sortTitleAlphabet(false);

			//Löscht die Rating-Sortierung
			filter.movieRatingSorted = null;
			$('#sortRatingASC').addClass('sortInactive');
			$('#sortRatingDESC').addClass('sortInactive');
		}
	});

	$('#sortRatingASC').on("click", function() {

		if (filter.movieRatingSorted != 'true' && filter.movieTitleSorted == null) {//Rating nicht aufsteigen sortiert und Titelfilter inaktiv
			sortRating(true);
			filter.movieRatingSorted = 'true';
			$('#sortRatingASC').removeClass('sortInactive');
			$('#sortRatingDESC').addClass('sortInactive');
		} else if (filter.movieRatingSorted == 'true' && filter.movieTitleSorted == null) {//Rating aufsteigend sortiert und Titelfilter inaktiv
			removeSort();
			filter.movieRatingSorted = null;
			$('#sortRatingASC').addClass('sortInactive');
		} else if (filter.movieRatingSorted != 'true' && filter.movieTitleSorted != null) {//Rating nicht aufsteigen sortiert und Titelfilter aktiv
			filter.movieRatingSorted = 'true';
			$('#sortRatingASC').removeClass('sortInactive');
			$('#sortRatingDESC').addClass('sortInactive');
			sortRating(true);

			//Löscht die Titel-Sortierung
			filter.movieTitleSorted = null;
			$('#sortTitleASC').addClass('sortInactive');
			$('#sortTitleDESC').addClass('sortInactive');
		}
	});

	$('#sortRatingDESC').on("click", function() {
		if (filter.movieRatingSorted != 'false' && filter.movieTitleSorted == null) {//Rating nicht absteigend sortiert und Titelfilter inaktiv
			sortRating(false);
			filter.movieRatingSorted = 'false';
			$('#sortRatingDESC').removeClass('sortInactive');
			$('#sortRatingASC').addClass('sortInactive');
		} else if (filter.movieRatingSorted == 'false' && filter.movieTitleSorted == null) {//Rating absteigend sortiert und Titelfilter inaktiv
			removeSort();
			filter.movieRatingSorted = null;
			$('#sortRatingDESC').addClass('sortInactive');
		} else if (filter.movieRatingSorted != 'false' && filter.movieTitleSorted != null) {//Rating nicht absteigen sortiert und Titelfilter aktiv
			filter.movieRatingSorted = 'false';
			$('#sortRatingDESC').removeClass('sortInactive');
			$('#sortRatingASC').addClass('sortInactive');
			sortRating(false);

			//Loescht die Titel-Sortierung
			filter.movieTitleSorted = null;
			$('#sortTitleASC').addClass('sortInactive');
			$('#sortTitleDESC').addClass('sortInactive');
		}
	});
});

//---------------------------------------------Sortierung
function removeSort() {

	function numsort(a, b) {
		return a - b;
	}

	//Wenn keine Filme eingetragen sind wird nicht sortiert
	if ($('#filmtable').find('tr').length !== 0) {
		//erste Zeile in der Tabelle wird selektiert
		var actRow = $('#list tbody tr:first-child');
		var rows = new Array();
		var counter = 0;

		//von jeder Zeile wird die ID in das Array rows[] geschrieben
		//mit next() wird dann die nächste Zeile selektiert
		//wenn die selektierte Zeile leere ist wird die Schleife abgebrochen
		while (actRow.length != 0) {
			var segments = actRow.attr('id').split('-');
			rows[counter] = segments[1];
			actRow = actRow.next();
			counter++;
		}

		//sortiert das Array nach den IDs
		rows.sort(numsort);

		//Aufbau der sortierten Tabelle
		//erste Zeile in den Tabellen-Bauch haengen
		actRow = '#tr-' + rows[0];

		$(actRow).appendTo($('#list tbody'));
		var prevRow = actRow;

		//nun die restlichen Zeilen anhängen
		for (var i = 1; i < rows.length; i++) {
			actRow = '#tr-' + rows[i];

			$(actRow).insertAfter($(prevRow));

			//Am Ende wird actRow in prevRow gespeichert, damit die naechste Zeile an diese gehaengt werden kann
			prevRow = actRow;
		};
	}
}

function sortTitleAlphabet(direction) {
	//Wenn keine Filme eingetragen sind wird nicht sortiert
	if ($('#filmtable').find('tr').length !== 0) {
		//erste Zeile in der Tabelle wird selektiert
		var actRow = $('#list tbody tr:first-child');
		var titles = new Array();
		var counter = 0;

		//von jeder Zeile wird der Titel und die ID in das Array rows[] geschrieben
		//mit next() wird dann die naechste Zeile selektiert
		//wenn die selektierte Zeile leere ist wird die Schleife abgebrochen
		while (actRow.length != 0) {
			titles[counter] = actRow.find('.tableFilmTitle').text() + "-" + actRow.attr('id');
			actRow = actRow.next();
			counter++;
		}

		//sortiert das Array nach den Titeln
		titles.sort();

		//falls von Z nach A sortiert werden soll ist direction false
		//mit reverse() wird das Array umgekehrt
		if (direction == false) {
			titles.reverse();
		}

		//Aufbau der sortierten Tabelle
		//erste Zeile in den Tabellen-Bauch haengen
		var segments = titles[0].split('-tr-');
		actRow = '#tr-' + segments[1];

		$(actRow).appendTo($('#list tbody'));
		var prevRow = actRow;

		//nun die restlichen Zeilen anhaengen
		for (var i = 1; i < titles.length; i++) {
			var segments = titles[i].split('-tr-');
			actRow = '#tr-' + segments[1];

			$(actRow).insertAfter($(prevRow));

			//Am Ende wird actRow in prevRow gespeichert, damit die naechste Zeile an diese gehaengt werden kann
			prevRow = actRow;
		};
	}
}

function topTenMovies() {
	//Wenn keine Filme eingetragen sind wird nicht sortiert
	if ($('#filmtable').find('tr').length !== 0) {
		//erste Zeile in der Tabelle wird selektiert
		var actRow = $('#list tbody tr:first-child');
		var rating = new Array();
		var counter = 0;

		//von jeder Zeile wird das Rating und die ID in das Array rows[] geschrieben
		//mit next() wird dann die naechste Zeile selektiert
		//wenn die selektierte Zeile leere ist wird die Schleife abgebrochen
		while (actRow.length != 0) {
			rating[counter] = actRow.find('.tableRating .stars').data('rated') + "-" + actRow.attr('id');
			actRow = actRow.next();
			counter++;
		}

		//sortiert das Array nach dem Rating
		rating.sort();
		rating.reverse();

		//Aufbau der sortierten Tabelle
		//erste Zeile in den Tabellen-Bauch hängen
		var segments = rating[0].split('-tr-');
		actRow = '#tr-' + segments[1];

		$(actRow).appendTo($('#list tbody'));
		var prevRow = actRow;

		//nun die restlichen Zeilen anhängen
		for (var i = 1; i < rating.length; i++) {
			var segments = rating[i].split('-tr-');
			actRow = '#tr-' + segments[1];

			$(actRow).insertAfter($(prevRow));

			if(i > 10){
				$(actRow).hide();	
			}

			//Am Ende wird actRow in prevRow gespeichert, damit die naechste Zeile an diese gehaengt werden kann
			prevRow = actRow;
		};
	}
}

function sortRating(direction) {
	//Wenn keine Filme eingetragen sind wird nicht sortiert
	if ($('#filmtable').find('tr').length !== 0) {
		//erste Zeile in der Tabelle wird selektiert
		var actRow = $('#list tbody tr:first-child');
		var rating = new Array();
		var counter = 0;

		//von jeder Zeile wird das Rating und die ID in das Array rows[] geschrieben
		//mit next() wird dann die naechste Zeile selektiert
		//wenn die selektierte Zeile leere ist wird die Schleife abgebrochen
		while (actRow.length != 0) {
			rating[counter] = actRow.find('.tableRating .stars').data('rated') + "-" + actRow.attr('id');
			actRow = actRow.next();
			counter++;
		}

		//sortiert das Array nach dem Rating
		rating.sort();

		//falls von 5 zu 0 Sternen sortiert werden soll ist direction false
		//mit reverse() wird das Array umgekehrt
		if (direction == false) {
			rating.reverse();
		}

		//Aufbau der sortierten Tabelle
		//erste Zeile in den Tabellen-Bauch hängen
		var segments = rating[0].split('-tr-');
		actRow = '#tr-' + segments[1];

		$(actRow).appendTo($('#list tbody'));
		var prevRow = actRow;

		//nun die restlichen Zeilen anhängen
		for (var i = 1; i < rating.length; i++) {
			var segments = rating[i].split('-tr-');
			actRow = '#tr-' + segments[1];

			$(actRow).insertAfter($(prevRow));

			//Am Ende wird actRow in prevRow gespeichert, damit die naechste Zeile an diese gehaengt werden kann
			prevRow = actRow;
		};
	}
}