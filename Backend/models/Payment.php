<?php
// models/Payment.php — matches payments table
// status: pending | completed | failed
// paymentMethod: telebirr | cbe | commercial | abisiniya | abyssinia

class Payment {
    private PDO $conn;
    private string $table = 'payments';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function create(array $data): array {
        $id  = $this->uuid();
        $sql = "INSERT INTO {$this->table}
                    (id, bookingId, eventId, userId, amount, currency,
                     paymentMethod, phoneNumber, status, transactionId)
                VALUES (?,?,?,?,?,?,?,?,?,?)";

        $this->conn->prepare($sql)->execute([
            $id,
            $data['bookingId']     ?? null,
            $data['eventId']       ?? null,
            $data['userId'],
            $data['amount'],
            $data['currency']      ?? 'ETB',
            $data['paymentMethod'],
            $data['phoneNumber']   ?? null,
            $data['status']        ?? 'pending',
            $data['transactionId'] ?? null,
        ]);

        return $this->findById($id);
    }

    public function findById(string $id): ?array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function getByUser(string $userId, int $limit = 20, int $offset = 0, array $filters = []): array {
        $where  = ['userId = ?'];
        $params = [$userId];

        if (!empty($filters['status'])) {
            $where[] = 'status = ?';
            $params[] = $filters['status'];
        }

        $sql = "SELECT * FROM {$this->table} WHERE " . implode(' AND ', $where)
             . " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getAll(int $limit = 20, int $offset = 0, array $filters = []): array {
        $where  = ['1=1'];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = 'p.status = ?';
            $params[] = $filters['status'];
        }
        if (!empty($filters['method'])) {
            $where[] = 'p.paymentMethod = ?';
            $params[] = $filters['method'];
        }
        // event payments only
        if (!empty($filters['eventOnly'])) {
            $where[] = 'p.eventId IS NOT NULL';
        }
        // booking payments only
        if (!empty($filters['bookingOnly'])) {
            $where[] = 'p.bookingId IS NOT NULL';
        }

        $sql = "SELECT p.*, u.firstName, u.lastName, u.email as userEmail
                FROM {$this->table} p
                LEFT JOIN users u ON p.userId = u.id
                WHERE " . implode(' AND ', $where)
             . " ORDER BY p.createdAt DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function countAll(array $filters = []): int {
        $where  = ['1=1'];
        $params = [];
        if (!empty($filters['status']))    { $where[] = 'status = ?';        $params[] = $filters['status']; }
        if (!empty($filters['eventOnly'])) { $where[] = 'eventId IS NOT NULL'; }

        $stmt = $this->conn->prepare(
            "SELECT COUNT(*) FROM {$this->table} WHERE " . implode(' AND ', $where)
        );
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    public function update(string $id, array $data): ?array {
        $allowed = ['status','proofUrl','transactionId','paymentDate'];
        $fields  = [];
        $values  = [];

        foreach ($data as $k => $v) {
            if (in_array($k, $allowed, true)) {
                $fields[] = "$k = ?";
                $values[] = $v;
            }
        }
        if (empty($fields)) return $this->findById($id);

        $values[] = $id;
        $this->conn->prepare(
            "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?"
        )->execute($values);

        return $this->findById($id);
    }

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
