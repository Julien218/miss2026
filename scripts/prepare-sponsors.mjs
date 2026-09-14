import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(here, "sponsors-2026", "original");
const output = path.join(here, "..", "client", "public", "sponsors", "sponsors-2026-runtime.webp");
const expectedBytes = 67092;
const expectedSha256 = "eb6a529174902af153c5c08db8fcb11dc5371388814714adec8595b1744f8c26";
const parts = [
  "part-01.b64",
  "part-02.b64",
  "part-03.b64",
  "part-04a.b64",
  "part-04b.b64",
  "part-04c.b64",
  "part-05.b64",
  "part-06.b64",
];

if (!fs.existsSync(sourceDir)) {
  throw new Error("Sponsors 2026 : dossier source original introuvable.");
}

for (const name of parts) {
  if (!fs.existsSync(path.join(sourceDir, name))) {
    throw new Error(`Sponsors 2026 : partie source manquante — ${name}.`);
  }
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

// Les logos sont fournis dans une planche avec des cartons blancs. On retire
// uniquement les pixels blancs connectés au bord de chaque tuile : les zones
// blanches faisant partie d'un logo restent donc intactes et les proportions
// originales ne changent pas.
const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const columns = 5;
const rows = 9;
const tileWidth = Math.floor(info.width / columns);
const tileHeight = Math.floor(info.height / rows);
const isBackgroundWhite = (offset) => {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  return r >= 245 && g >= 245 && b >= 245 && Math.max(r, g, b) - Math.min(r, g, b) <= 16;
};

for (let row = 0; row < rows; row += 1) {
  for (let column = 0; column < columns; column += 1) {
    const left = column * tileWidth;
    const top = row * tileHeight;
    const visited = new Uint8Array(tileWidth * tileHeight);
    const enqueue = (x, y, queue) => {
      if (x < 0 || y < 0 || x >= tileWidth || y >= tileHeight) return;
      const index = y * tileWidth + x;
      if (visited[index]) return;
      const offset = ((top + y) * info.width + left + x) * 4;
      if (!isBackgroundWhite(offset)) return;
      visited[index] = 1;
      queue.push([x, y]);
    };
    for (let startY = 0; startY < tileHeight; startY += 1) {
      for (let startX = 0; startX < tileWidth; startX += 1) {
        const startIndex = startY * tileWidth + startX;
        if (visited[startIndex]) continue;
        const startOffset = ((top + startY) * info.width + left + startX) * 4;
        if (!isBackgroundWhite(startOffset)) continue;
        const queue = [];
        enqueue(startX, startY, queue);
        for (let index = 0; index < queue.length; index += 1) {
          const [x, y] = queue[index];
          enqueue(x + 1, y, queue);
          enqueue(x - 1, y, queue);
          enqueue(x, y + 1, queue);
          enqueue(x, y - 1, queue);
        }
        // Les grands composants sont les cartons de fond; un petit composant
        // reste intact afin de préserver les lettres/blancs du logo.
        if (queue.length >= 180) {
          for (const [x, y] of queue) {
            const offset = ((top + y) * info.width + left + x) * 4;
            data[offset + 3] = 0;
          }
        }
      }
    }
  }
}

const cleaned = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .webp({ lossless: true, effort: 6 })
  .toBuffer();
fs.writeFileSync(output, cleaned);
console.log(`[Sponsors 2026] Planche officielle générée sans fonds blancs : ${cleaned.length} octets · source ${sha256.slice(0, 12)}…`);
