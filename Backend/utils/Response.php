<?php
// utils/Response.php — Standard JSON response helper

if (!function_exists('sendResponse')) {
    function sendResponse($statusCode, $success, $message, $data = null) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');
        $body = ['success' => $success, 'message' => $message];
        if ($data !== null) $body['data'] = $data;
        echo json_encode($body, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
