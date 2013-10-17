<div class="container">
	<h3><%- movieTitle %>
	<button type="button" id="closeDetailedView" class="close" aria-hidden="true">
		&times;
	</button></h3>
	<div class="row">
		<div class="col-xs-7">
			<label>Gesehen: </label><span><%- movieSeen %></span>
			<br>
			<label>Bewertung: </label><span><%- rating %></span>
		</div>
		<div class="col-xs-5">
			<img src="<%- picture %>" />
		</div>
	</div>
</div>