<?php
// backend-php/utils/JwtUtils.php

class JwtUtils {
    // Secret key for signing the token (Matches process.env.JWT_SECRET)
    private static $secret = 'your_super_secret_key_12345'; // REPLACE THIS LATER!

    public static function generateToken($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function validateToken($token) {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        $header = $parts[0];
        $payload = $parts[1];
        $signatureProvided = $parts[2];

        $signatureExpected = hash_hmac('sha256', $header . "." . $payload, self::$secret, true);
        $base64UrlSignatureExpected = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signatureExpected));

        if (hash_equals($base64UrlSignatureExpected, $signatureProvided)) {
            $payloadData = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)));
            
            if (isset($payloadData->exp) && $payloadData->exp < time()) {
                return false; // Token expired
            }
            return $payloadData;
        }

        return false;
    }
}
?>