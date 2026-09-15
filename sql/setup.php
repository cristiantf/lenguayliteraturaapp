<?php
/**
 * Script de inicialización de la base de datos MySQL.
 */
try {
    echo "Conectando al servidor MySQL en localhost:3306...\n";
    $pdo = new PDO('mysql:host=localhost;port=3306', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    echo "Ejecutando schema.sql...\n";
    $schema = file_get_contents(__DIR__ . '/schema.sql');
    $pdo->exec($schema);
    echo "¡Esquema de base de datos creado exitosamente!\n";

    echo "Ejecutando seed.sql...\n";
    $seed = file_get_contents(__DIR__ . '/seed.sql');
    $pdo->exec($seed);
    echo "¡Datos semilla (usuarios, actividades, entregas, notas) insertados exitosamente!\n";

    // Verificación
    $pdo->exec("USE lengua_literatura_9no");
    $users = $pdo->query("SELECT id, nombre, apellido, email, rol, activo FROM users")->fetchAll(PDO::FETCH_ASSOC);
    echo "\nUsuarios disponibles en el sistema:\n";
    foreach ($users as $u) {
        echo " - [{$u['rol']}] {$u['nombre']} {$u['apellido']} ({$u['email']})\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
