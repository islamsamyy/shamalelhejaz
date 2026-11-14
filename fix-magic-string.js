/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const nested = path.join(__dirname, 'node_modules/@tailwindcss/node/node_modules/magic-string');

if (fs.existsSync(nested)) {
  try {
    fs.rmSync(nested, { recursive: true, force: true });
    console.log('[fix-magic-string] Successfully removed problematic nested ESM magic-string from @tailwindcss/node');
  } catch (err) {
    console.warn('[fix-magic-string] Warning:', err.message);
  }
}
