<?php
require_once __DIR__ . '/../config.php';
require_admin();

$q = fn($sql) => (int)db()->query($sql)->fetchColumn();
$revenue = (float)db()->query('SELECT COALESCE(SUM(amount),0) FROM orders WHERE status="approved"')->fetchColumn();

json_success([
    'users' => $q('SELECT COUNT(*) FROM users'),
    'courses' => $q('SELECT COUNT(*) FROM courses'),
    'orders_pending' => $q('SELECT COUNT(*) FROM orders WHERE status="pending"'),
    'orders_approved' => $q('SELECT COUNT(*) FROM orders WHERE status="approved"'),
    'revenue' => $revenue,
]);
