<?php
require_once __DIR__ . '/../config.php';
$stmt = db()->query('SELECT id, name, slug FROM categories ORDER BY name');
json_success(['categories' => $stmt->fetchAll()]);
