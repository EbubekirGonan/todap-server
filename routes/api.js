'use strict';
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── Haberler ─────────────────────────────────────────────────
router.get('/haberler', (_req, res) => {
  res.json(db.prepare('SELECT * FROM haberler WHERE aktif=1 ORDER BY tarih DESC').all());
});

router.get('/haberler/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM haberler WHERE slug=? AND aktif=1').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Bulunamadı' });
  res.json(row);
});

// ── Etkinlikler ──────────────────────────────────────────────
router.get('/etkinlikler', (_req, res) => {
  res.json(db.prepare('SELECT * FROM etkinlikler WHERE aktif=1 ORDER BY tarih DESC').all());
});

router.get('/etkinlikler/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM etkinlikler WHERE slug=? AND aktif=1').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Bulunamadı' });
  res.json(row);
});

// ── Birimler ─────────────────────────────────────────────────
router.get('/birimler', (_req, res) => {
  res.json(db.prepare('SELECT * FROM birimler WHERE aktif=1 ORDER BY sira ASC').all());
});

// ── Yayınlar ─────────────────────────────────────────────────
router.get('/yayinlar', (_req, res) => {
  res.json(db.prepare('SELECT * FROM yayinlar WHERE aktif=1').all());
});

// ── Ticker ───────────────────────────────────────────────────
router.get('/ticker', (_req, res) => {
  const rows = db.prepare(`
    WITH son_haberler AS (
      SELECT
        'Haber' AS etiket,
        baslik AS metin,
        slug AS slug,
        'haber' AS tur,
        CASE
          WHEN tarih LIKE '____-__-__' THEN tarih || ' 00:00:00'
          ELSE olusturuldu
        END AS yayin_tarihi,
        id AS kaynak_id
      FROM haberler
      WHERE aktif = 1
      ORDER BY datetime(yayin_tarihi) DESC, id DESC
      LIMIT 5
    ),
    son_etkinlikler AS (
      SELECT
        'Etkinlik' AS etiket,
        baslik AS metin,
        slug AS slug,
        'etkinlik' AS tur,
        CASE
          WHEN tarih LIKE '____-__-__' THEN tarih || ' 00:00:00'
          ELSE olusturuldu
        END AS yayin_tarihi,
        id AS kaynak_id
      FROM etkinlikler
      WHERE aktif = 1
      ORDER BY datetime(yayin_tarihi) DESC, id DESC
      LIMIT 5
    )
    SELECT etiket, metin, slug, tur
    FROM (
      SELECT * FROM son_haberler
      UNION ALL
      SELECT * FROM son_etkinlikler
    )
    ORDER BY datetime(yayin_tarihi) DESC, kaynak_id DESC
    LIMIT 10
  `).all();

  res.json(rows);
});

// ── İletişim Formu ───────────────────────────────────────────
router.post('/iletisim', (req, res) => {
  const { isim, eposta, konu, mesaj } = req.body;
  if (!isim || !eposta || !mesaj) {
    return res.status(400).json({ error: 'İsim, e-posta ve mesaj zorunludur.' });
  }
  db.prepare('INSERT INTO mesajlar (isim,eposta,konu,mesaj) VALUES (?,?,?,?)')
    .run(String(isim).slice(0,200), String(eposta).slice(0,200), String(konu||'').slice(0,200), String(mesaj).slice(0,5000));
  res.json({ ok: true });
});

// ── Üyelik Başvurusu ─────────────────────────────────────────
router.post('/uyelik', (req, res) => {
  const { ad, soyad, eposta, telefon, meslek, alan, sehir, neden } = req.body;
  if (!ad || !soyad || !eposta) {
    return res.status(400).json({ error: 'Ad, soyad ve e-posta zorunludur.' });
  }
  db.prepare(`INSERT INTO basvurular (ad,soyad,eposta,telefon,meslek,alan,sehir,neden)
              VALUES (?,?,?,?,?,?,?,?)`)
    .run(
      String(ad).slice(0,100), String(soyad).slice(0,100),
      String(eposta).slice(0,200), String(telefon||'').slice(0,50),
      String(meslek||'').slice(0,100), String(alan||'').slice(0,200),
      String(sehir||'').slice(0,100), String(neden||'').slice(0,2000)
    );
  res.json({ ok: true });
});

// ── Sabit Sayfalar ──────────────────────────────────────
router.get('/sabit-sayfalar/:kategori', (req, res) => {
  const row = db.prepare('SELECT * FROM sabit_sayfalar WHERE kategori=?').get(req.params.kategori);
  if (!row) return res.status(404).json({ error: 'Bulunamı dı' });
  res.json(row);
});

// ── Faaliyetler ──────────────────────────────────────────────
router.get('/faaliyetler', (_req, res) => {
  res.json(db.prepare('SELECT * FROM faaliyetler ORDER BY crdate DESC').all());
});

// ── Basında Todap ─────────────────────────────────────────────
router.get('/basinda-todap', (_req, res) => {
  res.json(db.prepare('SELECT * FROM basinda_todap ORDER BY crdate DESC').all());
});
// ── Videolar ────────────────────────────────────────────
router.get('/videos', (_req, res) => {
  res.json(db.prepare('SELECT * FROM videos WHERE aktif=1 ORDER BY yayinlanma_tarihi DESC').all());
});

router.get('/videos/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM videos WHERE id=? AND aktif=1').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Bulunamadı.' });
  res.json(row);
});
module.exports = router;
