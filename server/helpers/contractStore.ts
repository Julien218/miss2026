import { sql } from "drizzle-orm";
import { getDb } from "../db";
import type { ContractTemplate } from "../../shared/candidate-contract";
import { verifyTemplate } from "./candidateContractTemplate";

export async function getPublishedContract(): Promise<ContractTemplate | null> {
  const database = await getDb();
  if (!database) throw new Error("Base de données indisponible");
  const [rows] = await database.execute(
    sql`SELECT template FROM candidateContractTemplates WHERE organizationId = 1`
  );
  const row = (rows as unknown as { template: string }[])[0];
  if (!row) return null;
  const template = JSON.parse(row.template) as ContractTemplate;
  if (!verifyTemplate(template))
    throw new Error("L’intégrité du modèle contractuel doit être vérifiée.");
  return template;
}

export async function savePublishedContract(template: ContractTemplate) {
  const database = await getDb();
  if (!database) throw new Error("Base de données indisponible");
  const json = JSON.stringify(template);
  await database.execute(
    sql`INSERT INTO candidateContractTemplates (organizationId, template) VALUES (1, ${json}) ON DUPLICATE KEY UPDATE template = ${json}`
  );
}
