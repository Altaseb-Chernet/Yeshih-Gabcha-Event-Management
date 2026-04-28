<?php

require_once __DIR__ . '/../models/Event.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class EventController {

    // GET ALL EVENTS
    public static function getEvents() {
        global $conn;

        $event = new Event($conn);
        $result = $event->read();

        $events = [];

        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $events[] = $row;
        }

        sendResponse(200, true, "Events fetched successfully", $events);
    }

    // GET SINGLE EVENT
    public static function getEventById($id) {
        global $conn;

        $event = new Event($conn);
        $event->id = $id;

        if ($event->readSingle()) {
            sendResponse(200, true, "Event fetched successfully", [
                "id" => $event->id,
                "title" => $event->title,
                "description" => $event->description,
                "date" => $event->date,
                "location" => $event->location,
                "capacity" => $event->capacity,
                "price" => $event->price,
                "created_by" => $event->created_by
            ]);
        }

        sendResponse(404, false, "Event not found");
    }

    // CREATE EVENT
    public static function createEvent() {
        $user = authenticate();
        global $conn;

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            sendResponse(400, false, "Invalid JSON");
        }

        if (
            empty($data['title']) ||
            empty($data['date']) ||
            empty($data['location']) ||
            empty($data['capacity'])
        ) {
            sendResponse(400, false, "Missing required fields");
        }

        $event = new Event($conn);

        $event->title = $data['title'];
        $event->description = $data['description'] ?? '';
        $event->date = $data['date'];
        $event->location = $data['location'];
        $event->capacity = $data['capacity'];
        $event->price = $data['price'] ?? 0;
        $event->created_by = $user->id;

        if ($event->create()) {
            sendResponse(201, true, "Event created successfully");
        }

        sendResponse(500, false, "Failed to create event");
    }

    // UPDATE EVENT
    public static function updateEvent($id) {
        $user = authenticate();
        global $conn;

        $event = new Event($conn);
        $event->id = $id;

        if (!$event->readSingle()) {
            sendResponse(404, false, "Event not found");
        }

        if ($user->role !== 'admin' && $event->created_by != $user->id) {
            sendResponse(403, false, "Not authorized");
        }

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            sendResponse(400, false, "Invalid JSON");
        }

        $event->title = $data['title'] ?? $event->title;
        $event->description = $data['description'] ?? $event->description;
        $event->date = $data['date'] ?? $event->date;
        $event->location = $data['location'] ?? $event->location;
        $event->capacity = $data['capacity'] ?? $event->capacity;
        $event->price = $data['price'] ?? $event->price;

        if ($event->update()) {
            sendResponse(200, true, "Event updated successfully");
        }

        sendResponse(500, false, "Failed to update event");
    }

    // DELETE EVENT
    public static function deleteEvent($id) {
        $user = authenticate();
        global $conn;

        $event = new Event($conn);
        $event->id = $id;

        if (!$event->readSingle()) {
            sendResponse(404, false, "Event not found");
        }

        if ($user->role !== 'admin' && $event->created_by != $user->id) {
            sendResponse(403, false, "Not authorized");
        }

        if ($event->delete()) {
            sendResponse(200, true, "Event deleted successfully");
        }

        sendResponse(500, false, "Failed to delete event");
    }
}