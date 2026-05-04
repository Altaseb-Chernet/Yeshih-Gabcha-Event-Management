<?php
// utils/Upload.php — File upload helper

class Upload {

    public static function save(string $fileKey, string $folder): string {
        global $config;

        if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("No file uploaded or upload error for field: $fileKey");
        }

        $file     = $_FILES[$fileKey];
        $allowed  = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize  = $config['upload']['maxFileSize'] ?? 10485760; // 10 MB

        if (!in_array($file['type'], $allowed)) {
            throw new Exception('Invalid file type. Only JPEG, PNG, GIF, WEBP allowed.');
        }

        if ($file['size'] > $maxSize) {
            throw new Exception('File too large. Maximum size is ' . ($maxSize / 1048576) . 'MB.');
        }

        $uploadDir = __DIR__ . '/../uploads/' . $folder . '/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('', true) . '.' . strtolower($ext);
        $dest     = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new Exception('Failed to save uploaded file.');
        }

        return '/uploads/' . $folder . '/' . $filename;
    }

    public static function delete(string $path): void {
        $full = __DIR__ . '/..' . $path;
        if (file_exists($full)) {
            unlink($full);
        }
    }
}
