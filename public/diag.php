<?php
/**
 * HexaCore Classes - Deployment Diagnostics
 * 
 * Visit this script at: hexacoreclasses.in/api/diag.php
 */
header("Content-Type: text/plain");
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== HexaCore Classes Diagnostic Tool ===\n\n";

// 1. PHP Environment
echo "[1] PHP Version: " . PHP_VERSION . "\n";
echo "[2] Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "[3] Current Directory: " . __DIR__ . "\n";

// 2. Check essential extensions
$extensions = ['pdo_mysql', 'openssl', 'mbstring', 'curl'];
foreach ($extensions as $ext) {
    echo "[4] Extension $ext: " . (extension_loaded($ext) ? "LOADED" : "MISSING") . "\n";
}

// 3. Database Configuration Check
require_once __DIR__ . '/config/config.env.php';

echo "\n--- Database Configuration (from config.env.php) ---\n";
echo "DB_HOST: " . DB_HOST . "\n";
echo "DB_NAME: " . DB_NAME . "\n";
echo "DB_USER: " . DB_USER . "\n";
echo "DB_PASS: " . (empty(DB_PASS) ? "(EMPTY)" : "(SET)") . "\n";

if (DB_USER === 'root' && empty(DB_PASS)) {
    echo "WARNING: You are still using local XAMPP credentials!\n";
    echo "ACTION: Update config/config.env.php with your InfinityFree MySQL details.\n";
}

// 4. Test Database Connection
echo "\n--- Testing Connection ---\n";
try {
    require_once __DIR__ . '/config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "SUCCESS: Connected to Database successfully!\n";
        
        // 5. Check Tables
        $tables = ['users', 'doubts', 'articles', 'playlists'];
        echo "\n--- Verifying Tables ---\n";
        foreach ($tables as $table) {
            try {
                $stmt = $db->query("SELECT 1 FROM $table LIMIT 1");
                echo "Table [$table]: EXISTS\n";
            } catch (Exception $e) {
                echo "Table [$table]: MISSING or Access Denied (" . $e->getMessage() . ")\n";
            }
        }
    } else {
        echo "FAILED: Connection returned null. Check credentials.\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

// 5. PHPMailer Check
echo "\n--- PHPMailer Check ---\n";
$libsPath = __DIR__ . '/libs/PHPMailer/src/';
$requiredFiles = ['Exception.php', 'PHPMailer.php', 'SMTP.php'];
foreach ($requiredFiles as $file) {
    echo "File [$file]: " . (file_exists($libsPath . $file) ? "FOUND" : "MISSING at $libsPath") . "\n";
}

echo "\n=== Diagnostic Complete ===\n";
?>
