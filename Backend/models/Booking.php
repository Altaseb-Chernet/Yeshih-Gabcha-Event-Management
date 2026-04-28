<?php
// backend-php/models/Booking.php

class Booking {
    private $conn;
    private $table_name = "bookings";

    public $id;
    public $user_id;
    public $event_id;
    public $tickets;
    public $status;
    public $payment_status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create a new booking
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET user_id=:user_id, event_id=:event_id, tickets=:tickets";

        $stmt = $this->conn->prepare($query);

        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->event_id = htmlspecialchars(strip_tags($this->event_id));
        $this->tickets = htmlspecialchars(strip_tags($this->tickets));

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":event_id", $this->event_id);
        $stmt->bindParam(":tickets", $this->tickets);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get bookings by a specific user
    public function readByUser() {
        // We will do a JOIN to get some event details as well
        $query = "SELECT b.id, b.tickets, b.status, b.payment_status, b.created_at, e.title as event_title, e.date as event_date, e.location as event_location, e.price as event_price 
                  FROM " . $this->table_name . " b
                  LEFT JOIN events e ON b.event_id = e.id 
                  WHERE b.user_id = ? ORDER BY b.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();

        return $stmt;
    }

    // Get all bookings for a specific event
    public function readByEvent() {
        $query = "SELECT b.id, b.tickets, b.status, b.payment_status, b.created_at, u.name as user_name, u.email as user_email
                  FROM " . $this->table_name . " b
                  LEFT JOIN users u ON b.user_id = u.id 
                  WHERE b.event_id = ? ORDER BY b.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->event_id);
        $stmt->execute();

        return $stmt;
    }

    // Read single booking
    public function readSingle() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $this->user_id = $row['user_id'];
            $this->event_id = $row['event_id'];
            $this->tickets = $row['tickets'];
            $this->status = $row['status'];
            $this->payment_status = $row['payment_status'];
            return true;
        }
        return false;
    }

    // Update booking status
    public function updateStatus() {
        $query = "UPDATE " . $this->table_name . " 
                  SET status=:status, payment_status=:payment_status 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->payment_status = htmlspecialchars(strip_tags($this->payment_status));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":payment_status", $this->payment_status);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>