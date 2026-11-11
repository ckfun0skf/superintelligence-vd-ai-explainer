const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,p)=>a+(b-a)*p;
const smooth=(a,b,t)=>{const p=clamp((t-a)/(b-a));return p*p*(3-2*p);};
const phase=(t,a,b,fi=.35,fo=.4)=>clamp((t-a)/Math.max(.001,fi))*(1-clamp((t-(b-fo))/Math.max(.001,fo)));
const opacity=(id,v)=>{const e=document.getElementById(id);if(!e)return;const p=clamp(v);e.style.opacity=p.toFixed(4);e.style.visibility=p>.008?'visible':'hidden';};
const text=(id,v)=>{const e=document.getElementById(id);if(e&&e.textContent!==String(v))e.textContent=String(v);};
const dash=(id,v)=>{const e=document.getElementById(id);if(e)e.style.strokeDashoffset=String(v);};
const fill=(id,v)=>{const e=document.getElementById(id);if(e)e.style.transform=`scaleX(${clamp(v)})`;};

/** Absolute-time renderer for the second chapter (local time in its own narration clip). */
export function updateChapterTwo(t){
  const stage=document.getElementById('chapter2-stage');
  opacity('chapter2-stage',smooth(0,.42,t));
  opacity('beat-indicator',0);

  // Chapter 1's exact terminal frame remains underneath: same swatch, 0.8 signal and neuron.
  opacity('handoff-label',1-smooth(0,.85,t));
  const neuronLabel=document.querySelector('#handoff-neuron span');
  const calc=smooth(40.3,43.5,t);
  if(neuronLabel){neuronLabel.textContent='Σ';neuronLabel.style.opacity=calc.toFixed(4);neuronLabel.style.visibility=calc>.008?'visible':'hidden';}
  opacity('handoff-number',1-smooth(39.8,43.2,t));
  opacity('incoming-swatch',1-smooth(165.4,167.5,t));

  opacity('c2-task',phase(t,3.7,170,.6,.55));
  opacity('c2-normalize',phase(t,14.0,31.6,.55,.55));
  opacity('c2-channels',phase(t,8.0,166.8,.65,.6));
  opacity('c2-wires',phase(t,35.8,166.8,.6,.65));
  opacity('c2-weights',phase(t,45.0,94.8,.65,.65));
  opacity('c2-equation',phase(t,59.9,96.4,.65,.65));
  opacity('c2-bias-row',phase(t,68.5,96.4,.45,.6));
  opacity('c2-sigmoid',phase(t,94.8,167.0,.6,.65));
  opacity('c2-probabilities',phase(t,109.8,166.4,.65,.65));
  opacity('c2-example-note',phase(t,124.2,160.8,.45,.6));
  // The patch and connected nodes are the carried objects at the Chapter 3 handoff.
  opacity('c2-pixels',smooth(165.8,166.4,t));
  opacity('c2-next-network',smooth(169.0,170.0,t));

  // A channel first has a familiar 0–255 range, then the same position is rescaled to 0–1.
  const rawP=smooth(23.1,27.5,t);
  text('c2-raw-value',t>=23.1?'204':'0–255');
  text('c2-raw-denom',t>=23.1?'/ 255':'');
  text('c2-normal-value',t>=23.1?'0.8':'0–1');
  fill('c2-range-fill',.8*rawP);

  const dark=smooth(129.9,134.3,t);
  ['r','g','b'].forEach((c,i)=>{
    const lightReveal=31.24+i*1.5;
    const channelValue=t>=133.24+i*1.15?'0.2':(t<14?'':(t<lightReveal?'0–255':'0.8'));
    text(`c2-value-${c}`,channelValue);
    fill(`c2-bar-${c}`,t<28.6?0:mix(.8,.2,dark));
    const row=document.querySelector(`.c2-channel[data-channel="${c}"]`);
    if(row){const active=clamp((t-(36.65+i*.34))/.34)*(1-smooth(39.4+i*.34,40.6+i*.34,t));row.style.setProperty('--active',active.toFixed(3));}
  });

  // Three independent weights remain visibly attached to their matching RGB channels.
  const dialP=smooth(52.7,59.7,t);
  ['r','g','b'].forEach((c,i)=>{
    const dial=document.getElementById(`c2-dial-${c}`);
    if(dial)dial.style.transform=`rotate(${[-32,18,43][i]*dialP}deg)`;
    text(`c2-weight-${c}`,t>=56.1?'× 1.0':'× ?');
  });

  // The running weighted sum and bias are separate stages; bias is not a fourth channel.
  const isDark=dark>.5;
  const scoreDark=smooth(137.1,143.5,t);
  const resultDark=smooth(143.5,145.8,t);
  const val=isDark?'.2':'0.8';
  text('c2-term-r',`${val} × 1`);text('c2-term-g',`${val} × 1`);text('c2-term-b',`${val} × 1`);
  text('c2-sum-total',isDark?'0.6':'2.4');
  text('c2-score',scoreDark>.5?'−0.9':'0.9');
  text('c2-score-value',scoreDark>.5?'−0.9':'0.9');

  // Keep the same swatch object and change only its color for the second example.
  const swatch=document.querySelector('#incoming-swatch span');
  if(swatch){
    const gray=Math.round(184-112*dark);
    swatch.style.background=`linear-gradient(140deg,rgb(${gray+18},${gray+18},${gray+18}),rgb(${gray-28},${gray-28},${gray-28}))`;
  }

  // Sigmoid is shown as a soft gate, not an equation. Its point moves to the matching side.
  const curve=document.querySelector('.c2-sigmoid-curve');
  if(curve)curve.style.strokeDashoffset=String(500*(1-smooth(96.0,107.2,t)));
  const dot=document.getElementById('c2-sigmoid-dot');
  const darkDot=smooth(143.5,145.8,t);
  if(dot){dot.setAttribute('cx',mix(229,131,darkDot).toFixed(1));dot.setAttribute('cy',mix(55,135,darkDot).toFixed(1));}
  const light = mix(.71,.29,resultDark), darkP = mix(.29,.71,resultDark);
  fill('c2-light-fill',light);fill('c2-dark-fill',darkP);
  text('c2-light-pct',`${Math.round(light*100)}%`);text('c2-dark-pct',`${Math.round(darkP*100)}%`);
  ['c2-wire-r','c2-wire-g','c2-wire-b'].forEach((id,i)=>dash(id,-t*34-i*19));

  // Turn one input swatch into a small patch while the same central unit remains in place.
  const pixels=document.querySelectorAll('#c2-pixels i');
  pixels.forEach((tile,i)=>{
    const base=isDark?64:190, shade=base+((i%3)-1)*13+((Math.floor(i/3)%3)-1)*8;
    tile.style.background=`rgb(${shade},${shade},${shade})`;
  });

  const next=document.getElementById('c2-next-network');
  if(next){
    next.querySelectorAll('path').forEach((p,i)=>{p.style.strokeDashoffset=String(-t*26-i*12);});
  }

  // Time-coded review cue follows the actual clip, not wall-clock animation state.
  let cue='THE RGB INPUT';
  if(t<8.2)cue='ONE COLOR · LIGHT OR DARK';
  else if(t<31)cue='THREE CHANNELS · R · G · B';
  else if(t<45)cue='ONE ARTIFICIAL NEURON';
  else if(t<60)cue='ADJUSTABLE WEIGHTS';
  else if(t<92)cue='ADD THE WEIGHTED VALUES · THEN BIAS';
  else if(t<130)cue='SCORE → SIGMOID → PROBABILITY';
  else if(t<162)cue='SAME NEURON · DARKER INPUT';
  else cue='ONE UNIT · READY TO CONNECT';
  return cue;
}
