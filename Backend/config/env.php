<?php
// config/env.php — Load .env and expose $config globally

class Config {
    private static array $env = [];

    public static function load(): void {
        $file = __DIR__ . '/../.env';
        if (!file_exists($file)) return;

        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;
            if (strpos($line, '=') === false) continue;
            [$key, $val] = explode('=', $line, 2);
            self::$env[trim($key)] = trim($val);
        }
    }

    public static function get(string $key, $default = null) {
        if (empty(self::$env)) self::load();
        return self::$env[$key] ?? $_ENV[$key] ?? getenv($key) ?: $default;
    }
}

Config::load();

$config = [
    'database' => [
        'host'     => Config::get('DB_HOST',     'localhost'),
        'port'     => Config::get('DB_PORT',     3306),
        'name'     => Config::get('DB_DATABASE', 'habesha_events'),
        'user'     => Config::get('DB_USERNAME', 'root'),
        'password' => Config::get('DB_PASSWORD', ''),
    ],
    'jwt' => [
        'accessSecret' => Config::get('JWT_SECRET',  'change_me_in_production'),
        'expires'      => (int) Config::get('JWT_EXPIRES', 86400),
    ],
    'smtp' => [
        'host' => Config::get('SMTP_HOST', 'smtp.gmail.com'),
        'port' => (int) Config::get('SMTP_PORT', 587),
        'user' => Config::get('EMAIL_USER', ''),
        'pass' => Config::get('EMAIL_PASS', ''),
    ],
    'upload' => [
        'maxFileSize' => (int) Config::get('MAX_FILE_SIZE', 10485760),
        'uploadDir'   => Config::get('UPLOAD_DIR', 'uploads'),
    ],
    'cors' => [
        'origin' => Config::get('FRONTEND_URL', '*'),
    ],
];
