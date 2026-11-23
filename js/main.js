// 画面と操作
import { LIQUIDS, LETTERS, LEVELS, RESULT, INDICATORS, liquid, exp, expsFor, sayOf } from './data.js';
import * as G from './game.js';
import { bottle, tool, rack, strip, btbDot, scene, howtoArt } from './art.js';

const stage = document.getElementById('stage');
const ROT = ['-1.2deg', '.8deg', '-.6deg', '1deg', '-.9deg'];
const EXP_MS = 3200;

const S = {
  screen: 'title', // title | intro | lab | answer | judge | result | table
  g: G.loadGame(),
  sel: { b: null, e: null },
  ov: null, // 重ねて出すもの
  fresh: { write: null, chip: null },
  judged: null,
  howtoNext: null,
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---------------- 共通の部品 ----------------
function shell(inner, { board = '', cls = '' } = {}) {
  return `<div class="scene ${cls}">
    <div class="wall"></div><div class="sun"></div>
    <svg class="shelfdeco" viewBox="0 0 300 120" aria-hidden="true"><g fill="none" stroke="#7b6a52" stroke-width="2">
      <path d="M30 20 h16 v30 l18 50 q2 8 -6 8 h-40 q-8 0 -6 -8 l18 -50 z"/><path d="M96 40 h14 v20 a28 28 0 1 1 -14 0 z"/>
      <path d="M160 30 v70 a8 8 0 0 0 16 0 v-70 M186 30 v70 a8 8 0 0 0 16 0 v-70 M212 30 v70 a8 8 0 0 0 16 0 v-70"/>
      <path d="M150 64 h92"/><path d="M0 116 h300" stroke-width="6" stroke="#8b6a45"/></g></svg>
    ${board}
    <div class="bench"></div>
    ${inner}
  </div>`;
}

function topbar(right, { center = '' } = {}) {
  const g = S.g;
  return `<div class="top">
    <button class="brand" data-act="askQuit"><small>CASE No.${g.no}・${LEVELS[g.n].name}</small><strong>水溶液ミステリー</strong></button>
    ${center || `<div class="rack ${G.left(g) === 0 ? 'empty' : ''}">${rack(G.left(g), g.max)}<span class="n">のこり<b>${G.left(g)}</b>/${g.max}回</span></div>`}
    ${right}
  </div>`;
}

function bottlesRow(mode) {
  const g = S.g;
  return `<div class="bottles">${G.letters(g).map((L, b) => {
    const sel = mode === 'lab' && S.sel.b === b;
    let mark = null;
    if (mode === 'judge') mark = S.judged.marks[b] ? 'o' : 'x';
    const act = mode === 'lab' ? 'selb' : mode === 'answer' ? 'pick' : '';
    return `<button class="slotb ${sel ? 'sel' : ''}" ${act ? `data-act="${act}" data-b="${b}"` : 'tabindex="-1"'} aria-label="びん${L}">
      ${sel ? '<span class="spot"></span>' : ''}${bottle(L, { no: g.no, mark, delay: 0.3 + b * 0.55 })}</button>`;
  }).join('')}</div>`;
}

function resultHTML(key, fresh, expId) {
  if (key === 'fail') return `<b class="${fresh ? 'write' : ''}">失敗</b>`;
  const st = ['acid', 'alkali', 'neutral'].includes(key) ? (expId === 'btb' ? btbDot(key) : strip(key)) : '';
  return `<b class="${fresh ? 'write' : ''}">${st}${RESULT[key].text}</b>`;
}

// ---------------- タイトル ----------------
function titleScreen() {
  const has = !!G.loadGame();
  const board = `<div class="board big"><div class="h1">水溶液ミステリー</div><div class="h2">びんの正体をつきとめよう</div><div class="d">6年 理科　水溶液の性質</div></div>`;
  const bottles = `<div class="bottles deco">${LETTERS.map((L) => `<span class="slotb">${bottle(L, {})}</span>`).join('')}</div>`;
  return shell(`${bottles}
    <div class="title-btns">
      <button class="bigbtn accent" data-act="chooseLevel">はじめる</button>
      ${has ? '<button class="bigbtn" data-act="resume">つづきから</button>' : ''}
      <button class="bigbtn" data-act="howto">あそびかた</button>
    </div>
    <div class="ind-set"><span>4つ目の実験</span>
      <div class="seg">${Object.values(INDICATORS).map((x) => `<button class="${G.getInd() === x.id ? 'on' : ''}" data-act="setInd" data-i="${x.id}">${x.name}</button>`).join('')}</div>
      <span class="sm">先生が選ぶ（次の「はじめる」から）</span></div>`, { board, cls: 'is-title' });
}

function howtoOverlay() {
  const steps = [
    ['びんの正体', 'びんに、ちがう水溶液が<b>1本ずつ</b>入っている。どのびんが何かを当てよう。初級は3本、中級は4本、上級は5本。'],
    ['実験は回数が決まっている', '1回で調べられるのは、<b>1本のびんに1つの実験</b>だけ。初級4回・中級6回・上級7回まで。どのびんに何を調べるか考えよう。'],
    ['推理して答える', 'わかったら「推理する」。全部のびんの正体と、<b>決め手</b>になった結果を答えよう。少ない回数で全部当てたら名探偵！'],
  ];
  return `<div class="ov"><div class="howto">
    <div class="howcards">${steps.map(([h, t], i) => `<div class="hc" style="--r:${ROT[i]}"><div class="hn">${i + 1}</div><h3>${h}</h3>${howtoArt(i, G.getInd())}<p>${t}</p></div>`).join('')}</div>
    <div class="howfoot"><div class="sticky small">においは、<em>手であおいで</em>かぐ。</div>
    <button class="bigbtn accent" data-act="howtoOk">わかった！</button></div>
  </div></div>`;
}

function levelOverlay() {
  const cur = G.getLevel();
  return `<div class="ov"><div class="sticky dialog lvdialog"><p>何本のびんを推理する？</p>
    <div class="levels">${Object.values(LEVELS).map((lv) => `<button class="lv ${cur === lv.n ? 'last' : ''}" data-act="start" data-n="${lv.n}">
      <b>${lv.name}</b><span class="lvb">${LETTERS.slice(0, lv.n).map((L) => bottle(L, { w: 34 })).join('')}</span>
      <span class="lvt">${lv.n}本・実験${lv.max}回まで</span></button>`).join('')}</div>
    <div class="drow"><span class="sm">本数が多いほどむずかしい</span><button class="ghost" data-act="closeOv">もどる</button></div></div></div>`;
}

// ---------------- 事件の導入 ----------------
function introScreen() {
  const g = S.g;
  const board = `<div class="board"><div class="h">理科室のラベルがはがれてしまった！</div><div class="s">${LEVELS[g.n].name}・No.${g.no}</div></div>`;
  return shell(`${bottlesRow('intro')}
    <div class="intro">
      <div class="sticky">
        <p>${g.n}本のびんには、次の液が<em>1本ずつ</em>入っている。</p>
        <div class="liqs">${g.liqs.map((id) => `<span>${liquid(id).name}</span>`).join('')}</div>
        <p class="sm">実験は「見る・におう・蒸発させる・${INDICATORS[g.ind].name}」で<em>${g.max}回</em>まで。においは<em>手であおいで</em>かぐ。</p>
      </div>
      <button class="bigbtn accent" data-act="toLab">実験をはじめる</button>
    </div>`, { board, cls: 'is-intro' });
}

// ---------------- 実験室 ----------------
function labCard(b) {
  const g = S.g;
  const slots = expsFor(g.ind).map((e) => {
    const c = G.cellOf(g, b, e.id);
    const fresh = S.fresh.write && S.fresh.write.b === b && S.fresh.write.e === e.id;
    return `<div class="sl ${c === 'fail' ? 'fail' : ''}">${tool(e.id)}<span>${e.slot}</span>${c ? resultHTML(c, fresh, e.id) : '<b class="q">？</b>'}</div>`;
  }).join('');
  const cands = g.liqs.map(liquid).map((l) => {
    const m = g.memo[b][l.id] || '';
    const fresh = S.fresh.chip && S.fresh.chip.b === b && S.fresh.chip.l === l.id;
    return `<button class="cand ${m} ${fresh ? 'new' : ''}" data-act="memo" data-b="${b}" data-l="${l.id}">${l.short}</button>`;
  }).join('');
  return `<div class="kc ${S.sel.b === b ? 'sel' : ''}" style="--r:${ROT[b]}" data-act="selb" data-b="${b}">
    <div class="kc-head"><span class="l">${LETTERS[b]}</span><span class="s">カルテ</span></div>${slots}
    <div class="cands">${cands}</div></div>`;
}

function labScreen() {
  const g = S.g;
  const { b, e } = S.sel;
  const leftN = G.left(g);
  const tools = expsFor(g.ind).map((x) => {
    const done = b !== null && G.isDone(g, b, x.id);
    const off = leftN === 0 || done;
    return `<button class="tool ${e === x.id ? 'sel' : ''} ${off ? 'off' : ''}" data-act="selt" data-e="${x.id}">
      ${done ? '<span class="done">調べ済み</span>' : ''}${tool(x.id)}<span>${x.name}</span></button>`;
  }).join('');

  let msg = '';
  let btn = '';
  const L = b !== null ? LETTERS[b] : '';
  const E = e ? exp(e).name : '';
  if (leftN === 0) msg = '回数を使い切ったよ。<br>「<em>推理する</em>」に進もう！';
  else if (b === null && !e) msg = 'びんと実験道具を<br>えらんでね';
  else if (!e) msg = `びん <em>${L}</em> に<br>どの実験をする？`;
  else if (b === null) msg = `どのびんで<br>「<em>${E}</em>」をする？`;
  else if (G.isDone(g, b, e)) msg = `びん <em>${L}</em> の「${E}」は<br>もう調べたよ`;
  else {
    msg = `びん <em>${L}</em> に<br>「<em>${E}</em>」をする？`;
    btn = '<button class="do" data-act="run">する</button>';
  }

  return shell(`${topbar(`<button class="go ${leftN === 0 ? 'glow' : ''}" data-act="toAnswer">推理する →</button>`)}
    ${bottlesRow('lab')}
    <div class="cards">${G.letters(g).map((_, i) => labCard(i)).join('')}</div>
    <div class="tray">${tools}
      <div class="sticky confirm"><p>${msg}</p><div class="crow"><span class="sm">${leftN > 0 ? `あと${leftN}回` : ''}</span>${btn}</div></div>
    </div>`, { cls: 'is-lab' });
}

function mannerOverlay() {
  const opts = {
    fan: `<button class="manner" data-act="manner" data-m="fan">${tool('niou')}<b>手であおいでかぐ</b></button>`,
    direct: `<button class="manner" data-act="manner" data-m="direct"><svg viewBox="0 0 120 90" aria-hidden="true">
      <path d="M22 40 H64 V80 Q64 86 58 86 H28 Q22 86 22 80 Z" fill="#e8f3f4" stroke="#4f6064" stroke-width="2.2"/>
      <path d="M23 60 H63 V80 Q63 85 58 85 H28 Q23 85 23 80 Z" fill="#bfdde1"/>
      <circle cx="58" cy="20" r="16" fill="#f4cfae" stroke="#4f6064" stroke-width="2"/>
      <circle cx="52" cy="17" r="2" fill="#4f6064"/><path d="M47 29 q5 -3 9 0" stroke="#4f6064" stroke-width="2" fill="none"/></svg><b>顔を近づけて直接かぐ</b></button>`,
  };
  const order = S.ov.order.map((k) => opts[k]).join('');
  return `<div class="ov"><div class="sticky dialog"><p>びん <em>${LETTERS[S.ov.b]}</em> のにおいを調べるよ。<br>どうやってかぐ？</p>
    <div class="manners">${order}</div><button class="ghost" data-act="closeOv">やめる</button></div></div>`;
}

function expOverlay() {
  const { b, e, key, done } = S.ov;
  const fail = key === 'fail';
  const sc = scene(fail ? 'fail' : e, key);
  const say = sayOf(e, key);
  const bottom = done
    ? `<div class="xf-result ${fail ? 'fail' : ''}">
        <p class="xf-big">${fail ? '失敗…' : RESULT[key].text}</p>
        <p class="xf-say">${say}${fail ? '<br>においは、<em>手であおいで</em>かぐ。1回分を使ってしまった。' : ''}</p>
        <button class="bigbtn accent" data-act="write">${fail ? 'わかった' : 'カルテに書く'}</button>
      </div>`
    : '<button class="xf-skip" data-act="skip" aria-label="とばす"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5 L12 12 L4 19 Z M12 5 L20 12 L12 19 Z"/></svg>とばす</button>';
  return `<div class="xfull ${done ? 'skip' : ''}">
    <div class="xf-head"><span class="xf-b">びん <b>${LETTERS[b]}</b></span><span class="xf-exp">${tool(e)}${exp(e).name}</span></div>
    <div class="xf-scene">${sc}</div>
    <div class="xf-bottom">${bottom}</div>
  </div>`;
}

function confirmAnswerOverlay() {
  return `<div class="ov"><div class="sticky dialog"><p>まだ <em>${G.left(S.g)}回</em> のこっているよ。<br>推理に進む？</p>
    <div class="drow"><button class="ghost" data-act="closeOv">もどる</button><button class="do" data-act="goAnswer">進む</button></div></div></div>`;
}

function quitOverlay() {
  const judged = S.g.phase === 'judged';
  return `<div class="ov"><div class="sticky dialog"><p>タイトルにもどる？${judged ? '' : '<br><span class="sm">「つづきから」で、また続けられるよ。</span>'}</p>
    <div class="drow"><button class="ghost" data-act="closeOv">やめる</button><button class="do" data-act="quit">もどる</button></div></div></div>`;
}

// ---------------- 推理する ----------------
function ansCard(b, chk) {
  const g = S.g;
  const a = g.answers[b];
  const slots = expsFor(g.ind).map((e) => {
    const c = G.cellOf(g, b, e.id);
    if (c && c !== 'fail') {
      const on = a.keys.includes(e.id);
      return `<button class="sl key ${on ? 'on' : ''}" data-act="key" data-b="${b}" data-k="${e.id}">${tool(e.id)}<span>${e.slot}</span>${resultHTML(c, false, e.id)}</button>`;
    }
    return `<div class="sl dim">${tool(e.id)}<span>${e.slot}</span><b class="q">${c === 'fail' ? '失敗' : '−'}</b></div>`;
  }).join('');
  const need = !chk.ok && chk.b === b;
  return `<div class="kc ans ${need ? 'need' : ''}" style="--r:${ROT[b]}">
    <div class="kc-head"><span class="l">${LETTERS[b]}</span><span class="s">決め手をタップ</span></div>
    <button class="ansname ${a.liq ? 'pickd' : ''}" data-act="pick" data-b="${b}">${a.liq ? liquid(a.liq).name : '正体は？'}</button>
    ${slots}
    <button class="elim ${a.keys.includes('elim') ? 'on' : ''}" data-act="key" data-b="${b}" data-k="elim">消去法</button></div>`;
}

function answerScreen() {
  const g = S.g;
  const chk = G.check(g);
  return shell(`${topbar(`<button class="go accent ${chk.ok ? 'glow' : 'off'}" data-act="judge">判定する</button>`, {
      center: '<div class="center-title">推理する<small>正体を選び、決め手にした結果をタップしよう</small></div>' })}
    ${bottlesRow('answer')}
    <div class="cards">${G.letters(g).map((_, i) => ansCard(i, chk)).join('')}</div>
    <div class="tray ans-tray">
      ${G.left(g) > 0 ? `<button class="bigbtn" data-act="backLab">← 実験にもどる<small>あと${G.left(g)}回</small></button>` : ''}
      <div class="tray-hint">実験していないびんは「<b>消去法</b>」を決め手にできるよ。</div>
      <div class="sticky confirm ${chk.ok ? 'ok' : ''}"><p>${chk.msg}</p></div>
    </div>`, { cls: 'is-answer' });
}

function pickOverlay() {
  const g = S.g;
  const b = S.ov.b;
  const owner = {};
  g.answers.forEach((a, i) => { if (a.liq && i !== b) owner[a.liq] = LETTERS[i]; });
  return `<div class="ov"><div class="sticky dialog pick"><p>びん <em>${LETTERS[b]}</em> の正体は？</p>
    <div class="picks">${g.liqs.map(liquid).map((l) => {
      const m = g.memo[b][l.id];
      return `<button class="pk ${g.answers[b].liq === l.id ? 'on' : ''}" data-act="setliq" data-b="${b}" data-l="${l.id}">
        <span class="pm ${m || ''}">${m === 'x' ? '×' : m === 'o' ? '○' : ''}</span>${l.name}${owner[l.id] ? `<small>${owner[l.id]}でえらんだ</small>` : ''}</button>`;
    }).join('')}</div>
    <div class="drow"><span class="sm">左の ×・○ は、自分のメモ</span><button class="ghost" data-act="closeOv">とじる</button></div></div></div>`;
}

// ---------------- 判定 ----------------
function keyText(b, k) {
  if (k === 'elim') return '消去法';
  const c = G.cellOf(S.g, b, k);
  return `${exp(k).slot}：${RESULT[c].text}`;
}

function judgeScreen() {
  const g = S.g;
  const J = S.judged;
  const cards = G.letters(g).map((L, b) => {
    const a = g.answers[b];
    const ok = J.marks[b];
    return `<div class="kc judge ${ok ? 'right' : 'wrong'}" style="--r:${ROT[b]};--d:${0.3 + b * 0.55}s">
      <div class="kc-head"><span class="l">${L}</span><span class="s">判定</span></div>
      <div class="ansname pickd">${liquid(a.liq).name}</div>
      <div class="verdict">${ok ? '<b>○ 正解</b>' : `<b>× ちがう</b><span>正しくは<br><em>${liquid(g.assign[b]).name}</em></span>`}</div>
      <div class="keys">${a.keys.map((k) => `<span>${keyText(b, k)}</span>`).join('')}</div></div>`;
  }).join('');
  return shell(`${topbar('<span></span>', { center: '<div class="center-title">判定<small>先生の赤ペンが入るよ</small></div>' })}
    ${bottlesRow('judge')}
    <div class="cards">${cards}</div>
    <div class="tray judge-tray"><div class="tray-hint big">正解 <b>${J.correct}</b> / ${g.n}　・　実験 <b>${J.used}</b> / ${g.max}回</div>
      <button class="bigbtn accent appear" data-act="toResult">結果カードを見る →</button></div>`, { cls: 'is-judge' });
}

// ---------------- 結果カード ----------------
function resultScreen() {
  const g = S.g;
  const J = S.judged;
  const rows = G.letters(g).map((L, b) => {
    const a = g.answers[b];
    const ok = J.marks[b];
    const right = liquid(g.assign[b]);
    return `<tr class="${ok ? '' : 'wrong'}"><td class="rl">${L}</td><td class="ra">${liquid(a.liq).name}</td>
      <td class="rk">${a.keys.map((k) => keyText(b, k)).join('、')}</td><td class="rm">${ok ? '○' : '×'}</td></tr>
      ${ok ? '' : `<tr class="fix"><td></td><td colspan="3">正しくは <b>${right.name}</b>：${right.point}</td></tr>`}`;
  }).join('');
  return shell(`<div class="np">
      <div class="np-head"><span>CASE No.${g.no}</span><span>水溶液ミステリー　結果カード（${LEVELS[g.n].name}・${g.n}本）</span><span>${g.date}</span></div>
      <div class="np-body">
        <div class="np-left">
          <div class="stamp r${J.title.rank}"><span>${J.title.name}</span></div>
          <div class="np-score"><div>正解<b>${J.correct}</b>/${g.n}</div><div>実験<b>${J.used}</b>/${g.max}回</div></div>
        </div>
        <table class="np-table"><thead><tr><th>びん</th><th>自分の答え</th><th>決め手</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      <div class="np-foot">この画面をスクリーンショットして、先生に出そう。</div>
    </div>
    <div class="res-btns">
      <button class="bigbtn" data-act="toTable">性質の表を見る</button>
      <button class="bigbtn accent" data-act="again">もう1問</button>
      <button class="bigbtn" data-act="toTitle">タイトルへ</button>
    </div>`, { cls: 'is-result' });
}

// ---------------- 性質の表 ----------------
function tableScreen() {
  const g = S.g;
  const J = S.judged;
  const wrongIds = J ? G.letters(g).map((_, b) => (J.marks[b] ? null : g.assign[b])).filter(Boolean) : [];
  const yesno = (v, y, n) => (v ? y : n);
  const lit = g.ind === 'btb'
    ? { acid: '酸性（黄色）', alkali: 'アルカリ性（青色）', neutral: '中性（緑色）' }
    : { acid: '酸性（青→赤）', alkali: 'アルカリ性（赤→青）', neutral: '中性（変化なし）' };
  const rows = LIQUIDS.map((l) => `<tr class="${wrongIds.includes(l.id) ? 'miss' : ''} ${g.liqs.includes(l.id) ? '' : 'out'}"><th>${l.name}</th>
    <td>${yesno(l.look === 'bubbles', '泡がある', '無色透明')}</td><td>${yesno(l.smell, 'つんとする', 'なし')}</td>
    <td>${yesno(l.solid, '白い固体が残る', '何も残らない')}</td><td>${lit[l.litmus]}</td>
    <td class="tag">${wrongIds.includes(l.id) ? '<span class="sticky tiny">まちがえた</span>' : g.liqs.includes(l.id) ? '' : '<span class="outnote">今回は なし</span>'}</td></tr>`).join('');
  return shell(`<div class="board table-board"><div class="h">水溶液の性質</div>
      <table class="chalk"><thead><tr><th></th><th>見る</th><th>におい</th><th>蒸発させる</th><th>${INDICATORS[g.ind].name}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="res-btns"><button class="bigbtn" data-act="toResult">← 結果カードにもどる</button><button class="bigbtn accent" data-act="again">もう1問</button></div>`, { cls: 'is-table' });
}

// ---------------- 描画 ----------------
function render() {
  let html = '';
  switch (S.screen) {
    case 'title': html = titleScreen(); break;
    case 'intro': html = introScreen(); break;
    case 'lab': html = labScreen(); break;
    case 'answer': html = answerScreen(); break;
    case 'judge': html = judgeScreen(); break;
    case 'result': html = resultScreen(); break;
    case 'table': html = tableScreen(); break;
  }
  if (S.ov) {
    const t = S.ov.type;
    if (t === 'howto') html += howtoOverlay();
    if (t === 'level') html += levelOverlay();
    if (t === 'manner') html += mannerOverlay();
    if (t === 'exp') html += expOverlay();
    if (t === 'confirmAnswer') html += confirmAnswerOverlay();
    if (t === 'pick') html += pickOverlay();
    if (t === 'quit') html += quitOverlay();
  }
  stage.innerHTML = html;
  S.fresh = { write: null, chip: null };
}

function save() {
  G.saveGame(S.g);
}

function startExp(b, e, manner) {
  const key = G.run(S.g, b, e, manner);
  save();
  const ov = { type: 'exp', b, e, key, done: false };
  S.ov = ov;
  render();
  setTimeout(() => {
    if (S.ov === ov && !ov.done) {
      ov.done = true;
      render();
    }
  }, key === 'fail' ? 1200 : EXP_MS);
}

const ACT = {
  chooseLevel() { S.ov = { type: 'level' }; },
  start(d = {}) {
    const n = +d.n || G.getLevel();
    G.setLevel(n);
    S.ov = null;
    S.g = G.newGame(undefined, G.getInd(), n);
    S.sel = { b: null, e: null };
    save();
    if (!G.seenHowto()) {
      S.howtoNext = 'intro';
      S.ov = { type: 'howto' };
    } else S.screen = 'intro';
  },
  resume() {
    S.g = G.loadGame();
    if (!S.g) return;
    S.sel = { b: null, e: null };
    S.screen = S.g.phase === 'answer' ? 'answer' : 'lab';
  },
  howto() {
    S.howtoNext = null;
    S.ov = { type: 'howto' };
  },
  howtoOk() {
    G.markHowto();
    S.ov = null;
    if (S.howtoNext) S.screen = S.howtoNext;
    S.howtoNext = null;
  },
  toLab() { S.screen = 'lab'; },
  setInd(d) { G.setInd(d.i); },
  selb(d) {
    const b = +d.b;
    S.sel.b = S.sel.b === b ? null : b;
  },
  selt(d) {
    if (G.left(S.g) === 0) return;
    S.sel.e = S.sel.e === d.e ? null : d.e;
  },
  memo(d) {
    G.toggleMemo(S.g, +d.b, d.l);
    S.fresh.chip = { b: +d.b, l: d.l };
    save();
  },
  run() {
    const { b, e } = S.sel;
    if (!G.canRun(S.g, b, e)) return;
    if (e === 'niou') {
      S.ov = { type: 'manner', b, order: Math.random() < 0.5 ? ['fan', 'direct'] : ['direct', 'fan'] };
      return;
    }
    startExp(b, e, null);
    return 'rendered';
  },
  manner(d) {
    const b = S.ov.b;
    startExp(b, 'niou', d.m);
    return 'rendered';
  },
  skip() {
    if (S.ov && S.ov.type === 'exp') S.ov.done = true;
  },
  write() {
    const { b, e, key } = S.ov;
    S.ov = null;
    S.fresh.write = { b, e };
    S.sel.e = null;
    render();
    return 'rendered';
  },
  closeOv() { S.ov = null; },
  toAnswer() {
    if (G.left(S.g) > 0) S.ov = { type: 'confirmAnswer' };
    else ACT.goAnswer();
  },
  goAnswer() {
    S.ov = null;
    G.startAnswer(S.g);
    save();
    S.screen = 'answer';
  },
  backLab() {
    S.g.phase = 'lab';
    save();
    S.screen = 'lab';
  },
  pick(d) { S.ov = { type: 'pick', b: +d.b }; },
  setliq(d) {
    const b = +d.b;
    G.setAnswer(S.g, b, S.g.answers[b].liq === d.l ? null : d.l);
    save();
    S.ov = null;
  },
  key(d) {
    G.toggleKey(S.g, +d.b, d.k);
    save();
  },
  judge() {
    if (!G.check(S.g).ok) return;
    S.judged = G.judge(S.g);
    save();
    S.screen = 'judge';
  },
  toResult() { S.screen = 'result'; },
  toTable() { S.screen = 'table'; },
  again() { ACT.start({ n: S.g.n }); },
  toTitle() { S.screen = 'title'; S.ov = null; },
  askQuit() { S.ov = { type: 'quit' }; },
  quit() { S.ov = null; S.screen = 'title'; },
};

stage.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-act]');
  if (!t || !stage.contains(t)) return;
  const fn = ACT[t.dataset.act];
  if (!fn) return;
  const r = fn({ ...t.dataset });
  if (r !== 'rendered') render();
});

// ---------------- 画面の大きさに合わせる ----------------
function fit() {
  const s = Math.min(window.innerWidth / 1180, window.innerHeight / 820);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  document.body.classList.toggle('portrait', window.innerHeight > window.innerWidth * 1.1);
}
window.addEventListener('resize', fit);
fit();
render();
