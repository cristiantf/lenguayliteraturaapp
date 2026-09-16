<?php
/**
 * Endpoint: GET /api/grades/list.php
 * Lista entregas para ser calificadas por el Docente (o Administrador).
 * Puede filtrarse por ?actividad_id=X
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireRole(['docente', 'admin']);
$db = getDB();

$actividadId = isset($_GET['actividad_id']) ? (int)$_GET['actividad_id'] : 0;

$query = "
    SELECT 
        s.id,
        s.activity_id,
        s.estudiante_id,
        s.respuesta_texto AS contenido,
        s.archivo_url,
        s.fecha_entrega AS entregado_en,
        s.estado,
        g.id AS calificacion_id,
        g.nota AS calificacion,
        g.retroalimentacion,
        g.fecha_calificacion AS calificado_en,
        u.nombre AS estudiante_nombre,
        u.apellido AS estudiante_apellido,
        u.email AS estudiante_email,
        a.titulo AS actividad_titulo,
        a.tipo AS actividad_tipo,
        a.nota_maxima
    FROM submissions s
    INNER JOIN users u ON u.id = s.estudiante_id
    INNER JOIN activities a ON a.id = s.activity_id
    LEFT JOIN grades g ON g.submission_id = s.id
";

$params = [];
$conditions = [];

if ($user['rol'] === 'docente') {
    $conditions[] = "a.docente_id = ?";
    $params[] = $user['id'];
}

if ($actividadId > 0) {
    $conditions[] = "s.activity_id = ?";
    $params[] = $actividadId;
}

if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

$query .= " ORDER BY s.fecha_entrega DESC";

$stmt = $db->prepare($query);
$stmt->execute($params);
$submissions = $stmt->fetchAll();

jsonResponse([
    'success' => true,
    'submissions' => $submissions
]);
