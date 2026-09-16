<?php
/**
 * Endpoint: POST /api/grades/download_file.php
 * Recibe datos binarios codificados en base64 y los envía de vuelta
 * con los encabezados HTTP Content-Disposition adecuados para forzar la
 * descarga con el nombre y extensión de archivo correctos en el navegador.
 */
require_once __DIR__ . '/../config/session.php';

// Verificar que el usuario sea docente o admin
$user = requireRole(['docente', 'admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

// Obtener parámetros (soporta form-data y JSON)
$filename = $_POST['filename'] ?? '';
$mimeType = $_POST['mime_type'] ?? 'application/octet-stream';
$base64Data = $_POST['data'] ?? '';

if (empty($base64Data)) {
    $rawInput = file_get_contents('php://input');
    $jsonData = json_decode($rawInput, true);
    if ($jsonData) {
        $filename = $jsonData['filename'] ?? $filename;
        $mimeType = $jsonData['mime_type'] ?? $mimeType;
        $base64Data = $jsonData['data'] ?? $base64Data;
    }
}

// Si la cadena contiene el prefijo data URI (ej. data:application/pdf;base64,...), removerlo
if (strpos($base64Data, ',') !== false) {
    $parts = explode(',', $base64Data);
    $base64Data = end($parts);
}

$binaryData = base64_decode($base64Data);

if (empty($binaryData)) {
    jsonResponse(['success' => false, 'error' => 'Datos de archivo vacíos o inválidos'], 400);
}

// Sanitizar nombre de archivo
$filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $filename);
if (empty($filename)) {
    $filename = 'reporte_descarga_' . date('Y-m-d') . '.bin';
}

// Limpiar buffers de salida previos
while (ob_get_level()) {
    ob_end_clean();
}

// Encabezados HTTP de descarga oficial
header('Content-Description: File Transfer');
header('Content-Type: ' . $mimeType);
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
header('Content-Length: ' . strlen($binaryData));

echo $binaryData;
exit;
