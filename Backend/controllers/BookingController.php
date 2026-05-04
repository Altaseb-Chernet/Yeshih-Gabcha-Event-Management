<?php
// controllers/BookingController.php

require_once __DIR__ . '/../models/Booking.php';
require_once __DIR__ . '/../models/PricingRule.php';
require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../models/PaymentMethodConfig.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class BookingController {

    // POST /bookings/calc-price
    public static function calcPrice(): void {
        global $conn;
        authenticate();
        $d = self::json();

        $required = ['eventType','guestCount','durationHours','eventDate','eventTime'];
        foreach ($required as $f) {
            if (!isset($d[$f]) || $d[$f] === '') sendResponse(400, false, "Field '$f' is required");
        }

        $pricing = new PricingRule($conn);
        $result  = $pricing->calcPrice(
            $d['eventType'],
            (int)$d['guestCount'],
            (int)$d['durationHours']
        );

        sendResponse(200, true, 'Price calculated', $result);
    }

    // POST /bookings
    public static function create(): void {
        global $conn;
        $auth = authenticate();
        $d    = self::json();

        $required = ['customerName','customerEmail','customerPhone','eventType',
                     'eventDate','eventTime','guestCount','durationHours'];
        foreach ($required as $f) {
            if (empty($d[$f])) sendResponse(400, false, "Field '$f' is required");
        }

        // Calculate price
        $pricing    = new PricingRule($conn);
        $priceData  = $pricing->calcPrice(
            $d['eventType'],
            (int)$d['guestCount'],
            (int)$d['durationHours']
        );

        $model   = new Booking($conn);
        $booking = $model->create([
            'userId'        => $auth['id'],
            'customerName'  => $d['customerName'],
            'customerEmail' => $d['customerEmail'],
            'customerPhone' => $d['customerPhone'],
            'eventType'     => $d['eventType'],
            'eventDate'     => $d['eventDate'],
            'eventTime'     => $d['eventTime'],
            'guestCount'    => (int)$d['guestCount'],
            'durationHours' => (int)$d['durationHours'],
            'totalPrice'    => $priceData['totalPrice'],
            'notes'         => $d['message'] ?? $d['notes'] ?? null,
        ]);

        // Notify admin
        self::notifyAdmin($conn, 'booking_created',
            'New Booking',
            "New booking from {$d['customerName']} ({$d['eventType']})",
            $booking['id']
        );

        sendResponse(201, true, 'Booking created', $booking);
    }

    // GET /bookings/my-bookings
    public static function myBookings(): void {
        global $conn;
        $auth    = authenticate();
        $model   = new Booking($conn);
        $limit   = (int)($_GET['limit']  ?? 20);
        $offset  = (int)($_GET['offset'] ?? 0);
        $filters = array_filter(['status' => $_GET['status'] ?? '']);

        $bookings = $model->getByUser($auth['id'], $limit, $offset, $filters);
        $total    = $model->countByUser($auth['id']);

        sendResponse(200, true, 'Bookings retrieved', [
            'bookings' => $bookings,
            'total'    => $total,
        ]);
    }

    // GET /bookings/{id}
    public static function getById(string $id): void {
        global $conn;
        $auth    = authenticate();
        $model   = new Booking($conn);
        $booking = $model->findById($id);

        if (!$booking) sendResponse(404, false, 'Booking not found');
        if ($booking['userId'] !== $auth['id'] && $auth['role'] !== 'admin') {
            sendResponse(403, false, 'Forbidden');
        }

        sendResponse(200, true, 'Booking retrieved', $booking);
    }

    // POST /bookings/{id}/proceed-payment
    public static function proceedPayment(string $id): void {
        global $conn;
        $auth    = authenticate();
        $d       = self::json();
        $model   = new Booking($conn);
        $booking = $model->findById($id);

        if (!$booking) sendResponse(404, false, 'Booking not found');
        if ($booking['userId'] !== $auth['id']) sendResponse(403, false, 'Forbidden');

        if (empty($d['paymentMethod'])) sendResponse(400, false, 'paymentMethod is required');

        // Get receiver info from config
        $methodModel = new PaymentMethodConfig($conn);
        $methodCfg   = $methodModel->findByMethod($d['paymentMethod']);

        // Create payment record
        $payModel = new Payment($conn);
        $payment  = $payModel->create([
            'bookingId'     => $id,
            'userId'        => $auth['id'],
            'amount'        => $booking['totalPrice'],
            'paymentMethod' => $d['paymentMethod'],
            'phoneNumber'   => $d['phoneNumber'] ?? null,
            'status'        => 'pending',
        ]);

        // Notify admin
        self::notifyAdmin($conn, 'payment_created',
            'New Payment',
            "Payment of {$booking['totalPrice']} ETB via {$d['paymentMethod']}",
            $payment['id']
        );

        sendResponse(200, true, 'Payment initiated', [
            'payment'      => $payment,
            'receiver'     => $methodCfg ? [
                'receiverName'          => $methodCfg['receiverName'],
                'receiverPhone'         => $methodCfg['receiverPhone'],
                'receiverAccountNumber' => $methodCfg['receiverAccountNumber'],
                'note'                  => $methodCfg['note'],
            ] : null,
            'instructions' => self::buildInstructions($d['paymentMethod'], $methodCfg),
        ]);
    }

    // GET /bookings/{id}/qr
    public static function getQr(string $id): void {
        global $conn;
        $auth    = authenticate();
        $model   = new Booking($conn);
        $booking = $model->findById($id);

        if (!$booking) sendResponse(404, false, 'Booking not found');
        if ($booking['userId'] !== $auth['id'] && $auth['role'] !== 'admin') {
            sendResponse(403, false, 'Forbidden');
        }
        if ($booking['status'] !== 'confirmed') {
            sendResponse(400, false, 'QR code is only available for confirmed bookings');
        }

        // Generate simple QR data string (use a QR library for real image)
        $qrData = $booking['qrCode'] ?? base64_encode(json_encode([
            'bookingId' => $id,
            'customer'  => $booking['customerName'],
            'event'     => $booking['eventType'],
            'date'      => $booking['eventDate'],
        ]));

        sendResponse(200, true, 'QR code retrieved', [
            'qrCode'    => $qrData,
            'bookingId' => $id,
        ]);
    }

    // GET /bookings/admin/bookings  (admin)
    public static function adminList(): void {
        global $conn;
        authorizeAdmin();
        $model   = new Booking($conn);
        $limit   = (int)($_GET['limit']  ?? 20);
        $offset  = (int)($_GET['offset'] ?? 0);
        $filters = array_filter([
            'status'    => $_GET['status']    ?? '',
            'eventType' => $_GET['eventType'] ?? '',
            'search'    => $_GET['search']    ?? '',
        ]);

        $bookings = $model->getAll($limit, $offset, $filters);
        $total    = $model->countAll($filters);

        sendResponse(200, true, 'Bookings retrieved', [
            'bookings' => $bookings,
            'total'    => $total,
        ]);
    }

    // PUT /bookings/admin/bookings/{id}/status  (admin)
    public static function adminUpdateStatus(string $id): void {
        global $conn;
        authorizeAdmin();
        $d     = self::json();
        $model = new Booking($conn);

        if (empty($d['status'])) sendResponse(400, false, 'status is required');
        if (!$model->findById($id)) sendResponse(404, false, 'Booking not found');

        $booking = $model->updateStatus($id, $d['status']);
        sendResponse(200, true, 'Booking status updated', $booking);
    }

    // ── Helpers ───────────────────────────────────────────────
    private static function json(): array {
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }

    private static function notifyAdmin(PDO $conn, string $type, string $title, string $message, string $refId): void {
        try {
            $notif = new Notification($conn);
            $notif->create([
                'userId'   => null,
                'type'     => $type,
                'title'    => $title,
                'message'  => $message,
                'metadata' => json_encode(['refId' => $refId]),
            ]);
        } catch (Throwable $e) { /* non-fatal */ }
    }

    private static function buildInstructions(string $method, ?array $cfg): array {
        $names = [
            'telebirr'   => 'Telebirr',
            'cbe'        => 'CBE',
            'commercial' => 'Commercial Bank',
            'abisiniya'  => 'Abyssinia Bank',
            'abyssinia'  => 'Abyssinia Bank',
        ];
        $label = $names[$method] ?? $method;

        return [
            'title' => "How to pay via $label",
            'steps' => [
                "Open your $label app or visit the bank",
                "Send the exact amount to the receiver details above",
                "Take a screenshot of the payment confirmation",
                "Upload the screenshot using the button below",
            ],
            'note' => $cfg['note'] ?? null,
        ];
    }
}
