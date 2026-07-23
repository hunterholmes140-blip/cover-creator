<?php
require_once __DIR__ . '/../config.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST only', 405);
if (empty($_FILES['file'])) json_error('No file uploaded');

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) json_error('Upload error: ' . $file['error']);
if ($file['size'] > 5 * 1024 * 1024) json_error('Max 5 MB');

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg','jpeg','png','webp','gif'];
if (!in_array($ext, $allowed)) json_error('Only images allowed');

if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
$name = date('YmdHis') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$dest = UPLOAD_DIR . $name;

if (!move_uploaded_file($file['tmp_name'], $dest)) json_error('Failed to save file', 500);

json_success(['url' => UPLOAD_URL . $name, 'filename' => $name]);
