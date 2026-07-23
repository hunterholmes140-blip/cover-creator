<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Public GET (সাইট নাম, নম্বর ইত্যাদি ফ্রন্টএন্ডে দরকার)
if ($method === 'GET') {
    $rows = db()->query('SELECT setting_key, setting_value FROM site_settings')->fetchAll();
    $out = [];
    foreach ($rows as $r) $out[$r['setting_key']] = $r['setting_value'];
    json_success(['settings' => $out]);
}

require_admin();

if ($method === 'PUT' || $method === 'POST') {
    $settings = input('settings');
    if (!is_array($settings)) json_error('settings must be an object');

    $stmt = db()->prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
                           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
    foreach ($settings as $k => $v) {
        $stmt->execute([$k, (string)$v]);
    }
    json_success('Settings updated');
}

json_error('Method not allowed', 405);
