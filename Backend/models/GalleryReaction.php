<?php
// models/GalleryReaction.php — matches gallery_reactions table (reaction: like|dislike)

class GalleryReaction {
    private PDO $conn;
    private string $table = 'gallery_reactions';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    // Upsert: if user already reacted, update; else insert
    public function upsert(string $galleryId, string $userId, string $reaction): bool {
        $existing = $this->findByGalleryAndUser($galleryId, $userId);

        if ($existing) {
            $stmt = $this->conn->prepare(
                "UPDATE {$this->table} SET reaction = ? WHERE galleryId = ? AND userId = ?"
            );
            return $stmt->execute([$reaction, $galleryId, $userId]);
        }

        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (id, galleryId, userId, reaction) VALUES (?,?,?,?)"
        );
        return $stmt->execute([$this->uuid(), $galleryId, $userId, $reaction]);
    }

    public function findByGalleryAndUser(string $galleryId, string $userId): ?array {
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table} WHERE galleryId = ? AND userId = ? LIMIT 1"
        );
        $stmt->execute([$galleryId, $userId]);
        return $stmt->fetch() ?: null;
    }

    public function getCountsByGallery(string $galleryId): array {
        $stmt = $this->conn->prepare(
            "SELECT reaction, COUNT(*) as count FROM {$this->table}
             WHERE galleryId = ? GROUP BY reaction"
        );
        $stmt->execute([$galleryId]);
        $result = [];
        foreach ($stmt->fetchAll() as $row) {
            $result[$row['reaction']] = (int) $row['count'];
        }
        return $result;
    }

    public function delete(string $galleryId, string $userId): bool {
        $stmt = $this->conn->prepare(
            "DELETE FROM {$this->table} WHERE galleryId = ? AND userId = ?"
        );
        return $stmt->execute([$galleryId, $userId]);
    }

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
