<?php
// backend-php/routes/authRoutes.php

require_once __DIR__ . '/../controllers/AuthController.php';

// Method Checking
$method = $_SERVER['REQUEST_METHOD'];

// Route Segments
// For url: index.php?route=auth/login
// $segments = ['auth', 'login']
$endpoint = isset($segments[1]) ? $segments[1] : '';

if ($method === 'POST') {
    if ($endpoint === 'register') {
        AuthController::register();
    } elseif ($endpoint === 'login') {
        AuthController::login();
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Endpoint not found"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}
?>