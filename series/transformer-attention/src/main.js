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
const hookContextVector=document.getElementById('hook-context-vector');
const hookContextBars=Array.from({length:8},(_,i)=>{const bar=document.createElement('i');bar.dataset.value=String([.42,.78,.5,.88,.3,.66,.38,.82][i]);hookContextVector.querySelector('span').append(bar);return bar;});

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
const headPatterns = [
  {role:'REFERENCE',items:['It','the trail'],join:'→'},
  {role:'PREFERENCE + LIMIT',items:['nature-first','$8,000'],join:'→',result:'fits the budget'},
  {role:'PLACE CONTEXT',items:['Taipei','Maokong'],join:'↔'},
  {role:'DESCRIPTION',items:['shaded','short'],join:'↔'}
];
const headPalette=['#72c8ff','#ba9aff','#91f2d2','#ffc776'];
headPatterns.forEach((pattern, i) => {
  const row = document.createElement('div'); row.className = 'head-lane';
  row.dataset.view=String(i);
  const token=(text)=>`<span class="head-pattern-token" data-token="${text.toLowerCase().replace(/[^a-z0-9]+/g,'-')}">${text}</span>`;
  const example=pattern.result?`${token(pattern.items[0])}<b class="head-pair-plus">+</b>${token(pattern.items[1])}<span class="head-pair-link">→</span><span class="head-pattern-result">${pattern.result}</span>`:`${token(pattern.items[0])}<span class="head-pair-link">${pattern.join}</span>${token(pattern.items[1])}`;
  row.innerHTML=`<div class="head-id">VIEW 0${i+1}</div><div class="head-track"><span class="head-role">${pattern.role}</span><div class="head-pattern-example"><div class="head-example-items">${example}</div></div><div class="head-projection-bars" aria-hidden="true">${Array.from({length:6},(_,j)=>`<i data-bar="${j}"></i>`).join('')}</div></div><div class="head-lane-output" aria-hidden="true">${Array.from({length:5},(_,j)=>`<i data-bar="${j}"></i>`).join('')}</div>`;
  row.style.setProperty('--head-color',headPalette[i]);
  headLanesRoot.append(row); headLanes.push(row);
});
const headMergePaths=[...document.querySelectorAll('.head-merge path')];
const headMergeDots=headMergePaths.map((path,i)=>{const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r','5.5');dot.setAttribute('class','head-merge-pulse');path.parentElement.append(dot);return dot;});
const headSingleView=document.getElementById('head-single-view');
const headOutput=document.getElementById('heads-output');
const blockTokenStream = document.getElementById('block-token-stream');
const blockTokens=[];
['The','trail','near','Maokong','is','shaded.','It','is','short,','too.'].forEach((t,i)=>{const e=document.createElement('span');e.dataset.token=t.toLowerCase();e.style.transform=`translateX(${i%2?'.18':'0'}cqw)`;const label=document.createElement('b');label.className='block-token-label';label.textContent=t;e.append(label);if(t==='It'){const vector=document.createElement('i');vector.className='block-token-vector';[.34,.72,.48,.9,.26,.62,.42,.82].forEach((h,j)=>{const bar=document.createElement('i');bar.style.setProperty('--h',`${20+h*72}%`);bar.dataset.bar=String(j);vector.append(bar)});e.append(vector)}blockTokenStream.append(e);blockTokens.push(e)});
const blockItToken=blockTokens.find(e=>e.dataset.token==='it');
const blockFlowWeb=document.getElementById('block-flow-web');
const blockFlowPaths=[...blockFlowWeb.querySelectorAll('path')];
const blockFlowDots=[...blockFlowWeb.querySelectorAll('circle')];
const maskGrid = document.getElementById('mask-grid');
const N = 6;
const maskTokens=['The','trail','near','Maokong','is','shaded'];
for(let r=0;r<N;r++) for(let c=0;c<N;c++) {
  const e=document.createElement('div');
  e.className=`mask-cell ${c<=r?'allowed':'blocked'}`;
  e.dataset.r=String(r);e.dataset.c=String(c);
  e.textContent=c<=r?maskTokens[c]:'×';
  if(c===r)e.classList.add('diagonal');
  maskGrid.append(e);
}
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
 {from:3,to:4,type:'tokens+signal',tokenSource:()=>qkvOriginTokens,tokenTarget:()=>[...document.querySelectorAll('.scene-heads .head-source-sentence>span')],signalSource:()=>[document.querySelector('.scene-qkv .mechanism-mix-result')],signalTarget:()=>[document.getElementById('heads-combine')]},
 {from:4,to:5,type:'tokens+signal',tokenSource:()=>[...document.querySelectorAll('.scene-heads .head-source-sentence>span')],tokenTarget:()=>blockTokens,signalSource:()=>[document.getElementById('heads-combine')],signalTarget:()=>[document.getElementById('transformer-stack')]},
 {from:5,to:6,type:'tokens+signal',tokenSource:()=>blockTokens.slice(0,8),tokenTarget:()=>[...generationTokens.children].slice(0,8),signalSource:()=>[blockItToken],signalTarget:()=>[document.getElementById('mask-grid')]},
 {from:6,to:7,type:'signal',source:()=>[document.querySelector('#generation-tokens .gen-token[data-generated="1"]')],target:()=>[document.querySelector('#recap-route span')]}
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
    const windowStart=pair.from===3?(chapterEnds[pair.from]??0)+.04:(chapterEnds[pair.from]??0)-.72,windowEnd=(chapterStarts[pair.to]??0)+.72;
    if(t<windowStart||t>windowEnd)continue;
    const q=clamp((t-windowStart)/Math.max(.001,windowEnd-windowStart)),e=smooth(0,1,q);
    // Sample both chapter endpoints at fixed progress, then restore the current audio-time scene.
    sceneRenderers[pair.from](1);
    const hasTokens=pair.type==='tokens'||pair.type==='tokens+signal',hasSignal=pair.type==='signal'||pair.type==='tokens+signal';
    const sourceNodes=hasTokens?(pair.tokenSource?pair.tokenSource():pair.source()||[]):[],sourceShots=snapshotHandoffNodes(sourceNodes,filmRect);
    const signalSourceNodes=hasSignal?(pair.signalSource?pair.signalSource():pair.source()||[]):[],signalSourceShots=snapshotHandoffNodes(signalSourceNodes,filmRect);
    sceneRenderers[pair.to](0);
    const targetNodes=hasTokens?(pair.tokenTarget?pair.tokenTarget():pair.target()||[]):[],targetShots=snapshotHandoffNodes(targetNodes,filmRect);
    const signalTargetNodes=hasSignal?(pair.signalTarget?pair.signalTarget():pair.target()||[]):[],signalTargetShots=snapshotHandoffNodes(signalTargetNodes,filmRect);
    sceneRenderers[activeIndex](activeProgress);
    if((hasTokens&&(!sourceShots.length||!targetShots.length))||(hasSignal&&(!signalSourceShots.length||!signalTargetShots.length)))continue;
    continuityLayer.style.visibility='visible';
    if(hasTokens){
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
    }
    if(hasSignal){
      const a=signalSourceShots[0].rect,b=signalTargetShots[0].rect;
      continuitySignal.style.left=`${a.x+(b.x-a.x)*e}%`;continuitySignal.style.top=`${a.y+(b.y-a.y)*e-Math.sin(e*Math.PI)*4}%`;
      continuitySignal.style.transform=`translate(-50%,-50%) perspective(700px) rotateX(${Math.sin(e*Math.PI)*22}deg) scale(${.65+.6*Math.sin(e*Math.PI)})`;
      continuitySignal.style.opacity=String(.75+.25*Math.sin(e*Math.PI));
      for(const node of [...signalSourceNodes,...signalTargetNodes])if(node&&!continuityHidden.has(node)){continuityHidden.set(node,node.style.opacity);node.style.opacity='0';}
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
const attentionOutputPath=document.createElementNS('http://www.w3.org/2000/svg','path');attentionOutputPath.setAttribute('d','M 0 0 L 0 0');attentionOutputPath.classList.add('attention-output-path');attentionSvg.append(attentionOutputPath);
const attentionOutputParticle=document.createElementNS('http://www.w3.org/2000/svg','circle');attentionOutputParticle.setAttribute('r','5.5');attentionOutputParticle.classList.add('attention-output-particle');attentionParticleRoot.append(attentionOutputParticle);

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

  const typing=smooth(.015,.105,p),sent=smooth(.145,.2,p),thinkingIn=smooth(5.9,6.15,sec)*(1-smooth(6.6,6.8,sec));
  const answerIn=smooth(6.65,7.15,sec)*(1-smooth(10.65,11.2,sec));
  const mapIn=smooth(6.7,7.2,sec)*(1-smooth(10.65,11.2,sec));
  const sentenceIn=smooth(10.95,11.45,sec);
  const ambiguity=smooth(.48,.59,p)*(1-smooth(.76,.84,p));
  const resolve=smooth(.64,.78,p);
  const concept=smooth(.82,.94,p);

  const appBuild=smooth(0,.05,p),chatExit=smooth(10.7,11.2,sec);
  setOpacity(chat,appBuild*(1-chatExit));
  chat.style.clipPath=`inset(0 ${(1-appBuild)*100}% 0 0 round .75cqw)`;
  chat.style.width=`${60-15*smooth(5.75,6.45,sec)}%`;
  chat.style.transform=`translate(${(-smooth(.18,.46,p)*3.8)}cqw,${(smooth(.4,.56,p)*-.35)}cqw) scale(${(.94+.06*appBuild)*(1-chatExit*.08)})`;
  const composerVisible=typing*(1-smooth(.15,.158,p));
  input.style.clipPath=`inset(0 ${(1-composerVisible)*100}% 0 0)`;
  input.style.opacity=String(1-smooth(.15,.16,p));
  placeholder.style.opacity=String(clamp(1-smooth(.02,.08,p)+smooth(.162,.178,p)));
  send.style.opacity=String(.35+smooth(.07,.13,p)*.65);
  const sendPulse=Math.exp(-Math.pow((p-.15)/.018,2));
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
  const routeProgress=smooth(6.25,7.05,sec)*(1-smooth(18.2,18.8,sec));
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
    const contextBuild=smooth(25.6,26.15,sec)*(1-smooth(31.9,32.3,sec));
    const sweep=clamp((sec-25.6)/6.7)*9,energy=Math.max(0,1-Math.abs(i-sweep)/1.35)*contextBuild;
    word.style.backgroundColor=energy>.04?`rgba(93,203,174,${(.08+.3*energy).toFixed(3)})`:'';
    word.style.boxShadow=energy>.04?`0 0 ${(.15+energy*.48).toFixed(2)}cqw rgba(110,245,205,${(.25+.55*energy).toFixed(2)})`:'';
    word.style.transform=`translateY(${-energy*.18}cqw)`;
  });

  const contextBuild=smooth(25.6,26.15,sec)*(1-smooth(31.9,32.3,sec));
  const stageRect=sentence.parentElement.getBoundingClientRect(),itRect=itWord.getBoundingClientRect();
  hookContextVector.style.left=`${((itRect.left+itRect.width/2-stageRect.left)/stageRect.width*100).toFixed(3)}%`;
  hookContextVector.style.top=`${((itRect.bottom-stageRect.top+8)/stageRect.height*100).toFixed(3)}%`;
  hookContextVector.style.opacity=String(contextBuild);
  hookContextVector.style.transform=`translateX(-50%) translateY(${(1-contextBuild)*.35}cqw) scale(${.82+.18*contextBuild})`;
  hookContextBars.forEach((bar,i)=>{const value=Number(bar.dataset.value),wave=.88+.12*Math.sin(sec*4.4+i*.62);bar.style.height=`${(18+value*76)*contextBuild*wave}%`;bar.style.opacity=String(contextBuild);});

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
  const modes=document.getElementById('position-modes'),modesIn=smooth(36.6,37.05,sec)*(1-smooth(39.55,40.0,sec)),relative=smooth(38.0,38.55,sec);
  modes.style.opacity=String(modesIn);modes.style.transform=`translateY(${(1-modesIn)*.4}cqw)`;
  modes.querySelector('.slot-mode').style.opacity=String(modesIn*(1-relative));modes.querySelector('.relative-mode').style.opacity=String(modesIn*relative);
  modes.querySelector('.relative-mode').style.transform=`translateX(${(1-relative)*.5}cqw) scale(${.97+.03*relative})`;
  const encodePulse=smooth(39.6,40.2,sec)*(1-smooth(48.0,48.55,sec));
  embs.forEach((e,i)=>[...e.children].forEach((line,j)=>{const width=Number(line.dataset.width)||.6,wave=.75+.25*Math.sin(sec*4.2-i*.62-j*.85);line.style.width=`${width*(.82+.18*encodePulse*wave)}cqw`;line.style.filter=`brightness(${1+encodePulse*.45*wave})`;e.style.boxShadow=`0 0 ${encodePulse*.36}cqw rgba(116,230,200,.5)`;}));
  setOpacity(document.querySelector('.vector-note'),smooth(.28,.43,p)*(1-smooth(.96,1,p)));
}
function renderAttention(p){
  const sec=sceneSeconds(2,p);
  const sampledPositions=[0,1,3,6,8],positionSweep=sec>=33.7&&sec<37.9,positionStep=Math.min(sampledPositions.length-1,Math.floor(Math.max(0,sec-33.7)/.78));
  const focusIndex=sec<26.4?6:sec<33.7?1:positionSweep?sampledPositions[positionStep]:6;
  const focusWord=attentionTokens[focusIndex]?.textContent?.replace(/[.,]/g,'').toUpperCase()||'IT';
  const label=`CURRENT POSITION · “${focusWord}”`;
  document.getElementById('focus-label').textContent=label;
  attentionTokens.forEach((el,i)=>{el.classList.toggle('focus',i===focusIndex);el.style.opacity=String(i===focusIndex?1:.45+((i*13)%5)*.07);el.style.transform=`translateY(${i===focusIndex?-.42*Math.sin(p*30):.07*Math.sin(p*22+i)}cqw) scale(${i===focusIndex?1.04+.025*Math.sin(p*28):1})`;});
  const filmRect=film.getBoundingClientRect(),point=el=>{const r=el.getBoundingClientRect();return {x:((r.left+r.width/2-filmRect.left)/filmRect.width)*1200,y:((r.top+r.height/2-filmRect.top)/filmRect.height)*675};},focus=point(attentionTokens[focusIndex]);
  const recalculated=focusIndex===6?smooth(17.5,21.8,sec)*(1-smooth(25.4,26.4,sec)):positionSweep?smooth(33.7,34.1,sec):0;
  attentionPaths.forEach((path,i)=>{const t=Number(path.dataset.target),target=point(attentionTokens[t]),chosen=positionSweep?Math.abs(t-focusIndex)<=2&&t!==focusIndex:focusIndex===6?[1,3,5,8].includes(t):[6,0].includes(t),active=t!==focusIndex,reveal=smooth(.09+i*.006,.13+i*.006,p),strength=positionSweep?(chosen?.72+.18*(1-Math.abs(t-focusIndex)/3):.035):focusIndex===6?(t===1?1-.72*recalculated:t===3?.75+.08*recalculated:t===5?.62+.22*recalculated:t===8?.52+.34*recalculated:.08):(t===6?.92:.65);const bend=78+(i%3)*18;path.setAttribute('d',`M ${target.x.toFixed(1)} ${target.y.toFixed(1)} C ${target.x.toFixed(1)} ${(target.y+bend).toFixed(1)}, ${focus.x.toFixed(1)} ${(focus.y+bend).toFixed(1)}, ${focus.x.toFixed(1)} ${focus.y.toFixed(1)}`);path.style.stroke=chosen?(t===1?'#91f2d2':t===3?'#72c8ff':t===5?'#ba9aff':'#ffc776'):'#456274';path.style.strokeWidth=String(chosen?(t===1?3.2:2.5):1.25);path.style.opacity=String(active?reveal*(chosen?strength:.045):0);const length=path.getTotalLength?.()??1;path.style.strokeDasharray='none';path.style.strokeDashoffset='0';const dot=attentionParticles[i],u=phase(sec,positionSweep?1.25:.52,i*.13),q=path.getPointAtLength(length*u);dot.setAttribute('cx',String(q.x));dot.setAttribute('cy',String(q.y));dot.style.opacity=String(active?reveal*(chosen?.92:.025):0);dot.setAttribute('r',String(4.5+1.5*Math.sin(sec*5+i)));});
  setOpacity(document.querySelector('.attention-focus-label'),smooth(.08,.2,p));
  const result=document.querySelector('.context-result'),resultIn=smooth(.28,.38,p)*(1-smooth(37.35,37.9,sec));setOpacity(result,resultIn);result.style.transform=`translateX(-50%) scale(${.9+.1*resultIn})`;
  const orb=document.querySelector('.context-orb');orb.style.transform=`scale(${.9+.14*Math.sin(sec*2.8)})`;document.querySelectorAll('.context-orb i').forEach((e,i)=>{e.style.opacity=String(.3+.65*((Math.sin(sec*5+i*1.5)+1)/2));e.style.transform=`translateY(${Math.sin(sec*4+i)*.14}cqw) scale(${.85+.2*((Math.sin(sec*4.25+i)+1)/2)})`;});
  const outputRect=result.getBoundingClientRect(),output={x:((outputRect.left+outputRect.width*.5-filmRect.left)/filmRect.width)*1200,y:((outputRect.top+outputRect.height*.28-filmRect.top)/filmRect.height)*675,};
  const dy=output.y-focus.y;attentionOutputPath.setAttribute('d',`M ${focus.x.toFixed(1)} ${focus.y.toFixed(1)} C ${(focus.x+35).toFixed(1)} ${(focus.y+dy*.32).toFixed(1)}, ${(output.x-35).toFixed(1)} ${(output.y-dy*.18).toFixed(1)}, ${output.x.toFixed(1)} ${output.y.toFixed(1)}`);
  const qkvPreviewIn=smooth(37.88,38.35,sec);attentionOutputPath.style.stroke='#91f2d2';attentionOutputPath.style.strokeWidth='3.2';attentionOutputPath.style.opacity=String(resultIn*.66*(1-qkvPreviewIn));
  const outLen=attentionOutputPath.getTotalLength?.()??1,outPoint=attentionOutputPath.getPointAtLength(outLen*phase(sec,1.05));attentionOutputParticle.setAttribute('cx',String(outPoint.x));attentionOutputParticle.setAttribute('cy',String(outPoint.y));attentionOutputParticle.style.fill='#c7ffed';attentionOutputParticle.style.opacity=String(resultIn*(1-qkvPreviewIn)*(.3+.7*pulse(sec,1.05)));
  document.querySelector('.context-result>b').textContent=positionSweep?'each position updates in context':'representation updated';
  const preview=document.getElementById('attention-qkv-preview');setOpacity(preview,qkvPreviewIn);preview.style.transform=`translateX(-50%) translateY(${(1-qkvPreviewIn)*.5}cqw) scale(${.94+.06*qkvPreviewIn})`;
  setOpacity(document.querySelector('.schematic-stamp'),smooth(.48,.62,p)*(1-qkvPreviewIn));
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
  document.querySelectorAll('.projection-title small:not(#score-mode)').forEach(note=>{note.style.opacity=String(1-smooth(20.64,21.0,sec));});
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
  const mixStepRows=document.querySelectorAll('.mechanism-mix-sources [data-candidate]');
  mixStepRows.forEach((row,i)=>{const bar=row.querySelector('i'),value=weights[i];bar.style.setProperty('--share',`${value*100}%`);bar.style.opacity=String(.45+.55*smooth(78.72,78.92,sec));bar.style.transform=`scaleX(${.9+.1*Math.sin(sec*5.2+i)})`;bar.style.transformOrigin='left center';row.querySelector('em').textContent=`${Math.round(value*100)}%`;});
  document.querySelectorAll('.mechanism-mix-result>i').forEach((bar,i)=>{bar.style.height=`${.65+mixedVectorValues[i%mixedVectorValues.length]*.85}cqw`;bar.style.opacity=String(smooth(78.72,78.92,sec));bar.style.transform=`scaleY(${.88+.12*Math.sin(sec*4+i*.7)})`;});

  const formulaParts=document.querySelectorAll('#formula-panel [data-formula-part]');
  const formulaWindows={compare:[67.02,69.0],scale:[67.02,69.0],normalize:[69.14,71.55],mix:[71.88,73.22]};
  formulaParts.forEach(el=>{
    const [start,end]=formulaWindows[el.dataset.formulaPart]||[64.38,73.22];
    const active=sec>=start&&sec<=end;
    el.classList.toggle('is-active',active);
    el.style.opacity=String(formula*(el.dataset.formulaPart==='compare'||el.dataset.formulaPart==='scale'||el.dataset.formulaPart==='normalize'||el.dataset.formulaPart==='mix'?1:.6));
  });
  const recapWindows=[[76.82,77.74],[77.74,78.78],[78.78,79.44]];
  document.querySelectorAll('.mechanism-steps [data-step]').forEach((el,i)=>{
    const [start,end]=recapWindows[i],active=sec>=start&&sec<end,complete=sec>=end;
    el.classList.toggle('active',active);el.classList.toggle('complete',complete);
    el.style.transform=`translateY(${active?-.28:0}cqw) scale(${active?1.035:complete?.99:.965})`;
    el.style.opacity=String(sec>=75.8?1:.0);
  });
  const mixResult=document.querySelector('.mechanism-mix-result');
  setOpacity(mixResult,smooth(78.72,78.92,sec));
  document.querySelectorAll('.mechanism-connector').forEach((el,i)=>{const active=sec>=recapWindows[i][1];el.classList.toggle('active',active);el.style.opacity=String(sec>=75.8?1:0);el.querySelector('i').style.transform=`translateX(${sec>=recapWindows[i][1]?1.25:0}cqw)`;});

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
  const oneView=smooth(.42,.78,sec)*(1-smooth(6.0,6.8,sec));
  const parallel=smooth(7.0,8.35,sec);
  const patterns=smooth(12.1,13.55,sec)*(1-smooth(30.25,31.05,sec));
  const namedExamples=patterns*(1-smooth(19.0,19.85,sec));
  const reference=smooth(14.66,15.28,sec)*(1-smooth(16.25,16.72,sec));
  const preference=smooth(16.72,17.28,sec)*(1-smooth(19.0,19.7,sec));
  const changing=smooth(25.4,26.1,sec)*(1-smooth(30.45,31.05,sec));
  const equalViews=smooth(31.5,32.2,sec)*(1-smooth(35.56,36.35,sec));
  const finalMix=smooth(35.56,37.14,sec);
  const outputIn=smooth(9.8,11.2,sec);
  const moveOn=smooth(39.1,39.6,sec);
  if(headSingleView){headSingleView.style.opacity=String(oneView);headSingleView.style.transform=`translateY(${(1-oneView)*.8}cqw) scale(${.92+.08*oneView})`;}
  const source=document.getElementById('head-source');
  if(source)source.style.opacity=String(smooth(.35,.8,sec));
  const inputTokens=document.querySelectorAll('.head-source-sentence [data-word]');
  inputTokens.forEach((word)=>{const key=word.dataset.word,hot=(key==='it'?Math.max(oneView,reference,finalMix):key==='trail'?Math.max(reference,patterns*.5):key==='shaded'||key==='short'?patterns*.45:patterns*.3);word.style.borderColor=`color-mix(in srgb,${key==='it'?'#91f2d2':key==='trail'?'#72c8ff':key==='maokong'?'#ffc776':'#ba9aff'} ${Math.round(35+hot*55)}%,#324250)`;word.style.color=hot>.18?'#f2fff9':'#c7d1da';word.style.transform=`translateY(${-hot*.12}cqw)`;});
  headSingleView?.querySelectorAll('i').forEach((bar,i)=>{const resolve=smooth(.8+i*.38,1.5+i*.38,sec),base=34+((i*19+23)%58),h=16+(base-16)*resolve;bar.style.setProperty('--h',`${h}%`);bar.style.transform=`scaleY(${.74+.26*Math.sin(sec*4.2+i*.72)})`;bar.style.filter=`brightness(${.72+.55*resolve})`;});
  if(source)source.style.borderColor=`color-mix(in srgb,#91f2d2 ${Math.round(parallel*22)}%,#2d414f)`;
  const baseProfiles=[[30,70,42,84,52,62],[76,28,64,40,86,54],[48,82,34,68,44,90],[88,46,72,30,62,40]];
  const altProfiles=[[70,34,88,52,40,76],[38,82,46,90,56,30],[84,42,68,36,92,54],[44,76,32,86,48,70]];
  headLanes.forEach((lane,i)=>{
    const laneIn=smooth(7.85+i*.035,8.95+i*.035,sec);
    const active=i===0?reference:i===1?preference:0;
    lane.style.opacity=String(laneIn*(.66+.34*Math.max(active,equalViews)));
    lane.style.transform=`translateX(${(1-laneIn)*3.2-active*.25}cqw) scale(${1+active*.018})`;
    lane.style.filter=`brightness(${.82+active*.32+equalViews*.12+finalMix*.12})`;
    const role=lane.querySelector('.head-role'),example=lane.querySelector('.head-pattern-example');
    role.style.opacity=String(namedExamples*(.58+active*.42));
    example.style.opacity=String(patterns*(i<2?1:.7));
    example.style.transform=`scale(${1+active*.045})`;
    const profileBars=[...lane.querySelectorAll('.head-projection-bars i')];
    profileBars.forEach((bar,j)=>{const blend=changing*(.5+.5*Math.sin((sec-25.4)*3.25+i*1.2)),h=baseProfiles[i][j]*(1-blend)+altProfiles[i][j]*blend;const shimmer=.88+.12*Math.sin(sec*4.2+i+j*.7);bar.style.height=`${h*shimmer}%`;bar.style.filter=`brightness(${.78+blend*.55})`;});
    const outputBars=[...lane.querySelectorAll('.head-lane-output i')];
    outputBars.forEach((bar,j)=>{const h=baseProfiles[i][j%6]*(1-changing)+altProfiles[i][j%6]*changing;bar.style.height=`${h*(.84+.16*Math.sin(sec*2.5+i+j))}%`;bar.style.opacity=String(laneIn*(.64+finalMix*.36));});
    lane.querySelector('.head-track').style.borderColor=active>.1?`color-mix(in srgb,var(--head-color) ${Math.round(28+active*52)}%,#2b3946)`:'';
  });
  const stamp=document.getElementById('schematic-stamp');
  if(stamp){const visible=(sec>=6&&sec<11.25)||(sec>=24.45&&sec<30.7)||(sec>=35.56);stamp.textContent=sec<11.25?'same input → parallel views':sec<30.7?'learned patterns vary across layers and models':'several views → one updated representation';stamp.style.opacity=String(visible?1:0);}
  const caveat=document.getElementById('head-caveat');
  if(caveat){caveat.textContent='NO GUARANTEED HEAD JOB TITLES';caveat.style.opacity=String(smooth(19.4,19.9,sec)*(1-smooth(24.1,24.55,sec)));}
  const mainIdea=document.getElementById('head-main-idea');
  if(mainIdea)mainIdea.style.opacity=String(smooth(32.6,33.35,sec)*(1-smooth(34.5,35.05,sec)));
  const outputLabel=document.getElementById('heads-output-label');
  if(outputLabel)outputLabel.textContent=sec>=38.36?'UPDATED “IT” REPRESENTATION':'combined views';
  if(headOutput){headOutput.style.opacity=String(outputIn);headOutput.style.transform=`translateX(${moveOn*1.1}cqw) scale(${1+finalMix*.035*Math.sin(sec*2.4)})`;headOutput.style.filter=`brightness(${1+finalMix*.25})`;}
  const combine=document.getElementById('heads-combine');
  if(combine){combine.style.opacity=String(outputIn);combine.style.transform=`scale(${.9+.1*outputIn+finalMix*.04*Math.sin(sec*3.2)})`;[...combine.children].forEach((bar,i)=>{bar.style.height=`${[42,78,56,90,64,36][i]}%`;bar.style.transform=`scaleY(${.82+.18*Math.sin(sec*3.4+i*.7)})`;});}
  const svg=document.querySelector('.head-merge'),rect=svg.getBoundingClientRect();
  const anchor=(el,x=.5,y=.5)=>{const r=el.getBoundingClientRect();return{x:(r.left+r.width*x-rect.left)/rect.width*1200,y:(r.top+r.height*y-rect.top)/rect.height*675};};
  const target=anchor(combine,.08,.5);
  const mergeStrength=Math.max(outputIn*.3,finalMix);
  headMergePaths.forEach((path,i)=>{
    const sourcePoint=anchor(headLanes[i].querySelector('.head-lane-output'),.02,.5),dx=target.x-sourcePoint.x,dy=target.y-sourcePoint.y,bend=Math.max(14,Math.min(50,Math.abs(dy)*.38));
    path.setAttribute('d',`M ${sourcePoint.x.toFixed(1)} ${sourcePoint.y.toFixed(1)} C ${(sourcePoint.x+dx*.42).toFixed(1)} ${(sourcePoint.y+Math.sign(dy||1)*bend).toFixed(1)}, ${(target.x-dx*.38).toFixed(1)} ${(target.y-Math.sign(dy||1)*bend).toFixed(1)}, ${target.x.toFixed(1)} ${target.y.toFixed(1)}`);
    path.style.stroke=headPalette[i];path.style.opacity=String(mergeStrength*(.24+equalViews*.16+finalMix*.5));path.style.strokeDasharray='none';
    const len=path.getTotalLength(),q=phase(sec,finalMix>.2?.82:1.8,i*.19),pt=path.getPointAtLength(len*q),dot=headMergeDots[i];
    dot.setAttribute('cx',String(pt.x));dot.setAttribute('cy',String(pt.y));dot.style.fill=headPalette[i];dot.style.opacity=String(mergeStrength*(.12+finalMix*.88));dot.setAttribute('r',String(3.6+finalMix*2.4));
  });
}
function renderBlock(p){
  const sec=sceneSeconds(5,p);
  const attentionCue=Math.max(smooth(2.6,3.2,sec)*(1-smooth(10.0,10.5,sec)),smooth(30.3,31.0,sec)*(1-smooth(37.25,38.0,sec)));
  const mlpCue=Math.max(smooth(10.3,10.9,sec)*(1-smooth(15.8,16.35,sec)),smooth(30.3,31.0,sec)*(1-smooth(37.25,38.0,sec)));
  const residualCue=smooth(16.1,16.7,sec)*(1-smooth(24.45,24.95,sec));
  const repeatCue=smooth(24.8,25.7,sec);
  const representationCue=smooth(37.6,39.0,sec);
  const stack=document.getElementById('transformer-stack');
  stack.style.transform=`translateX(${(1-smooth(.25,.75,sec))*3.5}cqw) translateY(${Math.sin(sec*2.2)*.22}cqw) rotateY(${Math.sin(sec*1.4)*2.8}deg) scale(${.94+.06*smooth(.5,2.8,sec)})`;
  const blocks=[...stack.querySelectorAll('.transformer-block')];
  const layerPosition=clamp((sec-38.7)/8.8)*2,layerStep=Math.min(2,Math.floor(layerPosition)),layerPulse=Math.max(0,1-Math.abs(layerPosition-layerStep));
  blocks.forEach((el,i)=>{const base=[.3,.58,.98][i],reveal=i===2?1:repeatCue,beat=pulse(sec,.58,-i*.16),cue=Math.max(attentionCue,residualCue,mlpCue,repeatCue),lateBeat=representationCue*layerPulse*(i===2?1:.55);el.style.opacity=String(base*reveal);el.style.filter=`brightness(${.74+cue*.55+beat*.12+lateBeat*.48})`;el.style.boxShadow=`0 0 ${.35+cue*.95+beat*.25+lateBeat*.5}cqw #72c8ff${Math.round(18+cue*42+lateBeat*32).toString(16).padStart(2,'0')},0 1.1cqw 2.5cqw #0006`;});
  const frontFaces=[...stack.querySelector('.block-front').querySelectorAll('.block-face')];
  const faceCues=[attentionCue,residualCue,mlpCue];
  frontFaces.forEach((face,i)=>{const cue=faceCues[i],wave=.5+.5*Math.sin(sec*5.2+i*1.6);face.style.filter=`brightness(${.88+cue*.55+wave*.12})`;face.style.transform=`translateX(${cue*(.3+.12*wave)}cqw) scale(${1+cue*.012})`;face.style.boxShadow=`inset 0 0 ${cue*.8}cqw ${i===1?'#b7e1af':'#72c8ff'}55`;});
  document.querySelectorAll('.explain-item').forEach((e,i)=>{const cue=i===0?attentionCue:i===1?residualCue:mlpCue;e.classList.toggle('active',cue>.42);e.style.opacity=String((.28+cue*.72)*(1-representationCue));});
  blockTokens.forEach((e,i)=>{const focus=i===6,beat=pulse(sec,.62,i*.7),q=smooth(.45,2.2,sec),layerHot=representationCue*Math.max(0,1-Math.abs(layerPosition-Math.min(2,Math.floor(layerPosition))));e.style.opacity=String(.55+.45*q);e.style.borderColor=focus?`color-mix(in srgb,#91f2d2 ${Math.round(38+attentionCue*55+layerHot*35)}%,#35556a)`:'#35556a';e.style.backgroundColor=focus?'#10251f':'#102131';e.style.transform=`translateX(${q*(.35+i*.08)}cqw) translateY(${focus?-attentionCue*.16-layerHot*.12:Math.sin(sec*2+i)*.06}cqw) scale(${focus?1+attentionCue*.045+representationCue*.04:1+beat*.012})`;});
  if(blockItToken){blockItToken.style.width=`${6.3+representationCue*1.3}cqw`;blockItToken.style.height=`${2.1+representationCue*1.3}cqw`;const vector=blockItToken.querySelector('.block-token-vector');vector.style.opacity=String(representationCue);vector.style.transform=`scaleY(${representationCue})`;vector.querySelectorAll('i').forEach((bar,i)=>{const base=[38,76,54,88,46,68,32,82][i],grown=[72,44,91,58,82,35,68,94][i],stage=smooth(0,1,layerPosition/2);bar.style.height=`${base+(grown-base)*stage}%`;bar.style.transform=`scaleY(${.72+.28*Math.sin(sec*4.2+i*.72)})`;bar.style.filter=`brightness(${.78+representationCue*.5})`;});}
  document.querySelectorAll('.residual-loop').forEach((e,i)=>{const beat=pulse(sec,.52,i*.17),cue=residualCue;e.style.transform=`rotate(${sec*96}deg) scale(${.84+.3*beat+cue*.1})`;e.style.boxShadow=`0 0 ${beat*.35+cue*.7}cqw #b7e1afaa`;});
  const result=document.getElementById('block-result');result.style.opacity=String(representationCue);result.style.transform=`translateY(${(1-representationCue)*.55}cqw) scale(${.94+.06*representationCue})`;
  result.querySelectorAll('.block-result-vector i').forEach((bar,i)=>{const base=[38,76,54,88,46,68,32,82][i],grown=[72,44,91,58,82,35,68,94][i],stage=smooth(0,1,layerPosition/2);bar.style.height=`${base+(grown-base)*stage}%`;bar.style.transform=`scaleY(${.72+.28*Math.sin(sec*4.1+i*.65)})`;bar.style.filter=`brightness(${.82+layerPulse*.42})`;});
  document.querySelector('.block-stack-caption').textContent=sec<2.6?'Attention is one sublayer—not the whole Transformer.':sec<10.3?'Attention mixes context across token positions.':sec<16.1?'The MLP transforms each token position.':sec<24.8?'Residual paths carry information around a sublayer; normalization steadies its scale.':sec<30.3?'The exact block layout can vary; this pattern repeats.':sec<37.6?'Attention and feed-forward transformations repeat through a stack.':'Same token position, richer context—not a little sentence stored inside.';
  const rect=blockFlowWeb.getBoundingClientRect(),point=(el,edge='center')=>{const r=el.getBoundingClientRect();const x=edge==='left'?r.left:edge==='right'?r.right:r.left+r.width/2;const y=edge==='top'?r.top:edge==='bottom'?r.bottom:r.top+r.height/2;return{x:(x-rect.left)/rect.width*1200,y:(y-rect.top)/rect.height*675};};
  const tokenPoint=point(blockItToken,'right'),tokenTop=point(blockItToken,'top'),faces=frontFaces.map(face=>({left:point(face,'left'),center:point(face),right:point(face,'right'),top:point(face,'top')})),resultPoint=point(result,'left');
  const links=[[tokenPoint,faces[0].left,attentionCue],[faces[0].right,faces[1].left,Math.max(attentionCue,residualCue)],[tokenTop,faces[1].top,residualCue],[faces[1].right,faces[2].left,Math.max(residualCue,mlpCue)],[faces[2].right,resultPoint,representationCue]];
  links.forEach(([a,b,alpha],i)=>{const path=blockFlowPaths[i],dot=blockFlowDots[i],dx=b.x-a.x,dy=b.y-a.y,bend=Math.max(12,Math.min(42,Math.abs(dx)*.13));if(i===2){path.setAttribute('d',`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${(a.x+42).toFixed(1)} ${(a.y-72).toFixed(1)}, ${(b.x-72).toFixed(1)} ${(b.y-68).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);}else{path.setAttribute('d',`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${(a.x+dx*.42).toFixed(1)} ${(a.y-Math.sign(dy||1)*bend).toFixed(1)}, ${(b.x-dx*.42).toFixed(1)} ${(b.y+Math.sign(dy||1)*bend).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);}path.style.opacity=String(alpha*(i===2?.78:.62));path.style.stroke=i===2||i===1?'#b7e1af':i===4?'#91f2d2':'#72c8ff';path.style.strokeDasharray='none';const len=path.getTotalLength(),pos=phase(sec,.94,i*.19),pt=path.getPointAtLength(len*pos);dot.setAttribute('cx',String(pt.x));dot.setAttribute('cy',String(pt.y));dot.setAttribute('r',String(3.5+alpha*2));dot.style.fill=i===2||i===1?'#b7e1af':'#dffff5';dot.style.opacity=String(alpha*(.22+.78*pulse(sec,.94,i*.19)));});
}
function renderMask(p){
  const sec=sceneSeconds(6,p);
  const training=sec<30.0;document.querySelectorAll('.mask-mode').forEach(e=>e.classList.toggle('active',e.dataset.mode===(training?'training':'generation')));
  const parallelPhase=training?smooth(19.7,20.25,sec)*(1-smooth(29.6,30.0,sec)):0;
  const appendedCount=sec>=42.5?2:sec>=39.7?1:0;
  const rowIndex=training?-1:5;
  document.querySelectorAll('.mask-cell').forEach(e=>{const r=Number(e.dataset.r),c=Number(e.dataset.c),beat=pulse(sec,.38,r*.08),allowed=c<=r,current=!training&&r===rowIndex&&allowed,parallelBeat=.72+.28*Math.sin((sec-19.7)*4+r*.24);e.classList.toggle('current',current);e.classList.toggle('parallel-computing',training&&parallelPhase>.01&&allowed);e.style.opacity=allowed?String(.28+.7*(training?Math.max(.42+.45*beat,parallelPhase*parallelBeat):r===rowIndex?1:.48+.22*pulse(sec,.38,r*.1+c*.06))):'0.18';e.style.transform=allowed?`scale(${current?1+.08*beat:training?1+.025*beat+parallelPhase*.035*parallelBeat:1})`:'';e.style.borderColor=!allowed?'#59333a':'';e.style.boxShadow=allowed&&parallelPhase>.01?`0 0 ${parallelPhase*(.2+.42*parallelBeat)}cqw rgba(107,235,199,.68)`:'';});
  const track=document.querySelector('.generation-track'),generationReveal=smooth(30.0,31.0,sec);track.style.width=`${58+28*generationReveal}cqw`;track.style.opacity=String(generationReveal);track.style.transform=`translateY(${(1-generationReveal)*.65}cqw)`;
  const caption=document.getElementById('mask-caption');caption.textContent=sec<9?'Predicting the next token means each position must respect what comes before.':sec<19.7?'A one-way gate keeps every position from seeing its future.':sec<30?'Many positions compute in parallel, with future tokens still masked.':sec<33.5?'Generation starts from the prompt’s final position.':sec<37.2?'That position scores several possible next tokens.':sec<39.7?'Select one token; it is only the next piece, not a full answer.':sec<44.5?'Append the selected token; now predict from the longer context.':'Reuse cached Keys and Values, then extend one token at a time.';
  [...generationTokens.children].forEach((e,i)=>{const generated=i>=genWords.length,gi=generated?Number(e.dataset.generated):-1,shown=generated&&gi<appendedCount,reveal=gi===0?smooth(39.7,40.15,sec):smooth(42.5,42.95,sec);e.classList.toggle('new',shown);e.style.opacity=generated?String(shown?reveal:0):'1';e.style.transform=`translateY(${shown?-Math.sin(sec*9+i)*.12:0}cqw) scale(${shown?1+.025*pulse(sec,.7,i):1})`;});
  const candidates=document.getElementById('next-candidates'),firstCandidateIn=smooth(33.5,34.0,sec)*(1-smooth(39.5,40.0,sec)),nextCandidateIn=smooth(41.65,42.0,sec)*(1-smooth(42.25,42.65,sec)),candidateIn=Math.max(firstCandidateIn,nextCandidateIn);candidates.style.display=candidateIn>.001?'flex':'none';candidates.style.opacity=String(candidateIn);const candidateLabels=sec<39.7?['short','long','park']:['too.','today','either.'],selected=sec>=37.2&&sec<39.7||sec>=42.2?0:-1,scoreWidths=[76,48,29];
  candidates.querySelectorAll('b').forEach((e,i)=>{const chosen=i===selected,label=e.querySelector('.candidate-label'),fill=e.querySelector('em'),width=scoreWidths[i]+(i===0?4*Math.sin(sec*5):i===1?3*Math.sin(sec*4.3+1):2*Math.sin(sec*3.8+2));label.textContent=candidateLabels[i];fill.style.width=`${width}%`;e.classList.toggle('selected',chosen);e.style.transform=`translateY(${chosen?-.12*Math.sin(sec*8):.04*Math.sin(sec*3+i)}cqw) scale(${chosen?1.06:1})`;e.style.opacity=String(candidateIn*(chosen?1:.7));});
  const cache=document.querySelector('.kv-cache'),cacheIn=smooth(44.5,45.2,sec);
  cache.style.display=cacheIn>.001?'flex':'none';setOpacity(cache,cacheIn);
  if(cache.querySelector('small'))cache.querySelector('small').textContent=sec<48.5?'K/V CACHE':'REUSE K/V';
  cache.querySelectorAll('i').forEach((bar,i)=>{
    const base=42+((i*19+31)%52),newEntry=i>=4,entryIn=newEntry?smooth(45.2+(i-4)*.9,45.7+(i-4)*.9,sec):1;
    bar.style.height=`${base}%`;
    bar.style.transform=`scaleY(${newEntry ? .72+.28*pulse(sec,.7,i) : 1})`;
    bar.style.opacity=String(cacheIn*entryIn);
    bar.style.background=newEntry?'linear-gradient(180deg,#caffee,#54c9a8)':'linear-gradient(180deg,#b9c5ff,#686ee7)';
  });
}
function renderRecap(p){
  const sec=sceneSeconds(7,p);
  const stageStarts=[1.6,3.8,7,14.5,17.8,22.8,43.8];
  const currentStage=stageStarts.reduce((current,start,i)=>sec>=start?i:current,-1);
  const systemContext=smooth(26.2,27.0,sec)*(1-smooth(37.5,38.0,sec));
  document.querySelectorAll('#recap-route span').forEach((e,i)=>{const q=smooth(stageStarts[i],stageStarts[i]+.72,sec),isCurrent=i===currentStage;const breathe=isCurrent?.08:.035,boost=isCurrent?.045:0;e.classList.toggle('active',q>.4);e.classList.toggle('current',isCurrent);e.style.transform=`translateY(${(1-q)*.7+.1*Math.sin(sec*3.2+i)}cqw) scale(${.9+.1*q+breathe*Math.sin(sec*3.3+i)+boost})`;e.style.filter=`brightness(${1+systemContext*(.08+.16*pulse(sec,.82,i*.12))})`;});
  const routeReveal=smooth(.5,2.2,sec);recapPath.style.opacity=String(routeReveal*.72);recapPath.style.strokeDasharray='18 22';recapPath.style.strokeDashoffset=String(-sec*44);
  const dotSpeeds=[.29,.37,.43,.32];
  recapDots.forEach((dot,i)=>{const u=phase(sec,dotSpeeds[i%dotSpeeds.length],i*.19),point=recapPath.getPointAtLength(recapPathLength*u);dot.setAttribute('cx',String(point.x));dot.setAttribute('cy',String(point.y));dot.style.opacity=String(routeReveal*(.55+.4*pulse(sec,.72,i*.17)));dot.setAttribute('r',String(3.8+2.8*pulse(sec,.68,i*.16)));});
  const next=document.getElementById('recap-next'),nextIn=smooth(37.5,38.15,sec);next.classList.toggle('scoring',sec>=43.8);next.style.opacity=String(nextIn);next.style.transform=`translateY(${(1-nextIn)*.7}cqw) scale(${.96+.04*nextIn})`;
  const scoreEvolution=smooth(43.8,44.5,sec),scoreWidths=[44+32*smooth(43.8,51.2,sec),58-10*smooth(43.8,51.2,sec),37-8*smooth(43.8,51.2,sec)];
  const nextTitle=document.getElementById('recap-next-title'),nextNote=document.getElementById('recap-next-note');nextTitle.textContent=sec<43.8?'TAIPEI CONSTRAINT → SUGGESTION':'POSSIBLE NEXT TOKENS';nextNote.textContent=sec<43.8?'Nature-first · within $8,000':'Illustrative scores · not measured outputs';
  const candidateLabels=sec<43.8?['Maokong','shaded trail','short hike']:['Maokong','nature-first','trail'];
  next.querySelectorAll('.recap-candidates>div').forEach((e,i)=>{const selected=sec>=54&&i===0;e.querySelector('b').textContent=candidateLabels[i];e.classList.toggle('selected',selected);e.querySelector('em').style.width=`${scoreWidths[i]}%`;e.querySelector('i').style.opacity=String(scoreEvolution);e.style.transform=`translateY(${selected?-.12*Math.sin(sec*5):Math.sin(sec*2+i)*.035}cqw) scale(${selected?1.035:1})`;});
  const copy=document.getElementById('recap-copy');copy.querySelector('b').textContent=sec>=54?'Context is built, one layer at a time.':'One forward pass through a Transformer.';setOpacity(copy,smooth(51.2,52.4,sec));copy.style.transform=`translateY(${(1-smooth(51.2,52.4,sec))*.6}cqw)`;
  setOpacity(document.getElementById('closing-line'),smooth(54.0,55.0,sec));
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
