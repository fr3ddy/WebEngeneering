var selectedRowId;
$(document).ready(function(){
	var addMovieToList = _.template('<tr id="<%- rowID %>"><td class="tableFilmTitle"><%- movieTitle %></td>'
									+'<td class="tableMovieSeen"><%- movieSeen %></td>'
									+'<td class="tableRating"><%- rating %></td>'
									+'<td><button class="btn btn-sm edit" title="Edit"><span class="glyphicon glyphicon-pencil"></span></button></td>'
									+'<td><button class="btn btn-sm delete" title="Delete"><span class="glyphicon glyphicon-trash"></span></button></td></tr>');
	
	var detailedMovieView = _.template('<div class="panel panel-default" id="detailedView">'
											+'<div class="panel-heading">'+
											+'<h3 class="panel-title"><%- movieTitle %></h3>'
											+'</div>'
											+'<div class="panel-body">'
												+'<label>Gesehen: </label><span><%- movieSeen %></span><br>	'
												+'<label>Bewertung: </label><span><%- rating %></span>'
											+'</div>'
										+'</div>');
										
	/*Speichere-Button auf Modal 'createFilmModal'*/
	$('#saveFilm').on("click" , function(){
/*---------------------------------ID Ermitteln---------------------------------------------------------------------------------------------------------*/
		var newID = $('#filmtable').find('tr').last().attr('id');		//von der letzten Zeile in der Tabelle wir die ID gesucht um die neue zu ermitteln
		
		if(typeof newID == 'undefined'){
			var newID = 'tr-1';							//falls noch keine Zeile existiert
		}else{
			var tmpId = newID.split('-');				//ID der letzten Zeile splitten (ID = "tr-ZAHL")
			tmpId[1] = parseInt(tmpId[1]) + 1;			//Anzahl der Zeilen steht im 2. Feld, muss von String in Integer geparst werden
			newID = 'tr-' + tmpId[1];					//ID f�r die neue Zeile zusammensetzen
		}
/*--------------------------------Tabelleneintrag hinzuf�gen---------------------------------------------------------------------------------------------*/		
		$('#filmtable').append(addMovieToList({rowID: newID, movieTitle: $('#filmTitle').val(), movieSeen: $('#movieSeen').val(), rating: "super"}));
		
		/*------------------------Initialisiere PopOver f�r Delete-Button--------------------------------------------------------------------------------*/
		$('#'+newID).find('.delete').popover({title: 'L�schen', content:'Wollen Sie den Film wirklich l�schen?<br><button type="button" class="btn btn-default" onclick="$(this).parent().parent().parent().find(&quot;.delete&quot;).popover(&quot;toggle&quot;)">Nein</button><button type="button" class="btn btn-primary" onclick="removeMovie($(this))">Ja</button>', html: 'true'});
		
		$('#film').val("");
		$('#filmTitle').val("");
		$('#movieSeen').val("");
		$('#createFilmModal').modal('hide');
	});	
	
	/*�ndere-Button auf Modal 'editFilmModal'*/
	$('#changeMovie').on("click" , function(){
		$('#filmtable').find('#'+selectedRowId).find('.tableFilmTitle').text($('#filmTitleEdit').val());
		$('#filmtable').find('#'+selectedRowId).find('.tableMovieSeen').text($('#movieSeenEdit').val());
		$('#film').val("");
		$('#filmTitleEdit').val("");
		$('#movieSeenEdit').val("");
		$('#editFilmModal').modal('hide');
	});
	
	/*Editierbutton in Filmeintrag*/
	$('#list').on('click', '.edit', function(){
		var title 		= $(this).parent().parent().find('.tableFilmTitle').text();
		var movieSeen	= $(this).parent().parent().find('.tableMovieSeen').text();
		selectedRowId	= $(this).parent().parent().attr('id');

		$('#editFilmModal').modal('show');
		$('#filmTitleEdit').val(title);
		$('#movieSeenEdit').val(movieSeen);
		
	});
	
/*--------------------------------Detailansicht f�r Film ------------------------------------------------------------------------------------------------*/	
	/*L�sche-Button in Filmeintrag*/	
	$('#list').on('click', '.delete', function(){
		$(this).popover();
	});
	
/*--------------------------------Detailansicht f�r Film ------------------------------------------------------------------------------------------------*/	
	$('#list').on('dblclick', 'tr', function(event) {
		$('body').prepend(detailedMovieView({movieTitle: "Holla", movieSeen: "kadf	", rating: "super"}));
		//$('#detailedView').css({'z-index': '1060'});
		$('#detailedView').show('fast');
		event.stopPropagation();
	});

	$(document).click(function() {
		$('#detailedView').hide();
		$('#detailedView').remove();
	});
});

function removeMovie (element){
	$(element).parent().parent().parent().parent().remove();
}
