var selectedRowId;
sessionStorage.setItem("user", "");

var addMovieToList = _.template('<tr id="<%- rowID %>"><td class="tableFilmTitle"><%- movieTitle %></td>' + '<td class="tableMovieSeen"><%- movieSeen %></td>' + '<td class="tableRating" title="0"><%- rating %></td>' + '<td><button class="btn btn-sm edit loggedIn" title="Edit"><span class="glyphicon glyphicon-pencil"></span></button></td>' + '<td><button class="btn btn-sm delete loggedIn" title="Delete"><span class="glyphicon glyphicon-trash"></span></button></td></tr>');

var detailedMovieView = _.template('<div class="container"><h3><%- movieTitle %><button type="button" id="closeDetailedView" class="close" aria-hidden="true"> &times;</button></h3><div class="row"><div class="col-xs-7"><label>Gesehen: </label><span><%- movieSeen %></span><br><label>Bewertung: </label><span><%- rating %></span><br><label>Release: </label><span><%- release %></span><br><label>Dauer: </label><span><%- runtime %></span><br><label>Genre: </label><span><%- genre %></span><br><label>Director: </label><span><%- director %></span><br><label>Schauspieler: </label><span><%- actors %></span></div><div class="col-xs-5"><img src="<%- picture %>" class="img-thumbnail"/></div></div></div>');

$(document).ready(function() {
	/* Setze Focus auf Film Titel Input, wenn Modal geäffnet wird */
	$('#createFilmModal').on('focus', function() {
		filmTitle.focus();
	});

	/* Setze Focus auf Film Titel Input, wenn Modal geäffnet wird */
	$('#editFilmModal').on('focus', function() {
		filmTitleEdit.focus();
	});

	/*Speichere-Button auf Modal 'createFilmModal'*/
	$('#saveFilm').on("click", createMovie);

	/* reagiere auf 'Enter' im FilmTitel und speichere neuen Film in Tabelle */
	$('#filmTitle').bind('keypress', function(event) {
		var key = event.keyCode;

		if (key == 13) {
			createMovie();
		}
	});

	/*�ndere-Button auf Modal 'editFilmModal'*/
	$('#changeMovie').on("click", changeMovieValues);

	/* ändere bestehenden Film bei 'Enter' */
	$('#filmTitleEdit').bind('keypress', function(event) {
		var key = event.keyCode;

		if (key == 13) {
			changeMovieValues();
		}
	});

	/*Editierbutton in Filmeintrag*/
	$('#list').on('click', '.edit', function() {
		var title = $(this).parent().parent().find('.tableFilmTitle').text();
		var movieSeen = $(this).parent().parent().find('.tableMovieSeen').text();
		selectedRowId = $(this).parent().parent().attr('id');

		$('#editFilmModal').modal('show');
		$('#filmTitleEdit').val(title);
		$('#movieSeenEdit').val(movieSeen);

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

		buildDetailView($(this).find('.tableFilmTitle').text());

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
	// debugger;
	// parent.empty();
	// parent.append(value);
	// sessionStorage.setItem("user", "");
	// });
	// });
});

function createMovie() {
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
		//ID f�r die neue Zeile zusammensetzen
	}
	/*--------------------------------Tabelleneintrag hinzufuegen---------------------------------------------------------------------------------------------*/
	$('#filmtable').append(addMovieToList({
		rowID : newID,
		movieTitle : $('#filmTitle').val(),
		movieSeen : $('#movieSeen').val(),
		rating : 'super'
	}));

	$('.masterTable').css('visibility', 'visible'); //Edit- und Delete-Button sichtbar machen
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

function changeMovieValues() {
	$('#filmtable').find('#' + selectedRowId).find('.tableFilmTitle').text($('#filmTitleEdit').val());
	$('#filmtable').find('#' + selectedRowId).find('.tableMovieSeen').text($('#movieSeenEdit').val());
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
function buildDetailView(movieTitle) {
	// alternative Quelle könnte "http://mymovieapi.com/?title=" sein
	$.getJSON("http://www.omdbapi.com/?t=" + movieTitle.replace(" ", "+")).done(function(data) {
		if(data.Response == "False") {
			// TODO Fehlermeldung machen
			alert('Fehler');
		} else { // data.Response == "True"	
			$('#detailedView').html(detailedMovieView({
				movieTitle : movieTitle,
				movieSeen : "No",
				rating : 0,
				picture : data.Poster,
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
