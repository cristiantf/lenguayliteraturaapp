<?php
/**
 * Endpoint: POST /api/notifications/broadcast.php
 * Permite al Administrador emitir un comunicado oficial a docentes, estudiantes o a toda la institución.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireRole('admin');
$input = getJsonBody();

validateRequired($input, ['titulo', 'mensaje']);

$titulo = trim($input['titulo']);
$mensaje = trim($input['mensaje']);
$destinatarios = trim($input['destinatarios'] ?? 'todos'); // 'todos', 'docente', 'estudiante'
$enlace = trim($input['enlace'] ?? '');

$db = getDB();

// Seleccionar usuarios destinatarios según el filtro
$query = "SELECT id FROM users WHERE activo = TRUE";
$params = [];

if ($destinatarios === 'docente') {
    $query .= " AND rol = 'docente'";
} elseif ($destinatarios === 'estudiante') {
    $query .= " AND rol = 'estudiante'";
}

$stmt = $db->prepare($query);
$stmt->execute();
$targetUsers = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($targetUsers)) {
    jsonResponse(['success' => false, 'error' => 'No se encontraron usuarios activos para los destinatarios seleccionados.'], 400);
}

// Insertar notificaciones en batch
$insertStmt = $db->prepare("
    INSERT INTO notifications (usuario_id, tipo, titulo, mensaje, enlace, leida, created_at)
    VALUES (?, 'comunicado', ?, ?, ?, FALSE, NOW())
");

$count = 0;
foreach ($targetUsers as $targetId) {
    if ($insertStmt->execute([$targetId, $titulo, $mensaje, !empty($enlace) ? $enlace : null])) {
        $count++;
    }
}

// Registrar en auditoría
auditLog('emitir_comunicado', 'notifications', null, [
    'destinatarios' => $destinatarios,
    'total_enviadas' => $count,
    'titulo' => $titulo
]);

jsonResponse([
    'success' => true,
    'message' => "Comunicado emitido exitosamente a {$count} usuario(s).",
    'total_enviadas' => $count
]);
