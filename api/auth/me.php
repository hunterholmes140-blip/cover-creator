<?php
require_once __DIR__ . '/../config.php';
$user = require_user();
json_success(['user' => $user]);
