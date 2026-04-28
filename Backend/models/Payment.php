<?php
// backend-php/models/Payment.php

class Payment {
    private $conn;
    private $table = 'payments';
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (id, bookingId, eventId, userId, amount, currency, paymentMethod, phoneNumber, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        
        $id = uniqid('payment_', true);
        
        return $stmt->execute([
            $id,
            $data['bookingId'] ?? null,
            $data['eventId'] ?? null,
            $data['userId'] ?? null,
            $data['amount'],
            $data['currency'] ?? 'ETB',
            $data['paymentMethod'],
            $data['phoneNumber'] ?? null,
            $data['status'] ?? 'pending'
        ]);
    }
    
    public function findById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findByTransactionId($transactionId) {
        $sql = "SELECT * FROM {$this->table} WHERE transactionId = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$transactionId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function update($id, $data) {
        $sql = "UPDATE {$this->table} SET ";
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            $values[] = $value;
        }
        
        $sql .= implode(', ', $fields) . " WHERE id = ?";
        $values[] = $id;
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($values);
    }
    
    public function getByBooking($bookingId) {
        $sql = "SELECT * FROM {$this->table} WHERE bookingId = ? ORDER BY createdAt DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$bookingId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getByUser($userId, $limit = 10, $offset = 0) {
        $sql = "SELECT * FROM {$this->table} WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId, $limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function delete($id) {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
}
?>
