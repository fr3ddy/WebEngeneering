$(document).ready(function() {
	parse_initializeFacebook();

	$('#facebookMovieList').hide();
	$('#facebookMovieList').stop().animate({
		left : "-100%"
	});

	$('#facebookButtonList').on('click', function() {
		var status = $('#facebookMovieList').css("display");
		if (status == "block") {
			closeFacebookMovieView();
		} else {
			$('#facebookMovieList').show();
			$('#facebookMovieList').animate({
				left : "0%"
			});
		}
	});

	$('#closeFacebookView').on('click', function() {
		closeFacebookMovieView();
	});

	//LOADING FACEBOOK MOVIES
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			// the user is logged in and has authenticated your
			// app, and response.authResponse supplies
			// the user's ID, a valid access token, a signed
			// request, and the time the access token
			// and signed request each expire
			// var uid = response.authResponse.userID;
			// var accessToken = response.authResponse.accessToken;
			FB.api('/me/movies?fields=id,name,cover', function(response) {
				$('#facbeookMovies').html("");
				//Zum schönen formatieren von der Row
				var counter = 0;
				//Zum erhalten des richtigen Datensatzes
				var movieData = response.data;
				for (var x = 0; x < movieData.length; x++) {
					FB.api('/' + movieData[x].id + '?fields=category', function(responsecat) {
						for (var i = 0; i < movieData.length; i++) {
							if (responsecat.category == "Movie" && typeof (movieData[i].cover) != "undefined") {
								//Render into Movielist
								if (counter % 4 == 0) {
									$('#facbeookMovies').append("<div class='row'>");
								}
								//@formatter:off;
									$('#facbeookMovies').append('<div class="col-xs-3"><div class="panel panel-default"><div class="panel-heading">'
												 + movieData[i].name + '<div class="pull-right" style="margin-top: -5px;"><button class="btn btn-default btn-sm facebookAddMovie"><span class="glyphicon glyphicon-plus-sign"></span></button></div></div><div class="panel-body">'
												 + '<img class="img-thumbnail" src="'+movieData[i].cover.source+'"/></div></div></div>');
									//@formatter:on;
								if (counter % 4 == 0) {
									$('#facbeookMovies').append("</div>");
								}
								counter++;
							}
							if (counter == 8)
								return;
						}
					});
				}
				$('#facbeookMovies').on('click', '.facebookAddMovie' , function() {
					closeFacebookMovieView();
					showCreateFilmModal();
					$('#createFilmModal').find('#filmTitle').val($(this).parent().parent().text());
				});

			});
		} else if (response.status === 'not_authorized') {
			// the user is logged in to Facebook,
			// but has not authenticated your app
		} else {
			// the user isn't logged in to Facebook.
		}
	}, true);
});

function closeFacebookMovieView() {
	$('#facebookMovieList').stop().animate({
		left : "-100%"
	}, function() {
		$('#facebookMovieList').hide();
	});
}
