<?php

$dbHost = 'localhost';
$dbUsername = 'root';
$dbPassword = '';
$dbName = 'rpg';

$conexao = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);

if($conexao->connect_error){
    die("Erro na conexão");
}

?>