var selectedRowId;

/* Flag: Ist das 'mouseopver' Event noch an die Bewertung gebunden?
 * Falls ja, darf die Bewertung nicht in die Tabelle übernommen werden, da sie durch 'mouseover' zu Stande gemkommen sein koennte.
 * Sie darf aber nur uebernommen werden, wenn der User die Bewertung durch 'click' gesetzt hat */
var mouseoverForRatingOn = true;

var ratingIconOn = 'glyphicon-star';
var ratingIconOff = 'glyphicon-star-empty';
var ratingIconHalf = 'glyphicon-star-half';
var switchButtonSeen = "-11px";
var switchButtonUnseen = "15px";

var filter = {
	movieTitle : null,
	movieSeen : null,
	movieRating : null,
	movieTitleSorted : null,
	movieRatingSorted : null,
};

//@formatter:off

var deleteButtonNone = '<button class="btn btn-sm delete loggedOut" title="Delete">' 
							+ '<span class="glyphicon glyphicon-trash"></span>' 
						+ '</button>';

var deleteButtonInactive = '<button class="btn btn-sm delete loggedIn" title="Delete" disabled>' 
								+ '<span class="glyphicon glyphicon-trash"></span>' 
							+ '</button>';

var deleteButtonActive = '<button class="btn btn-sm delete loggedIn" title="Delete">' 
								+ '<span class="glyphicon glyphicon-trash"></span>' 
							+ '</button>';

var editButtonNone = '<button class="btn btn-sm edit loggedOut"title="Edit">' 
							+ '<span class="glyphicon glyphicon-pencil"></span>' 
						+ '</button>';

var editButtonActive = '<button class="btn btn-sm edit loggedIn"title="Edit">' 
							+ '<span class="glyphicon glyphicon-pencil"></span>' 
						+ '</button>';

var addMovieToList = _.template('<tr id="<%- rowID %>" data-imdbID="<%- imdbID %>">' 
										+ '<td class="magnifierTable"><span class="glyphicon glyphicon-search detailMagnifier"/></td>' 
										+ '<td class="tableFilmTitle"><%- movieTitle %></td>' + '<td class="tableMovieSeen"><%- movieSeen %></td>' 
										+ '<td class="tableRating"><%= rating %></td>' 
										+ '<td>' 
											+ '<%= editButton %>' 
										+ '</td>' 
										+ '<td>' 
											+ '<%= deleteButton %>' 
										+ '</td>' 
								+ '</tr>');

var detailedMovieView = _.template('<div class="container">' 
										+ '<h3 id="detailViewMovieTitle"><%- movieTitle %>' 
											+ '<button type="button" id="closeDetailedView" class="close" aria-hidden="true"> &times;</button>' 
										+ '</h3>' 
										+ '<h6><span class="glyphicon glyphicon-user"/>  <%= username %></h6>' 
										+ '<div class="row">' + '<div class="col-xs-7">' 
											+ '<label>Gesehen: </label><span><%- movieSeen %></span><br>' 
											+ '<label>Bewertung: </label><span><%= rating %></span><br>' 
											+ '<label>Veröffentlicht: </label><span><%- release %></span><br>' 
											+ '<label>Dauer: </label><span><%- runtime %></span><br>' 
											+ '<label>Genre: </label><span><%- genre %></span><br>' 
											+ '<label>Regisseur: </label><span><%- director %></span><br>' 
											+ '<label>Schauspieler: </label><span><%- actors %></span><br>'
											+ '<label>Handlung: </label><ul class="plot"><%- plot %></ul>' 
										+ '</div>' 
											+ '<div class="col-xs-5">' + '<img src="<%- picture %>" class="img-thumbnail"/>' 
										+ '</div>' 
									+ '</div>');

//Initialisierung von FilmModal Content
var insertCreateFilmModal = '<div class="form-group">' 
								+ '<input type="text" class="form-control" id="filmTitle" placeholder="Film eingeben">' 
								+ '<div class="switch-wrapper">' 
									+ '<span class="switch-button-label off">GESEHEN</span>' 
									+ '<div class="switch-button-background">' 
										+ '<div class="switch-button-button"></div>' 
									+ '</div><span class="switch-button-label on">NICHT GESEHEN</span><div style="clear: left;"></div>' 
								+ '</div>' 
								+ '<div class="rating">' 
									+ '<label>Bewertung:</label>' 
								+ '</div>' 
							+ '</div>';

//Initialisierung des Popovers
var popoverFilterContent = '<fieldset id="filterBox">' 
								+ '<div class="form-group row">' 
									+ '<div class="input-group col-sm-10" style="width: 252px;">' 
										+ '<span class="input-group-addon"><span class="glyphicon glyphicon-film"></span></span>' 
										+ '<input type="text" class="form-control" id="movieTitle" name="movieTitle" placeholder="Filmtitel" onkeyup="movieTitleFilterKeyUp()">' + '</div>' + '<div class="col-sm-2" style="margin-left: -25px;">' 
										+ '<button type="button" class="close" aria-hidden="true" onclick="removeTitleFilter()">' 
											+ '×' 
										+ '</button>' 
									+ '</div>' 
								+ '</div>' 
								+ '<div class="row">' 
									+ '<div class="col-sm-10">' 
										+ '<div class="btn-group" data-toggle="buttons" style="width: 223px;">' 
											+ '<label class="btn btn-primary"  onclick="filterWatchStatusSet(true)">' 
											+ '<input type="radio" name="options" id="movieWatched">' 
												+ 'Gesehen</label><label class="btn btn-primary" onclick="filterWatchStatusSet(false)">' 
											+ '<input type="radio" name="options" id="movieNotWatched">' 
												+ 'Nicht Gesehen</label>' 
										+ '</div>' 
									+ '</div>' 
									+ '<div class="col-sm-2">' 
										+ '<button type="button" class="close" aria-hidden="true" onclick="removeWatchFilter()">' 
											+ '×' 
										+ '</button>' 
									+ '</div>' 
								+ '</div>' 
								+ '<div class="row">' 
									+ '<div class="col-sm-10">' 
										+ '<div id="filterStars">' 
											+ '<span id="filterStar-1" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)">&#xe007;</span>' 
											+ '<span id="filterStar-2" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)">&#xe007;</span>' 
											+ '<span id="filterStar-3" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)">&#xe007;</span>' 
											+ '<span id="filterStar-4" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)">&#xe007;</span>' 
											+ '<span id="filterStar-5" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)">&#xe007;</span>' 
										+ '</div>' 
									+ '</div>' 
									+ '<div class="col-sm-2">' 
										+ '<button type="button" class="close" aria-hidden="true" onclick="removeRatingFilter()">' 
											+ '×' 
										+ '</button>' 
									+ '</div>' 
								+ '</div>' 
						+ '</fieldset>';
//@formatter:on

$(document).ready(function() {
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
	// prüft ob angemeldet oder nicht!
	if (Parse.User.current() != null) {
		//@formatter:off
		isLoggedInOrNot();
		$('#loginButton').parent().html('<button class="btn btn-default btn-lg" id="logoutButton">' + '<span class="glyphicon glyphicon-remove-circle"></span> Logout' + '</button>');
		$('#logoutButton').on('click', function() {
			$('#logoutButton').parent().html('<button class="btn btn-default btn-lg" id="loginButton"><span class="glyphicon glyphicon-user"></span> Login</button>');
			$('#menu1').removeClass("open");
			Parse.User.logOut();

			setTimeout('$("#usernameInput").focus()', 100);
			//Login Button Listener
			$('#loginButton').on('click', function() {
				setTimeout('$("#usernameInput").focus()', 100);
			});
			$('#passwordInput').val("");
			$('#usernameInput').val("");
			isLoggedInOrNot();
		});
		//@formatter:on
	}
	//Login Button Listener
	$('#loginButton').on('click', function() {
		if (!$(this).parent().parent().hasClass("open")) {
			setTimeout('$("#usernameInput").focus()', 100);
		}
	});
	$('#submitLoginButton').on('click', function(event) {
		event.preventDefault();
		var userName = $('#usernameInput').val();
		var password = $('#passwordInput').val();
		var parent = $('#loginButton').parent();
		$('#submitLoginButton').button('loading');
		parse_loginUser(userName, password);
	});

	/* Registrieren */
	$('#register').on("click", function(event) {
		event.preventDefault();
		$('#registerModal').modal('show');
		return false;
	});

	$('#submitRegistration').on("click", function() {
		var username = $('#registerModal .modal-body #regUsernameInput').val();
		var password = $('#registerModal .modal-body #regPasswordInput').val();
		parse_registerUser(username, password);
	});
	//Facebook Login and SignUp
	$('#loginFacebook').on("click", function(event) {
		event.preventDefault();
		parse_initializeFacebook();
		parse_facebookLoginSignUp();
	});
});

//Call for Facebook Login and Signup
function changeLoginButtonOnFacebookLoginSignIn() {
	//@formatter:off
	$('#menu1').removeClass("open");
	isLoggedInOrNot();
	$('#loginButton').parent().html('<button class="btn btn-default btn-lg" id="logoutButton">' + '<span class="glyphicon glyphicon-remove-circle"></span> Logout' + '</button>');
	$('#logoutButton').on('click', function() {
		$('#logoutButton').parent().html('<button class="btn btn-default btn-lg" id="loginButton"><span class="glyphicon glyphicon-user"></span> Login</button>');
			Parse.User.logOut();
			setTimeout('$("#usernameInput").focus()', 100);
		//Login Button Listener
		$('#loginButton').on('click', function() {
			setTimeout('$("#usernameInput").focus()', 100);
		});
		$('#passwordInput').val("");
		$('#usernameInput').val("");
		isLoggedInOrNot();
	});
	//@formatter:on
}

// Toggle Klassen fuer Edit-, Delete- und Hinzufuege-Buttons
function isLoggedInOrNot() {
	// toggleClassOnAllElements('.edit');
	// toggleClassOnAllElements('.delete');
	toggleClassOnAllElements('#add');
}

/*Setzt die Klasse fuer Parameter 'element' auf 'loggedOut' und entfernt Klasse 'loggedIn', falls der User nicht eingeloggt ist. Ansonsten umgekehrt. */
function toggleClassOnAllElements(element) {
	$(element).each(function() {
		if (element === '.delete') {
			// ueberpruefe ob User eingeloggt ist und Owner oder nur User und mach was
			if (Parse.User.current() != null) {
				$('#filmtable').find('.delete').each(function() {
					var that = $(this);
					var movie = new Parse.Query(Movie);
					movie.equalTo('imdbID', that.parent().parent().attr('data-imdbid'));
					movie.find(function(movieResults) {
						// da die imdbID als eindeutige Schluessel gesehen werden kann wird nur ein Element bei der Suche zurueckgegeben
						if (Parse.User.current() != null && movieResults[0].get("Owner").id == Parse.User.current().id) {
							that.removeAttr("disabled");
						} else {
							that.attr("disabled", "disabled");
						}
					});
				});
			}
		}
		// if (element === '.delete') {
			// // ueberpruefe ob User eingeloggt ist und Owner oder nur User und mach was
			// if (Parse.User.current() != null) {
				// $('#filmtable').find('.delete').each(function() {
					// var that = $(this);
					// var movie = new Parse.Query(Movie);
					// movie.equalTo('imdbID', that.parent().parent().attr('data-imdbid'));
					// movie.find(function(movieResults) {
						// // da die imdbID als eindeutige Schluessel gesehen werden kann wird nur ein Element bei der Suche zurueckgegeben
						// if (movieResults[0].get("Owner").id == Parse.User.current().id) {
							// that.removeAttr("disabled");
						// } else {
							// that.attr("disabled", "disabled");
						// }
					// });
				// });
			// }
		// }
		$(this).fadeToggle('1000', function() {
			$(this).toggleClass('loggedOut loggedIn');
		});
	});
}

/*--------------------------------Anfang Detailansicht fuer Film ------------------------------------------------------------------------------------------------*/
/* Detailansicht wird aufgebaut. Dafuer werden Daten von der OMDB Database als JSON geholt */
function buildDetailView(numberOfStars, movieSeen, imdbID) {
	// alternative Quelle könnte "http://mymovieapi.com/?title=" sein
	$.getJSON("http://www.omdbapi.com/?i=" + imdbID + "&plot=full").done(function(data) {
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

			parse_getOwnerOfMovie(imdbID, function(username) {
				$('#detailedView').html(detailedMovieView({
					movieTitle : data.Title,
					username : username,
					movieSeen : movieSeen,
					rating : setRating(numberOfStars, true),
					picture : poster,
					release : data.Released,
					runtime : data.Runtime,
					genre : data.Genre,
					director : data.Director,
					actors : data.Actors,
					plot : data.Plot
				}));

				$('#detailedView').stop().show().animate({
					right : "0px"
				});
				$('#home').stop().animate({
					left : "-100%"
				}, function() {
					$('#home').hide();
				});
			});

		}
	});
}

/*-------------------------------- Ende Detailansicht fuer Film ------------------------------------------------------------------------------------------------*/
