// scripts/reset-admin-password.js
// Usage: node scripts/reset-admin-password.js <username> <new_password>

const bcrypt = require('bcryptjs');
const { Client } = require('pg');

if (process.argv.length !== 4) {
  console.error('Usage: node scripts/reset-admin-password.js <username> <new_password>');
  process.exit(1);
}

const username = process.argv[2];
const newPassword = process.argv[3];
const hash = bcrypt.hashSync(newPassword, 12);

const client = new Client({
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PGPORT || 5433,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'elt_arena',
});

async function resetPassword() {
  try {
    await client.connect();
    const res = await client.query(
      'UPDATE admin_users SET password_hash = $1 WHERE username = $2',
      [hash, username]
    );
    if (res.rowCount === 1) {
      console.log(`Password for user '${username}' updated successfully.`);
    } else {
      console.error(`User '${username}' not found.`);
    }
  } catch (err) {
    console.error('Error updating password:', err);
  } finally {
    await client.end();
  }
}

resetPassword();
