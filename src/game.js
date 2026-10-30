'use strict';
/* ================= Game ================= */
const $=s=>document.querySelector(s);
const cv=$('#c');
try{R=new Renderer(cv);}catch(e){$('#nogl').style.display='flex';throw e;}
R.bg=hex('#ffe9dc');
const W=buildWorld();const scene=W.root;
const EOPT={size:.92,chef:1,style:'pony',hair:'#7a4a2e',tie:'#ff7aa2',top:'#26262e',sleeve:'#26262e',skirt:'#4f8fe8',skin:'#ffe2d0',shoes:'#6b3a2a',face:{eye:'open',mouth:'smile',lashes:1,iris:'#7a3f1c',iris2:'#e0a060'}};
const echa=buildChar(EOPT);scene.add(echa.root);
const cam={eye:[0,3.35,3.9],target:[0,.9,-2.4],fovy:50*Math.PI/180};

/* ---------- stations ---------- */
const ST={
  kulkas:{p:[-3.9,1.1,-2.6],r:.85,n:'Kulkas',lp:[-3.9,2.3,-2.55]},
  lemari:{p:[-2.75,1.05,-2.7],r:.7,n:'Lemari',lp:[-2.75,2.28,-2.6]},
  gelas:{p:[-1.6,1.12,-2.75],r:.42,n:'Gelas',v:1,sa:[-1.6,1.5,-2.7],lp:[-1.6,.78,-2.46],surf:.93},
  talenan:{p:[-.6,1.0,-2.75],r:.47,n:'Talenan',v:1,sa:[-.6,1.25,-2.68],lp:[-.6,.78,-2.46],surf:.97},
  wajan:{p:[.5,1.08,-2.8],r:.4,n:'Wajan',v:1,cook:1,snd:'sizzle',sa:[.5,1.38,-2.75],lp:[.5,.78,-2.46],surf:.99},
  panci:{p:[1.2,1.14,-2.8],r:.4,n:'Panci',v:1,cook:1,snd:'boil',sa:[1.2,1.5,-2.75],lp:[1.2,.78,-2.46],surf:.99},
  oven:{p:[2.3,.5,-2.5],r:.55,n:'Oven',v:1,cook:1,snd:'oven',sa:[2.3,.44,-2.44],lp:[2.3,1.1,-2.45],surf:.97},
  sampah:{p:[3.25,.42,-2.6],r:.45,n:'Sampah',lp:[3.25,.95,-2.4]},
  tray:{p:[3.05,.95,-1.55],r:.5,n:'Tray',sa:[3.05,1.1,-1.55],lp:[3.05,.5,-1.1],surf:.87},
};
const VES=['gelas','talenan','wajan','panci','oven'];
const SPOTZ=[-1.7,0,1.7];
// sprite pools
const SPR={};
for(const k of [...VES,'tray']){SPR[k]=[];for(let i=0;i<4;i++){const s=sprite(iconCanvas('es'),k==='oven'?.2:.3,[0,0,0]);s.visible=false;s.top=true;scene.add(s);SPR[k].push(s);}
  const st=sprite(texStink(),.36,[0,0,0]);st.visible=false;st.top=true;scene.add(st);SPR[k].stink=st;}
const TEX={star:texStar(),heart:texHeart(),puff:texRadial('255,255,255',.9),splat:texSplat(),spark:texStar()};

/* ---------- save ---------- */
let SAVE={unlocked:1,stars:{}};
try{const s=JSON.parse(localStorage.getItem('dapurEcha_v1')||'null');if(s&&s.unlocked)SAVE=s;}catch(e){}
function saveGame(){try{localStorage.setItem('dapurEcha_v1',JSON.stringify(SAVE));}catch(e){}}

/* ---------- device ---------- */
const IS_MOBILE=(window.matchMedia&&matchMedia('(pointer: coarse)').matches)||('ontouchstart' in window&&Math.min(screen.width,screen.height)<820);
if(IS_MOBILE)document.body.classList.add('mobile');
const TAPF=IS_MOBILE?1.3:1,BUGR=IS_MOBILE?62:42;
let sel=null,swipe=null,dragStart={x:0,y:0};
/* ---------- state ---------- */
let mode='start',G=null,camS=0,camT=0,panel=null,drag=null,focusDish=null;
const E={pos:[-.1,0,-.75],rot:0,tp:[-.1,0,-.75],tr:0,work:0,walkPh:0,blink:2,faceT:0,face:null,jump:0,sayT:0};
const parts=[];
const CUSTV=[
  {hair:'#2b1d14',style:'short',top:'#ff8a65',pants:'#455a64',skin:'#f1c7a5',face:{iris:'#3b2a1a'}},
  {hair:'#3b2a1a',style:'pig',top:'#81c784',skirt:'#ffb74d',skin:'#ffe0cc',tie:'#ff5b7a',face:{iris:'#5a3a2a',lashes:1}},
  {hair:'#1e1e2a',style:'cap',capc:'#42a5f5',top:'#fff176',pants:'#5c6bc0',skin:'#d9a27e',face:{iris:'#2a1a12'}},
  {hair:'#8a5a3a',style:'bun',top:'#ba68c8',skirt:'#4db6ac',skin:'#ffd9c0',face:{iris:'#6b4a2a',lashes:1}},
  {hair:'#4a3020',style:'short',top:'#4fc3f7',pants:'#6d4c41',skin:'#c68b62',face:{iris:'#2a1a12'}},
  {hair:'#c98a4a',style:'pig',top:'#f06292',skirt:'#7986cb',skin:'#ffe8d8',tie:'#ffffff',face:{iris:'#4a7a3a',lashes:1}},
];

/* ---------- helpers ---------- */
const rnd=(a,b)=>a+Math.random()*(b-a);const pick1=a=>a[Math.floor(Math.random()*a.length)];
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function cssSize(){return [cv.clientWidth,cv.clientHeight];}
function proj(p){const m=cam.vp;if(!m)return null;const x=p[0],y=p[1],z=p[2];const w=m[3]*x+m[7]*y+m[11]*z+m[15];if(w<=.05)return null;
  const [cw,ch]=cssSize();return {x:((m[0]*x+m[4]*y+m[8]*z+m[12])/w*.5+.5)*cw,y:(1-((m[1]*x+m[5]*y+m[9]*z+m[13])/w*.5+.5))*ch,w};}
function rpx(r,w){const ch=cssSize()[1];return r*(ch/2)/Math.tan(cam.fovy/2)/w;}
const inKitchen=()=>camS<.5;
function custPos(c){return [c.P.root.pos[0],c.P.root.pos[1],c.P.root.pos[2]];}
function hotspots(){const H=[];if(mode!=='play'||!G)return H;
  if(camT===0&&camS<.05){for(const k of Object.keys(ST))H.push({k,p:ST[k].p,r:ST[k].r});}
  else if(camT===1&&camS>.95){H.push({k:'tray',p:ST.tray.p,r:.55});for(const c of G.cust)if(c.state==='wait'||c.state==='in'){const p=custPos(c);H.push({k:'c'+c.spot,c,p:[5.35,1.0,p[2]],r:.85});}}
  return H;}
function pickAt(x,y,filter,fac){let best=null,bd=1e9;for(const h of hotspots()){if(filter&&!filter(h))continue;const s=proj(h.p);if(!s)continue;const R0=rpx(h.r,s.w)*(fac||1);const d=Math.hypot(s.x-x,s.y-y);if(d<R0+12&&d/R0<bd){bd=d/R0;best=h;}}return best;}

/* ---------- UI refs ---------- */
const UI={labels:$('#labels'),tickets:$('#tickets'),recipe:$('#recipe'),hint:$('#hint'),panel:$('#panel'),ghost:$('#ghost'),toast:$('#toasts'),
  timer:$('#timer'),cust:$('#custCount'),lv:$('#lvBadge'),bubble:$('#echaBubble')};
const LBL={},STAT={};
for(const k of Object.keys(ST)){const d=document.createElement('div');d.className='slabel';d.textContent=ST[k].n;UI.labels.appendChild(d);LBL[k]=d;
  if(ST[k].v||k==='tray'){const s=document.createElement('div');s.className='sstat';UI.labels.appendChild(s);STAT[k]=s;s._sig='';
    s.addEventListener('pointerdown',ev=>{const b=ev.target.closest('[data-act]');if(!b)return;ev.stopPropagation();AU.init();if(b.dataset.act==='clean')cleanVessel(k);if(b.dataset.act==='trayclean')cleanTray();});}}

function toast(t,x,y){const d=document.createElement('div');d.className='toast';d.textContent=t;const [cw,ch]=cssSize();d.style.left=(x==null?cw/2:x)+'px';d.style.top=(y==null?ch*.45:y)+'px';UI.toast.appendChild(d);setTimeout(()=>d.remove(),1600);}
function say(t,mood){UI.bubble.textContent=t;UI.bubble.classList.add('on');E.sayT=1.8;if(mood){E.face=mood;E.faceT=1.3;}}

/* ---------- level ---------- */
function newVessel(){return {items:[],cook:null,dirty:false};}
function startLevel(i){
  if(G){for(const c of G.cust)scene.remove(c.P.root);for(const b of G.bugs)scene.remove(b.P.root);}
  AU.stopAll();AU.buzz(false,0);
  const L=LEVELS[i];W.setTheme(L);
  G={li:i,L,t:0,recs:levelRecipes(L),ings:levelIngredients(L),V:{},tray:[],cust:[],spawned:0,served:0,nextCust:1.2,bugs:[],nextBug:L.bugEvery*.55,swats:0,est:4,endT:-1,custN:0};
  for(const k of VES)G.V[k]=newVessel();
  camS=camT=0;closePanel();clearSel();focusDish=null;W.tray.pos=[...W.trayHome];
  E.pos=[-.1,0,-.75];E.tp=[...E.pos];E.tr=0;E.rot=0;
  mode='play';showScreen(null);
  UI.lv.innerHTML=`<span class="hs">${houseSVG(i)}</span> Level ${i+1} · ${L.house}`;
  $('#btnHouse').innerHTML=houseSVG(i);
  UI.tickets._sig='';renderTickets();
  setTimeout(()=>say(i===0?'Halo! Ayo bantu aku masak!':'Ayo semangat!','happy'),400);
}
function pickOrder(){const L=G.L;const n=Math.random()<L.multi?2:1;const o=[];const pool=L.final?[...L.dishes,'tumpeng','tumpeng']:L.dishes;
  while(o.length<n){const d=pick1(pool);if(n===2&&o.includes(d)&&pool.length>1)continue;o.push(d);}return o;}
function spawnCustomer(){const L=G.L;const used=G.cust.filter(c=>c.state!=='out'&&c.state!=='gone').map(c=>c.spot);
  const spots=L.conc===1?[1]:L.conc===2?[0,2]:[0,1,2];const free=spots.filter(s=>!used.includes(s));if(!free.length)return;
  const spot=pick1(free);const v=CUSTV[(G.custN++ + G.li)%CUSTV.length];const P=buildChar(Object.assign({},v,{size:.95,face:Object.assign({eye:'open',mouth:'smile'},v.face)}));
  P.root.pos=[6.6,0,5.8];P.root.rot=[0,Math.PI,0];scene.add(P.root);
  const order=pickOrder();const c={spot,order,rem:[...order],pat:L.pat,max:L.pat,state:'in',P,tp:[5.95,0,SPOTZ[spot]],v,ht:0,sad:false,id:G.custN};
  G.cust.push(c);G.spawned++;for(const d of order)G.est+=dishEst(d);G.est+=5;AU.door();UI.tickets._sig='';}

/* ---------- drag & drop ---------- */
function startDrag(d,x,y){drag=d;dragStart={x,y};clearSel();const g=UI.ghost;
  if(d.tray){g.innerHTML=`<div class="gtray">${G.tray.map(t=>iconImg(t.id)).join('')||'<span>Tray</span>'}</div>`;}
  else g.innerHTML=iconImg(d.item,'gic');
  g.style.display='block';moveGhost(x,y);AU.pop();cv.style.cursor='grabbing';}
function moveGhost(x,y){UI.ghost.style.left=x+'px';UI.ghost.style.top=y+'px';}
function dropFilter(h){if(!drag)return false;if(drag.tray)return h.k[0]==='c';if(h.k[0]==='c')return false;
  if(h.k==='kulkas'||h.k==='lemari')return false;if(drag.from.t==='v'&&h.k===drag.from.id)return false;if(drag.from.t==='tray'&&h.k==='tray')return false;if(h.k==='sampah'&&drag.from.t==='p')return false;return true;}
let hoverK=null;
function validFor(d,k){const o=drag;drag=d;const r=dropFilter({k});drag=o;return r;}
function setSel(d){sel=d;AU.click();const c=$('#selChip');c.innerHTML=(d.tray?'<span class="trayic">Tray</span>':iconImg(d.item))+`<span>${d.tray?'Tap pelanggan':'Tap tujuan'}</span><button id="selX">✕</button>`;c.classList.add('on');$('#selX').onpointerdown=ev=>{ev.stopPropagation();clearSel();};}
function clearSel(){sel=null;const c=$('#selChip');if(c)c.classList.remove('on');}
function setHover(k){if(hoverK===k)return;hoverK=k;}
function removeFromSource(d){if(d.from.t==='v'){G.V[d.from.id].items=[];}else if(d.from.t==='tray'){const i=G.tray.indexOf(d.from.obj);if(i>=0)G.tray.splice(i,1);}}
function canAccept(k,item){const v=G.V[k];if(v.dirty)return 'dirty';if(v.cook)return 'busy';const next=[...v.items,item];
  for(const r of G.recs)if(r.v===k&&msSub(next,r.in))return 'ok';if(v.items.length===1&&!RBY_IN[v.items[0]])return 'full';return 'no';}
const RBY_IN={};for(const r of RECIPES)for(const x of r.in)RBY_IN[x]=1;
function doDrop(h,x,y){const d=drag;
  if(d.tray){serve(h.c,x,y);return;}
  const it=d.item;
  if(h.k==='sampah'){removeFromSource(d);AU.trash();toast('Dibuang',x,y);return;}
  if(h.k==='tray'){if(!ITEMS[it].dish){AU.reject();say('Belum jadi! Masak dulu ya.','oops');return;}
    if(G.tray.length>=3){AU.reject();say('Tray penuh!','oops');return;}
    removeFromSource(d);G.tray.push({id:it,dirty:false});AU.pop();echaGo('tray');burst(ST.tray.sa,TEX.spark,4);
    if(G.li===0&&G.served===0)toast('Klik ➜ untuk ke kaunter',x,y-40);return;}
  const res=canAccept(h.k,it);
  if(res==='ok'){removeFromSource(d);addToVessel(h.k,it);}
  else{AU.reject();AU.oops();
    if(res==='dirty')say('Kotor! Buang dulu.','oops');else if(res==='busy')say('Sabar, lagi dimasak!','oops');
    else if(res==='full')say('Pindahkan dulu hasilnya.','oops');else say(`${ITEMS[it].n} bukan untuk ${ST[h.k].n} sekarang.`,'oops');}}
function addToVessel(k,it){const v=G.V[k];v.items.push(it);echaGo(k);E.work=.8;
  ({gelas:()=>AU.pour(),talenan:()=>AU.chop(),wajan:()=>{AU.pop();AU.nz(.3,'highpass',2500,1,.15);},panci:()=>{AU.tone(300,.15,'sine',.2,0,120);AU.nz(.15,'lowpass',600,1,.15);},oven:()=>AU.open()})[k]();
  const r=G.recs.find(r=>r.v===k&&msEq(v.items,r.in));
  if(r){if(r.t>0){v.cook={r,t:0};if(k!=='oven')AU.ignite();AU.loop(k,ST[k].snd,k==='oven'?.6:k==='wajan'?.5:.55);}else finishVessel(k,r);}}
function finishVessel(k,r){const v=G.V[k];v.items=[r.out];v.cook=null;AU.stop(k);
  if(ST[k].cook)AU.ting();else AU.pop();burst(ST[k].sa,TEX.spark,6);
  if(ITEMS[r.out].dish){say(`${ITEMS[r.out].n} jadi!`,'happy');AU.yay();}}
function cleanVessel(k){const v=G.V[k];if(!v.items.length)return;v.items=[];v.dirty=false;v.cook=null;AU.stop(k);AU.trash();echaGo(k);burst(ST[k].sa,TEX.puff,5);}
function cleanTray(){const n=G.tray.length;G.tray=G.tray.filter(t=>!t.dirty);if(G.tray.length<n){AU.trash();burst(ST.tray.sa,TEX.puff,5);}}
function serve(c,x,y){if(!c||c.state!=='wait'){return;}
  const matched=[];for(const d of [...c.rem]){const t=G.tray.find(t=>!t.dirty&&t.id===d&&!matched.includes(t));if(t){matched.push(t);c.rem.splice(c.rem.indexOf(d),1);}}
  E.tr=Math.PI/2;E.work=.6;
  if(!matched.length){AU.reject();AU.oops();c.noT=1.6;c.P.faceSet({eye:'sad',mouth:'frown'});
    if(!G.tray.length)say('Tray masih kosong.','oops');else if(G.tray.some(t=>t.dirty))say('Ada yang kotor di tray!','oops');else say('Bukan pesanannya.','oops');return;}
  G.tray=G.tray.filter(t=>!matched.includes(t));
  const cp=custPos(c);for(let i=0;i<matched.length;i++)fly(iconCanvas(matched[i].id),ST.tray.sa,[5.05,.95,cp[2]],.6);
  AU.happy();burst([cp[0],1.7,cp[2]],TEX.heart,6);
  if(!c.rem.length){c.state='happy';c.ht=0;G.served++;c.P.faceSet({eye:'happy',mouth:'open'});say('Terima kasih!','happy');AU.yay();}
  else say('Satu lagi ya!','happy');UI.tickets._sig='';}

/* ---------- input ---------- */
function pt(e){const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
cv.addEventListener('pointerdown',e=>{if(mode!=='play'||drag)return;AU.init();const {x,y}=pt(e);
  if(camS<.05&&camT===0){for(const b of G.bugs){if(b.state==='dead')continue;const s=proj(b.P.root.pos);if(!s)continue;if(Math.hypot(s.x-x,s.y-y)<Math.max(BUGR,rpx(.32,s.w))){swat(b,x,y);return;}}}
  if(sel){drag=sel;const t=pickAt(x,y,dropFilter,1.35*TAPF);if(t)doDrop(t,x,y);drag=null;clearSel();if(t)return;}
  const h=pickAt(x,y,null,TAPF);if(!h){closePanel();swipe={x,y};return;}const k=h.k;
  if(k==='kulkas'||k==='lemari'){togglePanel(k);return;}
  if(ST[k]&&ST[k].v){const v=G.V[k];if(v.dirty){cleanVessel(k);return;}
    if(v.items.length===1&&!v.cook){startDrag({item:v.items[0],from:{t:'v',id:k}},x,y);return;}
    if(v.cook){say('Sebentar, lagi dimasak!');return;}
    if(v.items.length>1){say('Lengkapi bahannya dulu ya.');return;}
    say(`${ST[k].n} masih kosong.`);return;}
  if(k==='tray'){if(camT===1){startDrag({tray:true},x,y);return;}
    if(G.tray.some(t=>t.dirty)){cleanTray();return;}
    if(G.tray.length){const t=G.tray[G.tray.length-1];startDrag({item:t.id,from:{t:'tray',obj:t}},x,y);return;}
    say('Tray masih kosong.');return;}
  if(k==='sampah'){say('Drag makanan ke sini untuk membuang.');}
});
window.addEventListener('pointermove',e=>{const {x,y}=pt(e);
  if(drag){moveGhost(e.clientX,e.clientY);const h=pickAt(x,y,dropFilter,1.35);setHover(h?h.k:null);return;}
  if(mode!=='play')return;let over=false;if(camS<.05)for(const b of G.bugs){const s=proj(b.P.root.pos);if(s&&Math.hypot(s.x-x,s.y-y)<42)over=true;}
  const h=over?null:pickAt(x,y);setHover(h&&!drag?h.k:null);cv.style.cursor=over||h?'pointer':'default';});
window.addEventListener('pointerup',e=>{const {x,y}=pt(e);
  if(swipe){const dx=x-swipe.x,dy=y-swipe.y;swipe=null;if(mode==='play'&&Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)setView(dx<0?1:0);return;}
  if(!drag)return;const moved=Math.hypot(x-dragStart.x,y-dragStart.y);const h=moved<14?null:pickAt(x,y,dropFilter,1.35*TAPF);
  if(h)doDrop(h,x,y);else if(moved<14){setSel(drag);}else{UI.ghost.classList.add('back');}
  drag=null;setHover(null);cv.style.cursor='default';setTimeout(()=>{UI.ghost.style.display='none';UI.ghost.classList.remove('back');},h?0:180);});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(mode==='play')pauseGame();else if(mode==='pause')resumeGame();return;}
  if(mode!=='play'||drag)return;const k=e.key.toLowerCase();
  if(k===' '){e.preventDefault();setView(camT?0:1);}else if(k==='a'||k==='arrowleft')setView(0);else if(k==='d'||k==='arrowright')setView(1);});
function setView(v){if(camT===v||Math.abs(camS-camT)>.01)return;AU.init();camT=v;closePanel();if(!(sel&&sel.tray&&v===1))clearSel();AU.swoosh();echaGo(v?'counter':'idle');}
$('#btnToCounter').addEventListener('click',()=>setView(1));$('#btnToKitchen').addEventListener('click',()=>setView(0));

/* ---------- panel (kulkas / lemari) ---------- */
function togglePanel(k){if(panel===k){closePanel();return;}panel=k;AU.open();echaGo(k);
  const list=G.ings.filter(i=>ITEMS[i].src===k);const p=UI.panel;
  p.innerHTML=`<div class="ph"><span>${k==='kulkas'?'🧊 Kulkas':'🚪 Lemari'}</span><button class="px">✕</button></div><div class="pg">${list.map(i=>`<div class="tile" data-id="${i}">${iconImg(i)}<span>${ITEMS[i].n}</span></div>`).join('')||'<em>Tidak ada bahan untuk level ini</em>'}</div><div class="pf">Drag bahan ke alat masak</div>`;
  p.className='on '+k;p.querySelector('.px').onclick=closePanel;
  p.querySelectorAll('.tile').forEach(t=>t.addEventListener('pointerdown',ev=>{ev.preventDefault();AU.init();startDrag({item:t.dataset.id,from:{t:'p'}},ev.clientX,ev.clientY);}));}
function closePanel(){if(!panel)return;panel=null;UI.panel.className='';}

/* ---------- bugs ---------- */
function bugTargets(){const T=[];for(const k of VES){const v=G.V[k];if(v.items.length&&!v.dirty)T.push({k});}for(const t of G.tray)if(!t.dirty)T.push({k:'tray',obj:t});return T;}
function tgtPos(t){if(t.k==='tray'){const i=Math.max(0,G.tray.indexOf(t.obj));return trayItemPos(i,G.tray.length);}return [...ST[t.k].sa];}
function tgtValid(t){if(t.k==='tray')return G.tray.includes(t.obj)&&!t.obj.dirty;const v=G.V[t.k];return v.items.length>0&&!v.dirty;}
function spawnBug(){const L=G.L;const type=pick1(L.bugs);const T=bugTargets();const tgt=T.length?pick1(T):null;const P=buildBug(type);scene.add(P.root);
  const end=tgt?tgtPos(tgt):[rnd(-1.5,1.5),1.4,-2.5];let start;
  if(type==='semut'){const s=end[0]<.6?1:-1;const surf=tgt?ST[tgt.k].surf:.93;end[1]=surf;end[2]+=.22;start=[end[0]+s*1.6,surf,end[2]];if(tgt&&tgt.k==='oven'){end[1]=.97;start[1]=.97;}}
  else start=[Math.random()<.5?-5:5,rnd(2.4,3.2),rnd(-2,0)];
  if(type!=='semut')end[1]+=.1;
  P.root.pos=[...start];G.bugs.push({P,type,tgt,state:'go',t:0,dur:L.bugFly*(type==='semut'?1.2:1),start,end,ph:Math.random()*6});}
function swat(b,x,y){b.state='dead';scene.remove(b.P.root);G.swats++;AU.slap();try{navigator.vibrate&&navigator.vibrate(40);}catch(e){}burst(b.P.root.pos,TEX.star,7);const s=sprite(TEX.splat,.6,[...b.P.root.pos]);scene.add(s);parts.push({n:s,v:[0,.6,0],life:0,max:.7,g:1.3});
  if(G.swats%3===1)say(pick1(['Hore, kena!','Pergi sana!','Yes!']),'happy');G.bugs=G.bugs.filter(q=>q!==b);}
function updateBugs(dt){const L=G.L;const active=camT===0&&camS<.05;
  if(active&&G.t>G.nextBug&&G.bugs.length<L.maxBugs){spawnBug();G.nextBug=G.t+L.bugEvery*rnd(.75,1.2);}
  for(const b of [...G.bugs]){const r=b.P.root;b.ph+=dt;
    for(const w of b.P.wings){w.scl[1]=.02*(1+Math.abs(Math.sin(b.ph*60)))*1;w.rot[2]=(w.pos[0]>0?1:-1)*(.4+Math.sin(b.ph*55)*.5);}
    if(!active)continue;b.t+=dt;
    if(b.state==='go'){if(b.tgt&&!tgtValid(b.tgt)){const T=bugTargets();b.tgt=T.length?pick1(T):null;if(b.tgt){b.start=[...r.pos];b.end=tgtPos(b.tgt);if(b.type!=='semut')b.end[1]+=.1;else{b.end[1]=ST[b.tgt.k].surf;b.end[2]+=.22;}b.t=0;}}
      if(b.tgt&&b.tgt.k==='tray'&&b.type!=='semut'){const e=tgtPos(b.tgt);e[1]+=.1;b.end=e;}
      const u=Math.min(1,b.t/b.dur),e=b.type==='semut'?u:ease(u);let p=V3.lerp(b.start,b.end,e);
      if(b.type!=='semut'){const a=(1-u)*.45+.06;p=[p[0]+Math.sin(b.ph*3.1)*a,p[1]+Math.sin(b.ph*5.3)*a*.5,p[2]+Math.cos(b.ph*4.2)*a*.6];}
      else p[2]+=Math.sin(b.ph*8)*.03;
      const dx=p[0]-r.pos[0],dz=p[2]-r.pos[2];if(Math.abs(dx)+Math.abs(dz)>.001)r.rot[1]=Math.atan2(dx,dz);r.pos=p;
      if(u>=1){if(b.tgt&&tgtValid(b.tgt)){if(b.tgt.k==='tray')b.tgt.obj.dirty=true;else{const v=G.V[b.tgt.k];v.dirty=true;if(v.cook){v.cook=null;AU.stop(b.tgt.k);}}AU.ew();say('Yah, jadi kotor!','oops');}
        b.state='land';b.t=0;}}
    else if(b.state==='land'){if(b.t>1.2){b.state='leave';b.t=0;b.start=[...r.pos];b.end=b.type==='semut'?[r.pos[0]+(Math.random()<.5?-2:2),r.pos[1],r.pos[2]]:[Math.random()<.5?-6:6,3.4,-1];}}
    else if(b.state==='leave'){const u=Math.min(1,b.t/1.8);r.pos=V3.lerp(b.start,b.end,u*u);if(u>=1){scene.remove(r);G.bugs=G.bugs.filter(q=>q!==b);}}}
  AU.buzz(active&&G.bugs.some(b=>b.type!=='semut'&&b.state!=='land'),G.bugs.length);}

/* ---------- particles ---------- */
function burst(p,tex,n){for(let i=0;i<n;i++){const s=sprite(tex,rnd(.1,.2),[p[0],p[1],p[2]]);scene.add(s);parts.push({n:s,v:[rnd(-1,1),rnd(.8,2),rnd(-.4,.6)],life:0,max:rnd(.5,.9),g:-2.5,spin:rnd(-4,4)});}}
function fly(tex,a,b,dur){const s=sprite(tex,.32,[...a]);scene.add(s);parts.push({n:s,fly:{a,b,dur},life:0,max:dur});}
function puffAt(p){const s=sprite(TEX.puff,rnd(.12,.2),[p[0]+rnd(-.08,.08),p[1],p[2]+rnd(-.05,.05)]);s.alpha=.7;scene.add(s);parts.push({n:s,v:[rnd(-.1,.1),rnd(.5,.8),0],life:0,max:1.1,grow:.25,fade:1});}
function updateParts(dt){for(const q of [...parts]){q.life+=dt;const n=q.n;const u=q.life/q.max;
    if(q.fly){const e=ease(Math.min(1,u));const p=V3.lerp(q.fly.a,q.fly.b,e);p[1]+=Math.sin(e*Math.PI)*.8;n.pos=p;}
    else{n.pos=V3.add(n.pos,V3.scale(q.v,dt));if(q.g)q.v[1]+=q.g*dt;if(q.spin)n.rot[2]+=q.spin*dt;if(q.grow){n.scl[0]+=q.grow*dt;n.scl[1]+=q.grow*dt;}}
    n.alpha=Math.max(0,1-Math.pow(u,2))*(q.fade?.7:1);
    if(u>=1){scene.remove(n);parts.splice(parts.indexOf(q),1);}}}

/* ---------- Echa ---------- */
const EPOS={idle:[-.1,-.75,0],kulkas:[-2.95,-1.3,-1.3],lemari:[-1.9,-1.3,-1.3],gelas:[-.82,-1.25,-1.0],talenan:[.2,-1.25,-1.0],wajan:[1.25,-1.25,-1.0],panci:[1.95,-1.25,-1.0],oven:[1.5,-1.3,1.1],sampah:[2.4,-1.6,1.1],tray:[2.3,-.9,1.3],counter:[4.15,2.9,-1.2]};
function echaGo(k){const p=EPOS[k]||EPOS.idle;if(camT===1&&k!=='counter')return;E.tp=[p[0],0,p[1]];E.tr=p[2];E.stand=k;}
function updateEcha(dt){const P=echa,r=P.root;const d=V3.sub(E.tp,E.pos);d[1]=0;const dist=Math.hypot(d[0],d[2]);let walking=false;
  if(dist>.03){const sp=Math.min(dist,3.4*dt);E.pos=V3.add(E.pos,V3.scale(d,sp/dist));walking=true;const face=Math.atan2(d[0],d[2]);E.rot+=angDiff(face,E.rot)*Math.min(1,dt*12);}
  else E.rot+=angDiff(E.tr,E.rot)*Math.min(1,dt*8);
  E.walkPh+=dt*(walking?13:0);const sw=walking?Math.sin(E.walkPh)*.5:0;
  P.legL.rot[0]=sw;P.legR.rot[0]=-sw;
  const t=performance.now()/1000;let bob=walking?Math.abs(Math.sin(E.walkPh))*.04:Math.sin(t*2.2)*.008;
  if(E.jump>0){E.jump-=dt;bob+=Math.sin((1-E.jump/.5)*Math.PI)*.15;}
  r.pos=[E.pos[0],bob,E.pos[2]];r.rot[1]=E.rot;
  if(E.work>0){E.work-=dt;P.armR.rot=[-1.2+Math.sin(t*16)*.35,0,.2];P.armL.rot=[-.9+Math.cos(t*16)*.2,0,-.2];}
  else{P.armR.rot=[-sw*.8,0,.12+Math.sin(t*2)*.03];P.armL.rot=[sw*.8,0,-.12-Math.sin(t*2)*.03];}
  P.head.rot=[Math.sin(t*1.3)*.03,Math.sin(t*.7)*.08,Math.sin(t*1.1)*.04];
  if(P.tail)P.tail.rot=[.1+Math.sin(t*3)*.08+(walking?.2:0),0,Math.sin(t*2.4+(walking?E.walkPh:0))*.18];
  // face
  E.blink-=dt;if(E.faceT>0)E.faceT-=dt;
  let f={};if(E.faceT>0){f=E.face==='happy'?{eye:'happy',mouth:'open'}:E.face==='oops'?{eye:'squeeze',mouth:'o'}:{};}
  else if(E.blink<0){f={eye:'closed'};if(E.blink<-.12)E.blink=rnd(2,4.5);}
  const key=JSON.stringify(f);if(key!==E._fk){E._fk=key;P.faceSet(f);if(E.faceT>0&&E.face==='happy')E.jump=.5;}
  if(E.sayT>0){E.sayT-=dt;if(E.sayT<=0)UI.bubble.classList.remove('on');}}
function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}

/* ---------- customers ---------- */
function updateCustomers(dt){const L=G.L;const occ=G.cust.filter(c=>c.state==='in'||c.state==='wait'||c.state==='happy').length;
  if(G.spawned<L.cust&&occ<L.conc&&G.t>=G.nextCust){spawnCustomer();G.nextCust=G.t+3;}
  const t=performance.now()/1000;
  for(const c of [...G.cust]){const r=c.P.root;
    const moveTo=(p,sp)=>{const d=V3.sub(p,r.pos);const l=Math.hypot(d[0],d[2]);if(l<.03)return true;const s=Math.min(l,sp*dt);r.pos=[r.pos[0]+d[0]/l*s,Math.abs(Math.sin(t*10))*.04,r.pos[2]+d[2]/l*s];r.rot[1]=Math.atan2(d[0],d[2]);
      c.P.legL.rot[0]=Math.sin(t*12)*.5;c.P.legR.rot[0]=-Math.sin(t*12)*.5;return false;};
    if(c.state==='in'){if(moveTo(c.tp,1.8)){c.state='wait';r.pos[1]=0;c.P.legL.rot[0]=c.P.legR.rot[0]=0;UI.tickets._sig='';}}
    else if(c.state==='wait'){c.pat=Math.max(0,c.pat-dt);r.rot[1]+=angDiff(-Math.PI/2,r.rot[1])*Math.min(1,dt*6);r.pos[1]=Math.sin(t*2+c.id)*.006;
      if(c.noT>0){c.noT-=dt;c.P.head.rot[1]=Math.sin(t*18)*.3;if(c.noT<=0){c.P.head.rot[1]=0;c.P.faceSet(c.sad?{eye:'sad',mouth:'frown'}:{});}}
      const sad=c.pat<c.max*.3;if(sad!==c.sad){c.sad=sad;c.P.faceSet(sad?{eye:'sad',mouth:'frown'}:{});}}
    else if(c.state==='happy'){c.ht+=dt;r.pos[1]=Math.abs(Math.sin(c.ht*7))*.18;if(c.ht>1.3){c.state='out';UI.tickets._sig='';}}
    else if(c.state==='out'){if(moveTo([6.7,0,6.2],2.2)){scene.remove(r);c.state='gone';}}}
  G.cust=G.cust.filter(c=>c.state!=='gone');
  if(G.served>=L.cust&&!G.cust.length&&G.endT<0)G.endT=G.t+.4;
  if(G.endT>0&&G.t>=G.endT)winLevel();}

/* ---------- vessels / visuals ---------- */
function trayItemPos(i,n){const tp=W.tray.pos;return [tp[0]+(i-(n-1)/2)*.22,tp[1]+.2,tp[2]];}
const DRINKC={es_teh:'#a85a1c',es_jeruk:'#ff9416',es_campur:'#ffc1d6',es_cendol:'#7b4a26',es_doger:'#ff9fc4',teh:'#c9e6a0',gula:'#f0f0f0',es:'#d9f2ff',jeruk:'#ffb347',susu:'#fffaf0',pisang:'#fff1a8',cendol:'#9be08a',santan:'#fffdf5',gulamerah:'#8a5a3a',campuran_doger:'#ff9fc4'};
let steamT=0;
function updateVessels(dt){steamT-=dt;const doSteam=steamT<=0;if(doSteam)steamT=.13;const t=performance.now()/1000;
  for(const k of VES){const v=G.V[k];if(v.cook){v.cook.t+=dt;if(doSteam&&k!=='oven')puffAt([ST[k].sa[0],ST[k].sa[1]-.2,ST[k].sa[2]]);if(v.cook.t>=v.cook.r.t)finishVessel(k,v.cook.r);}
    const S=SPR[k];const n=v.items.length;const isOut=n===1&&!RBY_IN[v.items[0]]||n===1&&ITEMS[v.items[0]].dish;
    for(let i=0;i<4;i++){const s=S[i];if(i<n&&camS<.5){s.visible=true;s.tex=iconCanvas(v.items[i]);const big=n===1;const base=k==='oven'?.2:big?.36:.26;
        const sa=ST[k].sa;const off=k==='oven'?.17:.24;s.pos=[sa[0]+(i-(n-1)/2)*off,sa[1]+(v.cook&&k!=='oven'?Math.sin(t*8+i)*.03:0)+(big&&k!=='oven'?.05:0),sa[2]+.02*i];
        s.scl=[base,base,1];s.color=v.dirty?[.65,.9,.5]:[1,1,1];}else s.visible=false;}
    S.stink.visible=v.dirty&&camS<.5;if(v.dirty){S.stink.pos=[ST[k].sa[0],ST[k].sa[1]+.3+Math.sin(t*3)*.03,ST[k].sa[2]+.05];}}
  // tray
  const S=SPR.tray,n=G.tray.length;for(let i=0;i<4;i++){const s=S[i];if(i<n){s.visible=camS<.98||true;s.tex=iconCanvas(G.tray[i].id);s.pos=trayItemPos(i,n);s.scl=[.3,.3,1];s.color=G.tray[i].dirty?[.65,.9,.5]:[1,1,1];}else s.visible=false;}
  S.stink.visible=G.tray.some(x=>x.dirty);if(S.stink.visible)S.stink.pos=[W.tray.pos[0],W.tray.pos[1]+.55,W.tray.pos[2]];
  // fx
  W.flames.wajan.visible=!!G.V.wajan.cook;W.flames.panci.visible=!!G.V.panci.cook;
  for(const f of [W.flames.wajan,W.flames.panci])if(f.visible)for(const c of f.children){c.scl[1]=.06+Math.random()*.06;}
  W.ovWin.emis=G.V.oven.cook?[.55+Math.sin(t*6)*.1,.25,.05]:[0,0,0];
  const g=G.V.gelas;const gn=g.items.length;if(gn){W.liq.visible=true;const h=Math.min(.27,.06+gn*.07);W.liq.scl[1]=h;W.liq.pos[1]=.955+h/2;W.liq.color=hex(DRINKC[g.items[gn-1]]||'#c9e6ff');}else W.liq.visible=false;
  W.water.color=G.V.panci.cook?hex('#b5e3ff'):hex('#8fd3ff');
  // doors
  const lerpA=(n,i,v)=>{n.rot[i]+=(v-n.rot[i])*Math.min(1,dt*10);};
  lerpA(W.frDoor,1,panel==='kulkas'?-1.6:0);lerpA(W.lmL,1,panel==='lemari'?-1.4:0);lerpA(W.lmR,1,panel==='lemari'?1.4:0);
  // glow
  const pulse=.12+Math.sin(t*8)*.06;for(const k of Object.keys(W.glow)){const sv=sel&&camS<.05&&validFor(sel,k);const on=hoverK===k||sv;for(const n of W.glow[k])n.emis=on?(drag||sv?[pulse+.08,pulse,pulse*.3]:[.08,.07,.05]):[0,0,0];}
  W.mats.forEach((m,i)=>{const on=(drag&&drag.tray&&hoverK==='c'+i)||(sel&&sel.tray&&G&&G.cust.some(c=>c.spot===i&&c.state==='wait'));m.emis=on?[.3,.25,.05]:[0,0,0];});}

/* ---------- HUD / labels ---------- */
function place(el,p,dy){const s=proj(p);if(!s){el.style.display='none';return null;}el.style.display='';el.style.transform=`translate(${s.x}px,${s.y+(dy||0)}px) translate(-50%,-50%)`;return s;}
function updateLabels(){const kit=mode==='play'&&camS<.08,ctr=mode==='play'&&camS>.92;document.body.classList.toggle('ctr',camS>.5);
  for(const k of Object.keys(ST)){const l=LBL[k];const show=kit||(ctr&&k==='tray');l.classList.toggle('hide',!show);if(show){place(l,ST[k].lp);l.classList.toggle('hl',hoverK===k);}
    const s=STAT[k];if(!s)continue;let html='';
    if(G&&show){if(k==='tray'){if(G.tray.some(t=>t.dirty))html=`<button data-act="trayclean" class="bad">Kotor! Buang</button>`;else if(ctr&&G.tray.length)html=`<b class="ok">Bawa Tray ke pelanggan</b>`;}
      else{const v=G.V[k];if(v.dirty)html=`<button data-act="clean" class="bad">Kotor! Buang</button>`;
        else if(v.cook)html=`<div class="bar"><i style="width:${Math.round(v.cook.t/v.cook.r.t*100)}%"></i></div>`;
        else if(v.items.length===1&&ITEMS[v.items[0]].dish)html=`<b class="ok">Siap! Drag ke Tray</b>`;
        else if(v.items.length===1&&!ITEMS[v.items[0]].src)html=`<b class="mid">${ITEMS[v.items[0]].n} ✓</b>`;
        else if(v.items.length)html=`<button data-act="clean" class="sm" title="Buang">🗑</button>`;}}
    if(html!==s._sig){s.innerHTML=html;s._sig=html;}
    s.style.display=html?'':'none';if(html){const sa=k==='tray'?[W.tray.pos[0],W.tray.pos[1]+.5,W.tray.pos[2]]:k==='oven'?[2.3,.82,-2.42]:[ST[k].sa[0],ST[k].sa[1]+.32,ST[k].sa[2]];place(s,sa);}}
  // echa bubble
  if(UI.bubble.classList.contains('on'))place(UI.bubble,[echa.root.pos[0],1.95,echa.root.pos[2]]);
  // customer bubbles
  const cb=$('#cbubbles');if(G&&mode==='play'){const sig=G.cust.map(c=>c.id+c.state+c.rem.join()).join('|')+ctr;
    if(cb._sig!==sig){cb._sig=sig;cb.innerHTML=G.cust.filter(c=>c.state==='wait').map(c=>`<div class="cbub" data-id="${c.id}"><div class="ci">${c.rem.map(d=>iconImg(d)).join('')}</div><div class="pbar"><i></i></div></div>`).join('');}
    for(const el of cb.children){const c=G.cust.find(q=>q.id==el.dataset.id);if(!c||!ctr){el.style.display='none';continue;}place(el,[c.P.root.pos[0],1.95,c.P.root.pos[2]]);
      const i=el.querySelector('.pbar i');const f=c.pat/c.max;i.style.width=Math.round(f*100)+'%';i.style.background=f>.5?'#6cd27a':f>.3?'#ffc44d':'#ff6b6b';}}
  else cb.innerHTML='';
  // view buttons
  $('#btnToCounter').classList.toggle('on',mode==='play'&&camT===0&&camS<.05);$('#btnToKitchen').classList.toggle('on',mode==='play'&&camT===1&&camS>.95);
  $('#btnToCounter').classList.toggle('pulse',!!(G&&G.tray.some(t=>!t.dirty)));}
function renderTickets(){if(!G)return;const sig=G.cust.map(c=>c.id+c.state+c.rem.join()).join('|')+focusDish;if(UI.tickets._sig===sig)return;UI.tickets._sig=sig;
  const vis=G.cust.filter(c=>c.state==='wait'||c.state==='in');
  if(!focusDish||!vis.some(c=>c.rem.includes(focusDish))){focusDish=vis.length&&vis[0].rem.length?vis[0].rem[0]:null;}
  UI.tickets.innerHTML=vis.map((c,i)=>`<div class="ticket"><div class="th"><span class="av" style="background:${c.v.top}"></span>Pelanggan ${i+1}${c.state==='in'?' <small>datang…</small>':''}</div><div class="td">${c.rem.map(d=>`<button class="dish ${d===focusDish?'sel':''}" data-d="${d}">${iconImg(d)}<span>${ITEMS[d].n}</span></button>`).join('')}</div><div class="pbar" data-c="${c.id}"><i></i></div></div>`).join('')||`<div class="ticket empty">Menunggu pelanggan…</div>`;
  UI.tickets.querySelectorAll('.dish').forEach(b=>b.addEventListener('click',()=>{focusDish=b.dataset.d;UI.tickets._sig='';AU.click();document.body.classList.add('recipeOpen');}));
  renderRecipe();}
function renderRecipe(){if(!focusDish){UI.recipe.classList.remove('on');return;}UI.recipe.classList.add('on');
  const ch=chainOf(focusDish);
  UI.recipe.innerHTML=`<div class="rh">${iconImg(focusDish)}<div><small>Resep</small><b>${ITEMS[focusDish].n}</b></div></div>`+ch.map((r,i)=>`<div class="rl"><span class="num">${i+1}</span><span class="vn v-${r.v}">${VNAME[r.v]}</span>${r.in.map(x=>iconImg(x,'ic s')).join('<i>+</i>')}<i>→</i>${iconImg(r.out,'ic s')}${r.t?`<em>${r.v==='oven'?'panggang':r.v==='panci'?'rebus':'goreng'}</em>`:''}</div>`).join('');}
function updateHUD(){if(!G)return;const s=Math.floor(G.t);UI.timer.textContent=`⏱ ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;UI.cust.textContent=`🙂 ${G.served}/${G.L.cust}`;
  renderTickets();for(const el of UI.tickets.querySelectorAll('.pbar[data-c]')){const c=G.cust.find(q=>q.id==el.dataset.c);if(!c)continue;const f=c.pat/c.max;const i=el.firstChild;i.style.width=Math.round(f*100)+'%';i.style.background=f>.5?'#6cd27a':f>.3?'#ffc44d':'#ff6b6b';}
  UI.hint.textContent=hintText();}
function hintText(){if(sel)return sel.tray?'Tap pelanggan yang memesan, atau ✕ untuk batal.':`${ITEMS[sel.item].n} dipilih. Tap alat yang menyala.`;if(camT===1){if(!G.tray.length)return IS_MOBILE?'Tray kosong. Swipe ke kanan untuk kembali ke dapur.':'Tray kosong. Kembali ke dapur (⬅ / A) untuk memasak.';return IS_MOBILE?'Tap Tray, lalu tap pelanggan yang memesan (atau drag).':'Drag Tray ke pelanggan yang memesan makanan itu.';}
  if(G.bugs.some(b=>b.state==='go'))return 'Ada serangga! Klik untuk menepuknya sebelum hinggap.';
  for(const k of VES){const v=G.V[k];if(v.dirty)return `${ST[k].n} kotor. Klik untuk membuangnya.`;}
  if(G.tray.some(t=>t.dirty))return 'Ada makanan kotor di Tray. Klik Tray untuk membuangnya.';
  for(const k of VES){const v=G.V[k];if(v.items.length===1&&ITEMS[v.items[0]].dish)return `${ITEMS[v.items[0]].n} siap! Drag ke Tray.`;}
  if(G.tray.length)return IS_MOBILE?'Makanan siap! Tap Kaunter ➜ atau swipe ke kiri.':'Makanan siap di Tray. Klik Kaunter ➜ (atau Spasi) untuk menyajikan.';
  for(const k of VES){const v=G.V[k];if(v.items.length===1&&!ITEMS[v.items[0]].src&&!v.cook)return `${ITEMS[v.items[0]].n} sudah jadi. Drag ke langkah berikutnya sesuai resep.`;}
  if(!G.cust.some(c=>c.state==='wait'))return 'Pelanggan sebentar lagi datang…';
  return 'Ikuti resep di kiri bawah: klik Kulkas atau Lemari, lalu drag bahan ke alat masak.';}

/* ---------- screens ---------- */
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));document.body.classList.toggle('playing',!id&&mode==='play');}
function starsHTML(n){return [0,1,2].map(i=>`<span class="st ${i<n?'on':''}">★</span>`).join('');}
function showMap(){if(mode==='play')mode='pause';const g=$('#mapGrid');
  g.innerHTML=LEVELS.map((L,i)=>{const lock=i+1>SAVE.unlocked;const st=SAVE.stars[i+1]||0;return `<button class="house ${lock?'lock':''}" data-i="${i}" ${lock?'disabled':''}><div class="hsvg">${houseSVG(i)}</div><div class="hn">Level ${i+1}</div><div class="hh">${L.house}</div><div class="hst">${starsHTML(st)}</div>${lock?'<div class="lk">🔒</div>':''}</button>`;}).join('');
  g.querySelectorAll('.house:not(.lock)').forEach(b=>b.onclick=()=>{AU.init();AU.click();startLevel(+b.dataset.i);});
  $('#mapClose').style.display=G&&G.endT<0?'':'none';showScreen('map');}
function pauseGame(){if(mode!=='play')return;mode='pause';clearSel();AU.stopAll();AU.buzz(false,0);showScreen('pause');}
function resumeGame(){mode='play';showScreen(null);for(const k of VES){const v=G.V[k];if(v.cook)AU.loop(k,ST[k].snd,.5);}}
function winLevel(){mode='win';AU.stopAll();AU.buzz(false,0);const t=G.t,est=G.est;const ratio=t/est;const stars=ratio<=1.5?3:ratio<=2.4?2:1;
  const lv=G.li+1;SAVE.stars[lv]=Math.max(SAVE.stars[lv]||0,stars);SAVE.unlocked=Math.max(SAVE.unlocked,Math.min(10,lv+1));saveGame();
  const s=Math.floor(t);const msg=stars===3?'Luar biasa! Kerja kerasmu sempurna!':stars===2?'Bagus sekali! Sedikit lebih cepat lagi untuk 3 bintang.':'Berhasil! Coba lagi untuk bintang lebih banyak.';
  $('#winStars').innerHTML=[0,1,2].map(i=>`<span class="bst" style="animation-delay:${.5+i*.35}s">${i<stars?'★':'☆'}</span>`).join('');
  $('#winMsg').textContent=lv===10&&stars?'Selamat! Kamu Chef Hebat Nusantara! '+msg:msg;
  $('#winStats').innerHTML=`<div>⏱ Waktu <b>${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}</b></div><div>🙂 Pelanggan <b>${G.served}</b></div><div>👋 Serangga ditepuk <b>${G.swats}</b></div><div>🎯 Target 3★ <b>${Math.floor(est*1.5/60)}:${String(Math.floor(est*1.5)%60).padStart(2,'0')}</b></div>`;
  $('#winNext').style.display=lv<10?'':'none';showScreen('win');AU.fanfare();for(let i=0;i<stars;i++)setTimeout(()=>AU.star(i),550+i*350);
  E.face='happy';E.faceT=3;say('Berhasil!','happy');}
$('#btnStart').onclick=()=>{AU.init();AU.click();showMap();};
$('#mapClose').onclick=()=>{AU.click();if(G&&G.endT<0)resumeGame();};
$('#btnHouse').onclick=()=>{AU.init();AU.click();if(mode==='play'){AU.stopAll();AU.buzz(false,0);}showMap();};
$('#btnPause').onclick=()=>{AU.init();pauseGame();};
$('#btnResume').onclick=()=>{AU.click();resumeGame();};
$('#btnRetry').onclick=()=>{AU.click();startLevel(G.li);};
$('#btnPauseMap').onclick=()=>{AU.click();showMap();};
$('#winNext').onclick=()=>{AU.click();startLevel(Math.min(9,G.li+1));};
$('#winRetry').onclick=()=>{AU.click();startLevel(G.li);};
$('#winMap').onclick=()=>{AU.click();showMap();};
const bm=$('#btnMusic'),bs=$('#btnSfx');
bm.onclick=()=>{AU.init();AU.setMusic(!AU.musicOn);bm.classList.toggle('off',!AU.musicOn);};
bs.onclick=()=>{AU.init();AU.setSfx(!AU.sfxOn);bs.classList.toggle('off',!AU.sfxOn);};
$('#btnHouse').innerHTML=houseSVG(0);
$('#btnRecipe').onclick=()=>{AU.init();AU.click();document.body.classList.toggle('recipeOpen');};
$('#btnFull').onclick=()=>{AU.init();const d=document,el=d.documentElement;try{if(d.fullscreenElement||d.webkitFullscreenElement){(d.exitFullscreen||d.webkitExitFullscreen).call(d);}else{const r=(el.requestFullscreen||el.webkitRequestFullscreen);if(r){const p=r.call(el);if(p&&p.then)p.then(()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{});}catch(e){}}).catch(()=>toast('Layar penuh tidak didukung di sini'));}else toast('Layar penuh tidak didukung di sini');}}catch(e){toast('Layar penuh tidak didukung di sini');}};
function checkOrient(){const portrait=IS_MOBILE&&innerHeight>innerWidth;$('#rotateMsg').classList.toggle('on',portrait);if(portrait&&mode==='play')pauseGame();}
window.addEventListener('resize',checkOrient);window.addEventListener('orientationchange',()=>setTimeout(checkOrient,200));checkOrient();
document.addEventListener('contextmenu',e=>e.preventDefault());

/* ---------- loop ---------- */
function resize(){const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.floor(cv.clientWidth*dpr);cv.height=Math.floor(cv.clientHeight*dpr);
  const asp=cv.clientWidth/Math.max(1,cv.clientHeight);const v=2*Math.atan(Math.tan(40*Math.PI/180)/asp);cam.fovy=Math.max(40*Math.PI/180,Math.min(66*Math.PI/180,v));}
window.addEventListener('resize',resize);resize();
const CAMK={eye:[0,3.15,3.15],pitch:-.375},CAMC={eye:[-.9,3.0,-.3],pitch:-.303};
function camApply(){const e=ease(camS);cam.eye=V3.lerp(CAMK.eye,CAMC.eye,e);const yaw=e*Math.PI/2,p=CAMK.pitch+(CAMC.pitch-CAMK.pitch)*e;
  const f=[Math.cos(p)*Math.sin(yaw),Math.sin(p),-Math.cos(p)*Math.cos(yaw)];cam.target=V3.add(cam.eye,V3.scale(f,6));}
let last=performance.now();
function tick(dt){
  if(camS!==camT){const d=camT-camS;camS+=Math.sign(d)*Math.min(Math.abs(d),dt/.75);}
  camApply();
  if(mode==='play'&&G){G.t+=dt;updateCustomers(dt);updateBugs(dt);updateVessels(dt);updateHUD();}
  else if(G&&mode!=='play'){updateVessels(0);}
  updateEcha(dt);updateParts(dt);}
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;tick(dt);R.render(scene,cam);updateLabels();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.__DE={drop(d,k,cid){drag=d;const h=cid!=null?{k:'c',c:G.cust.find(c=>c.id===cid)}:{k};doDrop(h,100,100);drag=null;},step(sec){for(let i=0;i<sec/.05;i++)tick(.05);},get G(){return G;},startLevel,addToVessel,doDrop,serve,setView,ST,spawnBug,swat,proj,get camS(){return camS;},winLevel,LEVELS};
