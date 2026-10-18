import * as THREE from 'three';
import './style.css';

const stage = document.querySelector('#stage');
const canvas = document.querySelector('#scene-canvas');
const audio = document.querySelector('#preview-audio');
const playButton = document.querySelector('#play-button');
const playLabel = document.querySelector('#play-label');
const playGlyph = document.querySelector('#play-glyph');
const timeline = document.querySelector('#timeline');
const currentTimeReadout = document.querySelector('#current-time');
const totalTimeReadout = document.querySelector('#total-time');
const speedSelect = document.querySelector('#speed-select');
const clockLabel = document.querySelector('#clock-label');
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

const DURATION = 24.45;
const FPS = 24;
const PROMPT = 'Plan a two-day weekend in Taipei. My budget is eight thousand dollars, and I love nature.';
const CAPTIONS = [
  { start: 1.5, end: 4.0, text: 'Imagine typing this into an AI assistant.' },
  { start: 4.0, end: 6.6, text: 'Plan a two-day weekend in Taipei.' },
  { start: 6.6, end: 10.0, text: 'My budget is eight thousand dollars, and I love nature.' },
  { start: 10.0, end: 12.9, text: 'The assistant replies with an itinerary.' },
  { start: 12.9, end: 16.6, text: 'A simple exchange—but how did those words become an answer?' },
  { start: 16.6, end: 21.2, text: 'And if the assistant can do more than answer, how does it know when to use a tool?' },
  { start: 21.2, end: 24.45, text: "Let's follow the request, one step at a time." },
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x050812, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 9 / 16, 0.1, 80);
  camera.position.set(0, 0, 11);

  const starPositions = new Float32Array(420 * 3);
  for (let i = 0; i < 420; i += 1) {
    starPositions[i * 3] = (seededRandom() - 0.5) * 15;
    starPositions[i * 3 + 1] = (seededRandom() - 0.5) * 25;
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
    [-3.8, 2.8, -2.2], [-1.9, 1.5, -1.6], [0.1, 2.2, -2.4], [2.4, 1.3, -1.7],
    [-2.9, -0.5, -2], [-0.8, -1.5, -1.5], [1.4, -0.5, -2.2], [3.2, -1.8, -2.5],
    [-2.3, -3.8, -1.6], [-0.1, -4.2, -2.5], [2.1, -3.5, -1.8],
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
  for (let x = -5; x <= 5; x += 1) {
    gridPositions.push(x, -7, -3.5, x, 7, -3.5);
  }
  for (let y = -7; y <= 7; y += 1) {
    gridPositions.push(-5, y, -3.5, 5, y, -3.5);
  }
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  gridMaterial = new THREE.LineBasicMaterial({ color: 0x456b7b, transparent: true, opacity: 0.055, depthWrite: false });
  scene.add(new THREE.LineSegments(gridGeometry, gridMaterial));

  function resizeRenderer() {
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
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

  const clock = fmtTime(t);
  clockLabel.textContent = clock;
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
  playLabel.textContent = audio.paused ? 'Play section' : 'Pause preview';
  playGlyph.textContent = audio.paused ? '▶' : 'Ⅱ';
  playButton.setAttribute('aria-label', audio.paused ? 'Play section one preview' : 'Pause section one preview');
  renderAt(t);
}

playButton.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch (error) {
      const note = document.querySelector('#preview-note');
      note.textContent = 'Audio could not start. Check that the preview audio asset is available, then try again.';
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
  document.querySelector('#preview-note').textContent = 'The audio asset failed to load. Reload the page or check the local audio path.';
  console.error('Preview audio failed to load:', audio.error);
});

timeline.addEventListener('input', () => {
  const nextTime = Number(timeline.value);
  audio.currentTime = nextTime;
  renderAt(nextTime);
  currentTimeReadout.textContent = fmtTime(nextTime);
  clockLabel.textContent = fmtTime(nextTime);
});

speedSelect.addEventListener('change', () => {
  audio.playbackRate = Number(speedSelect.value);
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
