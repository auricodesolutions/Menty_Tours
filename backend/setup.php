<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/src/bootstrap.php';
try {
    db()->exec(file_get_contents(__DIR__ . '/schema.sql'));
    $email = strtolower(trim(getenv('mentytours.sl@gmail.com') ?: ''));
    $password = getenv('MentyTours@admin') ?: '';
    $name = getenv('ADMIN_NAME') ?: 'Menty Tours';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
        fwrite(STDERR, "Schema installed. Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters), then run setup.php again to create an admin.\n"); exit(1);
    }
    if (query('SELECT id FROM cms_admins WHERE email=?', [$email])->fetch()) {
        fwrite(STDERR, "Admin already exists. No password was changed.\n"); exit(1);
    }
    query('INSERT INTO cms_admins (name,email,password_hash) VALUES (?,?,?)', [$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
    echo "Schema installed and admin created. Sign in at /admin/login.\n";
} catch (Throwable $error) { fwrite(STDERR, "Setup failed. Check config.local.php and ensure the MySQL database exists.\n"); exit(1); }
