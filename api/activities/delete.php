<?php
/**
 * Endpoint: POST /api/activities/delete.php
 * Elimina una actividad y sus entregas/calificaciones asociadas.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireRole(['docente', 'admin']);
$input = getJsonBody();

$id = isset($input['id']) ? (int)$input['id'] : 0;

if (!$id) {
    jsonResponse(['success' => false, 'error' => 'ID de actividad requerido'], 400);
}

$db = getDB();

$check = $db->prepare("SELECT id, docente_id FROM activities WHERE id = ?");
$check->execute([$id]);
$act = $check->fetch();

if (!$act) {
    jsonResponse(['success' => false, 'error' => 'Actividad no encontrada'], 404);
}

if ($user['rol'] === 'docente' && $act['docente_id'] != $user['id']) {
    jsonResponse(['success' => false, 'error' => 'No tienes permiso para eliminar esta actividad'], 403);
}

$stmt = $db->prepare("DELETE FROM activities WHERE id = ?");
$res = $stmt->execute([$id]);

if ($res) {
    auditLog('eliminar_actividad', 'activities', $id);
    jsonResponse(['success' => true, 'message' => 'Actividad eliminada exitosamente']);
} else {
    jsonResponse(['success' => false, 'error' => 'Error al eliminar actividad'], 500);
}
