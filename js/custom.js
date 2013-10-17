var selectedRowId;

var addMovieToList = _.template('<tr id="<%- rowID %>"><td class="tableFilmTitle"><%- movieTitle %></td>' + '<td class="tableMovieSeen"><%- movieSeen %></td>' + '<td class="tableRating"><%- rating %></td>' + '<td><button class="btn btn-sm edit" title="Edit"><span class="glyphicon glyphicon-pencil"></span></button></td>' + '<td><button class="btn btn-sm delete" title="Delete"><span class="glyphicon glyphicon-trash"></span></button></td></tr>');

$(document).ready(function() {
	var detailedMovieView = _.template('<div class="container">' 
											+ '<h3><%- movieTitle %>' 
											+'<button type="button" id="closeDetailedView" class="close" aria-hidden="true">&times;</button></h3>'
										+ '<div>' 
											+ '<label>Gesehen: </label><span><%- movieSeen %></span><br>' 
											+ '<label>Bewertung: </label><span><%- rating %></span>' 
										+ '</div>' 
									   + '</div>');

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

	/* reagiere auf 'Enter' im FilmTitel Feld */
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

		$('#detailedView').html(detailedMovieView({
			movieTitle : $(this).find('.tableFilmTitle').text(),
			movieSeen : "kadf	",
			rating : "super"
		}));
		
		$('#detailedView').show("slow");
		$('#home').hide('slow');
	});
	
	$('#detailedView').on('click', '#closeDetailedView', function(event) {
		event.preventDefault();
		$('#detailedView').hide('slow');
		$('#detailedView').empty();
		$('#home').show('slow');
	});

	/*-----LOGIN--------*/
	if (sessionStorage.getItem("user") != "") {
		$('#loginButton').parent().empty().append('<button class="btn btn-default btn-lg" id="logoutButton"><span class="glyphicon glyphicon-remove-circle"></span> Logout</button>');
	}
	$('#submitLoginButton').on('click', function(event) {
		event.preventDefault();
		var n = $('#usernameInput').val();
		var p = $('#passwordInput').val();
		var parent = $('#loginButton').parent();
		login_ajax(n, p).done(function(value) {
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
					});
				});
				$('#passwordInput').val("");
				$('#usernameInput').val("");

				//SET SESSION
				sessionStorage.setItem("user", n);
			}
		});
	});
	$('#logoutButton').on('click', function() {
		var parent = $('#logoutButton').parent();
		logout_ajax().done(function(value) {
			parent.empty();
			parent.append(value);
			sessionStorage.setItem("user", "");
		});
	});
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
		rating : "super"
	}));

	/*------------------------Initialisiere PopOver fuer Delete-Button--------------------------------------------------------------------------------*/
		var popoverContent ='Wollen Sie den Film ' + $('#filmTitle').val() + ' wirklich löschen?<br><button type="button" class="btn btn-primary btn-danger"'+
							'onclick="removeMovie($(this))">Ja</button><button type="button" class="btn btn-default" data-dismiss="popover">Nein</button>';
		$('#'+newID).find('.delete').popover({trigger: 'focus', title: 'Löschen', content: popoverContent, html: 'true'});

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

function loadMovie_ajax(title){
	return $.ajax({
		type : "POST",
		url : "ajax/loadMovie.php",
		data: {
				movieTitle : title,
			},
	});
}
