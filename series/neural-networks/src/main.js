import * as THREE from 'three';
import '../style.css';

const FPS = 24;
const CHAPTER_END = 59.578947;
const film = document.querySelector('#film');
const audio = document.querySelector('#narration');
const shell = document.querySelector('#player-shell');
const playButton = document.querySelector('#play-toggle');
const seekBar = document.querySelector('#seek-bar');
const timeCurrent = document.querySelector('#time-current');
const timeTotal = document.querySelector('#time-total');
const rateSelect = document.querySelector('#playback-rate');
const audioState = document.querySelector('#audio-state');
const captionCue = document.querySelector('#caption-cue');
const transcript = document.querySelector('#review-transcript');
const els = Object.fromEntries([
  'chat-window','user-bubble','prompt-text','composer-placeholder','composer-send','assistant-bubble','answer-text','mini-neural-mark',
  'network-title','math-system','system-inputs','calculation-node','system-output','weight-controls','weight-track','bio-stage','bio-heading',
  'paper-outline','bio-signal','history-stage','history-copy','photo-card','pattern-lab','split-line','not-a-brain','brain-ghost',
  'not-brain-copy','build-stage','build-network','build-pulse-a','build-pulse-b','handoff-stage','handoff-neuron','handoff-number',
  'incoming-swatch','beat-indicator'
].map(id => [id, document.getElementById(id)]));
const systemLines = [...document.querySelectorAll('.system-lines path')];
const numberChips = [...document.querySelectorAll('.number-chip')];
const dials = [...document.querySelectorAll('.dial i')];
const patternRings = [...document.querySelectorAll('.pattern-rings circle')];
const weightBar = document.querySelector('.weight-track i');
const composerSend = els['composer-send'];
const prompt = 'What is the most important thing inside AI?';
const answer = 'Neural networks are one central engine behind modern generative AI.';
const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
const mix = (a, b, p) => a + (b - a) * p;
const smooth = (a, b, t) => { const p = clamp((t - a) / (b - a)); return p * p * (3 - 2 * p); };
const easeOut = p => 1 - Math.pow(1 - clamp(p), 3);
const fract = n => n - Math.floor(n);
const phase = (t, start, end, fi = .35, fo = .4) => clamp((t - start) / Math.max(.001, fi)) * (1 - clamp((t - (end - fo)) / Math.max(.001, fo)));
const fmt = s => { const n = Math.max(0, Math.floor(s)); return `${String(Math.floor(n / 60)).padStart(2,'0')}:${String(n % 60).padStart(2,'0')}`; };
const setOpacity = (el, value) => {
  if (!el) return;
  const a = clamp(value);
  el.style.opacity = a.toFixed(4);
  el.style.visibility = a > .008 ? 'visible' : 'hidden';
};
const setOffset = (el, xPct = 0, yPct = 0, scale = 1, rotate = 0) => {
  if (!el) return;
  const w = film.clientWidth || 1, h = film.clientHeight || 1;
  el.style.translate = `${(w * xPct / 100).toFixed(2)}px ${(h * yPct / 100).toFixed(2)}px`;
  el.style.scale = String(scale);
  if (rotate) el.style.rotate = `${rotate}deg`;
};
const typeText = (el, full, p) => {
  if (!el) return;
  const count = Math.max(0, Math.min(full.length, Math.floor(full.length * clamp(p))));
  const next = full.slice(0, count);
  if (el.textContent !== next) el.textContent = next;
};

// Ambient 3D network: all positions and pulses are functions of absolute audio time.
let renderer = null, scene = null, camera = null, webglGraph = null, webglNodes = [], webglLinks = [], webglParticles = [], starField = null;
function seeded(seed) {
  let x = seed >>> 0;
  return () => { x = (1664525 * x + 1013904223) >>> 0; return x / 4294967296; };
}
function createWebGL() {
  const canvas = document.querySelector('#webgl');
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 16 / 9, .1, 80);
    camera.position.set(0, 0, 15.4);
    webglGraph = new THREE.Group();
    scene.add(webglGraph);

    const rnd = seeded(21041958);
    const starPositions = new Float32Array(240 * 3);
    for (let i = 0; i < 240; i++) {
      starPositions[i * 3] = (rnd() - .5) * 20;
      starPositions[i * 3 + 1] = (rnd() - .5) * 11.25;
      starPositions[i * 3 + 2] = -4 - rnd() * 14;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starField = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x8bb7c9, size: .025, transparent: true, opacity: .25, depthWrite: false }));
    scene.add(starField);

    const layerYs = [-2.15, -.72, .72, 2.15];
    const xPositions = [-5.2, -1.75, 1.75, 5.2];
    const nodeGeometry = new THREE.SphereGeometry(.095, 12, 10);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x91f2d2, transparent: true, opacity: .55, depthWrite: false });
    const nodeColumns = [];
    for (let col = 0; col < 4; col++) {
      const column = [];
      for (let row = 0; row < 4; row++) {
        const y = layerYs[row] + (rnd() - .5) * .32;
        const z = (rnd() - .5) * 1.5;
        const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        mesh.position.set(xPositions[col], y, z);
        mesh.userData = { col, row, phase: rnd() * Math.PI * 2 };
        webglGraph.add(mesh); webglNodes.push(mesh); column.push(mesh);
      }
      nodeColumns.push(column);
    }
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x72c8ff, transparent: true, opacity: .12, depthWrite: false });
    const linkPairs = [];
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 4; row++) {
        const targets = [...new Set([row, Math.max(0,row-1), Math.min(3,row+1)])];
        for (const nextRow of targets) {
          const a = nodeColumns[col][row].position.clone();
          const b = nodeColumns[col + 1][nextRow].position.clone();
          const geometry = new THREE.BufferGeometry().setFromPoints([a,b]);
          const line = new THREE.Line(geometry, edgeMat.clone());
          webglGraph.add(line); webglLinks.push(line); linkPairs.push([a,b]);
        }
      }
    }
    const particleGeometry = new THREE.SphereGeometry(.045, 8, 8);
    for (let i = 0; i < 15; i++) {
      const mesh = new THREE.Mesh(particleGeometry, new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xffc776 : 0x91f2d2, transparent: true, opacity: .85, depthWrite: false }));
      mesh.userData = { edge: i % linkPairs.length, phase: rnd() };
      webglGraph.add(mesh);
      webglParticles.push({ mesh, a: linkPairs[i % linkPairs.length][0], b: linkPairs[i % linkPairs.length][1] });
    }
    resizeWebGL();
  } catch (error) {
    console.warn('WebGL backdrop unavailable; DOM/SVG animation remains active.', error);
    if (renderer) renderer.dispose();
    renderer = null;
  }
}
function resizeWebGL() {
  if (!renderer || !camera) return;
  const w = Math.max(1, film.clientWidth), h = Math.max(1, film.clientHeight);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
function renderWebGL(t) {
  if (!renderer || !scene || !camera) return;
  const intro = smooth(5, 15, t);
  const late = smooth(47, 56, t);
  const intensity = .12 + .48 * intro * (1 - .15 * late);
  const canvas = document.querySelector('#webgl');
  canvas.style.opacity = String(intensity);
  webglGraph.rotation.y = Math.sin(t * .11) * .075;
  webglGraph.rotation.x = Math.cos(t * .075) * .035;
  webglGraph.position.y = Math.sin(t * .19) * .07;
  webglNodes.forEach((node, i) => {
    const pulse = .88 + .22 * (Math.sin(t * 1.35 + node.userData.phase) * .5 + .5);
    node.scale.setScalar(pulse);
    node.material.opacity = .22 + intensity * (.38 + .16 * Math.sin(t * .7 + i));
  });
  webglLinks.forEach((line, i) => { line.material.opacity = .045 + intensity * (.15 + .04 * Math.sin(t * .45 + i * .31)); });
  webglParticles.forEach(({ mesh, a, b }, i) => {
    const p = fract(t * .22 + mesh.userData.phase);
    mesh.position.lerpVectors(a, b, p);
    mesh.visible = intensity > .16 && ((i + Math.floor(t * 1.1)) % 3 !== 0);
  });
  renderer.render(scene, camera);
}
createWebGL();

function updateOpening(t) {
  const chatOpacity = 1 - smooth(13.1, 16.0, t);
  setOpacity(els['chat-window'], chatOpacity);
  const typeP = clamp((t - .55) / 2.7);
  typeText(els['prompt-text'], prompt, typeP);
  const send = smooth(3.30, 4.18, t);
  const bubbleIntro = smooth(.28, .62, t);
  setOpacity(els['user-bubble'], bubbleIntro * chatOpacity);
  setOffset(els['user-bubble'], mix(-4.5, 0, send), mix(49.6, 0, send), 1 - .025 * send);
  setOpacity(els['composer-placeholder'], 1 - typeP * .92);
  setOpacity(composerSend, .48 + .52 * smooth(3.30, 3.86, t));
  if (composerSend) composerSend.style.scale = String(1 + .1 * Math.sin(Math.max(0,t - 3.2) * 12) * (1 - smooth(4.2,4.55,t)));
  const responseP = clamp((t - 5.05) / 5.1);
  setOpacity(els['assistant-bubble'], smooth(4.85, 5.35, t) * chatOpacity);
  typeText(els['answer-text'], answer, responseP);
  setOpacity(els['mini-neural-mark'], smooth(10.0, 12.1, t) * chatOpacity);
  const netP = smooth(9.6, 12.1, t);
  setOpacity(els['network-title'], netP * (1 - smooth(15.0, 17.4, t)));
  if (els['network-title']) {
    const move = smooth(13.0, 16.5, t);
    setOffset(els['network-title'], 0, mix(0, -4, move), mix(1, 1.08, move));
  }
}

function updateMath(t) {
  setOpacity(els['math-system'], phase(t, 15.8, 29.25, .55, .7));
  setOpacity(els['calculation-node'], phase(t, 16.05, 29.3, .65, .65));
  const inputP = clamp((t - 18.78) / 2.5);
  numberChips.forEach((chip, i) => {
    const stagger = clamp((inputP - i * .19) / .78);
    const visible = smooth(16.65, 17.45, t) * (1 - smooth(22.2 + i * .18, 23.6 + i * .16, t));
    setOpacity(chip, visible);
    setOffset(chip, 10.5 * easeOut(stagger), 0, 1 - .13 * stagger);
  });
  systemLines.forEach((path, i) => {
    const visible = smooth(18.6,19.0,t) * (1-smooth(22.8,23.9,t));
    path.style.opacity = String(visible * .78);
    path.style.strokeDashoffset = String(-t * 84 - i * 17);
  });
  const outputP = smooth(21.5, 23.3, t);
  setOpacity(els['system-output'], outputP * (1 - smooth(27.6, 29.1, t)));
  setOffset(els['system-output'], -2.5 * (1-outputP), 0, 1);
  const weightP = phase(t, 23.45, 29.05, .5, .52);
  setOpacity(els['weight-controls'], weightP);
  setOffset(els['weight-controls'], 0, 1.5 * (1-weightP), 1);
  if (weightBar) weightBar.style.transform = `scaleX(${.28 + .68 * smooth(24.0, 27.8, t)})`;
  dials.forEach((dial, i) => dial.style.setProperty('--dial-angle', `${mix([20,-18,10][i], [64,39,-48][i], smooth(24.1 + i*.14,27.45 + i*.12,t))}deg`));
}

function updateBiology(t) {
  const visible = phase(t, 28.45, 41.15, .55, .62);
  setOpacity(els['bio-stage'], visible);
  const histP = smooth(34.85,35.35,t);
  setOpacity(els['bio-heading'], histP * (1-smooth(40.0,41.3,t)));
  const paperP = phase(t, 35.55, 40.85, .5, .45);
  setOpacity(els['paper-outline'], paperP);
  setOffset(els['paper-outline'], 0, .7*(1-paperP), 1, mix(5,0,smooth(36.0,39.5,t)));
  const signalP = clamp((t - 29.6) / 5.2);
  const x = 575 + 385 * easeOut(signalP);
  const signal = document.getElementById('bio-signal');
  if (signal) signal.setAttribute('cx', x.toFixed(2));
  const axon = document.querySelector('.axon');
  if (axon) axon.style.strokeDashoffset = String(-t * 32);
  document.querySelectorAll('.dendrites path').forEach((path,i)=>{path.style.strokeDashoffset=String(-t*21-i*8);});
}

function updateHistory(t) {
  const visible = phase(t, 40.5, 49.15, .4, .62);
  setOpacity(els['history-stage'], visible);
  const cp = smooth(40.62,41.28,t) * (1-smooth(48.1,48.85,t));
  setOpacity(els['history-copy'], cp);
  setOffset(els['history-copy'], -1.7*(1-cp), 0, 1);
  const photoP = phase(t, 41.15, 48.75, .62, .45);
  setOpacity(els['photo-card'], photoP);
  setOffset(els['photo-card'], 0, 2.2*(1-photoP), 1, mix(-2,0,smooth(42,47,t)));
  const img = els['photo-card']?.querySelector('img');
  if (img) img.style.transform = `scale(${1.04 + .04 * smooth(41.4,48.3,t)}) translate3d(${Math.sin(t*.33)*.6}%,${Math.cos(t*.27)*.45}%,0)`;
  const shimmer = els['photo-card']?.querySelector('.photo-shimmer');
  if (shimmer) shimmer.style.translate = `${mix(-105,110,smooth(42.2,44.0,t))}% 0`;
  const plotP = phase(t, 43.9, 48.75, .55, .4);
  setOpacity(els['pattern-lab'], plotP);
  setOffset(els['pattern-lab'], 2*(1-plotP), 0, .96 + .04*plotP);
  if (els['split-line']) {
    const draw = smooth(46.5,47.75,t);
    els['split-line'].style.strokeDashoffset = String(500 * (1 - draw));
  }
  patternRings.forEach((ring,i)=>{
    const pulse = Math.max(0, Math.sin((t - 47.1) * 5.2 - i * 1.1));
    ring.style.opacity = String(clamp(pulse) * smooth(47.05,47.45,t) * (1-smooth(48.45,48.8,t)));
  });
}

function updateBrain(t) {
  const visible = phase(t,48.45,52.45,.38,.42);
  setOpacity(els['not-a-brain'],visible);
  const dissolve = smooth(50.65,52.05,t);
  setOpacity(els['brain-ghost'],visible * (1-dissolve));
  setOpacity(els['not-brain-copy'],visible * smooth(49.1,50.0,t));
  if (els['brain-ghost']) setOffset(els['brain-ghost'], -2.6*dissolve, .4*dissolve, 1-.18*dissolve);
}

function updateBuild(t) {
  const buildP = phase(t,51.8,57.2,.52,.55);
  setOpacity(els['build-stage'],buildP);
  setOffset(els['build-network'],1.5*(1-buildP),0,.96+.04*buildP);
  const pulseA = els['build-pulse-a'], pulseB=els['build-pulse-b'];
  const pA = easeOut(clamp((t-52.4)/3.1)), pB=easeOut(clamp((t-53.1)/3.2));
  const follow = (points,p) => { const pos = p * (points.length - 1), i = Math.min(points.length - 2,Math.floor(pos)), q = pos - i; return [mix(points[i][0],points[i+1][0],q),mix(points[i][1],points[i+1][1],q)]; };
  const a = follow([[100,142],[360,90],[650,148],[960,280]],pA), b = follow([[100,418],[360,468],[650,412],[960,280]],pB);
  if (pulseA) { pulseA.setAttribute('cx',String(a[0])); pulseA.setAttribute('cy',String(a[1])); }
  if (pulseB) { pulseB.setAttribute('cx',String(b[0])); pulseB.setAttribute('cy',String(b[1])); }
  document.querySelectorAll('.build-edges path').forEach(path=>path.style.strokeDashoffset=String(-t*42));
}

function updateHandoff(t) {
  const h = smooth(55.1,56.3,t);
  setOpacity(els['handoff-stage'],h);
  setOpacity(els['handoff-neuron'],h);
  // The neuron begins exactly over the network's final SVG node, then travels
  // inward and grows: it is the same endpoint becoming the next chapter's unit.
  const travel = smooth(55.15,58.05,t);
  if (els['handoff-neuron']) {
    const centerX = mix(87.79,50,travel), centerY = mix(49,47,travel);
    const halfW = 50 * els['handoff-neuron'].offsetWidth / Math.max(1,film.clientWidth);
    const halfH = 50 * els['handoff-neuron'].offsetHeight / Math.max(1,film.clientHeight);
    els['handoff-neuron'].style.left = `${centerX-halfW}%`;
    els['handoff-neuron'].style.top = `${centerY-halfH}%`;
  }
  setOffset(els['handoff-neuron'],0,0,mix(.26,1,travel));
  const numberP = smooth(55.35,58.65,t);
  setOpacity(els['handoff-number'],numberP);
  if (els['handoff-number']) {
    const moveNumber = easeOut(numberP);
    els['handoff-number'].style.left = `${mix(87.79,50,moveNumber)}%`;
    els['handoff-number'].style.top = `${mix(49,47,moveNumber)}%`;
  }
  const symbol = els['handoff-neuron']?.querySelector('span');
  if (symbol) setOpacity(symbol,1-smooth(55.45,56.12,t));
  const swatchP = smooth(57.7,59.35,t);
  setOpacity(els['incoming-swatch'],swatchP);
  if (els['incoming-swatch']) els['incoming-swatch'].style.left = `${mix(-18,7,easeOut(swatchP))}%`;
}

function renderAt(seconds) {
  const t = clamp(Number(seconds) || 0,0,CHAPTER_END);
  updateOpening(t);
  updateMath(t);
  updateBiology(t);
  updateHistory(t);
  updateBrain(t);
  updateBuild(t);
  updateHandoff(t);
  renderWebGL(t);
  const cueText = t < 12.99 ? 'AI CORE IDEA' : t < 28.55 ? 'NUMBERS → CALCULATION' : t < 40.63 ? 'BIOLOGICAL INSPIRATION' : t < 48.55 ? 'THE PERCEPTRON · 1958' : t < 51.94 ? 'A MODEL, NOT A MINIATURE BRAIN' : 'FOLLOW ONE NUMBER';
  if (els['beat-indicator']) {
    setOpacity(els['beat-indicator'],.6);
    const dot=els['beat-indicator'].querySelector('i');
    if(dot)dot.style.transform=`scale(${.8 + .35*(.5+.5*Math.sin(t*3.1))})`;
  }
  if (captionCue) captionCue.textContent = `CHAPTER 01 · ${fmt(t)} · ${cueText}`;
  timeCurrent.textContent = fmt(t);
  if (!seekBar.matches(':active')) seekBar.value = String(Math.round(t/CHAPTER_END*1000));
  return t;
}
window.renderFrame = frame => renderAt(frame / FPS);
window.renderAt = renderAt;

// Audio remains the only clock. Render at 24 fps while playing, and render immediately on seek/pause.
let lastFrame = -1;
function tick() {
  if (!audio.paused && !audio.ended) {
    const t = Math.min(audio.currentTime,CHAPTER_END);
    const frame = Math.floor(t * FPS);
    if (frame !== lastFrame) { renderAt(frame / FPS); lastFrame = frame; }
    if (audio.currentTime >= CHAPTER_END) { audio.pause(); audio.currentTime = CHAPTER_END; renderAt(CHAPTER_END); }
  }
  requestAnimationFrame(tick);
}
function updatePlayButton() {
  const playing = !audio.paused && !audio.ended;
  playButton.textContent = playing ? '❚❚' : '▶';
  playButton.setAttribute('aria-label',playing ? 'Pause narration' : 'Play narration');
  audioState.textContent = playing ? 'Chapter 1 preview playing' : 'Chapter 1 preview · narration only';
}
playButton.addEventListener('click', async () => {
  if (audio.paused || audio.ended) {
    if (audio.ended || audio.currentTime >= CHAPTER_END - .04) audio.currentTime = 0;
    try { await audio.play(); } catch (err) { audioState.textContent = 'Tap play again if the browser blocked audio.'; console.warn(err); }
  } else audio.pause();
  updatePlayButton();
});
audio.addEventListener('play',updatePlayButton);
audio.addEventListener('pause',updatePlayButton);
audio.addEventListener('ended',()=>{renderAt(CHAPTER_END);updatePlayButton();});
audio.addEventListener('loadedmetadata',()=>{timeTotal.textContent=fmt(CHAPTER_END);audioState.textContent='Chapter 1 narration ready';renderAt(0);});
audio.addEventListener('error',()=>{audioState.textContent='Narration could not be loaded';});
if (audio.readyState >= 1) {
  timeTotal.textContent = fmt(CHAPTER_END);
  audioState.textContent = 'Chapter 1 narration ready';
  renderAt(0);
}
seekBar.addEventListener('input',()=>{
  const t = Number(seekBar.value)/1000*CHAPTER_END;
  audio.currentTime = t;
  lastFrame = -1;
  renderAt(t);
  showControls();
});
rateSelect.addEventListener('change',()=>{audio.playbackRate=Number(rateSelect.value);});
document.querySelector('[data-chapter="0"]').addEventListener('click',()=>{audio.currentTime=0;lastFrame=-1;renderAt(0);showControls();});

let controlsTimer=0;
function showControls(){
  window.clearTimeout(controlsTimer);
  shell.classList.remove('controls-hidden');
  if(document.fullscreenElement)controlsTimer=window.setTimeout(()=>shell.classList.add('controls-hidden'),3200);
}
function hideControls(){window.clearTimeout(controlsTimer);shell.classList.add('controls-hidden');}
document.querySelector('#fullscreen-toggle').addEventListener('click',async()=>{
  if(!document.fullscreenElement){try{await shell.requestFullscreen();}catch(error){audioState.textContent='Fullscreen is not available in this browser.';}}
  else await document.exitFullscreen();
});
document.addEventListener('fullscreenchange',()=>{
  const inFullscreen = Boolean(document.fullscreenElement);
  shell.classList.toggle('fullscreen',inFullscreen);
  document.querySelector('#fullscreen-toggle').setAttribute('aria-label',inFullscreen?'Exit fullscreen':'Enter fullscreen');
  if(document.fullscreenElement){showControls();window.setTimeout(resizeWebGL,50);}
  else{window.clearTimeout(controlsTimer);shell.classList.remove('controls-hidden');window.setTimeout(resizeWebGL,50);}
});
shell.addEventListener('pointerdown',event=>{if(event.target.closest('.player-controls,.chapter-rail')){showControls();return;}if(document.fullscreenElement){if(shell.classList.contains('controls-hidden'))showControls();else hideControls();}});
shell.addEventListener('mousemove',()=>{if(document.fullscreenElement)showControls();});
window.addEventListener('keydown',event=>{
  if(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLButtonElement)return;
  if(event.code==='Space'){event.preventDefault();playButton.click();}
  if(event.key==='f'||event.key==='F')document.querySelector('#fullscreen-toggle').click();
  if(event.key==='ArrowRight'){audio.currentTime=Math.min(CHAPTER_END,audio.currentTime+5);lastFrame=-1;renderAt(audio.currentTime);}
  if(event.key==='ArrowLeft'){audio.currentTime=Math.max(0,audio.currentTime-5);lastFrame=-1;renderAt(audio.currentTime);}
});
window.addEventListener('resize',()=>{resizeWebGL();renderAt(audio.paused?audio.currentTime:Math.min(audio.currentTime,CHAPTER_END));});
if ('ResizeObserver' in window) new ResizeObserver(()=>{resizeWebGL();renderAt(audio.paused?audio.currentTime:Math.min(audio.currentTime,CHAPTER_END));}).observe(film);

renderAt(0);
requestAnimationFrame(tick);
