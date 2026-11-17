// Chapter 5 — Another way to train: evolution, mutation and selection.
import { el, set, show, move, g, txt, rect, neuron, dial, draw, pointOn, person,
  p, pl, vis, lerp, clamp, easeOut, easeBack, mix, grey, hash, C, hush } from './engine.js';

// ---------------- deterministic Snake simulation ----------------
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
function simulate(N, seed, skill, maxSteps = 40) {
  let body = [[3, Math.floor(N / 2)], [2, Math.floor(N / 2)], [1, Math.floor(N / 2)]];
  let dir = 0, apples = 0, crashed = false, k = 0;
  const foodAt = n => { for (let tries = 0; tries < 50; tries++) { const f = [Math.floor(hash(seed * 13 + n * 7 + tries) * N), Math.floor(hash(seed * 29 + n * 11 + tries + 3) * N)]; if (!body.some(b => b[0] === f[0] && b[1] === f[1])) return f; } return [0, 0]; };
  let food = foodAt(0);
  const states = [{ body: body.map(b => [...b]), food: [...food], crashed, apples, dir, scores: [0, 0, 0], act: 0 }];
  for (let s = 0; s < maxSteps && !crashed; s++) {
    const opts = [0, 3, 1].map((turn, a) => {             // straight, left, right
      const nd = (dir + turn) % 4, h = [body[0][0] + DIRS[nd][0], body[0][1] + DIRS[nd][1]];
      const safe = h[0] >= 0 && h[1] >= 0 && h[0] < N && h[1] < N && !body.slice(0, -1).some(b => b[0] === h[0] && b[1] === h[1]);
      const dist = Math.abs(h[0] - food[0]) + Math.abs(h[1] - food[1]);
      const sc = skill * ((safe ? 2 : -3) - dist * 0.35) + (1 - skill) * (hash(seed * 101 + s * 3 + a) - 0.5) * 6 + (a === 0 ? 0.4 : 0);
      return { nd, h, safe, sc };
    });
    let best = 0; opts.forEach((o, i) => { if (o.sc > opts[best].sc) best = i; });
    const o = opts[best];
    dir = o.nd;
    if (!o.safe) { crashed = true; }
    else {
      body.unshift(o.h);
      if (o.h[0] === food[0] && o.h[1] === food[1]) { apples++; k++; food = foodAt(k); } else body.pop();
    }
    const raw = opts.map(q => q.sc), mn = Math.min(...raw), mx = Math.max(...raw);
    states.push({ body: body.map(b => [...b]), food: [...food], crashed, apples, dir, scores: raw.map(v => (v - mn) / (mx - mn || 1)), act: best });
  }
  return states;
}

function board(parent, N, cell) {
  const gg = g(parent);
  const S = N * cell;
  rect(gg, -S / 2 - 6, -S / 2 - 6, S + 12, S + 12, { r: 10, fill: '#0a141e', stroke: '#35546b', sw: 3 });
  for (let i = 1; i < N; i++) {
    el('line', { x1: -S / 2 + i * cell, y1: -S / 2, x2: -S / 2 + i * cell, y2: S / 2, stroke: '#16283a', 'stroke-width': 1 }, gg);
    el('line', { x1: -S / 2, y1: -S / 2 + i * cell, x2: S / 2, y2: -S / 2 + i * cell, stroke: '#16283a', 'stroke-width': 1 }, gg);
  }
  const food = el('circle', { r: cell * 0.36, fill: C.red }, gg);
  const segs = Array.from({ length: 30 }, (_, i) => rect(gg, 0, 0, cell - 3, cell - 3, { r: cell * 0.2, fill: i ? C.green : '#bbf7d0', stroke: 'none' }));
  const x = el('path', { d: `M ${-S * 0.3} ${-S * 0.3} L ${S * 0.3} ${S * 0.3} M ${S * 0.3} ${-S * 0.3} L ${-S * 0.3} ${S * 0.3}`, stroke: C.red, 'stroke-width': Math.max(5, cell * 0.4), 'stroke-linecap': 'round', fill: 'none' }, gg);
  return {
    g: gg,
    render(st) {
      set(food, { cx: -S / 2 + (st.food[0] + 0.5) * cell, cy: -S / 2 + (st.food[1] + 0.5) * cell });
      segs.forEach((r, i) => {
        const b = st.body[i];
        if (!b) return show(r, 0);
        show(r, 1);
        set(r, { x: -S / 2 + b[0] * cell + 1.5, y: -S / 2 + b[1] * cell + 1.5, fill: st.crashed && i === 0 ? C.red : i ? C.green : '#bbf7d0' });
      });
      show(x, st.crashed ? 0.9 : 0);
    },
  };
}
const stateAt = (states, t, t0, rate) => states[Math.min(states.length - 1, Math.max(0, Math.floor((t - t0) * rate)))];

// ---------------- simple shapes ----------------
function moth(parent, shade, s = 1) {
  const gg = g(parent);
  const c = grey(shade), c2 = grey(clamp(shade - 0.12));
  el('path', { d: 'M 0 -4 C -18 -30 -52 -26 -50 -2 C -48 14 -24 18 0 6 Z', fill: c, stroke: c2, 'stroke-width': 2 }, gg);
  el('path', { d: 'M 0 -4 C 18 -30 52 -26 50 -2 C 48 14 24 18 0 6 Z', fill: c, stroke: c2, 'stroke-width': 2 }, gg);
  el('path', { d: 'M 0 4 C -14 10 -30 26 -20 32 C -10 34 -4 20 0 10 Z M 0 4 C 14 10 30 26 20 32 C 10 34 4 20 0 10 Z', fill: c2 }, gg);
  [[-30, -10], [-20, 4], [30, -10], [20, 4], [-38, -2], [38, -2]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.6, fill: grey(clamp(shade > 0.5 ? shade - 0.45 : shade + 0.12)) }, gg));
  el('ellipse', { cx: 0, cy: 6, rx: 5, ry: 18, fill: grey(clamp(shade - 0.25)) }, gg);
  if (s !== 1) set(gg, { transform: `scale(${s})` });
  return gg;
}
function bird(parent, color = '#cbd5e1') {
  const gg = g(parent);
  el('path', { d: 'M -60 0 C -40 -10 -20 -8 0 0 C 20 -30 50 -40 70 -36 C 52 -24 40 -8 30 4 C 50 6 64 12 80 24 C 50 24 20 18 0 10 C -20 14 -40 10 -60 0 Z', fill: color }, gg);
  el('path', { d: 'M -60 0 L -80 -4 L -62 6 Z', fill: C.amber }, gg);
  el('circle', { cx: -48, cy: -2, r: 3, fill: '#0b1520' }, gg);
  return gg;
}
function dino(parent, color) {
  const gg = g(parent);
  el('path', { d: 'M -150 40 C -120 30 -100 -10 -60 -20 C -40 -26 -20 -24 0 -16 C 20 -60 50 -110 70 -120 C 90 -126 110 -118 112 -108 C 100 -104 86 -100 80 -90 C 66 -60 50 -20 46 0 C 60 10 70 30 70 60 L 56 60 L 50 24 L 20 30 L 18 60 L 4 60 L 0 26 C -40 30 -90 50 -150 40 Z', fill: color }, gg);
  return gg;
}
function miniNet(parent, seed, color = C.teal) {
  const gg = g(parent);
  const P = [[-40, -26], [-40, 0], [-40, 26], [0, -18], [0, 18], [40, -20], [40, 0], [40, 20]];
  [[0, 3], [1, 3], [1, 4], [2, 4], [0, 4], [3, 5], [3, 6], [4, 6], [4, 7], [3, 7]].forEach(([a, b], i) => el('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], stroke: color, 'stroke-width': 1 + hash(seed * 9 + i) * 4, opacity: 0.8 }, gg));
  P.forEach(q => el('circle', { cx: q[0], cy: q[1], r: 7, fill: '#0c1f2a', stroke: color, 'stroke-width': 3 }, gg));
  return gg;
}
const cross = (parent, s = 60, w = 10) => { const gg = g(parent); el('path', { d: `M ${-s} ${-s} L ${s} ${s} M ${s} ${-s} L ${-s} ${s}`, stroke: C.red, 'stroke-width': w, 'stroke-linecap': 'round' }, gg); return gg; };
function chip(parent, text, color, w = 300) {
  const gg = g(parent);
  rect(gg, -w / 2, -36, w, 72, { r: 36, fill: mix('#0b1520', color, 0.15), stroke: color, sw: 3 });
  const tx = txt(gg, 0, 3, text, { size: 30, weight: 800, fill: color });
  return { g: gg, tx };
}

export function createChapter5(root, cue) {
  const a = (s, after) => cue.at(s, after);
  const T = {
    seen: a('We have just seen'), give: a('give it examples'), measure: a('measure how far'), grads: a('use gradients'),
    notAvail: a('But labelled answers'), game: a('In a game'), howWell: a('measure how well'), writeDown: a('write down the correct move'), everyBoard: a('every possible board'),
    imagine: a('Imagine trying many'), keeping: a('keeping more copies'), small: a('making small random'), tryAgain: a('before trying again'),
    twoIdeas: a('This gives us two'), selection: a('selection, which favors'), mutation: a('and mutation, which'),
    inspired: a('This approach was inspired'), bio: a('biological evolution'), toUnderstand: a('To understand the analogy'), living: a('living populations'),
    pop: a('In a population'), notAlike: a('not all exactly alike'), inherited: a('Some differences can be'),
    consider: a('Consider the peppered'), before: a('Before industrial pollution'), pale: a('pale with lichen'), lightHard: a('light-colored moths were'),
    darkExist: a('Dark moths also existed'), easier: a('easier to see'),
    onAvg: a('On average, more light'), remained: a('the light form remained'),
    soot: a('As industrial soot'), advantage: a('the advantage changed'),
    darkNow: a('Dark moths were now'), survived: a('They survived and reproduced'), overGen: a('more common over generations'),
    pollFell: a('When pollution later fell'), shifted: a('the advantage shifted back'),
    didNot: a('The moths did not change'), knew: a('because they knew'),
    mutCreate: a('Mutations create variations'), withoutKnow: a('without knowing'),
    env: a('The environment affects'), offspring: a('likely to leave offspring'),
    natSel: a('Natural selection changes'), notTransform: a('it does not transform'), lifetime: a('during its lifetime'),
    severe: a('Sometimes an environment'), lineage: a('a lineage disappears'),
    around: a('Around sixty-six'), asteroid: a('the asteroid impact'), extinction: a('extinction of all'), birds: a('while birds survived'), dinoLin: a('as a dinosaur lineage'),
    noPromise: a('Evolution has no promise'), chance: a('Chance and the speed'),
    algo: a('An algorithm can use'), notRepro: a('It does not reproduce'), keeps: a('It keeps a population'), evaluates: a('evaluates how well'), usesScore: a('uses that score'), nextGen: a('contribute to the next generation'),
    family: a('This family of methods'), neuroevo: a('called neuroevolution'),
    snake: a("Let's use a small Snake"), receives: a('Each network receives'), food: a('where the food is'), danger: a('where danger is'), moving: a('which way the snake'),
    produces: a('It produces scores'), straight: a('going straight'), left: a('turning left'), right: a('or turning right'), follows: a('The game follows'),
    start: a('Start with many networks'), most: a('Most may quickly'), few: a('A few may survive'), byChance: a('by chance'),
    afterEach: a('After each game'), fitness: a('a fitness score'), apples: a('eating apples can raise'), crashing: a('crashing can lower'),
    whole: a('The game supplies a score'), noLabel: a('the trainer does not need'),
    select: a('Select several of the'), copy: a('Copy their settings'), change: a('randomly change a few'), isMut: a('That random change is'),
    structure: a('Some algorithms can also'), connection: a('adding a connection'), aNeuron: a('or a neuron'),
    noKnow: a('Mutations do not know'), help: a('a change can help'), nothing: a('do nothing'), worse: a('make the next snake worse'),
    again: a('Now let the new group'), scoreThem: a('Score them'), repeat: a('and repeat'),
    genDef: a('A generation means'), several: a('If we evaluate each'), lucky: a('a lucky one-game'),
    overGens: a('Over generations, changes'), part: a('That is the part'),
    designer: a('The game designer still'), better: a('what better means'),
    poorly: a('A poorly chosen score'), trick: a('an unwanted trick'), notGeneral: a('success in Snake'),
    diff: a('Neuroevolution is different'), supCmp: a('Supervised learning compares'), neCmp: a('Neuroevolution compares whole'),
    some: a('Some methods evolve only'), others: a('others can also evolve'), oneWay: a('It is one way'), llm: a('or LLM is trained'),
    seenNow: a("We've now seen how"), color: a('from classifying a color'), learnGame: a('to learning a game'),
    modern: a('But modern language'), withText: a('With a text prompt'), explain: a('explain an idea'), compare: a('compare options'), write: a('write a message'), plan: a('lay out a plan'),
    howCan: a('How can one model'), inside: a('What is happening inside'), limits: a('where are the limits'),
    next: a("We'll explore that next"), like: a('If this video helped'), subscribe: a('and subscribe'),
  };

  const title = txt(root, 960, 100, '', { size: 50, weight: 800 });

  // ====== S1: recap & when labels are missing ======
  const S1 = g(root);
  const recap = [['examples + supplied answers', C.amber], ['measure the mismatch', C.red], ['gradients adjust weights', C.teal]].map(([s, c], i) => {
    const gg = g(S1);
    rect(gg, -250, -150, 500, 300, { r: 26, fill: '#0f1d2a', stroke: '#2e4a60' });
    txt(gg, 0, 110, s, { size: 30, weight: 800, fill: c });
    move(gg, 380 + i * 580, 470);
    return gg;
  });
  // icons that act out each step
  const SW = [['#d4d4d4', 'LIGHT'], ['#1e3a8a', 'DARK'], ['#fde68a', 'LIGHT'], ['#111111', 'DARK'], ['#fbcfe8', 'LIGHT'], ['#14532d', 'DARK'], ['#fafaf9', 'LIGHT'], ['#4b5563', 'DARK']];
  const r0 = recap[0];
  const rcSw = rect(r0, -170, -80, 110, 110, { r: 14, fill: '#d4d4d4', stroke: '#ffffff40', sw: 2 });
  el('path', { d: 'M -40 -25 L 20 -25', stroke: C.dim, 'stroke-width': 5 }, r0);
  const rcPill = rect(r0, 30, -60, 150, 70, { r: 35, fill: '#ece7dc', stroke: '#ffffff50', sw: 2 });
  const rcLab = txt(r0, 105, -24, 'LIGHT', { size: 30, weight: 800, fill: '#111' });
  const r1 = recap[1];
  rect(r1, -180, -60, 360, 50, { r: 12, fill: '#132433', stroke: 'none' });
  const rcGap = rect(r1, -180, -60, 360, 50, { r: 12, fill: C.red, stroke: 'none', attrs: { opacity: 0.4 } });
  const rcPred = rect(r1, -180, -60, 70, 50, { r: 12, fill: '#ece7dc', stroke: 'none' });
  el('line', { x1: 180, y1: -72, x2: 180, y2: 2, stroke: C.amber, 'stroke-width': 4, 'stroke-dasharray': '6 5' }, r1);
  const rcPct = txt(r1, 0, 30, '', { size: 34, weight: 800, fill: C.ink, mono: true });
  const rcOk = el('rect', { x: -250, y: -150, width: 500, height: 300, rx: 26, fill: 'none', stroke: C.green, 'stroke-width': 6 }, r1);
  const rcTick = txt(r1, 215, -115, '✓', { size: 56, weight: 800, fill: C.green });
  const r2 = recap[2];
  const rcDial = dial(r2, 50); move(rcDial.g, -40, -30);
  const rcSpin = txt(r2, 60, -30, '↻', { size: 70, weight: 800, fill: C.amber });
  const noAns = g(S1);
  rect(noAns, -230, -60, 460, 120, { r: 22, fill: '#0f1d2a', stroke: C.red, sw: 3 });
  rect(noAns, -205, -40, 80, 80, { r: 12, fill: '#6b7280', stroke: 'none' });
  txt(noAns, 70, 3, 'answer: ???', { size: 40, weight: 800, fill: C.red });
  move(noAns, 960, 820);
  // game: score is easy, correct move for every board is not
  const S1b = g(root);
  const camB = g(S1b);
  // a 5×3 wall of boards; the playing board sits in the centre cell
  const QPOS = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) if (!(r === 1 && c === 2)) QPOS.push([960 + (c - 2) * 330, 540 + (r - 1) * 300]);
  const boardsQ = QPOS.map(([x, y], i) => {
    const gg = g(camB);
    rect(gg, -125, -125, 250, 250, { r: 20, fill: '#0f1d2a', stroke: '#2e4a60', sw: 3 });
    const b = board(gg, 6, 30); b.render(simulate(6, 50 + i, 0.5, 6)[1 + Math.floor(hash(i) * 4)]);
    const q = txt(gg, 0, 4, '?', { size: 110, weight: 800, fill: C.amber, attrs: { opacity: 0.9 } });
    move(gg, x, y);
    return { g: gg, q, d: Math.hypot(x - 960, (y - 540) * 1.2) };
  });
  const qLabel = txt(S1b, 485, 920, '', { size: 1 });
  const scoreCard = g(camB);
  rect(scoreCard, -260, -220, 520, 440, { r: 30, fill: '#0f1d2a', stroke: C.green, sw: 4 });
  const bigBoard = board(scoreCard, 8, 34); move(bigBoard.g, 0, -40);
  const bigStates = simulate(8, 7, 0.9, 40);
  const scoreTx = txt(scoreCard, 0, 180, '', { size: 44, weight: 800, fill: C.green, mono: true });
  const scoreTick = txt(scoreCard, 215, -180, '✓', { size: 60, weight: 800, fill: C.green });
  move(scoreCard, 960, 540, 0.56);
  const easyLabel = txt(S1b, 1450, 920, 'how well did it do? easy to score ✓', { size: 34, weight: 800, fill: C.green });

  // ====== S2: many candidates, keep better, random changes ======
  const S2 = g(root);
  const cands = Array.from({ length: 8 }, (_, i) => {
    const gg = g(S2);
    const bg = rect(gg, -110, -90, 220, 180, { r: 20, fill: '#0f1d2a', stroke: '#2e4a60' });
    miniNet(gg, i + 1);
    const sc = Math.round(10 + hash(i + 33) * 85);
    const bar = rect(gg, -80, 55, 160 * sc / 100, 14, { r: 7, fill: C.green, stroke: 'none' });
    return { g: gg, bg, sc, bar };
  });
  // next generation: copies of the best (more copies for better scores), slightly changed
  const parentOf = [0, 0, 0, 1, 1, 2, 2, 0];
  const genKids = parentOf.map((pi, i) => {
    const gg = g(S2);
    const bg = rect(gg, -110, -90, 220, 180, { r: 20, fill: '#0f1d2a', stroke: C.amber });
    const net = miniNet(gg, 900 + i);
    const spark = el('circle', { cx: 20 - (i % 3) * 18, cy: -10 + (i % 2) * 22, r: 12, fill: 'none', stroke: C.amber, 'stroke-width': 4 }, gg);
    const bar = rect(gg, -80, 55, 0, 14, { r: 7, fill: C.green, stroke: 'none' });
    return { g: gg, bg, net, spark, bar, pi, sc: 0 };
  });
  const copyArrows = genKids.map(() => el('path', { d: '', fill: 'none', stroke: C.green, 'stroke-width': 3, 'stroke-dasharray': '6 8', opacity: 0.7 }, S2));
  const genA = txt(S2, 90, 300, 'gen 1', { size: 28, weight: 800, fill: C.dim, mono: true, anchor: 'start' });
  const genB = txt(S2, 90, 680, 'gen 2', { size: 28, weight: 800, fill: C.dim, mono: true, anchor: 'start' });
  // the two ideas as pictures
  const funnel = g(S2);
  el('path', { d: 'M -170 -150 L 170 -150 L 40 30 L 40 120 L -40 120 L -40 30 Z', fill: '#0f2a1f', stroke: C.green, 'stroke-width': 5 }, funnel);
  const fDots = Array.from({ length: 10 }, (_, i) => el('circle', { r: 13, fill: i < 3 ? C.green : '#64748b' }, funnel));
  const selFunnel = chip(funnel, 'SELECTION: favour better scores', C.green, 560); move(selFunnel.g, 0, 210);
  const mutG = g(S2);
  rect(mutG, -170, -130, 340, 260, { r: 24, fill: '#0f1d2a', stroke: C.amber, sw: 4 });
  const mNet = miniNet(mutG, 77); set(mNet, { transform: 'scale(2.6)' });
  const mLink = el('line', { x1: 0, y1: -47, x2: 104, y2: 0, stroke: C.amber, 'stroke-width': 9, 'stroke-linecap': 'round' }, mutG);
  const mDie = g(mutG); rect(mDie, -32, -32, 64, 64, { r: 12, fill: C.amber, stroke: 'none' }); [[-13, -13], [13, 13], [0, 0], [13, -13], [-13, 13]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 6, fill: '#0b1520' }, mDie)); move(mDie, 150, -120);
  const mutChip = chip(mutG, 'MUTATION: random changes', C.amber, 520); move(mutChip.g, 0, 210);
  // 3D double helix, projected each frame (rotates about its long axis, tilted toward the viewer)
  const dna = g(S2);
  const NB = 26, HR = 120, HSTEP = 26;
  const backA = el('path', { d: '', fill: 'none', stroke: C.teal, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.85 }, dna);
  const backB = el('path', { d: '', fill: 'none', stroke: C.violet, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.85 }, dna);
  const rungs = Array.from({ length: NB }, () => el('line', { stroke: '#94a3b8', 'stroke-width': 5, 'stroke-linecap': 'round' }, dna));
  const beadsA = Array.from({ length: NB }, () => el('circle', { r: 10, fill: C.teal }, dna));
  const beadsB = Array.from({ length: NB }, () => el('circle', { r: 10, fill: C.violet }, dna));
  const proj = (x, y, z) => { const tilt = 0.35; const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt); const f = 900 / (900 - z2); return [x * f, y2 * f, z2]; };
  const drawDNA = t => {
    const spin = t * 1.4;
    let dA = '', dB = '';
    for (let i = 0; i < NB; i++) {
      const y = (i - (NB - 1) / 2) * HSTEP, th = i * 0.5 + spin;
      const [ax, ay, az] = proj(HR * Math.cos(th), y, HR * Math.sin(th));
      const [bx, by, bz] = proj(HR * Math.cos(th + Math.PI), y, HR * Math.sin(th + Math.PI));
      dA += `${i ? 'L' : 'M'} ${ax} ${ay} `; dB += `${i ? 'L' : 'M'} ${bx} ${by} `;
      const da = (az + HR) / (2 * HR), db = (bz + HR) / (2 * HR);
      set(beadsA[i], { cx: ax, cy: ay, r: 6 + 7 * da, opacity: 0.35 + 0.65 * da });
      set(beadsB[i], { cx: bx, cy: by, r: 6 + 7 * db, opacity: 0.35 + 0.65 * db });
      set(rungs[i], { x1: ax, y1: ay, x2: bx, y2: by, opacity: 0.25 + 0.5 * (1 - Math.abs(Math.cos(th))) });
    }
    set(backA, { d: dA }); set(backB, { d: dB });
  };
  const bioTx = txt(S2, 960, 900, 'inspired in part by biological evolution', { size: 38, weight: 800, fill: C.violet });

  // ====== S3: moths ======
  const S3 = g(root);
  const popMoths = Array.from({ length: 12 }, (_, i) => { const sh = 0.15 + hash(i + 3) * 0.75; const m = moth(S3, sh); return { m, sh }; });
  const inherit = g(S3);
  const parentM = moth(inherit, 0.3, 1.6); move(parentM, 0, -120);
  const kidLines = [0, 1, 2].map(i => el('path', { d: `M 0 -85 C 0 0 ${-200 + i * 200} 0 ${-200 + i * 200} 100`, fill: 'none', stroke: '#94a3b8', 'stroke-width': 4, 'stroke-linecap': 'round' }, inherit));
  const kidDots = [0, 1, 2].map(() => el('circle', { r: 9, fill: '#cbd5e1', filter: 'url(#glow)' }, inherit));
  kidLines.forEach(l => inherit.insertBefore(l, parentM));
  const kids = [0.28, 0.33, 0.25].map((sh, i) => { const m = moth(inherit, sh, 1.2); return m; });
  // tree trunk scene
  const tree = g(S3);
  const bark = rect(tree, 560, 160, 800, 760, { r: 40, fill: '#cfc8b4', stroke: 'none' });
  const lichens = Array.from({ length: 22 }, (_, i) => el('ellipse', { cx: 600 + hash(i) * 720, cy: 200 + hash(i + 9) * 680, rx: 30 + hash(i + 2) * 40, ry: 14 + hash(i + 5) * 18, fill: '#a7b59a', opacity: 0.7 }, tree));
  const barkLines = Array.from({ length: 9 }, (_, i) => el('path', { d: `M ${620 + i * 85} 170 C ${600 + i * 85} 400 ${650 + i * 85} 600 ${610 + i * 85} 910`, stroke: '#8f8676', 'stroke-width': 4, fill: 'none', opacity: 0.6 }, tree));
  const treeMoths = Array.from({ length: 10 }, (_, i) => ({ x: 650 + (i % 5) * 150 + hash(i) * 40, y: 280 + Math.floor(i / 5) * 330 + hash(i + 4) * 120, i }));
  treeMoths.forEach(m => { m.light = moth(tree, 0.82); m.dark = moth(tree, 0.14); move(m.light, m.x, m.y, 1, (hash(m.i) - 0.5) * 40); move(m.dark, m.x, m.y, 1, (hash(m.i) - 0.5) * 40); });
  const target = el('circle', { r: 70, fill: 'none', stroke: C.red, 'stroke-width': 6, 'stroke-dasharray': '12 8' }, tree);
  const birdG = bird(tree, '#e2e8f0');
  const smoke = g(tree);
  rect(smoke, 120, 600, 160, 320, { r: 6, fill: '#3f3f46', stroke: 'none' });
  rect(smoke, 160, 440, 50, 170, { r: 4, fill: '#52525b', stroke: 'none' });
  const puffs = Array.from({ length: 6 }, (_, i) => el('circle', { r: 40 + i * 12, fill: '#27272a', opacity: 0.8 }, smoke));
  // population bar
  const popBar = g(S3);
  txt(popBar, 1420, 300, 'population', { size: 32, weight: 800, fill: C.ink, anchor: 'start' });
  const genTx = txt(popBar, 1420, 345, '', { size: 28, weight: 700, fill: C.dim, anchor: 'start', mono: true });
  rect(popBar, 1420, 380, 80, 480, { r: 14, fill: '#1c2530', stroke: '#4b5563' });
  const lightFill = rect(popBar, 1420, 380, 80, 240, { r: 14, fill: '#e7e2d3', stroke: 'none' });
  const pctL = txt(popBar, 1530, 420, '', { size: 30, weight: 800, fill: C.light, anchor: 'start', mono: true });
  const pctD = txt(popBar, 1530, 820, '', { size: 30, weight: 800, fill: C.dim, anchor: 'start', mono: true });
  txt(popBar, 1530, 460, 'light', { size: 26, weight: 600, fill: C.light, anchor: 'start' });
  txt(popBar, 1530, 780, 'dark', { size: 26, weight: 600, fill: C.dim, anchor: 'start' });
  // "did not change because they knew"
  const knowG = g(S3);
  const kMoth = moth(knowG, 0.8, 2.2);
  const kBubble = g(knowG);
  [[180, -160, 260, 70], [60, -70, 18, 18]].forEach(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx, ry, fill: '#1b2a38', stroke: '#5f7d93', 'stroke-width': 3 }, kBubble));
  txt(kBubble, 180, -158, '“Trees got dark — I’ll turn dark!”', { size: 28, weight: 700, fill: C.ink, attrs: { 'font-style': 'italic' } });
  const kX = cross(knowG, 90, 12); move(kX, 180, -160);
  // random variation (dice) + environment filter
  const varG = g(S3);
  const die = g(varG);
  rect(die, -50, -50, 100, 100, { r: 18, fill: C.ink, stroke: 'none' });
  [[-22, -22], [22, 22], [0, 0], [22, -22], [-22, 22]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 9, fill: '#0b1520' }, die));
  move(die, 300, 480);
  const envStrip = rect(varG, 560, 640, 1240, 220, { r: 24, fill: '#2f2a24', stroke: 'none' });
  const offs = Array.from({ length: 8 }, (_, i) => { const sh = hash(i + 70) * 0.85 + 0.08; const m = moth(varG, sh, 0.9); return { m, sh, x: 620 + i * 150 }; });
  const envTx = txt(varG, 1180, 900, 'dark bark: dark moths more likely to survive and leave offspring', { size: 30, weight: 700, fill: C.dim });
  // generations rows + one individual's lifetime
  const genG = g(S3);
  const genRows = [0, 1, 2].map(r => { const gg = g(genG); rect(gg, -60, -60, 1120, 120, { r: 20, fill: '#7d8b96', stroke: 'none' }); txt(gg, -80, 0, `gen ${r + 1}`, { size: 30, weight: 800, fill: C.dim, mono: true, anchor: 'end' }); const ms = Array.from({ length: 10 }, (_, i) => { const darkShare = [0.2, 0.5, 0.8][r]; const isDark = hash(i * 3 + r * 17) < darkShare; const m = moth(gg, isDark ? 0.15 : 0.82, 0.8); move(m, i * 110, 0); return m; }); move(gg, 380, 330 + r * 200); return gg; });
  const lifeG = g(genG);
  rect(lifeG, -120, -90, 240, 180, { r: 20, fill: 'none', stroke: C.amber, sw: 4 });
  const lifeTx = txt(lifeG, 0, 120, 'one moth: same colour all its life', { size: 26, weight: 800, fill: C.amber });
  move(lifeG, 1690, 530);
  const lifeMoth = moth(lifeG, 0.82, 1.1);

  // ====== S4: extinction ======
  const S4 = g(root);
  // a prehistoric landscape: sky, distant hills, ferns, ground
  const sky = rect(S4, 0, 0, 1920, 1080, { r: 0, fill: '#14324a', stroke: 'none' });
  const skyGlow = el('ellipse', { cx: 1380, cy: 760, rx: 900, ry: 420, fill: '#fb923c', opacity: 0, filter: 'url(#glowBig)' }, S4);
  const hills = el('path', { d: 'M 0 760 C 200 640 380 690 560 650 C 760 600 900 700 1080 660 C 1260 620 1420 690 1600 640 C 1760 600 1860 660 1920 650 L 1920 780 L 0 780 Z', fill: '#16302a' }, S4);
  const ferns = [160, 640, 1000, 1560, 1780].map((x, i) => { const gg = g(S4); for (let k = -3; k <= 3; k++) el('path', { d: `M 0 0 Q ${k * 18} -60 ${k * 34} -${110 - Math.abs(k) * 12}`, fill: 'none', stroke: '#2f6b45', 'stroke-width': 7, 'stroke-linecap': 'round' }, gg); move(gg, x, 790, 0.9 + hash(i) * 0.5); return gg; });
  const ground = rect(S4, 0, 760, 1920, 320, { r: 0, fill: '#1c2b1f', stroke: 'none' });
  const dinos = [[420, 700, '#4d7c5f', 1], [820, 720, '#5b6b4a', 0.8], [1180, 700, '#6b5a3e', 1.1]].map(([x, y, c, s]) => { const d = dino(S4, c); move(d, x, y + 30, s * 1.5); return { d, c, x, y, s }; });
  // asteroid: glowing core with a tapered fiery tail
  const rock = g(S4);
  const tg = el('linearGradient', { id: 'tailGrad', x1: '0', y1: '0', x2: '1', y2: '0' }, rock);
  el('stop', { offset: '0%', 'stop-color': '#fde68a', 'stop-opacity': 0.95 }, tg); el('stop', { offset: '35%', 'stop-color': '#fb923c', 'stop-opacity': 0.7 }, tg); el('stop', { offset: '100%', 'stop-color': '#7c2d12', 'stop-opacity': 0 }, tg);
  const tail = g(rock, { transform: 'rotate(-150)' });
  el('path', { d: 'M 0 -38 C 160 -30 380 -10 560 0 C 380 10 160 30 0 38 Z', fill: 'url(#tailGrad)', filter: 'url(#glow)' }, tail);
  el('circle', { r: 46, fill: '#fde68a', opacity: 0.35, filter: 'url(#glowBig)' }, rock);
  el('circle', { r: 30, fill: '#7c2d12', stroke: '#fed7aa', 'stroke-width': 5 }, rock);
  const sparks = Array.from({ length: 14 }, () => el('circle', { r: 4, fill: '#fdba74' }, S4));
  // impact: flash, shockwave, rising dust cloud, falling ash
  const IX = 1380, IY = 770;
  const shock = el('ellipse', { cx: IX, cy: IY, rx: 0, ry: 0, fill: 'none', stroke: '#fde68a', 'stroke-width': 14, filter: 'url(#glow)' }, S4);
  const fireball = el('ellipse', { cx: IX, cy: IY, rx: 0, ry: 0, fill: '#fb923c', filter: 'url(#glowBig)' }, S4);
  const dust = Array.from({ length: 22 }, (_, i) => ({ el: el('circle', { r: 0, fill: mix('#3f3a36', '#6b4a33', hash(i + 5)), filter: 'url(#glow)' }, S4), a: -Math.PI * (0.1 + 0.8 * hash(i)), sp: 0.5 + hash(i + 9), r0: 40 + hash(i + 3) * 60 }));
  const ash = Array.from({ length: 70 }, (_, i) => ({ el: el('circle', { r: 2 + hash(i + 40) * 3, fill: '#9ca3af' }, S4), x: hash(i + 11) * 1920, v: 40 + hash(i + 21) * 70, ph: hash(i + 31) * 1080 }));
  const birdS = bird(S4, '#e2e8f0');
  const lineageArc = el('path', { d: '', fill: 'none', stroke: C.teal, 'stroke-width': 8, filter: 'url(#glow)', 'stroke-dasharray': '4 12', 'stroke-linecap': 'round' }, S4);
  // a long reign, abruptly cut: a time bar across the ground
  const reign = g(S4);
  el('rect', { x: 140, y: 870, width: 1640, height: 22, rx: 11, fill: '#132433' }, reign);
  const reignFill = el('rect', { x: 140, y: 870, width: 0, height: 22, rx: 11, fill: '#4d7c5f' }, reign);
  const reignCut = el('path', { d: 'M 1700 845 L 1716 880 L 1696 888 L 1712 920', fill: 'none', stroke: C.red, 'stroke-width': 7, 'stroke-linecap': 'round' }, reign);
  const flash = el('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: '#fef3c7', opacity: 0 }, S4);
  const mya = txt(S4, 960, 210, '≈ 66 million years ago', { size: 48, weight: 800, fill: C.amber });
  // lineage tree
  const linG = g(S4);
  const linPaths = [
    ['M 960 980 L 960 820', C.dim], ['M 960 820 C 960 700 700 700 640 560', '#6b7280'], ['M 960 820 C 960 700 1220 700 1280 560', C.teal], ['M 640 560 L 640 470', '#6b7280'],
  ].map(([d, c]) => el('path', { d, stroke: c, 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }, linG));
  const linEnd = cross(linG, 26, 8); move(linEnd, 640, 450);
  const linTx1 = txt(linG, 640, 400, 'lineage ends', { size: 32, weight: 800, fill: C.red });
  const linTx2 = txt(linG, 1280, 520, 'continues', { size: 32, weight: 800, fill: C.teal });
  const noProm = g(S4);
  const np1 = chip(noProm, 'best-suited ≠ guaranteed survival', C.amber, 620); move(np1.g, 960, 860);
  const np2 = chip(noProm, 'chance', C.violet, 220); move(np2.g, 780, 960);
  const np3 = chip(noProm, 'speed of change', C.violet, 320); move(np3.g, 1100, 960);
  const dieS = g(S4); rect(dieS, -36, -36, 72, 72, { r: 12, fill: C.ink, stroke: 'none' }); [[-15, -15], [15, 15], [0, 0], [15, -15], [-15, 15]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 6, fill: '#0b1520' }, dieS));
  const clock = g(S4); el('circle', { r: 40, fill: 'none', stroke: C.violet, 'stroke-width': 6 }, clock); const hand = el('line', { x1: 0, y1: 0, x2: 0, y2: -30, stroke: C.violet, 'stroke-width': 6, 'stroke-linecap': 'round' }, clock);

  // ====== S5: algorithm population ======
  const S5 = g(root);
  const algoMoths = Array.from({ length: 10 }, (_, i) => moth(S5, 0.15 + hash(i + 3) * 0.75, 1.2));
  const algoNets = Array.from({ length: 10 }, (_, i) => { const gg = g(S5); rect(gg, -90, -80, 180, 160, { r: 18, fill: '#0f1d2a', stroke: '#2e4a60' }); miniNet(gg, i + 20); const sc = Math.round(5 + hash(i + 90) * 90); const bar = rect(gg, -70, 52, 140 * sc / 100, 12, { r: 6, fill: C.green, stroke: 'none' }); return { g: gg, sc, bar }; });
  const notOrg = g(S5); moth(notOrg, 0.5, 1.4); move(cross(notOrg, 60, 10), 0, 0);
  const notOrgTx = txt(notOrg, 0, 110, 'not living organisms', { size: 30, weight: 800, fill: C.red });
  const nextGenArrow = el('path', { d: 'M 1500 540 L 1720 540', stroke: C.green, 'stroke-width': 8, fill: 'none' }, S5);
  const nextGenTx = txt(S5, 1610, 490, 'next generation', { size: 30, weight: 800, fill: C.green });
  const nextGenNets = [0, 1, 2].map(i => { const gg = miniNet(S5, 40 + i); move(gg, 1800, 380 + i * 160); return gg; });

  // ====== S6: Snake + network ======
  const S6 = g(root);
  const snkBoard = board(S6, 10, 56); move(snkBoard.g, 470, 560);
  const snkStates = simulate(10, 3, 0.95, 60);
  const inG = g(S6);
  const inDefs = [['food', C.red], ['danger', C.amber], ['heading', C.green]];
  const inNodes = inDefs.map(([s, c], i) => { const gg = g(inG); rect(gg, -110, -40, 220, 80, { r: 20, fill: mix('#0b1520', c, 0.15), stroke: c, sw: 3 }); const tx = txt(gg, 0, 3, s, { size: 32, weight: 800, fill: c }); move(gg, 1000, 380 + i * 160); return { g: gg, tx }; });
  const hidN = [0, 1, 2, 3].map(i => { const n = neuron(S6, 34, { symbol: '' }); move(n.g, 1260, 330 + i * 120); return n; });
  const outDefs = ['straight', 'left', 'right'];
  const outBars = outDefs.map((s, i) => { const gg = g(S6); txt(gg, 0, -30, s, { size: 30, weight: 800, fill: C.ink, anchor: 'start' }); rect(gg, 0, -8, 300, 36, { r: 10, fill: '#132433', stroke: 'none' }); const f = rect(gg, 0, -8, 0, 36, { r: 10, fill: C.cyan, stroke: 'none' }); move(gg, 1460, 380 + i * 160); return { g: gg, f }; });
  const s6Links = g(S6); S6.insertBefore(s6Links, S6.firstChild);
  inNodes.forEach((_, i) => hidN.forEach((__, j) => el('line', { x1: 1110, y1: 380 + i * 160, x2: 1226, y2: 330 + j * 120, stroke: C.teal, 'stroke-width': 2, opacity: 0.5 }, s6Links)));
  hidN.forEach((_, j) => outDefs.forEach((__, i) => el('line', { x1: 1294, y1: 330 + j * 120, x2: 1450, y2: 386 + i * 160, stroke: C.teal, 'stroke-width': 2, opacity: 0.5 }, s6Links)));
  const boardToNet = el('path', { d: 'M 780 560 L 880 560', stroke: C.dim, 'stroke-width': 6, fill: 'none' }, S6);
  const chosen = txt(S6, 1610, 880, '', { size: 34, weight: 800, fill: C.cyan });

  // ====== S7: many networks play; fitness ======
  const S7 = g(root);
  const players = Array.from({ length: 12 }, (_, i) => {
    const skill = [0.05, 0.1, 0.9, 0.15, 0.05, 0.2, 0.1, 0.85, 0.15, 0.05, 0.6, 0.1][i];
    const st = simulate(7, 100 + i, skill, 30);
    const gg = g(S7);
    rect(gg, -150, -130, 300, 260, { r: 20, fill: '#0f1d2a', stroke: '#2e4a60' });
    const b = board(gg, 7, 26); move(b.g, -40, -10);
    miniNet(gg, i + 60);
    const net = gg.lastChild; set(net, { transform: 'translate(100 -60) scale(0.6)' });
    const fit = txt(gg, 100, 40, '', { size: 34, weight: 800, fill: C.green, mono: true });
    const last = st[st.length - 1];
    const fitness = last.apples * 10 + (st.length - 1) - (last.crashed ? 5 : 0);
    return { g: gg, b, st, fit, fitness, x: 250 + (i % 6) * 284, y: 360 + Math.floor(i / 6) * 300 };
  });
  const rank = [...players].sort((p1, p2) => p2.fitness - p1.fitness);
  const fitLegend = g(S7);
  const fl1 = chip(fitLegend, 'apple eaten: +10', C.green, 280); move(fl1.g, 760, 960);
  const fl2 = chip(fitLegend, 'crash: −5', C.red, 240); move(fl2.g, 1080, 960);
  const wholeTx = txt(S7, 960, 960, '', { size: 34, weight: 800, fill: C.ink });

  // ====== S8: select, copy, mutate ======
  const S8 = g(root);
  const parentNet = g(S8); rect(parentNet, -200, -150, 400, 300, { r: 26, fill: '#0f1d2a', stroke: C.green, sw: 4 });
  const pn = miniNet(parentNet, 3); set(pn, { transform: 'scale(2.6)' });
  txt(parentNet, 0, -185, 'high-scoring parent', { size: 32, weight: 800, fill: C.green });
  move(parentNet, 480, 520);
  const childNet = g(S8); rect(childNet, -200, -150, 400, 300, { r: 26, fill: '#0f1d2a', stroke: C.amber, sw: 4 });
  const cn = miniNet(childNet, 3); set(cn, { transform: 'scale(2.6)' });
  const mutMarks = [[-52, -34], [52, 26], [0, 50]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 22, fill: 'none', stroke: C.amber, 'stroke-width': 6 }, childNet));
  const newConn = el('path', { d: 'M -104 -68 C -40 -120 60 -100 104 -52', stroke: C.amber, 'stroke-width': 6, fill: 'none', 'stroke-dasharray': '10 8' }, childNet);
  const newNeuron = el('circle', { cx: 52, cy: 90, r: 18, fill: '#2a210b', stroke: C.amber, 'stroke-width': 5 }, childNet);
  const childTx = txt(childNet, 0, -185, 'copy + small random changes', { size: 32, weight: 800, fill: C.amber });
  move(childNet, 1440, 520);
  const copyArrow = el('path', { d: 'M 700 520 L 1220 520', stroke: C.ink, 'stroke-width': 8, fill: 'none' }, S8);
  const copyTx = txt(S8, 960, 480, 'copy settings', { size: 32, weight: 800, fill: C.ink });
  const mutDie = g(S8); rect(mutDie, -40, -40, 80, 80, { r: 14, fill: C.amber, stroke: 'none' }); [[-16, -16], [16, 16], [0, 0]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 7, fill: '#0b1520' }, mutDie)); move(mutDie, 960, 600);
  const outcomes = [['helps', '↑', C.green], ['does nothing', '=', C.dim], ['worse', '↓', C.red]].map(([s, ic, c], i) => { const gg = chip(S8, `${ic}  ${s}`, c, 300); move(gg.g, 560 + i * 400, 920); return gg; });

  // ====== S9: generation loop ======
  const S9 = g(root);
  const loopSteps = ['PLAY', 'SCORE', 'SELECT', 'COPY + MUTATE'];
  const loopCol = [C.cyan, C.green, C.green, C.amber];
  const LCX = 660, LCY = 570, LR = 330;
  el('circle', { cx: LCX, cy: LCY, r: LR, fill: 'none', stroke: C.faint, 'stroke-width': 6, 'stroke-dasharray': '4 14' }, S9);
  const lsG = loopSteps.map((s, i) => { const ang = -Math.PI / 2 + i * Math.PI / 2; const c = chip(S9, s, loopCol[i], s.length > 6 ? 320 : 200); move(c.g, LCX + Math.cos(ang) * LR, LCY + Math.sin(ang) * LR); return c; });
  const genCount = txt(S9, LCX, LCY - 20, '', { size: 46, weight: 800, fill: C.ink, mono: true });
  const genSub = txt(S9, LCX, LCY + 40, 'one generation = one full round', { size: 28, weight: 700, fill: C.dim });
  const luckyG = g(S9);
  txt(luckyG, 0, -250, 'same network, 3 different boards', { size: 32, weight: 800, fill: C.ink });
  const luckyBoards = [0, 1, 2].map(i => { const b = board(luckyG, 6, 30); move(b.g, -260 + i * 260, -60); const st = simulate(6, 300 + i, i === 0 ? 0.95 : 0.05, 20); return { b, st }; });
  const luckyScores = ['31', '2', '3'].map((s, i) => txt(luckyG, -260 + i * 260, 100, s, { size: 44, weight: 800, fill: i ? C.red : C.green, mono: true }));
  const luckyAvg = txt(luckyG, 0, 190, 'average ≈ 12 → the first game was just luck', { size: 32, weight: 800, fill: C.amber });
  move(luckyG, 1400, 560);

  // ====== S10: progress, designer, trick ======
  const S10 = g(root);
  const chart = g(S10);
  rect(chart, 140, 230, 760, 560, { r: 26, fill: '#0b1824', stroke: '#24405a' });
  txt(chart, 520, 280, 'best score per generation', { size: 32, weight: 800, fill: C.green });
  el('line', { x1: 200, y1: 730, x2: 860, y2: 730, stroke: C.faint, 'stroke-width': 3 }, chart);
  el('line', { x1: 200, y1: 730, x2: 200, y2: 320, stroke: C.faint, 'stroke-width': 3 }, chart);
  let dc = '';
  for (let i = 0; i <= 40; i++) { const x = 200 + i * 16; const y = 730 - (380 * (1 - Math.exp(-i / 12)) + (hash(i + 5) - 0.5) * 50 * Math.exp(-i / 30)); dc += `${i ? 'L' : 'M'} ${x} ${y} `; }
  const progCurve = el('path', { d: dc, stroke: C.green, 'stroke-width': 6, fill: 'none' }, chart);
  const designer = g(S10);
  person(designer, 1.6, '#cbd5e1');
  move(designer, 1080, 470);
  const fitFormula = g(S10);
  rect(fitFormula, -330, -60, 660, 120, { r: 24, fill: '#0f1d2a', stroke: C.violet, sw: 4 });
  const ffTx = txt(fitFormula, 0, 4, '', { size: 36, weight: 800, fill: C.violet, mono: true });
  move(fitFormula, 1460, 470);
  const designTx = txt(S10, 1300, 330, 'a person decides what “better” means', { size: 34, weight: 800, fill: C.violet });
  const trickG = g(S10);
  const trickBoard = board(trickG, 8, 40); move(trickBoard.g, 0, 0);
  const trickTx = txt(trickG, 0, 230, 'circles forever, never eats — “survived” the longest', { size: 30, weight: 800, fill: C.red });
  move(trickG, 1400, 680);
  const notGenG = g(S10);
  const ng = chip(notGenG, 'good at Snake ≠ general intelligence', C.amber, 700); move(ng.g, 960, 990);

  // ====== S11: comparison ======
  const S11 = g(root);
  const colDefs = [['Supervised learning', C.cyan, ['each input + a supplied answer', 'measure the mismatch', 'gradients adjust weights']], ['Neuroevolution', C.green, ['whole candidates play the task', 'one score per candidate', 'selection + mutation']]];
  const cols = colDefs.map(([h, c, rows], i) => {
    const gg = g(S11);
    rect(gg, -420, -330, 840, 660, { r: 30, fill: '#0f1d2a', stroke: c, sw: 4 });
    txt(gg, 0, -270, h, { size: 46, weight: 800, fill: c });
    const rs = rows.map((r, k) => {
      const rg = g(gg);
      txt(rg, -250, 0, r, { size: 32, weight: 700, fill: C.ink, anchor: 'start' });
      const ic = g(rg); move(ic, -320, 0);
      if (i === 0 && k === 0) { rect(ic, -40, -22, 36, 44, { r: 6, fill: '#d4d4d4', stroke: 'none' }); rect(ic, 6, -16, 52, 32, { r: 16, fill: '#ece7dc', stroke: 'none' }); }
      if (i === 0 && k === 1) { rect(ic, -45, -12, 100, 24, { r: 8, fill: '#132433', stroke: 'none' }); rect(ic, -45, -12, 24, 24, { r: 8, fill: '#ece7dc', stroke: 'none' }); ic.__gap = rect(ic, -21, -12, 76, 24, { r: 8, fill: C.red, stroke: 'none', attrs: { opacity: 0.6 } }); }
      if (i === 0 && k === 2) { ic.__dial = dial(ic, 24); }
      if (i === 1 && k === 0) { [0, 1, 2].forEach(q => { const b = board(ic, 4, 11); move(b.g, -38 + q * 38, 0); b.render(simulate(4, 70 + q, 0.6, 3)[2]); }); }
      if (i === 1 && k === 1) { [0.3, 0.9, 0.5].forEach((v, q) => rect(ic, -45 + q * 34, 22 - 44 * v, 24, 44 * v, { r: 4, fill: C.green, stroke: 'none' })); }
      if (i === 1 && k === 2) { ic.__die = g(ic); rect(ic.__die, -22, -22, 44, 44, { r: 8, fill: C.amber, stroke: 'none' }); [[-9, -9], [9, 9], [0, 0]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4, fill: '#0b1520' }, ic.__die)); }
      rg.__ic = ic;
      move(rg, 0, -150 + k * 120);
      return rg;
    });
    move(gg, 500 + i * 920, 520);
    return { g: gg, rs };
  });
  const evoWhat = g(S11);
  const ew1 = chip(evoWhat, 'evolve weights only', C.green, 380); move(ew1.g, -220, 0);
  const ew2 = chip(evoWhat, '…or connections & structure', C.green, 480); move(ew2.g, 240, 0);
  move(evoWhat, 1420, 960);
  const oneWay = txt(S11, 500, 960, 'one way to train — not how every LLM is trained', { size: 32, weight: 800, fill: C.amber });

  // ====== S12: outro ======
  const S12 = g(root);
  const journey = g(S12);
  const jSw = rect(journey, -90, -90, 180, 180, { r: 20, fill: '#d4d4d4', stroke: 'none' }); move(jSw, 0, 0);
  const jArrow = el('path', { d: 'M 120 0 L 520 0', stroke: C.dim, 'stroke-width': 8, fill: 'none' }, journey);
  const jBoard = board(journey, 6, 34); move(jBoard.g, 660, 0); jBoard.render(simulate(6, 9, 0.9, 10)[8]);
  const jL1 = txt(journey, 0, 140, 'classify a colour', { size: 32, weight: 800, fill: C.ink });
  const jL2 = txt(journey, 660, 160, 'learn a game', { size: 32, weight: 800, fill: C.ink });
  move(journey, 630, 480);
  const chat = g(S12);
  rect(chat, -520, -330, 1040, 660, { r: 32, fill: '#0d1a26', stroke: '#2b4559', sw: 3 });
  rect(chat, -470, 200, 940, 84, { r: 42, fill: '#0a141e', stroke: '#2f4a5e' });
  txt(chat, -430, 244, 'Ask anything…', { size: 30, weight: 500, fill: C.dim, anchor: 'start' });
  const reqs = [['Explain an idea', C.cyan], ['Compare options', C.green], ['Write a message', C.amber], ['Lay out a plan', C.violet]].map(([s, c], i) => { const ch = chip(chat, s, c, 400); move(ch.g, i % 2 ? 230 : -230, -170 + Math.floor(i / 2) * 130); return ch; });
  const llmCore = neuron(chat, 64, { symbol: '?' }); set(llmCore.label, { 'font-size': 60, fill: C.amber }); move(llmCore.g, 0, 90);
  move(chat, 960, 540);
  // one model, many requests → what is inside? → where are the limits?
  const orbit = g(S12);
  const limitRing = el('circle', { cx: 0, cy: 0, r: 330, fill: 'none', stroke: C.amber, 'stroke-width': 5, 'stroke-dasharray': '18 14' }, orbit);
  const spokes = g(orbit);
  const reqNames = [['Explain an idea', C.cyan], ['Compare options', C.green], ['Write a message', C.amber], ['Lay out a plan', C.violet], ['Summarize', C.cyan], ['Translate', C.green], ['Answer a question', C.amber], ['Write code', C.violet], ['Plan a trip', C.cyan], ['Brainstorm', C.green]];
  const orbitChips = reqNames.map(([s, c], i) => { const line = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: c, 'stroke-width': 3, opacity: 0.6 }, spokes); const ch = chip(orbit, s, c, Math.max(220, s.length * 17 + 60)); return { ...ch, line, ang: -Math.PI / 2 + i * (Math.PI * 2 / reqNames.length), outside: i === 7 || i === 2 || i === 9 }; });
  const core = g(orbit);
  el('circle', { r: 150, fill: '#0c1f2a', stroke: C.teal, 'stroke-width': 6 }, core);
  const coreHalo = el('circle', { r: 190, fill: C.teal, opacity: 0.08 }, core);
  const inner = g(core);
  const IN = [[-90, -60], [-90, 0], [-90, 60], [-25, -80], [-25, -27], [-25, 27], [-25, 80], [40, -55], [40, 0], [40, 55], [100, 0]];
  const innerLinks = [];
  [[0, 3], [0, 4], [1, 4], [1, 5], [2, 5], [2, 6], [3, 7], [4, 7], [4, 8], [5, 8], [5, 9], [6, 9], [7, 10], [8, 10], [9, 10]].forEach(([a1, b1]) => innerLinks.push(el('line', { x1: IN[a1][0], y1: IN[a1][1], x2: IN[b1][0], y2: IN[b1][1], stroke: C.teal, 'stroke-width': 2.5, opacity: 0.6 }, inner)));
  const innerNodes = IN.map(([x, y]) => el('circle', { cx: x, cy: y, r: 11, fill: '#0c1f2a', stroke: C.teal, 'stroke-width': 3 }, inner));
  const coreQ = txt(core, 0, 6, '?', { size: 120, weight: 800, fill: C.amber });
  const thinkTags = [['understand?', -270, -210], ['reason?', 280, -150], ['plan?', 250, 220]].map(([s, x, y]) => { const ch = chip(orbit, s, C.violet, 240); move(ch.g, x, y); return ch; });
  move(orbit, 960, 560);
  const qs = ['How can one model handle so many requests?', 'What happens inside when it seems to understand, reason, plan?', 'Where are the limits?'].map((s, i) => txt(S12, 960, 135, s, { size: 44, weight: 800, fill: [C.ink, C.ink, C.amber][i] }));
  const nextG = g(S12);
  const nx = chip(nextG, 'NEXT: inside a language model', C.teal, 640); move(nx.g, 960, 820);
  const likeB = g(nextG);
  const likeBg = rect(likeB, -130, -40, 260, 80, { r: 40, fill: '#0f2433', stroke: C.cyan, sw: 4 });
  el('path', { d: 'M -78 14 L -78 -8 L -64 -8 L -52 -32 C -46 -36 -38 -32 -40 -24 L -44 -10 L -24 -10 C -16 -10 -12 -4 -14 2 L -20 18 C -22 22 -26 24 -30 24 L -78 24 Z', fill: C.cyan }, likeB);
  const likeTx = txt(likeB, 30, 3, 'Like', { size: 32, weight: 800, fill: C.cyan });
  move(likeB, 800, 950);
  const subBg_ = g(nextG);
  const subBg = rect(subBg_, -150, -40, 300, 80, { r: 40, fill: '#c81e1e', stroke: 'none' });
  const subTx = txt(subBg_, 0, 3, 'SUBSCRIBE', { size: 32, weight: 800, fill: '#fff' });
  move(subBg_, 1120, 950);
  const tapDot = el('circle', { r: 26, fill: '#ffffff', opacity: 0 }, nextG);

  // captions that only repeated the narration are removed from the picture
  hush(title, qLabel, easyLabel, bioTx, envTx, np1.g, notOrgTx, wholeTx, genSub, designTx, ng.g, oneWay, qs);
  return function update(t) {
    // ---------- title ----------
    const titles = [
      [0, 'One way to train: supplied answers'], [T.notAvail, 'But labelled answers are not always available'], [T.game, 'A game: scoring is easier than labelling'],
      [T.imagine, 'Try many candidates, keep the better ones'], [T.twoIdeas, 'Two ideas'], [T.toUnderstand, 'Natural selection in living populations'],
      [T.consider, 'The peppered moth in Britain'], [T.didNot, 'No moth chose to change'], [T.mutCreate, 'Random variation, filtered by the environment'], [T.natSel, 'Proportions change across generations'],
      [T.severe, 'Sometimes a lineage disappears'], [T.algo, 'An algorithm borrows the pattern'], [T.neuroevo - 0.3, 'Neuroevolution'], [T.snake, 'One network plays Snake'],
      [T.start, 'Many different networks play'], [T.afterEach, 'Fitness: one score for the whole game'], [T.select, 'Select · copy · mutate'], [T.noKnow, 'Mutation is blind'],
      [T.again, 'Repeat, generation after generation'], [T.overGens, 'Better scores get copied more often'], [T.designer, 'Who defines “better”?'], [T.diff, 'Two ways to train'],
      [T.seenNow, 'What we have seen'], [T.modern, 'Language models seem to go much further'], [T.howCan, ''],
    ];
    let tt = ''; for (const [ts, s] of titles) if (t >= ts - 0.3) tt = s;
    set(title, { text: tt });
    show(title, 1);

    // ---------- S1 ----------
    const s1 = vis(t, 0, T.game - 0.2, 0.01, 0.5);
    show(S1, s1);
    recap.forEach((r, i) => show(r, p(t, [T.seen + 0.3, T.measure, T.grads][i] - 0.2, 0.5) * (1 - 0.6 * p(t, T.notAvail, 0.5))));
    // 1. examples: the swatch keeps changing and its label flips LIGHT / DARK
    const ex = SW[Math.max(0, Math.floor((t - T.give) / 0.55)) % SW.length];
    const exPop = t > T.give ? 1 + 0.08 * Math.sin(Math.PI * (((t - T.give) / 0.55) % 1)) : 1;
    set(rcSw, { fill: t < T.give ? '#d4d4d4' : ex[0], transform: `translate(-115 -25) scale(${exPop}) translate(115 25)` });
    const isL = t < T.give || ex[1] === 'LIGHT';
    set(rcPill, { fill: isL ? '#ece7dc' : '#1f262e' }); set(rcLab, { text: isL ? 'LIGHT' : 'DARK', fill: isL ? '#111' : C.ink });
    // 2. mismatch: the prediction bar goes up and down, then settles at 80 %
    const mA = T.measure, mB = cue.at('and use gradients') - 0.4;
    const mk = clamp((t - mA) / (mB - mA));
    const wob = 0.2 + 0.6 * mk + Math.sin((t - mA) * 5.2) * 0.22 * (1 - mk) + Math.sin((t - mA) * 2.3) * 0.12 * (1 - mk);
    const pr = t < mA ? 0.2 : clamp(wob, 0.05, 0.95);
    set(rcPred, { width: 360 * pr });
    set(rcPct, { text: t < mA ? '' : `${Math.round(pr * 100)}%` });
    const done = p(t, mB, 0.4, easeBack);
    show(rcOk, p(t, mB, 0.4)); show(rcTick, p(t, mB, 0.3)); set(rcTick, { transform: `translate(215 -115) scale(${done}) translate(-215 115)` });
    // 3. gradients adjust weights: the dial keeps turning
    const g0 = cue.at('and use gradients');
    const gSpin = t > g0 ? (t - g0) * 220 : 0;
    set(rcDial.needle, { transform: `rotate(${40 + gSpin + 40 * Math.sin((t - g0) * 3)})` });
    set(rcSpin, { transform: `rotate(${gSpin * 1.3} 60 -30)` });
    move(noAns, 960, 820, p(t, T.notAvail, 0.5, easeBack)); show(noAns, p(t, T.notAvail, 0.4));
    const s1b = vis(t, T.game - 0.3, T.imagine - 0.2, 0.5, 0.5);
    show(S1b, s1b);
    // starts on one big playing board, then the camera pulls back to a wall of unlabelled boards
    const zoomOut = p(t, T.writeDown - 0.2, 2.2);
    const z = lerp(1.75, 1, zoomOut);
    set(camB, { transform: `translate(960 ${lerp(500, 540, zoomOut)}) scale(${z}) translate(-960 -540)` });
    show(scoreCard, p(t, T.game - 0.3, 0.5));
    const st0 = T.game + 0.2;
    bigBoard.render(stateAt(bigStates, t, st0, 5));
    set(scoreTx, { text: `score: ${stateAt(bigStates, t, st0, 5).apples * 10}` });
    show(scoreTx, p(t, T.howWell - 0.2, 0.4));
    show(scoreTick, p(t, T.howWell + 0.6, 0.3));
    set(scoreTick, { transform: `translate(215 -180) scale(${p(t, T.howWell + 0.6, 0.4, easeBack)}) translate(-215 180)` });
    boardsQ.forEach((b, i) => {
      const k = p(t, T.writeDown + 0.1 + b.d / 900, 0.4);
      show(b.g, k);
      set(b.q, { opacity: 0.9 * p(t, T.writeDown + 0.5 + b.d / 900, 0.3) * (0.75 + 0.25 * Math.sin(t * 4 + i)) });
    });
    show(qLabel, p(t, T.writeDown + 0.4, 0.4));

    // ---------- S2 ----------
    const s2 = vis(t, T.imagine - 0.3, T.living + 0.4, 0.5, 0.6);
    show(S2, s2);
    const order = cands.map((c, i) => i).sort((x, y) => cands[y].sc - cands[x].sc);
    const dimRows = (1 - 0.85 * p(t, T.twoIdeas - 0.2, 0.6)) * (1 - p(t, T.inspired - 0.3, 0.5));
    const sorted = p(t, T.imagine + 2.2, 0.9);
    cands.forEach((c, i) => {
      const r = order.indexOf(i);
      const x = lerp(250 + i * 203, 250 + r * 203, sorted);
      move(c.g, x, 300, 0.85);
      const keep = r < 3;
      show(c.g, p(t, T.imagine + i * 0.1, 0.4) * (keep ? 1 : 1 - 0.65 * p(t, T.keeping + 0.4, 0.6)) * dimRows);
      set(c.bg, { stroke: keep && t > T.keeping ? C.green : '#2e4a60', 'stroke-width': keep && t > T.keeping ? 5 : 2 });
      set(c.bar, { width: 160 * c.sc / 100 * p(t, T.imagine + 1.0, 0.8) });
    });
    show(genA, p(t, T.imagine, 0.4) * dimRows); show(genB, p(t, T.keeping + 0.4, 0.4) * dimRows);
    genKids.forEach((k, i) => {
      const par = order[k.pi];
      const px = 250 + k.pi * 203;
      const appear = p(t, T.keeping + 0.4 + i * 0.18, 0.6, easeOut);
      const x = 250 + i * 203;
      move(k.g, lerp(px, x, appear), lerp(300, 680, appear), 0.85);
      show(k.g, appear * dimRows);
      set(copyArrows[i], { d: `M ${px} 385 C ${px} 520 ${x} 520 ${x} 590` });
      draw(copyArrows[i], appear); show(copyArrows[i], dimRows * (1 - p(t, T.tryAgain + 0.6, 0.5)));
      const mut = p(t, T.small + i * 0.15, 0.4);
      show(k.spark, mut * (0.6 + 0.4 * Math.sin(t * 8 + i)));
      set(k.net, { transform: `rotate(${mut * Math.sin(i * 2.3) * 6})` });
      const sc = clamp(cands[par].sc / 100 + (hash(i + 300) - 0.4) * 0.35, 0.05, 1);
      set(k.bar, { width: 160 * sc * p(t, T.tryAgain + i * 0.1, 0.6) });
    });
    // the two ideas, as pictures
    move(funnel, 600, 600); show(funnel, p(t, T.selection - 0.2, 0.5) * (1 - p(t, T.inspired - 0.2, 0.5)));
    fDots.forEach((d, i) => {
      const k = ((t - T.selection) * 0.6 + i / 10) % 1;
      const pass = i < 3;
      const y = lerp(-220, pass ? 170 : -120, k);
      const x = pass ? lerp((i - 1) * 80, 0, clamp(k * 1.6)) : lerp((i - 6) * 40, (i - 6) * 50, k);
      set(d, { cx: x, cy: y, opacity: pass ? 1 : 1 - k });
    });
    move(mutG, 1320, 600); show(mutG, p(t, T.mutation - 0.2, 0.5) * (1 - p(t, T.inspired - 0.2, 0.5)));
    set(mLink, { opacity: 0.5 + 0.5 * Math.sin(t * 6) });
    set(mDie, { transform: `translate(150 -120) rotate(${Math.floor(t * 5) * 41 % 360})` });
    const dnaOn = vis(t, T.inspired, T.living + 0.4);
    move(dna, 960, 545, 1.15, 18); show(dna, dnaOn); if (dnaOn > 0) drawDNA(t);
    show(bioTx, vis(t, T.bio - 0.2, T.living + 0.4));

    // ---------- S3: moths ----------
    const s3 = vis(t, T.pop - 0.4, T.severe - 0.3, 0.6, 0.6);
    show(S3, s3);
    const popOn = vis(t, T.pop - 0.4, T.consider - 0.2, 0.5, 0.5);
    popMoths.forEach((m, i) => { move(m.m, 380 + (i % 6) * 230, 420 + Math.floor(i / 6) * 260, 1.3); show(m.m, popOn * p(t, T.pop + i * 0.08, 0.4) * (1 - p(t, T.inherited - 0.2, 0.4))); });
    move(inherit, 960, 600, 1.5); show(inherit, vis(t, T.inherited - 0.4, T.consider - 0.2, 0.4, 0.5));
    // the parent's pattern is passed down: three lines grow, and three similar offspring appear at their ends
    const pPop = p(t, T.inherited - 0.4, 0.5, easeBack);
    move(parentM, 0, -120, 1.6 * pPop);
    const genW = cue.at('the next generation');
    kidLines.forEach((l, i) => {
      const k = p(t, T.inherited + 0.3 + i * 0.35, 1.1, easeOut);
      draw(l, k);
      const q = pointOn(l, k);
      set(kidDots[i], { cx: q.x, cy: q.y }); show(kidDots[i], k > 0.02 && k < 0.98 ? 1 : 0);
      const born = p(t, T.inherited + 1.3 + i * 0.35, 0.5, easeBack);
      move(kids[i], -200 + i * 200, 140, 1.2 * born, (i - 1) * 6 * (1 - born));
      show(kids[i], born > 0.01 ? 1 : 0);
    });
    // on "next generation" the offspring flash to show they carry the parent's look
    const flashK = Math.sin(Math.PI * pl(t, genW, 0.8));
    kids.forEach(m => set(m, { opacity: 1 - 0.3 * flashK }));
    set(parentM, { opacity: 1 - 0.3 * flashK });
    const treeOn = vis(t, T.consider - 0.3, T.didNot - 0.2, 0.6, 0.6);
    show(tree, treeOn); show(popBar, treeOn);
    // environment darkness: 0 pale → 1 sooty → back
    const dark = p(t, T.soot, 3.0) * (1 - p(t, T.pollFell, 3.5));
    set(bark, { fill: mix('#cfc8b4', '#2e2b28', dark) });
    lichens.forEach(l => set(l, { opacity: 0.7 * (1 - dark) }));
    barkLines.forEach(l => set(l, { stroke: mix('#8f8676', '#1a1816', dark) }));
    show(smoke, vis(t, T.soot - 0.4, T.pollFell + 1.2, 0.6, 1.2));
    puffs.forEach((pf, i) => { const k = ((t * 0.25 + i / 6) % 1); set(pf, { cx: 185 + k * 220, cy: 420 - k * 280 }); set(pf, { opacity: 0.8 * (1 - k) }); });
    // share of dark moths over time
    let darkShare = 0.1;
    darkShare = lerp(darkShare, 0.9, p(t, T.survived, 5.5));
    darkShare = lerp(darkShare, 0.15, p(t, T.shifted - 1, 4.5));
    const gen = t < T.onAvg ? 1 : t < T.survived ? 1 + Math.floor(pl(t, T.onAvg, T.survived - T.onAvg) * 3) : t < T.pollFell ? 4 + Math.floor(pl(t, T.survived, 6) * 30) : 34 + Math.floor(pl(t, T.pollFell, 6) * 30);
    set(genTx, { text: `generation ${gen}` });
    set(lightFill, { height: 480 * (1 - darkShare) });
    set(pctL, { text: `${Math.round((1 - darkShare) * 100)}%` }); set(pctD, { text: `${Math.round(darkShare * 100)}%` });
    treeMoths.forEach((m, i) => {
      const isDark = hash(i * 7 + 1) < darkShare || (i === 3 && t < T.survived && t > T.darkExist - 0.2);
      show(m.light, treeOn * (isDark ? 0 : 1) * p(t, T.lightHard - 0.6 + i * 0.05, 0.4));
      show(m.dark, treeOn * (isDark ? 1 : 0) * p(t, T.lightHard - 0.6 + i * 0.05, 0.4));
    });
    // bird & target: first dark moth (#3) visible, later a light moth (#5)
    const tm = t < T.soot ? treeMoths[3] : treeMoths[5];
    const tgtOn = vis(t, T.easier - 0.2, T.onAvg + 2, 0.3, 0.3) + vis(t, T.darkNow - 0.2, T.survived + 2, 0.3, 0.3);
    set(target, { cx: tm.x, cy: tm.y }); show(target, Math.min(1, tgtOn));
    const bk = t < T.soot ? pl(t, T.before + 1.0, 14) : pl(t, T.darkNow - 0.5, 6);
    move(birdG, lerp(1500, tm.x + 90, easeOut(clamp(bk * 2))), lerp(150, tm.y - 70, easeOut(clamp(bk * 2))), 1, 0);
    show(birdG, vis(t, T.lightHard - 0.5, T.survived + 3, 0.5, 0.5) + vis(t, T.darkNow - 0.5, T.pollFell, 0.4, 0.4));
    // "knew" + variations + generations
    move(knowG, 760, 600); show(knowG, vis(t, T.didNot - 0.2, T.mutCreate - 0.2, 0.5, 0.5));
    move(kX, 180, -160, p(t, T.knew + 0.4, 0.3, easeBack)); show(kX, p(t, T.knew + 0.4, 0.3));
    const vOn = vis(t, T.mutCreate - 0.3, T.natSel - 0.2, 0.5, 0.5);
    show(varG, vOn);
    move(die, 300, 480, 1, Math.floor(t * 4) * 37 % 360 * (t < T.env ? 1 : 0));
    offs.forEach((o, i) => {
      const k = p(t, T.mutCreate + 0.3 + i * 0.2, 0.5, easeBack);
      const survive = o.sh < 0.4;
      const fall = p(t, T.offspring - 0.5, 1.0) * (survive ? 0 : 1);
      move(o.m, o.x, lerp(400, 750, p(t, T.env, 1.0)) + fall * 200, k);
      show(o.m, k * (1 - fall));
    });
    show(envStrip, p(t, T.env - 0.3, 0.5)); show(envTx, p(t, T.env + 0.5, 0.5));
    const gOn = vis(t, T.natSel - 0.3, T.severe - 0.3, 0.5, 0.5);
    show(genG, gOn);
    genRows.forEach((r, i) => show(r, p(t, T.natSel + i * 0.9, 0.5)));
    show(lifeG, p(t, T.notTransform, 0.5));
    move(lifeMoth, 0, Math.sin(t * 2) * 6, 1.1);

    // ---------- S4: extinction ----------
    const s4 = vis(t, T.severe - 0.3, T.algo - 0.3, 0.6, 0.6);
    show(S4, s4);
    const linOn = vis(t, T.severe - 0.2, T.around - 0.6, 0.5, 0.5);
    show(linG, linOn);
    linPaths.forEach((l, i) => draw(l, p(t, T.severe + i * 0.6, 0.8)));
    show(linEnd, p(t, T.lineage, 0.4)); show(linTx1, p(t, T.lineage, 0.4)); show(linTx2, p(t, T.severe + 2, 0.4));
    const dOn = p(t, T.around - 0.2, 0.6);
    const tHit = T.asteroid + 0.6;
    const impact = p(t, tHit, 0.15);
    const aftermath = p(t, tHit, 3.0);
    show(sky, dOn); show(hills, dOn); show(ground, dOn); show(mya, vis(t, T.around, T.extinction));
    ferns.forEach((f, i) => { show(f, dOn * (1 - p(t, tHit + 0.6 + i * 0.2, 1.2))); });
    set(sky, { fill: mix(mix('#14324a', '#7c2d12', p(t, tHit, 0.8)), '#1f1b1a', p(t, tHit + 1.2, 3)) });
    set(skyGlow, { opacity: 0.55 * p(t, tHit - 0.8, 0.8) * (1 - p(t, tHit + 1.5, 3)) });
    set(hills, { fill: mix('#16302a', '#1a1614', aftermath) });
    set(ground, { fill: mix('#1c2b1f', '#221a15', aftermath) });
    // asteroid streaks in toward the horizon
    const fk = pl(t, T.around + 0.3, tHit - T.around - 0.3), ek = fk * fk;
    const ax = lerp(1980, IX, ek), ay = lerp(-80, IY, ek);
    move(rock, ax, ay, lerp(0.6, 1.2, ek));
    show(rock, dOn * (t < tHit ? 1 : 0));
    sparks.forEach((sp, i) => { const b0 = (t * 2.2 + i / 14) % 1; set(sp, { cx: ax + 60 + b0 * 260 + hash(i) * 30, cy: ay - 30 - b0 * 150 + (hash(i + 3) - 0.5) * 60, opacity: (1 - b0) * (t < tHit && t > T.around + 0.3 ? 1 : 0) }); });
    set(flash, { opacity: 0.9 * vis(t, tHit, tHit + 0.35, 0.06, 0.9) });
    const sw = pl(t, tHit, 1.6);
    set(shock, { rx: 1500 * easeOut(sw), ry: 420 * easeOut(sw), opacity: (1 - sw) * (t > tHit ? 1 : 0) });
    const fb = pl(t, tHit, 2.4);
    set(fireball, { rx: 260 * easeOut(fb), ry: 180 * easeOut(fb), cy: IY - 120 * fb, opacity: 0.9 * (1 - fb) * (t > tHit ? 1 : 0) });
    dust.forEach((d, i) => {
      const k = pl(t, tHit + 0.1 + i * 0.03, 4);
      const R = d.r0 * (0.3 + 1.6 * easeOut(k));
      set(d.el, { cx: IX + Math.cos(d.a) * 520 * d.sp * easeOut(k), cy: IY + Math.sin(d.a) * 420 * d.sp * easeOut(k) - 80 * k, r: R, opacity: 0.7 * (t > tHit ? 1 : 0) * (1 - 0.65 * p(t, T.birds - 1.0, 2.0)) });
    });
    ash.forEach((a, i) => { const y = (a.ph + (t - tHit) * a.v) % 1100 - 20; set(a.el, { cx: a.x + Math.sin(t + i) * 20, cy: y, opacity: 0.6 * p(t, tHit + 1.0, 1.5) * (1 - p(t, T.algo - 0.8, 0.5)) }); });
    // dinosaurs grey out, sink and crumble away; a ghost returns for "no promise"
    const gone = p(t, T.extinction, 2.0);
    dinos.forEach((d, i) => {
      const walk = (1 - p(t, tHit, 0.3)) * Math.sin(t * 2.4 + i * 2) * 6;
      const stone = p(t, tHit + 0.3 + i * 0.25, 1.2);
      set(d.d.firstChild, { fill: mix(d.c, '#57534e', stone) });
      move(d.d, d.x + walk * 3 + (1 - p(t, tHit, 0.3)) * (t - T.around) * 8, d.y + 30 + walk * 0.4 + 40 * gone, d.s * 1.5);
      set(d.d, { opacity: dOn * (1 - gone) + 0.22 * vis(t, T.noPromise - 0.2, T.algo - 0.3, 0.5, 0.4) + (i === 2 ? 0.45 * vis(t, T.dinoLin - 0.4, T.noPromise - 0.2, 0.4, 0.4) : 0) });
    });
    // birds survive: one rises out of the dust and flies on
    const bFly = p(t, T.birds - 0.6, 2.6, easeOut);
    const bx = lerp(1180, 1560, bFly), by = lerp(700, 380, bFly) + Math.sin(t * 3) * 10;
    show(birdS, dOn * p(t, T.birds - 0.6, 0.5));
    set(birdS, { transform: `translate(${bx} ${by}) scale(-1.5 ${1.5 * (0.75 + 0.25 * Math.sin(t * 12))})` });
    set(lineageArc, { d: `M 1370 640 Q 1420 470 ${bx - 20} ${by + 10}` });
    show(lineageArc, vis(t, T.dinoLin - 0.2, T.noPromise, 0.4, 0.5)); draw(lineageArc, p(t, T.dinoLin - 0.2, 0.9));
    // "no promise…": a long, successful reign cut short
    show(reign, vis(t, T.noPromise - 0.3, T.algo - 0.3, 0.4, 0.5));
    set(reignFill, { width: 1560 * p(t, T.noPromise, 1.6) });
    show(reignCut, p(t, T.noPromise + 1.6, 0.25));
    set(reignFill, { fill: p(t, T.noPromise + 1.6, 0.2) > 0.5 ? '#57534e' : '#4d7c5f' });
    show(noProm, 1);
    show(np1.g, p(t, T.noPromise, 0.5)); show(np2.g, p(t, T.chance, 0.4)); show(np3.g, p(t, T.chance + 0.8, 0.4));
    // the dinosaurs were well suited for a very long time — then chance struck, faster than they could adapt
    move(dieS, 640, 960, 1, Math.floor(t * 6) * 47 % 360); show(dieS, p(t, T.chance, 0.4));
    move(clock, 1310, 960); set(hand, { transform: `rotate(${(t - T.chance) * 720})` }); show(clock, p(t, T.chance + 0.8, 0.4));
    set(ground, { fill: mix('#1c2b1f', '#2b2118', gone) });

    // ---------- S5: algorithm ----------
    const s5 = vis(t, T.algo - 0.3, T.snake - 0.2, 0.6, 0.5);
    show(S5, s5);
    // moths turn into candidate networks: same idea, but these are programs, not organisms
    const morph = p(t, T.keeps - 0.3, 0.9);
    algoMoths.forEach((m, i) => {
      move(m, 260 + (i % 5) * 230, 380 + Math.floor(i / 5) * 230, 1.2 * (1 - 0.6 * morph), morph * 90);
      show(m, p(t, T.algo - 0.2 + i * 0.05, 0.4) * (1 - morph));
    });
    algoNets.forEach((n, i) => {
      move(n.g, 260 + (i % 5) * 230, 380 + Math.floor(i / 5) * 230);
      show(n.g, p(t, T.keeps + i * 0.08, 0.4));
      set(n.bar, { width: 140 * n.sc / 100 * p(t, T.evaluates, 0.8) });
    });
    move(notOrg, 960, 860); show(notOrg, vis(t, T.notRepro - 0.2, T.keeps, 0.4, 0.4));
    show(nextGenArrow, p(t, T.nextGen - 0.3, 0.5)); show(nextGenTx, p(t, T.nextGen - 0.3, 0.5));
    draw(nextGenArrow, p(t, T.nextGen - 0.3, 0.6));
    nextGenNets.forEach((n, i) => show(n, p(t, T.nextGen + i * 0.2, 0.4)));

    // ---------- S6: Snake + network ----------
    const s6 = vis(t, T.snake - 0.3, T.start - 0.2, 0.5, 0.5);
    show(S6, s6);
    const st = stateAt(snkStates, t, T.follows - 0.5, 2.2);
    snkBoard.render(t < T.follows - 0.5 ? snkStates[0] : st);
    show(snkBoard.g, p(t, T.snake, 0.5));
    show(boardToNet, p(t, T.receives, 0.4));
    inNodes.forEach((n, i) => show(n.g, p(t, [T.food, T.danger, T.moving][i] - 0.1, 0.4)));
    hidN.forEach((n, i) => { show(n.g, p(t, T.receives + 0.4, 0.5)); set(n.core, { opacity: 0.6 * hash(i + Math.floor(t * 2.2)) * p(t, T.produces, 0.5) }); });
    set(s6Links, { opacity: p(t, T.receives + 0.4, 0.5) });
    outBars.forEach((b, i) => {
      show(b.g, p(t, [T.straight, T.left, T.right][i] - 0.1, 0.4));
      const sc = t < T.follows - 0.5 ? [0.8, 0.3, 0.5][i] : st.scores[i];
      set(b.f, { width: 300 * sc, fill: (t < T.follows - 0.5 ? i === 0 : st.act === i) ? C.cyan : '#3b5568' });
    });
    set(chosen, { text: `game takes: ${outDefs[t < T.follows - 0.5 ? 0 : st.act]}` }); show(chosen, p(t, T.follows, 0.4));

    // ---------- S7: many networks; fitness ----------
    const s7 = vis(t, T.start - 0.3, T.select - 0.2, 0.5, 0.5);
    show(S7, s7);
    players.forEach((pp, i) => {
      move(pp.g, pp.x, pp.y);
      show(pp.g, p(t, T.start + i * 0.06, 0.4));
      const sst = stateAt(pp.st, t, T.most - 1.0, 3.2);
      pp.b.render(sst);
      const done = sst === pp.st[pp.st.length - 1];
      set(pp.fit, { text: t > T.afterEach ? String(pp.fitness) : sst.apples ? `+${sst.apples * 10}` : '' });
      show(pp.fit, t > T.few ? 1 : 0);
    });
    show(fitLegend, vis(t, T.apples - 0.2, T.whole, 0.4, 0.4));
    set(wholeTx, { text: t < T.noLabel ? 'one score for the whole attempt' : 'no one labels every board with a perfect move' });
    show(wholeTx, p(t, T.whole, 0.4));

    // ---------- S8: select, copy, mutate ----------
    const s8 = vis(t, T.select - 0.3, T.again - 0.2, 0.5, 0.5);
    show(S8, s8);
    show(parentNet, p(t, T.select, 0.5));
    show(childNet, p(t, T.copy + 0.4, 0.5)); draw(copyArrow, p(t, T.copy, 0.8)); show(copyTx, p(t, T.copy, 0.4));
    mutMarks.forEach((m, i) => show(m, p(t, T.change + 0.3 + i * 0.25, 0.3)));
    set(cn, { transform: `scale(2.6) rotate(${p(t, T.change, 0.6) * 4})` });
    show(mutDie, vis(t, T.change - 0.2, T.structure + 0.5)); move(mutDie, 960, 620, 1, Math.floor(t * 5) * 41 % 360);
    draw(newConn, p(t, T.connection, 0.6)); show(newNeuron, p(t, T.aNeuron, 0.4));
    set(childTx, { text: t < T.structure ? 'copy + small random changes' : '…or a new connection / neuron' });
    outcomes.forEach((o, i) => show(o.g, p(t, [T.help, T.nothing, T.worse][i] - 0.1, 0.4)));

    // ---------- S9: generation loop ----------
    const s9 = vis(t, T.again - 0.3, T.overGens - 0.2, 0.5, 0.5);
    show(S9, s9);
    const loopT = t < T.repeat ? -1 : (t - T.repeat) * 1.2;
    const activeStep = t < T.scoreThem ? 0 : t < T.repeat ? Math.min(3, Math.floor((t - T.scoreThem) / 1.4) + 1) : Math.floor(loopT) % 4;
    lsG.forEach((c, i) => { show(c.g, p(t, T.again + i * 0.4, 0.4)); set(c.g, { opacity: i === activeStep ? 1 : 0.45 }); });
    const genN = 2 + Math.max(0, Math.floor(loopT / 4));
    set(genCount, { text: `generation ${genN}` });
    show(genSub, p(t, T.genDef, 0.4));
    show(luckyG, p(t, T.several - 0.3, 0.5));
    luckyBoards.forEach((lb, i) => lb.b.render(stateAt(lb.st, t, T.several + i * 0.4, 3)));
    luckyScores.forEach((s, i) => show(s, p(t, T.several + 3 + i * 0.4, 0.4)));
    show(luckyAvg, p(t, T.lucky - 0.3, 0.5));

    // ---------- S10: progress, designer, trick ----------
    const s10 = vis(t, T.overGens - 0.3, T.diff - 0.2, 0.5, 0.5);
    show(S10, s10);
    draw(progCurve, p(t, T.overGens, 4, x => x));
    show(chart, 1);
    show(designer, p(t, T.designer, 0.5)); show(designTx, p(t, T.designer, 0.5));
    show(fitFormula, p(t, T.better - 0.3, 0.5));
    set(ffTx, { text: t < T.poorly ? 'fitness = apples eaten' : 'fitness = time alive ?' });
    show(trickG, p(t, T.trick - 0.6, 0.5));
    // a snake circling in a 2×2 loop forever
    const ring = [[3, 3], [4, 3], [4, 4], [3, 4]];
    const k = Math.floor(t * 4) % 4;
    trickBoard.render({ body: [ring[k], ring[(k + 3) % 4], ring[(k + 2) % 4]], food: [6, 1], crashed: false });
    show(trickTx, p(t, T.trick, 0.4));
    show(notGenG, p(t, T.notGeneral, 0.5));

    // ---------- S11: comparison ----------
    const s11 = vis(t, T.diff - 0.3, T.seenNow - 0.2, 0.5, 0.5);
    show(S11, s11);
    cols.forEach((c, i) => { show(c.g, p(t, i ? T.neCmp - 0.3 : T.diff + 0.3, 0.5)); c.rs.forEach((r, k) => {
      show(r, p(t, (i ? T.neCmp : T.supCmp) + k * 1.6, 0.4));
      const ic = r.__ic;
      if (ic.__gap) set(ic.__gap, { width: 76 * (0.6 + 0.4 * Math.sin(t * 2)) });
      if (ic.__dial) ic.__dial.setValue(Math.sin(t * 1.5) * 1.2, -2, 2);
      if (ic.__die) set(ic.__die, { transform: `rotate(${Math.floor(t * 5) * 37 % 360})` });
    }); });
    show(evoWhat, p(t, T.some - 0.2, 0.5)); show(ew2.g, p(t, T.others, 0.5));
    show(oneWay, p(t, T.oneWay, 0.5));

    // ---------- S12: outro ----------
    const s12 = vis(t, T.seenNow - 0.3, 9999, 0.5);
    show(S12, s12);
    show(journey, vis(t, T.seenNow, T.modern - 0.2, 0.4, 0.5));
    show(jSw, p(t, T.seenNow + 0.3, 0.5)); show(jL1, p(t, T.color - 0.3, 0.4)); show(jL2, p(t, T.learnGame, 0.4)); draw(jArrow, p(t, T.learnGame - 0.5, 0.8)); show(jBoard.g, p(t, T.learnGame, 0.4));
    show(chat, vis(t, T.modern - 0.2, T.howCan - 0.2, 0.5, 0.5));
    reqs.forEach((r, i) => show(r.g, p(t, [T.explain, T.compare, T.write, T.plan][i] - 0.1, 0.4, easeBack)));
    show(llmCore.g, p(t, T.withText, 0.5));
    const qT = [T.howCan, T.inside, T.limits, T.next];
    qs.forEach((q, i) => show(q, vis(t, qT[i] - 0.1, qT[i + 1] - 0.2, 0.4, 0.3)));
    // many requests orbit one model
    const zoomIn = p(t, T.next, 2.2);
    const oOn = p(t, T.howCan - 0.4, 0.6) * (1 - 0.55 * zoomIn);
    show(orbit, oOn);
    set(orbit, { transform: `translate(960 ${lerp(560, 520, zoomIn)}) scale(${lerp(1, 3.2, easeOut(zoomIn))})` });
    const spin = (t - T.howCan) * 0.12;
    orbitChips.forEach((c, i) => {
      const k = p(t, T.howCan + i * 0.15, 0.6, easeBack);
      const lim = p(t, T.limits, 0.8);
      const R = lerp(160, c.outside ? lerp(420, 470, lim) : 420, k);
      const x = Math.cos(c.ang + spin) * R * 1.6, y = Math.sin(c.ang + spin) * R * 0.92;
      move(c.g, x, y, k);
      show(c.g, k * (1 - zoomIn));
      set(c.tx, { fill: c.outside && lim > 0.5 && Math.floor(t * 3) % 2 ? C.red : reqNames[i][1] });
      set(c.line, { x2: x, y2: y, opacity: 0.6 * k * (c.outside ? 1 - 0.8 * lim : 1) * (1 - zoomIn) });
    });
    // inside the model
    const reveal = p(t, T.inside, 0.9);
    show(coreQ, 1 - reveal);
    show(inner, reveal);
    innerNodes.forEach((n, i) => set(n, { fill: mix('#0c1f2a', C.teal, 0.5 + 0.5 * Math.sin(t * 3 + i * 1.3)) }));
    innerLinks.forEach((l, i) => set(l, { opacity: 0.3 + 0.6 * Math.max(0, Math.sin(t * 4 - i * 0.6)) }));
    set(core, { transform: `scale(${lerp(1, 1.35, reveal)})` });
    set(coreHalo, { opacity: 0.08 + 0.1 * reveal });
    const tw = [cue.at('appears to understand'), cue.at('reason, or plan'), cue.at('or plan')];
    thinkTags.forEach((c, i) => { show(c.g, vis(t, tw[i], T.limits, 0.3, 0.4) * (1 - zoomIn)); });
    // limits: a boundary ring; some requests sit outside it
    show(limitRing, p(t, T.limits, 0.6) * (1 - zoomIn));
    set(limitRing, { r: lerp(560, 330, p(t, T.limits, 0.8)) });
    // next + like / subscribe
    show(nextG, p(t, T.next - 0.2, 0.5));
    show(nx.g, p(t, T.next + 0.6, 0.5, easeBack));
    const likeT = cue.at('please like'), subT = T.subscribe;
    const liked = p(t, likeT + 0.2, 0.3);
    show(likeB, p(t, T.like + 1.2, 0.4)); set(likeB, { transform: `translate(800 950) scale(${1 + 0.18 * Math.sin(Math.PI * pl(t, likeT, 0.4))})` });
    set(likeBg, { fill: mix('#0f2433', '#155e75', liked) }); set(likeTx, { text: liked > 0.5 ? 'Liked' : 'Like' });
    const subbed = p(t, subT + 0.3, 0.3);
    show(subBg_, p(t, T.like + 1.5, 0.4)); set(subBg_, { transform: `translate(1120 950) scale(${1 + 0.18 * Math.sin(Math.PI * pl(t, subT + 0.1, 0.4))})` });
    set(subBg, { fill: mix('#c81e1e', '#374151', subbed) }); set(subTx, { text: subbed > 0.5 ? 'SUBSCRIBED ✓' : 'SUBSCRIBE' });
    const tapX = t < subT ? 800 : 1120, tapOn = Math.max(vis(t, likeT - 0.2, likeT + 0.5, 0.2, 0.3), vis(t, subT - 0.1, subT + 0.6, 0.2, 0.3));
    set(tapDot, { cx: tapX - 40, cy: 975, opacity: 0.45 * tapOn, r: 26 - 8 * tapOn });
  };
}
