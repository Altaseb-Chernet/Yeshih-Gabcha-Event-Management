<?php
// models/PricingRule.php — matches pricing_rules table

class PricingRule {
    private PDO $conn;
    private string $table = 'pricing_rules';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function getAll(): array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} ORDER BY eventType");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function findByEventType(string $eventType): ?array {
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table} WHERE eventType = ? LIMIT 1"
        );
        $stmt->execute([$eventType]);
        return $stmt->fetch() ?: null;
    }

    // Upsert: insert or update by eventType
    public function upsert(string $eventType, array $data): array {
        $existing = $this->findByEventType($eventType);

        if ($existing) {
            $stmt = $this->conn->prepare(
                "UPDATE {$this->table}
                 SET basePrice = ?, perGuest = ?, perHour = ?, defaultHours = ?
                 WHERE eventType = ?"
            );
            $stmt->execute([
                $data['basePrice'],
                $data['perGuest'],
                $data['perHour'],
                $data['defaultHours'] ?? 5,
                $eventType,
            ]);
        } else {
            $stmt = $this->conn->prepare(
                "INSERT INTO {$this->table} (id, eventType, basePrice, perGuest, perHour, defaultHours)
                 VALUES (?,?,?,?,?,?)"
            );
            $stmt->execute([
                $this->uuid(),
                $eventType,
                $data['basePrice'],
                $data['perGuest'],
                $data['perHour'],
                $data['defaultHours'] ?? 5,
            ]);
        }

        return $this->findByEventType($eventType);
    }

    // Calculate total price for a booking
    public function calcPrice(string $eventType, int $guestCount, int $durationHours): array {
        $rule = $this->findByEventType($eventType);

        if (!$rule) {
            // fallback defaults
            $rule = ['basePrice' => 0, 'perGuest' => 0, 'perHour' => 0, 'defaultHours' => 5];
        }

        $base       = (int) $rule['basePrice'];
        $perGuest   = (int) $rule['perGuest'];
        $perHour    = (int) $rule['perHour'];
        $total      = $base + ($perGuest * $guestCount) + ($perHour * $durationHours);

        return [
            'totalPrice'   => $total,
            'basePrice'    => $base,
            'perGuest'     => $perGuest,
            'perHour'      => $perHour,
            'durationHours'=> $durationHours,
        ];
    }

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
