<?php
// routes/bookingRoutes.php
// POST   /bookings/calc-price
// POST   /bookings
// GET    /bookings/my-bookings
// GET    /bookings/{id}
// POST   /bookings/{id}/proceed-payment
// GET    /bookings/{id}/qr
// GET    /bookings/admin/bookings
// PUT    /bookings/admin/bookings/{id}/status

require_once __DIR__ . '/../controllers/BookingController.php';

$method = $_SERVER['REQUEST_METHOD'];
$seg1   = $segments[1] ?? '';   // calc-price | my-bookings | admin | {id}
$seg2   = $segments[2] ?? '';   // bookings | proceed-payment | qr | status
$seg3   = $segments[3] ?? '';   // {id}  (under admin)
$seg4   = $segments[4] ?? '';   // status (under admin/{id})

switch (true) {

    // POST /bookings/calc-price
    case $method === 'POST' && $seg1 === 'calc-price':
        BookingController::calcPrice();
        break;

    // GET /bookings/my-bookings
    case $method === 'GET' && $seg1 === 'my-bookings':
        BookingController::myBookings();
        break;

    // GET /bookings/admin/bookings
    case $method === 'GET' && $seg1 === 'admin' && $seg2 === 'bookings' && $seg3 === '':
        BookingController::adminList();
        break;

    // PUT /bookings/admin/bookings/{id}/status
    case $method === 'PUT' && $seg1 === 'admin' && $seg2 === 'bookings' && $seg3 !== '' && $seg4 === 'status':
        BookingController::adminUpdateStatus($seg3);
        break;

    // POST /bookings/{id}/proceed-payment
    case $method === 'POST' && $seg1 !== '' && $seg2 === 'proceed-payment':
        BookingController::proceedPayment($seg1);
        break;

    // GET /bookings/{id}/qr
    case $method === 'GET' && $seg1 !== '' && $seg2 === 'qr':
        BookingController::getQr($seg1);
        break;

    // GET /bookings/{id}
    case $method === 'GET' && $seg1 !== '' && $seg2 === '':
        BookingController::getById($seg1);
        break;

    // POST /bookings
    case $method === 'POST' && $seg1 === '':
        BookingController::create();
        break;

    default:
        sendResponse(404, false, 'Booking endpoint not found');
}
