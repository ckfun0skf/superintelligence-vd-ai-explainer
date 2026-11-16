export const chapterFiveMarkup = `
<section class="chapter5-stage" id="chapter5-stage" aria-label="Neuroevolution and the Snake game example">
  <div class="evo-backdrop" id="evo-backdrop" aria-hidden="true"></div>

  <div class="evo-bridge" id="evo-bridge">
    <div class="evo-bridge-network">
      <span class="evo-bridge-node"></span><span class="evo-bridge-node"></span><span class="evo-bridge-node"></span>
      <span class="evo-bridge-signal"></span>
    </div>
    <div class="evo-bridge-copy"><span>SUPERVISED TRAINING</span><b>Examples have answers.</b><i>But some tasks are easier to score than to label.</i></div>
  </div>
  <div class="evo-score-concept" id="evo-score-concept">
    <div class="evo-score-card"><span class="evo-score-icon">✓</span><b>GOOD RESULT</b><i>Score rises</i></div>
    <div class="evo-score-versus">OR</div>
    <div class="evo-score-card is-bad"><span class="evo-score-icon">×</span><b>BAD RESULT</b><i>Score falls</i></div>
  </div>
  <div class="evo-population-caption" id="evo-population-caption"><span class="evo-orbit-dot"></span><b>TRY MANY CANDIDATES</b><i>Keep the settings that perform better.</i></div>

  <svg class="evo-candidate-grid" id="evo-candidate-grid" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="evoCardFill" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#152432"/><stop offset="1" stop-color="#0a131d"/></linearGradient>
      <linearGradient id="evoScoreFill" x1="0" x2="1"><stop stop-color="#59afd0"/><stop offset="1" stop-color="#91f2d2"/></linearGradient>
      <filter id="evoGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <marker id="evoArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#72c8ff"/></marker>
    </defs>
    <g id="evo-candidate-cards"></g>
  </svg>

  <section class="evo-natural" id="evo-natural" aria-hidden="true">
    <svg class="evo-nature-scene" viewBox="0 0 1920 1080" preserveAspectRatio="none">
      <defs>
        <linearGradient id="evoBark" x1="0" x2="1"><stop stop-color="#7f7462"/><stop offset=".5" stop-color="#51483e"/><stop offset="1" stop-color="#9a876b"/></linearGradient>
        <linearGradient id="evoSky" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#183247" stop-opacity=".16"/><stop offset="1" stop-color="#080e17" stop-opacity=".95"/></linearGradient>
      </defs>
      <rect x="0" y="0" width="1920" height="1080" fill="url(#evoSky)"/>
      <text x="960" y="78" class="evo-svg-kicker" text-anchor="middle">PEPPERED MOTHS · A CHANGE IN CAMOUFLAGE</text>
      <g class="evo-woodland" id="evo-woodland">
        <path id="evo-tree-bark" d="M525 160 Q595 212 563 315 Q614 386 570 500 Q620 589 580 710 L1275 710 Q1225 594 1270 492 Q1225 386 1277 304 Q1226 205 1290 160Z" fill="url(#evoBark)" stroke="#ccb998" stroke-opacity=".45" stroke-width="7"/>
        <path d="M730 175Q688 300 754 402T735 675M870 160Q921 270 865 360T900 690M1042 166Q1005 300 1060 410T1024 700M1160 170Q1120 264 1178 372T1151 700" fill="none" stroke="#e0d0b0" stroke-opacity=".23" stroke-width="13"/>
        <g id="evo-lichen" fill="#c5c0a6" opacity=".94"><path d="M644 225q46-50 88 2t-22 46q-43 22-66-14t-47 8q-28-22 47-42ZM1083 227q42-43 76 4t-28 46q-31 8-48-23t-31 16q-30-22 31-43ZM687 555q48-42 83 11t-25 41q-36 9-52-22t-33 10q-29-17 27-40ZM1116 533q36-48 78-2t-20 48q-36 13-52-18t-37 12q-22-22 31-40Z"/></g>
        <path d="M400 710H1400" stroke="#4b5748" stroke-width="17" stroke-linecap="round"/>
        <path d="M465 711q100-80 175 0t165 0 160 0 160 0 160 0" fill="none" stroke="#2b4b40" stroke-width="12"/>
      </g>
      <g id="evo-moth-populations"></g>
      <g id="evo-bird-flock" class="evo-birds" opacity="0" transform="translate(-130 0)"><path d="M0 0q22-25 43 0 22-25 44 0M110 32q17-20 35 0 18-20 36 0M190-8q18-22 37 0 19-22 38 0M270 38q15-18 32 0 17-18 34 0" fill="none" stroke="#172330" stroke-width="8" stroke-linecap="round"/></g>
      <g id="evo-soot-cloud" opacity="0"><ellipse cx="960" cy="245" rx="570" ry="185" fill="#111419" opacity=".68"/><circle cx="595" cy="284" r="110" fill="#17191a" opacity=".5"/><circle cx="1280" cy="273" r="130" fill="#17191a" opacity=".55"/></g>
      <g id="evo-cleaning-glow" opacity="0"><path d="M420 160H1500V740H420Z" fill="#e7f1e6" opacity=".17"/><path d="M390 195H1525" stroke="#d8fff4" stroke-width="6" opacity=".55" filter="url(#evoGlow)"/></g>
      <g id="evo-nature-bars"></g>
      <g id="evo-generation-dots"><text id="evo-generation-label" x="960" y="875" class="evo-svg-kicker" text-anchor="middle">POPULATION · GENERATION 01</text><path d="M570 900H1350" stroke="#547080" stroke-width="3" stroke-dasharray="4 13"/><g fill="#91f2d2"><circle cx="610" cy="900" r="7"/><circle cx="735" cy="900" r="7"/><circle cx="860" cy="900" r="7"/><circle cx="985" cy="900" r="7"/><circle cx="1110" cy="900" r="7"/><circle cx="1235" cy="900" r="7"/><circle cx="1340" cy="900" r="7"/></g></g>
      <text id="evo-tree-state" x="960" y="826" class="evo-tree-state" text-anchor="middle">PALE, LICHEN-COVERED BARK</text>
      <text id="evo-nature-generation" x="960" y="968" class="evo-nature-subtitle" text-anchor="middle">BEFORE INDUSTRIAL POLLUTION</text>
      <rect id="evo-nature-overlay" x="0" y="0" width="1920" height="1080" fill="transparent"/>
      <g id="evo-not-individual" class="evo-not-individual" opacity="0"><rect x="610" y="425" width="700" height="150" rx="28"/><text x="960" y="485" text-anchor="middle">NOT ONE MOTH CHANGING</text><text x="960" y="535" text-anchor="middle">THE POPULATION SHIFTS OVER GENERATIONS</text></g>
      <g id="evo-extinction" class="evo-extinction" opacity="0">
        <path d="M245 708H1675" stroke="#364a56" stroke-width="5"/>
        <g id="evo-dinosaur" opacity="1" fill="#233d4a" stroke="#98b2b7" stroke-width="5"><path d="M650 674q-32-77 21-122 58-49 134-2l53-63 24 9-26 69q32 44 8 104l72 41H835l-36-48-46 2-14 46H617Z"/><path d="M646 593q-122-10-164-65-27-36-81-31 22-39 73-31 86 12 152 68M751 668l-7 65M830 666l13 67" fill="none" stroke-linecap="round"/><circle cx="799" cy="570" r="6" fill="#f6d19b" stroke="none"/></g>
        <g id="evo-asteroid" transform="translate(-180 -130) rotate(22)"><path d="M0-55 18-22 54-30 39 3 67 28 29 31 10 62-7 32-45 38-31 4-57-21-20-25Z" fill="#ffc776" stroke="#fff0ca" stroke-width="4" filter="url(#evoGlow)"/><circle r="9" fill="#fff8db"/></g>
        <g id="evo-survivor-birds" opacity="0" fill="none" stroke="#91f2d2" stroke-width="9" stroke-linecap="round"><path d="M1010 540q30-34 60 0 30-34 60 0M1165 600q24-28 49 0 25-28 50 0M920 630q20-24 42 0 22-24 44 0"/></g>
        <text x="960" y="810" class="evo-extinction-label" text-anchor="middle">NON-BIRD DINOSAURS · EXTINCT</text><text x="960" y="870" class="evo-extinction-survivor" text-anchor="middle">BIRDS · A SURVIVING DINOSAUR LINEAGE</text>
      </g>
    </svg>
  </section>

  <div class="evo-algorithm-copy" id="evo-algorithm-copy"><span>AN ALGORITHM CAN BORROW THE PATTERN</span><b>Score a population.<br/>Keep stronger candidates.<br/>Try again.</b><i>Not living organisms — candidate networks.</i></div>
  <svg class="evo-morph-dots" id="evo-morph-dots" viewBox="0 0 1920 1080" aria-hidden="true"><g fill="#ff626b"><circle cx="390" cy="290" r="5"/><circle cx="520" cy="745" r="6"/><circle cx="740" cy="390" r="4"/><circle cx="1120" cy="250" r="5"/><circle cx="1380" cy="695" r="6"/><circle cx="1570" cy="420" r="4"/><circle cx="920" cy="840" r="5"/><circle cx="690" cy="600" r="4"/><circle cx="1260" cy="530" r="5"/></g></svg>

  <div class="evo-snake-intro" id="evo-snake-intro">
    <div class="evo-snake-heading"><span>ONE NETWORK · ONE GAME</span><b>What should the snake do next?</b></div>
    <svg class="evo-snake-svg" viewBox="0 0 1920 1080" aria-hidden="true">
      <defs><marker id="evoSnakeArrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0 0 12 6 0 12Z" fill="#72c8ff"/></marker></defs>
      <g id="evo-main-board">
        <rect x="125" y="275" width="515" height="500" rx="28" fill="#09131d" stroke="#405b6d" stroke-width="5"/>
        <g stroke="#243a48" stroke-width="2"><path d="M228 280V770M331 280V770M434 280V770M537 280V770M130 375H635M130 475H635M130 575H635M130 675H635"/></g>
        <g id="evo-snake-body" fill="#91f2d2"><rect x="256" y="573" width="80" height="78" rx="13"/><rect x="334" y="573" width="80" height="78" rx="13" opacity=".8"/><rect x="412" y="573" width="80" height="78" rx="13" opacity=".64"/></g>
        <g id="evo-snake-head" transform="translate(490 573)"><rect width="80" height="78" rx="15" fill="#c9ffeb" stroke="#91f2d2" stroke-width="5"/><circle cx="56" cy="28" r="5" fill="#12212b"/><circle cx="56" cy="53" r="5" fill="#12212b"/></g>
        <g id="evo-apple-main" transform="translate(410 390)"><circle r="25" fill="#ff9677" stroke="#ffe0b8" stroke-width="4"/><path d="M0-24q8-22 24-19" fill="none" stroke="#91f2d2" stroke-width="7" stroke-linecap="round"/></g>
        <text x="382" y="830" class="evo-svg-kicker" text-anchor="middle">GAME BOARD</text>
      </g>
      <path d="M665 520C735 520 755 520 815 520" fill="none" stroke="#72c8ff" stroke-width="6" stroke-dasharray="13 16" marker-end="url(#evoSnakeArrow)"/>
      <g class="evo-network-mini">
        <path d="M920 385 1090 350M920 385 1090 470M920 520 1090 350M920 520 1090 470M920 655 1090 470M920 655 1090 590M1090 350 1280 405M1090 350 1280 540M1090 470 1280 405M1090 470 1280 540M1090 590 1280 540M1090 590 1280 675"/>
        <g><circle cx="920" cy="385" r="28"/><circle cx="920" cy="520" r="28"/><circle cx="920" cy="655" r="28"/><circle cx="1090" cy="350" r="30"/><circle cx="1090" cy="470" r="30"/><circle cx="1090" cy="590" r="30"/><circle cx="1280" cy="405" r="34"/><circle cx="1280" cy="540" r="34"/><circle cx="1280" cy="675" r="34"/></g>
        <g class="evo-network-pulse"><circle cx="920" cy="520" r="10"/><circle cx="1090" cy="470" r="10"/><circle cx="1280" cy="540" r="10"/></g>
      </g>
      <path d="M1330 540H1420" fill="none" stroke="#72c8ff" stroke-width="6" stroke-dasharray="13 16" marker-end="url(#evoSnakeArrow)"/>
      <g id="evo-snake-actions" class="evo-action-panel">
        <text x="1490" y="340" class="evo-svg-kicker">ACTION SCORES</text>
        <text id="evo-action-label-straight" x="1490" y="418" class="evo-action-name">GO STRAIGHT</text><rect x="1490" y="440" width="180" height="18" rx="9" fill="#263b49"/><rect id="evo-action-straight" x="1490" y="440" width="100" height="18" rx="9" fill="#91f2d2"/>
        <text id="evo-action-label-left" x="1490" y="518" class="evo-action-name">TURN LEFT</text><rect x="1490" y="540" width="180" height="18" rx="9" fill="#263b49"/><rect id="evo-action-left" x="1490" y="540" width="75" height="18" rx="9" fill="#72c8ff"/>
        <text id="evo-action-label-right" x="1490" y="618" class="evo-action-name">TURN RIGHT</text><rect x="1490" y="640" width="180" height="18" rx="9" fill="#263b49"/><rect id="evo-action-right" x="1490" y="640" width="90" height="18" rx="9" fill="#ba9aff"/>
        <text x="1580" y="720" class="evo-action-note" text-anchor="middle">GAME USES THE TOP SCORE</text>
      </g>
      <text x="382" y="940" class="evo-input-caption" text-anchor="middle">BOARD + FOOD + DANGER + DIRECTION</text>
      <text x="1100" y="940" class="evo-input-caption" text-anchor="middle">NETWORK</text>
    </svg>
  </div>
  <div class="evo-snake-system-labels" id="evo-snake-system-labels"><span>DESCRIBE THE BOARD</span><i></i><span>SCORE POSSIBLE MOVES</span><i></i><span>GAME TAKES THE TOP MOVE</span></div>
  <div class="evo-snake-inputs" id="evo-snake-inputs"><span>FOOD</span><i>＋</i><span>WALLS</span><i>＋</i><span>BODY</span><i>＋</i><span>HEADING</span></div>

  <div class="evo-fitness-note" id="evo-fitness-note"><span>ONE GAME ENDS</span><b>Apples raise fitness.</b><i>Crashes lower fitness.</i></div>
  <div class="evo-copy-mutation" id="evo-copy-mutation">
    <div class="evo-copy-parent"><span>HIGHER SCORE</span><b>KEEP THIS NETWORK</b><svg viewBox="0 0 220 130"><path d="M20 35 105 18M20 35 105 65M20 85 105 18M20 85 105 65M105 18 193 42M105 65 193 42"/><circle cx="20" cy="35" r="10"/><circle cx="20" cy="85" r="10"/><circle cx="105" cy="18" r="10"/><circle cx="105" cy="65" r="10"/><circle cx="193" cy="42" r="12"/></svg></div>
    <div class="evo-copy-arrow">COPY <i>→</i></div>
    <div class="evo-copy-child"><span>SMALL RANDOM CHANGES</span><b>NEW VARIATION</b><svg viewBox="0 0 220 130"><path d="M20 35 105 18M20 35 105 65M20 85 105 18M20 85 105 65M105 18 193 42M105 65 193 42"/><g id="evo-structural-mutation" opacity="0"><path d="M105 65 151 96 193 42"/><circle cx="151" cy="96" r="9"/></g><circle cx="20" cy="35" r="10"/><circle cx="20" cy="85" r="10"/><circle cx="105" cy="18" r="10"/><circle cx="105" cy="65" r="10"/><circle cx="193" cy="42" r="12"/><circle class="evo-child-change" cx="105" cy="65" r="17"/></svg></div>
    <strong>Mutation is random — it does not know which way is better.</strong>
  </div>
  <div class="evo-generation-loop" id="evo-generation-loop">
    <div><span id="evo-generation-count">GENERATION 01</span><b>PLAY → SCORE → SELECT → MUTATE</b></div>
    <svg viewBox="0 0 780 190" aria-hidden="true"><defs><marker id="evoLoopArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#91f2d2"/></marker></defs><path d="M145 77C175 22 273 18 310 58M455 62C510 32 592 50 610 94M596 130C555 180 462 171 431 139M305 140C242 180 158 153 153 112" fill="none" stroke="#91f2d2" stroke-width="6" stroke-dasharray="8 10" marker-end="url(#evoLoopArrow)"/><rect x="18" y="62" width="128" height="60" rx="18"/><rect x="300" y="37" width="160" height="60" rx="18"/><rect x="600" y="85" width="155" height="60" rx="18"/><rect x="300" y="120" width="160" height="55" rx="18"/><text x="82" y="101" text-anchor="middle">PLAY</text><text x="380" y="76" text-anchor="middle">SCORE</text><text x="678" y="124" text-anchor="middle">SELECT</text><text x="380" y="156" text-anchor="middle">MUTATE</text></svg>
  </div>
  <div class="evo-best-track" id="evo-many-boards"><span>TRY MORE THAN ONE BOARD</span><svg viewBox="0 0 520 80" aria-hidden="true"><path d="M20 40H500" stroke="#293d49" stroke-width="8" stroke-linecap="round"/><path id="evo-best-line" d="M20 40H500" stroke="#91f2d2" stroke-width="8" stroke-linecap="round" stroke-dasharray="780" stroke-dashoffset="780"/><circle cx="20" cy="40" r="13" fill="#91f2d2"/></svg><b>LESS CHANCE OF PICKING A LUCKY ONE-GAME RESULT</b></div>
  <div class="evo-human-score" id="evo-human-score"><span>THE GAME DESIGNER SETS THE FITNESS SCORE</span><b>WHAT COUNTS AS “BETTER” IS A CHOICE.</b><i>A poorly chosen score can reward an unwanted trick.</i></div>

  <div class="evo-comparison" id="evo-comparison">
    <span class="evo-compare-kicker">TWO DIFFERENT TRAINING SIGNALS</span>
    <div class="evo-compare-columns">
      <article><span class="evo-compare-icon">↔</span><b>SUPERVISED LEARNING</b><i>Compare each prediction with a supplied answer.</i><strong>GRADIENTS UPDATE WEIGHTS</strong></article>
      <div class="evo-compare-vs">OR</div>
      <article class="evo-compare-evo"><span class="evo-compare-icon">★</span><b>NEUROEVOLUTION</b><i>Compare whole candidates by their task score.</i><strong>SELECT + MUTATE CANDIDATES</strong></article>
    </div>
    <small>Some methods change weights; others can also change connections or add neurons. Neuroevolution is one training family, not how every network or LLM is trained.</small>
  </div>

  <div class="evo-outro" id="evo-outro">
    <div class="evo-outro-network" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <span id="evo-outro-summary">WE'VE SEEN A NETWORK LEARN A DEFINED TASK</span>
    <b id="evo-outro-question">How can one model<br/>answer so many different requests?</b>
    <div class="evo-outro-prompts" id="evo-outro-prompts">
      <div id="evo-prompt-0"><i>✦</i><b>EXPLAIN</b></div><div id="evo-prompt-1"><i>⇄</i><b>COMPARE</b></div><div id="evo-prompt-2"><i>✎</i><b>WRITE</b></div><div id="evo-prompt-3"><i>⌁</i><b>PLAN</b></div>
    </div>
    <strong id="evo-outro-limits">What happens inside when it appears to understand, reason, or plan — and where are the limits?</strong>
    <div class="evo-outro-next" id="evo-outro-next"><span>NEXT</span><i>→</i><b>HOW LANGUAGE MODELS WORK</b></div>
    <div class="evo-cta" id="evo-cta">IF THIS HELPED · PLEASE LIKE AND SUBSCRIBE</div>
  </div>
</section>
`;
