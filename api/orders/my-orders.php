<?php
require_once __DIR__ . '/../config.php';
$user = require_user();

$stmt = db()->prepare('SELECT o.*, c.title AS course_title, c.slug AS course_slug, c.thumbnail
                        FROM orders o JOIN courses c ON c.id = o.course_id
                        WHERE o.user_id = ? ORDER BY o.created_at DESC');
$stmt->execute([$user['id']]);
json_success(['orders' => $stmt->fetchAll()]);
