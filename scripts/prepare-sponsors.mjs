import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(here, "sponsors-2026", "full-sprite.b64");
const output = path.join(here, "..", "client", "public", "sponsors", "sponsors-2026-runtime.webp");
const expectedBytes = 13596;
const expectedSha256 = "d877088f0b25b3d078386b50c90058eb90b33fbd6b28c978ee56daacfa0812d0";

if (!fs.existsSync(source)) {
  throw new Error("Sponsor sprite: source officielle full-sprite.b64 introuvable.");
}

const base64 = fs.readFileSync(source, "utf8").trim();
const buffer = Buffer.from(base64, "base64");
const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

if (buffer.length !== expectedBytes || sha256 !== expectedSha256) {
  throw new Error(
    `Sponsor sprite invalide: ${buffer.length} octets / ${sha256}; attendu ${expectedBytes} / ${expectedSha256}.`
  );
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, buffer);
console.log(`[Sponsors 2026] Sprite officiel web généré: ${buffer.length} octets · ${sha256.slice(0, 12)}…`);
