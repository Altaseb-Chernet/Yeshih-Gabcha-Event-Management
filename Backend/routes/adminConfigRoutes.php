<?php
// routes/adminConfigRoutes.php
// GET /admin-config/pricing-rules
// PUT /admin-config/pricing-rules/{eventType}
// GET /admin-config/payment-methods
// PUT /admin-config/payment-methods/{method}

require_once __DIR__ . '/../controllers/AdminConfigController.php';

$method = $_SERVER['REQUEST_METHOD'];
$seg1   = $segments[1] ?? '';   // pricing-rules | payment-methods
$seg2   = $segments[2] ?? '';   // {eventType} | {method}

switch (true) {

    // GET /admin-config/pricing-rules
    case $method === 'GET' && $seg1 === 'pricing-rules' && $seg2 === '':
        AdminConfigController::getPricingRules();
        break;

    // PUT /admin-config/pricing-rules/{eventType}
    case $method === 'PUT' && $seg1 === 'pricing-rules' && $seg2 !== '':
        AdminConfigController::upsertPricingRule($seg2);
        break;

    // GET /admin-config/payment-methods
    case $method === 'GET' && $seg1 === 'payment-methods' && $seg2 === '':
        AdminConfigController::getPaymentMethods();
        break;

    // PUT /admin-config/payment-methods/{method}
    case $method === 'PUT' && $seg1 === 'payment-methods' && $seg2 !== '':
        AdminConfigController::upsertPaymentMethod($seg2);
        break;

    default:
        sendResponse(404, false, 'Admin config endpoint not found');
}
