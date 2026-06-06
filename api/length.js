const { SITE, UNITS } = require('./length-data');

const UNIT_BY_SLUG = Object.fromEntries(UNITS.map((unit) => [unit.slug, unit]));
const PAIR_COUNT = UNITS.length * (UNITS.length - 1);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toTitle(value) {
  return value
    .split(' ')
    .map((part) => {
      if (/^(UK|US|X-unit)$/i.test(part)) return part.toUpperCase();
      if (/^a\.u\.$/i.test(part)) return 'A.u.';
      return part ? part[0].toUpperCase() + part.slice(1) : part;
    })
    .join(' ')
    .replace(/\(uk\)/gi, '(UK)')
    .replace(/\(us survey\)/gi, '(US Survey)')
    .replace(/\(roman\)/gi, '(Roman)')
    .replace(/\(greek\)/gi, '(Greek)')
    .replace(/\(cloth\)/gi, '(cloth)')
    .replace(/\(classical\)/gi, '(classical)')
    .replace(/\(international\)/gi, '(international)')
    .replace(/\(int\)/gi, '(int.)')
    .replace(/Earth'S/g, "Earth's")
    .replace(/Sun'S/g, "Sun's");
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e9 || abs < 0.000001)) {
    return value.toExponential(12).replace(/\.0+e/, 'e').replace(/(\.\d*?)0+e/, '$1e');
  }
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 15 }).format(value);
}

function conversionFactor(from, to) {
  return from.meter / to.meter;
}

function pairPath(from, to) {
  return `/length/${from.slug}-to-${to.slug}`;
}

function unitLabel(unit) {
  return `${toTitle(unit.name)}${unit.symbol ? ` (${unit.symbol})` : ''}`;
}

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function shell({ title, description, canonical, body, structuredData = [] }) {
  const schemas = structuredData.map(jsonLd).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Omni Converter">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&amp;family=Space+Grotesk:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            display: ['Space Grotesk', 'Inter', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
              400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
              800: '#9a3412', 900: '#7c2d12',
            }
          }
        }
      }
    }
  </script>
  <style>
    :root{
      color-scheme:light;
      --omni-blue:#3468E7;
      --omni-blue-dark:#2556C7;
      --omni-green:#21B66F;
      --omni-green-dark:#15955A;
      --omni-orange:#FF641E;
      --omni-orange-dark:#D94B10;
      --ink:#172033;
      --muted:#6b7280;
      --line:#e5e7eb;
      --soft-line:#dbeafe;
      --panel:#ffffff;
      --bg:#f8fafc;
      --success-soft:#f2fbf6;
      --accent-soft:#fff5ef;
    }
    *{box-sizing:border-box}
    body{margin:0;padding-top:64px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at 12% 8%,rgba(52,104,231,.12),transparent 28rem),radial-gradient(circle at 88% 18%,rgba(33,182,111,.10),transparent 26rem),linear-gradient(180deg,#f8fafc 0,#fff 36rem);color:var(--ink);line-height:1.6}
    a{color:inherit}
    .gradient-text{background:linear-gradient(135deg,var(--omni-blue) 0%,var(--omni-green) 52%,var(--omni-orange) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .wrap{width:min(1180px,calc(100% - 32px));margin:auto}
    .hero{padding:60px 0 34px}
    .eyebrow{display:inline-flex;gap:8px;align-items:center;padding:6px 12px;border:1px solid rgba(52,104,231,.18);border-radius:999px;background:#fff;color:var(--omni-blue-dark);font-weight:800;font-size:13px;box-shadow:0 10px 28px rgba(52,104,231,.08)}
    h1{font-family:'Space Grotesk',Inter,ui-sans-serif,system-ui,sans-serif;font-size:clamp(2.2rem,6vw,4.9rem);font-weight:900;line-height:.98;letter-spacing:-.06em;margin:18px 0 18px}
    h2{font-family:'Space Grotesk',Inter,ui-sans-serif,system-ui,sans-serif;font-size:clamp(1.6rem,3vw,2.35rem);font-weight:800;line-height:1.1;letter-spacing:-.035em;margin:0 0 14px}
    h3{font-weight:800;line-height:1.15}
    .lead{font-size:clamp(1.05rem,2vw,1.28rem);color:#475569;max-width:840px}
    .grid{display:grid;gap:18px}
    .hero-grid{grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);align-items:start}
    .card{background:rgba(255,255,255,.92);border:1px solid rgba(52,104,231,.12);border-radius:28px;box-shadow:0 24px 80px rgba(37,86,199,.12);padding:24px}
    .converter-card{position:relative;overflow:hidden;border-radius:28px;background:linear-gradient(180deg,#fbfbfc 0%,#fff 42%,#f4fbf6 100%);border:1px solid rgba(23,32,51,.10);box-shadow:0 28px 80px rgba(15,23,42,.14);padding:28px 24px 26px}
    .converter-card:before{content:"";position:absolute;inset:auto -20% -42% -20%;height:62%;background:linear-gradient(135deg,rgba(33,182,111,.12),rgba(52,104,231,.05));pointer-events:none}
    .converter-panel{position:relative;z-index:1}
    .converter-section{display:grid;gap:12px}
    .converter-section.to-section{margin-top:8px}
    .converter-label{display:flex;align-items:center;justify-content:space-between;color:var(--muted);font-size:14px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
    .converter-label.to-label{color:var(--omni-green-dark)}
    .unit-pill{letter-spacing:0;text-transform:none;font-size:13px;font-weight:800;color:#64748b;background:#fff;border:1px solid var(--line);border-radius:999px;padding:4px 9px}
    .value-box{position:relative;background:#fff;border:1px solid #dfe3ea;border-radius:10px;box-shadow:0 2px 8px rgba(15,23,42,.08);min-height:126px;display:flex;align-items:center;justify-content:center;padding:28px 18px 18px}
    .value-box:focus-within{border-color:var(--omni-blue);box-shadow:0 0 0 4px rgba(52,104,231,.12),0 10px 26px rgba(52,104,231,.12)}
    .value-box.result-box{border-color:#dce8d9;box-shadow:0 2px 8px rgba(21,149,90,.09)}
    .unit-corner{position:absolute;right:18px;top:16px;color:#6f7280;font-weight:800;font-size:18px;max-width:44%;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .amount-input,.result-input{width:100%;border:0;background:transparent;outline:0;text-align:center;font-family:'Space Grotesk',Inter,sans-serif;font-size:clamp(2rem,7vw,3.25rem);font-weight:800;letter-spacing:-.04em;color:#111827;padding:10px 0 0}
    .amount-input::placeholder{color:#a8adb7}
    .result-input{color:#686b76}
    .unit-name-card{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:54px;background:#fff;border:1px solid #dfe3ea;border-radius:10px;box-shadow:0 2px 8px rgba(15,23,42,.08);padding:12px 16px;font-size:clamp(1rem,2vw,1.1rem);font-weight:700;color:#111827}
    .unit-name-card.result-unit{border-color:#dce8d9}
    .unit-symbol-chip{flex:0 0 auto;border-radius:999px;background:#f8fafc;color:#64748b;border:1px solid #e5e7eb;padding:4px 9px;font-size:13px;font-weight:800}
    .swap-divider{position:relative;display:flex;align-items:center;justify-content:center;margin:16px 0 6px;min-height:58px}
    .swap-divider:before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:linear-gradient(90deg,transparent,rgba(33,182,111,.26),transparent)}
    .swap{position:relative;z-index:1;border:4px solid #fff;background:#fff;color:var(--omni-orange);border-radius:999px;width:66px;height:66px;font-size:28px;font-weight:900;cursor:pointer;box-shadow:0 0 0 3px var(--omni-green),0 16px 34px rgba(255,100,30,.20);transition:transform .18s ease,box-shadow .18s ease,color .18s ease}
    .swap:hover{transform:translateY(-2px) rotate(180deg);color:var(--omni-orange-dark);box-shadow:0 0 0 3px var(--omni-orange),0 18px 38px rgba(255,100,30,.26)}
    .result{position:relative;z-index:1;margin-top:16px;padding:16px 18px;border-radius:18px;background:linear-gradient(135deg,rgba(33,182,111,.10),rgba(52,104,231,.07));border:1px solid rgba(33,182,111,.22);font-weight:800;color:#14532d}
    .converter-note{position:relative;z-index:1;margin:12px 2px 0;color:#64748b;font-size:13px;text-align:center}
    .primary-action{display:inline-flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;width:100%;border:0;border-radius:14px;background:var(--omni-blue);color:#fff;text-decoration:none;font-weight:900;padding:12px 14px;box-shadow:0 16px 32px rgba(52,104,231,.22)}
    .primary-action:hover{background:var(--omni-blue-dark)}
    .field label{display:block;font-size:13px;font-weight:800;margin-bottom:7px;color:#334155}
    .field input,.field select,.search input{width:100%;border:1px solid rgba(52,104,231,.28);border-radius:16px;padding:13px 14px;font:inherit;background:#fff}
    .section{padding:34px 0}
    .search{position:relative;margin:20px 0}
    .suggest{position:absolute;left:0;right:0;top:calc(100% + 8px);background:#fff;border:1px solid rgba(52,104,231,.18);border-radius:18px;box-shadow:0 18px 50px rgba(15,23,42,.14);display:none;overflow:hidden;z-index:5}
    .suggest a{display:block;padding:10px 14px;text-decoration:none;border-bottom:1px solid #eef2ff}
    .suggest a:hover{background:#f8fafc;color:var(--omni-blue-dark)}
    .stats{grid-template-columns:repeat(3,1fr);margin-top:24px}
    .stat{padding:18px;border:1px solid rgba(52,104,231,.12);border-radius:22px;background:#fff}
    .stat b{display:block;font-size:1.7rem;color:var(--omni-blue-dark)}
    .links-grid{columns:3 260px;column-gap:20px}
    .unit-block{break-inside:avoid;margin:0 0 18px;padding:18px;border:1px solid rgba(52,104,231,.12);border-radius:22px;background:#fff}
    .unit-block h3{margin:0 0 8px;font-size:1rem}
    .unit-block a,.inline-links a{display:block;text-decoration:none;color:#475569;padding:4px 0;font-size:14px}
    .unit-block a:hover,.inline-links a:hover{color:var(--omni-blue-dark);text-decoration:underline}
    .info-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    .formula{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#0f172a;color:#fff;border-radius:18px;padding:18px;overflow:auto}
    .breadcrumb{font-size:14px;color:#64748b;margin-top:18px}
    .breadcrumb a{color:var(--omni-blue-dark);text-decoration:none}
    .pill-row{display:flex;gap:10px;flex-wrap:wrap}
    .pill{padding:8px 11px;border-radius:999px;background:#fff;border:1px solid rgba(52,104,231,.16);text-decoration:none;color:#475569;font-size:14px}
    .pill:hover{color:var(--omni-blue-dark);border-color:rgba(52,104,231,.35)}
    .footer{margin-top:36px;padding:30px 0;border-top:1px solid #e5e7eb;color:#64748b}
    .error{padding:80px 0}
    @media(max-width:800px){.hero-grid,.info-grid,.stats{grid-template-columns:1fr}.links-grid{columns:1}.converter-card{padding:22px 16px}.value-box{min-height:112px}.swap{width:58px;height:58px;font-size:24px}}
  </style>
  ${schemas}
</head>
<body class="bg-white font-sans text-gray-900 antialiased">
  <!-- ===== NAVBAR ===== -->
  <nav id="navbar" class="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 transition-all duration-300" role="navigation" aria-label="Main navigation">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2.5 group" aria-label="Omni Converter Home">
          <img src="https://cdn-ai.onspace.ai/onspace/project/uploads/387tjVXsepM8baiJWrdVRg/omnilogo.png" alt="Omni Converter Logo" class="w-9 h-9 object-contain rounded-xl">
          <span class="font-display font-700 text-xl text-gray-900">Omni<span class="gradient-text">Converter</span></span>
        </a>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-1">
          <a href="/#converters" class="nav-link px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all">Converters</a>
          <a href="/#about" class="nav-link px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all">About</a>
          <a href="/#faq" class="nav-link px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all">FAQ</a>
          <a href="/#blog" class="nav-link px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all">Guide</a>
        </div>

        <!-- CTA -->
        <div class="flex items-center gap-3">
          <a href="/#converters" class="hidden sm:inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-brand-500/30">
            <i class="fas fa-calculator text-xs"></i>
            All Converters
          </a>
          <!-- Mobile menu toggle -->
          <button id="mobileMenuBtn" onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Toggle menu">
            <i class="fas fa-bars text-lg" id="mobileMenuIcon"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div id="mobileMenu" class="hidden md:hidden border-t border-orange-100 bg-white/95 backdrop-blur-md">
      <div class="px-4 py-3 space-y-1">
        <a href="/#converters" onclick="toggleMobileMenu();" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">Converters</a>
        <a href="/#about" onclick="toggleMobileMenu();" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">About</a>
        <a href="/#faq" onclick="toggleMobileMenu();" class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">FAQ</a>
        <a href="/#blog" onclick="toggleMobileMenu();" class="w-full text-left block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">Guide</a>
      </div>
    </div>
  </nav>
  ${body}
  <footer class="footer"><div class="wrap">© ${new Date().getUTCFullYear()} Omni Converter. Length conversions are rendered server-side under the independent <strong>/length</strong> subfolder.</div></footer>
  <script>
    function toggleMobileMenu() {
      const menu = document.getElementById('mobileMenu');
      const icon = document.getElementById('mobileMenuIcon');
      if (!menu || !icon) return;
      menu.classList.toggle('hidden');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  </script>
</body>
</html>`;
}

function converterWidget(from, to) {
  const factor = conversionFactor(from, to);
  const fromTitle = toTitle(from.name);
  const toTitleText = toTitle(to.name);
  const fromSymbol = from.symbol || from.slug;
  const toSymbol = to.symbol || to.slug;
  return `<div class="converter-card" aria-label="${escapeHtml(fromTitle)} to ${escapeHtml(toTitleText)} converter">
    <div class="converter-panel" id="converter" data-factor="${factor}" data-from-name="${escapeHtml(from.name)}" data-to-name="${escapeHtml(to.name)}">
      <section class="converter-section" aria-labelledby="fromLabel">
        <div class="converter-label" id="fromLabel"><span>From</span><span class="unit-pill">${escapeHtml(fromSymbol)}</span></div>
        <label class="value-box" for="amount">
          <span class="unit-corner">${escapeHtml(fromSymbol)}</span>
          <input class="amount-input" id="amount" inputmode="decimal" type="number" value="1" step="any" aria-label="${escapeHtml(fromTitle)} amount">
        </label>
        <div class="unit-name-card"><span>${escapeHtml(fromTitle)}</span><span class="unit-symbol-chip">${escapeHtml(fromSymbol)}</span></div>
      </section>
      <div class="swap-divider"><button class="swap" id="swap" aria-label="Open the reverse ${escapeHtml(toTitleText)} to ${escapeHtml(fromTitle)} converter">⇅</button></div>
      <section class="converter-section to-section" aria-labelledby="toLabel">
        <div class="converter-label to-label" id="toLabel"><span>To</span><span class="unit-pill">${escapeHtml(toSymbol)}</span></div>
        <label class="value-box result-box" for="resultBox">
          <span class="unit-corner">${escapeHtml(toSymbol)}</span>
          <input class="result-input" id="resultBox" readonly value="${formatNumber(factor)}" aria-label="${escapeHtml(toTitleText)} result">
        </label>
        <div class="unit-name-card result-unit"><span>${escapeHtml(toTitleText)}</span><span class="unit-symbol-chip">${escapeHtml(toSymbol)}</span></div>
      </section>
    </div>
    <div class="result" id="sentence">1 ${escapeHtml(from.name)} = ${formatNumber(factor)} ${escapeHtml(to.name)}</div>
    <p class="converter-note">This page is fixed to this conversion pair, so there are no unit selectors—just enter your ${escapeHtml(from.name)} value.</p>
    <a class="primary-action" href="${pairPath(to, from)}"><i class="fas fa-right-left"></i> Convert ${escapeHtml(toTitleText)} to ${escapeHtml(fromTitle)}</a>
  </div>
  <script>(function(){const converter=document.getElementById('converter'),amount=document.getElementById('amount'),resultBox=document.getElementById('resultBox'),sentence=document.getElementById('sentence'),swap=document.getElementById('swap');if(!converter||!amount||!resultBox||!sentence)return;const factor=Number(converter.dataset.factor),fromName=converter.dataset.fromName,toName=converter.dataset.toName;function fmt(v){const a=Math.abs(v);return a&& (a>=1e9||a<.000001)?v.toExponential(12).replace(/\\.0+e/,'e').replace(/(\\.\\d*?)0+e/,'$1e'):new Intl.NumberFormat('en-US',{maximumSignificantDigits:15}).format(v)}function calc(){const raw=amount.value;if(raw===''){resultBox.value='';sentence.textContent='Enter a value to convert '+fromName+' to '+toName;return}const n=Number(raw),r=n*factor;resultBox.value=Number.isFinite(r)?fmt(r):'';sentence.textContent=Number.isFinite(r)?fmt(n)+' '+fromName+' = '+fmt(r)+' '+toName:'Enter a valid number to convert'}amount.addEventListener('input',calc);if(swap)swap.addEventListener('click',()=>{location.href='${pairPath(to, from)}'});})();</script>`;
}

function landingPage() {
  const canonical = `${SITE}/length`;
  const allLinks = UNITS.map((from) => {
    const links = UNITS.filter((to) => to.slug !== from.slug)
      .map((to) => `<a href="${pairPath(from, to)}">${escapeHtml(toTitle(from.name))} to ${escapeHtml(toTitle(to.name))}</a>`).join('');
    return `<section class="unit-block"><h3>Convert ${escapeHtml(toTitle(from.name))} to Other Length Units</h3>${links}</section>`;
  }).join('');
  const popular = [
    ['kilometer','mile'], ['mile','kilometer'], ['meter','foot'], ['foot','meter'], ['inch','centimeter'], ['centimeter','inch'], ['astronomical-unit','light-year'], ['light-year','astronomical-unit']
  ].map(([a,b]) => `<a class="pill" href="/length/${a}-to-${b}">${escapeHtml(toTitle(UNIT_BY_SLUG[a].name))} to ${escapeHtml(toTitle(UNIT_BY_SLUG[b].name))}</a>`).join('');
  const body = `<main><section class="hero"><div class="wrap grid hero-grid"><div><span class="eyebrow">Server-rendered /length subfolder</span><h1>Length Converter</h1><p class="lead">Convert between ${UNITS.length} metric, imperial, nautical, astronomical, typographic, atomic, survey, and historical length units. Search with autocomplete, calculate instantly, and browse ${PAIR_COUNT.toLocaleString('en-US')} SEO-ready conversion pages.</p><div class="search"><input id="search" type="search" placeholder="Search units or pairs, e.g. astronomical unit to kilometer" autocomplete="off" aria-label="Search length conversion pairs"><div class="suggest" id="suggest"></div></div><div class="pill-row">${popular}</div></div><div>${converterWidget(UNIT_BY_SLUG.meter, UNIT_BY_SLUG.kilometer)}</div></div><div class="wrap grid stats"><div class="stat"><b>${UNITS.length}</b>length units</div><div class="stat"><b>${PAIR_COUNT.toLocaleString('en-US')}</b>conversion pairs</div><div class="stat"><b>SSR</b>indexable URLs</div></div></section><section class="section"><div class="wrap"><h2>All Length Conversion Pages</h2><p class="lead">Every link below opens a dedicated server-rendered conversion page with formula, live calculator, canonical metadata, structured data, and related unit links.</p><div class="links-grid">${allLinks}</div></div></section></main><script>const units=${JSON.stringify(UNITS)};const s=document.getElementById('search'),box=document.getElementById('suggest');function title(x){return x.replace(/\\b\\w/g,c=>c.toUpperCase()).replace(/\\(Uk\\)/g,'(UK)').replace(/\\(Us Survey\\)/g,'(US Survey)').replace(/Earth'S/g,"Earth's").replace(/Sun'S/g,"Sun's")}s.addEventListener('input',()=>{const q=s.value.trim().toLowerCase();if(!q){box.style.display='none';return}let hits=[];for(const f of units){for(const t of units){if(f.slug===t.slug)continue;const label=title(f.name)+' to '+title(t.name);if(label.toLowerCase().includes(q)||f.symbol.toLowerCase().includes(q)||t.symbol.toLowerCase().includes(q))hits.push({label,url:'/length/'+f.slug+'-to-'+t.slug});if(hits.length>=12)break}if(hits.length>=12)break}box.innerHTML=hits.length?hits.map(h=>'<a href="'+h.url+'">'+h.label+'</a>').join(''):'<a href="/length">No exact pair found — browse all units</a>';box.style.display='block'});document.addEventListener('click',e=>{if(!e.target.closest('.search'))box.style.display='none'});</script>`;
  return shell({
    title: 'Length Converter - Metric, Imperial, Astronomical & Survey Units',
    description: `Free length converter for ${UNITS.length} units and ${PAIR_COUNT.toLocaleString('en-US')} conversion pairs. Search, autocomplete, formulas, and dedicated SEO pages for every length unit pair.`,
    canonical,
    body,
    structuredData: [{ '@context':'https://schema.org', '@type':'WebApplication', name:'Length Converter', url:canonical, applicationCategory:'UtilitiesApplication', operatingSystem:'Any', offers:{'@type':'Offer', price:'0', priceCurrency:'USD'}, description:`Convert ${UNITS.length} length units across ${PAIR_COUNT} server-rendered pages.` }]
  });
}

function pairPage(from, to) {
  const factor = conversionFactor(from, to);
  const reverse = conversionFactor(to, from);
  const canonical = `${SITE}${pairPath(from, to)}`;
  const titleFrom = toTitle(from.name);
  const titleTo = toTitle(to.name);
  const relatedFrom = UNITS.filter((unit) => unit.slug !== from.slug && unit.slug !== to.slug).map((unit) => `<a href="${pairPath(from, unit)}">${escapeHtml(titleFrom)} to ${escapeHtml(toTitle(unit.name))}</a>`).join('');
  const relatedTo = UNITS.filter((unit) => unit.slug !== to.slug && unit.slug !== from.slug).slice(0, 30).map((unit) => `<a href="${pairPath(to, unit)}">${escapeHtml(titleTo)} to ${escapeHtml(toTitle(unit.name))}</a>`).join('');
  const relatedFromBlock = relatedFrom ? `<section class="unit-block"><h3>Convert ${escapeHtml(titleFrom)} to Other Length Units</h3>${relatedFrom}</section>` : '';
  const relatedToBlock = relatedTo ? `<section class="unit-block"><h3>Convert ${escapeHtml(titleTo)} to Other Length Units</h3>${relatedTo}</section>` : '';
  const body = `<main><div class="wrap breadcrumb"><a href="/">Omni Converter</a> / <a href="/length">Length</a> / ${escapeHtml(titleFrom)} to ${escapeHtml(titleTo)}</div><section class="hero"><div class="wrap grid hero-grid"><div><span class="eyebrow">Length conversion</span><h1>Convert ${escapeHtml(titleFrom)} to ${escapeHtml(titleTo)}</h1><p class="lead">Use this free ${escapeHtml(titleFrom)} to ${escapeHtml(titleTo)} converter to calculate precise length and distance values. The page is server-rendered, indexable, and includes the direct formula, reverse conversion, and related length-unit links.</p><div class="formula">1 ${escapeHtml(from.name)} = ${formatNumber(factor)} ${escapeHtml(to.name)}\n1 ${escapeHtml(to.name)} = ${formatNumber(reverse)} ${escapeHtml(from.name)}</div></div><div>${converterWidget(from, to)}</div></div></section><section class="section"><div class="wrap grid info-grid"><article class="card"><h2>${escapeHtml(titleFrom)} to ${escapeHtml(titleTo)} Formula</h2><p>To convert ${escapeHtml(from.name)} to ${escapeHtml(to.name)}, multiply the ${escapeHtml(from.name)} value by <strong>${formatNumber(factor)}</strong>.</p><p class="formula">${escapeHtml(to.name)} = ${escapeHtml(from.name)} × ${formatNumber(factor)}</p><p>Example: 5 ${escapeHtml(from.name)} = ${formatNumber(5 * factor)} ${escapeHtml(to.name)}.</p></article><article class="card"><h2>Unit Definitions</h2><p><strong>1 ${escapeHtml(from.name)}</strong>${from.symbol ? ` [${escapeHtml(from.symbol)}]` : ''} = ${formatNumber(from.meter)} meter.</p><p><strong>1 ${escapeHtml(to.name)}</strong>${to.symbol ? ` [${escapeHtml(to.symbol)}]` : ''} = ${formatNumber(to.meter)} meter.</p><p>The converter normalizes both units through the SI meter, then displays the target length value.</p></article></div></section><section class="section"><div class="wrap"><h2>Convert ${escapeHtml(titleFrom)} to Other Length Units</h2><div class="links-grid">${relatedFromBlock}</div></div></section><section class="section"><div class="wrap"><h2>More ${escapeHtml(titleTo)} Conversion Pages</h2></div></section></main>`;
  return shell({
    title: `Convert ${titleFrom} to ${titleTo} - Length Conversion Calculator`,
    description: `Convert ${from.name} to ${to.name} instantly. 1 ${from.name} equals ${formatNumber(factor)} ${to.name}. Includes formula, calculator, unit definitions, and related length conversions.`,
    canonical,
    body,
    structuredData: [
      { '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem', position:1, name:'Home', item:SITE }, { '@type':'ListItem', position:2, name:'Length Converter', item:`${SITE}/length` }, { '@type':'ListItem', position:3, name:`${titleFrom} to ${titleTo}`, item:canonical }] },
      { '@context':'https://schema.org', '@type':'WebApplication', name:`${titleFrom} to ${titleTo} Converter`, url:canonical, applicationCategory:'UtilitiesApplication', operatingSystem:'Any', offers:{'@type':'Offer', price:'0', priceCurrency:'USD'} },
      { '@context':'https://schema.org', '@type':'FAQPage', mainEntity:[{ '@type':'Question', name:`How do I convert ${titleFrom} to ${titleTo}?`, acceptedAnswer:{ '@type':'Answer', text:`Multiply the ${from.name} value by ${formatNumber(factor)} to get ${to.name}.` } }, { '@type':'Question', name:`How many ${titleTo} are in one ${titleFrom}?`, acceptedAnswer:{ '@type':'Answer', text:`One ${from.name} equals ${formatNumber(factor)} ${to.name}.` } }] }
    ]
  });
}

function notFound(res) {
  res.statusCode = 404;
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(shell({
    title: 'Length Conversion Not Found - Omni Converter',
    description: 'The requested length conversion page could not be found. Browse every length unit pair on the Length Converter landing page.',
    canonical: `${SITE}/length`,
    body: `<main class="wrap error"><h1>Length conversion not found</h1><p class="lead">This pair is not available. Visit the <a href="/length">Length Converter</a> to search every supported conversion.</p></main>`
  }));
}

function getPath(req) {
  const raw = req.headers['x-original-url'] || req.headers['x-rewrite-url'] || req.url || '/length';
  try {
    const parsed = new URL(raw, SITE);
    const pair = parsed.searchParams.get('pair');
    if (pair) return `/length/${pair}`.replace(/\/$/, '');
    return parsed.pathname.replace(/\/$/, '') || '/length';
  } catch {
    return '/length';
  }
}

module.exports = (req, res) => {
  const path = getPath(req);
  res.setHeader('cache-control', 's-maxage=86400, stale-while-revalidate=604800');
  if (path === '/length' || path === '/api/length') {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(landingPage());
    return;
  }
  const slug = path.replace(/^\/length\//, '').replace(/^\/api\/length\/?/, '');
  const [fromSlug, toSlug, extra] = slug.split('-to-');
  if (!fromSlug || !toSlug || extra !== undefined) return notFound(res);
  const from = UNIT_BY_SLUG[fromSlug];
  const to = UNIT_BY_SLUG[toSlug];
  if (!from || !to || from.slug === to.slug) return notFound(res);
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(pairPage(from, to));
};

module.exports.UNITS = UNITS;
module.exports._internals = { formatNumber, conversionFactor, getPath, pairPath };
