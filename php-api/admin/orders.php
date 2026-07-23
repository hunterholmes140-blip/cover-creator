<?php
require_once __DIR__ . '/../config.php';
require_admin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $status = input('status');
    $sql = 'SELECT o.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
                   c.title AS course_title, c.slug AS course_slug
            FROM orders o
            JOIN users u ON u.id = o.user_id
            JOIN courses c ON c.id = o.course_id';
    $params = [];
    if ($status) { $sql .= ' WHERE o.status = ?'; $params[] = $status; }
    $sql .= ' ORDER BY o.created_at DESC';
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    json_success(['orders' => $stmt->fetchAll()]);
}

if ($method === 'PUT') {
    $id = (int)require_input('id');
    $status = require_input('status'); // approved | rejected | pending
    if (!in_array($status, ['approved','rejected','pending'])) json_error('Invalid status');

    db()->beginTransaction();
    try {
        $s = db()->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $s->execute([$status, $id]);

        if ($status === 'approved') {
            $o = db()->prepare('SELECT user_id, course_id FROM orders WHERE id = ?');
            $o->execute([$id]);
            $order = $o->fetch();
            if ($order) {
                $e = db()->prepare('INSERT IGNORE INTO enrollments (user_id, course_id, order_id) VALUES (?, ?, ?)');
                $e->execute([$order['user_id'], $order['course_id'], $id]);
            }
        }
        db()->commit();
    } catch (Exception $ex) {
        db()->rollBack();
        json_error('Update failed: ' . $ex->getMessage(), 500);
    }
    json_success('Order updated');
}

if ($method === 'DELETE') {
    $id = (int)require_input('id');
    db()->prepare('DELETE FROM orders WHERE id = ?')->execute([$id]);
    json_success('Deleted');
}

json_error('Method not allowed', 405);
