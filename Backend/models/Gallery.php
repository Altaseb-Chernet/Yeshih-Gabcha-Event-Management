<?php
// backend-php/models/Gallery.php

class Gallery {
    private $conn;
    private $table_name = "gallery";

    public $id;
    public $event_id;
    public $image_url;
    public $caption;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Read all gallery items
    public function read() {
        $query = "SELECT g.*, e.title as event_title 
                  FROM " . $this->table_name . " g 
                  LEFT JOIN events e ON g.event_id = e.id 
                  ORDER BY g.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Read single gallery item
    public function readSingle() {
        $query = "SELECT g.*, e.title as event_title 
                  FROM " . $this->table_name . " g 
                  LEFT JOIN events e ON g.event_id = e.id 
                  WHERE g.id = ? 
                  LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $this->event_id = $row['event_id'];
            $this->image_url = $row['image_url'];
            $this->caption = $row['caption'];
            return true;
        }
        return false;
    }

    // Read by event ID
    public function readByEvent() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE event_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->event_id);
        $stmt->execute();
        return $stmt;
    }

    // Create a new gallery image record
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET event_id=:event_id, image_url=:image_url, caption=:caption";

        $stmt = $this->conn->prepare($query);

        $this->event_id = htmlspecialchars(strip_tags($this->event_id));
        $this->image_url = htmlspecialchars(strip_tags($this->image_url));
        $this->caption = htmlspecialchars(strip_tags($this->caption ?? ''));

        // Bind logic: if event_id is null/empty, we can insert NULL
        if (empty($this->event_id)) {
            $stmt->bindValue(":event_id", null, PDO::PARAM_NULL);
        } else {
            $stmt->bindParam(":event_id", $this->event_id);
        }
        
        $stmt->bindParam(":image_url", $this->image_url);
        $stmt->bindParam(":caption", $this->caption);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Delete gallery item
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>