<?php
// routes/eventRoutes.php
// GET    /events
// GET    /events/{id}
// POST   /events/{id}/proceed-payment
// POST   /events
// PUT    /events/{id}
// DELETE /events/{id}

require_once __DIR__ . '/../controllers/EventController.php';

$method = $_SERVER['REQUEST_METHOD'];
$seg1   = $segments[1] ?? '';   // {id}
$seg2   = $segments[2] ?? '';   // proceed-payment

switch (true) {

    // POST /events/{id}/proceed-payment
    case $method === 'POST' && $seg1 !== '' && $seg2 === 'proceed-payment':
        EventController::proceedPayment($seg1);
        break;

    // GET /events/{id}
    case $method === 'GET' && $seg1 !== '':
        EventController::getById($seg1);
        break;

    // GET /events
    case $method === 'GET':
        EventController::getAll();
        break;

    // POST /events
    case $method === 'POST' && $seg1 === '':
        EventController::create();
        break;

    // PUT /events/{id}
    case $method === 'PUT' && $seg1 !== '':
        EventController::update($seg1);
        break;

    // DELETE /events/{id}
    case $method === 'DELETE' && $seg1 !== '':
        EventController::delete($seg1);
        break;

    default:
        sendResponse(404, false, 'Event endpoint not found');
}
