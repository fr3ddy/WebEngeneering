// Verbinde mit Parse
Parse.initialize("L6o5RS5o7y3L2qq0MdbUUx1rTm8dIzLVJR6etJ5K", "QyEYNDiJAI3ctZ9pZC8fX7ncgVsyQ665094o3nPA");

var Movie = Parse.Object.extend("Movie");
var Edit = Parse.Object.extend("Edit");

function registerUser(username, password) {
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

function loginUser(username, password) {
	Parse.User.logIn(username, password, {
		success : function(user) {
			$('#loginButton').parent().html('<button class="btn btn-default btn-lg" id="logoutButton"><span class="glyphicon glyphicon-remove-circle"></span> Logout</button>');
			$('#loginDropdown').hide();
			$('#logoutButton').on('click', function() {
				$('#logoutButton').parent().html('<button class="btn btn-default btn-lg" id="loginButton"><span class="glyphicon glyphicon-user"></span> Login</button>');

				Parse.User.logOut();

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
		},
		error : function(user, error) {
			alert("Wrong Logindata");
			$('#submitLoginButton').button('reset');
		}
	});
}

function parse_initialLoadMovieTable() {
	var movie = new Parse.Query(Movie);
	var userCount;

	var user = new Parse.Query(Parse.User);
	user.count({
		success : function(count) {
			return count;
		},
		error : function(error) {
			// TODO Fehler
			alert("Ohoh");
		}
	}).then(function(count) {
		movie.find().then(function(movieResults) {
			_.each(movieResults, function(movieResult) {
				var row = {
					editButton : null,
					deleteButton : null,
					seen : "gesehen (" + movieResult.get('numberOfUsersSeen') + " von " + count + ")",
					numberOfStars : movieResult.get('avgRating'),
					movieTitle : movieResult.get('Title'),
					imdbID : movieResult.get('imdbID'),
					owner : movieResult.get('Owner').id
				};
				var edit = new Parse.Query(Edit);
				edit.equalTo("movieID", movieResult);
				edit.equalTo("userID", Parse.User.current());
				edit.find().then(function(editResults) {
					_.each(editResults, function(editResult) {
						if ( typeof (editResult) !== "undefined") {
							// es wurde ein Eintrag in ENDIT zu der Selektion gefunden
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
					});
					return row;
				}).then(function(row) {
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
					initiateTableRow(row.numberOfStars, row.movieTitle, row.imdbID, row.seen, row.editButton, row.deleteButton);
				});
			});
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
		// Return a promise that will be resolved when the delete is finished.
		return edit.save(null, {
			success : function(edit) {
				console.log("editEintragSpeichern");
			},
			error : function(edit, error) {
				// TODO schoenere Fehlermeldung
				alert('Failed to create new object, with error code: ' + error.message);
			}
		});
	});

	return promise;
}

function parse_calculateAverageRating(movieID, callback) {
	var edit = new Parse.Query(Edit);
	edit.equalTo("movieID", movieID);
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
			//alert("Error: " + error.code + " " + error.message);
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

					return parse_saveRating(numberOfStars, seen, movieResult);

				}
			});
			return promise;
		}).then(function() {
			console.log("movieSpeichern");
			var numberOfUserSeen;
			if (seen) {
				numberOfUserSeen = movieResult.get("numberOfUsersSeen") + 1;
			} else {
				numberOfUserSeen = movieResult.get("numberOfUsersSeen");
			}

			movieResult.set("numberOfUsersSeen", numberOfUserSeen);
			parse_calculateAverageRating(movieResult, function(average) {
				movieResult.set('avgRating', average);
				movieResult.save();
			});
		});
	});
}

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
