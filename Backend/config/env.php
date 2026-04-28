<?php
// backend-php/config/env.php

// Environment variables configuration
class Config {
    private static $env = [];
    
    public static function load() {
        $envFile = __DIR__ . '/../.env';
        
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') === false) {
                    list($key, $value) = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);
                    self::$env[$key] = $value;
                }
            }
        }
    }
    
    public static function get($key, $default = null) {
        if (empty(self::$env)) {
            self::load();
        }
        return self::$env[$key] ?? $_ENV[$key] ?? getenv($key) ?? $default;
    }
    
    public static function getAll() {
        return self::$env;
    }
}

// Load env
Config::load();

// Configuration array
$config = [
    'port' => Config::get('PORT', 8000),
    'nodeEnv' => Config::get('NODE_ENV', 'development'),
    
    'database' => [
        'host' => Config::get('DB_HOST', 'localhost'),
        'port' => Config::get('DB_PORT', 3306),
        'name' => Config::get('DB_DATABASE', Config::get('DB_NAME', 'event_management')),
        'user' => Config::get('DB_USERNAME', Config::get('DB_USER', 'root')),
        'password' => Config::get('DB_PASSWORD', Config::get('DB_PASS', '')),
    ],
    
    'jwt' => [
        'accessSecret' => Config::get('JWT_SECRET', Config::get('JWT_ACCESS_SECRET', 'your_default_access_secret_development')),
        'refreshSecret' => Config::get('JWT_REFRESH_SECRET', 'your_default_refresh_secret_development'),
        'accessExpires' => Config::get('JWT_ACCESS_EXPIRES', 900), // 15 minutes in seconds
        'refreshExpires' => Config::get('JWT_REFRESH_EXPIRES', 604800), // 7 days in seconds
    ],
    
    'smtp' => [
        'host' => Config::get('SMTP_HOST', 'smtp.gmail.com'),
        'port' => Config::get('SMTP_PORT', 587),
        'user' => Config::get('EMAIL_USER', Config::get('SMTP_USER', '')),
        'pass' => Config::get('EMAIL_PASS', Config::get('SMTP_PASS', '')),
    ],
    
    'upload' => [
        'maxFileSize' => Config::get('MAX_FILE_SIZE', 5242880),
        'allowedFileTypes' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'uploadDir' => __DIR__ . '/../../uploads/',
    ],
    
    'payment' => [
        'telebirrApiKey' => Config::get('TELEBIRR_API_KEY', 'mock_telebirr_key'),
        'cbeApiKey' => Config::get('CBE_API_KEY', 'mock_cbe_key'),
    ],
    
    'cors' => [
        'origin' => Config::get('FRONTEND_URL', 'http://localhost:5173'),
    ],
];

return $config;
?>
