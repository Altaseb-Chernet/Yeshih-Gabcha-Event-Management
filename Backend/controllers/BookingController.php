<?php
// backend-php/controllers/BookingController.php

require_once __DIR__ . '/../models/Booking.php';
require_once __DIR__ . '/../models/Event.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class BookingController {
    
    // POST /bookings
    public static function createBooking() {
        $user = authenticate();
        
        global $conn;
        $booking = new Booking($conn);
        $event = new Event($conn);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->event_id) && !empty($data->tickets)) {
            $event->id = $data->event_id;
            
            // Check if event exists
            if (!$event->readSingle()) {
                sendResponse(404, false, "Event not found.");
            }
            
            // TODO: Ideally check event capacity here to prevent overbooking
            
            $booking->user_id = $user->id;
            $booking->event_id = $data->event_id;
            $booking->tickets = $data->tickets;
            
            if ($booking->create()) {
                sendResponse(201, true, "Booking created successfully.", ["payment_status" => "unpaid", "status" => "pending"]);
            } else {
                sendResponse(503, false, "Unable to create booking.");
            }
        } else {
            sendResponse(400, false, "Incomplete data. event_id and tickets are required.");
        }
    }
    
    // GET /bookings
    public static function getUserBookings() {
        $user = authenticate();
        
        global $conn;
        $booking = new Booking($conn);
        $booking->user_id = $user->id;
        
        $result = $booking->readByUser();
        
        $bookings_arr = [];
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            array_push($bookings_arr, $row);
        }
        
        sendResponse(200, true, "Bookings fetched successfully.", $bookings_arr);
    }
    
    // GET /bookings/event/:eventId
    // Needs to be an admin or the event organizer
    public static function getEventBookings($eventId) {
        $user = authenticate();
        
        global $conn;
        $event = new Event($conn);
        $event->id = $eventId;
        
        if (!$event->readSingle()) {
            sendResponse(404, false, "Event not found.");
        }
        
        // Authorization check
        if ($user->role !== 'admin' && $event->created_by != $user->id) {
            sendResponse(403, false, "Not authorized to view bookings for this event.");
        }
        
        $booking = new Booking($conn);
        $booking->event_id = $eventId;
        
        $result = $booking->readByEvent();
        
        $bookings_arr = [];
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            array_push($bookings_arr, $row);
        }
        
        sendResponse(200, true, "Event bookings fetched successfully.", $bookings_arr);
    }
    
    // PUT /bookings/:id
    public static function updateBookingStatus($id) {
        $user = authenticate();
        
        global $conn;
        $booking = new Booking($conn);
        $booking->id = $id;
        
        if (!$booking->readSingle()) {
            sendResponse(404, false, "Booking not found.");
        }
        
        $event = new Event($conn);
        $event->id = $booking->event_id;
        $event->readSingle();
        
        // Optional logic: Admins/organizers can update any booking, users can cancel their own bookings
        if ($user->role !== 'admin' && $event->created_by != $user->id && $booking->user_id != $user->id) {
            sendResponse(403, false, "Not authorized to modify this booking.");
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        $booking->status = isset($data->status) ? $data->status : $booking->status;
        $booking->payment_status = isset($data->payment_status) ? $data->payment_status : $booking->payment_status;
        
        if ($booking->updateStatus()) {
            sendResponse(200, true, "Booking status updated successfully.");
        } else {
            sendResponse(503, false, "Unable to update booking status.");
        }
    }
}
?>