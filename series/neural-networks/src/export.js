// In-browser MP4 export: renders every frame deterministically (Three.js background +
// SVG stage), encodes H.264 with WebCodecs, mixes in the narration track and muxes MP4.
import { Muxer, ArrayBufferTarget, StreamTarget } from 'mp4-muxer';

const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400..800&family=JetBrains+Mono:wght@500..700&display=swap';

async function embeddedFontCss() {
  try {
    const css = await (await fetch(FONT_CSS)).text();
    const blocks = css.split('}').filter(b => /\/\*\s*latin\s*\*\//.test(b));
    const out = [];
    for (const b of blocks) {
      const url = (b.match(/url\(([^)]+)\)/) || [])[1];
      if (!url) continue;
      const buf = await (await fetch(url)).arrayBuffer();
      const b64 = btoa(Array.from(new Uint8Array(buf), c => String.fromCharCode(c)).join(''));
      out.push(b.replace(/\/\*[^*]*\*\//g, '').replace(url, `data:font/woff2;base64,${b64}`) + '}');
    }
    return out.join('\n');
  } catch (e) {
    return ''; // fall back to system fonts
  }
}

async function toDataUrl(url) {
  const blob = await (await fetch(url)).blob();
  return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
}

async function pickVideoConfig(width, height, fps) {
  const bitrate = width >= 1920 ? 6_000_000 : 3_500_000;
  for (const codec of ['avc1.640028', 'avc1.4d0028', 'avc1.42002a', 'avc1.42001f']) {
    const cfg = { codec, width, height, bitrate, framerate: fps, avc: { format: 'avc' } };
    try { if ((await VideoEncoder.isConfigSupported(cfg)).supported) return cfg; } catch (e) { /* try next */ }
  }
  return null;
}

async function pickAudioConfig(sampleRate) {
  for (const [codec, mux] of [['mp4a.40.2', 'aac'], ['opus', 'opus']]) {
    const cfg = { codec, sampleRate, numberOfChannels: 2, bitrate: 192_000 };
    try { if (typeof AudioEncoder !== 'undefined' && (await AudioEncoder.isConfigSupported(cfg)).supported) return { cfg, mux }; } catch (e) { /* next */ }
  }
  return null;
}

export function exportSupported() {
  return typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';
}

/**
 * opts: { width, height, fps, duration, audioUrl, svg, glCanvas, prepare(width,height), renderFrame(f), restore(),
 *         onProgress(done,total,etaSec), shouldCancel() }
 */
export async function exportMp4(opts) {
  const { width, height, fps, duration, audioUrl, svg, glCanvas } = opts;
  const total = Math.ceil(duration * fps);
  const vcfg = await pickVideoConfig(width, height, fps);
  if (!vcfg) throw new Error('This browser cannot encode H.264 video. Please use a recent Chrome or Edge.');

  // ---- audio ----
  let audioBuf = null, acfg = null;
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
    audioBuf = await ac.decodeAudioData(await (await fetch(audioUrl)).arrayBuffer());
    ac.close();
    acfg = await pickAudioConfig(audioBuf.sampleRate);
  } catch (e) { audioBuf = null; }

  // ---- output target: stream to disk when possible, else memory ----
  let target, writable = null, writeChain = Promise.resolve();
  if (window.showSaveFilePicker && opts.preferDisk) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: opts.fileName, types: [{ description: 'MP4 video', accept: { 'video/mp4': ['.mp4'] } }] });
      writable = await handle.createWritable();
      target = new StreamTarget({ onData: (data, position) => { const copy = data.slice(); writeChain = writeChain.then(() => writable.write({ type: 'write', data: copy, position })); }, chunked: true });
    } catch (e) { if (e.name === 'AbortError') throw new Error('cancelled'); writable = null; }
  }
  if (!target) target = new ArrayBufferTarget();

  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width, height, frameRate: fps },
    ...(acfg ? { audio: { codec: acfg.mux, sampleRate: audioBuf.sampleRate, numberOfChannels: 2 } } : {}),
    fastStart: false,
    firstTimestampBehavior: 'offset',
  });
  let encErr = null;
  const venc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: e => { encErr = e; } });
  venc.configure(vcfg);
  let aenc = null;
  if (acfg) {
    aenc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: e => { encErr = e; } });
    aenc.configure(acfg.cfg);
  }

  // ---- static resources for SVG rasterisation ----
  const fontCss = await embeddedFontCss();
  const hrefs = new Map();
  for (const im of svg.querySelectorAll('image')) {
    const h = im.getAttribute('href');
    if (h && !h.startsWith('data:') && !hrefs.has(h)) hrefs.set(h, await toDataUrl(h));
  }
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const head = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 1920 1080"><style>${fontCss}</style>`;

  const rasterSvg = async () => {
    let body = '';
    for (const child of svg.children) {
      if (child.hasAttribute('data-ch') && child.getAttribute('display') === 'none') continue;
      body += child.outerHTML;
    }
    for (const [h, d] of hrefs) body = body.split(`href="${h}"`).join(`href="${d}"`);
    const url = URL.createObjectURL(new Blob([head + body + '</svg>'], { type: 'image/svg+xml' }));
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally { setTimeout(() => URL.revokeObjectURL(url), 0); }
  };

  // ---- audio feeding (interleaved with video) ----
  const AUDIO_BLOCK = 4800;
  let audioPos = 0;
  const feedAudioUntil = sec => {
    if (!aenc) return;
    const sr = audioBuf.sampleRate, end = Math.min(audioBuf.length, Math.floor(sec * sr));
    while (audioPos < end) {
      const n = Math.min(AUDIO_BLOCK, end - audioPos);
      const data = new Float32Array(n * 2);
      data.set(audioBuf.getChannelData(0).subarray(audioPos, audioPos + n), 0);
      data.set((audioBuf.numberOfChannels > 1 ? audioBuf.getChannelData(1) : audioBuf.getChannelData(0)).subarray(audioPos, audioPos + n), n);
      const ad = new AudioData({ format: 'f32-planar', sampleRate: sr, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((audioPos / sr) * 1e6), data });
      aenc.encode(ad);
      ad.close();
      audioPos += n;
    }
  };

  opts.prepare(width, height);
  const t0 = performance.now();
  try {
    for (let f = 0; f < total; f++) {
      if (encErr) throw encErr;
      if (opts.shouldCancel()) throw new Error('cancelled');
      opts.renderFrame(f);
      ctx.fillStyle = '#07101a';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(glCanvas, 0, 0, width, height);
      ctx.drawImage(await rasterSvg(), 0, 0, width, height);
      const frame = new VideoFrame(canvas, { timestamp: Math.round((f * 1e6) / fps), duration: Math.round(1e6 / fps) });
      venc.encode(frame, { keyFrame: f % (fps * 4) === 0 });
      frame.close();
      feedAudioUntil((f + 1) / fps);
      while (venc.encodeQueueSize > 6) await new Promise(r => setTimeout(r, 4));
      if (f % 6 === 0) {
        const el = (performance.now() - t0) / 1000;
        opts.onProgress(f + 1, total, (el / (f + 1)) * (total - f - 1));
        await new Promise(r => setTimeout(r, 0)); // keep the page responsive
      }
    }
    feedAudioUntil(duration);
    await venc.flush();
    if (aenc) await aenc.flush();
    muxer.finalize();
  } finally {
    opts.restore();
    try { venc.close(); } catch (e) { /* closed */ }
    try { aenc && aenc.close(); } catch (e) { /* closed */ }
  }
  if (writable) { await writeChain; await writable.close(); return { savedToDisk: true, audio: !!acfg }; }
  const blob = new Blob([target.buffer], { type: 'video/mp4' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = opts.fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
  return { savedToDisk: false, audio: !!acfg, size: blob.size };
}
