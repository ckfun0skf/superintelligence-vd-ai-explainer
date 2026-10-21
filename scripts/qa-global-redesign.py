#!/usr/bin/env python3
"""Cross-section QA for the single-master typography, motion, and player redesign."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = os.environ.get("PREVIEW_URL", "http://127.0.0.1:4181/")
OUT = Path(os.environ.get("QA_OUT", "/home/ubuntu/ai-explainer-redesign-qa"))
OUT.mkdir(parents=True, exist_ok=True)
TIMES = [21.0, 37.3, 39.5, 65.5, 89.0, 106.2, 131.0, 149.3, 159.5, 173.0,
         180.5, 198.0, 207.0, 216.0, 222.0, 242.8, 252.0, 261.0, 268.0,
         273.0, 286.0, 299.0, 304.7]
ERRORS: list[str] = []
FAILED: list[str] = []


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_viewport(browser, name: str, width: int, height: int, dpr: float) -> dict:
    page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=dpr)
    page.on("pageerror", lambda error: ERRORS.append(f"{name}: {error}"))
    page.on("console", lambda msg: ERRORS.append(f"{name} console: {msg.text}") if msg.type == "error" else None)
    page.on("requestfailed", lambda req: FAILED.append(f"{name}: {req.url}: {req.failure}")
            if req.failure and "ERR_ABORTED" not in req.failure else None)
    page.goto(URL, wait_until="networkidle")
    page.wait_for_function("window.previewTimeline && document.querySelector('#preview-audio').readyState >= 1")
    page.wait_for_timeout(100)

    base = page.evaluate("""() => {
      const stage=document.querySelector('#stage'), r=stage.getBoundingClientRect(), canvas=document.querySelector('#scene-canvas');
      return {viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
        stage:{width:r.width,height:r.height,ratio:r.width/r.height},canvas:{width:canvas.width,height:canvas.height},
        pageOverflow:{width:document.documentElement.scrollWidth-innerWidth,height:document.documentElement.scrollHeight-innerHeight},
        audioDuration:document.querySelector('#preview-audio').duration};
    }""")

    frames: dict[str, str] = {}
    for seconds in TIMES:
        page.evaluate("t => window.renderAt(t)", seconds)
        page.wait_for_timeout(35)
        path = OUT / f"{name}-{seconds:.1f}.png"
        page.locator("#stage").screenshot(path=str(path), animations="disabled")
        frames[str(seconds)] = sha(path)

    page.evaluate("window.renderAt(131)")
    typography = page.evaluate("""() => {
      const stage=document.querySelector('#stage').getBoundingClientRect();
      const sels=['.network-label','.llm-prompt small','.generated-token','.llm-context-return small'];
      return Object.fromEntries(sels.map(s=>{const e=document.querySelector(s);return [s,{px:parseFloat(getComputedStyle(e).fontSize),cqw:parseFloat(getComputedStyle(e).fontSize)/stage.width*100}]}));
    }""")

    # Every section chip should set the shared audio clock to that section's exact start.
    chapter_checks = []
    for chapter in page.locator('.chapter-button').evaluate_all("els=>els.map(e=>({title:e.innerText.trim(),time:+e.dataset.time}))"):
        page.locator(f'.chapter-button[data-time="{chapter["time"]}"]').click()
        page.wait_for_timeout(40)
        state = page.evaluate("""() => ({time:document.querySelector('#preview-audio').currentTime,
          active:document.querySelector('.chapter-button.is-active')?.dataset.time})""")
        chapter_checks.append({"title":chapter["title"],"expected":chapter["time"],
                               "time":round(state["time"],3),"active":state["active"]})

    toggle = page.locator('#chapter-toggle')
    toggle.click()
    collapsed = page.locator('#chapter-nav').is_hidden()
    toggle.click()
    expanded = page.locator('#chapter-nav').is_visible()

    page.evaluate("document.querySelector('.preview-column').classList.add('is-preview-fullscreen')")
    page.wait_for_timeout(40)
    fullscreen_fallback = page.evaluate("""() => {
      const r=document.querySelector('#stage').getBoundingClientRect();
      return {stage:{width:r.width,height:r.height,ratio:r.width/r.height},
        captionDisplay:getComputedStyle(document.querySelector('#review-caption')).display,
        orientationHint:getComputedStyle(document.querySelector('#fullscreen-orientation-hint')).display};
    }""")
    page.evaluate("document.querySelector('.preview-column').classList.remove('is-preview-fullscreen')")

    # Test actual Fullscreen API entry and the player's own exit control (not simulated CSS alone).
    page.locator('#fullscreen-button').click()
    page.wait_for_timeout(100)
    native_enter = page.evaluate("!!document.fullscreenElement")
    if native_enter:
        page.locator('#fullscreen-button').click()
        page.wait_for_timeout(100)
    native_exit = not page.evaluate("!!document.fullscreenElement")

    # Confirm real audio playback advances the caption and active chapter together.
    page.evaluate("document.querySelector('#preview-audio').currentTime=229.5")
    page.locator('#play-button').click()
    page.wait_for_timeout(550)
    playback = page.evaluate("""() => ({time:document.querySelector('#preview-audio').currentTime,
      paused:document.querySelector('#preview-audio').paused,
      caption:document.querySelector('#review-caption').textContent.trim(),
      active:document.querySelector('.chapter-button.is-active')?.dataset.time})""")
    page.locator('#play-button').click()

    motion_times = [131.0,149.3,159.5,173.0,180.5,198.0,207.0,216.0,222.0,
                    242.8,252.0,261.0,268.0,273.0,286.0,299.0,304.7]
    distinct_post_minute = len({frames[str(t)] for t in motion_times})
    page.close()
    return {"viewportName":name,"base":base,"typographyAtSection4":typography,
            "chapterChecks":chapter_checks,"chapterToggle":{"collapsed":collapsed,"expanded":expanded},
            "fullscreenFallback":fullscreen_fallback,"nativeFullscreen":{"entered":native_enter,"exitedByButton":native_exit},
            "playback":playback,"postMinuteDistinctFrames":distinct_post_minute,"keyframes":TIMES}


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", headless=True,
                                args=["--no-sandbox", "--disable-dev-shm-usage"])
    result = {
        "desktop": check_viewport(browser, "desktop", 1600, 1000, 1),
        "phone": check_viewport(browser, "phone", 390, 844, 3),
        "phoneLandscape": check_viewport(browser, "phone-landscape", 844, 390, 2),
        "pageErrors": ERRORS,
        "failedRequests": FAILED,
    }
    browser.close()

report = OUT / "report.json"
report.write_text(json.dumps(result, indent=2), encoding="utf-8")
print(json.dumps(result, indent=2))
