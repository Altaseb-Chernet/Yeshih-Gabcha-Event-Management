<?php
// controllers/EventController.php

require_once __DIR__ . '/../models/Event.php';
require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../models/PaymentMethodConfig.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../utils/Upload.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class EventController {

    // GET /events
    public static function getAll(): void {
        global $conn;
        $model   = new Event($conn);
        $limit   = (int)($_GET['limit']  ?? 20);
        $offset  = (int)($_GET['offset'] ?? 0);
        $filters = array_filter([
            'status'    => $_GET['status']    ?? 'active',
            'eventType' => $_GET['eventType'] ?? '',
            'search'    => $_GET['search']    ?? '',
        ]);

        $events = $model->getAll($limit, $offset, $filters);
        $total  = $model->countAll($filters);

        sendResponse(200, true, 'Events retrieved', [
            'events' => $events,
            'total'  => $total,
        ]);
    }

    // GET /events/{id}
    public static function getById(string $id): void {
        global $conn;
        $model = new Event($conn);
        $event = $model->findById($id);
        if (!$event) sendResponse(404, false, 'Event not found');
        sendResponse(200, true, 'Event retrieved', $event);
    }

    // POST /events  (admin)
    public static function create(): void {
        global $conn;
        authorizeAdmin();

        $d        = $_POST;
        $required = ['title','eventType','eventDate','eventTime','ticketPrice'];
        foreach ($required as $f) {
            if (empty($d[$f])) sendResponse(400, false, "Field '$f' is required");
        }

        $imageUrl      = null;
        $imageFilename = null;
        if (!empty($_FILES['image'])) {
            try {
                $imageUrl      = Upload::save('image', 'events');
                $imageFilename = basename($imageUrl);
            } catch (Exception $e) {
                sendResponse(400, false, $e->getMessage());
            }
        }

        $model = new Event($conn);
        $event = $model->create([
            'title'        => $d['title'],
            'description'  => $d['description']  ?? null,
            'eventType'    => $d['eventType'],
            'location'     => $d['location']     ?? null,
            'latitude'     => isset($d['latitude'])  && $d['latitude']  !== '' ? (float)$d['latitude']  : null,
            'longitude'    => isset($d['longitude']) && $d['longitude'] !== '' ? (float)$d['longitude'] : null,
            'eventDate'    => $d['eventDate'],
            'eventTime'    => $d['eventTime'],
            'ticketPrice'  => (int)$d['ticketPrice'],
            'totalTickets' => isset($d['totalTickets']) && $d['totalTickets'] !== '' ? (int)$d['totalTickets'] : null,
            'imageUrl'     => $imageUrl,
            'status'       => $d['status'] ?? 'active',
        ]);

        sendResponse(201, true, 'Event created', $event);
    }

    // PUT /events/{id}  (admin)
    public static function update(string $id): void {
        global $conn;
        authorizeAdmin();
        $model = new Event($conn);
        if (!$model->findById($id)) sendResponse(404, false, 'Event not found');

        // Support both JSON and multipart
        $isMultipart = !empty($_FILES['image']);
        $d = $isMultipart ? $_POST : self::json();

        $data = array_filter([
            'title'        => $d['title']        ?? null,
            'description'  => $d['description']  ?? null,
            'eventType'    => $d['eventType']     ?? null,
            'location'     => $d['location']      ?? null,
            'latitude'     => isset($d['latitude'])  && $d['latitude']  !== '' ? (float)$d['latitude']  : null,
            'longitude'    => isset($d['longitude']) && $d['longitude'] !== '' ? (float)$d['longitude'] : null,
            'eventDate'    => $d['eventDate']     ?? null,
            'eventTime'    => $d['eventTime']     ?? null,
            'ticketPrice'  => isset($d['ticketPrice'])  ? (int)$d['ticketPrice']  : null,
            'totalTickets' => isset($d['totalTickets']) ? (int)$d['totalTickets'] : null,
            'status'       => $d['status']        ?? null,
        ], fn($v) => $v !== null);

        if ($isMultipart) {
            try {
                $data['imageUrl'] = Upload::save('image', 'events');
            } catch (Exception $e) {
                sendResponse(400, false, $e->getMessage());
            }
        }

        $event = $model->update($id, $data);
        sendResponse(200, true, 'Event updated', $event);
    }

    // DELETE /events/{id}  (admin)
    public static function delete(string $id): void {
        global $conn;
        authorizeAdmin();
        $model = new Event($conn);
        if (!$model->findById($id)) sendResponse(404, false, 'Event not found');
        $model->delete($id);
        sendResponse(200, true, 'Event deleted');
    }

    // POST /events/{id}/proceed-payment
    public static function proceedPayment(string $id): void {
        global $conn;
        $auth  = authenticate();
        $d     = self::json();
        $model = new Event($conn);
        $event = $model->findById($id);

        if (!$event) sendResponse(404, false, 'Event not found');
        if ($event['status'] !== 'active') sendResponse(400, false, 'Event is not available');

        if ($event['totalTickets'] !== null && $event['soldTickets'] >= $event['totalTickets']) {
            sendResponse(400, false, 'No tickets remaining');
        }

        if (empty($d['paymentMethod'])) sendResponse(400, false, 'paymentMethod is required');

        $methodModel = new PaymentMethodConfig($conn);
        $methodCfg   = $methodModel->findByMethod($d['paymentMethod']);

        $payModel = new Payment($conn);
        $payment  = $payModel->create([
            'eventId'       => $id,
            'userId'        => $auth['id'],
            'amount'        => $event['ticketPrice'],
            'paymentMethod' => $d['paymentMethod'],
            'phoneNumber'   => $d['phoneNumber'] ?? null,
            'status'        => 'pending',
        ]);

        // Notify admin
        try {
            $notif = new Notification($conn);
            $notif->create([
                'userId'   => null,
                'type'     => 'payment_created',
                'title'    => 'New Event Ticket Payment',
                'message'  => "Ticket payment for '{$event['title']}' via {$d['paymentMethod']}",
                'metadata' => json_encode(['paymentId' => $payment['id']]),
            ]);
        } catch (Throwable $e) {}

        sendResponse(200, true, 'Payment initiated', [
            'payment'      => $payment,
            'receiver'     => $methodCfg ? [
                'receiverName'          => $methodCfg['receiverName'],
                'receiverPhone'         => $methodCfg['receiverPhone'],
                'receiverAccountNumber' => $methodCfg['receiverAccountNumber'],
                'note'                  => $methodCfg['note'],
            ] : null,
            'instructions' => [
                'title' => 'Payment Instructions',
                'steps' => [
                    'Send the exact amount to the receiver details above',
                    'Take a screenshot of the confirmation',
                    'Upload the screenshot below',
                ],
                'note' => $methodCfg['note'] ?? null,
            ],
        ]);
    }

    private static function json(): array {
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }
}
