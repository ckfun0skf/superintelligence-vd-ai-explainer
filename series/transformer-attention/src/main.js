import * as THREE from 'three';
import '../style.css';
import '../style-overrides.css';
import { createQkvTimeline } from './qkv-timeline.js';

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
const playbackRate = document.querySelector('#playback-rate');

const FPS = 24;
const plannedChapterSeconds = [45, 60, 55, 105, 50, 55, 80, 85];
const plannedTotal = plannedChapterSeconds.reduce((a, b) => a + b, 0);
let narrationTiming = null;
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
let lastPreviewFrame = -1;

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
const qkvOriginTokens = makeTokenRow('qkv-origin', ['The', 'trail', 'near', 'Maokong', 'is', 'shaded.', 'It', 'is', 'short,', 'too.']);
const qkvFocusText = document.createElement('span');
qkvFocusText.className = 'qkv-token-word';
qkvFocusText.textContent = 'It';
qkvOriginTokens[6].replaceChildren(qkvFocusText);
const qkvFeatureVector = document.createElement('span');
qkvFeatureVector.className = 'qkv-feature-vector';
const qkvFeatureValues = [.36,.82,.52,.7,.28,.9,.43,.64];
qkvFeatureValues.forEach(value=>{const bar=document.createElement('i');bar.style.setProperty('--feature-height',`${20+value*68}%`);qkvFeatureVector.append(bar);});
qkvOriginTokens[6].append(qkvFeatureVector);
const valueColors = ['#91f2d2','#72c8ff','#ba9aff','#ffc776'];

function makeBars(id, labels, kind) {
  const root = document.getElementById(id);
  root.replaceChildren();
  return labels.map((label, i) => {
    const row = document.createElement('div');
    row.className = 'proj-row';
    const baseWidth=30 + ((i * 17 + 29) % 65);
    row.innerHTML = `<em>${label}</em><i style="width:${baseWidth}%" data-base-width="${baseWidth}"></i>`;
    root.append(row);
    return row;
  });
}
const qRows = makeBars('q-stack', ['qᵢ', 'projection'], 'q');
const keyRows = makeBars('k-stack', ['k₁ · trail', 'k₂ · near', 'k₃ · shaded', 'k₄ · Maokong'], 'k');
const valueRows = makeBars('v-stack', ['v₁ · trail', 'v₂ · near', 'v₃ · shaded', 'v₄ · Maokong'], 'v');
const scoreRoot = document.getElementById('score-stack');
const scoreRows = ['trail', 'near', 'shaded', 'Maokong'].map((label, i) => {
  const row = document.createElement('div'); row.className = 'score-row'; row.dataset.index=String(i);
  row.innerHTML = `<span>${label}</span><div class="score-track"><div class="score-fill"></div></div><b class="score-value">0.00</b>`;
  row.style.setProperty('--candidate-color',valueColors[i]);
  scoreRoot.append(row); return row;
});
const weightSegments=[...document.querySelectorAll('#weight-total i')];
const attentionWeights=[.64,.16,.12,.08];
weightSegments.forEach((segment,i)=>{segment.style.flexBasis=`${attentionWeights[i]*100}%`;segment.style.background=valueColors[i];});
valueRows.forEach((row,i)=>{row.style.setProperty('--candidate-color',valueColors[i]);row.querySelector('i').style.background=valueColors[i];});
keyRows.forEach((row,i)=>row.style.setProperty('--candidate-color',valueColors[i]));
const qkvPaths = document.getElementById('qkv-paths');
for (let i = 0; i < 11; i++) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', 'M 0 0 L 0 0');
  p.dataset.index = String(i); qkvPaths.append(p);
}
const qkvPulseDots=[...qkvPaths.querySelectorAll('path')].map((_,i)=>{const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r',String(i===0||i===3?5.5:4));dot.setAttribute('class','qkv-pulse');qkvPaths.append(dot);return dot;});
const mixedVectorValues=[.34,.76,.48,.92,.28,.63,.41,.81];
const mixedVectorBars=mixedVectorValues.map(value=>{const bar=document.createElement('i');bar.style.height=`${20+value*72}%`;bar.style.transform='scaleY(0)';document.getElementById('mix-vector').append(bar);return bar;});
const qkvTimeline=createQkvTimeline();
const idCells = document.getElementById('id-cells');
const embeddingCells = document.getElementById('embedding-cells');
['102','481','92','733','318','11','204','37','610','18'].forEach((v, i) => {
  const cell = document.createElement('div'); cell.className = 'id-cell'; cell.textContent = v; cell.style.opacity = '.35'; idCells.append(cell);
  const emb = document.createElement('div'); emb.className = 'embedding-cell';
  for (let j = 0; j < 5; j++) { const line = document.createElement('i'); const width=.45 + ((i * 7 + j * 5) % 8) * .12; line.dataset.width=String(width); line.style.width = `${width}cqw`; emb.append(line); }
  embeddingCells.append(emb);
});
const positionRibbon = document.getElementById('position-ribbon');
const vectorTokenPaths=[],vectorTokenParticles=[];
const vectorPathRoot=document.getElementById('vector-link-paths'),vectorParticleRoot=document.getElementById('vector-link-particles');
for(let i=0;i<idCells.children.length;i++){
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.dataset.index=String(i);path.setAttribute('d','M 0 0 L 0 0');vectorPathRoot.append(path);vectorTokenPaths.push(path);
  const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r','4');dot.dataset.index=String(i);vectorParticleRoot.append(dot);vectorTokenParticles.push(dot);
}
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
const headMergePaths=[...document.querySelectorAll('.head-merge path')];
const headMergeDots=headMergePaths.map((path,i)=>{const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r','5.5');dot.setAttribute('class','head-merge-pulse');path.parentElement.append(dot);return dot;});
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
const recapDots=Array.from({length:5},(_,i)=>{const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r',String(i===0?6:4.5));dot.setAttribute('class','recap-signal');recapPath.parentElement.append(dot);return dot;});
const continuityLayer=document.getElementById('continuity-layer');
const continuityWords=['The','trail','near','Maokong','is','shaded.','It','is','short,','too.'];
const continuityTokens=continuityWords.map(word=>{const node=document.createElement('span');node.className='continuity-token';node.textContent=word;continuityLayer.append(node);return node;});
const continuitySignal=document.createElement('i');continuitySignal.className='continuity-signal';continuityLayer.append(continuitySignal);
const continuityHidden=new Map();
const sceneRenderers=[renderHook,renderVectors,renderAttention,renderQKV,renderHeads,renderBlock,renderMask,renderRecap];
const continuityPairs=[
 {from:0,to:1,type:'tokens',source:()=>[...document.querySelectorAll('.scene-hook .hook-sentence [data-word]')],target:()=>[...document.querySelectorAll('.scene-vectors .token-phrase span')]},
 {from:1,to:2,type:'tokens',source:()=>[...document.querySelectorAll('.scene-vectors .token-phrase span')],target:()=>attentionTokens},
 {from:2,to:3,type:'tokens',source:()=>attentionTokens,target:()=>qkvOriginTokens},
 {from:3,to:4,type:'signal',source:()=>[document.querySelector('.scene-qkv .mix-output')],target:()=>[document.getElementById('heads-combine')]},
 {from:4,to:5,type:'signal',source:()=>[document.getElementById('heads-combine')],target:()=>[document.getElementById('transformer-stack')]},
 {from:5,to:6,type:'signal',source:()=>[document.getElementById('block-token-stream')],target:()=>[document.getElementById('mask-grid')]},
 {from:6,to:7,type:'signal',source:()=>[document.querySelector('#next-candidates .selected')||document.getElementById('next-candidates')],target:()=>[document.getElementById('recap-route')]}
];
function restoreContinuityNodes(){for(const [node,opacity] of continuityHidden)node.style.opacity=opacity;continuityHidden.clear();}
function blendColor(a,b,q){const parse=x=>(x.match(/[\d.]+/g)||[255,255,255,1]).map(Number);const A=parse(a),B=parse(b);if(A.length<4)A.push(1);if(B.length<4)B.push(1);return `rgba(${Math.round(A[0]+(B[0]-A[0])*q)},${Math.round(A[1]+(B[1]-A[1])*q)},${Math.round(A[2]+(B[2]-A[2])*q)},${(A[3]+(B[3]-A[3])*q).toFixed(3)})`;}
function boxInFilm(node,filmRect){const r=node.getBoundingClientRect();return{x:(r.left+r.width/2-filmRect.left)/filmRect.width*100,y:(r.top+r.height/2-filmRect.top)/filmRect.height*100,w:r.width/filmRect.width*100,h:r.height/filmRect.height*100};}
function snapshotHandoffNodes(nodes,filmRect){
  return (nodes||[]).filter(Boolean).map(node=>{
    const s=getComputedStyle(node);
    return{node,rect:boxInFilm(node,filmRect),style:{color:s.color,backgroundColor:s.backgroundColor,borderColor:s.borderColor,borderWidth:s.borderWidth,borderRadius:s.borderRadius,fontSize:s.fontSize,fontWeight:s.fontWeight,boxShadow:s.boxShadow}};
  });
}
function renderContinuityHandoff(t,activeIndex,activeProgress){
  continuityLayer.style.visibility='hidden';
  continuityTokens.forEach(chip=>chip.style.opacity='0');
  continuitySignal.style.opacity='0';
  const filmRect=film.getBoundingClientRect();
  for(const pair of continuityPairs){
    const windowStart=(chapterEnds[pair.from]??0)-.72,windowEnd=(chapterStarts[pair.to]??0)+.72;
    if(t<windowStart||t>windowEnd)continue;
    const q=clamp((t-windowStart)/Math.max(.001,windowEnd-windowStart)),e=smooth(0,1,q);
    // Sample both chapter endpoints at fixed progress, then restore the current audio-time scene.
    sceneRenderers[pair.from](1);
    const sourceNodes=(pair.source()||[]).filter(Boolean),sourceShots=snapshotHandoffNodes(sourceNodes,filmRect);
    sceneRenderers[pair.to](0);
    const targetNodes=(pair.target()||[]).filter(Boolean),targetShots=snapshotHandoffNodes(targetNodes,filmRect);
    sceneRenderers[activeIndex](activeProgress);
    if(!sourceShots.length||!targetShots.length)continue;
    continuityLayer.style.visibility='visible';
    if(pair.type==='tokens'){
      for(let i=0;i<continuityTokens.length;i++){
        const chip=continuityTokens[i],src=sourceShots[i],dst=targetShots[i];
        if(!src){chip.style.opacity='0';continue;}
        const a=src.rect,b=dst?.rect||{...a,x:Math.min(108,a.x+8),y:a.y-7,w:a.w,h:a.h};
        const sa=src.style,sb=dst?.style||sa;
        chip.style.left=`${a.x+(b.x-a.x)*e}%`;chip.style.top=`${a.y+(b.y-a.y)*e-Math.sin(e*Math.PI)*2.2}%`;
        chip.style.width=`${a.w+(b.w-a.w)*e}%`;chip.style.height=`${a.h+(b.h-a.h)*e}%`;
        chip.style.fontSize=`${(parseFloat(sa.fontSize)+(parseFloat(sb.fontSize)-parseFloat(sa.fontSize))*e)/filmRect.width*100}cqw`;
        chip.style.color=e<.55?sa.color:sb.color;chip.style.backgroundColor=blendColor(sa.backgroundColor,sb.backgroundColor,e);
        chip.style.borderColor=blendColor(sa.borderColor,sb.borderColor,e);chip.style.borderWidth=`${(parseFloat(sa.borderWidth||'0')+(parseFloat(sb.borderWidth||'0')-parseFloat(sa.borderWidth||'0'))*e)/filmRect.width*100}cqw`;
        chip.style.borderRadius=`${(parseFloat(sa.borderRadius||'0')+(parseFloat(sb.borderRadius||'0')-parseFloat(sa.borderRadius||'0'))*e)/filmRect.width*100}cqw`;
        chip.style.fontWeight=e<.5?sa.fontWeight:sb.fontWeight;chip.style.boxShadow=e>.78?sb.boxShadow:`0 0 ${e*.85}cqw #72c8ff55`;
        chip.style.padding=`${e*.12}cqw ${e*.2}cqw`;chip.style.transform=`translate(-50%,-50%) perspective(900px) rotateY(${Math.sin(e*Math.PI)*13}deg) rotateX(${Math.sin(e*Math.PI)*4}deg) translateZ(${Math.sin(e*Math.PI)*.6}cqw)`;
        chip.style.opacity=String(i>=targetShots.length?1-e:1);
      }
      for(const node of [...sourceNodes,...targetNodes])if(node&&!continuityHidden.has(node)){continuityHidden.set(node,node.style.opacity);node.style.opacity='0';}
    }else{
      const a=sourceShots[0].rect,b=targetShots[0].rect;
      continuitySignal.style.left=`${a.x+(b.x-a.x)*e}%`;continuitySignal.style.top=`${a.y+(b.y-a.y)*e-Math.sin(e*Math.PI)*4}%`;
      continuitySignal.style.transform=`translate(-50%,-50%) perspective(700px) rotateX(${Math.sin(e*Math.PI)*22}deg) scale(${.65+.6*Math.sin(e*Math.PI)})`;
      continuitySignal.style.opacity=String(.75+.25*Math.sin(e*Math.PI));
    }
    return;
  }
  continuitySignal.style.opacity='0';
}

const hookPaths = [...document.querySelectorAll('.hook-links path')];
const attentionSvg = document.getElementById('attention-lines');
const attentionParticleRoot=document.getElementById('attention-particles');
const attentionPaths = [];
const attentionParticles=[];
const targetIndices = [0, 1, 2, 3, 5, 6, 7, 8];
for (let i=0;i<targetIndices.length;i++) {
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d','M 0 0 L 0 0');
  p.dataset.target=String(targetIndices[i]); attentionSvg.append(p); attentionPaths.push(p);
  const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r','4.5');dot.dataset.target=String(targetIndices[i]);attentionParticleRoot.append(dot);attentionParticles.push(dot);
}

// A seeded, absolute-time particle field gives the typography a quiet 3D depth layer.
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#webgl'), alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
renderer.setClearColor(0x000000, 0);
const threeScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(44, 16/9, .1, 120);
camera.position.set(0, 0, 30);
const count = 180;
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
const pointMaterial=new THREE.PointsMaterial({color:0x80c6d1,size:.075,transparent:true,opacity:.14,depthWrite:false,sizeAttenuation:true});
const particles=new THREE.Points(pointGeometry,pointMaterial);threeScene.add(particles);
const linePositions=[];
for(let i=0;i<24;i++){
  const a=(i*7)%count,b=(a+17+(i%11)*3)%count;
  linePositions.push(basePositions[a*3],basePositions[a*3+1],basePositions[a*3+2],basePositions[b*3],basePositions[b*3+1],basePositions[b*3+2]);
}
const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(linePositions,3));
const lines=new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:0x467c89,transparent:true,opacity:.035}));threeScene.add(lines);
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
function sceneSpan(i){return Math.max(.001,(chapterEnds[i]??0)-(chapterStarts[i]??0));}
function sceneSeconds(i,p){return clamp(p)*sceneSpan(i);}
function phase(sec,hz,offset=0){const q=(sec*hz+offset)%1;return q<0?q+1:q;}
function pulse(sec,hz,offset=0){return .5+.5*Math.sin(sec*Math.PI*2*hz+offset);}
function setDash(path,progress){const len=path.getTotalLength?.()??1000;path.style.strokeDasharray=String(len);path.style.strokeDashoffset=String(len*(1-clamp(progress)));}
function renderHook(p){
  const sec=sceneSeconds(0,p);
  const chat=document.querySelector('.scene-hook .chat-app');
  const input=document.querySelector('.input-copy');
  const placeholder=document.querySelector('.input-placeholder');
  const send=document.querySelector('.send-button');
  const userBubble=document.querySelector('.scene-hook .chat-question');
  const thinking=document.querySelector('.scene-hook .chat-thinking');
  const answer=document.querySelector('.scene-hook .chat-answer');
  const mapCard=document.querySelector('.hook-location-card');
  const mapRoute=document.getElementById('hook-map-route');
  const mapDot=document.getElementById('hook-map-dot');
  const sentence=document.querySelector('.scene-hook .hook-sentence');
  const prompt=document.querySelector('.scene-hook .hook-prompt');
  const tag=document.querySelector('.scene-hook .scene-tag');
  const candidates=document.querySelector('.hook-candidates');
  const cues=document.querySelector('.hook-cues');
  const motionNote=document.getElementById('hook-motion-note');
  const itWord=sentence.querySelector('[data-word="6"]');
  const trailWord=sentence.querySelector('[data-word="1"]');
  const placeCard=document.getElementById('candidate-place');
  const trailCard=document.getElementById('candidate-trail');

  const typing=smooth(.015,.105,p),sent=smooth(.105,.19,p),thinkingIn=smooth(.19,.25,p)*(1-smooth(.34,.42,p));
  const answerIn=smooth(.24,.37,p)*(1-smooth(.39,.49,p));
  const mapIn=smooth(.28,.42,p)*(1-smooth(.43,.54,p));
  const sentenceIn=smooth(.34,.48,p);
  const ambiguity=smooth(.48,.59,p)*(1-smooth(.76,.84,p));
  const resolve=smooth(.64,.78,p);
  const concept=smooth(.82,.94,p);

  setOpacity(chat,1-smooth(.38,.55,p));
  chat.style.transform=`translate(${(-smooth(.18,.46,p)*3.8)}cqw,${(smooth(.4,.56,p)*-.35)}cqw) scale(${1-smooth(.4,.58,p)*.08})`;
  const composerVisible=typing*(1-smooth(.135,.19,p));
  input.style.clipPath=`inset(0 ${(1-composerVisible)*100}% 0 0)`;
  placeholder.style.opacity=String(clamp(1-smooth(.02,.08,p)+smooth(.13,.2,p)));
  send.style.opacity=String(.35+smooth(.07,.13,p)*.65);
  const sendPulse=Math.exp(-Math.pow((p-.145)/.024,2));
  send.style.transform=`translateY(-50%) scale(${.82+.18*smooth(.08,.14,p)+.1*sendPulse}) translateY(${Math.sin(p*35)*.04}cqw)`;
  setOpacity(userBubble,sent*(1-smooth(.4,.52,p)));
  userBubble.style.transform=`translateY(${(1-sent)*.45}cqw) scale(${.97+.03*sent})`;
  setOpacity(thinking,thinkingIn);
  document.querySelectorAll('.scene-hook .chat-thinking i').forEach((dot,i)=>{dot.style.opacity=String(.3+.7*((Math.sin(p*52-i*1.7)+1)/2));dot.style.transform=`translateY(${Math.sin(p*48-i*1.9)*.09}cqw)`;});
  setOpacity(answer,answerIn);
  answer.style.transform=`translateY(${(1-answerIn)*.45}cqw)`;

  setOpacity(mapCard,mapIn);
  mapCard.style.transform=`translate(${(1-mapIn)*.7}cqw,${(1-mapIn)*.45}cqw) scale(${.94+.06*mapIn})`;
  const routeLength=mapRoute.getTotalLength?.()??520;
  const routeProgress=smooth(.30,.335,p)*(1-smooth(.51,.58,p));
  mapRoute.style.strokeDasharray=String(routeLength);
  mapRoute.style.strokeDashoffset=String(routeLength*(1-routeProgress));
  const routePoint=mapRoute.getPointAtLength(routeLength*(routeProgress>.02?phase(sec,.48):0));
  mapDot.setAttribute('cx',String(routePoint.x));mapDot.setAttribute('cy',String(routePoint.y));
  mapDot.style.opacity=String(mapIn*(routeProgress>.02?1:0));

  setOpacity(sentence,sentenceIn*(1-smooth(.84,.94,p)*.3));
  const focusScale=1+smooth(.49,.63,p)*.14+concept*.3;
  const sentenceBox=sentence.getBoundingClientRect(),itBox=itWord.getBoundingClientRect();
  sentence.style.transformOrigin=`${clamp(((itBox.left+itBox.width/2-sentenceBox.left)/Math.max(1,sentenceBox.width))*100,0,100)}% 50%`;
  sentence.style.transform=`translateY(${(1-sentenceIn)*.9-smooth(.74,.86,p)*.35}cqw) scale(${focusScale})`;
  sentence.querySelectorAll('[data-word]').forEach((word,i)=>{
    const isTrail=i===1, isIt=i===6;
    word.classList.toggle('word-focus',isIt&&ambiguity>.25||isTrail&&resolve>.35);
    word.style.opacity=String(isIt||isTrail?1:.58+.42*(1-smooth(.77,.87,p)));
    if(isIt&&ambiguity>.1)word.style.color=`rgb(${Math.round(210+resolve*20)},${Math.round(224+resolve*25)},${Math.round(236+resolve*10)})`;
    else if(isIt)word.style.color='';
  });

  setOpacity(candidates,ambiguity);
  candidates.style.transform=`translateY(${(1-ambiguity)*.55-smooth(.66,.8,p)*.15}cqw)`;
  const placeAlpha=.42*(1-resolve)+.16;
  const trailAlpha=.82+resolve*.18;
  placeCard.style.opacity=String(ambiguity*placeAlpha);
  trailCard.style.opacity=String(ambiguity*trailAlpha);
  trailCard.style.transform=`scale(${.96+resolve*.04})`;
  placeCard.style.transform=`scale(${1-resolve*.035})`;
  setOpacity(cues,smooth(.62,.7,p)*(1-smooth(.83,.9,p)));
  document.getElementById('hook-cue-shaded').style.opacity=String(.65+.35*smooth(.64,.74,p));
  document.getElementById('hook-cue-short').style.opacity=String(smooth(.65,.74,p));
  setOpacity(prompt,smooth(.51,.58,p)*(1-smooth(.79,.87,p)));
  prompt.style.transform=`translateY(${(1-smooth(.53,.63,p))*.3}cqw)`;

  // Draw current candidate links from the actual word/card positions, so resizing and seeking stay deterministic.
  const filmRect=film.getBoundingClientRect();
  const toView=(el,anchor='center')=>{const r=el.getBoundingClientRect();return {x:(r.left+r.width/2-filmRect.left)*1200/filmRect.width,y:((anchor==='top'?r.top:r.top+r.height/2)-filmRect.top)*675/filmRect.height};};
  const start=toView(itWord),place=toView(placeCard,'top'),trail=toView(trailCard,'top');
  const makeCurve=(end,drop)=>`M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${(start.x-18).toFixed(1)} ${(start.y+drop).toFixed(1)}, ${(end.x+22).toFixed(1)} ${(end.y-drop*.28).toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  const placePath=document.getElementById('hook-path-place'),trailPath=document.getElementById('hook-path-trail');
  placePath.setAttribute('d',makeCurve(place,48));trailPath.setAttribute('d',makeCurve(trail,34));
  const pathAlpha=ambiguity;
  placePath.style.opacity=String(ambiguity*.22*(1-resolve));
  trailPath.style.opacity=String(ambiguity*(.48+.52*resolve));
  const placeLen=placePath.getTotalLength?.()??1,trailLen=trailPath.getTotalLength?.()??1;
  const draw=smooth(.50,.535,p);
  placePath.style.strokeDasharray='none';placePath.style.strokeDashoffset='0';
  trailPath.style.strokeDasharray='none';trailPath.style.strokeDashoffset='0';
  const placeParticle=document.getElementById('hook-particle-place'),trailParticle=document.getElementById('hook-particle-trail');
  const placePoint=placePath.getPointAtLength(placeLen*phase(sec,.46)),trailPoint=trailPath.getPointAtLength(trailLen*phase(sec,.52,.17));
  placeParticle.setAttribute('cx',String(placePoint.x));placeParticle.setAttribute('cy',String(placePoint.y));
  trailParticle.setAttribute('cx',String(trailPoint.x));trailParticle.setAttribute('cy',String(trailPoint.y));
  placeParticle.setAttribute('r',String(4+Math.sin(p*42)*.8));trailParticle.setAttribute('r',String(5+Math.sin(p*48+1)*1.1));
  placeParticle.style.opacity=String(pathAlpha*.18*(1-resolve)*(draw>.1?1:0));
  trailParticle.style.opacity=String(ambiguity*(.45+.55*resolve)*(draw>.1?1:0));

  setOpacity(motionNote,concept*(1-smooth(.95,.99,p)));
  setOpacity(tag,concept);
  tag.style.transform=`translateY(${(1-concept)*-.35}cqw) scale(${.96+.04*concept})`;
  const attentionSignal=tag.querySelector('.attention-signal');
  const signalPulse=.5+.5*Math.sin(p*38);
  attentionSignal.style.transform=`scale(${.78+.22*signalPulse})`;
  attentionSignal.style.opacity=String(.62+.38*signalPulse);
  // The ending reframes several moving candidate paths as contextual computation, never a single fixed arrow.
  const quiet=1-smooth(.81,.9,p);
  [placePath,trailPath].forEach(path=>{path.style.opacity=String(Number(path.style.opacity)*quiet);});
  [placeParticle,trailParticle].forEach(dot=>{dot.style.opacity=String(Number(dot.style.opacity)*quiet);});
}
function renderVectors(p){
  const sec=sceneSeconds(1,p);
  const heading=document.querySelector('.vector-heading'),headingLabel=heading.querySelector('.micro-label'),phrase=heading.querySelector('.token-phrase');
  const phraseTokens=[...phrase.children],ids=[...idCells.children],embs=[...embeddingCells.children];
  const tokenize=smooth(.02,.27,p);
  heading.style.top=`${40-25*tokenize}%`;headingLabel.style.opacity=String(tokenize);
  phrase.style.fontSize=`${2.55-1.1*tokenize}cqw`;phrase.style.gap=`${.48+.17*tokenize}cqw`;phrase.style.marginTop=`${1.1+.9*tokenize}cqw`;
  phraseTokens.forEach((e,i)=>{const tile=smooth(.05+i*.01,.13+i*.01,p);e.style.padding=`${.12+.53*tile}cqw ${.16+.74*tile}cqw`;e.style.borderColor=`rgba(71,107,131,${.05+.72*tile})`;e.style.backgroundColor=`rgba(16,26,40,${.12+.82*tile})`;e.style.boxShadow=`0 .6cqw 1.5cqw rgba(0,0,0,${tile*.25})`;e.style.transform=`translateY(${(1-tile)*.34}cqw) scale(${.94+.06*tile})`;});
  const flow=document.querySelector('.vector-flow'),flowIn=smooth(.12,.24,p);setOpacity(flow,flowIn);flow.style.transform=`translateY(${(1-flowIn)*.65}cqw)`;
  const arrow=document.querySelector('.vector-flow .flow-arrow');arrow.style.transform=`scale(${.9+.1*flowIn+.12*flowIn*(.5+.5*Math.sin(p*42))})`;
  ids.forEach((e,i)=>{const reveal=smooth(.08+i*.01,.17+i*.01,p);setOpacity(e,.22+reveal*.7);e.style.transform=`translateY(${(1-reveal)*.28+Math.sin(p*28+i)*.09}cqw) scale(${.92+.08*reveal+.025*Math.sin(p*34+i)})`;});
  embs.forEach((e,i)=>{const reveal=smooth(.21+i*.01,.30+i*.01,p);setOpacity(e,reveal);e.style.transform=`translateY(${(1-reveal)*.35}cqw) scale(${.82+.18*reveal})`;[...e.children].forEach(line=>{const width=Number(line.dataset.width)||.6;line.style.width=`${width*(.24+.76*reveal)}cqw`;line.style.opacity=String(.3+.7*reveal);});});
  const filmRect=film.getBoundingClientRect(),point=(el,edge)=>{const r=el.getBoundingClientRect();return {x:((r.left+r.width/2-filmRect.left)/filmRect.width)*1200,y:(((edge==='bottom'?r.bottom:edge==='top'?r.top:r.top+r.height/2)-filmRect.top)/filmRect.height)*675};};
  phraseTokens.forEach((token,i)=>{const path=vectorTokenPaths[i],dot=vectorTokenParticles[i],from=point(token,'bottom'),to=point(ids[i],'top'),reveal=smooth(.18+i*.006,.205+i*.006,p),bend=30+Math.abs(to.x-from.x)*.06;path.setAttribute('d',`M ${from.x.toFixed(1)} ${from.y.toFixed(1)} C ${from.x.toFixed(1)} ${(from.y+bend).toFixed(1)}, ${to.x.toFixed(1)} ${(to.y-bend).toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`);const length=path.getTotalLength?.()??1;path.style.strokeDasharray='none';path.style.strokeDashoffset='0';path.style.opacity=String(reveal*.34*(1-smooth(.94,.99,p)));const q=path.getPointAtLength(length*phase(sec,.48,i*.11));dot.setAttribute('cx',String(q.x));dot.setAttribute('cy',String(q.y));dot.style.opacity=String(reveal*.82*(1-smooth(.94,.99,p)));dot.setAttribute('r',String(4+1.1*Math.sin(p*42+i)));});
  const positionLab=document.querySelector('.position-lab'),posIn=smooth(.42,.51,p);setOpacity(positionLab,posIn);positionLab.style.transform=`translateY(${(1-posIn)*.65}cqw)`;
  const baseRow=document.querySelector('.position-lab .order-row:not(.swapped)'),swapped=document.querySelector('.position-lab .order-row.swapped'),baseWords=[...baseRow.children],swappedWords=[...swapped.children],reorder=smooth(.52,.62,p);setOpacity(swapped,.2+.8*smooth(.47,.62,p));
  const orderLanes=[-.82,.68,-.5,.92,-.78];
  swappedWords.forEach((e,i)=>{const source=baseWords.find(word=>word.textContent.trim().toLowerCase()===e.textContent.trim().toLowerCase());const a=source.getBoundingClientRect(),b=e.getBoundingClientRect(),delta=(a.left+a.width/2)-(b.left+b.width/2),lift=Math.sin(reorder*Math.PI)*orderLanes[i];e.style.transform=`translate(${delta*(1-reorder)}px,${lift}cqw)`;e.style.opacity=String(.45+.55*smooth(.55,.7,p));});
  const ribbon=smooth(.48,.56,p)*(1-smooth(.92,1,p));positionRibbon.style.opacity=String(ribbon);positionRibbon.style.transform=`scaleX(${.18+.82*smooth(.52,.74,p)})`;
  setOpacity(document.querySelector('.vector-note'),smooth(.28,.43,p)*(1-smooth(.96,1,p)));
}
function renderAttention(p){
  const sec=sceneSeconds(2,p);
  const focusIndex=p<.56?6:1; const label=focusIndex===6?'CURRENT POSITION · “IT”':'ANOTHER POSITION · “TRAIL”';
  document.getElementById('focus-label').textContent=label;
  attentionTokens.forEach((el,i)=>{el.classList.toggle('focus',i===focusIndex);el.style.opacity=String(i===focusIndex?1:.45+((i*13)%5)*.07);el.style.transform=`translateY(${i===focusIndex?-.42*Math.sin(p*30):.07*Math.sin(p*22+i)}cqw) scale(${i===focusIndex?1.04+.025*Math.sin(p*28):1})`;});
  const filmRect=film.getBoundingClientRect(),point=el=>{const r=el.getBoundingClientRect();return {x:((r.left+r.width/2-filmRect.left)/filmRect.width)*1200,y:((r.top+r.height/2-filmRect.top)/filmRect.height)*675};},focus=point(attentionTokens[focusIndex]);
  attentionPaths.forEach((path,i)=>{const t=Number(path.dataset.target),target=point(attentionTokens[t]),chosen=focusIndex===6?[1,3,5,8].includes(t):[6,0].includes(t),active=t!==focusIndex,reveal=smooth(.09+i*.006,.13+i*.006,p),strength=focusIndex===6?(t===1?1:t===3?.75:t===5?.62:t===8?.52:.08):(t===6?.92:.65);const bend=78+(i%3)*18;path.setAttribute('d',`M ${target.x.toFixed(1)} ${target.y.toFixed(1)} C ${target.x.toFixed(1)} ${(target.y+bend).toFixed(1)}, ${focus.x.toFixed(1)} ${(focus.y+bend).toFixed(1)}, ${focus.x.toFixed(1)} ${focus.y.toFixed(1)}`);path.style.stroke=chosen?(focusIndex===6&&t===1?'#91f2d2':focusIndex===6&&t===3?'#72c8ff':focusIndex===6?'#ba9aff':'#91f2d2'):'#456274';path.style.strokeWidth=String(chosen?(t===1?3.2:2.5):1.25);path.style.opacity=String(active?reveal*(chosen?strength:.045):0);const length=path.getTotalLength?.()??1;path.style.strokeDasharray='none';path.style.strokeDashoffset='0';const dot=attentionParticles[i],u=phase(sec,.52,i*.13),q=path.getPointAtLength(length*u);dot.setAttribute('cx',String(q.x));dot.setAttribute('cy',String(q.y));dot.style.opacity=String(active?reveal*(chosen?.92:.025):0);dot.setAttribute('r',String(4.5+1.5*Math.sin(p*44+i)));});
  setOpacity(document.querySelector('.attention-focus-label'),smooth(.08,.2,p));
  const result=document.querySelector('.context-result'),mix=smooth(.28,.38,p);setOpacity(result,mix);result.style.transform=`translateX(-50%) scale(${.9+.1*mix})`;
  const orb=document.querySelector('.context-orb');orb.style.transform=`scale(${.9+.14*Math.sin(p*28)})`;document.querySelectorAll('.context-orb i').forEach((e,i)=>{e.style.opacity=String(.3+.65*((Math.sin(p*36+i*1.5)+1)/2));e.style.transform=`translateY(${Math.sin(p*32+i)*.14}cqw) scale(${.85+.2*((Math.sin(p*34+i)+1)/2)})`;});
  setOpacity(document.querySelector('.schematic-stamp'),smooth(.48,.62,p));
}
function renderQKV(p){
  const sec=sceneSeconds(3,p);
  qkvTimeline.seek(sec);

  const projection=smooth(2.3,3.25,sec);
  const compare=smooth(33.6,34.2,sec)*(1-smooth(40.86,42.0,sec));
  const scoreReveal=smooth(39.32,39.72,sec);
  const normalize=smooth(43.54,45.9,sec);
  const weightsReveal=smooth(46.64,47.36,sec);
  const mix=smooth(50.5,52.12,sec);
  const mixPathReveal=smooth(50.5,51.05,sec);
  const trailMix=smooth(55.9,57.12,sec);
  const newVector=smooth(58.16,59.2,sec);
  const formula=smooth(64.38,64.9,sec);
  const weights=attentionWeights;
  const rawScores=[2.079,.693,.405,0];
  const rawWidths=[100,33,19,0];
  const vectorFlow=smooth(2.3,3.25,sec)*(1-smooth(32.45,33.15,sec));

  qkvOriginTokens.forEach((token,i)=>{
    const focus=i===6;
    const reveal=smooth(.4,.95,sec);
    token.classList.toggle('focus',focus&&sec>=2.3);
    token.style.opacity=String(reveal*(focus?1:.62+.38*projection));
    token.style.transform=`translateY(${(1-reveal)*.22}cqw) scale(${focus?1+.018*Math.sin(sec*5.8):1})`;
  });

  const roleCue=[smooth(11.4,11.72,sec)*(1-smooth(14.5,14.82,sec)),smooth(14.74,15.05,sec)*(1-smooth(17.9,18.2,sec)),smooth(18.06,18.38,sec)*(1-smooth(20.35,20.66,sec))];
  const projColors=['#72c8ff','#ba9aff','#ffc776'];
  const projCards=[...document.querySelectorAll('.q-col,.k-col,.v-col')];
  const projTitles=projCards.map(card=>card.querySelector('.projection-title'));
  const titleTimes=[6.7,7.68,8.64];
  projCards.forEach((card,i)=>{
    const signal=.5+.5*Math.sin(sec*5.2-i*1.35);
    const titleReveal=smooth(titleTimes[i],titleTimes[i]+.24,sec);
    projTitles[i].style.opacity=String(titleReveal);
    card.style.filter=`brightness(${.92+roleCue[i]*.26+vectorFlow*signal*.09})`;
    card.style.boxShadow=`0 0 ${(roleCue[i]*.75+vectorFlow*.18)}cqw ${projColors[i]}44,0 .9cqw 2.3cqw #0007`;
  });
  qRows.forEach(row=>{row.querySelector('em').style.opacity=String(smooth(6.7,6.95,sec));});
  keyRows.forEach((row,i)=>{
    const symbolic=sec>=22.22&&sec<32.92;
    row.querySelector('em').textContent=symbolic?`k${['₁','₂','₃','₄'][i]}`:`k${['₁','₂','₃','₄'][i]} · ${['trail','near','shaded','Maokong'][i]}`;
    row.querySelector('em').style.opacity=String(smooth(14.74,15.0,sec));
  });
  valueRows.forEach((row,i)=>{
    const symbolic=sec>=22.22&&sec<57.12;
    row.querySelector('em').textContent=symbolic?`v${['₁','₂','₃','₄'][i]}`:`v${['₁','₂','₃','₄'][i]} · ${['trail','near','shaded','Maokong'][i]}`;
    row.querySelector('em').style.opacity=String(smooth(18.06,18.32,sec));
  });

  qRows.forEach((row,i)=>{
    const bar=row.querySelector('i'),base=Number(bar.dataset.baseWidth),wave=Math.sin(sec*4.6+i*1.2);
    bar.style.width=`${Math.max(12,Math.min(96,base+vectorFlow*4.5*wave))}%`;
    bar.style.filter=`brightness(${.85+projection*.2+vectorFlow*.12*(.5+.5*wave)})`;
    bar.style.boxShadow=`0 0 ${(.12+projection*.42+vectorFlow*.24)}cqw #72c8ff88`;
  });
  keyRows.forEach((row,i)=>{
  const scan=phase(sec-34.92,1/3.2),offset=(scan-i*.25+1)%1;
    const sweep=smooth(0,.045,offset)*(1-smooth(.18,.32,offset))*compare;
    const bar=row.querySelector('i'),base=Number(bar.dataset.baseWidth),wave=Math.sin(sec*4.3+i*1.1);
    row.style.opacity=String(.4+.6*Math.max(projection,compare));
    row.style.filter=`brightness(${.82+sweep*.9+vectorFlow*.08})`;
    row.style.transform=`translateX(${sweep*.42}cqw) scale(${1+sweep*.026})`;
    bar.style.width=`${Math.max(12,Math.min(96,base+vectorFlow*3.5*wave))}%`;
    bar.style.background=`linear-gradient(90deg,${valueColors[i]}55,${valueColors[i]})`;
  });

  scoreRows.forEach((row,i)=>{
    const value=weights[i],step=Math.exp(-Math.pow((sec-(41.32+i*.32))/.24,2));
    const raw=rawWidths[i]*(1-normalize),normalized=value*100*normalize;
    const width=Math.max(0,raw+normalized);
    const fill=row.querySelector('.score-fill');
    fill.style.width=`${width*scoreReveal}%`;
    fill.style.opacity=String(scoreReveal);
    fill.style.background=`linear-gradient(90deg,${valueColors[i]}88,${valueColors[i]})`;
    fill.style.boxShadow=`0 0 ${(.18+step*.72+normalize*.35)}cqw ${valueColors[i]}88`;
    row.querySelector('.score-value').textContent=sec<45.9?rawScores[i].toFixed(1):`${Math.round(value*100)}%`;
    row.style.opacity=String(scoreReveal);
    row.style.filter=`brightness(${.9+step*.42+normalize*.12})`;
    row.style.transform=`translateX(${(1-scoreReveal)*.45}cqw) scale(${1+step*.025})`;
  });

  weightSegments.forEach((segment,i)=>{
    segment.style.flexBasis=`${weights[i]*100*weightsReveal}%`;
    segment.style.opacity=String(weightsReveal);
    segment.style.boxShadow=`0 0 ${weightsReveal*.42}cqw ${valueColors[i]}99`;
  });
  const totalLabel=document.getElementById('weight-total-label');
  if(totalLabel)totalLabel.style.opacity=String(weightsReveal);
  const scoreMode=document.getElementById('score-mode');
  if(scoreMode)scoreMode.textContent=sec<43.54?'example match scores':sec<46.64?'softmax → example weights':'example weights';

  valueRows.forEach((row,i)=>{
    const value=weights[i],beat=.5+.5*Math.sin(sec*5.1-i*.9),bar=row.querySelector('i');
    const base=Number(bar.dataset.baseWidth),weightedWidth=20+value*76;
    const width=base*(1-mix)+weightedWidth*mix;
    row.style.opacity=String(.38+.62*Math.max(projection,trailMix*(.35+value)));
    row.style.filter=`brightness(${.8+trailMix*(.18+value*.48)+beat*mix*.12})`;
    bar.style.width=`${width}%`;
    bar.style.background=`linear-gradient(90deg,${valueColors[i]}66,${valueColors[i]})`;
    bar.style.boxShadow=`0 0 ${(.12+trailMix*value*.95+mix*beat*.18)}cqw ${valueColors[i]}99`;
  });
  document.querySelector('.sum-label').style.opacity=String(weightsReveal);
  mixedVectorBars.forEach((bar,i)=>{
    const pulseValue=.86+.14*Math.sin(sec*4.2+i*.85);
    bar.style.transform=`scaleY(${newVector*mixedVectorValues[i]*pulseValue})`;
    bar.style.opacity=String(newVector);
  });
  const output=document.querySelector('.mix-output');
  const signal=document.getElementById('mix-signal');
  signal.style.transform=`translateX(${trailMix*.72}cqw) scale(${.52+trailMix*.58})`;
  output.style.boxShadow=`0 0 ${(trailMix*1.0)}cqw #91f2d244,0 .8cqw 2cqw #0005`;
  const outputLabel=document.getElementById('mix-output-label');
  if(outputLabel)outputLabel.textContent=sec>=57.5?'new contextual vector':'combine information';
  const notes=document.querySelectorAll('.mix-note span');
  if(notes[0])notes[0].style.opacity=String(smooth(60.48,60.72,sec)*(1-smooth(61.65,61.85,sec)));
  if(notes[1])notes[1].style.opacity=String(smooth(62.06,62.35,sec));

  const formulaParts=document.querySelectorAll('#formula-panel [data-formula-part]');
  const formulaWindows={compare:[67.02,69.0],scale:[67.02,69.0],normalize:[69.14,71.55],mix:[71.88,73.22]};
  formulaParts.forEach(el=>{
    const [start,end]=formulaWindows[el.dataset.formulaPart]||[64.38,73.22];
    const active=sec>=start&&sec<=end;
    el.classList.toggle('is-active',active);
    el.style.opacity=String(formula*(el.dataset.formulaPart==='compare'||el.dataset.formulaPart==='scale'||el.dataset.formulaPart==='normalize'||el.dataset.formulaPart==='mix'?1:.6));
  });
  document.querySelectorAll('.mechanism-steps [data-step]').forEach((el,i)=>{
    const active=sec>=76.82?((i===0&&sec<77.74)||(i===1&&sec>=77.74&&sec<78.78)||(i===2&&sec>=78.78)):(i===0?sec>=32.92&&sec<40.86:i===1?sec>=40.86&&sec<49.96:i===2?sec>=49.96&&sec<63.68:false);
    el.classList.toggle('active',active);
  });

  // Signal paths are tied to the actual cards and candidate rows after each deterministic reflow.
  const svg=document.querySelector('.qkv-lines'),svgRect=svg.getBoundingClientRect(),paths=[...qkvPaths.querySelectorAll('path')];
  const anchor=(el,x=.5,y=.5)=>{const r=el.getBoundingClientRect();return{x:(r.left+r.width*x-svgRect.left)/svgRect.width*1200,y:(r.top+r.height*y-svgRect.top)/svgRect.height*675};};
  const curve=(path,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,bend=Math.max(18,Math.min(82,Math.abs(dx)*.15+Math.abs(dy)*.11));path.setAttribute('d',`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${(a.x+dx*.38).toFixed(1)} ${(a.y+Math.sign(dy||1)*bend).toFixed(1)}, ${(b.x-dx*.38).toFixed(1)} ${(b.y-Math.sign(dy||1)*bend).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);};
  const projectionTargets=[qRows[0],keyRows[0],valueRows[0]];
  const origin=anchor(qkvOriginTokens[6],.5,.92);
  const projectionStrength=projection*(1-smooth(32.45,33.2,sec));
  for(let i=0;i<3;i++){
    const path=paths[i],dot=qkvPulseDots[i];
    curve(path,origin,anchor(projectionTargets[i],.1,.5));
    path.style.stroke=projColors[i];path.style.opacity=String(projectionStrength*.46);path.style.strokeDasharray='none';
    const len=path.getTotalLength(),pt=path.getPointAtLength(len*phase(sec,.9,i*.23));
    dot.setAttribute('cx',String(pt.x));dot.setAttribute('cy',String(pt.y));
    dot.style.opacity=String(projectionStrength*(.08+.92*(.5+.5*Math.sin(sec*6.2+i))));
    dot.setAttribute('r',String(4.2+1.8*(.5+.5*Math.sin(sec*6+i))));
  }
  const queryAnchor=anchor(qRows[0].querySelector('i'),.98,.5);
  for(let i=0;i<4;i++){
    const index=i+3,path=paths[index],dot=qkvPulseDots[index],target=anchor(keyRows[i],.04,.5);
    curve(path,queryAnchor,target);path.style.stroke=valueColors[i];path.style.opacity=String(compare*(i===0?.58:.3));path.style.strokeDasharray='none';
    const len=path.getTotalLength(),pt=path.getPointAtLength(len*phase(sec,.72,i*.19));
    dot.setAttribute('cx',String(pt.x));dot.setAttribute('cy',String(pt.y));
    dot.style.opacity=String(compare*(i===0?.92:.58));dot.setAttribute('r',String(i===0?5.2:4.1));
  }
  const outputRect=output.getBoundingClientRect(),outputTarget={x:(outputRect.left+outputRect.width*.05-svgRect.left)/svgRect.width*1200,y:(outputRect.top+outputRect.height*.42-svgRect.top)/svgRect.height*675};
  for(let i=0;i<4;i++){
    const index=i+7,path=paths[index],dot=qkvPulseDots[index],source=anchor(valueRows[i].querySelector('i'),.98,.5);
    curve(path,source,outputTarget);path.style.stroke=valueColors[i];path.style.opacity=String(mixPathReveal*(.12+weights[i]*.9));path.style.strokeDasharray='none';
    const len=path.getTotalLength(),pt=path.getPointAtLength(len*phase(sec,.86,i*.17));
    dot.setAttribute('cx',String(pt.x));dot.setAttribute('cy',String(pt.y));
    dot.style.opacity=String(mixPathReveal*(.1+weights[i]*1.3));dot.setAttribute('r',String(3.6+weights[i]*4.2));
  }
}
function renderHeads(p){
  const sec=sceneSeconds(4,p);
  headLanes.forEach((lane,i)=>{const laneIn=smooth(.045+i*.025,.14+i*.025,p);lane.style.opacity=String(.15+.85*laneIn);lane.style.transform=`translateX(${(1-laneIn)*2.1+Math.sin(sec*2.2+i)*.16}cqw)`;lane.querySelectorAll('.head-node').forEach((node,j)=>{const active=node.classList.contains('active'),beat=pulse(sec,.58,j*.13+i*.11);node.style.transform=`scale(${active?1+.28*beat:1})`;node.style.boxShadow=active&&p>.2?`0 0 ${.35+beat*1.05}cqw currentColor`:'';});});
  const combine=document.getElementById('heads-combine'),merge=smooth(.14,.24,p);combine.style.transform=`rotate(${sec*115}deg) scale(${.78+.2*merge+.045*Math.sin(sec*3.2)})`;combine.style.opacity=String(merge);
  headMergePaths.forEach((e,i)=>{const lane=smooth(.12+i*.02,.20+i*.02,p);e.style.opacity=String(.08+.58*lane);e.style.strokeDashoffset=String(-sec*170+i*24);const len=e.getTotalLength(),dot=headMergeDots[i],q=phase(sec,.44,i*.19),pt=e.getPointAtLength(len*q);dot.setAttribute('cx',String(pt.x));dot.setAttribute('cy',String(pt.y));dot.style.opacity=String(.12+.88*lane);});
}
function renderBlock(p){
  const sec=sceneSeconds(5,p);
  const stack=document.getElementById('transformer-stack');stack.style.transform=`translateX(${(1-smooth(.04,.2,p))*3.5}cqw) translateY(${Math.sin(sec*2.2)*.22}cqw) rotateY(${(smooth(.38,.88,p)-.5)*8+Math.sin(sec*1.65)*3.2}deg) scale(${.93+.07*smooth(.28,.65,p)})`;
  stack.querySelectorAll('.transformer-block').forEach((el,i)=>{const beat=pulse(sec,.42,-i*.16);el.style.filter=`brightness(${.58+.42*smooth(.12+i*.06,.20+i*.06,p)+beat*.14})`;el.style.boxShadow=`0 0 ${.5+beat*.7}cqw #72c8ff${i===2?'44':'22'},0 1.1cqw 2.5cqw #0006`;});
  document.querySelectorAll('.explain-item').forEach((e,i)=>{e.classList.toggle('active',p>.14+i*.23&&p<.55+i*.22);});
  [...blockTokenStream.children].forEach((e,i)=>{const q=smooth(.06+i*.035,.15+i*.035,p);e.style.opacity=String(.35+.65*q);e.style.transform=`translateX(${q*(2.1+i*.35)}cqw) translateY(${Math.sin(sec*2+i)*.1}cqw)`;});
  document.querySelectorAll('.residual-loop').forEach((e,i)=>{const beat=pulse(sec,.52,i*.17);e.style.transform=`rotate(${sec*132}deg) scale(${.84+.3*beat})`;e.style.boxShadow=`0 0 ${beat*.55}cqw #b7e1af88`;});
}
function renderMask(p){
  const sec=sceneSeconds(6,p),span=sceneSpan(6);
  const training=p<.45;document.querySelectorAll('.mask-mode').forEach(e=>e.classList.toggle('active',e.dataset.mode===(training?'training':'generation')));
  const rowIndex=training?Math.floor((sec*1.8)%6):Math.floor(((sec-span*.45)*1.8)%6);
  document.querySelectorAll('.mask-cell').forEach(e=>{const r=Number(e.dataset.r),c=Number(e.dataset.c),beat=pulse(sec,.56,r*.21+c*.12);e.classList.toggle('current',r===rowIndex);e.style.opacity=c<=r?String(.24+.72*(training?(.25+.75*beat):r===rowIndex?1:.4+.3*beat)):'0.48';e.style.transform=c<=r?`scale(${r===rowIndex?1+.08*beat:1})`:'';});
  const caption=document.getElementById('mask-caption');caption.textContent=training?'Training: many positions compute in parallel; each row still masks its future.':'Generation: choose one token, append it, then predict from the longer context.';
  setOpacity(document.querySelector('.kv-cache'),smooth(.79,.9,p));
  const appendedCount=(p>.79?2:p>.63?1:0);
  [...generationTokens.children].forEach((e,i)=>{const generated=i>=genWords.length;const gi=generated?Number(e.dataset.generated):-1;const shown=generated&&gi<appendedCount;e.classList.toggle('new',shown);e.style.opacity=generated?String(shown?smooth(gi===0?.63:.79,gi===0?.68:.84,p):0):'1';e.style.transform=`translateY(${shown?-Math.sin(p*12+i)*.12:0}cqw)`;});
  const candidates=document.getElementById('next-candidates'),candidateIn=smooth(.44,.55,p)*(1-smooth(.92,.99,p));candidates.style.opacity=String(candidateIn);const candidateLabels=p<.72?['short','long','park']:['too.','today','.'],selected=Math.floor(sec*1.1)%3;candidates.querySelectorAll('b').forEach((e,i)=>{const chosen=i===selected;e.textContent=candidateLabels[i];e.classList.toggle('selected',chosen);e.style.transform=`translateY(${chosen?-.12*Math.sin(p*36+i):.06*Math.sin(p*24+i)}cqw) scale(${chosen?1.08:1})`;e.style.opacity=String(chosen?1:.58+.12*Math.sin(p*30+i));});
}
function renderRecap(p){
  const sec=sceneSeconds(7,p);
  document.querySelectorAll('#recap-route span').forEach((e,i)=>{const q=clamp((p-.08-i*.013)/.035);e.classList.toggle('active',q>.05);e.style.transform=`translateY(${(1-q)*.7+.08*Math.sin(sec*2.4+i)}cqw) scale(${.9+.1*q+.025*Math.sin(sec*2.8+i)})`;});
  const routeReveal=smooth(.04,.065,p);recapPath.style.opacity=String(routeReveal*.72);recapPath.style.strokeDasharray='18 22';recapPath.style.strokeDashoffset=String(-sec*210);
  recapDots.forEach((dot,i)=>{const u=phase(sec,.46,i*.19),point=recapPath.getPointAtLength(recapPathLength*u);dot.setAttribute('cx',String(point.x));dot.setAttribute('cy',String(point.y));dot.style.opacity=String(routeReveal*(.55+.4*pulse(sec,.46,i*.17)));dot.setAttribute('r',String(3.5+2.2*(pulse(sec,.42,i*.16))));});
  const copy=document.getElementById('recap-copy');setOpacity(copy,smooth(.45,.65,p));copy.style.transform=`translateY(${(1-smooth(.5,.78,p))*.6}cqw)`;
  setOpacity(document.getElementById('closing-line'),smooth(.78,.92,p));
}
function renderAt(seconds){
  restoreContinuityNodes();
  const t=clamp(seconds,0,duration);manualTime=t;
  const idx=activeSceneIndex(t),start=chapterStarts[idx],end=chapterEnds[idx],p=clamp((t-start)/Math.max(.001,end-start));
  scenes.forEach((scene,i)=>{const enter=i===idx?1:0;const exit=i===idx?1-smooth(.94,1,p):0;const opacity=enter;scene.classList.toggle('active',i===idx);scene.style.opacity=String(opacity);scene.style.transform='none';scene.setAttribute('aria-hidden',i===idx?'false':'true');});
  sceneRenderers[idx](p);
  renderContinuityHandoff(t,idx,p);
  particles.rotation.y=Math.sin(t*.56)*.12;particles.rotation.x=Math.sin(t*.72)*.075;lines.rotation.y=-Math.sin(t*.48)*.09;
  const pos=pointGeometry.attributes.position.array;
  const activeEnergy=.12+.045*Math.sin(t*.8);
  for(let i=0;i<count;i++){pos[i*3]=basePositions[i*3]+Math.sin(t*2.2+phases[i])*.22;pos[i*3+1]=basePositions[i*3+1]+Math.cos(t*1.8+phases[i]*1.7)*.18;pos[i*3+2]=basePositions[i*3+2]+Math.sin(t*1.35+phases[i])*.17;}
  pointGeometry.attributes.position.needsUpdate=true;pointMaterial.opacity=activeEnergy;
  renderer.render(threeScene,camera);
  const frame=Math.round(t*FPS);
  if(idx!==lastChapter){chapterButtons.forEach((b,i)=>b.classList.toggle('active',i===idx));reviewText.textContent=transcript[idx];lastChapter=idx;}
  currentTimeEl.textContent=fmt(t);if(!seekBar.matches(':active'))seekBar.value=String(duration?t/duration*100:0);
  return {time:t,frame,chapter:idx,progress:p};
}

function previewTick(now){
  if(!previewPlaying)return;
  if(lastTick)manualTime=Math.min(duration,manualTime+(now-lastTick)/1000*Number(playbackRate.value));
  const frame=Math.round(manualTime*FPS);
  if(frame!==lastPreviewFrame){renderAt(frame/FPS);lastPreviewFrame=frame;}
  lastTick=now;
  if(manualTime>=duration){previewPlaying=false;lastTick=0;playButton.textContent='▶';playButton.setAttribute('aria-label','Play');audioState.textContent='Visual preview complete · narration pending';return;}
  requestAnimationFrame(previewTick);
}

window.renderAt=renderAt;
window.renderFrame=(frame)=>renderAt(frame/FPS);
window.getChapterStarts=()=>[...chapterStarts];
let audioFrameRaf=0;
let lastAudioFrame=-1;
function audioFrameTick(){
  audioFrameRaf=0;
  if(audio.paused||previewOnly)return;
  const frame=Math.round(audio.currentTime*FPS);
  if(frame!==lastAudioFrame){renderAt(frame/FPS);lastAudioFrame=frame;}
  audioFrameRaf=requestAnimationFrame(audioFrameTick);
}
function startAudioFrameLoop(){
  if(audioFrameRaf)return;
  lastAudioFrame=-1;
  audioFrameRaf=requestAnimationFrame(audioFrameTick);
}
function stopAudioFrameLoop(){
  if(audioFrameRaf){cancelAnimationFrame(audioFrameRaf);audioFrameRaf=0;}
  lastAudioFrame=-1;
}

function showControls(){film.closest('.player-shell').classList.remove('controls-hidden');window.clearTimeout(controlsTimer);if(film.closest('.player-shell').classList.contains('fullscreen')&&!audio.paused){controlsTimer=window.setTimeout(()=>film.closest('.player-shell').classList.add('controls-hidden'),2800);}}
playButton.addEventListener('click',()=>{
  if(previewOnly){
    previewPlaying=!previewPlaying;
    if(previewPlaying){playButton.textContent='❚❚';playButton.setAttribute('aria-label','Pause');audioState.textContent='Visual preview playing · narration pending';lastTick=0;lastPreviewFrame=-1;requestAnimationFrame(previewTick);}
    else{playButton.textContent='▶';playButton.setAttribute('aria-label','Play');audioState.textContent='Visual preview paused · narration pending';lastTick=0;lastPreviewFrame=-1;}
    return;
  }
  if(audio.paused)audio.play().catch(()=>{});else audio.pause();
});
audio.addEventListener('play',()=>{playButton.textContent='❚❚';playButton.setAttribute('aria-label','Pause');audioState.textContent='Narration playing';startAudioFrameLoop();});
audio.addEventListener('pause',()=>{stopAudioFrameLoop();playButton.textContent='▶';playButton.setAttribute('aria-label','Play');audioState.textContent='Narration paused';renderAt(audio.currentTime);});
function applyAudioMetadata(){
  if(audio.readyState<1||!Number.isFinite(audio.duration)||audio.duration<=0)return false;
  previewOnly=false;duration=audio.duration;calculateChapters(duration);totalTimeEl.textContent=fmt(duration);
  audioState.textContent=`Narration ready · ${fmt(duration)}`;renderAt(audio.currentTime||0);return true;
}
audio.addEventListener('loadedmetadata',applyAudioMetadata);
audio.addEventListener('timeupdate',()=>{if(audio.paused)renderAt(Math.round(audio.currentTime*FPS)/FPS);});
audio.addEventListener('seeked',()=>{const frame=Math.round(audio.currentTime*FPS);renderAt(frame/FPS);lastAudioFrame=frame;});
audio.addEventListener('ended',()=>{stopAudioFrameLoop();renderAt(duration);audioState.textContent='Narration complete';});
audio.addEventListener('error',()=>{stopAudioFrameLoop();previewOnly=true;audioState.textContent='Visual preview · narration pending';totalTimeEl.textContent=fmt(duration);renderAt(manualTime);});
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
