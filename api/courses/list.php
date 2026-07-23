<?php
require_once __DIR__ . '/../config.php';

$category = input('category');
$search = input('search');
$featured = input('featured');

$sql = 'SELECT c.*, cat.name AS category_name, cat.slug AS category_slug
        FROM courses c
        LEFT JOIN categories cat ON cat.id = c.category_id
        WHERE c.is_published = 1';
$params = [];

if ($category) {
    $sql .= ' AND cat.slug = ?';
    $params[] = $category;
}
if ($search) {
    $sql .= ' AND (c.title LIKE ? OR c.short_description LIKE ?)';
    $params[] = '%' . $search . '%';
    $params[] = '%' . $search . '%';
}
if ($featured) {
    $sql .= ' AND c.is_featured = 1';
}
$sql .= ' ORDER BY c.created_at DESC';

$stmt = db()->prepare($sql);
$stmt->execute($params);
json_success(['courses' => $stmt->fetchAll()]);
