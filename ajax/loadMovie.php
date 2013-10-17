<?php
	$title = $_POST["movieTitle"];
//	preg_replace(" ", "%20", $title);
	$json = file_get_contents("http://www.omdbapi.com/?t=Titanic");
	$info = json_decode($json , true);
	
	$text = "Hallo ";
	
	foreach ($info as $teil) {
		$text = $text + " " + $teil;
	}
	
	echo $text;