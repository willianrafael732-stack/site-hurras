<?php
declare(strict_types=1);

/*
 * Conexão com o banco.
 * Em produção, defina DB_HOST, DB_NAME, DB_USER e DB_PASS no ambiente
 * do servidor. Não coloque senhas reais neste arquivo.
 */
$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbName = getenv('DB_NAME') ?: 'rpg';
$dbUsername = getenv('DB_USER') ?: 'root';
$dbPassword = getenv('DB_PASS') ?: '';

$conexao = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);

if ($conexao->connect_errno) {
    error_log('Falha na conexão com o banco: ' . $conexao->connect_error);
    http_response_code(500);
    exit('Não foi possível conectar ao serviço.');
}

$conexao->set_charset('utf8mb4');
?>
