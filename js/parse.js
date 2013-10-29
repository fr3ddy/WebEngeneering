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
					setTimeout('$("#usernameInput").focus()', 100);
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
