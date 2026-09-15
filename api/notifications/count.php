<?php
/**
 * Endpoint: GET /api/notifications/count.php
 * Cuenta notificaciones no leídas.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireAuth();
$db   = getDB();

$stmt = $db->prepare('SELECT COUNT(*) AS unread FROM notifications WHERE usuario_id = :uid AND leida = FALSE');
$stmt->execute([':uid' => $user['id']]);
$result = $stmt->fetch();

jsonResponse([
    'success' => true,
    'unread'  => (int) $result['unread']
]);
