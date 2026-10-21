#!/usr/bin/env python3
"""Browser QA for the deterministic Section 06 tool-call sequence."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:4180/"
OUT = Path("/home/ubuntu/s06-qa")
OUT.mkdir(parents=True, exist_ok=True)
TIMES = [227.3, 227.866, 228.2, 229.9, 236.9, 242.8, 252.0, 261.0, 268.0, 273.0, 278.0, 286.0, 299.0, 304.7]
errors: list[str] = []
failed: list[str] = []

def inspect_viewport(browser, name: str, width: int, height: int) -> dict:
    page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
    page.on("pageerror", lambda error: errors.append(f"{name}: {error}"))
    page.on("console", lambda msg: errors.append(f"{name} console: {msg.text}") if msg.type == "error" else None)
    page.on("requestfailed", lambda request: failed.append(f"{name}: {request.url}: {request.failure}")
            if request.failure and "ERR_ABORTED" not in request.failure else None)
    page.goto(URL, wait_until="networkidle")
    page.wait_for_function("window.previewTimeline && document.querySelector('#preview-audio').readyState >= 1")
    page.wait_for_timeout(150)
    base = page.evaluate("""() => {
      const stage = document.querySelector('#stage').getBoundingClientRect();
      const audio = document.querySelector('#preview-audio');
      const canvas = document.querySelector('#scene-canvas');
      return {
        stage: {x:stage.x,y:stage.y,width:stage.width,height:stage.height,ratio:stage.width/stage.height},
        canvas: {width:canvas.width,height:canvas.height},
        audioDuration: audio.duration,
        previewDuration: window.previewTimeline.duration,
        audioReadyState: audio.readyState,
        audioSource: audio.currentSrc
      };
    }""")
    frames: dict[str, str] = {}
    for seconds in TIMES:
        page.evaluate("t => window.renderAt(t)", seconds)
        page.wait_for_timeout(35)
        name_frame = f"{name}-{seconds:.1f}.png"
        page.locator("#stage").screenshot(path=str(OUT / name_frame), animations="disabled")
        frames[str(seconds)] = hashlib.sha256((OUT / name_frame).read_bytes()).hexdigest()
    layout = page.evaluate("""() => {
      const ids=['call-need','call-model','call-catalog','call-guidance','call-request','call-orchestrator','call-map-service','call-result','call-context','call-response','call-cautions'];
      const stage=document.querySelector('#stage').getBoundingClientRect();
      const rects={};
      for(const id of ids){
        const el=document.getElementById(id), r=el.getBoundingClientRect();
        rects[id]={x:+((r.left-stage.left)/stage.width).toFixed(3),y:+((r.top-stage.top)/stage.height).toFixed(3),w:+(r.width/stage.width).toFixed(3),h:+(r.height/stage.height).toFixed(3),opacity:getComputedStyle(el).opacity};
      }
      const outside=Object.entries(rects).filter(([_,r])=>r.x < -0.002 || r.y < -0.002 || r.x+r.w > 1.002 || r.y+r.h > 1.002).map(([id])=>id);
      return {rects,outside,stageOverflow:{width:document.documentElement.scrollWidth-innerWidth,height:document.documentElement.scrollHeight-innerHeight},
        callLineCount:document.querySelectorAll('#tool-call-lines .call-line').length,
        visibleWarnings:getComputedStyle(document.querySelector('#call-cautions')).opacity};
    }""")
    page.evaluate("window.renderAt(242.8)")
    selected_map_at_match = page.evaluate("document.querySelector('#call-map-card').classList.contains('is-match')")
    # Repeated absolute seeks should reconstruct the same representative frame.
    page.evaluate("window.renderAt(273.0)")
    page.wait_for_timeout(35)
    repeat_path = OUT / f"{name}-repeat-273.0.png"
    page.locator("#stage").screenshot(path=str(repeat_path), animations="disabled")
    repeat_hash = hashlib.sha256(repeat_path.read_bytes()).hexdigest()
    # Exercise native player/audio synchronization in the Section 06 selection beat.
    page.evaluate("document.querySelector('#preview-audio').currentTime = 242.0")
    page.locator("#play-button").click()
    page.wait_for_timeout(600)
    playback = page.evaluate("""() => ({time:document.querySelector('#preview-audio').currentTime, paused:document.querySelector('#preview-audio').paused, mapSelected:document.querySelector('#call-map-card').classList.contains('is-match'), reviewCaption:document.querySelector('#review-caption').textContent})""")
    page.locator("#play-button").click()
    page.close()
    return {"viewport": {"width": width, "height": height}, "base": base, "layout": layout,
            "selectedMapAtMatch": selected_map_at_match,
            "repeatFrameDeterministic": frames["273.0"] == repeat_hash, "playback": playback}

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
    result = {"desktop": inspect_viewport(browser, "desktop", 1600, 1000),
              "mobile": inspect_viewport(browser, "mobile", 390, 844),
              "keyframeTimes": TIMES, "pageErrors": errors, "failedRequests": failed}
    browser.close()

(OUT / "report.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
print(json.dumps(result, indent=2))
