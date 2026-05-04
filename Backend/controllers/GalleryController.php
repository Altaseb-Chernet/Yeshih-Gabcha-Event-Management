<?php
// controllers/GalleryController.php

require_once __DIR__ . '/../models/Gallery.php';
require_once __DIR__ . '/../models/GalleryReaction.php';
require_once __DIR__ . '/../utils/Upload.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class GalleryController {

    // GET /gallery
    public static function getAll(): void {
        global $conn;
        $model   = new Gallery($conn);
        $limit   = (int)($_GET['limit']  ?? 20);
        $offset  = (int)($_GET['offset'] ?? 0);
        $filters = array_filter([
            'category' => $_GET['category'] ?? '',
            'search'   => $_GET['search']   ?? '',
        ]);

        $items = $model->getAll($limit, $offset, $filters);
        $total = $model->countAll($filters);

        sendResponse(200, true, 'Gallery retrieved', [
            'gallery' => $items,
            'total'   => $total,
        ]);
    }

    // GET /gallery/{id}
    public static function getById(string $id): void {
        global $conn;
        $model = new Gallery($conn);
        $item  = $model->findById($id);
        if (!$item) sendResponse(404, false, 'Gallery item not found');
        sendResponse(200, true, 'Gallery item retrieved', $item);
    }

    // POST /gallery  (admin)
    public static function create(): void {
        global $conn;
        authorizeAdmin();

        $d        = $_POST;
        $required = ['title','category'];
        foreach ($required as $f) {
            if (empty($d[$f])) sendResponse(400, false, "Field '$f' is required");
        }

        if (empty($_FILES['image'])) sendResponse(400, false, 'Image file is required');

        try {
            $imageUrl = Upload::save('image', 'gallery');
        } catch (Exception $e) {
            sendResponse(400, false, $e->getMessage());
        }

        $model = new Gallery($conn);
        $item  = $model->create([
            'title'         => $d['title'],
            'description'   => $d['description'] ?? null,
            'category'      => $d['category'],
            'location'      => $d['location']    ?? null,
            'date'          => $d['date']         ?? null,
            'imageFilename' => basename($imageUrl),
            'imageUrl'      => $imageUrl,
        ]);

        sendResponse(201, true, 'Gallery item created', $item);
    }

    // PUT /gallery/{id}  (admin)
    public static function update(string $id): void {
        global $conn;
        authorizeAdmin();
        $model = new Gallery($conn);
        if (!$model->findById($id)) sendResponse(404, false, 'Gallery item not found');

        $d    = self::json();
        $item = $model->update($id, $d);
        sendResponse(200, true, 'Gallery item updated', $item);
    }

    // DELETE /gallery/{id}  (admin)
    public static function delete(string $id): void {
        global $conn;
        authorizeAdmin();
        $model = new Gallery($conn);
        $item  = $model->findById($id);
        if (!$item) sendResponse(404, false, 'Gallery item not found');

        Upload::delete($item['imageUrl']);
        $model->delete($id);
        sendResponse(200, true, 'Gallery item deleted');
    }

    // POST /gallery/{id}/reaction
    public static function react(string $id): void {
        global $conn;
        $auth = authenticate();
        $d    = self::json();

        if (empty($d['reaction'])) sendResponse(400, false, 'reaction is required');

        $allowed = ['like','dislike'];
        if (!in_array($d['reaction'], $allowed, true)) {
            sendResponse(400, false, 'reaction must be like or dislike');
        }

        $galleryModel  = new Gallery($conn);
        if (!$galleryModel->findById($id)) sendResponse(404, false, 'Gallery item not found');

        $reactionModel = new GalleryReaction($conn);
        $reactionModel->upsert($id, $auth['id'], $d['reaction']);

        $reactions = $reactionModel->getCountsByGallery($id);
        sendResponse(200, true, 'Reaction saved', ['reactions' => $reactions]);
    }

    private static function json(): array {
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }
}
