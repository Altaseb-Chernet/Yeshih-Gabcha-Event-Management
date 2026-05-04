<?php
// controllers/AuthController.php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/JwtUtils.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthController {

    // POST /auth/register
    public static function register(): void {
        global $conn;
        $d = self::json();

        $required = ['firstName','lastName','email','phone','password'];
        foreach ($required as $f) {
            if (empty($d[$f])) sendResponse(400, false, "Field '$f' is required");
        }

        $model = new User($conn);

        if ($model->findByEmail($d['email'])) {
            sendResponse(409, false, 'Email already registered');
        }
        if ($model->findByPhone($d['phone'])) {
            sendResponse(409, false, 'Phone number already registered');
        }

        $user  = $model->create($d);
        $token = self::makeToken($user);

        sendResponse(200, true, 'Registration successful', [
            'accessToken' => $token,
            'user'        => User::safe($user),
        ]);
    }

    // POST /auth/login
    public static function login(): void {
        global $conn;
        $d = self::json();

        if (empty($d['identifier']) || empty($d['password'])) {
            sendResponse(400, false, 'identifier and password are required');
        }

        $model = new User($conn);
        $user  = $model->findByIdentifier($d['identifier']);

        if (!$user || !password_verify($d['password'], $user['passwordHash'])) {
            sendResponse(401, false, 'Invalid credentials');
        }

        if ($user['status'] === 'suspended' || $user['status'] === 'inactive') {
            sendResponse(403, false, 'Account is ' . $user['status']);
        }

        // 2FA check
        if ($user['twoFactorEnabled']) {
            $tempToken = bin2hex(random_bytes(16));
            $model->update($user['id'], ['twoFactorTempToken' => $tempToken]);
            // HTTP 202 signals 2FA required to the frontend
            sendResponse(202, false, '2FA required', [
                'twoFactorRequired' => true,
                'twoFactorToken'    => $tempToken,
            ]);
        }

        $token = self::makeToken($user);
        sendResponse(200, true, 'Login successful', [
            'accessToken' => $token,
            'user'        => User::safe($user),
        ]);
    }

    // POST /auth/2fa/verify
    public static function verifyTwoFactor(): void {
        global $conn;
        $d = self::json();

        if (empty($d['twoFactorToken']) || empty($d['otp'])) {
            sendResponse(400, false, 'twoFactorToken and otp are required');
        }

        $model = new User($conn);
        // Find user by temp token
        $stmt = $conn->prepare(
            "SELECT * FROM users WHERE twoFactorTempToken = ? LIMIT 1"
        );
        $stmt->execute([$d['twoFactorToken']]);
        $user = $stmt->fetch();

        if (!$user) sendResponse(401, false, 'Invalid or expired 2FA token');

        // Simple TOTP check — replace with real TOTP library if needed
        if ($d['otp'] !== $user['twoFactorSecret']) {
            sendResponse(401, false, 'Invalid OTP code');
        }

        // Clear temp token
        $model->update($user['id'], ['twoFactorTempToken' => null]);

        $token = self::makeToken($user);
        sendResponse(200, true, '2FA verified', [
            'accessToken' => $token,
            'user'        => User::safe($user),
        ]);
    }

    // POST /auth/2fa/enable
    public static function enableTwoFactor(): void {
        global $conn;
        $user  = authenticate();
        $model = new User($conn);

        $secret = strtoupper(bin2hex(random_bytes(10)));
        $model->update($user['id'], [
            'twoFactorEnabled' => 1,
            'twoFactorSecret'  => $secret,
        ]);

        sendResponse(200, true, 'Two-factor authentication enabled', [
            'secret' => $secret,
        ]);
    }

    // POST /auth/2fa/disable
    public static function disableTwoFactor(): void {
        global $conn;
        $user  = authenticate();
        $model = new User($conn);

        $model->update($user['id'], [
            'twoFactorEnabled' => 0,
            'twoFactorSecret'  => null,
        ]);

        sendResponse(200, true, 'Two-factor authentication disabled');
    }

    // POST /auth/change-password
    public static function changePassword(): void {
        global $conn;
        $user = authenticate();
        $d    = self::json();

        if (empty($d['currentPassword']) || empty($d['newPassword'])) {
            sendResponse(400, false, 'currentPassword and newPassword are required');
        }

        $model   = new User($conn);
        $current = $model->findById($user['id']);

        if (!password_verify($d['currentPassword'], $current['passwordHash'])) {
            sendResponse(401, false, 'Current password is incorrect');
        }

        $model->updatePassword($user['id'], $d['newPassword']);
        sendResponse(200, true, 'Password changed successfully');
    }

    // POST /auth/resend-verification
    public static function resendVerification(): void {
        global $conn;
        $user  = authenticate();
        $model = new User($conn);

        $token = bin2hex(random_bytes(32));
        $model->update($user['id'], ['emailVerifyToken' => $token]);

        // TODO: send email with token
        sendResponse(200, true, 'Verification email sent');
    }

    // GET /auth/verify-email?token=xxx
    public static function verifyEmail(): void {
        global $conn;
        $token = $_GET['token'] ?? '';

        if (empty($token)) sendResponse(400, false, 'Token is required');

        $stmt = $conn->prepare(
            "SELECT * FROM users WHERE emailVerifyToken = ? LIMIT 1"
        );
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) sendResponse(400, false, 'Invalid or expired token');

        $model = new User($conn);
        $model->update($user['id'], [
            'emailVerified'    => 1,
            'emailVerifyToken' => null,
        ]);

        sendResponse(200, true, 'Email verified successfully');
    }

    // ── Helpers ───────────────────────────────────────────────
    private static function json(): array {
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }

    private static function makeToken(array $user): string {
        global $config;
        return JwtUtils::generateToken([
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
            'exp'   => time() + (int)($config['jwt']['expires'] ?? 86400),
        ]);
    }
}
