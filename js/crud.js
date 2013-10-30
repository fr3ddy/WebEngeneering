$(document).ready(function() {
	parse_initialLoadMovieTable();

	/* Setze Focus auf Film Titel Input, wenn Modal geoeffnet wird */
	$("#createFilmModal").on('focus', function() {
		$('#filmTitle').focus();
	});

	/*Speicher-Button von Modal 'createFilmModal'*/
	$('#saveFilm').on('click', createMovie);

	/* reagiere auf 'Enter' im FilmTitel und speichere neuen Film in Tabelle zu 'createFilmModal' */
	$('#filmTitle').bind('keypress', createMovie);

	/* Modal öffnen, um neuen Film hinzuzufügen 'createFilmModal'*/
	$('#add').on('click', function() {
		//Falls Auswahl abgebrochen wurde
		$('#createFilmModal').find('#saveFilm').show();
		$('#createFilmModal').find('.modal-body .form-group').show();
		$('#createFilmModal').find('#chooseTable').hide();

		// leere Film Input Feld, falls noch etwas drin stehen sollte
		$('#filmTitle').val("");

		// setze Rating am Anfang immer auf leer
		$('#createFilmModal').find('.stars').children('span').removeClass(ratingIconOn).addClass(ratingIconOff);

		// setze GESEHEN / NICHT GESEHEN am Anfang auf NICHT GESEHEN
		if ($('#createFilmModal').find('.switch-wrapper').find('.on').text() === "GESEHEN") {
			setModalSwitchButton.call($('#createFilmModal').find('.switch-wrapper'), 'NICHT GESEHEN');
		}

		setListenerForSeenSwitch('#createFilmModal');
		setRatingVisibility.call($('#createFilmModal').find('.rating'), '0');
		$('#createFilmModal').modal('show');
	});

	/*Aendere-Button auf Modal 'editFilmModal'*/
	$('#changeMovie').on('click', changeMovieValues);

	/* aendere bestehenden Film bei 'Enter' 'editFilmModal' */
	$('#filmTitleEdit').bind('keypress', changeMovieValues);

	/*Aufbau Modal um den Film zu editieren*/
	$('#list').on('click', '.edit', function() {
		var title = $(this).parent().parent().find('.tableFilmTitle').text();
		var movieSeen = $(this).parent().parent().find('.tableMovieSeen').text().toUpperCase();
		var rating = $(this).parent().parent().find('.tableRating').find('.' + ratingIconOn).length;

		selectedRowId = $(this).parent().parent().attr('id');

		$('#filmTitleEdit').val(title);
		$('#movieSeenEdit').val(movieSeen);

		if ($('#editFilmModal').find('.switch-wrapper').find('.on').text() !== movieSeen) {
			setModalSwitchButton.call($('#editFilmModal').find('.switch-wrapper'), movieSeen);
		}

		setListenerForSeenSwitch('#editFilmModal');
		setRatingVisibility.call($('#editFilmModal').find('.rating'), $(this).parent().parent().find('.stars').find('.' + ratingIconOn).length);
		$('#editFilmModal').modal('show');
	});

	/*Loesche-Button in Filmeintrag*/
	$('#list').on('click', '.delete', function() {
		$(this).popover();
	});
});
/* unterscheiden zwischen Enter-Event und Speichern-Button-Event. Zusätzlich Anzahl selektierter Sterne fuer Rating herausfinden*/
function createMovie(event) {
	switch(event.type) {
		case ('click'):
			searchMovie($(this).parent().parent().find('.stars').find('.' + ratingIconOn).length, $('#filmTitle').val());
			break;
		case ('keypress'):
			if (event.keyCode === 13) {
				searchMovie($(this).parent().find('.stars').find('.' + ratingIconOn).length, $('#filmTitle').val());
			}
			break;
		default:
			break;
	}
}

function searchMovie(numberOfStars, movieTitle) {
	$.ajax({
		url : "http://www.omdbapi.com/?s=" + movieTitle.replace(" ", "+"),
		dataType : 'json',
	}).done(function(data) {
		if ( typeof (data.Response) == 'undefined') {
			var elementsFound = $.map(data.Search, function(value, key) {
				if (value.Type != 'game') {
					return value;
				}
			});

			if (elementsFound.length > 1) {
				buildChooseTable(elementsFound, numberOfStars);
			} else if (elementsFound == 1) {
				addNewTableLine(numberOfStars, movieTitle, elementsFound.imdbID);
			} else {
				$('#createFilmModal').modal('hide');
				//TODO Fehlermeldung weil Film nicht gefunden
			}
		} else {
			$('#createFilmModal').modal('hide');
			//TODO Fehlermeldung weil Film nicht gefunden
		}
	});
}

// Wenn mehre Filme gefunden erscheint Modal mit Liste der gefunden Filme
function buildChooseTable(foundMovies, numberOfStars) {
	$('#createFilmModal').find('.modal-body .form-group').hide();
	$('#createFilmModal').find('#saveFilm').hide();
	$('#createFilmModal').find('#chooseTable').show();
	$('#createFilmModal').find('#chooseTable tbody').empty();

	for (var i = 0; i < foundMovies.length; i++) {
		$('<tr data-imdbID="' + foundMovies[i].imdbID + '"><td>' + foundMovies[i].Title + '</td><td>' + foundMovies[i].Year + '</td><td>' + foundMovies[i].Type + '</td>' + '<td><button type="button" class="btn btn-primary select">Auswahl</button></td></tr>').appendTo('#createFilmModal .modal-body tbody');
	};

	$('tbody .select').on('click', function() {
		var imdbID = $(this).parent().parent().attr('data-imdbID');
		if (checkForDuplicate(imdbID)) {
			addNewTableLine(numberOfStars, $(this).parent().parent().find('td:first-child').text(), imdbID);

			$('#createFilmModal').find('#saveFilm').show();
			$('#createFilmModal').find('.modal-body .form-group').show();
			$('#createFilmModal').find('#chooseTable').hide();
		} else {
			alert("Film schon vorhanden");
		}
	});
}

/* Der Filmliste wird ein neuer Eintrag hinzugefuegt*/
function addNewTableLine(numberOfStars, movieTitle, imdbID) {
	//Je nachdem was die Suche ergibt kann der restlich Teil abgebrochen oder durchgeführt werden
	var filterSetting = {
		movieTitle : filter.movieTitle,
		movieSeen : filter.movieSeen,
		movieTitleSorted : filter.movieTitleSorted
	};

	if (filter.movieTitleSorted != null) {
		removeSort();
	}
	if (filter.movieSeen != null) {
		removeWatchFilter();
	}
	if (filter.movieTitle != null) {
		removeTitleFilter();
	}
	/*ID Ermitteln*/
	var newID = $('#filmtable').find('tr').last().attr('id');
	//von der letzten Zeile in der Tabelle wir die ID gesucht um die neue zu ermitteln

	if ( typeof newID == 'undefined') {
		var newID = 'tr-1';
		//falls noch keine Zeile existiert
	} else {
		var tmpId = newID.split('-');
		//ID der letzten Zeile splitten (ID = "tr-ZAHL")
		tmpId[1] = parseInt(tmpId[1]) + 1;
		//Anzahl der Zeilen steht im 2. Feld, muss von String in Integer geparst werden
		newID = 'tr-' + tmpId[1];
		//ID fuer die neue Zeile zusammensetzen
	}
	/*Tabelleneintrag hinzufuegen*/
	var seen = true;
	if ("NICHT GESEHEN" === $('#createFilmModal').find('.on').text().toUpperCase()) {
		seen = false;
		numberOfStars = 0;
	} else if (mouseoverForRatingOn) {
		/* 'mouseover' Event ist noch an Bewertung gebunden, daher darf eine Bewertung nicht erfolgen.
		 * Da der Film aber als 'GESEHEN' bewertet wurde, muss er mit min. 1 Stern bewertet werden */
		numberOfStars = 1;
	}

	$('#filmtable').append(addMovieToList({
		imdbID : imdbID,
		rowID : newID,
		movieTitle : movieTitle,
		movieSeen : $('#createFilmModal').find('.on').text().toLowerCase(),
		rating : setRating(numberOfStars, true)
	}));

	/*Initialisiere PopOver fuer Delete-Button*/
	var popoverContent = 'Wollen Sie den Film ' + $('#filmTitle').val() + ' wirklich löschen?<br><button type="button" class="btn btn-primary btn-danger"' + 'onclick="removeMovie($(this))">Löschen</button><button type="button" class="btn btn-default" data-dismiss="popover">Nein</button>';
	$('#' + newID).find('.delete').popover({
		trigger : 'focus',
		title : 'Löschen',
		content : popoverContent,
		html : 'true'
	});

	$('#createFilmModal').modal('hide');
	/* Action Listener für Detail View Lupe */
	$('.detailMagnifier').click('click', function() {
		$(this).css({
			cursor : "progress"
		});
		var clickedTr = $(this).parent().parent();
		buildDetailView.call(this, clickedTr.find('.stars').find('.' + ratingIconOn).length, clickedTr.find('.tableMovieSeen').text().toLowerCase(), clickedTr.attr('data-imdbID'));
	});

	//----------------------Filter wieder setzten und neue Tabelle filtern!
	filter.movieSeen = filterSetting.movieSeen;
	filter.movieTitle = filterSetting.movieTitle;
	filter.movieTitleSorted = filterSetting.movieTitleSorted;

	if (filter.movieTitleSorted != null && filter.movieRatingSorted == null) {
		sortTitleAlphabet(filter.movieTitleSorted);
	} else if (filter.movieTitleSorted == null && filter.movieRatingSorted != null) {
		sortRating(filter.movieRatingSorted);
	}

	if (filter.movieSeen != null) {
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
	}
	if (filter.movieTitle != null) {
		$('#filterBox #movieTitle').val(filter.movieTitle);
	}
	filterTable();
	parse_saveMovie(movieTitle, imdbID, numberOfStars, seen);
}

/* Der Filmliste wird ein neuer Eintrag hinzugefuegt*/
function initiateTableRow(numberOfStars, movieTitle, imdbID, seen) {

	/*ID Ermitteln*/
	var newID = $('#filmtable').find('tr').last().attr('id');
	//von der letzten Zeile in der Tabelle wir die ID gesucht um die neue zu ermitteln

	if ( typeof newID == 'undefined') {
		var newID = 'tr-1';
		//falls noch keine Zeile existiert
	} else {
		var tmpId = newID.split('-');
		//ID der letzten Zeile splitten (ID = "tr-ZAHL")
		tmpId[1] = parseInt(tmpId[1]) + 1;
		//Anzahl der Zeilen steht im 2. Feld, muss von String in Integer geparst werden
		newID = 'tr-' + tmpId[1];
		//ID fuer die neue Zeile zusammensetzen
	}
	
	var seenText;
	if(seen) {
		// Film wurde gesehen
		seenText = "gesehen";	
	} else {
		// Film wurde nicht gesehen
		seenText = "nicht gesehen";
	}
	
	$('#filmtable').append(addMovieToList({
		imdbID : imdbID,
		rowID : newID,
		movieTitle : movieTitle,
		movieSeen : seenText,
		rating : setRating(numberOfStars, true)
	}));

	/*Initialisiere PopOver fuer Delete-Button*/
	var popoverContent = 'Wollen Sie den Film ' + $('#filmTitle').val() + ' wirklich löschen?<br><button type="button" class="btn btn-primary btn-danger"' + 'onclick="removeMovie($(this))">Löschen</button><button type="button" class="btn btn-default" data-dismiss="popover">Nein</button>';
	$('#' + newID).find('.delete').popover({
		trigger : 'focus',
		title : 'Löschen',
		content : popoverContent,
		html : 'true'
	});

	/* Action Listener für Detail View Lupe */
	$('.detailMagnifier').click('click', function() {
		$(this).css({
			cursor : "progress"
		});
		var clickedTr = $(this).parent().parent();
		buildDetailView.call(this, clickedTr.find('.stars').find('.' + ratingIconOn).length, clickedTr.find('.tableMovieSeen').text().toLowerCase(), clickedTr.attr('data-imdbID'));
	});
}

/* Das 'editFilmModal' wird geschlossen und moechte die geanderten Werte in die Tabelle uebertragen werden. Dabei ist zu unterscheiden, wie das Event ausgeloest wurde */
function changeMovieValues(event) {
	switch(event.type) {
		case ('click'):
			changeTableRowValues.call($(this).parent().parent(), $(this).parent().parent().find('.stars').find('.' + ratingIconOn).length);
			break;
		case ('keypress'):
			if (event.keyCode === 13) {
				changeTableRowValues.call($(this).parent(), $(this).parent().find('.stars').find('.' + ratingIconOn).length);
			}
			break;
		default:
			break;
	}
}

/* Die geaenderten Werte aus dem 'editFilmModal' werden in die entsprechende Zeile der Tabelle uebertragen. 'This' entspricht dem <div>, das die Sterne umgibt */
function changeTableRowValues(numberOfStars) {

	$('#filmtable').find('#' + selectedRowId).find('.tableMovieSeen').text($(this).find('.on').text().toLowerCase());

	// wurde ein Film als 'GESEHEN' markiert, erhält er die Anzahl an Sternen, mit denen er bewertet wurde. Ansonsten sind alle Sterne leer
	if ("GESEHEN" === $(this).find('.on').text()) {
		if (mouseoverForRatingOn) {
			/* an die Bewertung ist noch ein 'mouseover' Event gebunden, daher darf die Bewertung nicht geaendert werden und die bestehende Bewertung bleibt bestehen.
			 * Ist die bestehende Bewertung aber 0, dann muss min. 1 Stern gesetzt werden.
			 */
			var numberOfStarsInTable = $('#filmtable').find('#' + selectedRowId).find('.tableRating').find('.' + ratingIconOn).length;
			$('#filmtable').find('#' + selectedRowId).find('.tableRating').html(setRating(numberOfStarsInTable >= 1 ? numberOfStarsInTable : 1, true));
		} else {
			$('#filmtable').find('#' + selectedRowId).find('.tableRating').html(setRating(numberOfStars, true));
		}
	} else {
		$('#filmtable').find('#' + selectedRowId).find('.tableRating').html(setRating(0, true));
	}

	$('#editFilmModal').modal('hide');
}

/* Loescht ausgewaehlte Zeile aus Tabelle*/
function removeMovie(element) {
	$(element).parent().parent().parent().parent().remove();
}

/*------------------------------------- Anfang GESEHEN / NICHT GESEHEN ---------------------------------------------------------------------------------------- */
/* einstellen, dass SwitchButton bei Druck auf Schalter oder auch Text reagiert*/
function setListenerForSeenSwitch(modal) {
	$(modal).find('.switch-button-label').on('click', function() {
		if (!$(this).hasClass('on')) {
			animateSwitchButton.apply(this);
		}
	});
	$(modal).find('.switch-button-background').on('click', animateSwitchButton);
}

/* Animiert den SwitchButton und setzt den Wert, welches Label aktiv/inaktiv dargestellt wird */
function animateSwitchButton() {
	if ($(this).parent().find('.switch-button-button').is(':animated')) {
		// wenn noch eine Animation läuft, dann soll nichts passieren, bis diese fertig ist
		return;
	} else {
		var position = $(this).parent().find('.switch-button-button').css('left');
		setSwitchButtonLabelStyle.apply(this);

		if (position === switchButtonSeen) {
			$(this).parent().find('.switch-button-button').animate({
				left : switchButtonUnseen
			}, 200);

			// blende Rating aus, da kein Film bewertet werden kann den man noch nicht gesehen hat
			$(this).parent().parent().find('.rating').slideUp();
		} else {
			$(this).parent().find('.switch-button-button').animate({
				left : switchButtonSeen
			}, 200);

			// blende Rating ein, da der Nutzer den Film schon gesehen hat
			$(this).parent().parent().find('.rating').slideDown();
		}
	}
}

/* stellt ein, welches SwitchButton-Label aktiv = on oder inakiv = off ist */
function setSwitchButtonLabelStyle(numberOfSelectedStars) {
	var on = $(this).parent().find('.on');
	var off = $(this).parent().find('.off');

	$(on).toggleClass('off on');
	$(off).toggleClass('off on');
}

/* Setze SwitchButton auf Wert 'value' */
function setModalSwitchButton(value) {
	setSwitchButtonLabelStyle.apply($(this).find('.on'));

	switch(value) {
		case "GESEHEN":
			$(this).find('.switch-button-button').css({
				left : switchButtonSeen
			});
			break;
		case "NICHT GESEHEN":
			$(this).find('.switch-button-button').css({
				left : switchButtonUnseen
			});
			break;
		default:
			break;
	}
}

/*------------------------------------- Ende GESEHEN / NICHT GESEHEN ---------------------------------------------------------------------------------------- */

/* ------------------------------------ Anfang Bewertung ---------------------------------------------------------------------------------------------------- */
/* bestimmt, ob Rating sichtbar oder unsichtbar ist, wenn Modal angezeigt wird. Rating wird nur angezeigt, wenn SwitchButton auf 'GESEHEN' steht */
function setRatingVisibility(numberOfSelectedStars) {
	$(this).find('.stars').remove('div');

	// zu beginn ist immer mindestens 1 Stern ausgefuellt
	numberOfSelectedStars = numberOfSelectedStars >= 1 ? numberOfSelectedStars : 1;

	/* Die Bewertung fuer die Filme. Dabei wird auf 'mouseover' Events die Sterne gefuellt. Bei 'click' Events die ausgewaehlten Sterne gespeichet
	 * und bei 'mouseleave' keine Bewertung gespeichert, falls nicht voher ein 'click' Event ausgeloest wurde */
	var starRating = $(setRating(numberOfSelectedStars, false)).on('mouseover', 'span', fillTableStar).on('click', 'span', fillTableStar).on('mouseleave', function() {
		setRatingVisibility.call($(this).parent(), numberOfSelectedStars);
	});

	// Flag fuer ein aktives 'mouseover' Event an Bewertung setzen
	mouseoverForRatingOn = true;

	if ($(this).parent().find('.switch-wrapper').find('.on').text().toUpperCase() === "GESEHEN") {
		// rating hinzufuegen und anzeigen, da SwitchButton auf 'GESEHEN' steht
		$(this).append(starRating).show();
	} else {
		// rating zwar hinzufuegen, aber nicht anzeigen
		$(this).append(starRating).hide();
	}
}

/* Die Film Bewertung wird durch 'click' auf Sterne festgelegt */
function fillTableStar(event) {
	// fuellen des Sterns, ueber dem der Mauszeiger ist
	toggleRatingClasses(this, true);

	// fuellt die vorhergehenden Sterne aus
	$(this).prevAll().each(function() {
		toggleRatingClasses(this, true);
	});

	// entfernt ausgefuellte Sterne in nachfolgenden Elementen
	$(this).nextAll().each(function() {
		toggleRatingClasses(this, false);
	});

	// klickt ein User auf die Bewertung, wird das Event 'mouseover' entfernt und die Bewertung lässt sich nur per 'click' öndern
	if (event.type === 'click') {
		mouseoverForRatingOn = false;
		// entferne 'mouseover' Event, da Bewertung fest steht
		$(this).parent().off('mouseover', 'span');

		// entferne 'mouseleave' Event, da Bewertung fest steht
		$(this).parent().off('mouseleave');

		// setze den Wert wie viele Sterne gesetzt sind ins data Attribut und als data, welche mit dem Feld assoziiert wird
		$(this).parent().attr('data-rated', $(this).parent().find('.' + ratingIconOn).length).data('rated', $(this).parent().find('.' + ratingIconOn).length);
	}
}

/* Legt fest, ob ein Stern beim Mouseover gefüllt oder leer dargestellt wird.
 * Der Parameter 'prev' hat den Wert 'true', wenn das aktuelle Element ein Vorgänger desjenigen Elements ist, über dem der Cursor platziert ist.
 * Ansonsten ist der Wert 'false'. Das aktuelle Element wird im Parameter 'elem' übergeben.
 * */
function toggleRatingClasses(elem, prev) {
	if (prev) {
		$(elem).removeClass(ratingIconOff);
		$(elem).addClass(ratingIconOn);
	} else {
		$(elem).removeClass(ratingIconOn);
		$(elem).addClass(ratingIconOff);
	}
}

/* stellt ein, wie viele Sterne beim Rating in der Tabelle oder Bearbeitungsansicht ausgefuellt sind */
function setRating(selectedStars, forTableOrDetailedView) {
	var starFull = _.template('<span class="glyphicon ' + ratingIconOn + '" title="<%- title %>"></span>');
	var starEmpty = _.template('<span class="glyphicon ' + ratingIconOff + '" title="<%- title %>"></span>');
	var result = "";
	var tooltip = "";
	var tableTooltip = "";

	for (var i = 1; i <= 5; i++) {
		switch(i) {
			case 1:
				tooltip = "schlecht";
				break;
			case 2:
				tooltip = "geht so";
				break;
			case 3:
				tooltip = "in Ordnung";
				break;
			case 4:
				tooltip = "gut";
				break;
			case 5:
				tooltip = "grandios";
				break;
			default:
				tooltip = "";
				break;
		}

		/* setze nur einen Tooltip auf das die Sterne umgebende DIV. In der Tabelle und Detailansicht kann die Bewertung nicht geaendert werden,
		 * daher sind keine Tooltips auf die einzelnen Sterne, sondern nur auf die Gesamtbewertung, also das DIV zu setzen.
		 * Ist keine Bewertung gesetzt, dann setze "nicht bewertet" als Tooltip */
		if (forTableOrDetailedView) {
			if (i <= selectedStars) {
				tableTooltip = tooltip;
			} else if (selectedStars === 0) {
				tableTooltip = "nicht bewertet";
			}
			tooltip = "";
		}

		if (i <= selectedStars) {
			result += starFull({
				title : tooltip
			});
		} else {
			result += starEmpty({
				title : tooltip
			});
		}
	}

	return '<div class="stars" title="' + tableTooltip + '" data-rated="' + selectedStars + '">' + result + '</div>';
}

/*---------------------------------Ende Bewertung -------------------------------------------------------------------------------------------------------*/
/*---------------------------------- Anfang Doppelte Eintraege verhindern -------------------------------------------------------------------------------*/

/* Ueberprueft ob der Film in der Tabelle schon existiert */
var checkForDuplicate = function(imdbID) {
	var discoveredNoDuplicate = true;

	if ($('#filmtable').find('tr').length !== 0) {
		$('#filmtable').find('tr').each(function() {
			if (imdbID === $(this).attr('data-imdbid')) {
				discoveredNoDuplicate = false;
				return false;
			}
		});
	}
	return discoveredNoDuplicate;
};

/*---------------------------------- Ende Doppelte Eintraege verhindern -------------------------------------------------------------------------------*/
