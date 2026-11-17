// Chapter 2 — One artificial neuron, step by step.
import { el, set, show, move, g, txt, rect, card, neuron, dial, draw, pointOn, arrowHead,
  p, pl, vis, lerp, clamp, easeOut, easeBack, mix, grey, fmt, hash, C, MONO, hush } from './engine.js';

const sig = x => 1 / (1 + Math.exp(-x));

export function createChapter2(root, cue) {
  const a = (s, after) => cue.at(s, after);
  const T = {
    swatch: a('one grey color swatch'), screen: a('on a screen'),
    task: a('Our task is simple'), light: a('light or dark'), dark: a('or dark') + 0.2,
    three: a('A computer can describe'), red: a('red, green, and blue'), green: a('green, and blue'), blue: a('and blue') + 0.15,
    range: a('Each usually ranges'), r255: a('two hundred and fifty-five'),
    rescale: a('For easier arithmetic'), between01: a('between zero and one'),
    example: a('So, for example'), v204: a('two hundred and four'), becomes: a('becomes about zero point eight'),
    use: a("Let's use a light grey"), rv: a('red is zero point eight'), gv: a('green is zero point eight'), bv: a('and blue is zero point eight'),
    enter: a('Those three values enter'), neuronW: a('one artificial neuron'),
    notThink: a('The neuron is not thinking'), calc: a('It performs a calculation'),
    mult: a('Each input is multiplied'), weightDef: a('A weight is an adjustable'), strongly: a('how strongly an input'),
    dialW: a('Imagine a small dial'), setOne: a('For this simple demonstration'), toOne: a('weights to one'),
    add: a('Now add the weighted'),
    s1: a('zero point eight, plus', 60), s2: a('plus zero point eight', 60), s3: a('plus zero point eight', a('plus zero point eight', 60) + 0.5),
    gives24: a('That gives two point four'),
    bias: a('Next comes the bias'), biasDef: a('A bias is another'), total: a('added to the total'),
    shift: a('You can think of it as shifting'), lean: a('begins to lean'), other: a('or the other'),
    setBias: a('set the bias to minus'), m15: a('minus one point five'),
    minus: a('Two point four minus'), score09: a('a score of zero point nine'),
    notProb: a('That score is not yet'), act: a('An activation function transforms'), sigm: a('called a sigmoid'),
    noEq: a('You do not need its equation'), gate: a('picture a soft gate'), any: a('turns any score'), z1: a('between zero and one', 100),
    s09: a('A score of zero point nine becomes'), s071: a('about zero point seven one'),
    toy: a('For this toy classifier'), p71: a('seventy-one percent probability'), rem: a('The remaining'), p29: a('twenty-nine percent is dark'),
    onlyEx: a('These numbers are only'), notMeasured: a('not measured results'),
    darkSw: a('Now try a dark grey'), z2: a('about zero point two'),
    same: a('With the same illustrative'), m09: a('minus zero point nine', 135),
    turns: a('The sigmoid turns that'), d29: a('twenty-nine percent light'), d71: a('seventy-one percent dark'),
    so: a('So one neuron takes'), scales: a('scales their influence'), offset: a('adds an offset'), result: a('produces a result'),
    jobs: a('The weights, bias, and activation'), job: a('specific job'),
    easy: a('This is a deliberately easy'), pixel: a('on one pixel'),
    notImg: a('It does not mean'), image: a('understand an image'),
    why: a('To work out why'), several: a('several neurons can be connected'),
  };

  const NX = 1320, NY = 540;            // neuron position (world)
  const MX = 1580, M0 = 640, MU = 92;    // score meter x, zero y, px per unit
  const CX0 = 1990, CX1 = 2510, CY0 = 250, CY1 = 690; // sigmoid chart box
  const rows = [380, 540, 700];
  const chan = [['R', C.R, 'red'], ['G', C.G, 'green'], ['B', C.B, 'blue']];

  const world = g(root);

  // ---------- screen with swatch ----------
  const scr = g(world);
  rect(scr, -150, -125, 300, 230, { r: 16, fill: '#0b1520', stroke: '#45637a', sw: 6 });
  rect(scr, -40, 105, 80, 30, { r: 4, fill: '#2a3e4f', stroke: 'none' });
  rect(scr, -90, 135, 180, 14, { r: 7, fill: '#2a3e4f', stroke: 'none' });
  const sw = rect(scr, -95, -85, 190, 150, { r: 10, fill: grey(0.8), stroke: '#ffffff40', sw: 3 });
  const scrLabel = txt(scr, 0, 200, 'one grey swatch', { size: 30, weight: 600, fill: C.dim });
  // zoomed-in view of the swatch: every pixel is made of red, green and blue light
  const triad = g(scr);
  const triadR = [C.R, C.G, C.B].map((c, i) => rect(triad, -95 + i * 64, -85, 60, 150, { r: 8, fill: c, stroke: 'none', attrs: { opacity: 0.85 } }));
  const beams = [C.R, C.G, C.B].map(c => el('circle', { r: 16, fill: c, filter: 'url(#glow)' }, root));

  // light/dark question
  const task = g(root);
  const binL = g(task), binD = g(task);
  [[binL, 'LIGHT', grey(0.9), '#111'], [binD, 'DARK', '#1b2026', C.ink]].forEach(([b, s, f, tc]) => {
    rect(b, -120, -46, 240, 92, { r: 46, fill: f, stroke: '#ffffff30', sw: 3 });
    txt(b, 0, 3, s, { size: 38, weight: 800, fill: tc });
  });

  // ---------- RGB channel bars ----------
  const BX = 470, BW = 300, BH = 54;
  const bars = chan.map(([L, col], i) => {
    const gg = g(world);
    const y = rows[i];
    txt(gg, BX - 50, y, L, { size: 48, weight: 800, fill: col });
    rect(gg, BX, y - BH / 2, BW, BH, { r: 12, fill: '#13222f', stroke: '#2b4152' });
    const fill = rect(gg, BX, y - BH / 2, 0, BH, { r: 12, fill: col, stroke: 'none', attrs: { opacity: 0.85 } });
    const lo = txt(gg, BX, y + 52, '0', { size: 28, weight: 600, fill: C.dim, mono: true });
    const hi255 = txt(gg, BX + BW, y + 52, '255', { size: 28, weight: 600, fill: C.dim, mono: true });
    const hi1 = txt(gg, BX + BW, y + 52, '1', { size: 28, weight: 700, fill: C.teal, mono: true });
    const val = g(gg);
    rect(val, -62, -34, 124, 68, { r: 14, fill: '#0f2433', stroke: col, sw: 3 });
    const vt = txt(val, 0, 3, '0.8', { size: 38, weight: 800, fill: C.ink, mono: true });
    move(val, BX + BW + 90, y);
    return { g: gg, fill, lo, hi255, hi1, val, vt, y, col };
  });
  // 204 → 0.8 marker on red bar
  const mk = g(world);
  el('line', { x1: 0, y1: -44, x2: 0, y2: 44, stroke: C.amber, 'stroke-width': 5 }, mk);
  const mkTop = txt(mk, 0, -72, '204', { size: 34, weight: 800, fill: C.amber, mono: true });
  const mkBot = txt(mk, 0, 84, '≈ 0.8', { size: 34, weight: 800, fill: C.teal, mono: true });
  const mkMath = txt(world, BX + BW / 2, rows[0] - 160, '204 ÷ 255 ≈ 0.8', { size: 36, weight: 700, fill: C.ink, mono: true });

  // ---------- wires, weights (dials), neuron ----------
  const WX0 = BX + BW + 160, DX = 1010;
  const wires = rows.map((y, i) => el('path', { d: `M ${WX0} ${y} C ${WX0 + 200} ${y} ${NX - 260} ${NY + (y - NY) * 0.35} ${NX - 108} ${NY + (y - NY) * 0.3}`, fill: 'none', stroke: chan[i][1], 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.85 }, world));
  const travel = rows.map((y, i) => { const gg = g(world); el('circle', { r: 16, fill: chan[i][1], filter: 'url(#glow)' }, gg); return gg; });
  const dials = rows.map((y, i) => {
    const gg = g(world);
    rect(gg, -76, -50, 230, 100, { r: 22, fill: '#1a160b', stroke: C.amber, sw: 3 });
    const d = dial(gg, 34);
    const wt = txt(gg, 90, 3, '×1.0', { size: 36, weight: 800, fill: C.amber, mono: true });
    move(gg, DX - 20, lerp(y, NY, 0.12));
    return { g: gg, d, wt };
  });
  const dialHead = txt(world, DX + 20, 250, 'weights', { size: 36, weight: 800, fill: C.amber });
  const multTx = txt(world, DX + 20, 250, 'input × weight', { size: 36, weight: 800, fill: C.amber });
  const prodTx = txt(world, DX + 40, 845, '', { size: 40, weight: 800, fill: C.ink, mono: true });

  const nGroup = g(world);
  const N = neuron(nGroup, 110, { symbol: '' });
  const sigma = txt(nGroup, 0, 4, 'Σ', { size: 96, weight: 800, fill: C.teal });
  // thought bubble (not thinking)
  const thought = g(world);
  [[0, 0, 120, 70], [-120, 90, 22, 22], [-155, 130, 12, 12]].forEach(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx, ry, fill: '#1b2a38', stroke: '#5f7d93', 'stroke-width': 3 }, thought));
  txt(thought, 0, 2, '“Hmm, pretty light…”', { size: 26, weight: 600, fill: C.ink, attrs: { 'font-style': 'italic' } });
  const tCross = g(thought);
  el('line', { x1: -130, y1: -70, x2: 130, y2: 70, stroke: C.red, 'stroke-width': 10, 'stroke-linecap': 'round' }, tCross);
  el('line', { x1: 130, y1: -70, x2: -130, y2: 70, stroke: C.red, 'stroke-width': 10, 'stroke-linecap': 'round' }, tCross);
  move(thought, NX + 30, NY - 250);
  const calcTx = txt(world, NX, NY + 170, 'just arithmetic', { size: 34, weight: 700, fill: C.teal });

  // ---------- bias ----------
  const biasG = g(world);
  const biasWire = el('path', { d: `M ${NX} ${NY + 330} L ${NX} ${NY + 112}`, fill: 'none', stroke: C.violet, 'stroke-width': 7, 'stroke-linecap': 'round' }, biasG);
  const biasChip = g(biasG);
  rect(biasChip, -120, -46, 240, 92, { r: 22, fill: '#22123a', stroke: C.violet, sw: 4 });
  const biasTx = txt(biasChip, 0, 3, 'bias  ?', { size: 38, weight: 800, fill: C.violet, mono: true });
  move(biasChip, NX, NY + 360);
  const biasNote = txt(world, NX, NY + 445, 'not an input — added to the total', { size: 28, weight: 600, fill: C.dim });

  // ---------- score meter ----------
  const meter = g(world);
  el('line', { x1: MX, y1: M0 - 3.4 * MU, x2: MX, y2: M0 + 2.2 * MU, stroke: C.faint, 'stroke-width': 4 }, meter);
  for (let v = -2; v <= 3; v++) {
    el('line', { x1: MX - 14, y1: M0 - v * MU, x2: MX + 14, y2: M0 - v * MU, stroke: C.faint, 'stroke-width': 3 }, meter);
    txt(meter, MX - 50, M0 - v * MU, String(v).replace('-', '−'), { size: 24, weight: 600, fill: C.dim, mono: true });
  }
  const leanUp = txt(meter, MX + 110, M0 - 2.6 * MU, '↑ leans LIGHT', { size: 28, weight: 700, fill: C.light, anchor: 'start' });
  const leanDn = txt(meter, MX + 110, M0 + 1.4 * MU, '↓ leans DARK', { size: 28, weight: 700, fill: C.dim, anchor: 'start' });
  const biasMove = txt(meter, MX - 70, M0 + 2.75 * MU, 'bias moves the whole stack ↕', { size: 28, weight: 800, fill: C.violet, anchor: 'start' });
  const segs = chan.map(([, col]) => rect(meter, MX - 40, M0, 80, 0, { r: 6, fill: col, stroke: '#0008', sw: 2 }));
  const biasSeg = rect(meter, MX - 40, M0, 80, 0, { r: 6, fill: C.violet, stroke: C.violet, sw: 2, attrs: { opacity: 0.55 } });
  const tip = g(meter);
  el('line', { x1: MX - 80, y1: 0, x2: MX + 90, y2: 0, stroke: C.ink, 'stroke-width': 4, 'stroke-dasharray': '10 8' }, tip);
  txt(tip, MX + 100, 0, 'tipping point (0)', { size: 26, weight: 700, fill: C.ink, anchor: 'start' });
  const scoreChip = g(world);
  rect(scoreChip, -90, -40, 180, 80, { r: 18, fill: '#0c2a26', stroke: C.teal, sw: 4 });
  const scoreTx = txt(scoreChip, 0, 3, '2.4', { size: 42, weight: 800, fill: C.teal, mono: true });
  const meterHead = txt(world, MX, 120, 'score', { size: 40, weight: 800, fill: C.teal });
  const notProb = g(world);
  rect(notProb, -170, -40, 340, 80, { r: 18, fill: '#2a0f14', stroke: C.red, sw: 3 });
  txt(notProb, 0, 3, '0.9  ≠  a probability', { size: 32, weight: 800, fill: C.red });
  move(notProb, MX + 40, 860);
  const neuronToMeter = el('path', { d: `M ${NX + 112} ${NY} L ${MX - 60} ${NY}`, fill: 'none', stroke: C.teal, 'stroke-width': 6 }, world);

  // ---------- sigmoid chart ----------
  const chart = g(world);
  rect(chart, CX0 - 60, CY0 - 90, CX1 - CX0 + 120, CY1 - CY0 + 170, { r: 24, fill: '#0b1824', stroke: '#24405a' });
  const chartTitle = txt(chart, (CX0 + CX1) / 2, CY0 - 45, 'activation: sigmoid', { size: 36, weight: 800, fill: C.teal });
  const sx = v => lerp(CX0, CX1, (v + 6) / 12), sy = v => lerp(CY1, CY0, v);
  el('line', { x1: CX0, y1: CY1, x2: CX1, y2: CY1, stroke: C.faint, 'stroke-width': 3 }, chart);
  el('line', { x1: sx(0), y1: CY0 - 10, x2: sx(0), y2: CY1, stroke: C.faint, 'stroke-width': 2, 'stroke-dasharray': '6 8' }, chart);
  el('line', { x1: CX0, y1: sy(1), x2: CX1, y2: sy(1), stroke: C.faint, 'stroke-width': 2, 'stroke-dasharray': '6 8' }, chart);
  txt(chart, CX0 - 28, sy(1), '1', { size: 26, weight: 700, fill: C.dim, mono: true });
  txt(chart, CX0 - 28, sy(0), '0', { size: 26, weight: 700, fill: C.dim, mono: true });
  txt(chart, CX1, CY1 + 40, 'score →', { size: 26, weight: 600, fill: C.dim, anchor: 'end' });
  let dCurve = '';
  for (let i = 0; i <= 120; i++) { const v = -6 + i / 10; dCurve += `${i ? 'L' : 'M'} ${sx(v)} ${sy(sig(v))} `; }
  const curve = el('path', { d: dCurve, fill: 'none', stroke: C.teal, 'stroke-width': 7, 'stroke-linecap': 'round' }, chart);
  const eq = g(chart);
  txt(eq, (CX0 + CX1) / 2, CY0 + 70, '1 / (1 + e^−x)', { size: 40, weight: 700, fill: C.dim, mono: true });
  el('line', { x1: (CX0 + CX1) / 2 - 170, y1: CY0 + 70, x2: (CX0 + CX1) / 2 + 170, y2: CY0 + 70, stroke: C.red, 'stroke-width': 6 }, eq);
  const demo = [-5, -2, 0, 2, 5].map(v => { const gg = g(chart); el('circle', { r: 12, fill: C.cyan }, gg); const tx = txt(gg, 0, 0, '', { size: 22, weight: 700, fill: C.cyan, mono: true }); return { g: gg, v, tx }; });
  const scoreDot = el('circle', { r: 15, fill: C.amber, filter: 'url(#glow)' }, chart);
  const guide = el('path', { d: '', fill: 'none', stroke: C.amber, 'stroke-width': 4, 'stroke-dasharray': '8 8' }, chart);
  const xLab = txt(chart, 0, CY1 + 40, '', { size: 30, weight: 800, fill: C.amber, mono: true });
  const yLab = txt(chart, CX0 + 50, 0, '', { size: 30, weight: 800, fill: C.amber, mono: true });
  const gateArrow = el('path', { d: `M ${MX + 310} ${NY} C ${MX + 360} ${NY} ${CX0 - 160} ${(CY0 + CY1) / 2} ${CX0 - 70} ${(CY0 + CY1) / 2}`, fill: 'none', stroke: C.teal, 'stroke-width': 6 }, world);

  // ---------- probability bar ----------
  const prob = g(world);
  const PX0 = CX0 - 40, PW = CX1 - CX0 + 80, PY = 890;
  const pLight = rect(prob, PX0, PY - 40, PW * 0.71, 80, { r: 14, fill: '#ece7dc', stroke: 'none' });
  const pDark = rect(prob, PX0 + PW * 0.71, PY - 40, PW * 0.29, 80, { r: 14, fill: '#262d36', stroke: '#4a5a68', sw: 2 });
  const pLtx = txt(prob, PX0, PY - 72, 'LIGHT 71%', { size: 36, weight: 800, fill: C.light, anchor: 'start' });
  const pDtx = txt(prob, PX0 + PW, PY - 72, 'DARK 29%', { size: 36, weight: 800, fill: C.dim, anchor: 'end' });
  const exTag = g(world);
  rect(exTag, -330, -34, 660, 68, { r: 34, fill: '#2a210b', stroke: C.amber, sw: 3 });
  txt(exTag, 0, 3, 'Example numbers — not from a real AI model', { size: 28, weight: 700, fill: C.amber });
  move(exTag, (CX0 + CX1) / 2, PY + 95);

  // ---------- recap labels ----------
  const recap = g(world);
  const recapDefs = [
    ['three values', BX + 150, 230, C.cyan], ['weights: how much each counts', DX + 40, 150, C.amber],
    ['bias: shifts the whole score', NX, 1010, C.violet], ['activation: squeezes to 0–1', (CX0 + CX1) / 2, CY0 - 150, C.teal],
  ].map(([s, x, y, f]) => txt(recap, x, y, s, { size: 40, weight: 800, fill: f }));

  // ---------- one pixel vs image; several neurons ----------
  const img = g(root);
  const PIX = 16, PW_ = 24, PH_ = 14;
  const pixels = [];
  for (let yy = 0; yy < PH_; yy++) for (let xx = 0; xx < PW_; xx++) {
    // simple landscape: sky, sun, hills, ground
    const sky = yy < 7, hill = yy >= 7 - Math.round(2 * Math.sin(xx / 4)) && yy < 11;
    const sun = Math.hypot(xx - 18, yy - 3) < 2.2;
    let c = sky ? mix('#6aa8d8', '#bfe0f5', yy / 7) : hill ? mix('#3e8f5a', '#2c6b43', (xx % 5) / 5) : mix('#6b4f2e', '#4a361f', (xx * 7 % 5) / 5);
    if (sun) c = '#f6d36b';
    if (sky && !sun && (xx + yy * 3) % 11 === 0) c = '#d9ecf7';
    pixels.push({ r: rect(img, xx * PIX * 3, yy * PIX * 3, PIX * 3 - 2, PIX * 3 - 2, { r: 3, fill: c, stroke: 'none' }), xx, yy, c });
  }
  const pxHL = rect(img, 0, 0, PIX * 3 + 8, PIX * 3 + 8, { r: 6, fill: 'none', stroke: C.amber, sw: 6 });
  const imgN = neuron(root, 70, { symbol: 'Σ' }); set(imgN.label, { 'font-size': 56 });
  const imgLink = el('path', { d: 'M 1290 560 L 1420 560', fill: 'none', stroke: C.amber, 'stroke-width': 6, 'stroke-dasharray': '12 10' }, root);
  const imgQ = txt(root, 0, 0, '?', { size: 130, weight: 800, fill: C.amber });
  const imgTx = txt(root, 960, 110, '', { size: 52, weight: 800 });
  // 3×3 patch + small network (handoff to Chapter 3)
  const patch = g(root);
  const patchCells = [];
  for (let i = 0; i < 9; i++) patchCells.push(rect(patch, (i % 3) * 92 - 138, Math.floor(i / 3) * 92 - 138, 86, 86, { r: 8, fill: grey(0.8), stroke: '#ffffff30', sw: 2 }));
  const net = g(root);
  const netNodes = [[760, 330], [760, 540], [760, 750], [1180, 400], [1180, 680], [1540, 540]];
  const netEdges = [[0, 3], [0, 4], [1, 3], [1, 4], [2, 3], [2, 4], [3, 5], [4, 5]];
  const netLines = netEdges.map(([i, j]) => el('line', { x1: netNodes[i][0], y1: netNodes[i][1], x2: netNodes[j][0], y2: netNodes[j][1], stroke: C.teal, 'stroke-width': 4, opacity: 0.6 }, net));
  const patchLines = [0, 1, 2].map(i => el('line', { x1: 520, y1: 540, x2: netNodes[i][0], y2: netNodes[i][1], stroke: C.cyan, 'stroke-width': 4, opacity: 0.5 }, net));
  const netN = netNodes.map(([x, y], i) => { const n = neuron(net, i === 5 ? 64 : 54, { symbol: 'Σ' }); set(n.label, { 'font-size': 40 }); move(n.g, x, y); return n; });

  // ---------- update ----------
  // captions that only repeated the narration are removed from the picture
  hush(calcTx, multTx, dialHead, biasNote, biasMove, notProb, exTag, recap, imgTx, scrLabel);
  return function update(t) {
    // camera
    const cams = [
      [0, 960, 1], [T.three + 0.6, 640, 1.3], [T.enter - 1.0, 960, 1], [T.add - 0.6, 1180, 1], [T.notProb - 0.5, 1900, 1], [T.darkSw - 0.8, 1290, 0.74], [T.jobs - 0.3, 1290, 0.74],
    ];
    let cx = 960, cs = 1;
    for (const [ta, x, s] of cams) { const k = p(t, ta, 1.2); cx = lerp(cx, x, k); cs = lerp(cs, s, k); }
    set(world, { transform: `translate(${960 - cx * cs + (1 - 1) * 0} ${540 - 540 * cs}) scale(${cs})` });
    set(world, { transform: `translate(${960} ${540}) scale(${cs}) translate(${-cx} ${-540})` });
    const worldVis = 1 - p(t, T.easy - 0.3, 0.8);
    show(world, worldVis);

    // values (light → dark)
    const dk = p(t, T.darkSw, 1.0);
    const zk = p(t, T.z2, 1.2);
    const inV = lerp(0.8, 0.2, zk);
    // screen + swatch
    const big = 1 - p(t, T.three + 0.6, 1.2);
    const scX = lerp(230, 960, big), scY = lerp(540, 560, big), scS = lerp(1, 2.3, big);
    move(scr, scX, scY, scS);
    const triOn = vis(t, T.three + 0.2, T.range + 0.5, 0.6, 0.6);
    show(triad, triOn);
    triadR.forEach((r, i) => set(r, { opacity: 0.85 * (0.6 + 0.4 * Math.sin(t * 3 + i)) }));
    beams.forEach((bm, i) => {
      const t0 = [T.red, T.green, T.blue][i];
      const k = p(t, t0, 0.9, easeOut);
      const sx = scX + (-63 + i * 64) * scS, sy = scY - 10 * scS;
      // world→screen for the bar position at camera 1 (world == screen before the first pan)
      const wx = lerp(sx, BX + 10, k), wy = lerp(sy, rows[i], k);
      set(bm, { cx: 960 + (wx - cx) * cs, cy: 540 + (wy - 540) * cs, r: 16 * cs });
      show(bm, k > 0 && k < 1 ? 1 : 0);
    });
    show(scr, p(t, T.swatch - 0.2, 0.6));
    set(sw, { fill: grey(lerp(0.8, 0.2, dk)) });
    set(scrLabel, { text: dk > 0.5 ? 'dark grey' : t > T.use ? 'light grey' : 'one grey swatch' });

    // task question
    const taskVis = vis(t, T.task, T.three + 0.2);
    show(task, taskVis);
    move(binL, 760, 170, p(t, T.light, 0.4, easeBack)); show(binL, p(t, T.light, 0.3));
    move(binD, 1160, 170, p(t, T.dark, 0.4, easeBack)); show(binD, p(t, T.dark, 0.3));

    // bars
    const chanT = [T.red, T.green, T.blue];
    const valT = [T.rv, T.gv, T.bv];
    bars.forEach((b, i) => {
      show(b.g, p(t, chanT[i] - 0.1, 0.4) * vis(t, 0, T.easy));
      const shownV = t < valT[i] ? 0 : inV * p(t, valT[i], 0.7);
      set(b.fill, { width: BW * shownV });
      show(b.lo, vis(t, T.range, T.add - 0.6));
      show(b.hi255, vis(t, T.range + (i * 0.15), T.rescale + 1.0));
      show(b.hi1, vis(t, T.between01, T.add - 0.6));
      show(b.val, p(t, valT[i] + 0.2, 0.4, easeBack) * (1 - p(t, T.enter, 0.6)));
      set(b.vt, { text: shownV.toFixed(1) });
    });
    // 204 example on red bar
    const exV = vis(t, T.v204 - 0.2, T.use + 0.2);
    move(mk, BX + BW * 0.8, rows[0]); show(mk, exV);
    show(mkTop, exV); show(mkBot, exV * p(t, T.becomes + 0.4, 0.5));
    show(mkMath, exV * p(t, T.becomes, 0.5));
    if (t < T.use + 0.2 && t > T.v204) set(bars[0].fill, { width: BW * 0.8 * p(t, T.v204, 0.6) });

    // neuron enters
    const nIn = p(t, 0.8, 1.2);
    move(nGroup, lerp(960, NX, nIn), NY);
    show(nGroup, t < T.three ? 1 - p(t, 0.4, 0.8) : p(t, T.enter - 0.8, 0.8));
    set(N.core, { opacity: 0.1 + 0.25 * vis(t, T.add, T.minus + 2) });
    show(sigma, p(t, T.calc, 0.5));
    show(thought, vis(t, T.notThink, T.calc + 0.6));
    move(tCross, 0, 0, p(t, T.notThink + 1.2, 0.3, easeBack)); show(tCross, p(t, T.notThink + 1.2, 0.3));
    show(calcTx, vis(t, T.calc, T.mult));

    // wires
    wires.forEach((w, i) => {
      draw(w, p(t, T.enter + i * 0.2, 0.8));
      const wv = dials[i].__w ?? 1;
    });
    // the three values travel in
    travel.forEach((tr, i) => {
      let k = pl(t, T.enter + 0.2 + i * 0.25, 1.5);
      if (t > T.so) k = pl(t, T.so + 0.5 + i * 0.15, 1.3);
      const pt = pointOn(wires[i], k);
      move(tr, pt.x, pt.y);
      show(tr, k > 0 && k < 1 ? 1 : 0);
    });

    // weights
    const wDemo = pl(t, T.strongly - 0.4, T.dialW - T.strongly + 0.2);
    const demoW = t < T.strongly - 0.4 ? 1 : t < T.dialW ? 1 + Math.sin(wDemo * Math.PI * 2) * 0.9 * (wDemo < 0.5 ? 1 : 1) : 1;
    const preW = t < T.toOne ? [demoW, 0.4, 1.6] : [1, 1, 1];
    dials.forEach((d, i) => {
      const on = i === 0 ? p(t, T.mult, 0.5, easeBack) : p(t, T.dialW + 0.3 + i * 0.3, 0.5, easeBack);
      const off = 1 - p(t, T.jobs + 3, 0.1) * 0;
      move(d.g, DX - 20, lerp(rows[i], NY, 0.12), on);
      show(d.g, on);
      let w = preW[i];
      if (t > T.setOne && t < T.toOne + 0.6) { const k = p(t, T.toOne - 0.2, 0.8); w = lerp(i === 0 ? demoW : preW[i], 1, k); }
      if (t >= T.toOne + 0.6) w = 1;
      const wig = Math.sin(Math.PI * pl(t, T.scales, 1.3));
      if (wig > 0) w = 1 + wig * [0.7, -0.6, 0.5][i];
      d.d.setValue(w, 0, 2);
      set(d.wt, { text: `×${w.toFixed(1)}` });
      set(wires[i], { 'stroke-width': 3 + 6 * w });
    });
    show(multTx, vis(t, T.mult, T.dialW));
    show(dialHead, vis(t, T.dialW, T.add));
    const pv = vis(t, T.weightDef, T.dialW, 0.3, 0.3);
    const dw = Math.round(demoW * 10) / 10;
    set(prodTx, { text: `0.8 × ${dw.toFixed(1)} = ${(0.8 * dw).toFixed(2)}` });
    show(prodTx, pv);

    // sum stack in the meter
    const meterVis = p(t, T.add - 0.3, 0.6);
    show(meter, meterVis); show(meterHead, meterVis); show(neuronToMeter, meterVis);
    const segT = [T.s1, T.s2 + 0.3, T.s3 + 0.3];
    let top = 0;
    const products = [inV, inV, inV];
    // bias = how far the whole stack is shifted. Demo: it swings up and down, then settles at −1.5.
    let biasV = 0;
    if (t >= T.shift && t < T.setBias) biasV = Math.sin(pl(t, T.shift + 0.3, T.setBias - T.shift - 0.6) * Math.PI * 2) * 2.0;
    if (t >= T.setBias) biasV = -1.5 * p(t, T.m15, 0.9);
    const shiftDown = -biasV;
    segs.forEach((s, i) => {
      const k = p(t, segT[i], 0.6, easeOut);
      const h = products[i] * k;
      const y0 = M0 - (top - shiftDown) * MU;
      set(s, { y: y0 - h * MU, height: Math.max(0, h * MU) });
      top += h;
    });
    // bias ghost: the part of the stack pushed below where it used to be (shows "2.4 − 1.5")
    const ghostOn = Math.max(vis(t, T.minus - 0.2, T.notProb + 0.5, 0.4, 0.5), vis(t, T.offset - 0.1, T.result, 0.3, 0.3));
    set(biasSeg, { y: M0 - top * MU, height: Math.max(0, shiftDown) * MU * ghostOn });
    move(tip, 0, M0);
    show(tip, p(t, T.bias + 1.0, 0.5));
    show(leanUp, p(t, T.lean, 0.4)); show(leanDn, p(t, T.lean, 0.4));
    const sc0 = top - shiftDown;
    set(leanUp, { 'font-size': sc0 > 0 && t > T.lean ? 34 : 28, fill: sc0 > 0 ? C.light : C.faint });
    set(leanDn, { 'font-size': sc0 <= 0 && t > T.lean ? 34 : 28, fill: sc0 <= 0 ? C.ink : C.faint });
    show(biasMove, vis(t, T.shift, T.minus + 0.5));
    const score = top - shiftDown;
    move(scoreChip, MX + 210, M0 - Math.max(score, -1.5) * MU - 0, 1);
    show(scoreChip, p(t, T.gives24, 0.4) * (t > T.notProb + 0.2 ? 1 : 1));
    set(scoreTx, { text: fmt(score) });
    show(notProb, vis(t, T.notProb, T.act + 0.4));

    // bias chip
    show(biasG, p(t, T.bias, 0.6));
    draw(biasWire, p(t, T.bias + 0.2, 0.6));
    set(biasTx, { text: t < T.shift ? 'bias  ?' : `bias ${biasV >= 0 ? '+' : '−'}${Math.abs(biasV).toFixed(1)}` });
    const bpulse = Math.sin(Math.PI * pl(t, T.offset, 1.1));
    move(biasChip, NX, NY + 360, 1 + 0.15 * bpulse);
    show(biasNote, vis(t, T.total - 0.4, T.shift + 1));

    // activation chart
    const chV = p(t, T.act, 0.6);
    show(chart, chV); show(gateArrow, chV);
    const chipY = M0 - Math.max(score, -1.5) * MU;
    set(gateArrow, { d: `M ${MX + 300} ${chipY} L ${CX0 - 60} ${chipY}` });
    draw(curve, p(t, T.sigm, 1.2));
    show(eq, vis(t, T.noEq - 0.1, T.gate, 0.3, 0.4));
    demo.forEach((d, i) => {
      const k = pl(t, T.any + i * 0.25, 1.2);
      const y = k < 0.5 ? lerp(CY1 + 10, sy(sig(d.v)), easeOut(k * 2)) : sy(sig(d.v));
      const x = k < 0.5 ? sx(d.v) : lerp(sx(d.v), CX0, easeOut((k - 0.5) * 2));
      move(d.g, x, y);
      set(d.tx, { text: sig(d.v).toFixed(2), x: k > 0.9 ? -50 : 0, y: k > 0.9 ? 0 : -30 });
      show(d.g, vis(t, T.any + i * 0.25, T.s09, 0.2, 0.4));
    });
    // score dot on curve
    const sdOn = p(t, T.s09, 0.5);
    const sv = score;
    const climb = Math.max(p(t, T.s09 + 0.3, 1.0), t > T.darkSw ? 1 : 0);
    const across = Math.max(p(t, T.s071 - 0.2, 0.9), t > T.darkSw ? 1 : 0);
    const dotY = lerp(CY1, sy(sig(sv)), climb);
    const dotX = lerp(sx(sv), CX0, across * 0);
    set(scoreDot, { cx: dotX, cy: dotY });
    show(scoreDot, sdOn);
    set(guide, { d: `M ${sx(sv)} ${CY1} L ${sx(sv)} ${dotY} ${across > 0 ? `L ${lerp(sx(sv), CX0, across)} ${dotY}` : ''}` });
    show(guide, sdOn);
    set(xLab, { x: sx(sv), text: fmt(sv) }); show(xLab, sdOn);
    set(yLab, { y: sy(sig(sv)) - 26, text: sig(sv).toFixed(2) }); show(yLab, across);

    // probability bar
    const pr = sig(sv);
    show(prob, p(t, T.p71 - 0.4, 0.5));
    const lk = t < T.darkSw ? p(t, T.p71 - 0.4, 0.8) : t > T.result - 0.1 && t < T.jobs ? p(t, T.result - 0.1, 0.9) : 1;
    set(pLight, { width: PW * pr * lk });
    set(pDark, { x: PX0 + PW * pr * lk, width: PW * (1 - pr * lk) });
    show(pDark, t < T.darkSw ? p(t, T.p29 - 0.2, 0.5) : 1);
    show(pDtx, t < T.darkSw ? p(t, T.p29 - 0.2, 0.5) : 1);
    set(pLtx, { text: `LIGHT ${Math.round(pr * 100)}%` });
    set(pDtx, { text: `DARK ${Math.round((1 - pr) * 100)}%` });
    show(exTag, vis(t, T.onlyEx, T.darkSw + 1));

    // recap
    const rk = [T.so + 0.6, T.scales, T.offset, T.result];
    recapDefs.forEach((r, i) => show(r, vis(t, rk[i], T.easy - 0.4)));
    const glow = (a0, a1) => vis(t, a0, a1, 0.2, 0.3);
    set(N.halo, { opacity: 0.08 + 0.3 * glow(T.result, T.jobs) });

    // ---------- image / several neurons ----------
    const imV = vis(t, T.easy - 0.2, T.why + 0.4, 0.6, 0.6);
    show(img, imV);
    const zoom = 1 - p(t, T.pixel - 0.3, 1.2);
    // start zoomed on one pixel (it IS our swatch), then pull back to reveal the image
    const s = lerp(1, 7, zoom);
    const px = 16, py = 9; // highlighted pixel (grey-ish cloud pixel)
    set(pixels[py * PW_ + px].r, { fill: grey(0.8) });
    const imgW = PW_ * PIX * 3, imgH = PH_ * PIX * 3;
    const focusX = lerp(imgW / 2, px * PIX * 3 + PIX * 1.5, zoom), focusY = lerp(imgH / 2, py * PIX * 3 + PIX * 1.5, zoom);
    const shift = p(t, T.notImg - 0.3, 0.8);
    set(img, { transform: `translate(${lerp(960, 760, shift)} ${560}) scale(${s * lerp(1, 0.85, shift)}) translate(${-focusX} ${-focusY})` });
    set(pxHL, { x: px * PIX * 3 - 5, y: py * PIX * 3 - 5 });
    set(imgTx, { text: t < T.notImg ? 'Easy task: one pixel' : 'One neuron ≠ understanding an image' });
    show(imgTx, vis(t, T.easy, T.why));
    move(imgN.g, 1500, 560, 1); show(imgN.g, vis(t, T.notImg, T.why + 0.4));
    show(imgLink, vis(t, T.notImg, T.why + 0.4));
    move(imgQ, 1500, 400); show(imgQ, vis(t, T.image, T.why + 0.4));
    // several neurons connected, fed by a 3×3 patch
    const nv = p(t, T.why + 0.2, 0.8);
    show(patch, nv); move(patch, 330, 540);
    show(net, nv);
    netN.forEach((n, i) => { const k = p(t, T.several - 0.4 + i * 0.12, 0.5, easeBack); move(n.g, netNodes[i][0], netNodes[i][1], k); });
    netLines.forEach((l, i) => set(l, { opacity: 0.6 * p(t, T.several + 0.4 + i * 0.06, 0.4) }));
    patchLines.forEach((l, i) => set(l, { opacity: 0.5 * p(t, T.several + 0.2, 0.4) }));
  };
}
