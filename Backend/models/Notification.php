<?php
// models/Notification.php — matches notifications table
// `read` column (backtick-quoted because it's a reserved word)

class Notification {
    private PDO $conn;
    private string $table = 'notifications';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function create(array $data): array {
        $id  = $this->uuid();
        $sql = "INSERT INTO {$this->table} (id, userId, type, title, message, `read`, metadata)
                VALUES (?,?,?,?,?,?,?)";

        $this->conn->prepare($sql)->execute([
            $id,
            $data['userId']   ?? null,
            $data['type'],
            $data['title'],
            $data['message'],
            0,
            isset($data['metadata']) ? json_encode($data['metadata']) : null,
        ]);

        return $this->findById($id);
    }

    public function findById(string $id): ?array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    // Admin notifications = userId IS NULL (system-wide) or all
    public function getAdminNotifications(int $limit = 20, int $offset = 0, array $filters = []): array {
        $where  = ['1=1'];
        $params = [];

        if (isset($filters['isRead'])) {
            $where[] = '`read` = ?';
            $params[] = (int)(bool)$filters['isRead'];
        }

        $sql = "SELECT * FROM {$this->table} WHERE " . implode(' AND ', $where)
             . " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function countAdminUnread(): int {
        $stmt = $this->conn->prepare(
            "SELECT COUNT(*) FROM {$this->table} WHERE `read` = 0"
        );
        $stmt->execute();
        return (int) $stmt->fetchColumn();
    }

    public function countAll(array $filters = []): int {
        $where  = ['1=1'];
        $params = [];
        if (isset($filters['isRead'])) { $where[] = '`read` = ?'; $params[] = (int)(bool)$filters['isRead']; }

        $stmt = $this->conn->prepare(
            "SELECT COUNT(*) FROM {$this->table} WHERE " . implode(' AND ', $where)
        );
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    public function markAsRead(string $id): bool {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET `read` = 1 WHERE id = ?"
        );
        return $stmt->execute([$id]);
    }

    public function markAllAsRead(): bool {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET `read` = 1 WHERE `read` = 0"
        );
        return $stmt->execute();
    }

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
