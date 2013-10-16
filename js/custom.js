$(document).ready(function(){
	var addMovieToList = _.template('<tr><td><%- movieTitle %></td>'
									+'<td><%- movieProducer %></td>'
									+'<td><%- rating %></td>'
									+'<td><button class="btn btn-sm" title="Edit"><span class="glyphicon glyphicon-pencil"></span></button></td>'
									+'<td><button class="btn btn-sm" title="Delete"><span class="glyphicon glyphicon-trash"></span></button></td></tr>');
									
	/*$('#addFilm').on("click" , function(){
		$('#filmTitle').val($('#film').val());
		$('#filmModal').modal('show');
	});*/
	
	$('#saveFilm').on("click" , function(){
		
		$('#filmtable').append(addMovieToList({movieTitle: $('#filmTitle').val(), movieProducer: $('#producer').val(), rating: "super"}));
		$('#film').val("");
		$('#filmTitle').val("");
		$('#producer').val("");
		$('#filmModal').modal('hide');
	});
});