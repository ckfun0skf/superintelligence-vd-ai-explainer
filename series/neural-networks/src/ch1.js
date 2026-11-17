// Chapter 1 — What is the core idea behind modern AI?
import photoUrl from '../references/smithsonian-mark-i-perceptron-reference.jpg';
// Optional historical portraits: drop references/mcculloch.jpg and references/pitts.jpg in to use them.
const PORTRAITS = import.meta.glob('../references/{mcculloch,pitts}.{jpg,jpeg,png}', { eager: true, query: '?url', import: 'default' });
const portraitUrl = name => Object.entries(PORTRAITS).find(([k]) => k.includes(`/${name}.`))?.[1];
import { el, set, show, move, g, txt, rect, card, neuron, person, dial, draw, pointOn, headAt, arrowHead,
  p, pl, vis, lerp, clamp, easeOut, easeBack, mix, fmt, hash, C, MONO, hush } from './engine.js';

export function createChapter1(root, cue) {
  const T = {
    q: cue.at('What is the most'), qEnd: cue.end('inside AI?'),
    noOne: cue.at("There isn't one"), every: cue.at('every kind of AI'),
    but: cue.at('But one of the central'), engines: cue.at('central engines'), gen: cue.at('modern generative AI'),
    nn: cue.at('is the neural network'),
    myst: cue.at('The name can sound'), mystW: cue.at('mysterious'),
    math: cue.at('A neural network is a mathematical'),
    numIn: cue.at('numbers go in'), calc: cue.at('calculations transform'), numOut: cue.at('and numbers come out'),
    train: cue.at('Training changes'), adjustable: cue.at('adjustable values inside'), those: cue.at('those calculations'),
    idea: cue.at('The idea begins'), simplified: cue.at('simplified mathematical model'), inspired: cue.at('inspired by a biological'), bio: cue.at('biological neuron'),
    y43: cue.at('In 1943'), names43: cue.at('Warren McCulloch'), model43: cue.at('described one such model'),
    y58: cue.at('In 1958'), rosen: cue.at('Frank Rosenblatt'), perc: cue.at('the perceptron'), learn: cue.at('could learn to separate'), sep: cue.at('separate patterns'),
    notCopy: cue.at('These were not tiny'), brain: cue.at('of a brain'),
    blocks: cue.at('They were building blocks'), newKind: cue.at('new kind of calculation'),
    see: cue.at('To see how those'), follow: cue.at("let's follow one number"), oneNum: cue.at('one number at a time'),
  };

  // =========== Scene A: chat question & kinds of AI ===========
  const A = g(root);
  const chat = g(A);
  card(chat, -560, -250, 1120, 500, { r: 30 });
  txt(chat, -500, -200, 'Assistant', { size: 30, anchor: 'start', fill: C.dim, weight: 600 });
  el('circle', { cx: -526, cy: -200, r: 9, fill: C.teal }, chat);
  el('line', { x1: -530, y1: -160, x2: 530, y2: -160, stroke: C.line, 'stroke-width': 2 }, chat);
  // composer
  rect(chat, -520, 140, 1040, 80, { r: 40, fill: '#0a141e', stroke: '#2f4a5e' });
  const composerText = txt(chat, -480, 181, '', { size: 34, anchor: 'start', weight: 500 });
  const caret = el('rect', { x: 0, y: 160, width: 3, height: 42, fill: C.teal }, chat);
  const sendBtn = el('circle', { cx: 470, cy: 180, r: 28, fill: C.teal }, chat);
  txt(chat, 470, 182, '↑', { size: 34, fill: '#04221c', weight: 800 });
  // sent bubble
  const bubble = g(chat);
  rect(bubble, -330, -40, 660, 80, { r: 36, fill: '#163447', stroke: '#2f5d78' });
  txt(bubble, 0, 1, 'What is the most important thing inside AI?', { size: 32, weight: 600 });
  const QUESTION = 'What is the most important thing inside AI?';

  // kinds of AI tiles
  const kinds = g(A);
  const kindDefs = [
    { name: 'Rules', draw: k => { for (let i = 0; i < 3; i++) { txt(k, -60, -40 + i * 34, 'IF', { size: 22, fill: C.amber, mono: true, anchor: 'start' }); rect(k, -16, -52 + i * 34, 80, 20, { r: 6, fill: '#26394a', stroke: 'none' }); } } },
    { name: 'Search', draw: k => { const pts = [[0, -55], [-50, -5], [50, -5], [-75, 45], [-25, 45], [25, 45], [75, 45]]; [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].forEach(([a, b]) => el('line', { x1: pts[a][0], y1: pts[a][1], x2: pts[b][0], y2: pts[b][1], stroke: C.cyan, 'stroke-width': 3 }, k)); pts.forEach(q => el('circle', { cx: q[0], cy: q[1], r: 10, fill: '#0c1f2a', stroke: C.cyan, 'stroke-width': 3 }, k)); } },
    { name: 'Statistics', draw: k => { [30, 55, 40, 80, 65].forEach((h, i) => rect(k, -70 + i * 30, 50 - h, 20, h, { r: 4, fill: C.violet, stroke: 'none' })); el('line', { x1: -80, y1: 52, x2: 80, y2: 52, stroke: C.dim, 'stroke-width': 3 }, k); } },
    { name: 'Neural network', draw: null },
  ];
  const kindG = kindDefs.map((k, i) => {
    const gg = g(kinds);
    card(gg, -150, -130, 300, 260, { r: 24 });
    const icon = g(gg, { transform: 'translate(0 -20)' });
    if (k.draw) k.draw(icon);
    txt(gg, 0, 92, k.name, { size: 30, weight: 700 });
    return { g: gg, icon, name: k.name };
  });
  // mini neural network icon (also becomes the central network)
  const nnIcon = kindG[3].icon;
  const miniPts = [[-60, -45], [-60, 0], [-60, 45], [0, -25], [0, 25], [60, 0]];
  [[0, 3], [0, 4], [1, 3], [1, 4], [2, 3], [2, 4], [3, 5], [4, 5]].forEach(([a, b]) => el('line', { x1: miniPts[a][0], y1: miniPts[a][1], x2: miniPts[b][0], y2: miniPts[b][1], stroke: C.teal, 'stroke-width': 3, opacity: 0.7 }, nnIcon));
  miniPts.forEach(q => el('circle', { cx: q[0], cy: q[1], r: 12, fill: '#0c1f2a', stroke: C.teal, 'stroke-width': 4 }, nnIcon));

  // generative outputs
  const gen = g(A);
  const genDefs = [['Text', 'Aa'], ['Images', '▣'], ['Voice', '∿']];
  const genG = genDefs.map(([n, s], i) => {
    const gg = g(gen);
    card(gg, -130, -55, 260, 110, { r: 22, stroke: '#3b5a4f' });
    txt(gg, -70, 2, s, { size: 44, weight: 800, fill: C.teal });
    txt(gg, 30, 2, n, { size: 30, weight: 700 });
    return gg;
  });
  const genTitle = txt(gen, 0, 0, 'Generative AI', { size: 34, weight: 800, fill: C.teal });
  const genLinks = genDefs.map(() => el('path', { d: '', fill: 'none', stroke: C.teal, 'stroke-width': 4, opacity: 0.8 }, gen));
  const engineLabel = txt(A, 0, 0, 'ONE CENTRAL ENGINE', { size: 26, weight: 700, fill: C.amber, mono: true, ls: 3 });

  // =========== Scene B: the network as a mathematical system ===========
  const B = g(root);
  const layers = [[-420, [-200, 0, 200]], [0, [-260, -90, 90, 260]], [420, [0]]];
  const nodes = [];
  layers.forEach(([x, ys], li) => ys.forEach(y => nodes.push({ x, y, li })));
  const edges = [];
  nodes.forEach((a, i) => nodes.forEach((b, j) => { if (b.li === a.li + 1) edges.push({ a: i, b: j }); }));
  const edgeG = g(B);
  edges.forEach(e => {
    const A_ = nodes[e.a], B_ = nodes[e.b];
    e.path = el('path', { d: `M ${A_.x} ${A_.y} C ${A_.x + 140} ${A_.y} ${B_.x - 140} ${B_.y} ${B_.x} ${B_.y}`, fill: 'none', stroke: C.teal, 'stroke-width': 3, opacity: 0.45 }, edgeG);
  });
  const nodeG = g(B);
  nodes.forEach(n => {
    n.u = neuron(nodeG, n.li === 2 ? 64 : 50, { symbol: n.li === 0 ? '' : n.li === 1 ? '×+' : 'Σ' });
    move(n.u.g, n.x, n.y);
    set(n.u.label, { 'font-size': n.li === 2 ? 40 : 30 });
  });
  // mystery fog: question marks
  const mystG = g(B);
  const qm = Array.from({ length: 14 }, (_, i) => txt(mystG, 0, 0, '?', { size: 60 + hash(i) * 70, weight: 800, fill: C.violet }));
  const mystBlob = el('ellipse', { cx: 0, cy: 0, rx: 620, ry: 380, fill: C.violet, opacity: 0.0, filter: 'url(#glowBig)' }, B);
  B.insertBefore(mystBlob, edgeG);
  // header text
  const headB = txt(B, 0, -420, 'A mathematical system', { size: 56, weight: 800 });
  const subB = g(B);
  const subWords = [['Numbers in', -560, C.cyan], ['→', -300, C.dim], ['Calculations', 0, C.teal], ['→', 300, C.dim], ['Numbers out', 560, C.amber]];
  const subEls = subWords.map(([s, x, f]) => txt(subB, x, 420, s, { size: 44, weight: 800, fill: f }));
  // number chips
  const inVals = [0.8, 0.3, 0.5];
  const chips = inVals.map((v, i) => {
    const gg = g(B);
    rect(gg, -70, -34, 140, 68, { r: 16, fill: '#0f2a3a', stroke: C.cyan, sw: 3 });
    const tx = txt(gg, 0, 2, v.toFixed(1), { size: 38, weight: 700, fill: C.cyan, mono: true });
    return { g: gg, tx };
  });
  const midVals = nodes.filter(n => n.li === 1).map((n, i) => txt(B, n.x, n.y + 82, '', { size: 30, weight: 700, fill: C.teal, mono: true }));
  const outChip = g(B);
  rect(outChip, -90, -40, 180, 80, { r: 18, fill: '#2a1f08', stroke: C.amber, sw: 4 });
  const outTx = txt(outChip, 0, 3, '0.71', { size: 46, weight: 800, fill: C.amber, mono: true });
  const pulses = Array.from({ length: edges.length }, () => el('circle', { r: 8, fill: C.cyan, filter: 'url(#glow)' }, B));
  // knobs on selected edges
  const knobEdges = [0, 4, 8, 13, 15];
  const knobs = knobEdges.map(i => { const d = dial(B, 26); return { d, e: edges[i] }; });
  const knobLabel = txt(B, 0, -340, 'adjustable values', { size: 36, weight: 700, fill: C.amber });

  // =========== Scene C: biological neuron → simplified model ===========
  const Cg = g(root);
  const bio = g(Cg);
  // dendrites
  const dendrites = [];
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.62 + i * 0.12);
    const len = 170 + hash(i) * 60;
    const x2 = Math.cos(a) * len, y2 = Math.sin(a) * len;
    const mx = Math.cos(a + 0.25) * len * 0.5, my = Math.sin(a + 0.25) * len * 0.5;
    dendrites.push(el('path', { d: `M 0 0 Q ${mx} ${my} ${x2} ${y2} M ${x2 * 0.7} ${y2 * 0.7} L ${x2 * 0.75 + Math.cos(a - 0.6) * 50} ${y2 * 0.75 + Math.sin(a - 0.6) * 50}`, fill: 'none', stroke: '#c4b5fd', 'stroke-width': 7, 'stroke-linecap': 'round' }, bio));
  }
  const axon = el('path', { d: 'M 0 0 C 120 -20 200 30 330 10 S 460 -10 520 0', fill: 'none', stroke: '#c4b5fd', 'stroke-width': 9, 'stroke-linecap': 'round' }, bio);
  [0, 1, 2].forEach(i => el('rect', { x: 120 + i * 120, y: -12, width: 70, height: 26, rx: 13, fill: '#7c6fd6', opacity: 0.8, transform: `rotate(${i === 1 ? 4 : -3} ${155 + i * 120} 0)` }, bio));
  [[-40], [0], [40]].forEach(([dy]) => el('path', { d: `M 520 0 Q 560 ${dy * 0.4} 600 ${dy}`, fill: 'none', stroke: '#c4b5fd', 'stroke-width': 6, 'stroke-linecap': 'round' }, bio));
  el('circle', { cx: 0, cy: 0, r: 62, fill: '#4c3f99', stroke: '#c4b5fd', 'stroke-width': 6 }, bio);
  el('circle', { cx: 6, cy: -4, r: 20, fill: '#c4b5fd', opacity: 0.6 }, bio);
  const bioTitle = txt(Cg, 0, 0, 'Biological neuron', { size: 40, weight: 800, fill: '#c4b5fd' });
  const bioParts = [['dendrites', -190, 230], ['cell body', 0, 230], ['axon', 330, 230]].map(([n, x, y]) => txt(bio, x, y, n, { size: 32, weight: 700, fill: '#c4b5fd' }));
  // math model
  const art = g(Cg);
  const artIns = [-90, 0, 90].map(y => el('path', { d: `M -260 ${y} L -64 ${y * 0.4}`, fill: 'none', stroke: C.teal, 'stroke-width': 6, 'stroke-linecap': 'round' }, art));
  const artOut = el('path', { d: 'M 64 0 L 280 0', fill: 'none', stroke: C.teal, 'stroke-width': 7, 'stroke-linecap': 'round' }, art);
  const artHead = arrowHead(art, C.teal); set(artHead, { transform: 'translate(290 0)' });
  const artN = neuron(art, 64, { symbol: 'Σ' });
  const artTitle = txt(Cg, 0, 0, 'Simplified math model', { size: 40, weight: 800, fill: C.teal });
  const artParts = [['inputs', -190, 220], ['combine', 0, 220], ['output', 200, 220]].map(([n, x, y]) => txt(art, x, y, n, { size: 32, weight: 700, fill: C.teal }));
  const inspiredArrow = g(Cg);
  const inspPath = el('path', { d: 'M -150 0 L 150 0', fill: 'none', stroke: C.amber, 'stroke-width': 6, 'stroke-dasharray': '14 12' }, inspiredArrow);
  const inspHead = arrowHead(inspiredArrow, C.amber); set(inspHead, { transform: 'translate(160 0)' });
  txt(inspiredArrow, 0, -40, 'inspired by', { size: 30, weight: 700, fill: C.amber });
  const mapLines = [0, 1, 2].map(() => el('path', { d: '', fill: 'none', stroke: C.amber, 'stroke-width': 3, 'stroke-dasharray': '6 10', opacity: 0.7 }, Cg));

  // =========== Scene D: history timeline 1943 / 1958 ===========
  const D = g(root);
  const tl = g(D);
  el('line', { x1: -760, y1: 0, x2: 760, y2: 0, stroke: C.faint, 'stroke-width': 4 }, tl);
  const tlFill = el('line', { x1: -760, y1: 0, x2: -760, y2: 0, stroke: C.amber, 'stroke-width': 6 }, tl);
  const yearMarks = [['1943', -380], ['1958', 380]].map(([y, x]) => {
    const gg = g(tl);
    el('circle', { cx: x, cy: 0, r: 14, fill: C.amber }, gg);
    txt(gg, x, 54, y, { size: 52, weight: 800, fill: C.amber, mono: true });
    return gg;
  });
  // 1943 McCulloch–Pitts threshold unit
  const mp = g(D);
  card(mp, -330, -300, 660, 470, { r: 26 });
  const mpNames = txt(mp, 0, -250, 'Warren McCulloch & Walter Pitts', { size: 32, weight: 700 });
  const portraits = [['mcculloch', 'Warren McCulloch', 'neurophysiologist', -520], ['pitts', 'Walter Pitts', 'logician', 520]].map(([key, name, role, x], i) => {
    const gg = g(D);
    rect(gg, -125, -165, 250, 330, { r: 14, fill: '#e9dfc7', stroke: '#b9a77f', sw: 3 });
    const url = portraitUrl(key);
    if (url) {
      el('clipPath', { id: `pclip${i}` }, gg).appendChild(el('rect', { x: -110, y: -150, width: 220, height: 260, rx: 6 }));
      el('image', { href: url, x: -110, y: -150, width: 220, height: 260, preserveAspectRatio: 'xMidYMid slice', 'clip-path': `url(#pclip${i})`, style: 'filter:grayscale(1) sepia(.25)' }, gg);
    } else {
      rect(gg, -110, -150, 220, 260, { r: 6, fill: '#cbbd9e', stroke: 'none' });
      const sil = person(gg, 2.2, '#8a7a5c'); move(sil, 0, 30);
    }
    txt(gg, 0, 135, name, { size: 24, weight: 800, fill: '#2a2216' });
    txt(gg, 0, 192, role, { size: 22, weight: 600, fill: C.dim });
    return gg;
  });
  const mpModel = g(mp);
  const mpIns = [-90, 0, 90].map((y, i) => {
    const gg = g(mpModel);
    el('line', { x1: -200, y1: y, x2: -60, y2: y * 0.4, stroke: C.dim, 'stroke-width': 5 }, gg);
    const box = rect(gg, -270, y - 30, 70, 60, { r: 12, fill: '#0f2a3a', stroke: C.cyan, sw: 3 });
    const tx = txt(gg, -235, y + 2, '0', { size: 34, weight: 800, fill: C.cyan, mono: true });
    return { box, tx, g: gg };
  });
  const mpN = neuron(mpModel, 62, { symbol: '≥2' });
  set(mpN.label, { 'font-size': 34 });
  el('line', { x1: 62, y1: 0, x2: 180, y2: 0, stroke: C.dim, 'stroke-width': 5 }, mpModel);
  rect(mpModel, 180, -34, 76, 68, { r: 12, fill: '#2a1f08', stroke: C.amber, sw: 3 });
  const mpOut = txt(mpModel, 218, 2, '0', { size: 36, weight: 800, fill: C.amber, mono: true });
  move(mpModel, 0, -20);
  const mpCap = txt(mp, 0, 130, 'fires 1 when enough inputs are on', { size: 28, weight: 500, fill: C.dim });
  // 1958 perceptron photo + learning
  const pc = g(D);
  card(pc, -380, -300, 760, 470, { r: 26 });
  const pcName = txt(pc, 0, -250, 'Frank Rosenblatt · the perceptron', { size: 32, weight: 700 });
  el('clipPath', { id: 'photoClip' }, pc).appendChild(el('rect', { x: -355, y: -210, width: 250, height: 320, rx: 14 }));
  const photo = el('image', { href: photoUrl, x: -355, y: -210, width: 250, height: 320, preserveAspectRatio: 'xMidYMid slice', 'clip-path': 'url(#photoClip)' }, pc);
  txt(pc, -230, 140, 'Mark I Perceptron · Smithsonian NMAH', { size: 17, weight: 500, fill: C.dim });
  // learning plot: real perceptron rule on a small 2-feature data set
  const PLX = 150, PLY = -40;
  const plot = g(pc, { transform: `translate(${PLX} ${PLY})` });
  const PX0 = -205, PX1 = 205, PY0 = -170, PY1 = 150;
  const mapX = u => lerp(PX0 + 20, PX1 - 20, (u + 1) / 2), mapY = v => lerp(PY1 - 20, PY0 + 20, (v + 1) / 2);
  rect(plot, PX0, PY0, PX1 - PX0, PY1 - PY0, { r: 12, fill: '#0a141e', stroke: C.line });
  el('clipPath', { id: 'plotClip' }, plot).appendChild(el('rect', { x: PX0, y: PY0, width: PX1 - PX0, height: PY1 - PY0, rx: 12 }));
  const plotInner = g(plot, { 'clip-path': 'url(#plotClip)' });
  const regionA = el('path', { d: '', fill: C.cyan, 'fill-opacity': 0.14 }, plotInner);
  const regionB = el('path', { d: '', fill: C.amber, 'fill-opacity': 0.14 }, plotInner);
  for (let k = -2; k <= 2; k++) {
    el('line', { x1: mapX(k / 2), y1: PY0, x2: mapX(k / 2), y2: PY1, stroke: '#16283a', 'stroke-width': 1.5 }, plotInner);
    el('line', { x1: PX0, y1: mapY(k / 2), x2: PX1, y2: mapY(k / 2), stroke: '#16283a', 'stroke-width': 1.5 }, plotInner);
  }
  txt(plot, PX1, PY1 + 26, 'feature 1 →', { size: 20, weight: 600, fill: C.dim, anchor: 'end' });
  txt(plot, PX0 - 22, (PY0 + PY1) / 2, 'feature 2 →', { size: 20, weight: 600, fill: C.dim, attrs: { transform: `rotate(-90 ${PX0 - 22} ${(PY0 + PY1) / 2})` } });
  const pData = [];
  for (let i = 0; i < 14; i++) {
    const y = i % 2 ? 1 : -1;
    pData.push({ u: (y > 0 ? 0.42 : -0.38) + (hash(i + 7) - 0.5) * 0.75, v: (y > 0 ? 0.38 : -0.36) + (hash(i + 21) - 0.5) * 0.75, y });
  }
  // run the perceptron learning rule and record every update
  let pw = [0.15, -1.0], pb = 0.35;
  const pSteps = [{ w: [...pw], b: pb, pt: -1 }];
  const errsOf = (w, b) => pData.filter(d => d.y * (w[0] * d.u + w[1] * d.v + b) <= 0).length;
  outer: for (let epoch = 0; epoch < 6; epoch++) for (let i = 0; i < pData.length; i++) {
    const d = pData[i];
    if (d.y * (pw[0] * d.u + pw[1] * d.v + pb) <= 0) {
      pw = [pw[0] + 0.5 * d.y * d.u, pw[1] + 0.5 * d.y * d.v]; pb += 0.5 * d.y;
      pSteps.push({ w: [...pw], b: pb, pt: i });
      if (pSteps.length > 9 || errsOf(pw, pb) === 0) break outer;
    }
  }
  pSteps.forEach(st => { st.err = errsOf(st.w, st.b); });
  const pDots = pData.map(d => d.y > 0
    ? el('rect', { x: mapX(d.u) - 10, y: mapY(d.v) - 10, width: 20, height: 20, rx: 4, fill: C.amber }, plotInner)
    : el('circle', { cx: mapX(d.u), cy: mapY(d.v), r: 11, fill: C.cyan }, plotInner));
  const sepLine = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: C.ink, 'stroke-width': 5, 'stroke-linecap': 'round' }, plotInner);
  const checkRing = el('circle', { r: 20, fill: 'none', stroke: C.red, 'stroke-width': 4 }, plotInner);
  const wrongRings = pData.map(() => el('circle', { r: 17, fill: 'none', stroke: C.red, 'stroke-width': 3, 'stroke-dasharray': '4 4' }, plotInner));
  const legend = g(plot);
  el('circle', { cx: PX0 + 12, cy: PY1 + 26, r: 9, fill: C.cyan }, legend); txt(legend, PX0 + 28, PY1 + 27, 'group A', { size: 19, weight: 600, fill: C.dim, anchor: 'start' });
  el('rect', { x: PX0 + 112, y: PY1 + 17, width: 18, height: 18, rx: 4, fill: C.amber }, legend); txt(legend, PX0 + 138, PY1 + 27, 'group B', { size: 19, weight: 600, fill: C.dim, anchor: 'start' });
  const pcStat = txt(plot, PX1 - 12, PY0 + 22, '', { size: 20, weight: 800, fill: C.red, anchor: 'end', mono: true });
  const halfPlane = (w, b, sign) => {
    const L = Math.hypot(w[0], w[1]) || 1, n = [w[0] / L, w[1] / L], d = -b / L, pp = [-n[1], n[0]];
    const c = [n[0] * d, n[1] * d];
    const q = (a, k) => `${mapX(c[0] + pp[0] * a + n[0] * k)} ${mapY(c[1] + pp[1] * a + n[1] * k)}`;
    return `M ${q(-5, 0)} L ${q(5, 0)} L ${q(5, 5 * sign)} L ${q(-5, 5 * sign)} Z`;
  };
  const pcCap = txt(pc, PLX, 190, 'nudges its dividing line after each mistake', { size: 24, weight: 600, fill: C.dim });

  // =========== Scene E: not a tiny brain → building blocks → one number ===========
  const E = g(root);
  const brainG = g(E);
  const brainPath = 'M -150 30 C -190 -40 -140 -130 -60 -140 C -20 -190 70 -180 100 -140 C 170 -140 200 -70 180 -10 C 210 40 170 110 110 110 C 80 150 10 150 -20 120 C -80 150 -150 120 -150 30 Z';
  el('path', { d: brainPath, fill: '#3b2a5c', stroke: '#c4b5fd', 'stroke-width': 6 }, brainG);
  ['M -100 -60 C -60 -90 -20 -40 20 -80', 'M -120 20 C -70 0 -40 60 10 20 C 50 -10 90 40 140 10', 'M 30 -120 C 40 -80 80 -70 110 -90', 'M -60 90 C -30 60 30 90 60 60'].forEach(d => el('path', { d, fill: 'none', stroke: '#c4b5fd', 'stroke-width': 5, opacity: 0.8 }, brainG));
  const neq = txt(E, 0, 0, '≠', { size: 140, weight: 800, fill: C.red });
  const unitE = neuron(E, 90, { symbol: 'Σ' });
  set(unitE.label, { 'font-size': 64 });
  const miniBrain = g(E);
  el('path', { d: brainPath, fill: '#3b2a5c', stroke: '#c4b5fd', 'stroke-width': 10, transform: 'scale(0.28)' }, miniBrain);
  const cross = g(E);
  el('line', { x1: -70, y1: -70, x2: 70, y2: 70, stroke: C.red, 'stroke-width': 12, 'stroke-linecap': 'round' }, cross);
  el('line', { x1: 70, y1: -70, x2: -70, y2: 70, stroke: C.red, 'stroke-width': 12, 'stroke-linecap': 'round' }, cross);
  const notCopyTx = txt(E, 0, 330, 'Not a tiny copy of a brain', { size: 48, weight: 800 });
  const blockTx = txt(E, 0, -400, 'Building blocks for a new kind of calculation', { size: 50, weight: 800 });
  // blocks that assemble into a network
  const blockLayout = [];
  [[-480, 4], [-160, 5], [160, 5], [480, 2]].forEach(([x, n], li) => { for (let i = 0; i < n; i++) blockLayout.push({ x, y: (i - (n - 1) / 2) * 150, li }); });
  const blockLinks = g(E);
  const bLinks = [];
  blockLayout.forEach((a, i) => blockLayout.forEach((b, j) => { if (b.li === a.li + 1) bLinks.push(el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: C.teal, 'stroke-width': 2.5, opacity: 0 }, blockLinks)); }));
  const blocks = blockLayout.map((b, i) => {
    const n = neuron(E, 42, { symbol: 'Σ' }); set(n.label, { 'font-size': 30 });
    return { ...b, n, sx: (hash(i + 3) - 0.5) * 1700, sy: (hash(i + 9) - 0.5) * 900, r: (hash(i + 5) - 0.5) * 120 };
  });
  // follow-one-number: a single wire with 0.8
  const followG = g(E);
  const followWire = el('path', { d: 'M -900 0 L -110 0', fill: 'none', stroke: C.cyan, 'stroke-width': 8, 'stroke-linecap': 'round' }, followG);
  const followChip = g(followG);
  rect(followChip, -80, -46, 160, 92, { r: 20, fill: '#0f2a3a', stroke: C.cyan, sw: 4 });
  txt(followChip, 0, 3, '0.8', { size: 56, weight: 800, fill: C.cyan, mono: true });
  const bigN = neuron(followG, 110, { symbol: '' });

  // =========== update ===========
  // captions that only repeated the narration are removed from the picture
  hush(headB, knobLabel, notCopyTx, blockTx, engineLabel, mpNames);
  return function update(t) {
    // ---- Scene A ----
    const aVis = vis(t, 0, T.myst - 0.2, 0.01, 0.7);
    show(A, aVis);
    { // always update (a) so seeking is deterministic
      const lift = p(t, T.noOne - 0.3, 0.8);
      move(chat, 960, lerp(540, 200, lift), lerp(1, 0.62, lift));
      show(chat, 1 - p(t, T.nn + 0.3, 0.6));
      const typed = pl(t, T.q, T.qEnd - T.q - 0.4);
      const sent = p(t, T.qEnd - 0.25, 0.45);
      const n = Math.round(QUESTION.length * typed);
      set(composerText, { text: sent > 0.2 ? '' : QUESTION.slice(0, n) });
      const tw = composerText.getComputedTextLength ? composerText.getComputedTextLength() : 0;
      set(caret, { x: -480 + tw + 4, opacity: sent > 0.2 ? 0 : (Math.floor(t * 2.5) % 2 ? 1 : 0.2) });
      set(sendBtn, { fill: typed >= 1 ? C.teal : '#2a4655' });
      move(bubble, lerp(0, 160, sent), lerp(180, -80, sent));
      show(bubble, sent);
      // kinds of AI
      const kx = [-570, -190, 190, 570];
      kindG.forEach((k, i) => {
        const a = p(t, T.noOne + 0.35 + i * 0.4, 0.5, easeBack);
        const isNN = i === 3;
        const focus = p(t, T.nn, 0.9);
        const fade = isNN ? 0 : p(t, T.but + 0.3, 0.7);
        const x = isNN ? lerp(kx[i], -380 / 1.2, focus) : kx[i];
        const y = isNN ? lerp(600, 600, focus) : 600;
        move(k.g, 960 + x * 1.2, y, (0.6 + 0.4 * a) * 1.2 * (isNN ? 1 + 0.2 * focus : 1));
        show(k.g, a * (1 - fade * 0.96));
      });
      // "every kind" — equal emphasis; then engine label
      show(engineLabel, vis(t, T.engines, T.myst - 0.4));
      move(engineLabel, 960 - 380, 410);
      // generative AI outputs on the right
      const gv = p(t, T.gen, 0.6);
      show(gen, gv);
      move(gen, 960 + 420, 600);
      move(genTitle, 0, -230);
      genG.forEach((gg, i) => move(gg, 0, -120 + i * 130));
      genLinks.forEach((l, i) => {
        set(l, { d: `M -600 0 C -380 0 -330 ${-120 + i * 130} -130 ${-120 + i * 130}` });
        draw(l, p(t, T.nn + 0.1 + i * 0.12, 0.6));
      });
    }

    // ---- Scene B: mysterious → math system → knobs ----
    const bVis = vis(t, T.myst - 0.4, T.idea - 0.1, 0.7, 0.6);
    show(B, bVis);
    { // always update (b) so seeking is deterministic
      move(B, 960, 560);
      const myst = vis(t, T.myst - 0.2, T.math + 0.2, 0.6, 1.0);
      set(mystBlob, { opacity: 0.09 * myst });
      qm.forEach((q, i) => {
        const a = i * 2.4 + t * (0.3 + hash(i) * 0.4);
        const r = 260 + hash(i + 4) * 260;
        set(q, { x: Math.cos(a) * r * 1.3, y: Math.sin(a) * r * 0.7 });
        show(q, myst * (0.5 + 0.5 * hash(i + 2)));
      });
      const clear = p(t, T.math, 0.8);
      edges.forEach(e => set(e.path, { stroke: mix('#a78bfa', C.teal, clear), opacity: 0.3 + 0.25 * clear }));
      nodes.forEach(n => { set(n.u.ring, { stroke: mix('#a78bfa', C.teal, clear) }); show(n.u.label, clear); });
      show(headB, vis(t, T.math, T.train - 0.3));
      show(subB, p(t, T.numIn - 0.2, 0.4) * (1 - p(t, T.train - 0.3, 0.5)));
      subEls.forEach((s, i) => show(s, i === 0 ? p(t, T.numIn, 0.4) : i <= 2 ? p(t, T.calc + (i - 1) * 0.4, 0.4) : p(t, T.numOut - (4 - i) * 0.3, 0.4)));
      // numbers go in
      const inputs = nodes.filter(n => n.li === 0), mids = nodes.filter(n => n.li === 1), out = nodes.find(n => n.li === 2);
      chips.forEach((c, i) => {
        const k = p(t, T.numIn + i * 0.15, 0.7);
        move(c.g, lerp(-800, inputs[i].x - 130, k), inputs[i].y);
        show(c.g, k);
      });
      // calculation pulses (repeat every 1.8s while transforming)
      const flow = vis(t, T.calc - 0.2, T.idea, 0.3, 0.3);
      edges.forEach((e, i) => {
        const cyc = ((t - T.calc) * 0.7 + (nodes[e.a].li ? 0.5 : 0)) % 1;
        const pt = pointOn(e.path, cyc);
        set(pulses[i], { cx: pt.x, cy: pt.y, fill: nodes[e.a].li ? C.amber : C.cyan });
        show(pulses[i], flow * Math.sin(Math.PI * cyc) * (t > T.calc ? 1 : 0));
      });
      // knob values (training changes them) — drives intermediate and output numbers
      const turn = pl(t, T.adjustable + 0.3, T.those - T.adjustable + 1.2);
      const kv = knobs.map((k, i) => lerp(0.4 + i * 0.25, -0.6 + hash(i + 40) * 2.2, easeOut(turn)) + Math.sin(turn * Math.PI * 2 + i) * 0.25 * turn * (1 - turn));
      const showMid = p(t, T.calc + 0.5, 0.5);
      const mv = mids.map((m, i) => 1 / (1 + Math.exp(-(0.8 * (0.5 + kv[i % 5]) + 0.3 * 0.7 - 0.5 * 0.4 + i * 0.1))));
      midVals.forEach((m, i) => { set(m, { text: mv[i].toFixed(2) }); show(m, showMid * (1 - p(t, T.train - 0.3, 0.4) * 0.6)); });
      const outV = 1 / (1 + Math.exp(-(mv.reduce((a, b) => a + b, 0) - 1.1 + kv[4] * 0.8)));
      const ok = p(t, T.numOut, 0.5, easeBack);
      move(outChip, out.x + 200, out.y, ok);
      show(outChip, ok);
      set(outTx, { text: (t < T.train ? 0.71 : outV).toFixed(2) });
      const kVis = p(t, T.adjustable - 0.2, 0.6, easeBack);
      knobs.forEach((k, i) => {
        const pt = pointOn(k.e.path, 0.5);
        move(k.d.g, pt.x, pt.y, kVis);
        show(k.d.g, kVis);
        k.d.setValue(t < T.adjustable ? 0.4 + i * 0.25 : kv[i]);
      });
      show(knobLabel, vis(t, T.adjustable, T.idea - 0.3));
      nodes.forEach(n => set(n.u.core, { opacity: n.li === 2 ? 0.35 * ok : 0.15 * flow }));
    }

    // ---- Scene C: biological neuron → math model ----
    const cVis = vis(t, T.idea - 0.3, T.y43 - 0.2, 0.6, 0.6);
    show(Cg, cVis);
    { // always update (c) so seeking is deterministic
      const split = p(t, T.simplified - 0.2, 0.8);
      move(bio, lerp(960, 560, split), 560, lerp(1.25, 0.95, split));
      move(bioTitle, lerp(960, 560, split), 300);
      dendrites.forEach((d, i) => draw(d, p(t, T.idea + i * 0.08, 0.8)));
      draw(axon, p(t, T.idea + 0.4, 1));
      show(bio, p(t, T.idea - 0.3, 0.6));
      show(bioTitle, p(t, T.idea, 0.6));
      bioParts.forEach((b, i) => show(b, p(t, T.bio + 0.3 + i * 0.3, 0.4)));
      move(art, 1480, 560);
      move(artTitle, 1480, 300);
      show(art, split); show(artTitle, split);
      artIns.forEach((a, i) => draw(a, p(t, T.simplified + i * 0.12, 0.6)));
      draw(artOut, p(t, T.simplified + 0.5, 0.6));
      show(artHead, p(t, T.simplified + 1.0, 0.2));
      artParts.forEach((b, i) => show(b, p(t, T.bio + 0.3 + i * 0.3, 0.4)));
      move(inspiredArrow, 1110, 470, 1);
      // arrow points from the biology to the math: "inspired by" (math ← bio)
      show(inspiredArrow, p(t, T.inspired, 0.5));
      draw(inspPath, p(t, T.inspired, 0.6));
      // mapping lines between corresponding parts
      const pairs = [[[560 - 170, 790], [1480 - 200, 740]], [[560, 690], [1480, 690]], [[560 + 330 * 0.95, 660], [1480 + 200, 650]]];
      mapLines.forEach((l, i) => {
        const [[x1, y1], [x2, y2]] = pairs[i];
        set(l, { d: `M ${x1} ${y1 + 25} Q ${(x1 + x2) / 2} ${Math.max(y1, y2) + 140 - i * 30} ${x2} ${y2 + 25}` });
        draw(l, p(t, T.bio + 0.4 + i * 0.3, 0.5));
        show(l, 0);
      });
    }

    // ---- Scene D: 1943 and 1958 ----
    const dVis = vis(t, T.y43 - 0.3, T.notCopy - 0.2, 0.6, 0.6);
    show(D, dVis);
    { // always update (d) so seeking is deterministic
      move(D, 960, 520, 1.25);
      move(tl, 0, 330);
      const fillTo = t < T.y58 ? lerp(-760, -380, p(t, T.y43, 0.8)) : lerp(-380, 380, p(t, T.y58, 0.9));
      set(tlFill, { x2: fillTo });
      show(yearMarks[0], p(t, T.y43, 0.5)); show(yearMarks[1], p(t, T.y58, 0.5));
      // 1943 card
      const mpOn = vis(t, T.y43 + 0.2, T.y58 + 0.4, 0.6, 0.6);
      const shiftL = p(t, T.y58, 0.8);
      move(mp, lerp(0, -440, shiftL), -60, lerp(1, 0.78, shiftL));
      show(mp, Math.max(mpOn, 0.45 * p(t, T.y58, 0.8)));
      show(mpNames, p(t, T.names43, 0.5));
      const pOut = 1 - p(t, T.y58 - 0.3, 0.5);
      portraits.forEach((pg, i) => {
        const k = p(t, i ? cue.at('Walter Pitts') - 0.2 : T.names43 - 0.2, 0.6, easeOut);
        move(pg, (i ? 1 : -1) * lerp(700, 560, k), -60, 1, (i ? 3 : -3) * k);
        show(pg, k * pOut);
      });
      show(mpModel, p(t, T.model43 - 0.6, 0.6));
      show(mpCap, p(t, T.model43, 0.6));
      // inputs flip on/off; fires when ≥2 on
      const step = Math.floor(Math.max(0, t - T.model43) / 0.9) % 4;
      const patterns = [[1, 0, 0], [1, 1, 0], [0, 1, 0], [1, 1, 1]];
      const pat = t < T.model43 ? [0, 0, 0] : patterns[step];
      mpIns.forEach((m, i) => { set(m.tx, { text: String(pat[i]) }); set(m.box, { fill: pat[i] ? '#14506a' : '#0f2a3a' }); });
      const fired = pat.reduce((a, b) => a + b, 0) >= 2;
      set(mpOut, { text: fired ? '1' : '0' });
      set(mpN.core, { opacity: fired ? 0.55 : 0 });
      // 1958 perceptron
      const pcOn = p(t, T.y58 + 0.2, 0.7);
      move(pc, lerp(500, 360, pcOn), -60);
      show(pc, pcOn);
      show(pcName, p(t, T.rosen, 0.5));
      show(photo, p(t, T.rosen, 0.7));
      // learning: step through the recorded perceptron updates
      const tA = T.perc + 0.4, tB = T.notCopy - 0.7, n = pSteps.length - 1;
      const pos = clamp((t - tA) / (tB - tA)) * n;
      const si = Math.min(n, Math.floor(pos)), fr = pos - si;
      const cur = pSteps[si], nxt = pSteps[Math.min(n, si + 1)];
      const mv = si >= n ? 0 : p(fr, 0.45, 0.5);
      const w = [lerp(cur.w[0], nxt.w[0], mv), lerp(cur.w[1], nxt.w[1], mv)], b = lerp(cur.b, nxt.b, mv);
      const Lw = Math.hypot(w[0], w[1]) || 1, nn = [w[0] / Lw, w[1] / Lw], d0 = -b / Lw;
      const ax = nn[0] * d0, ay = nn[1] * d0;
      set(sepLine, { x1: mapX(ax - nn[1] * 3), y1: mapY(ay + nn[0] * 3), x2: mapX(ax + nn[1] * 3), y2: mapY(ay - nn[0] * 3) });
      set(regionB, { d: halfPlane(w, b, 1) }); set(regionA, { d: halfPlane(w, b, -1) });
      const lineOn = p(t, T.perc, 0.5);
      show(sepLine, lineOn); show(regionA, lineOn); show(regionB, lineOn);
      const checking = si < n && t > tA ? nxt.pt : -1;
      if (checking >= 0) { const dd = pData[checking]; set(checkRing, { cx: mapX(dd.u), cy: mapY(dd.v) }); }
      show(checkRing, checking >= 0 ? 1 - 0.6 * mv : 0);
      wrongRings.forEach((r, i) => { const dd = pData[i]; set(r, { cx: mapX(dd.u), cy: mapY(dd.v) }); show(r, lineOn * (dd.y * (w[0] * dd.u + w[1] * dd.v + b) <= 0 ? 0.9 : 0)); });
      const errs = errsOf(w, b);
      set(pcStat, { text: errs ? `mistakes: ${errs}` : 'mistakes: 0 ✓', fill: errs ? C.red : C.green });
      show(pcStat, lineOn);
      show(pcCap, p(t, T.learn, 0.5));
    }

    // ---- Scene E ----
    const eVis = vis(t, T.notCopy - 0.3, 99, 0.6);
    show(E, eVis);
    { // always update (e) so seeking is deterministic
      move(E, 960, 540);
      const brainOn = vis(t, T.notCopy - 0.2, T.blocks - 0.1, 0.6, 0.5);
      move(brainG, -420, -20, 1.4);
      show(brainG, brainOn);
      show(neq, brainOn * p(t, T.notCopy + 0.6, 0.4));
      move(neq, 0, -20);
      const unitOn = vis(t, T.notCopy, T.blocks, 0.5, 0.4);
      move(unitE.g, 420, -20, 1.3);
      show(unitE.g, unitOn);
      // a tiny brain tries to fit inside the unit, then gets crossed out
      const mb = p(t, T.brain - 0.3, 0.5);
      move(miniBrain, 420, -20, 1); show(miniBrain, unitOn * mb);
      move(cross, 420, -20, p(t, T.brain + 0.2, 0.3, easeBack)); show(cross, unitOn * p(t, T.brain + 0.2, 0.3));
      show(notCopyTx, brainOn);
      // building blocks assemble
      const asm = p(t, T.blocks + 0.1, 1.6);
      const blkVis = vis(t, T.blocks - 0.2, T.see + 0.4, 0.5, 0.6);
      blocks.forEach((b, i) => {
        const k = clamp(asm * 1.4 - (i / blocks.length) * 0.4);
        move(b.n.g, lerp(b.sx, b.x, easeOut(k)), lerp(b.sy, b.y, easeOut(k)), 1, lerp(b.r, 0, k));
        show(b.n.g, blkVis * p(t, T.blocks - 0.1 + i * 0.03, 0.3));
      });
      bLinks.forEach((l, i) => set(l, { opacity: 0.35 * blkVis * p(t, T.newKind - 0.2 + (i % 7) * 0.05, 0.5) }));
      show(blockTx, vis(t, T.blocks, T.see + 0.2));
      // follow one number
      const fv = p(t, T.see + 0.2, 0.8);
      show(followG, fv);
      move(bigN.g, 0, 0, lerp(0.4, 1, fv));
      draw(followWire, p(t, T.follow - 0.2, 0.8));
      const ck = p(t, T.oneNum - 0.4, 1.6);
      move(followChip, lerp(-1000, -330, ck), 0);
      show(followChip, p(t, T.oneNum - 0.4, 0.3));
      set(bigN.core, { opacity: 0.15 * ck });
    }
  };
}
