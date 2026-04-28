<?php
// backend-php/models/GalleryReaction.php

class GalleryReaction {
    private $conn;
    private $table = 'gallery_reactions';
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (id, galleryId, userId, reactionType) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        
        $id = uniqid('reaction_', true);
        
        return $stmt->execute([
            $id,
            $data['galleryId'],
            $data['userId'],
            $data['reactionType']
        ]);
    }
    
    public function findByGalleryAndUser($galleryId, $userId) {
        $sql = "SELECT * FROM {$this->table} WHERE galleryId = ? AND userId = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$galleryId, $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function delete($id) {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function getReactionsByGallery($galleryId) {
        $sql = "SELECT reactionType, COUNT(*) as count FROM {$this->table} WHERE galleryId = ? GROUP BY reactionType";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$galleryId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getTotalReactionCount($galleryId) {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE galleryId = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$galleryId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] ?? 0;
    }
}
?>
