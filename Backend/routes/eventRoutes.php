<?php

require_once __DIR__ . '/../controllers/EventController.php';

$method = $_SERVER['REQUEST_METHOD'];

global $segments;
$id = $segments[1] ?? null;

switch ($method) {

    case 'GET':
        if ($id) {
            EventController::getEventById($id);
        } else {
            EventController::getEvents();
        }
        break;

    case 'POST':
        if (!$id) {
            EventController::createEvent();
        } else {
            sendResponse(404, false, "Endpoint not found");
        }
        break;

    case 'PUT':
        if ($id) {
            EventController::updateEvent($id);
        } else {
            sendResponse(400, false, "Event ID required");
        }
        break;

    case 'DELETE':
        if ($id) {
            EventController::deleteEvent($id);
        } else {
            sendResponse(400, false, "Event ID required");
        }
        break;

    default:
        sendResponse(405, false, "Method not allowed");
}