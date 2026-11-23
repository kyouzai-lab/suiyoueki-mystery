// ゲームの状態とルール（画面のことは書かない）
import { LIQUIDS, LETTERS, LEVELS, BASE_IDS, ALL_IDS, NEED_ONI, levelOf, expsFor, resultKey, titleOf, needOf, liquid } from './data.js';

const SAVE_KEY = 'suiyoueki-mystery-v1';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 問題番号と本数から、どの液が入っているか・びんの中身を決める（同じ番号・本数なら同じ問題）
function shuffle(arr, r) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// ひっかけ（hikake）のときは、水を入れた6種類から選ぶ
export function assignmentOf(no, n = 5, hikake = false) {
  const r = rng(Math.imul(no, 2654435761) + n + (hikake ? 7919 : 0));
  const pool = hikake ? ALL_IDS : BASE_IDS;
  const picked = shuffle([...pool], r).slice(0, n);
  const liqs = pool.filter((id) => picked.includes(id)); // 表示用（いつも同じ順）
  return { liqs, assign: shuffle([...picked], r) };
}

export function newGame(no, ind = 'litmus', lvId = '5') {
  const num = no ?? 100 + Math.floor(Math.random() * 900);
  const lv = levelOf(lvId);
  const hikake = !!lv.hikake;
  const { liqs, assign } = assignmentOf(num, lv.n, hikake);
  const d = new Date();
  return {
    no: num,
    ind, // 4つ目の実験：'litmus' | 'btb'
    lv: lv.id, // 難易度 '3' | '4' | '5' | 'oni'
    n: lv.n, // びんの本数
    hikake, // 水がまざっている（鬼）
    max: lv.max, // 実験の上限
    need: hikake ? NEED_ONI : needOf(liqs), // うまく選べば必ず当てられる回数
    liqs, // この問題に入っている液（ひっかけのときは子どもには見せない）
    pool: hikake ? [...ALL_IDS] : [...liqs], // 候補として見せる液
    assign,
    tries: [], // { b: びんの番号, exp: 実験, key: 結果 or 'fail' }
    memo: assign.map(() => ({})), // memo[b][liqId] = 'o' | 'x'
    answers: assign.map(() => ({ liq: null })),
    phase: 'lab', // lab | answer | judged
    date: `${d.getMonth() + 1}月${d.getDate()}日`,
  };
}

export const used = (g) => g.tries.length;
export const left = (g) => g.max - g.tries.length;
export const letters = (g) => LETTERS.slice(0, g.n);

// そのびん・その実験の結果（成功したものを優先。失敗だけなら 'fail'）
export function cellOf(g, b, expId) {
  const hits = g.tries.filter((t) => t.b === b && t.exp === expId);
  const ok = hits.find((t) => t.key !== 'fail');
  if (ok) return ok.key;
  return hits.length ? 'fail' : null;
}

export const isDone = (g, b, expId) => {
  const c = cellOf(g, b, expId);
  return c !== null && c !== 'fail';
};

export function canRun(g, b, expId) {
  return g.phase === 'lab' && left(g) > 0 && b !== null && expId !== null && !isDone(g, b, expId);
}

export function run(g, b, expId, manner) {
  const key = expId === 'niou' && manner === 'direct' ? 'fail' : resultKey(g.assign[b], expId);
  g.tries.push({ b, exp: expId, key });
  return key;
}

export function toggleMemo(g, b, liqId) {
  const cur = g.memo[b][liqId];
  // 1回目 ○ → 2回目 ×（消す）→ 3回目 もとにもどす
  const next = cur === undefined ? 'o' : cur === 'o' ? 'x' : undefined;
  if (next === undefined) delete g.memo[b][liqId];
  else g.memo[b][liqId] = next;
  return next;
}

// 推理に入る（メモの○は自動では答えに入れない。子どもが自分で選ぶ）
export function startAnswer(g) {
  g.phase = 'answer';
}

export function setAnswer(g, b, liqId) {
  g.answers[b].liq = liqId;
}

// 判定できるかどうか。できないときは、子どもに見せる一言を返す
export function check(g) {
  for (let b = 0; b < g.n; b++) {
    if (!g.answers[b].liq) return { ok: false, b, msg: `びん${LETTERS[b]}の正体がまだ決まっていないよ` };
  }
  const seen = {};
  for (let b = 0; b < g.n; b++) {
    const id = g.answers[b].liq;
    if (seen[id] !== undefined) {
      return { ok: false, b, msg: `${liquid(id).name}が2本あるよ（${LETTERS[seen[id]]}と${LETTERS[b]}）。どの液も1本ずつだよ` };
    }
    seen[id] = b;
  }
  return { ok: true, msg: '準備ができたよ。判定しよう！' };
}

// ---- 根拠の確認（やった実験の結果だけで正体が決まるか）----
// arr から k 個を選んで並べたもの全部
function permsOf(arr, k = arr.length) {
  if (k === 0) return [[]];
  const out = [];
  arr.forEach((x, i) => {
    for (const p of permsOf([...arr.slice(0, i), ...arr.slice(i + 1)], k - 1)) out.push([x, ...p]);
  });
  return out;
}
const expIdsOf = (g) => expsFor(g.ind, g.hikake).map((e) => e.id);
// 液 id が、びん b でやった実験の結果と合うか
function fitsBottle(g, b, id) {
  return expIdsOf(g).every((e) => {
    const c = cellOf(g, b, e);
    return !c || c === 'fail' || resultKey(id, e) === c;
  });
}

// やった実験の結果全部と「どの液も1本ずつ」で考えたとき、びん b の正体として残る液
export function candidatesOf(g, b) {
  const ps = permsOf(g.pool, g.n).filter((p) => p.every((id, i) => fitsBottle(g, i, id)));
  const c = new Set(ps.map((p) => p[b]));
  return g.pool.filter((id) => c.has(id));
}

// 結果カードに出す決め手：そのびんでやった実験の結果。自分の結果だけで決まらないときは「消去法」もつける
export function reasonsOf(g, b) {
  const exps = expIdsOf(g).filter((e) => {
    const c = cellOf(g, b, e);
    return c && c !== 'fail';
  });
  const ownOnly = g.pool.filter((id) => fitsBottle(g, b, id));
  const elim = ownOnly.length > 1 && candidatesOf(g, b).length === 1;
  return { exps, elim };
}

// 判定：ok＝正解で根拠も十分／lucky＝当たったが実験の結果からは決めきれない（まぐれ）／wrong＝ちがう
export function judge(g) {
  g.phase = 'judged';
  const marks = g.answers.map((a, b) => a.liq === g.assign[b]);
  const cands = g.answers.map((_, b) => candidatesOf(g, b));
  const alts = g.answers.map((a, b) => cands[b].filter((id) => id !== a.liq));
  const status = marks.map((ok, b) => (!ok ? 'wrong' : cands[b].length === 1 ? 'ok' : 'lucky'));
  const reasons = g.answers.map((_, b) => reasonsOf(g, b));
  const correct = marks.filter(Boolean).length;
  const lucky = status.filter((s) => s === 'lucky').length;
  const title = lucky > 0 && correct === g.n ? { name: '見習い探偵', rank: 0 } : titleOf(correct, g.n, used(g), g.need);
  return { marks, status, alts, reasons, correct, lucky, used: used(g), title };
}

// ---- 端末の中への保存 ----
function readAll() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
  } catch {
    return {};
  }
}
function writeAll(d) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(d));
  } catch {
    /* 保存できない端末では、つづきからが出ないだけ */
  }
}
export function saveGame(g) {
  const d = readAll();
  d.game = g && g.phase !== 'judged' ? g : null;
  writeAll(d);
}
export function loadGame() {
  const g = readAll().game;
  if (!g || !Array.isArray(g.assign)) return null;
  g.ind = g.ind || 'litmus';
  // 難易度を入れる前に保存したゲーム（5本）もそのまま続けられるようにする
  g.n = g.n || g.assign.length;
  g.max = g.max || (LEVELS[g.n] || LEVELS[5]).max;
  g.liqs = g.liqs || LIQUIDS.map((l) => l.id).filter((id) => g.assign.includes(id));
  g.hikake = !!g.hikake;
  g.pool = g.pool || [...g.liqs];
  g.lv = g.lv || String(g.n);
  g.need = g.need || needOf(g.liqs);
  if (g.assign.length !== g.n) return null;
  return g;
}
// 最後に選んだ「酸性・アルカリ性を調べる道具」（4つ目の実験）
export function getInd() {
  return readAll().ind === 'btb' ? 'btb' : 'litmus';
}
export function setInd(ind) {
  const d = readAll();
  d.ind = ind;
  writeAll(d);
}
// 最後に選んだ難易度
export function getLevel() {
  const id = String(readAll().level || '5');
  if (id === 'oni' && !getOni()) return '5';
  return LEVELS[id] ? id : '5';
}
export function setLevel(id) {
  const d = readAll();
  d.level = id;
  writeAll(d);
}
// 鬼モードが出てきたかどうか
export const getOni = () => !!readAll().oni;
export function setOni() {
  const d = readAll();
  d.oni = true;
  writeAll(d);
}
// 音を消すかどうか
export const getMute = () => !!readAll().mute;
export function setMute(v) {
  const d = readAll();
  d.mute = !!v;
  writeAll(d);
}
export function seenHowto() {
  return !!readAll().howto;
}
export function markHowto() {
  const d = readAll();
  d.howto = true;
  writeAll(d);
}
