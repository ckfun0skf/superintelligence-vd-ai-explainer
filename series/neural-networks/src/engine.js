// Deterministic SVG scene engine for Part 02. Every visual state is a pure
// function of the active chapter's narration time `t` (seconds), so seeking,
// pausing and frame-by-frame export always reconstruct identical frames.
import { WORDS } from './timing-data.js';

export const NS = 'http://www.w3.org/2000/svg';
export const W = 1920;
export const H = 1080;

export const C = {
  bg: '#07101a',
  ink: '#eef5f8',
  dim: '#8fa6b4',
  faint: '#3a5263',
  line: '#24384a',
  panel: '#0e1b27',
  teal: '#5eead4',
  cyan: '#7dd3fc',
  amber: '#fbbf24',
  orange: '#fb923c',
  red: '#f87171',
  rose: '#fb7185',
  green: '#4ade80',
  blue: '#60a5fa',
  violet: '#c084fc',
  R: '#ff6b6b',
  G: '#4ade80',
  B: '#60a5fa',
  light: '#e8e4da',
  dark: '#2a3038',
};
export const SANS = "Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace";

// ---------- math ----------
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const easeIO = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeOut = k => 1 - Math.pow(1 - k, 3);
export const easeBack = k => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
/** Eased 0→1 progress from time a over duration d. */
export const p = (t, a, d = 0.6, fn = easeIO) => fn(clamp((t - a) / d));
/** Linear 0→1 progress. */
export const pl = (t, a, d) => clamp((t - a) / d);
/** Visibility envelope: fades in at a, out at b. */
export const vis = (t, a, b = Infinity, fi = 0.5, fo = 0.5) => Math.min(p(t, a, fi), 1 - p(t, b, fo));
export const mix = (c1, c2, k) => {
  const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const a = h(c1), b = h(c2);
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], clamp(k))).toString(16).padStart(2, '0')).join('');
};
export const grey = v => { const n = Math.round(clamp(v) * 255).toString(16).padStart(2, '0'); return `#${n}${n}${n}`; };
export const fmt = (v, d = 1) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
// Small deterministic hash noise (no Math.random anywhere).
export const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- DOM ----------
const cache = new WeakMap();
export function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) {
    if (k === 'text') n.textContent = attrs[k];
    else n.setAttribute(k, attrs[k]);
  }
  if (parent) parent.appendChild(n);
  return n;
}
/** Set attributes only when they change (keeps per-frame updates cheap). */
export function set(n, attrs) {
  let c = cache.get(n);
  if (!c) { c = {}; cache.set(n, c); }
  for (const k in attrs) {
    let v = attrs[k];
    if (typeof v === 'number') v = Math.round(v * 1000) / 1000;
    if (c[k] === v) continue;
    c[k] = v;
    if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v);
  }
}
export const show = (n, o) => set(n, { opacity: clamp(o), visibility: o <= 0.001 ? 'hidden' : 'visible' });
export const move = (n, x, y, s = 1, r = 0) => set(n, { transform: `translate(${x} ${y})${s !== 1 ? ` scale(${s})` : ''}${r ? ` rotate(${r})` : ''}` });
export const g = (parent, attrs = {}) => el('g', attrs, parent);

export function txt(parent, x, y, str, o = {}) {
  return el('text', {
    x, y, text: str,
    'font-family': o.mono ? MONO : SANS,
    'font-size': o.size || 32,
    'font-weight': o.weight || 600,
    fill: o.fill || C.ink,
    'text-anchor': o.anchor || 'middle',
    'dominant-baseline': 'middle',
    ...(o.ls ? { 'letter-spacing': o.ls } : {}),
    ...(o.attrs || {}),
  }, parent);
}

export function rect(parent, x, y, w, h, o = {}) {
  return el('rect', { x, y, width: w, height: h, rx: o.r ?? 18, fill: o.fill || C.panel, stroke: o.stroke || C.line, 'stroke-width': o.sw ?? 2, ...(o.attrs || {}) }, parent);
}

/** Panel with soft border — the basic "card". */
export function card(parent, x, y, w, h, o = {}) {
  const gg = g(parent);
  rect(gg, x, y, w, h, { r: o.r ?? 22, fill: o.fill || '#0d1a26', stroke: o.stroke || '#2b4559', sw: o.sw ?? 2 });
  return gg;
}

export function arrowHead(parent, color) {
  return el('path', { d: 'M -18 -12 L 4 0 L -18 12 Z', fill: color }, parent);
}

/** Position of an arrow head at the end of a path, oriented along it. */
export function headAt(head, path, frac = 1) {
  const L = path.getTotalLength();
  const a = path.getPointAtLength(L * clamp(frac));
  const b = path.getPointAtLength(Math.max(0, L * clamp(frac) - 2));
  const ang = Math.atan2(a.y - b.y, a.x - b.x) * 180 / Math.PI;
  set(head, { transform: `translate(${a.x} ${a.y}) rotate(${ang})` });
}

/** Reveal a path by drawing it from 0→frac of its length. */
export function draw(path, frac) {
  const L = path.__len || (path.__len = path.getTotalLength());
  set(path, { 'stroke-dasharray': `${L} ${L}`, 'stroke-dashoffset': L * (1 - clamp(frac)), visibility: frac <= 0.002 ? 'hidden' : 'visible' });
}

export function pointOn(path, frac) {
  const L = path.__len || (path.__len = path.getTotalLength());
  return path.getPointAtLength(L * clamp(frac));
}

// ---------- glow filter / defs ----------
export function defs(svg) {
  const d = el('defs', {}, svg);
  for (const [id, sd] of [['glow', 6], ['glowBig', 16], ['soft', 2.5]]) {
    const f = el('filter', { id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, d);
    el('feGaussianBlur', { stdDeviation: sd, result: 'b' }, f);
    const m = el('feMerge', {}, f);
    el('feMergeNode', { in: 'b' }, m);
    el('feMergeNode', { in: 'SourceGraphic' }, m);
  }
  const shadow = el('filter', { id: 'shadow', x: '-20%', y: '-20%', width: '140%', height: '160%' }, d);
  el('feDropShadow', { dx: 0, dy: 10, stdDeviation: 14, 'flood-color': '#000', 'flood-opacity': 0.5 }, shadow);
  const rg = el('radialGradient', { id: 'vignette', cx: '50%', cy: '45%', r: '75%' }, d);
  el('stop', { offset: '0%', 'stop-color': '#0f2232' }, rg);
  el('stop', { offset: '100%', 'stop-color': '#050a11' }, rg);
  return d;
}

// ---------- narration cues ----------
const norm = w => w.toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9']/g, '');

export class Cues {
  constructor(ch) {
    this.words = WORDS[ch];
    this.n = this.words.map(w => norm(w[0]));
    this.duration = this.words[this.words.length - 1][2];
  }
  _find(phrase, after = 0) {
    const q = phrase.split(/\s+/).map(norm).filter(Boolean);
    for (let i = 0; i <= this.n.length - q.length; i++) {
      if (this.words[i][1] < after) continue;
      let ok = true;
      for (let j = 0; j < q.length; j++) if (this.n[i + j] !== q[j]) { ok = false; break; }
      if (ok) return i;
    }
    throw new Error(`Cue phrase not found: "${phrase}" after ${after}`);
  }
  /** Start time of the first word of `phrase` (first occurrence after `after`). */
  at(phrase, after = 0) { return this.words[this._find(phrase, after)][1]; }
  /** End time of the last word of `phrase`. */
  end(phrase, after = 0) {
    const i = this._find(phrase, after);
    return this.words[i + phrase.split(/\s+/).filter(w => norm(w)).length - 1][2];
  }
  /** Sentences for the caption strip: [{start, end, words:[[w,s,e]]}] */
  sentences() {
    const out = []; let cur = null;
    for (const w of this.words) {
      if (!cur) { cur = { start: w[1], words: [] }; out.push(cur); }
      cur.words.push(w); cur.end = w[2];
      if (/[.?!:;]["”’]?$/.test(w[0])) cur = null;
    }
    return out;
  }
}

// ---------- reusable visual parts ----------

/** A neuron "unit": circle with optional symbol. Returns {g, ring, core, label}. */
export function neuron(parent, r = 60, o = {}) {
  const gg = g(parent);
  const halo = el('circle', { r: r * 1.35, fill: o.color || C.teal, opacity: 0.08 }, gg);
  const ring = el('circle', { r, fill: '#0c1f2a', stroke: o.color || C.teal, 'stroke-width': o.sw || 5 }, gg);
  const core = el('circle', { r: r * 0.55, fill: o.color || C.teal, opacity: 0.0 }, gg);
  const label = txt(gg, 0, 2, o.symbol || '', { size: r * 0.8, weight: 700, fill: o.color || C.teal, mono: true });
  return { g: gg, ring, core, halo, label };
}

/** A rotary dial (weight knob). value maps to angle. */
export function dial(parent, r = 34, o = {}) {
  const gg = g(parent);
  el('circle', { r: r + 6, fill: 'none', stroke: o.color || C.amber, 'stroke-width': 2, opacity: 0.35, 'stroke-dasharray': '3 6' }, gg);
  el('circle', { r, fill: '#1d1a10', stroke: o.color || C.amber, 'stroke-width': 4 }, gg);
  const needle = g(gg);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -r + 6, stroke: o.color || C.amber, 'stroke-width': 6, 'stroke-linecap': 'round' }, needle);
  el('circle', { r: 6, fill: o.color || C.amber }, gg);
  return { g: gg, needle, setValue(v, min = -2, max = 2) { set(needle, { transform: `rotate(${lerp(-135, 135, clamp((v - min) / (max - min)))})` }); } };
}

/** Horizontal bar meter: returns {g, fill, setValue(0..1)}. */
export function meter(parent, x, y, w, h, color, o = {}) {
  const gg = g(parent);
  rect(gg, x, y, w, h, { r: h / 2, fill: o.track || '#132433', stroke: 'none' });
  const fill = rect(gg, x, y, 0, h, { r: h / 2, fill: color, stroke: 'none' });
  return { g: gg, fill, setValue(v) { set(fill, { width: Math.max(0, w * clamp(v)) }); } };
}

/** Simple person icon (head + shoulders). */
export function person(parent, s = 1, color = C.dim) {
  const gg = g(parent);
  el('circle', { cx: 0, cy: -34 * s, r: 18 * s, fill: color }, gg);
  el('path', { d: `M ${-32 * s} ${20 * s} Q ${-32 * s} ${-10 * s} 0 ${-10 * s} Q ${32 * s} ${-10 * s} ${32 * s} ${20 * s} Z`, fill: color }, gg);
  return gg;
}

/** A labelled colour swatch card. */
export function swatch(parent, size, color, o = {}) {
  const gg = g(parent);
  const r = rect(gg, -size / 2, -size / 2, size, size, { r: size * 0.12, fill: color, stroke: o.stroke || '#ffffff33', sw: 3 });
  return { g: gg, rect: r };
}
