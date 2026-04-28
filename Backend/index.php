<?php
// backend-php/index.php

// CORS Headers
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: " . $origin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Global generic utilities
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/middleware/RateLimitMiddleware.php';

// Database
require_once __DIR__ . '/config/database.php';

// Get path request
$route = isset($_GET['route']) ? rtrim($_GET['route'], '/') : '';

// Routing map
function handleRoute($route) {
    global $conn;
    
    // Splitting by slash, e.g., 'auth/login'
    $segments = explode('/', $route);
    $resource = $segments[0] ?? '';
    
    // Convert JSON inputs body into $_POST for POST/PUT
    $json = file_get_contents('php://input');
    if (!empty($json)) {
        $data = json_decode($json, true);
        if (is_array($data)) {
            $_POST = array_merge($_POST, $data);
        }
    }

    switch ($resource) {
        case 'auth':
            require_once __DIR__ . '/routes/authRoutes.php';
            break;
        case 'users':
            require_once __DIR__ . '/routes/userRoutes.php';
            break;
        case 'events':
            require_once __DIR__ . '/routes/eventRoutes.php';
            break;
        case 'bookings':
            require_once __DIR__ . '/routes/bookingRoutes.php';
            break;
        case 'services':
            require_once __DIR__ . '/routes/serviceRoutes.php';
            break;
        case 'gallery':
            require_once __DIR__ . '/routes/galleryRoutes.php';
            break;
        case 'payments':
            require_once __DIR__ . '/routes/paymentRoutes.php';
            break;
        case 'notifications':
            require_once __DIR__ . '/routes/notificationRoutes.php';
            break;
        case 'admin':
            require_once __DIR__ . '/routes/adminConfigRoutes.php';
            break;
        case 'reports':
            require_once __DIR__ . '/routes/reportRoutes.php';
            break;
        case 'gallery-reactions':
            require_once __DIR__ . '/routes/galleryReactionRoutes.php';
            break;
        case 'pricing-rules':
            require_once __DIR__ . '/routes/pricingRuleRoutes.php';
            break;
        case 'admin-config':
            require_once __DIR__ . '/routes/adminConfigRoutes.php';
            break;
        case 'health':
            sendResponse(200, true, 'Server is running', ['timestamp' => date('c')]);
            break;
        
        default:
            sendResponse(404, false, 'Endpoint not found', null);
            break;
    }
}

try {
    RateLimitMiddleware::check(200, 60);
    handleRoute($route);
} catch (Exception $e) {
    sendResponse(500, false, "Internal Server Error: " . $e->getMessage(), null);
}
?>