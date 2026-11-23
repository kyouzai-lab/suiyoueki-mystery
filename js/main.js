// 画面と操作
import { LIQUIDS, LETTERS, LEVELS, RESULT, INDICATORS, liquid, exp, expsFor, sayOf, levelOf } from './data.js';
import { sfx, expSounds, unlock as unlockAudio, setMuted, stopAll } from './sound.js';
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
    <button class="brand" data-act="askQuit"><small>CASE No.${g.no}・${levelOf(g.lv).name}</small><strong>水溶液ミステリー</strong></button>
    ${center || `<div class="rack ${G.left(g) === 0 ? 'empty' : ''}">${rack(G.left(g), g.max)}<span class="n">のこり<b>${G.left(g)}</b>/${g.max}回</span></div>`}
    <div class="topr">${muteBtn()}${right}</div>
  </div>`;
}

function muteBtn() {
  const m = G.getMute();
  return `<button class="mute ${m ? 'on' : ''}" data-act="mute" aria-label="${m ? '音を出す' : '音を消す'}"><svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"/>
    ${m ? '<path d="M16 9 L21 15 M21 9 L16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' : '<path d="M16 9 Q18.5 12 16 15 M18.5 7 Q22.5 12 18.5 17" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'}</svg></button>`;
}

function bottlesRow(mode) {
  const g = S.g;
  return `<div class="bottles">${G.letters(g).map((L, b) => {
    const sel = mode === 'lab' && S.sel.b === b;
    let mark = null;
    if (mode === 'judge') mark = { ok: 'o', lucky: 'tri', wrong: 'x' }[S.judged.status[b]];
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
    <button class="nobtn" data-act="byNo">問題番号で解く</button>
    <div class="title-mute">${muteBtn()}</div>
`, { board, cls: 'is-title' });
}

function howtoOverlay() {
  const steps = [
    ['びんの正体', 'びんに、ちがう水溶液が<b>1本ずつ</b>入っている。どのびんが何かを当てよう。初級は3本、中級は4本、上級は5本。'],
    ['実験は回数が決まっている', '1回で調べられるのは、<b>1本のびんに1つの実験</b>だけ。初級4回・中級6回・上級7回まで。どのびんに何を調べるか考えよう。'],
    ['推理して答える', 'カルテの液の名前は、タップで<b>○→×→もとにもどる</b>メモ。わかったら「推理する」で、全部のびんの正体を答えよう。実験の結果から決めきれないのに当たったら「まぐれ」になるよ。'],
  ];
  return `<div class="ov"><div class="howto">
    <div class="howcards">${steps.map(([h, t], i) => `<div class="hc" style="--r:${ROT[i]}"><div class="hn">${i + 1}</div><h3>${h}</h3>${howtoArt(i, G.getInd())}<p>${t}</p></div>`).join('')}</div>
    <div class="howfoot"><div class="sticky small">においは、<em>手であおいで</em>かぐ。</div>
    <button class="bigbtn accent" data-act="howtoOk">わかった！</button></div>
  </div></div>`;
}

function levelCard(lv, cur) {
  if (lv.hikake && !G.getOni()) {
    return `<div class="lv locked"><b>？？？</b><span class="lock"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10 V7 a4 4 0 0 1 8 0 V10" stroke="currentColor" stroke-width="2.2" fill="none"/></svg></span>
      <span class="lvt">上級を まぐれなしで<br>全部当てると出てくる</span></div>`;
  }
  return `<button class="lv ${lv.hikake ? 'oni' : ''} ${cur === lv.id ? 'last' : ''}" data-act="start" data-lv="${lv.id}">
      <b>${lv.name}</b><span class="lvb">${LETTERS.slice(0, lv.n).map((L) => bottle(L, { w: 34 })).join('')}</span>
      <span class="lvt">${lv.hikake ? '水がまざる！' : `${lv.n}本`}・実験${lv.max}回まで</span></button>`;
}

function levelOverlay() {
  const cur = G.getLevel();
  return `<div class="ov"><div class="sticky dialog lvdialog"><p>何本のびんを推理する？</p>
    ${indRow()}
    <div class="levels">${Object.values(LEVELS).map((lv) => levelCard(lv, cur)).join('')}</div>
    <div class="drow"><span class="sm">本数が多いほどむずかしい</span><button class="ghost" data-act="closeOv">もどる</button></div></div></div>`;
}

function byNoOverlay() {
  const { digits, lv: curLv } = S.ov;
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
  const ok = digits.length > 0 && +digits > 0;
  return `<div class="ov"><div class="sticky dialog bynodialog"><p><em>問題番号</em>と<em>レベル</em>を入れよう</p>
    <div class="byno">
      <div class="byno-left">
        <div class="nodisp">No.<b>${digits || '<i>―</i>'}</b></div>
        <div class="seg light">${Object.values(LEVELS).filter((lv) => !lv.hikake || G.getOni()).map((lv) => `<button class="${curLv === lv.id ? 'on' : ''}" data-act="noLv" data-lv="${lv.id}">${lv.name}<small>${lv.hikake ? '水あり' : `${lv.n}本`}</small></button>`).join('')}</div>
        ${indRow()}
        <p class="sm">同じ番号・同じレベルなら、みんな同じ問題になるよ。</p>
      </div>
      <div class="pad">${keys.map((k) => k === 'del'
        ? '<button class="pd fn" data-act="noDel">けす</button>'
        : k === 'ok'
          ? `<button class="pd go2 ${ok ? '' : 'off'}" data-act="noStart">解く</button>`
          : `<button class="pd" data-act="noDigit" data-d="${k}">${k}</button>`).join('')}</div>
    </div>
    <div class="drow"><span></span><button class="ghost" data-act="closeOv">もどる</button></div></div></div>`;
}

// 酸性・アルカリ性を調べる道具（自分で選ぶ）
function indRow() {
  return `<div class="indrow"><span>酸性・アルカリ性を<br>調べる道具</span>
    <div class="seg light">${Object.values(INDICATORS).map((x) => `<button class="${G.getInd() === x.id ? 'on' : ''}" data-act="setInd" data-i="${x.id}">${x.name}</button>`).join('')}</div></div>`;
}

// ---------------- 事件の導入 ----------------
function introScreen() {
  const g = S.g;
  const board = `<div class="board ${g.hikake ? 'oni' : ''}"><div class="h">${g.hikake ? 'ラベルがはがれたうえに、水がまぎれこんだ！' : '理科室のラベルがはがれてしまった！'}</div><div class="s">${levelOf(g.lv).name}・No.${g.no}</div></div>`;
  return shell(`${bottlesRow('intro')}
    <div class="intro">
      <div class="sticky">
        <p>${g.hikake ? `${g.n}本のびんには、次の${g.pool.length}種類のうち<em>${g.n}種類</em>が1本ずつ入っている。<em>どれか1つは入っていない！</em>` : `${g.n}本のびんには、次の液が<em>1本ずつ</em>入っている。`}</p>
        <div class="liqs">${g.pool.map((id) => `<span>${liquid(id).name}</span>`).join('')}</div>
        <p class="sm">実験は${expsFor(g.ind).length}種類で<em>${g.max}回</em>まで。においは<em>手であおいで</em>かぐ。</p>
        <div class="memo-help"><p class="sm">カルテの液の名前は、自分用のメモ。タップするたびに変わるよ。</p>
          <div class="mh-row"><span class="mh-step"><span class="mh o">食塩水</span><small>これかも</small></span><i>→</i>
          <span class="mh-step"><span class="mh x">食塩水</span><small>ちがう</small></span><i>→</i>
          <span class="mh-step"><span class="mh">食塩水</span><small>もとどおり</small></span></div></div>
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
  const cands = g.pool.map(liquid).map((l) => {
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
    if (c && c !== 'fail') return `<div class="sl">${tool(e.id)}<span>${e.slot}</span>${resultHTML(c, false, e.id)}</div>`;
    return `<div class="sl dim">${tool(e.id)}<span>${e.slot}</span><b class="q">${c === 'fail' ? '失敗' : '−'}</b></div>`;
  }).join('');
  const need = !chk.ok && chk.b === b;
  return `<div class="kc ans ${need ? 'need' : ''}" style="--r:${ROT[b]}">
    <div class="kc-head"><span class="l">${LETTERS[b]}</span><span class="s">正体は？</span></div>
    <button class="ansname ${a.liq ? 'pickd' : ''}" data-act="pick" data-b="${b}">${a.liq ? liquid(a.liq).name : '正体は？'}</button>
    ${slots}</div>`;
}

function answerScreen() {
  const g = S.g;
  const chk = G.check(g);
  return shell(`${topbar(`<button class="go accent ${chk.ok ? 'glow' : 'off'}" data-act="judge">判定する</button>`, {
      center: '<div class="center-title">推理する<small>全部のびんの正体をえらぼう</small></div>' })}
    ${bottlesRow('answer')}
    <div class="cards">${G.letters(g).map((_, i) => ansCard(i, chk)).join('')}</div>
    <div class="tray ans-tray">
      ${G.left(g) > 0 ? `<button class="bigbtn" data-act="backLab">← 実験にもどる<small>あと${G.left(g)}回</small></button>` : ''}
      <div class="tray-hint">実験の結果だけでは決めきれないのに当たったら「<b>まぐれ</b>」になるよ。</div>
      <div class="sticky confirm ${chk.ok ? 'ok' : ''}"><p>${chk.msg}</p></div>
    </div>`, { cls: 'is-answer' });
}

function pickOverlay() {
  const g = S.g;
  const b = S.ov.b;
  const owner = {};
  g.answers.forEach((a, i) => { if (a.liq && i !== b) owner[a.liq] = LETTERS[i]; });
  return `<div class="ov"><div class="sticky dialog pick"><p>びん <em>${LETTERS[b]}</em> の正体は？</p>
    <div class="picks">${g.pool.map(liquid).map((l) => {
      const m = g.memo[b][l.id];
      return `<button class="pk ${g.answers[b].liq === l.id ? 'on' : ''}" data-act="setliq" data-b="${b}" data-l="${l.id}">
        <span class="pm ${m || ''}">${m === 'x' ? '×' : m === 'o' ? '○' : ''}</span>${l.name}${owner[l.id] ? `<small>${owner[l.id]}でえらんだ</small>` : ''}</button>`;
    }).join('')}</div>
    <div class="drow"><span class="sm">左の ×・○ は、自分のメモ</span><button class="ghost" data-act="closeOv">とじる</button></div></div></div>`;
}

// ---------------- 判定 ----------------
function reasonTexts(b) {
  const r = S.judged.reasons[b];
  const t = r.exps.map((k) => `${exp(k).slot}：${RESULT[G.cellOf(S.g, b, k)].text}`);
  if (r.elim) t.push('消去法');
  return t.length ? t : ['実験なし'];
}

function judgeScreen() {
  const g = S.g;
  const J = S.judged;
  const cards = G.letters(g).map((L, b) => {
    const a = g.answers[b];
    const ok = J.marks[b];
    return `<div class="kc judge ${J.status[b] === 'ok' ? 'right' : J.status[b] === 'lucky' ? 'lucky' : 'wrong'}" style="--r:${ROT[b]};--d:${0.3 + b * 0.55}s">
      <div class="kc-head"><span class="l">${L}</span><span class="s">判定</span></div>
      <div class="ansname pickd">${liquid(a.liq).name}</div>
      <div class="verdict">${J.status[b] === 'ok' ? '<b>○ 正解</b>' : J.status[b] === 'lucky' ? '<b>△ まぐれ</b><span>当たったけど<br>結果からは決めきれない</span>' : `<b>× ちがう</b><span>正しくは<br><em>${liquid(g.assign[b]).name}</em></span>`}</div>
      <div class="keys">${reasonTexts(b).map((t) => `<span>${t}</span>`).join('')}</div></div>`;
  }).join('');
  return shell(`${topbar('<span></span>', { center: '<div class="center-title">判定<small>赤ペンで答え合わせ</small></div>' })}
    ${bottlesRow('judge')}
    <div class="cards">${cards}</div>
    <div class="tray judge-tray"><div class="tray-hint big">正解 <b>${J.correct}</b> / ${g.n}${J.lucky ? `（まぐれ ${J.lucky}）` : ''}　・　実験 <b>${J.used}</b> / ${g.max}回</div>
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
    const st = J.status[b];
    const fix = st === 'wrong'
      ? `正しくは <b>${right.name}</b>：${right.point}`
      : st === 'lucky'
        ? `実験の結果だけでは決めきれない。<b>${J.alts[b].map((id) => liquid(id).name).join('・')}</b>の可能性も残っていた`
        : '';
    return `<tr class="${st}"><td class="rl">${L}</td><td class="ra">${liquid(a.liq).name}</td>
      <td class="rk">${reasonTexts(b).join('、')}</td><td class="rm">${{ ok: '○', lucky: '△', wrong: '×' }[st]}</td></tr>
      ${fix ? `<tr class="fix ${st}"><td></td><td colspan="3">${fix}</td></tr>` : ''}`;
  }).join('');
  return shell(`<div class="np">
      <div class="np-head"><span>CASE No.${g.no}</span><span>水溶液ミステリー　結果カード（${levelOf(g.lv).name}・${g.n}本${g.hikake ? '・水あり' : ''}）</span><span>${g.date}</span></div>
      <div class="np-body">
        <div class="np-left">
          <div class="stamp r${J.title.rank}"><span>${J.title.name}</span></div>
          <div class="np-score"><div>正解<b>${J.correct}</b>/${g.n}</div>${J.lucky ? `<div class="lk">うち まぐれ<b>${J.lucky}</b></div>` : ''}<div>実験<b>${J.used}</b>/${g.max}回</div></div>
        </div>
        ${J.unlocked ? '<div class="sticky unlocked">鬼モードが出てきた！<small>水がまざった6種類から推理しよう</small></div>' : ''}
        <table class="np-table"><thead><tr><th>びん</th><th>自分の答え</th><th>根拠になった結果</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      <div class="np-foot"><span>この問題は、うまく選べば<b>最少${g.need}回</b>で必ず当てられる。</span></div>
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
  const rows = LIQUIDS.filter((l) => g.hikake || !l.trick).map((l) => `<tr class="${wrongIds.includes(l.id) ? 'miss' : ''} ${g.liqs.includes(l.id) ? '' : 'out'}"><th>${l.name}</th>
    <td>${yesno(l.look === 'bubbles', '泡がある', '無色透明')}</td><td>${yesno(l.smell, 'つんとする', 'なし')}</td>
    <td>${yesno(l.solid, '白い固体が残る', '何も残らない')}</td><td>${lit[l.litmus]}</td>
    <td class="tag">${wrongIds.includes(l.id) ? '<span class="sticky tiny">まちがえた</span>' : g.liqs.includes(l.id) ? '' : '<span class="outnote">今回は なし</span>'}</td></tr>`).join('');
  return shell(`<div class="board table-board"><div class="h">水溶液の性質</div>
      <table class="chalk"><thead><tr><th></th><th>見る</th><th>におい</th><th>蒸発させる</th><th>${INDICATORS[g.ind].name}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="res-btns"><button class="bigbtn" data-act="toResult">← 結果カードにもどる</button><button class="bigbtn accent" data-act="again">もう1問</button></div>`, { cls: 'is-table' });
}

// ---------------- 描画 ----------------
let lastOv = null;
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
    const start = html.length;
    if (t === 'howto') html += howtoOverlay();
    if (t === 'level') html += levelOverlay();
    if (t === 'byNo') html += byNoOverlay();
    if (t === 'manner') html += mannerOverlay();
    if (t === 'exp') html += expOverlay();
    if (t === 'confirmAnswer') html += confirmAnswerOverlay();
    if (t === 'pick') html += pickOverlay();
    if (t === 'quit') html += quitOverlay();
    // 同じダイアログを描きなおすときは、ふわっと出る動きをくり返さない
    if (S.ov === lastOv) html = html.slice(0, start) + html.slice(start).replace('<div class="ov">', '<div class="ov still">');
  }
  lastOv = S.ov;
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
  expSounds(e, key);
  setTimeout(() => {
    if (S.ov === ov && !ov.done) {
      ov.done = true;
      render();
    }
  }, key === 'fail' ? 1200 : EXP_MS);
}

const ACT = {
  chooseLevel() { S.ov = { type: 'level' }; },
  byNo() { S.ov = { type: 'byNo', digits: '', lv: G.getLevel() }; },
  noDigit(d) { if (S.ov.digits.length < 3) S.ov.digits = (S.ov.digits + d.d).replace(/^0+/, ''); },
  noDel() { S.ov.digits = S.ov.digits.slice(0, -1); },
  noLv(d) { S.ov.lv = d.lv; },
  noStart() {
    const no = +S.ov.digits;
    if (!no) return;
    ACT.start({ lv: S.ov.lv, no });
  },
  start(d = {}) {
    const lv = d.lv || G.getLevel();
    G.setLevel(lv);
    S.ov = null;
    S.g = G.newGame(d.no || undefined, G.getInd(), lv);
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
    stopAll();
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
  judge() {
    if (!G.check(S.g).ok) return;
    const J = G.judge(S.g);
    // 上級をまぐれなしで全部当てたら、鬼モードが出てくる
    if (S.g.lv === '5' && J.correct === S.g.n && J.lucky === 0 && !G.getOni()) {
      G.setOni();
      J.unlocked = true;
    }
    S.judged = J;
    save();
    S.screen = 'judge';
    S.g.answers.forEach((_, b) => sfx('pen', 0.3 + b * 0.55));
    sfx(J.correct === S.g.n && J.lucky === 0 ? 'ok' : 'bad', 0.4 + S.g.n * 0.55);
  },
  mute() {
    G.setMute(!G.getMute());
    setMuted(G.getMute());
  },
  toResult() {
    S.screen = 'result';
    sfx('stamp', 0.25);
    if (S.judged.unlocked) sfx('unlock', 0.8);
  },
  toTable() { S.screen = 'table'; },
  again() { ACT.start({ lv: S.g.lv }); },
  // 番号で解いたあとの「もう1問」は、新しいランダムの問題
  toTitle() { S.screen = 'title'; S.ov = null; },
  askQuit() { S.ov = { type: 'quit' }; },
  quit() { S.ov = null; S.screen = 'title'; },
};

stage.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-act]');
  if (!t || !stage.contains(t)) return;
  const fn = ACT[t.dataset.act];
  if (!fn) return;
  unlockAudio();
  if (['selb', 'selt', 'memo', 'pick', 'setliq', 'noDigit', 'noDel', 'noLv', 'setInd'].includes(t.dataset.act)) sfx('tap');
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
setMuted(G.getMute());
render();
