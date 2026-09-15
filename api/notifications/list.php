<?php
/**
 * Endpoint: GET /api/notifications/list.php
 * Lista las notificaciones del usuario autenticado.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$user = requireAuth();
$db   = getDB();

$limit = min((int)($_GET['limit'] ?? 50), 100);
$all = !empty($_GET['all']) && $user['rol'] === 'admin';
$tipo = trim($_GET['tipo'] ?? '');
$unreadOnly = !empty($_GET['unread_only']);

$query = "SELECT n.*, u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.rol AS usuario_rol, u.email AS usuario_email 
          FROM notifications n 
          JOIN users u ON n.usuario_id = u.id";
$conditions = [];
$params = [];

if (!$all) {
    $conditions[] = "n.usuario_id = :uid";
    $params[':uid'] = $user['id'];
}

if (!empty($tipo)) {
    $conditions[] = "n.tipo = :tipo";
    $params[':tipo'] = $tipo;
}

if ($unreadOnly) {
    $conditions[] = "n.leida = FALSE";
}

if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

$query .= " ORDER BY n.created_at DESC LIMIT :limit";

$stmt = $db->prepare($query);
foreach ($params as $key => $val) {
    $stmt->bindValue($key, $val);
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->execute();
$notifications = $stmt->fetchAll();

jsonResponse([
    'success'       => true,
    'notifications' => $notifications,
    'total'         => count($notifications)
]);
