<?php
// routes/galleryRoutes.php
// GET    /gallery
// GET    /gallery/{id}
// POST   /gallery
// PUT    /gallery/{id}
// DELETE /gallery/{id}
// POST   /gallery/{id}/reaction

require_once __DIR__ . '/../controllers/GalleryController.php';

$method = $_SERVER['REQUEST_METHOD'];
$seg1   = $segments[1] ?? '';   // {id}
$seg2   = $segments[2] ?? '';   // reaction

switch (true) {

    // POST /gallery/{id}/reaction
    case $method === 'POST' && $seg1 !== '' && $seg2 === 'reaction':
        GalleryController::react($seg1);
        break;

    // GET /gallery/{id}
    case $method === 'GET' && $seg1 !== '':
        GalleryController::getById($seg1);
        break;

    // GET /gallery
    case $method === 'GET':
        GalleryController::getAll();
        break;

    // POST /gallery
    case $method === 'POST' && $seg1 === '':
        GalleryController::create();
        break;

    // PUT /gallery/{id}
    case $method === 'PUT' && $seg1 !== '':
        GalleryController::update($seg1);
        break;

    // DELETE /gallery/{id}
    case $method === 'DELETE' && $seg1 !== '':
        GalleryController::delete($seg1);
        break;

    default:
        sendResponse(404, false, 'Gallery endpoint not found');
}
