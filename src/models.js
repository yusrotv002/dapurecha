'use strict';
/* ================= Models ================= */
let R;
const GK={
  sph:()=>R.geo('sph',()=>GEN.sphere(28,18)),
  sphLo:()=>R.geo('sphLo',()=>GEN.sphere(14,10)),
  hemi:()=>R.geo('hemi',()=>GEN.sphere(28,9,-Math.PI/2,0)),
  face:()=>R.geo('face',()=>GEN.sphere(22,18,-50*Math.PI/180,40*Math.PI/180,-55*Math.PI/180,55*Math.PI/180)),
  plane:()=>R.geo('plane',()=>GEN.plane(1,1)),
  cyl:(rt=1,rb=1,caps=true,seg=24)=>R.geo(`cyl${rt}_${rb}_${caps}_${seg}`,()=>GEN.cyl(rt,rb,1,seg,caps)),
  tor:(Rr,r)=>R.geo(`tor${Rr}_${r}`,()=>GEN.torus(Rr,r,32,10)),
  rb:(w,h,d,r)=>R.geo(`rb${w}_${h}_${d}_${r}`,()=>GEN.rbox(w,h,d,r,3)),
};
function mk(geo,color,pos,scl,rot,o){const n=new Node(geo,typeof color==='string'?hex(color):color);if(pos)n.pos=pos;if(scl)n.scl=scl;if(rot)n.rot=rot;if(o)Object.assign(n,o);return n;}
function grp(pos,rot){const n=new Node(null);if(pos)n.pos=pos;if(rot)n.rot=rot;return n;}
function sprite(cv,size,pos){const n=mk(GK.plane(),[1,1,1],pos||[0,0,0],[size,size,1]);n.tex=cv;n.bill=true;n.flat=1;n.trans=true;return n;}
function decal(cv,w,h,pos,rot){const n=mk(GK.plane(),[1,1,1],pos,[w,h,1],rot||[0,0,0]);n.tex=cv;n.trans=true;n.flat=.25;return n;}

/* ---------- Character (chibi) ---------- */
function buildChar(o){
  const skin=o.skin||'#ffe0cc',hair=o.hair||'#7a4a2e',ol=0.011;
  const root=grp(),body=grp();root.add(body);
  const P={root,body};
  // legs
  for(const s of [-1,1]){const leg=grp([s*.085,.34,0]);body.add(leg);
    leg.add(mk(GK.cyl(1,.9),o.legs||skin,[0,-.14,0],[.055,.28,.055],null,{outline:ol}));
    leg.add(mk(GK.cyl(1,1),o.socks||'#ffffff',[0,-.25,0],[.06,.07,.06]));
    leg.add(mk(GK.sph(),o.shoes||'#7a4632',[0,-.3,.03],[.075,.05,.11],null,{outline:ol}));
    P[s<0?'legL':'legR']=leg;}
  // skirt / pants
  if(o.pants){for(const s of [-1,1])body.add(mk(GK.cyl(1,1),o.pants,[s*.085,.4,0],[.075,.2,.075],null,{outline:ol}));
    body.add(mk(GK.rb(.36,.14,.24,.06),o.pants,[0,.5,0],null,null,{outline:ol}));}
  else body.add(mk(GK.cyl(.62,1),o.skirt||'#5b8def',[0,.47,0],[.32,.3,.3],null,{outline:ol}));
  // torso
  const torso=mk(GK.rb(.42,.38,.29,.12),o.top||'#2b2b33',[0,.78,0],null,null,{outline:ol});body.add(torso);P.torso=torso;
  if(o.chef){
    for(const s of [-1,1])for(const y of [.86,.76,.66])body.add(mk(GK.sphLo(),'#ffffff',[s*.165,y,.142],[.022,.022,.012]));
    body.add(mk(GK.tor(.14,.035),'#ffffff',[0,.97,0],[1,.8,1]));
    // apron bib + skirt
    body.add(mk(GK.rb(.27,.25,.03,.012),'#ffffff',[0,.8,.148],null,null,{outline:.008}));
    const cro=decal(texCroissantCV,.15,.15,[0,.85,.166]);cro.flat=.6;body.add(cro);
    body.add(mk(GK.rb(.34,.27,.022,.06),'#ffffff',[0,.49,.245],null,[-.42,0,0],{outline:.008}));
    body.add(mk(GK.tor(.205,.018),'#ffffff',[0,.62,0],[1,1,.78]));
    for(const s of [-1,1])body.add(mk(GK.cyl(1,1),'#ffffff',[s*.12,.94,.07],[.014,.16,.014],[.5,0,s*.35]));
  }
  if(o.scarf)body.add(mk(GK.tor(.13,.04),o.scarf,[0,.96,0],[1,.8,1]));
  // arms
  for(const s of [-1,1]){const sh=grp([s*.235,.92,0]);body.add(sh);const arm=grp();sh.add(arm);
    arm.add(mk(GK.cyl(.85,1),o.sleeve||o.top||'#2b2b33',[0,-.13,0],[.06,.26,.06],null,{outline:ol}));
    if(o.chef)arm.add(mk(GK.cyl(1,1),'#ffffff',[0,-.27,0],[.064,.05,.064]));
    arm.add(mk(GK.sph(),skin,[0,-.33,0],[.06,.065,.06],null,{outline:ol}));
    sh.rot=[0,0,s*.12];P[s<0?'armL':'armR']=sh;}
  // head
  const head=grp([0,1.2,0]);body.add(head);P.head=head;
  head.add(mk(GK.sph(),skin,[0,0,0],[.34,.33,.33],null,{outline:ol}));
  const face=mk(GK.face(),[1,1,1],[0,0,0],[.343,.333,.333]);face.trans=true;face.flat=.15;face.tex=faceCanvas(o.face||{eye:'open',mouth:'smile'});head.add(face);P.face=face;
  for(const s of [-1,1])head.add(mk(GK.sph(),skin,[s*.33,-.02,0],[.045,.07,.05]));
  // hair
  head.add(mk(GK.sph(),hair,[0,.045,-.05],[.368,.36,.368],null,{outline:ol}));
  const bangs=[[-.2,.2,.24,.3],[-.07,.23,.27,.1],[.07,.23,.27,-.1],[.2,.2,.24,-.3]];
  for(const [x,y,z,r] of bangs)head.add(mk(GK.sph(),hair,[x,y,z],[.12,.12,.08],[0.25,0,r]));
  for(const s of [-1,1])head.add(mk(GK.sph(),hair,[s*.3,-.08,.08],[.06,.17,.08],[0,0,-s*.15]));
  if(o.style==='pony'){const tail=grp([0,.2,-.32]);head.add(tail);P.tail=tail;
    tail.add(mk(GK.sph(),o.tie||'#ff7aa2',[0,0,0],[.07,.07,.07],null,{outline:ol}));
    tail.add(mk(GK.sph(),hair,[0,-.1,-.1],[.12,.17,.12],[.5,0,0],{outline:ol}));
    tail.add(mk(GK.sph(),hair,[0,-.3,-.16],[.11,.17,.1],[.2,0,0],{outline:ol}));
    tail.add(mk(GK.sph(),hair,[0,-.47,-.15],[.07,.12,.07],[-.1,0,0],{outline:ol}));}
  else if(o.style==='bun'){head.add(mk(GK.sph(),hair,[0,.36,-.08],[.15,.14,.15],null,{outline:ol}));}
  else if(o.style==='pig'){for(const s of [-1,1]){head.add(mk(GK.sph(),hair,[s*.36,.0,-.06],[.11,.2,.11],[0,0,s*.4],{outline:ol}));head.add(mk(GK.sph(),o.tie||'#ffd54f',[s*.34,.14,-.05],[.05,.05,.05]));}}
  else if(o.style==='cap'){head.add(mk(GK.sph(),o.capc||'#ef5350',[0,.14,-.02],[.37,.25,.37],null,{outline:ol}));head.add(mk(GK.cyl(1,1),o.capc||'#ef5350',[0,.17,.3],[.2,.02,.16],[-.15,0,0]));}
  if(o.chef){const hat=grp([0,.3,-.02],[-.12,0,0]);head.add(hat);
    hat.add(mk(GK.cyl(1,1),'#ffffff',[0,.04,0],[.27,.13,.27],null,{outline:ol}));
    hat.add(mk(GK.sph(),'#ffffff',[0,.2,0],[.32,.16,.3],null,{outline:ol}));
    for(const [x,z] of [[-.15,0],[.15,0],[0,.13],[0,-.13]])hat.add(mk(GK.sph(),'#ffffff',[x,.22,z],[.15,.13,.15],null,{outline:ol}));
    P.hat=hat;}
  // blob shadow
  const sh=mk(GK.plane(),[1,1,1],[0,.012,0],[.7,.55,1],[-Math.PI/2,0,0]);sh.tex=texShadowCV;sh.trans=true;sh.flat=1;root.add(sh);
  root.scl=[o.size||1,o.size||1,o.size||1];
  P.faceSet=(f)=>{face.tex=faceCanvas(Object.assign({},o.face||{},f));};
  return P;}

/* ---------- Bugs ---------- */
function buildBug(type){const root=grp();const ol=.008;const P={root,type,wings:[]};
  const eyes=(x,y,z,s)=>{for(const k of [-1,1]){root.add(mk(GK.sphLo(),'#ffffff',[k*x,y,z],[s,s,s*.8]));root.add(mk(GK.sphLo(),'#222222',[k*x,y,z+s*.6],[s*.5,s*.55,s*.3]));}};
  if(type==='lalat'){root.add(mk(GK.sph(),'#3b4a6b',[0,0,0],[.12,.1,.14],null,{outline:ol}));eyes(.07,.05,.1,.055);
    for(const k of [-1,1]){const w=mk(GK.sphLo(),'#dff3ff',[k*.12,.08,-.02],[.11,.02,.07],[0,k*.3,k*.4]);w.alpha=.6;root.add(w);P.wings.push(w);}}
  else if(type==='nyamuk'){root.add(mk(GK.sph(),'#6d5a4a',[0,0,0],[.06,.06,.13],null,{outline:ol}));root.add(mk(GK.sph(),'#6d5a4a',[0,.03,.12],[.06,.06,.06],null,{outline:ol}));eyes(.035,.06,.16,.035);
    root.add(mk(GK.cyl(.2,1),'#4a3a30',[0,.0,.24],[.008,.12,.008],[Math.PI/2,0,0]));
    for(const k of [-1,1])for(const z of [-.05,.03,.1])root.add(mk(GK.cyl(1,1),'#4a3a30',[k*.08,-.07,z],[.006,.16,.006],[0,0,k*.7]));
    for(const k of [-1,1]){const w=mk(GK.sphLo(),'#eef7ff',[k*.12,.07,0],[.12,.015,.05],[0,0,k*.3]);w.alpha=.6;root.add(w);P.wings.push(w);}}
  else {for(const [z,s] of [[-.11,.075],[0,.055],[.09,.065]])root.add(mk(GK.sph(),'#a33a2a',[0,.06,z],[s,s*.9,s],null,{outline:ol}));eyes(.035,.09,.13,.026);
    for(const k of [-1,1]){root.add(mk(GK.cyl(1,1),'#5a1e14',[k*.03,.16,.13],[.006,.08,.006],[.5,0,-k*.5]));for(const z of [-.03,.0,.03])root.add(mk(GK.cyl(1,1),'#5a1e14',[k*.06,.03,z],[.006,.07,.006],[0,0,k*1.1]));}}
  root.scl=type==='semut'?[1.15,1.15,1.15]:[1.5,1.5,1.5];return P;}

/* ---------- Kitchen & cafe ---------- */
let texCroissantCV,texShadowCV;
function buildWorld(){
  texCroissantCV=texCroissant();texShadowCV=texRadial('60,30,40',.35);
  const W={root:grp(),glow:{},spr:{},themed:[]};const root=W.root;const ol=.012;
  const glowAdd=(k,...n)=>{(W.glow[k]=W.glow[k]||[]).push(...n);};
  // floor & walls
  const fl=mk(GK.plane(),[1,1,1],[1.5,0,0.8],[15,15,1],[-Math.PI/2,0,0]);fl.tex=texFloor();fl.trans=false;root.add(fl);
  const wallB=mk(GK.rb(15,4.4,.2,.02),'#ffe4d6',[1.5,2.2,-3.45]);root.add(wallB);W.themed.push(wallB);
  const wallL=mk(GK.rb(.2,4.4,9,.02),'#ffe4d6',[-5.2,2.2,0.6]);root.add(wallL);W.themed.push(wallL);
  const wallR=mk(GK.rb(.2,4.4,10,.02),'#fff0e6',[8.6,2.2,0.6]);root.add(wallR);
  root.add(mk(GK.rb(15,.18,.24,.03),'#ffffff',[1.5,.09,-3.33]));
  const spl=decal(texSplash('#bfe8e0'),5.2,.85,[-.3,1.36,-3.34]);spl.trans=false;spl.flat=.1;root.add(spl);W.splash=spl;
  const gar=decal(texGarland(),7,.75,[-.6,3.55,-3.33]);gar.flat=.4;root.add(gar);
  const clk=decal(texClock(),.6,.6,[2.6,2.85,-3.33]);clk.flat=.3;root.add(clk);
  // --- Kulkas
  const fr=grp([-3.9,0,-2.95]);root.add(fr);
  const frBody=mk(GK.rb(1.05,2.1,.85,.12),'#bfe9df',[0,1.05,0],null,null,{outline:ol});fr.add(frBody);
  fr.add(mk(GK.rb(.9,1.9,.05,.02),'#eef8ff',[0,1.05,.4]));
  for(const y of [.55,1.0,1.45])fr.add(mk(GK.rb(.86,.03,.5,.01),'#ffffff',[0,y,.2]));
  for(const [x,y,c] of [[-.25,.62,'#ff8a65'],[0,.65,'#ffd54f'],[.25,.62,'#81c784'],[-.2,1.07,'#f48fb1'],[.15,1.08,'#fff59d'],[0,1.52,'#90caf9']])fr.add(mk(GK.sph(),c,[x,y,.25],[.09,.09,.09]));
  const frDoor=grp([-.52,0,.46]);fr.add(frDoor);
  frDoor.add(mk(GK.rb(1.04,1.3,.09,.05),'#cdeee6',[.52,.72,0],null,null,{outline:ol}));
  frDoor.add(mk(GK.rb(1.04,.68,.09,.05),'#cdeee6',[.52,1.74,0],null,null,{outline:ol}));
  frDoor.add(mk(GK.rb(.05,.45,.06,.025),'#ffffff',[.92,1.05,.07]));frDoor.add(mk(GK.rb(.05,.3,.06,.025),'#ffffff',[.92,1.6,.07]));
  const drw=decal(texDrawing(),.3,.3,[.35,.95,.05],[0,0,.08]);drw.trans=false;frDoor.add(drw);
  for(const [x,y,c] of [[.2,1.3,'#ff7aa2'],[.55,1.25,'#7ad0ff'],[.6,.55,'#ffd54f'],[.3,1.8,'#a5d66b']])frDoor.add(mk(GK.cyl(1,1),c,[x,y,.055],[.045,.02,.045],[Math.PI/2,0,0]));
  W.frDoor=frDoor;glowAdd('kulkas',frBody,...frDoor.children.slice(0,2));
  // --- Lemari
  const lm=grp([-2.75,0,-3.0]);root.add(lm);
  const lmBody=mk(GK.rb(1.0,2.0,.75,.08),'#e8b98a',[0,1.0,0],null,null,{outline:ol});lm.add(lmBody);
  lm.add(mk(GK.rb(1.1,.1,.82,.04),'#c98f5e',[0,2.03,0],null,null,{outline:ol}));
  lm.add(mk(GK.rb(.88,1.8,.05,.02),'#a8774e',[0,1.0,.35]));
  for(const y of [.45,.95,1.45]){lm.add(mk(GK.rb(.86,.04,.5,.01),'#d9a477',[0,y,.15]));}
  for(const [x,y,c,h] of [[-.25,.6,'#fff3c4',.22],[0,.58,'#f8bbd0',.18],[.25,.6,'#c8e6c9',.22],[-.2,1.1,'#ffe0b2',.25],[.18,1.08,'#d1c4e9',.2],[0,1.6,'#b3e5fc',.24]]){lm.add(mk(GK.cyl(1,1),c,[x,y+h/2-.06,.18],[.1,h,.1]));lm.add(mk(GK.cyl(1,1),'#c98f5e',[x,y+h-.04,.18],[.105,.04,.105]));}
  const dL=grp([-.5,0,.4]),dR=grp([.5,0,.4]);lm.add(dL,dR);
  dL.add(mk(GK.rb(.49,1.86,.06,.03),'#f2c9a0',[.245,1.0,0],null,null,{outline:ol}));dL.add(mk(GK.rb(.36,.7,.02,.02),'#e8b98a',[.245,1.4,.035]));dL.add(mk(GK.rb(.36,.7,.02,.02),'#e8b98a',[.245,.55,.035]));dL.add(mk(GK.sph(),'#ffd54f',[.43,1.0,.06],[.035,.035,.035]));
  dR.add(mk(GK.rb(.49,1.86,.06,.03),'#f2c9a0',[-.245,1.0,0],null,null,{outline:ol}));dR.add(mk(GK.rb(.36,.7,.02,.02),'#e8b98a',[-.245,1.4,.035]));dR.add(mk(GK.rb(.36,.7,.02,.02),'#e8b98a',[-.245,.55,.035]));dR.add(mk(GK.sph(),'#ffd54f',[-.43,1.0,.06],[.035,.035,.035]));
  W.lmL=dL;W.lmR=dR;glowAdd('lemari',lmBody,dL.children[0],dR.children[0]);
  // --- Worktop
  root.add(mk(GK.rb(3.9,.84,.8,.05),'#fdf6ee',[-.2,.42,-2.95],null,null,{outline:ol}));
  for(let i=0;i<5;i++){const d=mk(GK.rb(.7,.62,.04,.04),'#ffd1dc',[-1.8+i*.8,.44,-2.54]);root.add(d);W.themed.push(d);root.add(mk(GK.rb(.18,.035,.03,.015),'#ffffff',[-1.8+i*.8,.68,-2.51]));}
  root.add(mk(GK.rb(4.0,.08,.9,.03),'#f6e6d2',[-.2,.88,-2.93],null,null,{outline:ol}));
  // shelf above
  root.add(mk(GK.rb(3.0,.07,.35,.03),'#c98f5e',[-.4,2.15,-3.2],null,null,{outline:ol}));
  for(const [x,c,h] of [[-1.7,'#ffcc80',.3],[-1.35,'#f48fb1',.24],[-1.0,'#a5d6a7',.34],[.1,'#90caf9',.26],[.45,'#fff59d',.3]]){root.add(mk(GK.cyl(1,1),c,[x,2.19+h/2,-3.2],[.11,h,.11],null,{outline:.008}));root.add(mk(GK.cyl(1,1),'#ffffff',[x,2.21+h,-3.2],[.115,.05,.115]));}
  root.add(mk(GK.cyl(.8,1),'#e07a5f',[-.45,2.32,-3.2],[.14,.28,.14],null,{outline:.008}));
  for(const [x,y,s] of [[-.45,2.55,.16],[-.55,2.62,.1],[-.35,2.62,.11]])root.add(mk(GK.sph(),'#6cc06a',[x,y,-3.2],[s,s,s],null,{outline:.008}));
  root.add(mk(GK.rb(.5,.4,.05,.04),'#ffffff',[-1.0,2.65,-3.32]));const pic=decal(texCroissant(),.36,.3,[-1.0,2.65,-3.29]);pic.trans=false;root.add(pic);
  // utensil rail
  root.add(mk(GK.cyl(1,1),'#c0c0c8',[-.2,1.7,-3.3],[.015,1.4,.015],[0,0,Math.PI/2]));
  for(const [x,c,t] of [[-.7,'#ff8fa6','l'],[-.35,'#8fd3c7','s'],[0,'#ffd56b','w'],[.3,'#b39ddb','l']]){root.add(mk(GK.cyl(1,1),c,[x,1.52,-3.29],[.015,.34,.015]));root.add(t==='l'?mk(GK.sph(),c,[x,1.33,-3.27],[.06,.05,.04]):mk(GK.rb(.1,.12,.015,.01),c,[x,1.3,-3.28]));}
  // range hood
  root.add(mk(GK.cyl(.25,1),'#f2f2f5',[.85,2.55,-3.1],[.55,.45,.3],null,{outline:ol}));root.add(mk(GK.rb(.3,.6,.25,.03),'#f2f2f5',[.85,3.05,-3.2]));
  // --- Gelas station + water jug
  const gx=-1.6;
  root.add(mk(GK.cyl(1,1),'#ffd1dc',[gx,.935,-2.75],[.2,.02,.2]));
  const glass=mk(GK.cyl(1,.85,false),'#dff3ff',[gx,1.1,-2.75],[.14,.32,.14],null,{alpha:.38,dbl:true,outline:0});root.add(glass);
  root.add(mk(GK.cyl(1,1),'#dff3ff',[gx,.95,-2.75],[.12,.012,.12],null,{alpha:.5}));
  const liq=mk(GK.cyl(1,.85),'#a85a1c',[gx,.96,-2.75],[.122,.02,.122],null,{alpha:.85});root.add(liq);W.liq=liq;
  root.add(mk(GK.cyl(1,1),'#cfe9ff',[gx-.05,1.15,-3.12],[.18,.42,.18],null,{alpha:.45,outline:.008}));
  root.add(mk(GK.cyl(1,1),'#8fd3ff',[gx-.05,1.08,-3.12],[.16,.26,.16],null,{alpha:.7}));
  root.add(mk(GK.rb(.06,.06,.12,.02),'#ff8fa6',[gx-.05,.98,-2.98]));
  glowAdd('gelas',glass);
  // --- Talenan
  const tx=-.6;const board=mk(GK.rb(.66,.05,.44,.02),'#d9a066',[tx,.945,-2.78],null,null,{outline:ol});board.tex=texWood('#e0a96e','#c98a4e');board.trans=false;root.add(board);
  root.add(mk(GK.rb(.04,.015,.24,.006),'#d0d4dc',[tx+.42,.935,-2.78],null,[0,.2,0]));root.add(mk(GK.rb(.05,.03,.12,.01),'#5a3a2a',[tx+.45,.94,-2.6],null,[0,.2,0]));
  glowAdd('talenan',board);
  // --- Kompor
  const kx=.85;root.add(mk(GK.rb(1.3,.07,.64,.03),'#3a3a48',[kx,.955,-2.8],null,null,{outline:ol}));
  for(let i=0;i<4;i++)root.add(mk(GK.cyl(1,1),'#ffd1dc',[kx-.45+i*.3,.96,-2.49],[.04,.04,.04],[Math.PI/2,0,0]));
  W.flames={};
  for(const [k,x] of [['wajan',kx-.35],['panci',kx+.35]]){root.add(mk(GK.tor(.14,.025),'#1e1e26',[x,.995,-2.8]));const fg=grp([x,.995,-2.8]);root.add(fg);fg.visible=false;
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;fg.add(mk(GK.cyl(0,1,true,8),i%2?'#ffb74d':'#64b5ff',[Math.sin(a)*.14,.04,Math.cos(a)*.14],[.03,.08,.03],null,{flat:.7,emis:[.25,.2,.1]}));}W.flames[k]=fg;}
  // wajan
  const wj=grp([kx-.35,1.04,-2.8]);root.add(wj);
  const wjB=mk(GK.hemi(),'#4a4a58',[0,.1,0],[.3,.12,.3],null,{dbl:true,outline:ol});wj.add(wjB);
  wj.add(mk(GK.cyl(1,1),'#e0b84a',[0,.04,0],[.25,.006,.25],null,{alpha:.75}));
  wj.add(mk(GK.tor(.3,.012),'#5a5a6a',[0,.1,0]));
  wj.add(mk(GK.cyl(1,1),'#8a5a3a',[-.46,.11,.0],[.03,.3,.03],[0,0,Math.PI/2+.15],{outline:.008}));
  glowAdd('wajan',wjB);
  // panci
  const pc=grp([kx+.35,1.13,-2.8]);root.add(pc);
  const pcB=mk(GK.cyl(1,1,false),'#ff8a8a',[0,0,0],[.22,.24,.22],null,{dbl:true,outline:ol});pc.add(pcB);
  pc.add(mk(GK.cyl(1,1),'#ff8a8a',[0,-.115,0],[.22,.01,.22]));
  pc.add(mk(GK.tor(.22,.018),'#ffb3b3',[0,.12,0]));
  const water=mk(GK.cyl(1,1),'#8fd3ff',[0,.06,0],[.205,.006,.205],null,{alpha:.85});pc.add(water);W.water=water;
  for(const s of [-1,1])pc.add(mk(GK.rb(.1,.035,.05,.015),'#ff6f6f',[s*.27,.08,0]));
  glowAdd('panci',pcB);
  // --- Oven
  const ov=grp([2.3,0,-2.95]);root.add(ov);
  const ovB=mk(GK.rb(1.0,.95,.8,.08),'#ffd7a8',[0,.475,0],null,null,{outline:ol});ov.add(ovB);
  ov.add(mk(GK.rb(1.04,.06,.84,.03),'#f6e6d2',[0,.93,0]));
  ov.add(mk(GK.rb(.86,.6,.05,.04),'#ffbf80',[0,.42,.4],null,null,{outline:.008}));
  const win=mk(GK.rb(.62,.32,.03,.03),'#3a2a30',[0,.43,.43]);ov.add(win);W.ovWin=win;
  ov.add(mk(GK.cyl(1,1),'#ffffff',[0,.78,.45],[.025,.6,.025],[0,0,Math.PI/2],{outline:.006}));
  for(const x of [-.3,-.1,.1,.3])ov.add(mk(GK.cyl(1,1),'#ff8fa6',[x,.86,.41],[.035,.03,.035],[Math.PI/2,0,0]));
  glowAdd('oven',ovB);
  // --- Sampah
  const tb=grp([3.25,0,-2.6]);root.add(tb);
  const tbB=mk(GK.cyl(1,.82),'#9ad3a8',[0,.32,0],[.26,.64,.26],null,{outline:ol});tb.add(tbB);
  tb.add(mk(GK.cyl(1,1),'#7cc08e',[0,.66,0],[.28,.05,.28],null,{outline:ol}));tb.add(mk(GK.rb(.16,.04,.05,.02),'#5aa06e',[0,.71,0]));
  const rc=decal(texRecycle(),.22,.22,[0,.35,.245]);tb.add(rc);
  glowAdd('sampah',tbB);
  // --- Tray cart
  const tc=grp([3.05,0,-1.55]);root.add(tc);
  tc.add(mk(GK.rb(.95,.06,.72,.03),'#c98f5e',[0,.8,0],null,null,{outline:ol}));
  tc.add(mk(GK.rb(.9,.04,.66,.02),'#c98f5e',[0,.3,0]));
  for(const [x,z] of [[-.42,-.3],[.42,-.3],[-.42,.3],[.42,.3]]){tc.add(mk(GK.cyl(1,1),'#a8774e',[x,.4,z],[.025,.8,.025]));tc.add(mk(GK.sph(),'#555',[x,.04,z],[.04,.04,.04]));}
  const tray=grp([3.05,.85,-1.55]);root.add(tray);W.tray=tray;W.trayHome=[3.05,.85,-1.55];
  const trB=mk(GK.rb(.66,.035,.46,.03),'#ff9fb2',[0,0,0],null,null,{outline:ol});tray.add(trB);
  tray.add(mk(GK.rb(.6,.02,.4,.02),'#ffd1dc',[0,.02,0]));
  for(const s of [-1,1])tray.add(mk(GK.rb(.04,.06,.2,.02),'#ff8fa6',[s*.32,.04,0]));
  glowAdd('tray',trB);
  // --- Cafe side
  const ctr=mk(GK.rb(.9,.7,6.4,.06),'#ffd1dc',[5.1,.35,0],null,null,{outline:ol});root.add(ctr);
  for(let i=0;i<6;i++)root.add(mk(GK.rb(.04,.46,.8,.03),'#ffffff',[4.64,.36,-2.6+i*1.04]));
  root.add(mk(GK.rb(1.05,.08,6.6,.03),'#c98b5a',[5.1,.74,0],null,null,{outline:ol}));
  W.mats=[];for(const z of [-1.7,0,1.7]){const m=mk(GK.cyl(1,1),'#fff6e8',[5.05,.785,z],[.3,.01,.3]);root.add(m);W.mats.push(m);}
  // register & pastry case
  root.add(mk(GK.rb(.45,.25,.5,.05),'#8fd3c7',[5.15,.91,-2.85],null,null,{outline:ol}));root.add(mk(GK.rb(.3,.2,.04,.02),'#2f4a3f',[5.0,1.12,-2.85],null,[0,Math.PI/2-.3,0]));
  root.add(mk(GK.rb(.6,.45,1.1,.05),'#e6f6ff',[5.1,1.01,2.75],null,null,{alpha:.35,outline:.008}));
  for(const [z,y] of [[2.45,.86],[2.75,.86],[3.05,.86],[2.6,1.06],[2.9,1.06]])root.add(mk(GK.tor(.07,.04),'#e5a14a',[5.1,y,z],[1,.7,1.3],[0,0,0],{outline:.006}));
  // cafe wall decor
  for(const z of [-2.2,2.2]){const w=decal(texSky(),1.6,1.4,[8.48,2.2,z],[0,-Math.PI/2,0]);w.trans=false;w.flat=.6;root.add(w);root.add(mk(GK.rb(.08,1.55,1.75,.03),'#ffffff',[8.52,2.2,z]));}
  const brd=decal(texBoard(),2.0,1.0,[8.47,2.5,0],[0,-Math.PI/2,0]);brd.trans=false;brd.flat=.5;root.add(brd);
  const gar2=decal(texGarland(),7,.75,[8.47,3.6,0.6],[0,-Math.PI/2,0]);gar2.flat=.4;root.add(gar2);
  for(const z of [-3.6,4.6]){root.add(mk(GK.cyl(.8,1),'#e07a5f',[7.9,.25,z],[.3,.5,.3],null,{outline:ol}));for(const [x,y,s] of [[0,.7,.35],[-.15,.95,.25],[.15,.9,.25],[0,1.15,.22]])root.add(mk(GK.sph(),'#6cc06a',[7.9+x,y,z],[s,s,s],null,{outline:ol}));}
  // cafe tables
  for(const [x,z] of [[7.4,-1.0],[7.4,2.4]]){root.add(mk(GK.cyl(1,1),'#ffffff',[x,.75,z],[.45,.05,.45],null,{outline:ol}));root.add(mk(GK.cyl(1,1),'#c98f5e',[x,.37,z],[.05,.74,.05]));root.add(mk(GK.sph(),'#ff9eb0',[x,.83,z],[.08,.1,.08]));}
  // rug in kitchen
  const rug=mk(GK.cyl(1,1),'#ffe0ea',[0,.006,-1.2],[1.8,.008,.9],null,{flat:.2});root.add(rug);W.themed.push(rug);
  W.setTheme=(L)=>{const c=hex(L.wall),a=hex(L.acc);wallB.color=c;wallL.color=c;W.themed.forEach((n,i)=>{if(n===wallB||n===wallL)return;n.color=V3.lerp(a,[1,1,1],n===rug?.7:.45);});};
  return W;}
