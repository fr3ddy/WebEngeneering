$(document).ready(function(){
	var addMovieToList = _.template('<tr><td><%- movieTitle %></td>'
									+'<td><%- movieProducer %></td>'
									+'<td><%- rating %></td>'
									+'<td><button class="btn edit" title="edit"></button></td>'
									+'<td><button class="btn delete" title="delete"></button></td></tr>');
									
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