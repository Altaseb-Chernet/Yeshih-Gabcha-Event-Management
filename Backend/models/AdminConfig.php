<?php
// backend-php/models/AdminConfig.php

class AdminConfig {
    private $conn;
    private $table = 'admin_config';

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function set($key, $value) {
        $existing = $this->get($key);
        if ($existing) {
            $sql = "UPDATE {$this->table} SET configValue = ?, updatedAt = NOW() WHERE configKey = ?";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$value, $key]);
        }

        $sql = "INSERT INTO {$this->table} (id, configKey, configValue) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([uniqid('cfg_', true), $key, $value]);
    }

    public function get($key) {
        $sql = "SELECT * FROM {$this->table} WHERE configKey = ? LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$key]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAll() {
        $sql = "SELECT * FROM {$this->table} ORDER BY updatedAt DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
