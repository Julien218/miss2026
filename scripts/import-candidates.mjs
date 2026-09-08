/**
 * import-candidates.mjs
 * Script d'import des 19 candidats Miss & Mister Dour 2026
 * depuis le fichier Excel vers la base de données MySQL
 * 
 * Usage: node scripts/import-candidates.mjs
 */

import mysql from "mysql2/promise";
import crypto from "crypto";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

// ─── Données des candidats extraites du fichier Excel ────────────────────────
const CANDIDATES_DATA = [
  // MISS
  { category: "miss", badgeNum: "01", lastName: "Morelle",    firstName: "Loriana",   height: 160, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "02", lastName: "Geronnez",   firstName: "Julie",     height: 163, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "03", lastName: "Geronnez",   firstName: "Anaïs",     height: 164, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "04", lastName: "Rulkin",     firstName: "Lindsay",   height: 163, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "05", lastName: "Zinszner",   firstName: "Noëlline",  height: 164, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "06", lastName: "Vaillant",   firstName: "Manon",     height: 163, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "07", lastName: "Ammour",     firstName: "Aliya",     height: 166, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "08", lastName: "Descamps",   firstName: "Nell",      height: 166, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "09", lastName: "Verminnen",  firstName: "Esmeralda", height: 167, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "10", lastName: "Jouffin",    firstName: "Alessia",   height: 170, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "11", lastName: "Leonetti",   firstName: "Giulia",    height: 170, hashtag: "#MissDour2026" },
  { category: "miss", badgeNum: "12", lastName: "Delmotte",   firstName: "Melina",    height: 173, hashtag: "#MissDour2026" },
  // MISTER
  { category: "mister", badgeNum: "13", lastName: "Loicq",       firstName: "Peyton",   height: 181, hashtag: "#MisterDour2026" },
  { category: "mister", badgeNum: "01", lastName: "Caudrelier",  firstName: "Noé",      height: 165, hashtag: "#MisterDour2026" },
  { category: "mister", badgeNum: "02", lastName: "Schooneyt",   firstName: "Korentin", height: 170, hashtag: "#MisterDour2026" },
  { category: "mister", badgeNum: "03", lastName: "Puma",        firstName: "Hugo",     height: 168, hashtag: "#MisterDour2026" },
  { category: "mister", badgeNum: "04", lastName: "Baton",       firstName: "Kyllian",  height: 176, hashtag: "#MisterDour2026" },
  { category: "mister", badgeNum: "05", lastName: "Ostrowski",   firstName: "Dawson",   height: 182, hashtag: "#MisterDour2026" },
  { category: "mister", badgeNum: "06", lastName: "Paternotre",  firstName: "Lylian",   height: null, hashtag: "#MisterDour2026" },
];

// ─── URL publique du site ─────────────────────────────────────────────────────
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || process.env.VITE_PUBLIC_BASE_URL || "https://missetmisterdour.be";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function main() {
  const db = await mysql.createConnection(process.env.DATABASE_URL);
  console.log("✅ Connecté à la base de données\n");

  try {
    // 1. Vérifier/créer le concours 2026
    const [contests] = await db.execute("SELECT id, title, status FROM contests WHERE year = 2026 LIMIT 1");
    let contestId;

    if (contests.length === 0) {
      console.log("📋 Création du concours Miss & Mister Dour 2026...");
      const [result] = await db.execute(
        `INSERT INTO contests (title, year, description, status, location, startDate, endDate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          "Miss & Mister Dour 2026",
          2026,
          "La soirée de prestige nationale belge qui célèbre l'élégance, le talent et le charisme.",
          "ongoing",
          "Centre Sportif d'Elouges, Rue de la Tournelle 10, 7370 Elouges",
          new Date("2026-04-19"),
          new Date("2026-04-19"),
        ]
      );
      contestId = result.insertId;
      console.log(`✅ Concours créé avec l'ID: ${contestId}\n`);
    } else {
      contestId = contests[0].id;
      console.log(`✅ Concours existant trouvé: "${contests[0].title}" (ID: ${contestId}, statut: ${contests[0].status})\n`);
    }

    // 2. Vérifier/créer un utilisateur système pour les candidats importés
    const [sysUsers] = await db.execute("SELECT id FROM users WHERE email = 'import@missetmisterdour.be' LIMIT 1");
    let systemUserId;

    if (sysUsers.length === 0) {
      const [result] = await db.execute(
        `INSERT INTO users (openId, name, email, role, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        ["system-import-2026", "Import Système 2026", "import@missetmisterdour.be", "user"]
      );
      systemUserId = result.insertId;
      console.log(`✅ Utilisateur système créé (ID: ${systemUserId})\n`);
    } else {
      systemUserId = sysUsers[0].id;
      console.log(`✅ Utilisateur système existant (ID: ${systemUserId})\n`);
    }

    // 3. Récupérer l'admin pour le createdBy des tokens
    const [admins] = await db.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const adminId = admins.length > 0 ? admins[0].id : systemUserId;

    // 4. Importer les candidats
    const results = [];
    console.log("📥 Import des candidats...\n");

    for (const c of CANDIDATES_DATA) {
      // Vérifier si le candidat existe déjà
      const [existing] = await db.execute(
        "SELECT id FROM candidates WHERE firstName = ? AND lastName = ? AND contestId = ? LIMIT 1",
        [c.firstName, c.lastName, contestId]
      );

      let candidateId;

      if (existing.length > 0) {
        candidateId = existing[0].id;
        console.log(`⏭️  Candidat existant: ${c.firstName} ${c.lastName} (ID: ${candidateId})`);
      } else {
        // Créer un userId unique par candidat (utilisateur fictif)
        const candidateEmail = `${c.firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.${c.lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@candidat.missetmisterdour.be`;
        const candidateOpenId = `candidate-${c.category}-${c.badgeNum}-2026`;

        // Créer ou récupérer l'utilisateur candidat
        const [existingUser] = await db.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [candidateEmail]);
        let userId;

        if (existingUser.length > 0) {
          userId = existingUser[0].id;
        } else {
          const [userResult] = await db.execute(
            `INSERT INTO users (openId, name, email, role, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [candidateOpenId, `${c.firstName} ${c.lastName}`, candidateEmail, "user"]
          );
          userId = userResult.insertId;
        }

        // Créer le candidat
        const heightCm = c.height ? Math.round(c.height * 100) : null; // déjà en cm dans Excel
        const [candidateResult] = await db.execute(
          `INSERT INTO candidates (userId, contestId, category, firstName, lastName, height, status, registrationDate, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
          [userId, contestId, c.category, c.firstName, c.lastName, c.height, "approved"]
        );
        candidateId = candidateResult.insertId;
        console.log(`✅ Candidat créé: ${c.firstName} ${c.lastName} (ID: ${candidateId})`);
      }

      // Vérifier/créer le token de profil
      const [existingToken] = await db.execute(
        "SELECT id, token FROM profileEditTokens WHERE candidateId = ? AND isActive = 1 LIMIT 1",
        [candidateId]
      );

      let token;
      if (existingToken.length > 0) {
        token = existingToken[0].token;
        console.log(`   🔑 Token existant: ${token.substring(0, 16)}...`);
      } else {
        token = generateToken();
        await db.execute(
          `INSERT INTO profileEditTokens (candidateId, token, isActive, usedCount, createdBy, createdAt, updatedAt)
           VALUES (?, ?, 1, 0, ?, NOW(), NOW())`,
          [candidateId, token, adminId]
        );
        console.log(`   🔑 Token généré: ${token.substring(0, 16)}...`);
      }

      const profileLink = `${PUBLIC_BASE_URL}/profile/edit/${token}`;
      const publicLink = `${PUBLIC_BASE_URL}/candidat/${candidateId}`;

      results.push({
        badgeNum: c.badgeNum,
        category: c.category === "miss" ? "Miss" : "Mister",
        firstName: c.firstName,
        lastName: c.lastName,
        candidateId,
        token: token.substring(0, 16) + "...",
        profileLink,
        publicLink,
      });
    }

    // 5. Générer le rapport
    console.log("\n" + "=".repeat(80));
    console.log("📊 RÉCAPITULATIF DES LIENS DE PROFIL");
    console.log("=".repeat(80));

    const missResults = results.filter(r => r.category === "Miss");
    const misterResults = results.filter(r => r.category === "Mister");

    console.log("\n🌸 MISS (" + missResults.length + " candidates)");
    console.log("-".repeat(80));
    for (const r of missResults) {
      console.log(`N°${r.badgeNum} - ${r.firstName} ${r.lastName}`);
      console.log(`   📝 Lien profil : ${r.profileLink}`);
      console.log(`   🌐 Page publique: ${r.publicLink}`);
      console.log();
    }

    console.log("\n👔 MISTER (" + misterResults.length + " candidates)");
    console.log("-".repeat(80));
    for (const r of misterResults) {
      console.log(`N°${r.badgeNum} - ${r.firstName} ${r.lastName}`);
      console.log(`   📝 Lien profil : ${r.profileLink}`);
      console.log(`   🌐 Page publique: ${r.publicLink}`);
      console.log();
    }

    // 6. Sauvegarder en CSV
    const csvPath = join(__dirname, "../candidats-liens-2026.csv");
    const csvHeader = "Catégorie,N°,Prénom,Nom,ID,Lien Profil (à envoyer),Page Publique\n";
    const csvRows = results.map(r =>
      `${r.category},${r.badgeNum},${r.firstName},${r.lastName},${r.candidateId},"${r.profileLink}","${r.publicLink}"`
    ).join("\n");
    fs.writeFileSync(csvPath, csvHeader + csvRows, "utf-8");
    console.log(`\n✅ CSV sauvegardé: ${csvPath}`);

    // 7. Sauvegarder en Markdown
    const mdPath = join(__dirname, "../candidats-liens-2026.md");
    let md = `# Liens de profil - Miss & Mister Dour 2026\n\n`;
    md += `> Généré le ${new Date().toLocaleDateString("fr-BE")} | ${results.length} candidats\n\n`;
    md += `## 🌸 Miss (${missResults.length} candidates)\n\n`;
    md += `| N° | Prénom | Nom | Lien Profil | Page Publique |\n`;
    md += `|---|---|---|---|---|\n`;
    for (const r of missResults) {
      md += `| ${r.badgeNum} | ${r.firstName} | ${r.lastName} | [Envoyer ce lien](${r.profileLink}) | [Voir profil](${r.publicLink}) |\n`;
    }
    md += `\n## 👔 Mister (${misterResults.length} candidates)\n\n`;
    md += `| N° | Prénom | Nom | Lien Profil | Page Publique |\n`;
    md += `|---|---|---|---|---|\n`;
    for (const r of misterResults) {
      md += `| ${r.badgeNum} | ${r.firstName} | ${r.lastName} | [Envoyer ce lien](${r.profileLink}) | [Voir profil](${r.publicLink}) |\n`;
    }
    md += `\n---\n*Chaque candidat doit remplir son profil via le "Lien Profil" pour que sa page publique soit complète.*\n`;
    fs.writeFileSync(mdPath, md, "utf-8");
    console.log(`✅ Markdown sauvegardé: ${mdPath}`);

    console.log(`\n🎉 Import terminé ! ${results.length} candidats traités.\n`);

  } finally {
    await db.end();
  }
}

main().catch(console.error);
