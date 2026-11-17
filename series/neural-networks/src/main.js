import * as THREE from 'three';
import { el, defs, Cues, hash, W, H } from './engine.js';
import { createChapter1 } from './ch1.js';
import { createChapter2 } from './ch2.js';
import { createChapter3 } from './ch3.js';
import { createChapter4 } from './ch4.js';
import { createChapter5 } from './ch5.js';

const FPS = 24;
const CREATORS = [createChapter1, createChapter2, createChapter3, createChapter4, createChapter5];
const AUDIO = [1, 2, 3, 4, 5].map(n => `./audio/chapter-0${n}.mp3`);
const LABELS = ['CHAPTER 01', 'CHAPTER 02', 'CHAPTER 03', 'CHAPTER 04', 'CHAPTER 05'];

const svg = document.querySelector('#stage');
const audio = document.querySelector('#narration');
const shell = document.querySelector('#player-shell');
const film = document.querySelector('#film');
const playButton = document.querySelector('#play-toggle');
const seek = document.querySelector('#seek-bar');
const timeCurrent = document.querySelector('#time-current');
const timeTotal = document.querySelector('#time-total');
const rate = document.querySelector('#playback-rate');
const audioState = document.querySelector('#audio-state');
const captionCue = document.querySelector('#caption-cue');
const captionLine = document.querySelector('#caption-line');
const railButtons = [...document.querySelectorAll('[data-chapter]')];

// ---------- SVG scene ----------
defs(svg);
el('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#vignette)', opacity: 0.55 }, svg);
const chapters = CREATORS.map((create, i) => {
  const root = el('g', { 'data-ch': i + 1, visibility: 'hidden' }, svg);
  const cues = new Cues(i);
  const update = create(root, cues);
  // Hold slightly past the last word so the final visual can settle.
  return { root, cues, update, end: cues.duration + 1.2, sentences: cues.sentences() };
});

// ---------- Three.js depth field (subtle, deterministic) ----------
const canvas = document.querySelector('#webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setClearColor(0x07101a, 1);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x07101a, 6, 26);
const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 60);
const N = 900;
const pos = new Float32Array(N * 3);
for (let i = 0; i < N; i++) {
  pos[i * 3] = (hash(i) - 0.5) * 34;
  pos[i * 3 + 1] = (hash(i + 1000) - 0.5) * 20;
  pos[i * 3 + 2] = -hash(i + 2000) * 26;
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const mat = new THREE.PointsMaterial({ color: 0x5eead4, size: 0.05, transparent: true, opacity: 0.45, depthWrite: false });
const points = new THREE.Points(geo, mat);
scene.add(points);
const TINTS = [0x5eead4, 0x7dd3fc, 0x5eead4, 0xfbbf24, 0x86efac];
function resizeWebGL() {
  const r = film.getBoundingClientRect();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(Math.max(2, r.width), Math.max(2, r.height), false);
}
function renderBackground(ch, t) {
  const T = ch * 400 + t;
  camera.position.set(Math.sin(T * 0.03) * 0.8, Math.cos(T * 0.021) * 0.4, 6);
  camera.lookAt(0, 0, -10);
  points.rotation.z = T * 0.004;
  points.position.z = (T * 0.12) % 8;
  mat.color.setHex(TINTS[ch]);
  renderer.render(scene, camera);
}

// ---------- state ----------
let active = 0;
let lastKey = '';

function renderAt(t, force = false) {
  const ch = chapters[active];
  t = Math.max(0, Math.min(ch.end, t));
  const frame = Math.round(t * FPS);
  const key = `${active}:${frame}`;
  if (!force && key === lastKey) return;
  lastKey = key;
  chapters.forEach((c, i) => c.root.setAttribute('visibility', i === active ? 'visible' : 'hidden'));
  ch.update(frame / FPS);
  renderBackground(active, frame / FPS);
  updateUI(t);
}

const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
let captionIndex = -1;
function updateUI(t) {
  const ch = chapters[active];
  timeCurrent.textContent = fmt(t);
  timeTotal.textContent = fmt(ch.end);
  if (document.activeElement !== seek) seek.value = String(Math.round((t / ch.end) * 1000));
  captionCue.textContent = `${LABELS[active]} · ${fmt(t)}`;
  let idx = ch.sentences.findIndex(s => t < s.end + 0.35);
  if (idx < 0) idx = ch.sentences.length - 1;
  if (idx !== captionIndex) {
    captionIndex = idx;
    captionLine.innerHTML = '';
    ch.sentences[idx].words.forEach(([w, s, e]) => {
      const span = document.createElement('span');
      span.className = 'w'; span.dataset.s = s; span.dataset.e = e; span.textContent = w + ' ';
      captionLine.appendChild(span);
    });
  }
  for (const span of captionLine.children) {
    const s = +span.dataset.s, e = +span.dataset.e;
    span.classList.toggle('on', t >= s);
    span.classList.toggle('now', t >= s && t <= e + 0.05);
  }
}

function setChapter(i, { play = false, at = 0 } = {}) {
  active = i;
  captionIndex = -1;
  railButtons.forEach((b, j) => { b.classList.toggle('active', j === i); b.toggleAttribute('aria-current', j === i); });
  const src = new URL(AUDIO[i], document.baseURI).href;
  if (audio.src !== src) { audio.src = src; audio.load(); }
  const ready = () => {
    try { audio.currentTime = at; } catch (e) { /* metadata not ready */ }
    renderAt(at, true);
    if (play) audio.play().catch(() => {});
  };
  if (audio.readyState >= 1) ready(); else audio.addEventListener('loadedmetadata', ready, { once: true });
  renderAt(at, true);
}

// ---------- playback loop: the audio clock drives every frame ----------
function tick() {
  if (!audio.paused) {
    const ch = chapters[active];
    if (audio.currentTime >= ch.end - 0.02 || audio.ended) {
      if (active < chapters.length - 1) setChapter(active + 1, { play: true });
      else { audio.pause(); renderAt(ch.end); }
    } else renderAt(audio.currentTime);
  }
  requestAnimationFrame(tick);
}

playButton.addEventListener('click', () => {
  if (audio.paused) {
    if (audio.currentTime >= chapters[active].end - 0.05) audio.currentTime = 0;
    audio.play().catch(() => { audioState.textContent = 'Playback was blocked — tap play again.'; });
  } else audio.pause();
});
audio.addEventListener('play', () => { playButton.textContent = '❚❚'; audioState.textContent = `Chapter ${active + 1} playing`; });
audio.addEventListener('pause', () => { playButton.textContent = '▶'; audioState.textContent = `Chapter ${active + 1} paused`; });
audio.addEventListener('ended', () => { if (active < chapters.length - 1) setChapter(active + 1, { play: true }); });
audio.addEventListener('loadedmetadata', () => { audioState.textContent = `Chapter ${active + 1} narration ready`; });
seek.addEventListener('input', () => {
  const t = (seek.value / 1000) * chapters[active].end;
  audio.currentTime = Math.min(t, audio.duration || t);
  renderAt(t, true);
});
rate.addEventListener('change', () => { audio.playbackRate = Number(rate.value); });
railButtons.forEach((b, i) => b.addEventListener('click', () => setChapter(i, { play: !audio.paused })));

// ---------- fullscreen with auto-hiding controls ----------
let controlsTimer = 0;
function showControls() {
  window.clearTimeout(controlsTimer);
  shell.classList.remove('controls-hidden');
  if (document.fullscreenElement) controlsTimer = window.setTimeout(() => shell.classList.add('controls-hidden'), 3000);
}
document.querySelector('#fullscreen-toggle').addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    try { await shell.requestFullscreen(); await screen.orientation?.lock?.('landscape').catch(() => {}); } catch (e) { audioState.textContent = 'Fullscreen is not available in this browser.'; }
  } else await document.exitFullscreen();
});
document.addEventListener('fullscreenchange', () => {
  shell.classList.toggle('fullscreen', Boolean(document.fullscreenElement));
  showControls();
  setTimeout(() => { resizeWebGL(); renderAt(audio.currentTime, true); }, 60);
});
shell.addEventListener('pointerdown', e => {
  if (e.target.closest('.player-controls,.chapter-rail')) return showControls();
  if (document.fullscreenElement) shell.classList.contains('controls-hidden') ? showControls() : shell.classList.add('controls-hidden');
});
shell.addEventListener('mousemove', () => { if (document.fullscreenElement) showControls(); });
window.addEventListener('keydown', e => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
  if (e.code === 'Space') { e.preventDefault(); playButton.click(); }
  if (e.key === 'f' || e.key === 'F') document.querySelector('#fullscreen-toggle').click();
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const t = Math.max(0, Math.min(chapters[active].end, audio.currentTime + (e.key === 'ArrowRight' ? 5 : -5)));
    audio.currentTime = t; renderAt(t, true);
  }
});
if ('ResizeObserver' in window) new ResizeObserver(() => { resizeWebGL(); renderAt(audio.currentTime, true); }).observe(film);
resizeWebGL();

// ---------- QA / export API ----------
window.setChapter = i => setChapter(i);
window.renderAt = (seconds, chapter) => { if (chapter !== undefined && chapter !== active) { active = chapter; captionIndex = -1; } renderAt(seconds, true); };
window.renderFrame = (frame, chapter) => window.renderAt(frame / FPS, chapter);
window.chapterDurations = chapters.map(c => c.end);

setChapter(0);
requestAnimationFrame(tick);
