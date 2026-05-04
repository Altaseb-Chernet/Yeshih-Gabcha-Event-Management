<?php
// models/User.php — matches users table (CHAR(36) UUID, passwordHash, role, status, etc.)

class User {
    private PDO $conn;
    private string $table = 'users';

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    // ── Create ────────────────────────────────────────────────
    public function create(array $data): array {
        $id   = $this->uuid();
        $hash = password_hash($data['password'], PASSWORD_BCRYPT);

        $sql = "INSERT INTO {$this->table}
                    (id, firstName, lastName, email, phone, passwordHash, role, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            $id,
            $data['firstName'],
            $data['lastName'],
            $data['email'],
            $data['phone'],
            $hash,
            $data['role']   ?? 'user',
            $data['status'] ?? 'active',
        ]);

        return $this->findById($id);
    }

    // ── Find by ID ────────────────────────────────────────────
    public function findById(string $id): ?array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    // ── Find by email ─────────────────────────────────────────
    public function findByEmail(string $email): ?array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    // ── Find by phone ─────────────────────────────────────────
    public function findByPhone(string $phone): ?array {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE phone = ? LIMIT 1");
        $stmt->execute([$phone]);
        return $stmt->fetch() ?: null;
    }

    // ── Find by email OR phone (for login identifier) ─────────
    public function findByIdentifier(string $identifier): ?array {
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table} WHERE email = ? OR phone = ? LIMIT 1"
        );
        $stmt->execute([$identifier, $identifier]);
        return $stmt->fetch() ?: null;
    }

    // ── Update ────────────────────────────────────────────────
    public function update(string $id, array $data): ?array {
        $allowed = ['firstName','lastName','phone','profileImage','status','role',
                    'emailVerified','emailVerifyToken','twoFactorEnabled',
                    'twoFactorSecret','twoFactorTempToken',
                    'passwordResetOtp','passwordResetOtpExpiry'];

        $fields = [];
        $values = [];
        foreach ($data as $k => $v) {
            if (in_array($k, $allowed, true)) {
                $fields[] = "$k = ?";
                $values[] = $v;
            }
        }
        if (empty($fields)) return $this->findById($id);

        $values[] = $id;
        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $this->conn->prepare($sql)->execute($values);
        return $this->findById($id);
    }

    // ── Update password ───────────────────────────────────────
    public function updatePassword(string $id, string $newPassword): bool {
        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET passwordHash = ? WHERE id = ?"
        );
        return $stmt->execute([$hash, $id]);
    }

    // ── List all (admin) ──────────────────────────────────────
    public function getAll(int $limit = 50, int $offset = 0, array $filters = []): array {
        $where  = ['1=1'];
        $params = [];

        if (!empty($filters['role'])) {
            $where[] = 'role = ?';
            $params[] = $filters['role'];
        }
        if (!empty($filters['status'])) {
            $where[] = 'status = ?';
            $params[] = $filters['status'];
        }
        if (!empty($filters['search'])) {
            $where[] = '(firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phone LIKE ?)';
            $s = '%' . $filters['search'] . '%';
            array_push($params, $s, $s, $s, $s);
        }

        $sql = "SELECT * FROM {$this->table} WHERE " . implode(' AND ', $where)
             . " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function countAll(array $filters = []): int {
        $where  = ['1=1'];
        $params = [];
        if (!empty($filters['role']))   { $where[] = 'role = ?';   $params[] = $filters['role']; }
        if (!empty($filters['status'])) { $where[] = 'status = ?'; $params[] = $filters['status']; }

        $stmt = $this->conn->prepare(
            "SELECT COUNT(*) FROM {$this->table} WHERE " . implode(' AND ', $where)
        );
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    // ── Safe public fields (strip passwordHash) ───────────────
    public static function safe(array $user): array {
        unset($user['passwordHash'], $user['emailVerifyToken'],
              $user['twoFactorSecret'], $user['twoFactorTempToken'],
              $user['passwordResetOtp'], $user['passwordResetOtpExpiry']);
        return $user;
    }

    private function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
            mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
            mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff));
    }
}
