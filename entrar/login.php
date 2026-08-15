<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/local.php';

$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login = trim((string)($_POST['login'] ?? ''));
    $senha = (string)($_POST['senha'] ?? '');

    $stmt = $conexao->prepare('SELECT id, usuario, senha FROM usuarios WHERE email = ? OR usuario = ? LIMIT 1');
    $stmt->bind_param('ss', $login, $login);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if ($user && password_verify($senha, $user['senha'])) {
        session_regenerate_id(true);
        $_SESSION['usuario_id'] = (int)$user['id'];
        $_SESSION['usuario'] = $user['usuario'];
        header('Location: ../funcoes/inicio.html');
        exit;
    }

    $msg = 'Usuário/e-mail ou senha inválidos.';
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>Login — Nexalis</title>
<link rel="stylesheet" href="../site.css">
</head>
<body>
<main class="login-box" style="max-width:420px;margin:10vh auto;padding:2rem">
    <h1>🜂 Portal Arcano</h1>
    <?php if ($msg): ?><p role="alert"><?= htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <form method="post" autocomplete="on">
        <label for="login">Usuário ou e-mail</label>
        <input id="login" name="login" type="text" autocomplete="username" required>
        <label for="senha">Senha</label>
        <input id="senha" name="senha" type="password" autocomplete="current-password" required>
        <button type="submit">Entrar no Reino</button>
    </form>
    <p><a href="cadastro.php">Registrar na Guilda</a></p>
</main>
</body>
</html>
