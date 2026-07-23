<?php
require_once __DIR__ . '/../config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST only', 405);

$user = require_user();
$course_id = (int)require_input('course_id');
$payment_method = require_input('payment_method');
$sender_number = require_input('sender_number');
$transaction_id = require_input('transaction_id');
$note = input('note', '');

if (!in_array($payment_method, ['bkash','nagad','rocket','manual'])) {
    json_error('Invalid payment method');
}

$cs = db()->prepare('SELECT id, price, discount_price FROM courses WHERE id = ? AND is_published = 1');
$cs->execute([$course_id]);
$course = $cs->fetch();
if (!$course) json_error('Course not found', 404);

// already enrolled?
$en = db()->prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?');
$en->execute([$user['id'], $course_id]);
if ($en->fetch()) json_error('আপনি ইতিমধ্যে এই কোর্সে ভর্তি আছেন।');

$amount = $course['discount_price'] ?: $course['price'];

$stmt = db()->prepare('INSERT INTO orders
    (user_id, course_id, amount, payment_method, sender_number, transaction_id, note, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, "pending")');
$stmt->execute([$user['id'], $course_id, $amount, $payment_method, $sender_number, $transaction_id, $note]);

json_success('অর্ডার সাবমিট হয়েছে। এডমিন verify করার পর কোর্স access পাবেন।', ['order_id' => (int)db()->lastInsertId()]);
