<?php
// config/database.php — PDO connection

require_once __DIR__ . '/env.php';

$host = $config['database']['host'];
$port = $config['database']['port'];
$name = $config['database']['name'];
$user = $config['database']['user'];
$pass = $config['database']['password'];

try {
    $conn = new PDO(
        "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    require_once __DIR__ . '/../utils/Response.php';
    sendResponse(500, false, 'Database connection failed: ' . $e->getMessage());
}
