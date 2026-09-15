<?php
/**
 * Endpoint: GET /api/activities/list.php
 * Lista actividades. Docentes ven las suyas; Estudiantes ven las activas; Admin ve todas.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireAuth();
$db   = getDB();

switch ($user['rol']) {
    case 'admin':
        $stmt = $db->query('SELECT a.*, u.nombre AS docente_nombre, u.apellido AS docente_apellido,
            (SELECT COUNT(*) FROM submissions s WHERE s.activity_id = a.id) AS total_entregas,
            (SELECT COUNT(*) FROM submissions s WHERE s.activity_id = a.id AND s.estado = "calificada") AS total_calificadas
            FROM activities a JOIN users u ON a.docente_id = u.id ORDER BY a.created_at DESC');
        break;
    
    case 'docente':
        $stmt = $db->prepare('SELECT a.*,
            (SELECT COUNT(*) FROM submissions s WHERE s.activity_id = a.id) AS total_entregas,
            (SELECT COUNT(*) FROM submissions s WHERE s.activity_id = a.id AND s.estado = "calificada") AS total_calificadas
            FROM activities a WHERE a.docente_id = :uid ORDER BY a.created_at DESC');
        $stmt->execute([':uid' => $user['id']]);
        break;
    
    case 'estudiante':
        $stmt = $db->prepare('SELECT a.*, u.nombre AS docente_nombre, u.apellido AS docente_apellido,
            s.id AS submission_id, s.id AS mi_entrega_id, s.respuesta_texto AS mi_contenido, s.archivo_url AS mi_archivo_url,
            s.estado AS mi_estado, s.fecha_entrega,
            g.nota, g.nota AS mi_calificacion, g.retroalimentacion, g.retroalimentacion AS mi_retroalimentacion
            FROM activities a
            JOIN users u ON a.docente_id = u.id
            LEFT JOIN submissions s ON s.activity_id = a.id AND s.estudiante_id = :uid
            LEFT JOIN grades g ON g.submission_id = s.id
            WHERE a.activa = TRUE
            ORDER BY a.fecha_limite ASC');
        $stmt->execute([':uid' => $user['id']]);
        break;
}

$activities = $stmt->fetchAll();

jsonResponse([
    'success'    => true,
    'activities' => $activities,
    'total'      => count($activities)
]);
