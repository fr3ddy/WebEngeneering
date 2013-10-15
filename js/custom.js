$(document).ready(function(){
	$('#addFilm').on("click" , function(){
		$('#finalFilm').val($('#film').val());
		$('#filmModal').modal('show');
	});
	
	$('#saveFilm').on("click" , function(){
		
		$('#filmtable').append("<tr><td>"+ $('#finalFilm').val() +"</td><td>"+ $('#produzent').val() +"</td><td></td></tr>");
		$('#film').val("");
		$('#finalFilm').val("");
		$('#produzent').val("");
		$('#filmModal').modal('hide');
	});
});