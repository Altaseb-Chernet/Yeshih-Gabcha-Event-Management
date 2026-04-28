<?php
// backend-php/models/Notification.php

class Notification {
    private $conn;
    private $table = 'notifications';
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (id, userId, type, title, message, data, isRead) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        
        $id = uniqid('notif_', true);
        
        return $stmt->execute([
            $id,
            $data['userId'],
            $data['type'],
            $data['title'],
            $data['message'] ?? null,
            isset($data['data']) ? json_encode($data['data']) : null,
            $data['isRead'] ?? false
        ]);
    }
    
    public function findById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getByUser($userId, $limit = 20, $offset = 0) {
        $sql = "SELECT * FROM {$this->table} WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId, $limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function markAsRead($id) {
        $sql = "UPDATE {$this->table} SET isRead = TRUE, readAt = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function markAllAsRead($userId) {
        $sql = "UPDATE {$this->table} SET isRead = TRUE, readAt = NOW() WHERE userId = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$userId]);
    }
    
    public function delete($id) {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function getUnreadCount($userId) {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE userId = ? AND isRead = FALSE";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }
}
?>
