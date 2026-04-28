<?php
// backend-php/controllers/AuthController.php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../config/database.php';

class AuthController {
    
    // POST /auth/register
    public static function register() {
        global $conn;
        
        $user = new User($conn);
        
        // Get raw posted data
        // Explicitly reading both 'php://input' and checking $_POST for cases where content-type varies
        $input = file_get_contents("php://input");
        $data = json_decode($input);
        
        $name = !empty($data->name) ? $data->name : (isset($_POST['name']) ? $_POST['name'] : (isset($_POST['firstName'], $_POST['lastName']) ? $_POST['firstName'] . ' ' . $_POST['lastName'] : null));
        $email = !empty($data->email) ? $data->email : (isset($_POST['email']) ? $_POST['email'] : null);
        $password = !empty($data->password) ? $data->password : (isset($_POST['password']) ? $_POST['password'] : null);
        
        if ($name && $email && $password) {
            $user->name = $name;
            $user->email = $email;
            $user->password = $password;
            $user->role = 'user'; // Provide a default role
            
            if ($user->emailExists()) {
                sendResponse(400, false, "Email already exists.");
            }
            
            if ($user->create()) {
                sendResponse(201, true, "User was created.");
            } else {
                sendResponse(503, false, "Unable to create user.");
            }
        } else {
            sendResponse(400, false, "Unable to create user. Data is incomplete.");
        }
    }
    
    // POST /auth/login
    public static function login() {
        global $conn;
        
        $user = new User($conn);
        $input = file_get_contents("php://input");
        $data = json_decode($input);
        
        $email = !empty($data->email) ? $data->email : (isset($_POST['email']) ? $_POST['email'] : null);
        $password = !empty($data->password) ? $data->password : (isset($_POST['password']) ? $_POST['password'] : null);
        
        if ($email && $password) {
            $user->email = $email;
            $email_exists = $user->emailExists();
            
            if ($email_exists && password_verify($password, $user->password)) {
                
                require_once __DIR__ . '/../utils/JwtUtils.php';
                
                $token_payload = [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "role" => $user->role,
                    "exp" => time() + (60 * 60 * 24) // valid for 1 day
                ];
                
                $jwt = JwtUtils::generateToken($token_payload);
                
                sendResponse(200, true, "Successful login.", [
                    'token' => $jwt,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role
                    ]
                ]);
            } else {
                sendResponse(401, false, "Login failed. Incorrect credentials.");
            }
        } else {
            sendResponse(400, false, "Login failed. Incomplete data.");
        }
    }
}
?>