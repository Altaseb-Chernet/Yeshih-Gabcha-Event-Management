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

    // READ ALL EVENTS
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // READ SINGLE EVENT
    public function readSingle() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->title = $row['title'];
            $this->description = $row['description'];
            $this->date = $row['date'];
            $this->location = $row['location'];
            $this->capacity = (int)$row['capacity'];
            $this->price = (float)$row['price'];
            $this->created_by = $row['created_by'];
            $this->created_at = $row['created_at'] ?? null;

            return true;
        }

        return false;
    }

    // CREATE EVENT
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET title=:title,
                      description=:description,
                      date=:date,
                      location=:location,
                      capacity=:capacity,
                      price=:price,
                      created_by=:created_by";

        $stmt = $this->conn->prepare($query);

        // sanitize
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->date = htmlspecialchars(strip_tags($this->date));
        $this->location = htmlspecialchars(strip_tags($this->location));
        $this->created_by = htmlspecialchars(strip_tags($this->created_by));

        // proper types
        $this->capacity = (int)$this->capacity;
        $this->price = (float)$this->price;

        // bind
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":capacity", $this->capacity, PDO::PARAM_INT);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":created_by", $this->created_by);

        if ($stmt->execute()) {
            return true;
        }

        error_log(json_encode($stmt->errorInfo()));
        return false;
    }

    // UPDATE EVENT
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET title=:title,
                      description=:description,
                      date=:date,
                      location=:location,
                      capacity=:capacity,
                      price=:price
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // sanitize
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->date = htmlspecialchars(strip_tags($this->date));
        $this->location = htmlspecialchars(strip_tags($this->location));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // types
        $this->capacity = (int)$this->capacity;
        $this->price = (float)$this->price;

        // bind
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":capacity", $this->capacity, PDO::PARAM_INT);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        error_log(json_encode($stmt->errorInfo()));
        return false;
    }

    // DELETE EVENT
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";

        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(1, $this->id);

        if ($stmt->execute()) {
            return true;
        }

        error_log(json_encode($stmt->errorInfo()));
        return false;
    }
}
?>