<?php
// backend-php/models/PricingRule.php

class PricingRule {
    private $conn;
    private $table = 'pricing_rules';
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (id, eventId, name, type, discountType, discountValue, validFrom, validTo, maxUses, isActive) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        
        $id = uniqid('pricing_', true);
        
        return $stmt->execute([
            $id,
            $data['eventId'],
            $data['name'],
            $data['type'] ?? 'discount',
            $data['discountType'] ?? 'percentage',
            $data['discountValue'],
            $data['validFrom'] ?? null,
            $data['validTo'] ?? null,
            $data['maxUses'] ?? null,
            $data['isActive'] ?? true
        ]);
    }
    
    public function findById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getByEvent($eventId) {
        $sql = "SELECT * FROM {$this->table} WHERE eventId = ? AND isActive = TRUE ORDER BY createdAt DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$eventId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
    
    public function delete($id) {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
}
?>
