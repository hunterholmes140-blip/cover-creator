<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST only', 405);

$name = require_input('name');
$email = strtolower(trim(require_input('email')));
$phone = input('phone', '');
$password = require_input('password');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Invalid email');
if (strlen($password) < 6) json_error('Password must be at least 6 characters');

$check = db()->prepare('SELECT id FROM users WHERE email = ?');
$check->execute([$email]);
if ($check->fetch()) json_error('Email already registered');

$hash = password_hash($password, PASSWORD_BCRYPT);
$token = generate_token();
$expires = date('Y-m-d H:i:s', strtotime('+30 days'));

$stmt = db()->prepare('INSERT INTO users (name, email, phone, password, token, token_expires_at) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->execute([$name, $email, $phone, $hash, $token, $expires]);

json_success([
    'user' => ['id' => (int)db()->lastInsertId(), 'name' => $name, 'email' => $email, 'phone' => $phone],
    'token' => $token,
]);
