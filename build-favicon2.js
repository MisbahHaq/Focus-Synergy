const sharp = require('sharp');
const fs = require('fs');

async function createIco() {
  const size = 256;
  const pngBuffer = await sharp('frontend/fav.png').resize(size, size).png().toBuffer();
  
  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;
  
  const header = Buffer.alloc(ICONDIR_SIZE);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  
  const pngSize = pngBuffer.length;
  const entry = Buffer.alloc(ICONDIRENTRY_SIZE);
  entry.writeUInt8(0, 0);
  entry.writeUInt8(0, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(0, 4);
  entry.writeUInt16LE(0, 6);
  entry.writeUInt32LE(pngSize + ICONDIRENTRY_SIZE, 8);
  entry.writeUInt32LE(22, 12);
  
  const ico = Buffer.concat([header, entry, pngBuffer]);
  fs.writeFileSync('src-tauri/icons/favicon.ico', ico);
  console.log('Created favicon.ico:', ico.length, 'bytes');
}

createIco().catch(e => console.error(e));
