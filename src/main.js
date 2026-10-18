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
const conversationLabel = document.querySelector('#conversation-label');
const userMessage = document.querySelector('#user-message');
const promptText = document.querySelector('#prompt-text');
const cursor = document.querySelector('#typing-cursor');
const composer = document.querySelector('#composer');
const composerSend = document.querySelector('#composer-send');
const answerMessage = document.querySelector('#answer-message');
const toolDock = document.querySelector('#tool-dock');
const caption = document.querySelector('#caption');
const tokenPhase = document.querySelector('#token-phase');
const sourceStrip = document.querySelector('#source-strip');
const tokenStageLabel = document.querySelector('#token-stage-label');
const tokenTilesContainer = document.querySelector('#token-tiles');
const tokenExamplesContainer = document.querySelector('#token-examples');
const tokenExamples = [...document.querySelectorAll('.token-example')];
const idHeading = document.querySelector('#id-heading');
const tokenIdsContainer = document.querySelector('#token-ids');
const tokenTakeaway = document.querySelector('#token-takeaway');
const tokenCaption = document.querySelector('#token-caption');

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
];
const TOKEN_CAPTIONS = [
  { start: 24.4, end: 29.9, text: 'A language model does not usually process a sentence as one complete object.' },
  { start: 29.9, end: 34.5, text: 'A tokenizer breaks the text into smaller pieces called tokens.' },
  { start: 34.5, end: 40.5, text: 'A token might be a whole word, part of a word, punctuation, or another piece of text.' },
  { start: 40.5, end: 44.0, text: 'The exact pieces depend on the tokenizer and the language.' },
  { start: 44.0, end: 48.9, text: 'The tokens are then represented as numbers, so the model can work with them.' },
  { start: 48.9, end: 55.6, text: 'Tokens are building blocks for processing text, but a token is not by itself a complete idea.' },
];
const TOKEN_ITEMS = [
  ['two', '308'], ['-', '14'], ['day', '612'], ['weekend', '904'],
  ['in', '52'], ['Tai', '731'], ['pei', '86'], ['.', '5'],
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

const tokenTileNodes = [];
const tokenIdNodes = [];
TOKEN_ITEMS.forEach(([text, id], index) => {
  const tile = document.createElement('span');
  tile.className = `token-tile${['.', ',', '-'].includes(text) ? ' punctuation' : ''}`;
  tile.textContent = text;
  tile.dataset.index = String(index);
  tokenTilesContainer.append(tile);
  tokenTileNodes.push(tile);

  const idTile = document.createElement('span');
  idTile.className = 'token-id';
  idTile.textContent = id;
  idTile.dataset.index = String(index);
  tokenIdsContainer.append(idTile);
  tokenIdNodes.push(idTile);
});

// Fixed seed so the point field is identical on every load and seek.
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
    color: 0x83bbc3,
    size: 0.025,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
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
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x5aa9ad, transparent: true, opacity: 0.12, depthWrite: false });
  network = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(network);

  const gridPositions = [];
  for (let x = -9; x <= 9; x += 1) {
    gridPositions.push(x, -5, -3.5, x, 5, -3.5);
  }
  for (let y = -5; y <= 5; y += 1) {
    gridPositions.push(-9, y, -3.5, 9, y, -3.5);
  }
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  gridMaterial = new THREE.LineBasicMaterial({ color: 0x456b7b, transparent: true, opacity: 0.055, depthWrite: false });
  scene.add(new THREE.LineSegments(gridGeometry, gridMaterial));

  function resizeRenderer() {
    renderer.setSize(1920, 1080, false);
    camera.aspect = 16 / 9;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resizeRenderer, { passive: true });
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

/** Deterministically set the whole section to an absolute audio time. */
function renderAt(seconds) {
  const t = clamp(seconds, 0, DURATION);
  const sectionTwoTime = clamp(t - SECTION_TWO_START, 0, SECTION_TWO_DURATION);
  sceneOne.style.opacity = (1 - smoothstep(23.95, 24.95, t)).toFixed(3);
  tokenStory.style.opacity = smoothstep(24.0, 25.0, t).toFixed(3);

  const entry = smoothstep(0, 1.45, t);
  const pullback = smoothstep(21.15, 24.35, t);
  const shellScale = lerp(0.925, 1, entry) * lerp(1, 0.93, pullback);
  assistantCard.style.setProperty('--card-entry', entry.toFixed(3));
  assistantCard.style.transform = `translate(-50%, -50%) scale(${shellScale.toFixed(3)})`;
  assistantHeader.style.opacity = smoothstep(0.28, 0.9, t).toFixed(3);
  assistantHeader.style.transform = `translateY(${lerp(8, 0, smoothstep(0.28, 0.9, t)).toFixed(2)}px)`;
  conversationLabel.style.opacity = smoothstep(0.5, 1.15, t).toFixed(3);

  const promptReveal = smoothstep(3.35, 4.0, t);
  reveal(userMessage, promptReveal, 9, 0.985);
  const typing = clamp((t - 3.9) / (9.95 - 3.9));
  const typedCount = Math.floor(PROMPT.length * typing);
  promptText.textContent = PROMPT.slice(0, typedCount);
  cursor.style.opacity = (t >= 3.9 && t < 10.12 && Math.floor(t * 2) % 2 === 0) ? '1' : '0';
  composer.style.opacity = smoothstep(0.85, 1.35, t).toFixed(3);
  composerSend.style.opacity = smoothstep(9.55, 10.05, t).toFixed(3);
  composerSend.style.transform = `translateY(${lerp(3, 0, smoothstep(9.55, 10.05, t)).toFixed(2)}px)`;

  reveal(answerMessage, smoothstep(10.0, 11.1, t), 8, 0.985);
  reveal(toolDock, smoothstep(16.55, 17.7, t), 10, 0.985);

  const activeCaption = CAPTIONS.find((item) => t >= item.start && t < item.end);
  caption.textContent = activeCaption ? activeCaption.text : '';
  caption.style.opacity = activeCaption ? String(Math.min(smoothstep(activeCaption.start, activeCaption.start + 0.22, t), smoothstep(activeCaption.end, activeCaption.end - 0.22, t))) : '0';

  sourceStrip.style.opacity = smoothstep(0.2, 1.0, sectionTwoTime).toFixed(3);
  sourceStrip.style.transform = `translateY(${lerp(0.6, 0, smoothstep(0.2, 1.0, sectionTwoTime)).toFixed(2)}cqw)`;
  tokenStageLabel.style.opacity = smoothstep(4.5, 5.3, sectionTwoTime).toFixed(3);
  tokenPhase.textContent = sectionTwoTime < 4.8 ? 'ONE INPUT'
    : sectionTwoTime < 10.0 ? 'SMALLER PIECES'
      : sectionTwoTime < 19.4 ? 'WORDS · PARTS · PUNCTUATION'
        : sectionTwoTime < 24.3 ? 'NUMERIC REPRESENTATION'
          : 'PARTS, NOT IDEAS';

  const tokenProgress = clamp((sectionTwoTime - 4.8) / 5.2);
  tokenTileNodes.forEach((tile, index) => {
    const stagger = (index / tokenTileNodes.length) * 0.72;
    const amount = smoothstep(stagger, stagger + 0.08, tokenProgress);
    tile.style.opacity = amount.toFixed(3);
    tile.style.transform = `translateY(${lerp(0.55, 0, amount).toFixed(2)}cqw) scale(${lerp(0.96, 1, amount).toFixed(3)})`;
  });

  tokenExamples.forEach((example, index) => {
    const amount = smoothstep(10.0 + index * 1.25, 11.0 + index * 1.25, sectionTwoTime);
    example.style.opacity = amount.toFixed(3);
    example.style.transform = `translateY(${lerp(0.5, 0, amount).toFixed(2)}cqw)`;
  });
  const examplesVisible = smoothstep(10.0, 11.2, sectionTwoTime);
  tokenExamplesContainer.style.opacity = examplesVisible.toFixed(3);
  tokenExamplesContainer.style.transform = `translateY(${lerp(0.5, 0, examplesVisible).toFixed(2)}cqw)`;

  idHeading.style.opacity = smoothstep(19.0, 20.0, sectionTwoTime).toFixed(3);
  tokenIdNodes.forEach((idTile, index) => {
    const start = 19.5 + (index / tokenIdNodes.length) * 4.3;
    const amount = smoothstep(start, start + 0.24, sectionTwoTime);
    idTile.style.opacity = amount.toFixed(3);
    idTile.style.transform = `translateY(${lerp(0.4, 0, amount).toFixed(2)}cqw)`;
  });
  const takeaway = smoothstep(24.0, 25.2, sectionTwoTime);
  tokenTakeaway.style.opacity = takeaway.toFixed(3);
  tokenTakeaway.style.transform = `translateY(${lerp(0.4, 0, takeaway).toFixed(2)}cqw)`;

  const activeTokenCaption = TOKEN_CAPTIONS.find((item) => t >= item.start && t < item.end);
  tokenCaption.textContent = activeTokenCaption ? activeTokenCaption.text : '';
  tokenCaption.style.opacity = activeTokenCaption
    ? String(Math.min(smoothstep(activeTokenCaption.start, activeTokenCaption.start + 0.2, t), smoothstep(activeTokenCaption.end, activeTokenCaption.end - 0.2, t)))
    : '0';

  if (renderer && camera && !failedWebGL) {
    stars.rotation.y = 0.003 * t;
    stars.rotation.x = 0.002 * Math.sin(t * 0.16);
    network.rotation.z = 0.003 * Math.sin(t * 0.18);
    network.material.opacity = 0.085 + 0.035 * Math.sin(t * 0.42) ** 2;
    gridMaterial.opacity = 0.045 + 0.015 * Math.sin(t * 0.31) ** 2;
    camera.position.z = 11 + 1.35 * pullback;
    camera.position.y = -0.08 * pullback;
    camera.lookAt(0, 0, -1.8);
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
audio.addEventListener('error', () => {
  console.error('Preview audio failed to load:', audio.error);
});

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

// Render by audio time, not elapsed wall-clock time; seeking always reconstructs the same state.
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
