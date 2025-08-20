// scripts/reset-admin-password.js
// Usage: node scripts/reset-admin-password.js <username> <new_password>


const bcrypt = require('bcryptjs');
const { Client } = require('pg');

console.log('Node version:', process.version);

if (process.argv.length !== 4) {
  console.error('Usage: node scripts/reset-admin-password.js <username> <new_password>');
  process.exit(1);
}

const username = process.argv[2];
const newPassword = process.argv[3];
const hash = bcrypt.hashSync(newPassword, 12);

console.log(`Generated hash for '${newPassword}': ${hash}`);

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://elt_arena_user:eltarena123@localhost:5432/elt_arena',
});

async function resetPassword() {
  try {
    await client.connect();
    
    // Önce kullanıcının mevcut hash'ini kontrol et
    const userCheck = await client.query(
      'SELECT password_hash FROM admin_users WHERE username = $1',
      [username]
    );
    
    if (userCheck.rows.length === 0) {
      console.error(`User '${username}' not found.`);
      return;
    }
    
    console.log(`Current hash in DB: ${userCheck.rows[0].password_hash}`);
    console.log(`Current hash trimmed: ${userCheck.rows[0].password_hash.trim()}`);
    
    // Hash'i trim'leyerek kaydet - auth.ts'te trim() kullanıyor
    const trimmedHash = hash.trim();
    
    const res = await client.query(
      'UPDATE admin_users SET password_hash = $1 WHERE username = $2',
      [trimmedHash, username]
    );
    
    if (res.rowCount === 1) {
      console.log(`Password for user '${username}' updated successfully.`);
      console.log(`New hash stored: ${trimmedHash}`);
      
      // Doğrulama testi yap
      const testResult = bcrypt.compareSync(newPassword, trimmedHash);
      console.log(`Hash verification test: ${testResult ? 'PASS' : 'FAIL'}`);
    } else {
      console.error(`Failed to update user '${username}'.`);
    }
  } catch (err) {
    console.error('Error updating password:', err);
  } finally {
    await client.end();
  }
}

resetPassword();
