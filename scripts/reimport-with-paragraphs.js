'use strict';
/**
 * basin_aciklamalari/ ve Etkinlik/ klasörlerindeki .txt dosyalarını
 * yeniden okuyup paragrafları <p> etiketlerine dönüştürerek
 * veritabanını günceller.
 */

const fs   = require('fs');
const path = require('path');
const db   = require('../db');

function parseFileWithParagraphs(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  let baslik = '';
  let tarih  = '';
  let parsingContent = false;
  const paragraphs = [];

  for (const line of lines) {
    if (line.startsWith('BAŞLIK:')) {
      baslik = line.replace('BAŞLIK:', '').trim();
      continue;
    }
    if (line.startsWith('TARİH:')) {
      tarih = line.replace('TARİH:', '').trim();
      continue;
    }
    if (line.includes('--- İÇERİK ---')) {
      parsingContent = true;
      continue;
    }
    if (!parsingContent) continue;

    // Dosyadaki her dolu satır bir paragraftır
    const trimmed = line.replace(/\u00a0/g, ' ').trim(); // non-breaking space temizle
    if (trimmed.length > 0) {
      paragraphs.push(trimmed);
    }
  }

  const html = paragraphs.map(p => `<p>${p}</p>`).join('\n');

  return { baslik, tarih, html };
}

// Slug üretici (seed-from-files.js ile aynı)
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

function reimportFolder({ folder, table, column }) {
  const dir = path.join(__dirname, `../${folder}`);
  if (!fs.existsSync(dir)) {
    console.log(`⚠ ${folder} klasörü bulunamadı, atlanıyor.`);
    return { updated: 0, notFound: 0 };
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt')).sort();
  const stmt = db.prepare(`UPDATE ${table} SET ${column}=? WHERE slug=?`);
  let updated = 0;
  let notFound = 0;

  db.transaction(() => {
    for (const file of files) {
      const { baslik, html } = parseFileWithParagraphs(path.join(dir, file));
      if (!baslik || !html) continue;

      const slug = createSlug(baslik);
      const result = stmt.run(html, slug);
      if (result.changes > 0) updated++;
      else notFound++;
    }
  })();

  return { updated, notFound };
}

const news = reimportFolder({
  folder: 'basin_aciklamalari',
  table: 'haberler',
  column: 'detayli_icerik'
});

const events = reimportFolder({
  folder: 'Etkinlik',
  table: 'etkinlikler',
  column: 'icerik'
});

console.log(`✓ haberler: ${news.updated} kayıt güncellendi (${news.notFound} eşleşmeyen dosya)`);
console.log(`✓ etkinlikler: ${events.updated} kayıt güncellendi (${events.notFound} eşleşmeyen dosya)`);
