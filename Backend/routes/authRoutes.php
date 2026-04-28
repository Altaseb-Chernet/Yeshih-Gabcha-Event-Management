<?php
// routes/authRoutes.php
require_once __DIR__ . '/../controllers/AuthController.php';

$method   = $_SERVER['REQUEST_METHOD'];
$endpoint = $segments[1] ?? '';          // auth/{endpoint}
$sub      = $segments[2] ?? '';          // auth/2fa/{sub}

switch (true) {
    case $method === 'POST' && $endpoint === 'register':
        AuthController::register();
        break;

    case $method === 'POST' && $endpoint === 'login':
        AuthController::login();
        break;

    case $method === 'POST' && $endpoint === '2fa' && $sub === 'verify':
        AuthController::verifyTwoFactor();
        break;

    case $method === 'POST' && $endpoint === '2fa' && $sub === 'enable':
        AuthController::enableTwoFactor();
        break;

    case $method === 'POST' && $endpoint === '2fa' && $sub === 'disable':
        AuthController::disableTwoFactor();
        break;

    case $method === 'POST' && $endpoint === 'change-password':
        AuthController::changePassword();
        break;

    case $method === 'POST' && $endpoint === 'resend-verification':
        AuthController::resendVerification();
        break;

    case $method === 'GET' && $endpoint === 'verify-email':
        AuthController::verifyEmail();
        break;

    default:
        sendResponse(404, false, 'Auth endpoint not found');
}
