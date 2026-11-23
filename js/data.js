// 水溶液と実験のデータ（理科の内容はここだけに書く）

export const LETTERS = ['A', 'B', 'C', 'D', 'E'];

// metal: アルミニウムがとける／cloudy: 二酸化炭素を通すと白くにごる
export const LIQUIDS = [
  { id: 'salt', name: '食塩水',     short: '食塩水',   look: 'clear',   smell: false, solid: true,  litmus: 'neutral', metal: false, cloudy: false,
    point: '中性で、蒸発させると白い固体が残る' },
  { id: 'lime', name: '石灰水',     short: '石灰水',   look: 'clear',   smell: false, solid: true,  litmus: 'alkali',  metal: false, cloudy: true,
    point: 'アルカリ性で、蒸発させると白い固体が残る。二酸化炭素を通すと白くにごる' },
  { id: 'soda', name: '炭酸水',     short: '炭酸水',   look: 'bubbles', smell: false, solid: false, litmus: 'acid',    metal: false, cloudy: false,
    point: '泡が出ていて、酸性で、蒸発させても何も残らない' },
  { id: 'hcl',  name: 'うすい塩酸', short: '塩酸',     look: 'clear',   smell: true,  solid: false, litmus: 'acid',    metal: true,  cloudy: false,
    point: '酸性で、つんとするにおいがある。アルミニウムをとかす' },
  { id: 'nh3',  name: 'アンモニア水', short: 'アンモニア水', look: 'clear', smell: true, solid: false, litmus: 'alkali', metal: false, cloudy: false,
    point: 'アルカリ性で、つんとするにおいがある' },
  { id: 'water', name: '水',        short: '水',       look: 'clear',   smell: false, solid: false, litmus: 'neutral', metal: false, cloudy: false,
    point: '中性で、においも泡もなく、蒸発させると何も残らない', trick: true },
];
// ふだんの5種類（水はひっかけのときだけ）
export const BASE_IDS = LIQUIDS.filter((l) => !l.trick).map((l) => l.id);
export const ALL_IDS = LIQUIDS.map((l) => l.id);

export const liquid = (id) => LIQUIDS.find((l) => l.id === id);

export const EXPS = [
  { id: 'miru',     name: '見る',       slot: '見る' },
  { id: 'niou',     name: 'におう',     slot: 'におい' },
  { id: 'jouhatsu', name: '蒸発させる', slot: '蒸発' },
  { id: 'litmus',   name: 'リトマス紙', slot: 'リトマス' },
  { id: 'alumi',    name: 'アルミニウムを入れる', slot: 'アルミ' },
  { id: 'co2',      name: '二酸化炭素を通す',     slot: '二酸化炭素' },
];

// 4つ目の実験（酸性・中性・アルカリ性を調べる薬）は、リトマス紙かBTB溶液を選べる
export const INDICATORS = {
  litmus: { id: 'litmus', name: 'リトマス紙', slot: 'リトマス' },
  btb:    { id: 'btb',    name: 'BTB溶液',    slot: 'BTB' },
};
// アルミニウム・二酸化炭素は鬼モードだけ（extra）
export const expsFor = (ind = 'litmus', extra = false) => [EXPS[0], EXPS[1], EXPS[2], INDICATORS[ind] || INDICATORS.litmus, ...(extra ? [EXPS[4], EXPS[5]] : [])];

export const exp = (id) => EXPS.find((e) => e.id === id) || INDICATORS[id];

// 結果の短い言葉（カルテ用）と、演出のあとに出す説明
export const RESULT = {
  bubbles: { text: '泡がある',     say: '小さな泡が、つぎつぎに出ている。' },
  clear:   { text: '無色透明',     say: '色はなく、すき通っている。泡も出ていない。' },
  smell:   { text: 'つんとする',   say: 'つんとする、強いにおいがした。' },
  nosmell: { text: 'においなし',   say: 'においはしなかった。' },
  solid:   { text: '白い固体',     say: '水がなくなったあと、白い固体が残った。' },
  none:    { text: '何も残らない', say: '水がなくなったあと、何も残らなかった。' },
  acid:    { text: '酸性',         say: '青色リトマス紙が赤くなった。赤色は変わらない。→ 酸性' },
  alkali:  { text: 'アルカリ性',   say: '赤色リトマス紙が青くなった。青色は変わらない。→ アルカリ性' },
  neutral: { text: '中性',         say: 'どちらのリトマス紙も、色は変わらなかった。→ 中性' },
  melt:    { text: 'とけた',       say: 'アルミニウムが、泡を出してとけた。' },
  stay:    { text: '変化なし',     say: 'アルミニウムは、とけなかった。' },
  cloudy:  { text: '白くにごった', say: '二酸化炭素を通すと、白くにごった。' },
  nocloud: { text: '変化なし',     say: '二酸化炭素を通しても、変わらなかった。' },
  fail:    { text: '失敗',         say: '顔を近づけて直接かいでしまった。気分が悪くなった…' },
};

export function resultKey(liqId, expId) {
  const l = liquid(liqId);
  switch (expId) {
    case 'miru': return l.look === 'bubbles' ? 'bubbles' : 'clear';
    case 'niou': return l.smell ? 'smell' : 'nosmell';
    case 'jouhatsu': return l.solid ? 'solid' : 'none';
    case 'litmus':
    case 'btb': return l.litmus;
    case 'alumi': return l.metal ? 'melt' : 'stay';
    case 'co2': return l.cloudy ? 'cloudy' : 'nocloud';
  }
  return null;
}

// BTB溶液のときの説明
const SAY_BTB = {
  acid: '黄色になった。→ 酸性',
  neutral: '緑色になった（BTB溶液の色のまま）。→ 中性',
  alkali: '青色になった。→ アルカリ性',
};
export const sayOf = (expId, key) => (expId === 'btb' && SAY_BTB[key]) || RESULT[key].say;

// 難易度：びんの本数と、実験の上限回数。鬼は上級をまぐれなしでクリアすると出てくる（水がまざる）
export const LEVELS = {
  3: { id: '3', n: 3, name: '初級', max: 4 },
  4: { id: '4', n: 4, name: '中級', max: 6 },
  5: { id: '5', n: 5, name: '上級', max: 7 },
  oni: { id: 'oni', n: 5, name: '鬼', max: 9, hikake: true },
};
export const levelOf = (id) => LEVELS[id] || LEVELS[5];

// 鬼（6種類のうち5種類が入っている）の「必ず当てられる回数」。入っている液によらず同じ（総当たりで計算：8回）
export const NEED_ONI = 8;

// その組み合わせを「うまく選べば必ず当てられる」最少の回数（scratch の総当たり計算で求めた値）
const NEED = {
  'salt,lime,soda': 2, 'salt,lime,hcl': 2, 'salt,lime,nh3': 3, 'salt,soda,hcl': 3, 'salt,soda,nh3': 2,
  'salt,hcl,nh3': 2, 'lime,soda,hcl': 3, 'lime,soda,nh3': 3, 'lime,hcl,nh3': 3, 'soda,hcl,nh3': 3,
  'salt,lime,soda,hcl': 4, 'salt,lime,soda,nh3': 4, 'salt,lime,hcl,nh3': 4, 'salt,soda,hcl,nh3': 4,
  'lime,soda,hcl,nh3': 5,
  'salt,lime,soda,hcl,nh3': 6,
};
export const needOf = (liqIds) => NEED[LIQUIDS.map((l) => l.id).filter((id) => liqIds.includes(id)).join(',')] ?? liqIds.length + 1;

// 判定の称号（必ず当てられる回数 need を基準にする）
export function titleOf(correct, n, used, need) {
  if (correct < n) return { name: '見習い探偵', rank: 0 };
  if (used <= need) return { name: '名探偵', rank: 3 };
  if (used === need + 1) return { name: 'すご腕探偵', rank: 2 };
  return { name: '探偵', rank: 1 };
}
