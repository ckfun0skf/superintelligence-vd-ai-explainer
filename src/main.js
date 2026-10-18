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
const conversation = document.querySelector('#conversation');
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
const tokenField = document.querySelector('#token-field');
const categoryRack = document.querySelector('#category-rack');
const flightLayer = document.querySelector('#flight-layer');
const tokenParticleGlow = document.querySelector('#token-particle-glow');

const DURATION = 55.6;
const FPS = 24;
const SECTION_TWO_START = 24.4;
const SECTION_TWO_DURATION = 31.2;
const PROMPT_TRANSITION_START = 23.8;
const TOKENIZE_START = 3.0;
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

// Keep the prompt sentence in its bubble; animated token copies move into a separate central field.
const wordNodes = new Map();
const sourceNodes = new Map();
let flights = [];
let tokenAnimations = [];
let tokenCloneLayer = null;
let promptPhase = 'chat';
let promptSourceBox = null;
let tokenRowsBuilt = false;
let tileOrder = 0;

function resetFlightNodes(removeAnchors = false) {
  flights.forEach((flight) => {
    if (flight.sourceParent && flight.sourceNode.parentElement !== flight.sourceParent) {
      const before = flight.placeholder?.parentElement === flight.sourceParent
        ? flight.placeholder.nextSibling
        : null;
      flight.sourceParent.insertBefore(flight.sourceNode, before);
    }
    if (flight.placeholder) {
      if (removeAnchors) {
        flight.placeholder.remove();
        flight.placeholder = null;
      } else {
        flight.placeholder.style.display = 'none';
      }
    }
    if (flight.targetNode) flight.targetNode.replaceChildren();
    flight.sourceNode.classList.remove('flight-token', 'token-slot');
    flight.sourceNode.classList.add('token-copy');
    ['position', 'left', 'top', 'width', 'height', 'min-height', 'font-size', 'opacity', 'transform', 'margin', 'padding', 'box-sizing', 'z-index', 'border-radius', 'background', 'border-color']
      .forEach((property) => flight.sourceNode.style.removeProperty(property));
    flight.sourceNode.style.removeProperty('--tile-border');
    flight.sourceNode.style.removeProperty('--tile-glow');
    flight.sourceNode.style.removeProperty('--copy-progress');
  });
}

function makeSourceLine(row) {
  const line = document.createElement('span');
  line.className = 'prompt-line source-line';
  row.forEach(([text, key], index) => {
    const source = document.createElement('span');
    source.className = `source-word${['.', ',', '-'].includes(text) ? ' punctuation' : ''}`;
    source.dataset.word = key;
    source.textContent = text;
    line.append(source);
    sourceNodes.set(key, source);
    const nextText = row[index + 1]?.[0];
    if (nextText && text !== '-' && nextText !== '-' && nextText !== '.' && nextText !== ',') {
      line.append(document.createTextNode(' '));
    }
  });
  return line;
}

function setZoomPhraseMarkup() {
  resetFlightNodes(true);
  tokenField.replaceChildren();
  tokenCloneLayer = null;
  tokenAnimations = [];
  tokenRowsBuilt = false;
  wordNodes.clear();
  sourceNodes.clear();
  flights = [];
  promptText.className = 'prompt-text zoom-text';
  promptText.replaceChildren(...WORD_ROWS.map((row) => makeSourceLine(row)));
}

function makeTaipeiGroup(kind) {
  const isCopy = kind === 'copy';
  const group = document.createElement('span');
  group.className = isCopy ? 'taipei-token-group taipei-copy-group' : 'taipei-token-group taipei-destination-group';
  const whole = document.createElement('span');
  whole.className = `word-unit taipei-whole ${isCopy ? 'token-copy' : 'token-destination'}`;
  whole.dataset.word = 'taipei-whole';
  whole.textContent = 'Taipei';
  const pieces = document.createElement('span');
  pieces.className = `taipei-pieces${isCopy ? ' token-copy-pieces' : ''}`;
  const tai = document.createElement('span');
  tai.className = `word-piece ${isCopy ? 'token-copy' : 'token-destination'}`;
  tai.dataset.word = 'taipei-tai';
  tai.textContent = 'Tai';
  const pei = document.createElement('span');
  pei.className = `word-piece ${isCopy ? 'token-copy' : 'token-destination'}`;
  pei.dataset.word = 'taipei-pei';
  pei.textContent = 'pei';
  pieces.append(tai, pei);
  group.append(whole, pieces);
  return { group, whole, pieces, tai, pei };
}

function buildTokenRows() {
  resetFlightNodes(true);
  wordNodes.clear();
  tokenAnimations = [];
  flights = [];
  tileOrder = 0;
  tokenField.replaceChildren();
  const layout = document.createElement('div');
  layout.className = 'token-rows';
  tokenCloneLayer = document.createElement('div');
  tokenCloneLayer.className = 'token-copy-layer';
  let copyOrder = 0;

  WORD_ROWS.forEach((row, rowIndex) => {
    const line = document.createElement('div');
    line.className = 'token-row';
    line.dataset.row = String(rowIndex);
    row.forEach(([text, key]) => {
      let destination;
      let copy;
      if (key === 'taipei') {
        const destinationParts = makeTaipeiGroup('destination');
        const copyParts = makeTaipeiGroup('copy');
        destination = destinationParts.group;
        copy = copyParts.group;
        wordNodes.set('taipei', copy);
        wordNodes.set('taipei-whole', copyParts.whole);
        wordNodes.set('taipei-tai', copyParts.tai);
        wordNodes.set('taipei-pei', copyParts.pei);
      } else {
        const punctuation = ['.', ',', '-'].includes(text) ? ' punctuation' : '';
        destination = document.createElement('span');
        destination.className = `word-unit token-destination${punctuation}`;
        destination.dataset.word = key;
        destination.textContent = text;
        copy = document.createElement('span');
        copy.className = `word-unit token-copy${punctuation}`;
        copy.dataset.word = key;
        copy.textContent = text;
        wordNodes.set(key, copy);
      }
      line.append(destination);
      tokenCloneLayer.append(copy);
      tokenAnimations.push({
        key,
        sourceNode: sourceNodes.get(key),
        copyNode: copy,
        destinationNode: destination,
        start: TOKENIZE_START + copyOrder * 0.16,
        order: copyOrder,
      });
      copyOrder += 1;
      tileOrder += 1;
    });
    layout.append(line);
  });
  tokenField.append(layout, tokenCloneLayer);

  flights = [
    { sourceKey: 'weekend', target: 'slot-weekend', id: 'id-weekend', start: 12.2, offset: -5 },
    { sourceKey: 'taipei-tai', target: 'slot-tai', id: 'id-tai', start: 12.55, offset: -8 },
    { sourceKey: 'taipei-pei', target: 'slot-pei', id: 'id-pei', start: 12.82, offset: 8 },
    { sourceKey: 'period-0', target: 'slot-period', id: 'id-period', start: 13.12, offset: 1 },
  ];
  flights.forEach((flight) => {
    flight.sourceNode = wordNodes.get(flight.sourceKey);
    flight.sourceParent = flight.sourceNode.parentElement;
    flight.targetNode = document.querySelector(`#${flight.target}`);
    flight.idNode = document.querySelector(`#${flight.id}`);
    flight.placeholder = null;
  });
  tokenRowsBuilt = true;
}

function capturePromptSourceBox() {
  const stageRect = stage.getBoundingClientRect();
  const sourceRect = userMessage.getBoundingClientRect();
  if (!stageRect.width || !stageRect.height) return;
  promptSourceBox = {
    x: (sourceRect.left - stageRect.left) / stageRect.width,
    y: (sourceRect.top - stageRect.top) / stageRect.height,
    width: sourceRect.width / stageRect.width,
    height: sourceRect.height / stageRect.height,
  };
}

function setPromptPhase(nextPhase, time) {
  if (nextPhase === promptPhase) return;
  if (promptPhase === 'tokenized') resetFlightNodes(true);

  if (nextPhase === 'chat') {
    conversation.append(userMessage);
    userMessage.classList.remove('zoomed-message');
    ['position', 'left', 'top', 'width', 'height', 'padding', 'border-radius', 'z-index'].forEach((property) => userMessage.style.removeProperty(property));
    promptText.className = 'prompt-text';
    ['position', 'left', 'top', 'width', 'font-size', 'text-align'].forEach((property) => promptText.style.removeProperty(property));
    promptText.textContent = time >= 9.55 ? PROMPT : '';
    tokenField.replaceChildren();
    tokenField.style.opacity = '0';
    zoomPrompt.replaceChildren(tokenField);
    promptSourceBox = null;
    tokenRowsBuilt = false;
    wordNodes.clear();
    sourceNodes.clear();
    tokenAnimations = [];
    tokenCloneLayer = null;
    flights = [];
  } else if (nextPhase === 'zoom' || nextPhase === 'tokenized') {
    if (promptPhase === 'chat') capturePromptSourceBox();
    zoomPrompt.insertBefore(userMessage, tokenField);
    userMessage.classList.add('zoomed-message');
    setZoomPhraseMarkup();
    if (nextPhase === 'tokenized') buildTokenRows();
  }
  promptPhase = nextPhase;
}

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

function updateTaipeiSplit(sectionTwoTime) {
  const animation = tokenAnimations.find((item) => item.key === 'taipei');
  if (!animation) return;
  const split = smoothstep(11.0, 11.95, sectionTwoTime);
  const fontSize = stage.clientWidth * 0.0162;
  const copyWhole = animation.copyNode.querySelector('.taipei-whole');
  const destinationWhole = animation.destinationNode.querySelector('.taipei-whole');
  const copyPieces = animation.copyNode.querySelector('.taipei-pieces');
  const destinationPieces = animation.destinationNode.querySelector('.taipei-pieces');

  [copyWhole, destinationWhole].forEach((whole) => {
    whole.style.width = 'auto';
    whole.style.paddingLeft = '';
    whole.style.paddingRight = '';
    const naturalWidth = whole.getBoundingClientRect().width;
    whole.style.width = `${(naturalWidth * (1 - split)).toFixed(2)}px`;
    whole.style.paddingLeft = `${(fontSize * 0.34 * (1 - split)).toFixed(2)}px`;
    whole.style.paddingRight = `${(fontSize * 0.34 * (1 - split)).toFixed(2)}px`;
    whole.style.opacity = (1 - split).toFixed(3);
  });
  [copyPieces, destinationPieces].forEach((pieces) => {
    pieces.style.maxWidth = `${(fontSize * 4.9 * split).toFixed(2)}px`;
    pieces.style.opacity = split.toFixed(3);
    pieces.style.visibility = split > 0.001 ? 'visible' : 'hidden';
    pieces.style.transform = `translateX(${lerp(-8, 0, split).toFixed(2)}px)`;
  });
}

function renderTokenCopies(sectionTwoTime) {
  if (!tokenCloneLayer || !tokenAnimations.length) return;
  resetFlightNodes();
  tokenField.style.opacity = smoothstep(TOKENIZE_START, TOKENIZE_START + 0.35, sectionTwoTime).toFixed(3);
  sourceNodes.forEach((source) => { source.style.opacity = '1'; });
  updateTaipeiSplit(sectionTwoTime);

  const fieldRect = tokenField.getBoundingClientRect();
  const targetFontSize = stage.clientWidth * 0.0162;
  tokenAnimations.forEach((animation) => {
    const { sourceNode, copyNode, destinationNode, start } = animation;
    const sourceRect = sourceNode.getBoundingClientRect();
    const targetRect = destinationNode.getBoundingClientRect();
    const progress = smoothstep(start, start + 0.6, sectionTwoTime);
    const visible = smoothstep(start, start + 0.1, sectionTwoTime);
    const sourceFontSize = Number.parseFloat(getComputedStyle(sourceNode).fontSize) || targetFontSize;
    const width = lerp(sourceRect.width, targetRect.width, progress);
    const height = lerp(sourceRect.height, targetRect.height, progress);
    const centerX = lerp(sourceRect.left - fieldRect.left + sourceRect.width / 2, targetRect.left - fieldRect.left + targetRect.width / 2, progress);
    const arc = Math.sin(Math.PI * progress) * Math.min(stage.clientHeight * 0.018, 16);
    const centerY = lerp(sourceRect.top - fieldRect.top + sourceRect.height / 2, targetRect.top - fieldRect.top + targetRect.height / 2, progress) + arc;

    copyNode.style.position = 'absolute';
    copyNode.style.left = `${(centerX - width / 2).toFixed(2)}px`;
    copyNode.style.top = `${(centerY - height / 2).toFixed(2)}px`;
    copyNode.style.width = `${Math.max(1, width).toFixed(2)}px`;
    copyNode.style.height = `${Math.max(1, height).toFixed(2)}px`;
    copyNode.style.minHeight = '0';
    copyNode.style.fontSize = `${lerp(sourceFontSize, targetFontSize, progress).toFixed(2)}px`;
    copyNode.style.padding = animation.key === 'taipei'
      ? '0'
      : `${(targetFontSize * 0.16 * progress).toFixed(2)}px ${(targetFontSize * 0.34 * progress).toFixed(2)}px`;
    copyNode.style.opacity = visible.toFixed(3);
    copyNode.style.visibility = sectionTwoTime < start ? 'hidden' : 'visible';
    copyNode.style.transform = `rotate(${lerp(-2.5, 0, progress).toFixed(2)}deg)`;
    copyNode.style.zIndex = animation.order < WORD_ROWS[0].length ? '4' : '2';
    copyNode.style.setProperty('--copy-progress', progress.toFixed(3));
    copyNode.style.setProperty('--tile-border', progress.toFixed(3));
    copyNode.style.setProperty('--tile-glow', String(progress * (0.2 + 0.28 * Math.sin(sectionTwoTime * 2.6 + animation.order) ** 2)));
    copyNode.querySelectorAll('.token-copy').forEach((piece) => {
      piece.style.setProperty('--copy-progress', progress.toFixed(3));
      piece.style.setProperty('--tile-border', progress.toFixed(3));
      piece.style.setProperty('--tile-glow', String(progress * 0.28));
    });

    const dim = smoothstep(start + 0.04, start + 0.42, sectionTwoTime);
    sourceNode.style.opacity = (1 - 0.8 * dim).toFixed(3);
  });
}

function updateFlights(sectionTwoTime) {
  if (!flights.length) return;
  const stageRect = stage.getBoundingClientRect();
  const idReveal = smoothstep(19.6, 20.4, sectionTwoTime);
  flights.forEach((flight) => {
    flight.idNode.style.opacity = idReveal.toFixed(3);
    flight.idNode.style.maxHeight = `${(2.35 * idReveal).toFixed(3)}cqw`;
    flight.idNode.style.paddingTop = `${(0.24 * idReveal).toFixed(3)}cqw`;
    flight.idNode.style.paddingBottom = `${(0.24 * idReveal).toFixed(3)}cqw`;
    flight.idNode.style.borderColor = `rgba(152,193,173,${(0.35 * idReveal).toFixed(3)})`;
    flight.idNode.style.transform = `scaleY(${lerp(0.72, 1, idReveal).toFixed(3)})`;

    if (sectionTwoTime < flight.start) return;
    const sourceRect = flight.sourceNode.getBoundingClientRect();
    const targetRect = flight.targetNode.getBoundingClientRect();
    const sourceFontSize = getComputedStyle(flight.sourceNode).fontSize;
    if (flight.sourceParent !== tokenCloneLayer && !flight.placeholder) {
      const placeholder = document.createElement('span');
      placeholder.className = 'token-placeholder';
      placeholder.style.width = `${flight.sourceNode.offsetWidth}px`;
      placeholder.style.height = `${flight.sourceNode.offsetHeight}px`;
      placeholder.style.display = 'none';
      flight.sourceParent.insertBefore(placeholder, flight.sourceNode);
      flight.placeholder = placeholder;
    }
    if (flight.placeholder) flight.placeholder.style.display = 'inline-block';

    const p = smoothstep(flight.start + 0.08, flight.start + 1.34, sectionTwoTime);
    const startX = sourceRect.left - stageRect.left + sourceRect.width / 2 + flight.offset;
    const startY = sourceRect.top - stageRect.top + sourceRect.height / 2;
    const endX = targetRect.left - stageRect.left + targetRect.width / 2;
    const endY = targetRect.top - stageRect.top + targetRect.height / 2;
    const arc = Math.sin(Math.PI * p) * Math.min(stage.clientHeight * 0.13, 84);
    const x = lerp(startX, endX, p);
    const y = lerp(startY, endY, p) + arc;
    if (p >= 0.999) {
      flight.targetNode.append(flight.sourceNode);
      flight.sourceNode.classList.remove('token-copy');
      flight.sourceNode.classList.add('token-slot');
      ['position', 'left', 'top', 'width', 'height', 'min-height', 'font-size', 'transform', 'margin', 'padding', 'box-sizing', 'z-index']
        .forEach((property) => flight.sourceNode.style.removeProperty(property));
      flight.sourceNode.style.removeProperty('--copy-progress');
      flight.sourceNode.style.opacity = '1';
      return;
    }

    flightLayer.append(flight.sourceNode);
    flight.sourceNode.classList.add('flight-token');
    flight.sourceNode.style.position = 'absolute';
    flight.sourceNode.style.left = `${x - sourceRect.width / 2}px`;
    flight.sourceNode.style.top = `${y - sourceRect.height / 2}px`;
    flight.sourceNode.style.width = `${sourceRect.width}px`;
    flight.sourceNode.style.height = `${sourceRect.height}px`;
    flight.sourceNode.style.minHeight = '0';
    flight.sourceNode.style.fontSize = sourceFontSize;
    flight.sourceNode.style.margin = '0';
    flight.sourceNode.style.opacity = '1';
    flight.sourceNode.style.transform = `rotate(${lerp(-4, 0, p).toFixed(2)}deg) scale(${lerp(1.06, 1, p).toFixed(3)})`;
    flight.sourceNode.style.zIndex = '8';
    flight.sourceNode.style.setProperty('--tile-glow', String(1 - p * 0.5));

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
  const sectionOneOpacity = 1 - smoothstep(PROMPT_TRANSITION_START, 24.95, t);
  sceneOne.style.opacity = sectionOneOpacity.toFixed(3);
  sceneOne.style.visibility = t >= 24.96 ? 'hidden' : 'visible';
  tokenStory.style.opacity = t < PROMPT_TRANSITION_START ? '0' : '1';
  tokenStory.style.visibility = t < PROMPT_TRANSITION_START ? 'hidden' : 'visible';

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
  composerSend.style.transform = `translateY(-50%) scale(${lerp(1, 1.32, smoothstep(9.35, 9.72, t))})`;
  composerSend.style.filter = `brightness(${1 + 0.7 * (smoothstep(9.42, 9.6, t) * (1 - smoothstep(9.75, 10.08, t)))})`;

  if (promptPhase === 'chat') promptText.textContent = t >= 9.55 ? PROMPT : '';
  const bubble = smoothstep(9.75, 10.48, t);
  reveal(userMessage, bubble, 26, 0.94);
  userMessage.style.transform = `translate(${lerp(72, 0, bubble).toFixed(2)}px, ${lerp(24, 0, bubble).toFixed(2)}px) scale(${lerp(0.88, 1, bubble).toFixed(3)})`;
  const nextPromptPhase = t < PROMPT_TRANSITION_START
    ? 'chat'
    : sectionTwoTime < TOKENIZE_START ? 'zoom' : 'tokenized';
  setPromptPhase(nextPromptPhase, t);

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

  // Section 02: enlarge the whole user bubble, then send word copies from it into a centered token field.
  zoomPrompt.style.opacity = promptPhase === 'chat' ? '0' : '1';
  if (promptPhase !== 'chat') {
    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    const p = smoothstep(PROMPT_TRANSITION_START, 26.45, t);
    const source = promptSourceBox ?? { x: 0.63, y: 0.25, width: 0.62, height: 0.08 };
    userMessage.style.left = `${lerp(source.x * stageWidth, stageWidth * 0.10, p).toFixed(2)}px`;
    userMessage.style.top = `${lerp(source.y * stageHeight, stageHeight * 0.215, p).toFixed(2)}px`;
    userMessage.style.width = `${lerp(source.width * stageWidth, stageWidth * 0.80, p).toFixed(2)}px`;
    userMessage.style.height = 'auto';
    userMessage.style.padding = `${lerp(0.8, 1.05, p).toFixed(3)}cqw ${lerp(1.05, 1.3, p).toFixed(3)}cqw ${lerp(0.95, 1.15, p).toFixed(3)}cqw`;
    userMessage.style.opacity = '1';
    userMessage.style.transform = 'none';
    promptText.style.position = 'relative';
    promptText.style.left = 'auto';
    promptText.style.top = 'auto';
    promptText.style.width = '100%';
    promptText.style.fontSize = `${lerp(1.12, 2.15, p).toFixed(3)}cqw`;
    promptText.style.textAlign = 'left';
    if (promptPhase === 'tokenized') renderTokenCopies(sectionTwoTime);
  } else {
    tokenField.style.opacity = '0';
  }

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
