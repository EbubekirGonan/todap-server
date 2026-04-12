// TODAP Frontend — API tabanlı veri yönetimi
// localStorage yok; tüm veri Express/SQLite'dan gelir

let DATA = { haberler: [], etkinlikler: [], birimler: [], yayinlar: [], ticker: [] };
let haberMap = {};    // slug → haber
let etkinlikMap = {}; // slug → etkinlik

// ── Başlatma ─────────────────────────────────────────────────
async function initApp() {
  try {
    const [haberler, etkinlikler, ticker, birimler, yayinlar] = await Promise.all([
      fetch('/api/haberler').then(r => r.json()),
      fetch('/api/etkinlikler').then(r => r.json()),
      fetch('/api/ticker').then(r => r.json()),
      fetch('/api/birimler').then(r => r.json()),
      fetch('/api/yayinlar').then(r => r.json()),
    ]);

    DATA = { haberler, etkinlikler, ticker, birimler, yayinlar };

    haberMap = {};
    for (const h of haberler) haberMap[h.slug] = h;
    etkinlikMap = {};
    for (const e of etkinlikler) etkinlikMap[e.slug] = e;

    buildTicker();
    buildFeaturedHaberler();
    buildFeaturedEtkinlikler();
    buildHaberlerList();
    buildEtkinliklerList();
  } catch (err) {
    console.error('Veri yüklenemedi:', err);
  }
}

// ── Navigasyon ───────────────────────────────────────────────
function go(page) {
  closeMobileMenu();
  document.querySelectorAll('.pv').forEach(p => p.classList.remove('on'));
  const t = document.getElementById('p-' + page);
  if (t) { t.classList.add('on'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
function goHome() { go('home'); }
function goToSection(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 120);
}

// ── Mobil Menü ───────────────────────────────────────────────
function toggleMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  const btn = document.getElementById('hamburger');
  if (!nav) return;
  nav.classList.toggle('open');
  btn.classList.toggle('open');
}
function closeMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  const btn = document.getElementById('hamburger');
  if (nav) nav.classList.remove('open');
  if (btn) btn.classList.remove('open');
}

// ── Haber Detay ──────────────────────────────────────────────
function article(slug) {
  const d = haberMap[slug];
  if (d) { renderArticle(d); return; }
  fetch('/api/haberler/' + encodeURIComponent(slug))
    .then(r => r.json())
    .then(d => { haberMap[d.slug] = d; renderArticle(d); })
    .catch(() => go('haberler'));
}

function renderArticle(d) {
  document.getElementById('a-tag').textContent = d.kategori;
  document.getElementById('a-tag').className = 'at' + (d.renk ? ' ' + d.renk : '');
  document.getElementById('a-title').textContent = d.baslik;
  document.getElementById('a-date').textContent = d.gosterim_tarihi || d.tarih;
  document.getElementById('a-body').innerHTML = d.icerik;
  go('haber');
}

// ── Etkinlik Detay ───────────────────────────────────────────
function etkinlik(slug) {
  const d = etkinlikMap[slug];
  if (d) { renderEtkinlik(d); return; }
  fetch('/api/etkinlikler/' + encodeURIComponent(slug))
    .then(r => r.json())
    .then(d => { etkinlikMap[d.slug] = d; renderEtkinlik(d); })
    .catch(() => go('etkinlikler'));
}

function renderEtkinlik(d) {
  document.getElementById('e-tag').textContent = d.kategori;
  document.getElementById('e-title').textContent = d.baslik;
  document.getElementById('e-date').textContent = d.gosterim_tarihi || d.tarih;
  document.getElementById('e-body').innerHTML = d.icerik;
  go('etkinlik');
}

// ── Ticker ───────────────────────────────────────────────────
function buildTicker() {
  const inner = document.getElementById('ticker-inner');
  if (!inner || !DATA.ticker.length) return;
  const doubled = [...DATA.ticker, ...DATA.ticker];
  inner.innerHTML = doubled
    .map(t => `<span><strong>${esc(t.etiket)}</strong> · ${esc(t.metin)}</span>`)
    .join('');
}

// ── Ana Sayfa: Öne Çıkan Haberler ───────────────────────────
function buildFeaturedHaberler() {
  const nf = document.getElementById('featured-haberler');
  const ns = document.getElementById('secondary-haberler');
  if (!nf) return;

  const h = DATA.haberler;
  const main  = h[0];
  const right = h[1];

  nf.innerHTML = [
    main ? `<div class="nfl">
      <span class="nt${main.renk ? ' '+main.renk : ''}">${esc(main.kategori)}</span>
      <div class="nd">${esc(main.gosterim_tarihi || main.tarih)}</div>
      <h3>${esc(main.baslik)}</h3>
      <p>${esc(main.ozet)}</p>
      <a class="rmw" onclick="article('${esc(main.slug)}')">Devamını Oku</a>
    </div>` : '',
    right ? `<div class="nfr">
      <span class="nt${right.renk ? ' '+right.renk : ''}">${esc(right.kategori)}</span>
      <div class="nd">${esc(right.gosterim_tarihi || right.tarih)}</div>
      <h3>${esc(right.baslik)}</h3>
      <p>${esc(right.ozet)}</p>
      <a class="rmw" onclick="article('${esc(right.slug)}')">Oku</a>
    </div>` : ''
  ].join('');

  if (ns) {
    ns.innerHTML = h.slice(2, 5).map(h => `
      <div class="nsi">
        <span class="nt${h.renk ? ' '+h.renk : ''}" style="font-family:var(--fd)">${esc(h.kategori)}</span>
        <div class="nd2">${esc(h.gosterim_tarihi || h.tarih)}</div>
        <h4>${esc(h.baslik)}</h4>
        <p>${esc(h.ozet)}</p>
        <a class="rm" onclick="article('${esc(h.slug)}')" style="margin-top:.75rem;display:inline-flex">Oku</a>
      </div>`).join('');
  }
}

// ── Ana Sayfa: Öne Çıkan Etkinlikler ────────────────────────
function buildFeaturedEtkinlikler() {
  const el = document.getElementById('etkinlik-featured');
  if (!el) return;
  el.innerHTML = DATA.etkinlikler.slice(0, 3).map(e => `
    <a class="er" onclick="etkinlik('${esc(e.slug)}')">
      <div class="edb"><div class="ed">${esc(e.gun)}</div><div class="em">${esc(e.ay)}</div></div>
      <div class="eb">
        <div class="ec">${esc(e.kategori)}</div>
        <div class="et">${esc(e.baslik)}</div>
        <div class="edesc">${esc(e.ozet)}</div>
      </div>
    </a>`).join('');
}

// ── Haberler Liste Sayfası ───────────────────────────────────
function buildHaberlerList() {
  const hl = document.getElementById('haberler-list');
  if (!hl) return;
  if (!DATA.haberler.length) {
    hl.innerHTML = '<p style="color:var(--ink-muted);padding:2rem 0">Henüz haber yok.</p>';
    return;
  }
  hl.innerHTML = DATA.haberler.map(h => `
    <div style="border-bottom:1px solid var(--border);padding:1.5rem 0;cursor:pointer" onclick="article('${esc(h.slug)}')">
      <span class="nt${h.renk ? ' '+h.renk : ''}" style="font-family:var(--fd)">${esc(h.kategori)}</span>
      <div style="font-family:var(--fd);font-size:11px;letter-spacing:.04em;color:var(--ink-faint);margin:.5rem 0">${esc(h.gosterim_tarihi||h.tarih)}</div>
      <h3 style="font-family:var(--fd);font-size:18px;font-weight:700;color:var(--ink);margin-bottom:.5rem">${esc(h.baslik)}</h3>
      <p style="font-size:14px;color:var(--ink-muted);margin-bottom:.75rem">${esc(h.ozet)}</p>
      <a class="rm" onclick="event.stopPropagation();article('${esc(h.slug)}')">Oku</a>
    </div>`).join('');
}

// ── Etkinlikler Liste Sayfası ────────────────────────────────
function buildEtkinliklerList() {
  const el = document.getElementById('etkinlik-list');
  if (!el) return;
  if (!DATA.etkinlikler.length) {
    el.innerHTML = '<p style="color:var(--ink-muted);padding:2rem 0">Henüz etkinlik yok.</p>';
    return;
  }
  el.innerHTML = DATA.etkinlikler.map(e => `
    <a class="er" onclick="etkinlik('${esc(e.slug)}')" style="display:grid;border-bottom:1px solid var(--border)">
      <div class="edb"><div class="ed">${esc(e.gun)}</div><div class="em">${esc(e.ay)}</div></div>
      <div class="eb">
        <div class="ec">${esc(e.kategori)}</div>
        <div class="et">${esc(e.baslik)}</div>
        <div class="edesc">${esc(e.ozet)}</div>
      </div>
    </a>`).join('');
}

// ── Form Gönderimi ───────────────────────────────────────────
function formOK(e, successId) {
  e.preventDefault();
  const form   = e.target;
  const action = form.dataset.action;
  const data   = Object.fromEntries(new FormData(form));

  fetch(action, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(r => r.json())
    .then(() => {
      form.style.display = 'none';
      const ok = document.getElementById(successId);
      if (ok) ok.style.display = 'block';
    })
    .catch(() => {
      form.style.display = 'none';
      const ok = document.getElementById(successId);
      if (ok) ok.style.display = 'block';
    });
}

// ── Yardımcı: HTML kaçış ─────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Başlat ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initApp);
