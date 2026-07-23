<?php
// ============================================================
// NextScale API — Central Config
// এই ফাইলে আপনার Hostinger DB credentials বসান
// ============================================================

// -------- Database Credentials (Hostinger থেকে নিন) --------
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// -------- Frontend URL (CORS) --------
// আপনার ডোমেইন বসান — dev এ '*' রাখতে পারেন
define('ALLOWED_ORIGIN', '*');

// -------- Upload directory --------
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', '/uploads/');

// ============================================================
// এর নিচে সাধারণত এডিট করার দরকার নেই
// ============================================================

// CORS
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// -------- DB Connection (PDO) --------
function db() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            json_error('Database connection failed: ' . $e->getMessage(), 500);
        }
    }
    return $pdo;
}

// -------- JSON helpers --------
function json_response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error($message, $status = 400) {
    json_response(['success' => false, 'error' => $message], $status);
}

function json_success($data = [], $extra = []) {
    json_response(array_merge(['success' => true], is_array($data) ? ['data' => $data] : ['message' => $data], $extra));
}

// -------- Request body (JSON) --------
function body() {
    static $body = null;
    if ($body === null) {
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true) ?: [];
    }
    return $body;
}

function input($key, $default = null) {
    $b = body();
    if (isset($b[$key])) return $b[$key];
    if (isset($_GET[$key])) return $_GET[$key];
    if (isset($_POST[$key])) return $_POST[$key];
    return $default;
}

function require_input($key) {
    $v = input($key);
    if ($v === null || $v === '') json_error("Field '$key' is required.");
    return $v;
}

// -------- Auth (token-based) --------
function bearer_token() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (stripos($auth, 'Bearer ') === 0) return trim(substr($auth, 7));
    return null;
}

function generate_token() {
    return bin2hex(random_bytes(32));
}

function current_user() {
    $token = bearer_token();
    if (!$token) return null;
    $stmt = db()->prepare('SELECT id, name, email, phone FROM users WHERE token = ? AND (token_expires_at IS NULL OR token_expires_at > NOW())');
    $stmt->execute([$token]);
    return $stmt->fetch() ?: null;
}

function require_user() {
    $u = current_user();
    if (!$u) json_error('Unauthorized', 401);
    return $u;
}

function current_admin() {
    $token = bearer_token();
    if (!$token) return null;
    $stmt = db()->prepare('SELECT id, name, email FROM admins WHERE token = ? AND (token_expires_at IS NULL OR token_expires_at > NOW())');
    $stmt->execute([$token]);
    return $stmt->fetch() ?: null;
}

function require_admin() {
    $a = current_admin();
    if (!$a) json_error('Admin unauthorized', 401);
    return $a;
}

// -------- Slug helper --------
function make_slug($text) {
    $text = trim($text);
    $slug = preg_replace('/[^\p{L}\p{N}]+/u', '-', $text);
    $slug = trim($slug, '-');
    return $slug ?: bin2hex(random_bytes(4));
}
