// 水溶液と実験のデータ（理科の内容はここだけに書く）

export const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const LIQUIDS = [
  { id: 'salt', name: '食塩水',     short: '食塩水',   look: 'clear',   smell: false, solid: true,  litmus: 'neutral',
    point: '中性で、蒸発させると白い固体が残る' },
  { id: 'lime', name: '石灰水',     short: '石灰水',   look: 'clear',   smell: false, solid: true,  litmus: 'alkali',
    point: 'アルカリ性で、においがなく、蒸発させると白い固体が残る' },
  { id: 'soda', name: '炭酸水',     short: '炭酸水',   look: 'bubbles', smell: false, solid: false, litmus: 'acid',
    point: '泡が出ていて、酸性で、蒸発させても何も残らない' },
  { id: 'hcl',  name: 'うすい塩酸', short: '塩酸',     look: 'clear',   smell: true,  solid: false, litmus: 'acid',
    point: '酸性で、つんとするにおいがある' },
  { id: 'nh3',  name: 'アンモニア水', short: 'アンモニア水', look: 'clear', smell: true, solid: false, litmus: 'alkali',
    point: 'アルカリ性で、つんとするにおいがある' },
];

export const liquid = (id) => LIQUIDS.find((l) => l.id === id);

export const EXPS = [
  { id: 'miru',     name: '見る',       slot: '見る' },
  { id: 'niou',     name: 'におう',     slot: 'におい' },
  { id: 'jouhatsu', name: '蒸発させる', slot: '蒸発' },
  { id: 'litmus',   name: 'リトマス紙', slot: 'リトマス' },
];

// 4つ目の実験（酸性・中性・アルカリ性を調べる薬）は、リトマス紙かBTB溶液を選べる
export const INDICATORS = {
  litmus: { id: 'litmus', name: 'リトマス紙', slot: 'リトマス' },
  btb:    { id: 'btb',    name: 'BTB溶液',    slot: 'BTB' },
};
export const expsFor = (ind = 'litmus') => [EXPS[0], EXPS[1], EXPS[2], INDICATORS[ind] || INDICATORS.litmus];

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

// 難易度：びんの本数と、実験の上限回数
export const LEVELS = {
  3: { n: 3, name: '初級', max: 4 },
  4: { n: 4, name: '中級', max: 6 },
  5: { n: 5, name: '上級', max: 7 },
};

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
