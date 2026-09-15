<?php
/**
 * Endpoint: POST /api/auth/login.php
 * Autentica al usuario con email y contraseña.
 */
require_once __DIR__ . '/../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$data = getJsonBody();
validateRequired($data, ['email', 'password']);

$email    = trim(strtolower($data['email']));
$password = $data['password'];

// Buscar usuario por email
$db   = getDB();
$stmt = $db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user) {
    auditLog('login_fallido', 'users', null, ['email' => $email]);
    jsonResponse(['success' => false, 'error' => 'Correo electrónico o contraseña incorrectos.'], 401);
}

if (!$user['activo']) {
    jsonResponse(['success' => false, 'error' => 'Tu cuenta ha sido desactivada. Contacta al administrador.'], 403);
}

if (!password_verify($password, $user['password_hash'])) {
    auditLog('login_fallido', 'users', $user['id'], ['email' => $email]);
    jsonResponse(['success' => false, 'error' => 'Correo electrónico o contraseña incorrectos.'], 401);
}

// Login exitoso
setUserSession($user);
auditLog('login', 'users', $user['id']);

jsonResponse([
    'success' => true,
    'user'    => [
        'id'       => $user['id'],
        'nombre'   => $user['nombre'],
        'apellido' => $user['apellido'],
        'email'    => $user['email'],
        'rol'      => $user['rol']
    ],
    'redirect' => match($user['rol']) {
        'admin'      => '/dashboard/admin/',
        'docente'    => '/dashboard/docente/',
        'estudiante' => '/dashboard/estudiante/',
        default      => '/'
    }
]);
