'use strict';

const THEME_COLUMNS = [
  'var_color_white_base',
  'var_color_green_base',
  'var_color_red_base',
  'var_color_black_base',
  'var_color_green_dark_variant',
  'var_color_red_dark_variant',
  'var_color_green_light_variant',
  'var_color_red_light_variant',
  'var_color_white_off_variant',
  'var_color_gray_light_variant',
  'var_color_gray_lighter_variant'
];

const DEFAULT_THEME = {
  var_color_white_base: '#FFFFFF',
  var_color_green_base: '#009736',
  var_color_red_base: '#EE2A35',
  var_color_black_base: '#000000',
  var_color_green_dark_variant: '#007A2B',
  var_color_red_dark_variant: '#C41E28',
  var_color_green_light_variant: '#E6F4E9',
  var_color_red_light_variant: '#FDEAEC',
  var_color_white_off_variant: '#FAFAFA',
  var_color_gray_light_variant: '#666666',
  var_color_gray_lighter_variant: '#999999'
};

const CSS_VAR_MAP = {
  var_color_white_base: '--color-white',
  var_color_green_base: '--color-green',
  var_color_red_base: '--color-red',
  var_color_black_base: '--color-black',
  var_color_green_dark_variant: '--color-green-dark',
  var_color_red_dark_variant: '--color-red-dark',
  var_color_green_light_variant: '--color-green-light',
  var_color_red_light_variant: '--color-red-light',
  var_color_white_off_variant: '--color-white-off',
  var_color_gray_light_variant: '--color-gray-light',
  var_color_gray_lighter_variant: '--color-gray-lighter'
};

const THEME_LABELS = {
  var_color_white_base: '1. renk beyaz ana',
  var_color_green_base: '2. renk yesil ana',
  var_color_red_base: '3. renk kirmizi ana',
  var_color_black_base: '4. renk siyah ana',
  var_color_green_dark_variant: 'yesil koyu varyant',
  var_color_red_dark_variant: 'kirmizi koyu varyant',
  var_color_green_light_variant: 'yesil acik varyant',
  var_color_red_light_variant: 'kirmizi acik varyant',
  var_color_white_off_variant: 'beyaz kirik varyant',
  var_color_gray_light_variant: 'gri acik varyant',
  var_color_gray_lighter_variant: 'gri daha acik varyant'
};

function normalizeHex(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withHash = raw.startsWith('#') ? raw : '#' + raw;
  const shortMatch = withHash.match(/^#([0-9a-fA-F]{3})$/);
  if (shortMatch) {
    const h = shortMatch[1].toUpperCase();
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  const fullMatch = withHash.match(/^#([0-9a-fA-F]{6})$/);
  if (!fullMatch) return '';
  return '#' + fullMatch[1].toUpperCase();
}

function validateAndNormalizeTheme(payload, options = {}) {
  const requireAll = options.requireAll !== false;
  const normalized = {};
  const errors = [];

  for (const key of THEME_COLUMNS) {
    const incoming = payload ? payload[key] : undefined;
    if (incoming === undefined || incoming === null || incoming === '') {
      if (requireAll) errors.push(`${key} zorunlu.`);
      continue;
    }
    const hex = normalizeHex(incoming);
    if (!hex) {
      errors.push(`${key} gecerli HEX olmali (#RRGGBB).`);
      continue;
    }
    normalized[key] = hex;
  }

  const unknownKeys = Object.keys(payload || {}).filter((k) => !THEME_COLUMNS.includes(k) && k !== 'profile_name');
  if (unknownKeys.length) {
    errors.push(`Bilinmeyen alan(lar): ${unknownKeys.join(', ')}`);
  }

  return { ok: errors.length === 0, errors, value: normalized };
}

function buildTokensCss(themeRow) {
  const theme = { ...DEFAULT_THEME, ...(themeRow || {}) };

  return `/* ═══════════════════════════════════════════════════════════════
   TODAP Design Tokens
   ───────────────────────────────────────────────────────────────
   RENK PALETI (ADMIN TARAFINDAN YONETILEN DEGİSKENLER):
   - Beyaz (1. renk): --color-white => ${theme.var_color_white_base}
   - Yesil (2. renk): --color-green => ${theme.var_color_green_base}
   - Kirmizi (3. renk): --color-red => ${theme.var_color_red_base}
   - Siyah (4. renk): --color-black => ${theme.var_color_black_base}
   ═══════════════════════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {

  /* ── 1. RENKLER (ADMIN DEGISKENLERI) ─────────────────────────── */

  /* Beyaz - ANA RENK (en cok kullanilan) */
  --color-white:        ${theme.var_color_white_base};

  /* Yesil - 2. RENK (navbar, buton, link) */
  --color-green:        ${theme.var_color_green_base};

  /* Kirmizi - 3. RENK (ticker, uyari, aktif) */
  --color-red:          ${theme.var_color_red_base};

  /* Siyah - 4. RENK (sadece yazilar) */
  --color-black:        ${theme.var_color_black_base};

  /* ── VARYANTLAR (admin degiskenleri) ─────────────────────────── */
  --color-green-dark:   ${theme.var_color_green_dark_variant};    /* hover icin */
  --color-red-dark:     ${theme.var_color_red_dark_variant};      /* hover icin */
  --color-green-light:  ${theme.var_color_green_light_variant};   /* hafif arka plan */
  --color-red-light:    ${theme.var_color_red_light_variant};     /* hafif arka plan */

  --color-white-off:    ${theme.var_color_white_off_variant};     /* alternatif zemin */
  --color-gray-light:   ${theme.var_color_gray_light_variant};    /* muted yazilar */
  --color-gray-lighter: ${theme.var_color_gray_lighter_variant};  /* faint yazilar */

  /* ── TOKEN ESLEMELERI ────────────────────────────────────────── */

  /* Ana vurgu - YESIL */
  --color-primary:        var(--color-green);
  --color-primary-dark:   var(--color-green-dark);
  --color-primary-light:  var(--color-green-light);

  /* Ikincil vurgu - KIRMIZI */
  --color-accent:         var(--color-red);
  --color-accent-dark:    var(--color-red-dark);
  --color-accent-light:   var(--color-red-light);

  /* Zeminler - BEYAZ agirlikli */
  --color-bg:             var(--color-white);
  --color-bg-alt:         var(--color-white-off);
  --color-surface:        var(--color-white);

  /* Kenarliklar - SIYAH'in seffaf varyantlari */
  --color-border:         rgba(0, 0, 0, 0.09);
  --color-border-strong:  rgba(0, 0, 0, 0.16);

  /* Yazi renkleri - SIYAH */
  --color-text-primary:   var(--color-black);
  --color-text-secondary: var(--color-gray-light);
  --color-text-faint:     var(--color-gray-lighter);

  /* Navbar - YESIL */
  --color-nav-bg:         var(--color-green);
  --color-nav-text:       rgba(255, 255, 255, 0.9);
  --color-nav-text-hover: var(--color-white);

  /* Footer - BEYAZ */
  --color-footer-bg:      var(--color-white-off);
  --color-footer-text:    var(--color-gray-light);

  /* Ticker - KIRMIZI */
  --color-ticker-bg:      var(--color-red);
  --color-ticker-text:    rgba(255, 255, 255, 0.9);

  /* Geriye donuk uyumluluk alias'lari */
  --burgundy:       var(--color-green);
  --burgundy-deep:  var(--color-green-dark);
  --burgundy-light: var(--color-green-light);
  --mustard:        var(--color-red);
  --mustard-light:  var(--color-red-light);
  --accent:         var(--color-green);
  --accent-deep:    var(--color-green-dark);
  --accent-light:   var(--color-green-light);

  /* ── 2. TIPOGRAFI ───────────────────────────────────────────── */

  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Courier New', monospace;

  /* ── 3. YAZI BUYUKLUKLERI ───────────────────────────────────── */

  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 16px;
  --text-md:   18px;
  --text-lg:   22px;
  --text-xl:   28px;
  --text-2xl:  36px;
  --text-3xl:  48px;

  /* ── 4. YAZI AGIRLIKLARI ───────────────────────────────────── */

  --weight-light:   300;
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-bold:    700;
  --weight-black:   800;

  /* ── 5. BOSLUK ve LAYOUT ───────────────────────────────────── */

  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 64px;

  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-full: 9999px;

  /* ── 6. GOLGE ve EFEKTLER ──────────────────────────────────── */

  --shadow-sm:  0 1px 4px rgba(0, 0, 0, 0.05);
  --shadow-md:  0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg:  0 10px 28px rgba(0, 0, 0, 0.12);

  --transition-fast: 0.15s ease;
  --transition-base: 0.25s ease;
  --transition-slow: 0.35s ease;

}
`;
}

function rowToTheme(row) {
  return THEME_COLUMNS.reduce((acc, key) => {
    acc[key] = row && row[key] ? normalizeHex(row[key]) : DEFAULT_THEME[key];
    return acc;
  }, {});
}

module.exports = {
  THEME_COLUMNS,
  DEFAULT_THEME,
  CSS_VAR_MAP,
  THEME_LABELS,
  validateAndNormalizeTheme,
  buildTokensCss,
  rowToTheme
};
