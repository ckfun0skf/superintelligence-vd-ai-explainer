import './chapter-05.css';
import {chapterFiveMarkup} from './chapter-05-markup.js';
document.querySelector('#film')?.insertAdjacentHTML('beforeend',chapterFiveMarkup);
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,p)=>a+(b-a)*clamp(p);
const smooth=(a,b,t)=>{const p=clamp((t-a)/(b-a));return p*p*(3-2*p);};
const phase=(t,a,b,fi=.5,fo=.55)=>clamp((t-a)/Math.max(.001,fi))*(1-clamp((t-(b-fo))/Math.max(.001,fo)));
const svgNS='http://www.w3.org/2000/svg';
const el=id=>document.getElementById(id);
const opacity=(id,v)=>{const e=el(id);if(!e)return;const p=clamp(v);e.style.opacity=p.toFixed(4);e.style.visibility=p>.008?'visible':'hidden';};
const attr=(node,name,value)=>node?.setAttribute(name,String(value));
const text=(id,value)=>{const e=el(id);if(e&&e.textContent!==String(value))e.textContent=String(value);};
const make=(tag,attrs={})=>{const e=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
const seeded=seed=>{let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};};

const mothPositions=[[775,310],[860,296],[946,315],[735,418],[840,402],[965,425],[760,535],[875,528],[1000,548],[805,652],[920,671],[1025,640]];
const lightMoths=[],darkMoths=[];
function makeMoth(parent,x,y,isLight,index){
  const g=make('g',{class:`evo-moth ${isLight?'is-light':'is-dark'}`,transform:`translate(${x} ${y})`,opacity:0});
  const fill=isLight?'#ded8c7':'#26303a';
  g.append(make('path',{d:'M0 0 C-13 -21 -35 -25 -39 -9 C-40 4 -23 11 -4 5 C-20 12 -26 26 -14 30 C-4 32 0 17 0 7 C0 18 5 32 15 30 C27 26 20 12 4 5 C23 11 40 4 39 -9 C35 -25 13 -21 0 0Z',fill,stroke:isLight?'#f6edda':'#63727c','stroke-width':2.5}));
  g.append(make('path',{d:'M0 1 C-7 -8 -7 11 0 16 C7 11 7 -8 0 1Z',fill:isLight?'#786d5b':'#d0b18b'}));
  g.append(make('path',{d:'M-2 -6 -10 -17M2 -6 10 -17',fill:'none',stroke:isLight?'#95866d':'#d4c4ab','stroke-width':1.8,'stroke-linecap':'round'}));
  g.dataset.index=String(index);parent.append(g);return g;
}
function buildMoths(){
  const root=el('evo-moth-populations');if(!root)return;
  mothPositions.forEach(([x,y],i)=>{lightMoths.push(makeMoth(root,x,y,true,i));darkMoths.push(makeMoth(root,x+31,y+19,false,i));});
}

const candidateCards=[];
function buildMiniNetwork(parent,x,y,variant){
  const g=make('g',{transform:`translate(${x} ${y})`});
  const ins=[[0,18],[0,50],[0,82]],mid=[[62,0],[62,29],[62,61],[62,90]],outs=[[126,29],[126,61]];
  const lines=make('g',{fill:'none',stroke:'#4c8191','stroke-width':2,'stroke-dasharray':'4 5',opacity:.72});
  ins.forEach((a,i)=>mid.forEach((b,j)=>lines.append(make('path',{d:`M${a[0]+6} ${a[1]} Q${33+((i+j+variant)%3)*5} ${(a[1]+b[1])/2} ${b[0]-6} ${b[1]}`}))));
  mid.forEach((a,i)=>outs.forEach((b,j)=>lines.append(make('path',{d:`M${a[0]+6} ${a[1]} Q${94+((i+j+variant)%2)*6} ${(a[1]+b[1])/2} ${b[0]-7} ${b[1]}`}))));
  g.append(lines);
  const nodes=make('g',{fill:'#102635',stroke:'#91f2d2','stroke-width':2.6});
  ins.forEach((p,i)=>nodes.append(make('circle',{cx:p[0],cy:p[1],r:5.5,stroke:'#72c8ff'})));
  mid.forEach((p,i)=>nodes.append(make('circle',{cx:p[0],cy:p[1],r:6,stroke:variant%2?'#91f2d2':'#a7d7cb'})));
  outs.forEach((p,i)=>nodes.append(make('circle',{cx:p[0],cy:p[1],r:6.5,stroke:'#ffc776',fill:'#302719'})));
  g.append(nodes);
  const dial=make('g',{class:'evo-weight-mutation',opacity:0});
  dial.append(make('circle',{cx:62,cy:29,r:11,fill:'none',stroke:'#ffc776','stroke-width':2.5}));
  dial.append(make('path',{d:'M62 29 69 22',fill:'none',stroke:'#fff0ca','stroke-width':2.5,'stroke-linecap':'round'}));
  g.append(dial);parent.append(g);return g;
}
function buildMiniBoard(parent,x,y,index){
  const g=make('g',{class:'evo-card-board',transform:`translate(${x} ${y})`,opacity:0});
  g.append(make('rect',{x:0,y:0,width:150,height:138,rx:8,fill:'#09131d',stroke:'#38505f','stroke-width':2}));
  for(let k=1;k<5;k++){
    g.append(make('path',{d:`M${k*30} 5V133 M5 ${k*27.5}H145`,fill:'none',stroke:'#29404c','stroke-width':1,opacity:.6}));
  }
  const apple=make('circle',{class:'mini-apple',cx:115,cy:30,r:7,fill:'#ff9f6e',stroke:'#fff0ca','stroke-width':1.5});g.append(apple);
  const body=make('g',{class:'mini-snake',fill:'#91f2d2'});
  [[35,95],[55,95],[75,95],[95,95]].forEach((p,j)=>body.append(make('rect',{x:p[0],y:p[1],width:17,height:17,rx:4,opacity:j===3?1:.75})));g.append(body);
  g.dataset.index=String(index);parent.append(g);return g;
}
function buildPopulation(){
  const root=el('evo-candidate-cards');if(!root)return;
  const xs=[74,680,1286],ys=[133,567],base=[.24,.38,.72,.18,.84,.49];
  let i=0;
  ys.forEach((y,row)=>xs.forEach((x,col)=>{
    const w=560,h=350,score=base[i];
    const g=make('g',{class:'evo-candidate',transform:`translate(${x} ${y})`,opacity:0});
    g.append(make('rect',{class:'evo-card-shell',x:0,y:0,width:w,height:h,rx:18,fill:'url(#evoCardFill)',stroke:'#344b5b','stroke-width':2}));
    g.append(make('rect',{class:'evo-selected-ring',x:5,y:5,width:w-10,height:h-10,rx:16,fill:'none',stroke:'#91f2d2','stroke-width':4,opacity:0}));
    const title=make('text',{x:27,y:43,class:'evo-card-title'});title.textContent=`CANDIDATE ${String.fromCharCode(65+i)}`;g.append(title);
    const tag=make('text',{x:530,y:43,class:'evo-card-status','text-anchor':'end'});tag.textContent='TRIAL';g.append(tag);
    const net=buildMiniNetwork(g,45,96,i);
    const board=buildMiniBoard(g,349,81,i);
    const barLabel=make('text',{x:29,y:263,class:'evo-card-meta'});barLabel.textContent='FITNESS SCORE';g.append(barLabel);
    const scoreText=make('text',{x:528,y:265,class:'evo-card-score','text-anchor':'end'});scoreText.textContent='0';g.append(scoreText);
    g.append(make('rect',{x:29,y:283,width:500,height:14,rx:7,fill:'#263a48'}));
    const bar=make('rect',{class:'evo-score-fill',x:29,y:283,width:500*score,height:14,rx:7,fill:'url(#evoScoreFill)'});g.append(bar);
    const mutation=make('g',{class:'evo-mutation-spark',opacity:0});
    mutation.append(make('circle',{cx:109,cy:125,r:10,fill:'#ffc776',filter:'url(#evoGlow)'}));
    mutation.append(make('path',{d:'M109 105V91M89 125H75M129 125H143M109 145V159',stroke:'#ffd99a','stroke-width':3,'stroke-linecap':'round'}));g.append(mutation);
    const crash=make('text',{class:'evo-card-crash',x:423,y:155,'text-anchor':'middle'});crash.textContent='×';g.append(crash);
    root.append(g);candidateCards.push({g,score,bar,scoreText,tag,net,board,mutation,crash,index:i});i++;
  }));
}
function buildMothPopulationLabels(){
  const root=el('evo-nature-bars');if(!root)return;
  const rows=[{y:914,color:'#d6cfbd',id:'light'},{y:976,color:'#9ca9b1',id:'dark'}];
  rows.forEach((r,i)=>{
    const label=make('text',{x:116,y:r.y+20,class:'evo-nature-bar-label'});label.textContent=i===0?'LIGHT FORM':'DARK FORM';root.append(label);
    root.append(make('rect',{x:380,y:r.y,width:390,height:24,rx:12,fill:'#283947'}));
    const fill=make('rect',{class:`evo-nature-bar-${r.id}`,x:380,y:r.y,width:i===0?300:100,height:24,rx:12,fill:r.color});root.append(fill);
    const dots=make('text',{id:`evo-nature-count-${r.id}`,x:806,y:r.y+21,class:'evo-nature-count'});dots.textContent=i===0?'10':'3';root.append(dots);
  });
}

function buildCandidateScene(){buildMoths();buildPopulation();buildMothPopulationLabels();}
buildCandidateScene();

function updatePopulation(t){
  const intro=phase(t,18.2,48.5,.7,.8),algorithm=phase(t,159.2,187.2,.8,.8),snake=phase(t,205.5,300.0,.9,1.3);
  const overlays=Math.max(phase(t,238.0,267.0,.7,.8),phase(t,267.0,286.5,.6,.7),phase(t,286.5,300.0,.6,.7));
  const visible=Math.max(intro,algorithm,snake*(1-.9*overlays));
  opacity('evo-candidate-grid',visible);
  const snakeP=snake;
  const generation=smooth(232.0,287.5,t);
  candidateCards.forEach(({g,bar,scoreText,tag,board,mutation,crash,index},i)=>{
    const base=[.22,.36,.7,.16,.84,.48][i];
    const trialLoop=clamp((t-206)/72);
    const wave=.06*Math.sin((t-205)*.62+i*1.6);
    const score=clamp(base+generation*(i===1||i===4?.14:.04)+wave+trialLoop*.05);
    attr(g,'opacity',visible.toFixed(4));
    attr(bar,'width',500*score);
    scoreText.textContent=String(Math.round(score*100));
    const selected=(i===2||i===4)?Math.max(intro,algorithm,snake*smooth(232,239,t)):0;
    attr(g.querySelector('.evo-selected-ring'),'opacity',selected.toFixed(4));
    attr(tag,'fill',selected>.2?'#91f2d2':'#9fb3bf');
    tag.textContent=selected>.2?'SELECTED':snakeP>.1&&score<.3?'CRASHED':'TRIAL';
    attr(board,'opacity',(snakeP*(i===0||i===3?.76:1)).toFixed(4));
    const miniSnake=board.querySelector('.mini-snake');
    const p=clamp((t-206)/4.4+i*.17);const hx=20+((Math.floor(p*9)+i*2)%4)*22;const hy=28+((Math.floor(p*7)+i)%4)*22;
    const segs=[...miniSnake.children];
    segs.forEach((seg,j)=>{const dx=(j-3)*16;attr(seg,'x',clamp(hx-dx,8,125));attr(seg,'y',hy);});
    const apple=board.querySelector('.mini-apple');attr(apple,'cx',22+((i*37+Math.floor(p*8)*13)%110));attr(apple,'cy',20+((i*19+Math.floor(p*6)*17)%104));
    attr(crash,'opacity',(snakeP>.05&&score<.28?smooth(.1,.4,snakeP):0).toFixed(3));
    const mutate=phase(t,238.3,252.0,.4,.55)*Math.max(algorithm, snakeP);
    attr(mutation,'opacity',mutate.toFixed(3));
    const dial=g.querySelector('.evo-weight-mutation');attr(dial,'opacity',mutate.toFixed(3));
    const wobble=8*Math.sin(t*1.7+i*2.1);attr(dial,'transform',`rotate(${wobble.toFixed(1)} 62 29)`);
  });
  const loops=Math.max(1,Math.floor(Math.max(0,t-253.0)/8.1)+1);
  text('evo-generation-count',`GENERATION ${Math.min(12,loops).toString().padStart(2,'0')}`);
  const bar=Math.min(74,12+Math.max(0,t-254)*.27);
  const best=el('evo-best-line');if(best)attr(best,'stroke-dashoffset',String(780-bar*8));
}
function updateMoths(t){
  const ecoHold=1-smooth(137.1,140.0,t);
  const start=smooth(66.0,69.2,t),darken=smooth(89.5,96.5,t),clean=smooth(105.8,112.0,t);
  const soot=darken*(1-clean);
  const lightCount=mix(10,3,soot),darkCount=mix(3,10,soot);
  lightMoths.forEach((m,i)=>{const amount=clamp(lightCount-i);attr(m,'opacity',(start*amount).toFixed(3));attr(m,'transform',`translate(${mothPositions[i][0]} ${mothPositions[i][1]+Math.sin(t*2+i)*2.2})`);});
  darkMoths.forEach((m,i)=>{const amount=clamp(darkCount-i);attr(m,'opacity',(start*amount).toFixed(3));attr(m,'transform',`translate(${mothPositions[i][0]+31} ${mothPositions[i][1]+19+Math.cos(t*1.7+i)*2.2})`);});
  const bark=el('evo-tree-bark');if(bark)bark.setAttribute('fill',`rgb(${Math.round(mix(151,43,soot))},${Math.round(mix(135,49,soot))},${Math.round(mix(112,52,soot))})`);
  const lichen=el('evo-lichen');if(lichen)lichen.style.opacity=String(1-soot*.85);
  const sootVeil=el('evo-soot-cloud');if(sootVeil)sootVeil.style.opacity=String(soot*.75*ecoHold);
  const birds=el('evo-bird-flock');if(birds){const flight=smooth(79.5,84.5,t)*(1-smooth(100,104,t));birds.style.opacity=String(flight*ecoHold);attr(birds,'transform',`translate(${mix(-130,1050,clamp((t-79.5)/20))} ${Math.sin(t*2.8)*20})`);}
  const cleanGlow=el('evo-cleaning-glow');if(cleanGlow)cleanGlow.style.opacity=String(clean*ecoHold);
  text('evo-tree-state',t<89.5?'PALE, LICHEN-COVERED BARK':t<105.8?'SOOT DARKENS THE BARK':'AIR CLEARS · BARK LIGHTENS');
  text('evo-nature-generation',t<89.5?'BEFORE INDUSTRIAL POLLUTION':t<105.8?'AFTER MANY GENERATIONS':'WHEN CONDITIONS SHIFT AGAIN');
  const lbar=el('evo-nature-bars');if(lbar){attr(lbar.querySelector('.evo-nature-bar-light'),'width',390*lightCount/12);attr(lbar.querySelector('.evo-nature-bar-dark'),'width',390*darkCount/12);}
  text('evo-nature-count-light',String(Math.round(lightCount)));text('evo-nature-count-dark',String(Math.round(darkCount)));
  const generations=el('evo-generation-dots');if(generations){const n=Math.round(mix(1,20,smooth(80,130,t)));text('evo-generation-label',`POPULATION · GENERATION ${n}`);}
  const stay=phase(t,133.7,138.2,.55,.4);opacity('evo-not-individual',stay);
  ['evo-woodland','evo-moth-populations','evo-nature-bars','evo-generation-dots','evo-tree-state','evo-nature-generation'].forEach(id=>opacity(id,ecoHold));
  const mothTitle=document.querySelector('#evo-natural .evo-svg-kicker');if(mothTitle)attr(mothTitle,'opacity',ecoHold);
  const ext=phase(t,138.0,159.2,.6,.8);opacity('evo-extinction',ext);
  const impact=el('evo-asteroid');if(impact){const p=smooth(141,146,t);attr(impact,'transform',`translate(${mix(-180,570,p)} ${mix(-130,360,p)}) rotate(22)`);}
  const dinos=el('evo-dinosaur');if(dinos)attr(dinos,'opacity',(ext*(1-smooth(147.8,151.3,t))).toFixed(3));
  const birdsAfter=el('evo-survivor-birds');if(birdsAfter)attr(birdsAfter,'opacity',(ext*smooth(149.4,153.0,t)).toFixed(3));
}
function updateSnakeIntro(t){
  const win=phase(t,186.3,210.0,.8,.8);opacity('evo-snake-intro',win);
  const board=el('evo-main-board');if(board){const p=(t-186.3)*.88,headX=Math.round(490+Math.sin(p)*82),headY=Math.round(573+Math.cos(p*.82)*68);attr(el('evo-snake-head'),'transform',`translate(${headX} ${headY})`);[...el('evo-snake-body').children].forEach((seg,i)=>{attr(seg,'x',headX-78*(3-i));attr(seg,'y',headY);});attr(el('evo-apple-main'),'transform',`translate(${Math.round(430+Math.sin(p*.55)*150)} ${Math.round(390+Math.cos(p*.66)*110)})`);}
  document.querySelectorAll('.evo-network-pulse circle').forEach((dot,i)=>{const q=(((t-190.0)*.52+i/3)%1+1)%1,mid=q<.52?q/.52:(q-.52)/.48,x=q<.52?920+(1090-920)*mid:1090+(1280-1090)*mid,y=q<.52?520+(470-520)*mid:470+(540-470)*mid;attr(dot,'cx',x);attr(dot,'cy',y);});
  const rows=[['evo-action-straight',.58],['evo-action-left',.25],['evo-action-right',.43]];
  rows.forEach(([id,base],i)=>{const p=.5+.5*Math.sin(t*2.1+i*2);const f=el(id);if(f)attr(f,'width',180*mix(base,.83,p));});
  const action=Math.floor(Math.max(0,t-198.5)/2.1)%3;
  ['evo-action-label-straight','evo-action-label-left','evo-action-label-right'].forEach((id,i)=>{const n=el(id);if(n)n.setAttribute('fill',i===action?'#91f2d2':'#bfd0d8');});
}
function updateChapterFive(t){
  const stage=el('chapter5-stage');if(stage){stage.style.opacity=String(smooth(0,.45,t));stage.style.visibility=t>=0?'visible':'hidden';}
  const backdrop=el('evo-backdrop');if(backdrop)backdrop.style.opacity=String(mix(0,1,smooth(1.2,3.0,t))*(1-smooth(369.5,372.1,t)));
  const ch4=el('chapter4-stage');if(ch4)ch4.style.opacity=String(1-smooth(0,3.25,t));
  opacity('evo-bridge',phase(t,0,18.5,.2,1.0));
  opacity('evo-score-concept',phase(t,3.0,18.4,.5,.7));
  opacity('evo-population-caption',Math.max(phase(t,17.5,48.3,.6,.6),phase(t,158.6,187,.6,.7)));
  opacity('evo-natural',phase(t,65.8,159.6,.9,.85));
  opacity('evo-nature-overlay',phase(t,65.8,159.5,.8,.8));
  opacity('evo-algorithm-copy',phase(t,158.2,187.2,.65,.65));
  opacity('evo-morph-dots',phase(t,155.5,165.8,.5,.5));
  opacity('evo-snake-intro',phase(t,186.3,210,.85,.7));
  opacity('evo-snake-system-labels',phase(t,188.4,207,.55,.55));
  opacity('evo-snake-inputs',phase(t,189.0,205.5,.5,.6));
  opacity('evo-snake-actions',phase(t,196.8,210.5,.4,.6));
  opacity('evo-copy-mutation',phase(t,230.8,256.0,.45,.7));
  opacity('evo-structural-mutation',phase(t,246.0,252.0,.35,.7));
  opacity('evo-generation-loop',phase(t,252.4,286.5,.6,.8));
  opacity('evo-fitness-note',phase(t,219.0,235.0,.5,.6));
  opacity('evo-many-boards',phase(t,267.0,286.5,.45,.5));
  opacity('evo-human-score',phase(t,286.5,298.0,.5,.6));
  opacity('evo-comparison',phase(t,297.2,335.0,.65,.75));
  opacity('evo-outro',phase(t,334.3,372.0,.75,.65));
  opacity('evo-outro-summary',phase(t,334.3,353.7,.55,.6));
  opacity('evo-outro-question',phase(t,352.6,372.0,.65,.6));
  opacity('evo-outro-prompts',phase(t,353.4,366.8,.65,.55));
  opacity('evo-outro-limits',phase(t,363.9,372.0,.55,.55));
  opacity('evo-outro-next',phase(t,365.9,372.0,.4,.4));
  opacity('evo-cta',phase(t,365.8,372.1,.35,.2));
  updatePopulation(t);updateMoths(t);updateSnakeIntro(t);
  const loopCount=Math.min(12,Math.max(1,Math.floor(Math.max(0,t-253.0)/8.1)+1));
  text('evo-generation-count',`GENERATION ${String(loopCount).padStart(2,'0')}`);
  const bestLine=el('evo-best-line');if(bestLine){const progress=smooth(253,292,t);attr(bestLine,'stroke-dashoffset',String(780*(1-progress)));}
  const prompts=['EXPLAIN','COMPARE','WRITE','PLAN'];
  prompts.forEach((label,i)=>{const card=el(`evo-prompt-${i}`);if(!card)return;const a=t*1.1+i*Math.PI/2;attr(card,'transform',`translate(${Math.cos(a)*10} ${Math.sin(a)*13})`);});
  const signal=document.querySelector('.evo-bridge-signal');if(signal)signal.style.transform=`translateX(${(t*4.6)%20}cqw)`;
  const orbit=el('evo-population-caption')?.querySelector('.evo-orbit-dot');if(orbit)orbit.style.transform=`scale(${(.84+.22*Math.sin(t*4.2)).toFixed(3)})`;
  document.querySelectorAll('#evo-outro-network i').forEach((dot,i)=>{dot.style.transform=`translateY(${(Math.sin(t*1.7+i*1.3)*.45).toFixed(2)}cqw)`;});
  document.querySelectorAll('#evo-morph-dots circle').forEach((dot,i)=>{dot.style.transform=`translate(${(Math.sin(t*2.2+i)*9).toFixed(2)}px ${(Math.cos(t*1.8+i*.8)*11).toFixed(2)}px)`;});
  if(t<3.5)return 'FROM LABELS TO SCORES';
  if(t<17.5)return 'WHEN THE RIGHT MOVE IS HARD TO LABEL';
  if(t<48.5)return 'A POPULATION OF CANDIDATE NETWORKS';
  if(t<66.0)return 'SELECTION AND MUTATION · A BIOLOGICAL ANALOGY';
  if(t<89.5)return 'PEPPERED MOTHS · VARIATION IN A POPULATION';
  if(t<105.8)return 'THE ENVIRONMENT CHANGES THE ADVANTAGE';
  if(t<133.7)return 'INHERITED VARIATION · POPULATION SHIFTS';
  if(t<138.0)return 'SELECTION ACTS ACROSS GENERATIONS';
  if(t<159.5)return 'EXTINCTION · NOT EVERY LINEAGE SURVIVES';
  if(t<186.3)return 'NETWORKS ARE SCORED · BETTER CANDIDATES ARE COPIED';
  if(t<196.8)return 'SNAKE · BOARD STATE INTO A NETWORK';
  if(t<205.5)return 'ACTION SCORES · STRAIGHT · LEFT · RIGHT';
  if(t<219.0)return 'MANY NETWORKS · MANY TRIALS';
  if(t<230.8)return 'FITNESS SCORE · APPLES UP · CRASHES DOWN';
  if(t<238.3)return 'SELECT HIGHER-SCORING CANDIDATES';
  if(t<252.0)return 'COPY WEIGHTS · MUTATE A FEW';
  if(t<267.0)return 'REPEAT · SCORE · SELECT · MUTATE';
  if(t<286.5)return 'A GENERATION IS ONE ROUND OF EVALUATION';
  if(t<297.2)return 'THE GAME DESIGNER CHOOSES WHAT “BETTER” MEANS';
  if(t<334.3)return 'SUPERVISED TARGETS OR WHOLE-CANDIDATE SCORES';
  if(t<353.7)return 'A DEFINED TASK · REPEATED TRIALS';
  if(t<357.7)return 'ONE MODEL · MANY KINDS OF REQUESTS';
  if(t<364.7)return 'HOW CAN IT APPEAR TO UNDERSTAND, REASON, OR PLAN?';
  if(t<366.6)return 'WHERE ARE THE LIMITS?';
  if(t<371.8)return 'NEXT · LANGUAGE MODELS';
  return 'LIKE · SUBSCRIBE';
}
export {updateChapterFive};
