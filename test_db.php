<?php
require_once __DIR__ . '/backend/config/database.php';
try {
    $db = Database::getInstance();
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "SUCCESS: Connected to unigrade_db!\n";
    echo "Found " . count($tables) . " tables:\n";
    echo implode(", ", $tables) . "\n";
    
    // Check admin user
    $admin = $db->query("SELECT id, email, role, status FROM users WHERE email='admin@unigrade.edu'")->fetch();
    if ($admin) {
        echo "ADMIN_USER_EXISTS: " . json_encode($admin) . "\n";
    } else {
        echo "WARNING: Admin user not found in users table!\n";
    }
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

