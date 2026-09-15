<?php
/**
 * Lengua y Literatura 9no EGB - Gestión de Sesiones y Permisos
 * Unidad Educativa Fiscomisional San Lorenzo
 * 
 * Middleware de autenticación y autorización por roles.
 */

// Iniciar sesión si no está activa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Headers CORS para desarrollo local y credenciales
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:8000';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/database.php';

/**
 * Verifica que el usuario tenga una sesión activa.
 * Si no, devuelve un 401 Unauthorized.
 */
function requireAuth(): array {
    if (empty($_SESSION['user_id']) || empty($_SESSION['user_rol'])) {
        jsonResponse([
            'success' => false,
            'error'   => 'No autorizado. Inicia sesión para continuar.'
        ], 401);
    }
    
    return [
        'id'       => $_SESSION['user_id'],
        'nombre'   => $_SESSION['user_nombre'],
        'apellido' => $_SESSION['user_apellido'],
        'email'    => $_SESSION['user_email'],
        'rol'      => $_SESSION['user_rol']
    ];
}

/**
 * Verifica que el usuario tenga uno de los roles permitidos.
 * @param string|array $roles Rol o array de roles permitidos
 */
function requireRole($roles): array {
    $user = requireAuth();
    
    if (is_string($roles)) {
        $roles = [$roles];
    }
    
    if (!in_array($user['rol'], $roles)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Acceso denegado. No tienes permisos para esta acción.'
        ], 403);
    }
    
    return $user;
}

/**
 * Establece las variables de sesión del usuario tras login exitoso.
 */
function setUserSession(array $user): void {
    // Regenerar ID de sesión para prevenir session fixation
    session_regenerate_id(true);
    
    $_SESSION['user_id']       = $user['id'];
    $_SESSION['user_nombre']   = $user['nombre'];
    $_SESSION['user_apellido'] = $user['apellido'];
    $_SESSION['user_email']    = $user['email'];
    $_SESSION['user_rol']      = $user['rol'];
    $_SESSION['login_time']    = time();
}

/**
 * Destruye la sesión del usuario.
 */
function destroyUserSession(): void {
    $_SESSION = [];
    
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    
    session_destroy();
}

/**
 * Obtiene el cuerpo JSON de la petición.
 */
function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return !empty($_POST) ? $_POST : [];
    }
    $data = json_decode($raw, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        if (!empty($_POST)) return $_POST;
        jsonResponse([
            'success' => false,
            'error'   => 'Cuerpo de la petición no es JSON válido.'
        ], 400);
    }
    
    return $data ?? [];
}

/**
 * Alias de getJsonBody
 */
function getJsonInput(): array {
    return getJsonBody();
}

/**
 * Valida que los campos requeridos estén presentes en un array.
 */
function validateRequired(array $data, array $fields): void {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Campos requeridos faltantes: ' . implode(', ', $missing)
        ], 400);
    }
}

/**
 * Crea una notificación para un usuario.
 */
function createNotification(int $userId, string $tipo, string $titulo, string $mensaje, ?string $enlace = null): void {
    try {
        $db = getDB();
        $stmt = $db->prepare(
            'INSERT INTO notifications (usuario_id, tipo, titulo, mensaje, enlace)
             VALUES (:uid, :tipo, :titulo, :mensaje, :enlace)'
        );
        $stmt->execute([
            ':uid'     => $userId,
            ':tipo'    => $tipo,
            ':titulo'  => $titulo,
            ':mensaje' => $mensaje,
            ':enlace'  => $enlace
        ]);
    } catch (PDOException $e) {
        error_log('Notification Error: ' . $e->getMessage());
    }
}

/**
 * Envía notificación a todos los estudiantes activos.
 */
function notifyAllStudents(string $tipo, string $titulo, string $mensaje, ?string $enlace = null): void {
    try {
        $db = getDB();
        $stmt = $db->query("SELECT id FROM users WHERE rol = 'estudiante' AND activo = TRUE");
        $students = $stmt->fetchAll();
        
        foreach ($students as $student) {
            createNotification($student['id'], $tipo, $titulo, $mensaje, $enlace);
        }
    } catch (PDOException $e) {
        error_log('Notify Students Error: ' . $e->getMessage());
    }
}
