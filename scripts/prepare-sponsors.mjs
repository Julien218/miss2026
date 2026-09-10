import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const partsDir = path.join(here, "sponsors-2026");
const output = path.join(here, "..", "client", "public", "sponsors", "sponsors-2026-runtime.webp");
const expectedBytes = 27240;
const expectedSha256 = "dfd4cefec2198b8527b666eb87e01aff07e1bfe71445d4c5f06dd842f1e23f50";

const parts = fs
  .readdirSync(partsDir)
  .filter((name) => /^part\d+\.b64$/.test(name))
  .sort();

if (parts.length !== 4) {
  throw new Error(`Sponsor sprite: 4 parties attendues, ${parts.length} trouvée(s).`);
}

const base64 = parts
  .map((name) => fs.readFileSync(path.join(partsDir, name), "utf8").trim())
  .join("");
const buffer = Buffer.from(base64, "base64");
const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

if (buffer.length !== expectedBytes || sha256 !== expectedSha256) {
  throw new Error(
    `Sponsor sprite invalide: ${buffer.length} octets / ${sha256}; attendu ${expectedBytes} / ${expectedSha256}.`
  );
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, buffer);
console.log(`[Sponsors 2026] Sprite officiel généré: ${buffer.length} octets.`);
