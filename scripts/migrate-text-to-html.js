'use strict';
/**
 * Veritabanındaki düz metin içerikleri <p> etiketlerine dönüştürür.
 * Etkilenen alanlar:
 *   haberler    → detayli_icerik, ozet_icerik
 *   etkinlikler → icerik
 */

const db = require('../db');

function plainTextToHtml(text) {
  if (!text || typeof text !== 'string') return text;
  // Zaten HTML ise dokunma
  if (text.trimStart().startsWith('<')) return text;

  const paragraphs = text
    .split(/\n{2,}|\r\n{2,}/)          // Boş satırla ayrılmış bloklar
    .map(block => block.replace(/\r?\n/g, ' ').trim())  // Tek satıra çek
    .filter(block => block.length > 0);

  if (paragraphs.length === 0) return text;

  return paragraphs.map(p => `<p>${p}</p>`).join('\n');
}

let updated = 0;

// ── haberler ─────────────────────────────────────────────────
const haberler = db.prepare('SELECT id, detayli_icerik, ozet_icerik FROM haberler').all();
const updateHaber = db.prepare('UPDATE haberler SET detayli_icerik=?, ozet_icerik=? WHERE id=?');

db.transaction(() => {
  for (const row of haberler) {
    const newDetayli = plainTextToHtml(row.detayli_icerik);
    const newOzet = plainTextToHtml(row.ozet_icerik);
    if (newDetayli !== row.detayli_icerik || newOzet !== row.ozet_icerik) {
      updateHaber.run(newDetayli, newOzet, row.id);
      updated++;
    }
  }
})();

console.log(`✓ haberler: ${updated} kayıt güncellendi`);
updated = 0;

// ── etkinlikler ───────────────────────────────────────────────
const etkinlikler = db.prepare('SELECT id, icerik FROM etkinlikler').all();
const updateEtkinlik = db.prepare('UPDATE etkinlikler SET icerik=? WHERE id=?');

db.transaction(() => {
  for (const row of etkinlikler) {
    const newIcerik = plainTextToHtml(row.icerik);
    if (newIcerik !== row.icerik) {
      updateEtkinlik.run(newIcerik, row.id);
      updated++;
    }
  }
})();

console.log(`✓ etkinlikler: ${updated} kayıt güncellendi`);
