const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,p)=>a+(b-a)*clamp(p);
const smooth=(a,b,t)=>{const p=clamp((t-a)/(b-a));return p*p*(3-2*p);};
const phase=(t,a,b,fi=.35,fo=.4)=>clamp((t-a)/Math.max(.001,fi))*(1-clamp((t-(b-fo))/Math.max(.001,fo)));
const opacity=(id,v)=>{const e=document.getElementById(id);if(!e)return;const p=clamp(v);e.style.opacity=p.toFixed(4);e.style.visibility=p>.008?'visible':'hidden';};
const text=(id,v)=>{const e=document.getElementById(id);if(e&&e.textContent!==String(v))e.textContent=String(v);};
const fill=(id,v)=>{const e=document.getElementById(id);if(e)e.style.transform=`scaleX(${clamp(v)})`;};
const fract=n=>n-Math.floor(n);

/** Chapter 4 renderer. Every visual value is derived from active chapter audio time. */
export function updateChapterFour(t){
  opacity('chapter4-stage',smooth(0,.42,t));

  // The exact Chapter 2 pixel-patch element remains the active training input.
  const tiles=[...document.querySelectorAll('#c2-pixels i')];
  const sampleSwitch=smooth(217.0,223.0,t);
  const heldout=smooth(249,253,t);
  tiles.forEach((tile,i)=>{
    const row=Math.floor(i/3),col=i%3;
    const shade=205-((i*7+row*4+col*3)%20);
    const darkRGB=[mix(shade,28,sampleSwitch),mix(shade,62,sampleSwitch),mix(shade,116,sampleSwitch)];
    const testRGB=[mix(darkRGB[0],43,heldout),mix(darkRGB[1],113,heldout),mix(darkRGB[2],173,heldout)];
    const rgb=testRGB.map(Math.round);
    tile.style.background=`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    tile.style.borderColor=`rgb(${Math.min(255,rgb[0]+38)},${Math.min(255,rgb[1]+38)},${Math.min(255,rgb[2]+38)})`;
  });

  // A labelled set stays outside the model; only the selected color enters the network.
  opacity('c4-dataset',phase(t,15.2,68.2,.8,1.05));
  opacity('c4-sample-light',smooth(30.3,31.8,t)*(1-smooth(66.0,68.0,t)));
  opacity('c4-sample-dark',smooth(36.3,37.8,t)*(1-smooth(66.0,68.0,t)));
  const selected=smooth(65.0,68.0,t)*(1-smooth(75.0,78.0,t));
  opacity('c4-active-ring',selected);
  const ring=document.getElementById('c4-active-ring');
  if(ring)ring.style.transform=`scale(${.94+.06*(.5+.5*Math.sin(t*3.1))})`;
  const ringLabel=ring?.querySelector('span');if(ringLabel)ringLabel.textContent='ONE EXAMPLE IN';
  opacity('c4-rule-note',phase(t,47.2,65.0,.55,.7));
  const conflict=smooth(130.1,133.0,t);
  opacity('c4-quality-note',phase(t,126.5,141.0,.5,.65));
  const quality=document.getElementById('c4-quality-note');
  if(quality){quality.classList.toggle('is-conflicted',conflict>.5);}
  text('c4-quality-state',conflict>.5?'ONE COLOR · TWO LABELS':'MISSING EXAMPLES LEAVE GAPS');

  // The forward input pulse follows the existing path and reuses the Chapter 3 network.
  const inputPath=document.querySelector('#c3-input-single path');
  const networkPaths=[...document.querySelectorAll('#c2-next-network g:first-child path')];
  const dots=['c3-flow-a','c3-flow-b'].map(id=>document.getElementById(id));
  const inputWindow=phase(t,64.7,87.4,.25,.55);
  const backWindow=phase(t,149.4,190.4,.45,.6);
  const repeatWindow=phase(t,217.2,248.8,.6,.8);
  const testWindow=phase(t,250.0,270.0,.35,.45);
  dots.forEach((dot,i)=>{
    if(!dot)return;
    let path=null,u=0,back=false,alpha=0;
    if(backWindow){
      const local=clamp((t-149.4-i*.7)/14.2);
      path=networkPaths[i===0?5:0];u=1-local;back=true;alpha=backWindow;
    }else if(inputWindow){
      path=inputPath;u=fract((t-64.7)/4.4+i*.42);alpha=inputWindow;
    }else if(repeatWindow){
      path=networkPaths[i===0?0:3];u=fract((t-217.2)/3.4+i*.47);alpha=repeatWindow;
    }else if(testWindow){
      path=inputPath;u=fract((t-250.0)/4.6+i*.4);alpha=testWindow;
    }
    if(path&&alpha>.008){
      const point=path.getPointAtLength(path.getTotalLength()*u);
      dot.setAttribute('cx',point.x.toFixed(2));dot.setAttribute('cy',point.y.toFixed(2));
      dot.style.opacity=String(alpha);
      dot.style.fill=back?'#ffc776':'#72c8ff';
      dot.style.filter=`drop-shadow(0 0 11px ${back?'#ffc776':'#72c8ff'})`;
    }else dot.style.opacity='0';
  });
  const backwardOffset=backWindow>0?1:0;
  networkPaths.forEach((path,i)=>{
    path.style.stroke=backwardOffset&&[0,3,5].includes(i)?'#ffc776':'';
    path.style.filter=backwardOffset&&[0,3,5].includes(i)?'drop-shadow(0 0 8px #ffc77688)':'';
  });

  // Prediction is deliberately wrong first; the target arrives separately and meets it at a comparator.
  const updateP=smooth(190.3,195.0,t);
  const updateWindow=phase(t,190.3,217.6,.55,.8);
  const predictionP=Math.max(phase(t,76.7,111.2,.45,.55),updateWindow);
  opacity('c4-prediction-card',predictionP);
  const answerP=Math.max(smooth(87.45,89.0,t)*(1-smooth(111.0,113.0,t)),updateWindow);
  opacity('c4-target-card',answerP);
  opacity('c4-target-wire',Math.max(phase(t,88.2,111.0,.35,.6),updateWindow));
  const targetPath=document.getElementById('c4-target-path');
  const targetDot=document.getElementById('c4-target-dot');
  const targetTravel=smooth(88.2,101.0,t);
  if(targetPath)targetPath.style.strokeDashoffset=String(-t*26);
  if(targetPath&&targetDot){const point=targetPath.getPointAtLength(targetPath.getTotalLength()*targetTravel);targetDot.setAttribute('cx',point.x.toFixed(2));targetDot.setAttribute('cy',point.y.toFixed(2));}
  const lossP=phase(t,96.8,141.3,.5,.8);
  opacity('c4-loss-card',lossP);
  opacity('c4-update-card',updateWindow);
  const lightProb=mix(.20,.31,updateP);
  fill('c4-light-fill',lightProb);
  fill('c4-dark-fill',1-lightProb);
  text('c4-light-value',`${Math.round(lightProb*100)}%`);
  text('c4-dark-value',`${Math.round((1-lightProb)*100)}%`);
  const lossLevel=mix(.88,.35,updateP);
  fill('c4-loss-fill',lossLevel);
  fill('c4-update-loss-fill',lossLevel);
  text('c4-loss-level',updateP>.8?'LOWER AFTER UPDATE':'HIGH · THIS EXAMPLE');
  text('c4-prediction-state',updateP>.8?'SAME NETWORK · UPDATED':'FIRST GUESS');
  opacity('c4-not-iq',phase(t,102.9,120.0,.45,.6));
  opacity('c4-supervised-note',phase(t,112.0,139.0,.5,.7));

  // Backpropagation makes the existing network trace effects from output back to earlier weights.
  const questionWindow=phase(t,142.6,149.4,.35,.35);
  opacity('c4-backprop-label',Math.max(questionWindow,backWindow));
  text('c4-backprop-word',t<149.4?'WHICH WEIGHTS MATTERED?':'BACKPROPAGATION');
  text('c4-backprop-copy',t<149.4?'Which small change might lower the error?':'Trace the mismatch back through the same network.');
  opacity('c4-gradient-card',phase(t,176.7,191.2,.45,.7));
  opacity('c4-chain-note',phase(t,161.6,178.0,.45,.55));
  const dialProgress=smooth(149.2,189.0,t);
  const randomWindow=phase(t,64.8,76.9,.35,.5);
  const weightsVisible=Math.max(1-smooth(10.5,16.0,t),backWindow*.94,randomWindow*.95);
  opacity('c3-training-ready',weightsVisible);
  text('c3-training-label',t>=64.8&&t<76.9?'INITIAL SETTINGS':t<149.2?'STILL NEED TRAINING':'ADJUSTING WEIGHTS');
  [...document.querySelectorAll('.c3-ready-dial i')].forEach((dial,i)=>{
    const base=22*Math.sin(141*2.3+i);
    const end=base+[16,-12,10][i];
    dial.style.rotate=`${mix(base,end,dialProgress).toFixed(1)}deg`;
    dial.style.filter=backWindow?`drop-shadow(0 0 8px #ffc776${i===1?'aa':'88'})`:'';
  });

  // Small updates, then repeated predict/compare/update cycles across multiple examples.
  opacity('c4-loop-card',phase(t,216.6,251.0,.7,.8));
  const step=((Math.floor(Math.max(0,t-217.0)/1.2)%3)+3)%3;
  ['c4-step-predict','c4-step-compare','c4-step-update'].forEach((id,i)=>{
    const e=document.getElementById(id);if(!e)return;
    e.classList.toggle('is-active',repeatWindow>0&&step===i);
  });
  const loopTurn=Math.floor(Math.max(0,t-217.0)/3.6);
  text('c4-loop-count',`${Math.min(24,Math.max(1,loopTurn+1))} EXAMPLES`);
  opacity('c4-batch-stack',phase(t,232.0,248.5,.45,.7));
  opacity('c4-practice-check',phase(t,248.0,271.0,.5,.7));
  const checkDot=document.getElementById('c4-heldout-dot');
  if(checkDot){checkDot.style.transform=`translateX(${smooth(251.0,264.0,t)*3.2}cqw)`;}
  opacity('c4-generalization-note',phase(t,263.2,271.0,.4,.6));

  // A brief text-only target preview: no tokenization or LLM explanation yet.
  opacity('c4-task-targets',phase(t,270.4,285.9,.45,.45));
  const textP=phase(t,285.5,299.5,.55,.45);
  opacity('c4-text-target',textP);
  const reveal=smooth(285.6,288.0,t);
  opacity('c4-next-word',reveal);
  opacity('c4-next-word-wire',phase(t,285.5,290.0,.25,.5));
  opacity('c4-no-written-label',phase(t,290.0,299.5,.4,.5));
  const wordPath=document.querySelector('#c4-next-word-wire path');
  const wordDot=document.getElementById('c4-word-dot');
  if(wordPath&&wordDot){const point=wordPath.getPointAtLength(wordPath.getTotalLength()*smooth(285.4,288.6,t));wordDot.setAttribute('cx',point.x.toFixed(2));wordDot.setAttribute('cy',point.y.toFixed(2));wordPath.style.strokeDashoffset=String(-t*18);}

  if(t<15.2)return 'SAME NETWORK · TRAINING EXAMPLES';
  if(t<47.2)return 'INPUT SWATCHES · SUPPLIED LABELS';
  if(t<64.7)return 'THE NETWORK SEES EXAMPLES · NOT THE RULE';
  if(t<76.7)return 'INITIAL WEIGHTS · FIRST INPUT';
  if(t<87.45)return 'FIRST PREDICTION · NOT YET TRAINED';
  if(t<96.8)return 'SUPPLIED ANSWER · COMPARE';
  if(t<107.0)return 'TASK LOSS · THIS EXAMPLE ONLY';
  if(t<112.0)return 'LOSS IS TASK-SPECIFIC';
  if(t<107.0)return 'TASK LOSS · THIS EXAMPLE ONLY';
  if(t<112.0)return 'LOSS IS TASK-SPECIFIC';
  if(t<126.7)return 'SUPERVISED TRAINING · GIVEN ANSWER';
  if(t<142.6)return 'EXAMPLE QUALITY · COVERAGE MATTERS';
  if(t<149.4)return 'WHICH WEIGHTS MATTERED?';
  if(t<161.6)return 'BACKPROPAGATION · TRACE BACK';
  if(t<176.7)return 'CHAIN RULE · TRACK CONTRIBUTION';
  if(t<190.3)return 'GRADIENTS · DIRECTION OF CHANGE';
  if(t<216.6)return 'OPTIMIZER · SMALL UPDATE';
  if(t<248.0)return 'PREDICT → COMPARE → UPDATE';
  if(t<270.4)return 'PRACTICE SET → HELD-OUT CHECK';
  if(t<285.5)return 'THE TASK DEFINES THE TARGET';
  return 'THE NEXT WORD CAN BE THE TARGET';
}
