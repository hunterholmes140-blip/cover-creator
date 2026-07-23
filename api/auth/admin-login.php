<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST only', 405);

$email = strtolower(trim(require_input('email')));
$password = require_input('password');

$stmt = db()->prepare('SELECT id, name, email, password FROM admins WHERE email = ?');
$stmt->execute([$email]);
$admin = $stmt->fetch();

// প্রথমবারের জন্য: hash-ও ভালোভাবে বসানো না থাকলে plain 'admin123' allow করবো
$ok = false;
if ($admin) {
    if (password_verify($password, $admin['password'])) $ok = true;
    // schema.sql-এ যে placeholder hash আছে, সেটা কাজ না করলে fallback
    elseif ($password === 'admin123' && $email === 'admin@nextscale.com') {
        $newHash = password_hash('admin123', PASSWORD_BCRYPT);
        db()->prepare('UPDATE admins SET password = ? WHERE id = ?')->execute([$newHash, $admin['id']]);
        $ok = true;
    }
}

if (!$ok) json_error('Invalid credentials', 401);

$token = generate_token();
$expires = date('Y-m-d H:i:s', strtotime('+7 days'));
db()->prepare('UPDATE admins SET token = ?, token_expires_at = ? WHERE id = ?')
    ->execute([$token, $expires, $admin['id']]);

unset($admin['password']);
json_success(['admin' => $admin, 'token' => $token]);
