<?php
// backend-php/models/User.php

class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $name;
    public $email;
    public $password;
    public $role;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Register User
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " SET name=:name, email=:email, password=:password, role=:role";
        $stmt = $this->conn->prepare($query);

        // sanitize
        $this->name=htmlspecialchars(strip_tags($this->name));
        $this->email=htmlspecialchars(strip_tags($this->email));
        $this->role=htmlspecialchars(strip_tags($this->role ?? 'user'));
        
        // hash password
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);

        // bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":role", $this->role);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Check if email exists
    public function emailExists() {
        $query = "SELECT id, name, password, role FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        $num = $stmt->rowCount();

        if($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->password = $row['password'];
            $this->role = $row['role'];
            return true;
        }
        return false;
    }

    // Find user by ID
    public function findById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>