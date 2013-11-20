$(document).ready(function() {
	parse_initializeFacebook();
	$('#facebookMovieList').hide();
	if (Parse.User.current() != null && typeof (Parse.User.current().attributes.authData.facebook.id) != "undefined") {
		$('#facebookButtonList').css("display", "block");
	}
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
	loadMoviesUserLiked();
});

function closeFacebookMovieView() {
	$('#facebookMovieList').stop().animate({
		left : "-100%"
	}, function() {
		$('#facebookMovieList').hide();
		loadMoviesUserLiked();
	});
}

function movieDoesNotExist(movieData, callback) {
	var movieName = movieData.name.replace(" ", "%20");
	$.getJSON("http://www.omdbapi.com/?t=" + movieName).done(function(data) {
		movieData.imdbID = data.imdbID;
	}).then(function() {
		var check = new Parse.Query(Movie);
		check.equalTo('imdbID', movieData.imdbID);
		check.first(function(checkResult) {
			movieData.checkResult = checkResult;
		}).then(function() {
			if ( typeof (movieData.checkResult) == "undefined") {
				callback(movieData);
			} else {
				callback(false);
			}
		});
	});
}
var maxAmout;
function loadMoviesUserLiked() {
	$('#facebookMovies').hide();
	$('#facebookMoviesProgressBar').show();
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
				$('#facebookMovies').html("");
				//Zum erhalten des richtigen Datensatzes
				var movieData = response.data;
				if(movieData.length < 8){
					maxAmount = movieData.length;
				}else{
					maxAmount = 8;
				}
				for (var x = 0; x < movieData.length; x++) {
					//Zum schönen formatieren von der Row
					var counter = 0;
					var alreadyInsertedMovies = new Array();
					FB.api('/' + movieData[x].id + '?fields=category', function(responsecat) {
						for (var i = 0; i < movieData.length; i++) {
							if (responsecat.category == "Movie" && typeof (movieData[i].cover) != "undefined") {
								movieDoesNotExist(movieData[i], function(movieDataObject) {
									if (movieDataObject != false && $.inArray(movieDataObject.name, alreadyInsertedMovies) < 0 && counter < 8) {
										//Render into Movielist
										if (counter % 4 == 0) {
											$('#facebookMovies').append("<div class='row'>");
										}
										//@formatter:off;
										$('#facebookMovies').append('<div class="col-xs-3"><div class="panel panel-default"><div class="panel-heading">'
													 + movieDataObject.name.replace("Movie" , "").replace("The Movie" , "").replace("Trilogy" , "") + '<div class="pull-right" style="margin-top: -5px;"><button class="btn btn-default btn-sm facebookAddMovie"><span class="glyphicon glyphicon-plus-sign"></span></button></div></div><div class="panel-body">'
													 + '<img class="img-thumbnail" src="'+movieDataObject.cover.source+'"/></div></div></div>');
										//@formatter:on;
										alreadyInsertedMovies[counter] = movieDataObject.name;
										if (counter % 4 == 0) {
											$('#facebookMovies').append("</div>");
										}
										counter++;
										if (counter < maxAmount) {
											var val = counter * (100 / maxAmount);
											$('#facebookMoviesProgressBar').find('.progress-bar').css("width", val + "%");
											$('#facebookMoviesProgressBar').find('.progress-bar').css("aria-valuenow", val);
										} else if (counter == maxAmount) {
											$('#facebookMoviesProgressBar').hide();
											$('#facebookMovies').show();
											$('#facebookMoviesProgressBar').find('.progress-bar').css("width", "0%");
											$('#facebookMoviesProgressBar').find('.progress-bar').css("aria-valuenow", "0");
										}
									}

								});
							}
						}
					});
				}
				$('#facebookMovies').on('click', '.facebookAddMovie', function() {
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
}
