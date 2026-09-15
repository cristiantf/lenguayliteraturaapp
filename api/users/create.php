<?php
/**
 * Endpoint: POST /api/users/create.php
 * Crea un nuevo usuario. Solo Admin.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$admin = requireRole('admin');
$data  = getJsonBody();
validateRequired($data, ['nombre', 'apellido', 'email', 'password', 'rol']);

$nombre   = trim($data['nombre']);
$apellido = trim($data['apellido']);
$email    = trim(strtolower($data['email']));
$password = $data['password'];
$rol      = $data['rol'];

// Validar rol
if (!in_array($rol, ['admin', 'docente', 'estudiante'])) {
    jsonResponse(['success' => false, 'error' => 'Rol inválido. Debe ser: admin, docente o estudiante.'], 400);
}

// Validar formato de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'error' => 'Formato de correo electrónico inválido.'], 400);
}

// Validar longitud de contraseña
if (strlen($password) < 6) {
    jsonResponse(['success' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres.'], 400);
}

$db = getDB();

// Verificar que no exista el email
$stmt = $db->prepare('SELECT id FROM users WHERE email = :email');
$stmt->execute([':email' => $email]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'error' => 'Ya existe un usuario con ese correo electrónico.'], 409);
}

// Crear usuario
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $db->prepare(
    'INSERT INTO users (nombre, apellido, email, password_hash, rol, activo) VALUES (:nombre, :apellido, :email, :hash, :rol, TRUE)'
);
$stmt->execute([
    ':nombre'   => $nombre,
    ':apellido' => $apellido,
    ':email'    => $email,
    ':hash'     => $hash,
    ':rol'      => $rol
]);

$newId = $db->lastInsertId();
auditLog('create_user', 'users', $newId, null, ['nombre' => $nombre, 'email' => $email, 'rol' => $rol]);

jsonResponse([
    'success' => true,
    'message' => "Usuario '{$nombre} {$apellido}' creado exitosamente.",
    'user_id' => $newId
], 201);
