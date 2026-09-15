<?php
/**
 * Endpoint: POST /api/notifications/read.php
 * Marca una o todas las notificaciones como leídas.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireAuth();
$data = getJsonBody();
$db   = getDB();

if (!empty($data['all'])) {
    // Marcar todas como leídas
    $stmt = $db->prepare('UPDATE notifications SET leida = TRUE WHERE usuario_id = :uid AND leida = FALSE');
    $stmt->execute([':uid' => $user['id']]);
    jsonResponse(['success' => true, 'message' => 'Todas las notificaciones marcadas como leídas.']);
} elseif (!empty($data['id'])) {
    // Marcar una específica
    $stmt = $db->prepare('UPDATE notifications SET leida = TRUE WHERE id = :id AND usuario_id = :uid');
    $stmt->execute([':id' => (int)$data['id'], ':uid' => $user['id']]);
    jsonResponse(['success' => true, 'message' => 'Notificación marcada como leída.']);
} else {
    jsonResponse(['success' => false, 'error' => 'Se requiere id o all=true.'], 400);
}
