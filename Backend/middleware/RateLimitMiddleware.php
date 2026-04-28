<?php

require_once __DIR__ . '/../utils/Response.php';

class RateLimitMiddleware {
    public static function check($maxRequests = 100, $windowSeconds = 60) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $now = time();
        $key = 'rate_limit_' . md5($ip);

        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = ['count' => 1, 'start' => $now];
            return;
        }

        $bucket = $_SESSION[$key];
        if (($now - $bucket['start']) > $windowSeconds) {
            $_SESSION[$key] = ['count' => 1, 'start' => $now];
            return;
        }

        $bucket['count']++;
        $_SESSION[$key] = $bucket;

        if ($bucket['count'] > $maxRequests) {
            sendResponse(429, false, 'Too many requests. Please try again later.', null);
        }
    }
}
