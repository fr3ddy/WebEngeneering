<?php
	$title = $_POST["movieTitle"];
	
	$title = preg_replace("{[ \t]+}", "%20", $title);
	
	$search = "http://www.omdbapi.com/?t=".$title;
	
	$json = file_get_contents($search);
	$info = json_decode($json , true);

	//Release - Runtime - Genre - Director - Actors

		$output = "";
	if($info["Response"] == "True"){
		$output .= $info["Released"];
		$output .= " - ";
		$output .= $info["Runtime"];
		$output .= " - ";
		$output .= $info["Genre"];
		$output .= " - ";
		$output .= $info["Director"];
		$output .= " - ";
		$output .= $info["Actors"];
		$output .= " - ";
		if($info["Poster"] != "N/A"){
			$output .= $info["Poster"];
		}else{
			$output .= "img/noposter.png";
		}
	}
	
	echo $output;
	
?>