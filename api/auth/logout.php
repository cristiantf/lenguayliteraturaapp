<?php
/**
 * Endpoint: POST /api/auth/logout.php
 * Cierra la sesión del usuario.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$userId = $_SESSION['user_id'] ?? null;
if ($userId) {
    auditLog('logout', 'users', $userId);
}

destroyUserSession();

jsonResponse([
    'success' => true,
    'message' => 'Sesión cerrada correctamente.'
]);
