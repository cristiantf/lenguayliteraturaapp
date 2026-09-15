<?php
/**
 * Endpoint: GET /api/users/list.php
 * Lista usuarios del sistema. Solo Admin.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireRole('admin');

$db = getDB();

// Filtro opcional por rol
$rol = $_GET['rol'] ?? null;

if ($rol && in_array($rol, ['admin', 'docente', 'estudiante'])) {
    $stmt = $db->prepare('SELECT id, nombre, apellido, email, rol, activo, created_at, updated_at FROM users WHERE rol = :rol ORDER BY created_at DESC');
    $stmt->execute([':rol' => $rol]);
} else {
    $stmt = $db->query('SELECT id, nombre, apellido, email, rol, activo, created_at, updated_at FROM users ORDER BY created_at DESC');
}

$users = $stmt->fetchAll();

jsonResponse([
    'success' => true,
    'users'   => $users,
    'total'   => count($users)
]);
