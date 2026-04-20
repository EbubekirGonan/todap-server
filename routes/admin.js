'use strict';
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../db');
const auth    = require('../middleware/auth');
const { THEME_COLUMNS, DEFAULT_THEME, THEME_LABELS, validateAndNormalizeTheme, rowToTheme } = require('../themeTokens');

function ah(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  });
}

function isUniqueError(err) {
  return /duplicate key|unique/i.test(String(err && err.message));
}

// ── Oturum ───────────────────────────────────────────────────
router.post('/login', ah(async (req, res) => {
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
}));

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  if (req.session && req.session.admin)
    return res.json({ username: req.session.admin.username });
  res.status(401).json({ error: 'Oturum açılmamış' });
});

// ── Tema / Renk Degiskenleri ───────────────────────────────
router.get('/theme-colors', auth, ah(async (_req, res) => {
  const active = await db.prepare(`
    SELECT * FROM theme_color_profiles
    WHERE is_active=true
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `).get();

  const history = await db.prepare(`
    SELECT id, profile_name, created_at, is_active, ${THEME_COLUMNS.join(', ')}
    FROM theme_color_profiles
    ORDER BY created_at DESC, id DESC
    LIMIT 30
  `).all();

  res.json({
    defaults: DEFAULT_THEME,
    labels: THEME_LABELS,
    active: rowToTheme(active),
    activeMeta: active ? { id: active.id, profile_name: active.profile_name, created_at: active.created_at } : null,
    history: history.map((row) => ({
      id: row.id,
      profile_name: row.profile_name,
      created_at: row.created_at,
      is_active: !!row.is_active,
      colors: rowToTheme(row)
    }))
  });
}));

router.put('/theme-colors', auth, ah(async (req, res) => {
  const validation = validateAndNormalizeTheme(req.body || {}, { requireAll: true });
  if (!validation.ok) {
    return res.status(400).json({ error: validation.errors.join(' ') });
  }

  const profileName = String(req.body.profile_name || '').trim().slice(0, 120) || 'Tema Profili';
  const columns = THEME_COLUMNS.join(',');
  const placeholders = THEME_COLUMNS.map(() => '?').join(',');

  await db.withTransaction(async (tx) => {
    await tx.prepare('UPDATE theme_color_profiles SET is_active=false WHERE is_active=true').run();
    await tx.prepare(`
      INSERT INTO theme_color_profiles (
        profile_name,
        ${columns},
        is_active
      ) VALUES (
        ?,
        ${placeholders},
        true
      )
    `).run(profileName, ...THEME_COLUMNS.map((k) => validation.value[k]));
  });

  res.json({ ok: true });
}));

router.post('/theme-colors/activate/:id', auth, ah(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Gecersiz profil kimligi.' });
  }

  const exists = await db.prepare('SELECT id FROM theme_color_profiles WHERE id=?').get(id);
  if (!exists) {
    return res.status(404).json({ error: 'Tema profili bulunamadi.' });
  }

  await db.withTransaction(async (tx) => {
    await tx.prepare('UPDATE theme_color_profiles SET is_active=false WHERE is_active=true').run();
    await tx.prepare('UPDATE theme_color_profiles SET is_active=true WHERE id=?').run(id);
  });

  res.json({ ok: true });
}));

// ── Haberler CRUD ────────────────────────────────────────────
router.get('/haberler', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM haberler ORDER BY tarih DESC').all());
}));

router.post('/haberler', auth, ah(async (req, res) => {
  const { slug, baslik, ozet, ozet_icerik, detayli_icerik, tarih, gosterim_tarihi, kategori, renk, keywords } = req.body;
  if (!slug || !baslik) return res.status(400).json({ error: 'slug ve baslik zorunlu.' });
  try {
    const r = await db.prepare(`
      INSERT INTO haberler (slug,baslik,ozet,ozet_icerik,detayli_icerik,tarih,gosterim_tarihi,kategori,renk,keywords)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(slug, baslik, ozet || '', ozet_icerik || '', detayli_icerik || '', tarih || '', gosterim_tarihi || '', kategori || 'Bildiri', renk || '', keywords || '');
    res.json({ id: r.lastInsertRowid });
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'Bu slug zaten kullanılıyor.' });
    res.status(500).json({ error: e.message });
  }
}));

router.put('/haberler/:id', auth, ah(async (req, res) => {
  const { baslik, ozet, ozet_icerik, detayli_icerik, tarih, gosterim_tarihi, kategori, renk, aktif, keywords } = req.body;
  await db.prepare(`
    UPDATE haberler SET baslik=?,ozet=?,ozet_icerik=?,detayli_icerik=?,tarih=?,gosterim_tarihi=?,kategori=?,renk=?,aktif=?,keywords=?
    WHERE id=?
  `).run(baslik, ozet || '', ozet_icerik || '', detayli_icerik || '', tarih || '', gosterim_tarihi || '', kategori || 'Bildiri', renk || '',
    aktif !== undefined ? Number(aktif) : 1, keywords || '', req.params.id);
  res.json({ ok: true });
}));

router.delete('/haberler/:id', auth, ah(async (req, res) => {
  await db.prepare('DELETE FROM haberler WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));

// ── Etkinlikler CRUD ─────────────────────────────────────────
router.get('/etkinlikler', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM etkinlikler ORDER BY tarih DESC').all());
}));

router.post('/etkinlikler', auth, ah(async (req, res) => {
  const { slug, baslik, ozet, icerik, tarih, gosterim_tarihi, gun, ay, kategori, keywords } = req.body;
  if (!slug || !baslik) return res.status(400).json({ error: 'slug ve baslik zorunlu.' });
  try {
    const r = await db.prepare(`
      INSERT INTO etkinlikler (slug,baslik,ozet,icerik,tarih,gosterim_tarihi,gun,ay,kategori,keywords)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(slug, baslik, ozet || '', icerik || '', tarih || '', gosterim_tarihi || '', gun || '—', ay || '?', kategori || 'Etkinlik', keywords || '');
    res.json({ id: r.lastInsertRowid });
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'Bu slug zaten kullanılıyor.' });
    res.status(500).json({ error: e.message });
  }
}));

router.put('/etkinlikler/:id', auth, ah(async (req, res) => {
  const { baslik, ozet, icerik, tarih, gosterim_tarihi, gun, ay, kategori, aktif, keywords } = req.body;
  await db.prepare(`
    UPDATE etkinlikler SET baslik=?,ozet=?,icerik=?,tarih=?,gosterim_tarihi=?,gun=?,ay=?,kategori=?,aktif=?,keywords=?
    WHERE id=?
  `).run(baslik, ozet || '', icerik || '', tarih || '', gosterim_tarihi || '', gun || '—', ay || '?', kategori || 'Etkinlik',
    aktif !== undefined ? Number(aktif) : 1, keywords || '', req.params.id);
  res.json({ ok: true });
}));

router.delete('/etkinlikler/:id', auth, ah(async (req, res) => {
  await db.prepare('DELETE FROM etkinlikler WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));

// ── Birimler CRUD ────────────────────────────────────────────
router.get('/birimler', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM birimler ORDER BY sira ASC').all());
}));

router.post('/birimler', auth, ah(async (req, res) => {
  const { no, baslik, ozet, icerik, sira, keywords } = req.body;
  if (!baslik) return res.status(400).json({ error: 'baslik zorunlu.' });
  const r = await db.prepare('INSERT INTO birimler (no,baslik,ozet,icerik,sira,keywords) VALUES (?,?,?,?,?,?)')
    .run(no || '', baslik, ozet || '', icerik || '', sira || 0, keywords || '');
  res.json({ id: r.lastInsertRowid });
}));

router.put('/birimler/:id', auth, ah(async (req, res) => {
  const { no, baslik, ozet, icerik, sira, aktif, keywords } = req.body;
  await db.prepare('UPDATE birimler SET no=?,baslik=?,ozet=?,icerik=?,sira=?,aktif=?,keywords=? WHERE id=?')
    .run(no || '', baslik, ozet || '', icerik || '', sira || 0, aktif !== undefined ? Number(aktif) : 1, keywords || '', req.params.id);
  res.json({ ok: true });
}));

router.delete('/birimler/:id', auth, ah(async (req, res) => {
  await db.prepare('DELETE FROM birimler WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));

// ── Yayınlar CRUD ────────────────────────────────────────────
router.get('/yayinlar', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM yayinlar').all());
}));

router.post('/yayinlar', auth, ah(async (req, res) => {
  const { baslik, ozet, tur, url, keywords } = req.body;
  if (!baslik) return res.status(400).json({ error: 'baslik zorunlu.' });
  const r = await db.prepare('INSERT INTO yayinlar (baslik,ozet,tur,url,keywords) VALUES (?,?,?,?,?)')
    .run(baslik, ozet || '', tur || '', url || '', keywords || '');
  res.json({ id: r.lastInsertRowid });
}));

router.put('/yayinlar/:id', auth, ah(async (req, res) => {
  const { baslik, ozet, tur, url, aktif, keywords } = req.body;
  await db.prepare('UPDATE yayinlar SET baslik=?,ozet=?,tur=?,url=?,aktif=?,keywords=? WHERE id=?')
    .run(baslik, ozet || '', tur || '', url || '', aktif !== undefined ? Number(aktif) : 1, keywords || '', req.params.id);
  res.json({ ok: true });
}));

router.delete('/yayinlar/:id', auth, ah(async (req, res) => {
  await db.prepare('DELETE FROM yayinlar WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));

// ── Ticker CRUD ──────────────────────────────────────────────
router.get('/ticker', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM ticker_items ORDER BY sira ASC').all());
}));

router.post('/ticker', auth, ah(async (req, res) => {
  const { etiket, metin, sira } = req.body;
  if (!etiket || !metin) return res.status(400).json({ error: 'etiket ve metin zorunlu.' });
  const r = await db.prepare('INSERT INTO ticker_items (etiket,metin,sira) VALUES (?,?,?)')
    .run(etiket, metin, sira || 0);
  res.json({ id: r.lastInsertRowid });
}));

router.put('/ticker/:id', auth, ah(async (req, res) => {
  const { etiket, metin, sira } = req.body;
  await db.prepare('UPDATE ticker_items SET etiket=?,metin=?,sira=? WHERE id=?')
    .run(etiket, metin, sira || 0, req.params.id);
  res.json({ ok: true });
}));

router.delete('/ticker/:id', auth, ah(async (req, res) => {
  await db.prepare('DELETE FROM ticker_items WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));

// ── Form Başvuruları (görüntüleme) ───────────────────────────
router.get('/mesajlar', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM mesajlar ORDER BY olusturuldu DESC').all());
}));

router.get('/basvurular', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM basvurular ORDER BY olusturuldu DESC').all());
}));

// ── Sabit Sayfalar CRUD ────────────────────────────────
router.get('/sabit-sayfalar', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM sabit_sayfalar ORDER BY id ASC').all());
}));

router.put('/sabit-sayfalar/:kategori', auth, ah(async (req, res) => {
  const { baslik, icerik, keywords } = req.body;
  if (!baslik || !icerik) return res.status(400).json({ error: 'baslik ve icerik zorunlu.' });
  const existing = await db.prepare('SELECT id FROM sabit_sayfalar WHERE kategori=?').get(req.params.kategori);
  if (!existing) return res.status(404).json({ error: 'Sayfa bulunamadı.' });
  await db.prepare('UPDATE sabit_sayfalar SET baslik=?,icerik=?,keywords=?,guncelleme=NOW() WHERE kategori=?')
    .run(baslik, icerik, keywords || '', req.params.kategori);
  res.json({ ok: true });
}));

router.post('/sabit-sayfalar', auth, ah(async (req, res) => {
  const { kategori, baslik, icerik, keywords } = req.body;
  if (!kategori || !baslik || !icerik) return res.status(400).json({ error: 'kategori, baslik ve icerik zorunlu.' });
  try {
    const r = await db.prepare('INSERT INTO sabit_sayfalar (kategori,baslik,icerik,keywords) VALUES (?,?,?,?)')
      .run(kategori, baslik, icerik, keywords || '');
    res.json({ id: r.lastInsertRowid });
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'Bu kategori zaten mevcut.' });
    res.status(500).json({ error: e.message });
  }
}));

// ── Faaliyetler CRUD ─────────────────────────────────────────
router.get('/faaliyetler', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM faaliyetler ORDER BY crdate DESC').all());
}));

router.post('/faaliyetler', auth, ah(async (req, res) => {
  const { baslik, ozet, icerik, crdate, keywords } = req.body;
  if (!baslik) return res.status(400).json({ error: 'baslik zorunlu.' });
  const r = await db.prepare('INSERT INTO faaliyetler (baslik,ozet,icerik,crdate,keywords) VALUES (?,?,?,?,?)')
    .run(String(baslik).slice(0, 500), String(ozet || '').slice(0, 1000), String(icerik || ''), String(crdate || new Date().toISOString().slice(0, 10)), String(keywords || ''));
  res.json({ id: r.lastInsertRowid });
}));

router.put('/faaliyetler/:id', auth, ah(async (req, res) => {
  const { baslik, ozet, icerik, crdate, keywords } = req.body;
  if (!baslik) return res.status(400).json({ error: 'baslik zorunlu.' });
  await db.prepare('UPDATE faaliyetler SET baslik=?,ozet=?,icerik=?,crdate=?,keywords=?,guncelleme=NOW() WHERE id=?')
    .run(String(baslik).slice(0, 500), String(ozet || '').slice(0, 1000), String(icerik || ''), String(crdate || ''), String(keywords || ''), req.params.id);
  res.json({ ok: true });
}));

router.delete('/faaliyetler/:id', auth, ah(async (req, res) => {
  await db.prepare('DELETE FROM faaliyetler WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));

// ── Basında Todap CRUD ────────────────────────────────────────
router.get('/basinda-todap', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM basinda_todap ORDER BY crdate DESC').all());
}));

router.post('/basinda-todap', auth, ah(async (req, res) => {
  const { baslik, adres_ismi, baglanti_adresi, crdate, keywords } = req.body;
  if (!baslik) return res.status(400).json({ error: 'baslik zorunlu.' });
  const r = await db.prepare('INSERT INTO basinda_todap (baslik,adres_ismi,baglanti_adresi,crdate,keywords) VALUES (?,?,?,?,?)')
    .run(String(baslik).slice(0, 500), String(adres_ismi || ''), String(baglanti_adresi || ''), String(crdate || new Date().toISOString().slice(0, 10)), String(keywords || ''));
  res.json({ id: r.lastInsertRowid });
}));

router.put('/basinda-todap/:id', auth, ah(async (req, res) => {
  const { baslik, adres_ismi, baglanti_adresi, crdate, keywords } = req.body;
  if (!baslik) return res.status(400).json({ error: 'baslik zorunlu.' });
  await db.prepare('UPDATE basinda_todap SET baslik=?,adres_ismi=?,baglanti_adresi=?,crdate=?,keywords=?,guncelleme=NOW() WHERE id=?')
    .run(String(baslik).slice(0, 500), String(adres_ismi || ''), String(baglanti_adresi || ''), String(crdate || ''), String(keywords || ''), req.params.id);
  res.json({ ok: true });
}));

router.delete('/basinda-todap/:id', auth, ah(async (req, res) => {
  await db.prepare('DELETE FROM basinda_todap WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));

// ── Videos CRUD ─────────────────────────────────────────
router.get('/videos', auth, ah(async (_req, res) => {
  res.json(await db.prepare('SELECT * FROM videos ORDER BY yayinlanma_tarihi DESC').all());
}));

router.post('/videos', auth, ah(async (req, res) => {
  const { baslik, aciklama, video_url, thumbnail_url, yayinlanma_tarihi, aktif, keywords } = req.body;
  if (!baslik) return res.status(400).json({ error: 'baslik zorunlu.' });
  const r = await db.prepare('INSERT INTO videos (baslik,aciklama,video_url,thumbnail_url,yayinlanma_tarihi,aktif,keywords) VALUES (?,?,?,?,?,?,?)')
    .run(
      String(baslik).slice(0, 500),
      String(aciklama || ''),
      String(video_url || ''),
      String(thumbnail_url || ''),
      String(yayinlanma_tarihi || new Date().toISOString().slice(0, 10)),
      aktif === false || aktif === 0 ? 0 : 1,
      String(keywords || '')
    );
  res.json({ id: r.lastInsertRowid });
}));

router.put('/videos/:id', auth, ah(async (req, res) => {
  const { baslik, aciklama, video_url, thumbnail_url, yayinlanma_tarihi, aktif, keywords } = req.body;
  if (!baslik) return res.status(400).json({ error: 'baslik zorunlu.' });
  await db.prepare('UPDATE videos SET baslik=?,aciklama=?,video_url=?,thumbnail_url=?,yayinlanma_tarihi=?,aktif=?,keywords=?,guncelleme_tarihi=NOW() WHERE id=?')
    .run(
      String(baslik).slice(0, 500),
      String(aciklama || ''),
      String(video_url || ''),
      String(thumbnail_url || ''),
      String(yayinlanma_tarihi || ''),
      aktif === false || aktif === 0 ? 0 : 1,
      String(keywords || ''),
      req.params.id
    );
  res.json({ ok: true });
}));

router.delete('/videos/:id', auth, ah(async (req, res) => {
  await db.prepare('DELETE FROM videos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));

module.exports = router;
