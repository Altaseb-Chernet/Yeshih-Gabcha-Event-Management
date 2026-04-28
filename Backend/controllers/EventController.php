<?php

require_once __DIR__ . '/../models/Event.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class EventController {
    
    // GET /events
    public static function getEvents() {
        global $conn;
        $event = new Event($conn);
        $result = $event->read();
        
        $events_arr = [];
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            array_push($events_arr, $row);
        }
        
        sendResponse(200, true, "Events fetched successfully", $events_arr);
    }
    
    // GET /events/:id
    public static function getEventById($id) {
        global $conn;
        $event = new Event($conn);
        $event->id = $id;
        
        if ($event->readSingle()) {
            $event_data = [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'location' => $event->location,
                'capacity' => $event->capacity,
                'price' => $event->price,
                'created_by' => $event->created_by
            ];
            sendResponse(200, true, "Event fetched successfully", $event_data);
        } else {
            sendResponse(404, false, "Event not found");
        }
    }
    
    // POST /events
    public static function createEvent() {
        // Protected route
        $user = authenticate();
        
        global $conn;
        $event = new Event($conn);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->title) && !empty($data->date) && !empty($data->location) && !empty($data->capacity)) {
            $event->title = $data->title;
            $event->description = $data->description ?? '';
            $event->date = $data->date;
            $event->location = $data->location;
            $event->capacity = $data->capacity;
            $event->price = $data->price ?? 0.00;
            $event->created_by = $user->id; // Use authenticated user ID
            
            if ($event->create()) {
                sendResponse(201, true, "Event created successfully.");
            } else {
                sendResponse(503, false, "Unable to create event.");
            }
        } else {
            sendResponse(400, false, "Unable to create event. Make sure title, date, location and capacity are provided.");
        }
    }
    
    // PUT /events/:id
    public static function updateEvent($id) {
        // Protected route
        $user = authenticate();
        
        global $conn;
        $event = new Event($conn);
        $event->id = $id;
        
        // Verify existence and authorization
        if (!$event->readSingle()) {
            sendResponse(404, false, "Event not found.");
        }
        
        // Optional: Ensure only an admin or the event creator can update it
        if ($user->role !== 'admin' && $event->created_by != $user->id) {
            sendResponse(403, false, "Not authorized to update this event.");
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        // Set new property values dynamically, defaulting to previous ones if not provided
        $event->title = isset($data->title) ? $data->title : $event->title;
        $event->description = isset($data->description) ? $data->description : $event->description;
        $event->date = isset($data->date) ? $data->date : $event->date;
        $event->location = isset($data->location) ? $data->location : $event->location;
        $event->capacity = isset($data->capacity) ? $data->capacity : $event->capacity;
        $event->price = isset($data->price) ? $data->price : $event->price;
        
        if ($event->update()) {
            sendResponse(200, true, "Event updated successfully.");
        } else {
            sendResponse(503, false, "Unable to update event.");
        }
    }
    
    // DELETE /events/:id
    public static function deleteEvent($id) {
        // Protected route
        $user = authenticate();
        
        global $conn;
        $event = new Event($conn);
        $event->id = $id;
        
        // Verify existence
        if (!$event->readSingle()) {
            sendResponse(404, false, "Event not found.");
        }
        
        // Optional: Ensure only an admin or the event creator can delete it
        if ($user->role !== 'admin' && $event->created_by != $user->id) {
            sendResponse(403, false, "Not authorized to delete this event.");
        }
        
        if ($event->delete()) {
            sendResponse(200, true, "Event deleted successfully.");
        } else {
            sendResponse(503, false, "Unable to delete event.");
        }
    }
}
?>