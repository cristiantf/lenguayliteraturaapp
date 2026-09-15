<?php
/**
 * Endpoint: PUT /api/users/update.php
 * Actualiza datos de un usuario. Solo Admin.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$admin = requireRole('admin');
$data  = getJsonBody();
validateRequired($data, ['id']);

$userId = (int) $data['id'];

$db   = getDB();
$stmt = $db->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute([':id' => $userId]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['success' => false, 'error' => 'Usuario no encontrado.'], 404);
}

// Campos actualizables
$nombre   = isset($data['nombre'])   ? trim($data['nombre'])   : $user['nombre'];
$apellido = isset($data['apellido']) ? trim($data['apellido']) : $user['apellido'];
$email    = isset($data['email'])    ? trim(strtolower($data['email'])) : $user['email'];
$rol      = isset($data['rol'])      ? $data['rol']            : $user['rol'];
$activo   = isset($data['activo'])   ? (bool) $data['activo']  : (bool) $user['activo'];

// Validar rol
if (!in_array($rol, ['admin', 'docente', 'estudiante'])) {
    jsonResponse(['success' => false, 'error' => 'Rol inválido.'], 400);
}

// Validar email único
if ($email !== $user['email']) {
    $stmt = $db->prepare('SELECT id FROM users WHERE email = :email AND id != :id');
    $stmt->execute([':email' => $email, ':id' => $userId]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'error' => 'Ya existe otro usuario con ese correo.'], 409);
    }
}

// Actualizar contraseña si se envió
$passwordUpdate = '';
$params = [
    ':nombre'   => $nombre,
    ':apellido' => $apellido,
    ':email'    => $email,
    ':rol'      => $rol,
    ':activo'   => $activo ? 1 : 0,
    ':id'       => $userId
];

if (!empty($data['password']) && strlen($data['password']) >= 6) {
    $passwordUpdate = ', password_hash = :hash';
    $params[':hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
}

$sql = "UPDATE users SET nombre = :nombre, apellido = :apellido, email = :email, rol = :rol, activo = :activo{$passwordUpdate} WHERE id = :id";
$stmt = $db->prepare($sql);
$stmt->execute($params);

auditLog('update_user', 'users', $userId, 
    ['nombre' => $user['nombre'], 'email' => $user['email'], 'rol' => $user['rol']],
    ['nombre' => $nombre, 'email' => $email, 'rol' => $rol]
);

jsonResponse([
    'success' => true,
    'message' => "Usuario '{$nombre} {$apellido}' actualizado correctamente."
]);
