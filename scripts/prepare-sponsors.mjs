import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(here, "sponsors-2026", "full-sprite.b64");
const output = path.join(here, "..", "client", "public", "sponsors", "sponsors-2026-runtime.webp");
const expectedBytes = 13596;
// Empreinte calculée sur les octets réellement décodés par Node/Railway.
const expectedSha256 = "cc502e91b3268e78010186aa67558c168e71378949c4ee0a459f96e2517b80bf";

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
