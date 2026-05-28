# TODAP Sunucu — Güncel Durum Raporu
**Tarih:** 28 Mayıs 2026

---

## Genel Değerlendirme

Proje temiz ve tutarlı bir yapıya sahip. Mimari doğru, tablolar ve endpoint'ler birbirine uyuyor. Temel SPA + Express + PostgreSQL stack'i sağlam çalışıyor. Ancak production ortamı için güvenlik sertleştirmesi ve bazı eksik parçalar tamamlanması gerekiyor.

---

## Mimari Tutarlılık Kontrolü

| Kontrol | Durum | Not |
|---------|-------|-----|
| Tablo şemaları ↔ `db.js` | ✅ Uyuşuyor | 14 tablo doğrulandı |
| API endpoint'leri ↔ `routes/api.js` | ✅ Uyuşuyor | |
| Admin CRUD ↔ `routes/admin.js` | ✅ Uyuşuyor | |
| `architecture.md` ↔ gerçek kod | ✅ Büyük ölçüde güncel | |
| `haberler.renk` alanı | ⚠️ Belirsiz | Tabloda tanımlı, frontend kullanımı net değil |
| `sabit_sayfalar` admin UI | ⚠️ Eksik | Backend endpoint var, admin panelinde arayüz yok |
| `faaliyetler` tablosu | ⚠️ Eksik | `db.js`'de tablo tanımlı, hiçbir API endpoint'i yok |

---

## Kritik Sorunlar

### 1. Güvenlik

- **Session secret hardcoded** (`server.js`): `'todap-dev-secret-key'` sabit değer olarak yazılmış — production'da `.env`'den (`SESSION_SECRET`) gelmeli.
- **SSL doğrulaması devre dışı** (`db.js`): `rejectUnauthorized: false` — Render.com bağlantısında SSL sertifikası doğrulanmıyor. Render CA sertifikası ile sertleştirilmeli.
- **Rate limiting yok**: `/api/iletisim` ve `/api/uyelik` form endpoint'leri spam ve brute-force'a açık.
- **CSRF token yok**: Form POST'larında CSRF koruması uygulanmıyor.

### 2. Hata Yönetimi

- API 500 hataları generic `"Sunucu hatasi"` dönüyor — hata detayı log'a yazılıyor ama kullanıcıya anlamlı mesaj verilmiyor.
- Frontend'de `Promise.all()` içinde herhangi bir API çağrısı başarısız olursa kullanıcıya hiçbir geri bildirim yapılmıyor (`console.error` ile geçiştiriliyor).
- Admin paneli hata mesajları bazı endpoint'lerde eksik.

---

## Orta Öncelikli Eksikler

### Veritabanı

- **Index yok**: `slug`, `tarih`, `aktif` kolonlarında sorgu performansı için index eklenmeli. Mevcut veri seti küçük, ancak büyüdükçe yavaşlayacak.
- **Foreign key yok**: Tablolar arası referans bütünlüğü veritabanı seviyesinde zorunlu kılınmıyor.
- **Migration sistemi yok**: Şema değişiklikleri `db.js`'e elle yansıtılıyor — `ALTER TABLE` gibi işlemler için formal migration aracı (örn. `node-postgres-migrate` veya `db-migrate`) düşünülmeli.

### Admin Paneli

- **`sabit_sayfalar` yönetimi yok**: Backend endpoint'leri mevcut (`GET/POST/PUT` `/api/admin/sabit-sayfalar`) ama admin arayüzünde bu bölüm yok — içerik düzenlenemiyor.
- **`faaliyetler` modülü eksik**: `db.js`'de tablo tanımlı, `routes/` içinde endpoint yok, admin panelinde arayüz yok.
- **Logout butonu görünürlüğü**: Admin panelinde oturum kapatma işlevinin kullanıcı tarafından kolayca erişilebilir olduğu doğrulanmalı.
- **Dosya yükleme yok**: Video thumbnail, haber görseli gibi medya dosyaları yüklenemiyor — sadece dış URL girişi destekleniyor.
- **Toplu işlem yok**: Çoklu silme, yayına alma gibi batch operasyonları yok.

### Frontend

- **Pagination yok**: `GET /api/haberler` tüm aktif haberleri tek seferde döndürüyor — veri büyüdükçe hem API hem sayfa yüklemesi ağırlaşacak.
- **Arama / filtreleme yok**: Frontend'de de admin panelinde de içerik araması yapılamıyor.
- **Hata mesajları**: API başarısız olduğunda kullanıcı arayüzünde görünür hata gösterimi yok.
- **SEO eksikleri**: `index.html`'de Open Graph ve Twitter Card meta etiketleri yok.

---

## İyi Olan Şeyler

- **SQL adapter pattern** (`db.js`): SQLite → PostgreSQL geçişi için `prepare().get/all/run` arayüzü temiz ve çalışıyor.
- **CSS token sistemi** (`tokens.css` + `shared.css`): Merkezi tasarım değişkenleri, tema değişikliği tek dosyadan yapılabiliyor.
- **Paralel API çağrıları** (`app.js`): `Promise.all()` ile tüm veriler aynı anda çekiliyor — verimli.
- **Session cookie ayarları** (`server.js`): `httpOnly: true`, production'da `secure: true` — doğru yapılandırılmış.
- **XSS koruması** (`app.js`): `esc()` fonksiyonu tüm kullanıcı verilerini HTML escape'liyor.
- **Input boyut sınırı** (`routes/api.js`): Form alanları `.slice(0, N)` ile boyut kısıtlaması yapılıyor.
- **Aktif/pasif kontrolü**: Tüm public endpoint'ler `aktif=1` filtresi uyguluyor.
- **`buildHeroLive()` seçim kuralı**: `tarih → olusturuldu → id` öncelik sırası ile deterministik içerik seçimi.

---

## Öncelik Sıralaması

| Öncelik | Konu | Dosya(lar) |
|---------|------|-----------|
| 🔴 Yüksek | Session secret `.env`'e taşı | `server.js` |
| 🔴 Yüksek | SSL `rejectUnauthorized` düzelt | `db.js` |
| 🔴 Yüksek | Rate limiting ekle | `routes/api.js` |
| 🟠 Orta | `sabit_sayfalar` admin UI | `public/admin/index.html` |
| 🟠 Orta | `faaliyetler` endpoint + admin UI | `routes/api.js`, `routes/admin.js`, `public/admin/index.html` |
| 🟠 Orta | Veritabanı index'leri | `db.js` |
| 🟡 Düşük | Haberler/etkinlikler pagination | `routes/api.js`, `public/app.js` |
| 🟡 Düşük | SEO meta etiketleri | `public/index.html` |
| 🟡 Düşük | Migration sistemi | yeni dosya |
