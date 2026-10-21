'use strict';
const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const db      = require('../db');
const { sendContactNotification, sendMembershipNotification } = require('../mailer');

function ah(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatasi' });
  });
}

function createFormLimiter(message) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: message }
  });
}

const contactFormLimiter = createFormLimiter('Çok fazla mesaj gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.');
const membershipFormLimiter = createFormLimiter('Çok fazla başvuru gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactFormLimits = { isim: 200, eposta: 200, konu: 200, mesaj: 5000 };
const membershipFormLimits = {
  ad: 100,
  soyad: 100,
  eposta: 200,
  telefon: 50,
  meslek: 100,
  alan: 200,
  sehir: 100,
  neden: 2000
};
const formFieldLabels = {
  isim: 'İsim',
  ad: 'Ad',
  soyad: 'Soyad',
  eposta: 'E-posta',
  konu: 'Konu',
  mesaj: 'Mesaj',
  telefon: 'Telefon',
  meslek: 'Meslek / unvan',
  alan: 'Çalışma alanı',
  sehir: 'Şehir',
  neden: 'Açıklama'
};

function validateForm(body, limits, requiredFields) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Form verileri geçersiz.' };
  }

  const values = {};
  for (const [field, maxLength] of Object.entries(limits)) {
    const value = body[field] === undefined ? '' : body[field];
    if (typeof value !== 'string') {
      return { error: 'Form alanları metin olmalıdır.' };
    }
    values[field] = value.trim();
    if (values[field].length > maxLength) {
      return { error: `${formFieldLabels[field]} en fazla ${maxLength} karakter olabilir.` };
    }
  }

  const missingFields = requiredFields.filter((field) => !values[field]);
  if (missingFields.length) {
    return { error: `${missingFields.map((field) => formFieldLabels[field]).join(', ')} zorunludur.` };
  }
  if (!emailPattern.test(values.eposta)) {
    return { error: 'Geçerli bir e-posta adresi girin.' };
  }

  return { values };
}

// ── Haberler ─────────────────────────────────────────────────
router.get('/haberler', ah(async (_req, res) => {
  res.json(await db.prepare("SELECT * FROM haberler WHERE aktif=1 AND yayinda='E' AND delete_flag<>'E' ORDER BY tarih DESC").all());
}));

router.get('/haberler/id/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Geçersiz haber kimliği.' });
  }
  const row = await db.prepare("SELECT * FROM haberler WHERE id=? AND aktif=1 AND yayinda='E' AND delete_flag<>'E'").get(id);
  if (!row) return res.status(404).json({ error: 'Haber bulunamadı.' });
  res.json(row);
}));

router.get('/haberler/:slug', ah(async (req, res) => {
  const row = await db.prepare("SELECT * FROM haberler WHERE slug=? AND aktif=1 AND yayinda='E' AND delete_flag<>'E'").get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Bulunamadı' });
  res.json(row);
}));

// ── Etkinlikler ──────────────────────────────────────────────
router.get('/etkinlikler', ah(async (_req, res) => {
  res.json(await db.prepare("SELECT * FROM etkinlikler WHERE aktif=1 AND yayinda='E' AND delete_flag<>'E' ORDER BY tarih DESC").all());
}));

router.get('/etkinlikler/id/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Geçersiz etkinlik kimliği.' });
  }
  const row = await db.prepare("SELECT * FROM etkinlikler WHERE id=? AND aktif=1 AND yayinda='E' AND delete_flag<>'E'").get(id);
  if (!row) return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
  res.json(row);
}));

router.get('/etkinlikler/:slug', ah(async (req, res) => {
  const row = await db.prepare("SELECT * FROM etkinlikler WHERE slug=? AND aktif=1 AND yayinda='E' AND delete_flag<>'E'").get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Bulunamadı' });
  res.json(row);
}));

// ── Birimler ─────────────────────────────────────────────────
router.get('/birimler', ah(async (_req, res) => {
  res.json(await db.prepare("SELECT * FROM birimler WHERE aktif=1 AND delete_flag<>'E' ORDER BY sira ASC").all());
}));

// ── Yayınlar ─────────────────────────────────────────────────
router.get('/yayinlar', ah(async (_req, res) => {
  res.json(await db.prepare("SELECT * FROM yayinlar WHERE aktif=1 AND delete_flag<>'E' ORDER BY NULLIF(crdate, '') DESC NULLS LAST, id DESC").all());
}));

// ── Ticker ───────────────────────────────────────────────────
router.get('/ticker', ah(async (_req, res) => {
  const rows = await db.prepare(`
    WITH son_haberler AS (
      SELECT
        'Haber' AS etiket,
        baslik AS metin,
        slug AS slug,
        'haber' AS tur,
        CASE
          WHEN tarih ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN tarih || ' 00:00:00'
          ELSE olusturuldu::text
        END AS yayin_tarihi,
        id AS kaynak_id
      FROM haberler
      WHERE aktif = 1 AND yayinda = 'E' AND delete_flag <> 'E'
      ORDER BY yayin_tarihi DESC, id DESC
      LIMIT 5
    ),
    son_etkinlikler AS (
      SELECT
        'Etkinlik' AS etiket,
        baslik AS metin,
        slug AS slug,
        'etkinlik' AS tur,
        CASE
          WHEN tarih ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN tarih || ' 00:00:00'
          ELSE olusturuldu::text
        END AS yayin_tarihi,
        id AS kaynak_id
      FROM etkinlikler
      WHERE aktif = 1 AND yayinda = 'E' AND delete_flag <> 'E'
      ORDER BY yayin_tarihi DESC, id DESC
      LIMIT 5
    )
    SELECT etiket, metin, slug, tur, kaynak_id AS id
    FROM (
      SELECT * FROM son_haberler
      UNION ALL
      SELECT * FROM son_etkinlikler
    ) q
    ORDER BY yayin_tarihi DESC, kaynak_id DESC
    LIMIT 10
  `).all();

  res.json(rows);
}));

// ── İletişim Formu ───────────────────────────────────────────
router.post('/iletisim', contactFormLimiter, ah(async (req, res) => {
  const validation = validateForm(req.body, contactFormLimits, ['isim', 'eposta', 'mesaj']);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }
  const { isim, eposta, konu, mesaj } = validation.values;
  await db.prepare('INSERT INTO mesajlar (isim,eposta,konu,mesaj) VALUES (?,?,?,?)')
    .run(isim, eposta, konu, mesaj);

  try {
    await sendContactNotification({ isim, eposta, konu, mesaj });
  } catch (err) {
    console.error('Iletisim e-postasi gonderilemedi:', err.message);
  }

  res.json({ ok: true });
}));

// ── Üyelik Başvurusu ─────────────────────────────────────────
router.post('/uyelik', membershipFormLimiter, ah(async (req, res) => {
  const validation = validateForm(req.body, membershipFormLimits, ['ad', 'soyad', 'eposta', 'meslek', 'sehir']);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }
  const { ad, soyad, eposta, telefon, meslek, alan, sehir, neden } = validation.values;
  await db.prepare(`INSERT INTO basvurular (ad,soyad,eposta,telefon,meslek,alan,sehir,neden)
              VALUES (?,?,?,?,?,?,?,?)`)
    .run(ad, soyad, eposta, telefon, meslek, alan, sehir, neden);

  try {
    await sendMembershipNotification({ ad, soyad, eposta, telefon, meslek, alan, sehir, neden });
  } catch (err) {
    console.error('Uyelik e-postasi gonderilemedi:', err.message);
  }

  res.json({ ok: true });
}));

// ── Sabit Sayfalar ──────────────────────────────────────
router.get('/sabit-sayfalar/:kategori', ah(async (req, res) => {
  const row = await db.prepare('SELECT * FROM sabit_sayfalar WHERE kategori=?').get(req.params.kategori);
  if (!row) return res.status(404).json({ error: 'Bulunamadı' });
  res.json(row);
}));

// ── Faaliyetler ──────────────────────────────────────────────
router.get('/faaliyetler', ah(async (_req, res) => {
  res.json(await db.prepare("SELECT * FROM faaliyetler WHERE yayinda='E' AND delete_flag<>'E' ORDER BY crdate DESC").all());
}));

router.get('/faaliyetler/id/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Geçersiz faaliyet kimliği.' });
  }
  const row = await db.prepare("SELECT * FROM faaliyetler WHERE id=? AND yayinda='E' AND delete_flag<>'E'").get(id);
  if (!row) return res.status(404).json({ error: 'Faaliyet bulunamadı.' });
  res.json(row);
}));

// ── Basında Todap ─────────────────────────────────────────────
router.get('/basinda-todap', ah(async (_req, res) => {
  res.json(await db.prepare("SELECT * FROM basinda_todap WHERE yayinda='E' AND delete_flag<>'E' ORDER BY crdate DESC").all());
}));

// ── Videolar ────────────────────────────────────────────
router.get('/videos', ah(async (_req, res) => {
  res.json(await db.prepare("SELECT * FROM videos WHERE aktif=1 AND delete_flag<>'E' ORDER BY yayinlanma_tarihi DESC").all());
}));

router.get('/videos/:id', ah(async (req, res) => {
  const row = await db.prepare("SELECT * FROM videos WHERE id=? AND aktif=1 AND delete_flag<>'E'").get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Bulunamadı.' });
  res.json(row);
}));

module.exports = router;
