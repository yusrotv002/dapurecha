'use strict';
/* ================= Canvas-drawn textures & icons ================= */
const EMOJI_FONT='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';
function cvs(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function ell(x,cx,cy,rx,ry,fill,stroke,lw){x.beginPath();x.ellipse(cx,cy,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);if(fill){x.fillStyle=fill;x.fill();}if(stroke){x.lineWidth=lw||2;x.strokeStyle=stroke;x.stroke();}}
function rr(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath();}

function drawCustom(x,d){
  if(d.t==='glass'){
    x.save();x.beginPath();x.moveTo(34,22);x.lineTo(94,22);x.lineTo(86,114);x.lineTo(42,114);x.closePath();x.fillStyle='rgba(225,245,255,.7)';x.fill();x.clip();
    const g=x.createLinearGradient(0,40,0,114);g.addColorStop(0,d.top);g.addColorStop(1,d.liq);x.fillStyle=g;x.fillRect(20,40,90,80);
    if(d.cendol){for(let i=0;i<9;i++){ell(x,46+(i*13)%38,96+(i%3)*6,5,3,'#4caf50');}x.fillStyle='rgba(120,70,30,.6)';x.fillRect(20,104,90,12);}
    if(d.ice){x.fillStyle='rgba(255,255,255,.75)';x.save();x.translate(52,52);x.rotate(.3);x.fillRect(-9,-9,18,18);x.restore();x.save();x.translate(76,60);x.rotate(-.4);x.fillRect(-8,-8,16,16);x.restore();}
    x.restore();x.lineWidth=4;x.strokeStyle='#7aa6c2';x.beginPath();x.moveTo(34,22);x.lineTo(42,114);x.lineTo(86,114);x.lineTo(94,22);x.stroke();
    x.fillStyle='rgba(255,255,255,.55)';x.fillRect(40,30,6,70);
    x.save();x.translate(80,10);x.rotate(.35);x.fillStyle='#ff5b7a';x.fillRect(-4,0,8,60);x.fillStyle='#fff';for(let i=0;i<4;i++)x.fillRect(-4,6+i*14,8,6);x.restore();
    if(d.slice){x.save();x.translate(36,26);ell(x,0,0,14,14,'#ffb02e','#ff8a00',3);x.strokeStyle='#ffe2a0';x.lineWidth=2;for(let a=0;a<6;a++){x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*11,Math.sin(a)*11);x.stroke();}x.restore();}
  } else if(d.t==='bowl'){
    ell(x,64,106,52,12,'rgba(0,0,0,.12)');
    x.beginPath();x.moveTo(12,62);x.quadraticCurveTo(14,112,64,112);x.quadraticCurveTo(114,112,116,62);x.closePath();x.fillStyle='#fff';x.fill();x.lineWidth=3;x.strokeStyle='#d9c6b5';x.stroke();
    x.fillStyle='#ff8fa6';x.fillRect(22,84,84,6);
    ell(x,64,62,52,16,d.soup,'#d9c6b5',3);
    if(d.noodles){x.strokeStyle='#ffe08a';x.lineWidth=4;for(let i=0;i<4;i++){x.beginPath();x.moveTo(26+i*6,62);x.bezierCurveTo(40,52+i*3,60,72-i*3,98-i*5,60);x.stroke();}}
    if(d.balls){for(const [bx,by] of [[46,56],[66,52],[84,60],[58,66]]){ell(x,bx,by,10,9,'#8d5a3a');ell(x,bx-3,by-3,3,2,'rgba(255,255,255,.5)');}}
    if(d.greens){for(const [bx,by] of [[36,62],[92,56]]){ell(x,bx,by,6,4,'#5cbf4f');}}
    if(d.blobs){for(let i=0;i<12;i++){ell(x,28+(i*17)%72,54+(i%3)*7,6,3.5,d.blobs);}}
  } else if(d.t==='tumpeng'){
    ell(x,64,104,58,16,'#7cc576');ell(x,64,100,54,14,'#fff','#e2d2c2',2);
    x.beginPath();x.moveTo(64,14);x.lineTo(98,96);x.quadraticCurveTo(64,108,30,96);x.closePath();const g=x.createLinearGradient(30,0,98,0);g.addColorStop(0,'#ffe066');g.addColorStop(.5,'#fff3a6');g.addColorStop(1,'#f5c518');x.fillStyle=g;x.fill();x.strokeStyle='#d9a800';x.lineWidth=2;x.stroke();
    ell(x,64,16,6,6,'#ff4d4d');
    ell(x,24,96,12,7,'#fff','#ffd54f',3);ell(x,24,96,5,4,'#ffb300');ell(x,104,96,13,8,'#c8763a');ell(x,90,104,8,4,'#ff5252');ell(x,40,106,9,4,'#66bb6a');
  }
}
const ICON={};
function iconCanvas(id){if(ICON[id])return ICON[id];const it=ITEMS[id];const c=cvs(128,128),x=c.getContext('2d');
  if(it.dish&&!it.draw){ell(x,64,104,54,14,'rgba(0,0,0,.12)');ell(x,64,96,58,22,'#fff','#e8d6c6',3);ell(x,64,94,40,13,'#f7efe7');}
  if(it.bg){ell(x,64,66,56,56,it.bg,'#fff',6);}
  if(it.draw)drawCustom(x,it.draw);
  else{x.textAlign='center';x.textBaseline='middle';x.font=(it.dish?76:84)+'px '+EMOJI_FONT;
    if(it.fried){x.filter='sepia(.6) saturate(1.6) brightness(.95)';}
    x.fillText(it.e,64,it.dish?64:70);x.filter='none';}
  ICON[id]=c;return c;}
function iconURL(id){const c=iconCanvas(id);return c._u||(c._u=c.toDataURL());}
function iconImg(id,cls){return `<img class="${cls||'ic'}" src="${iconURL(id)}" alt="${ITEMS[id].n}">`;}

/* ---- faces (sphere patch lon -55..55, lat -50..40, 3px/deg) ---- */
const FACE={};
function faceCanvas(o){const key=JSON.stringify(o);if(FACE[key])return FACE[key];const c=cvs(330,270),x=c.getContext('2d');
  const iris=o.iris||'#6b3a1f',lash='#3a2025';const ex=[105,225],ey=150;
  // blush
  for(const bx of [66,264]){const g=x.createRadialGradient(bx,192,2,bx,192,30);g.addColorStop(0,'rgba(255,120,150,.55)');g.addColorStop(1,'rgba(255,120,150,0)');x.fillStyle=g;x.fillRect(bx-34,160,68,64);}
  x.lineCap='round';x.lineJoin='round';
  // brows
  x.strokeStyle=o.brow||'#6b4030';x.lineWidth=5;
  for(const k of [0,1]){const cx=ex[k],s=k?1:-1;x.beginPath();if(o.eye==='sad'){x.moveTo(cx-24*s,98);x.quadraticCurveTo(cx,92,cx+20*s,84);}else{x.moveTo(cx-22,94);x.quadraticCurveTo(cx,82,cx+22,92);}x.stroke();}
  for(const k of [0,1]){const cx=ex[k],s=k?1:-1;
    if(o.eye==='closed'){x.strokeStyle=lash;x.lineWidth=6;x.beginPath();x.moveTo(cx-24,ey+6);x.quadraticCurveTo(cx,ey+18,cx+24,ey+6);x.stroke();}
    else if(o.eye==='happy'){x.strokeStyle=lash;x.lineWidth=7;x.beginPath();x.moveTo(cx-22,ey+10);x.quadraticCurveTo(cx,ey-18,cx+22,ey+10);x.stroke();}
    else if(o.eye==='squeeze'){x.strokeStyle=lash;x.lineWidth=6;x.beginPath();x.moveTo(cx-20*s,ey-14);x.lineTo(cx+16*s,ey);x.lineTo(cx-20*s,ey+14);x.stroke();}
    else{const h=o.eye==='sad'?30:38,w=o.small?17:22;
      ell(x,cx,ey+2,w+3,h+2,'#fff');
      const g=x.createLinearGradient(0,ey-h,0,ey+h);g.addColorStop(0,'#2a1612');g.addColorStop(.45,iris);g.addColorStop(1,o.iris2||'#d9944a');ell(x,cx,ey+4,w,h-2,null);x.fillStyle=g;x.fill();
      ell(x,cx,ey+6,w*.5,h*.45,'#24120e');
      ell(x,cx-w*.38,ey-h*.38,w*.42,h*.26,'#fff');ell(x,cx+w*.4,ey+h*.42,w*.22,h*.13,'rgba(255,255,255,.9)');
      x.strokeStyle=lash;x.lineWidth=o.lashes?8:6;x.beginPath();x.ellipse(cx,ey+4,w+2,h,0,Math.PI*1.08,Math.PI*1.92);x.stroke();
      if(o.lashes){x.lineWidth=5;x.beginPath();x.moveTo(cx+(w)*s,ey-h*.55);x.lineTo(cx+(w+12)*s,ey-h*.8);x.stroke();x.beginPath();x.moveTo(cx+(w-4)*s,ey-h*.78);x.lineTo(cx+(w+6)*s,ey-h-6);x.stroke();}
    }}
  // mouth
  x.strokeStyle='#8a3a3a';x.lineWidth=5;const my=212;
  if(o.mouth==='open'){x.beginPath();x.moveTo(146,my-4);x.quadraticCurveTo(165,my-6,184,my-4);x.quadraticCurveTo(178,my+22,165,my+22);x.quadraticCurveTo(152,my+22,146,my-4);x.fillStyle='#d9505e';x.fill();x.stroke();ell(x,165,my+14,8,5,'#ff9aa8');}
  else if(o.mouth==='frown'){x.beginPath();x.moveTo(152,my+8);x.quadraticCurveTo(165,my-4,178,my+8);x.stroke();}
  else if(o.mouth==='o'){ell(x,165,my+4,7,9,'#d9505e','#8a3a3a',4);}
  else if(o.mouth==='flat'){x.beginPath();x.moveTo(154,my+2);x.lineTo(176,my+2);x.stroke();}
  else{x.beginPath();x.moveTo(150,my-2);x.quadraticCurveTo(165,my+14,180,my-2);x.stroke();}
  FACE[key]=c;return c;}

/* ---- misc textures ---- */
function texCroissant(){const c=cvs(256,256),x=c.getContext('2d');x.lineJoin='round';
  ell(x,128,128,118,118,'#fff8ec','#f0d9b8',6);
  const segs=[[-1.0,40],[-0.5,52],[0,58],[0.5,52],[1.0,40]];
  for(const [a,r] of segs){x.save();x.translate(128+Math.sin(a)*58,150-Math.cos(a)*58+20);x.rotate(a);
    x.beginPath();x.ellipse(0,0,r*.55,r*.85,0,0,Math.PI*2);const g=x.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#ffcf6e');g.addColorStop(1,'#d9822b');x.fillStyle=g;x.fill();x.lineWidth=6;x.strokeStyle='#8a4a1a';x.stroke();
    x.strokeStyle='rgba(255,240,200,.8)';x.lineWidth=4;x.beginPath();x.moveTo(-r*.3,-r*.4);x.quadraticCurveTo(0,-r*.55,r*.3,-r*.4);x.stroke();x.restore();}
  return c;}
function texFloor(){const c=cvs(1024,1024),x=c.getContext('2d');const n=24,s=1024/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){x.fillStyle=(i+j)%2?'#fff3e4':'#f7d9c4';x.fillRect(i*s,j*s,s,s);}
  x.strokeStyle='rgba(180,140,120,.25)';x.lineWidth=2;for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*s,0);x.lineTo(i*s,1024);x.stroke();x.beginPath();x.moveTo(0,i*s);x.lineTo(1024,i*s);x.stroke();}return c;}
function texSplash(col){const c=cvs(512,128),x=c.getContext('2d');x.fillStyle='#e9e1d8';x.fillRect(0,0,512,128);const w=42,h=21;
  for(let r=0;r<7;r++)for(let k=-1;k<14;k++){const X=k*w+(r%2?w/2:0)+2,Y=r*h-3;rr(x,X,Y,w-4,h-4,5);x.fillStyle=(k+r)%3===0?col:'#fffaf4';x.fill();}return c;}
function texSky(){const c=cvs(256,256),x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#8fd3ff');g.addColorStop(1,'#dff4ff');x.fillStyle=g;x.fillRect(0,0,256,256);
  for(const [cx,cy,s] of [[70,70,1],[190,120,.8],[120,190,.6]]){x.fillStyle='rgba(255,255,255,.95)';for(const [dx,dy,r] of [[0,0,22],[22,4,18],[-22,6,16],[10,-12,16]])ell(x,cx+dx*s,cy+dy*s,r*s,r*s,'#fff');}
  ell(x,40,210,60,30,'#a5dc8a');ell(x,200,220,80,34,'#8fd174');
  x.strokeStyle='#fff';x.lineWidth=14;x.strokeRect(7,7,242,242);x.beginPath();x.moveTo(128,0);x.lineTo(128,256);x.moveTo(0,128);x.lineTo(256,128);x.stroke();return c;}
function texBoard(){const c=cvs(512,256),x=c.getContext('2d');rr(x,6,6,500,244,24);x.fillStyle='#2f4a3f';x.fill();x.lineWidth=12;x.strokeStyle='#b5835a';x.stroke();
  x.fillStyle='#fff6e0';x.textAlign='center';x.font='bold 64px "Baloo 2",Verdana,sans-serif';x.fillText('Kafe Echa',256,92);
  x.font='30px "Baloo 2",Verdana,sans-serif';x.fillStyle='#ffd6e0';x.fillText('Masakan Nusantara',256,140);x.fillStyle='#bfe8d0';x.fillText('♥  Buka Setiap Hari  ♥',256,190);
  return c;}
function texGarland(){const c=cvs(1024,128),x=c.getContext('2d');const cols=['#ff9eb0','#ffd56b','#8fd3c7','#b9a3f0','#ffb38a'];x.strokeStyle='#c99';x.lineWidth=4;x.beginPath();x.moveTo(0,14);x.quadraticCurveTo(512,44,1024,14);x.stroke();
  for(let i=0;i<16;i++){const X=i*64+32,Y=14+30*Math.sin(Math.PI*i/15)*.9;x.beginPath();x.moveTo(X-24,Y);x.lineTo(X+24,Y);x.lineTo(X,Y+70);x.closePath();x.fillStyle=cols[i%5];x.fill();}return c;}
function texClock(){const c=cvs(256,256),x=c.getContext('2d');ell(x,128,128,120,120,'#fff','#ff9eb0',16);x.fillStyle='#6b4a4a';for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ell(x,128+Math.sin(a)*92,128-Math.cos(a)*92,6,6,'#6b4a4a');}
  x.strokeStyle='#6b4a4a';x.lineCap='round';x.lineWidth=10;x.beginPath();x.moveTo(128,128);x.lineTo(128,64);x.stroke();x.lineWidth=7;x.beginPath();x.moveTo(128,128);x.lineTo(180,150);x.stroke();ell(x,128,128,10,10,'#ff7a9a');return c;}
function texDrawing(){const c=cvs(128,128),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,128,128);ell(x,64,60,26,26,'#ffd36b');x.strokeStyle='#ffb300';x.lineWidth=4;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;x.beginPath();x.moveTo(64+Math.cos(a)*32,60+Math.sin(a)*32);x.lineTo(64+Math.cos(a)*44,60+Math.sin(a)*44);x.stroke();}
  x.fillStyle='#ff6b8a';x.font='bold 20px sans-serif';x.textAlign='center';x.fillText('ECHA',64,118);return c;}
function texRadial(col,a){const c=cvs(64,64),x=c.getContext('2d');const g=x.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.fillRect(0,0,64,64);return c;}
function texStar(){const c=cvs(64,64),x=c.getContext('2d');x.beginPath();for(let i=0;i<10;i++){const r=i%2?12:30,a=i/10*Math.PI*2-Math.PI/2;x.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r);}x.closePath();x.fillStyle='#ffd84d';x.fill();x.lineWidth=3;x.strokeStyle='#fff';x.stroke();return c;}
function texHeart(){const c=cvs(64,64),x=c.getContext('2d');x.fillStyle='#ff5f8f';x.beginPath();x.moveTo(32,56);x.bezierCurveTo(4,36,6,10,22,10);x.bezierCurveTo(28,10,32,16,32,20);x.bezierCurveTo(32,16,36,10,42,10);x.bezierCurveTo(58,10,60,36,32,56);x.fill();ell(x,22,22,5,4,'rgba(255,255,255,.7)');return c;}
function texStink(){const c=cvs(128,128),x=c.getContext('2d');x.strokeStyle='#7cbf3a';x.lineWidth=8;x.lineCap='round';for(const ox of [36,64,92]){x.beginPath();x.moveTo(ox,118);for(let y=118;y>14;y-=4)x.lineTo(ox+Math.sin(y/12)*10,y);x.stroke();}return c;}
function texSplat(){const c=cvs(128,128),x=c.getContext('2d');x.fillStyle='rgba(255,255,255,.95)';x.font='bold 46px "Baloo 2",Verdana,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='#ff6b8a';x.strokeText('PLAK!',64,64);x.fillText('PLAK!',64,64);return c;}
function texWood(a,b){const c=cvs(256,256),x=c.getContext('2d');x.fillStyle=a;x.fillRect(0,0,256,256);x.strokeStyle=b;x.lineWidth=3;for(let i=0;i<14;i++){x.beginPath();const y=i*19+5;x.moveTo(0,y);x.bezierCurveTo(80,y+6,170,y-6,256,y+3);x.stroke();}return c;}
function texRecycle(){const c=cvs(128,128),x=c.getContext('2d');x.fillStyle='#fff';x.font='bold 70px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('♻',64,68);return c;}

/* ---- rumah adat (SVG) ---- */
function houseSVG(i){const S=(b)=>`<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="94" rx="54" ry="5" fill="#000" opacity=".12"/>${b}</svg>`;
  const H=[
    // 1 Rumah Kayu
    `<rect x="24" y="44" width="72" height="48" fill="#c98a55" stroke="#7a4a2a" stroke-width="2"/>${[52,60,68,76,84].map(y=>`<line x1="24" x2="96" y1="${y}" y2="${y}" stroke="#a86d3f" stroke-width="1.5"/>`).join('')}<polygon points="16,46 60,12 104,46" fill="#e8575a" stroke="#a83a3d" stroke-width="2"/><rect x="52" y="64" width="16" height="28" fill="#7a4a2a"/><rect x="30" y="56" width="14" height="12" fill="#bfe8ff" stroke="#fff" stroke-width="2"/><rect x="76" y="56" width="14" height="12" fill="#bfe8ff" stroke="#fff" stroke-width="2"/><rect x="78" y="18" width="8" height="18" fill="#8a5a3a"/>`,
    // 2 Joglo
    `<rect x="26" y="58" width="68" height="34" fill="#f6ead2" stroke="#9a6a3a" stroke-width="2"/><polygon points="10,62 34,40 86,40 110,62" fill="#7a4a2a"/><polygon points="34,40 46,18 74,18 86,40" fill="#5c3418"/>${[30,46,74,90].map(x=>`<rect x="${x-2}" y="60" width="4" height="32" fill="#5c3418"/>`).join('')}<rect x="52" y="68" width="16" height="24" fill="#9a6a3a"/>`,
    // 3 Gadang
    `<rect x="22" y="56" width="76" height="26" fill="#c0392b" stroke="#7a1f16" stroke-width="2"/>${[30,44,58,72,86].map(x=>`<rect x="${x}" y="60" width="8" height="8" fill="#f4c542"/>`).join('')}<path d="M8 22 Q22 46 34 48 Q46 30 60 46 Q74 30 86 48 Q98 46 112 22 Q104 54 94 56 L26 56 Q16 54 8 22Z" fill="#3b2a1a"/><rect x="28" y="82" width="4" height="10" fill="#5c3418"/><rect x="88" y="82" width="4" height="10" fill="#5c3418"/><rect x="58" y="82" width="4" height="10" fill="#5c3418"/>`,
    // 4 Panggung
    `${[30,48,72,90].map(x=>`<rect x="${x-2}" y="62" width="4" height="30" fill="#7a4a2a"/>`).join('')}<rect x="24" y="40" width="72" height="24" fill="#e2b07a" stroke="#8a5a3a" stroke-width="2"/><polygon points="16,42 60,14 104,42" fill="#4caf7a" stroke="#2e7d55" stroke-width="2"/><rect x="54" y="46" width="12" height="18" fill="#8a5a3a"/>${[0,1,2,3].map(k=>`<line x1="${64+k*3}" y1="${66+k*7}" x2="${76+k*3}" y2="${66+k*7}" stroke="#7a4a2a" stroke-width="3"/>`).join('')}<line x1="62" y1="64" x2="74" y2="92" stroke="#7a4a2a" stroke-width="3"/><line x1="76" y1="64" x2="88" y2="92" stroke="#7a4a2a" stroke-width="3"/>`,
    // 5 Kebaya (Betawi)
    `<rect x="26" y="46" width="68" height="46" fill="#fffaf0" stroke="#3aa58a" stroke-width="2"/><polygon points="12,50 30,22 90,22 108,50" fill="#2bb5a0" stroke="#1b7d6e" stroke-width="2"/><path d="M14 50 ${[...Array(12)].map((_,k)=>`L${18+k*8} 56 L${22+k*8} 50`).join(' ')}" fill="none" stroke="#1b7d6e" stroke-width="2"/><rect x="52" y="64" width="16" height="28" fill="#3aa58a"/><rect x="32" y="60" width="12" height="16" fill="#bfe8ff" stroke="#3aa58a" stroke-width="2"/><rect x="76" y="60" width="12" height="16" fill="#bfe8ff" stroke="#3aa58a" stroke-width="2"/>`,
    // 6 Limas
    `<rect x="24" y="52" width="72" height="40" fill="#8e3b46" stroke="#5a1e28" stroke-width="2"/><polygon points="14,54 40,36 80,36 106,54" fill="#c0603a"/><polygon points="34,38 48,24 72,24 86,38" fill="#a84a2a"/><polygon points="48,26 60,10 72,26" fill="#8a3a1e"/><rect x="52" y="66" width="16" height="26" fill="#f4c542"/>${[30,40,80,90].map(x=>`<rect x="${x-2}" y="60" width="4" height="26" fill="#f4c542"/>`).join('')}`,
    // 7 Honai
    `<ellipse cx="60" cy="74" rx="34" ry="20" fill="#7a4a2a"/><rect x="26" y="62" width="68" height="30" fill="#7a4a2a"/><path d="M18 64 Q60 -6 102 64 Z" fill="#d9b25a" stroke="#a8862e" stroke-width="2"/>${[...Array(9)].map((_,k)=>`<line x1="${26+k*9}" y1="62" x2="${40+k*5}" y2="${20+Math.abs(k-4)*5}" stroke="#b8902e" stroke-width="1.5"/>`).join('')}<rect x="52" y="72" width="16" height="20" rx="8" fill="#3b2a1a"/>`,
    // 8 Tongkonan
    `<rect x="32" y="54" width="56" height="24" fill="#a7281e" stroke="#3b1a10" stroke-width="2"/>${[0,1,2,3,4,5].map(k=>`<polygon points="${36+k*9},58 ${40+k*9},66 ${36+k*9},74 ${32+k*9},66" fill="#f4c542"/>`).join('')}<path d="M4 18 Q30 48 60 46 Q90 48 116 18 Q104 54 88 56 L32 56 Q16 54 4 18Z" fill="#2b1d14"/>${[38,60,82].map(x=>`<rect x="${x-2}" y="78" width="5" height="14" fill="#3b1a10"/>`).join('')}`,
    // 9 Lamin
    `<rect x="8" y="50" width="104" height="30" fill="#fff6e0" stroke="#222" stroke-width="2"/>${[0,1,2,3,4,5].map(k=>`<path d="M${14+k*17} 70 q4 -14 8 0 q4 -14 8 0" fill="none" stroke="#222" stroke-width="2"/><circle cx="${22+k*17}" cy="60" r="3" fill="#e0b83a"/>`).join('')}<polygon points="2,52 18,32 102,32 118,52" fill="#3b2a1a"/>${[14,40,66,92,106].map(x=>`<rect x="${x-2}" y="80" width="4" height="12" fill="#3b2a1a"/>`).join('')}<rect x="52" y="60" width="16" height="20" fill="#e0b83a" stroke="#222"/>`,
    // 10 Bali
    `<rect x="8" y="70" width="104" height="22" fill="#c96a4a"/><polygon points="16,70 20,30 30,26 40,30 44,70" fill="#b85a3a" stroke="#7a3a24" stroke-width="2"/><polygon points="76,70 80,30 90,26 100,30 104,70" fill="#b85a3a" stroke="#7a3a24" stroke-width="2"/>${[34,46,58].map(y=>`<line x1="20" x2="40" y1="${y}" y2="${y}" stroke="#7a3a24"/><line x1="80" x2="100" y1="${y}" y2="${y}" stroke="#7a3a24"/>`).join('')}<rect x="48" y="52" width="24" height="18" fill="#f6e0b0"/><path d="M40 54 Q60 24 80 54Z" fill="#c9a050"/><circle cx="60" cy="18" r="6" fill="#ffd84d"/><rect x="54" y="58" width="12" height="12" fill="#7a3a24"/>`,
  ];return S(H[i]);}
