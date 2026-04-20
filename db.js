'use strict';

const { Pool } = require('pg');
const { THEME_COLUMNS, DEFAULT_THEME } = require('./themeTokens');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL zorunlu. PostgreSQL baglantisi icin .env ayarlayin.');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
});

function normalizeSql(sql) {
  return String(sql)
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/date\('now'\)/gi, 'CURRENT_DATE');
}

function compileSql(sql, args) {
  let text = String(sql).trim();
  if (text.endsWith(';')) text = text.slice(0, -1);

  const hasNamed = /@[a-zA-Z_][a-zA-Z0-9_]*/.test(text);
  if (hasNamed) {
    const obj = args.length === 1 && args[0] && typeof args[0] === 'object' ? args[0] : {};
    const values = [];
    text = text.replace(/@([a-zA-Z_][a-zA-Z0-9_]*)/g, (_m, key) => {
      values.push(obj[key]);
      return `$${values.length}`;
    });
    return { text, values };
  }

  let i = 0;
  text = text.replace(/\?/g, () => {
    i += 1;
    return `$${i}`;
  });
  return { text, values: args };
}

function createAdapter(executor) {
  return {
    prepare(sql) {
      const normalized = normalizeSql(sql);

      return {
        async all(...args) {
          const { text, values } = compileSql(normalized, args);
          const result = await executor.query(text, values);
          return result.rows;
        },

        async get(...args) {
          const { text, values } = compileSql(normalized, args);
          const result = await executor.query(text, values);
          return result.rows[0];
        },

        async run(...args) {
          let { text, values } = compileSql(normalized, args);
          const isInsert = /^\s*insert\s+/i.test(text);
          if (isInsert && !/\breturning\b/i.test(text)) {
            text += ' RETURNING id';
          }
          const result = await executor.query(text, values);
          return {
            lastInsertRowid: result.rows && result.rows[0] ? result.rows[0].id : undefined,
            changes: result.rowCount || 0
          };
        }
      };
    },

    async query(sql, params = []) {
      return executor.query(sql, params);
    },

    async withTransaction(fn) {
      const client = await pool.connect();
      const tx = createAdapter(client);
      try {
        await client.query('BEGIN');
        const result = await fn(tx);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },

    async init() {
      await executor.query(`
        CREATE TABLE IF NOT EXISTS haberler (
          id BIGSERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          baslik TEXT NOT NULL,
          ozet TEXT DEFAULT '',
          ozet_icerik TEXT DEFAULT '',
          detayli_icerik TEXT DEFAULT '',
          tarih TEXT DEFAULT '',
          gosterim_tarihi TEXT DEFAULT '',
          kategori TEXT DEFAULT 'Bildiri',
          renk TEXT DEFAULT '',
          keywords TEXT DEFAULT '',
          aktif INTEGER DEFAULT 1,
          olusturuldu TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS etkinlikler (
          id BIGSERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          baslik TEXT NOT NULL,
          ozet TEXT DEFAULT '',
          icerik TEXT DEFAULT '',
          tarih TEXT DEFAULT '',
          gosterim_tarihi TEXT DEFAULT '',
          gun TEXT DEFAULT '—',
          ay TEXT DEFAULT '?',
          kategori TEXT DEFAULT 'Etkinlik',
          keywords TEXT DEFAULT '',
          aktif INTEGER DEFAULT 1,
          olusturuldu TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS birimler (
          id BIGSERIAL PRIMARY KEY,
          no TEXT DEFAULT '',
          baslik TEXT NOT NULL,
          ozet TEXT DEFAULT '',
          icerik TEXT DEFAULT '',
          keywords TEXT DEFAULT '',
          aktif INTEGER DEFAULT 1,
          sira INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS yayinlar (
          id BIGSERIAL PRIMARY KEY,
          baslik TEXT NOT NULL,
          ozet TEXT DEFAULT '',
          tur TEXT DEFAULT '',
          url TEXT DEFAULT '',
          keywords TEXT DEFAULT '',
          aktif INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS ticker_items (
          id BIGSERIAL PRIMARY KEY,
          etiket TEXT NOT NULL,
          metin TEXT NOT NULL,
          sira INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS mesajlar (
          id BIGSERIAL PRIMARY KEY,
          isim TEXT,
          eposta TEXT,
          konu TEXT,
          mesaj TEXT,
          olusturuldu TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS basvurular (
          id BIGSERIAL PRIMARY KEY,
          ad TEXT,
          soyad TEXT,
          eposta TEXT,
          telefon TEXT,
          meslek TEXT,
          alan TEXT,
          sehir TEXT,
          neden TEXT,
          olusturuldu TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sabit_sayfalar (
          id BIGSERIAL PRIMARY KEY,
          kategori TEXT UNIQUE NOT NULL,
          baslik TEXT NOT NULL,
          icerik TEXT NOT NULL,
          keywords TEXT DEFAULT '',
          guncelleme TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS faaliyetler (
          id BIGSERIAL PRIMARY KEY,
          baslik TEXT NOT NULL,
          ozet TEXT DEFAULT '',
          icerik TEXT DEFAULT '',
          keywords TEXT DEFAULT '',
          crdate TEXT DEFAULT '',
          guncelleme TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS basinda_todap (
          id BIGSERIAL PRIMARY KEY,
          baslik TEXT NOT NULL,
          adres_ismi TEXT DEFAULT '',
          baglanti_adresi TEXT DEFAULT '',
          keywords TEXT DEFAULT '',
          crdate TEXT DEFAULT '',
          guncelleme TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS videos (
          id BIGSERIAL PRIMARY KEY,
          baslik TEXT NOT NULL,
          aciklama TEXT DEFAULT '',
          video_url TEXT DEFAULT '',
          thumbnail_url TEXT DEFAULT '',
          yayinlanma_tarihi TEXT DEFAULT '',
          keywords TEXT DEFAULT '',
          aktif INTEGER DEFAULT 1,
          olusturma_tarihi TIMESTAMP DEFAULT NOW(),
          guncelleme_tarihi TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS theme_color_profiles (
          id BIGSERIAL PRIMARY KEY,
          profile_name TEXT DEFAULT '',
          var_color_white_base TEXT NOT NULL,
          var_color_green_base TEXT NOT NULL,
          var_color_red_base TEXT NOT NULL,
          var_color_black_base TEXT NOT NULL,
          var_color_green_dark_variant TEXT NOT NULL,
          var_color_red_dark_variant TEXT NOT NULL,
          var_color_green_light_variant TEXT NOT NULL,
          var_color_red_light_variant TEXT NOT NULL,
          var_color_white_off_variant TEXT NOT NULL,
          var_color_gray_light_variant TEXT NOT NULL,
          var_color_gray_lighter_variant TEXT NOT NULL,
          is_active BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      const themeCount = await this.prepare('SELECT COUNT(*)::int AS c FROM theme_color_profiles').get();
      if (!themeCount || Number(themeCount.c) === 0) {
        const cols = THEME_COLUMNS.join(',');
        const placeholders = THEME_COLUMNS.map(() => '?').join(',');
        await this.prepare(`
          INSERT INTO theme_color_profiles (profile_name, ${cols}, is_active)
          VALUES (?, ${placeholders}, true)
        `).run('Varsayilan Tema', ...THEME_COLUMNS.map((k) => DEFAULT_THEME[k]));
        console.log('✓ Varsayilan tema profili olusturuldu.');
      }
    }
  };
}

module.exports = createAdapter(pool);
