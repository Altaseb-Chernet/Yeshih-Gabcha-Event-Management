<?php
// middleware/AuthMiddleware.php

require_once __DIR__ . '/../utils/JwtUtils.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {

    public static function authenticate(): array {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($auth)) {
            sendResponse(401, false, 'No token provided');
        }

        $token   = trim(str_replace('Bearer', '', $auth));
        $decoded = JwtUtils::validateToken($token);

        if (!$decoded) {
            sendResponse(401, false, 'Invalid or expired token');
        }

        return $decoded;
    }

    public static function authorizeRoles(string ...$roles): array {
        $user = self::authenticate();
        if (!in_array($user['role'] ?? '', $roles, true)) {
            sendResponse(403, false, 'Forbidden: insufficient privileges');
        }
        return $user;
    }
}

// Shorthand helpers used in route files
function authenticate(): array {
    return AuthMiddleware::authenticate();
}

function authorizeAdmin(): array {
    return AuthMiddleware::authorizeRoles('admin');
}
