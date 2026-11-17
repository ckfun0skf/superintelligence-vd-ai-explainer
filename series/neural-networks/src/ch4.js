// Chapter 4 — How does a network learn from examples?
import { el, set, show, move, g, txt, rect, neuron, dial, draw, pointOn, person,
  p, pl, vis, lerp, clamp, easeOut, easeBack, mix, grey, hash, C } from './engine.js';

const COLORS = [
  ['#d4d4d4', 'LIGHT'], ['#1e3a8a', 'DARK'], ['#fafaf9', 'LIGHT'], ['#111111', 'DARK'],
  ['#fde68a', 'LIGHT'], ['#14532d', 'DARK'], ['#fbcfe8', 'LIGHT'], ['#4b5563', 'DARK'],
];
const lum = hex => { const v = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.3 * v[0] + 0.59 * v[1] + 0.11 * v[2]; };

function pill(parent, label, o = {}) {
  const gg = g(parent);
  const isL = label === 'LIGHT';
  const w = o.w || 170;
  const r = rect(gg, -w / 2, -32, w, 64, { r: 32, fill: o.fill || (isL ? '#ece7dc' : '#1f262e'), stroke: o.stroke || (isL ? '#ffffff' : '#5b6b78'), sw: 3 });
  const tx = txt(gg, 0, 3, label, { size: o.size || 32, weight: 800, fill: o.color || (isL ? '#111' : C.ink) });
  return { g: gg, r, tx };
}

/** Example card: swatch (input) → label (answer). */
function exampleCard(parent, color, label) {
  const gg = g(parent);
  rect(gg, -210, -60, 420, 120, { r: 22, fill: '#0f1d2a', stroke: '#2e4a60' });
  const sw = rect(gg, -190, -44, 88, 88, { r: 12, fill: color, stroke: '#ffffff40', sw: 2 });
  el('path', { d: 'M -80 0 L 0 0', stroke: C.dim, 'stroke-width': 4 }, gg);
  el('path', { d: 'M -12 -10 L 2 0 L -12 10', fill: 'none', stroke: C.dim, 'stroke-width': 4 }, gg);
  const lp = pill(gg, label);
  move(lp.g, 100, 0);
  return { g: gg, sw, lp };
}

export function createChapter4(root, cue) {
  const a = (s, after) => cue.at(s, after);
  const T = {
    soFar: a('So far, we have chosen'), byHand: a('by hand'), real: a('A real network usually'), many: a('many adjustable values'),
    training: a('Training is the process'), finding: a('finding settings'), answers: a('the answers we want'),
    forOur: a('For our light-and-dark'), prepare: a('people first prepare'),
    twoParts: a('Each example has two parts'), asInput: a('as the input'), asAnswer: a('as the answer'),
    row1: a('One row might contain'), pale: a('a pale grey swatch'), lab1: a('the label light'),
    row2: a('Another might contain'), lab2: a('the label dark'),
    collection: a('The collection of these'), labelled: a('labelled training set'),
    rule: a('The labels must follow'), consistent: a('consistent rule'), agree: a('agree on what counts'),
    noKnow: a('The network does not know'), onlyRecv: a('It only receives'),
    beginning: a('At the beginning'), random: a('random or simply unhelpful'),
    take: a('We take one labelled'), onlyColor: a('pass only its color values'),
    predict: a('The network makes a prediction'), perhaps: a('Perhaps the correct answer'), p20: a('twenty percent probability'), d80: a('and dark eighty percent'),
    reveal: a('Now we reveal the answer'), light: a('light.', 90),
    compares: a('The training system compares'), because: a('Because the model gave'), lossLarge: a('the loss is large'),
    lossMeasures: a('Loss measures the mismatch'), notGeneral: a('it is not a general score'), truth: a('for truth'), useful: a('usefulness,'), intel: a('or intelligence'),
    supplied: a('The supplied answer is what'), supervised: a('supervised training'),
    notDisc: a('The network is not discovering'), shown: a('It is being shown examples'), adjusted: a('adjusted to match them'),
    quality: a('The quality and coverage'), inconsistent: a('If the labels are inconsistent'), leaveOut: a('leave out important cases'), biased: a('incomplete or biased rule'),
    decide: a('Now the system needs'), which: a('Which weights affected'), direction: a('in which direction'),
    backprop: a('Backpropagation calculates'), sensitive: a('how sensitive the loss'),
    backward: a('It works backward'), tracing: a('tracing how the final'),
    chain: a('The mathematics uses the chain'), noCalc: a('You do not need to calculate'), assigns: a('assigns each parameter'),
    gradients: a('Those sensitivity measures'), gradW: a('are called gradients'),
    gDir: a('A gradient gives the training'), upDown: a('slightly up or down'), reduce: a('expected to reduce the loss'),
    optimizer: a('An optimizer uses'), update: a('update the weights and biases'), small: a('The update is usually small'),
    sees: a('The network then sees'), again: a('makes another prediction'),
    helped: a('If the update helped'), rise: a('may rise closer'),
    notJump: a('It will not necessarily'), hundred: a('one hundred percent'),
    repeats: a('Then the process repeats'),
    pPredict: a('Predict, compare'), pCompare: a('compare with the supplied'), pLoss: a('measure the loss'), pGrad: a('calculate gradients'), pUpdate: a('and update the parameters'),
    loop: a('This is a training loop'), runs: a('It runs across many'), batches: a('often in batches'), passes: a('many passes'),
    oneEx: a('One example does not'), gradually: a('The network gradually'), across: a('patterns across many examples'),
    after: a('After training, researchers'), heldAside: a('held aside'),
    ifSucc: a('If the network succeeds'), memorized: a('memorized them'), carries: a('a pattern that carries over'),
    separate: a('A separate check'), cannot: a('cannot guarantee'), everyReal: a('every real situation'),
    simpleTask: a('In this simple task'), category: a('a category such as'),
    other: a('In other tasks'), number: a('could be a number'), sequence: a('a sequence of words'), else_: a('or something else'),
    recipe: a('The training recipe'), later: a('Later, when we reach'), nextWord: a('the next word in the text'), noHuman: a('so a human does not need'), every: a('every training sentence'),
    end: cue.duration,
  };

  // ======================= shared network =======================
  const NET = g(root);
  const cols = [{ x: 640, ys: [380, 540, 700] }, { x: 940, ys: [300, 460, 620, 780] }, { x: 1240, ys: [440, 640] }];
  const linkG = g(NET);
  const links = [];
  for (let li = 0; li < 2; li++) cols[li].ys.forEach((y1, i) => cols[li + 1].ys.forEach((y2, j) => {
    const x1 = cols[li].x + 50, x2 = cols[li + 1].x - 50;
    const path = el('path', { d: `M ${x1} ${y1} C ${x1 + 110} ${y1} ${x2 - 110} ${y2} ${x2} ${y2}`, fill: 'none', stroke: C.teal, 'stroke-width': 3.5, opacity: 0.45 }, linkG);
    links.push({ path, li, i, j, w0: (hash(li * 31 + i * 7 + j) - 0.5) * 3.2 });
  }));
  const nodes = cols.map((c, li) => c.ys.map((y, i) => {
    const n = neuron(NET, 46, { symbol: li === 0 ? ['R', 'G', 'B'][i] : 'Σ', color: li === 0 ? [C.R, C.G, C.B][i] : C.teal });
    set(n.label, { 'font-size': 34 });
    move(n.g, c.x, y);
    return n;
  }));
  const outLabels = ['LIGHT', 'DARK'].map((s, i) => txt(NET, 1240, cols[2].ys[i] - 72, s, { size: 28, weight: 800, fill: i ? C.dim : C.light }));
  const fwd = links.map(() => el('circle', { r: 9, fill: C.cyan, filter: 'url(#glow)' }, NET));
  const bwd = links.map(() => el('circle', { r: 10, fill: C.red, filter: 'url(#glow)' }, NET));
  const dialSel = links.map((l, i) => i).filter(i => i % 2 === 0 || links[i].li === 1);
  const dials = dialSel.map(i => ({ d: dial(NET, 19), l: links[i], i }));
  const grads = dials.map(({ l }, k) => {
    const gg = g(NET);
    const ar = el('path', { d: '', fill: C.amber, stroke: 'none' }, gg);
    const num = txt(gg, 0, 0, '', { size: 18, weight: 800, fill: C.amber, mono: true, anchor: 'start' });
    return { g: gg, ar, num, val: (hash(k + 400) - 0.5) * 2 };
  });
  const qBadges = dials.map(() => txt(NET, 0, 0, '?', { size: 30, weight: 800, fill: C.amber }));
  // each weight's share of the blame for the loss (bigger near the output in this toy)
  grads.forEach((gr, k) => { if (dials[k].l.li === 0) gr.val *= 0.45; });
  const blame = dials.map((_, k) => {
    const gg = g(NET);
    const bar = rect(gg, 0, -10, 0, 20, { r: 6, fill: C.red, stroke: 'none' });
    const num = txt(gg, 0, -24, '', { size: 22, weight: 800, fill: C.red, mono: true, anchor: 'start' });
    return { g: gg, bar, num };
  });
  const sensRing = el('circle', { r: 32, fill: 'none', stroke: C.amber, 'stroke-width': 5 }, NET);
  const sensTx = txt(NET, 0, 0, '', { size: 26, weight: 800, fill: C.amber });
  const kBig = dials.reduce((bi, d, k) => (d.l.li === 1 && Math.abs(grads[k].val) > Math.abs(grads[bi].val) ? k : bi), dials.length - 1);
  const kSmall = dials.reduce((bi, d, k) => (d.l.li === 0 && Math.abs(grads[k].val) < Math.abs(grads[bi].val) ? k : bi), 0);
  // in-network annotation
  const netNote = txt(root, 940, 120, '', { size: 46, weight: 800 });
  const netSub = txt(root, 940, 180, '', { size: 32, weight: 600, fill: C.dim });

  // hand cursor that sets dials
  const hand = g(root);
  el('path', { d: 'M 0 0 L 0 48 L 12 36 L 22 60 L 32 55 L 22 32 L 40 32 Z', fill: C.ink, stroke: '#000', 'stroke-width': 2 }, hand);
  // many dials grid
  const grid = g(root);
  const gridDials = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 22; c++) { const d = dial(grid, 14); move(d.g, 120 + c * 80, 220 + r * 78); gridDials.push(d); }
  const gridTx = txt(root, 960, 140, '', { size: 48, weight: 800 });
  const goal = g(root);
  rect(goal, -250, -50, 500, 100, { r: 50, fill: '#0c2a26', stroke: C.teal, sw: 4 });
  txt(goal, 0, 4, 'answers we want ✓', { size: 40, weight: 800, fill: C.teal });
  move(goal, 960, 960);

  // ======================= prediction / target panel =======================
  const PANEL = g(root);
  const PX = 1420, PW = 380;
  txt(PANEL, PX + PW / 2, 330, 'prediction', { size: 30, weight: 800, fill: C.cyan });
  const predBars = ['LIGHT', 'DARK'].map((s, i) => {
    const y = cols[2].ys[i];
    rect(PANEL, PX, y - 26, PW, 52, { r: 12, fill: '#132433', stroke: 'none' });
    const f = rect(PANEL, PX, y - 26, 0, 52, { r: 12, fill: i ? '#5b6b78' : '#ece7dc', stroke: 'none' });
    const tx = txt(PANEL, PX + PW + 20, y, '', { size: 36, weight: 800, fill: C.ink, mono: true, anchor: 'start' });
    return { f, tx };
  });
  const tgtG = g(PANEL);
  const tgtBar = rect(tgtG, PX, cols[2].ys[0] + 34, PW, 22, { r: 8, fill: 'none', stroke: C.amber, sw: 4, attrs: { 'stroke-dasharray': '10 6' } });
  txt(tgtG, PX, cols[2].ys[0] + 82, 'target: LIGHT = 100%', { size: 26, weight: 800, fill: C.amber, anchor: 'start' });
  const gapBar = rect(PANEL, PX, cols[2].ys[0] - 26, 0, 52, { r: 12, fill: C.red, stroke: 'none', attrs: { opacity: 0.35 } });
  const ghost = g(PANEL);
  rect(ghost, PX, cols[2].ys[0] - 26, PW, 52, { r: 12, fill: 'none', stroke: C.light, sw: 3, attrs: { 'stroke-dasharray': '8 8' } });
  txt(ghost, PX + PW - 14, cols[2].ys[0] - 52, '100% in one step? ✗', { size: 26, weight: 800, fill: C.red, anchor: 'end' });
  // loss meter
  const LOSS = g(root);
  txt(LOSS, PX, 860, 'LOSS', { size: 34, weight: 800, fill: C.red, anchor: 'start' });
  const lossSub = txt(LOSS, PX + 100, 860, 'mismatch on this example', { size: 24, weight: 600, fill: C.dim, anchor: 'start' });
  rect(LOSS, PX, 890, PW + 80, 44, { r: 22, fill: '#1f1215', stroke: 'none' });
  const lossFill = rect(LOSS, PX, 890, 0, 44, { r: 22, fill: C.red, stroke: 'none' });
  const notChips = ['truth', 'usefulness', 'intelligence'].map((s, i) => {
    const gg = g(root);
    rect(gg, -105, -28, 210, 56, { r: 28, fill: '#1a1f27', stroke: '#4b5563', sw: 2 });
    txt(gg, 0, 3, s, { size: 28, weight: 700, fill: C.dim });
    el('line', { x1: -95, y1: 0, x2: 95, y2: 0, stroke: C.red, 'stroke-width': 5 }, gg);
    move(gg, 1180 + i * 230, 1010);
    return gg;
  });
  const notLabel = txt(root, 1180 - 130, 1010, 'NOT a score for:', { size: 28, weight: 800, fill: C.red, anchor: 'end' });

  // ======================= input example card (left) =======================
  const IN = g(root);
  const inCard = g(IN);
  const inSw = rect(inCard, -70, -70, 140, 140, { r: 16, fill: '#d4d4d4', stroke: '#ffffff40', sw: 3 });
  const inVals = [0, 1, 2].map(i => { const gg = g(IN); rect(gg, -46, -24, 92, 48, { r: 12, fill: '#0f2433', stroke: [C.R, C.G, C.B][i], sw: 3 }); const tx = txt(gg, 0, 3, '0.8', { size: 28, weight: 800, fill: C.ink, mono: true }); return { g: gg, tx }; });
  const ansCard = g(root);
  const ansBack = rect(ansCard, -95, -40, 190, 80, { r: 40, fill: '#1c2a38', stroke: C.amber, sw: 3, attrs: { 'stroke-dasharray': '8 6' } });
  const ansQ = txt(ansCard, 0, 3, 'answer: ?', { size: 30, weight: 800, fill: C.amber });
  const ansL = pill(ansCard, 'LIGHT', { w: 190 });
  const ansTag = txt(ansCard, 0, -66, 'supplied answer', { size: 26, weight: 800, fill: C.amber });
  const supArrow = el('path', { d: '', fill: 'none', stroke: C.amber, 'stroke-width': 5, 'stroke-dasharray': '12 10' }, root);
  const thinkG = g(root);
  [[0, 0, 200, 60], [-150, 70, 16, 16]].forEach(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx, ry, fill: '#1b2a38', stroke: '#5f7d93', 'stroke-width': 3 }, thinkG));
  txt(thinkG, 0, 2, '“Is it REALLY light?”', { size: 30, weight: 700, fill: C.ink, attrs: { 'font-style': 'italic' } });
  const thinkX = g(thinkG);
  el('line', { x1: -190, y1: -50, x2: 190, y2: 50, stroke: C.red, 'stroke-width': 9 }, thinkX);
  el('line', { x1: 190, y1: -50, x2: -190, y2: 50, stroke: C.red, 'stroke-width': 9 }, thinkX);
  move(thinkG, 940, 170);

  // ======================= dataset scene =======================
  const DS = g(root);
  const dsTitle = txt(DS, 960, 110, '', { size: 50, weight: 800 });
  const cards = COLORS.map(([c, l]) => exampleCard(DS, c, l));
  const tagIn = txt(DS, 0, 0, 'INPUT', { size: 28, weight: 800, fill: C.cyan });
  const tagAns = txt(DS, 0, 0, 'ANSWER (label)', { size: 28, weight: 800, fill: C.amber });
  const people = [0, 1].map(i => person(DS, 1.4, i ? '#94a3b8' : '#cbd5e1'));
  // people sort a pile of colour swatches into LIGHT and DARK baskets
  const sortG = g(DS);
  const baskets = ['LIGHT', 'DARK'].map((l, i) => { const gg = g(sortG); el('path', { d: 'M -110 -40 L 110 -40 L 85 60 L -85 60 Z', fill: '#132433', stroke: i ? '#5b6b78' : '#ece7dc', 'stroke-width': 4 }, gg); const pp = pill(gg, l, { w: 150, size: 26 }); move(pp.g, 0, 100); move(gg, 660 + i * 600, 640); return gg; });
  const pile = COLORS.map(([c, l], i) => ({ r: rect(sortG, -32, -32, 64, 64, { r: 10, fill: c, stroke: '#ffffff50', sw: 2 }), l, i }));
  const ruleAxis = g(DS);
  const rg = el('linearGradient', { id: 'lumGrad' }, ruleAxis);
  el('stop', { offset: '0%', 'stop-color': '#000' }, rg); el('stop', { offset: '100%', 'stop-color': '#fff' }, rg);
  rect(ruleAxis, 200, 760, 1520, 30, { r: 15, fill: 'url(#lumGrad)', stroke: '#ffffff30' });
  txt(ruleAxis, 200, 830, 'darker', { size: 30, weight: 700, fill: C.dim, anchor: 'start' });
  txt(ruleAxis, 1720, 830, 'brighter', { size: 30, weight: 700, fill: C.dim, anchor: 'end' });
  const ruleLine = g(DS);
  el('line', { x1: 0, y1: 180, x2: 0, y2: 800, stroke: C.amber, 'stroke-width': 6, 'stroke-dasharray': '14 10' }, ruleLine);
  txt(ruleLine, 0, 860, 'agreed rule', { size: 32, weight: 800, fill: C.amber });
  const agreeTx = txt(DS, 0, 0, '✓ agree', { size: 32, weight: 800, fill: C.green });
  const miniNet = g(DS);
  const mn = neuron(miniNet, 80, { symbol: '?' });
  set(mn.label, { 'font-size': 80, fill: C.amber });
  txt(miniNet, 0, 130, 'network', { size: 32, weight: 700, fill: C.teal });
  const block = g(DS);
  el('line', { x1: -60, y1: -60, x2: 60, y2: 60, stroke: C.red, 'stroke-width': 10 }, block);
  el('line', { x1: 60, y1: -60, x2: -60, y2: 60, stroke: C.red, 'stroke-width': 10 }, block);

  // ======================= data quality overlay =======================
  const QG = g(root);
  rect(QG, 160, 230, 1600, 700, { r: 30, fill: '#08121bf2', stroke: '#2e4a60' });
  const qTitle = txt(QG, 960, 300, 'Quality and coverage matter', { size: 48, weight: 800 });
  const conflict = g(QG);
  txt(conflict, 0, -150, 'inconsistent labels', { size: 34, weight: 800, fill: C.red });
  const c1 = exampleCard(conflict, '#9ca3af', 'LIGHT'); move(c1.g, 0, -40);
  const c2 = exampleCard(conflict, '#9ca3af', 'DARK'); move(c2.g, 0, 100);
  txt(conflict, 0, 210, 'same colour, different answers', { size: 28, weight: 600, fill: C.dim });
  move(conflict, 560, 600);
  const cover = g(QG);
  txt(cover, 0, -150, 'missing cases', { size: 34, weight: 800, fill: C.red });
  const hue = el('linearGradient', { id: 'hueGrad' }, cover);
  ['#000000', '#1e3a8a', '#14532d', '#7f1d1d', '#a16207', '#9ca3af', '#fde68a', '#fbcfe8', '#ffffff'].forEach((c, i) => el('stop', { offset: `${i * 12.5}%`, 'stop-color': c }, hue));
  rect(cover, -300, -40, 600, 60, { r: 14, fill: 'url(#hueGrad)', stroke: '#ffffff30' });
  [-280, -240, -200, 170, 210, 250, 280].forEach(x => el('circle', { cx: x, cy: 60, r: 10, fill: C.cyan }, cover));
  const gapBox = rect(cover, -170, -56, 320, 92, { r: 12, fill: 'none', stroke: C.red, sw: 4, attrs: { 'stroke-dasharray': '10 8' } });
  txt(cover, -10, 110, 'no examples here', { size: 28, weight: 700, fill: C.red });
  move(cover, 1340, 600);
  const biasedTx = txt(QG, 960, 880, '→ the model can learn an incomplete or biased rule', { size: 36, weight: 800, fill: C.amber });

  // ======================= gradient direction callout =======================
  const GD = g(root);
  rect(GD, -260, -230, 520, 460, { r: 26, fill: '#0b1824', stroke: C.amber, sw: 3 });
  txt(GD, 0, -185, 'one weight: which way?', { size: 32, weight: 800, fill: C.amber });
  const gdDial = dial(GD, 56);
  move(gdDial.g, 0, -85);
  const tryUp = g(GD);
  txt(tryUp, 0, 0, '↑ up  →  loss falls ✓', { size: 32, weight: 800, fill: C.green });
  move(tryUp, 0, 30);
  const tryDn = g(GD);
  txt(tryDn, 0, 0, '↓ down  →  loss rises ✗', { size: 32, weight: 800, fill: C.red });
  move(tryDn, 0, 90);
  const gdPick = txt(GD, 0, 170, 'the gradient shows the way', { size: 30, weight: 700, fill: C.ink });
  move(GD, 1630, 560);
  const chainG = g(root);
  const chainLinks = [0, 1].map(i => { const gg = g(chainG); el('ellipse', { cx: -22, cy: 0, rx: 34, ry: 18, fill: 'none', stroke: C.amber, 'stroke-width': 7 }, gg); el('ellipse', { cx: 22, cy: 0, rx: 34, ry: 18, fill: 'none', stroke: C.amber, 'stroke-width': 7 }, gg); move(gg, [790, 1090][i], 230); return gg; });
  const chainTx = txt(chainG, 940, 175, 'chain rule: link each step’s effect', { size: 32, weight: 800, fill: C.amber });

  // ======================= training loop scene =======================
  const LP = g(root);
  const steps = ['Predict', 'Compare', 'Loss', 'Gradients', 'Update'];
  const stepCol = [C.cyan, C.amber, C.red, C.amber, C.teal];
  const LCX = 760, LCY = 560, LR = 300;
  el('circle', { cx: LCX, cy: LCY, r: LR, fill: 'none', stroke: C.faint, 'stroke-width': 6, 'stroke-dasharray': '4 14' }, LP);
  const loopDot = el('circle', { r: 16, fill: C.teal, filter: 'url(#glow)' }, LP);
  const stepG = steps.map((s, i) => {
    const ang = -Math.PI / 2 + i * (Math.PI * 2 / 5);
    const gg = g(LP);
    const bg = rect(gg, -120, -40, 240, 80, { r: 40, fill: '#0f1d2a', stroke: stepCol[i], sw: 4 });
    txt(gg, 0, 3, s, { size: 34, weight: 800, fill: stepCol[i] });
    move(gg, LCX + Math.cos(ang) * LR, LCY + Math.sin(ang) * LR);
    return { g: gg, bg, ang };
  });
  const loopTx = txt(LP, LCX, LCY - 125, 'training loop', { size: 44, weight: 800 });
  const passTx = txt(LP, LCX, LCY + 125, '', { size: 32, weight: 700, fill: C.dim, mono: true });
  // stream of examples / batches
  const stream = Array.from({ length: 16 }, (_, i) => rect(LP, -26, -26, 52, 52, { r: 8, fill: COLORS[i % 8][0], stroke: '#ffffff40', sw: 2 }));
  const batchBox = rect(LP, 0, 0, 0, 0, { r: 14, fill: 'none', stroke: C.cyan, sw: 4, attrs: { 'stroke-dasharray': '10 8' } });
  const batchTx = txt(LP, 0, 0, 'batch', { size: 28, weight: 800, fill: C.cyan });
  // loss curve
  // probability the network gives to the CORRECT answer, example after example
  const curveG = g(LP);
  const CX0 = 1250, CX1 = 1790, CY0 = 300, CY1 = 660;
  rect(curveG, CX0 - 50, CY0 - 80, CX1 - CX0 + 80, CY1 - CY0 + 130, { r: 22, fill: '#0b1824', stroke: '#24405a' });
  txt(curveG, (CX0 + CX1) / 2 - 10, CY0 - 45, 'probability given to the correct answer', { size: 26, weight: 800, fill: C.green });
  [0, 0.5, 1].forEach(v => { const y = lerp(CY1, CY0, v); el('line', { x1: CX0, y1: y, x2: CX1, y2: y, stroke: '#16283a', 'stroke-width': 2 }, curveG); txt(curveG, CX0 - 12, y, `${v * 100}%`, { size: 18, weight: 700, fill: C.dim, mono: true, anchor: 'end' }); });
  txt(curveG, CX1, CY1 + 30, 'examples seen →', { size: 20, weight: 600, fill: C.dim, anchor: 'end' });
  const NEX = 56;
  const exP = Array.from({ length: NEX }, (_, i) => clamp(0.24 + 0.66 * (1 - Math.exp(-i / 15)) + (hash(i * 3 + 1) - 0.5) * 0.34 * (1 - 0.45 * i / NEX), 0.05, 0.97));
  const exX = i => lerp(CX0 + 12, CX1 - 8, i / (NEX - 1)), exY = v => lerp(CY1, CY0, v);
  let dTrend = '';
  for (let i = 0; i < NEX; i++) dTrend += `${i ? 'L' : 'M'} ${exX(i)} ${exY(0.24 + 0.66 * (1 - Math.exp(-i / 15)))} `;
  const trend = el('path', { d: dTrend, fill: 'none', stroke: C.green, 'stroke-width': 4, 'stroke-dasharray': '10 8', opacity: 0.8 }, curveG);
  const exLine = el('path', { d: '', fill: 'none', stroke: '#64748b', 'stroke-width': 2 }, curveG);
  const exDots = exP.map((v, i) => el('rect', { x: exX(i) - 8, y: exY(v) - 8, width: 16, height: 16, rx: 4, fill: COLORS[i % 8][0], stroke: '#ffffff', 'stroke-width': 1.5 }, curveG));
  const trendTx = txt(curveG, CX1 - 10, CY0 + 30, 'trend ↗', { size: 24, weight: 800, fill: C.green, anchor: 'end' });
  const dipTx = txt(curveG, 0, 0, 'sometimes worse', { size: 18, weight: 700, fill: C.red });
  // the example currently in the loop
  const curEx = g(LP);
  const curSw = rect(curEx, -45, -45, 90, 90, { r: 12, fill: '#ccc', stroke: '#ffffff60', sw: 2 });
  const curLab = txt(curEx, 0, 72, '', { size: 26, weight: 800, fill: C.ink });
  const curP = txt(curEx, 0, 106, '', { size: 24, weight: 800, fill: C.green, mono: true });
  move(curEx, LCX, LCY - 30);
  const oneExTx = txt(LP, 1520, 760, '', { size: 32, weight: 800, fill: C.ink });
  const stamp = g(LP);
  rect(stamp, -200, -40, 400, 80, { r: 16, fill: 'none', stroke: C.red, sw: 5 });
  txt(stamp, 0, 4, 'PERMANENT FACT', { size: 34, weight: 800, fill: C.red });
  el('line', { x1: -210, y1: 30, x2: 210, y2: -30, stroke: C.red, 'stroke-width': 7 }, stamp);
  move(stamp, 1520, 860);

  // ======================= held-out scene =======================
  const HO = g(root);
  const hoTitle = txt(HO, 960, 110, '', { size: 50, weight: 800 });
  const pracCards = Array.from({ length: 12 }, (_, i) => rect(HO, -30, -30, 60, 60, { r: 8, fill: COLORS[i % 8][0], stroke: '#ffffff40', sw: 2 }));
  const testCards = ['#e5e7eb', '#1f2937', '#fef9c3', '#312e81'].map(c => rect(HO, -30, -30, 60, 60, { r: 8, fill: c, stroke: '#ffffff40', sw: 2 }));
  const pracBox = g(HO); rect(pracBox, -260, -150, 520, 300, { r: 24, fill: 'none', stroke: C.teal, sw: 3 }); txt(pracBox, 0, -190, 'practice examples', { size: 34, weight: 800, fill: C.teal });
  const testBox = g(HO); rect(testBox, -170, -150, 340, 300, { r: 24, fill: '#1a160b', stroke: C.amber, sw: 3 }); txt(testBox, 0, -190, 'held aside', { size: 34, weight: 800, fill: C.amber });
  const lock = g(testBox); rect(lock, -26, -6, 52, 40, { r: 6, fill: C.amber, stroke: 'none' }); el('path', { d: 'M -16 -6 L -16 -24 A 16 16 0 0 1 16 -24 L 16 -6', fill: 'none', stroke: C.amber, 'stroke-width': 6 }, lock); move(lock, 120, -110);
  move(pracBox, 560, 420); move(testBox, 1360, 420);
  const scoreRows = [['memorized', '100%', '52%', false], ['learned the pattern', '96%', '94%', true]].map(([n, a1, a2, ok], i) => {
    const gg = g(HO);
    txt(gg, -600, 0, n, { size: 34, weight: 800, fill: C.ink, anchor: 'start' });
    txt(gg, -60, 0, `practice ${a1}`, { size: 34, weight: 700, fill: C.teal, mono: true });
    txt(gg, 340, 0, `held-out ${a2}`, { size: 34, weight: 700, fill: ok ? C.green : C.red, mono: true });
    txt(gg, 580, 0, ok ? '✓' : '✗', { size: 48, weight: 800, fill: ok ? C.green : C.red });
    move(gg, 960, 700 + i * 90);
    return gg;
  });
  const world = g(HO);
  const odd = [['#e5e7eb', 'shadow'], ['#94a3b8', 'glare'], ['url(#hueGrad)', 'gradient'], ['#7c7c7c', 'in between']];
  const oddG = odd.map(([c, n], i) => { const gg = g(world); rect(gg, -60, -60, 120, 120, { r: 14, fill: c, stroke: '#ffffff40', sw: 2 }); txt(gg, 0, 92, n, { size: 26, weight: 700, fill: C.dim }); txt(gg, 50, -55, '?', { size: 48, weight: 800, fill: C.amber }); move(gg, 520 + i * 290, 0); return gg; });
  const worldTx = txt(world, 960, -150, 'a check helps, but cannot guarantee every real situation', { size: 36, weight: 800, fill: C.amber });
  move(world, 0, 900);

  // ======================= targets scene =======================
  const TG = g(root);
  const tgTitle = txt(TG, 960, 120, 'What is the “answer”? It depends on the task', { size: 48, weight: 800 });
  const targets = [
    ['category', g(TG)], ['number', g(TG)], ['sequence of words', g(TG)], ['something else…', g(TG)],
  ];
  targets.forEach(([n, gg], i) => {
    rect(gg, -190, -150, 380, 300, { r: 26, fill: '#0f1d2a', stroke: '#2e4a60' });
    txt(gg, 0, -100, n, { size: 32, weight: 800, fill: C.teal });
    move(gg, 300 + i * 440, 420);
  });
  { const p1 = pill(targets[0][1], 'LIGHT'); move(p1.g, 0, 0); const p2 = pill(targets[0][1], 'DARK'); move(p2.g, 0, 80); }
  txt(targets[1][1], 0, 30, '0.73', { size: 80, weight: 800, fill: C.amber, mono: true });
  txt(targets[2][1], 0, 30, '“a grey cat sleeps”', { size: 30, weight: 700, fill: C.ink });
  txt(targets[3][1], 0, 30, '⋯', { size: 90, weight: 800, fill: C.dim });
  const recipeTx = txt(TG, 960, 650, 'the training recipe depends on the task', { size: 36, weight: 700, fill: C.dim });
  const words = ['The', 'cat', 'sat', 'on', 'the', 'warm', 'mat', '.'];
  const wordG = words.map((w, i) => { const gg = g(TG); const r = rect(gg, -70, -38, 140, 76, { r: 14, fill: '#13283a', stroke: '#2e4a60' }); const tx = txt(gg, 0, 3, w, { size: 36, weight: 700 }); move(gg, 330 + i * 180, 820); return { g: gg, r, tx }; });
  const winBox = rect(TG, 0, 0, 0, 0, { r: 18, fill: 'none', stroke: C.cyan, sw: 4 });
  const tgtBox = rect(TG, 0, 0, 0, 0, { r: 18, fill: 'none', stroke: C.amber, sw: 5 });
  const winTx = txt(TG, 0, 920, 'input text', { size: 28, weight: 800, fill: C.cyan });
  const tgtTx = txt(TG, 0, 920, 'target = next word', { size: 28, weight: 800, fill: C.amber });
  const noHuman = g(TG);
  person(noHuman, 1.2, '#94a3b8');
  el('line', { x1: -50, y1: -70, x2: 50, y2: 30, stroke: C.red, 'stroke-width': 8 }, noHuman);
  txt(noHuman, 0, 70, 'no hand-written answer', { size: 26, weight: 800, fill: C.red });
  move(noHuman, 1760, 640);

  // ======================= update =======================
  let sensWobble = 0;
  return function update(t) {
    const dsOn = vis(t, T.forOur - 0.4, T.beginning - 0.2, 0.6, 0.6);
    const netOn = Math.max(vis(t, 0, T.real + 0.3, 0.01, 0.5), vis(t, T.training + 1.5, T.forOur - 0.2, 0.5, 0.5), vis(t, T.beginning - 0.4, T.repeats + 0.2, 0.6, 0.6));
    show(NET, netOn);
    show(netNote, netOn * (1 - vis(t, T.notDisc - 0.2, T.shown, 0.3, 0.3)));
    show(netSub, netOn);

    // ---- weights state over time ----
    const randomize = p(t, T.random - 0.5, 1.2);
    const upd = p(t, T.optimizer + 0.6, 2.0);
    const wOf = (l, k) => {
      let w = l.w0 * 0.6;                                      // hand-set
      w = lerp(w, l.w0 * 1.3 + Math.sin(k * 3.1) * 0.6, randomize); // random / unhelpful
      w += (grads[k] ? grads[k].val : 0) * 0.35 * upd;          // small update in gradient direction
      if (t > T.repeats) w += Math.sin(t * 0.7 + k) * 0.25 * p(t, T.repeats, 1);
      return w;
    };
    // hand setting at start
    const handOn = vis(t, T.soFar, T.real, 0.4, 0.4);
    const hd = dials[Math.floor(pl(t, T.soFar, T.real - T.soFar) * dials.length * 0.99)] || dials[0];
    const hp = pointOn(hd.l.path, 0.5);
    move(hand, hp.x + 10, hp.y + 10); show(hand, handOn);
    dials.forEach(({ d, l }, k) => {
      const pt = pointOn(l.path, 0.5);
      move(d.g, pt.x, pt.y);
      show(d.g, netOn);
      let jiggle = handOn > 0 && hd === dials[k] ? Math.sin(t * 9) * 0.4 : 0;
      if (k === kBig) jiggle += Math.sin((t - T.backprop) * 9) * 0.6 * vis(t, T.backprop + 0.2, T.backprop + 2.6, 0.2, 0.2);
      if (k === kSmall) jiggle += Math.sin((t - T.backprop) * 9) * 0.6 * vis(t, T.backprop + 2.8, T.backward - 0.1, 0.2, 0.2);
      d.setValue(wOf(l, k) + jiggle, -2.5, 2.5);
      set(l.path, { 'stroke-width': 2 + Math.abs(wOf(l, k)) * 2 });
    });
    set(netNote, { text: t < T.forOur ? (t < T.real ? 'So far: weights set by hand' : 'Training: find settings that work') : t < T.take ? 'Start: random or unhelpful weights' : t < T.reveal ? 'Pass ONLY the colour values in' : t < T.decide ? 'Compare with the supplied answer' : t < T.backprop ? 'What should change?' : t < T.backward ? 'How strongly does the loss react to each weight?' : t < T.chain ? 'Work backward from the mismatch' : t < T.assigns ? 'Chain rule: link the effects step by step' : t < T.gradients ? 'Each weight gets its share of the blame' : t < T.optimizer ? 'Gradient = how much, and which way' : t < T.sees ? 'Optimizer: small step against the blame' : 'Try the same colour again' });
    set(netSub, { text: t < T.forOur ? '' : t >= T.lossMeasures && t < T.supplied ? '' : '' });

    // ---- many dials grid ----
    const gOn = vis(t, T.real - 0.2, T.training + 1.6, 0.5, 0.5);
    show(grid, gOn);
    gridDials.forEach((d, i) => { show(d.g, p(t, T.many - 0.6 + (i % 22) * 0.02 + Math.floor(i / 22) * 0.04, 0.3)); const settle = p(t, T.finding, 2.5); d.setValue(lerp(hash(i) * 4 - 2 + Math.sin(t * 3 + i) * 0.5 * (1 - settle), Math.sin(i * 0.37) * 1.2, settle), -2, 2); });
    set(gridTx, { text: t < T.training ? 'A real network: many adjustable values' : 'Training = finding good settings' });
    show(gridTx, gOn);
    show(goal, vis(t, T.answers - 0.3, T.forOur - 0.3) );

    // ---- dataset ----
    show(DS, dsOn);
    set(dsTitle, { text: t < T.collection ? 'People prepare examples' : t < T.rule ? 'A labelled training set' : t < T.noKnow ? 'Labels follow one agreed rule' : 'The network only sees examples + answers' });
    const toAxis = p(t, T.rule + 0.2, 1.4);
    const toNet = p(t, T.onlyRecv, 1.6);
    cards.forEach((c, i) => {
      // order of appearance: card 0 (pale grey) at row1, card 1 (dark blue) at row2, rest at collection
      const appear = i === 0 ? T.twoParts : i === 1 ? T.row2 : T.collection + (i - 2) * 0.25;
      const k = p(t, appear, 0.5, easeBack);
      const tx0 = i < 2 ? 960 : (i % 2 ? 1300 : 620), ty0 = i < 2 ? 380 + i * 170 : 300 + Math.floor(i / 2) * 150;
      let x = i < 2 ? lerp(960, i % 2 ? 1300 : 620, p(t, T.collection, 0.8)) : tx0;
      let y = i < 2 ? lerp(ty0, 300 + Math.floor(i / 2) * 150, p(t, T.collection, 0.8)) : ty0;
      const ax = 200 + lum(COLORS[i][0]) * 1520;
      const ay = 660 - (Math.floor(i / 2) % 4) * 105;
      x = lerp(x, ax, toAxis); y = lerp(y, ay, toAxis);
      const s = lerp(1, 0.6, toAxis);
      x = lerp(x, 1640, easeOut(clamp(toNet * 1.3 - i * 0.04))); y = lerp(y, 420, easeOut(clamp(toNet * 1.3 - i * 0.04)));
      move(c.g, x, y, s * (1 - 0.7 * toNet));
      show(c.g, k * (1 - p(t, T.onlyRecv + 1.2, 0.5)));
      // first card shows only swatch first, then label
      if (i === 0) show(c.lp.g, p(t, T.asAnswer, 0.4) + p(t, T.row1, 0.1));
    });
    const tagOn = vis(t, T.asInput - 0.2, T.row2);
    set(tagIn, { x: 960 - 145, y: 290 }); show(tagIn, tagOn);
    set(tagAns, { x: 960 + 100, y: 290 }); show(tagAns, tagOn * p(t, T.asAnswer, 0.4));
    people.forEach((pp, i) => { const pv = vis(t, T.forOur - 0.2, T.twoParts, 0.5, 0.4) + vis(t, T.agree - 0.3, T.noKnow, 0.4, 0.4); move(pp, t > T.rule ? 860 + i * 200 : 660 + i * 600, t > T.rule ? 300 : 430); show(pp, Math.min(1, pv)); });
    const sortOn = vis(t, T.forOur - 0.2, T.twoParts - 0.1, 0.5, 0.4);
    show(sortG, sortOn);
    pile.forEach(({ r, l, i }) => {
      const k = p(t, T.prepare + 0.4 + i * 0.5, 0.6, easeOut);
      const tx = l === 'LIGHT' ? 660 : 1260, ty = 600 - Math.floor(i / 2) * 6;
      const px = 960 + (i % 3 - 1) * 26, py = 680 - i * 14;
      const arc = Math.sin(Math.PI * k) * -160;
      move(r, lerp(px, tx + (i % 4 - 1.5) * 30, k), lerp(py, ty, k) + arc, 1, k * (i % 2 ? 20 : -20));
    });
    show(ruleAxis, toAxis * (1 - toNet));
    move(ruleLine, 200 + 0.5 * 1520, 0); show(ruleLine, p(t, T.consistent, 0.5) * (1 - toNet));
    set(agreeTx, { x: 960, y: 220 }); show(agreeTx, vis(t, T.agree + 1.0, T.noKnow));
    move(miniNet, 1640, 420); show(miniNet, p(t, T.noKnow - 0.2, 0.5));
    move(block, 1450, 420, 1); show(block, vis(t, T.noKnow + 0.6, T.onlyRecv, 0.3, 0.3));

    // ---- forward pass of one example ----
    const exOn = vis(t, T.take - 0.3, T.repeats + 0.6, 0.5, 0.5);
    show(IN, exOn);
    move(inCard, 260, 540);
    const split = p(t, T.onlyColor, 1.0);
    inVals.forEach((v, i) => { move(v.g, lerp(260, 470, split), lerp(540, cols[0].ys[i], split)); show(v.g, split); });
    move(ansCard, lerp(260, 260, 0), lerp(540, 820, p(t, T.take + 1.0, 0.8)));
    show(ansCard, exOn * p(t, T.take + 0.5, 0.5));
    const revealed = p(t, T.light - 0.2, 0.4);
    show(ansBack, 1 - revealed); show(ansQ, 1 - revealed);
    show(ansL.g, revealed);
    show(ansTag, vis(t, T.supplied, T.decide));
    const supOn = vis(t, T.supervised - 0.3, T.decide, 0.5, 0.5);
    set(supArrow, { d: `M 360 820 C 900 1000 1300 980 ${PX + 40} ${cols[2].ys[0] + 60}` });
    show(supArrow, supOn); draw(supArrow, p(t, T.supervised - 0.3, 1.0));
    show(thinkG, vis(t, T.notDisc, T.shown, 0.4, 0.4));
    move(thinkX, 0, 0, p(t, T.notDisc + 2.0, 0.3, easeBack)); show(thinkX, p(t, T.notDisc + 2.0, 0.3));

    // forward pulses
    const fwdOn = Math.max(vis(t, T.predict - 0.3, T.perhaps + 1, 0.3, 0.3), vis(t, T.sees, T.helped + 1, 0.3, 0.3), vis(t, T.shown, T.quality, 0.3, 0.3));
    const bwdOn = vis(t, T.sensitive - 0.5, T.gradients, 0.3, 0.3);
    links.forEach((l, i) => {
      const cyc = (t * 0.9 + (l.li ? 0.5 : 0)) % 1;
      const kf = l.li === 0 ? clamp(cyc * 2) : clamp(cyc * 2 - 1);
      const pf = pointOn(l.path, kf);
      set(fwd[i], { cx: pf.x, cy: pf.y });
      show(fwd[i], fwdOn * (kf > 0 && kf < 1 ? 1 : 0));
      const cb = (t * 0.8 + (l.li ? 0 : 0.5)) % 1;
      const kb = l.li === 1 ? 1 - clamp(cb * 2) : 1 - clamp(cb * 2 - 1);
      const pb = pointOn(l.path, kb);
      set(bwd[i], { cx: pb.x, cy: pb.y });
      const sensitivityHL = t > T.tracing ? 1 : l.li === 1 ? 1 : p(t, T.backward, 0.6);
      show(bwd[i], bwdOn * sensitivityHL * (kb > 0 && kb < 1 ? 1 : 0));
    });
    // links glow red by how much blame flows back through them
    const flow1 = vis(t, T.backward - 0.2, T.optimizer, 0.6, 0.6), flow0 = vis(t, T.tracing, T.optimizer, 0.6, 0.6);
    links.forEach((l, i) => {
      const k = dials.findIndex(d => d.l === l);
      const mag = k >= 0 ? Math.abs(grads[k].val) : 0.3;
      const f = l.li === 1 ? flow1 : flow0;
      if (f > 0) set(l.path, { stroke: mix(C.teal, C.red, f), 'stroke-width': 2 + (l.li ? 2 : 1) * 4 * mag * f + Math.abs(wOf(l, Math.max(0, k))) * 2 * (1 - f) });
      else set(l.path, { stroke: C.teal });
    });
    // sensitivity test: wiggle one weight, watch the loss react
    const sBig = vis(t, T.backprop + 0.2, T.backprop + 2.6, 0.2, 0.2), sSmall = vis(t, T.backprop + 2.8, T.backward - 0.1, 0.2, 0.2);
    const sk = sBig > 0 ? kBig : kSmall;
    const spt = pointOn(dials[sk].l.path, 0.5);
    set(sensRing, { cx: spt.x, cy: spt.y }); show(sensRing, Math.max(sBig, sSmall));
    set(sensTx, { x: spt.x, y: spt.y - 52, text: sBig > 0 ? 'loss reacts a lot' : 'loss barely moves' });
    show(sensTx, Math.max(sBig, sSmall));
    sensWobble = Math.sin((t - T.backprop) * 9) * (0.3 * sBig + 0.03 * sSmall);
    // blame tags: each parameter's measured share of the loss
    const blameOn = vis(t, T.assigns + 0.8, T.gradW + 0.2, 0.4, 0.4);
    const order = dials.map((d, k) => k).sort((a1, b1) => dials[b1].l.li - dials[a1].l.li);
    dials.forEach(({ l }, k) => {
      const pt = pointOn(l.path, 0.5);
      const bl = blame[k];
      move(bl.g, pt.x + 24, pt.y + 26);
      const appear = p(t, T.assigns + 0.8 + order.indexOf(k) * 0.35, 0.4);
      set(bl.bar, { width: 72 * Math.abs(grads[k].val) * appear });
      set(bl.num, { text: Math.abs(grads[k].val).toFixed(2) });
      show(bl.g, blameOn * appear);
    });
    // gradients / ? badges
    const gOnN = vis(t, T.gradW - 0.1, T.small + 1.0, 0.5, 0.5);
    dials.forEach(({ l }, k) => {
      const pt = pointOn(l.path, 0.5);
      set(qBadges[k], { x: pt.x + 26, y: pt.y - 26 });
      show(qBadges[k], vis(t, T.which, T.backprop, 0.3, 0.3));
      const gr = grads[k];
      const len = 14 + Math.abs(gr.val) * 26, dir = gr.val > 0 ? -1 : 1;
      set(gr.ar, { d: `M ${pt.x + 30} ${pt.y} l 0 ${dir * len} l -9 ${-dir * 10} m 9 ${dir * 10} l 9 ${-dir * 10}` , stroke: gr.val > 0 ? C.green : C.amber, 'stroke-width': 5, fill: 'none' });
      set(gr.num, { x: pt.x + 44, y: pt.y + dir * len * 0.6, text: `${gr.val > 0 ? '+' : '−'}${Math.abs(gr.val).toFixed(2)}`, fill: gr.val > 0 ? C.green : C.amber });
      show(gr.g, gOnN);
    });
    show(chainG, vis(t, T.chain - 0.2, T.assigns));
    chainLinks.forEach((c, i) => show(c, p(t, T.chain + i * 0.3, 0.4)));
    show(GD, vis(t, T.gDir - 0.2, T.optimizer + 0.3));
    gdDial.setValue(t < T.upDown ? 0 : t < T.upDown + 1.5 ? Math.sin((t - T.upDown) * 4) * 0.6 : 0.5 * p(t, T.reduce, 0.6), -2, 2);
    show(tryUp, p(t, T.upDown, 0.4)); show(tryDn, p(t, T.upDown + 0.8, 0.4)); show(gdPick, p(t, T.reduce, 0.5));

    // prediction panel
    const panelOn = vis(t, T.predict - 0.2, T.repeats + 0.6, 0.5, 0.5);
    const gdOn = vis(t, T.gDir - 0.2, T.optimizer + 0.3);
    show(PANEL, panelOn * (1 - vis(t, T.quality - 0.3, T.decide - 0.2, 0.5, 0.5)) * (1 - gdOn));
    const second = p(t, T.rise, 1.2);
    const pl0 = lerp(0.2, 0.31, second);
    const shownPred = p(t, T.p20 - 0.4, 0.8);
    set(predBars[0].f, { width: PW * pl0 * shownPred });
    set(predBars[1].f, { width: PW * (1 - pl0) * p(t, T.d80 - 0.2, 0.8) });
    set(predBars[0].tx, { text: `${Math.round(pl0 * 100)}%` }); show(predBars[0].tx, shownPred);
    set(predBars[1].tx, { text: `${Math.round((1 - pl0) * 100)}%` }); show(predBars[1].tx, p(t, T.d80 - 0.2, 0.5));
    show(tgtG, p(t, T.compares, 0.6));
    set(gapBar, { x: PX + PW * pl0, width: PW * (1 - pl0) * p(t, T.because, 0.8) });
    show(gapBar, vis(t, T.because, T.repeats));
    show(ghost, vis(t, T.notJump, T.repeats));
    const lossV = -Math.log(pl0) / 2;
    const lossOn = vis(t, T.lossLarge - 0.4, T.repeats + 0.6, 0.5, 0.5);
    show(LOSS, lossOn * (1 - vis(t, T.quality - 0.3, T.decide - 0.2, 0.5, 0.5)) * (1 - gdOn));
    set(lossFill, { width: (PW + 80) * Math.min(1, lossV * (1 + sensWobble)) * p(t, T.lossLarge - 0.3, 0.8) });
    show(lossSub, p(t, T.lossMeasures, 0.5));
    const notOn = vis(t, T.notGeneral - 0.2, T.supplied);
    show(notLabel, notOn);
    notChips.forEach((c, i) => show(c, notOn * p(t, [T.truth, T.useful, T.intel][i], 0.4)));

    // quality overlay
    const qOn = vis(t, T.quality - 0.3, T.decide - 0.2, 0.5, 0.5);
    show(QG, qOn);
    show(conflict, p(t, T.inconsistent, 0.5));
    show(cover, p(t, T.leaveOut - 0.3, 0.5));
    show(biasedTx, p(t, T.biased - 0.3, 0.5));

    // ---- training loop ----
    const lpOn = vis(t, T.repeats - 0.2, T.after - 0.2, 0.6, 0.6);
    show(LP, lpOn);
    const stepTimes = [T.pPredict, T.pCompare, T.pLoss, T.pGrad, T.pUpdate];
    let active = -1;
    if (t < T.loop) stepTimes.forEach((st, i) => { if (t >= st - 0.1) active = i; });
    else active = Math.floor(((t - T.loop) * 1.4) % 5);
    stepG.forEach((s, i) => { show(s.g, p(t, i === 0 ? T.repeats : stepTimes[i] - 0.2, 0.4)); set(s.bg, { fill: i === active ? mix('#0f1d2a', stepCol[i], 0.35) : '#0f1d2a' }); });
    const dAng = t < T.loop ? (active < 0 ? -Math.PI / 2 : stepG[Math.max(0, active)].ang) : -Math.PI / 2 + (t - T.loop) * 1.4 * (Math.PI * 2 / 5);
    set(loopDot, { cx: LCX + Math.cos(dAng) * LR, cy: LCY + Math.sin(dAng) * LR });
    show(loopTx, p(t, T.loop, 0.5));
    const pass = 1 + Math.floor(Math.max(0, t - T.passes) / 1.6);
    set(passTx, { text: t > T.passes ? `pass ${pass} over the training set` : '' });
    // stream of examples entering the loop, grouped in batches
    const batched = p(t, T.batches, 0.8);
    // conveyor of examples at the bottom feeding the loop; grouped into batches of 4
    const CY = 960, span = 16 * 90 + 3 * 120 * batched;
    const head = ((t - T.runs) * 140) % span;
    let batchX = null;
    stream.forEach((r, i) => {
      const off = i * 90 + Math.floor(i / 4) * 120 * batched;
      const x = LCX - ((off - head + span * 4) % span) + 80;
      move(r, x, CY);
      const inView = x > 40 && x < LCX + 60;
      show(r, vis(t, T.runs, T.oneEx + 0.5) * (inView ? 1 : 0) * clamp((LCX + 60 - x) / 60));
      if (i % 4 === 0 && x > 200 && x < LCX - 200 && batchX === null) batchX = x;
    });
    const bOn = vis(t, T.batches, T.oneEx + 0.5) * (batchX !== null ? 1 : 0);
    if (batchX !== null) { set(batchBox, { x: batchX - 3 * 90 - 40, y: CY - 50, width: 3 * 90 + 80, height: 100 }); set(batchTx, { x: batchX - 135, y: CY - 78 }); }
    show(batchBox, bOn); show(batchTx, bOn);
    show(curveG, p(t, T.pPredict - 0.3, 0.5));
    const exI = clamp(Math.floor((t - T.pPredict) / ((T.after - 0.6 - T.pPredict) / NEX)), 0, NEX - 1);
    let dl2 = '';
    exDots.forEach((r, i) => { show(r, t > T.pPredict && i <= exI ? 1 : 0); if (i <= exI) dl2 += `${i ? 'L' : 'M'} ${exX(i)} ${exY(exP[i])} `; });
    set(exLine, { d: dl2 || 'M 0 0' }); show(exLine, t > T.pPredict ? 1 : 0);
    show(trend, p(t, T.gradually, 0.8)); show(trendTx, p(t, T.gradually, 0.8));
    // point out a step that got worse (one example is not a permanent fact)
    const dipI = exP.findIndex((v, i) => i > 4 && i <= exI && v < exP[i - 1] - 0.12);
    if (dipI > 0) set(dipTx, { x: exX(dipI), y: exY(exP[dipI]) + 34 });
    show(dipTx, dipI > 0 ? vis(t, T.oneEx - 0.3, T.after - 0.6, 0.4, 0.4) : 0);
    const isL = COLORS[exI % 8][1] === 'LIGHT';
    set(curSw, { fill: COLORS[exI % 8][0] });
    set(curLab, { text: `answer: ${COLORS[exI % 8][1]}` });
    set(curP, { text: `network: ${Math.round(exP[exI] * 100)}% ${isL ? 'light' : 'dark'}` });
    show(curEx, vis(t, T.pPredict, T.after - 0.4, 0.4, 0.4));
    set(oneExTx, { text: t < T.gradually ? 'one example ≠ a permanent fact' : 'small nudges, many examples' });
    show(oneExTx, p(t, T.oneEx, 0.4));
    show(stamp, vis(t, T.oneEx + 0.3, T.gradually + 1.5));

    // ---- held-out ----
    const hoOn = vis(t, T.after - 0.3, T.simpleTask - 0.3, 0.6, 0.6);
    show(HO, hoOn);
    set(hoTitle, { text: t < T.ifSucc ? 'Check examples that were held aside' : t < T.separate ? 'Memorized, or learned a pattern?' : 'A useful check — not a guarantee' });
    const sep = p(t, T.heldAside - 0.6, 1.0);
    pracCards.forEach((r, i) => move(r, lerp(560 + (i % 6) * 70 - 175, 560 + (i % 6) * 70 - 175, sep), 420 + (Math.floor(i / 6) - 0.5) * 80));
    testCards.forEach((r, i) => move(r, lerp(560 + 260 + i * 70, 1360 + (i % 2) * 80 - 40, sep), lerp(560, 420 + (Math.floor(i / 2) - 0.5) * 80, sep)));
    show(pracBox, p(t, T.after + 0.5, 0.5)); show(testBox, p(t, T.heldAside - 0.6, 0.5));
    scoreRows.forEach((r, i) => show(r, p(t, i ? T.carries - 0.6 : T.memorized - 0.4, 0.5) * (1 - p(t, T.separate + 1.5, 0.5))));
    show(world, p(t, T.cannot - 0.2, 0.6));
    oddG.forEach((o, i) => show(o, p(t, T.cannot + i * 0.3, 0.4)));

    // ---- targets ----
    const tgOn = p(t, T.simpleTask - 0.3, 0.6);
    show(TG, tgOn);
    const tStarts = [T.category - 0.3, T.number - 0.2, T.sequence - 0.2, T.else_ - 0.2];
    targets.forEach(([, gg], i) => { const k = p(t, tStarts[i], 0.5, easeBack); move(gg, 300 + i * 440, 420, k * (1 - 0.3 * p(t, T.later, 0.8))); show(gg, k * (1 - 0.55 * p(t, T.later, 0.8))); });
    show(recipeTx, vis(t, T.recipe - 0.2, T.later + 1));
    const nw = p(t, T.later + 0.5, 0.6);
    const slide = Math.min(2, Math.floor(Math.max(0, t - T.nextWord) / 2.6));
    const winEnd = 4 + slide; // index of target word
    wordG.forEach((w, i) => { show(w.g, nw * p(t, T.later + 0.5 + i * 0.1, 0.3)); set(w.r, { fill: i === winEnd && t > T.nextWord ? '#3a2a08' : '#13283a' }); });
    const wOn = nw * p(t, T.nextWord, 0.5);
    set(winBox, { x: 330 - 82, y: 770, width: (winEnd - 1) * 180 + 164 + 0, height: 100 });
    set(winBox, { x: 330 - 82 + 0, width: (winEnd) * 180 - 16 });
    show(winBox, wOn);
    set(tgtBox, { x: 330 + winEnd * 180 - 82, y: 770, width: 164, height: 100 }); show(tgtBox, wOn);
    set(winTx, { x: 330 + (winEnd - 1) * 90 }); show(winTx, wOn);
    set(tgtTx, { x: 330 + winEnd * 180 }); show(tgtTx, wOn);
    show(noHuman, p(t, T.noHuman, 0.5));
  };
}
