var selectedRowId;

/* Flag: Ist das 'mouseopver' Event noch an die Bewertung gebunden?
 * Falls ja, darf die Bewertung nicht in die Tabelle übernommen werden, da sie durch 'mouseover' zu Stande gemkommen sein koennte.
 * Sie darf aber nur uebernommen werden, wenn der User die Bewertung durch 'click' gesetzt hat */
var mouseoverForRatingOn = true;

var ratingIconOn = 'glyphicon-star';
var ratingIconOff = 'glyphicon-star-empty';
var switchButtonSeen = "-11px";
var switchButtonUnseen = "15px";

//var filter = new Array();
var filter = {
	movieTitle : 		null,
	movieSeen : 		null,
	movieRating:		null,
	movieTitleSorted : 	null,
	movieRatingSorted:	null,
};

//@formatter:off
var addMovieToList = _.template('<tr id="<%- rowID %>" data-imdbID="<%- imdbID %> ">'
									+'<td class="magnifierTable"><span class="glyphicon glyphicon-search detailMagnifier"/></td>'
									+'<td class="tableFilmTitle"><%- movieTitle %></td>' 
									+'<td class="tableMovieSeen"><%- movieSeen %></td>' 
									+'<td class="tableRating"><%= rating %></td>' 
									+'<td>'
										+'<button class="btn btn-sm edit loggedIn"title="Edit">'
											+'<span class="glyphicon glyphicon-pencil"></span>'
										+'</button>'
									+'</td>' 
									+ '<td>'
										+'<button class="btn btn-sm delete loggedIn" title="Delete">'
											+'<span class="glyphicon glyphicon-trash"></span>'
										+'</button>'
									+'</td>'
								+'</tr>');

var detailedMovieView = _.template('<div class="container">'
										+'<h3 id="detailViewMovieTitle"><%- movieTitle %>'+
											'<button type="button" id="closeDetailedView" class="close" aria-hidden="true"> &times;</button>'
										+'</h3><div class="row">'
										+'<div class="col-xs-7">'
											+'<label>Gesehen: </label><span><%- movieSeen %></span><br>'
											+'<label>Bewertung: </label><span><%= rating %></span><br>'
											+'<label>Release: </label><span><%- release %></span><br>'
											+'<label>Dauer: </label><span><%- runtime %></span><br>'
											+'<label>Genre: </label><span><%- genre %></span><br>'
											+'<label>Director: </label><span><%- director %></span><br>'
											+'<label>Schauspieler: </label><span><%- actors %></span>'
										+'</div>'
										+'<div class="col-xs-5">'
											+'<img src="<%- picture %>" class="img-thumbnail"/>'
										+'</div>'
									+'</div>');
									
var insertCreateFilmModal = '<div class="form-group">'+
										'<input type="text" class="form-control" id="filmTitle" placeholder="Film eingeben">'+
											'<div class="switch-wrapper">'+
												'<span class="switch-button-label off">GESEHEN</span>'+
											'<div class="switch-button-background">'+
											'<div class="switch-button-button"></div>'+
										'</div><span class="switch-button-label on">NICHT GESEHEN</span><div style="clear: left;"></div>'+
										'</div>'+
										'<div class="rating">'+
											'<label>Bewertung:</label>'+
										'</div>'+
										'</div>';									
//@formatter:on

sessionStorage.setItem("user", "");
// Initialisierung des Items 'User' im Sessionstorage

$(document).ready(function() {
	/* deaktiviert Textauswahl in der Tabelle */
	$('table').bind('selectstart dragstart', function(evt) {
		evt.preventDefault();
		return false;
	});

	//@formatter:off	
	//Initialisierung des Popovers
	var popoverFilterContent = '<fieldset id="filterBox">'
									+'<div class="form-group row">'
										+'<div class="input-group col-sm-10" style="width: 252px;">'
											+'<span class="input-group-addon"><span class="glyphicon glyphicon-film"></span></span>'
											+'<input type="text" class="form-control" id="movieTitle" name="movieTitle" placeholder="Film Titel" onkeyup="movieTitleFilterKeyUp()">'
										+'</div>'
										+'<div class="col-sm-2" style="margin-left: -25px;">'
											+'<button type="button" class="close" aria-hidden="true" onclick="removeTitleFilter()">'
												+'×'
											+'</button>'
										+'</div>'
									+'</div>'
									+'<div class="row">'
										+'<div class="col-sm-10">'
											+'<div class="btn-group" data-toggle="buttons" style="width: 223px;">'
												+'<label class="btn btn-primary"  onclick="filterWatchStatusSet(true)">'
													+'<input type="radio" name="options" id="movieWatched">'
													+'Gesehen</label><label class="btn btn-primary" onclick="filterWatchStatusSet(false)">'
													+'<input type="radio" name="options" id="movieNotWatched">'
													+'Nicht Gesehen</label>'
											+'</div>'
										+'</div>'
										+'<div class="col-sm-2">'
											+'<button type="button" class="close" aria-hidden="true" onclick="removeWatchFilter()">'
												+'×'
											+'</button>'
										+'</div>'
										+'</div>'
										/*+'<div class="col-m-10 filterInactive switch-wrapper">'
											+'<span class="switch-button-label off">GESEHEN</span>'
											+'<div class="switch-button-background">'
												+'<div class="switch-button-button" style="left:' + switchButtonUnseen + '"></div>'
												+'</div><span class="switch-button-label on">NICHT GESEHEN</span><div style="clear: left;"></div>'
										+'</div>'*/
									+'<div class="row">'
										+'<div class="col-sm-10">'
										+'<div id="filterStars">'+
											'<span id="filterStar-1" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)"></span>'+
											'<span id="filterStar-2" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)"></span>'+
											'<span id="filterStar-3" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)"></span>'+
											'<span id="filterStar-4" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)"></span>'+
											'<span id="filterStar-5" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)"></span>'+
										'</div>'
										+'</div>'
										+'<div class="col-sm-2">'
											+'<button type="button" class="close" aria-hidden="true" onclick="removeRatingFilter()">'
												+'×'
											+'</button>'
										+'</div>'
									+'</div>'
								+'</fieldset>'; 
	//@formatter:on

	$('#filterButton').popover({
		trigger : 'click',
		title : 'Filter',
		content : popoverFilterContent,
		html : 'true',
		placement : 'bottom'
	});

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

	/*--------------------------------Anfang Detailansicht fuer Film ------------------------------------------------------------------------------------------------*/

	$('#detailedView').on('click', '#closeDetailedView', function(event) {
		event.preventDefault();
		event.stopPropagation();
		$('#detailedView').stop().animate({
			right : "-100%"
		}, function() {
			$('#detailedView').hide();
		});
		$('#home').stop().show().animate({
			left : "0px"
		});
	});

	$('#listNav').on('click', function(event) {
		event.preventDefault();
		event.stopPropagation();
		$('#detailedView').stop().animate({
			right : "-100%"
		}, function() {
			$('#detailedView').hide();
		});
		$('#home').stop().show().animate({
			left : "0px"
		});
	});
	/*--------------------------------Ende Detailansicht fuer Film ------------------------------------------------------------------------------------------------*/

	/*-----LOGIN--------*/
	// TODO kommentieren
	if (sessionStorage.getItem("user") != "") {
		//@formatter:off
		$('#loginButton').parent().html('<button class="btn btn-default btn-lg" id="logoutButton">'
											+'<span class="glyphicon glyphicon-remove-circle"></span> Logout'
										+'</button>');
		//@formatter:on
	}
	//Login Button Listener
	$('#loginButton').on('click', function() {
		setTimeout('$("#usernameInput").focus()', 100);
	});
	$('#submitLoginButton').on('click', function(event) {
		// TODO Issue 35
		event.preventDefault();
		var userName = $('#usernameInput').val();
		var password = $('#passwordInput').val();
		var parent = $('#loginButton').parent();
		login_ajax(userName, password).done(function(value) {
			if (value == "") {
				//Es wurden keine Logindaten eingeben
				$('#passwordInput').parent().addClass("has-error");
				$('#usernameInput').parent().addClass("has-error");
			} else if (value == "wrongUser") {
				//Es wurde ein falscher Benutzername eingegeben
				$('#passwordInput').parent().removeClass("has-error");
				$('#usernameInput').parent().addClass("has-error");
			} else if (value == "wrongPassword") {
				//Es wurde ein falsches Passwort eingegeben
				$('#passwordInput').parent().addClass("has-error");
				$('#usernameInput').parent().removeClass("has-error");
			} else {
				//Alles war gut!
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
						setTimeout('$("#usernameInput").focus()', 100);
						//Login Button Listener
						$('#loginButton').on('click', function() {
							setTimeout('$("#usernameInput").focus()', 100);
						});
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

	/* Filter */

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
		
		for (var i=1; i <= 5; i++) {
			if (i <= filter.movieRating) {
				$('#filterStar-' + i).removeClass('glyphicon-star-empty');
				$('#filterStar-' + i).addClass('glyphicon-star');
			}else{
				$('#filterStar-' + i).addClass('glyphicon-star-empty');
				$('#filterStar-' + i).removeClass('glyphicon-star');			
			}
		}
	});

	$('#sortTitleASC').on("click", function() {

		if (filter.movieTitleSorted != 'true' && filter.movieRatingSorted == null) {	//alphabetische Sortierung von A zu Z und Ratingfilter nicht aktiv
			sortTitleAlphabet(true);
			filter.movieTitleSorted = 'true';
			$('#sortTitleASC').removeClass('sortInactive');	
			$('#sortTitleDESC').addClass('sortInactive');	
		}else if(filter.movieTitleSorted == 'true' && filter.movieRatingSorted == null){ //alphabetische Sortierung von A zu Z aktiv und Ratingfilter nicht aktiv
			removeSort();
			filter.movieTitleSorted = null;
			$('#sortTitleASC').addClass('sortInactive');	
		}else if(filter.movieTitleSorted != 'true' && filter.movieRatingSorted != null){ //alphabetische Sortierung von A zu Z inaktiv und Ratingfilter aktiv
			filter.movieTitleSorted = 'true';
			$('#sortTitleASC').removeClass('sortInactive');	
			$('#sortTitleDESC').addClass('sortInactive');	
			
			groupRatingSortTitle(filter.movieRatingSorted, filter.movieTitleSorted);			
		}else if(filter.movieTitleSorted == 'true' && filter.movieRatingSorted != null){ //alphabetische Sortierung von A zu Z und Ratingfilter aktiv
			removeSort();
			sortRating(filter.movieRatingSorted);
			filter.movieTitleSorted = null;
			$('#sortTitleASC').addClass('sortInactive');				
		}
	});

	$('#sortTitleDESC').on("click", function() {
		if (filter.movieTitleSorted != 'false' && filter.movieRatingSorted == null) { //alphabetische Sortierung von Z zu A und Ratingfilter nicht aktiv
			sortTitleAlphabet(false);
			filter.movieTitleSorted = 'false';
			$('#sortTitleDESC').removeClass('sortInactive');	
			$('#sortTitleASC').addClass('sortInactive');	
		}else if(filter.movieTitleSorted == 'false' && filter.movieRatingSorted == null){ //alphabetische Sortierung von Z zu A aktiv und Ratingfilter nicht aktiv
			removeSort();
			filter.movieTitleSorted = null;
			$('#sortTitleDESC').addClass('sortInactive');	
		}else if(filter.movieTitleSorted != 'false' && filter.movieRatingSorted != null){ //alphabetische Sortierung von Z zu A inaktiv und Ratingfilter aktiv
			filter.movieTitleSorted = 'false';
			$('#sortTitleDESC').removeClass('sortInactive');	
			$('#sortTitleASC').addClass('sortInactive');	
			
			groupRatingSortTitle(filter.movieRatingSorted, filter.movieTitleSorted);			
		}else if(filter.movieTitleSorted == 'false' && filter.movieRatingSorted != null){ //alphabetische Sortierung von Z zu A und Ratingfilter aktiv
			removeSort();
			sortRating(filter.movieRatingSorted);
			filter.movieTitleSorted = null;
			$('#sortTitleDESC').addClass('sortInactive');				
		}
	});
		
	$('#sortRatingASC').on("click", function() {

		if (filter.movieRatingSorted != 'true' && filter.movieTitleSorted == null) { //Rating nicht aufsteigen sortiert und Titelfilter inaktiv
			sortRating(true);
			filter.movieRatingSorted = 'true';
			$('#sortRatingASC').removeClass('sortInactive');	
			$('#sortRatingDESC').addClass('sortInactive');	
		}else if(filter.movieRatingSorted == 'true' && filter.movieTitleSorted == null){ //Rating aufsteigend sortiert und Titelfilter inaktiv
			removeSort();
			filter.movieRatingSorted = null;
			$('#sortRatingASC').addClass('sortInactive');	
		}else if(filter.movieRatingSorted != 'true' && filter.movieTitleSorted != null){ //Rating nicht aufsteigen sortiert und Titelfilter aktiv
			filter.movieRatingSorted = 'true';
			$('#sortRatingASC').removeClass('sortInactive');	
			$('#sortRatingDESC').addClass('sortInactive');	
			
			groupRatingSortTitle(filter.movieRatingSorted, filter.movieTitleSorted);			
		}else if(filter.movieRatingSorted == 'true' && filter.movieTitleSorted != null){ //Rating aufsteigen sortiert und Titelfilter aktiv
			removeSort();
			sortTitleAlphabet(filter.movieTitleSorted);
			filter.movieRatingSorted = null;
			$('#sortRatingASC').addClass('sortInactive');				
		}
	});
	
	
	$('#sortRatingDESC').on("click", function() {
		if (filter.movieRatingSorted != 'false' && filter.movieTitleSorted == null) {//Rating nicht absteigend sortiert und Titelfilter inaktiv
			sortRating(false);
			filter.movieRatingSorted = 'false';
			$('#sortRatingDESC').removeClass('sortInactive');	
			$('#sortRatingASC').addClass('sortInactive');	
		}else if(filter.movieRatingSorted == 'false' && filter.movieTitleSorted == null){//Rating absteigend sortiert und Titelfilter inaktiv
			removeSort();
			filter.movieRatingSorted = null;
			$('#sortRatingDESC').addClass('sortInactive');	
		}else if(filter.movieRatingSorted != 'false' && filter.movieTitleSorted != null){ //Rating nicht absteigen sortiert und Titelfilter aktiv
			filter.movieRatingSorted = 'false';
			$('#sortRatingDESC').removeClass('sortInactive');	
			$('#sortRatingASC').addClass('sortInactive');	
			
			groupRatingSortTitle(filter.movieRatingSorted, filter.movieTitleSorted);			
		}else if(filter.movieRatingSorted == 'false' && filter.movieTitleSorted != null){ //Rating absteigen sortiert und Titelfilter aktiv
			removeSort();
			sortTitleAlphabet(filter.movieTitleSorted);
			filter.movieRatingSorted = null;
			$('#sortRatingDESC').addClass('sortInactive');				
		}
	});	

	//---------------------------------------------------------------------------------------------------------------------------------------
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

function searchMovie(numberOfStars, movieTitle){
	$.ajax( {url: "http://www.omdbapi.com/?s=" + movieTitle.replace(" ", "+"),  
			dataType: 'json',
		}).done(function(data) {
						if(typeof(data.Response) == 'undefined'){
							var elementsFound = $.map( data.Search, function( value, key ) {
								if(value.Type != 'game'){
									return value;	
								}
							});
							
							if(elementsFound.length > 1){
								buildChooseTable(elementsFound, numberOfStars);
							}else if(elementsFound == 1){
								addNewTableLine(numberOfStars, movieTitle, elementsFound.imdbID);
							}else{
								$('#createFilmModal').modal('hide');
								//TODO Fehlermeldung weil Film nicht gefunden				
							}
						}else{
							$('#createFilmModal').modal('hide');
							//TODO Fehlermeldung weil Film nicht gefunden	
						}		
						//wenn alles stimmt /addNewTableLine(numberOfStars, movieTitle);
					});
}

function buildChooseTable(foundMovies, numberOfStars){
	$('#createFilmModal').find('.modal-body .form-group').hide();
	$('#createFilmModal').find('#saveFilm').hide();
	$('#createFilmModal').find('#chooseTable').show();
	$('#createFilmModal').find('#chooseTable tbody').empty();
	
	for (var i=0; i < foundMovies.length; i++) {
		$('<tr data-imdbID="'+ foundMovies[i].imdbID +'"><td>'+ foundMovies[i].Title +'</td><td>'+ foundMovies[i].Year +'</td><td>'+ foundMovies[i].Type +'</td>'+
		'<td><button type="button" class="btn btn-primary">Auswahl</button></td></tr>').appendTo('#createFilmModal .modal-body tbody');
	};
	
	$('tbody .btn').on('click', function(){
		addNewTableLine(numberOfStars, $(this).parent().parent().find('td:first-child').text(), $(this).parent().parent().attr('data-imdbID'));
		
		$('#createFilmModal').find('#saveFilm').show();
		$('#createFilmModal').find('.modal-body .form-group').show();
		$('#createFilmModal').find('#chooseTable').hide();

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
	if ("NICHT GESEHEN" === $('#createFilmModal').find('.on').text().toUpperCase()) {
		numberOfStars = 0;
	} else if (mouseoverForRatingOn) {
		/* 'mouseover' Event ist noch an Bewertung gebunden, daher darf eine Bewertung nicht erfolgen.
		 * Da der Film aber als 'GESEHEN' bewertet wurde, muss er mit min. 1 Stern bewertet werden */
		numberOfStars = 1;
	}

	$('#filmtable').append(addMovieToList({
		imdbID: imdbID,
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
		var clickedTr = $(this).parent().parent();
		buildDetailView(clickedTr.find('.stars').find('.' + ratingIconOn).length, clickedTr.find('.tableMovieSeen').text().toLowerCase(), clickedTr.attr('data-imdbID'));
	});
	
	filter.movieSeen = filterSetting.movieSeen;
	filter.movieTitle = filterSetting.movieTitle;
	filter.movieTitleSorted = filterSetting.movieTitleSorted;

	if (filter.movieTitleSorted != null) {
		sortTitleAlphabet(filter.movieTitleSorted);
	}
	if (filter.movieSeen != null) {
		filterWatchStatus(filter.movieSeen);
	}
	if (filter.movieTitle != null) {
		filterMovieTitle(filter.movieTitle);
	}
		
	//TODO filter GUI wieder setzen!!!		
}

/* Das 'editFilmModul' wird geschlossen und moechte die geanderten Werte in die Tabelle uebertragen werden. Dabei ist zu unterscheiden, wie das Event ausgeloest wurde */
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

// Toggle Klassen fuer Edit-, Delete- und Hinzufuege-Buttons
function isLoggedInOrNot() {
	toggleClassOnAllElements('.edit');
	toggleClassOnAllElements('.delete');
	toggleClassOnAllElements('#add');
}

/*Setzt die Klasse fuer Parameter 'element' auf 'loggedOut' und entfernt Klasse 'loggedIn', falls der User nicht eingeloggt ist. Ansonsten umgekehrt. */
function toggleClassOnAllElements(element) {
	$(element).each(function() {
		$(this).fadeToggle('1000', function() {
			$(this).toggleClass('loggedOut loggedIn');
		});
	});
}

/*--------------------------------Anfang Detailansicht fuer Film ------------------------------------------------------------------------------------------------*/
/* Detailansicht wird aufgebaut. Dafuer werden Daten von der OMDB Database als JSON geholt */
function buildDetailView(numberOfStars, movieSeen, imdbID) {
	// alternative Quelle könnte "http://mymovieapi.com/?title=" sein
	$.getJSON("http://www.omdbapi.com/?i=" + imdbID).done(function(data) {
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
				movieTitle : data.Title,
				movieSeen : movieSeen,
				rating : setRating(numberOfStars, true),
				picture : poster,
				release : data.Released,
				runtime : data.Runtime,
				genre : data.Genre,
				director : data.Director,
				actors : data.Actors
			}));

			$('#detailedView').stop().show().animate({
				right : "0px"
			});
			$('#home').stop().animate({
				left : "-100%"
			}, function() {
				$('#home').hide();
			});
		}
	});
}

/*-------------------------------- Ende Detailansicht fuer Film ------------------------------------------------------------------------------------------------*/

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

/*------------------------------ Filter --------------------------------*/
function fillStars(starid){
	if (starid != null) {
		var id = starid.split('-');
		
		for (var i=1; i <= 5; i++) {
			if (i <= id[1]) {
				$('#filterStar-' + i).removeClass('glyphicon-star-empty');
				$('#filterStar-' + i).addClass('glyphicon-star');
			}else{
				$('#filterStar-' + i).addClass('glyphicon-star-empty');
				$('#filterStar-' + i).removeClass('glyphicon-star');			
			}
		}		
	}else{
		if(filter.movieRating == null){
			$('#filterStars').find('span[id*="filterStar-"]').addClass('glyphicon-star-empty');
			$('#filterStars').find('span[id*="filterStar-"]').removeClass('glyphicon-star');					
		}else{
			for (var i=1; i <= 5; i++) {
				if (i <= filter.movieRating) {
					$('#filterStar-' + i).removeClass('glyphicon-star-empty');
					$('#filterStar-' + i).addClass('glyphicon-star');
				}else{
					$('#filterStar-' + i).addClass('glyphicon-star-empty');
					$('#filterStar-' + i).removeClass('glyphicon-star');			
				}
			}				
		}
	}
	
	$('#filterStars').find('span[id*="filterStar-"]').attr('onmouseout', 'fillStars(null)');
}

// Setzt den zu Filternden im Filter-Objekt und starten dann das Filtern
function movieTitleFilterKeyUp(){
	setTimeout(function(){
		filter.movieTitle = $('#filterBox #movieTitle').val();

		filterTable();		
	}, 1000);
}
function setFilterRating(starid){
	var id = starid.split('-');
	filter.movieRating = id[1];
	
	filterTable();	
}
function filterWatchStatusSet(seen){
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

	if(filter.movieRating == null && filter.movieSeen == null && filter.movieTitle == null){
			
	}else{
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
function filterRow(actRow){
	if(filter.movieRating != null){
		if($(actRow).find('.tableRating .stars').data('rated') != filter.movieRating){
			return true;
		}
	}
	if(filter.movieSeen != null){
		if($(actRow).find('.tableMovieSeen').text() != filter.movieSeen){
			return true;
		}
	}
	if(filter.movieTitle != null && filter.movieTitle != "" && $.trim(filter.movieTitle) != ""){
		if($(actRow).find('.tableFilmTitle').text().search(filter.movieTitle) == -1){
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
//---------------------------------------------Sortierung
function removeSort() {
	var lastTableChild = $('tbody tr:last-child');
	if (lastTableChild != null) {
		var actRow = $('#list tbody tr:first-child');
		var rows = new Array();
		var counter = 0;

		while (actRow.length != 0) {
			rows[counter] = actRow.attr('id');
			actRow = actRow.next();
			counter++;
		}

		rows.sort();

		//Aufbau der sortierten Tabelle
		//erste Zeile in den Tabellen-Bauch hängen
		var segments = rows[0].split('-');
		actRow = '#tr-' + segments[1];

		$(actRow).appendTo($('#list tbody'));
		var prevRow = actRow;

		//nun die restlichen Zeilen anhängen
		for (var i = 1; i < rows.length; i++) {
			var segments = rows[i].split('-');
			actRow = '#tr-' + segments[1];

			$(actRow).insertAfter($(prevRow));

			prevRow = actRow;
		};
	}
}

function sortTitleAlphabet(direction) {
	var actRow = $('#list tbody tr:first-child');
	var titles = new Array();
	var counter = 0;

	while (actRow.length != 0) {
		titles[counter] = actRow.find('.tableFilmTitle').text() + "-" + actRow.attr('id');
		actRow = actRow.next();
		counter++;
	}

	titles.sort();

	if (direction == false) {
		titles.reverse();
	}

	//Aufbau der sortierten Tabelle
	//erste Zeile in den Tabellen-Bauch hängen
	var segments = titles[0].split('-tr-');
	actRow = '#tr-' + segments[1];

	$(actRow).appendTo($('#list tbody'));
	var prevRow = actRow;

	//nun die restlichen Zeilen anhängen
	for (var i = 1; i < titles.length; i++) {
		var segments = titles[i].split('-tr-');
		actRow = '#tr-' + segments[1];

		$(actRow).insertAfter($(prevRow));

		prevRow = actRow;
	};

}


function sortRating(direction){
	var actRow = $('#list tbody tr:first-child');
	var rating = new Array();
	var counter = 0;

	while (actRow.length != 0) {
		rating[counter] = actRow.find('.tableRating .stars').data('rated') + "-" + actRow.attr('id');
		actRow = actRow.next();
		counter++;
	}

	rating.sort();

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

		prevRow = actRow;
	};	
}

function groupRatingSortTitle(ratingSortDirection, titleSortDirection){
	
}
/*	
 * Alte Filtermethoden die durch den neuen Algorithmus ersetzt wurden
function filterRating(rating){
	if(rating != null){
		var actRow = $('#list tbody tr:first-child');
		while (actRow.length != 0) {
			if (actRow.find('.tableRating .stars').data('rated') != filter.movieRating) {
				actRow.hide();
			}
			actRow = actRow.next();
		}			
	}
	
	$('#filterStars').find('span[id*="filterStar-"]').attr('onmouseout', '');
}

function filterMovieTitle(movieTitle) {
	if (movieTitle != null) {
		var actRow = $('#list tbody tr:first-child');
		while (actRow.length != 0) {
			if (actRow.find('.tableFilmTitle').text().toLowerCase().search(movieTitle.toLowerCase()) == -1) {
				actRow.hide();
			}
			actRow = actRow.next();
		}
	}
}

function filterWatchStatus(gStatus) {
	if (gStatus != null) {
		var actRow = $('#list tbody tr:first-child');
		while (actRow.length != 0) {
			if (actRow.find('.tableMovieSeen').text() != gStatus) {
				actRow.hide();
			}
			actRow = actRow.next();
		}
	}
}
*/
//---------------------------Ajax-Methoden-------------------------------------------------------------
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
