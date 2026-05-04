<?php
// controllers/ReportController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ReportController {

    // GET /reports/admin/dashboard/metrics
    public static function dashboardMetrics(): void {
        global $conn;
        authorizeAdmin();

        $users           = (int) $conn->query("SELECT COUNT(*) FROM users WHERE role='user'")->fetchColumn();
        $activeUsers     = (int) $conn->query("SELECT COUNT(*) FROM users WHERE role='user' AND status='active'")->fetchColumn();
        $bookings        = (int) $conn->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
        $pendingBookings = (int) $conn->query("SELECT COUNT(*) FROM bookings WHERE status='pending'")->fetchColumn();
        $gallery         = (int) $conn->query("SELECT COUNT(*) FROM gallery")->fetchColumn();

        $revenueRow = $conn->query(
            "SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='completed'"
        )->fetch();
        $revenue = (float) $revenueRow['total'];

        // Recent activity (last 10 bookings + payments)
        $activity = $conn->query(
            "SELECT 'booking' as type, CONCAT('New booking from ', customerName) as message, createdAt
             FROM bookings ORDER BY createdAt DESC LIMIT 5"
        )->fetchAll();

        $payActivity = $conn->query(
            "SELECT 'payment' as type, CONCAT('Payment of ', amount, ' ETB via ', paymentMethod) as message, createdAt
             FROM payments ORDER BY createdAt DESC LIMIT 5"
        )->fetchAll();

        $recentActivity = array_slice(
            array_merge($activity, $payActivity),
            0, 10
        );

        sendResponse(200, true, 'Dashboard metrics', [
            'totals' => [
                'users'           => $users,
                'activeUsers'     => $activeUsers,
                'bookings'        => $bookings,
                'pendingBookings' => $pendingBookings,
                'revenue'         => $revenue,
                'gallery'         => $gallery,
            ],
            'recentActivity' => $recentActivity,
        ]);
    }

    // GET /reports/admin/reports/bookings-over-time
    public static function bookingsOverTime(): void {
        global $conn;
        authorizeAdmin();
        $groupBy = self::groupByFormat();

        $stmt = $conn->prepare(
            "SELECT DATE_FORMAT(createdAt, ?) as period, COUNT(*) as count
             FROM bookings GROUP BY period ORDER BY period ASC"
        );
        $stmt->execute([$groupBy]);
        sendResponse(200, true, 'Bookings over time', $stmt->fetchAll());
    }

    // GET /reports/admin/reports/revenue-over-time
    public static function revenueOverTime(): void {
        global $conn;
        authorizeAdmin();
        $groupBy = self::groupByFormat();

        $stmt = $conn->prepare(
            "SELECT DATE_FORMAT(createdAt, ?) as period,
                    COALESCE(SUM(amount),0) as revenue,
                    COUNT(*) as transactions
             FROM payments WHERE status='completed'
             GROUP BY period ORDER BY period ASC"
        );
        $stmt->execute([$groupBy]);
        sendResponse(200, true, 'Revenue over time', $stmt->fetchAll());
    }

    // GET /reports/admin/reports/service-distribution
    public static function serviceDistribution(): void {
        global $conn;
        authorizeAdmin();

        $rows = $conn->query(
            "SELECT eventType, COUNT(*) as bookings FROM bookings GROUP BY eventType ORDER BY bookings DESC"
        )->fetchAll();

        sendResponse(200, true, 'Service distribution', $rows);
    }

    // GET /reports/admin/reports/user-growth
    public static function userGrowth(): void {
        global $conn;
        authorizeAdmin();
        $groupBy = self::groupByFormat();

        $stmt = $conn->prepare(
            "SELECT DATE_FORMAT(createdAt, ?) as period, COUNT(*) as count
             FROM users WHERE role='user' GROUP BY period ORDER BY period ASC"
        );
        $stmt->execute([$groupBy]);
        sendResponse(200, true, 'User growth', $stmt->fetchAll());
    }

    // GET /reports/admin/reports/traffic-source
    public static function trafficSource(): void {
        global $conn;
        authorizeAdmin();

        // Placeholder — real traffic tracking needs analytics integration
        sendResponse(200, true, 'Traffic source', [
            ['source' => 'direct',   'count' => 0, 'percentage' => 0],
            ['source' => 'referral', 'count' => 0, 'percentage' => 0],
        ]);
    }

    // GET /reports/admin/reports/event-stats
    public static function eventStats(): void {
        global $conn;
        authorizeAdmin();

        $rows = $conn->query(
            "SELECT e.id as eventId, e.title, e.totalTickets, e.soldTickets,
                    COALESCE(SUM(p.amount),0) as revenue
             FROM events e
             LEFT JOIN payments p ON p.eventId = e.id AND p.status = 'completed'
             GROUP BY e.id ORDER BY e.eventDate DESC"
        )->fetchAll();

        sendResponse(200, true, 'Event stats', $rows);
    }

    // ── Helper ────────────────────────────────────────────────
    private static function groupByFormat(): string {
        $g = $_GET['groupBy'] ?? 'month';
        return match($g) {
            'day'   => '%Y-%m-%d',
            'week'  => '%Y-%u',
            default => '%Y-%m',
        };
    }
}
