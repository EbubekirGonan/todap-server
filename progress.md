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
