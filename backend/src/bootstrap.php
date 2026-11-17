<?php
declare(strict_types=1);

$config = require is_file(__DIR__ . '/../config.local.php') ? __DIR__ . '/../config.local.php' : __DIR__ . '/../config.example.php';
date_default_timezone_set('UTC');

function config(string $key): mixed { global $config; return $config[$key] ?? null; }
function db(): PDO {
    static $connection;
    if (!$connection) $connection = new PDO(config('dsn'), config('db_user'), config('db_password'), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    return $connection;
}
function query(string $sql, array $args = []): PDOStatement { $statement = db()->prepare($sql); $statement->execute($args); return $statement; }
function respond(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}
function fail(string $message, int $status = 400): never { respond(['ok' => false, 'error' => $message], $status); }
function body(): array {
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 2097152) fail('Request is too large.', 413);
    try { $value = json_decode(file_get_contents('php://input'), true, 64, JSON_THROW_ON_ERROR); }
    catch (JsonException $error) { fail('Please send valid JSON.'); }
    if (!is_array($value)) fail('Expected a JSON object.');
    return $value;
}
function text(mixed $value, int $max = 3000): string {
    if (!is_scalar($value) && $value !== null) fail('Invalid text value.');
    $value = trim(strip_tags((string)$value));
    if (strlen($value) > $max) fail('A text field exceeds its maximum length.');
    return $value;
}
function media_url(mixed $value): string {
    $url = text($value, 2000);
    if ($url === '') return '';
    if (preg_match('#^/(static|assets|images|website-originals|uploads|api/uploads)/[^\s<>]*$#', $url)) return $url;
    if (filter_var($url, FILTER_VALIDATE_URL) && in_array(strtolower(parse_url($url, PHP_URL_SCHEME) ?? ''), ['http', 'https'], true)) return $url;
    fail('Media must use an uploaded file, a website asset, or an HTTP(S) URL.');
}
function admin(bool $required = true): ?array {
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer ([a-f0-9]{64})$/i', $authorization, $matches)) {
        $row = query('SELECT a.id,a.name,a.email FROM cms_sessions s JOIN cms_admins a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()', [hash('sha256', $matches[1])])->fetch();
        if ($row) return $row;
    }
    if ($required) fail('Your session has expired. Please sign in again.', 401);
    return null;
}
function rate_limit(string $purpose, string $extra = '', int $limit = 8): void {
    $bucket = hash('sha256', $purpose . '|' . ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . $extra);
    $count = query('SELECT COUNT(*) FROM cms_attempts WHERE bucket=? AND attempted_at>UTC_TIMESTAMP()-INTERVAL 15 MINUTE', [$bucket])->fetchColumn();
    if ((int)$count >= $limit) fail('Too many attempts. Please try again in 15 minutes.', 429);
    query('INSERT INTO cms_attempts (bucket) VALUES (?)', [$bucket]);
    query('DELETE FROM cms_attempts WHERE attempted_at<UTC_TIMESTAMP()-INTERVAL 1 DAY');
}
function document(string $key): array {
    $row = query('SELECT payload,version,updated_at FROM cms_content WHERE content_key=?', [$key])->fetch();
    return $row ? ['value' => json_decode($row['payload'], true, 64, JSON_THROW_ON_ERROR), 'version' => (int)$row['version'], 'updatedAt' => $row['updated_at']] : ['value' => null, 'version' => 0, 'updatedAt' => null];
}
function publish(string $key, mixed $value, int $expected): array {
    $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    $references = [];
    $inspect = function (mixed $entry) use (&$inspect, &$references): void {
        if (is_array($entry)) { foreach ($entry as $child) $inspect($child); return; }
        if (!is_string($entry)) return;
        if (str_starts_with($entry, config('public_url') . '/uploads/') || str_starts_with($entry, '/uploads/')) $references[] = basename(parse_url($entry, PHP_URL_PATH) ?? '');
    };
    $inspect($value); $references = array_unique($references); sort($references);
    db()->beginTransaction();
    foreach ($references as $filename) {
        if (!query('SELECT id FROM cms_uploads WHERE filename=? FOR UPDATE', [$filename])->fetch()) { db()->rollBack(); fail('One selected file was deleted. Choose another file before publishing.', 409); }
    }
    if ($expected === 0) {
        try { query('INSERT INTO cms_content (content_key,payload,version) VALUES (?,?,1)', [$key, $json]); }
        catch (PDOException $error) { if ($error->getCode() === '23000') { db()->rollBack(); fail('This content was changed in another session. Reload before saving.', 409); } throw $error; }
    } else {
        $saved = query('UPDATE cms_content SET payload=?,version=version+1 WHERE content_key=? AND version=?', [$json, $key, $expected]);
        if (!$saved->rowCount()) { db()->rollBack(); fail('This content was changed in another session. Reload before saving.', 409); }
    }
    db()->commit();
    return document($key);
}
function validate_collection(string $kind, mixed $items): array {
    if (!in_array($kind, ['destinations', 'stories', 'tours'], true) || !is_array($items) || !array_is_list($items) || count($items) > 200) fail('Invalid content collection.');
    $ids = [];
    $out = [];
    foreach ($items as $item) {
        if (!is_array($item)) fail('Invalid content item.');
        $id = text($item['id'] ?? '', 120);
        if (!preg_match('/^[a-zA-Z0-9_-]{1,120}$/', $id) || isset($ids[$id])) fail('Every item needs a unique ID containing letters, numbers, dashes or underscores.');
        $ids[$id] = true;
        $row = ['id' => $id];
        foreach (['title','name','region','description','category','alt','duration','person','currency','priceLabel'] as $field) {
            if (array_key_exists($field, $item)) $row[$field] = text($item[$field], $field === 'description' ? 5000 : 300);
        }
        $title = $kind === 'destinations' ? ($row['name'] ?? '') : ($row['title'] ?? '');
        if ($title === '') fail('Please add a title or destination name.');
        foreach (['image','img','hero'] as $field) if (isset($item[$field])) $row[$field] = media_url($item[$field]);
        foreach (['featured','best','local'] as $field) $row[$field] = (bool)($item[$field] ?? false);
        if ($kind === 'tours') {
            foreach (['rating','priceFrom'] as $field) {
                $v = $item[$field] ?? null;
                if ($v !== null && $v !== '' && (!is_numeric($v) || (float)$v < 0 || ($field === 'rating' && (float)$v > 5))) fail('Please enter a valid non-negative price and a rating between 0 and 5.');
                $row[$field] = $v === '' || $v === null ? null : (float)$v;
            }
            foreach (['places','tags','inclusions','exclusions'] as $field) {
                $values = $item[$field] ?? [];
                if (!is_array($values) || count($values) > 100) fail('Invalid package list.');
                $row[$field] = array_values(array_map(fn($v) => text($v, 500), $values));
            }
            $days = $item['itinerary'] ?? [];
            if (!is_array($days) || count($days) > 100) fail('Invalid itinerary.');
            $row['itinerary'] = [];
            foreach ($days as $day) {
                if (!is_array($day)) fail('Invalid itinerary day.');
                $activities = $day['activities'] ?? [];
                if (!is_array($activities) || count($activities) > 50) fail('Invalid activities.');
                $row['itinerary'][] = ['title' => text($day['title'] ?? '', 300), 'desc' => text($day['desc'] ?? '', 5000), 'img' => media_url($day['img'] ?? ''), 'place' => text($day['place'] ?? '', 300), 'activities' => array_map(fn($v) => text($v, 500), $activities)];
            }
        }
        $out[] = $row;
    }
    return $out;
}
function upload_url(string $filename): string { return config('public_url') . '/uploads/' . rawurlencode($filename); }
function upload(): array {
    $file = $_FILES['file'] ?? $_FILES['photo'] ?? null;
    if (!$file || $file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) fail('Upload failed. Check the server upload limit and try again.');
    if ((int)$file['size'] > 15 * 1024 * 1024) fail('Videos must be 15 MB or smaller. Images must be 10 MB or smaller.', 413);
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', 'image/avif' => 'avif', 'video/mp4' => 'mp4', 'video/webm' => 'webm'];
    if (!isset($extensions[$mime])) fail('Choose a JPEG, PNG, WebP, GIF, AVIF, MP4 or WebM file.');
    $limit = str_starts_with($mime, 'video/') ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
    if ($file['size'] < 1 || $file['size'] > $limit) fail('Images must be 10 MB or smaller and videos 15 MB or smaller.', 413);
    if (str_starts_with($mime, 'image/') && !@getimagesize($file['tmp_name'])) fail('The file is not a valid image.');
    $id = bin2hex(random_bytes(16));
    $filename = $id . '.' . $extensions[$mime];
    $directory = config('upload_dir');
    if (!is_dir($directory) && !mkdir($directory, 0750, true)) throw new RuntimeException('Upload directory unavailable.');
    if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $filename)) throw new RuntimeException('Could not store upload.');
    try { query('INSERT INTO cms_uploads (id,filename,original_name,mime,bytes) VALUES (?,?,?,?,?)', [$id, $filename, substr(basename($file['name']), 0, 240), $mime, $file['size']]); }
    catch (Throwable $error) { @unlink($directory . '/' . $filename); throw $error; }
    return ['id' => $id, 'path' => upload_url($filename), 'url' => upload_url($filename), 'mime' => $mime, 'name' => basename($file['name']), 'bytes' => (int)$file['size']];
}
function serve_upload(string $filename): never {
    if (!preg_match('/^[a-f0-9]{32}\.(jpg|png|webp|gif|avif|mp4|webm)$/', $filename)) fail('File not found.', 404);
    $row = query('SELECT * FROM cms_uploads WHERE filename=?', [$filename])->fetch();
    $file = config('upload_dir') . '/' . $filename;
    if (!$row || !is_file($file)) fail('File not found.', 404);
    $size = filesize($file); $start = 0; $end = $size - 1;
    header('Content-Type: ' . $row['mime']); header('X-Content-Type-Options: nosniff');
    header('Cache-Control: public, max-age=31536000, immutable'); header('Accept-Ranges: bytes');
    if (isset($_SERVER['HTTP_RANGE'])) {
        if (!preg_match('/^bytes=(\d*)-(\d*)$/', $_SERVER['HTTP_RANGE'], $m) || ($m[1] === '' && $m[2] === '')) { header("Content-Range: bytes */$size"); http_response_code(416); exit; }
        if ($m[1] === '') { $start = max(0, $size - (int)$m[2]); } else { $start = (int)$m[1]; if ($m[2] !== '') $end = min($end, (int)$m[2]); }
        if ($start > $end || $start >= $size) { header("Content-Range: bytes */$size"); http_response_code(416); exit; }
        http_response_code(206); header("Content-Range: bytes $start-$end/$size");
    }
    header('Content-Length: ' . ($end - $start + 1));
    if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') {
        $stream = fopen($file, 'rb'); fseek($stream, $start); $remaining = $end - $start + 1;
        while ($remaining > 0 && !feof($stream) && !connection_aborted()) { $chunk = fread($stream, min(65536, $remaining)); if ($chunk === false || $chunk === '') break; echo $chunk; $remaining -= strlen($chunk); }
        fclose($stream);
    }
    exit;
}
