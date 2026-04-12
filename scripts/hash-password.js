// Yeni admin şifresi hash'lemek için:
// node scripts/hash-password.js
// Çıkan hash'i .env ADMIN_PASSWORD_HASH satırına yapıştır

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Yeni şifre: ', async (password) => {
  if (!password || password.length < 6) {
    console.error('Şifre en az 6 karakter olmalı!');
    rl.close();
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  console.log('\n.env dosyasına şunu ekle:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  rl.close();
});
