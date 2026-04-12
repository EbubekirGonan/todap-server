'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'todap.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Tablolar ────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS haberler (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    slug             TEXT UNIQUE NOT NULL,
    baslik           TEXT NOT NULL,
    ozet             TEXT DEFAULT '',
    ozet_icerik      TEXT DEFAULT '',
    detayli_icerik   TEXT DEFAULT '',
    tarih            TEXT DEFAULT '',
    gosterim_tarihi  TEXT DEFAULT '',
    kategori         TEXT DEFAULT 'Bildiri',
    renk             TEXT DEFAULT '',
    aktif            INTEGER DEFAULT 1,
    olusturuldu      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS etkinlikler (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    slug             TEXT UNIQUE NOT NULL,
    baslik           TEXT NOT NULL,
    ozet             TEXT DEFAULT '',
    icerik           TEXT DEFAULT '',
    tarih            TEXT DEFAULT '',
    gosterim_tarihi  TEXT DEFAULT '',
    gun              TEXT DEFAULT '—',
    ay               TEXT DEFAULT '?',
    kategori         TEXT DEFAULT 'Etkinlik',
    aktif            INTEGER DEFAULT 1,
    olusturuldu      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS birimler (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    no      TEXT DEFAULT '',
    baslik  TEXT NOT NULL,
    ozet    TEXT DEFAULT '',
    icerik  TEXT DEFAULT '',
    aktif   INTEGER DEFAULT 1,
    sira    INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS yayinlar (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    baslik  TEXT NOT NULL,
    ozet    TEXT DEFAULT '',
    tur     TEXT DEFAULT '',
    url     TEXT DEFAULT '',
    aktif   INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS ticker_items (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    etiket  TEXT NOT NULL,
    metin   TEXT NOT NULL,
    sira    INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS mesajlar (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    isim        TEXT,
    eposta      TEXT,
    konu        TEXT,
    mesaj       TEXT,
    olusturuldu TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS basvurular (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ad          TEXT,
    soyad       TEXT,
    eposta      TEXT,
    telefon     TEXT,
    meslek      TEXT,
    alan        TEXT,
    sehir       TEXT,
    neden       TEXT,
    olusturuldu TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sabit_sayfalar (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    kategori    TEXT UNIQUE NOT NULL,
    baslik      TEXT NOT NULL,
    icerik      TEXT NOT NULL,
    guncelleme  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS faaliyetler (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    baslik      TEXT NOT NULL,
    ozet        TEXT DEFAULT '',
    icerik      TEXT DEFAULT '',
    crdate      TEXT DEFAULT (datetime('now')),
    guncelleme  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS basinda_todap (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    baslik          TEXT NOT NULL,
    adres_ismi      TEXT DEFAULT '',
    baglanti_adresi TEXT DEFAULT '',
    crdate          TEXT DEFAULT (datetime('now')),
    guncelleme      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS videos (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    baslik           TEXT NOT NULL,
    aciklama         TEXT DEFAULT '',
    video_url        TEXT DEFAULT '',
    thumbnail_url    TEXT DEFAULT '',
    yayinlanma_tarihi TEXT DEFAULT (date('now')),
    aktif            INTEGER DEFAULT 1,
    olusturma_tarihi TEXT DEFAULT (datetime('now')),
    guncelleme_tarihi TEXT DEFAULT (datetime('now'))
  );
`);

// ── Migrations ───────────────────────────────────────────────
try { db.prepare('ALTER TABLE faaliyetler ADD COLUMN ozet TEXT DEFAULT \'\'').run(); } catch (_) {}


// ── Seed ────────────────────────────────────────────────────
function seedIfEmpty() {
  if (db.prepare('SELECT COUNT(*) as c FROM haberler').get().c > 0) return;

  const insH = db.prepare(`
    INSERT INTO haberler (slug,baslik,ozet,ozet_icerik,detayli_icerik,tarih,gosterim_tarihi,kategori,renk)
    VALUES (@slug,@baslik,@ozet,@ozet_icerik,@detayli_icerik,@tarih,@gosterim_tarihi,@kategori,@renk)
  `);

  db.transaction(() => {
    insH.run({
      slug: 'yargi-paketi',
      baslik: '11. Yargı Paketi Taslağı, Biz Psikologlar İçin Hangi Anlamlara Geliyor?',
      ozet: 'Bu taslak, psikologların insan haklarına saygı, ayrımcılıktan kaçınma ve zarar vermeme ilkeleriyle doğrudan çelişmektedir.',
      ozet_icerik: `<p>Son günlerde kamuoyuna sızan 11. Yargı Paketi taslağı, mesleğimizi doğrudan ilgilendiren düzenlemeler içermektedir.</p><h2>Temel Sorunlar</h2><p>Bu taslak, psikologların temel mesleki yükümlülükleriyle doğrudan çelişmektedir:</p><ul><li><strong>İnsan haklarına saygı ve savunuculuk</strong></li><li><strong>Ayrımcılıktan kaçınma</strong></li><li><strong>Eşitlik temelinde duyarlılık ve kültürel farkların gözetilmesi</strong></li><li><strong>Zarar vermeme ve özerkliği koruma</strong></li><li><strong>Bilimsel ve güncel bilgi doğrultusunda çalışma</strong></li></ul><h2>TODAP'ın Tutumu</h2><p>Psikologlar olarak danışanlarımızın kimliğini veya ifade özgürlüğünü suç olarak tanımlayan herhangi bir yasal düzenlemeye karşı durmak hem etik hem de mesleki sorumluluğumuzdur.</p><blockquote>Psikoloji pratiği, toplumsal eşitlik ve insan onurundan bağımsız yürütülemez.</blockquote><p><em>— TODAP Yönetim Kurulu</em></p>`,
      detayli_icerik: '',
      tarih: '2025-12-23', gosterim_tarihi: '23 Aralık 2025', kategori: 'Bildiri', renk: 'r'
    });
    insH.run({
      slug: 'lgbti',
      baslik: 'Son Dönemlerde Artan LGBTİ+ ve Toplumsal Cinsiyet Eşitliğine Karşı Politikalar',
      ozet: '11. Yargı Paketi taslağına göre "doğuşta atanan cinsiyete aykırı" davranışlara üç yıla kadar hapis öngörülüyor.',
      ozet_icerik: `<p>11. Yargı Paketi taslağına göre, "doğuşta atanan cinsiyete aykırı" davranışlarda bulunanlara üç yıla kadar hapis cezası öngörülüyor.</p><h2>Psikoloji Perspektifinden</h2><p>Bu düzenleme, psikoloji pratiğini doğrudan etkilemektedir. Psikologlar olarak danışanlarımızın cinsel yönelimini patolojize etmemek temel etik yükümlülüklerimiz arasındadır.</p><p><em>— TODAP Kadın Komisyonu & Yönetim Kurulu</em></p>`,
      detayli_icerik: '',
      tarih: '2025-10-29', gosterim_tarihi: '29 Ekim 2025', kategori: 'Rapor', renk: 'r'
    });
    insH.run({
      slug: 'kuyu',
      baslik: 'Kuyu Tipi Hapishaneler: Tecrit İnsan Haklarını ve Ruh Sağlığını Tehdit Ediyor',
      ozet: 'Hapishanelerde yaşanan hak ihlallerini görünür kılmak, bizim için mesleki ve toplumsal bir sorumluluktur.',
      ozet_icerik: `<p>Uzun süreli tecridin ağır psikolojik sonuçlara yol açtığı araştırmalarla kanıtlanmıştır.</p><h2>Tecridin Etkileri</h2><ul><li>Anksiyete ve depresyonda ciddi artış</li><li>Bilişsel işlevlerde bozulma</li><li>Algı bozuklukları ve halüsinasyonlar</li><li>Post-travmatik stres belirtileri</li></ul><h2>TODAP'ın Talebi</h2><p>Tecrit uygulamalarının derhal sona erdirilmesini talep ediyoruz.</p><p><em>— TODAP Yönetim Kurulu</em></p>`,
      detayli_icerik: '',
      tarih: '2025-09-07', gosterim_tarihi: '7 Eylül 2025', kategori: 'İnsan Hakları', renk: 'g'
    });
    insH.run({
      slug: 'asli',
      baslik: 'Üyemiz, Dostumuz #AslıAydemireÖzgürlük!',
      ozet: 'LeMan\'a saldıranlar değil, toplumsal dayanışmadan yana bir psikolog, bir feminist, bir Barış Akademisyeni tutuklandı.',
      ozet_icerik: `<p>Aslı Aydemir, hiciv dergisi LeMan'a saldırı düzenleyenler değil, toplumsal dayanışmadan yana duran bir psikolog, feminist ve Barış Akademisyeni olarak tutuklandı.</p><h2>Dayanışma Çağrımız</h2><p>Aslı'nın serbest bırakılması için sesimizi yükseltiyoruz.</p><p><strong>#AslıAydemireÖzgürlük</strong></p><p><em>— TODAP Yönetim Kurulu</em></p>`,
      detayli_icerik: '',
      tarih: '2025-07-09', gosterim_tarihi: '9 Temmuz 2025', kategori: 'Dayanışma', renk: ''
    });
    insH.run({
      slug: 'serbest-meslek',
      baslik: 'Yönetmeliğe Karşı Emeğimizi Savunduk, Yürütme Kısmen Durduruldu!',
      ozet: 'Ruh sağlığı emekçileri olarak serbest meslek hakkımızı savunuyoruz!',
      ozet_icerik: `<p>Ruh sağlığı alanında çalışan psikologların serbest meslek hakkını kısıtlayan yönetmelik düzenlenmesine karşı açtığımız davada önemli bir adım atıldı.</p><h2>Dava Süreci</h2><p>Mahkeme, yönetmeliğin ilgili maddelerinin yürütülesini kısmen durdurdu.</p><h2>Mücadele Sürüyor</h2><p>Mücadelemiz devam etmektedir.</p><p><em>— TODAP Psikolog Hakları Danışma Birimi</em></p>`,
      detayli_icerik: '',
      tarih: '2025-07-03', gosterim_tarihi: '3 Temmuz 2025', kategori: 'Savunuculuk', renk: ''
    });
  })();

  const insE = db.prepare(`
    INSERT INTO etkinlikler (slug,baslik,ozet,icerik,tarih,gosterim_tarihi,gun,ay,kategori)
    VALUES (@slug,@baslik,@ozet,@icerik,@tarih,@gosterim_tarihi,@gun,@ay,@kategori)
  `);
  db.transaction(() => {
    insE.run({
      slug: 'derslik',
      baslik: 'Eleştirel Psikoloji Dersliği #3',
      ozet: '10 haftalık kolektif öğrenme programı. Okumalar, tartışmalar ve atölye çalışmaları.',
      icerik: `<p>Farklı temalarda 10 haftalık faaliyetimizde, kolektif bir öğrenme deneyimini hedefliyoruz.</p><h2>Program</h2><ul><li><strong>Süre:</strong> 10 hafta</li><li><strong>Format:</strong> Haftalık oturumlar</li><li><strong>Katılım:</strong> Açık</li></ul><p>Kayıt için iletişim formunu kullanınız.</p>`,
      tarih: '2025-12-12', gosterim_tarihi: '12 Aralık 2025', gun: '12', ay: 'Ara', kategori: 'Eğitim Programı'
    });
    insE.run({
      slug: '1mayis',
      baslik: '1 Mayıs\'ta Alanlardayız!',
      ozet: 'Emekçi psikologlar olarak iş güvencesi ve özgür çalışma hakkı için.',
      icerik: `<p>Emekçi psikologlar olarak iş güvencesi, özgür çalışma hakkı ve tüm emekçilerin hakları için 1 Mayıs'ta meydanlardayız.</p>`,
      tarih: '2026-05-01', gosterim_tarihi: '1 Mayıs 2026', gun: '01', ay: 'May', kategori: 'Eylem'
    });
    insE.run({
      slug: 'sempozyum',
      baslik: 'Eleştirel Psikoloji Sempozyumu',
      ozet: 'Yıllık sempozyum. Bildiri çağrısı ve tarih bilgisi yakında açıklanacak.',
      icerik: `<p>Eleştirel Psikoloji Sempozyumu'nun bu yılki programı hazırlanmaktadır. Bildiri çağrısı ve tarih bilgisi yakında duyurulacaktır.</p>`,
      tarih: '2026-01-01', gosterim_tarihi: '2026', gun: '—', ay: '2026', kategori: 'Sempozyum'
    });
  })();

  const insB = db.prepare(`INSERT INTO birimler (no,baslik,ozet,icerik,sira) VALUES (@no,@baslik,@ozet,@icerik,@sira)`);
  db.transaction(() => {
    insB.run({ no:'01', baslik:'Psikolog Hakları Danışma Birimi', ozet:'Psikologların mesleki ve hukuki haklarını korumak için danışmanlık ve aktif savunuculuk yürütür.', icerik:'<p>Psikolog Hakları Danışma Birimi, mesleki alanda karşılaşılan hak ihlallerine yönelik danışmanlık hizmeti sunar.</p>', sira:1 });
    insB.run({ no:'02', baslik:'Kadın Komisyonu', ozet:'Feminist psikoloji perspektifinden toplumsal cinsiyet eşitliği için araştırma ve eylem üretir.', icerik:'<p>Feminist psikoloji perspektifinden toplumsal cinsiyet eşitliğine yönelik araştırmalar yapar.</p>', sira:2 });
    insB.run({ no:'03', baslik:'Meslek Yasası Komisyonu', ozet:'Psikologlar için yasal güvence sağlayacak bağımsız meslek yasası çıkarılması için çalışır.', icerik:'<p>Türkiye\'de psikologların bağımsız bir meslek yasasına kavuşması için savunuculuk yürütmektedir.</p>', sira:3 });
    insB.run({ no:'04', baslik:'Öğrenci Komisyonu', ozet:'Psikoloji öğrencilerini kolektif öğrenme, dayanışma ve mesleki bilinç etrafında buluşturur.', icerik:'<p>Psikoloji öğrencilerini toplumcu psikoloji perspektifiyle buluşturmak için etkinlikler düzenler.</p>', sira:4 });
  })();

  const insY = db.prepare(`INSERT INTO yayinlar (baslik,ozet,tur,url) VALUES (@baslik,@ozet,@tur,@url)`);
  db.transaction(() => {
    insY.run({ baslik:'Eleştirel Psikoloji Bülteni', ozet:'Psikoloji pratiğine eleştirel bakış. Düzenli olarak yayınlanan bültenimiz.', tur:'Süreli Yayın', url:'http://elestirelpsikolojibulteni.todap.org/' });
    insY.run({ baslik:'Psikoloji ve Toplum Bülteni', ozet:'Psikoloji ile toplumsal meseleler arasındaki ilişkiyi araştıran yayınımız.', tur:'Süreli Yayın', url:'http://psikolojivetoplum.todap.org/' });
    insY.run({ baslik:'LGBTİ\'larla Çalışma Kılavuzu', ozet:'Psikologlar için kapsamlı uygulama rehberi. Ücretsiz indir.', tur:'Kılavuz · PDF', url:'https://todap.org/images/raporlar_brosurler/psikologlar_icin_lgbtilerle_calisma_kilavuzu_TODAP.pdf' });
    insY.run({ baslik:'Meslek Yasası Önerisi Dosyası', ozet:'TODAP\'ın bağımsız meslek yasası önerisi ve detaylı gerekçe raporu.', tur:'Rapor · PDF', url:'https://todap.org/images/raporlar_brosurler/MeslekYasasiDosyasi.pdf' });
  })();

  const insT = db.prepare(`INSERT INTO ticker_items (etiket,metin,sira) VALUES (@etiket,@metin,@sira)`);
  db.transaction(() => {
    insT.run({ etiket:'Yeni', metin:'Eleştirel Psikoloji Dersliği #3 başlıyor', sira:1 });
    insT.run({ etiket:'Bildiri', metin:'11. Yargı Paketi Taslağı ve Mesleki Etik', sira:2 });
    insT.run({ etiket:'Yayın', metin:'LGBTİ+\'larla Çalışma Kılavuzu indirilebilir', sira:3 });
    insT.run({ etiket:'Dava', metin:'Serbest Meslek Hakkı Yürütme Durduruldu', sira:4 });
  })();

  console.log('✓ Veritabanı oluşturuldu ve seed data yüklendi.');
}

// ── sabit_sayfalar seed ──────────────────────────────────
(function seedSabitSayfalar() {
  if (db.prepare('SELECT COUNT(*) as c FROM sabit_sayfalar').get().c > 0) return;

  db.prepare(`
    INSERT INTO sabit_sayfalar (kategori, baslik, icerik) VALUES (?, ?, ?)
  `).run(
    'hakkimizda',
    'Toplumsal Dayanışma için Psikologlar Derneği (TODAP) Kimdir?',
    `<p>Derneğin amacı, psikologların ve psikoloji öğrencilerinin eşitlikçi, özgürlükçü ve kardeşlikten yana bir toplumsal dayanışma ekseninde mesleki örgütlenmesini sağlayarak, psikoloji teori ve pratiğinin eleştirisi ve yeniden üretimi yönünde çalışmalar yapmaktır. TODAP, emekten yana ve toplumcu bir eksende bir araya gelen, çalışan, işsiz ve öğrenci psikologları çatısı altında toplamayı hedefler. Her türlü ayrımcılığa, baskı ve sömürüe karşı ezilenlerden yana ve insan hakları temelinde faaliyet gösterir.</p>
<p>TODAP'ın emek eksenli çalışmaları, psikologların çoğunluğunun üretim ilişkileri içerisindeki konumlarından kaynaklanan deneyimlerini betimlemek, yorumlamak, görünür kılmak üzerine kuruludur. Psikologların çoğunluğu ücretsiz çalışan konumundadır ve güvencesiz çalışma koşulları ve işsizlikle gün geçtikce daha fazla terbiye edilmektedir. TODAP'ın emek eksenli çalışmaların temeli, bu durumun idrak edilmesine ve güvencesiz ve esnek çalışma koşullarına karşı mücadele etmek üzerine temellendirilmiştir.</p>
<p>Psikoloji tarihine bakıldığında, psikolojinin, içinde ortaya çıktığı tarihsel koşullara ve güç ilişkilerine sıkı sıkıya bağlı olduğu ve ideolojik varsayımlar üzerine kurulduğu görülür. TODAP'ın ikinci ekseni psikoloji bilgisinin ve pratiğinin eleştirisini üretmeye odaklanır ve bunu disiplinlerarası bir yaklaşımla yapar.</p>
<p>TODAP, herkes için yaşanabilir bir dünya ve bütünlüklü bir meslek bilgi ve icrası için toplumsal dayanışmayı olmazsa olmaz bir koşul olarak tanımlar. Psikologların toplumun ezilenlerıyle dayanışma içine girerken amaçladıkları, sadece dar anlamıyla toplumsal dayanışma değil, aynı zamanda dönüşen ve dönüştüren bir meslek inşa etmektir. TODAP, psikososyal refahın en temel taşı olan insan hakları mücadelelerini kayıtsız şartsız destekler.</p>
<p>Bu üç eksene ek olarak dernek, psikologların ve psikoloji öğrencilerinin öğrenim görürken veya alanda çalışırken karşılaştıkları hak ihlalleriyle, psikologların ve psikolojinin sebep olduğu hak ihlallerini ve eşitsizlikleri gündeme taşır. Lisans eğitiminin psikolog ünvanıyla istihdam edilmek için yeterli ve nitelikli hale getirilmesi için çalışır ve alanda çalışmak için gerekli kılınan eğitimlerin herkes için erişilebilir olması için çabalar. Bunların yanı sıra, bir sağlık hakkı olarak tanıdığı psikolojik hizmetin eşit, ücretsiz ve anadilde verilmesi için mücadele eder. TODAP bu görüşler ışığında kazanılmış hakları korur, onlara gelebilecek saldırılara karşı mücadele eder, bu hakların ve henüz kazanılmamış olanların savunuculuğunu yapar.</p>`
  );

  console.log('✓ sabit_sayfalar seed yüklendi.');
})()

seedIfEmpty();

module.exports = db;
