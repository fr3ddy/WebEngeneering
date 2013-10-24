<fieldset id="filterBox">
	<div class="form-group row">
		<div class="input-group col-sm-10">
			<span class="input-group-addon"><span class="glyphicon glyphicon-film"></span></span>
			<input type="text" class="form-control" id="movieTitle" name="movieTitle" placeholder="Film Titel">
		</div>
		<div class="col-sm-2">
			<button type="button" class="close" aria-hidden="true" onclick="removeTitleFilter()">
				×
			</button>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-10">
			<div class="btn-group" data-toggle="buttons">
				<label class="btn btn-primary">
					<input type="radio" name="options" id="movieWatched">
					Gesehen</label><label class="btn btn-primary">
					<input type="radio" name="options" id="movieNotWatched">
					Nicht Gesehen</label>
			</div>
		</div>
		<div class="col-sm-2">
			<button type="button" class="close" aria-hidden="true" onclick="removeWatchFilter()">
				×
			</button>
		</div>
	</div>
	<div class="row"><div class="col-xs-12">
	<button class="btn btn-primary form-control" id="submitFilter" onclick="filterTable()">
		Filtern
	</button></div></div>
</fieldset>