import * as THREE from 'three';
import '../style.css';

const film = document.querySelector('#film');
const audio = document.querySelector('#narration');
const scenes = [...document.querySelectorAll('.scene')];
const chapterButtons = [...document.querySelectorAll('.chapter-rail button')];
const playButton = document.querySelector('#play-toggle');
const seekBar = document.querySelector('#seek-bar');
const currentTimeEl = document.querySelector('#time-current');
const totalTimeEl = document.querySelector('#time-total');
const reviewText = document.querySelector('#review-transcript');
const audioState = document.querySelector('#audio-state');
const statusLabel = document.querySelector('#status-label');
const frameCounter = document.querySelector('#frame-counter');
const stageTransition = document.querySelector('#scene-transition');
const playbackRate = document.querySelector('#playback-rate');

const FPS = 24;
const plannedChapterSeconds = [45, 60, 55, 105, 50, 55, 80, 85];
const plannedTotal = plannedChapterSeconds.reduce((a, b) => a + b, 0);
let narrationTiming = null;
const chapterNames = ['CONTEXT WINDOW · COREFERENCE', 'TOKENS · EMBEDDINGS · POSITION', 'SELF-ATTENTION · CONTEXT MIX', 'QUERY · KEY · VALUE', 'MULTI-HEAD ATTENTION', 'TRANSFORMER BLOCK · LAYERS', 'CAUSAL MASK · NEXT TOKEN', 'CONTEXT → NEXT-TOKEN SCORES'];
const transcript = [
  'Imagine asking an AI to plan a nature weekend in Taipei, within an eight-thousand-dollar budget. In its answer, it may mention Maokong, a shaded trail, or a short hike. Now consider this sentence: “The trail near Maokong is shaded. It is short, too.” What information helps the model connect “it” with the trail? The answer is not one magic connection. It is a series of computations that lets each token build a representation using its surrounding context. A key mechanism is self-attention. And self-attention lives inside a larger architecture called the Transformer.',
  'Before attention, the text is split into tokens. A tokenizer assigns each token an ID, and the model looks up a learned numerical representation for it. That representation is called an embedding. An embedding is not a tiny definition stored inside a word. It is a vector: a list of numbers the network can work with. Order matters, too. “The trail is near Maokong” and “Maokong is near the trail” use similar words, but they say different things. A Transformer therefore needs information about where tokens occur in the sequence. Different architectures encode position in different ways. Now we can look at the sentence as a row of token representations, each carrying content and position information into the next calculation.',
  'Self-attention lets each token position combine information from other positions in the same sequence. Suppose we are examining “it.” The model computes a representation for that position from the current input, then compares it with other positions it is allowed to use. The result is not a permanent arrow from “it” to “trail.” It is a context-dependent mixture, recalculated from the sequence. Later layers can use that mixture along with other information. And this operation is not only for pronouns. Every position can form its own contextual representation. To see how the mixture is calculated, we need three names: Query, Key, and Value.',
  'For each token position, learned projections create three versions of its current representation: a Query, a Key, and a Value. Very loosely, you can think of the Query as what this position is looking to match; the Keys as what other positions offer for matching; and the Values as the information that can be mixed in. That is only a mnemonic. In the network, Query, Key, and Value are vectors produced by learned numerical transformations. They are not literal questions, database keys, or labels attached to words. For one position, its Query is compared with the Keys from the positions it is allowed to use. Those comparisons produce scores. Higher scores receive more weight after a softmax operation turns the scores into a distribution. The weights across accessible positions add up to one. The model uses them to combine the Values. In our simplified picture, “it” can draw useful signal from “trail.” The result is a new contextual vector—not a copied word, and not a final answer by itself. A compact way to write the operation is: scale the Query–Key scores, apply softmax to turn them into weights, then multiply by the Values. You do not need to memorize the formula. Watch the order: compare, normalize, mix.',
  'One attention calculation gives the model one learned view of the sequence. Multi-head attention runs several learned projections in parallel, then combines their results. A diagram might show different patterns: one lane connecting a reference, another linking a preference with a constraint. But real attention heads do not come with guaranteed human-readable job titles. They are learned parts of a larger computation, and their behavior varies across layers and models. The important idea is not “one head, one rule.” It is that several learned views can be combined before the representation moves on.',
  'Attention is not the whole Transformer. In a typical GPT-style block, an attention sublayer lets token positions exchange contextual information. A feed-forward network, often called an MLP, then transforms each position. Residual connections provide paths for information to flow around sublayers, while normalization helps keep activations in a useful range. The exact arrangement varies across architectures. But the broad pattern repeats: attention mixes information across positions, other layers transform it, and many blocks are stacked together. As the sequence moves through those layers, each token’s representation becomes a result of more computations on its context—not a little sentence stored inside the network.',
  'A GPT-style model is trained to predict what comes next. To do that safely, each position must not use tokens that come later in the sequence. A causal mask acts like a one-way gate. A position can use itself and earlier positions, but future positions are blocked. This preserves the left-to-right prediction rule. During training, the whole example is already available, so computations for many positions can be carried out in parallel while the mask still hides the future from each position. During generation, the model starts with the prompt. Its final position produces scores for possible next tokens. A decoding step selects one token; that token is appended, and the model makes another prediction using the longer context. Many systems cache earlier Key and Value calculations to save work, but the basic idea remains: extend the sequence one token at a time.',
  'Here is the core picture. Text becomes tokens, and tokens become vectors with information about position. Self-attention compares Queries with Keys, turns scores into weights, and uses those weights to mix Values. Multiple heads run learned views in parallel. Attention and feed-forward sublayers repeat through Transformer blocks, while a causal mask keeps next-token prediction pointed forward. This is not a human-like spotlight, and attention alone is not a complete explanation of a model’s answer. It is one important computation inside a much larger learned system. So when an AI connects a constraint to a suggestion, there is no single magic line doing all the work. There is a sequence of learned transformations building context—and using that context to score what could come next. That is one forward pass through a Transformer: context is built, one layer at a time, before the next token is chosen.'
];

let duration = 535;
let chapterStarts = [];
let chapterEnds = [];
let chapterScale = 1;
let manualTime = 0;
let lastChapter = -1;
let controlsTimer = 0;
let renderError = null;
let previewOnly = false;
let previewPlaying = false;
let lastTick = 0;

function clamp(x, a = 0, b = 1) { return Math.max(a, Math.min(b, x)); }
function smooth(a, b, x) { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }
function ease(x) { const t = clamp(x); return t * t * (3 - 2 * t); }
function fmt(seconds) { const s = Math.max(0, Math.floor(seconds)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
function setOpacity(el, value) { if (el) el.style.opacity = String(clamp(value)); }
function makeTokenRow(id, tokens) {
  const root = document.getElementById(id);
  if (!root) return [];
  root.replaceChildren();
  return tokens.map((token, i) => {
    const el = document.createElement('span');
    el.className = 'attention-token';
    el.textContent = token;
    el.dataset.index = String(i);
    root.append(el);
    return el;
  });
}
const attentionTokens = makeTokenRow('attention-token-row', ['The', 'trail', 'near', 'Maokong', 'is', 'shaded.', 'It', 'is', 'short,', 'too.']);
const qkvOriginTokens = makeTokenRow('qkv-origin', ['The', 'trail', 'near', 'Maokong', 'is', 'shaded.', 'It']);

function makeBars(id, labels, kind) {
  const root = document.getElementById(id);
  root.replaceChildren();
  return labels.map((label, i) => {
    const row = document.createElement('div');
    row.className = 'proj-row';
    row.innerHTML = `<em>${label}</em><i style="width:${30 + ((i * 17 + 29) % 65)}%"></i>`;
    root.append(row);
    return row;
  });
}
const qRows = makeBars('q-stack', ['qᵢ', 'projection'], 'q');
const keyRows = makeBars('k-stack', ['k₁ · trail', 'k₂ · near', 'k₃ · shaded', 'k₄ · Maokong'], 'k');
const valueRows = makeBars('v-stack', ['v₁', 'v₂', 'v₃', 'v₄'], 'v');
const scoreRoot = document.getElementById('score-stack');
const scoreRows = ['trail', 'near', 'shaded', 'Maokong'].map((label, i) => {
  const row = document.createElement('div'); row.className = 'score-row';
  row.innerHTML = `<span>${label}</span><div class="score-track"><div class="score-fill"></div></div><b class="score-value">0.00</b>`;
  scoreRoot.append(row); return row;
});
const qkvPaths = document.getElementById('qkv-paths');
for (let i = 0; i < 6; i++) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', `M ${185 + i * 10} 104 C ${260 + i * 6} ${170 + i * 10}, ${390 + i * 2} ${170 + i * 10}, ${480 + i * 3} 225`);
  p.dataset.index = String(i); qkvPaths.append(p);
}
const idCells = document.getElementById('id-cells');
const embeddingCells = document.getElementById('embedding-cells');
['102','481','92','733','318','11'].forEach((v, i) => {
  const cell = document.createElement('div'); cell.className = 'id-cell'; cell.textContent = v; cell.style.opacity = '.35'; idCells.append(cell);
  const emb = document.createElement('div'); emb.className = 'embedding-cell';
  for (let j = 0; j < 5; j++) { const line = document.createElement('i'); line.style.width = `${.45 + ((i * 7 + j * 5) % 8) * .12}cqw`; emb.append(line); }
  embeddingCells.append(emb);
});
const positionRibbon = document.getElementById('position-ribbon');
const headLanesRoot = document.getElementById('head-lanes');
const headLanes = [];
const headPatterns = [[0,2,3,5,6],[1,3,4,6,8],[0,1,5,6,9],[2,3,6,7,8]];
headPatterns.forEach((pattern, i) => {
  const row = document.createElement('div'); row.className = 'head-lane';
  row.innerHTML = `<div class="head-id">HEAD 0${i + 1}</div><div class="head-track"></div>`;
  const track=row.querySelector('.head-track');
  for(let j=0;j<10;j++){
    const node=document.createElement('i');node.className=`head-node ${pattern.includes(j)?'active':''}`;node.dataset.node=String(j);track.append(node);
    if(j<9){const link=document.createElement('i');link.className='head-link';link.style.opacity=pattern.includes(j)&&pattern.includes(j+1)?'.9':'.13';link.style.setProperty('--slant',`${(i%2?1:-1)*((j%3)-1)*4}deg`);track.append(link);}
  }
  headLanesRoot.append(row); headLanes.push(row);
});
const blockTokenStream = document.getElementById('block-token-stream');
['The','trail','near','it'].forEach((t,i)=>{const e=document.createElement('span');e.textContent=t;e.style.transform=`translateX(${i%2?'.5':'0'}cqw)`;blockTokenStream.append(e)});
const maskGrid = document.getElementById('mask-grid');
const N = 6;
for (let r=0;r<N;r++) for(let c=0;c<N;c++) { const e=document.createElement('div'); e.className=`mask-cell ${c<=r?'allowed':'blocked'}`; e.dataset.r=String(r); e.dataset.c=String(c); if(c===r)e.classList.add('current'); maskGrid.append(e); }
const generationTokens = document.getElementById('generation-tokens');
const genWords = ['The','trail','near','Maokong','is','shaded.','It','is'];
genWords.forEach((word,i)=>{const el=document.createElement('span');el.className='gen-token';el.textContent=word;generationTokens.append(el)});
['short,','too.'].forEach((word,i)=>{const el=document.createElement('span');el.className='gen-token generated';el.textContent=word;el.dataset.generated=String(i);el.style.opacity='0';generationTokens.append(el)});
const recapPath = document.getElementById('recap-path');
const recapPathLength = recapPath.getTotalLength?.() ?? 1800;
const hookPaths = [...document.querySelectorAll('.hook-links path')];
const attentionSvg = document.getElementById('attention-lines');
const attentionPaths = [];
const targetIndices = [1, 2, 3, 5, 7, 8];
for (let i=0;i<targetIndices.length;i++) {
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');
  const x1=340+i*36, x2=650+(targetIndices[i]-6)*48, y1=330, y2=70+(targetIndices[i]%3)*20;
  p.setAttribute('d',`M ${x1} ${y1} C ${x1+40} ${y1-150}, ${x2-55} ${y2+130}, ${x2} ${y2}`);
  p.dataset.target=String(targetIndices[i]); attentionSvg.append(p); attentionPaths.push(p);
}

// A seeded, absolute-time particle field gives the typography a quiet 3D depth layer.
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#webgl'), alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setClearColor(0x000000, 0);
const threeScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(44, 16/9, .1, 120);
camera.position.set(0, 0, 30);
const count = 620;
const basePositions = new Float32Array(count * 3);
const phases = new Float32Array(count);
let seed = 91731;
function rand(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }
for(let i=0;i<count;i++){
  const z=(rand()-.5)*48; const spread=13+rand()*14;
  basePositions[i*3]=(rand()-.5)*spread;
  basePositions[i*3+1]=(rand()-.5)*spread*.58;
  basePositions[i*3+2]=z;
  phases[i]=rand()*Math.PI*2;
}
const pointGeometry=new THREE.BufferGeometry();
pointGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(basePositions),3));
const pointMaterial=new THREE.PointsMaterial({color:0x80c6d1,size:.085,transparent:true,opacity:.56,depthWrite:false,sizeAttenuation:true});
const particles=new THREE.Points(pointGeometry,pointMaterial);threeScene.add(particles);
const linePositions=[];
for(let i=0;i<88;i++){
  const a=(i*7)%count,b=(a+17+(i%11)*3)%count;
  linePositions.push(basePositions[a*3],basePositions[a*3+1],basePositions[a*3+2],basePositions[b*3],basePositions[b*3+1],basePositions[b*3+2]);
}
const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(linePositions,3));
const lines=new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:0x467c89,transparent:true,opacity:.16}));threeScene.add(lines);
const ambient=new THREE.AmbientLight(0xffffff,.8);threeScene.add(ambient);
function resizeRenderer(){const r=film.getBoundingClientRect();renderer.setSize(Math.max(1,Math.round(r.width)),Math.max(1,Math.round(r.height)),false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
new ResizeObserver(resizeRenderer).observe(film);resizeRenderer();

function calculateChapters(total) {
  chapterStarts=[]; chapterEnds=[];
  if(narrationTiming?.chapters?.length===plannedChapterSeconds.length){
    let t=0;
    narrationTiming.chapters.forEach((chapter,i)=>{
      const start=Number(t.toFixed(3));
      chapterStarts.push(start);
      const end=Number((start+Number(chapter.duration_seconds)).toFixed(3));
      chapterEnds.push(i===narrationTiming.chapters.length-1?total:end);
      t=Number((end+(i<narrationTiming.chapters.length-1?Number(narrationTiming.gap_seconds||0):0)).toFixed(3));
    });
    return;
  }
  chapterScale = total / plannedTotal;
  let t=0;
  for(const w of plannedChapterSeconds){chapterStarts.push(t);t+=w*chapterScale;chapterEnds.push(t);}
}
calculateChapters(duration);
fetch(new URL('./audio/chapter-timing.json', window.location.href))
  .then(response=>{if(!response.ok)throw new Error('No chapter timing metadata');return response.json();})
  .then(data=>{
    if(data.chapters?.length!==plannedChapterSeconds.length)return;
    narrationTiming=data;
    if(Number.isFinite(audio.duration)&&audio.duration>0){duration=audio.duration;calculateChapters(duration);renderAt(audio.currentTime||0);}
  })
  .catch(()=>{});
function activeSceneIndex(t){for(let i=chapterEnds.length-1;i>=0;i--) if(t>=chapterStarts[i]) return i; return 0;}
function localProgress(t,i){const span=chapterEnds[i]-chapterStarts[i];return clamp((t-chapterStarts[i])/Math.max(.001,span));}
function setSceneTransition(sceneIndex,p,t){const pulse=Math.exp(-Math.pow((p-.06)/.034,2))*.14;setOpacity(stageTransition,pulse);stageTransition.style.background=sceneIndex%2?'#b7f4ff':'#d2fff1';}
function setDash(path,progress){const len=path.getTotalLength?.()??1000;path.style.strokeDasharray=String(len);path.style.strokeDashoffset=String(len*(1-clamp(progress)));}
function renderHook(p){
  const chat=document.querySelector('.chat-app'),sentence=document.querySelector('.hook-sentence'),prompt=document.querySelector('.hook-prompt'),tag=document.querySelector('.scene-tag');
  setOpacity(chat,1-smooth(.18,.5,p));chat.style.transform=`translateY(${(1-smooth(.18,.5,p))*.6}cqw) scale(${1+smooth(.22,.68,p)*.08})`;
  setOpacity(sentence,smooth(.15,.38,p));sentence.style.transform=`translateY(${(1-smooth(.5,.8,p))*.2}cqw) scale(${1+smooth(.35,.68,p)*.12})`;
  setOpacity(prompt,smooth(.48,.64,p)*(1-smooth(.88,.99,p)));setOpacity(tag,smooth(.64,.76,p));
  hookPaths.forEach((path,i)=>{setDash(path,clamp((p-.43-i*.08)/.18));path.style.opacity=String(.12+smooth(.48,.75,p)*.55);});
}
function renderVectors(p){
  const ids=[...idCells.children],embs=[...embeddingCells.children];
  ids.forEach((e,i)=>{setOpacity(e,.22+smooth(.08+i*.055,.2+i*.055,p)*.7);e.style.transform=`translateY(${Math.sin(p*8+i)*.06}cqw)`;});
  embs.forEach((e,i)=>{setOpacity(e,smooth(.2+i*.05,.37+i*.05,p));e.style.transform=`translateY(${(1-smooth(.2+i*.04,.65+i*.04,p))*.35}cqw) scale(${.86+.14*smooth(.2,.6,p)})`;});
  const ribbon=smooth(.34,.54,p)*(1-smooth(.9,1,p));positionRibbon.style.opacity=String(ribbon);positionRibbon.style.transform=`scaleX(${.2+.8*smooth(.38,.65,p)})`;
  document.querySelectorAll('.order-row.swapped span').forEach((e,i)=>{e.style.transform=`translateX(${(1-smooth(.48,.77,p))*(i%2?-.2:.2)}cqw)`;e.style.opacity=String(.35+.45*smooth(.55,.82,p));});
}
function renderAttention(p){
  const focusIndex=p<.56?6:1; const label=focusIndex===6?'CURRENT POSITION · “IT”':'ANOTHER POSITION · “TRAIL”';
  document.getElementById('focus-label').textContent=label;
  attentionTokens.forEach((el,i)=>{el.classList.toggle('focus',i===focusIndex);el.style.opacity=String(i===focusIndex?1:.45+((i*13)%5)*.07);el.style.transform=`translateY(${i===focusIndex?-.3*Math.sin(p*8):0}cqw)`;});
  attentionPaths.forEach((path,i)=>{const t=Number(path.dataset.target);const chosen=focusIndex===6?t===1||t===3||t===5:t===6||t===0;path.style.opacity=String((chosen?.1:.025)+smooth(.16+i*.06,.34+i*.06,p)*(chosen?.72:.13));path.style.strokeWidth=chosen?'2.6':'1.2';path.style.strokeDashoffset=String((1-p)*34);});
  const orb=document.querySelector('.context-orb');orb.style.transform=`scale(${.85+.16*Math.sin(p*8)})`;document.querySelectorAll('.context-orb i').forEach((e,i)=>e.style.opacity=String(.42+.48*((Math.sin(p*13+i*1.5)+1)/2)));
}
function renderQKV(p){
  const active=smooth(.06,.22,p),matrix=smooth(.14,.45,p),weights=smooth(.34,.59,p),mix=smooth(.55,.77,p),formula=smooth(.7,.82,p)*(1-smooth(.95,1,p));
  [...qRows,...keyRows,...valueRows].forEach((row,i)=>{row.style.opacity=String(.25+.75*active);row.style.transform=`translateX(${(1-active)*.35}cqw)`;});
  qkvPaths.querySelectorAll('path').forEach((path,i)=>{path.style.opacity=String(.06+matrix*(i===0||i===3?.55:.16));path.style.strokeDashoffset=String((1-matrix)*130+i*7);});
  const raw=[.55,.2,.16,.09];const softmax=raw.map((x,i)=>Math.pow(x,1.35+(1-p)*.3));const sum=softmax.reduce((a,b)=>a+b,0);
  scoreRows.forEach((row,i)=>{const value=softmax[i]/sum;const fill=row.querySelector('.score-fill');fill.style.width=`${value*100}%`;fill.style.opacity=String(.18+weights*.82);row.querySelector('.score-value').textContent=(value*100).toFixed(0)+'%';row.style.opacity=String(.25+weights*.75);});
  valueRows.forEach((row,i)=>{const value=softmax[i]/sum;row.style.opacity=String(.12+weights*(.2+value*.8));row.querySelector('i').style.width=`${24+value*68}%`;});
  document.getElementById('mix-signal').style.transform=`translateX(${mix*2.7}cqw) scale(${.6+mix*.6})`;document.querySelector('.mix-output').style.opacity=String(mix);
  document.getElementById('formula-panel').style.opacity=String(formula);
  document.querySelectorAll('.mechanism-steps span').forEach((e,i)=>{e.style.color=p>(.2+i*.22)?'#91f2d2':'#8092a2';e.style.textShadow=p>(.2+i*.22)?'0 0 .8cqw #91f2d2':'';});
}
function renderHeads(p){
  headLanes.forEach((lane,i)=>{lane.style.opacity=String(.2+.8*smooth(.08+i*.11,.28+i*.11,p));lane.style.transform=`translateX(${(1-smooth(.1+i*.08,.5+i*.07,p))*1.3}cqw)`;lane.querySelectorAll('.head-node').forEach((node,j)=>{const active=node.classList.contains('active');node.style.boxShadow=active&&p>.3?`0 0 ${.35+((Math.sin(p*11+j+i)+1)*.42)}cqw currentColor`:'';});});
  const combine=document.getElementById('heads-combine');combine.style.transform=`rotate(${p*54}deg) scale(${.82+.16*smooth(.45,.8,p)})`;combine.style.opacity=String(smooth(.24,.65,p));
  document.querySelectorAll('.head-merge path').forEach((e,i)=>{e.style.opacity=String(.07+.4*smooth(.18+i*.08,.56+i*.08,p));e.style.strokeDashoffset=String(-p*85);});
}
function renderBlock(p){
  const stack=document.getElementById('transformer-stack');stack.style.transform=`translateX(${(1-smooth(.05,.28,p))*3}cqw) rotateY(${(smooth(.45,.95,p)-.5)*5}deg) scale(${.94+.06*smooth(.35,.8,p)})`;
  stack.querySelectorAll('.transformer-block').forEach((el,i)=>{el.style.filter=`brightness(${.62+.38*smooth(.12+i*.18,.32+i*.18,p)})`;});
  document.querySelectorAll('.explain-item').forEach((e,i)=>{e.classList.toggle('active',p>.14+i*.23&&p<.55+i*.22);});
  [...blockTokenStream.children].forEach((e,i)=>{e.style.opacity=String(.45+.5*smooth(.08+i*.12,.35+i*.12,p));e.style.transform=`translateX(${smooth(.25,.86,p)*(.5+i*.2)}cqw)`;});
  document.querySelectorAll('.residual-loop').forEach(e=>e.style.transform=`rotate(${p*360}deg)`);
}
function renderMask(p){
  const training=p<.45;document.querySelectorAll('.mask-mode').forEach(e=>e.classList.toggle('active',e.dataset.mode===(training?'training':'generation')));
  const rowIndex=training?Math.min(5,Math.floor(p/.45*6)):Math.min(5,Math.floor((p-.45)/.55*6));
  document.querySelectorAll('.mask-cell').forEach(e=>{const r=Number(e.dataset.r),c=Number(e.dataset.c);e.classList.toggle('current',r===rowIndex);e.style.opacity=c<=r?String(.3+.65*(training?(.3+.7*((Math.sin(p*17+r+c)+1)/2)):r===rowIndex?1:.45)):'0.57';});
  const caption=document.getElementById('mask-caption');caption.textContent=training?'Training: many positions compute in parallel; each row still masks its future.':'Generation: choose one token, append it, then predict from the longer context.';
  setOpacity(document.querySelector('.kv-cache'),smooth(.79,.9,p));
  const appendedCount=(p>.79?2:p>.63?1:0);
  [...generationTokens.children].forEach((e,i)=>{const generated=i>=genWords.length;const gi=generated?Number(e.dataset.generated):-1;const shown=generated&&gi<appendedCount;e.classList.toggle('new',shown);e.style.opacity=generated?String(shown?smooth(gi===0?.63:.79,gi===0?.68:.84,p):0):'1';e.style.transform=`translateY(${shown?-Math.sin(p*12+i)*.12:0}cqw)`;});
  const candidates=document.getElementById('next-candidates');candidates.style.opacity=String(smooth(.48,.6,p)*(1-smooth(.9,.98,p)));const candidateLabels=p<.72?['short','long','park']:['too.','today','.'];candidates.querySelectorAll('b').forEach((e,i)=>{e.textContent=candidateLabels[i];e.classList.toggle('selected',i===0);});
}
function renderRecap(p){
  document.querySelectorAll('#recap-route span').forEach((e,i)=>{const q=clamp((p-.12-i*.13)/.18);e.classList.toggle('active',q>.05);e.style.transform=`translateY(${(1-q)*.5}cqw) scale(${.92+.08*q})`;});
  setDash(recapPath,clamp((p-.07)/.55));recapPath.style.strokeDasharray=String(recapPathLength);recapPath.style.strokeDashoffset=String(-p*90);
  const copy=document.getElementById('recap-copy');setOpacity(copy,smooth(.45,.65,p));copy.style.transform=`translateY(${(1-smooth(.5,.78,p))*.6}cqw)`;
  setOpacity(document.getElementById('closing-line'),smooth(.78,.92,p));
}
function renderAt(seconds){
  const t=clamp(seconds,0,duration);manualTime=t;
  const idx=activeSceneIndex(t),start=chapterStarts[idx],end=chapterEnds[idx],p=clamp((t-start)/Math.max(.001,end-start));
  scenes.forEach((scene,i)=>{const enter=i===idx?1:0;const exit=i===idx?1-smooth(.94,1,p):0;const opacity=enter*exit;scene.classList.toggle('active',i===idx);scene.style.opacity=String(opacity);scene.style.transform=`scale(${1.018-.018*smooth(0,.045,p)}) translateY(${(1-smooth(0,.045,p))*.25}cqw)`;scene.setAttribute('aria-hidden',i===idx?'false':'true');});
  setSceneTransition(idx,p,t);
  [renderHook,renderVectors,renderAttention,renderQKV,renderHeads,renderBlock,renderMask,renderRecap][idx](p);
  const worldT=t/duration;particles.rotation.y=worldT*.36;particles.rotation.x=Math.sin(worldT*6.28)*.05;lines.rotation.y=-worldT*.22;
  const pos=pointGeometry.attributes.position.array;
  const activeEnergy=.55+.25*Math.sin(worldT*Math.PI*2);
  for(let i=0;i<count;i++){pos[i*3]=basePositions[i*3]+Math.sin(t*.22+phases[i])*.13;pos[i*3+1]=basePositions[i*3+1]+Math.cos(t*.18+phases[i]*1.7)*.11;pos[i*3+2]=basePositions[i*3+2]+Math.sin(t*.1+phases[i])*.12;}
  pointGeometry.attributes.position.needsUpdate=true;pointMaterial.opacity=activeEnergy;
  renderer.render(threeScene,camera);
  const frame=Math.round(t*FPS);frameCounter.textContent=fmt(t);statusLabel.textContent=chapterNames[idx];
  if(idx!==lastChapter){chapterButtons.forEach((b,i)=>b.classList.toggle('active',i===idx));reviewText.textContent=transcript[idx];lastChapter=idx;}
  currentTimeEl.textContent=fmt(t);if(!seekBar.matches(':active'))seekBar.value=String(duration?t/duration*100:0);
  return {time:t,frame,chapter:idx,progress:p};
}

function previewTick(now){
  if(!previewPlaying)return;
  if(lastTick){manualTime=Math.min(duration,manualTime+(now-lastTick)/1000*Number(playbackRate.value));renderAt(manualTime);}
  lastTick=now;
  if(manualTime>=duration){previewPlaying=false;lastTick=0;playButton.textContent='▶';playButton.setAttribute('aria-label','Play');audioState.textContent='Visual preview complete · narration pending';return;}
  requestAnimationFrame(previewTick);
}

window.renderAt=renderAt;
window.renderFrame=(frame)=>renderAt(frame/FPS);
window.getChapterStarts=()=>[...chapterStarts];

function showControls(){film.closest('.player-shell').classList.remove('controls-hidden');window.clearTimeout(controlsTimer);if(film.closest('.player-shell').classList.contains('fullscreen')&&!audio.paused){controlsTimer=window.setTimeout(()=>film.closest('.player-shell').classList.add('controls-hidden'),2800);}}
playButton.addEventListener('click',()=>{
  if(previewOnly){
    previewPlaying=!previewPlaying;
    if(previewPlaying){playButton.textContent='❚❚';playButton.setAttribute('aria-label','Pause');audioState.textContent='Visual preview playing · narration pending';lastTick=0;requestAnimationFrame(previewTick);}
    else{playButton.textContent='▶';playButton.setAttribute('aria-label','Play');audioState.textContent='Visual preview paused · narration pending';lastTick=0;}
    return;
  }
  if(audio.paused)audio.play().catch(()=>{});else audio.pause();
});
audio.addEventListener('play',()=>{playButton.textContent='❚❚';playButton.setAttribute('aria-label','Pause');audioState.textContent='Narration playing';});
audio.addEventListener('pause',()=>{playButton.textContent='▶';playButton.setAttribute('aria-label','Play');audioState.textContent='Narration paused';renderAt(audio.currentTime);});
function applyAudioMetadata(){
  if(audio.readyState<1||!Number.isFinite(audio.duration)||audio.duration<=0)return false;
  previewOnly=false;duration=audio.duration;calculateChapters(duration);totalTimeEl.textContent=fmt(duration);
  audioState.textContent=`Narration ready · ${fmt(duration)}`;renderAt(audio.currentTime||0);return true;
}
audio.addEventListener('loadedmetadata',applyAudioMetadata);
audio.addEventListener('timeupdate',()=>renderAt(audio.currentTime));
audio.addEventListener('seeked',()=>renderAt(audio.currentTime));
audio.addEventListener('ended',()=>{renderAt(duration);audioState.textContent='Narration complete';});
audio.addEventListener('error',()=>{previewOnly=true;audioState.textContent='Visual preview · narration pending';totalTimeEl.textContent=fmt(duration);renderAt(manualTime);});
seekBar.addEventListener('input',()=>{const t=Number(seekBar.value)/100*duration;if(!previewOnly)audio.currentTime=t;renderAt(t);showControls();});
chapterButtons.forEach((button,i)=>button.addEventListener('click',()=>{const t=chapterStarts[i]??0;if(!previewOnly)audio.currentTime=t;renderAt(t);showControls();}));
playbackRate.addEventListener('change',()=>{audio.playbackRate=Number(playbackRate.value);});
const shell=film.closest('.player-shell');
document.querySelector('#fullscreen-toggle').addEventListener('click',async()=>{if(!document.fullscreenElement){await shell.requestFullscreen?.();shell.classList.add('fullscreen');}else await document.exitFullscreen?.();showControls();});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){shell.classList.remove('fullscreen','controls-hidden');}else{shell.classList.add('fullscreen');showControls();}resizeRenderer();});
shell.addEventListener('pointermove',showControls);shell.addEventListener('pointerdown',e=>{if(e.target===film||e.target===document.querySelector('#webgl'))showControls();});
window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)return;if(e.code==='Space'){e.preventDefault();playButton.click();}if(e.key==='f'||e.key==='F')document.querySelector('#fullscreen-toggle').click();if(e.key==='ArrowRight'){const t=Math.min(duration,(previewOnly?manualTime:audio.currentTime)+5);if(!previewOnly)audio.currentTime=t;renderAt(t);}if(e.key==='ArrowLeft'){const t=Math.max(0,(previewOnly?manualTime:audio.currentTime)-5);if(!previewOnly)audio.currentTime=t;renderAt(t);}});

renderAt(0);
if(!applyAudioMetadata()&&audio.error){previewOnly=true;audioState.textContent='Visual preview · narration pending';totalTimeEl.textContent=fmt(duration);}
