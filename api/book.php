<?php
/**
 * book.php
 * DELETE ?id=N → delete book
 */

require_once __DIR__ . '/../config/db.php';
enableCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) jsonResponse(['error' => 'Valid id is required'], 400);

$db = getDB();

$stmt = $db->prepare("DELETE FROM books WHERE id = ?");
$stmt->execute([$id]);

if ($stmt->rowCount() === 0) {
    jsonResponse(['error' => 'Book not found'], 404);
}

jsonResponse([
    'message' => 'Book deleted successfully',
    'id'      => $id
]);