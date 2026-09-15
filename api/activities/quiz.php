<?php
/**
 * Endpoint: GET /api/activities/quiz.php?activity_id=X
 * Retorna las preguntas de un quiz.
 * Protege las respuestas correctas para estudiantes que aún no han entregado.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireAuth();
$activityId = (int)($_GET['activity_id'] ?? 0);

if ($activityId <= 0) {
    jsonResponse(['success' => false, 'error' => 'ID de actividad no válido'], 400);
}

$db = getDB();

// Obtener datos de la actividad
$stmt = $db->prepare('SELECT a.*, u.nombre AS docente_nombre, u.apellido AS docente_apellido FROM activities a JOIN users u ON a.docente_id = u.id WHERE a.id = :id');
$stmt->execute([':id' => $activityId]);
$activity = $stmt->fetch();

if (!$activity) {
    jsonResponse(['success' => false, 'error' => 'Actividad no encontrada'], 404);
}

// Obtener la plantilla de preguntas
$stmtQuiz = $db->prepare('SELECT * FROM quiz_templates WHERE activity_id = :aid');
$stmtQuiz->execute([':aid' => $activityId]);
$quizTemplate = $stmtQuiz->fetch();

if (!$quizTemplate) {
    jsonResponse(['success' => false, 'error' => 'Esta actividad no cuenta con cuestionario configurado'], 404);
}

$rawPreguntas = json_decode($quizTemplate['preguntas'], true) ?: [];

// Verificar entrega del estudiante si aplica
$submission = null;
if ($user['rol'] === 'estudiante') {
    $stmtSub = $db->prepare('SELECT s.*, g.nota AS calificacion, g.retroalimentacion FROM submissions s LEFT JOIN grades g ON g.submission_id = s.id WHERE s.activity_id = :aid AND s.estudiante_id = :uid');
    $stmtSub->execute([':aid' => $activityId, ':uid' => $user['id']]);
    $submission = $stmtSub->fetch();
}

$isDocenteOrAdmin = in_array($user['rol'], ['admin', 'docente']);
$isAlreadyGraded = ($submission && ($submission['estado'] === 'calificada' || $submission['calificacion'] !== null));

$safePreguntas = [];
foreach ($rawPreguntas as $i => $q) {
    $item = [
        'index'    => $i,
        'question' => $q['question'] ?? "Pregunta " . ($i + 1),
        'options'  => $q['options'] ?? []
    ];

    // Solo revelar respuesta y explicación si es docente/admin o si ya está calificada
    if ($isDocenteOrAdmin || $isAlreadyGraded) {
        $item['answer']      = (int)($q['answer'] ?? 0);
        $item['explanation'] = $q['explanation'] ?? '';
    }

    $safePreguntas[] = $item;
}

$isExpired = $activity['fecha_limite'] && strtotime($activity['fecha_limite']) < time();

jsonResponse([
    'success'      => true,
    'activity'     => [
        'id'               => (int)$activity['id'],
        'titulo'           => $activity['titulo'],
        'descripcion'      => $activity['descripcion'],
        'tipo'             => $activity['tipo'],
        'nota_maxima'      => (float)$activity['nota_maxima'],
        'fecha_limite'     => $activity['fecha_limite'],
        'is_expired'       => $isExpired,
        'docente_nombre'   => trim($activity['docente_nombre'] . ' ' . $activity['docente_apellido'])
    ],
    'total_preguntas' => count($safePreguntas),
    'preguntas'       => $safePreguntas,
    'submission'      => $submission ? [
        'id'               => (int)$submission['id'],
        'estado'           => $submission['estado'],
        'quiz_score'       => $submission['quiz_score'] !== null ? (float)$submission['quiz_score'] : null,
        'quiz_respuestas'  => is_string($submission['quiz_respuestas']) ? json_decode($submission['quiz_respuestas'], true) : $submission['quiz_respuestas'],
        'calificacion'     => $submission['calificacion'] !== null ? (float)$submission['calificacion'] : null,
        'retroalimentacion'=> $submission['retroalimentacion'],
        'fecha_entrega'    => $submission['fecha_entrega']
    ] : null,
    'can_submit'      => ($user['rol'] === 'estudiante' && !$submission && !$isExpired && $activity['activa'])
]);
