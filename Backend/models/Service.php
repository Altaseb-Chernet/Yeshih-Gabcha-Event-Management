<?php
// models/Service.php — matches services table

class Service {
    private PDO $conn;
    private string $table = 'services';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function create(array $data): array {
        $id  = $this->uuid();
        $sql = "INSERT INTO {$this->table}
                    (id, name, description, price, currency, category, status, featured, images)
                VALUES (?,?,?,?,?,?,?,?,?)";

        $this->conn->prepare($sql)->execute([
            $id,
            $data['name'],
            $data['description'] ?? null,
            $data['price'],
            $data['currency']    ?? 'ETB',
            $data['category'],
            $data['status']      ?? 'active',
            isset($data['featured']) ? (int)(bool)$data['featured'] : 0,
            isset($data['images']) ? json_encode($data['images']) : json_encode([]),
        ]);

        return $this->findById($id);
    }

    public function findById(string $id): ?array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) $row['images'] = json_decode($row['images'] ?? '[]', true);
        return $row ?: null;
    }

    public function getAll(int $limit = 20, int $offset = 0, array $filters = []): array {
        $where  = ['1=1'];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = 'status = ?';
            $params[] = $filters['status'];
        }
        if (!empty($filters['category'])) {
            $where[] = 'category = ?';
            $params[] = $filters['category'];
        }
        if (isset($filters['featured'])) {
            $where[] = 'featured = ?';
            $params[] = (int)(bool)$filters['featured'];
        }

        $sql = "SELECT * FROM {$this->table} WHERE " . implode(' AND ', $where)
             . " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$row) {
            $row['images'] = json_decode($row['images'] ?? '[]', true);
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
        $allowed = ['name','description','price','currency','category','status','featured','images'];
        $fields  = [];
        $values  = [];

        foreach ($data as $k => $v) {
            if (!in_array($k, $allowed, true)) continue;
            $fields[] = "$k = ?";
            if ($k === 'images')    $values[] = json_encode($v);
            elseif ($k === 'featured') $values[] = (int)(bool)$v;
            else $values[] = $v;
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

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
