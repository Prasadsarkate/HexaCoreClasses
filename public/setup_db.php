<?php
/**
 * HexaCore Classes - One-Click Database Setup
 * 
 * This script initializes all database tables and schema modifications.
 * It is idempotent (can be run multiple times safely).
 */
header("Content-Type: text/html; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/config.env.php';
require_once __DIR__ . '/config/database.php';

echo "<html><head><title>DB Setup | HexaCore</title><style>
    body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; line-height: 1.6; }
    h1 { color: #38bdf8; }
    .success { color: #4ade80; font-weight: bold; }
    .error { color: #f87171; font-weight: bold; }
    .info { color: #94a3b8; }
    hr { border: 0; border-top: 1px solid #334155; margin: 20px 0; }
    pre { background: #1e293b; padding: 10px; border-radius: 4px; overflow: auto; }
</style></head><body>";

echo "<h1>HexaCore Classes - Database Initializer</h1>";

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo "<p class='error'>FATAL ERROR: Could not connect to the database. Please check your credentials in config/config.env.php</p>";
    exit();
}

echo "<p class='success'>SUCCESS: Connected to database '" . DB_NAME . "' at '" . DB_HOST . "'.</p><hr>";

/**
 * Helper to execute SQL and show status
 */
function runQuery($db, $title, $sql) {
    try {
        $db->exec($sql);
        echo "<div class='info'><strong>[PROGRESS] $title:</strong> <span class='success'>SUCCESS</span></div>";
    } catch (PDOException $e) {
        echo "<div class='info'><strong>[PROGRESS] $title:</strong> <span class='error'>FAILED</span></div>";
        echo "<pre>" . $e->getMessage() . "</pre>";
    }
}

// --- 1. CORE TABLES ---

runQuery($db, "Table: users", "CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    avatar_url TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    bio TEXT,
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    instagram_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(10) DEFAULT NULL,
    otp_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: subjects", "CREATE TABLE IF NOT EXISTS subjects (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(50) DEFAULT '#1a2332',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: playlists", "CREATE TABLE IF NOT EXISTS playlists (
    id CHAR(36) PRIMARY KEY,
    subject_id CHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_count INT DEFAULT 0,
    total_duration INT DEFAULT 0,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: videos", "CREATE TABLE IF NOT EXISTS videos (
    id CHAR(36) PRIMARY KEY,
    playlist_id CHAR(36),
    subject_id CHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    duration INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE SET NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: pdfs", "CREATE TABLE IF NOT EXISTS pdfs (
    id CHAR(36) PRIMARY KEY,
    playlist_id CHAR(36),
    subject_id CHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    pdf_url TEXT NOT NULL,
    download_url TEXT NOT NULL,
    page_count INT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE SET NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: doubts", "CREATE TABLE IF NOT EXISTS doubts (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    question TEXT NOT NULL,
    image_url TEXT,
    channel VARCHAR(50) DEFAULT 'general',
    upvotes_count INT DEFAULT 0,
    type ENUM('post', 'poll', 'code') DEFAULT 'post',
    code_snippet TEXT,
    status ENUM('pending', 'answered') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: answers", "CREATE TABLE IF NOT EXISTS answers (
    id CHAR(36) PRIMARY KEY,
    doubt_id CHAR(36) NOT NULL,
    admin_id CHAR(36),
    expert_name VARCHAR(255) NOT NULL,
    answer_text TEXT NOT NULL,
    is_expert BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doubt_id) REFERENCES doubts(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: user_progress", "CREATE TABLE IF NOT EXISTS user_progress (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) UNIQUE NOT NULL,
    completed_videos INT DEFAULT 0,
    total_watch_time INT DEFAULT 0,
    progress_percentage INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: video_progress", "CREATE TABLE IF NOT EXISTS video_progress (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    video_id CHAR(36) NOT NULL,
    playlist_id CHAR(36),
    completed BOOLEAN DEFAULT FALSE,
    watch_time INT DEFAULT 0,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_video (user_id, video_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: bookmarks", "CREATE TABLE IF NOT EXISTS bookmarks (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    video_id CHAR(36),
    pdf_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (pdf_id) REFERENCES pdfs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: downloads", "CREATE TABLE IF NOT EXISTS downloads (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    pdf_id CHAR(36) NOT NULL,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pdf_id) REFERENCES pdfs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// --- 2. EXTENDED FEATURES ---

runQuery($db, "Table: articles", "CREATE TABLE IF NOT EXISTS articles (
    id CHAR(36) PRIMARY KEY,
    author_id CHAR(36),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    read_time VARCHAR(50) DEFAULT '5 min read',
    thumbnail_url TEXT DEFAULT NULL,
    content LONGTEXT DEFAULT NULL,
    status ENUM('draft', 'published') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: doubt_upvotes", "CREATE TABLE IF NOT EXISTS doubt_upvotes (
    id CHAR(36) PRIMARY KEY,
    doubt_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_doubt (user_id, doubt_id),
    FOREIGN KEY (doubt_id) REFERENCES doubts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: poll_options", "CREATE TABLE IF NOT EXISTS poll_options (
    id CHAR(36) PRIMARY KEY,
    doubt_id CHAR(36) NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    votes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doubt_id) REFERENCES doubts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

runQuery($db, "Table: poll_votes", "CREATE TABLE IF NOT EXISTS poll_votes (
    id CHAR(36) PRIMARY KEY,
    option_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    doubt_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_poll (user_id, doubt_id),
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doubt_id) REFERENCES doubts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// --- 3. COLUMN FIXES (INCREMENTAL) ---

echo "<h3>Incremental Column Check:</h3>";

// Add otp_expiry to users if not exists
try { $db->exec("ALTER TABLE users ADD COLUMN otp_expiry DATETIME DEFAULT NULL AFTER otp_code"); echo "<div class='info'>Column 'otp_expiry' added to 'users'.</div>"; } catch (PDOException $e) {}

// Add author_id to articles if not exists
try { $db->exec("ALTER TABLE articles ADD COLUMN author_id CHAR(36) AFTER id, ADD FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL"); echo "<div class='info'>Column 'author_id' added to 'articles'.</div>"; } catch (PDOException $e) {}

// Add community columns to doubts if not exists
try { $db->exec("ALTER TABLE doubts ADD COLUMN channel VARCHAR(50) DEFAULT 'general', ADD COLUMN upvotes_count INT DEFAULT 0, ADD COLUMN type ENUM('post', 'poll', 'code') DEFAULT 'post', ADD COLUMN code_snippet TEXT"); echo "<div class='info'>Community columns added to 'doubts'.</div>"; } catch (PDOException $e) {}

echo "<hr><h2>All tasks completed!</h2>";
echo "<p>Please <strong>DELETE</strong> this script (setup_db.php) from your server for security.</p>";
echo "</body></html>";
?>
