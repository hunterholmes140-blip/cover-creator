<?php
require_once __DIR__ . '/../config.php';

$slug = require_input('slug');

$stmt = db()->prepare('SELECT c.*, cat.name AS category_name, cat.slug AS category_slug
                        FROM courses c
                        LEFT JOIN categories cat ON cat.id = c.category_id
                        WHERE c.slug = ? AND c.is_published = 1');
$stmt->execute([$slug]);
$course = $stmt->fetch();
if (!$course) json_error('Course not found', 404);

$lstmt = db()->prepare('SELECT id, title, video_url, content, sort_order, is_preview
                         FROM lessons WHERE course_id = ? ORDER BY sort_order ASC, id ASC');
$lstmt->execute([$course['id']]);
$lessons = $lstmt->fetchAll();

// enrolled check
$enrolled = false;
$user = current_user();
if ($user) {
    $ec = db()->prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?');
    $ec->execute([$user['id'], $course['id']]);
    $enrolled = (bool)$ec->fetch();
}

// non-enrolled ইউজারকে preview ছাড়া video_url hide
if (!$enrolled) {
    foreach ($lessons as &$l) {
        if (!$l['is_preview']) $l['video_url'] = null;
    }
}

json_success(['course' => $course, 'lessons' => $lessons, 'enrolled' => $enrolled]);
