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
const contextStory = document.querySelector('#context-story');
const contextLines = document.querySelector('#context-lines');
const typoLines = document.querySelector('#typo-lines');
const modelLines = document.querySelector('#model-lines');
const contextCore = document.querySelector('#context-core');
const contextLabel = document.querySelector('#context-label');
const attentionFocus = document.querySelector('#attention-focus');
const typoScene = document.querySelector('#typo-scene');
const typoSource = document.querySelector('#typo-source');
const likelyReading = document.querySelector('#likely-reading');
const uncertaintyIndicator = document.querySelector('#uncertainty-indicator');
const clarifyIndicator = document.querySelector('#clarify-indicator');
const modelStory = document.querySelector('#model-story');
const llmPrompt = document.querySelector('#llm-prompt');
const llmNetwork = document.querySelector('#llm-network');
const neuralWires = document.querySelector('#neural-wires');
const llmCandidates = document.querySelector('#llm-candidates');
const llmResponse = document.querySelector('#llm-response');
const llmContextReturn = document.querySelector('#llm-context-return');
const llmCache = document.querySelector('#llm-cache');
const llmShelf = document.querySelector('#llm-shelf');
const llmPatterns = document.querySelector('#llm-patterns');
const llmExternal = document.querySelector('#llm-external');

const DURATION = 177.4;
const FPS = 24;
const SECTION_TWO_START = 24.4;
const SECTION_TWO_DURATION = 31.2;
const SECTION_THREE_START = 55.6;
const SECTION_FOUR_START = 110.0;
const PROMPT_TRANSITION_START = 23.8;
const TOKENIZE_START = 3.0;
const TOKEN_COPY_STAGGER = 0.16;
const TOKEN_COPY_DURATION = 0.6;
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
  { start: 55.6, end: 58.3, text: 'The model has to use the pieces together.' },
  { start: 58.3, end: 68.4, text: 'In our example, two-day is about duration, Taipei gives a location, eight thousand sets a budget, and nature expresses a preference.' },
  { start: 68.4, end: 73.6, text: 'Modern language models use patterns in context to work out how the pieces relate.' },
  { start: 73.6, end: 80.8, text: 'Many use a design called a Transformer, whose attention mechanism helps weigh relationships between different parts of the input.' },
  { start: 80.8, end: 85.7, text: 'This is also why an AI can often make sense of a typo or imperfect grammar.' },
  { start: 85.7, end: 93.0, text: 'If you write, “Find me a quite place near Taipei,” the surrounding words make “quiet place” a likely meaning.' },
  { start: 93.0, end: 97.3, text: 'The model uses context and language patterns to infer what you may intend.' },
  { start: 97.3, end: 104.5, text: 'It does not need to perfectly correct the sentence first, but it is making a best-fit guess, not reading your mind.' },
  { start: 104.5, end: 109.8, text: 'If the context is unclear, it may guess wrong, so it should ask when the distinction matters.' },
  { start: 111.8, end: 121.36, text: 'A large language model, or LLM, is a neural network trained to recognize patterns in sequences of tokens and generate likely continuations.' },
  { start: 121.36, end: 126.1, text: 'When it writes a response, it generally predicts one token at a time.' },
  { start: 126.1, end: 130.3, text: 'For each step, it calculates which next tokens are plausible.' },
  { start: 130.3, end: 135.48, text: 'A decoding process selects one, and that token is added to the growing sequence.' },
  { start: 135.48, end: 142.94, text: 'The next prediction uses the original prompt together with everything generated so far, not just the last token.' },
  { start: 142.94, end: 149.32, text: 'Repeated many times, this loop produces a sentence, an itinerary, or a longer answer.' },
  { start: 149.32, end: 158.36, text: 'Systems can use techniques such as caching to avoid recalculating all the earlier work from scratch, but conceptually, the context keeps growing.' },
  { start: 158.36, end: 163.52, text: 'So an LLM is not usually retrieving one perfect answer from a shelf.' },
  { start: 163.52, end: 168.76, text: 'It is generating a response based on learned patterns and the context it has received.' },
  { start: 168.76, end: 177.2, text: 'That can work well for many requests, but it does not automatically give the model current facts or the ability to interact with other services.' },
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

const TOKEN_COPY_COUNT = WORD_ROWS.reduce((total, row) => total + row.length, 0);
const TOKEN_COPY_COMPLETE = TOKENIZE_START + (TOKEN_COPY_COUNT - 1) * TOKEN_COPY_STAGGER + TOKEN_COPY_DURATION;
const BUBBLE_FADE_START = TOKEN_COPY_COMPLETE + 0.12;
const BUBBLE_FADE_END = BUBBLE_FADE_START + 0.85;
const SEMANTIC_RELATIONS = [
  { id: 'duration', node: 'concept-duration', keys: ['two', 'day'], reveal: 2.7 },
  { id: 'location', node: 'concept-location', keys: ['taipei-tai', 'taipei-pei'], reveal: 4.8 },
  { id: 'budget', node: 'concept-budget', keys: ['eight', 'thousand', 'dollars'], reveal: 6.9 },
  { id: 'preference', node: 'concept-preference', keys: ['nature'], reveal: 9.0 },
];
const svgPath = (svg, className) => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('pathLength', '1');
  className.split(/\s+/).filter(Boolean).forEach((name) => path.classList.add(name));
  svg.append(path);
  return path;
};
const semanticEdges = SEMANTIC_RELATIONS.flatMap((group) => group.keys.map((key) => ({
  group,
  key,
  path: svgPath(contextLines, `context-edge edge-${group.id}`),
})));
const contextEdges = SEMANTIC_RELATIONS.map((group) => ({
  from: document.getElementById(group.node),
  path: svgPath(contextLines, 'context-edge edge-core'),
}));
const typoEdges = ['typo-place', 'typo-near', 'typo-taipei'].map((id) => ({
  from: document.getElementById(id),
  path: svgPath(typoLines, 'typo-edge'),
}));
const typoSourceEdge = svgPath(typoLines, 'typo-edge typo-source-edge');
const modelEdges = [
  { from: llmPrompt, to: llmNetwork, className: 'llm-edge' },
  { from: llmNetwork, to: llmCandidates, className: 'llm-edge edge-choice' },
  { from: llmCandidates, to: llmResponse, className: 'llm-edge edge-choice' },
  { from: llmResponse, to: llmContextReturn, className: 'llm-edge edge-return' },
].map((edge) => ({ ...edge, path: svgPath(modelLines, edge.className) }));
const neuralWireNodes = [];
const neuralSignalNodes = [];
const NEURAL_LAYER_X = [9.5, 35.5, 61.5, 87.5];
const NEURAL_NODE_Y = [18, 39.3, 60.7, 82];

function buildNeuralMesh() {
  const namespace = 'http://www.w3.org/2000/svg';
  for (let layer = 0; layer < NEURAL_LAYER_X.length - 1; layer += 1) {
    NEURAL_NODE_Y.forEach((sourceY) => {
      const nearestTargets = NEURAL_NODE_Y
        .map((targetY, index) => ({ targetY, index, distance: Math.abs(targetY - sourceY) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      nearestTargets.forEach(({ targetY }) => {
        const line = document.createElementNS(namespace, 'line');
        line.setAttribute('x1', NEURAL_LAYER_X[layer]);
        line.setAttribute('y1', sourceY);
        line.setAttribute('x2', NEURAL_LAYER_X[layer + 1]);
        line.setAttribute('y2', targetY);
        line.dataset.layer = String(layer);
        line.classList.add('neural-wire');
        neuralWires.append(line);
        neuralWireNodes.push(line);
      });
    });
  }
  for (let index = 0; index < 3; index += 1) {
    const signal = document.createElementNS(namespace, 'circle');
    signal.setAttribute('r', '1.18');
    signal.classList.add('neural-signal');
    signal.dataset.phase = String(index / 3);
    neuralWires.append(signal);
    neuralSignalNodes.push(signal);
  }
}

buildNeuralMesh();

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smoothstep = (start, end, value) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};
const lerp = (a, b, t) => a + (b - a) * t;
const tokenFontSize = () => Math.min(stage.clientWidth * 0.019, 38);
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
    if (!removeAnchors && flight.activeAtCurrentTime) return;
    if (flight.sourceParent && flight.sourceNode.parentElement !== flight.sourceParent) {
      const before = flight.placeholder?.parentElement === flight.sourceParent
        ? flight.placeholder.nextSibling
        : null;
      flight.sourceParent.insertBefore(flight.sourceNode, before);
    }
    if (flight.placeholder) {
      flight.placeholder.remove();
      flight.placeholder = null;
    }
    if (flight.targetNode) flight.targetNode.replaceChildren();
    flight.sourceNode.classList.remove('flight-token', 'token-slot');
    flight.sourceNode.classList.add('token-copy');
    flight.startRect = null;
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
        start: TOKENIZE_START + copyOrder * TOKEN_COPY_STAGGER,
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
    flight.startRect = null;
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
  const fontSize = tokenFontSize();
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
    whole.style.paddingLeft = `${(fontSize * 0.42 * (1 - split)).toFixed(2)}px`;
    whole.style.paddingRight = `${(fontSize * 0.42 * (1 - split)).toFixed(2)}px`;
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
  flights.forEach((flight) => { flight.activeAtCurrentTime = sectionTwoTime >= flight.start; });
  resetFlightNodes(false);
  tokenField.style.opacity = smoothstep(TOKENIZE_START, TOKENIZE_START + 0.35, sectionTwoTime).toFixed(3);
  sourceNodes.forEach((source) => { source.style.opacity = '1'; });
  updateTaipeiSplit(sectionTwoTime);

  const fieldRect = tokenField.getBoundingClientRect();
  const targetFontSize = tokenFontSize();
  tokenAnimations.forEach((animation) => {
    const { sourceNode, copyNode, destinationNode, start } = animation;
    const activeFlight = flights.find((flight) => flight.sourceNode === copyNode && sectionTwoTime >= flight.start);
    if (activeFlight && copyNode.parentElement !== tokenCloneLayer) return;
    const sourceRect = sourceNode.getBoundingClientRect();
    const targetRect = destinationNode.getBoundingClientRect();
    const progress = smoothstep(start, start + TOKEN_COPY_DURATION, sectionTwoTime);
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
    copyNode.style.width = `${Math.max(0.1, width).toFixed(2)}px`;
    copyNode.style.height = `${Math.max(0.1, height).toFixed(2)}px`;
    copyNode.style.minHeight = '0';
    copyNode.style.fontSize = `${lerp(sourceFontSize, targetFontSize, progress).toFixed(2)}px`;
    copyNode.style.padding = animation.key === 'taipei'
      ? '0'
      : `${(targetFontSize * 0.22 * progress).toFixed(2)}px ${(targetFontSize * 0.42 * progress).toFixed(2)}px`;
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

function contextTokenNode(key) {
  const direct = tokenAnimations.find((animation) => animation.key === key);
  if (direct) return direct.destinationNode;
  if (key === 'taipei-tai' || key === 'taipei-pei') {
    const taipei = tokenAnimations.find((animation) => animation.key === 'taipei')?.destinationNode;
    return taipei?.querySelector(`[data-word="${key}"]`) ?? taipei;
  }
  return null;
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
    if (!flight.startRect) {
      const rect = flight.sourceNode.getBoundingClientRect();
      flight.startRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        fontSize: getComputedStyle(flight.sourceNode).fontSize,
      };
    }
    const sourceRect = flight.startRect;
    const targetRect = flight.targetNode.getBoundingClientRect();
    const sourceFontSize = sourceRect.fontSize;
    if (flight.sourceParent !== tokenCloneLayer && !flight.placeholder) {
      const placeholder = document.createElement('span');
      placeholder.className = 'token-placeholder';
      placeholder.style.width = `${sourceRect.width}px`;
      placeholder.style.height = `${sourceRect.height}px`;
      flight.sourceParent.insertBefore(placeholder, flight.sourceNode);
      flight.placeholder = placeholder;
    }
    if (flight.placeholder) flight.placeholder.style.display = 'inline-block';

    const p = smoothstep(flight.start + 0.08, flight.start + 1.34, sectionTwoTime);
    const startX = sourceRect.left - stageRect.left + sourceRect.width / 2 + flight.offset * p;
    const startY = sourceRect.top - stageRect.top + sourceRect.height / 2;
    const endX = targetRect.left - stageRect.left + targetRect.width / 2;
    const endY = targetRect.top - stageRect.top + targetRect.height / 2;
    const arc = Math.sin(Math.PI * p) * Math.min(stage.clientHeight * 0.13, 84);
    const x = lerp(startX, endX, p);
    const y = lerp(startY, endY, p) + arc;
    if (p >= 0.999) {
      flight.targetNode.append(flight.sourceNode);
      flight.sourceNode.classList.remove('token-copy');
      flight.sourceNode.classList.remove('flight-token');
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
    flight.sourceNode.style.transform = 'none';
    flight.sourceNode.style.zIndex = '8';

  });
}

function drawLink(path, from, to, progress, opacity) {
  if (!path || !from || !to || opacity <= 0.001) {
    if (path) path.style.opacity = '0';
    return;
  }
  const bounds = stage.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const sx = ((a.left + a.width / 2 - bounds.left) / bounds.width) * 1920;
  const sy = ((a.top + a.height / 2 - bounds.top) / bounds.height) * 1080;
  const tx = ((b.left + b.width / 2 - bounds.left) / bounds.width) * 1920;
  const ty = ((b.top + b.height / 2 - bounds.top) / bounds.height) * 1080;
  const bend = Math.min(110, Math.abs(ty - sy) * 0.2);
  const direction = ty >= sy ? -1 : 1;
  const cy = (sy + ty) / 2 + bend * direction;
  path.setAttribute('d', `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${sx.toFixed(1)} ${cy.toFixed(1)}, ${tx.toFixed(1)} ${cy.toFixed(1)}, ${tx.toFixed(1)} ${ty.toFixed(1)}`);
  path.style.strokeDashoffset = (1 - clamp(progress)).toFixed(3);
  path.style.opacity = clamp(opacity).toFixed(3);
}

function renderContextStory(time) {
  if (time < SECTION_THREE_START) {
    contextStory.style.opacity = '0';
    contextStory.style.visibility = 'hidden';
    return;
  }
  const local = time - SECTION_THREE_START;
  const enter = smoothstep(SECTION_THREE_START, SECTION_THREE_START + 0.65, time);
  const endFade = 1 - smoothstep(SECTION_FOUR_START - 0.8, SECTION_FOUR_START + 0.3, time);
  contextStory.style.visibility = 'visible';
  contextStory.style.opacity = (enter * endFade).toFixed(3);

  const rowHandoff = smoothstep(0.0, 0.8, local);
  tokenAnimations.forEach((animation) => {
    animation.destinationNode.style.visibility = 'visible';
    animation.destinationNode.style.opacity = rowHandoff.toFixed(3);
    animation.destinationNode.querySelectorAll('.token-destination').forEach((node) => { node.style.visibility = 'visible'; });
    animation.copyNode.style.opacity = (1 - rowHandoff).toFixed(3);
  });

  const semanticFade = 1 - smoothstep(24.0, 26.0, local);
  SEMANTIC_RELATIONS.forEach((group) => {
    const reveal = smoothstep(group.reveal, group.reveal + 0.8, local);
    const node = document.getElementById(group.node);
    const nodeOpacity = reveal * semanticFade;
    node.style.opacity = nodeOpacity.toFixed(3);
    node.style.transform = `translateY(${lerp(18, 0, reveal).toFixed(2)}px) scale(${lerp(0.95, 1, reveal).toFixed(3)})`;
    node.classList.toggle('is-active', local >= group.reveal + 0.75 && local < group.reveal + 2.6);
    group.keys.forEach((key) => {
      const source = contextTokenNode(key);
      const edge = semanticEdges.find((item) => item.group.id === group.id && item.key === key);
      drawLink(edge?.path, source, node, smoothstep(group.reveal + 0.2, group.reveal + 1.3, local), nodeOpacity);
    });
  });

  const coreIn = smoothstep(12.6, 13.5, local);
  const coreOpacity = coreIn * semanticFade;
  contextCore.style.opacity = coreOpacity.toFixed(3);
  contextCore.style.transform = `translate(-50%, ${lerp(10, 0, coreIn).toFixed(2)}px) scale(${lerp(0.92, 1, coreIn).toFixed(3)})`;
  contextLabel.textContent = local < 18.0 ? 'CONTEXT' : 'ATTENTION';
  contextEdges.forEach((edge) => {
    drawLink(edge.path, edge.from, contextCore, smoothstep(13.0, 15.0, local), coreOpacity * semanticFade);
  });

  const attentionIn = smoothstep(17.7, 18.8, local) * (1 - smoothstep(24.0, 25.5, local));
  const focusTargets = ['concept-budget', 'concept-preference', 'concept-location'];
  const focusPath = clamp((local - 18.2) / 5.6, 0, 0.999) * (focusTargets.length - 1);
  const focusIndex = Math.floor(focusPath);
  const focusMix = smoothstep(0, 1, focusPath - focusIndex);
  const firstRect = document.getElementById(focusTargets[focusIndex]).getBoundingClientRect();
  const secondRect = document.getElementById(focusTargets[Math.min(focusIndex + 1, focusTargets.length - 1)]).getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const focusX = lerp(firstRect.left + firstRect.width / 2, secondRect.left + secondRect.width / 2, focusMix) - stageRect.left;
  const focusY = lerp(firstRect.top + firstRect.height / 2, secondRect.top + secondRect.height / 2, focusMix) - stageRect.top;
  attentionFocus.style.left = `${focusX.toFixed(2)}px`;
  attentionFocus.style.top = `${focusY.toFixed(2)}px`;
  attentionFocus.style.opacity = attentionIn.toFixed(3);
  attentionFocus.style.transform = `translate(-50%,-50%) scale(${lerp(0.94, 1, attentionIn).toFixed(3)})`;

  const tokenFade = 1 - smoothstep(24.0, 26.0, local);
  tokenField.style.opacity = tokenFade.toFixed(3);
  const typoIn = smoothstep(24.7, 26.0, local);
  typoScene.style.opacity = (typoIn * endFade).toFixed(3);
  const typoFocus = smoothstep(24.9, 25.8, local) * (1 - smoothstep(29.2, 30.2, local));
  typoSource.style.transform = `scale(${lerp(0.96, 1.08, typoFocus).toFixed(3)})`;
  typoSource.style.boxShadow = `0 0 ${(0.5 + 1.0 * typoFocus).toFixed(2)}cqw rgba(229,151,119,${(0.08 + 0.22 * typoFocus).toFixed(3)})`;

  ['typo-place', 'typo-near', 'typo-taipei'].forEach((id, index) => {
    const word = document.getElementById(id);
    const wordIn = smoothstep(29.8 + index * 0.22, 30.6 + index * 0.22, local);
    word.style.opacity = wordIn.toFixed(3);
    word.style.background = `rgba(52,91,76,${(0.14 + 0.2 * wordIn).toFixed(3)})`;
  });
  const likelyIn = smoothstep(30.1, 31.3, local);
  likelyReading.style.opacity = (likelyIn * endFade).toFixed(3);
  likelyReading.style.transform = `translate(-50%, ${lerp(20, 0, likelyIn).toFixed(2)}px) scale(${lerp(0.94, 1, likelyIn).toFixed(3)})`;
  typoEdges.forEach((edge, index) => {
    const from = edge.from;
    const to = likelyReading;
    drawLink(edge.path, from, to, smoothstep(30.2 + index * 0.2, 31.3 + index * 0.2, local), likelyIn * endFade);
  });
  drawLink(typoSourceEdge, typoSource, likelyReading, smoothstep(30.0, 31.1, local), likelyIn * 0.82 * endFade);

  const uncertaintyIn = smoothstep(41.5, 42.6, local);
  uncertaintyIndicator.style.opacity = (uncertaintyIn * endFade).toFixed(3);
  uncertaintyIndicator.style.transform = `translate(-50%, ${lerp(16, 0, uncertaintyIn).toFixed(2)}px)`;
  const clarifyIn = smoothstep(48.7, 49.8, local);
  clarifyIndicator.style.opacity = (clarifyIn * endFade).toFixed(3);
  clarifyIndicator.style.transform = `translate(-50%, ${lerp(16, 0, clarifyIn).toFixed(2)}px)`;
}

function renderModelStory(time) {
  if (time < SECTION_FOUR_START) {
    modelStory.style.opacity = '0';
    modelStory.style.visibility = 'hidden';
    return;
  }
  const local = time - SECTION_FOUR_START;
  const endFade = 1 - smoothstep(DURATION - 0.22, DURATION, time);
  const enter = smoothstep(0, 1.15, local);
  modelStory.style.visibility = 'visible';
  modelStory.style.opacity = (enter * endFade).toFixed(3);

  const promptIn = smoothstep(0.35, 1.5, local);
  const networkIn = smoothstep(0.45, 1.8, local);
  llmPrompt.style.opacity = promptIn.toFixed(3);
  llmPrompt.style.transform = `translateX(${lerp(-1.4, 0, promptIn)}cqw)`;
  llmNetwork.style.opacity = networkIn.toFixed(3);
  llmNetwork.style.transform = `scale(${(1 + 0.012 * Math.sin(local * 1.25) ** 2).toFixed(3)})`;
  llmNetwork.querySelectorAll('.neural-column i').forEach((node, index) => {
    const layer = Math.floor(index / NEURAL_NODE_Y.length);
    const row = index % NEURAL_NODE_Y.length;
    const wave = (local * 0.18) % 1;
    const travelingActivation = Math.max(0, 1 - Math.abs(wave - (layer / (NEURAL_LAYER_X.length - 1))) * 4.2);
    const shimmer = 0.5 + 0.5 * Math.sin(local * 2.4 - layer * 0.9 + row * 0.55);
    const glow = 0.2 + 0.58 * travelingActivation + 0.14 * shimmer;
    node.style.opacity = (networkIn * glow).toFixed(3);
    node.style.transform = `translate(-50%, -50%) scale(${(0.78 + 0.46 * glow).toFixed(3)})`;
    node.style.boxShadow = `0 0 ${(0.34 + glow * 0.72).toFixed(2)}cqw rgba(112,222,210,${(0.16 + glow * 0.44).toFixed(3)})`;
  });
  const networkWave = (local * 0.18) % 1;
  neuralWireNodes.forEach((wire, index) => {
    const layer = Number(wire.dataset.layer);
    const connectionCenter = (layer + 0.5) / (NEURAL_LAYER_X.length - 1);
    const pulse = Math.max(0, 1 - Math.abs(networkWave - connectionCenter) * 3.6);
    const shimmer = 0.5 + 0.5 * Math.sin(local * 2.2 + index * 0.61);
    wire.style.opacity = (networkIn * (0.12 + 0.53 * pulse + 0.12 * shimmer)).toFixed(3);
    wire.style.strokeDashoffset = `${(-local * 1.4 - index * 0.16).toFixed(2)}`;
  });
  neuralSignalNodes.forEach((signal, index) => {
    const progress = (networkWave + Number(signal.dataset.phase)) % 1;
    const x = lerp(NEURAL_LAYER_X[0], NEURAL_LAYER_X.at(-1), progress);
    const y = 50 + Math.sin(local * 1.25 + index * 2.1) * 13;
    signal.setAttribute('cx', x.toFixed(2));
    signal.setAttribute('cy', y.toFixed(2));
    signal.style.opacity = (networkIn * (0.62 + 0.3 * (0.5 + 0.5 * Math.sin(local * 2.6 + index)))).toFixed(3);
  });

  const candidateIn = smoothstep(11.2, 12.4, local) * (1 - smoothstep(52.0, 54.0, local));
  llmCandidates.style.opacity = candidateIn.toFixed(3);
  llmCandidates.style.transform = `translateX(${lerp(1.3, 0, candidateIn)}cqw)`;
  const selected = smoothstep(20.0, 20.9, local);
  llmCandidates.querySelectorAll('.candidate-row').forEach((row, index) => {
    row.classList.toggle('selected', index === 0 && selected > 0.5);
    row.style.opacity = (candidateIn * (index === 0 ? lerp(0.78, 1, selected) : 0.68)).toFixed(3);
  });

  const responseIn = smoothstep(19.9, 21.1, local);
  llmResponse.style.opacity = responseIn.toFixed(3);
  llmResponse.style.transform = `translateY(${lerp(1.2, 0, responseIn)}cqw)`;
  const tokenTimes = [20.25, 23.35, 26.35, 29.35, 32.25];
  const phraseTokens = [...llmResponse.querySelectorAll('.generated-token')];
  let visibleTokens = 0;
  phraseTokens.forEach((token, index) => {
    const p = smoothstep(tokenTimes[index], tokenTimes[index] + 0.72, local);
    token.style.opacity = p.toFixed(3);
    token.style.transform = `translateY(${lerp(0.55, 0, p)}cqw) scale(${lerp(0.96, 1, p).toFixed(3)})`;
    if (p > 0.02) visibleTokens = index + 1;
  });
  const contextCopy = document.querySelector('#context-output-copy');
  contextCopy.textContent = phraseTokens.slice(0, visibleTokens).map((token) => token.textContent).join(' ');
  const contextReturnIn = smoothstep(25.1, 27.0, local);
  llmContextReturn.style.opacity = contextReturnIn.toFixed(3);
  llmContextReturn.style.transform = `translateY(${lerp(0.8, 0, contextReturnIn)}cqw)`;

  const cacheIn = smoothstep(39.0, 40.7, local) * (1 - smoothstep(47.6, 49.1, local));
  llmCache.style.opacity = cacheIn.toFixed(3);
  llmCache.style.transform = `translateY(${lerp(0.6, 0, cacheIn)}cqw)`;
  const shelfIn = smoothstep(48.5, 50.0, local) * (1 - smoothstep(52.4, 53.8, local));
  llmShelf.style.opacity = (shelfIn * 0.78).toFixed(3);
  llmShelf.style.transform = `translateY(${lerp(0.8, 0, shelfIn)}cqw) scale(${lerp(0.97, 1, shelfIn).toFixed(3)})`;
  const patternsIn = smoothstep(53.4, 55.3, local);
  llmPatterns.style.opacity = patternsIn.toFixed(3);
  llmPatterns.querySelectorAll('i').forEach((node, index) => {
    node.style.opacity = String((patternsIn * (0.42 + 0.58 * (0.5 + 0.5 * Math.sin(local * 1.9 + index)))).toFixed(3));
    const driftX = Math.sin(local * 0.72 + index * 1.15) * 0.42;
    const driftY = Math.cos(local * 0.58 + index * 0.83) * 0.34;
    node.style.transform = `translate(${driftX.toFixed(2)}cqw, ${driftY.toFixed(2)}cqw) scale(${(0.72 + 0.4 * (0.5 + 0.5 * Math.sin(local * 1.35 + index * 0.7))).toFixed(3)})`;
  });
  const externalIn = smoothstep(58.6, 60.2, local);
  llmExternal.style.opacity = externalIn.toFixed(3);
  llmExternal.style.transform = `translateY(${lerp(0.8, 0, externalIn)}cqw)`;

  drawLink(modelEdges[0].path, modelEdges[0].from, modelEdges[0].to, smoothstep(0.6, 2.0, local), promptIn * networkIn);
  drawLink(modelEdges[1].path, modelEdges[1].from, modelEdges[1].to, smoothstep(11.1, 13.2, local), candidateIn);
  const choiceToResponse = smoothstep(19.0, 21.0, local) * candidateIn * responseIn;
  drawLink(modelEdges[2].path, modelEdges[2].from, modelEdges[2].to, choiceToResponse, choiceToResponse);
  const loopIn = smoothstep(25.2, 27.0, local);
  drawLink(modelEdges[3].path, modelEdges[3].from, modelEdges[3].to, loopIn, loopIn * 0.72);
}

function updateParticleField(time, sectionTwoTime) {
  if (!sparkCloud || !sparkMaterial) return;
  const assistantBurst = smoothstep(9.45, 10.25, time) * (1 - smoothstep(16.0, 17.5, time));
  const tokenBurst = smoothstep(0.0, 2.2, sectionTwoTime) * (1 - smoothstep(29.0, 31.2, sectionTwoTime));
  const relationBurst = smoothstep(SECTION_THREE_START + 2.0, SECTION_THREE_START + 6.0, time)
    * (1 - smoothstep(SECTION_THREE_START + 20.0, SECTION_THREE_START + 25.0, time));
  const inferenceBurst = smoothstep(SECTION_THREE_START + 25.0, SECTION_THREE_START + 30.0, time)
    * (1 - smoothstep(SECTION_THREE_START + 49.0, SECTION_THREE_START + 53.0, time));
  const intensity = Math.max(assistantBurst, tokenBurst * 0.92, relationBurst * 0.65, inferenceBurst * 0.42);
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
  const tokenStoryFade = 1 - smoothstep(SECTION_FOUR_START - 0.72, SECTION_FOUR_START + 0.42, t);
  tokenStory.style.opacity = t < PROMPT_TRANSITION_START ? '0' : tokenStoryFade.toFixed(3);
  tokenStory.style.visibility = t < PROMPT_TRANSITION_START || t > SECTION_FOUR_START + 0.48 ? 'hidden' : 'visible';

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
    userMessage.style.opacity = (1 - smoothstep(BUBBLE_FADE_START, BUBBLE_FADE_END, sectionTwoTime)).toFixed(3);
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
  const categoryFade = 1 - smoothstep(SECTION_THREE_START, SECTION_THREE_START + 1.15, t);
  categoryRack.style.opacity = (rackIn * categoryFade).toFixed(3);
  categoryRack.style.transform = `translateY(${lerp(54, 0, rackIn).toFixed(2)}px) scale(${lerp(0.91, 1, rackIn).toFixed(3)})`;
  categoryRack.querySelectorAll('.category-box').forEach((box, index) => {
    const p = smoothstep(9.7 + index * 0.25, 10.75 + index * 0.25, sectionTwoTime);
    const pulse = 1 + 0.012 * Math.sin(sectionTwoTime * 2.1 + index * 1.4) ** 2 * rackIn;
    box.style.opacity = p.toFixed(3);
    box.style.transform = `translateY(${lerp(15, 0, p).toFixed(2)}px) scale(${(lerp(0.97, 1, p) * pulse).toFixed(3)})`;
    box.style.setProperty('--box-energy', String(p * (0.35 + 0.65 * Math.sin(sectionTwoTime * 2 + index) ** 2)));
  });

  if (t < SECTION_THREE_START) updateFlights(sectionTwoTime);
  renderContextStory(t);
  renderModelStory(t);
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
