// Chapter 3 — From one neuron to layers.
import { el, set, show, move, g, txt, rect, card, neuron, dial, draw, pointOn, arrowHead,
  p, pl, vis, lerp, clamp, easeOut, easeBack, mix, grey, fmt, hash, C, hush } from './engine.js';

const sig = x => 1 / (1 + Math.exp(-x));

export function createChapter3(root, cue) {
  const a = (s, after) => cue.at(s, after);
  const T = {
    replace: a('Replace the single'), patch: a('tiny image patch'), several: a('several pixels'),
    each: a('Each pixel has its own'), rgb: a('red, green, and blue values'),
    even: a('Even a very small'), many: a('many more numbers'), one: a('than one color'),
    layer: a('A layer is a group'), stage: a('at the same stage'),
    eachN: a('Each neuron receives'), applies: a('applies its own weights'), bias: a('and bias, and produces'), output: a('produces an output'),
    diff: a('The neurons in a layer can respond'), because: a('because their adjustable'),
    coll: a('The collection of outputs'), next: a('the input to the next'),
    first: a('The first layer receives'), middle: a('A middle layer receives'), later: a('A later layer combines'), forward: a('passes another result forward'),
    hidden: a('That middle stage is called'), hiddenW: a('a hidden layer'), secret: a('a secret thought'), between: a('it is between'), finalOut: a('its final output'),
    toy: a('For a toy example'), stripe: a('as stripe or plain'), plain: a('or plain'),
    inter: a('Intermediate units can respond'), arrangements: a('simple arrangements'), laterUnit: a('a later unit can combine'),
    labels: a('Those labels help'), real: a('Real networks do not'), jobTitles: a('guaranteed job titles'),
    piece: a('There is one more important'), act: a('the activation function'),
    ifEvery: a('If every layer only'), stacking: a('stacking layers would'), oneLarger: a('one larger, simple calculation'),
    changes: a('An activation function changes'), combine: a('It lets the network combine'), varied: a('more varied patterns'),
    visually: a('Visually, imagine trying'), straight: a('one straight line'),
    simple: a('One line can handle'), bends: a('But when the pattern bends'), parts: a('has several parts'), multi: a('combine multiple stages'), flexible: a('more flexible boundary'),
    notSmarter: a('A layer is not automatically'), wayTo: a('It is a way to combine'), more: a('More layers give'), transform: a('transform its representation'), still: a('still need to be trained'),
  };

  // ---------- pixel patch ----------
  const PC = 92;
  const patchG = g(root);
  const lightPatch = [0.82, 0.78, 0.85, 0.75, 0.8, 0.83, 0.79, 0.86, 0.77];
  const stripePatch = [0.15, 0.9, 0.15, 0.15, 0.9, 0.15, 0.15, 0.9, 0.15];
  const plainPatch = Array(9).fill(0.55);
  const cells = Array.from({ length: 9 }, (_, i) => {
    const gg = g(patchG);
    const r = rect(gg, -PC / 2 + 3, -PC / 2 + 3, PC - 6, PC - 6, { r: 8, fill: grey(0.8), stroke: '#ffffff30', sw: 2 });
    const mini = g(gg);
    const mb = [C.R, C.G, C.B].map((c, k) => rect(mini, -30 + k * 21, -10, 16, 34, { r: 3, fill: c, stroke: 'none' }));
    return { g: gg, r, mini, mb, cx: (i % 3 - 1) * PC, cy: (Math.floor(i / 3) - 1) * PC };
  });
  const countTx = txt(root, 0, 0, '', { size: 44, weight: 800 });
  const countSub = txt(root, 0, 0, '1 colour = 3 numbers', { size: 32, weight: 600, fill: C.dim });

  // ---------- 27 input chips ----------
  const IX = 520;
  const inChips = Array.from({ length: 27 }, (_, i) => {
    const col = [C.R, C.G, C.B][i % 3];
    const r = rect(root, -22, -11, 44, 22, { r: 6, fill: col, stroke: 'none' });
    return { r, y: 150 + i * 29.5 };
  });

  // ---------- network ----------
  const L = [
    { x: 860, ys: [300, 460, 620, 780] },
    { x: 1240, ys: [380, 540, 700] },
    { x: 1600, ys: [540] },
  ];
  const linkG = g(root);
  const inLinks = [];
  inChips.forEach((c, i) => L[0].ys.forEach((y, j) => inLinks.push({ el: el('line', { x1: IX + 24, y1: c.y, x2: L[0].x - 56, y2: y, stroke: C.cyan, 'stroke-width': 1.5, opacity: 0 }, linkG), j, i })));
  const links = [];
  for (let li = 0; li < 2; li++) L[li].ys.forEach((y1, i) => L[li + 1].ys.forEach((y2, j) => {
    const path = el('path', { d: `M ${L[li].x + 56} ${y1} C ${L[li].x + 180} ${y1} ${L[li + 1].x - 180} ${y2} ${L[li + 1].x - 56} ${y2}`, fill: 'none', stroke: C.teal, 'stroke-width': 4, opacity: 0.5 }, linkG);
    links.push({ path, li, i, j });
  }));
  const pulses = links.map(() => el('circle', { r: 9, fill: C.amber, filter: 'url(#glow)' }, root));
  const units = L.map((l, li) => l.ys.map((y, i) => {
    const n = neuron(root, li === 2 ? 64 : 54, { symbol: 'Σ' });
    set(n.label, { 'font-size': 40 });
    move(n.g, l.x, y);
    const act = el('path', { d: 'M -22 30 C -6 30 6 6 22 6', fill: 'none', stroke: C.amber, 'stroke-width': 5, 'stroke-linecap': 'round' }, n.g);
    const val = txt(root, l.x, y + (li === 2 ? 98 : 84), '', { size: 28, weight: 800, fill: C.teal, mono: true });
    return { n, act, val, x: l.x, y };
  }));
  const layerBoxes = L.map((l, li) => {
    const top = Math.min(...l.ys) - 95, bot = Math.max(...l.ys) + 95;
    const gg = g(root);
    rect(gg, l.x - 95, top, 190, bot - top, { r: 30, fill: '#5eead408', stroke: C.teal, sw: 3, attrs: { 'stroke-dasharray': '10 8' } });
    const lab = txt(gg, l.x, top - 34, ['layer 1', 'layer 2', 'layer 3'][li], { size: 32, weight: 800, fill: C.teal });
    return { g: gg, lab };
  });
  const layerTitle = txt(root, 860, 110, 'A layer = neurons working at the same stage', { size: 44, weight: 800 });
  // focus-neuron internals: own dials + bias
  const focusKit = g(root);
  const fDials = [0, 1, 2].map(i => { const d = dial(focusKit, 22); move(d.g, -130 + i * 62, -110); return d; });
  const fBias = g(focusKit);
  rect(fBias, -70, -26, 140, 52, { r: 16, fill: '#22123a', stroke: C.violet, sw: 3 });
  txt(fBias, 0, 2, 'bias', { size: 28, weight: 800, fill: C.violet });
  move(fBias, 0, 130);
  const focusRing = el('circle', { r: 80, fill: 'none', stroke: C.amber, 'stroke-width': 5 }, root);
  // differing dials for all L1 units
  const unitDials = L[0].ys.map((y, i) => [0, 1].map(k => { const d = dial(root, 16); move(d.g, L[0].x - 110 + k * 40, y - 54); return d; }));
  // hidden-layer annotations
  const hidG = g(root);
  const hidTx = txt(hidG, L[1].x, 175, 'HIDDEN LAYER', { size: 44, weight: 800, fill: C.violet });
  const secret = g(root);
  [[0, 0, 150, 70], [-110, 92, 20, 20]].forEach(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx, ry, fill: '#1b2a38', stroke: '#5f7d93', 'stroke-width': 3 }, secret));
  txt(secret, 0, 2, 'secret thoughts?', { size: 30, weight: 700, fill: C.ink, attrs: { 'font-style': 'italic' } });
  const sCross = g(secret);
  el('line', { x1: -150, y1: -60, x2: 150, y2: 60, stroke: C.red, 'stroke-width': 10, 'stroke-linecap': 'round' }, sCross);
  el('line', { x1: 150, y1: -60, x2: -150, y2: 60, stroke: C.red, 'stroke-width': 10, 'stroke-linecap': 'round' }, sCross);
  const betweenG = g(root);
  const bIn = txt(betweenG, 300, 1000, 'INPUT', { size: 34, weight: 800, fill: C.cyan });
  const bOut = txt(betweenG, 1600, 1000, 'OUTPUT', { size: 34, weight: 800, fill: C.amber });
  const bMid = txt(betweenG, 1050, 1000, '← between →', { size: 34, weight: 800, fill: C.violet });
  // output result labels
  const resG = g(root);
  const resBox = rect(resG, -130, -46, 260, 92, { r: 22, fill: '#0c2a26', stroke: C.teal, sw: 4 });
  const resTx = txt(resG, 0, 3, 'RESULT', { size: 38, weight: 800, fill: C.teal });
  move(resG, 1790, 540);
  const toyTag = g(root);
  rect(toyTag, -210, -30, 420, 60, { r: 30, fill: '#2a210b', stroke: C.amber, sw: 3 });
  txt(toyTag, 0, 3, 'toy example: STRIPE or PLAIN?', { size: 26, weight: 800, fill: C.amber });
  move(toyTag, 250, 300);
  // job-title tags on middle units
  const jobs = ['dark column?', 'light column?', 'contrast?'].map((s, i) => {
    const gg = g(root);
    rect(gg, -110, -26, 220, 52, { r: 26, fill: '#13283a', stroke: C.cyan, sw: 3 });
    const tx = txt(gg, 0, 2, s, { size: 26, weight: 700, fill: C.cyan });
    return { g: gg, tx };
  });
  // what a real unit "responds to": a messy mix across several patterns
  const PAT = [[0, 1, 0, 0, 1, 0, 0, 1, 0], [1, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 0, 0, 1, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0, 0]];
  const profiles = [0, 1, 2].map(u => {
    const gg = g(root);
    rect(gg, -10, -46, 300, 92, { r: 14, fill: '#0e1b27', stroke: '#2e4a60', sw: 2 });
    const bars = PAT.map((pt, k) => {
      const cx = 30 + k * 68;
      pt.forEach((on, q) => rect(gg, cx - 21 + (q % 3) * 14, -40 + Math.floor(q / 3) * 14, 13, 13, { r: 2, fill: on ? '#e5e7eb' : '#334155', stroke: 'none' }));
      const bar = rect(gg, cx - 21, 8, 0, 12, { r: 4, fill: C.amber, stroke: 'none' });
      return { bar, v: 0.15 + hash(u * 7 + k * 3 + 1) * 0.85 };
    });
    return { g: gg, bars };
  });
  const bigNet = g(root);
  for (let c = 0; c < 9; c++) for (let r = 0; r < 14; r++) el('circle', { cx: 120 + c * 210 + (r % 2) * 40, cy: 120 + r * 62, r: 9, fill: 'none', stroke: C.teal, 'stroke-width': 2, opacity: 0.35 }, bigNet);
  root.insertBefore(bigNet, root.firstChild);
  const bigTx = txt(root, 960, 1010, 'real networks: thousands to billions of units — roles are mixed and overlapping', { size: 30, weight: 700, fill: C.dim });
  const ourLabels = txt(root, 1240, 960, 'labels we added to explain the demo', { size: 32, weight: 700, fill: C.cyan });

  // ---------- activation: linear stacking vs bending ----------
  const actG = g(root);
  const actTitle = txt(actG, 960, 130, '', { size: 46, weight: 800 });
  const plots = [0, 1, 2, 3].map(i => {
    const gg = g(actG);
    rect(gg, -150, -130, 300, 260, { r: 20, fill: '#0b1824', stroke: '#24405a' });
    el('line', { x1: -120, y1: 100, x2: 120, y2: 100, stroke: C.faint, 'stroke-width': 3 }, gg);
    el('line', { x1: -120, y1: 100, x2: -120, y2: -110, stroke: C.faint, 'stroke-width': 3 }, gg);
    const ln = el('path', { d: '', fill: 'none', stroke: i === 3 ? C.amber : C.teal, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gg);
    const lab = txt(gg, 0, 165, i === 3 ? 'all stacked' : `layer ${i + 1}`, { size: 30, weight: 700, fill: i === 3 ? C.amber : C.dim });
    return { g: gg, ln, lab };
  });
  const ops = ['→', '→', '='].map(s => txt(actG, 0, 0, s, { size: 60, weight: 800, fill: C.dim }));
  const actNote = txt(actG, 960, 900, '', { size: 40, weight: 800, fill: C.ink });

  // ---------- boundary plot ----------
  const bpG = g(root);
  const BPX = 960, BPY = 560, BPW = 760, BPH = 640;
  rect(bpG, BPX - BPW / 2, BPY - BPH / 2, BPW, BPH, { r: 26, fill: '#0b1824', stroke: '#24405a' });
  const bpTitle = txt(bpG, 960, 170, '', { size: 46, weight: 800 });
  const pts = Array.from({ length: 28 }, (_, i) => {
    const cls = i % 2;
    const isTeal = cls === 0;
    const s1 = [lerp(-250, -60, hash(i)) * (isTeal ? 1 : -1), lerp(-220, 220, hash(i + 50))];
    const ang = hash(i + 80) * Math.PI * 2;
    const s2 = isTeal ? [Math.cos(ang) * lerp(200, 270, hash(i + 3)), Math.sin(ang) * lerp(190, 250, hash(i + 4))] : [Math.cos(ang) * lerp(10, 110, hash(i + 5)), Math.sin(ang) * lerp(10, 100, hash(i + 6))];
    const node = isTeal ? el('circle', { r: 15, fill: C.teal }, bpG) : el('rect', { x: -14, y: -14, width: 28, height: 28, rx: 5, fill: C.amber }, bpG);
    return { node, s1, s2, isTeal };
  });
  const sLine = el('line', { x1: 0, y1: -280, x2: 0, y2: 280, stroke: C.ink, 'stroke-width': 7, 'stroke-linecap': 'round' }, bpG);
  const flex = el('path', { d: 'M 150 0 C 150 -110 90 -150 0 -150 C -100 -150 -160 -90 -150 0 C -150 100 -90 160 0 150 C 100 150 150 100 150 0 Z', fill: '#fbbf2410', stroke: C.ink, 'stroke-width': 7 }, bpG);
  set(flex, { transform: `translate(${BPX} ${BPY})` });
  const okMark = txt(bpG, BPX + BPW / 2 - 60, BPY - BPH / 2 + 60, '✓', { size: 70, weight: 800, fill: C.green });
  const noMark = txt(bpG, BPX + BPW / 2 - 60, BPY - BPH / 2 + 60, '✗', { size: 70, weight: 800, fill: C.red });

  // ---------- smarter? / more stages / still need training ----------
  const endG = g(root);
  const endTitle = txt(endG, 960, 120, '', { size: 46, weight: 800 });
  const extraCols = [900, 1500].map(x => [380, 540, 700].map(y => { const n = neuron(endG, 48, { symbol: 'Σ' }); set(n.label, { 'font-size': 34 }); move(n.g, x, y); return n; }));
  const reprPatches = [0, 1, 2, 3].map(i => { const gg = g(endG); for (let k = 0; k < 9; k++) rect(gg, (k % 3) * 34 - 51, Math.floor(k / 3) * 34 - 51, 30, 30, { r: 4, fill: C.teal, stroke: 'none' }); return gg; });
  const guessTx = txt(root, 1790, 620, 'just guessing', { size: 28, weight: 800, fill: C.red });
  const needTrain = g(root);
  rect(needTrain, -330, -50, 660, 100, { r: 50, fill: '#2a210b', stroke: C.amber, sw: 4 });
  txt(needTrain, 0, 4, 'still need to be trained', { size: 44, weight: 800, fill: C.amber });
  move(needTrain, 960, 120);
  const ECOL = [[600, [300, 460, 620, 780]], [900, [380, 540, 700]], [1200, [380, 540, 700]], [1500, [380, 540, 700]], [1800, [540]]];
  const endLinks = [];
  const endLinkG = g(endG); endG.insertBefore(endLinkG, endG.firstChild);
  for (let c = 0; c < 4; c++) ECOL[c][1].forEach(y1 => ECOL[c + 1][1].forEach(y2 => endLinks.push(el('line', { x1: ECOL[c][0] + 50, y1, x2: ECOL[c + 1][0] - 50, y2, stroke: C.teal, 'stroke-width': 3, opacity: 0 }, endLinkG))));
  const endDials = ECOL.flatMap(([x, ys]) => ys.map(y => { const d = dial(root, 18); move(d.g, x + 46, y - 46); return d; }));
  const trainDials = links.filter((_, i) => i % 2 === 0).map(l => ({ d: dial(root, 20), l }));

  // captions that only repeated the narration are removed from the picture
  hush(layerTitle, ourLabels, bigTx, toyTag, actTitle, actNote, bpTitle, endTitle, needTrain);
  return function update(t) {
    // ----- patch: swatch → 3×3 patch → RGB per pixel → 27 numbers -----
    const toNet = p(t, T.layer - 0.6, 1.0);
    const patchScale = lerp(1.25, 0.85, toNet);
    const patchX = lerp(lerp(560, 760, p(t, T.even, 0.8)), 250, toNet);
    move(patchG, patchX, 540, patchScale);
    const split = p(t, T.several - 0.4, 0.8);
    const toy = p(t, T.stripe - 0.6, 0.8), toPlain = vis(t, T.plain - 0.1, T.inter - 0.1, 0.6, 0.6);
    const endBack = p(t, T.notSmarter - 0.4, 0.6);
    cells.forEach((c, i) => {
      move(c.g, c.cx * lerp(0.0, 1, split) + (split < 1 ? 0 : 0), c.cy * lerp(0.0, 1, split), lerp(3, 1, split));
      let v = lerp(0.8, lightPatch[i], split);
      v = lerp(v, stripePatch[i], toy * (1 - endBack));
      v = lerp(v, plainPatch[i], toPlain);
      set(c.r, { fill: grey(v) });
      show(c.mini, vis(t, T.rgb - 0.2 + i * 0.05, T.layer - 0.3, 0.4, 0.4));
    });
    show(patchG, vis(t, 0, T.ifEvery - 0.4, 0.01, 0.6) + p(t, T.notSmarter - 0.4, 0.6) * 0);
    const cnt = vis(t, T.even, T.layer - 0.2);
    set(countTx, { x: 1300, y: 470, text: t < T.many ? '9 pixels' : '9 pixels × 3 = 27 numbers' });
    set(countSub, { x: 1300, y: 545 });
    show(countTx, cnt); show(countSub, cnt * p(t, T.one, 0.5));
    // input chips
    inChips.forEach((c, i) => {
      const k = p(t, T.many + i * 0.04, 0.6);
      const cell = cells[Math.floor(i / 3)];
      const sx = patchX + cell.cx * patchScale, sy = 540 + cell.cy * patchScale;
      move(c.r, lerp(sx, IX, k), lerp(sy, c.y, k));
      show(c.r, k * vis(t, T.many, T.ifEvery - 0.4) * (k > 0.02 ? 1 : 0));
    });

    // ----- network -----
    const netVis = vis(t, T.layer - 0.4, T.ifEvery - 0.4, 0.6, 0.6) + vis(t, T.notSmarter - 0.3, 999, 0.6) * 1;
    const showLayer = li => netVis * (li === 0 ? p(t, T.layer, 0.6) : li === 1 ? p(t, T.coll + 0.3, 0.6) : p(t, T.later - 0.2, 0.6));
    units.forEach((col, li) => col.forEach((u, i) => {
      show(u.n.g, showLayer(li));
      const ak = p(t, T.act - 0.2 + (li * 3 + i) * 0.08, 0.4);
      show(u.act, ak);
      set(u.n.label, { transform: `translate(0 ${-12 * ak}) scale(${1 - 0.3 * ak})` });
    }));
    layerBoxes.forEach((b, li) => show(b.g, showLayer(li) * vis(t, T.layer + (li ? 99 : 0), T.coll, 0.5, 0.5) + showLayer(li) * vis(t, [T.first, T.middle, T.later][li], [T.middle, T.later, T.hidden][li], 0.3, 0.3)));
    show(layerTitle, vis(t, T.layer, T.eachN));
    // input links
    const focusOn = vis(t, T.eachN, T.diff + 0.4, 0.4, 0.4);
    inLinks.forEach(l => set(l.el, { opacity: netVis * (l.j === 0 ? 0.08 + 0.5 * focusOn : 0.08) * p(t, T.layer, 0.6) * (t < T.ifEvery ? 1 : 0) }));
    // focus neuron kit
    const fu = units[0][0];
    move(focusKit, fu.x, fu.y);
    show(focusKit, focusOn * p(t, T.applies, 0.4));
    fDials.forEach((d, k) => { show(d.g, p(t, T.applies + 0.6 + k * 0.15, 0.3)); d.setValue([0.7, -0.4, 1.2][k], -2, 2); });
    show(fBias, p(t, T.bias, 0.4));
    set(focusRing, { cx: fu.x, cy: fu.y }); show(focusRing, focusOn);
    // unit values (each differs)
    const l1v = [0.92, 0.13, 0.55, 0.71], l2v = [0.81, 0.24, 0.66], l3v = [0.88];
    const allV = [l1v, l2v, l3v];
    units.forEach((col, li) => col.forEach((u, i) => {
      const at = li === 0 ? (i === 0 ? T.output : T.diff + 0.3 + i * 0.3) : li === 1 ? T.middle + 0.6 + i * 0.2 : T.forward;
      let v = allV[li][i];
      // during toy task: stripe/plain values
      if (t > T.toy) {
        const stripeV = [[0.95, 0.9, 0.2, 0.85], [0.92, 0.88, 0.15], [0.93]][li][i];
        const plainV = [[0.1, 0.2, 0.7, 0.15], [0.12, 0.2, 0.8], [0.08]][li][i];
        v = toPlain > 0.5 ? plainV : stripeV;
      }
      const shown = p(t, at, 0.4) * vis(t, 0, T.real + 1.5);
      set(u.val, { text: v.toFixed(2) });
      show(u.val, shown * netVis);
      set(u.n.core, { opacity: 0.55 * v * shown });
    }));
    unitDials.forEach((ds, i) => ds.forEach((d, k) => { show(d.g, netVis * vis(t, T.diff, T.coll + 0.4)); d.setValue(hash(i * 3 + k) * 4 - 2, -2, 2); }));
    // pulses: forward flow
    const flowOn = Math.max(vis(t, T.coll, T.hidden, 0.3, 0.3), vis(t, T.toy + 1, T.labels, 0.3, 0.3), vis(t, T.wayTo, T.more, 0.3, 0.3));
    links.forEach((l, i) => {
      const startL = l.li === 0 ? 0 : 0.5;
      const cyc = ((t * 0.8) + startL) % 1;
      const pt = pointOn(l.path, clamp(cyc * 2 - (l.li === 0 ? 0 : 1)));
      set(pulses[i], { cx: pt.x, cy: pt.y });
      const along = l.li === 0 ? (cyc < 0.5) : (cyc >= 0.5);
      show(pulses[i], flowOn * netVis * (along ? 1 : 0));
      let op = 0.5;
      if (t > T.first && t < T.hidden) {
        const stageHL = t < T.middle ? -1 : t < T.later ? 0 : 1;
        op = l.li === stageHL ? 0.9 : 0.25;
      }
      set(l.path, { opacity: op * (t < T.coll ? p(t, T.coll, 0.6) : 1) });
    });
    // hidden layer
    const hidOn = vis(t, T.hiddenW - 0.2, T.toy - 0.2);
    show(hidG, hidOn);
    move(secret, L[1].x + 10, 880, 1); show(secret, vis(t, T.secret - 0.6, T.between + 0.2));
    move(sCross, 0, 0, p(t, T.secret + 0.6, 0.3, easeBack)); show(sCross, p(t, T.secret + 0.6, 0.3));
    show(betweenG, vis(t, T.between - 0.2, T.toy - 0.2));
    show(bMid, p(t, T.between, 0.4)); show(bIn, p(t, T.between + 0.4, 0.4)); show(bOut, p(t, T.finalOut, 0.4));
    // result + toy labels
    show(resG, netVis * p(t, T.forward, 0.5) * (t < T.ifEvery ? 1 : 0));
    let res = 'RESULT';
    if (t > T.stripe - 0.2) res = toPlain > 0.5 ? 'PLAIN' : 'STRIPE';
    set(resTx, { text: res });
    show(toyTag, vis(t, T.toy, T.piece));
    jobs.forEach((j, i) => {
      const u = units[1][i];
      move(j.g, u.x + 190, u.y - 0, 1);
      const on = vis(t, T.arrangements + i * 0.3, T.piece, 0.4, 0.5);
      // at "Real networks…" the neat labels peel off and fall away
      const peel = p(t, T.real + 0.2 + i * 0.25, 1.1, x => x * x);
      move(j.g, u.x + 190 + peel * 40, u.y + peel * 420, 1, peel * (i % 2 ? 35 : -30));
      show(j.g, on * (1 - peel));
      set(j.tx, { text: ['dark column?', 'light column?', 'contrast?'][i] });
      const pr = profiles[i];
      move(pr.g, u.x + 90, u.y, 1);
      const prOn = vis(t, T.jobTitles - 0.4 + i * 0.2, T.piece + 0.2, 0.4, 0.4);
      show(pr.g, prOn);
      pr.bars.forEach((b2, k) => set(b2.bar, { width: 42 * b2.v * p(t, T.jobTitles - 0.2 + i * 0.2 + k * 0.1, 0.5) }));
    });
    const hideOut = vis(t, T.jobTitles - 0.4, T.piece + 0.2, 0.4, 0.4);
    if (hideOut > 0) { show(units[2][0].n.g, showLayer(2) * (1 - hideOut)); show(units[2][0].val, 0); show(resG, netVis * (1 - hideOut)); }
    show(ourLabels, vis(t, T.labels, T.real + 0.4));
    show(bigNet, 0.8 * vis(t, T.real + 0.3, T.piece + 0.2, 0.8, 0.5));
    show(bigTx, vis(t, T.jobTitles - 0.4, T.piece + 0.2, 0.5, 0.4));
    

    // ----- activation function: why bending matters -----
    const actOn = vis(t, T.ifEvery - 0.3, T.visually - 0.2, 0.6, 0.6);
    show(actG, actOn);
    set(actTitle, { text: t < T.changes ? 'Only multiply & add…' : 'Add an activation (a bend) after each step' });
    const bend = p(t, T.changes, 1.0);
    const fns = [
      x => 0.6 * x + 0.1, x => -0.8 * x + 0.5, x => 1.2 * x - 0.2,
    ];
    const relu = (x, k) => (x < 0 ? lerp(x, 0.15 * x, k) : x);
    plots.forEach((pl_, i) => {
      move(pl_.g, 300 + i * 440, 520);
      show(pl_.g, i < 3 ? p(t, T.ifEvery + i * 0.4, 0.5) : p(t, T.stacking + 0.3, 0.5));
      let d = '';
      for (let s = 0; s <= 40; s++) {
        const x = -1 + s / 20;
        let y;
        if (i < 3) y = relu(fns[i](x), bend * 0.95) * (i < 3 ? 1 : 1);
        else { // composition
          let v = x;
          for (let k = 0; k < 3; k++) v = relu(fns[k](v), bend * 0.95);
          // add a second bent path to show richer patterns
          const v2 = relu(fns[1](relu(fns[0](-x * 1.3 + 0.2), bend)), bend);
          y = v + v2 * p(t, T.combine, 1) * 0.9;
        }
        d += `${s ? 'L' : 'M'} ${x * 110} ${-y * 80 + 0} `;
      }
      set(pl_.ln, { d });
    });
    ops.forEach((o, i) => { set(o, { x: 520 + i * 440, y: 520 }); show(o, p(t, T.stacking + i * 0.2, 0.4)); });
    set(actNote, { text: t < T.changes ? 'Straight lines stacked = still one straight line' : t < T.combine ? 'Bends add up to new shapes' : 'Simple signals → more varied patterns' });
    show(actNote, p(t, T.oneLarger - 0.3, 0.5));

    // ----- boundary plot -----
    const bpOn = vis(t, T.visually - 0.3, T.notSmarter - 0.3, 0.6, 0.6);
    show(bpG, bpOn);
    set(bpTitle, { text: t < T.bends ? 'Separate two groups with one straight line' : 'When the pattern bends…' });
    const ring = p(t, T.bends + 0.2, 1.4);
    pts.forEach((q, i) => {
      const x = BPX + lerp(q.s1[0], q.s2[0], ring), y = BPY + lerp(q.s1[1], q.s2[1], ring);
      if (q.isTeal) set(q.node, { cx: x, cy: y }); else set(q.node, { transform: `translate(${x} ${y})` });
      show(q.node, p(t, T.visually + (i % 10) * 0.08, 0.4));
    });
    const lineIn = p(t, T.straight - 0.2, 0.8);
    const tryAng = t > T.parts ? Math.sin(pl(t, T.parts, 3) * Math.PI * 3) * 35 : 0;
    set(sLine, { transform: `translate(${BPX} ${BPY}) rotate(${tryAng}) scale(1 ${lineIn})` });
    show(sLine, lineIn * (1 - p(t, T.multi, 0.6)));
    draw(flex, p(t, T.multi + 0.3, 1.6));
    show(okMark, vis(t, T.simple + 0.6, T.bends + 0.2, 0.3, 0.3) + p(t, T.flexible, 0.4));
    show(noMark, vis(t, T.parts, T.multi + 0.3, 0.3, 0.3));

    // ----- end: not smarter / more stages / still need training -----
    const eOn = p(t, T.notSmarter - 0.3, 0.6);
    show(endG, eOn);
    set(endTitle, { text: t < T.wayTo ? 'A layer is not automatically “smarter”' : t < T.more ? 'Just a way to combine several calculations' : 'More layers = more stages to transform the data' });
    extraCols.forEach((col, ci) => col.forEach((n, i) => { const k = p(t, T.more + 0.3 + ci * 0.5 + i * 0.1, 0.5, easeBack); move(n.g, [900, 1500][ci], [380, 540, 700][i], k); show(n.g, k); }));
    // representation patches morph across stages
    reprPatches.forEach((rp, i) => {
      const x = [600, 900, 1500, 1800][i];
      move(rp, x, 940, 1);
      show(rp, vis(t, T.transform - 0.2 + i * 0.25, 999, 0.4));
      [...rp.children].forEach((c, k) => set(c, { fill: mix(grey(stripePatch[k] * 0.5 + 0.3), [C.teal, C.violet, C.amber, C.cyan][i], i / 3 + hash(k + i * 9) * 0.3), opacity: 0.4 + 0.6 * hash(k * 3 + i) }));
    });
    if (eOn > 0) {
      // shift existing network to make room for extra layers
      const sh = p(t, T.more, 0.8);
      units.forEach((col, li) => col.forEach(u => { const nx = [860, 1240, 1600][li]; move(u.n.g, lerp(nx, [600, 1200, 1800][li], sh), u.y); }));
      set(linkG, { opacity: 1 - sh });
      // untrained: more units do not mean a better answer — the output just guesses
      const guessOn = vis(t, T.notSmarter + 0.4, T.more, 0.3, 0.4);
      move(resG, 1790, 540); show(resG, guessOn);
      set(resTx, { text: Math.floor(t * 2.5) % 2 ? 'STRIPE?' : 'PLAIN?' });
      show(guessTx, guessOn);
    } else { units.forEach((col, li) => col.forEach(u => move(u.n.g, u.x, u.y))); set(linkG, { opacity: netVis }); show(guessTx, 0); }
    show(needTrain, p(t, T.still - 0.2, 0.5, easeBack));
    show(endTitle, eOn * (1 - p(t, T.still - 0.3, 0.3)));
    endLinks.forEach(l => set(l, { opacity: 0.35 * p(t, T.more + 0.8, 0.8) }));
    endDials.forEach((d, i) => { show(d.g, p(t, T.still + i * 0.03, 0.3)); d.setValue(Math.sin(t * 1.7 + i * 2.1) * 1.8, -2, 2); });
    trainDials.forEach(({ d, l }, i) => {
      const pt = pointOn(l.path, 0.5);
      move(d.g, pt.x, pt.y, p(t, T.still + i * 0.05, 0.4, easeBack));
      show(d.g, p(t, T.still + i * 0.05, 0.3) * (1 - p(t, T.more, 0.8)) * 0);
      d.setValue(hash(i + 70) * 4 - 2 + Math.sin(t * 2 + i) * 0.3, -2, 2);
    });
  };
}
