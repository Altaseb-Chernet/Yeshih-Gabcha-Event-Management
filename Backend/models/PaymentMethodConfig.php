<?php
// models/PaymentMethodConfig.php — matches payment_method_configs table

class PaymentMethodConfig {
    private PDO $conn;
    private string $table = 'payment_method_configs';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function getAll(): array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} ORDER BY method");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function findByMethod(string $method): ?array {
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table} WHERE method = ? LIMIT 1"
        );
        $stmt->execute([$method]);
        return $stmt->fetch() ?: null;
    }

    // Upsert by method name
    public function upsert(string $method, array $data): array {
        $existing = $this->findByMethod($method);

        if ($existing) {
            $stmt = $this->conn->prepare(
                "UPDATE {$this->table}
                 SET receiverName = ?, receiverPhone = ?, receiverAccountNumber = ?,
                     note = ?, active = ?
                 WHERE method = ?"
            );
            $stmt->execute([
                $data['receiverName']          ?? null,
                $data['receiverPhone']         ?? null,
                $data['receiverAccountNumber'] ?? null,
                $data['note']                  ?? null,
                isset($data['active']) ? (int)(bool)$data['active'] : 1,
                $method,
            ]);
        } else {
            $stmt = $this->conn->prepare(
                "INSERT INTO {$this->table}
                     (id, method, receiverName, receiverPhone, receiverAccountNumber, note, active)
                 VALUES (?,?,?,?,?,?,?)"
            );
            $stmt->execute([
                $this->uuid(),
                $method,
                $data['receiverName']          ?? null,
                $data['receiverPhone']         ?? null,
                $data['receiverAccountNumber'] ?? null,
                $data['note']                  ?? null,
                isset($data['active']) ? (int)(bool)$data['active'] : 1,
            ]);
        }

        return $this->findByMethod($method);
    }

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
