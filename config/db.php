<?php
/**
 * db.php
 * ------
 * MySQL connection + shared helpers.
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'library_db');
define('DB_USER', 'root');
define('DB_PASS', '');                 // Laragon = empty password
define('DB_CHARSET', 'utf8mb4');


/**
 * Returns a single PDO connection (reused per request).
 */
function getDB() {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST
             . ';dbname='    . DB_NAME
             . ';charset='   . DB_CHARSET;

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Database connection failed'], 500);
        }
    }

    return $pdo;
}


/**
 * Sends a JSON response and stops the script.
 */
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}


/**
 * Reads JSON body from POST request.
 */
function readJsonBody() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}


/**
 * Enables CORS so the browser can call this API.
 */
function enableCORS() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}


/**
 * Converts a DB row into the shape the frontend expects.
 */
function bookRowToApi(array $row): array {
    return [
        'id'          => (int) $row['id'],
        'name'        => $row['name'],
        'author'      => $row['author'],
        'category'    => $row['category'],
        'language'    => $row['language'],
        'year'        => $row['printed_year'],
        'description' => $row['description'],
        'image'       => $row['image_url'] ?? '',
        'status'      => $row['status'],
    ];
}


/**
 * Validates incoming book payload.
 */
function validateBookPayload(array $data): array {
    $required = ['name', 'author', 'category'];

    foreach ($required as $field) {
        if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
            return [false, "Field '$field' is required"];
        }
    }

    $allowedCategories = ['fiction','non-fiction','science','technology','history','biography','reference'];
    if (!in_array($data['category'], $allowedCategories)) {
        return [false, "Invalid category"];
    }

    $allowedLanguages = ['english','tamil','hindi','sanskrit','french'];
    $lang = $data['language'] ?? 'english';
    if (!in_array($lang, $allowedLanguages)) {
        return [false, "Invalid language"];
    }

    $status = $data['status'] ?? 'available';
    if (!in_array($status, ['available', 'issued'])) {
        return [false, "Invalid status"];
    }

    return [true, null];
}