<?php
// backend-php/models/Event.php

class Event {
    private $conn;
    private $table_name = "events";

    public $id;
    public $title;
    public $description;
    public $date;
    public $location;
    public $capacity;
    public $price;
    public $created_by;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Read all events
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Read single event
    public function readSingle() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $this->title = $row['title'];
            $this->description = $row['description'];
            $this->date = $row['date'];
            $this->location = $row['location'];
            $this->capacity = $row['capacity'];
            $this->price = $row['price'];
            $this->created_by = $row['created_by'];
            return true;
        }
        return false;
    }

    // Create event
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET title=:title, description=:description, date=:date, 
                      location=:location, capacity=:capacity, price=:price, created_by=:created_by";

        $stmt = $this->conn->prepare($query);

        // sanitize
        $this->title=htmlspecialchars(strip_tags($this->title));
        $this->description=htmlspecialchars(strip_tags($this->description));
        $this->date=htmlspecialchars(strip_tags($this->date));
        $this->location=htmlspecialchars(strip_tags($this->location));
        $this->capacity=htmlspecialchars(strip_tags($this->capacity));
        $this->price=htmlspecialchars(strip_tags($this->price));
        $this->created_by=htmlspecialchars(strip_tags($this->created_by));

        // bind data
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":capacity", $this->capacity);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":created_by", $this->created_by);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Update event
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET title=:title, description=:description, date=:date, 
                      location=:location, capacity=:capacity, price=:price 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->title=htmlspecialchars(strip_tags($this->title));
        $this->description=htmlspecialchars(strip_tags($this->description));
        $this->date=htmlspecialchars(strip_tags($this->date));
        $this->location=htmlspecialchars(strip_tags($this->location));
        $this->capacity=htmlspecialchars(strip_tags($this->capacity));
        $this->price=htmlspecialchars(strip_tags($this->price));
        $this->id=htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":capacity", $this->capacity);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Delete event
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $this->id=htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>