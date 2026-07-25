/**
 * Script d'initialisation de l'organisation Miss & Mister Dour
 * Crée l'organisation avec le plan "founder" et les settings par défaut
 * 
 * Usage: node scripts/init-organization.mjs
 * 
 * Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables");
  process.exit(1);
}

async function initOrganization() {
  console.log("🚀 Initialisation de l'organisation Miss & Mister Dour...\n");

  // Connexion à la base de données
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: "default" });

  try {
    // 1. Vérifier si l'organisation existe déjà
    const existingOrgs = await db.select().from(schema.organizations).where(
      schema.organizations.slug.eq("miss-mister-dour")
    );

    if (existingOrgs.length > 0) {
      console.log("✅ L'organisation 'Miss & Mister Dour' existe déjà");
      console.log(`   ID: ${existingOrgs[0].id}`);
      console.log(`   Plan: ${existingOrgs[0].plan}`);
      console.log(`   Status: ${existingOrgs[0].status}\n`);
      return;
    }

    // 2. Récupérer le premier utilisateur admin comme owner
    const adminUsers = await db.select().from(schema.users).where(
      schema.users.role.eq("admin")
    ).limit(1);

    if (adminUsers.length === 0) {
      console.error("❌ Aucun utilisateur admin trouvé. Créez d'abord un utilisateur admin.");
      process.exit(1);
    }

    const ownerId = adminUsers[0].id;
    console.log(`👤 Owner: ${adminUsers[0].name || adminUsers[0].email} (ID: ${ownerId})\n`);

    // 3. Créer l'organisation
    const [orgResult] = await db.insert(schema.organizations).values({
      name: "Miss & Mister Dour",
      slug: "miss-mister-dour",
      ownerUserId: ownerId,
      plan: "founder",
      status: "active",
      maxEvents: 999, // Unlimited pour founder
      maxCandidates: 9999,
      maxVotes: 999999,
    });

    const organizationId = orgResult.insertId;
    console.log(`✅ Organisation créée avec succès (ID: ${organizationId})`);

    // 4. Créer les settings par défaut
    await db.insert(schema.organizationSettings).values({
      organizationId: organizationId,
      primaryColor: "#D4AF37", // Or élégant
      secondaryColor: "#B8941E", // Or foncé
      logoUrl: "https://d3hk78fplavsbl.cloudfront.net/2tvrCaJBV8I6gabDLa4YCL-Captured'écran2026-01-29023306.png",
      certificateStyle: "gold",
      verifyPageStyle: "premium",
      blockchainEnabled: 1, // Activé pour founder
      socialScoringEnabled: 1,
      voteAntifraudEnabled: 1,
      auditLogsEnabled: 1,
    });

    console.log(`✅ Settings créés avec succès\n`);

    // 5. Afficher le résumé
    console.log("📊 RÉSUMÉ DE L'ORGANISATION");
    console.log("═══════════════════════════");
    console.log(`Nom: Miss & Mister Dour`);
    console.log(`Slug: miss-mister-dour`);
    console.log(`Plan: founder (Unlimited)`);
    console.log(`Blockchain: Activé ✅`);
    console.log(`Social Scoring: Activé ✅`);
    console.log(`Vote Anti-Fraude: Activé ✅`);
    console.log(`Audit Logs: Activé ✅`);
    console.log(`\n🎉 Initialisation terminée avec succès !`);

  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initOrganization();
