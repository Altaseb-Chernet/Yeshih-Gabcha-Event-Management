<?php
// controllers/AuthController.php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/JwtUtils.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

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

    // POST /auth/forgot-password
    // Body: { email }
    // Generates a 6-digit OTP and stores it (hashed) on the user row.
    // In production you would email the OTP; here we return it in the response
    // only in non-production environments so the frontend can test without SMTP.
    public static function forgotPassword(): void {
        global $conn;
        $d = self::json();

        if (empty($d['email'])) {
            sendResponse(400, false, 'email is required');
        }

        $model = new User($conn);
        $user  = $model->findByEmail($d['email']);

        // Always respond 200 to avoid email enumeration
        if (!$user) {
            sendResponse(200, true, 'If the email exists, an OTP has been sent');
        }

        // Generate a 6-digit OTP and store its hash with a 15-minute expiry
        $otp       = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpHash   = password_hash($otp, PASSWORD_DEFAULT);
        $expiresAt = date('Y-m-d H:i:s', time() + 900); // 15 minutes

        $model->update($user['id'], [
            'passwordResetOtp'       => $otpHash,
            'passwordResetOtpExpiry' => $expiresAt,
        ]);

        // TODO: send $otp via email using SMTP config
        // For development, include the OTP in the response so it can be tested
        // without a working SMTP server. Remove this in production.
        global $config;
        $isDev = ($config['app']['env'] ?? 'development') !== 'production';

        sendResponse(200, true, 'If the email exists, an OTP has been sent', $isDev ? ['otp' => $otp] : null);
    }

    // POST /auth/reset-password
    // Body: { email, otp, newPassword }
    public static function resetPassword(): void {
        global $conn;
        $d = self::json();

        foreach (['email', 'otp', 'newPassword'] as $f) {
            if (empty($d[$f])) sendResponse(400, false, "Field '$f' is required");
        }

        $model = new User($conn);
        $user  = $model->findByEmail($d['email']);

        if (!$user) sendResponse(400, false, 'Invalid or expired OTP');

        // Check OTP expiry
        if (empty($user['passwordResetOtpExpiry']) || strtotime($user['passwordResetOtpExpiry']) < time()) {
            sendResponse(400, false, 'OTP has expired. Please request a new one.');
        }

        // Verify OTP
        if (empty($user['passwordResetOtp']) || !password_verify($d['otp'], $user['passwordResetOtp'])) {
            sendResponse(400, false, 'Invalid OTP');
        }

        // Update password and clear OTP fields
        $model->updatePassword($user['id'], $d['newPassword']);
        $model->update($user['id'], [
            'passwordResetOtp'       => null,
            'passwordResetOtpExpiry' => null,
        ]);

        sendResponse(200, true, 'Password reset successfully');
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
