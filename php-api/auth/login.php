<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST only', 405);

$email = strtolower(trim(require_input('email')));
$password = require_input('password');

$stmt = db()->prepare('SELECT id, name, email, phone, password FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    json_error('Invalid email or password', 401);
}

$token = generate_token();
$expires = date('Y-m-d H:i:s', strtotime('+30 days'));
$upd = db()->prepare('UPDATE users SET token = ?, token_expires_at = ? WHERE id = ?');
$upd->execute([$token, $expires, $user['id']]);

unset($user['password']);
json_success(['user' => $user, 'token' => $token]);
