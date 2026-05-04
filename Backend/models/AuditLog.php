<?php
// models/AuditLog.php — matches audit_logs table

class AuditLog {
    private PDO $conn;
    private string $table = 'audit_logs';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function create(array $data): bool {
        $sql = "INSERT INTO {$this->table}
                    (id, userId, action, resourceType, resourceId, ip, userAgent, data)
                VALUES (?,?,?,?,?,?,?,?)";

        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            $this->uuid(),
            $data['userId']       ?? null,
            $data['action'],
            $data['resourceType'],
            $data['resourceId']   ?? null,
            $data['ip']           ?? ($_SERVER['REMOTE_ADDR'] ?? null),
            $data['userAgent']    ?? ($_SERVER['HTTP_USER_AGENT'] ?? null),
            isset($data['data'])  ? json_encode($data['data']) : null,
        ]);
    }

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
