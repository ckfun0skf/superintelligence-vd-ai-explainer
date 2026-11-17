import * as THREE from 'three';
import { el, defs, Cues, hash, W, H } from './engine.js';
import { CHAPTER_OFFSETS, CHAPTER_LENGTHS, FILM_DURATION } from './film-timing.js';
import { exportMp4, exportSupported } from './export.js';
import { createChapter1 } from './ch1.js';
import { createChapter2 } from './ch2.js';
import { createChapter3 } from './ch3.js';
import { createChapter4 } from './ch4.js';
import { createChapter5 } from './ch5.js';

const FPS = 24;
const CREATORS = [createChapter1, createChapter2, createChapter3, createChapter4, createChapter5];
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

// ---------- SVG scene: one group per chapter, inactive chapters are display:none ----------
defs(svg);
el('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#vignette)', opacity: 0.55 }, svg);
const chapters = CREATORS.map((create, i) => {
  const root = el('g', { 'data-ch': i + 1, display: 'none' }, svg);
  const cues = new Cues(i);
  const update = create(root, cues);
  return { root, update, start: CHAPTER_OFFSETS[i], length: CHAPTER_LENGTHS[i], sentences: cues.sentences() };
});
const chapterAt = T => { let i = 0; chapters.forEach((c, k) => { if (T >= c.start - 1e-6) i = k; }); return i; };

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
scene.add(new THREE.Points(geo, mat));
const points = scene.children[0];
const TINTS = [0x5eead4, 0x7dd3fc, 0x5eead4, 0xfbbf24, 0x86efac];
let exporting = false;
function resizeWebGL() {
  if (exporting) return;
  const r = film.getBoundingClientRect();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(Math.max(2, r.width), Math.max(2, r.height), false);
}
function renderBackground(ch, T) {
  camera.position.set(Math.sin(T * 0.03) * 0.8, Math.cos(T * 0.021) * 0.4, 6);
  camera.lookAt(0, 0, -10);
  points.rotation.z = T * 0.004;
  points.position.z = (T * 0.12) % 8;
  mat.color.setHex(TINTS[ch]);
  renderer.render(scene, camera);
}

// ---------- rendering on the film timeline ----------
let active = -1;
let lastFrame = -1;
function renderFilm(T, force = false) {
  T = Math.max(0, Math.min(FILM_DURATION, T));
  const frame = Math.round(T * FPS);
  if (!force && frame === lastFrame) return;
  lastFrame = frame;
  const t = frame / FPS;
  const ch = chapterAt(t);
  if (ch !== active) {
    chapters.forEach((c, i) => c.root.setAttribute('display', i === ch ? 'inline' : 'none'));
    active = ch;
    captionIndex = -1;
    railButtons.forEach((b, j) => { b.classList.toggle('active', j === ch); b.toggleAttribute('aria-current', j === ch); });
  }
  chapters[ch].update(t - chapters[ch].start);
  renderBackground(ch, t);
  if (!exporting) updateUI(t);
}

const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
let captionIndex = -1;
function updateUI(T) {
  const ch = chapters[active];
  const t = T - ch.start;
  timeCurrent.textContent = fmt(T);
  timeTotal.textContent = fmt(FILM_DURATION);
  if (document.activeElement !== seek) seek.value = String(Math.round((T / FILM_DURATION) * 1000));
  captionCue.textContent = `${LABELS[active]} · ${fmt(T)}`;
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

function seekTo(T) {
  T = Math.max(0, Math.min(FILM_DURATION, T));
  try { audio.currentTime = T; } catch (e) { /* metadata not loaded yet */ }
  renderFilm(T, true);
}

// ---------- playback: the audio clock drives every frame ----------
function tick() {
  if (!audio.paused && !exporting) renderFilm(audio.currentTime);
  requestAnimationFrame(tick);
}
playButton.addEventListener('click', () => {
  if (exporting) return;
  if (audio.paused) {
    if (audio.currentTime >= FILM_DURATION - 0.05) audio.currentTime = 0;
    audio.play().catch(() => { audioState.textContent = 'Playback was blocked — tap play again.'; });
  } else audio.pause();
});
audio.addEventListener('play', () => { playButton.textContent = '❚❚'; audioState.textContent = 'Playing'; });
audio.addEventListener('pause', () => { playButton.textContent = '▶'; audioState.textContent = 'Paused'; });
audio.addEventListener('ended', () => renderFilm(FILM_DURATION, true));
audio.addEventListener('loadedmetadata', () => { audioState.textContent = 'Narration ready'; });
seek.addEventListener('input', () => seekTo((seek.value / 1000) * FILM_DURATION));
rate.addEventListener('change', () => { audio.playbackRate = Number(rate.value); });
railButtons.forEach((b, i) => b.addEventListener('click', () => seekTo(chapters[i].start)));

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
  setTimeout(() => { resizeWebGL(); renderFilm(audio.currentTime, true); }, 60);
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
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') seekTo(audio.currentTime + (e.key === 'ArrowRight' ? 5 : -5));
});
if ('ResizeObserver' in window) new ResizeObserver(() => { resizeWebGL(); renderFilm(audio.currentTime, true); }).observe(film);
resizeWebGL();

// ---------- MP4 download ----------
const dlButton = document.querySelector('#download-mp4');
const dlQuality = document.querySelector('#download-quality');
const dlStatus = document.querySelector('#download-status');
const dlBar = document.querySelector('#download-bar');
const dlCancel = document.querySelector('#download-cancel');
let cancelExport = false;
const testSeconds = Number(new URLSearchParams(location.search).get('exportSeconds')) || 0; // QA: export a short clip
if (!exportSupported()) {
  dlButton.disabled = true;
  dlStatus.textContent = 'MP4 export needs a browser with WebCodecs (recent Chrome or Edge on desktop or Android).';
}
dlCancel.addEventListener('click', () => { cancelExport = true; });
dlButton.addEventListener('click', async () => {
  if (exporting) return;
  const [w, h] = dlQuality.value.split('x').map(Number);
  audio.pause();
  const resumeAt = audio.currentTime;
  exporting = true; cancelExport = false;
  dlButton.disabled = true; dlCancel.hidden = false; dlBar.hidden = false;
  dlStatus.textContent = 'Preparing fonts, images and audio…';
  try {
    const res = await exportMp4({
      width: w, height: h, fps: FPS, duration: testSeconds || FILM_DURATION,
      audioUrl: audio.currentSrc || audio.src, svg, glCanvas: canvas,
      fileName: `how-neural-networks-work-${h}p.mp4`, preferDisk: !testSeconds,
      prepare: (W2, H2) => { renderer.setPixelRatio(1); renderer.setSize(W2, H2, false); },
      restore: () => { exporting = false; resizeWebGL(); },
      renderFrame: f => renderFilm(f / FPS, true),
      onProgress: (done, total, eta) => {
        dlBar.value = done / total;
        dlStatus.textContent = `Rendering frame ${done} / ${total} (${Math.round((done / total) * 100)}%) · about ${Math.ceil(eta / 60)} min left — keep this tab open and visible`;
      },
      shouldCancel: () => cancelExport,
    });
    dlStatus.textContent = res.savedToDisk ? 'Done — MP4 saved.' : `Done — downloading MP4 (${(res.size / 1e6).toFixed(0)} MB).`;
    if (!res.audio) dlStatus.textContent += ' Note: this browser could not encode audio, so the file is silent.';
  } catch (e) {
    dlStatus.textContent = e.message === 'cancelled' ? 'Export cancelled.' : `Export failed: ${e.message || e}`;
  } finally {
    exporting = false;
    dlButton.disabled = false; dlCancel.hidden = true; dlBar.hidden = true;
    seekTo(resumeAt);
  }
});

// ---------- QA / export API ----------
window.renderAt = (seconds, chapter) => renderFilm(chapter === undefined ? seconds : chapters[chapter].start + seconds, true);
window.renderFrame = frame => renderFilm(frame / FPS, true);
window.filmDuration = FILM_DURATION;
window.chapterDurations = chapters.map(c => c.length);

renderFilm(0, true);
requestAnimationFrame(tick);
