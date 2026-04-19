'use strict';
const fs = require('fs');
const path = require('path');
const db = require('../db');

const turkishMonths = {
  'Ocak': '01', 'Şubat': '02', 'Mart': '03', 'Nisan': '04',
  'Mayıs': '05', 'Haziran': '06', 'Temmuz': '07', 'Ağustos': '08',
  'Eylül': '09', 'Ekim': '10', 'Kasım': '11', 'Aralık': '12'
};

const turkishMonthsShort = {
  'Ocak': 'Oca', 'Şubat': 'Şub', 'Mart': 'Mar', 'Nisan': 'Nis',
  'Mayıs': 'May', 'Haziran': 'Haz', 'Temmuz': 'Tem', 'Ağustos': 'Ağu',
  'Eylül': 'Eyl', 'Ekim': 'Eki', 'Kasım': 'Kas', 'Aralık': 'Ara'
};

function parseDate(dateStr) {
  // Normalize: remove trailing day names, times, commas e.g. "28 Şubat 2015 Cumartesi saat 13:00" → "28 Şubat 2015"
  // Also handle "22.06.2016 /Çarşamba" → extract DD.MM.YYYY
  let cleaned = dateStr.trim();

  // Handle numeric format like "22.06.2016 /Çarşamba"
  const numericMatch = cleaned.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (numericMatch) {
    const [, d, m, y] = numericMatch;
    const monthEntry = Object.entries(turkishMonths).find(([, v]) => v === m);
    const monthName = monthEntry ? monthEntry[0] : '';
    return {
      iso: `${y}-${m}-${d}`,
      display: monthName ? `${parseInt(d)} ${monthName} ${y}` : `${d}.${m}.${y}`,
      gun: d,
      ay: monthName,
      ayKisa: monthName ? (turkishMonthsShort[monthName] || monthName.slice(0, 3)) : m
    };
  }

  // Extract only first 3 tokens (DD MonthName YYYY), discard rest
  const parts = cleaned.replace(',', '').split(/\s+/);
  if (parts.length < 3) return null;
  const day = parts[0].padStart(2, '0');
  const monthName = parts[1];
  const year = parts[2];
  const monthNum = turkishMonths[monthName];
  if (!monthNum) return null;
  return {
    iso: `${year}-${monthNum}-${day}`,
    display: dateStr.trim(),
    gun: day,
    ay: monthName,
    ayKisa: turkishMonthsShort[monthName] || monthName.slice(0, 3)
  };
}

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/İ/g, 'i').replace(/I/g, 'i')
    .replace(/ş/g, 's').replace(/Ş/g, 's')
    .replace(/ç/g, 'c').replace(/Ç/g, 'c')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ü/g, 'u').replace(/Ü/g, 'u')
    .replace(/ö/g, 'o').replace(/Ö/g, 'o')
    .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function createOzet(content) {
  const plain = content.replace(/<[^>]*>/g, '').trim();
  return plain.length > 150 ? plain.slice(0, 150) + '...' : plain;
}

function createKeywords(title, content) {
  const stopwords = new Set([
    've', 'ya', 'bu', 'ki', 'için', 'ile', 'den', 'de', 'da', 'var',
    'yok', 'ben', 'sen', 'biz', 'siz', 'bir', 'daha', 'çok', 'her',
    'hiç', 'ne', 'olan', 'olarak', 'olan', 'olmuş', 'olması', 'olan',
    'olan', 'kadar', 'ise', 'ama', 'veya', 'olan', 'ancak', 'olan',
    'gibi', 'bile', 'artık', 'zaten', 'sadece', 'çünkü', 'eğer',
    'olan', 'olan', 'olan', 'olan', 'olan', 'olan'
  ]);
  const text = `${title} ${content}`
    .toLowerCase()
    .replace(/İ/g, 'i').replace(/I/g, 'i')
    .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
    .replace(/ı/g, 'i').replace(/ü/g, 'u').replace(/ö/g, 'o');
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !stopwords.has(w));
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word)
    .join(', ');
}

function getNewsCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  if (text.includes('lgbti') || text.includes('cinsiyet')) return { kategori: 'Bildiri', renk: 'r' };
  if (text.includes('yargı') || text.includes('hak') || text.includes('hukuk')) return { kategori: 'İnsan Hakları', renk: 'r' };
  if (text.includes('dava') || text.includes('meslek')) return { kategori: 'Savunuculuk', renk: '' };
  if (text.includes('dayanışma')) return { kategori: 'Dayanışma', renk: '' };
  return { kategori: 'Bildiri', renk: '' };
}

function getEventCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  if (text.includes('sempozyum')) return 'Sempozyum';
  if (text.includes('atölye') || text.includes('atolye')) return 'Atölye';
  if (text.includes('panel')) return 'Panel';
  if (text.includes('eğitim') || text.includes('egitim') || text.includes('derslik')) return 'Eğitim Programı';
  if (text.includes('eylem') || text.includes('yürüyüş') || text.includes('basın')) return 'Eylem';
  return 'Etkinlik';
}

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let baslik = '';
  let tarih = '';
  let icerik = '';
  let parsingContent = false;
  for (const line of lines) {
    if (line.startsWith('BAŞLIK:')) {
      baslik = line.replace('BAŞLIK:', '').trim();
    } else if (line.startsWith('TARİH:')) {
      tarih = line.replace('TARİH:', '').trim();
    } else if (line.includes('--- İÇERİK ---')) {
      parsingContent = true;
      continue;
    }
    if (parsingContent && line.trim()) {
      icerik += (icerik ? '\n' : '') + line;
    }
  }
  return { baslik, tarih, icerik };
}

// ── Import haberler ───────────────────────────────────────────
function importHaberler() {
  const newsDir = path.join(__dirname, '../basin_aciklamalari');
  if (!fs.existsSync(newsDir)) {
    console.log('⚠️  basin_aciklamalari/ klasörü bulunamadı, atlanıyor.');
    return;
  }
  const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.txt')).sort();
  console.log(`\n📰 HABERler: ${files.length} dosya bulundu`);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO haberler
      (slug, baslik, ozet, detayli_icerik, tarih, gosterim_tarihi, kategori, renk, keywords)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0, skipped = 0, errors = 0;

  for (const file of files) {
    try {
      const { baslik, tarih, icerik } = parseFile(path.join(newsDir, file));
      if (!baslik) { errors++; continue; }

      const dateInfo = parseDate(tarih);
      if (!dateInfo) { 
        console.log(`  ⚠️  Tarih çözülemedi: ${file} (tarih="${tarih}")`);
        errors++; 
        continue; 
      }

      const slug = createSlug(baslik);
      const ozet = createOzet(icerik);
      const keywords = createKeywords(baslik, icerik);
      const { kategori, renk } = getNewsCategory(baslik, icerik);

      const result = insert.run(slug, baslik, ozet, icerik, dateInfo.iso, dateInfo.display, kategori, renk, keywords);
      if (result.changes > 0) inserted++;
      else skipped++;
    } catch (err) {
      console.log(`  ❌ Hata: ${file}: ${err.message}`);
      errors++;
    }
  }

  console.log(`  ✅ Eklendi: ${inserted}, ⏭️  Atlandı (duplicate): ${skipped}, ❌ Hata: ${errors}`);
}

// ── Import etkinlikler ────────────────────────────────────────
function importEtkinlikler() {
  const etkinlikDir = path.join(__dirname, '../Etkinlik');
  if (!fs.existsSync(etkinlikDir)) {
    console.log('⚠️  Etkinlik/ klasörü bulunamadı, atlanıyor.');
    return;
  }
  const files = fs.readdirSync(etkinlikDir).filter(f => f.endsWith('.txt')).sort();
  console.log(`\n📅 ETKİNLİKler: ${files.length} dosya bulundu`);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO etkinlikler
      (slug, baslik, ozet, icerik, tarih, gosterim_tarihi, gun, ay, kategori, keywords)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0, skipped = 0, errors = 0;

  for (const file of files) {
    try {
      const { baslik, tarih, icerik } = parseFile(path.join(etkinlikDir, file));
      if (!baslik) { errors++; continue; }

      const dateInfo = parseDate(tarih);
      if (!dateInfo) {
        console.log(`  ⚠️  Tarih çözülemedi: ${file} (tarih="${tarih}")`);
        errors++;
        continue;
      }

      const slug = createSlug(baslik);
      const ozet = createOzet(icerik);
      const keywords = createKeywords(baslik, icerik);
      const kategori = getEventCategory(baslik, icerik);

      const result = insert.run(
        slug, baslik, ozet, icerik,
        dateInfo.iso, dateInfo.display,
        dateInfo.gun, dateInfo.ayKisa,
        kategori, keywords
      );
      if (result.changes > 0) inserted++;
      else skipped++;
    } catch (err) {
      console.log(`  ❌ Hata: ${file}: ${err.message}`);
      errors++;
    }
  }

  console.log(`  ✅ Eklendi: ${inserted}, ⏭️  Atlandı (duplicate): ${skipped}, ❌ Hata: ${errors}`);
}

// ── Run ───────────────────────────────────────────────────────
console.log('🚀 Veritabanına aktarım başlıyor...');
importHaberler();
importEtkinlikler();

const haberCount = db.prepare('SELECT COUNT(*) as c FROM haberler').get().c;
const etkinlikCount = db.prepare('SELECT COUNT(*) as c FROM etkinlikler').get().c;
console.log(`\n📊 Toplam kayıt: haberler=${haberCount}, etkinlikler=${etkinlikCount}`);
console.log('✅ Tamamlandı.');
