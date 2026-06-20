'use strict';

require('dotenv').config();
const path = require('path');
const { execFileSync } = require('child_process');
const db = require('../db');

const SQLITE_PATH = path.join(__dirname, '..', 'data', 'todap.db');

const TABLES = [
  'haberler',
  'etkinlikler',
  'birimler',
  'yayinlar',
  'ticker_items',
  'mesajlar',
  'basvurular',
  'sabit_sayfalar',
  'faaliyetler',
  'basinda_todap',
  'videos',
  'theme_color_profiles'
];

function readSqliteRows(tableName) {
  const sql = `SELECT * FROM ${tableName};`;
  const output = execFileSync('sqlite3', ['-json', SQLITE_PATH, sql], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 250
  });
  const trimmed = output.trim();
  return trimmed ? JSON.parse(trimmed) : [];
}

function normalizeValue(tableName, column, value) {
  if (value === undefined) return null;
  if (tableName === 'theme_color_profiles' && column === 'is_active') {
    return Boolean(value);
  }
  return value;
}

async function truncateAll() {
  // TRUNCATE in reverse dependency order and reset identities.
  const sql = `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`;
  await db.query(sql);
}

async function insertRows(tableName, rows) {
  if (!rows.length) return;

  const columns = Object.keys(rows[0]);
  const colSql = columns.map((c) => `"${c}"`).join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const insertSql = `INSERT INTO "${tableName}" (${colSql}) VALUES (${placeholders});`;

  for (const row of rows) {
    const values = columns.map((column) => normalizeValue(tableName, column, row[column]));
    await db.query(insertSql, values);
  }
}

async function resetIdSequence(tableName) {
  const sql = `
    SELECT setval(
      pg_get_serial_sequence('"${tableName}"', 'id'),
      COALESCE((SELECT MAX(id) FROM "${tableName}"), 1),
      (SELECT COUNT(*) > 0 FROM "${tableName}")
    );
  `;
  await db.query(sql);
}

async function ensureSqliteCli() {
  try {
    execFileSync('sqlite3', ['--version'], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 4
    });
  } catch (error) {
    throw new Error('sqlite3 CLI bulunamadi. Lutfen once sqlite3 kurun.');
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL eksik. Hedef PostgreSQL (Neon) baglantisini .env ile verin.');
  }

  await ensureSqliteCli();

  console.log('1) PostgreSQL semasi hazirlaniyor...');
  await db.init();

  console.log('2) SQLite verileri okunuyor...');
  const payload = {};
  for (const tableName of TABLES) {
    payload[tableName] = readSqliteRows(tableName);
    console.log(`   - ${tableName}: ${payload[tableName].length} satir`);
  }

  console.log('3) Hedef PostgreSQL temizlenip veri aktariliyor...');
  await db.query('BEGIN');
  try {
    await truncateAll();

    for (const tableName of TABLES) {
      await insertRows(tableName, payload[tableName]);
      await resetIdSequence(tableName);
    }

    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }

  console.log('4) Kontrol sayimlari:');
  for (const tableName of TABLES) {
    const row = await db.query(`SELECT COUNT(*)::int AS c FROM "${tableName}";`);
    console.log(`   - ${tableName}: ${row.rows[0].c}`);
  }

  console.log('Tamamlandi: SQLite -> PostgreSQL aktarimi basariyla bitti.');
}

main().catch((error) => {
  console.error('Aktarim hatasi:', error.message);
  process.exit(1);
});
