<?php

require_once __DIR__ . '/../controllers/EventController.php';

// Method Checking
$method = $_SERVER['REQUEST_METHOD'];

// Route Segments
// For url: index.php?route=events or index.php?route=events/1
// $segments = ['events', '1']
$id = isset($segments[1]) ? $segments[1] : null;

if ($method === 'GET') {
    if ($id) {
        EventController::getEventById($id);
    } else {
        EventController::getEvents();
    }
} elseif ($method === 'POST') {
    if (!$id) {
        EventController::createEvent();
    } else {
        sendResponse(404, false, "Endpoint not found");
    }
} elseif ($method === 'PUT') {
    if ($id) {
        EventController::updateEvent($id);
    } else {
        sendResponse(400, false, "Event ID required");
    }
} elseif ($method === 'DELETE') {
    if ($id) {
        EventController::deleteEvent($id);
    } else {
        sendResponse(400, false, "Event ID required");
    }
} else {
    sendResponse(405, false, "Method not allowed");
}
?>