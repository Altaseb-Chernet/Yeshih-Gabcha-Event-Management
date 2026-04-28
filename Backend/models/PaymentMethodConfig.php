<?php
// backend-php/models/PaymentMethodConfig.php

class PaymentMethodConfig {
    private $conn;
    private $table = 'payment_method_config';
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (id, method, isEnabled, apiKey, apiSecret, config) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        
        $id = uniqid('pmethod_', true);
        
        return $stmt->execute([
            $id,
            $data['method'],
            $data['isEnabled'] ?? true,
            $data['apiKey'] ?? null,
            $data['apiSecret'] ?? null,
            isset($data['config']) ? json_encode($data['config']) : null
        ]);
    }
    
    public function findByMethod($method) {
        $sql = "SELECT * FROM {$this->table} WHERE method = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$method]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getAll() {
        $sql = "SELECT * FROM {$this->table} ORDER BY createdAt DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getEnabled() {
        $sql = "SELECT * FROM {$this->table} WHERE isEnabled = TRUE ORDER BY createdAt DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function update($method, $data) {
        $sql = "UPDATE {$this->table} SET ";
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            $fields[] = "$key = ?";
            if ($key === 'config') {
                $values[] = json_encode($value);
            } else {
                $values[] = $value;
            }
        }
        
        $sql .= implode(', ', $fields) . " WHERE method = ?";
        $values[] = $method;
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($values);
    }
}
?>
