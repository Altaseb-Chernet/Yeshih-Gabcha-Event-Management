<?php
// backend-php/models/AuditLog.php

class AuditLog {
    private $conn;
    private $table = 'audit_logs';
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (id, userId, action, entity, entityId, changes, ipAddress, userAgent) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        
        $id = uniqid('audit_', true);
        
        return $stmt->execute([
            $id,
            $data['userId'] ?? null,
            $data['action'],
            $data['entity'] ?? null,
            $data['entityId'] ?? null,
            isset($data['changes']) ? json_encode($data['changes']) : null,
            $data['ipAddress'] ?? $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    }
    
    public function getLogs($limit = 50, $offset = 0) {
        $sql = "SELECT * FROM {$this->table} ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getByUser($userId, $limit = 20) {
        $sql = "SELECT * FROM {$this->table} WHERE userId = ? ORDER BY createdAt DESC LIMIT ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getByEntity($entity, $entityId) {
        $sql = "SELECT * FROM {$this->table} WHERE entity = ? AND entityId = ? ORDER BY createdAt DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$entity, $entityId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
