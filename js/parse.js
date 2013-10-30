// Connect to Parse
Parse.initialize("L6o5RS5o7y3L2qq0MdbUUx1rTm8dIzLVJR6etJ5K", "QyEYNDiJAI3ctZ9pZC8fX7ncgVsyQ665094o3nPA");

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

function parse_saveMovie(movieTitle, imdbID, numberOfStars, seen) {
	var Movie = Parse.Object.extend("Movie");
	var movie = new Movie();

	movie.set("imdbID", imdbID);
	movie.set("Title", movieTitle);
	movie.set("Owner", Parse.User.current());

	movie.save(null, {
		success : function(movie) {
			// Execute any logic that should take place after the object is saved.
			parse_saveRating(numberOfStars, seen, movie);
		},
		error : function(movie, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and description.
			alert('Failed to create new object, with error code: ' + error.description);
		}
	});
}

function parse_saveRating(numberOfStars, seen, movie) {
	var Edit = Parse.Object.extend("Edit");
	var edit = new Edit();
	
	edit.set("rating", numberOfStars);
	edit.set("movieSeen", seen);
	// Object of Movie
	edit.set("movieID", movie);
	// Object of User
	edit.set("userID", Parse.User.current());

	edit.save(null, {
		success : function(edit) {
			// Execute any logic that should take place after the object is saved.
		},
		error : function(edit, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and description.
			alert('Failed to create new object, with error code: ' + error.description);
		}
	});
}
