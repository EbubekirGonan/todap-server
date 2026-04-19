'use strict';
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Turkish month mapping
const turkishMonths = {
  'Ocak': '01',
  'Şubat': '02',
  'Mart': '03',
  'Nisan': '04',
  'Mayıs': '05',
  'Haziran': '06',
  'Temmuz': '07',
  'Ağustos': '08',
  'Eylül': '09',
  'Ekim': '10',
  'Kasım': '11',
  'Aralık': '12'
};

// Parse Turkish date "29 Ekim 2025" → { day, month, year, iso, display }
function parseDate(dateStr) {
  const parts = dateStr.trim().split(' ');
  if (parts.length !== 3) return null;
  
  const day = parts[0].padStart(2, '0');
  const monthName = parts[1];
  const year = parts[2];
  
  const monthNum = turkishMonths[monthName];
  if (!monthNum) return null;
  
  return {
    iso: `${year}-${monthNum}-${day}`, // 2025-10-29
    display: dateStr, // 29 Ekim 2025
    gun: day,
    ay: monthName
  };
}

// Create slug from title (remove Turkish chars, lowercase, hyphenate)
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// Extract first 150 chars as summary
function createOzet(content) {
  return content.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
}

// Extract keywords from content (simple: split by spaces, filter common words)
function createKeywords(title, content) {
  const stopwords = new Set(['ve', 'ya', 'bu', 'ki', 'için', 'ile', 'den', 'de', 'da', 'var', 'yok', 'ben', 'sen', 'o', 'biz', 'siz', 'onlar', 'bir', 'iki', 'üç', 'daha', 'çok', 'az', 'her', 'hiç', 'ne', 'nedir', 'kimdir', 'ne', 'nasıl', 'nereye', 'nereden', 'kaç', 'hangi', 'kimin', 'neyin', 'işte', 'hani', 'demek', 'olur', 'olmak', 'olan', 'olmayan', 'olacak', 'olmuş', 'olması', 'oluş']);
  
  const text = `${title} ${content}`.toLowerCase();
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

// Determine category for news
function getNewsCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('lgbti') || text.includes('cinsiyet')) return { kategori: 'Bildiri', renk: 'r' };
  if (text.includes('yargı') || text.includes('hak') || text.includes('hukuk')) return { kategori: 'İnsan Hakları', renk: 'r' };
  if (text.includes('dava') || text.includes('meslek')) return { kategori: 'Savunuculuk', renk: '' };
  if (text.includes('dayanışma')) return { kategori: 'Dayanışma', renk: '' };
  
  return { kategori: 'Bildiri', renk: '' };
}

// Parse .txt file
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

// MAIN TEST: Load first news file
const newsDir = path.join(__dirname, '../basin_aciklamalari');
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.txt')).sort();

if (files.length === 0) {
  console.error('❌ No .txt files found in basin_aciklamalari/');
  process.exit(1);
}

const testFile = path.join(newsDir, files[0]);
const { baslik, tarih, icerik } = parseFile(testFile);
const dateInfo = parseDate(tarih);
const slug = createSlug(baslik);
const ozet = createOzet(icerik);
const keywords = createKeywords(baslik, icerik);
const { kategori, renk } = getNewsCategory(baslik, icerik);

console.log('\n' + '='.repeat(80));
console.log('📰 TEST HABER KAYDI');
console.log('='.repeat(80));
console.log(`\n🔗 Dosya: ${files[0]}`);
console.log(`\n📝 Slug: ${slug}`);
console.log(`\n📌 Başlık: ${baslik}`);
console.log(`\n🗓️  Tarih: ${tarih}`);
console.log(`   → ISO: ${dateInfo.iso}`);
console.log(`   → Display: ${dateInfo.display}`);
console.log(`   → Gun: ${dateInfo.gun}, Ay: ${dateInfo.ay}`);
console.log(`\n🏷️  Kategori: ${kategori} (renk: "${renk}")`);
console.log(`\n📎 Özet:\n   ${ozet}`);
console.log(`\n🔑 Anahtar Kelimeler:\n   ${keywords}`);
console.log(`\n💬 İçerik (ilk 200 char):\n   ${icerik.slice(0, 200)}...`);

// Show SQL INSERT statement
const db = require('../db');
const insertSQL = `
INSERT INTO haberler (slug, baslik, ozet, detayli_icerik, tarih, gosterim_tarihi, kategori, renk, keywords)
VALUES (
  '${slug}',
  '${baslik.replace(/'/g, "''")}',
  '${ozet.replace(/'/g, "''")}',
  '${icerik.replace(/'/g, "''")}',
  '${dateInfo.iso}',
  '${dateInfo.display}',
  '${kategori}',
  '${renk}',
  '${keywords.replace(/'/g, "''")}'
);
`;

console.log(`\n📤 INSERT STATEMENT:\n`);
console.log(insertSQL);

console.log('\n' + '='.repeat(80));
console.log('✅ Bu kaydı kontrol edin. Uygunsa, ben kalan tüm haberleri ekleyeceğim.');
console.log('='.repeat(80) + '\n');
