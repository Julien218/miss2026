import mysql from "mysql2/promise";
if (process.env.DROPBOX_ARCHIVE_ENABLED === "true") {
  const connection = await mysql.createConnection(process.env.DATABASE_URL || process.env.MYSQL_URL);
  try {
    await connection.query(`CREATE TABLE IF NOT EXISTS candidateDropboxArchiveJobs (
      applicationId int PRIMARY KEY,
      state varchar(20) NOT NULL DEFAULT 'pending',
      attempts int NOT NULL DEFAULT 0,
      nextAttemptAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      leaseToken varchar(64) NULL,
      leaseUntil timestamp NULL,
      folder text NULL,
      receipt json NULL,
      sourceUpdatedAt timestamp NULL,
      errorCode varchar(64) NULL,
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX archive_queue (state, nextAttemptAt)
    )`);
    console.log("[Dropbox archive] Durable queue ready; source registrations unchanged.");
  } finally { await connection.end(); }
}
