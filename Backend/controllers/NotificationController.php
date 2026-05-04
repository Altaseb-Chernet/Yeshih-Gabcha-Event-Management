<?php
// controllers/NotificationController.php

require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class NotificationController {

    // GET /notifications/admin
    public static function adminList(): void {
        global $conn;
        authorizeAdmin();
        $model   = new Notification($conn);
        $limit   = (int)($_GET['limit']  ?? 20);
        $offset  = (int)($_GET['offset'] ?? 0);
        $filters = [];
        if (isset($_GET['isRead'])) $filters['isRead'] = $_GET['isRead'];

        $notifications = $model->getAdminNotifications($limit, $offset, $filters);
        $total         = $model->countAll($filters);

        sendResponse(200, true, 'Notifications retrieved', [
            'notifications' => $notifications,
            'total'         => $total,
        ]);
    }

    // GET /notifications/admin/unread-count
    public static function adminUnreadCount(): void {
        global $conn;
        authorizeAdmin();
        $model = new Notification($conn);
        sendResponse(200, true, 'Unread count', ['count' => $model->countAdminUnread()]);
    }

    // PATCH /notifications/admin/{id}/read
    public static function markRead(string $id): void {
        global $conn;
        authorizeAdmin();
        $model = new Notification($conn);
        if (!$model->findById($id)) sendResponse(404, false, 'Notification not found');
        $model->markAsRead($id);
        sendResponse(200, true, 'Notification marked as read');
    }

    // PATCH /notifications/admin/read-all
    public static function markAllRead(): void {
        global $conn;
        authorizeAdmin();
        $model = new Notification($conn);
        $model->markAllAsRead();
        sendResponse(200, true, 'All notifications marked as read');
    }
}
