<?php
// database.php
require_once __DIR__ . '/env.php';

$host = $config['database']['host'];
$db_name = $config['database']['name'];
$username = $config['database']['user'];
$password = $config['database']['password'];
$port = $config['database']['port'];

try {
    $conn = new PDO("mysql:host={$host};port={$port};dbname={$db_name}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $exception) {
    sendResponse(500, false, 'Database connection error', ['error' => $exception->getMessage()]);
}
?>