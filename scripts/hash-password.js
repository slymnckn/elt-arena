// Basit hash oluşturucu
const crypto = require('crypto');

if (process.argv.length !== 3) {
  console.error('Usage: node scripts/hash-password.js <password>');
  process.exit(1);
}

const password = process.argv[2];

// Node.js crypto ile basit hash (production için bcrypt kullanın)
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');
const combined = `$scrypt$${salt}$${hash}`;

console.log(`Password: ${password}`);
console.log(`Hash: ${combined}`);
console.log('WARNING: This is not bcrypt - for testing only!');