<?php
/**
 * Endpoint: POST /api/activities/update.php
 * Actualiza una actividad existente. Solo el Docente creador o Administrador.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireRole(['docente', 'admin']);
$input = getJsonBody();

$id = isset($input['id']) ? (int)$input['id'] : 0;
$titulo = trim($input['titulo'] ?? '');
$descripcion = trim($input['descripcion'] ?? '');
$nota_maxima = isset($input['nota_maxima']) ? (float)$input['nota_maxima'] : 10.00;
$fecha_limite = !empty($input['fecha_limite']) ? $input['fecha_limite'] : null;
$activa = isset($input['activa']) ? (int)$input['activa'] : 1;

if (!$id || empty($titulo)) {
    jsonResponse(['success' => false, 'error' => 'ID y título de actividad son requeridos'], 400);
}

$db = getDB();

// Verificar que exista y pertenezca al docente (o sea admin)
$check = $db->prepare("SELECT id, docente_id FROM activities WHERE id = ?");
$check->execute([$id]);
$act = $check->fetch();

if (!$act) {
    jsonResponse(['success' => false, 'error' => 'Actividad no encontrada'], 404);
}

if ($user['rol'] === 'docente' && $act['docente_id'] != $user['id']) {
    jsonResponse(['success' => false, 'error' => 'No tienes permiso para modificar esta actividad'], 403);
}

$tipo = !empty($input['tipo']) ? trim($input['tipo']) : null;

if ($tipo) {
    $stmt = $db->prepare("
        UPDATE activities 
        SET titulo = ?, descripcion = ?, tipo = ?, nota_maxima = ?, fecha_limite = ?, activa = ?
        WHERE id = ?
    ");
    $res = $stmt->execute([$titulo, $descripcion, $tipo, $nota_maxima, $fecha_limite, $activa, $id]);
} else {
    $stmt = $db->prepare("
        UPDATE activities 
        SET titulo = ?, descripcion = ?, nota_maxima = ?, fecha_limite = ?, activa = ?
        WHERE id = ?
    ");
    $res = $stmt->execute([$titulo, $descripcion, $nota_maxima, $fecha_limite, $activa, $id]);
}

// Actualizar preguntas si se proporcionaron
if (!empty($input['preguntas']) && is_array($input['preguntas'])) {
    $db->prepare('DELETE FROM quiz_templates WHERE activity_id = ?')->execute([$id]);
    $stmtQ = $db->prepare('INSERT INTO quiz_templates (activity_id, preguntas) VALUES (?, ?)');
    $stmtQ->execute([$id, json_encode($input['preguntas'], JSON_UNESCAPED_UNICODE)]);
}

if ($res) {
    auditLog('actualizar_actividad', 'activities', $id);
    jsonResponse(['success' => true, 'message' => 'Actividad actualizada exitosamente']);
} else {
    jsonResponse(['success' => false, 'error' => 'Error al actualizar actividad'], 500);
}
