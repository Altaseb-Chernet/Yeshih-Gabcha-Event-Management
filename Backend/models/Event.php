<?php
// models/Event.php — matches events table

class Event {
    private PDO $conn;
    private string $table = 'events';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function create(array $data): array {
        $id  = $this->uuid();
        $sql = "INSERT INTO {$this->table}
                    (id, title, description, eventType, location, latitude, longitude,
                     eventDate, eventTime, ticketPrice, totalTickets, imageUrl, status)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

        $this->conn->prepare($sql)->execute([
            $id,
            $data['title'],
            $data['description']  ?? null,
            $data['eventType']    ?? 'other',
            $data['location']     ?? null,
            $data['latitude']     ?? null,
            $data['longitude']    ?? null,
            $data['eventDate'],
            $data['eventTime'],
            $data['ticketPrice'],
            $data['totalTickets'] ?? null,
            $data['imageUrl']     ?? null,
            $data['status']       ?? 'active',
        ]);

        return $this->findById($id);
    }

    public function findById(string $id): ?array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $row['remainingTickets'] = $row['totalTickets'] !== null
                ? max(0, $row['totalTickets'] - $row['soldTickets'])
                : null;
        }
        return $row ?: null;
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
            $where[] = '(title LIKE ? OR description LIKE ?)';
            $s = '%' . $filters['search'] . '%';
            array_push($params, $s, $s);
        }

        $sql = "SELECT * FROM {$this->table} WHERE " . implode(' AND ', $where)
             . " ORDER BY eventDate ASC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$row) {
            $row['remainingTickets'] = $row['totalTickets'] !== null
                ? max(0, $row['totalTickets'] - $row['soldTickets'])
                : null;
        }
        return $rows;
    }

    public function countAll(array $filters = []): int {
        $where  = ['1=1'];
        $params = [];
        if (!empty($filters['status'])) { $where[] = 'status = ?'; $params[] = $filters['status']; }

        $stmt = $this->conn->prepare(
            "SELECT COUNT(*) FROM {$this->table} WHERE " . implode(' AND ', $where)
        );
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    public function update(string $id, array $data): ?array {
        $allowed = ['title','description','eventType','location','latitude','longitude',
                    'eventDate','eventTime','ticketPrice','totalTickets','imageUrl','status'];
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

    public function delete(string $id): bool {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function incrementSold(string $id): bool {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET soldTickets = soldTickets + 1 WHERE id = ?"
        );
        return $stmt->execute([$id]);
    }

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
