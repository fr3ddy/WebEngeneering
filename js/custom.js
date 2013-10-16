var selectedRowId;
$(document).ready(function(){
	var addMovieToList = _.template('<tr id="<%- rowID %>"><td class="tableFilmTitle"><%- movieTitle %></td>'
									+'<td class="tableProducer"><%- movieProducer %></td>'
									+'<td class="tableRating"><%- rating %></td>'
									+'<td><button class="btn btn-sm edit" title="Edit"><span class="glyphicon glyphicon-pencil"></span></button></td>'
									+'<td><button class="btn btn-sm" title="Delete"><span class="glyphicon glyphicon-trash"></span></button></td></tr>');
									
	/*$('#addFilm').on("click" , function(){
		$('#filmTitle').val($('#film').val());
		$('#filmModal').modal('show');
	});*/
	
	$('#saveFilm').on("click" , function(){
/*---------------------------------ID Ermitteln---------------------------------------------------------------------------------------------------------*/
		var newID = $('#filmtable').find('tr').last().attr('id');		//von der letzten Zeile in der Tabelle wir die ID gesucht um die neue zu ermitteln
		
		if(typeof newID == 'undefined'){
			var newID = 'tr-1';							//falls noch keine Zeile existiert
		}else{
			var tmpId = newID.split('-');				//ID der letzten Zeile splitten (ID = "tr-ZAHL")
			tmpId[1] = parseInt(tmpId[1]) + 1;			//Anzahl der Zeilen steht im 2. Feld, muss von String in Integer geparst werden
			newID = 'tr-' + tmpId[1];					//ID für die neue Zeile zusammensetzen
		}
/*--------------------------------Tabelleneintrag hinzufügen---------------------------------------------------------------------------------------------*/		
		$('#filmtable').append(addMovieToList({rowID: newID, movieTitle: $('#filmTitle').val(), movieProducer: $('#producer').val(), rating: "super"}));
		$('#film').val("");
		$('#filmTitle').val("");
		$('#producer').val("");
		$('#createFilmModal').modal('hide');
	});	
	$('#changeMovie').on("click" , function(){
		$('#filmtable').find('#'+selectedRowId).find('.tableFilmTitle').text($('#filmTitleEdit').val());
		$('#filmtable').find('#'+selectedRowId).find('.tableProducer').text($('#producerEdit').val());
		$('#film').val("");
		$('#filmTitleEdit').val("");
		$('#producerEdit').val("");
		$('#editFilmModal').modal('hide');
	});
	
	$('#list').on('click', '.edit', function(){
		var title 		= $(this).parent().parent().find('.tableFilmTitle').text();
		var producer	= $(this).parent().parent().find('.tableProducer').text();
		selectedRowId	= $(this).parent().parent().attr('id');

		$('#editFilmModal').modal('show');
		$('#filmTitleEdit').val(title);
		$('#producerEdit').val(producer);
		
	});
});