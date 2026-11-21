// Converts the source ornament artwork (in the parent folder) into optimized WebP files
// inside /public/ornaments. Pure white is kept (it disappears with mix-blend-mode: multiply).
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const out = path.resolve(process.cwd(), "public/ornaments");
fs.mkdirSync(out, { recursive: true });

const files = fs.readdirSync(root);
const find = (kw) => files.find((f) => f.includes(kw));

const jobs = [
  { src: find("زاوية"), name: "corner.webp", width: 1200 },
  { src: find("علوية"), name: "top.webp", width: 1600 },
  { src: find("فاصل"), name: "divider.webp", width: 1400 },
  { src: find("شريط"), name: "side.webp", width: 500 },
];

for (const j of jobs) {
  if (!j.src) {
    console.warn("missing source for", j.name);
    continue;
  }
  let quality = 82;
  let buf;
  do {
    buf = await sharp(path.join(root, j.src))
      .flatten({ background: "#ffffff" })
      // push near-white paper noise to pure white so multiply blending is invisible
      .linear(1.06, -4)
      .trim({ background: "#ffffff", threshold: 12 })
      .resize({ width: j.width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toBuffer();
    quality -= 8;
  } while (buf.length > 290_000 && quality > 30);
  fs.writeFileSync(path.join(out, j.name), buf);
  const meta = await sharp(buf).metadata();
  console.log(j.name, `${meta.width}x${meta.height}`, Math.round(buf.length / 1024) + "KB");
}
