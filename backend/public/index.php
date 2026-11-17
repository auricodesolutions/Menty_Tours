<?php
declare(strict_types=1);
require __DIR__ . '/../src/bootstrap.php';

header('X-Content-Type-Options: nosniff');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && $origin !== config('allowed_origin')) fail('This origin is not allowed.', 403);
if ($origin) { header('Access-Control-Allow-Origin: ' . $origin); header('Vary: Origin'); }
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

try {
    $path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
    $method = $_SERVER['REQUEST_METHOD'];
    if (preg_match('#^/(?:api/)?uploads/([^/]+)$#', $path, $m) && in_array($method, ['GET', 'HEAD'], true)) serve_upload($m[1]);
    if ($path === '/api/health' && $method === 'GET') { query('SELECT 1'); respond(['ok' => true, 'database' => 'connected']); }
    if ($path === '/api/admin/login' && $method === 'POST') {
        $data = body(); $email = strtolower(text($data['email'] ?? '', 190));
        rate_limit('login', $email);
        $row = query('SELECT * FROM cms_admins WHERE email=?', [$email])->fetch();
        // Always perform password verification, including unknown email addresses.
        $hash = $row['password_hash'] ?? '$2y$10$6m7jJx28x0loD8gwBcdujO.mjqJYqTl1dy7bV0GLhZjZwm3TqI5iq';
        if (!password_verify((string)($data['password'] ?? ''), $hash) || !$row) fail('The email or password is incorrect.', 401);
        $token = bin2hex(random_bytes(32));
        query('DELETE FROM cms_sessions WHERE expires_at<UTC_TIMESTAMP()');
        query('INSERT INTO cms_sessions (token_hash,admin_id,expires_at) VALUES (?,?,UTC_TIMESTAMP()+INTERVAL 8 HOUR)', [hash('sha256', $token), $row['id']]);
        respond(['ok' => true, 'token' => $token, 'user' => ['name' => $row['name'], 'email' => $row['email']]]);
    }
    if ($path === '/api/admin/me' && $method === 'GET') respond(['ok' => true, 'user' => admin()]);
    if ($path === '/api/admin/logout' && $method === 'POST') {
        admin(); $token = substr($_SERVER['HTTP_AUTHORIZATION'] ?? '', 7);
        query('DELETE FROM cms_sessions WHERE token_hash=?', [hash('sha256', $token)]);
        respond(['ok' => true]);
    }
    if ($path === '/api/content' && $method === 'GET') {
        $collections = []; $settings = []; $versions = [];
        foreach (query('SELECT content_key,payload,version FROM cms_content')->fetchAll() as $row) {
            $key = $row['content_key']; $value = json_decode($row['payload'], true, 64, JSON_THROW_ON_ERROR); $versions[$key] = (int)$row['version'];
            if (str_starts_with($key, 'media.')) $settings[substr($key, 6)] = $value;
            elseif (in_array($key, ['destinations','stories','tours'], true)) $collections[$key] = $value;
        }
        respond(['ok' => true, 'data' => ['collections' => (object)$collections, 'settings' => (object)$settings, 'versions' => (object)$versions]]);
    }
    if (preg_match('#^/api/admin/collections/(destinations|stories|tours)$#', $path, $m) && $method === 'PUT') {
        admin(); $data = body();
        if (!isset($data['version']) || !is_int($data['version']) || $data['version'] < 0) fail('A valid content version is required.');
        $items = validate_collection($m[1], $data['items'] ?? null);
        $saved = publish($m[1], $items, $data['version']);
        respond(['ok' => true, 'data' => $saved]);
    }
    if (preg_match('#^/api/admin/media/([A-Za-z]+)$#', $path, $m) && $method === 'PUT') {
        admin(); $data = body(); $slot = $m[1];
        if (!in_array($slot, ['heroVideo','heroPoster','reviewsBackground','footerBackground','aboutMain','aboutSecondary','contactHero'], true)) fail('Unknown media location.');
        if (!isset($data['version']) || !is_int($data['version']) || $data['version'] < 0) fail('A valid content version is required.');
        $value = $data['value'] ?? null;
        if ($value !== null) {
            if (!is_array($value) || empty($value['url'])) fail('Choose media before publishing.');
            $url = media_url($value['url']);
            $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));
            if ($slot === 'heroVideo' && !in_array($extension, ['mp4','webm'], true)) fail('The hero video must be MP4 or WebM.');
            if ($slot !== 'heroVideo' && in_array($extension, ['mp4','webm'], true)) fail('This location requires an image.');
            $value = ['url' => $url, 'alt' => text($value['alt'] ?? '', 300)];
        }
        respond(['ok' => true, 'data' => publish('media.' . $slot, $value, $data['version'])]);
    }
    if ($path === '/api/upload' && $method === 'POST') { admin(); respond(['ok' => true] + upload(), 201); }
    if ($path === '/api/admin/uploads' && $method === 'GET') {
        admin(); $files = query('SELECT * FROM cms_uploads ORDER BY created_at DESC')->fetchAll();
        $content = array_merge(query('SELECT payload FROM cms_content')->fetchAll(PDO::FETCH_COLUMN), query('SELECT payload FROM cms_reviews')->fetchAll(PDO::FETCH_COLUMN));
        foreach ($files as &$file) { $file['url'] = upload_url($file['filename']); $file['inUse'] = false; foreach ($content as $payload) if (str_contains($payload, $file['filename'])) $file['inUse'] = true; }
        respond(['ok' => true, 'data' => $files]);
    }
    if (preg_match('#^/api/admin/uploads/([a-f0-9]{32})$#', $path, $m) && $method === 'DELETE') {
        admin(); db()->beginTransaction(); $file = query('SELECT * FROM cms_uploads WHERE id=? FOR UPDATE', [$m[1]])->fetch();
        if (!$file) fail('File not found.', 404);
        foreach (query('SELECT payload FROM cms_content FOR UPDATE')->fetchAll(PDO::FETCH_COLUMN) as $payload) if (str_contains($payload, $file['filename'])) { db()->rollBack(); fail('This file is used on the website. Remove or replace it in the content editor first.', 409); }
        foreach (query('SELECT payload FROM cms_reviews')->fetchAll(PDO::FETCH_COLUMN) as $payload) if (str_contains($payload, $file['filename'])) { db()->rollBack(); fail('This image is used by a review.', 409); }
        $fullPath = config('upload_dir') . '/' . $file['filename'];
        if (is_file($fullPath) && !unlink($fullPath)) { db()->rollBack(); throw new RuntimeException('Could not remove file.'); }
        query('DELETE FROM cms_uploads WHERE id=?', [$m[1]]); db()->commit(); respond(['ok' => true]);
    }
    // Existing public package pages use these endpoints. A null list means the bundled collection is still the default.
    if ($path === '/api/tours' && $method === 'GET') { $doc = document('tours'); respond(['ok' => true, 'data' => $doc['value']]); }
    if (preg_match('#^/api/tours/([^/]+)$#', $path, $m) && $method === 'GET') {
        foreach (document('tours')['value'] ?? [] as $tour) if ($tour['id'] === $m[1]) respond(['ok' => true, 'data' => $tour]);
        fail('Package not found.', 404);
    }
    if ($path === '/api/testimonials' && $method === 'GET') {
        $who = admin(false);
        $rows = query('SELECT * FROM cms_reviews' . ($who ? '' : ' WHERE approved=1') . ' ORDER BY created_at DESC LIMIT 200')->fetchAll();
        $items = array_map(fn($row) => ['id' => (int)$row['id'], 'approved' => (bool)$row['approved']] + json_decode($row['payload'], true), $rows);
        respond(['ok' => true, 'data' => $items]);
    }
    if (preg_match('#^/api/admin/reviews/(\d+)$#', $path, $m)) {
        admin();
        if ($method === 'PATCH') { $data = body(); if (!is_bool($data['approved'] ?? null)) fail('Choose whether to publish this review.'); query('UPDATE cms_reviews SET approved=? WHERE id=?', [$data['approved'] ? 1 : 0, $m[1]]); respond(['ok' => true]); }
        if ($method === 'DELETE') { query('DELETE FROM cms_reviews WHERE id=?', [$m[1]]); respond(['ok' => true]); }
    }
    if ($path === '/api/testimonials' && $method === 'POST') {
        $who = admin(false); if (!$who) rate_limit('review', '', 5);
        $data = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') ? body() : $_POST;
        $review = ['name' => text($data['name'] ?? '', 120), 'country' => text($data['country'] ?? '', 120), 'trip' => text($data['trip'] ?? '', 200), 'text' => text($data['text'] ?? '', 1000), 'rating' => (int)($data['rating'] ?? 0), 'date' => date('Y-m-d')];
        if (!$review['name'] || !$review['country'] || strlen($review['text']) < 20 || $review['rating'] < 1 || $review['rating'] > 5) fail('Complete the required fields and add a review of at least 20 characters.');
        if (!empty($_FILES['photo']['name'])) {
            if ($_FILES['photo']['error'] !== UPLOAD_ERR_OK) fail('The review photo could not be uploaded.');
            $mime = (new finfo(FILEINFO_MIME_TYPE))->file($_FILES['photo']['tmp_name']);
            if (!str_starts_with((string)$mime, 'image/') || $_FILES['photo']['size'] > 5*1024*1024) fail('Review photos must be images under 5 MB.');
            $review['photo'] = upload()['url'];
        }
        query('INSERT INTO cms_reviews (payload,approved) VALUES (?,?)', [json_encode($review, JSON_THROW_ON_ERROR), $who ? 1 : 0]);
        respond(['ok' => true, 'message' => 'Your review has been received for moderation.'], 201);
    }
    fail('Endpoint not found.', 404);
} catch (Throwable $error) {
    if (isset($config) && isset($error)) error_log('Menty API: ' . $error->getMessage());
    if (isset($config)) { try { if (db()->inTransaction()) db()->rollBack(); } catch (Throwable $ignored) {} }
    fail('The server could not complete this request. Check the database and server configuration.', 500);
}
