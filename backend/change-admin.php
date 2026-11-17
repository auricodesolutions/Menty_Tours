<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/src/bootstrap.php';
$email = strtolower(trim(getenv('ADMIN_EMAIL') ?: ''));
$previous = strtolower(trim(getenv('ADMIN_CURRENT_EMAIL') ?: $email));
$password = getenv('ADMIN_PASSWORD') ?: '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
    fwrite(STDERR, "Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters). Set ADMIN_CURRENT_EMAIL when changing the email.\n"); exit(1);
}
try {
    db()->beginTransaction();
    $account = query('SELECT id FROM cms_admins WHERE email=? FOR UPDATE', [$previous])->fetch();
    if (!$account) throw new RuntimeException('Account not found. Run setup.php to create a new account.');
    query('UPDATE cms_admins SET email=?,password_hash=? WHERE id=?', [$email, password_hash($password, PASSWORD_DEFAULT), $account['id']]);
    query('DELETE FROM cms_sessions WHERE admin_id=?', [$account['id']]);
    db()->commit();
    echo "Admin updated. Previous sessions revoked. Sign in with the new credentials.\n";
} catch (Throwable $error) {
    if (db()->inTransaction()) db()->rollBack();
    fwrite(STDERR, "Update failed. Check the current email, database configuration, and whether the new email is already used.\n"); exit(1);
}