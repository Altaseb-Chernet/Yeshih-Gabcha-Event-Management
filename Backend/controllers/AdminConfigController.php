<?php
// controllers/AdminConfigController.php

require_once __DIR__ . '/../models/PricingRule.php';
require_once __DIR__ . '/../models/PaymentMethodConfig.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminConfigController {

    // GET /admin-config/pricing-rules
    public static function getPricingRules(): void {
        global $conn;
        authorizeAdmin();
        $model = new PricingRule($conn);
        sendResponse(200, true, 'Pricing rules retrieved', ['rules' => $model->getAll()]);
    }

    // PUT /admin-config/pricing-rules/{eventType}
    public static function upsertPricingRule(string $eventType): void {
        global $conn;
        authorizeAdmin();
        $d = self::json();

        $required = ['basePrice','perGuest','perHour'];
        foreach ($required as $f) {
            if (!isset($d[$f])) sendResponse(400, false, "Field '$f' is required");
        }

        $model = new PricingRule($conn);
        $rule  = $model->upsert($eventType, [
            'basePrice'    => (int)$d['basePrice'],
            'perGuest'     => (int)$d['perGuest'],
            'perHour'      => (int)$d['perHour'],
            'defaultHours' => (int)($d['defaultHours'] ?? 5),
        ]);

        sendResponse(200, true, 'Pricing rule saved', $rule);
    }

    // GET /admin-config/payment-methods
    public static function getPaymentMethods(): void {
        global $conn;
        authorizeAdmin();
        $model = new PaymentMethodConfig($conn);
        sendResponse(200, true, 'Payment methods retrieved', ['configs' => $model->getAll()]);
    }

    // PUT /admin-config/payment-methods/{method}
    public static function upsertPaymentMethod(string $method): void {
        global $conn;
        authorizeAdmin();
        $d     = self::json();
        $model = new PaymentMethodConfig($conn);
        $cfg   = $model->upsert($method, $d);
        sendResponse(200, true, 'Payment method saved', $cfg);
    }

    private static function json(): array {
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }
}
