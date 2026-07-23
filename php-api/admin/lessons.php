<?php
require_once __DIR__ . '/../config.php';
require_admin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $course_id = (int)require_input('course_id');
    $stmt = db()->prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC, id ASC');
    $stmt->execute([$course_id]);
    json_success(['lessons' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $course_id = (int)require_input('course_id');
    $title = require_input('title');
    $video_url = input('video_url', '');
    $content = input('content', '');
    $sort_order = (int)input('sort_order', 0);
    $is_preview = (int)!!input('is_preview', 0);
    $stmt = db()->prepare('INSERT INTO lessons (course_id, title, video_url, content, sort_order, is_preview) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$course_id, $title, $video_url, $content, $sort_order, $is_preview]);
    json_success('Lesson added', ['id' => (int)db()->lastInsertId()]);
}

if ($method === 'PUT') {
    $id = (int)require_input('id');
    $stmt = db()->prepare('UPDATE lessons SET title=?, video_url=?, content=?, sort_order=?, is_preview=? WHERE id=?');
    $stmt->execute([
        require_input('title'),
        input('video_url',''),
        input('content',''),
        (int)input('sort_order',0),
        (int)!!input('is_preview',0),
        $id
    ]);
    json_success('Lesson updated');
}

if ($method === 'DELETE') {
    $id = (int)require_input('id');
    db()->prepare('DELETE FROM lessons WHERE id = ?')->execute([$id]);
    json_success('Lesson deleted');
}

json_error('Method not allowed', 405);
