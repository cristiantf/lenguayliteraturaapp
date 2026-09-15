<?php
/**
 * Endpoint: PATCH /api/activities/toggle.php
 * Activa o desactiva una actividad. Solo Docente.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireRole('docente');
$data = getJsonBody();
validateRequired($data, ['id']);

$activityId = (int) $data['id'];
$db   = getDB();

$stmt = $db->prepare('SELECT * FROM activities WHERE id = :id AND docente_id = :uid');
$stmt->execute([':id' => $activityId, ':uid' => $user['id']]);
$activity = $stmt->fetch();

if (!$activity) {
    jsonResponse(['success' => false, 'error' => 'Actividad no encontrada o no tienes permisos.'], 404);
}

$newState = !$activity['activa'];
$stmt = $db->prepare('UPDATE activities SET activa = :activa WHERE id = :id');
$stmt->execute([':activa' => $newState ? 1 : 0, ':id' => $activityId]);

auditLog('toggle_activity', 'activities', $activityId, ['activa' => $activity['activa']], ['activa' => $newState]);

// Notificar a estudiantes cuando se activa
if ($newState) {
    notifyAllStudents(
        'nueva_actividad',
        'Nueva actividad disponible',
        "El/la docente {$user['nombre']} {$user['apellido']} ha activado la actividad \"{$activity['titulo']}\". Fecha límite: " . date('d/m/Y H:i', strtotime($activity['fecha_limite'])),
        'dashboard/estudiante/actividades.html'
    );
}

jsonResponse([
    'success' => true,
    'message' => $newState ? "Actividad activada y notificada a los estudiantes." : "Actividad desactivada.",
    'activa'  => $newState
]);
