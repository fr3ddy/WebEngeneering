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
	if (Parse.User.current() == null) {
		// lade Daten, als unangemeldeter User mit Durchschnittsbewertung und ohne dass gesehen/nicht gesehen angezeigt wird
		var movie = new Parse.Query(Movie);
		movie.find().then(function(results) {
			_.each(results, function(object) {
				initiateTableRow(object.get('avgRating'), object.get('Title'), object.get('imdbID'));
			});
		}, function(error) {
			alert("Error: " + error.code + " " + error.message);
		});
	} else {
		// lade Daten, als angemeldeter User mit eigener Bewertung und gesehen/nicht gesehen
		var movie = new Parse.Query(Movie);
		movie.find().then(function(results) {
			_.each(results, function(object) {
				var edit = new Parse.Query(Edit);
				// nur die Filme waehlen
				edit.equalTo("movieID", object);
				edit.find().then(function(editResults) {
					_.each(editResults, function(editResult) {
						if(editResult.get('userID') == Parse.User.current()) {
							initiateTableRow(editResult.get('rating'), object.get('Title'), object.get('imdbID'));
						} else {
							initiateTableRow("0", object.get('Title'), object.get('imdbID'));
						}
					});
				});
				
			});
		}, function(error) {
			alert("Error: " + error.code + " " + error.message);
		});
	}
}

function parse_saveMovie(movieTitle, imdbID, numberOfStars, seen) {
	var movie = new Movie();

	movie.set("imdbID", imdbID);
	// TODO berechne durchscnittliches Rating
	movie.set("avgRating", numberOfStars);
	movie.set("Title", movieTitle);
	movie.set("Owner", Parse.User.current());

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

function calculateAverageRating(numberOfStars, movieID) {
	var edit = new Edit();
	edit.equalTo("movieID", movieID);
	edit.find({
		success : function(results) {
			var sum = 0;
			for (var i = 0; i < results.length; i++) {
				sum += results[i].get('rating');
			}
			return sum / result.length;
		},
		error : function(error) {
			// Er kann nicht nichts finden, weil wir ihm ja eine MovieID uebergeben
			//alert("Error: " + error.code + " " + error.message);
		}
	});
}

function parse_saveRating(numberOfStars, seen, movie) {
	var edit = new Edit();

	edit.set("rating", numberOfStars);
	edit.set("movieSeen", seen);
	// Object von Movie
	edit.set("movieID", movie);
	// Object von User
	edit.set("userID", Parse.User.current());

	edit.save(null, {
		success : function(edit) {
		},
		error : function(edit, error) {
			// TODO schoenere Fehlermeldung
			alert('Failed to create new object, with error code: ' + error.description);
		}
	});
}
