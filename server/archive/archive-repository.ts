import { sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb } from "../db";
import { ArchiveError } from "./dropbox-client";

async function database() { const db = await getDb(); if (!db) throw new ArchiveError("database_unavailable"); return db; }
export const archiveRepository = {
  async reconcile() {
    const db = await database();
    // The source rows themselves are the durable outbox: a process crash between
    // saving a form and enqueueing it cannot lose its archive job.
    await db.execute(sql`INSERT IGNORE INTO candidateDropboxArchiveJobs (applicationId)
      SELECT a.id FROM candidateApplications a JOIN contests c ON c.id=a.contestId
      WHERE c.year=2027 AND a.organizationId=1 AND a.createdAt <= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 SECOND)`);
    await db.execute(sql`UPDATE candidateDropboxArchiveJobs j JOIN candidateApplications a ON a.id=j.applicationId
      SET j.state='pending', j.nextAttemptAt=UTC_TIMESTAMP(), j.errorCode=NULL
      WHERE j.state='complete' AND a.updatedAt > j.sourceUpdatedAt`);
  },
  async claim() {
    const db = await database(); const lease = randomUUID();
    await db.execute(sql`UPDATE candidateDropboxArchiveJobs SET state='processing', leaseToken=${lease},
      leaseUntil=DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE), attempts=attempts+1
      WHERE (state='pending' AND nextAttemptAt<=UTC_TIMESTAMP()) OR (state='processing' AND leaseUntil<UTC_TIMESTAMP())
      ORDER BY applicationId LIMIT 1`);
    const [rows]: any = await db.execute(sql`SELECT * FROM candidateDropboxArchiveJobs WHERE leaseToken=${lease}`);
    return rows[0] || null;
  },
  async application(id: number) {
    const [rows]: any = await (await database()).execute(sql`SELECT a.*, c.year AS editionYear FROM candidateApplications a JOIN contests c ON c.id=a.contestId WHERE a.id=${id} AND c.year=2027 AND a.organizationId=1`);
    if (!rows[0]) throw new ArchiveError("application_missing");
    return rows[0];
  },
  async saveFolder(job: any, folder: string) {
    await (await database()).execute(sql`UPDATE candidateDropboxArchiveJobs SET folder=${folder} WHERE applicationId=${job.applicationId} AND leaseToken=${job.leaseToken}`);
  },
  async hasHomonym(application: any) {
    const [rows]: any = await (await database()).execute(sql`SELECT id FROM candidateApplications WHERE contestId=${application.contestId} AND organizationId=1 AND id<>${application.id} AND LOWER(TRIM(firstName))=LOWER(TRIM(${application.firstName})) AND LOWER(TRIM(lastName))=LOWER(TRIM(${application.lastName})) LIMIT 1`);
    return rows.length > 0;
  },
  async complete(job: any, receipt: unknown, sourceUpdatedAt: Date) {
    await (await database()).execute(sql`UPDATE candidateDropboxArchiveJobs SET state='complete', receipt=${JSON.stringify(receipt)},
      sourceUpdatedAt=${sourceUpdatedAt}, errorCode=NULL, leaseToken=NULL, leaseUntil=NULL
      WHERE applicationId=${job.applicationId} AND leaseToken=${job.leaseToken}`);
  },
  async fail(job: any, code: string) {
    const seconds = Math.min(3600, 30 * 2 ** Math.min(job.attempts, 7));
    await (await database()).execute(sql`UPDATE candidateDropboxArchiveJobs SET state='pending', errorCode=${code},
      nextAttemptAt=DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${seconds} SECOND), leaseToken=NULL, leaseUntil=NULL
      WHERE applicationId=${job.applicationId} AND leaseToken=${job.leaseToken}`);
  },
  async retry() {
    await (await database()).execute(sql`UPDATE candidateDropboxArchiveJobs SET nextAttemptAt=UTC_TIMESTAMP(), errorCode=NULL WHERE state='pending'`);
  },
  async stats() {
    const [rows]: any = await (await database()).execute(sql`SELECT state,COUNT(*) AS count FROM candidateDropboxArchiveJobs GROUP BY state`);
    const [errors]: any = await (await database()).execute(sql`SELECT applicationId,errorCode FROM candidateDropboxArchiveJobs WHERE errorCode IS NOT NULL ORDER BY updatedAt DESC LIMIT 10`);
    return { complete: Number(rows.find((r: any) => r.state === "complete")?.count || 0), pending: rows.filter((r: any) => r.state !== "complete").reduce((n: number, r: any) => n + Number(r.count), 0), errors };
  },
};
