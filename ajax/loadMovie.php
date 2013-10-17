<?php
	$title = $_POST["movieTitle"];
	
	$title = preg_replace("{[ \t]+}", "%20", $title);
	
	$search = "http://www.omdbapi.com/?t=".$title;
	
	$json = file_get_contents($search);
	$info = json_decode($json , true);


	if($info["Response"] != "False" && $info["Poster"] != "N/A"){
		echo $info["Poster"];
	}else{
		echo "img/noposter.png";
	}
	
?>