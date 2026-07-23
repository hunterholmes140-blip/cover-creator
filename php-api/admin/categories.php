<?php
require_once __DIR__ . '/../config.php';
require_admin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    json_success(['categories' => db()->query('SELECT * FROM categories ORDER BY name')->fetchAll()]);
}
if ($method === 'POST') {
    $name = require_input('name');
    $slug = input('slug') ?: make_slug($name);
    $stmt = db()->prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
    $stmt->execute([$name, $slug]);
    json_success('Created', ['id' => (int)db()->lastInsertId()]);
}
if ($method === 'PUT') {
    $id = (int)require_input('id');
    $stmt = db()->prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?');
    $stmt->execute([require_input('name'), require_input('slug'), $id]);
    json_success('Updated');
}
if ($method === 'DELETE') {
    $id = (int)require_input('id');
    db()->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
    json_success('Deleted');
}
json_error('Method not allowed', 405);
