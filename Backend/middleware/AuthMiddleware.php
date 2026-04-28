<?php
// backend-php/middleware/AuthMiddleware.php

require_once __DIR__ . '/../utils/JwtUtils.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {
    public static function authenticate() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $headers = function_exists('getallheaders') ? getallheaders() : [];
        if (empty($headers) && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
        }

        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (empty($authHeader)) {
            sendResponse(401, false, 'Not authorized, no token provided');
        }

        $token = trim(str_replace('Bearer', '', $authHeader));
        $decoded = JwtUtils::validateToken($token);

        if (!$decoded) {
            sendResponse(401, false, 'Not authorized, token failed or expired');
        }

        $user = is_object($decoded) ? (array)$decoded : $decoded;
        $_SESSION['user'] = $user;
        return $user;
    }

    public static function authorizeRoles(...$roles) {
        $user = self::authenticate();
        if (!in_array($user['role'] ?? null, $roles, true)) {
            sendResponse(403, false, 'Forbidden: Insufficient privileges');
        }
        return $user;
    }
}

// Backward-compatible helpers.
function authenticate() {
    return AuthMiddleware::authenticate();
}

function authorizeRoles(...$roles) {
    return AuthMiddleware::authorizeRoles(...$roles);
}
?>