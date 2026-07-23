<?php
// ============================================================
// NextScale API — Central Config
// এই ফাইলে আপনার Hostinger DB credentials বসান
// ============================================================

// -------- Load .env from project root (one level above /api) --------
$__envPath = __DIR__ . '/../.env';
if (is_file($__envPath)) {
    foreach (file($__envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $__line) {
        if (str_starts_with(trim($__line), '#')) continue;
        if (!str_contains($__line, '=')) continue;
        [$__k, $__v] = explode('=', $__line, 2);
        $__k = trim($__k); $__v = trim($__v, " \t\n\r\0\x0B\"'");
        if ($__k !== '' && getenv($__k) === false) { putenv("$__k=$__v"); $_ENV[$__k] = $__v; }
    }
}
function env_val($k, $default = '') { $v = getenv($k); return $v === false ? $default : $v; }

// -------- Database Credentials (from .env) --------
define('DB_HOST', env_val('DB_HOST', 'localhost'));
define('DB_NAME', env_val('DB_NAME', 'u399219073_course'));
define('DB_USER', env_val('DB_USER', 'u399219073_course'));
define('DB_PASS', env_val('DB_PASS', ''));

// -------- Frontend URL (CORS) --------
define('ALLOWED_ORIGIN', env_val('ALLOWED_ORIGIN', 'https://vencon.com.bd'));

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
