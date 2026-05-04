<?php
// models/Gallery.php — matches gallery table (imageFilename + imageUrl, no reactions column)

class Gallery {
    private PDO $conn;
    private string $table = 'gallery';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function create(array $data): array {
        $id  = $this->uuid();
        $sql = "INSERT INTO {$this->table}
                    (id, title, description, category, location, date, imageFilename, imageUrl)
                VALUES (?,?,?,?,?,?,?,?)";

        $this->conn->prepare($sql)->execute([
            $id,
            $data['title'],
            $data['description']   ?? null,
            $data['category'],
            $data['location']      ?? null,
            $data['date']          ?? null,
            $data['imageFilename'],
            $data['imageUrl'],
        ]);

        return $this->findById($id);
    }

    public function findById(string $id): ?array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) $row['reactions'] = $this->getReactions($id);
        return $row ?: null;
    }

    public function getAll(int $limit = 20, int $offset = 0, array $filters = []): array {
        $where  = ['1=1'];
        $params = [];

        if (!empty($filters['category'])) {
            $where[] = 'category = ?';
            $params[] = $filters['category'];
        }
        if (!empty($filters['search'])) {
            $where[] = '(title LIKE ? OR description LIKE ?)';
            $s = '%' . $filters['search'] . '%';
            array_push($params, $s, $s);
        }

        $sql = "SELECT * FROM {$this->table} WHERE " . implode(' AND ', $where)
             . " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$row) {
            $row['reactions'] = $this->getReactions($row['id']);
        }
        return $rows;
    }

    public function countAll(array $filters = []): int {
        $where  = ['1=1'];
        $params = [];
        if (!empty($filters['category'])) { $where[] = 'category = ?'; $params[] = $filters['category']; }

        $stmt = $this->conn->prepare(
            "SELECT COUNT(*) FROM {$this->table} WHERE " . implode(' AND ', $where)
        );
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    public function update(string $id, array $data): ?array {
        $allowed = ['title','description','category','location','date'];
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

    // ── Reactions (aggregated from gallery_reactions) ─────────
    private function getReactions(string $galleryId): array {
        $stmt = $this->conn->prepare(
            "SELECT reaction, COUNT(*) as count
             FROM gallery_reactions WHERE galleryId = ? GROUP BY reaction"
        );
        $stmt->execute([$galleryId]);
        $result = [];
        foreach ($stmt->fetchAll() as $row) {
            $result[$row['reaction']] = (int) $row['count'];
        }
        return $result;
    }

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
