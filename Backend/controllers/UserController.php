<?php
// controllers/UserController.php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Upload.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class UserController {

    // GET /users/me  or  GET /users/profile
    public static function getMe(): void {
        global $conn;
        $auth  = authenticate();
        $model = new User($conn);
        $user  = $model->findById($auth['id']);
        if (!$user) sendResponse(404, false, 'User not found');
        sendResponse(200, true, 'Profile retrieved', User::safe($user));
    }

    // PUT /users/me  or  PUT /users/profile
    public static function updateMe(): void {
        global $conn;
        $auth  = authenticate();
        $d     = self::json();
        $model = new User($conn);

        $allowed = ['firstName','lastName','phone'];
        $data    = array_intersect_key($d, array_flip($allowed));

        $user = $model->update($auth['id'], $data);
        sendResponse(200, true, 'Profile updated', User::safe($user));
    }

    // PUT /users/me/profile-image-upload
    public static function uploadProfileImage(): void {
        global $conn;
        $auth  = authenticate();
        $model = new User($conn);

        try {
            $url = Upload::save('profileImage', 'profiles');
        } catch (Exception $e) {
            sendResponse(400, false, $e->getMessage());
        }

        $user = $model->update($auth['id'], ['profileImage' => $url]);
        sendResponse(200, true, 'Profile image updated', ['profileImage' => $url]);
    }

    // PUT /users/change-password
    public static function changePassword(): void {
        global $conn;
        $auth  = authenticate();
        $d     = self::json();
        $model = new User($conn);

        if (empty($d['currentPassword']) || empty($d['newPassword'])) {
            sendResponse(400, false, 'currentPassword and newPassword are required');
        }

        $user = $model->findById($auth['id']);
        if (!password_verify($d['currentPassword'], $user['passwordHash'])) {
            sendResponse(401, false, 'Current password is incorrect');
        }

        $model->updatePassword($auth['id'], $d['newPassword']);
        sendResponse(200, true, 'Password changed successfully');
    }

    // PUT /users/deactivate
    public static function deactivate(): void {
        global $conn;
        $auth  = authenticate();
        $model = new User($conn);
        $model->update($auth['id'], ['status' => 'inactive']);
        sendResponse(200, true, 'Account deactivated');
    }

    // GET /users/admin/users  (admin)
    public static function adminList(): void {
        global $conn;
        authorizeAdmin();
        $model   = new User($conn);
        $limit   = (int)($_GET['limit']  ?? 50);
        $offset  = (int)($_GET['offset'] ?? 0);
        $filters = array_filter([
            'role'   => $_GET['role']   ?? '',
            'status' => $_GET['status'] ?? '',
            'search' => $_GET['search'] ?? '',
        ]);

        $users = $model->getAll($limit, $offset, $filters);
        $total = $model->countAll($filters);

        sendResponse(200, true, 'Users retrieved', [
            'users' => array_map([User::class, 'safe'], $users),
            'total' => $total,
        ]);
    }

    // PUT /users/admin/users/{id}  (admin)
    public static function adminUpdate(string $id): void {
        global $conn;
        authorizeAdmin();
        $d     = self::json();
        $model = new User($conn);

        if (!$model->findById($id)) sendResponse(404, false, 'User not found');

        $allowed = ['status','role'];
        $data    = array_intersect_key($d, array_flip($allowed));

        $user = $model->update($id, $data);
        sendResponse(200, true, 'User updated', User::safe($user));
    }

    private static function json(): array {
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }
}
