<?php
// routes/reportRoutes.php
// GET /reports/admin/dashboard/metrics
// GET /reports/admin/reports/bookings-over-time
// GET /reports/admin/reports/revenue-over-time
// GET /reports/admin/reports/service-distribution
// GET /reports/admin/reports/user-growth
// GET /reports/admin/reports/traffic-source
// GET /reports/admin/reports/event-stats

require_once __DIR__ . '/../controllers/ReportController.php';

$method = $_SERVER['REQUEST_METHOD'];
// segments: reports / admin / dashboard|reports / metrics|bookings-over-time|...
$seg2   = $segments[2] ?? '';   // dashboard | reports
$seg3   = $segments[3] ?? '';   // metrics | bookings-over-time | ...

if ($method !== 'GET') {
    sendResponse(405, false, 'Method not allowed');
}

switch (true) {

    case $seg2 === 'dashboard' && $seg3 === 'metrics':
        ReportController::dashboardMetrics();
        break;

    case $seg2 === 'reports' && $seg3 === 'bookings-over-time':
        ReportController::bookingsOverTime();
        break;

    case $seg2 === 'reports' && $seg3 === 'revenue-over-time':
        ReportController::revenueOverTime();
        break;

    case $seg2 === 'reports' && $seg3 === 'service-distribution':
        ReportController::serviceDistribution();
        break;

    case $seg2 === 'reports' && $seg3 === 'user-growth':
        ReportController::userGrowth();
        break;

    case $seg2 === 'reports' && $seg3 === 'traffic-source':
        ReportController::trafficSource();
        break;

    case $seg2 === 'reports' && $seg3 === 'event-stats':
        ReportController::eventStats();
        break;

    default:
        sendResponse(404, false, 'Report endpoint not found');
}
