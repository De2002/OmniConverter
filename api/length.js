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
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}<\/script>`;
}

/* ─── SHARED CSS ─────────────────────────────────────────────────────────── */
const SHARED_CSS = `
  :root{--brand:#f97316;--brand-dk:#c2410c;--brand-lt:#fff7ed;--ink:#172033;--muted:#64748b;--line:#fed7aa;--soft:#fff7ed;--bg:#fffaf5}
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink);line-height:1.6;padding-top:64px}
  a{color:inherit;text-decoration:none}
  /* Layout */
  .wrap{width:min(1120px,calc(100% - 32px));margin:auto}
  .wrap-sm{width:min(740px,calc(100% - 32px));margin:auto}
  /* Typography */
  h1{font-family:'Space Grotesk',Inter,sans-serif;font-size:clamp(1.9rem,5vw,3.8rem);font-weight:900;line-height:1.05;letter-spacing:-.04em;margin-bottom:.5rem}
  h2{font-family:'Space Grotesk',Inter,sans-serif;font-size:clamp(1.35rem,2.5vw,1.9rem);font-weight:800;line-height:1.15;letter-spacing:-.03em;margin-bottom:.75rem}
  h3{font-weight:700;font-size:1rem;line-height:1.3;margin-bottom:.4rem}
  p{color:var(--muted);line-height:1.75}
  .lead{font-size:clamp(1rem,1.8vw,1.15rem);color:#475569;line-height:1.8}
  .gradient-text{background:linear-gradient(135deg,#f97316,#fb923c 50%,#fdba74);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  /* Navbar */
  .nav{position:fixed;top:0;inset-x:0;z-index:50;height:64px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-bottom:1px solid #ffedd5;display:flex;align-items:center}
  .nav-inner{display:flex;align-items:center;justify-content:space-between;gap:16px}
  .nav-logo{display:flex;align-items:center;gap:10px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.15rem;color:var(--ink)}
  .nav-logo img{width:34px;height:34px;border-radius:10px;object-fit:contain}
  .nav-links{display:flex;align-items:center;gap:4px}
  .nav-links a{padding:6px 12px;border-radius:8px;font-size:.875rem;font-weight:500;color:#475569;transition:background .15s,color .15s}
  .nav-links a:hover{background:#fff7ed;color:var(--brand-dk)}
  .nav-cta{display:inline-flex;align-items:center;gap:6px;background:var(--brand);color:#fff;font-weight:600;font-size:.875rem;padding:8px 16px;border-radius:10px;transition:background .15s}
  .nav-cta:hover{background:var(--brand-dk)}
  /* Breadcrumb */
  .breadcrumb{font-size:.8rem;color:#94a3b8;padding:14px 0 0}
  .breadcrumb a{color:#c2410c}
  .breadcrumb a:hover{text-decoration:underline}
  /* Sections */
  .section{padding:48px 0}
  .section-sm{padding:32px 0}
  /* Cards */
  .card{background:#fff;border:1px solid #ffedd5;border-radius:20px;padding:22px}
  /* ── LANDING CONVERTER (compact FROM/TO widget) ── */
  .conv-widget{background:#fff;border:1.5px solid #f0f0f0;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(249,115,22,.09)}
  .conv-from{background:#fafafa;padding:16px 16px 12px}
  .conv-to{background:#fff7ed;padding:12px 16px 16px}
  .conv-label{font-size:.65rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:8px}
  .conv-label.to-label{color:var(--brand-dk)}
  .conv-display{position:relative;background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;margin-bottom:8px;overflow:hidden}
  .conv-display input{width:100%;border:none;outline:none;font-family:'Space Grotesk',Inter,sans-serif;font-size:2rem;font-weight:700;color:#1e293b;padding:14px 44px 14px 16px;background:transparent;min-width:0}
  .conv-display .unit-badge{position:absolute;top:8px;right:10px;font-size:.7rem;font-weight:700;color:#94a3b8;background:#f1f5f9;padding:2px 6px;border-radius:6px}
  .conv-display .result-val{font-family:'Space Grotesk',Inter,sans-serif;font-size:2rem;font-weight:700;color:#1e293b;padding:14px 44px 14px 16px;min-height:62px;word-break:break-all;line-height:1.2;display:flex;align-items:center}
  .conv-display-readonly{background:#fff8f2}
  .conv-select{width:100%;border:1.5px solid #e5e7eb;border-radius:12px;padding:10px 12px;font:inherit;font-size:.875rem;font-weight:500;color:#374151;background:#fff;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;cursor:pointer}
  .conv-select:focus{outline:none;border-color:var(--brand)}
  .conv-swap-row{display:flex;align-items:center;justify-content:center;padding:0;position:relative;height:0;z-index:2}
  .conv-swap{width:36px;height:36px;border-radius:50%;border:2px solid var(--brand);background:#fff;color:var(--brand);font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,transform .2s;position:relative;top:-2px;box-shadow:0 2px 8px rgba(249,115,22,.2)}
  .conv-swap:hover{background:var(--brand);color:#fff;transform:rotate(180deg)}
  .conv-sentence{font-size:.8rem;color:#64748b;text-align:center;padding:10px 14px;border-top:1px solid #ffedd5;background:#fffbf7}
  /* ── PAIR PAGE CONVERTER (simple inline) ── */
  .pair-conv{background:#fff;border:1.5px solid #ffedd5;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(249,115,22,.08)}
  .pair-conv-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:0}
  .pair-conv-side{padding:20px 20px 18px}
  .pair-conv-side label{display:block;font-size:.65rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;margin-bottom:8px}
  .pair-conv-side.to-side{background:#fff7ed}
  .pair-conv-side.to-side label{color:var(--brand-dk)}
  .pair-conv-side input{width:100%;border:1.5px solid #e5e7eb;border-radius:12px;padding:12px 14px;font-family:'Space Grotesk',Inter,sans-serif;font-size:1.5rem;font-weight:700;color:#1e293b;background:#fff;outline:none;transition:border .15s}
  .pair-conv-side input:focus{border-color:var(--brand)}
  .pair-conv-side .result{font-family:'Space Grotesk',Inter,sans-serif;font-size:1.5rem;font-weight:700;color:#1e293b;padding:12px 14px;border-radius:12px;border:1.5px solid #ffedd5;background:#fff8f2;min-height:54px;display:flex;align-items:center;word-break:break-all}
  .pair-conv-side .unit-name{margin-top:6px;font-size:.78rem;font-weight:600;color:#64748b}
  .pair-conv-divider{width:1px;background:#ffedd5;height:100%;align-self:stretch}
  .pair-conv-swap{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 8px;gap:4px}
  .pair-conv-swap button{width:34px;height:34px;border-radius:50%;border:2px solid var(--brand);background:#fff;color:var(--brand);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,transform .2s}
  .pair-conv-swap button:hover{background:var(--brand);color:#fff;transform:rotate(180deg)}
  /* Quick ref table */
  .ref-table{width:100%;border-collapse:collapse;font-size:.875rem}
  .ref-table th{background:#fff7ed;color:var(--brand-dk);font-weight:700;padding:9px 14px;text-align:left;border-bottom:1.5px solid #ffedd5}
  .ref-table td{padding:8px 14px;border-bottom:1px solid #f1f5f9;color:#374151}
  .ref-table tr:last-child td{border-bottom:none}
  .ref-table tr:hover td{background:#fffaf5}
  /* Formula block */
  .formula-block{background:#0f172a;color:#e2e8f0;border-radius:14px;padding:16px 18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.875rem;overflow-x:auto;line-height:1.8}
  .formula-block .comment{color:#64748b}
  .formula-block .highlight{color:#fb923c}
  /* Pill links */
  .pill-wrap{display:flex;flex-wrap:wrap;gap:8px}
  .pill{padding:6px 12px;border-radius:999px;background:#fff;border:1px solid #ffedd5;font-size:.8rem;color:#475569;transition:background .15s,color .15s;display:inline-block}
  .pill:hover{background:var(--brand);color:#fff;border-color:var(--brand)}
  /* Search */
  .search-wrap{position:relative}
  .search-wrap input{width:100%;border:1.5px solid #e5e7eb;border-radius:14px;padding:12px 16px 12px 42px;font:inherit;font-size:.9rem;outline:none;background:#fff;transition:border .15s,box-shadow .15s}
  .search-wrap input:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(249,115,22,.15)}
  .search-wrap .search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none}
  .suggest{position:absolute;left:0;right:0;top:calc(100% + 6px);background:#fff;border:1.5px solid #ffedd5;border-radius:14px;box-shadow:0 12px 40px rgba(15,23,42,.12);display:none;overflow:hidden;z-index:10;max-height:280px;overflow-y:auto}
  .suggest a{display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:.875rem;color:#374151;border-bottom:1px solid #f8fafc;transition:background .12s}
  .suggest a:hover{background:#fff7ed;color:var(--brand-dk)}
  .suggest a:last-child{border-bottom:none}
  /* Unit categories */
  .cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
  .cat-card{background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:14px 16px;transition:border-color .15s,box-shadow .15s}
  .cat-card:hover{border-color:var(--line);box-shadow:0 4px 16px rgba(249,115,22,.08)}
  .cat-card h4{font-size:.875rem;font-weight:700;color:#1e293b;margin-bottom:.25rem}
  .cat-card p{font-size:.75rem;color:#94a3b8;margin:0}
  /* Links grid */
  .links-col{columns:3 220px;column-gap:16px}
  .unit-block{break-inside:avoid;margin-bottom:14px;padding:14px 16px;border:1px solid #ffedd5;border-radius:16px;background:#fff}
  .unit-block h3{font-size:.875rem;color:#1e293b;margin-bottom:6px}
  .unit-block a{display:block;font-size:.8rem;color:#64748b;padding:3px 0;transition:color .12s}
  .unit-block a:hover{color:var(--brand-dk);text-decoration:underline}
  /* Stats */
  .stat-row{display:flex;flex-wrap:wrap;gap:16px;margin-top:20px}
  .stat-item{flex:1;min-width:100px;text-align:center;background:#fff;border:1px solid #ffedd5;border-radius:14px;padding:14px 10px}
  .stat-item b{display:block;font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:800;color:var(--brand-dk)}
  .stat-item span{font-size:.75rem;color:#94a3b8}
  /* Hero */
  .hero{padding:44px 0 32px}
  /* Info boxes */
  .info-box{background:#fff;border:1px solid #ffedd5;border-radius:18px;padding:20px 22px}
  .info-box h3{font-size:1rem;font-weight:700;color:#1e293b;margin-bottom:.5rem}
  .info-box p{font-size:.875rem;color:#64748b;line-height:1.7;margin-bottom:.5rem}
  .info-box p:last-child{margin-bottom:0}
  /* Footer */
  .footer{margin-top:48px;border-top:1px solid #ffedd5;padding:28px 0;color:#94a3b8;font-size:.8rem}
  .footer a{color:#c2410c;text-decoration:none}
  .footer a:hover{text-decoration:underline}
  .footer-inner{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
  .footer-links{display:flex;gap:16px}
  .footer-links a{color:#94a3b8;transition:color .12s}
  .footer-links a:hover{color:var(--brand-dk)}
  /* Mobile */
  @media(max-width:640px){
    .pair-conv-row{grid-template-columns:1fr}
    .pair-conv-divider{display:none}
    .pair-conv-swap{flex-direction:row;padding:8px 20px}
    .pair-conv-swap button{transform:rotate(90deg)}
    .pair-conv-swap button:hover{transform:rotate(270deg)}
    .links-col{columns:1}
    .cat-grid{grid-template-columns:1fr 1fr}
  }
`;

/* ─── SHELL ──────────────────────────────────────────────────────────────── */
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
  <link rel="icon" type="image/png" href="https://cdn-ai.onspace.ai/onspace/project/uploads/387tjVXsepM8baiJWrdVRg/omnilogo.png">
  <link rel="apple-touch-icon" href="https://cdn-ai.onspace.ai/onspace/project/uploads/387tjVXsepM8baiJWrdVRg/omnilogo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>${SHARED_CSS}</style>
  ${schemas}
</head>
<body>
  <nav class="nav">
    <div class="wrap nav-inner">
      <a href="/" class="nav-logo" aria-label="Omni Converter Home">
        <img src="https://cdn-ai.onspace.ai/onspace/project/uploads/387tjVXsepM8baiJWrdVRg/omnilogo.png" alt="Omni Converter Logo">
        <span>Omni<span style="color:var(--brand)">Converter</span></span>
      </a>
      <div class="nav-links" style="display:none" id="deskNav">
        <a href="/">Home</a>
        <a href="/length">Length</a>
      </div>
      <a href="/length" class="nav-cta"><i class="fas fa-ruler-horizontal" style="font-size:.75rem"></i> Length Converter</a>
    </div>
  </nav>
  ${body}
  <footer class="footer">
    <div class="wrap footer-inner">
      <div>© ${new Date().getUTCFullYear()} <a href="https://omniconverter.cyou">Omni Converter</a> · Free online unit converters</div>
      <div class="footer-links">
        <a href="/">All Converters</a>
        <a href="/length">Length</a>
        <a href="https://omniconverter.cyou/#faq" rel="noopener">FAQ</a>
      </div>
    </div>
  </footer>
  <script>
    // Show desktop nav if wide enough
    if(window.innerWidth >= 640) document.getElementById('deskNav').style.display='flex';
  <\/script>
</body>
</html>`;
}

/* ─── LANDING CONVERTER WIDGET (unit-selector style) ─────────────────────── */
function converterWidget(from, to) {
  const options = UNITS.map((u) =>
    `<option value="${u.slug}"${u.slug === from.slug ? ' selected' : ''}>${escapeHtml(unitLabel(u))}</option>`
  ).join('');
  const toOptions = UNITS.map((u) =>
    `<option value="${u.slug}"${u.slug === to.slug ? ' selected' : ''}>${escapeHtml(unitLabel(u))}</option>`
  ).join('');
  const initResult = formatNumber(conversionFactor(from, to));

  return `<div class="conv-widget" id="convWidget" data-from="${from.slug}" data-to="${to.slug}">
  <!-- FROM -->
  <div class="conv-from">
    <div class="conv-label">FROM</div>
    <div class="conv-display">
      <input id="cAmount" inputmode="decimal" type="number" value="1" step="any" aria-label="Amount to convert" autocomplete="off">
      <span class="unit-badge" id="cFromBadge">${escapeHtml(from.symbol || toTitle(from.name).slice(0,4))}</span>
    </div>
    <select id="cFromUnit" class="conv-select" aria-label="From unit">${options}</select>
  </div>
  <!-- SWAP -->
  <div style="display:flex;align-items:center;justify-content:center;height:28px;position:relative;z-index:2">
    <button class="conv-swap" id="cSwap" aria-label="Swap units" title="Swap units">⇅</button>
  </div>
  <!-- TO -->
  <div class="conv-to">
    <div class="conv-label to-label">TO</div>
    <div class="conv-display conv-display-readonly">
      <div class="result-val" id="cResult">${initResult}</div>
      <span class="unit-badge" id="cToBadge">${escapeHtml(to.symbol || toTitle(to.name).slice(0,4))}</span>
    </div>
    <select id="cToUnit" class="conv-select" aria-label="To unit">${toOptions}</select>
  </div>
  <div class="conv-sentence" id="cSentence">1 ${escapeHtml(from.name)} = ${initResult} ${escapeHtml(to.name)}</div>
</div>
<script>
(function(){
  var UNITS=${JSON.stringify(UNITS)};
  var bySlug=Object.fromEntries(UNITS.map(function(u){return[u.slug,u]}));
  var amt=document.getElementById('cAmount'),
      fromSel=document.getElementById('cFromUnit'),
      toSel=document.getElementById('cToUnit'),
      result=document.getElementById('cResult'),
      sentence=document.getElementById('cSentence'),
      fromBadge=document.getElementById('cFromBadge'),
      toBadge=document.getElementById('cToBadge');
  function fmt(v){var a=Math.abs(v);return a&&(a>=1e9||a<.000001)?v.toExponential(10).replace(/\\.0+e/,'e').replace(/(\\d\\.\\d*?)0+e/,'$1e'):new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(v)}
  function badge(u){return u.symbol||u.name.split(' ').map(function(w){return w[0]}).join('').toUpperCase().slice(0,4)}
  function calc(){
    var f=bySlug[fromSel.value],t=bySlug[toSel.value],n=Number(amt.value||0),r=n*f.meter/t.meter;
    result.textContent=fmt(r);
    sentence.textContent=fmt(n)+' '+f.name+' = '+fmt(r)+' '+t.name;
    fromBadge.textContent=badge(f);
    toBadge.textContent=badge(t);
  }
  function navigate(){if(fromSel.value!==toSel.value)location.href='/length/'+fromSel.value+'-to-'+toSel.value}
  amt.addEventListener('input',calc);
  fromSel.addEventListener('change',function(){calc();setTimeout(navigate,300)});
  toSel.addEventListener('change',function(){calc();setTimeout(navigate,300)});
  document.getElementById('cSwap').addEventListener('click',function(){location.href='/length/'+toSel.value+'-to-'+fromSel.value});
})();
<\/script>`;
}

/* ─── PAIR PAGE CONVERTER (fixed units, input → result) ──────────────────── */
function pairConverterWidget(from, to) {
  const factor = conversionFactor(from, to);
  const titleFrom = toTitle(from.name);
  const titleTo = toTitle(to.name);
  const fromSymbol = from.symbol ? ` (${from.symbol})` : '';
  const toSymbol = to.symbol ? ` (${to.symbol})` : '';

  return `<div class="pair-conv" id="pairConv">
  <div class="pair-conv-row">
    <div class="pair-conv-side" id="pcFromSide">
      <label>${escapeHtml(titleFrom)}${escapeHtml(fromSymbol)}</label>
      <input id="pcFrom" inputmode="decimal" type="number" value="1" step="any" aria-label="Value in ${escapeHtml(from.name)}" autocomplete="off">
    </div>
    <div class="pair-conv-swap">
      <button id="pcSwap" aria-label="Swap to ${escapeHtml(titleTo)} → ${escapeHtml(titleFrom)}" title="Swap conversion direction" onclick="location.href='${pairPath(to, from)}'">⇅</button>
    </div>
    <div class="pair-conv-side to-side" id="pcToSide">
      <label>${escapeHtml(titleTo)}${escapeHtml(toSymbol)}</label>
      <div class="result" id="pcResult">${formatNumber(factor)}</div>
    </div>
  </div>
</div>
<script>
(function(){
  var factor=${factor};
  var inp=document.getElementById('pcFrom'),res=document.getElementById('pcResult');
  function fmt(v){var a=Math.abs(v);return a&&(a>=1e9||a<.000001)?v.toExponential(10).replace(/\\.0+e/,'e').replace(/(\\d\\.\\d*?)0+e/,'$1e'):new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(v)}
  inp.addEventListener('input',function(){var n=Number(inp.value||0);res.textContent=fmt(n*factor)});
})();
<\/script>`;
}

/* ─── QUICK REFERENCE TABLE ──────────────────────────────────────────────── */
function quickRefTable(from, to) {
  const factor = conversionFactor(from, to);
  const titleFrom = toTitle(from.name);
  const titleTo = toTitle(to.name);
  const values = [0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 500, 1000];
  const rows = values.map((v) => {
    const r = v * factor;
    return `<tr><td>${formatNumber(v)} ${escapeHtml(from.symbol || titleFrom)}</td><td>${formatNumber(r)} ${escapeHtml(to.symbol || titleTo)}</td></tr>`;
  }).join('');
  return `<table class="ref-table" aria-label="Quick reference conversion table">
    <thead><tr><th>${escapeHtml(titleFrom)}</th><th>${escapeHtml(titleTo)}</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

/* ─── UNIT INFO ──────────────────────────────────────────────────────────── */
function unitInfo(unit) {
  const name = toTitle(unit.name);
  const sym = unit.symbol ? ` (${unit.symbol})` : '';
  const meterVal = formatNumber(unit.meter);
  const kmVal = formatNumber(unit.meter / 1000);
  const mileVal = formatNumber(unit.meter / 1609.344);

  let context = '';
  if (unit.meter >= 9e15) context = 'Used in astronomy to describe distances between stars and galaxies.';
  else if (unit.meter >= 1e9) context = 'Used for distances within our solar system.';
  else if (unit.meter >= 1000) context = 'Commonly used for measuring geographic and travel distances.';
  else if (unit.meter >= 0.1) context = 'Used for everyday human-scale measurements.';
  else if (unit.meter >= 0.001) context = 'Suitable for precise measurements in engineering and manufacturing.';
  else if (unit.meter >= 1e-9) context = 'Used in microscopy, nanotechnology, and material science.';
  else context = 'Used in atomic physics and quantum mechanics for subatomic-scale measurements.';

  return `<p><strong>1 ${escapeHtml(name)}${escapeHtml(sym)}</strong> = <strong>${meterVal} metre${meterVal === '1' ? '' : 's'}</strong>.${unit.meter !== 1000 && unit.meter !== 1 ? ` Equivalent to ${kmVal} km or ${mileVal} miles.` : ''}</p>
  <p>${context}</p>`;
}

/* ─── LANDING PAGE ───────────────────────────────────────────────────────── */
function landingPage() {
  const canonical = `${SITE}/length`;

  // Popular pairs for quick-access pills
  const popularPairs = [
    ['kilometer','mile'], ['mile','kilometer'],
    ['meter','foot'], ['foot','meter'],
    ['inch','centimeter'], ['centimeter','inch'],
    ['meter','yard'], ['kilometer','meter'],
    ['mile','meter'], ['foot','inch'],
  ].map(([a, b]) => {
    const ua = UNIT_BY_SLUG[a], ub = UNIT_BY_SLUG[b];
    if (!ua || !ub) return '';
    return `<a class="pill" href="/length/${a}-to-${b}">${escapeHtml(toTitle(ua.name))} → ${escapeHtml(toTitle(ub.name))}</a>`;
  }).join('');

  // Unit categories
  const categories = [
    { name: 'Metric (SI)', units: ['kilometer','meter','centimeter','millimeter','micrometer','nanometer','picometer'], desc: 'Standard international units' },
    { name: 'Imperial & US', units: ['mile','yard','foot','inch','furlong','rod','fathom'], desc: 'US customary & British imperial' },
    { name: 'Nautical', units: ['nautical-mile-international','nautical-league-int','fathom','cable'], desc: 'Marine navigation units' },
    { name: 'Astronomical', units: ['light-year','astronomical-unit','parsec','kiloparsec','megaparsec'], desc: 'Space & cosmic distances' },
    { name: 'Typographic', units: ['point','pica','twip'], desc: 'Print & digital typography' },
    { name: 'Historical', units: ['cubit-uk','cubit-greek','barleycorn','hand','ell','rod','furlong'], desc: 'Ancient & traditional units' },
  ];
  const catCards = categories.map((cat) => {
    const links = cat.units.filter((s) => UNIT_BY_SLUG[s]).map((s) => {
      const u = UNIT_BY_SLUG[s];
      return `<a href="/length/${s}-to-meter" class="pill" style="font-size:.75rem;padding:4px 9px">${escapeHtml(toTitle(u.name))}</a>`;
    }).join('');
    return `<div class="cat-card"><h4>${escapeHtml(cat.name)}</h4><p style="margin-bottom:8px">${escapeHtml(cat.desc)}</p><div style="display:flex;flex-wrap:wrap;gap:5px">${links}</div></div>`;
  }).join('');

  // All conversion links grouped by "from" unit
  const allLinks = UNITS.map((from) => {
    const links = UNITS.filter((to) => to.slug !== from.slug)
      .map((to) => `<a href="${pairPath(from, to)}">${escapeHtml(toTitle(from.name))} to ${escapeHtml(toTitle(to.name))}</a>`).join('');
    return `<section class="unit-block"><h3>Convert ${escapeHtml(toTitle(from.name))}</h3>${links}</section>`;
  }).join('');

  const body = `
<main>
  <!-- HERO -->
  <section class="hero" style="background:linear-gradient(180deg,#fff7ed 0,#fff 80%)">
    <div class="wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Omni Converter</a> <span style="margin:0 5px;color:#cbd5e1">›</span> <span>Length Converter</span>
      </nav>
      <div style="max-width:640px">
        <h1>Length <span class="gradient-text">Converter</span></h1>
        <p class="lead" style="margin:12px 0 20px">Convert between ${UNITS.length} length and distance units — metric, imperial, nautical, astronomical, and historical. Select your units below or search for a specific pair.</p>

        <!-- Search -->
        <div class="search-wrap" style="margin-bottom:16px">
          <i class="fas fa-search search-icon" aria-hidden="true"></i>
          <input id="lSearch" type="search" placeholder="Search units, e.g. 'feet to metres' or 'light year'" autocomplete="off" aria-label="Search length conversion pairs">
          <div class="suggest" id="lSuggest" role="listbox"></div>
        </div>

        <!-- Popular conversions -->
        <div style="margin-bottom:20px">
          <p style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:8px">Popular conversions</p>
          <div class="pill-wrap">${popularPairs}</div>
        </div>

        <!-- Stats -->
        <div class="stat-row" style="margin-bottom:28px">
          <div class="stat-item"><b>${UNITS.length}</b><span>Length units</span></div>
          <div class="stat-item"><b>${PAIR_COUNT.toLocaleString('en-US')}</b><span>Conversion pairs</span></div>
          <div class="stat-item"><b>Free</b><span>No sign-up</span></div>
        </div>
      </div>

      <!-- Converter widget — full width below hero text -->
      <div style="max-width:520px">
        ${converterWidget(UNIT_BY_SLUG.meter, UNIT_BY_SLUG.kilometer)}
      </div>
    </div>
  </section>

  <!-- UNIT CATEGORIES -->
  <section class="section" style="background:#fff">
    <div class="wrap">
      <h2>Length Unit Categories</h2>
      <p style="margin-bottom:20px">Not sure which unit you need? Browse by category to find the right converter.</p>
      <div class="cat-grid">${catCards}</div>
    </div>
  </section>

  <!-- HOW TO USE -->
  <section class="section-sm" style="background:#fffaf5">
    <div class="wrap">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
        <div class="info-box">
          <h3><i class="fas fa-ruler-horizontal" style="color:var(--brand);margin-right:6px"></i>How to use this converter</h3>
          <p>Enter a number in the <strong>From</strong> field, then choose your source unit and target unit from the dropdowns. The result updates instantly as you type.</p>
        </div>
        <div class="info-box">
          <h3><i class="fas fa-exchange-alt" style="color:#3b82f6;margin-right:6px"></i>Swap units instantly</h3>
          <p>Click the <strong>⇅ swap button</strong> between the two unit selectors to reverse the conversion direction — no need to re-enter your value.</p>
        </div>
        <div class="info-box">
          <h3><i class="fas fa-link" style="color:#10b981;margin-right:6px"></i>Shareable conversion pages</h3>
          <p>Every unit pair has its own dedicated URL — for example <code style="background:#f1f5f9;padding:1px 4px;border-radius:4px;font-size:.8rem">/length/meter-to-foot</code>. Bookmark or share any conversion directly.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ALL CONVERSIONS -->
  <section class="section" style="background:#fff">
    <div class="wrap">
      <h2>All Length Conversions</h2>
      <p style="margin-bottom:20px">Choose any pair below to open a dedicated converter with formula, quick-reference table, and unit definitions.</p>
      <div class="links-col">${allLinks}</div>
    </div>
  </section>
</main>

<script>
(function(){
  var UNITS=${JSON.stringify(UNITS)};
  var s=document.getElementById('lSearch'),box=document.getElementById('lSuggest');
  function title(x){return x.replace(/\\b\\w/g,function(c){return c.toUpperCase()}).replace(/\\(Uk\\)/g,'(UK)').replace(/\\(Us Survey\\)/g,'(US Survey)').replace(/Earth'S/g,"Earth's").replace(/Sun'S/g,"Sun's")}
  s.addEventListener('input',function(){
    var q=s.value.trim().toLowerCase();
    if(!q){box.style.display='none';return}
    var hits=[];
    for(var i=0;i<UNITS.length&&hits.length<10;i++){
      var f=UNITS[i];
      if(f.name.toLowerCase().includes(q)||(f.symbol&&f.symbol.toLowerCase().includes(q))){
        for(var j=0;j<UNITS.length&&hits.length<10;j++){
          var t=UNITS[j];
          if(f.slug!==t.slug){
            hits.push({label:title(f.name)+' → '+title(t.name),url:'/length/'+f.slug+'-to-'+t.slug});
          }
        }
      }
    }
    if(!hits.length){
      for(var i=0;i<UNITS.length&&hits.length<8;i++){
        var f=UNITS[i];
        for(var j=0;j<UNITS.length&&hits.length<8;j++){
          var t=UNITS[j];
          if(f.slug!==t.slug){
            var label=title(f.name)+' to '+title(t.name);
            if(label.toLowerCase().includes(q))hits.push({label:title(f.name)+' → '+title(t.name),url:'/length/'+f.slug+'-to-'+t.slug});
          }
        }
      }
    }
    box.innerHTML=hits.length
      ?hits.map(function(h){return'<a href="'+h.url+'"><i class="fas fa-arrow-right" style="font-size:.65rem;color:var(--brand);opacity:.7"></i>'+h.label+'</a>'}).join('')
      :'<a href="/length"><i class="fas fa-search" style="font-size:.65rem;color:#94a3b8"></i>No results — browse all conversions</a>';
    box.style.display='block';
  });
  document.addEventListener('click',function(e){if(!e.target.closest('.search-wrap'))box.style.display='none'});
})();
<\/script>`;

  return shell({
    title: `Length Converter — ${UNITS.length} Units: km, miles, feet, inches & more`,
    description: `Free length converter for ${UNITS.length} units. Instantly convert kilometres to miles, metres to feet, inches to centimetres, and ${PAIR_COUNT.toLocaleString('en-US')} other length unit pairs. No sign-up needed.`,
    canonical,
    body,
    structuredData: [
      {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        name: 'Length Converter', url: canonical,
        applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: `Convert between ${UNITS.length} length units — metric, imperial, nautical, astronomical and more.`
      },
      {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'How do I convert kilometres to miles?', acceptedAnswer: { '@type': 'Answer', text: 'Multiply the kilometre value by 0.621371. For example, 10 km × 0.621371 = 6.21371 miles. Use the converter above to get instant results for any value.' } },
          { '@type': 'Question', name: 'How many centimetres are in an inch?', acceptedAnswer: { '@type': 'Answer', text: 'There are exactly 2.54 centimetres in one inch. To convert inches to centimetres, multiply by 2.54.' } },
          { '@type': 'Question', name: 'What is the difference between a nautical mile and a regular mile?', acceptedAnswer: { '@type': 'Answer', text: 'A nautical mile (1,852 m) is based on the circumference of the Earth and is used in maritime and aviation navigation. A standard mile (1,609.344 m) is a US/imperial land unit.' } },
        ]
      }
    ]
  });
}

/* ─── PAIR PAGE ──────────────────────────────────────────────────────────── */
function pairPage(from, to) {
  const factor = conversionFactor(from, to);
  const reverse = conversionFactor(to, from);
  const canonical = `${SITE}${pairPath(from, to)}`;
  const titleFrom = toTitle(from.name);
  const titleTo = toTitle(to.name);

  // Related "from" links (other targets for this source unit)
  const relatedFromLinks = UNITS.filter((u) => u.slug !== from.slug && u.slug !== to.slug).slice(0, 20)
    .map((u) => `<a class="pill" href="${pairPath(from, u)}">${escapeHtml(titleFrom)} → ${escapeHtml(toTitle(u.name))}</a>`).join('');

  // Related "to" links (other sources for this target unit)
  const relatedToLinks = UNITS.filter((u) => u.slug !== to.slug && u.slug !== from.slug).slice(0, 20)
    .map((u) => `<a class="pill" href="${pairPath(u, to)}">${escapeHtml(toTitle(u.name))} → ${escapeHtml(titleTo)}</a>`).join('');

  // Common example quantities
  const examples = [1, 5, 10, 100].map((v) => {
    return `<li><strong>${v} ${escapeHtml(from.symbol || titleFrom)}</strong> = ${formatNumber(v * factor)} ${escapeHtml(to.symbol || titleTo)}</li>`;
  }).join('');

  const body = `
<main>
  <!-- BREADCRUMB -->
  <div class="wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Omni Converter</a>
      <span style="margin:0 5px;color:#cbd5e1">›</span>
      <a href="/length">Length</a>
      <span style="margin:0 5px;color:#cbd5e1">›</span>
      <span>${escapeHtml(titleFrom)} to ${escapeHtml(titleTo)}</span>
    </nav>
  </div>

  <!-- HERO + CONVERTER -->
  <section class="hero" style="background:linear-gradient(180deg,#fff7ed 0,#fff 80%)">
    <div class="wrap">
      <div style="max-width:680px">
        <h1>Convert <span class="gradient-text">${escapeHtml(titleFrom)}</span> to ${escapeHtml(titleTo)}</h1>
        <p class="lead" style="margin:12px 0 18px">
          Enter a value in ${escapeHtml(titleFrom)}${from.symbol ? ` (${escapeHtml(from.symbol)})` : ''} and instantly see the result in ${escapeHtml(titleTo)}${to.symbol ? ` (${escapeHtml(to.symbol)})` : ''}.
          <strong>1 ${escapeHtml(from.name)} = ${formatNumber(factor)} ${escapeHtml(to.name)}.</strong>
        </p>

        <!-- Key fact cards -->
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px">
          <div style="background:#fff;border:1px solid #ffedd5;border-radius:12px;padding:12px 16px;flex:1;min-width:140px">
            <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:4px">1 ${escapeHtml(from.symbol||titleFrom)} equals</div>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:1.25rem;font-weight:800;color:var(--brand-dk)">${formatNumber(factor)} <span style="font-size:.9rem;font-weight:600;color:#64748b">${escapeHtml(to.symbol||titleTo)}</span></div>
          </div>
          <div style="background:#fff;border:1px solid #ffedd5;border-radius:12px;padding:12px 16px;flex:1;min-width:140px">
            <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:4px">Reverse: 1 ${escapeHtml(to.symbol||titleTo)} equals</div>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:1.25rem;font-weight:800;color:var(--brand-dk)">${formatNumber(reverse)} <span style="font-size:.9rem;font-weight:600;color:#64748b">${escapeHtml(from.symbol||titleFrom)}</span></div>
          </div>
        </div>

        <!-- Pair converter widget — full width below heading -->
        ${pairConverterWidget(from, to)}
        <p style="font-size:.75rem;color:#94a3b8;text-align:center;margin-top:8px">
          <a href="${pairPath(to, from)}" style="color:var(--brand-dk)">Reverse: ${escapeHtml(titleTo)} to ${escapeHtml(titleFrom)} →</a>
        </p>

        <!-- Examples -->
        <div style="background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:14px 18px;margin-top:16px">
          <p style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:8px">Quick examples</p>
          <ul style="list-style:none;display:flex;flex-wrap:wrap;gap:6px 20px;font-size:.875rem;color:#374151">${examples}</ul>
        </div>
      </div>
    </div>
  </section>

  <!-- FORMULA & DEFINITIONS -->
  <section class="section-sm" style="background:#fff">
    <div class="wrap">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        <!-- Formula -->
        <div class="info-box">
          <h3>Conversion formula</h3>
          <p style="margin-bottom:12px">To convert ${escapeHtml(from.name)} to ${escapeHtml(to.name)}, multiply by <strong>${formatNumber(factor)}</strong>:</p>
          <div class="formula-block">
            <span class="comment"># ${escapeHtml(titleFrom)} → ${escapeHtml(titleTo)}</span>\n${escapeHtml(to.name)} = ${escapeHtml(from.name)} × <span class="highlight">${formatNumber(factor)}</span>\n\n<span class="comment"># ${escapeHtml(titleTo)} → ${escapeHtml(titleFrom)}</span>\n${escapeHtml(from.name)} = ${escapeHtml(to.name)} × <span class="highlight">${formatNumber(reverse)}</span>
          </div>
        </div>
        <!-- Unit definitions -->
        <div class="info-box">
          <h3>About ${escapeHtml(titleFrom)}</h3>
          ${unitInfo(from)}
        </div>
        <div class="info-box">
          <h3>About ${escapeHtml(titleTo)}</h3>
          ${unitInfo(to)}
        </div>
      </div>
    </div>
  </section>

  <!-- QUICK REFERENCE TABLE -->
  <section class="section-sm" style="background:#fffaf5">
    <div class="wrap-sm">
      <h2 style="margin-bottom:16px">${escapeHtml(titleFrom)} to ${escapeHtml(titleTo)} — Reference Table</h2>
      <p style="margin-bottom:16px">Common ${escapeHtml(from.name)} values converted to ${escapeHtml(to.name)}:</p>
      <div style="border:1px solid #ffedd5;border-radius:16px;overflow:hidden">
        ${quickRefTable(from, to)}
      </div>
    </div>
  </section>

  <!-- RELATED CONVERSIONS -->
  <section class="section-sm" style="background:#fff">
    <div class="wrap">
      <h2 style="margin-bottom:10px">Other ${escapeHtml(titleFrom)} conversions</h2>
      <p style="margin-bottom:14px">Convert ${escapeHtml(from.name)} to other length units:</p>
      <div class="pill-wrap" style="margin-bottom:28px">${relatedFromLinks}</div>

      <h2 style="margin-bottom:10px">Other ${escapeHtml(titleTo)} conversions</h2>
      <p style="margin-bottom:14px">Convert other units to ${escapeHtml(to.name)}:</p>
      <div class="pill-wrap">${relatedToLinks}</div>
    </div>
  </section>
</main>`;

  return shell({
    title: `${titleFrom} to ${titleTo} Converter — 1 ${from.symbol || titleFrom} = ${formatNumber(factor)} ${to.symbol || titleTo}`,
    description: `Convert ${from.name} to ${to.name} instantly. 1 ${from.name} = ${formatNumber(factor)} ${to.name}. Free calculator with formula, quick-reference table, and reverse conversion.`,
    canonical,
    body,
    structuredData: [
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Length Converter', item: `${SITE}/length` },
          { '@type': 'ListItem', position: 3, name: `${titleFrom} to ${titleTo}`, item: canonical }
        ]
      },
      {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        name: `${titleFrom} to ${titleTo} Converter`, url: canonical,
        applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How do I convert ${titleFrom} to ${titleTo}?`,
            acceptedAnswer: { '@type': 'Answer', text: `To convert ${from.name} to ${to.name}, multiply the ${from.name} value by ${formatNumber(factor)}. Example: 10 ${from.name} = ${formatNumber(10 * factor)} ${to.name}.` }
          },
          {
            '@type': 'Question',
            name: `How many ${titleTo} are in one ${titleFrom}?`,
            acceptedAnswer: { '@type': 'Answer', text: `One ${from.name} equals ${formatNumber(factor)} ${to.name}.` }
          },
          {
            '@type': 'Question',
            name: `What is the formula to convert ${titleFrom} to ${titleTo}?`,
            acceptedAnswer: { '@type': 'Answer', text: `Formula: ${to.name} = ${from.name} × ${formatNumber(factor)}. To reverse, use: ${from.name} = ${to.name} × ${formatNumber(reverse)}.` }
          }
        ]
      }
    ]
  });
}

/* ─── 404 ─────────────────────────────────────────────────────────────────── */
function notFound(res) {
  res.statusCode = 404;
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(shell({
    title: 'Length Conversion Not Found — Omni Converter',
    description: 'The requested length conversion was not found. Browse all length unit pairs on the Length Converter.',
    canonical: `${SITE}/length`,
    body: `<main><div class="wrap" style="padding:80px 0;text-align:center">
      <i class="fas fa-ruler-combined" style="font-size:3rem;color:#cbd5e1;margin-bottom:16px;display:block"></i>
      <h1 style="font-size:2rem;margin-bottom:12px">Conversion not found</h1>
      <p style="margin-bottom:24px">We couldn't find that length unit pair. Try searching on the main page.</p>
      <a href="/length" style="display:inline-flex;align-items:center;gap:8px;background:var(--brand);color:#fff;padding:12px 24px;border-radius:12px;font-weight:600">
        <i class="fas fa-arrow-left"></i> Back to Length Converter
      </a>
    </div></main>`
  }));
}

/* ─── ROUTING ────────────────────────────────────────────────────────────── */
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
