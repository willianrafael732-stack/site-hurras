<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/local.php';

$msg = '';
$ok = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = trim((string)($_POST['usuario'] ?? ''));
    $email = trim((string)($_POST['email'] ?? ''));
    $senha = (string)($_POST['senha'] ?? '');

    if (!preg_match('/^[A-Za-zÀ-ÿ0-9_ -]{3,40}$/u', $usuario)) {
        $msg = 'Escolha um usuário entre 3 e 40 caracteres.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
        $msg = 'Informe um e-mail válido.';
    } elseif (strlen($senha) < 10) {
        $msg = 'A senha deve ter pelo menos 10 caracteres.';
    } else {
        $hash = password_hash($senha, PASSWORD_DEFAULT);
        $stmt = $conexao->prepare('INSERT INTO usuarios (usuario, email, senha) VALUES (?, ?, ?)');
        $stmt->bind_param('sss', $usuario, $email, $hash);
        if ($stmt->execute()) {
            $ok = true;
            $msg = 'Cadastro realizado. Agora você pode entrar.';
        } elseif ($conexao->errno === 1062) {
            $msg = 'Usuário ou e-mail já cadastrado.';
        } else {
            error_log('Erro ao cadastrar usuário: ' . $conexao->error);
            $msg = 'Não foi possível concluir o cadastro.';
        }
        $stmt->close();
    }
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>Cadastro — Nexalis</title>
<link rel="stylesheet" href="../site.css">
</head>
<body>
<main class="box" style="max-width:420px;margin:10vh auto;padding:2rem">
    <h1>📜 Cadastro</h1>
    <?php if ($msg): ?>
        <p role="status"><?= htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') ?></p>
    <?php endif; ?>
    <form method="post" autocomplete="on">
        <label for="usuario">Usuário</label>
        <input id="usuario" name="usuario" type="text" minlength="3" maxlength="40" autocomplete="username" required>
        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" maxlength="254" autocomplete="email" required>
        <label for="senha">Senha</label>
        <input id="senha" name="senha" type="password" minlength="10" autocomplete="new-password" required>
        <button type="submit">Cadastrar</button>
    </form>
    <p><a href="login.php">Voltar ao login</a></p>
</main>
</body>
</html>
