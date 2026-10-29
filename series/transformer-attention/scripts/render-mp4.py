#!/usr/bin/env python3
"""Render the Transformer-attention film deterministically to 1080p24 MP4.

Start the repository's Vite server first, for example:
  npm run dev -- --port 4176

The renderer calls window.renderFrame(absolute_frame) for every frame and
captures only the #film stage. A full render muxes the approved voiceover MP3;
partial frame ranges are intentionally restricted to silent QA clips.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import struct
import subprocess
import sys
import time
import traceback
from pathlib import Path
from urllib.request import urlopen

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
WIDTH, HEIGHT, FPS = 1920, 1080, 24
DEFAULT_URL = "http://127.0.0.1:4176/series/transformer-attention/"
DEFAULT_AUDIO = ROOT / "public/series/transformer-attention/audio/voiceover.mp3"
DEFAULT_OUTPUT = ROOT / "renders/transformer-attention-deep-dive-1080p24.mp4"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default=DEFAULT_URL, help=f"Vite preview URL (default: {DEFAULT_URL})")
    parser.add_argument("--audio", type=Path, default=DEFAULT_AUDIO, help="Approved audio master")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Output MP4 path")
    parser.add_argument("--start-frame", type=int, default=0, help="Absolute first frame, inclusive")
    parser.add_argument("--end-frame", type=int, default=None, help="Absolute end frame, exclusive")
    parser.add_argument("--silent-only", action="store_true", help="Render without muxing audio (for QA clips)")
    parser.add_argument("--keep-video-only", action="store_true", help="Keep temporary silent encode after mux")
    parser.add_argument("--crf", type=int, default=17, help="H.264 CRF (default: 17)")
    parser.add_argument("--preset", default="medium", help="H.264 preset (default: medium)")
    return parser.parse_args()


def probe_audio_duration(audio: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(audio)],
        check=True, capture_output=True, text=True,
    )
    return float(result.stdout.strip())


def jpeg_size(image: bytes) -> tuple[int, int]:
    if image[:2] != b"\xff\xd8":
        raise ValueError("Chromium did not return a JPEG screenshot")
    offset = 2
    sof_markers = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
    while offset + 4 <= len(image):
        if image[offset] != 0xFF:
            offset += 1
            continue
        while offset < len(image) and image[offset] == 0xFF:
            offset += 1
        if offset >= len(image):
            break
        marker = image[offset]
        offset += 1
        if marker in {0xD8, 0xD9, 0x01, *range(0xD0, 0xD8)}:
            continue
        if offset + 2 > len(image):
            break
        segment_length = struct.unpack(">H", image[offset:offset + 2])[0]
        if marker in sof_markers and offset + 7 <= len(image):
            height, width = struct.unpack(">HH", image[offset + 3:offset + 7])
            return width, height
        if segment_length < 2:
            break
        offset += segment_length
    raise ValueError("Could not read dimensions from Chromium screenshot")


def check_url(url: str) -> None:
    try:
        with urlopen(url, timeout=5) as response:
            if response.status != 200:
                raise RuntimeError(f"Preview server returned HTTP {response.status}: {url}")
    except Exception as exc:
        raise RuntimeError(f"Cannot reach {url}. Start Vite before rendering.") from exc


def probe_video(path: Path) -> dict:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
        check=True, capture_output=True, text=True,
    )
    return json.loads(result.stdout)


def main() -> int:
    args = parse_args()
    output, audio = args.output.expanduser().resolve(), args.audio.expanduser().resolve()
    if not audio.is_file():
        raise FileNotFoundError(f"Audio master not found: {audio}")
    for executable in ("ffmpeg", "ffprobe"):
        if shutil.which(executable) is None:
            raise RuntimeError(f"Required executable not found: {executable}")
    chromium = os.environ.get("CHROMIUM_BIN") or shutil.which("chromium") or shutil.which("google-chrome")
    if not chromium:
        raise RuntimeError("Chromium not found; set CHROMIUM_BIN to its executable path")
    if args.start_frame < 0 or args.crf < 0 or args.crf > 51:
        raise ValueError("start-frame must be non-negative and CRF must be between 0 and 51")
    check_url(args.url)
    output.parent.mkdir(parents=True, exist_ok=True)
    video_only = output if args.silent_only else output.with_name(f".{output.stem}.video-only.mp4")
    video_only.unlink(missing_ok=True)

    browser_errors: list[str] = []
    captured = 0
    started = time.monotonic()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True, executable_path=chromium,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-background-timer-throttling",
                  "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
                  "--disable-features=CalculateNativeWinOcclusion", "--disable-frame-rate-limit",
                  "--disable-gpu-vsync", "--enable-webgl", "--enable-unsafe-swiftshader",
                  "--use-gl=angle", "--use-angle=swiftshader"],
        )
        page = browser.new_page(viewport={"width": WIDTH, "height": HEIGHT}, device_scale_factor=1,
                                color_scheme="dark", reduced_motion="no-preference")
        page.on("pageerror", lambda error: browser_errors.append(f"pageerror: {error}"))
        page.on("console", lambda message: browser_errors.append(f"console error: {message.text}")
                if message.type == "error" else None)
        page.goto(args.url, wait_until="networkidle", timeout=60_000)
        page.add_style_tag(content=f"""
          html, body {{ width:{WIDTH}px!important; height:{HEIGHT}px!important;
            min-width:{WIDTH}px!important; min-height:{HEIGHT}px!important; margin:0!important;
            padding:0!important; overflow:hidden!important; background:#050811!important; }}
          body {{ display:block!important; }}
          .page {{ position:relative!important; width:{WIDTH}px!important; max-width:none!important;
            height:{HEIGHT}px!important; margin:0!important; padding:0!important; }}
          .player-shell {{ position:relative!important; width:{WIDTH}px!important; max-width:none!important;
            height:{HEIGHT}px!important; margin:0!important; padding:0!important; }}
          #film {{ position:relative!important; left:0!important; top:0!important; width:{WIDTH}px!important;
            height:{HEIGHT}px!important; max-width:none!important; aspect-ratio:16/9!important;
            margin:0!important; border:0!important; border-radius:0!important; box-shadow:none!important; }}
          .external-captions, .player-controls, .chapter-rail, .page-footer {{ display:none!important; }}
        """)
        page.evaluate("window.dispatchEvent(new Event('resize'))")
        page.wait_for_function(
            "window.renderFrame && document.querySelector('#narration')?.readyState >= 1 && "
            "document.fonts.status === 'loaded'",
            timeout=60_000,
        )
        page.evaluate("document.querySelector('#narration').pause()")
        page.evaluate("window.renderFrame(0)")
        page.wait_for_timeout(100)
        metadata = page.evaluate("""() => {
          const stage=document.querySelector('#film'), canvas=document.querySelector('#webgl');
          const audio=document.querySelector('#narration'), r=stage.getBoundingClientRect();
          return {stage:{x:r.x,y:r.y,width:r.width,height:r.height},canvas:{width:canvas.width,height:canvas.height},
            duration:audio.duration,readyState:audio.readyState,paused:audio.paused,
            fps:window.FPS || 24,webgl:!!(canvas.getContext('webgl2')||canvas.getContext('webgl'))};
        }""")
        if tuple(round(metadata["stage"][k]) for k in ("x", "y", "width", "height")) != (0, 0, WIDTH, HEIGHT):
            raise RuntimeError(f"Film stage is not exactly pinned to 1920x1080: {metadata['stage']}")
        if not metadata["webgl"] or not metadata["paused"] or metadata["readyState"] < 1:
            raise RuntimeError(f"WebGL/audio clock is not ready and paused: {metadata}")
        total_frames = round(metadata["duration"] * FPS)
        start, end = args.start_frame, args.end_frame if args.end_frame is not None else total_frames
        if end <= start or end > total_frames:
            raise ValueError(f"Frame range must satisfy 0 <= start < end <= {total_frames}")
        if not args.silent_only and (start != 0 or end != total_frames):
            raise ValueError("Partial frame ranges must use --silent-only")
        frame_count = end - start
        clip = {"x": 0, "y": 0, "width": WIDTH, "height": HEIGHT}

        page.evaluate("frame => window.renderFrame(frame)", start)
        page.screenshot(type="jpeg", quality=95, clip=clip, scale="css", animations="disabled", caret="hide")
        page.evaluate("frame => window.renderFrame(frame)", start)
        smoke_a = page.screenshot(type="jpeg", quality=95, clip=clip, scale="css", animations="disabled", caret="hide")
        page.evaluate("frame => window.renderFrame(frame)", start)
        smoke_b = page.screenshot(type="jpeg", quality=95, clip=clip, scale="css", animations="disabled", caret="hide")
        if jpeg_size(smoke_a) != (WIDTH, HEIGHT):
            raise RuntimeError(f"Screenshot is not 1920x1080: {jpeg_size(smoke_a)}")
        if smoke_a != smoke_b:
            raise RuntimeError(f"Repeated frame {start} is not deterministic")

        print(f"Stage verified: 1920x1080, {FPS} fps, {metadata['duration']:.3f}s, {total_frames} frames; "
              f"audio readyState={metadata['readyState']}", flush=True)
        print(f"Rendering [{start}, {end}) to {video_only}", flush=True)
        ffmpeg_cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe",
                      "-vcodec", "mjpeg", "-framerate", str(FPS), "-i", "pipe:0", "-an", "-c:v", "libx264",
                      "-preset", args.preset, "-crf", str(args.crf), "-profile:v", "high", "-level:v", "4.1",
                      "-pix_fmt", "yuv420p", "-g", str(FPS*2), "-keyint_min", str(FPS*2), "-sc_threshold", "0",
                      "-fps_mode", "cfr", "-frames:v", str(frame_count), "-movflags", "+faststart", str(video_only)]
        encoder = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
        try:
            assert encoder.stdin is not None
            for frame in range(start, end):
                page.evaluate("frame => window.renderFrame(frame)", frame)
                image = page.screenshot(type="jpeg", quality=95, clip=clip, scale="css",
                                        animations="disabled", caret="hide")
                if frame == start and jpeg_size(image) != (WIDTH, HEIGHT):
                    raise RuntimeError(f"Wrong screenshot dimensions at frame {frame}: {jpeg_size(image)}")
                encoder.stdin.write(image)
                captured += 1
                if captured == 1 or captured % 240 == 0 or captured == frame_count:
                    elapsed = max(time.monotonic()-started, .001)
                    rate = captured/elapsed
                    eta = (frame_count-captured)/rate if rate else float("inf")
                    print(f"frames {captured}/{frame_count} ({100*captured/frame_count:.1f}%), "
                          f"{rate:.2f} fps render, ETA {eta/60:.1f} min", flush=True)
            encoder.stdin.close()
            stderr = encoder.stderr.read() if encoder.stderr else b""
            code = encoder.wait()
            if code:
                raise RuntimeError(f"FFmpeg encode failed ({code}): {stderr.decode(errors='replace')}")
        except Exception:
            if encoder.poll() is None:
                encoder.kill(); encoder.wait()
            if encoder.stderr:
                detail=encoder.stderr.read().decode(errors="replace")
                if detail: print(detail, file=sys.stderr)
            raise
        finally:
            browser.close()

    if browser_errors:
        raise RuntimeError("Browser reported errors during render:\n"+"\n".join(browser_errors[:20]))

    if not args.silent_only:
        audio_duration = probe_audio_duration(audio)
        subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(video_only), "-i", str(audio),
                        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
                        "-ar", "44100", "-ac", "2", "-t", f"{audio_duration:.6f}", "-movflags", "+faststart",
                        str(output)], check=True)
        if not args.keep_video_only:
            video_only.unlink(missing_ok=True)

    info = probe_video(output)
    video_stream = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    if not video_stream or (video_stream.get("width"), video_stream.get("height")) != (WIDTH, HEIGHT):
        raise RuntimeError(f"Output video dimensions are incorrect: {video_stream}")
    print(f"Output: {output}", flush=True)
    print(f"Size: {output.stat().st_size/(1024*1024):.1f} MiB", flush=True)
    print(f"Video: {video_stream.get('codec_name')} {video_stream.get('r_frame_rate')} "
          f"{video_stream.get('width')}x{video_stream.get('height')}", flush=True)
    if not args.silent_only:
        audio_stream = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
        if not audio_stream:
            raise RuntimeError("Final MP4 has no audio stream")
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(output), "-f", "null", "-"], check=True)
        print(f"Audio: {audio_stream.get('codec_name')} {audio_stream.get('sample_rate')} Hz; full decode passed", flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("Interrupted; partial output may remain.", file=sys.stderr)
        raise SystemExit(130)
    except Exception as exc:
        traceback.print_exc()
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
