-- ============================================================
-- Ruduino — user_locations table
-- Run this once in your InfinityFree MySQL (phpMyAdmin)
-- Database: if0_41889036_Duduino
-- ============================================================

CREATE TABLE IF NOT EXISTS user_locations (
    username   VARCHAR(60)      NOT NULL,
    x_pct      DECIMAL(7,3)     NOT NULL,
    y_pct      DECIMAL(7,3)     NOT NULL,
    floor      TINYINT UNSIGNED NOT NULL,
    updated_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (username),
    INDEX idx_updated (updated_at),
    INDEX idx_floor   (floor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: auto-delete locations older than 30 minutes
-- (requires MySQL Event Scheduler enabled on your host)
-- CREATE EVENT IF NOT EXISTS cleanup_stale_locations
--   ON SCHEDULE EVERY 5 MINUTE
--   DO DELETE FROM user_locations WHERE updated_at < NOW() - INTERVAL 30 MINUTE;
