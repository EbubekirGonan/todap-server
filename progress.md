# TODAP — Geliştirme Kayıtları

> Her oturumda yapılan değişiklikler buraya eklenir.  
> Yeni bir gelişme yaparken önce bu dosyayı oku, sonra sonuna ekle.

---

## [2026-04-12] — İlk Oturum: Proje Kurulumu + Mobil Duyarlılık

### Projenin Başlangıç Durumu
- Express + better-sqlite3 + bcryptjs tabanlı tam çalışan sunucu
- Ana SPA (`public/index.html`) ve Admin SPA (`public/admin/index.html`) mevcut
- Temel responsive kurallar vardı ama eksikti:
  - `html`/`body`'de `overflow-x:hidden` yoktu → sağda boşluk sorunu
  - 768px altında nav tamamen gizleniyordu, hamburger menü yoktu
  - İletişim sayfasındaki iki sütunlu grid (`1fr 260px`) saturda inline style ile tanımlıydı, mobil breakpoint yoktu
  - 480px ve 360px için hiç breakpoint yoktu
  - `shared.css`'te responsive kural yoktu

### Yapılan Değişiklikler

#### `public/index.html`
- `html` ve `body`'e `overflow-x:hidden` eklendi (sağ boşluk sorunu giderildi)
- **Hamburger butonu** eklendi: nav'ın sağına 3-çizgi animasyonlu buton (masaüstünde `display:none`)
- **`.mobile-nav`** dropdown panel eklendi: viewport altına sabitlenmiş, tüm nav linkleri içeriyor, `Üye Ol` CTA öne çıkarıldı
- **`@media(max-width:768px)`** güncellendi: hamburger göster, nav padding küçüt, hero padding düzelt
- **`@media(max-width:480px)`** eklendi: hero font 38px, CTA butonlar full-width ve dikey, footer tek sütun
- **`@media(max-width:360px)`** eklendi: ultra küçük cihazlar için 32px hero, minimal padding
- `.iletisim-grid` CSS class'ı eklendi (eski inline `grid-template-columns:1fr 260px` style kaldırıldı) → 768px altında tek sütuna düşer

#### `public/app.js`
- `go()` fonksiyonuna `closeMobileMenu()` çağrısı eklendi (sayfa değişince menü kapanır)
- `toggleMobileMenu()` — hamburger açma/kapama, animasyon sınıfı toggle
- `closeMobileMenu()` — menüyü kapatan yardımcı fonksiyon

#### `public/shared.css`
- `@media(max-width:768px)` eklendi: nav/hero/footer/main padding küçüt, footer 2 sütun
- `@media(max-width:480px)` eklendi: footer tek sütun, card-grid tek sütun, daha küçük padding
- `@media(max-width:360px)` eklendi: minimal padding

#### Proje Belgesi Dosyaları (bu oturum)
- `architecture.md` oluşturuldu — tam proje mimarisi, şema, API tablosu
- `progress.md` oluşturuldu — bu dosya
- `.copilotignore` oluşturuldu — gereksiz klasörlerin taranmaması için

### Test Edilen Boyutlar
- 360px (Galaxy S8 vb.) ✓
- 390px (iPhone 14) ✓
- 414px (iPhone Plus) ✓
- 480px (küçük tablet) ✓
- 768px (iPad dikey) ✓

---

<!-- Yeni oturumlar aşağıya eklenecek -->

---

## [2026-04-13] — Dördüncü Oturum: Videolar Modülü + doLogin Düzeltmesi + Logo + Tam Görsel Yeniden Tasarım

### 1. Videolar Modülü

#### `db.js`
- `videos` tablosu eklendi: `id`, `baslik`, `aciklama`, `video_url`, `thumbnail_url`, `yayinlanma_tarihi`, `aktif`, `olusturma_tarihi`, `guncelleme_tarihi`

#### `routes/admin.js`
- `/api/admin/videos` için tam CRUD endpoint'leri eklendi (GET, POST, PUT, DELETE)

#### `routes/api.js`
- `/api/videos` halka açık GET endpoint'i eklendi

#### `public/app.js`
- `getYoutubeId(url)` — YouTube URL'den video ID çıkarır
- `getYoutubeEmbed(url)` — embed URL döndürür
- `getYoutubeThumbnail(url)` — thumbnail URL döndürür
- `loadVideolar()` — API'den videoları çeker ve listeleri oluşturur
- `openVideo(url)` — modal iframe'de video açar

#### `public/admin/index.html`
- Sidebar'a "Videolar" nav öğesi eklendi
- Video yönetim arayüzü (liste, form, CRUD butonları) eklendi

---

### 2. `doLogin` ReferenceError Düzeltmesi (`public/admin/index.html`)

**Kök neden:** `saveBasinda` fonksiyonundan sonra 3 adet saçak satır (`showToast('Hata...')`, `}`, `}`) tüm `<script>` bloğunun parse edilmesini engelliyordu.

**Yapılan düzeltmeler:**
- 3 saçak satır kaldırıldı
- `onclick="doLogin()"` → `document.getElementById('login-btn').addEventListener('click', doLogin)` olarak değiştirildi
- `onkeydown=` inline handler → `addEventListener('keydown', ...)` olarak değiştirildi

---

### 3. Navbar Logo Değişikliği

**Önceki durum:** Navbar'da `TOD<span>AP</span>` metni

**Yapılan değişiklikler (`public/index.html` ve `public/shared.css`):**
- `.nav-logo` içindeki metin kaldırıldı, yerine `<img src="/logo.png" alt="TODAP">` konuldu
- `.nav-logo img` CSS kuralı eklendi: `height:32px; width:auto; display:block`

---

### 4. Tam Görsel Yeniden Tasarım (Bordo/Hardal → Beyaz/Pastel)

#### Renk Sistemi Değişikliği
| Eski | Yeni |
|------|------|
| `#7a1f2e` (bordo) | `#4f7d96` (pastel mavi-gri) |
| `#c9872b` (hardal) | `#8fb8cc` (açık mavi) |
| Koyu nav/footer | Beyaz nav, açık gri footer |
| Beyaz metin | Koyu mürekkep metin (`#111827`) |
| Koyu hero arka planı | Açık degrade hero |

#### Font Sistemi Değişikliği
| Eski | Yeni |
|------|------|
| Syne (başlık) | Plus Jakarta Sans (başlık) |
| Lora (metin) | Inter (metin) |

#### `public/shared.css`
- En üste `@import` eklendi: Plus Jakarta Sans + Inter (Google Fonts)
- Yeni `:root` değişkenleri: `--accent:#8fb8cc`, `--accent-deep:#4f7d96`, `--accent-light:#eef6fa`, `--bg:#ffffff`, `--ink:#111827`
- Geriye dönük uyumluluk takma adları: `--burgundy`, `--mustard`, `--cream`, `--warm-white` → pastel değerlere işaret ediyor
- Nav: beyaz + `border-bottom` (eski: koyu bordo)
- Footer: `var(--surface)` açık gri (eski: siyah)
- Kartlar: `border-radius:8px`, beyaz + yumuşak gölge, hover vurgu kenarlığı

#### `public/index.html` (inline CSS tamamı yeniden yazıldı)
- `<link>` etiketi: Syne/Lora → Plus Jakarta Sans + Inter
- Hero: açık degrade arka plan (eski: koyu bordo)
- Navbar: beyaz + kenarlık (eski: koyu bordo sabit)
- Ticker: `--accent-light` arka plan + koyu metin (eski: hardal + beyaz)
- Footer: açık gri (eski: siyah)
- Mobil nav: beyaz (eski: koyu bordo)
- Dropdown menüler: beyaz + kutu gölgesi (eski: koyu bordo)

#### `public/admin/index.html` (inline CSS tamamı yeniden yazıldı)
- `<link>` etiketi: Syne/Lora → Plus Jakarta Sans + Inter
- Yeni `:root`: `--bg:#f5f8fb`, `--surface:#ffffff`, `--border:#dbe5ee`, `--text:#111827`
- Login logosu: CSS `background:url('/logo.png') no-repeat left center/contain` + `color:transparent; font-size:0`
- Sidebar logosu: aynı CSS trick ile logo.png gösterimi
- Login kutusu: beyaz kart + gölge (eski: koyu)
- Sidebar: beyaz, açık kenarlıklar, pastel aktif durum
- Quill editör: açık tema (eski: koyu)
- Tüm buton, modal, form, istatistik kartları güncellendi

### Doğrulama
- `get_errors` → 3 dosyada da hata yok
- `grep` → Syne, Lora, `#7a1f2e`, `#c9872b` hiçbir dosyada yok

---

## [2026-04-12] — İkinci Oturum: Hero Metni + Navbar + GitHub

### Yapılan Değişiklikler

#### `public/index.html`
- Hero başlığı değiştirildi: `"Dayanışma / psikoloji ile başlar"` → `"Psikoloji toplum için, / psikologlar birlikte"`
- Hero `h1` font boyutu küçültüldü: `clamp(52px,9vw,120px)` → `clamp(32px,5.2vw,72px)` (uzun metin taşmasın diye)
- Responsive breakpoint font boyutları güncellendi: 768px→40px, 480px→30px, 360px→26px
- `nav` `position:sticky` → `position:fixed` olarak değiştirildi + `transition:opacity .35s,transform .35s` eklendi
- `nav.nav-hidden` class'ı eklendi: `opacity:0; transform:translateY(-100%); pointer-events:none`
- `body`'e `padding-top:56px` eklendi (fixed nav altındaki içerik üste kaymıyor)
- `.hero-wrap` yüksekliği: `88vh` → `calc(100vh - 56px)` (navbar yüksekliği hesaba katıldı, ticker artık ekranda)

#### `public/app.js`
- **Navbar scroll davranışı** eklendi (IIFE, `requestAnimationFrame` tabanlı):
  - `THRESHOLD=80px`: sayfanın üstüne yakınken navbar her zaman görünür
  - Aşağı scroll: `nav-hidden` class'ı eklenir → navbar soluklaşıp yukarı kayar
  - Yukarı scroll: `nav-hidden` kaldırılır → navbar geri döner
  - Aşağı kaydırırken mobil menü otomatik kapanır
  - `TOLERANCE=6px`: titreme / anlık tepkileri engeller

#### Git & GitHub
- `git init` + ilk commit (17 dosya)
- `gh repo create` ile public repo oluşturuldu ve push yapıldı
- Repo: https://github.com/EbubekirGonan/todap-server

---

## [2026-04-12] — Üçüncü Oturum: haberler Tablo Şema Değişikliği

### Özet
`haberler` tablosundaki `icerik` sütunu `ozet_icerik` olarak yeniden adlandırıldı; ayrı bir `detayli_icerik` sütunu eklendi. `etkinlikler` ve `birimler` tablolarındaki `icerik` sütunları değiştirilmedi.

### Yapılan Değişiklikler

#### `data/todap.db`
- `ALTER TABLE haberler RENAME COLUMN icerik TO ozet_icerik;`
- `ALTER TABLE haberler ADD COLUMN detayli_icerik TEXT DEFAULT '';`

#### `db.js`
- `CREATE TABLE IF NOT EXISTS haberler` şeması güncellendi: `icerik` → `ozet_icerik` + yeni `detayli_icerik TEXT DEFAULT ''`
- `INSERT INTO haberler` prepared statement güncellendi
- 5 seed kaydının tamamı yeni sütun adlarına taşındı

#### `routes/admin.js`
- `POST /api/admin/haberler`: destructuring ve INSERT sorgusu `ozet_icerik` + `detayli_icerik` kullanacak şekilde güncellendi
- `PUT /api/admin/haberler/:id`: destructuring ve UPDATE sorgusu güncellendi

#### `public/app.js`
- `renderArticle()`: `d.icerik` → `d.ozet_icerik || d.detayli_icerik || ''`

#### `public/admin/index.html`
- Form'da `haber-icerik` textarea → `haber-ozet-icerik` (label: "Özet İçerik (HTML)")
- Yeni `haber-detayli-icerik` textarea eklendi (label: "Detaylı İçerik (HTML)")
- `editHaber()`: `d.icerik` → `d.ozet_icerik` + `d.detayli_icerik` ayrı ayrı set ediliyor
- `resetHaberForm()`: dizi güncellendi
- `saveHaber()`: içerik zorunluluk kontrolü kaldırıldı; body'de `ozet_icerik` + `detayli_icerik` gönderiliyor

