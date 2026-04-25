'use strict';
require('dotenv').config();
const express = require('express');
const path    = require('path');
const session = require('express-session');
const db      = require('./db');
const { buildTokensCss, rowToTheme } = require('./themeTokens');

// DB'yi import et — tablolar ve seed burada çalışır

const app  = express();
const PORT = process.env.PORT || 3000;

// Render.com gibi reverse proxy arkasında çalışırken güvenli session için gerekli
app.set('trust proxy', 1);

// ── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'todap-dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ── Dinamik tokens.css ──────────────────────────────────────
app.get('/tokens.css', async (_req, res) => {
  const row = await db.prepare(`
    SELECT * FROM theme_color_profiles
    WHERE is_active=true
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `).get();

  const css = buildTokensCss(rowToTheme(row));
  res.setHeader('Content-Type', 'text/css; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.send(css);
});

// ── Statik dosyalar ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Route'ları ───────────────────────────────────────────
app.use('/api', require('./routes/api'));
app.use('/api/admin', require('./routes/admin'));

// ── Admin SPA ────────────────────────────────────────────────
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// ── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Başlat ───────────────────────────────────────────────────
async function start() {
  await db.init();
  app.listen(PORT, () => {
    console.log(`\nTODAP sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin\n`);
  });
}

start().catch((err) => {
  console.error('Sunucu baslatilirken hata:', err);
  process.exit(1);
});
