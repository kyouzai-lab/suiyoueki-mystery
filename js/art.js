// 絵（SVG）。色は docs/05-design-system.md の値だけを使う
const C = {
  glass: ['#2a1204', '#7a3e10', '#c98a3a'], stop: ['#1d120b', '#5b3b25'],
  label: '#f3ead3', labelInk: '#3a2a1c',
  tg: '#e8f3f4', tl: '#4f6064', liquid: '#bfdde1', metal: '#6b6e70',
  flame: '#f2902a', flame2: '#ffe28a', red: '#df4f5a', blue: '#4579cc',
  btb: { acid: '#e6c229', neutral: '#3f9e5a', alkali: '#2f6fc4' }, rubber: '#3a3229',
  foil: '#c9ced1', can: '#6b8fa3', can2: '#4e6f82',
  paper: '#ffffff', skin: '#f4cfae', accent: '#d9542b', dish: '#eef2f3',
};

const BODY = 'M39 22 H61 V44 C61 52 88 54 88 70 V152 Q88 162 78 162 H22 Q12 162 12 152 V70 C12 54 39 52 39 44 Z';
let uid = 0;

// 謎のびん。mark: 'o' | 'x' | null（判定のときの赤ペン）
export function bottle(letter, { no = '', mark = null, delay = 0, w = 110 } = {}) {
  const id = 'bt' + uid++;
  const h = Math.round((w * 172) / 100);
  const pen =
    mark === 'o'
      ? `<path class="pen" style="animation-delay:${delay}s" d="M50 84 C30 84 20 98 22 110 C24 124 40 132 54 130 C70 128 80 116 78 102 C76 90 64 82 46 86" fill="none" stroke="#d63a2a" stroke-width="5" stroke-linecap="round" pathLength="1"/>`
      : mark === 'tri'
        ? `<path class="pen" style="animation-delay:${delay}s" d="M50 84 L78 128 L22 128 Z" fill="none" stroke="#d98a1f" stroke-width="5" stroke-linejoin="round" pathLength="1"/>`
      : mark === 'x'
        ? `<path class="pen" style="animation-delay:${delay}s" d="M26 88 L74 130" fill="none" stroke="#d63a2a" stroke-width="5.5" stroke-linecap="round" pathLength="1"/>
           <path class="pen" style="animation-delay:${delay + 0.18}s" d="M74 88 L26 130" fill="none" stroke="#d63a2a" stroke-width="5.5" stroke-linecap="round" pathLength="1"/>`
        : '';
  return `<svg class="bottle" viewBox="0 0 100 172" width="${w}" height="${h}" aria-hidden="true">
  <defs>
    <linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${C.glass[0]}"/><stop offset=".42" stop-color="${C.glass[1]}"/><stop offset=".68" stop-color="${C.glass[2]}"/><stop offset="1" stop-color="${C.glass[0]}"/></linearGradient>
    <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="${C.stop[0]}"/><stop offset=".55" stop-color="${C.stop[1]}"/><stop offset="1" stop-color="${C.stop[0]}"/></linearGradient>
  </defs>
  <ellipse cx="50" cy="164" rx="40" ry="5" fill="rgba(0,0,0,.45)"/>
  <path d="${BODY}" fill="url(#${id})" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
  <path d="M20 74 C20 64 26 60 31 58 V148 Q23 148 20 140 Z" fill="#fff" opacity=".28"/>
  <path d="M74 70 V146" stroke="#fff" stroke-width="2" opacity=".18" stroke-linecap="round"/>
  <path d="M35 24 H65 V18 Q65 12 59 12 H55 C55 3 45 3 45 12 H41 Q35 12 35 18 Z" fill="url(#${id}s)"/>
  <path d="M20 86 H80 V128 L75 131 L70 127 L64 131 L58 127 L52 131 L46 127 L40 131 L34 127 L28 131 L20 128 Z" fill="${C.label}"/>
  <text x="50" y="98" text-anchor="middle" font-size="7.5" fill="${C.labelInk}" opacity=".6" font-family="Zen Kaku Gothic New, sans-serif" letter-spacing="1.5">${no ? 'No.' + no : ''}</text>
  <text x="50" y="124" text-anchor="middle" font-size="30" fill="${C.labelInk}" font-family="Klee One, sans-serif" font-weight="600">${letter}</text>
  ${pen}
</svg>`;
}

// 実験道具（小さな絵）
export function tool(name) {
  const s = 2.2;
  if (name === 'miru')
    return `<svg viewBox="0 0 120 90" aria-hidden="true">
    <g transform="rotate(-18 46 46)">
      <path d="M38 10 H54 V64 A8 8 0 0 1 38 64 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="${s}"/>
      <path d="M39.2 38 H52.8 V64 A6.8 6.8 0 0 1 39.2 64 Z" fill="${C.liquid}"/>
      <circle cx="44" cy="58" r="2" fill="#fff"/><circle cx="48.5" cy="50" r="1.6" fill="#fff"/><circle cx="44.5" cy="44" r="1.3" fill="#fff"/>
      <rect x="35" y="7" width="22" height="5" rx="2.5" fill="${C.tl}"/>
    </g>
    <circle cx="80" cy="40" r="19" fill="#fff" fill-opacity=".28" stroke="${C.metal}" stroke-width="5"/>
    <path d="M70 31 a13 13 0 0 1 10 -6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M94 54 L108 70" stroke="${C.metal}" stroke-width="9" stroke-linecap="round"/></svg>`;
  if (name === 'niou')
    return `<svg viewBox="0 0 120 90" aria-hidden="true">
    <path d="M34 26 c-5 -5 5 -8 0 -14 M44 26 c-5 -5 5 -8 0 -14 M54 26 c-5 -5 5 -8 0 -14" stroke="${C.tl}" stroke-width="${s}" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M22 32 H64 V76 Q64 82 58 82 H28 Q22 82 22 76 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="${s}"/>
    <path d="M23.2 56 H62.8 V76 Q62.8 80.8 58 80.8 H28 Q23.2 80.8 23.2 76 Z" fill="${C.liquid}"/>
    <path d="M17 32 H27" stroke="${C.tl}" stroke-width="${s}" stroke-linecap="round"/>
    <path d="M28 42 h8 M28 50 h5 M28 58 h8" stroke="${C.tl}" stroke-width="1.3"/>
    <path d="M74 16 q-7 10 0 22 M81 10 q-9 15 0 34" stroke="${C.tl}" stroke-width="${s}" fill="none" stroke-linecap="round" opacity=".55"/>
    ${hand(97, 40, -32, 1)}</svg>`;
  if (name === 'jouhatsu') {
    let g = '';
    for (let x = 26; x <= 94; x += 6) g += `M${x} 37 v5 `;
    return `<svg viewBox="0 0 120 90" aria-hidden="true">
    <path d="M48 16 c-4 -4 4 -6 0 -10 M60 18 c-4 -4 4 -6 0 -10 M72 16 c-4 -4 4 -6 0 -10" stroke="${C.tl}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".55"/>
    <path d="M30 40 L23 86 M90 40 L97 86" stroke="${C.metal}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M58 72 C49 63 54 54 58 44 C62 50 70 60 62 72 Z" fill="${C.flame}"/>
    <path d="M59 70 C56 66 57 60 59 55 C61 59 63 65 59 70 Z" fill="${C.flame2}"/>
    <path d="M47 76 H71 L76 88 H42 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="${s}"/>
    <rect x="56" y="70" width="6" height="7" fill="${C.metal}"/>
    <rect x="21" y="36" width="78" height="6" rx="1.5" fill="${C.metal}" opacity=".35"/>
    <path d="${g}" stroke="${C.metal}" stroke-width="1" opacity=".8"/>
    <path d="M21 36 H99" stroke="${C.metal}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M30 20 H90 Q84 35 60 35 Q36 35 30 20 Z" fill="${C.paper}" stroke="${C.tl}" stroke-width="${s}"/></svg>`;
  }
  if (name === 'litmus')
    return `<svg viewBox="0 0 120 90" aria-hidden="true">
    <g transform="rotate(-9 34 46)"><rect x="24" y="12" width="17" height="64" rx="2" fill="${C.red}" stroke="${C.tl}" stroke-width="1.5"/></g>
    <g transform="rotate(7 60 46)"><rect x="50" y="12" width="17" height="64" rx="2" fill="${C.blue}" stroke="${C.tl}" stroke-width="1.5"/></g>
    <path d="M104 6 L82 66" stroke="${C.tl}" stroke-width="6" stroke-linecap="round"/>
    <path d="M103 8 L82.5 64" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>
    <path d="M80.5 71 q-4.5 6 0 9.5 q4.5 -3.5 0 -9.5 z" fill="${C.liquid}" stroke="${C.tl}" stroke-width="1.4"/></svg>`;
  if (name === 'btb')
    return `<svg viewBox="0 0 120 90" aria-hidden="true">
    <g transform="rotate(-10 48 50)">
      <path d="M38 18 H56 V72 A9 9 0 0 1 38 72 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="${s}"/>
      <path d="M39.2 46 H54.8 V72 A7.8 7.8 0 0 1 39.2 72 Z" fill="${C.btb.neutral}" opacity=".75"/>
      <rect x="35" y="15" width="24" height="5" rx="2.5" fill="${C.tl}"/>
    </g>
    <rect x="76" y="4" width="18" height="24" rx="9" fill="${C.rubber}"/>
    <path d="M80 26 H90 L87 60 L85 66 L83 60 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="1.6"/>
    <path d="M81.6 44 H88.4 L86.6 60 L85 64.5 L83.4 60 Z" fill="${C.btb.neutral}"/>
    <path d="M85 71 q-4.5 6 0 9.5 q4.5 -3.5 0 -9.5 z" fill="${C.btb.neutral}" stroke="${C.tl}" stroke-width="1.2"/></svg>`;
  if (name === 'alumi')
    return `<svg viewBox="0 0 120 90" aria-hidden="true">
    <g transform="rotate(-8 44 50)">
      <path d="M36 18 H54 V72 A9 9 0 0 1 36 72 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="${s}"/>
      <path d="M37.2 44 H52.8 V72 A7.8 7.8 0 0 1 37.2 72 Z" fill="${C.liquid}"/>
      <rect x="33" y="15" width="24" height="5" rx="2.5" fill="${C.tl}"/>
    </g>
    <path d="M72 18 L96 13 L101 33 L78 39 Z" fill="${C.foil}" stroke="${C.tl}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M77 23 L94 19 M80 31 L97 27" stroke="#fff" stroke-width="2" opacity=".8"/>
    <path d="M86 47 v16 M81 58 l5 6 l5 -6" stroke="${C.tl}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".6"/></svg>`;
  if (name === 'co2')
    return `<svg viewBox="0 0 120 90" aria-hidden="true">
    <path d="M36 16 H54 V72 A9 9 0 0 1 36 72 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="${s}"/>
    <path d="M37.2 42 H52.8 V72 A7.8 7.8 0 0 1 37.2 72 Z" fill="${C.liquid}"/>
    <rect x="33" y="13" width="24" height="5" rx="2.5" fill="${C.tl}"/>
    <path d="M90 22 C90 6 46 4 46 22 V68" stroke="${C.rubber}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="43" cy="58" r="2" fill="#fff" stroke="${C.tl}" stroke-width=".8"/><circle cx="48" cy="50" r="1.7" fill="#fff" stroke="${C.tl}" stroke-width=".8"/>
    <rect x="80" y="22" width="22" height="56" rx="9" fill="${C.can}" stroke="${C.tl}" stroke-width="1.6"/>
    <rect x="86" y="16" width="10" height="8" rx="2" fill="${C.can2}"/>
    <text x="91" y="56" text-anchor="middle" font-size="9" fill="#fff" font-family="Zen Kaku Gothic New, sans-serif" font-weight="700">CO₂</text></svg>`;
  return '';
}

function hand(x, y, rot, k = 1, cls = '') {
  return `<g class="${cls}" transform="translate(${x} ${y}) rotate(${rot}) scale(${k})" stroke="${C.tl}" stroke-width="1.8" fill="${C.skin}">
      <rect x="-12.5" y="-21" width="6" height="22" rx="3"/><rect x="-6" y="-25" width="6" height="26" rx="3"/>
      <rect x="0.5" y="-24" width="6" height="25" rx="3"/><rect x="7" y="-19" width="5.5" height="20" rx="2.75"/>
      <rect x="11" y="2" width="6" height="15" rx="3" transform="rotate(38 13 8)"/>
      <rect x="-13" y="-4" width="26" height="24" rx="9"/>
    </g>`;
}

// 残り回数の試験管立て
export function rack(leftCount, total = 7) {
  let s = '';
  for (let i = 0; i < total; i++) {
    const x = 10 + i * 22;
    const full = i >= total - leftCount;
    s += `<path d="M${x} 6 h12 v30 a6 6 0 0 1 -12 0 z" fill="rgba(80,70,60,.18)" stroke="#7a6a55" stroke-width="1.6"/>`;
    if (full) s += `<path class="tube-liq" d="M${x + 1.2} 16 h9.6 v20 a4.8 4.8 0 0 1 -9.6 0 z" fill="${C.accent}"/>`;
  }
  s += `<rect x="2" y="14" width="160" height="6" rx="2" fill="#7a6a55" opacity=".85"/>`;
  return `<svg viewBox="0 0 164 46" width="164" height="46" aria-hidden="true">${s}</svg>`;
}

// BTB溶液の結果の色
export function btbDot(key) {
  return `<span class="strip" aria-hidden="true"><i class="dot" style="background:${C.btb[key]}"></i></span>`;
}

// リトマスの結果の小さな紙
export function strip(key) {
  const c =
    key === 'acid' ? [C.red, C.red] : key === 'alkali' ? [C.blue, C.blue] : [C.red, C.blue];
  return `<span class="strip" aria-hidden="true"><i style="background:${c[0]}"></i><i style="background:${c[1]}"></i></span>`;
}

// ---------- 実験の演出（大きな絵） viewBox 0 0 420 260 ----------
export function scene(expId, key) {
  if (expId === 'miru') {
    const bubbles =
      key === 'bubbles'
        ? [0, 1, 2, 3, 4, 5, 6, 7]
            .map((i) => `<circle class="bub" style="animation-delay:${0.9 + (i % 4) * 0.22 + Math.floor(i / 4) * 0.5}s" cx="${196 + ((i * 7) % 18)}" cy="214" r="${2.2 + (i % 3)}" fill="#fff" stroke="${C.tl}" stroke-width=".8"/>`)
            .join('')
        : '';
    return `<svg viewBox="0 0 420 260" class="xscene s-miru">
      <rect x="120" y="244" width="180" height="8" rx="3" fill="#7a6a55"/>
      <g class="pour"><path d="M182 26 H222 V210 A20 20 0 0 1 182 210 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="3"/>
      <path class="fill" d="M185 110 H219 V210 A17 17 0 0 1 185 210 Z" fill="${C.liquid}"/>
      <rect x="176" y="20" width="52" height="9" rx="4.5" fill="${C.tl}"/>
      <path d="M190 40 V200" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/>${bubbles}</g>
      <g class="mag"><circle cx="268" cy="150" r="52" fill="#fff" fill-opacity=".22" stroke="${C.metal}" stroke-width="10"/>
      <path d="M240 126 a34 34 0 0 1 26 -16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M306 190 L346 232" stroke="${C.metal}" stroke-width="20" stroke-linecap="round"/></g>
    </svg>`;
  }
  if (expId === 'niou') {
    const strong = key === 'smell';
    const lines = [0, 1, 2]
      .map((i) => `<path class="vap" style="animation-delay:${0.4 + i * 0.25}s" d="M${150 + i * 26} 96 c-10 -12 10 -20 0 -32 c-10 -12 10 -20 0 -32" stroke="${strong ? C.accent : C.tl}" stroke-width="${strong ? 4 : 3}" fill="none" stroke-linecap="round" opacity="${strong ? 0.9 : 0.35}"/>`)
      .join('');
    return `<svg viewBox="0 0 420 260" class="xscene s-niou">
      <rect x="90" y="244" width="200" height="8" rx="3" fill="#7a6a55"/>
      ${lines}
      <path d="M110 100 H230 V226 Q230 242 214 242 H126 Q110 242 110 226 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="3"/>
      <path d="M112 166 H228 V226 Q228 240 214 240 H126 Q112 240 112 226 Z" fill="${C.liquid}"/>
      <path d="M98 100 H122" stroke="${C.tl}" stroke-width="3" stroke-linecap="round"/>
      <path d="M124 124 h20 M124 146 h12 M124 168 h20 M124 190 h12" stroke="${C.tl}" stroke-width="2"/>
      <g class="wave-arc" opacity=".55"><path d="M262 40 q-18 30 0 62 M280 26 q-24 44 0 90" stroke="${C.tl}" stroke-width="3" fill="none" stroke-linecap="round"/></g>
      <g class="wave">${hand(320, 80, -32, 2.4)}</g>
      ${strong ? `<text class="tsun" x="330" y="200" font-size="34" font-family="Klee One, sans-serif" fill="${C.accent}" text-anchor="middle">つん！</text>` : ''}
    </svg>`;
  }
  if (expId === 'fail') {
    return `<svg viewBox="0 0 420 260" class="xscene s-fail">
      <rect x="90" y="244" width="200" height="8" rx="3" fill="#7a6a55"/>
      <path d="M110 100 H230 V226 Q230 242 214 242 H126 Q110 242 110 226 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="3"/>
      <path d="M112 166 H228 V226 Q228 240 214 240 H126 Q112 240 112 226 Z" fill="${C.liquid}"/>
      <g class="dizzy" stroke="#b2432a" stroke-width="4" fill="none" stroke-linecap="round">
        <path d="M300 70 a26 26 0 1 1 -2 -1 M300 70 a14 14 0 1 1 -1 0"/>
      </g>
      <text x="300" y="170" font-size="28" font-family="Klee One, sans-serif" fill="#b2432a" text-anchor="middle">くらっ…</text>
    </svg>`;
  }
  if (expId === 'jouhatsu') {
    let g = '';
    for (let x = 96; x <= 324; x += 14) g += `M${x} 132 v10 `;
    const residue =
      key === 'solid'
        ? `<g class="residue">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            .map((i) => `<path d="M${150 + i * 11} ${112 + (i % 3) * 2} l4 -4 l4 4 l-4 3 z" fill="#fff" stroke="#9aa3a6" stroke-width="1"/>`)
            .join('')}<ellipse cx="210" cy="114" rx="62" ry="5" fill="#fff" stroke="#c9d0d2" stroke-width="1"/></g>`
        : '';
    return `<svg viewBox="0 0 420 260" class="xscene s-jouhatsu">
      <g class="steam" stroke="${C.tl}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5">
        <path d="M176 84 c-10 -12 10 -20 0 -32"/><path d="M210 80 c-10 -12 10 -20 0 -32"/><path d="M244 84 c-10 -12 10 -20 0 -32"/></g>
      <path d="M112 140 L92 250 M308 140 L328 250" stroke="${C.metal}" stroke-width="9" stroke-linecap="round"/>
      <g class="flame"><path d="M206 222 C180 196 194 170 206 140 C218 160 240 188 214 222 Z" fill="${C.flame}"/>
      <path d="M209 218 C200 206 203 190 209 176 C215 188 219 204 209 218 Z" fill="${C.flame2}"/></g>
      <path d="M176 226 H244 L258 256 H162 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="3"/>
      <rect x="202" y="210" width="16" height="18" fill="${C.metal}"/>
      <rect x="86" y="128" width="248" height="16" rx="3" fill="${C.metal}" opacity=".35"/>
      <path d="${g}" stroke="${C.metal}" stroke-width="1.6"/>
      <path d="M86 128 H334" stroke="${C.metal}" stroke-width="6" stroke-linecap="round"/>
      <path d="M126 92 H294 Q276 128 210 128 Q144 128 126 92 Z" fill="${C.dish}" stroke="${C.tl}" stroke-width="3"/>
      <path class="water" d="M140 98 H280 Q266 122 210 122 Q154 122 140 98 Z" fill="${C.liquid}"/>
      ${residue}
    </svg>`;
  }
  if (expId === 'litmus') {
    const spot = (x, from, to, d) =>
      `<ellipse class="lspot" style="animation-delay:${d}s" fill="${to}" cx="${x}" cy="150" rx="17" ry="22"/>`;
    const redTo = key === 'alkali' ? C.blue : '#c9424c';
    const blueTo = key === 'acid' ? C.red : '#3b69b3';
    return `<svg viewBox="0 0 420 260" class="xscene s-litmus">
      <rect x="60" y="244" width="300" height="8" rx="3" fill="#7a6a55"/>
      <rect x="120" y="60" width="46" height="170" rx="4" fill="${C.red}" stroke="${C.tl}" stroke-width="2"/>
      <rect x="250" y="60" width="46" height="170" rx="4" fill="${C.blue}" stroke="${C.tl}" stroke-width="2"/>
      ${spot(143, C.red, redTo, 0.9)}${spot(273, C.blue, blueTo, 1.6)}
      <text x="143" y="52" text-anchor="middle" font-size="15" fill="${C.tl}" font-family="Zen Kaku Gothic New, sans-serif">赤色</text>
      <text x="273" y="52" text-anchor="middle" font-size="15" fill="${C.tl}" font-family="Zen Kaku Gothic New, sans-serif">青色</text>
      <g class="rod"><path d="M0 -140 L0 0" stroke="${C.tl}" stroke-width="10" stroke-linecap="round"/>
      <path d="M-2 -136 L-2 -4" stroke="#fff" stroke-width="3" opacity=".8" stroke-linecap="round"/></g>
    </svg>`;
  }
  if (expId === 'btb') {
    const col = C.btb[key] || C.btb.neutral;
    const drops = [0, 1, 2]
      .map((i) => `<circle class="bdrop" style="animation-delay:${0.8 + i * 0.32}s" cx="202" cy="74" r="5" fill="${C.btb.neutral}"/>`)
      .join('');
    return `<svg viewBox="0 0 420 260" class="xscene s-btb">
      <rect x="120" y="244" width="180" height="8" rx="3" fill="#7a6a55"/>
      <path d="M182 26 H222 V210 A20 20 0 0 1 182 210 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="3"/>
      <path d="M185 120 H219 V210 A17 17 0 0 1 185 210 Z" fill="#eef6f7"/>
      <path class="tint" d="M185 120 H219 V210 A17 17 0 0 1 185 210 Z" fill="${col}" opacity=".85"/>
      <path d="M190 40 V200" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/>
      ${drops}
      <g class="dropper">
        <rect x="189" y="-6" width="26" height="36" rx="13" fill="${C.rubber}"/>
        <path d="M194 28 H210 L206 62 L202 70 L198 62 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="2"/>
        <path d="M195.6 44 H208.4 L205.4 62 L202 68 L198.6 62 Z" fill="${C.btb.neutral}"/>
      </g>
      <rect x="176" y="20" width="52" height="9" rx="4.5" fill="${C.tl}"/>
      <text x="252" y="40" font-size="16" fill="${C.tl}" font-family="Zen Kaku Gothic New, sans-serif">BTB溶液</text>
    </svg>`;
  }
  if (expId === 'alumi') {
    const melt = key === 'melt';
    const bubbles = melt
      ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
          .map((i) => `<circle class="bub" style="animation-delay:${1.0 + (i % 5) * 0.18 + Math.floor(i / 5) * 0.4}s" cx="${192 + ((i * 7) % 22)}" cy="204" r="${2 + (i % 3)}" fill="#fff" stroke="${C.tl}" stroke-width=".8"/>`)
          .join('')
      : '';
    return `<svg viewBox="0 0 420 260" class="xscene s-alumi">
      <rect x="120" y="244" width="180" height="8" rx="3" fill="#7a6a55"/>
      <path d="M182 26 H222 V210 A20 20 0 0 1 182 210 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="3"/>
      <path d="M185 110 H219 V210 A17 17 0 0 1 185 210 Z" fill="${C.liquid}"/>
      <path d="M190 40 V200" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/>
      ${bubbles}
      <g class="foil"><g class="${melt ? 'melt' : ''}">
        <path d="M190 196 L212 192 L216 208 L194 212 Z" fill="${C.foil}" stroke="${C.tl}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M194 199 L210 196" stroke="#fff" stroke-width="2" opacity=".8"/>
      </g></g>
      <rect x="176" y="20" width="52" height="9" rx="4.5" fill="${C.tl}"/>
      <text x="252" y="70" font-size="16" fill="${C.tl}" font-family="Zen Kaku Gothic New, sans-serif">アルミニウム</text>
    </svg>`;
  }
  if (expId === 'co2') {
    const bubbles = [0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<circle class="bub" style="animation-delay:${0.7 + (i % 4) * 0.25 + Math.floor(i / 4) * 0.12}s" cx="${199 + ((i * 5) % 8)}" cy="200" r="${3 + (i % 2)}" fill="#fff" stroke="${C.tl}" stroke-width=".8"/>`)
      .join('');
    return `<svg viewBox="0 0 420 260" class="xscene s-co2">
      <rect x="120" y="244" width="240" height="8" rx="3" fill="#7a6a55"/>
      <path d="M182 26 H222 V210 A20 20 0 0 1 182 210 Z" fill="${C.tg}" stroke="${C.tl}" stroke-width="3"/>
      <path d="M185 110 H219 V210 A17 17 0 0 1 185 210 Z" fill="${C.liquid}"/>
      <path class="cloud" d="M185 110 H219 V210 A17 17 0 0 1 185 210 Z" fill="#f4f6f6" opacity="${key === 'cloudy' ? 0.92 : 0}"/>
      <path d="M190 40 V200" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/>
      ${bubbles}
      <path d="M318 74 C318 20 202 14 202 44 V202" stroke="${C.rubber}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="176" y="20" width="52" height="9" rx="4.5" fill="${C.tl}"/>
      <rect x="296" y="74" width="44" height="168" rx="18" fill="${C.can}" stroke="${C.tl}" stroke-width="3"/>
      <rect x="308" y="62" width="20" height="16" rx="4" fill="${C.can2}"/>
      <text x="318" y="168" text-anchor="middle" font-size="15" fill="#fff" font-family="Zen Kaku Gothic New, sans-serif" font-weight="700" writing-mode="tb">二酸化炭素</text>
    </svg>`;
  }
  return '';
}

// あそびかたの絵
export function howtoArt(i, ind = 'litmus') {
  if (i === 0)
    return `<div class="howart five">${['A', 'B', 'C', 'D', 'E'].map((l) => bottle(l, { w: 46 })).join('')}</div>`;
  if (i === 1)
    return `<div class="howart">${rack(7)}<div class="howtools">${tool('miru')}${tool('niou')}${tool('jouhatsu')}${tool(ind)}</div></div>`;
  return `<div class="howart">${tool('niou')}<span class="howarrow">→</span><span class="howcard">正体は？<b>○ △ ×</b></span></div>`;
}
