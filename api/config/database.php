<?php
/**
 * Lengua y Literatura 9no EGB - Configuración de Base de Datos
 * Unidad Educativa Fiscomisional San Lorenzo
 * 
 * Conexión PDO a MySQL con prepared statements para seguridad.
 */

// ─── CONFIGURACIÓN DE BASE DE DATOS ─────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'lengua_literatura_9no');
define('DB_USER', 'root');           // Cambiar en producción
define('DB_PASS', '');               // Cambiar en producción
define('DB_CHARSET', 'utf8mb4');

// ─── CONFIGURACIÓN DE LA APLICACIÓN ─────────────────────────────────────────
define('APP_NAME', 'Lengua y Literatura 9no EGB');
define('APP_URL', 'http://localhost');  // Cambiar en producción
define('UPLOAD_DIR', __DIR__ . '/../../uploads/activities/');
define('MAX_UPLOAD_SIZE', 10 * 1024 * 1024); // 10 MB

/**
 * Obtiene una conexión PDO a la base de datos.
 * Usa patrón singleton para reutilizar la conexión.
 */
function getDB(): PDO {
    static $pdo = null;
    
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
        );
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error'   => 'Error de conexión a la base de datos'
            ]);
            error_log('DB Connection Error: ' . $e->getMessage());
            exit;
        }
    }
    
    return $pdo;
}

/**
 * Envía una respuesta JSON y termina la ejecución.
 */
function jsonResponse(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Registra una acción en el audit_log.
 */
function auditLog(string $accion, ?string $tabla = null, ?int $registroId = null, $datosAntes = null, $datosDespues = null): void {
    try {
        $db = getDB();
        $stmt = $db->prepare(
            'INSERT INTO audit_log (usuario_id, accion, tabla_afectada, registro_id, datos_antes, datos_despues, ip_address)
             VALUES (:uid, :accion, :tabla, :rid, :antes, :despues, :ip)'
        );
        $stmt->execute([
            ':uid'     => $_SESSION['user_id'] ?? null,
            ':accion'  => $accion,
            ':tabla'   => $tabla,
            ':rid'     => $registroId,
            ':antes'   => $datosAntes ? json_encode($datosAntes) : null,
            ':despues' => $datosDespues ? json_encode($datosDespues) : null,
            ':ip'      => $_SERVER['REMOTE_ADDR'] ?? null
        ]);
    } catch (PDOException $e) {
        error_log('Audit Log Error: ' . $e->getMessage());
    }
}
