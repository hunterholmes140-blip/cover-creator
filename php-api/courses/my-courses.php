<?php
require_once __DIR__ . '/../config.php';
$user = require_user();

$stmt = db()->prepare('SELECT c.*, e.enrolled_at
                        FROM enrollments e
                        JOIN courses c ON c.id = e.course_id
                        WHERE e.user_id = ?
                        ORDER BY e.enrolled_at DESC');
$stmt->execute([$user['id']]);
json_success(['courses' => $stmt->fetchAll()]);
