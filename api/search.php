<?php
/**
 * search.php
 * GET ?q=wings&category=biography&author=kalam&language=english
 */

require_once __DIR__ . '/../config/db.php';
enableCORS();

$q        = trim($_GET['q']        ?? '');
$category = trim($_GET['category'] ?? '');
$author   = trim($_GET['author']   ?? '');
$language = trim($_GET['language'] ?? '');

$sql = "SELECT * FROM books WHERE 1=1";
$params = [];

if ($q !== '') {
    $sql .= " AND (name LIKE ? OR author LIKE ? OR description LIKE ?)";
    $like = '%' . $q . '%';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

if ($category !== '') {
    $sql .= " AND category = ?";
    $params[] = $category;
}

if ($author !== '') {
    $sql .= " AND author LIKE ?";
    $params[] = '%' . $author . '%';
}

if ($language !== '') {
    $sql .= " AND language = ?";
    $params[] = $language;
}

$sql .= " ORDER BY created_at DESC, id DESC";

$db = getDB();
$stmt = $db->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

jsonResponse(array_map('bookRowToApi', $rows));