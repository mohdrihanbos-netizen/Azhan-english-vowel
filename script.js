'use strict';
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[Math.random()*a.length|0];
const USE_FILES=false; // set true after adding mp3 files to assets/audio (see README)
const IGLOO='<svg viewBox="0 0 100 80" role="img" aria-label="igloo"><path d="M8 70a42 42 0 0 1 84 0z" fill="#e8f6ff" stroke="#6fa8c8" stroke-width="3"/><path d="M40 70V58a10 10 0 0 1 20 0v12z" fill="#35577a"/><path d="M16 52h68M28 36h44M50 28v8M32 52v-16M68 52v-16" stroke="#9cc6de" stroke-width="2"/></svg>';
const UNDER='<svg viewBox="0 0 100 80" role="img" aria-label="a ball under a table"><rect x="8" y="14" width="84" height="10" rx="3" fill="#b5651d"/><rect x="16" y="24" width="8" height="48" fill="#8a4a12"/><rect x="76" y="24" width="8" height="48" fill="#8a4a12"/><circle cx="50" cy="60" r="11" fill="#ff4d6d"/><path d="M42 56q8-6 16 0" stroke="#fff" stroke-width="2" fill="none"/></svg>';
const W=[
{w:'Ink',v:'I',e:'🖋️',s:'I write with ink.',m:'_nk'},
{w:'Insect',v:'I',e:'🐞',s:'An insect sits on a leaf.',m:'_nsect'},
{w:'Igloo',v:'I',svg:IGLOO,s:'An igloo is a house of ice.',m:'_gloo'},
{w:'Ox',v:'O',e:'🐂',s:'The ox is big and strong.',m:'_x'},
{w:'Octopus',v:'O',e:'🐙',s:'An octopus has eight arms.',m:'_ctopus'},
{w:'Orange',v:'O',e:'🍊',s:'I eat a juicy orange.',m:'_range'},
{w:'Umbrella',v:'U',e:'☂️',s:'My umbrella keeps me dry.',m:'_mbrella'},
{w:'Up',v:'U',e:'⬆️',s:'Look up at the stars!',m:'_p'},
{w:'Under',v:'U',svg:UNDER,s:'The ball is under the table.',m:'_nder'}];
const VW={I:{n:'eye',say:'ihh',ph:'ih'},O:{n:'oh',say:'ahh',ph:'o (as in ox)'},U:{n:'you',say:'uhh',ph:'uh'}};
const pic=x=>x.svg?`<span class="pic">${x.svg}</span>`:`<span class="em" aria-label="${x.w}" role="img">${x.e}</span>`;
const LV=[{n:1,t:'Learn I, O and U',i:'📖'},{n:2,t:'Match pictures',i:'🖼️',g:'A'},{n:3,t:'Hear the sounds',i:'👂',g:'B'},{n:4,t:'Missing letters',i:'🔤',g:'C'},{n:5,t:'Mixed challenge',i:'🚀',g:'mix'}];
const GM=[['A','🖼️','Picture Matching','Pick the word for the picture'],['B','👂','Listen and Choose','Hear a word, pick the picture'],['C','🔤','Find the Vowel','Which vowel is missing?'],['D','🫧','Pop the Bubble','Pop the right vowel bubble'],['E','🧲','Drag and Drop','Drag the vowel to the gap'],['F','⚡','Speed Challenge','Quick questions, friendly timer']];
const STK=['🚀','🪐','🌈','🦄','🐱','🐶','🦋','🌞','🍭','🎈','🐠','🤖'];
const TRO=[['⭐','First Star',s=>s.stars>=1],['🌟','10 Stars',s=>s.stars>=10],['🏅','25 Stars',s=>s.stars>=25],['👑','50 Stars',s=>s.stars>=50],...LV.map(l=>['🏆','Level '+l.n,s=>s.done.includes(l.n)]),['🎓','All Levels',s=>s.done.length>=5]];
const PRAISE=['Amazing!','You did it!','Super star!','Fantastic!','Great job!','Wow!'];
const S0={stars:0,correct:0,total:0,played:0,done:[],seen:[],mute:false,vol:.8,music:true,light:false,rm:false,untimed:false};
let S;try{S={...S0,...JSON.parse(localStorage.getItem('vowelGalaxy')||'{}')}}catch(e){S={...S0}}
const save=()=>{try{localStorage.setItem('vowelGalaxy',JSON.stringify(S))}catch(e){}};
const apply=()=>{document.body.classList.toggle('light',!!S.light);document.body.classList.toggle('rm',!!S.rm)};
if(!localStorage.getItem('vowelGalaxy')&&matchMedia('(prefers-reduced-motion:reduce)').matches)S.rm=true;
let TT,R=null,L={v:'I',k:0};
/* ---------- sound ---------- */
let AC,MG,MI;
function ctx(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.connect(AC.destination)}MG.gain.value=S.mute?0:S.vol;if(AC.state==='suspended')AC.resume();return AC}
function tone(f,d=.12,t=0,type='sine',v=.25){if(S.mute)return;try{const c=ctx(),o=c.createOscillator(),g=c.createGain(),T=c.currentTime+t;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,T);g.gain.exponentialRampToValueAtTime(.001,T+d);o.connect(g);g.connect(MG);o.start(T);o.stop(T+d)}catch(e){}}
const sfx=k=>({click:()=>tone(660,.08),win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.18,i*.09,'triangle')),oops:()=>{tone(330,.15);tone(262,.2,.12)}}[k]||(()=>{}))();
function music(){if(MI)return;MI=setInterval(()=>{if(S.music&&!S.mute&&!document.hidden){const n=[392,440,523,587,659,784];tone(n[Math.random()*6|0],.5,0,'triangle',.06)}},650)}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}
function say(text,key,rate=.8){
  if(S.mute)return;
  const tts=()=>{if(!('speechSynthesis' in window)){toast('🔊 '+text);return}try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=rate;u.volume=S.vol;speechSynthesis.speak(u)}catch(e){toast('🔊 '+text)}};
  if(USE_FILES&&key){try{const a=new Audio('assets/audio/'+key+'.mp3');a.volume=S.vol;a.onerror=tts;a.play().catch(tts);return}catch(e){}}
  tts()}
function confetti(){if(S.rm)return;const c=['#ffe066','#ff7ab8','#7be3ff','#7dff9b','#fff'];for(let i=0;i<44;i++){const d=document.createElement('div');d.className='conf';d.style.cssText=`left:${Math.random()*100}vw;background:${pick(c)};animation-delay:${Math.random()*.6}s;animation-duration:${1.8+Math.random()*1.5}s`;document.body.appendChild(d);setTimeout(()=>d.remove(),4000)}}
/* ---------- helpers ---------- */
const MAS='<svg class="mas" viewBox="0 0 100 100" role="img" aria-label="Zippy the star"><path d="M50 4l12 26 28 3-21 19 6 28-25-14-25 14 6-28L10 33l28-3z" fill="#ffd34d" stroke="#ff9f1c" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="48" r="5" fill="#222"/><circle cx="60" cy="48" r="5" fill="#222"/><circle cx="38" cy="46" r="1.6" fill="#fff"/><circle cx="58" cy="46" r="1.6" fill="#fff"/><path d="M40 62q10 9 20 0" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="32" cy="58" r="4" fill="#ff8fb0" opacity=".7"/><circle cx="68" cy="58" r="4" fill="#ff8fb0" opacity=".7"/></svg>';
const mascot=t=>{const b=$('#bubble');if(b)b.textContent=t};
const view=h=>{clearTimeout(TT);speechSynthesis&&speechSynthesis.cancel&&speechSynthesis.cancel();const a=$('#app');a.style.animation='none';a.offsetWidth;a.style.animation='';a.innerHTML=h;const f=$('#app .btn:not([disabled])');f&&f.focus({preventScroll:true});scrollTo(0,0)};
const bar=()=>`<div class="top"><button class="btn b2" data-a="home" aria-label="Home">🏠 Home</button><div class="card" style="margin:0;padding:6px 16px">⭐ ${S.stars}</div></div>`;
const open=n=>n===1||S.done.includes(n-1);
const acc=()=>S.total?Math.round(S.correct/S.total*100):0;
/* ---------- screens ---------- */
function home(){
  view(`<h1 class="logo">✨ Vowel Galaxy ✨</h1>
  <div class="row">${MAS}<p class="say card" id="bubble">${pick(['Hi! I am Zippy! Let us learn vowels!','Welcome, space explorer!','Ready for a galaxy adventure?'])}</p></div>
  <div class="row"><button class="btn play" data-a="levels">▶ PLAY</button></div>
  <div class="row"><span>Choose a vowel:</span>${['I','O','U'].map(v=>`<button class="btn b2 big" data-a="learn" data-x="${v}" aria-label="Learn the vowel ${v}">${v}</button>`).join('')}</div>
  <div class="grid"><button class="btn b4" data-a="learn" data-x="I">📖 Learn</button><button class="btn" data-a="levels">🗺️ Levels</button><button class="btn b3" data-a="games">🎮 Mini Games</button><button class="btn b2" data-a="rewards">🏆 My Rewards</button><button class="btn b4" data-a="settings">⚙️ Settings</button><button class="btn" data-a="parent">👨‍👩‍👧 Grown-ups</button></div>
  <div class="card"><div class="row" style="justify-content:space-between"><span>⭐ ${S.stars} stars</span><span>✅ Levels ${S.done.length}/5</span></div><div class="pbar" role="progressbar" aria-valuenow="${S.done.length*20}" aria-valuemin="0" aria-valuemax="100"><i style="width:${S.done.length*20}%"></i></div></div>`)}
function levels(){
  view(`${bar()}<h2>🗺️ Choose a level</h2><div class="grid">${LV.map(l=>`<button class="btn ${open(l.n)?(S.done.includes(l.n)?'b4':''):'b2 lock'}" data-a="lv" data-x="${l.n}" ${open(l.n)?'':'disabled'}><div class="big">${open(l.n)?l.i:'🔒'}</div>Level ${l.n}<br><small>${l.t}</small>${S.done.includes(l.n)?'<br>✅':''}</button>`).join('')}</div><p class="ctr">Finish a level to unlock the next one!</p>`)}
function games(){
  view(`${bar()}<h2>🎮 Mini Games</h2><div class="grid">${GM.map(g=>`<button class="btn b${'2343'[g[0].charCodeAt(0)%4]}" data-a="game" data-x="${g[0]}"><div class="big">${g[1]}</div>${g[2]}<br><small>${g[3]}</small></button>`).join('')}</div>
  <div class="row"><button class="btn" data-a="tg" data-x="untimed" aria-pressed="${S.untimed}">${S.untimed?'✅':'⬜'} Speed Challenge: no timer</button></div>`)}
function learn(){
  const ws=W.filter(x=>x.v===L.v),x=ws[L.k],V=VW[L.v];
  if(!S.seen.includes(L.v)){S.seen.push(L.v);if(S.seen.length===3&&!S.done.includes(1)){S.done.push(1);S.stars+=2;confetti();sfx('win');toast('🎉 Level 1 complete! +2 ⭐')}save()}
  view(`${bar()}<div class="row">${['I','O','U'].map(v=>`<button class="btn ${v===L.v?'':'b2'} big" data-a="tab" data-x="${v}" aria-pressed="${v===L.v}" aria-label="Vowel ${v}">${v}</button>`).join('')}</div>
  <div class="card ctr"><div class="row"><div class="letter">${L.v}<small style="font-size:.4em">${L.v.toLowerCase()}</small></div><div>${pic(x)}<div class="word">${x.w[0]==L.v?'<span style="color:#ffe066">'+x.w[0]+'</span>'+x.w.slice(1):x.w}</div></div></div>
  <div class="row"><button class="btn b3" data-a="sw">🔊 Hear the word</button><button class="btn b4" data-a="ss">🔉 Hear the sound</button><button class="btn b2" data-a="sn">🔤 Letter name</button></div>
  <p><b>“${x.s}”</b></p></div>
  <div class="row">${MAS}<p class="say card" id="bubble">The letter name is “${V.n}”, but in <b>${x.w}</b> it makes the short sound “${V.ph}”. Listen: ${x.w}!</p></div>
  <div class="row"><button class="btn" data-a="prev" aria-label="Previous word">⬅️</button><span>${L.k+1} / ${ws.length}</span><button class="btn" data-a="next" aria-label="Next word">➡️</button></div>`);
  setTimeout(()=>say(x.w,'word-'+x.w.toLowerCase()),300)}
function rewards(){
  const stk=Math.floor(S.stars/3);
  view(`${bar()}<h2>🏆 Trophy Room</h2><div class="card shelf">${TRO.map(t=>{const ok=t[2](S);return `<div class="${ok?'':'lock'}"><span>${ok?t[0]:'🔒'}</span><small>${t[1]}</small></div>`}).join('')}</div>
  <h2>🌈 Sticker Book</h2><div class="card shelf">${STK.map((s,i)=>`<div class="${i<stk?'':'lock'}"><span>${i<stk?s:'❔'}</span><small>${i<stk?'Collected!':(i+1)*3+' stars'}</small></div>`).join('')}</div>`)}
function settings(){
  view(`${bar()}<h2>⚙️ Settings</h2><div class="card ctr">
  <div class="row"><button class="btn" data-a="tg" data-x="mute" aria-pressed="${S.mute}">${S.mute?'🔇 Sound off':'🔊 Sound on'}</button><button class="btn b2" data-a="tg" data-x="music" aria-pressed="${S.music}">${S.music?'🎵 Music on':'🎵 Music off'}</button></div>
  <div class="row"><label for="vol">Volume 🔈</label><input id="vol" type="range" min="0" max="1" step="0.1" value="${S.vol}"></div>
  <div class="row"><button class="btn b3" data-a="tg" data-x="light" aria-pressed="${S.light}">${S.light?'☀️ Light theme':'🌙 Dark theme'}</button><button class="btn b4" data-a="tg" data-x="rm" aria-pressed="${S.rm}">${S.rm?'🐢 Calm motion':'🎢 Full motion'}</button></div>
  <div class="row"><button class="btn" data-a="tg" data-x="untimed" aria-pressed="${S.untimed}">${S.untimed?'✅':'⬜'} Speed Challenge: no timer</button></div></div>
  <div class="card"><b>How to play</b><br>1. Tap <b>Play</b> and start with Level 1.<br>2. Tap 🔊 to hear words. Tap the right answer.<br>3. If it is wrong, just try again – no problem!<br>4. Collect ⭐ to win stickers and trophies.<br>Keyboard or TV remote: use the arrow keys and Enter. Esc goes Home.</div>`)}
function parent(){
  view(`${bar()}<h2>👨‍👩‍👧 Grown-ups</h2><div class="card"><table><tr><td>Correct on first try</td><td><b>${acc()}%</b> (${S.correct} of ${S.total})</td></tr><tr><td>Levels completed</td><td><b>${S.done.length} / 5</b></td></tr><tr><td>Stars collected</td><td><b>${S.stars}</b></td></tr><tr><td>Rounds played</td><td><b>${S.played}</b></td></tr><tr><td>Vowels learned</td><td><b>${S.seen.join(', ')||'–'}</b></td></tr></table><p><small>Progress is saved only on this device. No account or personal information is used.</small></p>
  <div class="row"><button class="btn b3" data-a="reset">🔄 Reset all progress</button></div></div>`)}
/* ---------- rounds ---------- */
function start(g,lv){R={g,lv,i:0,ok:0,n:g==='F'?8:5,qs:shuffle(W).slice(0,g==='F'?8:5)};nextQ()}
function nextQ(){
  if(R.i>=R.n)return end();
  const x=R.qs[R.i],t=R.g==='mix'?pick('ABCDE'):R.g==='F'?pick('ACB'):R.g,tm=R.g==='F'&&!S.untimed;
  view(`${bar()}<div class="pbar" role="progressbar" aria-valuenow="${R.i}" aria-valuemax="${R.n}"><i style="width:${R.i/R.n*100}%"></i></div>
  <div class="row">${MAS}<p class="say card" id="bubble">${pick(['Let us go!','You can do it!','Look closely!','Ready?'])}</p></div><div class="card ctr" id="stage"></div>`);
  ask(t,x,good=>{R.i++;S.total++;if(good){S.correct++;S.stars++;R.ok++}save();nextQ()},tm)}
function ask(t,x,fin,tm){
  let tried=0,done=0;const st=$('#stage'),o3=()=>shuffle([x,...shuffle(W.filter(y=>y!==x)).slice(0,2)]);
  const hit=(el,good)=>{if(done)return;if(good){done=1;clearTimeout(TT);el&&el.classList.add('good');sfx('win');confetti();const p=pick(PRAISE);mascot(p+' ⭐');say(p+' '+x.w+'.');setTimeout(()=>fin(!tried),1500)}else{tried=1;sfx('oops');if(el){el.classList.add('wob');setTimeout(()=>el.classList.remove('wob'),600)}mascot("Let's try again! You can do it!")}};
  if(tm){st.insertAdjacentHTML('beforebegin','<div class="pbar tbar" aria-hidden="true"><i></i></div>');TT=setTimeout(()=>{if(done)return;done=1;mascot(`Nice try! It is ${x.w}.`);say(x.w);setTimeout(()=>fin(false),2000)},10000)}
  const word=`<div class="word">${x.m}</div>`;
  if(t==='A'){st.innerHTML=`<h2>What is this?</h2>${pic(x)}<div class="row">${o3().map(y=>`<button class="btn b2 opt" data-w="${y.w}">${y.w}</button>`).join('')}</div>`;
    $$('.opt',st).forEach(b=>b.onclick=()=>hit(b,b.dataset.w===x.w))}
  if(t==='B'){st.innerHTML=`<h2>Listen and choose!</h2><button class="btn b3 big" id="rep">🔊 Hear</button><div class="row">${o3().map((y,i)=>`<button class="btn b4 opt pic" data-w="${y.w}" aria-label="Picture ${i+1}">${y.svg||`<span class="em">${y.e}</span>`}</button>`).join('')}</div>`;
    $('#rep').onclick=()=>say(x.w,'word-'+x.w.toLowerCase());setTimeout(()=>say(x.w,'word-'+x.w.toLowerCase()),250);
    $$('.opt',st).forEach(b=>b.onclick=()=>hit(b,b.dataset.w===x.w))}
  if(t==='C'){st.innerHTML=`<h2>Find the vowel!</h2>${pic(x)}${word}<div class="row">${['I','O','U'].map(v=>`<button class="btn b2 big opt" data-v="${v}" aria-label="Vowel ${v}">${v}</button>`).join('')}</div>`;
    $$('.opt',st).forEach(b=>b.onclick=()=>hit(b,b.dataset.v===x.v));say(x.w)}
  if(t==='D'){const L6=shuffle([...'IOUIOU']);st.innerHTML=`<h2>Pop the bubble: which vowel is missing?</h2>${pic(x)}${word}<div class="bubs">${L6.map((l,i)=>`<button class="bub" data-v="${l}" style="left:${i*15+3}%;top:${(i%3)*30+8}%;animation-delay:-${i*.7}s" aria-label="Bubble ${l}">${l}</button>`).join('')}</div>`;
    $$('.bub',st).forEach(b=>b.onclick=()=>{const g=b.dataset.v===x.v;hit(b,g);if(g)b.style.visibility='hidden'});say(x.w)}
  if(t==='E'){st.innerHTML=`<h2>Drag the vowel into the blank!</h2>${pic(x)}<div class="word"><span class="slot" id="slot">?</span>${x.m.slice(1)}</div><div class="row">${['I','O','U'].map(v=>`<button class="btn b3 tile" data-v="${v}" aria-label="Vowel ${v}">${v}</button>`).join('')}</div><small>Drag, or tap a letter to place it.</small>`;
    const slot=$('#slot'),drop=t=>{const g=t.dataset.v===x.v;if(g&&!done){slot.textContent=x.v;slot.classList.add('ok')}hit(g?slot:t,g)};
    $$('.tile',st).forEach(t=>{t.onclick=e=>{if(e.detail===0)drop(t)};
      t.onpointerdown=e=>{e.preventDefault();const sx=e.clientX,sy=e.clientY;let mv=0;t.setPointerCapture(e.pointerId);t.classList.add('drag');
        t.onpointermove=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;if(Math.hypot(dx,dy)>8)mv=1;t.style.transform=`translate(${dx}px,${dy}px)`};
        t.onpointerup=ev=>{t.classList.remove('drag');t.style.transform='';t.onpointermove=t.onpointerup=null;const r=slot.getBoundingClientRect();if(!mv||(ev.clientX>r.left-30&&ev.clientX<r.right+30&&ev.clientY>r.top-30&&ev.clientY<r.bottom+30))drop(t)}}});say(x.w)}
}
function end(){
  S.stars+=1;S.played++;const first=R.lv&&!S.done.includes(R.lv);if(R.lv&&first)S.done.push(R.lv);save();confetti();sfx('win');
  view(`${bar()}<div class="card ctr"><span class="em">🏆</span><h2>${R.ok>=R.n-1?'Amazing!':'You did it!'}</h2><p>You got <b>${R.ok}</b> of ${R.n} on the first try!<br>⭐ +${R.ok+1} stars</p>${first?`<p>🎉 Level ${R.lv} complete!${R.lv<5?' A new level is open!':' You finished every level!'}</p>`:''}
  <div class="row"><button class="btn b4" data-a="again">🔁 Play again</button>${R.lv&&R.lv<5?`<button class="btn" data-a="lv" data-x="${R.lv+1}">➡️ Next level</button>`:''}<button class="btn b2" data-a="rewards">🏆 Rewards</button><button class="btn b3" data-a="home">🏠 Home</button></div></div>`);
  say('Amazing! You did it!')}
/* ---------- actions ---------- */
function act(a,x){
  sfx('click');const ws=()=>W.filter(w=>w.v===L.v),cur=()=>ws()[L.k];
  ({home,levels,games,rewards,settings,parent,
   learn:()=>{L={v:x||L.v,k:0};learn()},
   tab:()=>{L={v:x,k:0};learn()},
   next:()=>{L.k=(L.k+1)%ws().length;learn()},prev:()=>{L.k=(L.k+ws().length-1)%ws().length;learn()},
   sw:()=>say(cur().w,'word-'+cur().w.toLowerCase()),
   ss:()=>say(VW[L.v].say,'sound-'+L.v.toLowerCase(),.5),
   sn:()=>say(VW[L.v].n,'name-'+L.v.toLowerCase()),
   lv:()=>{const n=+x;if(!open(n))return;n===1?(L={v:'I',k:0},learn()):start(LV[n-1].g,n)},
   game:()=>start(x,0),again:()=>start(R.g,R.lv),
   tg:()=>{S[x]=!S[x];apply();save();$('#app .top+h2')&&$('#app .top+h2').textContent.includes('Settings')?settings():games()},
   reset:()=>{if(confirm('Reset all stars and progress?')){S={...S0,rm:S.rm,light:S.light};save();apply();home()}}}[a]||(()=>{}))()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&!b.disabled)act(b.dataset.a,b.dataset.x)});
document.addEventListener('input',e=>{if(e.target.id==='vol'){S.vol=+e.target.value;if(MG)MG.gain.value=S.vol;save();tone(660,.1)}});
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>music(),{once:true}));
addEventListener('keydown',e=>{
  if(e.key==='Escape'){home();return}
  const d={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]}[e.key];if(!d||e.target.type==='range')return;
  const els=$$('button:not([disabled]),input').filter(b=>b.offsetParent),c=document.activeElement;e.preventDefault();
  if(!els.includes(c)){els[0]&&els[0].focus();return}
  const r=c.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best,bs=1e9;
  els.forEach(b=>{if(b===c)return;const q=b.getBoundingClientRect(),dx=q.left+q.width/2-cx,dy=q.top+q.height/2-cy,f=dx*d[0]+dy*d[1];if(f<=0)return;const s=f+3*Math.abs(dx*d[1]-dy*d[0]);if(s<bs){bs=s;best=b}});
  best&&best.focus()});
apply();home();
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
