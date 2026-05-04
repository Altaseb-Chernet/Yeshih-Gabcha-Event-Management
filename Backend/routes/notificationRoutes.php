<?php
// routes/notificationRoutes.php
// GET    /notifications/admin
// GET    /notifications/admin/unread-count
// PATCH  /notifications/admin/{id}/read
// PATCH  /notifications/admin/read-all

require_once __DIR__ . '/../controllers/NotificationController.php';

$method = $_SERVER['REQUEST_METHOD'];
$seg1   = $segments[1] ?? '';   // admin
$seg2   = $segments[2] ?? '';   // unread-count | read-all | {id}
$seg3   = $segments[3] ?? '';   // read

switch (true) {

    // GET /notifications/admin/unread-count
    case $method === 'GET' && $seg1 === 'admin' && $seg2 === 'unread-count':
        NotificationController::adminUnreadCount();
        break;

    // PATCH /notifications/admin/read-all
    case $method === 'PATCH' && $seg1 === 'admin' && $seg2 === 'read-all':
        NotificationController::markAllRead();
        break;

    // PATCH /notifications/admin/{id}/read
    case $method === 'PATCH' && $seg1 === 'admin' && $seg2 !== '' && $seg3 === 'read':
        NotificationController::markRead($seg2);
        break;

    // GET /notifications/admin
    case $method === 'GET' && $seg1 === 'admin':
        NotificationController::adminList();
        break;

    default:
        sendResponse(404, false, 'Notification endpoint not found');
}
