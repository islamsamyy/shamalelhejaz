/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'node_modules/magic-string');
const dest = path.join(__dirname, 'node_modules/@tailwindcss/node/node_modules/magic-string');

if (fs.existsSync(src) && fs.existsSync(path.dirname(dest))) {
  try {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log('[fix-magic-string] Successfully synced magic-string 0.30.17 to nested @tailwindcss/node');
  } catch (err) {
    console.warn('[fix-magic-string] Warning:', err.message);
  }
}
