#!/usr/bin/env python3
"""Render the deterministic Three.js film to 1080p24 H.264/AAC MP4.

Requires a running Vite dev server, Python Playwright, system Chromium, ffmpeg,
and ffprobe. The audio clock stays paused; each image is rendered from its
absolute frame index via window.renderFrame(frame), then captured from the
1920x1080 film stage (not from realtime playback or the player controls).
"""
from __future__ import annotations

import argparse
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

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_URL = "http://127.0.0.1:4176/"
DEFAULT_AUDIO = ROOT / "public/audio/section-01-08-preview-mix.mp3"
DEFAULT_OUTPUT = ROOT / "renders/from-prompt-to-action-final-1080p-24fps.mp4"
WIDTH, HEIGHT = 1920, 1080


def probe_audio_duration(audio: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(audio),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def jpeg_size(image: bytes) -> tuple[int, int]:
    """Read dimensions from a JPEG Start Of Frame marker without another dependency."""
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
    raise ValueError("Could not read dimensions from Chromium's JPEG screenshot")


def check_url(url: str) -> None:
    try:
        with urlopen(url, timeout=4) as response:
            if response.status != 200:
                raise RuntimeError(f"Preview server returned HTTP {response.status}: {url}")
    except Exception as exc:
        raise RuntimeError(
            f"Cannot reach {url}. Start Vite with `npm run dev -- --port 4176` first."
        ) from exc


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default=DEFAULT_URL, help=f"Vite URL (default: {DEFAULT_URL})")
    parser.add_argument("--audio", type=Path, default=DEFAULT_AUDIO, help="Final audio mix")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Output MP4 path")
    parser.add_argument("--start-frame", type=int, default=0, help="Absolute first frame, inclusive")
    parser.add_argument("--end-frame", type=int, default=None, help="Absolute end frame, exclusive")
    parser.add_argument("--silent-only", action="store_true", help="Do not mux audio; for short render tests")
    parser.add_argument("--keep-video-only", action="store_true", help="Keep the temporary silent H.264 file")
    parser.add_argument("--crf", type=int, default=17, help="H.264 CRF (default: 17)")
    parser.add_argument("--preset", default="medium", help="H.264 preset (default: medium)")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output = args.output.expanduser().resolve()
    audio = args.audio.expanduser().resolve()
    if not audio.is_file():
        raise FileNotFoundError(f"Audio master not found: {audio}")
    for executable in ("ffmpeg", "ffprobe"):
        if shutil.which(executable) is None:
            raise RuntimeError(f"Required executable not found: {executable}")
    chromium = os.environ.get("CHROMIUM_BIN") or shutil.which("chromium") or shutil.which("google-chrome")
    if not chromium:
        raise RuntimeError("Chromium not found. Set CHROMIUM_BIN to the Chromium executable.")
    check_url(args.url)
    output.parent.mkdir(parents=True, exist_ok=True)

    video_only = output if args.silent_only else output.with_name(f".{output.stem}.video-only.mp4")
    video_only.unlink(missing_ok=True)
    fps = 24
    start = args.start_frame
    if start < 0:
        raise ValueError("--start-frame must be non-negative")
    if args.crf < 0 or args.crf > 51:
        raise ValueError("CRF must be between 0 and 51")

    browser_errors: list[str] = []
    captured = 0
    started = time.monotonic()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=chromium,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
                "--disable-backgrounding-occluded-windows",
                "--disable-features=CalculateNativeWinOcclusion",
                "--disable-frame-rate-limit",
                "--disable-gpu-vsync",
                "--enable-webgl",
                "--enable-unsafe-swiftshader",
                "--use-gl=angle",
                "--use-angle=swiftshader",
            ],
        )
        page = browser.new_page(
            viewport={"width": WIDTH, "height": HEIGHT},
            device_scale_factor=1,
            color_scheme="dark",
            reduced_motion="no-preference",
        )
        page.on("pageerror", lambda error: browser_errors.append(f"pageerror: {error}"))
        page.on(
            "console",
            lambda message: browser_errors.append(f"console error: {message.text}")
            if message.type == "error" else None,
        )
        page.goto(args.url, wait_until="networkidle", timeout=60_000)
        page.add_style_tag(
            content=f"""
              html, body {{
                width: {WIDTH}px !important; height: {HEIGHT}px !important;
                min-width: {WIDTH}px !important; min-height: {HEIGHT}px !important;
                margin: 0 !important; padding: 0 !important; overflow: hidden !important;
                background: #050811 !important;
              }}
              body {{ display: block !important; }}
              .app-shell {{
                position: absolute !important; left: 0 !important; top: 0 !important;
                width: {WIDTH}px !important; height: {HEIGHT}px !important;
                max-width: none !important; margin: 0 !important;
              }}
              #stage {{
                position: relative !important; width: {WIDTH}px !important;
                height: {HEIGHT}px !important; max-width: none !important;
                margin: 0 !important; aspect-ratio: 16 / 9 !important;
                overflow: hidden !important;
              }}
            """
        )
        page.wait_for_function(
            "window.renderFrame && window.previewTimeline && "
            "document.querySelector('#preview-audio')?.readyState >= 1 && "
            "document.fonts.status === 'loaded'",
            timeout=60_000,
        )
        page.evaluate("document.querySelector('#preview-audio').pause()")
        page.evaluate("window.previewTimeline.renderAt(0)")

        metadata = page.evaluate(
            """() => {
              const stage = document.querySelector('#stage');
              const canvas = document.querySelector('#scene-canvas');
              const audio = document.querySelector('#preview-audio');
              const box = stage.getBoundingClientRect();
              return {
                stage: {x: box.x, y: box.y, width: box.width, height: box.height},
                canvas: {width: canvas.width, height: canvas.height},
                fps: window.previewTimeline.fps,
                duration: window.previewTimeline.duration,
                audioDuration: audio.duration,
                readyState: audio.readyState,
                paused: audio.paused,
                webgl: !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
              };
            }"""
        )
        if int(metadata["fps"]) != fps:
            raise RuntimeError(f"Project FPS changed; this export is configured for 24 fps, found {metadata['fps']}")
        if abs(metadata["stage"]["x"]) > 0.01 or abs(metadata["stage"]["y"]) > 0.01:
            raise RuntimeError(f"Film stage is not pinned to viewport origin: {metadata['stage']}")
        if abs(metadata["stage"]["width"] - WIDTH) > 0.01 or abs(metadata["stage"]["height"] - HEIGHT) > 0.01:
            raise RuntimeError(f"Stage is not exactly 1920x1080: {metadata['stage']}")
        if metadata["canvas"] != {"width": WIDTH, "height": HEIGHT}:
            raise RuntimeError(f"Three.js backing canvas is not 1920x1080: {metadata['canvas']}")
        if not metadata["webgl"]:
            raise RuntimeError("WebGL could not initialize in Chromium")
        if not metadata["paused"] or metadata["audioDuration"] < metadata["duration"]:
            raise RuntimeError(f"Audio clock is not ready/paused or too short: {metadata}")

        total_frames = round(metadata["duration"] * fps)
        end = args.end_frame if args.end_frame is not None else total_frames
        if end <= start or end > total_frames:
            raise ValueError(f"Frame range must satisfy 0 <= start < end <= {total_frames}")
        if not args.silent_only and (start != 0 or end != total_frames):
            raise ValueError("Partial frame ranges must use --silent-only; audio mux is for the full film only")
        frame_count = end - start

        stage_box = page.locator("#stage").bounding_box()
        if not stage_box or tuple(round(stage_box[k]) for k in ("x", "y", "width", "height")) != (0, 0, WIDTH, HEIGHT):
            raise RuntimeError(f"Could not measure an exact 1920x1080 film-stage clip: {stage_box}")
        clip = {"x": stage_box["x"], "y": stage_box["y"], "width": WIDTH, "height": HEIGHT}

        # Warm up WebGL's first paint; identical absolute frames must encode identically.
        page.evaluate("frame => window.renderFrame(frame)", start)
        page.screenshot(type="jpeg", quality=95, clip=clip, scale="css", animations="disabled", caret="hide")
        page.evaluate("frame => window.renderFrame(frame)", start)
        smoke_a = page.screenshot(type="jpeg", quality=95, clip=clip, scale="css", animations="disabled", caret="hide")
        page.evaluate("frame => window.renderFrame(frame)", start)
        smoke_b = page.screenshot(type="jpeg", quality=95, clip=clip, scale="css", animations="disabled", caret="hide")
        if jpeg_size(smoke_a) != (WIDTH, HEIGHT):
            raise RuntimeError(f"Screenshot dimensions are not 1920x1080: {jpeg_size(smoke_a)}")
        if smoke_a != smoke_b:
            raise RuntimeError(f"Repeated frame {start} did not produce identical JPEG screenshots")

        print(
            f"Stage verified: {WIDTH}x{HEIGHT}, {fps} fps, "
            f"timeline {metadata['duration']:.3f}s, {total_frames} frames; "
            f"decoded audio {metadata['audioDuration']:.3f}s",
            flush=True,
        )
        print(f"Rendering absolute frames [{start}, {end}) to {video_only}", flush=True)

        ffmpeg_cmd = [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-f", "image2pipe", "-vcodec", "mjpeg", "-framerate", str(fps), "-i", "pipe:0",
            "-an", "-c:v", "libx264", "-preset", args.preset, "-crf", str(args.crf),
            "-profile:v", "high", "-level:v", "4.1", "-pix_fmt", "yuv420p",
            "-g", str(fps * 2), "-keyint_min", str(fps * 2), "-sc_threshold", "0",
            "-fps_mode", "cfr", "-frames:v", str(frame_count), "-movflags", "+faststart",
            str(video_only),
        ]
        encoder = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
        try:
            assert encoder.stdin is not None
            for frame in range(start, end):
                page.evaluate("frame => window.renderFrame(frame)", frame)
                image = page.screenshot(
                    type="jpeg", quality=95, clip=clip, scale="css",
                    animations="disabled", caret="hide",
                )
                if frame == start and jpeg_size(image) != (WIDTH, HEIGHT):
                    raise RuntimeError(f"Wrong screenshot dimensions at frame {frame}: {jpeg_size(image)}")
                encoder.stdin.write(image)
                captured += 1
                if captured == 1 or captured % 240 == 0 or captured == frame_count:
                    elapsed = max(time.monotonic() - started, 0.001)
                    rate = captured / elapsed
                    eta = (frame_count - captured) / rate if rate else float("inf")
                    print(
                        f"frames {captured}/{frame_count} ({100*captured/frame_count:.1f}%), "
                        f"{rate:.2f} fps render, ETA {eta/60:.1f} min",
                        flush=True,
                    )
            encoder.stdin.close()
            stderr = encoder.stderr.read() if encoder.stderr else b""
            return_code = encoder.wait()
            if return_code:
                raise RuntimeError(f"FFmpeg video encode failed ({return_code}): {stderr.decode(errors='replace')}")
        except Exception:
            if encoder.poll() is None:
                encoder.kill()
                encoder.wait()
            if encoder.stderr:
                detail = encoder.stderr.read().decode(errors="replace")
                if detail:
                    print(detail, file=sys.stderr)
            raise
        finally:
            browser.close()

    if browser_errors:
        raise RuntimeError("Browser reported errors during render:\n" + "\n".join(browser_errors[:20]))

    if not args.silent_only:
        audio_duration = probe_audio_duration(audio)
        mux_cmd = [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(video_only), "-i", str(audio),
            "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
            "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
            "-t", f"{audio_duration:.6f}", "-movflags", "+faststart", str(output),
        ]
        subprocess.run(mux_cmd, check=True)
        if not args.keep_video_only:
            video_only.unlink(missing_ok=True)

    print(f"Output: {output}", flush=True)
    if output.exists():
        print(f"Size: {output.stat().st_size / (1024*1024):.1f} MiB", flush=True)
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
