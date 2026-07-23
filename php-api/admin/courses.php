<?php
require_once __DIR__ . '/../config.php';
require_admin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = db()->query('SELECT c.*, cat.name AS category_name
                         FROM courses c LEFT JOIN categories cat ON cat.id = c.category_id
                         ORDER BY c.created_at DESC');
    json_success(['courses' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $title = require_input('title');
    $slug = input('slug') ?: make_slug($title);
    $data = [
        'title' => $title,
        'slug' => $slug,
        'short_description' => input('short_description', ''),
        'description' => input('description', ''),
        'thumbnail' => input('thumbnail', ''),
        'price' => (float)input('price', 0),
        'discount_price' => input('discount_price') !== null && input('discount_price') !== '' ? (float)input('discount_price') : null,
        'category_id' => input('category_id') ? (int)input('category_id') : null,
        'instructor' => input('instructor', ''),
        'duration' => input('duration', ''),
        'level' => input('level', 'beginner'),
        'is_published' => (int)!!input('is_published', 1),
        'is_featured' => (int)!!input('is_featured', 0),
    ];
    $cols = implode(',', array_keys($data));
    $ph = implode(',', array_fill(0, count($data), '?'));
    $stmt = db()->prepare("INSERT INTO courses ($cols) VALUES ($ph)");
    $stmt->execute(array_values($data));
    json_success('Course created', ['id' => (int)db()->lastInsertId()]);
}

if ($method === 'PUT') {
    $id = (int)require_input('id');
    $fields = ['title','slug','short_description','description','thumbnail','price','discount_price','category_id','instructor','duration','level','is_published','is_featured'];
    $sets = [];
    $vals = [];
    foreach ($fields as $f) {
        $v = input($f, '__skip__');
        if ($v === '__skip__') continue;
        $sets[] = "$f = ?";
        $vals[] = $v === '' && in_array($f, ['discount_price','category_id']) ? null : $v;
    }
    if (!$sets) json_error('Nothing to update');
    $vals[] = $id;
    $stmt = db()->prepare('UPDATE courses SET ' . implode(', ', $sets) . ' WHERE id = ?');
    $stmt->execute($vals);
    json_success('Course updated');
}

if ($method === 'DELETE') {
    $id = (int)require_input('id');
    db()->prepare('DELETE FROM courses WHERE id = ?')->execute([$id]);
    json_success('Course deleted');
}

json_error('Method not allowed', 405);
