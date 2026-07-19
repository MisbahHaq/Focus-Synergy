const pngToIco = require('png-to-ico').default || require('png-to-ico');
const fs = require('fs');

pngToIco(['frontend/fav.png']).then(buf => {
  fs.writeFileSync('src-tauri/icons/favicon.ico', buf);
  console.log('Created favicon.ico from fav.png');
}).catch(err => {
  console.error('Failed:', err.message);
});
