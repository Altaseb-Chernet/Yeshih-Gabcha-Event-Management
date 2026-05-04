<?php
// routes/serviceRoutes.php
// GET    /services
// GET    /services/{id}
// POST   /services
// PUT    /services/{id}
// DELETE /services/{id}
// DELETE /services/{id}/images/{index}

require_once __DIR__ . '/../controllers/ServiceController.php';

$method = $_SERVER['REQUEST_METHOD'];
$seg1   = $segments[1] ?? '';   // {id}
$seg2   = $segments[2] ?? '';   // images
$seg3   = $segments[3] ?? '';   // {index}

switch (true) {

    // DELETE /services/{id}/images/{index}
    case $method === 'DELETE' && $seg1 !== '' && $seg2 === 'images' && $seg3 !== '':
        ServiceController::deleteImage($seg1, (int)$seg3);
        break;

    // GET /services/{id}
    case $method === 'GET' && $seg1 !== '':
        ServiceController::getById($seg1);
        break;

    // GET /services
    case $method === 'GET':
        ServiceController::getAll();
        break;

    // POST /services
    case $method === 'POST' && $seg1 === '':
        ServiceController::create();
        break;

    // PUT /services/{id}
    case $method === 'PUT' && $seg1 !== '':
        ServiceController::update($seg1);
        break;

    // DELETE /services/{id}
    case $method === 'DELETE' && $seg1 !== '':
        ServiceController::delete($seg1);
        break;

    default:
        sendResponse(404, false, 'Service endpoint not found');
}
