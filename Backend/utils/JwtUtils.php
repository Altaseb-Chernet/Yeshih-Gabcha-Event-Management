<?php
// utils/JwtUtils.php — Simple JWT encode/decode (no external library needed)

class JwtUtils {

    private static function getSecret(): string {
        global $config;
        return $config['jwt']['accessSecret'] ?? 'fallback_secret_change_me';
    }

    public static function generateToken(array $payload): string {
        $header  = self::base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = self::base64url(json_encode($payload));
        $sig     = self::base64url(hash_hmac('sha256', "$header.$payload", self::getSecret(), true));
        return "$header.$payload.$sig";
    }

    public static function validateToken(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $sig] = $parts;
        $expected = self::base64url(hash_hmac('sha256', "$header.$payload", self::getSecret(), true));

        if (!hash_equals($expected, $sig)) return null;

        $data = json_decode(self::base64urlDecode($payload), true);
        if (!$data) return null;

        if (isset($data['exp']) && $data['exp'] < time()) return null;

        return $data;
    }

    private static function base64url(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64urlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }
}
