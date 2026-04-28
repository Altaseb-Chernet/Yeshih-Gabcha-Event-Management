<?php
// backend-php/models/Service.php

class Service {
    private $conn;
    private $table_name = "services";

    public $id;
    public $name;
    public $description;
    public $price;
    public $image_url;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Read all services
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Read single service
    public function readSingle() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $this->name = $row['name'];
            $this->description = $row['description'];
            $this->price = $row['price'];
            $this->image_url = $row['image_url'];
            return true;
        }
        return false;
    }

    // Create service
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name=:name, description=:description, price=:price, image_url=:image_url";

        $stmt = $this->conn->prepare($query);

        $this->name=htmlspecialchars(strip_tags($this->name));
        $this->description=htmlspecialchars(strip_tags($this->description));
        $this->price=htmlspecialchars(strip_tags($this->price));
        $this->image_url=htmlspecialchars(strip_tags($this->image_url ?? ''));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":image_url", $this->image_url);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Update service
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name=:name, description=:description, price=:price, image_url=:image_url 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->name=htmlspecialchars(strip_tags($this->name));
        $this->description=htmlspecialchars(strip_tags($this->description));
        $this->price=htmlspecialchars(strip_tags($this->price));
        $this->image_url=htmlspecialchars(strip_tags($this->image_url ?? ''));
        $this->id=htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":image_url", $this->image_url);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Delete service
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