-- Non-destructive Dropbox schema initialization
-- Safe to run multiple times (IF NOT EXISTS)
-- Created: 2026-09-03
-- Purpose: Ensure Dropbox integration tables exist before sync starts

CREATE TABLE IF NOT EXISTS `dropbox_integrations` (
  `organization_id` INT NOT NULL PRIMARY KEY COMMENT 'Organization ID (currently always 1)',
  `connected_by_user_id` INT NOT NULL COMMENT 'User ID who connected the account',
  `refresh_token_encrypted` TEXT NOT NULL COMMENT 'Encrypted Dropbox refresh token (AES-256-GCM)',
  `account_name` VARCHAR(255) COMMENT 'Dropbox account display name',
  `account_email` VARCHAR(320) COMMENT 'Dropbox account email',
  `source_folder` VARCHAR(1024) DEFAULT '/' COMMENT 'Root folder path in shared link',
  `source_shared_link` TEXT COMMENT 'Dropbox shared link URL (folder)',
  `sync_cursor` TEXT COMMENT 'Dropbox sync cursor for incremental listings',
  `last_sync_at` TIMESTAMP NULL COMMENT 'Last successful sync timestamp',
  `last_sync_status` VARCHAR(32) COMMENT 'last sync status: success, partial, failed, running, never',
  `last_sync_message` LONGTEXT COMMENT 'Last sync result message (error or summary)',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dropbox account configuration per organization';

CREATE TABLE IF NOT EXISTS `dropbox_media_sync` (
  `source_file_id` VARCHAR(255) NOT NULL PRIMARY KEY COMMENT 'Dropbox file ID',
  `source_rev` VARCHAR(255) NULL COMMENT 'Dropbox file revision',
  `source_path` TEXT NOT NULL COMMENT 'Dropbox file path',
  `media_kind` VARCHAR(20) NOT NULL COMMENT 'media type: photo, video, unknown',
  `storage_key` TEXT NULL COMMENT 'S3 storage key where file was uploaded',
  `sha256` VARCHAR(64) NULL COMMENT 'SHA256 hash of original file',
  `photo_id` INT NULL COMMENT 'FK to photos table if imported as photo',
  `media_id` INT NULL COMMENT 'FK to media table if imported as video',
  `candidate_id` INT NULL COMMENT 'FK to candidates table if matched',
  `metadata_json` LONGTEXT NULL COMMENT 'Import metadata JSON (person, candidate match, brand, etc)',
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'pending, imported, inaccessible, failed',
  `error_message` TEXT NULL COMMENT 'Error message if status=failed',
  `processed_at` TIMESTAMP NULL COMMENT 'When file was last processed',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_candidate` (`candidate_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracking table for Dropbox → R2 sync progress';

