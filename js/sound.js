// 効果音（音のファイルは使わず、その場で作る）
let ctx = null;
let muted = false;
let noiseBuf = null;
let active = [];

export function setMuted(v) {
  muted = !!v;
  if (muted) stopAll();
}

// iPad では、さわったときに初めて音が出せるようになる
export function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    /* 音が出せない端末では鳴らないだけ */
  }
}

function track(node, end) {
  active.push(node);
  node.onended = () => {
    active = active.filter((n) => n !== node);
  };
  node.stop(end);
}

export function stopAll() {
  for (const n of active) {
    try {
      n.stop();
    } catch {
      /* もう止まっている */
    }
  }
  active = [];
}

function tone(freq, dur, { type = 'sine', vol = 0.12, at = 0, slide = null } = {}) {
  if (!ctx || muted) return;
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  track(o, t + dur + 0.03);
}

function noise(dur, { at = 0, vol = 0.1, type = 'lowpass', freq = 1200, q = 1, fadeIn = 0.02 } = {}) {
  if (!ctx || muted) return;
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ctx.currentTime + at;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  s.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + fadeIn);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(ctx.destination);
  s.start(t);
  track(s, t + dur + 0.05);
}

const SFX = {
  tap: () => tone(880, 0.05, { vol: 0.05, type: 'triangle' }),
  pour: (at = 0) => noise(0.8, { at, vol: 0.09, type: 'bandpass', freq: 900, q: 0.8, fadeIn: 0.12 }),
  bubbles: (at = 0, n = 8) => {
    for (let i = 0; i < n; i++) tone(500 + Math.random() * 500, 0.06, { at: at + i * 0.11 + Math.random() * 0.05, vol: 0.045, slide: 1200 });
  },
  whoosh: (at = 0) => noise(0.35, { at, vol: 0.08, type: 'bandpass', freq: 500, q: 0.6, fadeIn: 0.15 }),
  flame: (at = 0, dur = 2) => noise(dur, { at, vol: 0.07, type: 'lowpass', freq: 380, fadeIn: 0.3 }),
  drip: (at = 0) => tone(1400, 0.09, { at, vol: 0.07, slide: 500 }),
  chime: (at = 0) => {
    tone(1046, 0.5, { at, vol: 0.06, type: 'triangle' });
    tone(1318, 0.6, { at: at + 0.08, vol: 0.05, type: 'triangle' });
  },
  plink: (at = 0) => tone(1800, 0.12, { at, vol: 0.06, type: 'triangle', slide: 1200 }),
  pen: (at = 0) => noise(0.18, { at, vol: 0.06, type: 'highpass', freq: 2500, fadeIn: 0.01 }),
  stamp: (at = 0) => {
    tone(110, 0.18, { at, vol: 0.18, slide: 60 });
    noise(0.08, { at, vol: 0.07, type: 'lowpass', freq: 800, fadeIn: 0.005 });
  },
  ok: (at = 0) => [523, 659, 784].forEach((f, i) => tone(f, 0.25, { at: at + i * 0.09, vol: 0.07, type: 'triangle' })),
  bad: (at = 0) => {
    tone(330, 0.25, { at, vol: 0.07, type: 'triangle' });
    tone(262, 0.35, { at: at + 0.18, vol: 0.07, type: 'triangle' });
  },
  fail: (at = 0) => tone(420, 0.6, { at, vol: 0.06, type: 'sawtooth', slide: 150 }),
  unlock: (at = 0) => [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, { at: at + i * 0.1, vol: 0.07, type: 'triangle' })),
};

export function sfx(name, ...args) {
  try {
    if (SFX[name]) SFX[name](...args);
  } catch {
    /* 鳴らせなくてもゲームは止めない */
  }
}

// 実験の演出に合わせた音（時間は css の動きに合わせる）
export function expSounds(e, key) {
  if (key === 'fail') return sfx('fail', 0.3);
  switch (e) {
    case 'miru':
      sfx('pour', 0);
      if (key === 'bubbles') sfx('bubbles', 0.9, 12);
      break;
    case 'niou':
      [0.3, 0.7, 1.1, 1.5].forEach((t) => sfx('whoosh', t));
      break;
    case 'jouhatsu':
      sfx('flame', 0, 2.3);
      if (key === 'solid') sfx('chime', 2.0);
      break;
    case 'litmus':
      sfx('drip', 0.6);
      sfx('drip', 1.35);
      if (key !== 'neutral') sfx('chime', key === 'acid' ? 1.7 : 1.0);
      break;
    case 'btb':
      [0.85, 1.17, 1.49].forEach((t) => sfx('drip', t));
      sfx('chime', 1.75);
      break;
    case 'alumi':
      sfx('plink', 0.95);
      if (key === 'melt') sfx('bubbles', 1.0, 14);
      break;
    case 'co2':
      sfx('bubbles', 0.7, 14);
      if (key === 'cloudy') sfx('chime', 1.7);
      break;
  }
}
