<?php
	$title = $_POST["movieTitle"];
	preg_replace(" ", "%", $title);
	$json = file_get_contents("http://www.omdbapi.com/?t=".$title);
	$info = json_decode($json , true);
	
	$poster = $info["Poster"];
	
	echo '<img src="'.$poster.'" />';
?>