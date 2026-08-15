# Revisão do Nexalis / Hurras Fantasy

## O que foi ajustado
- Padronização de `lang="pt-BR"` nas páginas HTML.
- Inclusão de viewport onde faltava.
- Inclusão de título básico em documentos sem `<title>`.
- `Referrer-Policy` nas páginas.
- Links externos recebem `noopener noreferrer`.
- Imagens sem `alt` recebem texto alternativo e passam a usar `loading="lazy"` e `decoding="async"`.
- Removido o login demonstrativo que aceitava `mago / 123`.
- Criado login real em `entrar/login.php`, usando `password_verify()` e sessão.
- Criado cadastro real em `entrar/cadastro.php`, usando `password_hash()` e consultas preparadas.
- Conexão MySQL endurecida em `entrar/local.php`, com `utf8mb4` e mensagens de erro sem detalhes do banco.
- Criado `entrar/schema.sql` para a tabela de usuários.
- Adicionado `.htaccess` com cabeçalhos de segurança básicos e bloqueio de listagem de diretórios.

## Antes de colocar online
1. Use HTTPS.
2. Defina `DB_HOST`, `DB_NAME`, `DB_USER` e `DB_PASS` no servidor.
3. Crie um usuário MySQL exclusivo para a aplicação; não use `root`.
4. Faça backup do banco.
5. Não coloque `.env`, senhas ou dumps do banco no repositório.
6. Para produção, adicione proteção CSRF nos formulários, limitação de tentativas de login e recuperação segura de senha.
7. Se usar hospedagem Apache, mantenha o `.htaccess`; se usar Nginx, replique os cabeçalhos na configuração do servidor.
8. O login PHP exige hospedagem com PHP + MySQL. O restante do site continua podendo ser estático.

## Próxima etapa recomendada
Depois de validar o site, a ficha interativa pode usar JavaScript para a interface e `localStorage` para testes locais. Quando houver contas, a ficha passa a ser salva no banco por uma API/backend autenticado.
