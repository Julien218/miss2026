import mysql from "mysql2/promise";

const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
if (!connectionUrl) {
  console.warn("[DB] DATABASE_URL/MYSQL_URL absent; schéma candidat non vérifié.");
  process.exit(0);
}

const columns = [
  ["street", "`street` varchar(255)"], ["houseNumber", "`houseNumber` varchar(20)"],
  ["postalCode", "`postalCode` varchar(10)"], ["height", "`height` int"], ["weight", "`weight` int"],
  ["acceptedEligibility", "`acceptedEligibility` int NOT NULL DEFAULT 0"],
  ["acceptedCGU", "`acceptedCGU` int NOT NULL DEFAULT 0"],
  ["consentVersion", "`consentVersion` varchar(40) NOT NULL DEFAULT 'v1.0'"],
  ["consentedAt", "`consentedAt` timestamp NULL"], ["candidateSignatureName", "`candidateSignatureName` varchar(200)"],
  ["candidateSignedAt", "`candidateSignedAt` timestamp NULL"], ["guardianFullName", "`guardianFullName` varchar(200)"],
  ["guardianEmail", "`guardianEmail` varchar(320)"], ["guardianPhone", "`guardianPhone` varchar(50)"],
  ["guardianSignatureName", "`guardianSignatureName` varchar(200)"], ["guardianSignedAt", "`guardianSignedAt` timestamp NULL"],
  ["contractVersion", "`contractVersion` varchar(40)"],
  ["contractStatus", "`contractStatus` enum('not_started','candidate_signed','guardian_signed','completed','generation_failed') NOT NULL DEFAULT 'not_started'"],
  ["contractPdfKey", "`contractPdfKey` text"], ["contractPdfSha256", "`contractPdfSha256` varchar(64)"],
  ["organizationSignatureName", "`organizationSignatureName` varchar(200)"], ["organizationSignedAt", "`organizationSignedAt` timestamp NULL"],
];

let connection;
try {
  connection = await mysql.createConnection(connectionUrl);
  const [rows] = await connection.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'candidateApplications'");
  const present = new Set(rows.map((row) => row.COLUMN_NAME));
  const missing = columns.filter(([name]) => !present.has(name));
  if (missing.length) {
    await connection.query(`ALTER TABLE \`candidateApplications\` ${missing.map(([, sql]) => `ADD ${sql}`).join(", ")}`);
    console.log(`[DB] ${missing.length} colonnes candidat ajoutées.`);
  } else {
    console.log("[DB] Schéma candidat déjà à jour.");
  }
} catch (error) {
  console.error("[DB] Vérification du schéma candidat échouée:", error?.message || error);
  process.exit(1);
} finally {
  await connection?.end();
}
