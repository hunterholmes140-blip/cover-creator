<?php
require_once __DIR__ . '/../config.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = db()->query('SELECT u.id, u.name, u.email, u.phone, u.created_at,
                                (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id) AS course_count
                         FROM users u ORDER BY u.created_at DESC');
    json_success(['users' => $stmt->fetchAll()]);
}
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = (int)require_input('id');
    db()->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
    json_success('User deleted');
}
json_error('Method not allowed', 405);
