// Verbinde mit Parse
Parse.initialize("L6o5RS5o7y3L2qq0MdbUUx1rTm8dIzLVJR6etJ5K", "QyEYNDiJAI3ctZ9pZC8fX7ncgVsyQ665094o3nPA");

var Movie = Parse.Object.extend("Movie");
var Edit = Parse.Object.extend("Edit");

function parse_initializeFacebook() {
	Parse.FacebookUtils.init({
		appId : '685337254818732', // Facebook App ID
		channelUrl : 'https://apps.facebook.com/moviedatabasedhbwloe/', // Channel File
		status : true, // check login status
		cookie : true, // enable cookies to allow Parse to access the session
		xfbml : true // parse XFBML
	});
}

function parse_registerUser(username, password) {
	var user = new Parse.User();
	user.set("username", username);
	user.set("password", password);

	user.signUp(null, {
		success : function(user) {
			$('#registerModal').modal('hide');
			$('#registerModal .modal-body').find('.alert').remove();
			$('#registerModal .modal-body .alert').hide();
			$('#registerModal .modal-body #regUsernameInput').val("");
			$('#registerModal .modal-body #regPasswordInput').val("");
		},
		error : function(user, error) {
			$('#registerModal .modal-body .alert').html(error.message);
			$('#registerModal .modal-body .alert').show();
		}
	});
}

function parse_loginUser(username, password) {
	Parse.User.logIn(username, password).then(function(user) {
		$('#loginButton').parent().html('<button class="btn btn-default btn-lg" id="logoutButton"><span class="glyphicon glyphicon-remove-circle"></span> Logout</button>');
		$('#loginDropdown').hide();
		$('#logoutButton').on('click', function() {
			$('#logoutButton').parent().html('<button class="btn btn-default btn-lg" id="loginButton"><span class="glyphicon glyphicon-user"></span> Login</button>');

			Parse.User.logOut();
			parse_initialLoadMovieTable();

			$('#loginDropdown').show();
			setTimeout('$("#usernameInput").focus()', 100);
			//Login Button Listener
			$('#loginButton').on('click', function() {
				if (!$(this).parent().parent().hasClass("open")) {
					$('#loginDropdown').show();
					setTimeout('$("#usernameInput").focus()', 100);
				} else {
					//Bei klick auf Login ausblenden vom Inputfeld
					$('#loginDropdown').hide();
				}
			});
			$('#passwordInput').val("");
			$('#usernameInput').val("");
			isLoggedInOrNot();
		});
		isLoggedInOrNot();
		$('#submitLoginButton').button('reset');
	}).then(function() {
		parse_initialLoadMovieTable();
	}, function(error) {
		$('#submitLoginButton').button('reset');
		parse_getErrorMessage(error);
	});
}

/* Zaehle User in User Tabelle */
function parse_countUsers(callback) {
	var user = new Parse.Query(Parse.User);
	var promise = Parse.Promise.as();
	promise = promise.then(function() {
		return user.count();
	});
	return promise;
}

/* Initialisiere die Liste und fuelle sie mit allen Filmen der Datenbank */
function parse_initialLoadMovieTable() {
	var movie = new Parse.Query(Movie);
	var rows = [];
	parse_countUsers().then(function(userCount) {
		movie.find().then(function(movieResults) {
			var promiseMovieFind = Parse.Promise.as();
			_.each(movieResults, function(movieResult, index) {
				promiseMovieFind = promiseMovieFind.then(function() {
					var row = {
						trID : 'tr-' + ++index,
						editButton : null,
						deleteButton : null,
						seen : "gesehen (" + movieResult.get('numberOfUsersSeen') + " von " + userCount + ")",
						numberOfStars : movieResult.get('avgRating'),
						movieTitle : movieResult.get('Title'),
						imdbID : movieResult.get('imdbID'),
						owner : movieResult.get('Owner').id
					};

					// wird nur vollstaendig ausgefuehrt, wenn ein User angemeldet ist
					var checkEdit = function() {
						var promise = Parse.Promise.as();
						if (Parse.User.current() !== null) {
							var edit = new Parse.Query(Edit);
							edit.equalTo("movieID", movieResult);
							edit.equalTo("userID", Parse.User.current());

							promise = promise.then(function() {
								return edit.find().then(function(editResults) {
									_.each(editResults, function(editResult) {
										if ( typeof (editResult) !== "undefined") {
											// es wurde ein Eintrag in EDIT zu der Selektion gefunden
											row.numberOfStars = editResult.get('rating');
											if (editResult.get('movieSeen')) {
												// Film wurde gesehen
												row.seen = "gesehen";
											} else {
												// Film wurde nicht gesehen
												row.seen = "nicht gesehen";
											}
										} else {
											/* es wurde kein Eintrag in EDIT zur Selektion gefunden.
											 * Daher wird gesehen / nicht gesehen auf nicht gesehen gesetzt,
											 * als Default-Wert und die Bewertung auf 0 Sterne
											 */

											row.numberOfStars = 0;
											row.seen = "nicht gesehen";
										}
									}, function(error) {
										alert(error.message);
									});
								}, function(error) {
									alert(error.message);
								});
							});
						}
						return promise;
					};

					return checkEdit().then(function() {
						if (Parse.User.current() != null) {
							// angemeldet
							if (row.owner == Parse.User.current().id && row.owner != null) {
								// angemeldeter User, der den Film "besitzt"
								row.editButton = editButtonActive;
								row.deleteButton = deleteButtonActive;

							} else {
								// angemeldeter User, der den Film nicht "besitzt"
								row.editButton = editButtonActive;
								row.deleteButton = deleteButtonInactive;
							}
						} else {
							//nicht angemeldet, daher nur Berechtigung zum Anschauen
							row.editButton = editButtonNone;
							row.deleteButton = deleteButtonNone;
						}
						rows.push(initiateTableRow(row.trID, row.numberOfStars, row.movieTitle, row.imdbID, row.seen, row.editButton, row.deleteButton));
					});
				});
			});
			return promiseMovieFind;
		}).then(function() {
			$('#filmtable').html(rows);
		}, function(error) {
			console.log(error.message);
		});
	});
}

function parse_saveMovie(movieTitle, imdbID, numberOfStars, seen) {
	var movie = new Movie();

	movie.set("imdbID", imdbID);
	movie.set("avgRating", numberOfStars);
	movie.set("Title", movieTitle);
	movie.set("Owner", Parse.User.current());

	var numberOfUserSeen;
	if (seen) {
		numberOfUserSeen = 1;
	} else {
		numberOfUserSeen = 0;
	}

	movie.set("numberOfUsersSeen", numberOfUserSeen);

	movie.save(null, {
		success : function(movie) {
			parse_saveRating(numberOfStars, seen, movie);
		},
		error : function(movie, error) {
			// TODO schoenere Fehlermeldung
			alert('Failed to create new object, with error code: ' + error.description);
		}
	});
}

function parse_saveRating(numberOfStars, seen, movie) {
	var edit = new Edit();

	edit.set("rating", numberOfStars);
	edit.set("movieSeen", seen);
	// Objekt von Movie
	edit.set("movieID", movie);
	// Objekt von User
	edit.set("userID", Parse.User.current());

	var promise = Parse.Promise.as();
	promise = promise.then(function() {
		return edit.save(null, {
			success : function(edit) {
				console.log("editEintragSpeichern");
			},
			error : function(edit, error) {
				// TODO schoenere Fehlermeldung
				parse_getErrorMessage(error);
				alert('Failed to create new object, with error code: ' + error.message);
			}
		});
	});

	return promise;
}

/* berechnet die durschnittliche Filmbewertung und nutzt diesen Wert im "callback"-Parameter*/
function parse_calculateAverageRating(movieID, callback) {
	var edit = new Parse.Query(Edit);
	edit.equalTo("movieID", movieID);
	edit.equalTo("movieSeen", true);
	edit.find({
		success : function(results) {
			var sum = 0;
			for (var i = 0; i < results.length; i++) {
				sum += results[i].get('rating');
			}
			callback(sum / results.length);
		},
		error : function(error) {
			// Er kann nicht nichts finden, weil wir ihm ja eine MovieID uebergeben
		}
	});
}

function parse_updateEntry(imdbID, numberOfStars, seen) {
	var movie = new Parse.Query(Movie);
	movie.equalTo('imdbID', imdbID);
	movie.first().then(function(movieResult) {
		return movieResult;
	}).then(function(movieResult) {
		edit = new Parse.Query(Edit);
		edit.equalTo('userID', Parse.User.current());
		edit.equalTo('movieID', movieResult);

		edit.first().then(function(editResult) {
			var promise = Parse.Promise.as();
			promise = promise.then(function() {
				if ( typeof (editResult) != 'undefined') {
					// es gibt schon einen Eintrag zu dem Film und User in der Edit Tabelle
					editResult.set('rating', numberOfStars);
					editResult.set('movieSeen', seen);
					return editResult.save({
						success : function() {
							console.log("edit erfolgreich aktualisiert");
						},
						error : function() {
							console.log("edit konnte nicht aktualisiert werden");
						}
					});
				} else {
					// es gibt noch keinen Eintrag zu dem Film und User in der Edit Tabelle, somit wird einer hinzugefuegt
					var numberOfUserSeen;
					if (seen) {
						numberOfUserSeen = movieResult.get("numberOfUsersSeen") + 1;
					} else {
						numberOfUserSeen = movieResult.get("numberOfUsersSeen");
					}

					movieResult.set("numberOfUsersSeen", numberOfUserSeen);

					return parse_saveRating(numberOfStars, seen, movieResult);
				}
			});
			return promise;
		}).then(function() {
			console.log("movieSpeichern");

			parse_calculateAverageRating(movieResult, function(average) {
				movieResult.set('avgRating', average);
				movieResult.save();
			});
		});
	});
}

/* ermittle zu einer imdbID den Owner in der Movie Tabelle */
function parse_getOwnerOfMovie(imdbID, callback) {
	var movie = new Parse.Query(Movie);
	movie.equalTo('imdbID', imdbID);
	movie.find().then(function(results) {

		return results[0].get('Owner').id;
	}).then(function(userID) {
		var user = new Parse.Query(Parse.User);
		user.get(userID, {
			success : function(user) {
				//alert("fertig");
				callback(user.get('username'));
			},
			error : function(error) {
				// TODO Fehlermeldung
			}
		});
	});
}

// TODO Versuch eine Methode zu entwickeln, die die verschiedenen Fehler kontextspezifisch verarbeitet
function parse_getErrorMessage(error) {
	var errorMessage;
	switch(error.code) {
		case Parse.Error.OBJECT_NOT_FOUND:
			errorMessage = error.message;
			break;
		case Parse.Error.CONNECTION_FAILED:
			errorMessage = error.message;
			break;
		case Parse.Error.INTERNAL_SERVER_ERROR:
			errorMessage = error.message;
			break;
		case Parse.Error.OTHER_CAUSE:
			errorMessage = "This is it the apocalypse ;) - Thanks to Imagine Dragons ";
			break;
		default:
			break;
	}

	//@formatter:off
	$('.customAlert').html('<div class="alert alert-danger alert-dismissable">'
							+'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' 
							+ errorMessage + 
						'</div>');
	//@formatter:on
}

function parse_facebookLoginSignUp() {
	Parse.FacebookUtils.logIn("email", {
		success : function(user) {
			if (!user.existed()) {
				changeLoginButtonOnFacebookLoginSignIn();
				// Ich versuche noch den Usernamen und die Email zu bekommen
				FB.api('/me?fields=name,email', function(response) {
					Parse.User.setUsername(response.name);
					Parse.User.setEmail(response.email);
				}); 

			} else {
				changeLoginButtonOnFacebookLoginSignIn();
			}
		},
		error : function(user, error) {
			alert("User cancelled the Facebook login or did not fully authorize.");
		}
	});
}
