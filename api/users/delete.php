<?php
/**
 * Endpoint: DELETE /api/users/delete.php
 * Elimina un usuario. Solo Admin.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$admin = requireRole('admin');
$data  = getJsonBody();
validateRequired($data, ['id']);

$userId = (int) $data['id'];

// No permitir auto-eliminación
if ($userId === $admin['id']) {
    jsonResponse(['success' => false, 'error' => 'No puedes eliminar tu propia cuenta de administrador.'], 403);
}

$db   = getDB();
$stmt = $db->prepare('SELECT id, nombre, apellido, email, rol FROM users WHERE id = :id');
$stmt->execute([':id' => $userId]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['success' => false, 'error' => 'Usuario no encontrado.'], 404);
}

$stmt = $db->prepare('DELETE FROM users WHERE id = :id');
$stmt->execute([':id' => $userId]);

auditLog('delete_user', 'users', $userId, $user);

jsonResponse([
    'success' => true,
    'message' => "Usuario '{$user['nombre']} {$user['apellido']}' eliminado permanentemente."
]);
