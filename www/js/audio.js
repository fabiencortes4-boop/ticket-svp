/* Ticket SVP ! — moteur audio 8 bits (WebAudio).
   Musiques et bruitages synthétisés en direct : aucun fichier son, aucun droit à payer.
   Canaux façon console rétro : 2 voix « pulse », 1 triangle (basse), 1 bruit (batterie). */
'use strict';

const A = (G.Audio = {
  ctx: null,
  ready: false,
  current: null,
  tempoMul: 1,
  pitchMul: 1, // mode Cauchemar : musique plus grave
});

const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midiOf(n) {
  if (typeof n === 'number') return n;
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
  if (!m) return null;
  let s = NOTE_INDEX[m[1]];
  if (m[2] === '#') s += 1;
  if (m[2] === 'b') s -= 1;
  return 12 * (Number(m[3]) + 1) + s;
}
const freqOf = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/* ---------- Écriture des morceaux ---------- */
const CHORDS = { maj: [0, 4, 7], min: [0, 3, 7] };
function chord(name) {
  const m = /^([A-G][#b]?)(m?)$/.exec(name);
  const root = midiOf(m[1] + '3');
  return { root, tones: (m[2] ? CHORDS.min : CHORDS.maj).map((x) => root + x) };
}
function bassFrom(chords, pattern, octaveShift = -12) {
  const seq = [];
  for (const c of chords) {
    const { root } = chord(c);
    for (const p of pattern) seq.push([root + octaveShift + p, 2]);
  }
  return seq;
}
function arpFrom(chords, octaveShift = 12) {
  const seq = [];
  for (const c of chords) {
    const { tones } = chord(c);
    const order = [tones[0], tones[1], tones[2], tones[0] + 12];
    for (let i = 0; i < 16; i++) seq.push([order[i % 4] + octaveShift, 1]);
  }
  return seq;
}
const L = (...pairs) => pairs; // lisibilité : [note, durée en doubles-croches]

const TITLE_CHORDS = ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'];
const MAP_CHORDS = ['F', 'Dm', 'Bb', 'C', 'F', 'Dm', 'Gm', 'C'];
const GAME_CHORDS = ['Am', 'F', 'G', 'E', 'Am', 'F', 'G', 'E'];
const BOSS_CHORDS = ['Em', 'Em', 'C', 'B', 'Em', 'Em', 'C', 'B'];

A.SONGS = {
  title: {
    bpm: 128,
    loop: true,
    tracks: [
      { wave: 'pulse50', vol: 0.13, seq: L(
        ['E5', 2], ['G5', 2], ['C6', 3], ['B5', 1], ['A5', 2], ['G5', 2], ['E5', 2], ['G5', 2],
        ['A5', 2], ['C6', 2], ['E6', 4], ['D6', 2], ['C6', 2], ['A5', 4],
        ['F5', 2], ['A5', 2], ['C6', 2], ['A5', 2], ['G5', 2], ['F5', 2], ['E5', 2], ['D5', 2],
        ['D5', 2], ['G5', 2], ['B5', 2], ['D6', 2], ['C6', 4], ['B5', 4],
        ['E5', 2], ['G5', 2], ['C6', 3], ['B5', 1], ['A5', 2], ['G5', 2], ['E5', 2], ['G5', 2],
        ['A5', 2], ['C6', 2], ['E6', 2], ['G6', 2], ['F6', 2], ['E6', 2], ['C6', 4],
        ['F6', 2], ['E6', 2], ['D6', 2], ['C6', 2], ['A5', 2], ['C6', 2], ['D6', 4],
        ['B5', 2], ['D6', 2], ['G5', 2], ['B5', 2], ['C6', 8]) },
      { wave: 'tri', vol: 0.34, seq: bassFrom(TITLE_CHORDS, [0, 12, 7, 12, 0, 12, 7, 12]) },
      { wave: 'pulse12', vol: 0.045, seq: arpFrom(TITLE_CHORDS) },
    ],
    drums: 'k.h.s.h.k.k.s.h.',
  },
  map: {
    bpm: 104,
    loop: true,
    tracks: [
      { wave: 'pulse25', vol: 0.12, seq: L(
        ['A5', 4], ['C6', 2], ['A5', 2], ['G5', 4], ['F5', 4],
        ['D5', 4], ['F5', 2], ['A5', 2], ['G5', 6], ['.', 2],
        ['Bb5', 4], ['A5', 2], ['G5', 2], ['F5', 4], ['D5', 4],
        ['E5', 2], ['G5', 2], ['C6', 4], ['Bb5', 2], ['A5', 2], ['G5', 4],
        ['A5', 4], ['C6', 2], ['F6', 2], ['E6', 4], ['C6', 4],
        ['D6', 4], ['C6', 2], ['A5', 2], ['F5', 6], ['.', 2],
        ['G5', 4], ['Bb5', 2], ['D6', 2], ['C6', 4], ['Bb5', 2], ['G5', 2],
        ['E5', 4], ['G5', 4], ['F5', 8]) },
      { wave: 'tri', vol: 0.3, seq: bassFrom(MAP_CHORDS, [0, 0, 7, 7, 12, 12, 7, 7]) },
      { wave: 'pulse12', vol: 0.035, seq: arpFrom(MAP_CHORDS) },
    ],
    drums: 'k...h...s...h..h',
  },
  game: {
    bpm: 138,
    loop: true,
    tracks: [
      { wave: 'pulse25', vol: 0.12, seq: L(
        ['A4', 2], ['C5', 2], ['E5', 2], ['A5', 2], ['G5', 2], ['E5', 2], ['C5', 2], ['E5', 2],
        ['F5', 2], ['E5', 2], ['C5', 2], ['A4', 2], ['C5', 3], ['D5', 1], ['C5', 2], ['A4', 2],
        ['G4', 2], ['B4', 2], ['D5', 2], ['G5', 2], ['F5', 2], ['D5', 2], ['B4', 2], ['D5', 2],
        ['E5', 3], ['D5', 1], ['E5', 2], ['G#5', 2], ['B5', 4], ['G#5', 4],
        ['A5', 2], ['A5', 1], ['A5', 1], ['G5', 2], ['A5', 2], ['C6', 2], ['B5', 2], ['A5', 2], ['E5', 2],
        ['F5', 2], ['A5', 2], ['C6', 2], ['A5', 2], ['D6', 4], ['C6', 4],
        ['B5', 2], ['G5', 2], ['D5', 2], ['G5', 2], ['B5', 2], ['D6', 2], ['B5', 2], ['G5', 2],
        ['G#5', 2], ['B5', 2], ['E6', 4], ['D6', 2], ['B5', 2], ['G#5', 2], ['E5', 2]) },
      { wave: 'tri', vol: 0.36, seq: bassFrom(GAME_CHORDS, [0, 0, 12, 0, 0, 12, 0, 7], -12) },
      { wave: 'pulse12', vol: 0.04, seq: arpFrom(GAME_CHORDS, 0) },
    ],
    drums: 'k.hhs.hhk.hhs.hk',
  },
  boss: {
    bpm: 150,
    loop: true,
    tracks: [
      { wave: 'pulse50', vol: 0.11, seq: L(
        ['E5', 1], ['.', 1], ['E5', 1], ['.', 1], ['G5', 2], ['E5', 2], ['F#5', 2], ['E5', 2], ['D5', 2], ['B4', 2],
        ['E5', 1], ['.', 1], ['E5', 1], ['.', 1], ['G5', 2], ['A5', 2], ['B5', 4], ['A5', 2], ['G5', 2],
        ['C6', 2], ['B5', 2], ['A5', 2], ['G5', 2], ['E5', 4], ['G5', 4],
        ['F#5', 2], ['A5', 2], ['B5', 2], ['D#6', 2], ['B5', 4], ['F#5', 4],
        ['E5', 1], ['.', 1], ['E5', 1], ['.', 1], ['G5', 2], ['E5', 2], ['F#5', 2], ['E5', 2], ['D5', 2], ['B4', 2],
        ['E5', 1], ['.', 1], ['E5', 1], ['.', 1], ['G5', 2], ['A5', 2], ['B5', 4], ['A5', 2], ['G5', 2],
        ['C6', 2], ['E6', 2], ['D6', 2], ['C6', 2], ['B5', 4], ['A5', 4],
        ['D#5', 2], ['F#5', 2], ['B5', 8], ['.', 4]) },
      { wave: 'tri', vol: 0.38, seq: bassFrom(BOSS_CHORDS, [0, 0, 12, 0, 1, 0, 12, 0], -12) },
    ],
    drums: 'k.k.s.k.k.k.s.hs',
  },
  win: {
    bpm: 168,
    loop: false,
    tracks: [
      { wave: 'pulse50', vol: 0.14, seq: L(['C5', 2], ['E5', 2], ['G5', 2], ['C6', 4], ['G5', 2], ['C6', 2], ['E6', 2], ['D6', 2], ['E6', 2], ['G6', 12]) },
      { wave: 'pulse25', vol: 0.08, seq: L(['E4', 2], ['G4', 2], ['C5', 2], ['E5', 4], ['C5', 2], ['E5', 2], ['G5', 2], ['B5', 2], ['C6', 2], ['E6', 12]) },
      { wave: 'tri', vol: 0.34, seq: L(['C3', 4], ['G3', 4], ['E3', 4], ['G3', 4], ['G2', 4], ['C3', 12]) },
    ],
    drums: 'k...s...k.k.s...k...............',
  },
  lose: {
    bpm: 120,
    loop: false,
    tracks: [
      { wave: 'pulse50', vol: 0.13, seq: L(['G5', 4], ['F#5', 4], ['F5', 4], ['E5', 16], ['.', 4]) },
      { wave: 'tri', vol: 0.32, seq: L(['C3', 8], ['B2', 8], ['Bb2', 8], ['A2', 8]) },
    ],
    drums: 'k.......k.......k.......k.......',
  },
};

/* Prépare les événements de chaque morceau une seule fois */
function compile(song) {
  let length = 0;
  const tracks = song.tracks.map((tr) => {
    const events = {};
    let step = 0;
    for (const [n, len] of tr.seq) {
      if (n !== '.') events[step] = { midi: midiOf(n), len };
      step += len;
    }
    length = Math.max(length, step);
    return { wave: tr.wave, vol: tr.vol, events };
  });
  return { bpm: song.bpm, loop: song.loop, tracks, drums: song.drums, length };
}

/* ---------- Initialisation (après un geste de l'utilisateur) ---------- */
A.init = () => {
  if (A.ready) {
    if (A.ctx.state === 'suspended') A.ctx.resume();
    return;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  A.ctx = new Ctx();
  const c = A.ctx;
  A.master = c.createGain();
  A.master.gain.value = 0.7;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  A.master.connect(comp).connect(c.destination);
  A.music = c.createGain();
  A.sfxBus = c.createGain();
  A.music.connect(A.master);
  A.sfxBus.connect(A.master);
  A.waves = {};
  for (const [name, duty] of [['pulse12', 0.125], ['pulse25', 0.25], ['pulse50', 0.5]]) {
    const n = 48;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
    A.waves[name] = c.createPeriodicWave(real, imag);
  }
  const len = c.sampleRate;
  A.noise = c.createBuffer(1, len, c.sampleRate);
  const d = A.noise.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  A.compiled = {};
  for (const k of Object.keys(A.SONGS)) A.compiled[k] = compile(A.SONGS[k]);
  A.ready = true;
  A.applySettings();
  document.addEventListener('visibilitychange', () => {
    if (!A.ctx) return;
    if (document.hidden) A.ctx.suspend();
    else A.ctx.resume();
  });
};

A.applySettings = () => {
  if (!A.ready) return;
  const s = G.save.settings;
  A.music.gain.setTargetAtTime(s.music ? 0.9 : 0, A.ctx.currentTime, 0.05);
  A.sfxBus.gain.setTargetAtTime(s.sfx ? 1 : 0, A.ctx.currentTime, 0.02);
};

A.duck = (on) => {
  if (!A.ready || !G.save.settings.music) return;
  A.music.gain.setTargetAtTime(on ? 0.15 : 0.9, A.ctx.currentTime, 0.1);
};

function voice(wave, freq, t, dur, vol, bus) {
  const c = A.ctx;
  const o = c.createOscillator();
  const g = c.createGain();
  if (wave === 'tri') o.type = 'triangle';
  else if (wave === 'sine') o.type = 'sine';
  else if (wave === 'saw') o.type = 'sawtooth';
  else if (wave === 'square') o.type = 'square';
  else o.setPeriodicWave(A.waves[wave]);
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.006);
  g.gain.setValueAtTime(vol, t + Math.max(0.01, dur - 0.03));
  g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + dur + 0.02);
  return o;
}

function noiseHit(t, dur, vol, hp, bus, lp) {
  const c = A.ctx;
  const s = c.createBufferSource();
  s.buffer = A.noise;
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = hp;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  let node = s.connect(f);
  if (lp) {
    const f2 = c.createBiquadFilter();
    f2.type = 'lowpass';
    f2.frequency.value = lp;
    node = node.connect(f2);
  }
  node.connect(g).connect(bus);
  s.start(t, Math.random() * 0.5);
  s.stop(t + dur + 0.02);
}

function kick(t, bus, vol = 0.8) {
  const c = A.ctx;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + 0.18);
}

/* ---------- Séquenceur ---------- */
function stepDur(song) {
  return 60 / song.bpm / 4 / A.tempoMul;
}

function scheduleStep(song, step, t) {
  const sd = stepDur(song);
  for (const tr of song.tracks) {
    const ev = tr.events[step];
    if (ev) voice(tr.wave, freqOf(ev.midi) * A.pitchMul, t, ev.len * sd * 0.92, tr.vol, A.music);
  }
  if (song.drums) {
    const ch = song.drums[step % song.drums.length];
    if (ch === 'k') kick(t, A.music, 0.55);
    else if (ch === 's') {
      noiseHit(t, 0.13, 0.22, 1200, A.music);
      voice('tri', 190, t, 0.05, 0.18, A.music);
    } else if (ch === 'h') noiseHit(t, 0.035, 0.07, 7000, A.music);
  }
}

A.play = (name, opts = {}) => {
  if (!A.ready) {
    A.pending = name;
    return;
  }
  if (A.current && A.current.name === name && !opts.restart) return;
  A.stop();
  const song = A.compiled[name];
  if (!song) return;
  A.tempoMul = opts.tempo || 1;
  A.pitchMul = opts.pitch || 1;
  const st = { name, song, step: 0, next: A.ctx.currentTime + 0.06, onEnd: opts.onEnd };
  A.current = st;
  st.timer = setInterval(() => {
    if (A.current !== st) return;
    while (st.next < A.ctx.currentTime + 0.14) {
      scheduleStep(song, st.step, st.next);
      st.next += stepDur(song);
      st.step++;
      if (st.step >= song.length) {
        if (song.loop) st.step = 0;
        else {
          clearInterval(st.timer);
          const end = st.onEnd;
          A.current = null;
          if (end) setTimeout(end, 400);
          return;
        }
      }
    }
  }, 25);
};

A.stop = () => {
  if (A.current) clearInterval(A.current.timer);
  A.current = null;
};

A.setTempo = (mul) => {
  A.tempoMul = mul;
};

/* ---------- Bruitages ---------- */
A.sfx = (name, arg) => {
  if (!A.ready) return;
  const c = A.ctx;
  const t = c.currentTime + 0.005;
  const B = A.sfxBus;
  switch (name) {
    case 'click':
      voice('pulse25', 1046, t, 0.04, 0.12, B);
      break;
    case 'tap':
      voice('pulse12', 660, t, 0.03, 0.1, B);
      break;
    case 'swipe':
      noiseHit(t, 0.16, 0.18, 2500, B, 9000);
      break;
    case 'stamp':
      kick(t, B, 0.9);
      noiseHit(t, 0.07, 0.3, 300, B, 3000);
      voice('pulse50', 784, t + 0.06, 0.07, 0.12, B);
      voice('pulse50', 1046, t + 0.13, 0.12, 0.12, B);
      break;
    case 'fine': {
      const o = voice('square', 120, t, 0.28, 0.1, B);
      o.frequency.setValueAtTime(120, t);
      o.frequency.linearRampToValueAtTime(90, t + 0.28);
      for (let i = 0; i < 6; i++) noiseHit(t + 0.3 + i * 0.045, 0.03, 0.12, 3000, B);
      voice('pulse25', 523, t + 0.6, 0.08, 0.1, B);
      break;
    }
    case 'correct':
      [1046, 1318, 1568].forEach((f, i) => voice('pulse25', f, t + i * 0.055, 0.08, 0.11, B));
      break;
    case 'wrong': {
      const o = voice('square', 220, t, 0.32, 0.12, B);
      o.frequency.linearRampToValueAtTime(98, t + 0.32);
      noiseHit(t, 0.2, 0.12, 200, B, 1200);
      break;
    }
    case 'coin':
      voice('pulse25', 988, t, 0.06, 0.1, B);
      voice('pulse25', 1318, t + 0.06, 0.16, 0.1, B);
      break;
    case 'combo': {
      const k = Math.min(arg || 1, 8);
      voice('pulse12', 523 * Math.pow(2, k / 12), t, 0.06, 0.1, B);
      voice('pulse12', 784 * Math.pow(2, k / 12), t + 0.05, 0.09, 0.1, B);
      break;
    }
    case 'tick':
      voice('pulse12', 1760, t, 0.025, 0.06, B);
      break;
    case 'alarm':
      voice('pulse50', 880, t, 0.08, 0.08, B);
      voice('pulse50', 660, t + 0.1, 0.08, 0.08, B);
      break;
    case 'star':
      [1568, 2093, 2637].forEach((f, i) => voice('pulse25', f, t + i * 0.04, 0.1, 0.07, B));
      break;
    case 'whistle': {
      const o = voice('sine', 2100, t, 0.45, 0.16, B);
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = 28;
      lg.gain.value = 120;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(t);
      lfo.stop(t + 0.5);
      break;
    }
    case 'uv': {
      const o = voice('sine', 300, t, 0.3, 0.12, B);
      o.frequency.exponentialRampToValueAtTime(1800, t + 0.3);
      break;
    }
    case 'open':
      [523, 659, 784, 1046, 1318].forEach((f, i) => voice('pulse25', f, t + i * 0.07, 0.12, 0.1, B));
      break;
    case 'arrive':
      noiseHit(t, 0.25, 0.08, 400, B, 2000);
      voice('tri', 392, t, 0.1, 0.12, B);
      voice('tri', 523, t + 0.1, 0.12, 0.12, B);
      break;
    case 'door':
      voice('pulse50', 659, t, 0.18, 0.08, B);
      voice('pulse50', 523, t + 0.2, 0.26, 0.08, B);
      break;
    case 'hint':
      [880, 1175, 880, 1175].forEach((f, i) => voice('pulse12', f, t + i * 0.08, 0.07, 0.08, B));
      break;
    case 'buy':
      voice('pulse25', 784, t, 0.06, 0.1, B);
      voice('pulse25', 1046, t + 0.07, 0.06, 0.1, B);
      voice('pulse25', 1568, t + 0.14, 0.14, 0.1, B);
      break;
    case 'error':
      voice('square', 150, t, 0.12, 0.08, B);
      break;
    default:
      break;
  }
};

/* ---------- Musiques des villes ajoutées ---------- */
// Moscou : petite valse en ré mineur (mesures de 12 doubles-croches = 3 temps)
function waltz(chords) {
  const bass = [];
  const stab = [];
  for (const c of chords) {
    const { root, tones } = chord(c);
    bass.push([root - 12, 4], ['.', 8]);
    stab.push(['.', 4], [tones[1] + 12, 2], ['.', 2], [tones[2] + 12, 2], ['.', 2]);
  }
  return { bass, stab };
}
const MOSCOW_CHORDS = ['Dm', 'A', 'Dm', 'Gm', 'Dm', 'A', 'A', 'Dm'];
const mw = waltz(MOSCOW_CHORDS);
A.SONGS.moscow = {
  bpm: 150,
  loop: true,
  tracks: [
    { wave: 'pulse25', vol: 0.12, seq: L(
      ['D5', 4], ['F5', 2], ['A5', 2], ['D6', 4],
      ['C#6', 4], ['A5', 2], ['E5', 2], ['A5', 4],
      ['F5', 4], ['E5', 2], ['D5', 2], ['A4', 4],
      ['Bb4', 4], ['D5', 2], ['G5', 2], ['Bb5', 4],
      ['A5', 4], ['G5', 2], ['F5', 2], ['E5', 4],
      ['F5', 2], ['E5', 2], ['D5', 2], ['C#5', 2], ['E5', 4],
      ['A4', 4], ['C#5', 2], ['E5', 2], ['G5', 4],
      ['F5', 4], ['E5', 2], ['C#5', 2], ['D5', 4]) },
    { wave: 'tri', vol: 0.36, seq: mw.bass },
    { wave: 'pulse12', vol: 0.06, seq: mw.stab },
  ],
  drums: 'k...h...h...',
};

// Train de nuit : berceuse rêveuse en la mineur
const NIGHT_CHORDS = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'];
A.SONGS.night = {
  bpm: 88,
  loop: true,
  tracks: [
    { wave: 'pulse12', vol: 0.11, seq: L(
      ['E5', 6], ['D5', 2], ['C5', 4], ['A4', 4],
      ['C5', 6], ['D5', 2], ['E5', 8],
      ['G5', 6], ['F5', 2], ['E5', 4], ['C5', 4],
      ['D5', 12], ['.', 4],
      ['A5', 6], ['G5', 2], ['E5', 4], ['C5', 4],
      ['F5', 6], ['E5', 2], ['C5', 8],
      ['E5', 4], ['G5', 4], ['C6', 8],
      ['B5', 8], ['.', 8]) },
    { wave: 'tri', vol: 0.3, seq: NIGHT_CHORDS.flatMap((c) => { const { root } = chord(c); return [[root - 12, 8], [root - 5, 8]]; }) },
    { wave: 'pulse25', vol: 0.03, seq: arpFrom(NIGHT_CHORDS) },
  ],
  drums: 'k.......h.......',
};

// Le Grand Express : air oriental (mode hijaz sur ré)
const ORIENT_CHORDS = ['D', 'Gm', 'Gm', 'D', 'D', 'Cm', 'D', 'D'];
A.SONGS.orient = {
  bpm: 120,
  loop: true,
  tracks: [
    { wave: 'pulse25', vol: 0.12, seq: L(
      ['D5', 2], ['Eb5', 2], ['F#5', 4], ['G5', 2], ['F#5', 2], ['Eb5', 2], ['D5', 2],
      ['A5', 4], ['Bb5', 2], ['A5', 2], ['G5', 2], ['F#5', 2], ['G5', 4],
      ['Bb5', 2], ['A5', 2], ['G5', 2], ['F#5', 2], ['G5', 4], ['D5', 4],
      ['Eb5', 2], ['F#5', 2], ['A5', 4], ['G5', 2], ['F#5', 2], ['Eb5', 4],
      ['D5', 2], ['Eb5', 2], ['F#5', 4], ['G5', 2], ['F#5', 2], ['Eb5', 2], ['D5', 2],
      ['C6', 2], ['Bb5', 2], ['A5', 2], ['G5', 2], ['A5', 4], ['Bb5', 4],
      ['A5', 2], ['G5', 2], ['F#5', 2], ['Eb5', 2], ['F#5', 4], ['A5', 4],
      ['G5', 2], ['F#5', 2], ['Eb5', 2], ['F#5', 2], ['D5', 8]) },
    { wave: 'tri', vol: 0.34, seq: bassFrom(ORIENT_CHORDS, [0, 0, 7, 0, 0, 7, 0, 12]) },
  ],
  drums: 'k..sk.s.k..sk.ss',
};

// New York : swing jazzy en fa majeur
const NYC_CHORDS = ['F', 'Dm', 'Gm', 'C', 'F', 'Dm', 'Bb', 'C'];
A.SONGS.nyc = {
  bpm: 132,
  loop: true,
  tracks: [
    { wave: 'pulse50', vol: 0.1, seq: L(
      ['A5', 3], ['C6', 1], ['A5', 2], ['F5', 2], ['G5', 3], ['A5', 1], ['G5', 4],
      ['F5', 3], ['A5', 1], ['D6', 4], ['C6', 4], ['A5', 4],
      ['Bb5', 3], ['A5', 1], ['G5', 2], ['F5', 2], ['D5', 4], ['G5', 4],
      ['E5', 3], ['G5', 1], ['C6', 4], ['Bb5', 4], ['G5', 4],
      ['A5', 3], ['C6', 1], ['A5', 2], ['F5', 2], ['G5', 3], ['A5', 1], ['G5', 4],
      ['F5', 3], ['A5', 1], ['D6', 4], ['F6', 4], ['D6', 4],
      ['D6', 3], ['C6', 1], ['Bb5', 2], ['A5', 2], ['G5', 4], ['Bb5', 4],
      ['C6', 4], ['E5', 4], ['F5', 8]) },
    { wave: 'tri', vol: 0.34, seq: bassFrom(NYC_CHORDS, [0, 4, 7, 9, 12, 9, 7, 4]) },
    { wave: 'pulse12', vol: 0.04, seq: arpFrom(NYC_CHORDS) },
  ],
  drums: 'k..hs.h.k.hhs.h.',
};

// Berlin : techno minimaliste en la mineur
const BERLIN_CHORDS = ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'F', 'E'];
A.SONGS.berlin = {
  bpm: 138,
  loop: true,
  tracks: [
    { wave: 'pulse25', vol: 0.1, seq: L(
      ['A5', 2], ['.', 2], ['A5', 2], ['C6', 2], ['.', 2], ['A5', 2], ['E6', 4],
      ['A5', 2], ['.', 2], ['A5', 2], ['C6', 2], ['.', 2], ['B5', 2], ['G5', 4],
      ['F5', 2], ['.', 2], ['F5', 2], ['A5', 2], ['.', 2], ['C6', 2], ['A5', 4],
      ['G5', 2], ['.', 2], ['G5', 2], ['B5', 2], ['.', 2], ['D6', 2], ['B5', 4],
      ['A5', 2], ['.', 2], ['A5', 2], ['C6', 2], ['.', 2], ['A5', 2], ['E6', 4],
      ['A5', 2], ['.', 2], ['A5', 2], ['C6', 2], ['.', 2], ['E6', 2], ['A6', 4],
      ['F6', 2], ['E6', 2], ['C6', 2], ['A5', 2], ['F5', 2], ['A5', 2], ['C6', 4],
      ['E6', 2], ['D6', 2], ['B5', 2], ['G#5', 2], ['E5', 8]) },
    { wave: 'tri', vol: 0.4, seq: bassFrom(BERLIN_CHORDS, [0, 0, 12, 0, 0, 12, 0, 12]) },
  ],
  drums: 'k.h.k.h.k.h.k.hs',
};

// Venise : barcarolle à 6/8 en ré mineur
const VENISE_CHORDS = ['Dm', 'A', 'Dm', 'Gm', 'Dm', 'Bb', 'A', 'Dm'];
A.SONGS.venise = {
  bpm: 104,
  loop: true,
  tracks: [
    { wave: 'pulse25', vol: 0.11, seq: L(
      ['F5', 6], ['E5', 2], ['D5', 4], ['A5', 4],
      ['G5', 6], ['F5', 2], ['E5', 8],
      ['F5', 4], ['A5', 4], ['D6', 6], ['C6', 2],
      ['Bb5', 6], ['A5', 2], ['G5', 8],
      ['A5', 6], ['G5', 2], ['F5', 4], ['E5', 4],
      ['D5', 6], ['F5', 2], ['Bb5', 8],
      ['A5', 4], ['C#6', 4], ['E6', 4], ['C#6', 4],
      ['D6', 12], ['.', 4]) },
    { wave: 'tri', vol: 0.3, seq: VENISE_CHORDS.flatMap((c) => { const { root } = chord(c); return [[root - 12, 6], [root - 5, 2], [root - 12, 6], [root - 5, 2]]; }) },
    { wave: 'pulse12', vol: 0.035, seq: arpFrom(VENISE_CHORDS) },
  ],
  drums: 'k.....h.k.....h.',
};

// Colonie de Mars : nappe spatiale en mi mineur
const MARS_CHORDS = ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B'];
A.SONGS.mars = {
  bpm: 112,
  loop: true,
  tracks: [
    { wave: 'pulse12', vol: 0.1, seq: L(
      ['B5', 8], ['G5', 4], ['E5', 4],
      ['E6', 8], ['D6', 4], ['C6', 4],
      ['B5', 8], ['D6', 8],
      ['F#6', 12], ['.', 4],
      ['G6', 8], ['F#6', 4], ['E6', 4],
      ['E6', 8], ['G6', 8],
      ['A6', 6], ['G6', 2], ['E6', 4], ['C6', 4],
      ['D#6', 12], ['B5', 4]) },
    { wave: 'tri', vol: 0.32, seq: MARS_CHORDS.flatMap((c) => { const { root } = chord(c); return [[root - 12, 4], [root - 5, 4], [root, 4], [root - 5, 4]]; }) },
    { wave: 'pulse25', vol: 0.03, seq: arpFrom(MARS_CHORDS) },
  ],
  drums: 'k.......s.....h.',
};
