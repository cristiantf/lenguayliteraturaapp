<?php
/**
 * Endpoint: POST /api/activities/submit.php
 * Entrega de actividad por estudiante. Acepta archivo y/o respuestas de quiz.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireRole('estudiante');

// Obtener datos (puede ser multipart/form-data o JSON)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    $data = getJsonBody();
} else {
    $data = $_POST;
}

$activityId = (int) ($data['activity_id'] ?? $data['actividad_id'] ?? 0);
if (!$activityId) {
    jsonResponse(['success' => false, 'error' => 'Se requiere el ID de la actividad.'], 400);
}

$db = getDB();

// Verificar que la actividad existe y está activa
$stmt = $db->prepare('SELECT * FROM activities WHERE id = :id AND activa = TRUE');
$stmt->execute([':id' => $activityId]);
$activity = $stmt->fetch();

if (!$activity) {
    jsonResponse(['success' => false, 'error' => 'Actividad no encontrada o no está activa.'], 404);
}

// Verificar fecha límite
if (strtotime($activity['fecha_limite']) < time()) {
    jsonResponse(['success' => false, 'error' => 'La fecha límite de esta actividad ya pasó.'], 400);
}

// Verificar que no haya entregado antes
$stmt = $db->prepare('SELECT id FROM submissions WHERE activity_id = :aid AND estudiante_id = :uid');
$stmt->execute([':aid' => $activityId, ':uid' => $user['id']]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'error' => 'Ya has entregado esta actividad.'], 409);
}

$respuestaTexto  = trim($data['respuesta_texto'] ?? $data['contenido'] ?? '');
$quizRespuestas  = $data['quiz_respuestas'] ?? null;
$archivoUrl      = null;
$quizScore       = null;

// Procesar archivo si se subió
if (!empty($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['archivo'];
    
    if ($file['size'] > MAX_UPLOAD_SIZE) {
        jsonResponse(['success' => false, 'error' => 'El archivo excede el tamaño máximo de 10 MB.'], 400);
    }
    
    // Validar extensiones
    $allowedExts = ['pdf', 'doc', 'docx', 'txt', 'odt', 'jpg', 'jpeg', 'png'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExts)) {
        jsonResponse(['success' => false, 'error' => 'Tipo de archivo no permitido. Permitidos: ' . implode(', ', $allowedExts)], 400);
    }
    
    $uploadDir = UPLOAD_DIR . $activityId . '/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $fileName = $user['id'] . '_' . time() . '.' . $ext;
    $filePath = $uploadDir . $fileName;
    
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        $archivoUrl = "uploads/activities/{$activityId}/{$fileName}";
    }
}

// Calcular nota automática del quiz
$quizFeedback = [];
$correct = 0;
$totalPreguntas = 0;

if ($quizRespuestas && ($activity['tipo'] === 'quiz' || $activity['tipo'] === 'mixta')) {
    $stmtQuiz = $db->prepare('SELECT preguntas FROM quiz_templates WHERE activity_id = :aid');
    $stmtQuiz->execute([':aid' => $activityId]);
    $quizTemplate = $stmtQuiz->fetch();
    
    if ($quizTemplate) {
        $preguntas = json_decode($quizTemplate['preguntas'], true) ?: [];
        $respuestas = is_string($quizRespuestas) ? json_decode($quizRespuestas, true) : $quizRespuestas;
        
        $totalPreguntas = count($preguntas);
        foreach ($preguntas as $i => $q) {
            $userAns = isset($respuestas[$i]) ? (int)$respuestas[$i] : null;
            $correctAns = isset($q['answer']) ? (int)$q['answer'] : 0;
            $isCorrect = ($userAns !== null && $userAns === $correctAns);
            if ($isCorrect) {
                $correct++;
            }
            $quizFeedback[] = [
                'index'          => $i,
                'question'       => $q['question'] ?? "Pregunta " . ($i + 1),
                'options'        => $q['options'] ?? [],
                'user_answer'    => $userAns,
                'correct_answer' => $correctAns,
                'is_correct'     => $isCorrect,
                'explanation'    => $q['explanation'] ?? ''
            ];
        }
        $quizScore = $totalPreguntas > 0 ? round(($correct / $totalPreguntas) * $activity['nota_maxima'], 2) : 0;
    }
    $quizRespuestas = json_encode($quizRespuestas, JSON_UNESCAPED_UNICODE);
}

// Determinar estado de la entrega
$isAutoGraded = ($activity['tipo'] === 'quiz' && $quizScore !== null);
$estadoEntrega = $isAutoGraded ? 'calificada' : 'entregada';

// Crear entrega
$stmt = $db->prepare(
    'INSERT INTO submissions (activity_id, estudiante_id, respuesta_texto, archivo_url, quiz_respuestas, quiz_score, estado)
     VALUES (:aid, :uid, :texto, :archivo, :quiz, :score, :estado)'
);
$stmt->execute([
    ':aid'     => $activityId,
    ':uid'     => $user['id'],
    ':texto'   => $respuestaTexto ?: null,
    ':archivo' => $archivoUrl,
    ':quiz'    => $quizRespuestas,
    ':score'   => $quizScore,
    ':estado'  => $estadoEntrega
]);

$submissionId = $db->lastInsertId();
auditLog('submit_activity', 'submissions', $submissionId, null, ['activity_id' => $activityId, 'auto_graded' => $isAutoGraded]);

// Si es quiz calificado automáticamente, insertar en grades y notificar a ambos
if ($isAutoGraded) {
    $retroAutomatica = "Calificación automática del Cuestionario. Acertaste {$correct} de {$totalPreguntas} preguntas (" . round(($correct / max(1, $totalPreguntas)) * 100) . "%).";
    $stmtGrade = $db->prepare(
        'INSERT INTO grades (submission_id, docente_id, nota, retroalimentacion)
         VALUES (:sid, :did, :nota, :retro)'
    );
    $stmtGrade->execute([
        ':sid'   => $submissionId,
        ':did'   => $activity['docente_id'],
        ':nota'  => $quizScore,
        ':retro' => $retroAutomatica
    ]);

    // Notificar al estudiante con su nota obtenida
    createNotification(
        $user['id'],
        'calificacion_asignada',
        '¡Quiz calificado automáticamente!',
        "Has completado \"{$activity['titulo']}\". Tu calificación es: {$quizScore} / {$activity['nota_maxima']} pts. ({$correct}/{$totalPreguntas} aciertos).",
        'dashboard/estudiante/calificaciones.html'
    );

    // Notificar al docente que el quiz fue completado y calificado
    createNotification(
        $activity['docente_id'],
        'entrega_calificada_auto',
        'Quiz completado por estudiante',
        "{$user['nombre']} {$user['apellido']} completó \"{$activity['titulo']}\". Nota automática: {$quizScore} / {$activity['nota_maxima']} pts.",
        'dashboard/docente/calificar.html'
    );
} else {
    // Notificar al docente de entrega pendiente de revisión manual
    createNotification(
        $activity['docente_id'],
        'entrega_pendiente',
        'Nueva entrega recibida',
        "{$user['nombre']} {$user['apellido']} ha entregado la actividad \"{$activity['titulo']}\". Requiere calificación.",
        'dashboard/docente/calificar.html'
    );
}

$response = [
    'success'       => true,
    'message'       => $isAutoGraded ? '¡Quiz completado y calificado automáticamente!' : 'Actividad entregada exitosamente.',
    'submission_id' => $submissionId,
    'auto_graded'   => $isAutoGraded
];

if ($quizScore !== null) {
    $response['quiz_score']       = $quizScore;
    $response['quiz_nota_maxima'] = (float)$activity['nota_maxima'];
    $response['quiz_correct']     = $correct;
    $response['quiz_total']       = $totalPreguntas;
    $response['quiz_feedback']    = $quizFeedback;
}

jsonResponse($response, 201);
