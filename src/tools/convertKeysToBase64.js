const fs = require('fs');
const path = require('path');

function encodeKey(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return Buffer.from(content, 'utf8').toString('base64');
}

const privateKey = encodeKey(path.resolve(__dirname, 'private.key'));
const publicKey = encodeKey(path.resolve(__dirname, 'public.key'));

console.log('✅ Add these to your .env file:');
console.log('\nJWT_PRIVATE_KEY_BASE64=' + privateKey);
console.log('\nJWT_PUBLIC_KEY_BASE64=' + publicKey);
