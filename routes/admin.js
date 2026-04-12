'use strict';
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../db');
const auth    = require('../middleware/auth');

// ── Oturum ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli.' });

  if (username !== process.env.ADMIN_USERNAME)
    return res.status(401).json({ error: 'Hatalı kullanıcı adı veya şifre.' });

  if (!process.env.ADMIN_PASSWORD_HASH)
    return res.status(500).json({ error: 'Sunucu yapılandırması eksik. npm run hash çalıştırın.' });

  const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!valid)
    return res.status(401).json({ error: 'Hatalı kullanıcı adı veya şifre.' });

  req.session.admin = { username };
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  if (req.session && req.session.admin)
    return res.json({ username: req.session.admin.username });
  res.status(401).json({ error: 'Oturum açılmamış' });
});

// ── Haberler CRUD ────────────────────────────────────────────
router.get('/haberler', auth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM haberler ORDER BY tarih DESC').all());
});

router.post('/haberler', auth, (req, res) => {
  const { slug, baslik, ozet, icerik, tarih, gosterim_tarihi, kategori, renk } = req.body;
  if (!slug || !baslik) return res.status(400).json({ error: 'slug ve baslik zorunlu.' });
  try {
    const r = db.prepare(`
      INSERT INTO haberler (slug,baslik,ozet,icerik,tarih,gosterim_tarihi,kategori,renk)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(slug, baslik, ozet||'', icerik||'', tarih||'', gosterim_tarihi||'', kategori||'Bildiri', renk||'');
    res.json({ id: r.lastInsertRowid });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Bu slug zaten kullanılıyor.' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/haberler/:id', auth, (req, res) => {
  const { baslik, ozet, icerik, tarih, gosterim_tarihi, kategori, renk, aktif } = req.body;
  db.prepare(`
    UPDATE haberler SET baslik=?,ozet=?,icerik=?,tarih=?,gosterim_tarihi=?,kategori=?,renk=?,aktif=?
    WHERE id=?
  `).run(baslik, ozet||'', icerik||'', tarih||'', gosterim_tarihi||'', kategori||'Bildiri', renk||'',
         aktif !== undefined ? Number(aktif) : 1, req.params.id);
  res.json({ ok: true });
});

router.delete('/haberler/:id', auth, (req, res) => {
  db.prepare('DELETE FROM haberler WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Etkinlikler CRUD ─────────────────────────────────────────
router.get('/etkinlikler', auth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM etkinlikler ORDER BY tarih DESC').all());
});

router.post('/etkinlikler', auth, (req, res) => {
  const { slug, baslik, ozet, icerik, tarih, gosterim_tarihi, gun, ay, kategori } = req.body;
  if (!slug || !baslik) return res.status(400).json({ error: 'slug ve baslik zorunlu.' });
  try {
    const r = db.prepare(`
      INSERT INTO etkinlikler (slug,baslik,ozet,icerik,tarih,gosterim_tarihi,gun,ay,kategori)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(slug, baslik, ozet||'', icerik||'', tarih||'', gosterim_tarihi||'', gun||'—', ay||'?', kategori||'Etkinlik');
    res.json({ id: r.lastInsertRowid });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Bu slug zaten kullanılıyor.' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/etkinlikler/:id', auth, (req, res) => {
  const { baslik, ozet, icerik, tarih, gosterim_tarihi, gun, ay, kategori, aktif } = req.body;
  db.prepare(`
    UPDATE etkinlikler SET baslik=?,ozet=?,icerik=?,tarih=?,gosterim_tarihi=?,gun=?,ay=?,kategori=?,aktif=?
    WHERE id=?
  `).run(baslik, ozet||'', icerik||'', tarih||'', gosterim_tarihi||'', gun||'—', ay||'?', kategori||'Etkinlik',
         aktif !== undefined ? Number(aktif) : 1, req.params.id);
  res.json({ ok: true });
});

router.delete('/etkinlikler/:id', auth, (req, res) => {
  db.prepare('DELETE FROM etkinlikler WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Birimler CRUD ────────────────────────────────────────────
router.get('/birimler', auth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM birimler ORDER BY sira ASC').all());
});

router.post('/birimler', auth, (req, res) => {
  const { no, baslik, ozet, icerik, sira } = req.body;
  if (!baslik) return res.status(400).json({ error: 'baslik zorunlu.' });
  const r = db.prepare('INSERT INTO birimler (no,baslik,ozet,icerik,sira) VALUES (?,?,?,?,?)')
    .run(no||'', baslik, ozet||'', icerik||'', sira||0);
  res.json({ id: r.lastInsertRowid });
});

router.put('/birimler/:id', auth, (req, res) => {
  const { no, baslik, ozet, icerik, sira, aktif } = req.body;
  db.prepare('UPDATE birimler SET no=?,baslik=?,ozet=?,icerik=?,sira=?,aktif=? WHERE id=?')
    .run(no||'', baslik, ozet||'', icerik||'', sira||0, aktif !== undefined ? Number(aktif) : 1, req.params.id);
  res.json({ ok: true });
});

router.delete('/birimler/:id', auth, (req, res) => {
  db.prepare('DELETE FROM birimler WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Yayınlar CRUD ────────────────────────────────────────────
router.get('/yayinlar', auth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM yayinlar').all());
});

router.post('/yayinlar', auth, (req, res) => {
  const { baslik, ozet, tur, url } = req.body;
  if (!baslik) return res.status(400).json({ error: 'baslik zorunlu.' });
  const r = db.prepare('INSERT INTO yayinlar (baslik,ozet,tur,url) VALUES (?,?,?,?)')
    .run(baslik, ozet||'', tur||'', url||'');
  res.json({ id: r.lastInsertRowid });
});

router.put('/yayinlar/:id', auth, (req, res) => {
  const { baslik, ozet, tur, url, aktif } = req.body;
  db.prepare('UPDATE yayinlar SET baslik=?,ozet=?,tur=?,url=?,aktif=? WHERE id=?')
    .run(baslik, ozet||'', tur||'', url||'', aktif !== undefined ? Number(aktif) : 1, req.params.id);
  res.json({ ok: true });
});

router.delete('/yayinlar/:id', auth, (req, res) => {
  db.prepare('DELETE FROM yayinlar WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Ticker CRUD ──────────────────────────────────────────────
router.get('/ticker', auth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM ticker_items ORDER BY sira ASC').all());
});

router.post('/ticker', auth, (req, res) => {
  const { etiket, metin, sira } = req.body;
  if (!etiket || !metin) return res.status(400).json({ error: 'etiket ve metin zorunlu.' });
  const r = db.prepare('INSERT INTO ticker_items (etiket,metin,sira) VALUES (?,?,?)')
    .run(etiket, metin, sira||0);
  res.json({ id: r.lastInsertRowid });
});

router.put('/ticker/:id', auth, (req, res) => {
  const { etiket, metin, sira } = req.body;
  db.prepare('UPDATE ticker_items SET etiket=?,metin=?,sira=? WHERE id=?')
    .run(etiket, metin, sira||0, req.params.id);
  res.json({ ok: true });
});

router.delete('/ticker/:id', auth, (req, res) => {
  db.prepare('DELETE FROM ticker_items WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Form Başvuruları (görüntüleme) ───────────────────────────
router.get('/mesajlar', auth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM mesajlar ORDER BY olusturuldu DESC').all());
});

router.get('/basvurular', auth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM basvurular ORDER BY olusturuldu DESC').all());
});

module.exports = router;
