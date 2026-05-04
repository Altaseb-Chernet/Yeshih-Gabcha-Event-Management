<?php
// index.php — Main entry point & router
// URL pattern: /api/auth/login  →  ?route=auth/login

// ── CORS ─────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Bootstrap ─────────────────────────────────────────────────
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/middleware/RateLimitMiddleware.php';
require_once __DIR__ . '/config/database.php';   // sets $conn + $config

// ── Rate limit ────────────────────────────────────────────────
RateLimitMiddleware::check(300, 60);

// ── Parse route ───────────────────────────────────────────────
// Apache .htaccess rewrites /api/auth/login → index.php?route=auth/login
// OR direct: index.php?route=auth/login
$route    = trim($_GET['route'] ?? '', '/');
$segments = $route !== '' ? explode('/', $route) : [];
$resource = $segments[0] ?? '';

// ── Dispatch ──────────────────────────────────────────────────
try {
    switch ($resource) {
        case 'auth':
            require __DIR__ . '/routes/authRoutes.php';
            break;
        case 'users':
            require __DIR__ . '/routes/userRoutes.php';
            break;
        case 'bookings':
            require __DIR__ . '/routes/bookingRoutes.php';
            break;
        case 'events':
            require __DIR__ . '/routes/eventRoutes.php';
            break;
        case 'services':
            require __DIR__ . '/routes/serviceRoutes.php';
            break;
        case 'gallery':
            require __DIR__ . '/routes/galleryRoutes.php';
            break;
        case 'payments':
            require __DIR__ . '/routes/paymentRoutes.php';
            break;
        case 'notifications':
            require __DIR__ . '/routes/notificationRoutes.php';
            break;
        case 'reports':
            require __DIR__ . '/routes/reportRoutes.php';
            break;
        case 'admin-config':
            require __DIR__ . '/routes/adminConfigRoutes.php';
            break;
        case 'health':
            sendResponse(200, true, 'Server is running', ['time' => date('c')]);
            break;
        default:
            sendResponse(404, false, 'Endpoint not found');
    }
} catch (Throwable $e) {
    sendResponse(500, false, 'Internal server error: ' . $e->getMessage());
}
