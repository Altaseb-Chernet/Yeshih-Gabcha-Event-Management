<?php
<<<<<<< HEAD
// backend-php/utils/Response.php
=======
>>>>>>> 4421e0bae9061f07a2d9418e22845f10346fabd0

if (!function_exists('sendResponse')) {
    function sendResponse($statusCode, $success, $message, $data = null) {
        http_response_code($statusCode);
        header("Content-Type: application/json; charset=UTF-8");
        $response = [
            "success" => $success,
            "message" => $message
        ];

        if ($data !== null) {
            $response["data"] = $data;
        }

        echo json_encode($response);
        exit;
    }
}
?>