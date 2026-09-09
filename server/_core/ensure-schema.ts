/**
 * Ensures database schema is initialized on startup
 * Creates tables IF NOT EXISTS - safe for production use
 */

import mysql from "mysql2/promise";

export async function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    console.warn("[Schema] DATABASE_URL not set, skipping schema check");
    return;
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log("[Schema] Checking database schema...");

    // Check which tables exist
    const [rows] = await connection.execute<any[]>(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()`
    );
    const existingTables = new Set(rows.map((r) => r.TABLE_NAME));
    console.log(`[Schema] Found ${existingTables.size} existing table(s)`);

    // Create Dropbox tables if missing (safe: IF NOT EXISTS)
    const dropboxTables = [
      {
        name: "dropbox_integrations",
        sql: `CREATE TABLE IF NOT EXISTS dropbox_integrations (
          organization_id INT NOT NULL PRIMARY KEY,
          connected_by_user_id INT NOT NULL,
          refresh_token_encrypted TEXT NOT NULL,
          account_name VARCHAR(255),
          account_email VARCHAR(320),
          source_folder VARCHAR(1024) DEFAULT '/',
          source_shared_link TEXT,
          sync_cursor TEXT,
          last_sync_at TIMESTAMP NULL,
          last_sync_status VARCHAR(32),
          last_sync_message LONGTEXT,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
      },
      {
        name: "dropbox_media_sync",
        sql: `CREATE TABLE IF NOT EXISTS dropbox_media_sync (
          source_file_id VARCHAR(255) NOT NULL PRIMARY KEY,
          source_rev VARCHAR(255) NULL,
          source_path TEXT NOT NULL,
          media_kind VARCHAR(20) NOT NULL,
          storage_key TEXT NULL,
          sha256 VARCHAR(64) NULL,
          photo_id INT NULL,
          media_id INT NULL,
          candidate_id INT NULL,
          metadata_json LONGTEXT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'pending',
          error_message TEXT NULL,
          processed_at TIMESTAMP NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_candidate (candidate_id),
          INDEX idx_status (status),
          INDEX idx_created (created_at)
        )`,
      },
    ];

    for (const table of dropboxTables) {
      if (!existingTables.has(table.name)) {
        try {
          await connection.execute(table.sql);
          console.log(`[Schema] ✓ Created table: ${table.name}`);
        } catch (error: any) {
          if (!error.message.includes("already exists")) {
            console.error(`[Schema] ✗ Failed to create ${table.name}:`, error.message);
          }
        }
      } else {
        console.log(`[Schema] ✓ Table exists: ${table.name}`);
      }
    }

    // Verify critical tables exist
    const criticalTables = ["users", "candidates", "photos", "media"];
    const missing = criticalTables.filter((t) => !existingTables.has(t));

    if (missing.length > 0) {
      console.warn(
        `[Schema] Missing Drizzle tables: ${missing.join(", ")}\n` +
        `         These should be created by your ORM migrations. ` +
        `Check that DATABASE_URL points to the correct database.`
      );
    } else {
      console.log(
        `[Schema] All critical tables verified: ${criticalTables.join(", ")}`
      );
    }

    console.log("[Schema] Schema initialization complete");
  } catch (error) {
    console.error("[Schema] Error during schema check:", error);
    throw error;
  } finally {
    await connection.end();
  }
}
