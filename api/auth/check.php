<?php
/**
 * Endpoint: GET /api/auth/check.php
 * Verifica si hay una sesión activa y retorna datos del usuario.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

if (empty($_SESSION['user_id'])) {
    jsonResponse([
        'success'       => false,
        'authenticated' => false
    ]);
}

// Verificar que el usuario sigue activo en la BD
$db   = getDB();
$stmt = $db->prepare('SELECT id, nombre, apellido, email, rol, activo FROM users WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user || !$user['activo']) {
    destroyUserSession();
    jsonResponse([
        'success'       => false,
        'authenticated' => false,
        'error'         => 'Sesión expirada o cuenta desactivada.'
    ]);
}

jsonResponse([
    'success'       => true,
    'authenticated' => true,
    'user'          => [
        'id'       => $user['id'],
        'nombre'   => $user['nombre'],
        'apellido' => $user['apellido'],
        'email'    => $user['email'],
        'rol'      => $user['rol']
    ]
]);
