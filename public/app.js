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
    buildHeroLive();
    buildFeaturedHaberler();
    buildFeaturedEtkinlikler();
    buildHaberlerList();
    buildEtkinliklerList();
  } catch (err) {
    console.error('Veri yüklenemedi:', err);
  }
}

// ── Hero Live (Son Tarihli İçerik) ─────────────────────────
function buildHeroLive() {
  const titleEl = document.getElementById('hero-live-title');
  const linkEl = document.getElementById('hero-live-link');
  if (!titleEl || !linkEl) return;

  const haber = (DATA.haberler || []).reduce((acc, cur) => {
    if (!acc) return cur;
    return compareByPublishedDate(cur, acc) > 0 ? cur : acc;
  }, null);

  const etkinlikItem = (DATA.etkinlikler || []).reduce((acc, cur) => {
    if (!acc) return cur;
    return compareByPublishedDate(cur, acc) > 0 ? cur : acc;
  }, null);

  let latest = null;
  let type = '';
  if (haber && etkinlikItem) {
    if (compareByPublishedDate(haber, etkinlikItem) >= 0) {
      latest = haber;
      type = 'haber';
    } else {
      latest = etkinlikItem;
      type = 'etkinlik';
    }
  } else if (haber) {
    latest = haber;
    type = 'haber';
  } else if (etkinlikItem) {
    latest = etkinlikItem;
    type = 'etkinlik';
  }

  if (!latest) {
    titleEl.textContent = 'Henüz içerik bulunmuyor.';
    linkEl.style.display = 'none';
    return;
  }

  titleEl.textContent = latest.baslik || 'Yeni içerik';
  linkEl.style.display = 'inline-block';
  linkEl.onclick = (e) => {
    e.preventDefault();
    if (type === 'haber') article(latest.slug);
    else etkinlik(latest.slug);
  };
}

function compareByPublishedDate(a, b) {
  const aPublished = getPublishedTimestamp(a);
  const bPublished = getPublishedTimestamp(b);
  if (aPublished !== bPublished) return aPublished - bPublished;

  const aCreated = getCreatedTimestamp(a);
  const bCreated = getCreatedTimestamp(b);
  if (aCreated !== bCreated) return aCreated - bCreated;

  const aId = Number(a?.id) || 0;
  const bId = Number(b?.id) || 0;
  if (aId !== bId) return aId - bId;

  return getPublishedTimestamp(a) - getPublishedTimestamp(b);
}

function getCreatedTimestamp(item) {
  if (!item) return 0;
  const created = parseFlexibleDate(item.olusturuldu);
  if (!Number.isNaN(created)) return created;
  return 0;
}

function getPublishedTimestamp(item) {
  if (!item) return 0;
  const published = parseFlexibleDate(item.tarih);
  if (!Number.isNaN(published)) return published;
  return 0;
}

function parseFlexibleDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return NaN;

  const normalized = raw.replace(' ', 'T');
  const direct = Date.parse(normalized);
  if (!Number.isNaN(direct)) return direct;

  const dmy = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    const year = dmy[3];
    const parsed = Date.parse(`${year}-${month}-${day}T00:00:00`);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return NaN;
}

// ── Navigasyon ───────────────────────────────────────────────
function go(page) {
  closeMobileMenu();
  document.querySelectorAll('.pv').forEach(p => p.classList.remove('on'));
  const t = document.getElementById('p-' + page);
  if (t) { t.classList.add('on'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  loadSabitSayfa(page);
  if (page === 'faaliyet-listesi') loadFaaliyetler();
  if (page === 'faaliyet-detay') window.scrollTo({ top: 0, behavior: 'instant' });
  if (page === 'basinda-todap') loadBasindaTodap();
  if (page === 'videolar') loadVideolar();
  if (page === 'video-detay') window.scrollTo({ top: 0, behavior: 'instant' });
}

// ── Sabit Sayfa Yükle ────────────────────────────────────────
const SABIT_SAYFA_MAP = {
  'todap-kimdir':            'hakkimizda',
  'tuzuk':                   'tuzuk',
  'psikolog-haklari-birimi': 'psikolog-haklari-birimi',
  'kadin-komisyonu':         'kadin-komisyonu',
  'meslek-yasasi-komisyonu': 'meslek-yasasi-komisyonu',
  'ogrenci-komisyonu':       'ogrenci-komisyonu',
  'etik-kurullar':           'etik-kurullar',
};
const sabitSayfaCache = {};

function loadSabitSayfa(page) {
  const kategori = SABIT_SAYFA_MAP[page];
  if (!kategori) return;
  const bodyEl = document.getElementById('ss-body-' + page);
  if (!bodyEl) return;
  if (sabitSayfaCache[kategori]) {
    bodyEl.innerHTML = sabitSayfaCache[kategori];
    return;
  }
  fetch('/api/sabit-sayfalar/' + encodeURIComponent(kategori))
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      if (!d) return;
      sabitSayfaCache[kategori] = d.icerik;
      bodyEl.innerHTML = d.icerik;
    })
    .catch(() => {});
}

// ── Faaliyet Listesi Yükle ────────────────────────────────────
let faaliyetlerLoaded = false;
let faaliyetListesi = [];
function loadFaaliyetler() {
  const listEl = document.getElementById('faaliyet-list-body');
  if (!listEl || faaliyetlerLoaded) return;
  fetch('/api/faaliyetler')
    .then(r => r.ok ? r.json() : [])
    .then(list => {
      faaliyetlerLoaded = true;
      list.sort((a, b) => (b.crdate || '').localeCompare(a.crdate || ''));
      faaliyetListesi = list;
      if (!list.length) {
        listEl.innerHTML = '<p style="color:var(--ink-muted)">Henüz faaliyet eklenmemiş.</p>';
        return;
      }
      listEl.innerHTML = list.map(f => `
        <div style="border-bottom:1px solid var(--border);padding:1.5rem 0">
          <div style="font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--burgundy);margin-bottom:.4rem">${fmtDate(f.crdate)}</div>
          <h3 style="font-family:var(--fd);font-size:18px;font-weight:700;color:var(--ink);margin-bottom:.6rem;line-height:1.3">${esc(f.baslik)}</h3>
          ${f.ozet ? `<p style="font-size:15px;color:var(--ink-muted);line-height:1.7;margin-bottom:.75rem">${esc(f.ozet)}</p>` : ''}
          ${f.icerik ? `
          <button onclick="openFaaliyet(${f.id})"
            style="background:none;border:none;cursor:pointer;font-family:var(--fd);font-size:13px;font-weight:700;color:var(--burgundy);padding:0;letter-spacing:.03em">
            Devamını Oku ▸
          </button>` : ''}
        </div>`).join('');
    })
    .catch(() => {});
}
function openFaaliyet(id) {
  const f = faaliyetListesi.find(x => x.id === id);
  if (!f) return;
  document.getElementById('fd-baslik').textContent = f.baslik;
  document.getElementById('fd-meta').textContent   = fmtDate(f.crdate) || '';
  document.getElementById('fd-icerik').innerHTML   = f.icerik || '<p>İçerik bulunmuyor.</p>';
  go('faaliyet-detay');
}

// ── Basında Todap Yükle ────────────────────────────────
let basindaLoaded = false;
function loadBasindaTodap() {
  const listEl = document.getElementById('basinda-list-body');
  if (!listEl || basindaLoaded) return;
  fetch('/api/basinda-todap')
    .then(r => r.ok ? r.json() : [])
    .then(list => {
      basindaLoaded = true;
      list.sort((a, b) => (b.crdate || '').localeCompare(a.crdate || ''));
      if (!list.length) {
        listEl.innerHTML = '<p style="color:var(--ink-muted)">Henüz haber eklenmemiş.</p>';
        return;
      }
      listEl.innerHTML = list.map(item => `
        <div style="border-bottom:1px solid var(--border);padding:1.5rem 0;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem">
          <div style="flex:1">
            <div style="font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--burgundy);margin-bottom:.35rem">${fmtDate(item.crdate)}</div>
            <div style="font-family:var(--fd);font-size:17px;font-weight:700;color:var(--ink);margin-bottom:.3rem;line-height:1.3">${esc(item.baslik)}</div>
            ${item.adres_ismi ? `<div style="font-size:13px;color:var(--ink-faint)">${esc(item.adres_ismi)}</div>` : ''}
          </div>
          ${item.baglanti_adresi ? `
          <a href="${esc(item.baglanti_adresi)}" target="_blank" rel="noopener noreferrer"
            style="flex-shrink:0;background:none;border:1px solid var(--burgundy);border-radius:4px;padding:.35rem .85rem;font-family:var(--fd);font-size:12px;font-weight:700;color:var(--burgundy);text-decoration:none;white-space:nowrap">
            Habere Git →
          </a>` : ''}
        </div>`).join('');
    })
    .catch(() => {});
}
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── Videolar ──────────────────────────────────────────────────
let videolarLoaded = false;
let videoListesi = [];

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
function getYoutubeEmbed(url) {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
}
function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
}

function loadVideolar() {
  const listEl = document.getElementById('video-list-body');
  if (!listEl || videolarLoaded) return;
  fetch('/api/videos')
    .then(r => r.ok ? r.json() : [])
    .then(list => {
      videolarLoaded = true;
      videoListesi = list;
      if (!list.length) {
        listEl.innerHTML = '<p style="color:var(--ink-muted)">Henüz video eklenmemiş.</p>';
        return;
      }
      listEl.innerHTML = list.map(v => {
        const thumb = v.thumbnail_url || getYoutubeThumbnail(v.video_url);
        const ozet  = v.aciklama ? (v.aciklama.length > 120 ? v.aciklama.slice(0, 120) + '...' : v.aciklama) : '';
        return `
        <div onclick="openVideo(${v.id})" style="display:flex;gap:1rem;align-items:flex-start;padding:1.25rem 0;border-bottom:1px solid var(--border);cursor:pointer">
          ${thumb ? `<img src="${esc(thumb)}" alt="" style="width:120px;height:68px;object-fit:cover;border-radius:5px;flex-shrink:0;background:#eee">` : `<div style="width:120px;height:68px;background:var(--border);border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:22px">▶</div>`}
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--fd);font-size:15px;font-weight:700;color:var(--ink);line-height:1.3;margin-bottom:.3rem">${esc(v.baslik)}</div>
            ${ozet ? `<div style="font-size:13px;color:var(--ink-muted);line-height:1.5;margin-bottom:.3rem">${esc(ozet)}</div>` : ''}
            <div style="font-size:11px;font-family:var(--fd);font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--burgundy)">${fmtDate(v.yayinlanma_tarihi)}</div>
          </div>
        </div>`;
      }).join('');
    })
    .catch(() => {});
}

function openVideo(id) {
  const v = videoListesi.find(x => x.id === id);
  if (!v) return;
  document.getElementById('vd-baslik').textContent   = v.baslik;
  document.getElementById('vd-tarih').textContent    = fmtDate(v.yayinlanma_tarihi) || '';
  document.getElementById('vd-aciklama').textContent = v.aciklama || '';
  document.getElementById('vd-iframe').src           = getYoutubeEmbed(v.video_url);
  go('video-detay');
}

function fmtDate(s) {
  if (!s) return '';
  const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(s);
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

// ── Nav Dropdown (hover + 200ms gecikme) ────────────────────
(function () {
  const CLOSE_DELAY = 200;
  const timers = new WeakMap();

  function openDropdown(li) {
    const t = timers.get(li);
    if (t) { clearTimeout(t); timers.delete(li); }
    li.classList.add('open');
  }

  function scheduleClose(li) {
    const t = setTimeout(() => {
      li.classList.remove('open');
      timers.delete(li);
    }, CLOSE_DELAY);
    timers.set(li, t);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.nav-dropdown').forEach(li => {
      li.addEventListener('mouseenter', () => openDropdown(li));
      li.addEventListener('mouseleave', () => scheduleClose(li));
    });
  });
})();

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
  document.getElementById('a-date').textContent = d.gosterim_tarihi || fmtDate(d.tarih);
  document.getElementById('a-body').innerHTML = linkifyHtmlContent(d.ozet_icerik || d.detayli_icerik || '');
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
  document.getElementById('e-date').textContent = d.gosterim_tarihi || fmtDate(d.tarih);
  document.getElementById('e-body').innerHTML = linkifyHtmlContent(d.icerik || '');
  go('etkinlik');
}

// ── Metin İçindeki URL'leri Linke Çevir ─────────────────────
function linkifyHtmlContent(html) {
  if (!html) return '';

  const container = document.createElement('div');
  container.innerHTML = html;

  const textNodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parentEl = node.parentElement;
      if (!parentEl) return NodeFilter.FILTER_REJECT;
      if (parentEl.closest('a, code, pre, script, style, textarea')) return NodeFilter.FILTER_REJECT;
      if (!/https?:\/\//i.test(node.nodeValue || '')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let current;
  while ((current = walker.nextNode())) {
    textNodes.push(current);
  }

  const urlRegex = /https?:\/\/[^\s<>"]+/gi;

  for (const node of textNodes) {
    const text = node.nodeValue || '';
    const frag = document.createDocumentFragment();
    let last = 0;

    text.replace(urlRegex, (raw, offset) => {
      if (offset > last) {
        frag.appendChild(document.createTextNode(text.slice(last, offset)));
      }

      let url = raw;
      let trailing = '';
      while (/[),.;!?]$/.test(url)) {
        trailing = url.slice(-1) + trailing;
        url = url.slice(0, -1);
      }

      const a = document.createElement('a');
      a.href = url;
      a.textContent = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      frag.appendChild(a);

      if (trailing) {
        frag.appendChild(document.createTextNode(trailing));
      }

      last = offset + raw.length;
      return raw;
    });

    if (last < text.length) {
      frag.appendChild(document.createTextNode(text.slice(last)));
    }

    node.replaceWith(frag);
  }

  return container.innerHTML;
}

// ── Ticker ───────────────────────────────────────────────────
function buildTicker() {
  const inner = document.getElementById('ticker-inner');
  if (!inner || !DATA.ticker.length) return;
  const doubled = [...DATA.ticker, ...DATA.ticker];
  inner.innerHTML = doubled
    .map(t => `<a href="#" data-tur="${esc(t.tur || '')}" data-slug="${esc(t.slug || '')}" title="Detaya git" style="color:inherit;text-decoration:none"><strong>${esc(t.etiket)}</strong> · ${esc(t.metin)}</a>`)
    .join('');

  inner.onclick = (event) => {
    const item = event.target.closest('[data-tur][data-slug]');
    if (!item) return;
    event.preventDefault();
    const tur = item.getAttribute('data-tur');
    const slug = item.getAttribute('data-slug');
    openTickerItem(tur, slug);
  };
}

function openTickerItem(tur, slug) {
  if (!slug) return;
  if (tur === 'haber') {
    article(slug);
    return;
  }
  if (tur === 'etkinlik') {
    etkinlik(slug);
  }
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
      <div class="nd">${esc(main.gosterim_tarihi || fmtDate(main.tarih))}</div>
      <h3>${esc(main.baslik)}</h3>
      <p>${esc(main.ozet)}</p>
      <a class="rmw" onclick="article('${esc(main.slug)}')">Devamını Oku</a>
    </div>` : '',
    right ? `<div class="nfr">
      <span class="nt${right.renk ? ' '+right.renk : ''}">${esc(right.kategori)}</span>
      <div class="nd">${esc(right.gosterim_tarihi || fmtDate(right.tarih))}</div>
      <h3>${esc(right.baslik)}</h3>
      <p>${esc(right.ozet)}</p>
      <a class="rmw" onclick="article('${esc(right.slug)}')">Oku</a>
    </div>` : ''
  ].join('');

  if (ns) {
    ns.innerHTML = h.slice(2, 5).map(h => `
      <div class="nsi">
        <span class="nt${h.renk ? ' '+h.renk : ''}" style="font-family:var(--fd)">${esc(h.kategori)}</span>
        <div class="nd2">${esc(h.gosterim_tarihi || fmtDate(h.tarih))}</div>
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
      <div style="font-family:var(--fd);font-size:11px;letter-spacing:.04em;color:var(--ink-faint);margin:.5rem 0">${esc(h.gosterim_tarihi||fmtDate(h.tarih))}</div>
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

// ── Navbar Scroll Gizle/Göster ───────────────────────────────
(function () {
  const NAV_HEIGHT  = 56;   // px — nav yüksekliği
  const THRESHOLD   = 80;   // px — bu kadar aşağı inince saklama başlar
  const TOLERANCE   = 6;    // px — küçük titremeleri yok say

  let lastY = window.scrollY;
  let ticking = false;

  function handleScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const y   = window.scrollY;
    const diff = y - lastY;

    if (Math.abs(diff) < TOLERANCE) return;

    if (y < THRESHOLD) {
      // Üstteyiz — her zaman göster
      nav.classList.remove('nav-hidden');
    } else if (diff > 0) {
      // Aşağı kaydırıyor — gizle
      nav.classList.add('nav-hidden');
      closeMobileMenu();
    } else {
      // Yukarı kaydırıyor — göster
      nav.classList.remove('nav-hidden');
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });
})();

// ── Başlat ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initApp);
