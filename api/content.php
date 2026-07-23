<?php
// Public GET — reads a single content key or returns all site_content rows.
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$key = $_GET['key'] ?? null;

if ($key) {
    $stmt = db()->prepare('SELECT content_key, content_json FROM site_content WHERE content_key = ?');
    $stmt->execute([$key]);
    $row = $stmt->fetch();
    if (!$row) json_success(['key' => $key, 'value' => null]);
    json_success(['key' => $row['content_key'], 'value' => json_decode($row['content_json'], true)]);
}

$rows = db()->query('SELECT content_key, content_json FROM site_content')->fetchAll();
$out = [];
foreach ($rows as $r) $out[$r['content_key']] = json_decode($r['content_json'], true);
json_success(['content' => $out]);
