<?php
/**
 * Endpoint: POST /api/grades/assign.php
 * Asigna nota a una entrega. Solo Docente.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireRole('docente');
$data = getJsonBody();
validateRequired($data, ['submission_id', 'nota']);

$submissionId     = (int) $data['submission_id'];
$nota             = floatval($data['nota']);
$retroalimentacion = trim($data['retroalimentacion'] ?? '');

$db = getDB();

// Verificar que la entrega existe y pertenece a una actividad del docente
$stmt = $db->prepare(
    'SELECT s.*, a.titulo, a.nota_maxima, a.docente_id, u.nombre AS est_nombre, u.apellido AS est_apellido
     FROM submissions s
     JOIN activities a ON s.activity_id = a.id
     JOIN users u ON s.estudiante_id = u.id
     WHERE s.id = :sid'
);
$stmt->execute([':sid' => $submissionId]);
$submission = $stmt->fetch();

if (!$submission) {
    jsonResponse(['success' => false, 'error' => 'Entrega no encontrada.'], 404);
}

if ($submission['docente_id'] != $user['id']) {
    jsonResponse(['success' => false, 'error' => 'No tienes permisos para calificar esta entrega.'], 403);
}

if ($nota < 0 || $nota > $submission['nota_maxima']) {
    jsonResponse(['success' => false, 'error' => "La nota debe estar entre 0 y {$submission['nota_maxima']}."], 400);
}

// Verificar si ya fue calificada (actualizar en ese caso)
$stmt = $db->prepare('SELECT id FROM grades WHERE submission_id = :sid');
$stmt->execute([':sid' => $submissionId]);
$existingGrade = $stmt->fetch();

if ($existingGrade) {
    $stmt = $db->prepare('UPDATE grades SET nota = :nota, retroalimentacion = :retro, fecha_calificacion = NOW() WHERE submission_id = :sid');
    $stmt->execute([':nota' => $nota, ':retro' => $retroalimentacion, ':sid' => $submissionId]);
} else {
    $stmt = $db->prepare('INSERT INTO grades (submission_id, docente_id, nota, retroalimentacion) VALUES (:sid, :did, :nota, :retro)');
    $stmt->execute([':sid' => $submissionId, ':did' => $user['id'], ':nota' => $nota, ':retro' => $retroalimentacion]);
}

// Actualizar estado de la entrega
$stmt = $db->prepare('UPDATE submissions SET estado = "calificada" WHERE id = :sid');
$stmt->execute([':sid' => $submissionId]);

auditLog('grade_submission', 'grades', $submissionId, null, ['nota' => $nota]);

// Notificar al estudiante
createNotification(
    $submission['estudiante_id'],
    'actividad_calificada',
    'Actividad calificada',
    "Tu actividad \"{$submission['titulo']}\" ha sido calificada con {$nota}/{$submission['nota_maxima']} pts. " . ($retroalimentacion ? "Retroalimentación: {$retroalimentacion}" : ''),
    'dashboard/estudiante/calificaciones.html'
);

jsonResponse([
    'success' => true,
    'message' => "Nota {$nota}/{$submission['nota_maxima']} asignada a {$submission['est_nombre']} {$submission['est_apellido']}."
]);
