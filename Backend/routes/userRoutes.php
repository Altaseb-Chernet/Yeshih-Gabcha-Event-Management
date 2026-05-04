<?php
// routes/userRoutes.php
// /users/me
// /users/me/profile-image-upload
// /users/profile
// /users/change-password
// /users/deactivate
// /users/admin/users
// /users/admin/users/{id}

require_once __DIR__ . '/../controllers/UserController.php';

$method = $_SERVER['REQUEST_METHOD'];
$seg1   = $segments[1] ?? '';   // me | profile | change-password | deactivate | admin
$seg2   = $segments[2] ?? '';   // profile-image-upload | users
$seg3   = $segments[3] ?? '';   // {id}

switch (true) {

    // GET /users/me  or  GET /users/profile
    case $method === 'GET' && ($seg1 === 'me' || $seg1 === 'profile'):
        UserController::getMe();
        break;

    // PUT /users/me  or  PUT /users/profile
    case $method === 'PUT' && ($seg1 === 'me' || $seg1 === 'profile') && $seg2 === '':
        UserController::updateMe();
        break;

    // PUT /users/me/profile-image-upload
    case $method === 'PUT' && $seg1 === 'me' && $seg2 === 'profile-image-upload':
        UserController::uploadProfileImage();
        break;

    // PUT /users/change-password
    case $method === 'PUT' && $seg1 === 'change-password':
        UserController::changePassword();
        break;

    // PUT /users/deactivate
    case $method === 'PUT' && $seg1 === 'deactivate':
        UserController::deactivate();
        break;

    // GET /users/admin/users
    case $method === 'GET' && $seg1 === 'admin' && $seg2 === 'users' && $seg3 === '':
        UserController::adminList();
        break;

    // PUT /users/admin/users/{id}
    case $method === 'PUT' && $seg1 === 'admin' && $seg2 === 'users' && $seg3 !== '':
        UserController::adminUpdate($seg3);
        break;

    default:
        sendResponse(404, false, 'User endpoint not found');
}
