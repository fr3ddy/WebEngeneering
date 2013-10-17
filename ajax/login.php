<?php
	$username = $_POST["username"];
	$password = $_POST["password"];
	
	$correctPassword = "test";
	$correctUser = "test";
	
	if($username == $correctUser && $password == $correctPassword){
		echo '<button class="btn btn-default btn-lg" id="logoutButton">
			<span class="glyphicon glyphicon-remove-circle"></span> Logout
		  </button>';
	}elseif(($username == "" || $username != $correctUser) && ($password == "" || $password != $correctPassword)){
		echo "";	
	}elseif($username == "" || $username != $correctUser){
		echo "muser";
	}elseif($password == "" || $password != $correctPassword){
		echo "mpw";
	}
?>