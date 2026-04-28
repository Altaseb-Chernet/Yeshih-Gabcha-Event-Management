<?php
// backend-php/models/Report.php

class Report {
    private $conn;
    private $table = 'reports';

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function create($data) {
        $sql = "INSERT INTO {$this->table} (id, type, title, generatedBy, payload) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            uniqid('report_', true),
            $data['type'] ?? 'custom',
            $data['title'] ?? 'Generated Report',
            $data['generatedBy'] ?? null,
            json_encode($data['payload'] ?? [])
        ]);
    }

    public function getAll($limit = 50, $offset = 0) {
        $sql = "SELECT * FROM {$this->table} ORDER BY createdAt DESC LIMIT ? OFFSET ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
