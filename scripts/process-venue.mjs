import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const root = path.resolve(process.cwd(), "..");
const vidSrc = path.join(root, "فيديو القاعة .mp4");
const imgSrc = "C:/Users/S.sore/.gemini/antigravity/brain/b3d1889f-0523-4b5c-8e70-99b04a67ddc6/.user_uploaded/media_1795210869005_c39d5a70.jpg";

console.log("Checking assets...");
console.log("Video source exists:", fs.existsSync(vidSrc));
console.log("Image source exists:", fs.existsSync(imgSrc));

// 1. Process image with Sharp -> public/venue.webp
const imgMeta = await sharp(imgSrc).metadata();
console.log("Input image dimensions:", imgMeta.width, "x", imgMeta.height);

const outImg = path.resolve(process.cwd(), "public/venue.webp");
await sharp(imgSrc)
  .resize({ width: 1080, withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile(outImg);
console.log("Written public/venue.webp:", fs.statSync(outImg).size, "bytes");

// 2. Process video: strip audio (-an), optimize for web (-movflags +faststart, H.264), scale gracefully
const outVid = path.resolve(process.cwd(), "public/venue.mp4");
// Also inspect duration / dimensions
const cmd = `"${ffmpeg}" -y -i "${vidSrc}" -an -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart -vf "scale='min(720,iw)':-2" "${outVid}"`;
console.log("Running ffmpeg to strip audio and optimize video...");
execSync(cmd, { stdio: "inherit" });
console.log("Written public/venue.mp4:", fs.statSync(outVid).size, "bytes");
