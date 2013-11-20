// Verbinde mit Parse
Parse.initialize("L6o5RS5o7y3L2qq0MdbUUx1rTm8dIzLVJR6etJ5K", "QyEYNDiJAI3ctZ9pZC8fX7ncgVsyQ665094o3nPA");

var Movie = Parse.Object.extend("Movie");
var Edit = Parse.Object.extend("Edit");
var Comment = Parse.Object.extend("Comment");

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
			parse_getErrorMessage(error);
		}
	});
}

function parse_loginUser(username, password) {
	Parse.User.logIn(username, password).then(function(user) {
		$('#menu1').removeClass("open");
		isLoggedInOrNot();
		allLoginActions();
		$('#submitLoginButton').button('reset');
	}).then(function() {
		parse_setWelcomeText();
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
	}, function(error) {
		return Parse.Promise.error(error);
	});
	return promise;
}

/* Beim Aufbau der Tabellen wird geschaut, ob ein Benutzer (wenn er angemeldet ist) einen Film bewertet hat
 * und wie er ihn bewertet hat. Hat er ihn noch nicht bewertet, so wird dies angezeigt */
function checkEdit(movieResult, userID, callback) {
	var promises = [];
	if (userID !== null) {
		var edit = new Parse.Query(Edit);
		edit.equalTo("movieID", movieResult);
		edit.equalTo("userID", userID);

		promises.push(edit.first().then(function(editResult) {
			if ( typeof (editResult) !== "undefined") {
				// es wurde ein Eintrag in EDIT zu der Selektion gefunden
				if (editResult.get('movieSeen')) {
					// Film wurde gesehen
					callback(seenText, editResult.get('rating'));
				} else {
					// Film wurde nicht gesehen
					callback(notSeenText, editResult.get('rating'));
				}
			} else {
				/* es wurde kein Eintrag in EDIT zu movieResult + userID gefunden.
				 * Daher wird gesehen / nicht gesehen auf nicht gesehen gesetzt,
				 * als Default-Wert und die Bewertung auf 0 Sterne
				 */

				callback(notSeenText, 0);
			}
		}, function(error) {
			return Parse.Promise.error(error);
		}));
	}
	return Parse.Promise.when(promises);
}

/* Initialisiere die Liste und fuelle sie mit allen Filmen der Datenbank */
function parse_initialLoadMovieTable() {
	var movie = new Parse.Query(Movie);
	var rows = [];

	// erstelle Ladebildschirm
	$('body').prepend('<div class="loading-Indicator"></div>');
	parse_countUsers().then(function(userCount) {
		movie.find().then(function(movieResults) {
			var promises = [];
			_.each(movieResults, function(movieResult, index) {
				var row = {
					trID : 'tr-' + ++index,
					editButton : null,
					deleteButton : null,
					seen : "Seen by " + movieResult.get('numberOfUsersSeen') + " of " + userCount + " Users",
					numberOfStars : movieResult.get('avgRating'),
					movieTitle : movieResult.get('Title'),
					imdbID : movieResult.get('imdbID'),
					owner : movieResult.get('Owner').id
				};

				if (Parse.User.current() !== null) {
					// angemeldet
					if (row.owner === Parse.User.current().id && row.owner !== null) {
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

				// wird nur vollstaendig ausgefuehrt, wenn ein User angemeldet ist
				promises.push(checkEdit(movieResult, Parse.User.current(), function(seen, stars) {
					row.seen = seen;
					row.numberOfStars = stars;
				}).then(function() {
					rows.push(initiateTableRow(row.trID, row.numberOfStars, row.movieTitle, row.imdbID, row.seen, row.editButton, row.deleteButton));
				}, function(error) {
					return Parse.Promise.error(error);
				}));
			});
			return Parse.Promise.when(promises);
		}).then(function() {
			$('#filmtable').html(rows).fadeIn(1000);

			//Loeche-Popover koennen erst an dieser Stelle den Zeilen hinzugefügt werden,
			//da diese nur existierenden Elementen zugeteilt werden können.
			for (var i = 1; i <= rows.length; i++) {
				/*Initialisiere PopOver fuer Delete-Button*/
				$('#tr-' + i).find('.delete').popover({
					trigger : 'focus',
					title : 'Löschen',
					content : popoverContent,
					html : 'true'
				});
			};
			$('body').find('.loading-Indicator').fadeOut(1000, function() {
				$(this).remove();
			});
		}, function(error) {
			parse_getErrorMessage(error);
		});
	});
}

/* Speichere neuen Film in MOVIE Tabelle ab, falls dieser nicht schon vorhanden ist */
function parse_saveMovie(movieTitle, imdbID, numberOfStars, seen, cb) {
	var check = new Parse.Query(Movie);
	check.equalTo('imdbID', imdbID);
	check.first(function(checkResult) {
		return checkResult;
	}).then(function(checkResult) {
		if (checkResult == null) {
			return true;
		}
		return Parse.Promise.error("Movie does already exists!");
	}).then(function() {
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

				cb(true);
			},
			error : function(movie, error) {
				cb(false);
			}
		});

	}, function(error) {
		// Tritt ein Fehler auf, dass z.B. der Film schon existiert, dann zeige dies als Fehlermeldung an und lade die Tabelle im Browser neu
		$('#createFilmModal').modal('hide');
		parse_getErrorMessage(error);
		parse_initialLoadMovieTable();
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
			},
			error : function(edit, error) {
				return Parse.Promise.error(error);
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
			if (results.length != 0) {
				var sum = 0;
				for (var i = 0; i < results.length; i++) {
					sum += results[i].get('rating');
				}
				callback(sum / results.length);
			} else {
				// Gibt es keinen Eintrag in der EDIT, die besagt, dass der Film schonmal gesehen wurde, so ist die durchscnittliche Bewertung 0!
				callback(0);
			}
		},
		error : function(error) {
			return Parse.Promise.error(error);
		}
	});
}

/* Aktualisiere oder speichere Bewertung eines Benutzers zu einem Film */
function parse_updateEntry(imdbID, numberOfStars, seen) {
	var movie = new Parse.Query(Movie);
	movie.equalTo('imdbID', imdbID);
	movie.first().then(function(movieResult) {
		return movieResult;
	}).then(function(movieResult) {
		var numberOfUserSeen;
		edit = new Parse.Query(Edit);
		edit.equalTo('userID', Parse.User.current());
		edit.equalTo('movieID', movieResult);

		edit.first().then(function(editResult) {
			var promise = Parse.Promise.as();
			promise = promise.then(function() {
				if ( typeof (editResult) != 'undefined') {
					// es gibt schon einen Eintrag zu dem Film und User in der Edit Tabelle
					if (editResult.get('movieSeen')) {
						/* der letzte aktuelle Wert in der EDIT ist "gesehen" ("true")
						 ziehe 1 von numberOfUsersSeen in MOVIE ab wenn zu nicht gesehen geaendert, ansonsten mach nichts */
						if (seen) {
							numberOfUserSeen = movieResult.get("numberOfUsersSeen");
						} else {
							numberOfUserSeen = movieResult.get("numberOfUsersSeen") - 1;
						}
					} else {
						/* der letzte aktuelle Wert in der EDIT ist "nicht gesehen" ("false")
						 / fuege 1 von numberOfUsersSeen in MOVIE hinzu wenn zu gesehen geaendert, ansonsten mach nichts */
						if (seen) {
							numberOfUserSeen = movieResult.get("numberOfUsersSeen") + 1;
						} else {
							numberOfUserSeen = movieResult.get("numberOfUsersSeen");
						}
					}
					editResult.set('rating', numberOfStars);
					editResult.set('movieSeen', seen);

					movieResult.set("numberOfUsersSeen", numberOfUserSeen);
					return editResult.save();
				} else {
					// es gibt noch keinen Eintrag zu dem Film und User in der Edit Tabelle, somit wird einer hinzugefuegt
					if (seen) {
						numberOfUserSeen = movieResult.get("numberOfUsersSeen") + 1;
					} else {
						numberOfUserSeen = movieResult.get("numberOfUsersSeen");
					}

					movieResult.set("numberOfUsersSeen", numberOfUserSeen);

					return parse_saveRating(numberOfStars, seen, movieResult);
				}
			}, function(error) {
				return Parse.Promise.error(error);
			});
			return promise;
		}).then(function() {
			// berechne durchschnittliche Bewertung des Films
			parse_calculateAverageRating(movieResult, function(average) {
				movieResult.set('avgRating', average);
				movieResult.save();
			});
		}, function(error) {
			parse_getErrorMessage(error);
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
				callback("User does not exist");
			}
		});
	}, function(error) {
		parse_getErrorMessage(error);
	});
}

/* Verabeitet die entstehenden Fehlermeldungen und zeigt sie als Leiste oben in der Webseite an */
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
		case Parse.Error.PASSWORD_MISSING:
			errorMessage = error.message;
			break;
		case Parse.Error.USERNAME_TAKEN:
			errorMessage = error.message;
			break;
		case Parse.Error.USERNAME_MISSING:
			errorMessage = error.message;
			break;
		case Parse.Error.OTHER_CAUSE:
			errorMessage = "There has been an unknown error. Please try again later";
			break;
		default:
			errorMessage = error;
			break;
	}

	//@formatter:off
	$('.customAlert').html('<div class="alert alert-dismissable">'
								+ errorMessage 
								+'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button></div>');
	//@formatter:on
}

function parse_facebookLoginSignUp() {
	Parse.FacebookUtils.logIn(null, {
		success : function(user) {
			$('#menu1').removeClass("open");
			changeLoginButtonOnFacebookLoginSignIn();
			$('#facebookButtonList').css("display", "block");
			FB.api('/me?fields=username,email', function(response) {
				Parse.User.current().setUsername(response.username);
				Parse.User.current().setEmail(response.email);
				Parse.User.saveAll(Parse.User.current(), {
					success : function() {
					},
					error : function(error) {
						console.error(error);
					}
				});
			});
		},
		error : function(user, error) {
			return Parse.Promise.error("User cancelled the Facebook login or did not fully authorize.");
		}
	}).then(function() {
		parse_setWelcomeText();
		parse_initialLoadMovieTable();
	}, function(error) {
		parse_getErrorMessage(error);
	});
}

/* Setze eine Begruessungsnachrit, wenn ein Benutzer sich angemeldet hat.
 * Diese erscheint in der Navigationsleiste und beinhaltet den Benutzernamen des angemeldeten Benutzers */
function parse_setWelcomeText() {
	var username;
	if (Parse.User.current() != null) {
		username = Parse.User.current().get("username");
	} else {
		username = "Guest";
	}
	$('#welcometext').find("name").html(username);
	$('#welcometext').slideToggle();
}

/* Loesche einen Film aus der MOVIE Tabelle. Aber nur, wenn kein anderer Benutzer diesen Bewertet hat.
 * Hat ein anderer Benutzer als der Besitzer den Film bewertet, wird der, der den Film bewertet hat zum neuen Besitzer. */
function parse_removeMovie(imdbID, cb) {
	var movie = new Parse.Query(Movie);
	movie.equalTo('imdbID', imdbID);

	// finde den zu loeschenden Film in der MOVIE Tabelle
	movie.first(function(checkResult) {
		return checkResult;
	}).then(function(checkResult) {
		if (checkResult._hasData) {
			return checkResult;
		}
		return Parse.Promise.error("Movie ID not found!");
	}).then(function(checkResult) {
		var editEntry = new Parse.Query(Edit);
		editEntry.equalTo('movieID', checkResult);
		editEntry.notEqualTo('userID', Parse.User.current());
		editEntry.include('userID');

		// Finde eine Bewertung eines anderen Benutzers, falls es eine gibt
		editEntry.first().then(function(entrie) {
			if ( typeof (entrie) != 'undefined') {
				checkResult.set('Owner', entrie.get('userID'));
				checkResult.save();

				// aendere den Besitzer des Films
				cb(false);
			} else {
				// entferne den Film
				checkResult.destroy();
				
				// entferne Eintrag aus der EDIT Tabelle
				var editDelete = new Parse.Query(Edit);
				editDelete.equalTo('movieID', checkResult);
				editDelete.equalTo('userID', Parse.User.current());
				
				editDelete.first().then(function(editResult) {
					editResult.destroy();
					cb(true);
				});
			}
		});
	}, function(error) {
		parse_getErrorMessage(error);
	});
}

/* Finde durschnittliche Bewertung eines Films mit Hilfe der imdbID in der MOVIE Tabelle */
function parse_getAvgRating(imdbID, cb) {
	var movie = new Parse.Query(Movie);
	movie.equalTo('imdbID', imdbID);
	movie.first().then(function(result) {
		cb(result.get('avgRating'));
	}, function(error) {
		parse_getErrorMessage(error);
	});
}

/* Baue eine Benutzeransicht auf und zeige diese an. Dafuer wird ein Benutzername ausgewahlt in der Detailansicht
 * oder der angemeldete Nutzer klickt auf seinen Namen in der Navigationsleiste. Anschliessend werden zwei Tabellen aufgebaut.
 * In der ersten stehen alle Filme, die ein Benutzer erstellt hat.
 * In der zweiten alle Filme, die ein Benutzer bewertet hat ausgenommen der Filme, die schon in der ersten Tabelle stehen.
 * Ist der angemeldete Benutzer zudem in seiner eigenen Benutzeransicht, hat er dort die Moeglichkeit sein Passwort zu aendern */
function parse_getUserView(username, callback) {
	var movieOfUser = "";
	var user = new Parse.Query(Parse.User);
	user.equalTo('username', username);

	// Ueberpruefe ob Benutzer in USER Tabelle existiert und finde das passende Benutzer-Objekt
	user.first().then(function(userName) {
		return userName;
	}).then(function(userName) {
		var editButton;
		var deleteButton;

		if (Parse.User.current() !== null) {
			// angemeldet
			if (userName.id === Parse.User.current().id && userName !== null) {
				// angemeldeter User, der den Film "besitzt"
				editButton = editButtonActive;
				deleteButton = deleteButtonActive;

			}
		} else {
			//nicht angemeldet, daher nur Berechtigung zum Anschauen
			editButton = editButtonNone;
			deleteButton = deleteButtonNone;
		}

		var movie = new Parse.Query(Movie);
		movie.equalTo('Owner', userName);

		// Finde die Filme in der Tabelle, die dem Benutzer gehoeren dessen Namen geklickt wurde
		movie.find().then(function(movies) {
			var userSpecificButtons = "";
			//@formatter:off
			if (Parse.User.current() !== null && Parse.User.current().id === userName.id && typeof(Parse.User.current().attributes.authData) == "undefined") {
				// ist der Benutzername der geklickt wurde gleich dem Benutzernamen des angemeldet Benutzers, so darf er sein Passwort in der Benutzeransicht aendern
				userSpecificButtons = '<button id="changePassword" class="btn btn-default btn-sm">Change Password</button>'
										+ '<div class="panel panel-default" id="changePasswordForm" style="width: 40%">'
										+ '<div class="panel-heading">Change password</div>'
										+ '<div class="panel-body">'
										+ '<div class="form-group">'
											+ '<input class="form-control" type="password" placeholder="new password">'
											+ '<input class="form-control" type="password" placeholder="repeat new password">'
											+ '<button type="button" class="btn btn-primary btn-sm form-control pull-right" id="saveChangePassword" data-loading-text="Changing Password..." data-complete-text="Password changed!" style="width: 35%">Change Password</button>'
										+ '</div></div></div>';
			}
			// Schritt 1: Aufbau der Benutzeransicht
			movieOfUser = '<div class="container">'
								+'<h4>Information about '+ userName.get('username') +'</h4>' + userSpecificButtons 
								+'<div class="panel panel-default">'
								+'<div class="panel-heading">User created following movies with following ratings</div>'
								+'<table class="table">'
									+'<thead><tr id="tr-0"><th></th><th>Title</th><th>Seen / not seen</th><th>Rating</th><th></th><th></th></tr></thead>'
									+'<tbody id="userCreatedTable">';
			//@formatter:on
			var promises = [];
			var i = 0;
			_.each(movies, function(movie) {
				promises.push(checkEdit(movie, userName, function(seen, stars) {
					i++;
					var trID = 'tr-' + i;
					// Schritt 2: Benutzeransicht mit Filmen fuellen die der ausgewaehlte Benutzer erstellt hat
					movieOfUser += initiateTableRow(trID, stars, movie.get('Title'), movie.get('imdbID'), seen, editButton, deleteButton);

				}, function(error) {
					return Parse.Promise.error(error);
				}));
			});
			return Parse.Promise.when(promises);
		}).then(function() {
			// Schritt 3: Alles vorbereiten um nachsten Abschnitt in Benutzeransicht aufzubauen
			//@formatter:off
			movieOfUser += '</tbody>'
					+'</table></div>'
					+'<div class="panel panel-default">'
					+'<div class="panel-heading">User rated following movies with following ratings</div>'
					+'<table class="table">'
						+'<thead>'
							+'<tr id="tr-0"><th></th><th>Title</th><th>Seen / not seen</th><th>Rating</th><th></th><th></th></tr>'
						+'</thead>'
						+'<tbody id="userRatedTable">';
			//@formatter:on
			var edit = new Parse.Query(Edit);

			edit.equalTo('userID', userName);
			edit.include('movieID');

			// Schritt 4: Finde die Filme, die der ausgewaehlte Benutzer bewertet hat
			edit.find().then(function(edits) {
				var promises = [];
				var i = 0;
				_.each(edits, function(editResult) {
					// Schritt 5: Aber nur die Filme von denen der ausgewaehlte Benutzer nicht auch der Besitzer ist
					if ( typeof (editResult.get('movieID')) !== 'undefined' && editResult.get('movieID').get('Owner').id !== userName.id) {
						if (Parse.User.current() !== null) {
							// angemeldet
							if (userName.id === Parse.User.current().id) {
								// angemeldeter User, der den Film "besitzt"
								editButton = editButtonActive;
								deleteButton = deleteButtonInactive;
							}
						} else {
							//nicht angemeldet, daher nur Berechtigung zum Anschauen
							editButton = editButtonNone;
							deleteButton = deleteButtonNone;
						}

						promises.push(checkEdit(editResult.get('movieID'), userName, function(seen, stars) {
							i++;
							var trID = 'tr-' + i;
							// Schritt 6: Fuege die gefundenen Filme mit der Bewertung des ausgewaehlten Nutzers der Benutzersicht unter "User rated" hinzu
							movieOfUser += initiateTableRow(trID, stars, editResult.get('movieID').get('Title'), editResult.get('movieID').get('imdbID'), seen, editButton, deleteButton);
						}, function(error) {
							return Parse.Promise.error(error);
						}));
					}
				});
				return Parse.Promise.when(promises);
			}).then(function() {
				// Schritt 7: Schliesse Benutzeransicht ab und zeige diese durch den callback(...) an
				movieOfUser += '</tbody></table></div></div>';
				callback(movieOfUser);
			}, function(error) {
				return Parse.Promise(error);
			});
		}, function(error) {
			parse_getErrorMessage(error);
		});
	});
}

/* Aendere das Passwort des angemeldeten Benutzers. Da der Benutzer sein altes Passwort eingeben musste, um sich anzumelden, wird es nicht nocheinmal
 * uberprueft sondern direkt das neue Passwort gesetzt */
function parse_changePassword() {
	var newPassword = $.trim($(this).parent().find('input:first').val());
	var newPasswordRepeats = $.trim($(this).parent().find('input:last').val());
	var that = this;
	if (newPassword === newPasswordRepeats) {
		$(this).button('loading');
		// Passwoerter in beiden Feldern sind gleich
		var user = new Parse.Query(Parse.User);
		user.get(Parse.User.current().id, {
			success : function(object) {
				object.set('password', newPassword);
				object.save();
				$(that).button('complete').addClass('btn-success').removeClass('btn-primary');
			}
		});
	} else {
		parse_getErrorMessage('Passwords do not match each other');
	}
}

function parse_saveComment(imdbId, commentText, cb) {
	var comment = new Comment();

	comment.set("imdbID", imdbId);
	comment.set("userID", Parse.User.current());
	comment.set("commentText", commentText);

	comment.save(null, {
		success : function(comment) {
			cb(comment.id);
		},
		error : function(error) {
		}
	});
}

function parse_getComments(imdbID, owner, cb) {
	var comments = '<div id="comment-box">' + '<h3><span class="label label-default">User Comments</span></h3>';
	var comment = new Parse.Query(Comment);

	comment.equalTo('imdbID', imdbID);
	comment.include('userID');
	comment.find().then(function(results) {
		_.each(results, function(result) {
			var text = result.get('commentText');
			var user = result.get('userID').get('username');
			var date = result.createdAt;

			var dd = date.getDate();
			var mm = date.getMonth() + 1;
			//January is 0!

			var yyyy = date.getFullYear();
			var date = dd + "." + mm + "." + yyyy;

			var button;
			if (Parse.User.current() != null && result.get('userID').id == Parse.User.current().id || owner == true) {
				button = "x";
			} else {
				button = "";
			}

			var newComment = commentField({
				comment : text,
				author : user,
				date : date,
				button : button,
				commentID : result.id
			});

			comments = comments + newComment;
		});

		//@formatter:off
		if(Parse.User.current() != null){
			comments = comments + '<div class="row" id="comment-textarea">'
										+ '<div class="col-xs-7">' 
											+ '<textarea class="form-control" rows="3"></textarea>'
											+ '<p>'
									 			+ '<button type="button" id="sendComment" class="btn btn-primary btn-sm pull-right">Comment</button>'
											+ '</p>'	
										+ '</div>'
									+ '</div>';			
		}

		comments = comments	+ '</div>';
		//@formatter:on
		cb(comments);

	}, function(error) {
		parse_getErrorMessage(error);
	});
}

function parse_deleteComment(commentID, cb) {
	var comment = new Parse.Query(Comment);
	comment.equalTo('objectId', commentID);

	comment.first(function(result) {
		result.destroy();
		cb();
	}, function(error) {
		parse_getErrorMessage(error);
	});
}
