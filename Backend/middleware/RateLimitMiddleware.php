<?php
// middleware/RateLimitMiddleware.php

require_once __DIR__ . '/../utils/Response.php';

class RateLimitMiddleware {

    public static function check(int $max = 200, int $window = 60): void {
        if (session_status() === PHP_SESSION_NONE) session_start();

        $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $key = 'rl_' . md5($ip);
        $now = time();

        $bucket = $_SESSION[$key] ?? ['count' => 0, 'start' => $now];

        if (($now - $bucket['start']) > $window) {
            $bucket = ['count' => 1, 'start' => $now];
        } else {
            $bucket['count']++;
        }

        $_SESSION[$key] = $bucket;

        if ($bucket['count'] > $max) {
            sendResponse(429, false, 'Too many requests. Please slow down.');
        }
    }
}
