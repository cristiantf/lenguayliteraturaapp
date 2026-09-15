<?php
/**
 * Endpoint: POST /api/activities/create.php
 * Crea una actividad. Solo Docente.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireRole('docente');
$data = getJsonBody();
validateRequired($data, ['titulo', 'tipo', 'fecha_inicio', 'fecha_limite']);

$titulo       = trim($data['titulo']);
$descripcion  = trim($data['descripcion'] ?? '');
$tipo         = $data['tipo'];
$fechaInicio  = $data['fecha_inicio'];
$fechaLimite  = $data['fecha_limite'];
$notaMaxima   = floatval($data['nota_maxima'] ?? 10);
$activa       = !empty($data['activa']);

// Validaciones
if (!in_array($tipo, ['archivo', 'quiz', 'mixta'])) {
    jsonResponse(['success' => false, 'error' => 'Tipo de actividad inválido.'], 400);
}

if (strtotime($fechaLimite) <= strtotime($fechaInicio)) {
    jsonResponse(['success' => false, 'error' => 'La fecha límite debe ser posterior a la fecha de inicio.'], 400);
}

if ($notaMaxima <= 0 || $notaMaxima > 100) {
    jsonResponse(['success' => false, 'error' => 'La nota máxima debe estar entre 0.01 y 100.'], 400);
}

$db   = getDB();
$stmt = $db->prepare(
    'INSERT INTO activities (docente_id, titulo, descripcion, tipo, fecha_inicio, fecha_limite, nota_maxima, activa)
     VALUES (:docente, :titulo, :desc, :tipo, :inicio, :limite, :nota, :activa)'
);
$stmt->execute([
    ':docente' => $user['id'],
    ':titulo'  => $titulo,
    ':desc'    => $descripcion,
    ':tipo'    => $tipo,
    ':inicio'  => $fechaInicio,
    ':limite'  => $fechaLimite,
    ':nota'    => $notaMaxima,
    ':activa'  => $activa ? 1 : 0
]);

$activityId = $db->lastInsertId();

// Si es tipo quiz o mixta y se envían preguntas, crear plantilla
if (($tipo === 'quiz' || $tipo === 'mixta') && !empty($data['preguntas'])) {
    $stmt = $db->prepare('INSERT INTO quiz_templates (activity_id, preguntas) VALUES (:aid, :preguntas)');
    $stmt->execute([
        ':aid'       => $activityId,
        ':preguntas' => json_encode($data['preguntas'], JSON_UNESCAPED_UNICODE)
    ]);
}

auditLog('create_activity', 'activities', $activityId, null, ['titulo' => $titulo, 'tipo' => $tipo]);

// Notificar a estudiantes si la actividad se crea activa
if ($activa) {
    notifyAllStudents(
        'nueva_actividad',
        'Nueva actividad asignada',
        "El/la docente {$user['nombre']} {$user['apellido']} ha asignado la actividad \"{$titulo}\". Fecha límite: " . date('d/m/Y H:i', strtotime($fechaLimite)),
        'dashboard/estudiante/actividades.html'
    );
}

jsonResponse([
    'success'     => true,
    'message'     => "Actividad '{$titulo}' creada exitosamente.",
    'activity_id' => $activityId
], 201);
