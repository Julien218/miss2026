import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(here, "sponsors-2026", "original");
const output = path.join(here, "..", "client", "public", "sponsors", "sponsors-2026-runtime.webp");
const expectedBytes = 67092;
const expectedSha256 = "eb6a529174902af153c5c08db8fcb11dc5371388814714adec8595b1744f8c26";

if (!fs.existsSync(sourceDir)) {
  throw new Error("Sponsors 2026 : dossier source original introuvable.");
}

const parts = fs.readdirSync(sourceDir)
  .filter((name) => /^part-\d+\.b64$/.test(name))
  .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));

if (parts.length !== 6) {
  throw new Error(`Sponsors 2026 : 6 parties attendues, ${parts.length} trouvée(s).`);
}

const base64 = parts
  .map((name) => fs.readFileSync(path.join(sourceDir, name), "utf8").trim())
  .join("");
const buffer = Buffer.from(base64, "base64");
const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

if (buffer.length !== expectedBytes || sha256 !== expectedSha256) {
  throw new Error(
    `Sponsors 2026 : source invalide (${buffer.length} octets / ${sha256}); attendu ${expectedBytes} / ${expectedSha256}.`
  );
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, buffer);
console.log(`[Sponsors 2026] Source officielle générée : ${buffer.length} octets · ${sha256.slice(0, 12)}…`);
