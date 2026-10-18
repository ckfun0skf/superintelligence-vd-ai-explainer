import * as THREE from 'three';
import './style.css';

const stage = document.querySelector('#stage');
const canvas = document.querySelector('#scene-canvas');
const audio = document.querySelector('#preview-audio');
const sceneOne = document.querySelector('#scene-one');
const tokenStory = document.querySelector('#token-story');
const playButton = document.querySelector('#play-button');
const playLabel = document.querySelector('#play-label');
const playGlyph = document.querySelector('#play-glyph');
const timeline = document.querySelector('#timeline');
const currentTimeReadout = document.querySelector('#current-time');
const totalTimeReadout = document.querySelector('#total-time');
const assistantCard = document.querySelector('#assistant-card');
const assistantHeader = document.querySelector('#assistant-header');
const userMessage = document.querySelector('#user-message');
const promptText = document.querySelector('#prompt-text');
const composer = document.querySelector('#composer');
const composerPlaceholder = document.querySelector('#composer-placeholder');
const composerPrompt = document.querySelector('#composer-prompt');
const cursor = document.querySelector('#typing-cursor');
const composerSend = document.querySelector('#composer-send');
const aiWorking = document.querySelector('#ai-working');
const thinkingOrb = document.querySelector('#thinking-orb');
const answerMessage = document.querySelector('#answer-message');
const dayOne = document.querySelector('#day-one');
const dayTwo = document.querySelector('#day-two');
const answerFootnote = document.querySelector('#answer-footnote');
const toolDock = document.querySelector('#tool-dock');
const reviewCaption = document.querySelector('#review-caption');
const zoomPrompt = document.querySelector('#zoom-prompt');
const wordStream = document.querySelector('#word-stream');
const categoryRack = document.querySelector('#category-rack');
const flightLayer = document.querySelector('#flight-layer');
const tokenParticleGlow = document.querySelector('#token-particle-glow');

const DURATION = 55.6;
const FPS = 24;
const SECTION_TWO_START = 24.4;
const SECTION_TWO_DURATION = 31.2;
const PROMPT = 'Plan a two-day weekend in Taipei. My budget is eight thousand dollars, and I love nature.';
const CAPTIONS = [
  { start: 1.5, end: 4.0, text: 'Imagine typing this into an AI assistant.' },
  { start: 4.0, end: 6.6, text: 'Plan a two-day weekend in Taipei.' },
  { start: 6.6, end: 10.0, text: 'My budget is eight thousand dollars, and I love nature.' },
  { start: 10.0, end: 12.9, text: 'The assistant replies with an itinerary.' },
  { start: 12.9, end: 16.6, text: 'A simple exchange—but how did those words become an answer?' },
  { start: 16.6, end: 21.2, text: 'And if the assistant can do more than answer, how does it know when to use a tool?' },
  { start: 21.2, end: 24.4, text: "Let's follow the request, one step at a time." },
  { start: 24.4, end: 29.9, text: 'A language model does not usually process a sentence as one complete object.' },
  { start: 29.9, end: 34.5, text: 'A tokenizer breaks the text into smaller pieces called tokens.' },
  { start: 34.5, end: 40.5, text: 'A token might be a whole word, part of a word, punctuation, or another piece of text.' },
  { start: 40.5, end: 44.0, text: 'The exact pieces depend on the tokenizer and the language.' },
  { start: 44.0, end: 48.9, text: 'The tokens are then represented as numbers, so the model can work with them.' },
  { start: 48.9, end: 55.6, text: 'Tokens are building blocks for processing text, but a token is not by itself a complete idea.' },
];

const WORD_ROWS = [
  [
    ['Plan', 'plan'], ['a', 'a'], ['two', 'two'], ['-', 'hyphen'], ['day', 'day'],
    ['weekend', 'weekend'], ['in', 'in'], ['Taipei', 'taipei'], ['.', 'period-0'],
  ],
  [
    ['My', 'my'], ['budget', 'budget'], ['is', 'is'], ['eight', 'eight'], ['thousand', 'thousand'],
    ['dollars', 'dollars'], [',', 'comma'], ['and', 'and'], ['I', 'i'], ['love', 'love'], ['nature', 'nature'], ['.', 'period-1'],
  ],
];

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smoothstep = (start, end, value) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};
const lerp = (a, b, t) => a + (b - a) * t;
const fmtTime = (seconds) => {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Keep the token candidates and target slots stable so every seek rebuilds the same composition.
const wordNodes = new Map();
let wordIndex = 0;
WORD_ROWS.forEach((row, rowIndex) => {
  const line = document.createElement('div');
  line.className = 'word-line';
  line.dataset.row = String(rowIndex);
  row.forEach(([text, key]) => {
    const word = document.createElement('span');
    word.className = `word-unit${['.', ',', '-'].includes(text) ? ' punctuation' : ''}`;
    word.textContent = text;
    word.dataset.word = key;
    word.dataset.index = String(wordIndex);
    word.style.setProperty('--word-order', String(wordIndex));
    line.append(word);
    wordNodes.set(key, word);
    wordIndex += 1;
  });
  wordStream.append(line);
});

const flights = [
  { source: 'weekend', target: 'slot-weekend', id: 'id-weekend', text: 'weekend', start: 12.2, widthFactor: 1, offset: -5 },
  { source: 'taipei', target: 'slot-tai', id: 'id-tai', text: 'Tai', start: 12.55, widthFactor: 0.5, offset: -13 },
  { source: 'taipei', target: 'slot-pei', id: 'id-pei', text: 'pei', start: 12.82, widthFactor: 0.5, offset: 13 },
  { source: 'period-0', target: 'slot-period', id: 'id-period', text: '.', start: 13.12, widthFactor: 1, offset: 1 },
];
flights.forEach((flight) => {
  const node = document.createElement('span');
  node.className = `flight-token${flight.text === '.' ? ' punctuation' : ''}`;
  node.textContent = flight.text;
  node.setAttribute('aria-hidden', 'true');
  flightLayer.append(node);
  flight.node = node;
  flight.sourceNode = wordNodes.get(flight.source);
  flight.targetNode = document.querySelector(`#${flight.target}`);
  flight.idNode = document.querySelector(`#${flight.id}`);
});

// Fixed seed drives both the static star field and absolute-time particle motion.
let seed = 0xA17E2026;
function seededRandom() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}

let renderer;
let camera;
let stars;
let network;
let gridMaterial;
let sparkCloud;
let sparkPositions;
let sparkGeometry;
let sparkMaterial;
let sparkParams = [];
let failedWebGL = false;

try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x050812, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 80);
  camera.position.set(0, 0, 11);

  const starPositions = new Float32Array(420 * 3);
  for (let i = 0; i < 420; i += 1) {
    starPositions[i * 3] = (seededRandom() - 0.5) * 27;
    starPositions[i * 3 + 1] = (seededRandom() - 0.5) * 15;
    starPositions[i * 3 + 2] = -12 + seededRandom() * 9;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: 0x83bbc3, size: 0.025, sizeAttenuation: true,
    transparent: true, opacity: 0.42, depthWrite: false,
  });
  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  const nodePoints = [
    [-6.6, 2.8, -2.2], [-3.3, 1.5, -1.6], [0.2, 2.2, -2.4], [4.2, 1.3, -1.7],
    [-5.1, -0.5, -2], [-1.4, -1.5, -1.5], [2.5, -0.5, -2.2], [5.6, -1.8, -2.5],
    [-4.0, -3.8, -1.6], [-0.2, -4.2, -2.5], [3.7, -3.5, -1.8],
  ];
  const linkPairs = [[0,1],[1,2],[2,3],[0,4],[1,5],[2,6],[3,6],[4,5],[5,6],[6,7],[4,8],[5,9],[6,10],[8,9],[9,10]];
  const linePositions = [];
  for (const [a, b] of linkPairs) linePositions.push(...nodePoints[a], ...nodePoints[b]);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  network = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x5aa9ad, transparent: true, opacity: 0.09, depthWrite: false }));
  scene.add(network);

  const gridPositions = [];
  for (let x = -9; x <= 9; x += 1) gridPositions.push(x, -5, -3.5, x, 5, -3.5);
  for (let y = -5; y <= 5; y += 1) gridPositions.push(-9, y, -3.5, 9, y, -3.5);
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  gridMaterial = new THREE.LineBasicMaterial({ color: 0x456b7b, transparent: true, opacity: 0.035, depthWrite: false });
  scene.add(new THREE.LineSegments(gridGeometry, gridMaterial));

  const sparkCount = 150;
  sparkPositions = new Float32Array(sparkCount * 3);
  sparkParams = Array.from({ length: sparkCount }, () => ({
    phase: seededRandom() * Math.PI * 2,
    radius: 0.4 + seededRandom() * 5.2,
    speed: 0.25 + seededRandom() * 0.8,
    height: 0.3 + seededRandom() * 1.7,
    drift: seededRandom() * 0.8,
  }));
  sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  sparkMaterial = new THREE.PointsMaterial({
    color: 0x8fe9df, size: 0.045, sizeAttenuation: true,
    transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  sparkCloud = new THREE.Points(sparkGeometry, sparkMaterial);
  scene.add(sparkCloud);

  function resizeRenderer() {
    renderer.setSize(1920, 1080, false);
    camera.aspect = 16 / 9;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', () => {
    resizeRenderer();
    renderAt(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
  }, { passive: true });
  resizeRenderer();
  window.__sectionScene = { scene, camera, renderer };
} catch (error) {
  failedWebGL = true;
  console.error('Three.js scene could not initialize:', error);
  canvas.hidden = true;
}

function reveal(element, amount, y = 8, scale = 0.98) {
  const p = clamp(amount);
  element.style.opacity = p.toFixed(3);
  element.style.transform = `translateY(${((1 - p) * y).toFixed(2)}px) scale(${lerp(scale, 1, p).toFixed(3)})`;
}

function elementCenterInStage(element) {
  const stageRect = stage.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - stageRect.left + rect.width / 2,
    y: rect.top - stageRect.top + rect.height / 2,
    width: rect.width,
  };
}

function updateFlights(sectionTwoTime) {
  const sourceFade = new Map();
  flights.forEach((flight) => {
    const p = smoothstep(flight.start, flight.start + 1.45, sectionTwoTime);
    const active = smoothstep(flight.start - 0.12, flight.start + 0.08, sectionTwoTime)
      * (1 - smoothstep(flight.start + 1.25, flight.start + 1.5, sectionTwoTime));
    const start = elementCenterInStage(flight.sourceNode);
    const target = elementCenterInStage(flight.targetNode);
    const startX = start.x + flight.offset;
    const startY = start.y;
    const endX = target.x;
    const endY = target.y;
    const arc = Math.sin(Math.PI * p) * Math.min(stage.clientHeight * 0.13, 84);
    const x = lerp(startX, endX, p);
    const y = lerp(startY, endY, p) - arc;
    const width = Math.max(24, start.width * flight.widthFactor);
    flight.node.style.width = `${width}px`;
    flight.node.style.left = `${x - width / 2}px`;
    flight.node.style.top = `${y - 15}px`;
    flight.node.style.opacity = active.toFixed(3);
    flight.node.style.transform = `rotate(${((1 - p) * (flight.text === '.' ? 10 : -5)).toFixed(2)}deg) scale(${lerp(1.1, 0.92, p).toFixed(3)})`;
    flight.node.style.setProperty('--flight-glow', String(active));

    const existingFade = sourceFade.get(flight.source) ?? 0;
    sourceFade.set(flight.source, Math.max(existingFade, smoothstep(flight.start - 0.2, flight.start + 0.45, sectionTwoTime)));
    const landed = smoothstep(flight.start + 1.05, flight.start + 1.5, sectionTwoTime);
    flight.targetNode.style.opacity = landed.toFixed(3);
    const idReveal = smoothstep(19.6, 20.4, sectionTwoTime);
    flight.idNode.style.opacity = idReveal.toFixed(3);
    flight.idNode.style.transform = `translateY(${lerp(5, 0, idReveal).toFixed(1)}px) scaleY(${lerp(0.55, 1, idReveal).toFixed(3)})`;
  });
  wordNodes.forEach((node, key) => {
    const fade = sourceFade.get(key) ?? 0;
    node.style.opacity = String(1 - fade * 0.92);
  });
}

function updateParticleField(time, sectionTwoTime) {
  if (!sparkCloud || !sparkMaterial) return;
  const assistantBurst = smoothstep(9.45, 10.25, time) * (1 - smoothstep(16.0, 17.5, time));
  const tokenBurst = smoothstep(0.0, 2.2, sectionTwoTime) * (1 - smoothstep(29.0, 31.2, sectionTwoTime));
  const intensity = Math.max(assistantBurst, tokenBurst * 0.92);
  sparkMaterial.opacity = 0.68 * intensity;
  sparkMaterial.size = 0.025 + 0.035 * intensity;

  const attr = sparkGeometry.attributes.position;
  for (let i = 0; i < sparkParams.length; i += 1) {
    const p = sparkParams[i];
    const orbitTime = time * p.speed;
    const angle = p.phase + orbitTime + sectionTwoTime * 0.05;
    const compression = 1 - smoothstep(0, 19, sectionTwoTime) * 0.56;
    const radius = p.radius * compression + Math.sin(orbitTime * 1.5 + p.phase) * (0.12 + 0.24 * intensity);
    const flow = Math.sin(orbitTime * 0.7 + p.phase) * 0.45;
    attr.array[i * 3] = Math.cos(angle) * radius + flow;
    attr.array[i * 3 + 1] = Math.sin(angle) * radius * 0.48 + Math.cos(orbitTime + p.phase) * p.height * 0.18;
    attr.array[i * 3 + 2] = -1.1 - p.drift * 1.8;
  }
  attr.needsUpdate = true;
}

/** Set the complete visual state from an absolute point on the narration clock. */
function renderAt(seconds) {
  const t = clamp(seconds, 0, DURATION);
  const sectionTwoTime = clamp(t - SECTION_TWO_START, 0, SECTION_TWO_DURATION);
  const sectionOneOpacity = 1 - smoothstep(23.8, 24.95, t);
  const sectionTwoOpacity = smoothstep(23.95, 24.95, t);
  sceneOne.style.opacity = sectionOneOpacity.toFixed(3);
  sceneOne.style.visibility = t >= 24.96 ? 'hidden' : 'visible';
  tokenStory.style.opacity = sectionTwoOpacity.toFixed(3);
  tokenStory.style.visibility = t < 23.95 ? 'hidden' : 'visible';

  // Section 01: assemble the assistant, type in the fixed bottom composer, send, then receive.
  const cardEntry = smoothstep(0.0, 1.55, t);
  assistantCard.style.setProperty('--card-entry', cardEntry.toFixed(3));
  assistantCard.style.setProperty('--edge-draw', smoothstep(0.12, 1.3, t).toFixed(3));
  assistantCard.style.transform = `translate(-50%, -50%) perspective(1400px) rotateX(${lerp(6, 0, cardEntry).toFixed(2)}deg) scale(${lerp(0.94, 1, cardEntry).toFixed(3)})`;
  assistantHeader.style.opacity = smoothstep(0.35, 1.1, t).toFixed(3);
  assistantHeader.style.transform = `translateY(${lerp(-8, 0, smoothstep(0.35, 1.1, t)).toFixed(2)}px)`;

  const composeEntry = smoothstep(0.75, 1.55, t);
  composer.style.opacity = composeEntry.toFixed(3);
  composer.style.transform = `translateY(${lerp(18, 0, composeEntry).toFixed(2)}px) scale(${lerp(0.98, 1, composeEntry).toFixed(3)})`;
  const typeProgress = clamp((t - 3.9) / (9.3 - 3.9));
  const typedCount = Math.floor(PROMPT.length * typeProgress);
  composerPrompt.textContent = PROMPT.slice(0, typedCount);
  composerPlaceholder.style.opacity = typeProgress > 0 && t < 10.15 ? '0' : '1';
  const typing = t >= 3.9 && t < 9.42;
  cursor.style.opacity = typing && Math.floor(t * 2.2) % 2 === 0 ? '1' : '0';
  cursor.style.transform = `scaleY(${0.8 + 0.2 * Math.sin(t * 3.5) ** 2})`;
  const sent = smoothstep(9.42, 10.08, t);
  composerPrompt.style.opacity = (1 - sent).toFixed(3);
  composerSend.style.transform = `scale(${lerp(1, 1.32, smoothstep(9.35, 9.72, t))}) rotate(${lerp(0, -35, smoothstep(9.42, 9.78, t)).toFixed(1)}deg)`;
  composerSend.style.filter = `brightness(${1 + 0.7 * (smoothstep(9.42, 9.6, t) * (1 - smoothstep(9.75, 10.08, t)))})`;

  promptText.textContent = t >= 9.55 ? PROMPT : '';
  const bubble = smoothstep(9.75, 10.48, t);
  reveal(userMessage, bubble, 26, 0.94);
  userMessage.style.transform = `translate(${lerp(72, 0, bubble).toFixed(2)}px, ${lerp(24, 0, bubble).toFixed(2)}px) scale(${lerp(0.88, 1, bubble).toFixed(3)})`;

  const loadingIn = smoothstep(10.15, 10.45, t);
  const loadingOut = 1 - smoothstep(11.2, 11.82, t);
  const loadingAmount = loadingIn * loadingOut;
  aiWorking.style.opacity = loadingAmount.toFixed(3);
  aiWorking.style.transform = `translate(${lerp(-38, 0, loadingIn).toFixed(2)}px, ${lerp(8, 0, loadingIn).toFixed(2)}px)`;
  thinkingOrb.style.transform = `rotate(${(t * 240).toFixed(1)}deg) scale(${1 + 0.11 * Math.sin(t * 4.4) ** 2})`;
  aiWorking.querySelectorAll('.working-dots i').forEach((dot, index) => {
    dot.style.transform = `translateY(${(Math.sin(t * 5 + index * 1.9) * 3).toFixed(2)}px) scale(${(0.72 + 0.28 * (0.5 + 0.5 * Math.sin(t * 5 + index * 1.9))).toFixed(3)})`;
    dot.style.opacity = String(0.38 + 0.62 * (0.5 + 0.5 * Math.sin(t * 5 + index * 1.9)));
  });

  const response = smoothstep(11.48, 12.25, t);
  reveal(answerMessage, response, 28, 0.96);
  [dayOne, dayTwo, answerFootnote].forEach((element, index) => {
    const p = smoothstep(12.55 + index * 0.55, 13.35 + index * 0.55, t);
    element.style.opacity = p.toFixed(3);
    element.style.transform = `translate(${lerp(-18 + index * 8, 0, p).toFixed(2)}px, ${lerp(16, 0, p).toFixed(2)}px) scale(${lerp(0.97, 1, p).toFixed(3)})`;
  });
  const toolReveal = smoothstep(16.55, 17.65, t);
  toolDock.style.opacity = toolReveal.toFixed(3);
  toolDock.style.transform = `translateY(${lerp(24, 0, toolReveal).toFixed(2)}px) scale(${lerp(0.92, 1, toolReveal).toFixed(3)})`;
  toolDock.querySelectorAll('.tool-chip').forEach((chip, index) => {
    const p = smoothstep(16.8 + index * 0.3, 17.45 + index * 0.3, t);
    chip.style.opacity = p.toFixed(3);
    chip.style.transform = `translateY(${lerp(18, 0, p).toFixed(2)}px) rotate(${lerp(index % 2 ? 5 : -5, 0, p).toFixed(2)}deg)`;
  });

  // Section 02: grow the submitted request, split it into word tiles, then send examples into bins.
  const zoomIn = smoothstep(0.08, 1.5, sectionTwoTime);
  const zoomOut = 1 - smoothstep(2.55, 3.8, sectionTwoTime);
  zoomPrompt.style.opacity = zoomOut.toFixed(3);
  const zoomTravel = smoothstep(0, 2.5, sectionTwoTime);
  zoomPrompt.style.left = `${lerp(63, 50, zoomTravel).toFixed(2)}%`;
  zoomPrompt.style.top = `${lerp(27, 42, zoomTravel).toFixed(2)}%`;
  zoomPrompt.style.transform = `translate(-50%, -50%) scale(${lerp(0.76, 1.08, smoothstep(0, 2.5, sectionTwoTime)).toFixed(3)}) rotateX(${lerp(5, 0, zoomIn).toFixed(2)}deg)`;
  zoomPrompt.querySelectorAll('p').forEach((line, index) => {
    line.style.transform = `translateX(${lerp(index ? 45 : -45, 0, smoothstep(0.25, 2.2, sectionTwoTime)).toFixed(2)}px)`;
  });

  const wordStreamIn = smoothstep(4.2, 5.0, sectionTwoTime);
  const wordStreamSettle = smoothstep(4.6, 5.8, sectionTwoTime);
  wordStream.style.opacity = wordStreamIn.toFixed(3);
  wordStream.style.transform = `translateY(${lerp(38, 0, wordStreamIn).toFixed(2)}px) scale(${lerp(0.95, 1, wordStreamSettle).toFixed(3)})`;
  const allWords = [...wordStream.querySelectorAll('.word-unit')];
  allWords.forEach((word, index) => {
    const revealStart = 4.6 + index * 0.13;
    const p = smoothstep(revealStart, revealStart + 0.35, sectionTwoTime);
    word.style.opacity = p.toFixed(3);
    word.style.transform = `translateY(${lerp(24, 0, p).toFixed(2)}px) scale(${lerp(0.86, 1, p).toFixed(3)})`;
    const boxProgress = smoothstep(5.7, 8.7, sectionTwoTime);
    word.style.setProperty('--tile-border', String(boxProgress));
    word.style.setProperty('--tile-glow', String(boxProgress * (0.25 + 0.75 * Math.sin(sectionTwoTime * 3.2 + index * 0.8) ** 2)));
  });

  const rackIn = smoothstep(9.4, 10.7, sectionTwoTime);
  categoryRack.style.opacity = rackIn.toFixed(3);
  categoryRack.style.transform = `translateY(${lerp(54, 0, rackIn).toFixed(2)}px) scale(${lerp(0.91, 1, rackIn).toFixed(3)})`;
  categoryRack.querySelectorAll('.category-box').forEach((box, index) => {
    const p = smoothstep(9.7 + index * 0.25, 10.75 + index * 0.25, sectionTwoTime);
    const pulse = 1 + 0.012 * Math.sin(sectionTwoTime * 2.1 + index * 1.4) ** 2 * rackIn;
    box.style.opacity = p.toFixed(3);
    box.style.transform = `translateY(${lerp(15, 0, p).toFixed(2)}px) scale(${(lerp(0.97, 1, p) * pulse).toFixed(3)})`;
    box.style.setProperty('--box-energy', String(p * (0.35 + 0.65 * Math.sin(sectionTwoTime * 2 + index) ** 2)));
  });

  updateFlights(sectionTwoTime);
  const focus = smoothstep(0, 11.5, sectionTwoTime) * (1 - smoothstep(26.5, 30.5, sectionTwoTime));
  tokenParticleGlow.style.opacity = (focus * 0.82).toFixed(3);
  tokenParticleGlow.style.transform = `translate(-50%, -50%) scale(${lerp(0.55, 1.35, smoothstep(0, 12, sectionTwoTime)).toFixed(3)})`;

  const activeCaption = CAPTIONS.find((item) => t >= item.start && t < item.end);
  reviewCaption.textContent = activeCaption ? activeCaption.text : '';
  const captionOpacity = activeCaption
    ? Math.min(smoothstep(activeCaption.start, activeCaption.start + 0.18, t), smoothstep(activeCaption.end, activeCaption.end - 0.18, t))
    : 0;
  reviewCaption.style.opacity = captionOpacity.toFixed(3);

  if (renderer && camera && !failedWebGL) {
    stars.rotation.y = 0.0015 * t;
    stars.rotation.x = 0.0015 * Math.sin(t * 0.18);
    network.rotation.z = 0.0025 * Math.sin(t * 0.25);
    network.material.opacity = 0.035 + 0.025 * Math.sin(t * 0.7) ** 2;
    gridMaterial.opacity = 0.025 + 0.012 * Math.sin(t * 0.4) ** 2;
    camera.position.z = 11 + 0.65 * smoothstep(20.4, 24.4, t);
    camera.position.y = -0.035 * smoothstep(20.4, 24.4, t);
    camera.lookAt(0, 0, -1.8);
    updateParticleField(t, sectionTwoTime);
    renderer.render(window.__sectionScene.scene, camera);
  }
}

function updatePlayer() {
  const t = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : DURATION;
  timeline.max = String(duration);
  timeline.value = String(Math.min(t, duration));
  currentTimeReadout.textContent = fmtTime(t);
  totalTimeReadout.textContent = fmtTime(duration);
  playLabel.textContent = audio.paused ? 'Play' : 'Pause';
  playGlyph.textContent = audio.paused ? '▶' : 'Ⅱ';
  playButton.setAttribute('aria-label', audio.paused ? 'Play video preview' : 'Pause video preview');
  renderAt(t);
}

playButton.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  } else {
    audio.pause();
  }
  updatePlayer();
});

audio.addEventListener('timeupdate', updatePlayer);
audio.addEventListener('loadedmetadata', updatePlayer);
audio.addEventListener('play', updatePlayer);
audio.addEventListener('pause', updatePlayer);
audio.addEventListener('ended', updatePlayer);
audio.addEventListener('error', () => console.error('Preview audio failed to load:', audio.error));

timeline.addEventListener('input', () => {
  const nextTime = Number(timeline.value);
  audio.currentTime = nextTime;
  renderAt(nextTime);
  currentTimeReadout.textContent = fmtTime(nextTime);
});

document.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' || ['BUTTON', 'INPUT', 'SELECT'].includes(document.activeElement?.tagName)) return;
  event.preventDefault();
  playButton.click();
});

// The audio clock is authoritative; any seek reconstructs the same frame and DOM transforms.
function tick() {
  if (!audio.paused) renderAt(audio.currentTime);
  requestAnimationFrame(tick);
}

window.renderAt = renderAt;
window.renderFrame = (frame) => renderAt(frame / FPS);
window.previewTimeline = { fps: FPS, duration: DURATION, renderAt, audioClock: audio };

renderAt(0);
updatePlayer();
requestAnimationFrame(tick);
