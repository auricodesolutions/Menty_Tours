<?php
// Copy to config.local.php on the server. Never put this file in the web root.
return [
    'dsn' => getenv('DB_DSN') ?: 'mysql:host=127.0.0.1;port=3306;dbname=menty_tours;charset=utf8mb4',
    'db_user' => getenv('DB_USER') ?: 'menty_app',
    'db_password' => getenv('DB_PASSWORD') ?: '',
    'allowed_origin' => getenv('APP_ORIGIN') ?: 'http://localhost:3000',
    'public_url' => rtrim(getenv('API_PUBLIC_URL') ?: 'http://localhost:4000', '/'),
    'upload_dir' => __DIR__ . '/storage/uploads',
];
