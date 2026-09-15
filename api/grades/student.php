<?php
/**
 * Endpoint: GET /api/grades/student.php
 * Obtiene todas las calificaciones del estudiante autenticado.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireRole('estudiante');
$db   = getDB();

$stmt = $db->prepare(
    'SELECT a.titulo, a.titulo AS actividad_titulo, a.tipo, a.nota_maxima, a.fecha_limite,
            s.fecha_entrega, s.estado, s.quiz_score,
            g.nota, g.nota AS calificacion, g.retroalimentacion, g.fecha_calificacion,
            u.nombre AS docente_nombre, u.apellido AS docente_apellido
     FROM submissions s
     JOIN activities a ON s.activity_id = a.id
     JOIN users u ON a.docente_id = u.id
     LEFT JOIN grades g ON g.submission_id = s.id
     WHERE s.estudiante_id = :uid
     ORDER BY s.fecha_entrega DESC'
);
$stmt->execute([':uid' => $user['id']]);
$grades = $stmt->fetchAll();

// Calcular promedio general
$totalNota = 0;
$totalMax  = 0;
$calificadas = 0;

foreach ($grades as $g) {
    if ($g['nota'] !== null) {
        $totalNota += $g['nota'];
        $totalMax  += $g['nota_maxima'];
        $calificadas++;
    }
}

$promedio = $calificadas > 0 ? round(($totalNota / $totalMax) * 10, 1) : null;

jsonResponse([
    'success'          => true,
    'grades'           => $grades,
    'total'            => count($grades),
    'calificadas'      => $calificadas,
    'promedio'         => $promedio,
    'promedio_general' => $promedio
]);
