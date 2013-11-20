var selectedRowId;
var table;
var view = "home";

/* Flag: Ist das 'mouseover' Event noch an die Bewertung gebunden?
 * Falls ja, darf die Bewertung nicht in die Tabelle übernommen werden, da sie durch 'mouseover' zu Stande gemkommen sein koennte.
 * Sie darf aber nur uebernommen werden, wenn der User die Bewertung durch 'click' gesetzt hat */
var mouseoverForRatingOn = true;
var changedFilInUserView = false;

var ratingIconHTML = '&#xe007;';
var ratingIconOn = 'glyphicon-star';
var ratingIconOff = 'glyphicon-star-empty';
var ratingIconHalf = 'glyphicon-star-half';
var switchButtonSeen = "-11px";
var switchButtonUnseen = "15px";

var notSeenText = "not seen";
var seenText = "seen";

var rotation = 0;

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
										+ '<h3 id="detailViewMovieTitle" class="heading" data-imdbID="<%- imdbID %>"><%- movieTitle %>' 
											+ '<button type="button" id="closeDetailedView" class="close" aria-hidden="true"> &times;</button>' 
										+ '</h3>' 
										+ '<h6><span class="glyphicon glyphicon-user"/><a href="#user" class="user">  <%= username %></a></h6>' 
										+ '<div class="row">' 
											+ '<div class="col-xs-7">' 
												+ '<label>Seen: </label><span><%- movieSeen %></span><br>' 
												+ '<%= rating %>'
												+ '<label>Avg. Rating: </label><span><%= avgRating %></span><br>' 
												+ '<label>Released: </label><span><%- release %></span><br>' 
												+ '<label>Runtime: </label><span><%- runtime %></span><br>' 
												+ '<label>Genre: </label><span><%- genre %></span><br>' 
												+ '<label>Director: </label><span><%- director %></span><br>' 
												+ '<label>Actors: </label><span><%- actors %></span><br>'
												+ '<label>Plot: </label><ul class="plot"><%- plot %></ul>' 
											+ '</div>' 
												+ '<div class="col-xs-5">' + '<img src="<%- picture %>" class="img-thumbnail"/>' 
											+ '</div>'
										+ '</div> <%= comments %>'
									+ '</div>');
									
var commentField = _.template('<div class="row commentContent">'
								+ '<div class="col-xs-8">'
									+'<div class="panel panel-default">'
										+'<div class="panel-body">'
											+ '<%- comment %>'
											+ '<button type="button" class="deleteComment close" aria-hidden="true"> <%- button%></button>' 
										+'</div>' 
									+ '</div>'
								+'</div>'
								+ '<div class="col-xs-4" data-commentID="<%- commentID%>">'
									+ '<span style="font-weight: bold;"><span class="glyphicon glyphicon-user"></span> <%- author%></span><br>'
									+ '<span style="font-size: 89%"><%- date%></&span>' 
								+ '</div>' 								
							+ '</div>');	

//Initialisierung des Popovers
var popoverFilterContent = '<fieldset id="filterBox">' 
								+ '<div class="form-group row">' 
									+ '<div class="input-group col-sm-10">' 
										+ '<span class="input-group-addon"><span class="glyphicon glyphicon-film"></span></span>' 
										+ '<input type="text" class="form-control" id="movieTitle" name="movieTitle" placeholder="Movie Title" onkeyup="movieTitleFilterKeyUp()" style="height: 45px;">' 
									+ '</div>' + '<div class="col-sm-2">' 
									+ '<button type="button" class="close" aria-hidden="true" onclick="removeTitleFilter()">' 
										+ '×' 
									+ '</button>' 
									+ '</div>' 
								+ '</div>' 
								+ '<div class="row" id="ratingFilterRow">' 
									+ '<div class="col-sm-10">' 
										+ '<div class="btn-group" data-toggle="buttons" style="width: 223px;">' 
											+ '<label class="btn btn-primary"  onclick="filterWatchStatusSet(true)">' 
											+ '<input type="radio" name="options" id="movieWatched">' 
												+ seenText.toUpperCase() +'</label><label class="btn btn-primary" onclick="filterWatchStatusSet(false)">' 
											+ '<input type="radio" name="options" id="movieNotWatched">' 
												+ notSeenText.toUpperCase() +'</label>' 
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
											+ '<span id="filterStar-1" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)">'+ ratingIconHTML +'</span>' 
											+ '<span id="filterStar-2" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)">'+ ratingIconHTML +'</span>' 
											+ '<span id="filterStar-3" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)">'+ ratingIconHTML +'</span>' 
											+ '<span id="filterStar-4" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)">'+ ratingIconHTML +'</span>' 
											+ '<span id="filterStar-5" class="glyphicon glyphicon-star-empty" onclick="setFilterRating(this.id)" onmouseover="fillStars(this.id)" onmouseout="fillStars(null)">'+ ratingIconHTML +'</span>' 
										+ '</div>' 
									+ '</div>' 
									+ '<div class="col-sm-2">' 
										+ '<button type="button" class="close" aria-hidden="true" onclick="removeRatingFilter()">' 
											+ '×' 
										+ '</button>' 
									+ '</div>' 
								+ '</div>' 
						+ '</fieldset>';
						
var popoverContent = 'Are you sure you want to delete the movie?<br>'
					+'<button type="button" class="btn btn-primary btn-danger" onclick="removeMovie($(this).parent().parent().parent().parent())">Delete</button>'
					+'<button type="button" class="btn btn-default" data-dismiss="popover">No</button>';

var chooseTable = _.template('<tr data-imdbID="<%- imdbID %>">'
									+'<td><%- movieTitle %></td>'
									+'<td><%- year %></td>'
									+'<td><%- type %></td>' 
									+'<td><button type="button" class="btn btn-primary select" data-loading-text="Selecting...">Select</button></td>'
									+'</tr>');
//@formatter:on

$(document).ready(function() {
	/* Benutzeransicht zu einem ausgewaehlten Benutzer aufrufen */
	$('body').on('click', '.user', function() {
		view = "userView";
		parse_getUserView($(this).text().trim(), function(view) {
			$('#userView').html(view);

			for (var i = 1; i <= $('#userCreatedTable').find('tr').length; i++) {
				$('#userCreatedTable').find('#tr-' + i).find('.delete').popover({
					trigger : 'focus',
					title : 'Löschen',
					content : popoverContent,
					html : 'true'
				});
			}
			$('#userView').show();
			$('#detailedView').hide();
			$('#home').hide();
		});
	});

	/* Passwort des angemeldeten Benutzers aendern */
	$('body').on('click', '#changePassword', function() {
		$(this).parent().find('#changePasswordForm').find('button').button('reset');
		$(this).parent().find('#changePasswordForm').find('button').addClass('btn-primary').removeClass('btn-success');
		$(this).parent().find('#changePasswordForm').find('input').val("");
		$(this).parent().find('#changePasswordForm').slideToggle();	
	});

	$('body').on('click', '#saveChangePassword', function() {
		parse_changePassword.apply($(this));
	});

	/*--------------------------------Anfang Detailansicht fuer Film ------------------------------------------------------------------------------------------------*/

	$('#detailedView').on('click', '#closeDetailedView', function(event) {
		event.preventDefault();
		event.stopPropagation();

		if (view === "home") {
			$('#userView').hide();
			$('#detailedView').stop().animate({
				right : "-100%"
			}, function() {
				$('#detailedView').hide();
			});
			$('#home').stop().show().animate({
				left : "0px"
			});
		} else if(view === "userView") {
			$('#userView').show();
			$('#detailedView').stop().animate({
				right : "-100%"
			}, function() {
				$('#detailedView').hide();
			});
			$('#home').stop().hide();
		}
	});

	$('#listNav').on('click', function(event) {
		event.preventDefault();
		event.stopPropagation();

		// wurde ein Filmeintrag in der User Ansicht geaendert ist die Tabelle neu zu laden, bevor wir zur Liste zurueckkehren
		$('#userView').hide(function() {
			if (changedFilInUserView) {
				parse_initialLoadMovieTable();
			}
		});

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
		parse_setWelcomeText();
		isLoggedInOrNot();
		allLoginActions();
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
		showHomeView();
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
		parse_facebookLoginSignUp();
	});
	/* -------------------Login / Logout Ende ------------------------------------*/
	/* Refresh Button dreht sich und läd Tabelle neu */
	$('#refreshTableButton').on("click", function() {
		parse_initialLoadMovieTable();
		var flag = false;
		var span = $(this).find(".glyphicon-refresh");
		var i = 0;
		var interval = setInterval(function() {
			i++;
			if (!flag) {
				animateRefreshSpan(span);
			}
			if (i > 100)
				clearInterval(interval);
		}, 10);
	});

	/*--------------------------------Comments--------------------------------------------*/
	$('#detailedView').on('click', '#sendComment', function() {
		save_comment();
	});

	$('#detailedView').on('click', '.deleteComment', function() {
		var that = this;
		parse_deleteComment($(this).parent().parent().parent().parent().find('div:last').data('commentid'), function() {
			$(that).parent().parent().parent().parent().remove();
		});
	});

	$('#detailedView').on("keypress", "textarea", function(event) {
		if (event.keyCode == 13) {
			save_comment();
		}
	});
});

function save_comment() {
	if ($.trim($('#comment-box').find('textarea').val()) != "") {

		//Get actual Date
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1;
		//January is 0!

		var yyyy = today.getFullYear();
		var date = dd + "." + mm + "." + yyyy;

		parse_saveComment($('#detailViewMovieTitle').data('imdbid'), $('#comment-box').find('textarea').val(), function(commentID) {
			var newComment = commentField({
				comment : $('#comment-box').find('textarea').val(),
				author : Parse.User.current().get('username'),
				date : date,
				button : "x",
				commentID : commentID
			});

			$(newComment).insertBefore('#comment-textarea');
			$('#comment-box').find('textarea').val("");
		});
	}
}

jQuery.fn.rotate = function(degrees) {
	$(this).css({
		'-webkit-transform' : 'rotate(' + degrees + 'deg)',
		'-moz-transform' : 'rotate(' + degrees + 'deg)',
		'-ms-transform' : 'rotate(' + degrees + 'deg)',
		'transform' : 'rotate(' + degrees + 'deg)'
	});
};
function animateRefreshSpan(span) {
	rotation += 5;
	span.rotate(rotation);
}

//Call for Facebook Login and Signup
function changeLoginButtonOnFacebookLoginSignIn() {
	//@formatter:off
	$('#menu1').removeClass("open");
	isLoggedInOrNot();
	allLoginActions();
}

// Toggle Klassen fuer Edit-, Delete- und Hinzufuege-Buttons
function isLoggedInOrNot() {
	// toggleClassOnAllElements('.edit');
	// toggleClassOnAllElements('.delete');
	toggleClassOnAllElements('#add');
	toggleClassOnAllElements('#ratingFilterRow');
	toggleClassOnAllElements('#comment-textarea');
}

/*Setzt die Klasse fuer Parameter 'element' auf 'loggedOut' und entfernt Klasse 'loggedIn', falls der User nicht eingeloggt ist. Ansonsten umgekehrt. */
function toggleClassOnAllElements(element) {
	$(element).each(function() {
		$(this).fadeToggle('1000', function() {
			$(this).toggleClass('loggedOut loggedIn');
		});
	});
}

function allLoginActions() {
	//@formatter:off
	$('#loginButton').parent().html('<button class="btn btn-default btn-lg" id="logoutButton">' + '<span class="glyphicon glyphicon-remove-circle"></span> Logout' + '</button>');
	$('#logoutButton').on('click', function() {
		parse_initialLoadMovieTable();
		showHomeView();
		
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
		$('#welcometext').slideToggle();
	//parse_setWelcomeText();
		isLoggedInOrNot();
		$('#facebookButtonList').css("display", "none");
		$('#facebookMovieList').hide();
	});
	//@formatter:on
}

/* Zeige Liste (Home-Ansicht ) an bei klick auf Login- oder Logout-Button */
function showHomeView() {
	view = "home";
	$('#home').show().css({
		left : "0px"
	});
	$('#detailedView').hide().css({
		right : "-100%"
	});
	$('#userView').hide();
}

/*--------------------------------Anfang Detailansicht fuer Film ------------------------------------------------------------------------------------------------*/
/* Detailansicht wird aufgebaut. Dafuer werden Daten von der OMDB Database als JSON geholt */
function buildDetailView(numberOfStars, movieSeen, imdbID) {
	var that = $(this).parent().find(".detailMagnifier");
	that.toggleClass('glyphicon-search detailView-loading');
	// alternative Quelle könnte "http://mymovieapi.com/?title=" sein
	$.getJSON("http://www.omdbapi.com/?i=" + imdbID + "&plot=full").done(function(data) {
		if (data.Response == "False") {
			parse_getErrorMessage("Error with connecting to OMDB Api! Try again later!");
		} else {// data.Response == "True"
			var poster;
			if (data.Poster === "N/A") {
				poster = './img/noposter.png';
			} else {
				poster = data.Poster;
			}

			var avgStars;
			var rating = "";
			if (Parse.User.current() !== null) {
				rating = '<label>Rating: </label><span>' + setRating(numberOfStars, true) + '</span><br>';
			}

			parse_getAvgRating(imdbID, function(stars) {
				avgStars = stars;
				parse_getComments(imdbID, false, function(comments) {
					var userComments = comments;
					parse_getOwnerOfMovie(imdbID, function(username) {
						$('#detailedView').html(detailedMovieView({
							imdbID : imdbID,
							movieTitle : data.Title,
							username : username,
							movieSeen : movieSeen,
							rating : rating,
							avgRating : setRating(avgStars, true, true),
							picture : poster,
							release : data.Released,
							runtime : data.Runtime,
							genre : data.Genre,
							director : data.Director,
							actors : data.Actors,
							plot : data.Plot,
							comments : userComments
						}));

						$('#userView').hide();
						$('#detailedView').stop().show().animate({
							right : "0px"
						});
						$('#home').stop().animate({
							left : "-100%"
						}, function() {
							$('#home').hide();
						});

						that.toggleClass('glyphicon-search detailView-loading');
					});

				});
			});
		}
	});
}

/*-------------------------------- Ende Detailansicht fuer Film ------------------------------------------------------------------------------------------------*/
