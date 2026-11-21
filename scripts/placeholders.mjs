// Creates temporary placeholders for files the couple will provide:
//  - public/venue.webp  (a neutral champagne card – replace with the real venue photo)
//  - public/music.mp3   (a few seconds of silence – replace with the real song)
import sharp from "sharp";
import fs from "node:fs";

const venue = "public/venue.webp";
if (!fs.existsSync(venue)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAEEDF"/><stop offset="1" stop-color="#E8D0B5"/></linearGradient></defs>
    <rect width="1200" height="800" fill="url(#g)"/>
    <rect x="40" y="40" width="1120" height="720" rx="36" fill="none" stroke="#B18A4E" stroke-opacity=".45" stroke-width="3"/>
    <text x="600" y="420" font-family="Georgia,serif" font-size="96" letter-spacing="24" fill="#B18A4E" text-anchor="middle">TOPAZ</text>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(venue);
  console.log("created", venue);
}

const music = "public/music.mp3";
if (!fs.existsSync(music)) {
  // MPEG-1 Layer III, 128 kbps, 44.1 kHz frames with empty side-info = silence (~3s)
  const frameLen = 417;
  const frame = Buffer.alloc(frameLen, 0);
  frame.set([0xff, 0xfb, 0x90, 0x64]);
  fs.writeFileSync(music, Buffer.concat(Array.from({ length: 115 }, () => frame)));
  console.log("created", music);
}
