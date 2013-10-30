$(document).ready(function() {
	$('#filterButton').popover({
		trigger : 'click',
		title : 'Filter',
		content : popoverFilterContent,
		html : 'true',
		placement : 'bottom'
	});

	$('#filterButton').on("click", function() {
		$(this).popover();
		$('#filterBox').find('#movieTitle').val(filter.movieTitle);

		if (filter.movieSeen == 'gesehen') {
			$('#filterBox #movieWatched').parent().attr('class', 'btn btn-primary active');
			$('#filterBox #movieNotWatched').parent().attr('class', 'btn btn-primary');

		} else if (filter.movieSeen == 'nicht gesehen') {
			$('#filterBox #movieWatched').parent().attr('class', 'btn btn-primary');
			$('#filterBox #movieNotWatched').parent().attr('class', 'btn btn-primary active');
		} else if (filter.movieSeen == null) {
			$('#filterBox #movieWatched').parent().attr('class', 'btn btn-primary');
			$('#filterBox #movieNotWatched').parent().attr('class', 'btn btn-primary');
		}

		for (var i = 1; i <= 5; i++) {
			if (i <= filter.movieRating) {
				$('#filterStar-' + i).removeClass('glyphicon-star-empty');
				$('#filterStar-' + i).addClass('glyphicon-star');
			} else {
				$('#filterStar-' + i).addClass('glyphicon-star-empty');
				$('#filterStar-' + i).removeClass('glyphicon-star');
			}
		}
	});
});

/*------------------------------ Filter --------------------------------*/
function fillStars(starid) {
	if (starid != null) {
		var id = starid.split('-');

		for (var i = 1; i <= 5; i++) {
			if (i <= id[1]) {
				$('#filterStar-' + i).removeClass('glyphicon-star-empty');
				$('#filterStar-' + i).addClass('glyphicon-star');
			} else {
				$('#filterStar-' + i).addClass('glyphicon-star-empty');
				$('#filterStar-' + i).removeClass('glyphicon-star');
			}
		}
	} else {
		if (filter.movieRating == null) {
			$('#filterStars').find('span[id*="filterStar-"]').addClass('glyphicon-star-empty');
			$('#filterStars').find('span[id*="filterStar-"]').removeClass('glyphicon-star');
		} else {
			for (var i = 1; i <= 5; i++) {
				if (i <= filter.movieRating) {
					$('#filterStar-' + i).removeClass('glyphicon-star-empty');
					$('#filterStar-' + i).addClass('glyphicon-star');
				} else {
					$('#filterStar-' + i).addClass('glyphicon-star-empty');
					$('#filterStar-' + i).removeClass('glyphicon-star');
				}
			}
		}
	}

	$('#filterStars').find('span[id*="filterStar-"]').attr('onmouseout', 'fillStars(null)');
}

// Setzt den zu Filternden im Filter-Objekt und starten dann das Filtern
function movieTitleFilterKeyUp() {
	setTimeout(function() {
		filter.movieTitle = $('#filterBox #movieTitle').val().toLowerCase();

		filterTable();
	}, 1000);
}

function setFilterRating(starid) {
	var id = starid.split('-');
	filter.movieRating = id[1];

	if (filter.movieSeen == 'nicht gesehen') {
		removeWatchFilter();
	}

	filterTable();
}

function filterWatchStatusSet(seen) {
	if (seen == true) {
		filter.movieSeen = "gesehen";
	} else if (seen == false) {
		filter.movieSeen = "nicht gesehen";
		removeRatingFilter();
	} else {
		filter.movieSeen = null;
	}

	filterTable();
}

//filtert die Tabelle
function filterTable() {
	$('tr[id*="tr-"]').show();

	if (filter.movieRating == null && filter.movieSeen == null && filter.movieTitle == null) {

	} else {
		var actRow = $('#list tbody tr:first-child');
		while (actRow.length != 0) {
			if (filterRow(actRow)) {
				actRow.hide();
			}
			actRow = actRow.next();
		}
	}
}

//überprüft ob die übergebene Zeile einem Filterkriterium entspricht.
function filterRow(actRow) {
	if (filter.movieRating != null) {
		if ($(actRow).find('.tableRating .stars').data('rated') != filter.movieRating) {
			return true;
		}
	}
	if (filter.movieSeen != null) {
		if ($(actRow).find('.tableMovieSeen').text() != filter.movieSeen) {
			return true;
		}
	}
	if (filter.movieTitle != null && filter.movieTitle != "" && $.trim(filter.movieTitle) != "") {
		if ($(actRow).find('.tableFilmTitle').text().toLowerCase().search(filter.movieTitle) == -1) {
			return true;
		}
	}

	return false;
}

/* leere alle Sterne im Filter wieder, wenn nicht durch Klicken ein Wert gesetzt wurde */
function removeRatingFilter() {
	// var parentElem = $(this).parent();
	// parentElem.find('.stars').remove('div');
	// parentElem.append(setRating(0, false));
	// parentElem.find('.stars').on('mouseover', 'span', fillTableStar).on('click', 'span', fillTableStar).on('mouseleave', removeRatingFilter);
	$('#filterStars').find('span[id*="filterStar-"]').addClass('glyphicon-star-empty');
	$('#filterStars').find('span[id*="filterStar-"]').removeClass('glyphicon-star');

	filter.movieRating = null;
	filterTable();

}

function removeWatchFilter() {
	$('#movieWatched').parent().attr('class', 'btn btn-primary');
	$('#movieNotWatched').parent().attr('class', 'btn btn-primary');

	filter.movieSeen = null;

	filterTable();
}

function removeTitleFilter() {
	$('#filterBox').find('#movieTitle').val(null);

	filter.movieTitle = null;

	filterTable();
}

function removeAllFilters() {

	//TODO Performance technisch sehr unglücklich -> in jeder remove-Methode wird filterTable() aufgerufen.
	//nach aktuellem Stand würde die Tabelle also 4 Mal gefiltert werden!!!!
	removeWatchFilter();
	removeTitleFilter();
	removeRatingFilter();

	filterTable();
}
