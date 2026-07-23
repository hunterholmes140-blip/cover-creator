<?php
// Admin PUT — upserts a JSON blob under a content_key.
// Body: { key: "home", value: { ... } }
require_once __DIR__ . '/../config.php';
require_admin();

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'PUT' && $method !== 'POST') json_error('Method not allowed', 405);

$key   = input('key');
$value = input('value');

if (!is_string($key) || $key === '' || strlen($key) > 64) json_error('Invalid key');
if ($value === null) json_error('Missing value');

$json = json_encode($value, JSON_UNESCAPED_UNICODE);
if ($json === false) json_error('Invalid JSON');

$stmt = db()->prepare(
    'INSERT INTO site_content (content_key, content_json) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)'
);
$stmt->execute([$key, $json]);

json_success(['key' => $key, 'saved' => true]);
