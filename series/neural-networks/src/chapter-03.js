const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,p)=>a+(b-a)*clamp(p);
const smooth=(a,b,t)=>{const p=clamp((t-a)/(b-a));return p*p*(3-2*p);};
const phase=(t,a,b,fi=.35,fo=.4)=>clamp((t-a)/Math.max(.001,fi))*(1-clamp((t-(b-fo))/Math.max(.001,fo)));
const opacity=(id,v)=>{const e=document.getElementById(id);if(!e)return;const p=clamp(v);e.style.opacity=p.toFixed(4);e.style.visibility=p>.008?'visible':'hidden';};
const text=(id,v)=>{const e=document.getElementById(id);if(e&&e.textContent!==String(v))e.textContent=String(v);};
const dash=(id,v)=>{const e=document.getElementById(id);if(e)e.style.strokeDashoffset=String(v);};

/** Chapter 3 renderer. Local seconds are derived only from the selected narration clip. */
export function updateChapterThree(t){
  opacity('chapter3-stage',smooth(0,.38,t));

  // Continue the exact 3×3 patch, central neuron, and downstream SVG nodes from Chapter 2.
  const networkBuild=smooth(15.2,19.1,t);
  const neuron=document.getElementById('handoff-neuron');
  if(neuron)neuron.style.scale=mix(1,.46,networkBuild).toFixed(4);
  opacity('c3-extra-nodes',networkBuild);
  opacity('c3-extra-links',smooth(5.2,6.3,t));
  opacity('c3-input-single',smooth(5.2,6.3,t));
  opacity('c3-input-edges',networkBuild);
  opacity('c3-hidden-edges',networkBuild);
  opacity('c3-hidden-zone',smooth(15.2,19.2,t));
  opacity('c3-graph-labels',smooth(15.2,19.2,t));
  opacity('c3-input-chip',phase(t,3.8,18.6,.5,.7));

  // Keep the pixel patch itself; vary only its nine cells for the stripe/plain toy task.
  const stripe=smooth(61.25,63.2,t)*(1-smooth(71.2,73.0,t));
  const plain=smooth(71.25,73.3,t);
  const tiles=[...document.querySelectorAll('#c2-pixels i')];
  tiles.forEach((tile,i)=>{
    const row=Math.floor(i/3),col=i%3;
    const original=64+(col-1)*13+(row-1)*8;
    const textured=95+((i*37)%95);
    const stripeValue=col===1?224:54;
    const stripeRow=stripeValue+(row-1)*6;
    const plainValue=150;
    let gray=mix(original,textured,smooth(0,5.8,t));
    gray=mix(gray,stripeRow,stripe);
    gray=mix(gray,plainValue,plain);
    const v=Math.round(gray);
    tile.style.background=`rgb(${v},${v},${v})`;
    tile.style.borderColor=`rgb(${Math.min(255,v+42)},${Math.min(255,v+42)},${Math.min(255,v+42)})`;
  });

  // Signals in the same units pulse differently; no unit is assigned a permanent human-readable job.
  const toyP=phase(t,61.25,85.45,.45,.7);
  const response=toyP*(.42+.58*(.5+.5*Math.sin(t*5.2)));
  const oldNodes=[...document.querySelectorAll('.c2-next-nodes circle')];
  oldNodes.forEach((node,i)=>{
    const offset=i===3?.7:i*.63;
    const intensity=.42+response*(.28+.3*(.5+.5*Math.sin(t*3.1+offset)));
    node.style.stroke=intensity>.74?'#ffc776':'#91f2d2';
    node.style.filter=`drop-shadow(0 0 ${5+intensity*9}px ${intensity>.74?'#ffc77688':'#91f2d277'})`;
  });
  const addedNodes=[...document.querySelectorAll('#c3-extra-nodes circle')];
  addedNodes.forEach((node,i)=>{
    const intensity=.45+response*(.3+.25*(.5+.5*Math.sin(t*3.7+i*1.9)));
    node.style.stroke=intensity>.74?'#ffc776':'#91f2d2';
    node.style.filter=`drop-shadow(0 0 ${5+intensity*8}px ${intensity>.74?'#ffc77688':'#91f2d277'})`;
  });
  [...document.querySelectorAll('#c3-extra-links path')].forEach((path,i)=>{path.style.strokeDashoffset=String(-t*32-i*15);});
  [...document.querySelectorAll('#c2-next-network path')].forEach((path,i)=>{path.style.strokeDashoffset=String(-t*29-i*13);});
  // A pair of particles makes the handoff between layer stages visible, not just implied by dashed lines.
  const flowPaths=[...document.querySelectorAll('#c2-next-network g:first-child path')];
  const flowWindow=phase(t,32.45,61.25,.35,.65);
  [['c3-flow-a',0,0],['c3-flow-b',3,.72]].forEach(([id,pathIndex,delay])=>{
    const dot=document.getElementById(id),path=flowPaths[pathIndex];
    if(!dot||!path||!flowWindow){if(dot)dot.style.opacity='0';return;}
    const u=((((t-32.45-delay)*.62)%1)+1)%1;
    const point=path.getPointAtLength(path.getTotalLength()*u);
    dot.setAttribute('cx',point.x.toFixed(2));dot.setAttribute('cy',point.y.toFixed(2));
    dot.style.opacity=String(flowWindow);
  });

  // One illustrative output follows the same small network from stripes to a plain patch.
  const stripeOut=phase(t,67.0,72.8,.3,.45);
  const plainOut=phase(t,75.0,85.45,.35,.55);
  const resultOpacity=Math.max(stripeOut,plainOut);
  opacity('c3-result',resultOpacity);
  text('c3-result-text',t<73.0?'STRIPE':'PLAIN');
  opacity('c3-toy-tag',toyP);

  // Focus on one straight split, then let the same point groups form a more flexible boundary.
  const plotP=phase(t,85.75,125.55,.8,.75);
  opacity('c3-boundary-stage',plotP);
  const backgroundNetwork=1-.82*plotP;
  opacity('c2-pixels',backgroundNetwork);
  opacity('c2-next-network',backgroundNetwork);
  opacity('c3-extra-nodes',networkBuild*backgroundNetwork);
  opacity('c3-extra-links',smooth(5.2,6.3,t)*backgroundNetwork);
  opacity('c3-input-single',smooth(5.2,6.3,t)*backgroundNetwork);
  opacity('c3-input-edges',networkBuild*backgroundNetwork);
  opacity('c3-hidden-edges',networkBuild*backgroundNetwork);
  opacity('c3-hidden-zone',smooth(15.2,19.2,t)*backgroundNetwork);
  opacity('c3-graph-labels',smooth(15.2,19.2,t)*backgroundNetwork);
  opacity('c3-input-chip',phase(t,3.8,18.6,.5,.7)*(1-.82*plotP));
  opacity('c3-result',resultOpacity*(1-.82*plotP));
  opacity('c3-toy-tag',toyP*(1-.82*plotP));
  const complex=smooth(116.8,119.15,t);
  opacity('c3-simple-cloud',1-complex);
  opacity('c3-complex-cloud',complex);
  const activation=smooth(99.65,103.7,t);
  opacity('c3-activation-chip',phase(t,99.65,125.3,.45,.65));
  const curveProgress=smooth(121.1,124.5,t);
  dash('c3-flex-boundary',620*(1-curveProgress));
  const flexibleBoundary=document.getElementById('c3-flex-boundary');
  if(flexibleBoundary)flexibleBoundary.style.fillOpacity=curveProgress.toFixed(4);
  opacity('c3-straight-boundary',1-smooth(120.1,121.8,t));
  const caption=t<116.8?'ONE LINE CAN SPLIT A SIMPLE PATTERN':t<121.1?'ONE STRAIGHT LINE MISSES PARTS OF THIS PATTERN':'MULTIPLE STAGES FORM A MORE FLEXIBLE BOUNDARY';
  text('c3-boundary-caption',caption);
  const gate=document.getElementById('c3-activation-chip');
  if(gate)gate.style.scale=String(.92+.08*(.5+.5*Math.sin(t*4.5))*activation);
  const activationDot=document.getElementById('c3-activation-dot');
  if(activationDot){
    const u=(((t-99.65)%2.4)+2.4)%2.4/2.4;
    const x=3+94*u;
    const q=clamp((x-23)/51);
    const y=x<23?39:x>74?8:39-31*q*q*(3-2*q);
    activationDot.setAttribute('cx',x.toFixed(2));
    activationDot.setAttribute('cy',y.toFixed(2));
  }

  // Return to the very same network and make its adjustable values the bridge to training.
  const ready=smooth(132.68,136.0,t);
  opacity('c3-training-ready',ready);
  const readyLabel=document.getElementById('c3-training-label');
  if(readyLabel)readyLabel.style.opacity=smooth(138.8,140.2,t).toFixed(4);
  const dials=[...document.querySelectorAll('.c3-ready-dial i')];
  dials.forEach((dial,i)=>{dial.style.rotate=`${mix(-28,22*Math.sin(t*2.3+i),ready).toFixed(1)}deg`;});

  if(t<15.2)return 'PIXELS → MANY INPUT VALUES';
  if(t<32.45)return 'A LAYER · UNITS AT THE SAME STAGE';
  if(t<61.25)return 'ONE LAYER’S OUTPUT → THE NEXT';
  if(t<85.75)return 'TOY TASK · STRIPE OR PLAIN';
  if(t<99.65)return 'STACKING LINEAR CALCULATIONS';
  if(t<107.4)return 'ACTIVATION CHANGES THE COMBINATION';
  if(t<125.55)return 'ONE LINE → A FLEXIBLE BOUNDARY';
  return 'MORE STAGES · STILL NEED TRAINING';
}
