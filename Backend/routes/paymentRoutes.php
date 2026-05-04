<?php
// routes/paymentRoutes.php
// GET    /payments/my-payments
// GET    /payments/{id}
// POST   /payments/{id}/proof
// GET    /payments/admin/payments
// GET    /payments/admin/event-payments
// POST   /payments/{id}/process

require_once __DIR__ . '/../controllers/PaymentController.php';

$method = $_SERVER['REQUEST_METHOD'];
$seg1   = $segments[1] ?? '';   // my-payments | admin | {id}
$seg2   = $segments[2] ?? '';   // payments | event-payments | proof | process

switch (true) {

    // GET /payments/my-payments
    case $method === 'GET' && $seg1 === 'my-payments':
        PaymentController::myPayments();
        break;

    // GET /payments/admin/payments
    case $method === 'GET' && $seg1 === 'admin' && $seg2 === 'payments':
        PaymentController::adminList();
        break;

    // GET /payments/admin/event-payments
    case $method === 'GET' && $seg1 === 'admin' && $seg2 === 'event-payments':
        PaymentController::adminEventPayments();
        break;

    // POST /payments/{id}/proof
    case $method === 'POST' && $seg1 !== '' && $seg2 === 'proof':
        PaymentController::uploadProof($seg1);
        break;

    // POST /payments/{id}/process
    case $method === 'POST' && $seg1 !== '' && $seg2 === 'process':
        PaymentController::process($seg1);
        break;

    // GET /payments/{id}
    case $method === 'GET' && $seg1 !== '':
        PaymentController::getById($seg1);
        break;

    default:
        sendResponse(404, false, 'Payment endpoint not found');
}
