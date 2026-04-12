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
  res.json(db.prepare('SELECT * FROM ticker_items ORDER BY sira ASC').all());
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

module.exports = router;
