var selectedRowId;
var ratingIconOn = 'glyphicon-star';
var ratingIconOff = 'glyphicon-star-empty';
var switchButtonSeen = "-11px";
var switchButtonUnseen = "15px";
var starRatingHTML = '<div class="stars"> <span class="glyphicon ' + ratingIconOff + '" title="schlecht"></span><span class="glyphicon ' + ratingIconOff + '" title="geht so"></span><span class="glyphicon ' + ratingIconOff + '" title="in Ordnung"></span><span class="glyphicon ' + ratingIconOff + '" title="gut"></span><span class="glyphicon ' + ratingIconOff + '" title="grandios"></span></div>';
var addMovieToList = _.template('<tr id="<%- rowID %>"><td class="tableFilmTitle"><%- movieTitle %></td>' + '<td class="tableMovieSeen"><%- movieSeen %></td>' + '<td class="tableRating"><%= rating %></td>' + '<td><button class="btn btn-sm edit loggedIn"title="Edit"><span class="glyphicon glyphicon-pencil"></span></button></td>' + '<td><button class="btn btn-sm delete loggedIn" title="Delete"><span class="glyphicon glyphicon-trash"></span></button></td></tr>');
var detailedMovieView = _.template('<div class="container"><h3><%- movieTitle %><button type="button" id="closeDetailedView" class="close" aria-hidden="true"> &times;</button></h3><div class="row"><div class="col-xs-7"><label>Gesehen: </label><span><%- movieSeen %></span><br><label>Bewertung: </label><span><%= rating %></span><br><label>Release: </label><span><%- release %></span><br><label>Dauer: </label><span><%- runtime %></span><br><label>Genre: </label><span><%- genre %></span><br><label>Director: </label><span><%- director %></span><br><label>Schauspieler: </label><span><%- actors %></span></div><div class="col-xs-5"><img src="<%- picture %>" class="img-thumbnail"/></div></div></div>');

sessionStorage.setItem("user", "");

$(document).ready(function() {
	$('#loginButton').on('click', function() {
		/* wenn der loginButton geklickt wurde, wurde das DropDown Menue noch nicht gerendert, daher wird ein Timeout gemacht,  
		 * dass den Fokus nach 100ms auf das Benutzername-Feld setzt. Nach 100ms ist damit zu rechnen, dass das DropDown Menue 
		 * angezeigt wird 
		 */
		setTimeout('$("#usernameInput").focus()', 100);
	});
	
	/* Setze Focus auf Film Titel Input, wenn Modal geäffnet wird */
	$('#createFilmModal').on('focus', function() {
		filmTitle.focus();
	});

	/* Setze Focus auf Film Titel Input, wenn Modal geoeffnet wird */
	$('#editFilmModal').on('focus', function() {
		filmTitleEdit.focus();
	});

	/*Speichere-Button auf Modal 'createFilmModal'*/
	$('#saveFilm').on('click', createMovie);

	/* reagiere auf 'Enter' im FilmTitel und speichere neuen Film in Tabelle */
	$('#filmTitle').bind('keypress', createMovie);

	/* Modal öffnen, um neuen Film hinzuzufügen */
	$('#add').on('click', function() {
		// setze Rating am Anfang immer auf leer
		$('#createFilmModal').find('.stars').children('span').removeClass(ratingIconOn).addClass(ratingIconOff);

		// setze GESEHEN / NICHT GESEHEN am Anfang auf NICH GESEHEN
		if ($('#createFilmModal').find('.switch-wrapper').find('.on').text() === "GESEHEN") {
			setModalSwitchButton.call($('#createFilmModal').find('.switch-wrapper'), 'NICHT GESEHEN');
		}

		setListenerForSeenSwitch('#createFilmModal');
		setRatingVisibility.call($('#createFilmModal').find('.rating'), '0');
		$('#createFilmModal').modal('show');
	});

	/*Aendere-Button auf Modal 'editFilmModal'*/
	$('#changeMovie').on('click', changeMovieValues);

	/* aendere bestehenden Film bei 'Enter' */
	$('#filmTitleEdit').bind('keypress', changeMovieValues);

	/*Editierbutton in Filmeintrag*/
	$('#list').on('click', '.edit', function() {
		var title = $(this).parent().parent().find('.tableFilmTitle').text();
		var movieSeen = $(this).parent().parent().find('.tableMovieSeen').text();
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

	/*L�sche-Button in Filmeintrag*/
	$('#list').on('click', '.delete', function() {
		$(this).popover();
	});

	/*--------------------------------Detailansicht fuer Film ------------------------------------------------------------------------------------------------*/
	$('#list').on('dblclick', 'tr', function() {
		// Damit keine Detailansicht bei Klick auf den Header erscheint
		if ($(this).attr('id') == 'tr-0') {
			return false;
		}

		buildDetailView($(this).find('.stars').find('.' + ratingIconOn).length, $(this).find('.tableFilmTitle').text(), $(this).find('.tableMovieSeen').text());

	});

	$('#detailedView').on('click', '#closeDetailedView', function(event) {
		event.preventDefault();
		$('#detailedView').hide('slow');
		$('#detailedView').empty();
		$('#home').show('slow');
	});

	/*-----LOGIN--------*/
	// TODO wofür ist das?
	if (sessionStorage.getItem("user") != "") {
		$('#loginButton').parent().html('<button class="btn btn-default btn-lg" id="logoutButton"><span class="glyphicon glyphicon-remove-circle"></span> Logout</button>');
	}

	$('#submitLoginButton').on('click', function(event) {
		// TODO aufräumen, vereinfachen
		event.preventDefault();
		var userName = $('#usernameInput').val();
		var password = $('#passwordInput').val();
		var parent = $('#loginButton').parent();
		login_ajax(userName, password).done(function(value) {
			if (value == "") {
				$('#passwordInput').parent().addClass("has-error");
				$('#usernameInput').parent().addClass("has-error");
			} else if (value == "muser") {
				$('#usernameInput').parent().removeClass("has-error");
				$('#usernameInput').parent().addClass("has-error");
			} else if (value == "mpw") {
				$('#passwordInput').parent().addClass("has-error");
				$('#usernameInput').parent().removeClass("has-error");
			} else {
				$('#usernameInput').parent().removeClass("has-error");
				$('#passwordInput').parent().removeClass("has-error");
				parent.empty();
				parent.append(value);
				$('#submitLoginButton').parent().parent().parent().parent().removeClass("open");
				$('#logoutButton').on('click', function() {
					var parent = $('#logoutButton').parent();
					logout_ajax().done(function(value) {
						parent.empty();
						parent.append(value);
						sessionStorage.setItem("user", "");

						isLoggedInOrNot();

					});
				});
				$('#passwordInput').val("");
				$('#usernameInput').val("");

				//SET SESSION
				sessionStorage.setItem("user", userName);

				isLoggedInOrNot();
			}
		});
	});

	// TODO Wofür ist das gut?
	// $('#logoutButton').on('click', function() {
	// var parent = $('#logoutButton').parent();
	// logout_ajax().done(function(value) {
	// parent.empty();
	// parent.append(value);
	// sessionStorage.setItem("user", "");
	// });
	// });
});

/* unterscheiden zwischen Enter-Event und Speichern-Button-Event. Zusätzlich Anzahl selektierter Sterne fuer Rating herausfinden*/
function createMovie(event) {
	switch(event.type) {
		case ('click'):
			addNewTableLine($(this).parent().parent().find('.stars').find('.' + ratingIconOn).length);
			break;
		case ('keypress'):
			if (event.keyCode === 13) {
				addNewTableLine($(this).parent().find('.stars').find('.' + ratingIconOn).length);
			}
			break;
		default:
			break;
	}
}

/* Der Filmliste wird ein neuer Eintrag hinzugefuegt*/
function addNewTableLine(numberOfStars) {
	/*---------------------------------ID Ermitteln---------------------------------------------------------------------------------------------------------*/
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
	/*--------------------------------Tabelleneintrag hinzufuegen---------------------------------------------------------------------------------------------*/
	if ("NICHT GESEHEN" === $('#createFilmModal').find('.on').text()) {
		numberOfStars = 0;
	}
	
	$('#filmtable').append(addMovieToList({
		rowID : newID,
		movieTitle : $('#filmTitle').val(),
		movieSeen : $('#createFilmModal').find('.on').text(),
		rating : setRating(numberOfStars)
	}));

	/*------------------------Initialisiere PopOver fuer Delete-Button--------------------------------------------------------------------------------*/
	var popoverContent = 'Wollen Sie den Film ' + $('#filmTitle').val() + ' wirklich löschen?<br><button type="button" class="btn btn-primary btn-danger"' + 'onclick="removeMovie($(this))">Ja</button><button type="button" class="btn btn-default" data-dismiss="popover">Nein</button>';
	$('#' + newID).find('.delete').popover({
		trigger : 'focus',
		title : 'Löschen',
		content : popoverContent,
		html : 'true'
	});

	$('#film').val("");
	$('#filmTitle').val("");
	$('#movieSeen').val("");
	$('#createFilmModal').modal('hide');
}

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

function changeTableRowValues(numberOfStars) {
	$('#filmtable').find('#' + selectedRowId).find('.tableFilmTitle').text($('#filmTitleEdit').val());
	$('#filmtable').find('#' + selectedRowId).find('.tableMovieSeen').text($(this).find('.on').text());

	// wurde ein Film als 'GESEHEN' markiert, erhält er die Anzahl an Sternen, mit denen er bewertet wurde. Ansonsten sind alle Sterne leer
	if ($(this).find('.on').text() === "GESEHEN") {
		$('#filmtable').find('#' + selectedRowId).find('.tableRating').html(setRating(numberOfStars));
	} else {
		$('#filmtable').find('#' + selectedRowId).find('.tableRating').html(starRatingHTML);
	}

	$('#film').val("");
	$('#filmTitleEdit').val("");
	$('#movieSeenEdit').val("");
	$('#editFilmModal').modal('hide');
}

function removeMovie(element) {
	$(element).parent().parent().parent().parent().remove();
}

function login_ajax(n, p) {
	return $.ajax({
		type : "POST",
		url : "ajax/login.php",
		data : {
			username : n,
			password : p
		},
	});
}

function logout_ajax() {
	return $.ajax({
		type : "POST",
		url : "ajax/logout.php",
	});
}

function isLoggedInOrNot() {
	$('#add').fadeToggle('1000', function() {
		$('#add').toggleClass('loggedOut loggedIn');
	});
	toggleClassOnAllElements('.edit');
	toggleClassOnAllElements('.delete');
}

function toggleClassOnAllElements(element) {
	$(element).each(function() {
		$(this).fadeToggle('1000', function() {
			$(this).toggleClass('loggedOut loggedIn');
		});
	});
}

/* Detailansicht wird aufgebaut. Dafuer werden Daten von der OMDB Database als JSON geholt */
function buildDetailView(numberOfStars, movieTitle, movieSeen) {
	// alternative Quelle könnte "http://mymovieapi.com/?title=" sein
	$.getJSON("http://www.omdbapi.com/?t=" + movieTitle.replace(" ", "+")).done(function(data) {
		if (data.Response == "False") {
			// TODO Fehlermeldung machen
			alert('Fehler');
		} else {// data.Response == "True"
			var poster;
			if (data.Poster === "N/A") {
				poster = './img/noposter.png';
			} else {
				poster = data.Poster;
			}
			$('#detailedView').html(detailedMovieView({
				movieTitle : movieTitle,
				movieSeen : movieSeen,
				rating : setRating(numberOfStars),
				picture : poster,
				release : data.Released,
				runtime : data.Runtime,
				genre : data.Genre,
				director : data.Director,
				actors : data.Actors
			}));

			$('#detailedView').show("slow");
			$('#home').hide('slow');
		}
	});
}

/* Die Film Bewertung wird durch 'mouseover' über oder 'click' auf Sterne festgelegt. Damit das funtkioniert gibt es diese Methode */
function fillTableStar(event) {
	// klickt ein User auf die Bewertung, wird das Event bei 'mouseover' entfernt und die Bewertung lässt sich nur per 'click' öndern
	if (event.type === 'click') {
		$(this).parent().off('mouseover', 'span');
	}

	// fuellen des Sterns, ueber dem der Mauszeiger ist
	toggleRatingClasses(this, true);

	// fuellt die vorhergehenden Sterne aus
	//console.log($(this).prevAll().length);
	$(this).prevAll().each(function() {
		toggleRatingClasses(this, true);
	});

	// entfernt ausgefuellte Sterne in nachvolgenden Elementen
	$(this).nextAll().each(function() {
		toggleRatingClasses(this, false);
	});
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
function setRating(selectedStars) {
	var starFull = '<span class="glyphicon ' + ratingIconOn + '"></span>';
	var starEmpty = '<span class="glyphicon ' + ratingIconOff + '"></span>';
	var result = "";

	for (var i = 1; i <= 5; i++) {
		if (i <= selectedStars) {
			result += starFull;
		} else {
			result += starEmpty;
		}
	}

	return '<div class="stars">' + result + '</div>';
}

/* einstellen, dass SwitchButton bei Druck auf Schalter oder auch Text reagiert*/
function setListenerForSeenSwitch(modal) {
	$(modal).find('.switch-button-label').on('click', function() {
		if (!$(this).hasClass('on')) {
			animateSwitchButton.apply(this);
		}
	});
	$(modal).find('.switch-button-background').on('click', animateSwitchButton);
}

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

/* stellt ein, welches SwitchButton-Label aktiv = on bzw. inakiv = off ist */
function setSwitchButtonLabelStyle(numberOfSelectedStars) {
	var on = $(this).parent().find('.on');
	var off = $(this).parent().find('.off');

	$(on).toggleClass('off on');
	$(off).toggleClass('off on');
}

/* bestimmt, ob Rating sichtbar oder unsichtbar ist, wenn Modal angezeigt wird. Rating wird nur angezeigt, wenn SwitchButton auf 'GESEHEN' steht */
function setRatingVisibility(numberOfSelectedStars) {
	$(this).find('.stars').remove('div');

	if ($(this).parent().find('.switch-wrapper').find('.on').text() === "GESEHEN") {
		// rating hinzufuegen und anzeigen, da SwitchButton auf 'GESEHEN' steht
		$(this).append($(setRating(numberOfSelectedStars)).on('mouseover', 'span', fillTableStar).on('click', 'span', fillTableStar)).show();
	} else {
		// rating zwar hinzufuegen, aber nicht anzeigen
		$(this).append($(setRating(numberOfSelectedStars)).on('mouseover', 'span', fillTableStar).on('click', 'span', fillTableStar)).hide();
	}
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

