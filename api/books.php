<?php
/**
 * books.php
 * GET  → list all books
 * POST → create a new book
 */

require_once __DIR__ . '/../config/db.php';
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

// ================================================================
// GET — list all books
// ================================================================
if ($method === 'GET') {
    $stmt = $db->query("
        SELECT * FROM books
        ORDER BY created_at DESC, id DESC
    ");
    $rows = $stmt->fetchAll();
    jsonResponse(array_map('bookRowToApi', $rows));
}

// ================================================================
// POST — create a new book
// ================================================================
if ($method === 'POST') {
    $body = readJsonBody();

    [$ok, $err] = validateBookPayload($body);
    if (!$ok) jsonResponse(['error' => $err], 400);

    try {
        $stmt = $db->prepare("
            INSERT INTO books
              (name, author, category, language, printed_year,
               description, image_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            trim($body['name']),
            trim($body['author']),
            trim($body['category']),
            $body['language'] ?? 'english',
            !empty($body['year']) ? (int) $body['year'] : null,
            trim($body['description'] ?? ''),
            trim($body['image'] ?? ''),
            $body['status'] ?? 'available',
        ]);

        $newId = (int) $db->lastInsertId();

        $stmt = $db->prepare("SELECT * FROM books WHERE id = ?");
        $stmt->execute([$newId]);
        jsonResponse(bookRowToApi($stmt->fetch()), 201);

    } catch (PDOException $e) {
        jsonResponse(['error' => 'Failed to create book'], 500);
    }
}

jsonResponse(['error' => 'Method not allowed'], 405);