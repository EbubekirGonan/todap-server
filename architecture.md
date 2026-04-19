# TODAP Sunucu — Mimari Belgesi

> Bu belge projenin tam mimarisini tanımlar. Her geliştirme öncesinde bu dosyaya bakılmalıdır.

---

## Genel Bakış

| Özellik       | Değer                                              |
|---------------|----------------------------------------------------|
| Proje         | TODAP — Toplumsal Dayanışma İçin Psikologlar Derneği |
| Stack         | Node.js · Express · better-sqlite3 · vanilla JS    |
| Veritabanı    | SQLite (`data/todap.db`)                           |
| Port (varsayılan) | `3001` (`.env` ile değiştirilebilir)           |
| Başlatma      | `npm start` (prod) · `npm run dev` (watch modu)    |

---

## Klasör / Dosya Yapısı

```
todap-server/
├── server.js              # Express app giriş noktası
├── db.js                  # SQLite bağlantısı, tablo tanımları, seed verisi
├── package.json           # Bağımlılıklar ve npm scriptleri
├── .env                   # Ortam değişkenleri (git'e dahil değil)
├── .env.example           # .env şablonu
├── .copilotignore         # Copilot'ın taramasına gerek olmayan dosyalar
├── architecture.md        # Bu dosya — proje mimarisi
├── progress.md            # Geliştirme kayıtları
│
├── data/
│   └── todap.db           # SQLite veritabanı dosyası (git'e dahil değil)
│
├── middleware/
│   └── auth.js            # Admin oturum guard'ı (requireAdmin)
│
├── routes/
│   ├── api.js             # Halka açık API endpoint'leri
│   └── admin.js           # Admin CRUD endpoint'leri (auth gerektirir)
│
├── scripts/
│   └── hash-password.js   # Admin şifresi bcrypt hash üreticisi
│
└── public/                # Statik dosyalar — Express tarafından servis edilir
    ├── index.html         # Ana SPA (tüm frontend sayfaları tek dosyada)
    ├── app.js             # Frontend JS — API çağrıları, sayfa yönlendirme
    ├── shared.css         # Ortak CSS (admin hariç sayfalar için)
    └── admin/
        └── index.html     # Admin paneli SPA (ayrı CSS ve JS içerir)
```

---

## Veritabanı Şeması

### `haberler`
| Sütun             | Tip     | Açıklama                                  |
|-------------------|---------|-------------------------------------------|
| id                | INTEGER | PK, AUTOINCREMENT                         |
| slug              | TEXT    | UNIQUE, URL kimliği                       |
| baslik            | TEXT    | Başlık                                    |
| ozet              | TEXT    | Kısa ozet (liste görünümü için)           |
| ozet_icerik       | TEXT    | Özet HTML içerik (liste/önizleme)         |
| detayli_icerik    | TEXT    | Tam HTML içerik (detay sayfası)           |
| tarih             | TEXT    | ISO tarih (YYYY-MM-DD) — sıralama         |
| gosterim_tarihi   | TEXT    | Görsel tarih metni                        |
| kategori          | TEXT    | Bildiri / Rapor / vb.                     |
| renk              | TEXT    | `r`=kırmızı, `g`=yeşil, ``=varsayılan    |
| aktif             | INTEGER | 1=yayında, 0=gizli                        |
| olusturuldu       | TEXT    | datetime('now')                           |

> **Not:** `icerik` sütunu `ozet_icerik` + `detayli_icerik` olarak ayrıldı (Üçüncü Oturum).

### `etkinlikler`
| Sütun             | Tip     | Açıklama                          |
|-------------------|---------|-----------------------------------|
| id                | INTEGER | PK, AUTOINCREMENT                 |
| slug              | TEXT    | UNIQUE                            |
| baslik            | TEXT    |                                   |
| ozet              | TEXT    |                                   |
| icerik            | TEXT    | HTML                              |
| tarih             | TEXT    | ISO tarih — sıralama için         |
| gosterim_tarihi   | TEXT    |                                   |
| gun               | TEXT    | Gün numarası (örn. "12")          |
| ay                | TEXT    | Ay kısaltması (örn. "Ara")        |
| kategori          | TEXT    |                                   |
| aktif             | INTEGER |                                   |
| olusturuldu       | TEXT    |                                   |

### `birimler`
| Sütun  | Tip     |
|--------|---------|
| id     | INTEGER |
| no     | TEXT    | Birim numarası (örn. "01")
| baslik | TEXT    |
| ozet   | TEXT    |
| icerik | TEXT    | HTML
| aktif  | INTEGER |
| sira   | INTEGER | Sıralama

### `yayinlar`
| Sütun  | Tip  |
|--------|------|
| id     | INTEGER |
| baslik | TEXT |
| ozet   | TEXT |
| tur    | TEXT | "Süreli Yayın", "Kılavuz · PDF", vb.
| url    | TEXT |
| aktif  | INTEGER |

### `ticker_items`
| Sütun  | Tip  |
|--------|------|
| id     | INTEGER |
| etiket | TEXT |
| metin  | TEXT |
| sira   | INTEGER |

### `mesajlar` (İletişim formu)
| Sütun       | Tip  |
|-------------|------|
| id          | INTEGER |
| isim        | TEXT |
| eposta      | TEXT |
| konu        | TEXT |
| mesaj       | TEXT |
| olusturuldu | TEXT |

### `basvurular` (Üyelik formu)
| Sütun       | Tip  |
|-------------|------|
| id          | INTEGER |
| ad          | TEXT |
| soyad       | TEXT |
| eposta      | TEXT |
| telefon     | TEXT |
| meslek      | TEXT |
| alan        | TEXT |
| sehir       | TEXT |
| neden       | TEXT |
| olusturuldu | TEXT |

### `sabit_sayfalar`
| Sütun      | Tip  | Açıklama                             |
|------------|------|--------------------------------------|
| id         | INTEGER | PK, AUTOINCREMENT               |
| kategori   | TEXT    | UNIQUE, sayfa tanımlayıcı       |
| baslik     | TEXT    | Sayfa başlığı                   |
| icerik     | TEXT    | HTML içerik                     |
| guncelleme | TEXT    | datetime('now')                 |

### `faaliyetler`
| Sütun      | Tip  |
|------------|------|
| id         | INTEGER |
| baslik     | TEXT |
| ozet       | TEXT |
| icerik     | TEXT |
| crdate     | TEXT |
| guncelleme | TEXT |

### `basinda_todap`
| Sütun           | Tip  | Açıklama                   |
|-----------------|------|----------------------------|
| id              | INTEGER | PK, AUTOINCREMENT      |
| baslik          | TEXT    | Haber başlığı          |
| adres_ismi      | TEXT    | Yayın adı / kurum adı  |
| baglanti_adresi | TEXT    | Dış URL                |
| crdate          | TEXT    | datetime('now')        |
| guncelleme      | TEXT    | datetime('now')        |

### `videos`
| Sütun              | Tip     | Açıklama                      |
|--------------------|---------|-------------------------------|
| id                 | INTEGER | PK, AUTOINCREMENT             |
| baslik             | TEXT    | Video başlığı                 |
| aciklama           | TEXT    | Kısa açıklama                 |
| video_url          | TEXT    | YouTube veya tam video URL    |
| thumbnail_url      | TEXT    | Kapak görseli URL             |
| yayinlanma_tarihi  | TEXT    | Yayın tarihi (date('now'))    |
| aktif              | INTEGER | 1=yayında, 0=gizli            |
| olusturma_tarihi   | TEXT    | datetime('now')               |
| guncelleme_tarihi  | TEXT    | datetime('now')               |

---

## API Endpoint'leri

### Halka Açık (`/api/*` — `routes/api.js`)

| Method | Endpoint               | Açıklama                      |
|--------|------------------------|-------------------------------|
| GET    | `/api/haberler`        | Aktif haberler (tarih DESC)   |
| GET    | `/api/haberler/:slug`  | Tekil haber                   |
| GET    | `/api/etkinlikler`     | Aktif etkinlikler             |
| GET    | `/api/etkinlikler/:slug` | Tekil etkinlik              |
| GET    | `/api/birimler`        | Birimler (sira ASC)           |
| GET    | `/api/yayinlar`        | Yayınlar                      |
| GET    | `/api/ticker`          | Ticker öğeleri                |
| GET    | `/api/videos`          | Aktif videolar                |
| POST   | `/api/iletisim`        | İletişim formu gönder         |
| POST   | `/api/uyelik`          | Üyelik başvurusu gönder       |

### Admin (`/api/admin/*` — `routes/admin.js`) — Oturum Gerektirir

| Method | Endpoint                    | Açıklama                       |
|--------|-----------------------------|--------------------------------|
| POST   | `/api/admin/login`          | Giriş (session oluşturur)      |
| POST   | `/api/admin/logout`         | Çıkış                          |
| GET    | `/api/admin/me`             | Oturum kontrolü                |
| GET/POST/PUT/DELETE | `/api/admin/haberler[/:id]` | Haber CRUD       |
| GET/POST/PUT/DELETE | `/api/admin/etkinlikler[/:id]` | Etkinlik CRUD   |
| GET/POST/PUT/DELETE | `/api/admin/birimler[/:id]` | Birim CRUD       |
| GET/POST/PUT/DELETE | `/api/admin/yayinlar[/:id]` | Yayın CRUD       |
| GET/POST/PUT/DELETE | `/api/admin/ticker[/:id]`  | Ticker CRUD       |
| GET/POST/PUT/DELETE | `/api/admin/basinda-todap[/:id]` | Basında TODAP CRUD |
| GET/POST/PUT/DELETE | `/api/admin/videos[/:id]`   | Video CRUD             |
| GET    | `/api/admin/mesajlar`       | İletişim mesajları             |
| GET    | `/api/admin/basvurular`     | Üyelik başvuruları             |

---

## Frontend Mimarisi (`public/`)

### `index.html` — Ana SPA
- **Tüm sayfalar tek HTML dosyasında**, `.pv` class'lı div'ler ile gizlenir/gösterilir
- Aktif sayfa `.on` class'ı ile görünür olur
- Sayfalar: `p-home`, `p-haber`, `p-etkinlik`, `p-haberler`, `p-etkinlikler`, `p-uyelik`, `p-iletisim`
- **İnline CSS** — `shared.css` kullanmaz, kendi `<style>` bloğu vardır

### `app.js` — Frontend Mantığı
- `initApp()` — tüm API'lerden veri çeker, bileşenleri oluşturur
- `go(page)` — sayfa geçişi (`.pv` class'larını toggle eder)
- `goHome()` — ana sayfaya dön
- `goToSection(id)` — sayfa içi kaydırma
- `toggleMobileMenu()` / `closeMobileMenu()` — mobil hamburger menü
- `article(slug)` / `etkinlik(slug)` — detay sayfası açma
- `buildHeroLive()` — hero alanında haber+etkinlik arasında en güncel içeriği gösterir
    - Seçim kuralı: önce `tarih`, eşitlikte `olusturuldu`, sonra `id`
    - Amaç: hero-live alanında "son tarihli" gönderiyi deterministik biçimde göstermek
- `buildTicker()`, `buildFeaturedHaberler()`, `buildFeaturedEtkinlikler()` — bileşen render
- `buildHaberlerList()`, `buildEtkinliklerList()` — liste sayfaları
- `formOK(event, successId)` — form POST + başarı gösterimi
- `esc(str)` — XSS önleme (HTML kaçış)

### `shared.css` — Ortak Stiller
- Admin olmayan sayfalar tarafından kullanılır
- Bileşenler: nav, ticker, page-hero, main, cards, forms, footer
- Responsive: 768px, 480px, 360px breakpoint'leri

### `admin/index.html` — Admin SPA
- Kendi inline CSS ve JS'i var, `shared.css` kullanmaz
- Login ekranı (`#login-screen`) ve uygulama (`#app`) aynı dosyada
- Sidebar navigasyon, sayfalar: dashboard, haberler, etkinlikler, birimler, yayınlar, ticker, videolar, mesajlar, basvurular
- Logo gösterimi: `TOD<span>AP</span>` HTML metni CSS ile gizlenir (`font-size:0; color:transparent`), yerine `background:url('/logo.png')` gösterilir

---

## Tasarım Sistemi

### Renk Değişkenleri (`--` CSS custom properties)
| Değişken         | Değer       | Açıklama                          |
|------------------|-------------|-----------------------------------|
| `--accent`       | `#8fb8cc`   | Birincil vurgu rengi              |
| `--accent-deep`  | `#4f7d96`   | Koyu vurgu (butonlar, aktif)      |
| `--accent-light` | `#eef6fa`   | Pastel arka plan                  |
| `--bg`           | `#ffffff`   | Sayfa arka planı                  |
| `--surface`      | `#f8fafc`   | Kart/panel arka planı             |
| `--border`       | `#dbe5ee`   | Kenarlık rengi                    |
| `--ink`          | `#111827`   | Ana metin rengi                   |
| `--burgundy`     | alias → `--accent-deep` | Geriye dönük uyumluluk |
| `--mustard`      | alias → `--accent-deep` | Geriye dönük uyumluluk |
| `--cream`        | `#f8fafc`   | Geriye dönük uyumluluk            |

### Font Sistemi
| Kullanım    | Font                | Kaynak        |
|-------------|---------------------|---------------|
| Başlıklar   | Plus Jakarta Sans   | Google Fonts  |
| Gövde metni | Inter               | Google Fonts  |

> Önceki fontlar (Syne, Lora) tamamen kaldırılmıştır.

---

## Güvenlik

- Admin şifresi `.env` içinde **bcrypt hash** olarak saklanır (`ADMIN_PASSWORD_HASH`)
- Oturum yönetimi `express-session` ile yapılır
- Tüm admin route'ları `middleware/auth.js` (requireAdmin) ile korunur
- Form girişleri `String(...).slice(0, N)` ile boyut sınırlıdır
- Frontend'de `esc()` fonksiyonu XSS'e karşı HTML escape uygular
- Session cookie: `httpOnly: true`, production'da `secure: true`

---

## Ortam Değişkenleri (`.env`)

```env
PORT=3001
SESSION_SECRET=<rastgele uzun string>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<npm run hash ile üret>
```

---

## Seed Verisi

`db.js` içindeki `seedIfEmpty()` fonksiyonu, `haberler` tablosu boşsa otomatik örnek veri ekler:
- 5 haber (Yargı paketi, LGBTİ+, Kuyu hapishaneler, Aslı Aydemir, Serbest meslek)
- 3 etkinlik (Eleştirel Psikoloji Dersliği, 1 Mayıs, Sempozyum)
- 4 birim
- 2 yayın + 2 PDF kılavuz

---

## Bağımlılıklar

| Paket            | Versiyon | Kullanım                              |
|------------------|----------|---------------------------------------|
| express          | ^4.18.2  | HTTP sunucusu, routing                |
| better-sqlite3   | ^9.4.3   | SQLite veritabanı (senkron API)       |
| bcryptjs         | ^2.4.3   | Admin şifre hash/verify               |
| express-session  | ^1.17.3  | Oturum yönetimi                       |
| dotenv           | ^16.4.5  | `.env` dosyasını yükler               |
