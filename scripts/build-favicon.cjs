const pngToIco = require('png-to-ico').default;
const fs = require('fs');

async function main() {
  const ico = await pngToIco('frontend/fav.png');
  fs.writeFileSync('src-tauri/icons/favicon.ico', ico);
  console.log('Created favicon.ico, size:', ico.length, 'bytes');
}

main().catch(e => console.error(e));
