<?php
// models/Booking.php — matches bookings table

class Booking {
    private PDO $conn;
    private string $table = 'bookings';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function create(array $data): array {
        $id = $this->uuid();
        $sql = "INSERT INTO {$this->table}
                    (id, userId, customerName, customerEmail, customerPhone,
                     serviceId, serviceSnapshot, eventType, eventDate, eventTime,
                     guestCount, durationHours, totalPrice, status, notes)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        $this->conn->prepare($sql)->execute([
            $id,
            $data['userId']          ?? null,
            $data['customerName'],
            $data['customerEmail'],
            $data['customerPhone'],
            $data['serviceId']       ?? null,
            isset($data['serviceSnapshot']) ? json_encode($data['serviceSnapshot']) : null,
            $data['eventType']       ?? 'other',
            $data['eventDate']       ?? null,
            $data['eventTime']       ?? null,
            $data['guestCount']      ?? null,
            $data['durationHours']   ?? 5,
            $data['totalPrice']      ?? 0,
            $data['status']          ?? 'pending',
            $data['notes']           ?? null,
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

    public function countByUser(string $userId): int {
        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM {$this->table} WHERE userId = ?");
        $stmt->execute([$userId]);
        return (int) $stmt->fetchColumn();
    }

    public function getAll(int $limit = 20, int $offset = 0, array $filters = []): array {
        $where  = ['1=1'];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = 'status = ?';
            $params[] = $filters['status'];
        }
        if (!empty($filters['eventType'])) {
            $where[] = 'eventType = ?';
            $params[] = $filters['eventType'];
        }
        if (!empty($filters['search'])) {
            $where[] = '(customerName LIKE ? OR customerEmail LIKE ? OR customerPhone LIKE ?)';
            $s = '%' . $filters['search'] . '%';
            array_push($params, $s, $s, $s);
        }

        $sql = "SELECT b.*, u.firstName, u.lastName, u.email as userEmail
                FROM {$this->table} b
                LEFT JOIN users u ON b.userId = u.id
                WHERE " . implode(' AND ', $where)
             . " ORDER BY b.createdAt DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function countAll(array $filters = []): int {
        $where  = ['1=1'];
        $params = [];
        if (!empty($filters['status']))    { $where[] = 'status = ?';    $params[] = $filters['status']; }
        if (!empty($filters['eventType'])) { $where[] = 'eventType = ?'; $params[] = $filters['eventType']; }

        $stmt = $this->conn->prepare(
            "SELECT COUNT(*) FROM {$this->table} WHERE " . implode(' AND ', $where)
        );
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    public function updateStatus(string $id, string $status): ?array {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET status = ? WHERE id = ?"
        );
        $stmt->execute([$status, $id]);
        return $this->findById($id);
    }

    public function updateQr(string $id, string $qrCode): bool {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET qrCode = ? WHERE id = ?"
        );
        return $stmt->execute([$qrCode, $id]);
    }

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
