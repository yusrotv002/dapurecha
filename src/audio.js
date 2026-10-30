'use strict';
/* ================= Procedural audio ================= */
const AU={ctx:null,musicOn:true,sfxOn:true,loops:{},buf:{},
  init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}
    try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();}catch(e){return;}
    const c=this.ctx;this.master=c.createGain();this.master.gain.value=.85;this.master.connect(c.destination);
    this.sg=c.createGain();this.sg.connect(this.master);this.mg=c.createGain();this.mg.gain.value=this.musicOn?.28:0;this.mg.connect(this.master);
    this.sg.gain.value=this.sfxOn?1:0;
    const sr=c.sampleRate;const mkb=(sec,fn)=>{const b=c.createBuffer(1,Math.floor(sr*sec),sr);const d=b.getChannelData(0);fn(d,sr);return b;};
    this.buf.noise=mkb(2,d=>{for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;});
    this.buf.sizzle=mkb(2,(d,sr)=>{let cr=0,amp=0;for(let i=0;i<d.length;i++){if(Math.random()<.0018){cr=Math.floor(sr*(.002+Math.random()*.006));amp=.3+Math.random()*.5;}let v=(Math.random()*2-1)*.07;if(cr>0){v+=(Math.random()*2-1)*amp;amp*=.995;cr--;}d[i]=v;}});
    this.buf.boil=mkb(2,(d,sr)=>{let t=0;while(t<d.length){const len=Math.floor(sr*(.02+Math.random()*.035)),f0=180+Math.random()*200,f1=f0*(2+Math.random());let ph=0;for(let k=0;k<len&&t+k<d.length;k++){const p=k/len;ph+=2*Math.PI*(f0+(f1-f0)*p)/sr;d[t+k]+=Math.sin(ph)*Math.sin(Math.PI*p)*.35;}t+=Math.floor(sr*(.03+Math.random()*.11));}
      let lp=0;for(let i=0;i<d.length;i++){lp+=((Math.random()*2-1)-lp)*.05;d[i]+=lp*.15;}});
    this.buf.oven=mkb(2,(d,sr)=>{for(let i=0;i<d.length;i++){const t=i/sr;d[i]=Math.sin(2*Math.PI*100*t)*.12+Math.sin(2*Math.PI*150*t)*.05+(Math.random()*2-1)*.02;}});
    this.startMusic();},
  now(){return this.ctx?this.ctx.currentTime:0;},
  env(g,t,a,v,dur){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);},
  tone(f,dur,type,vol,when,f2,dest){if(!this.ctx)return;const c=this.ctx,t=when||c.currentTime;const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    this.env(g,t,.008,vol||.2,dur);o.connect(g);g.connect(dest||this.sg);o.start(t);o.stop(t+dur+.05);},
  nz(dur,ft,f,q,vol,when,f2,dest){if(!this.ctx)return;const c=this.ctx,t=when||c.currentTime;const s=c.createBufferSource();s.buffer=this.buf.noise;const fl=c.createBiquadFilter();fl.type=ft||'bandpass';fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);fl.Q.value=q||1;
    const g=c.createGain();this.env(g,t,.01,vol||.2,dur);s.connect(fl);fl.connect(g);g.connect(dest||this.sg);s.start(t,Math.random());s.stop(t+dur+.05);},
  loop(key,name,vol){if(!this.ctx||this.loops[key])return;const c=this.ctx;const s=c.createBufferSource();s.buffer=this.buf[name];s.loop=true;const g=c.createGain();g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(vol,c.currentTime+.25);
    let node=s;if(name==='sizzle'){const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=1800;s.connect(f);node=f;}
    node.connect(g);g.connect(this.sg);s.start();this.loops[key]={s,g};},
  stop(key){const l=this.loops[key];if(!l)return;const c=this.ctx;l.g.gain.cancelScheduledValues(c.currentTime);l.g.gain.setValueAtTime(l.g.gain.value,c.currentTime);l.g.gain.linearRampToValueAtTime(0,c.currentTime+.3);l.s.stop(c.currentTime+.35);delete this.loops[key];},
  stopAll(){for(const k of Object.keys(this.loops))this.stop(k);},
  buzz(on,count){if(!this.ctx)return;const c=this.ctx;
    if(on&&!this.bz){const o=c.createOscillator(),o2=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.value=210;o2.type='sawtooth';o2.frequency.value=470;l.frequency.value=9;lg.gain.value=18;l.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);
      f.type='lowpass';f.frequency.value=1400;g.gain.value=0;o.connect(f);o2.connect(f);f.connect(g);g.connect(this.sg);o.start();o2.start();l.start();this.bz={o,o2,l,g};}
    if(this.bz){const v=on?Math.min(.05,.025+.01*count):0;this.bz.g.gain.setTargetAtTime(v,c.currentTime,.1);}},
  // --- sfx
  pop(){this.tone(520,.12,'sine',.22,0,880);},
  reject(){this.tone(300,.18,'square',.07,0,180);},
  pour(){const t=this.now();this.nz(.9,'bandpass',500,4,.22,t,1500);for(let i=0;i<6;i++)this.tone(400+Math.random()*500,.05,'sine',.06,t+.1+i*.12,900);},
  chop(){const t=this.now();for(let i=0;i<3;i++){this.tone(190,.06,'triangle',.25,t+i*.13,120);this.nz(.04,'highpass',2000,1,.15,t+i*.13);}},
  ignite(){const t=this.now();this.nz(.03,'highpass',3000,1,.35,t);this.nz(.03,'highpass',3000,1,.3,t+.08);this.nz(.6,'lowpass',400,1,.25,t+.12,2400);},
  ting(){const t=this.now();this.tone(1760,1.2,'sine',.2,t);this.tone(2637,.9,'sine',.08,t);},
  slap(){const t=this.now();this.nz(.08,'highpass',1200,1,.6,t);this.tone(160,.15,'sine',.4,t,60);},
  door(){const t=this.now();this.tone(1046,.4,'sine',.15,t);this.tone(784,.6,'sine',.15,t+.22);},
  swoosh(){this.nz(.45,'bandpass',300,2,.25,0,2200);},
  open(){const t=this.now();this.tone(140,.15,'triangle',.15,t,90);this.nz(.2,'bandpass',800,2,.08,t);},
  ew(){this.tone(260,.35,'sawtooth',.06,0,140);},
  trash(){const t=this.now();this.nz(.25,'lowpass',900,1,.3,t,200);this.tone(120,.2,'triangle',.2,t+.05,70);},
  happy(){const t=this.now();[523,659,784,1046].forEach((f,i)=>this.tone(f,.18,'triangle',.18,t+i*.08));},
  star(i){const t=this.now();this.tone(880*Math.pow(1.26,i),.4,'triangle',.2,t);this.tone(1760*Math.pow(1.26,i),.3,'sine',.08,t);},
  fanfare(){const t=this.now();[[523,0],[659,.15],[784,.3],[1046,.45],[784,.65],[1046,.8]].forEach(([f,d])=>{this.tone(f,.3,'square',.06,t+d);this.tone(f,.35,'triangle',.15,t+d);});},
  yay(){const t=this.now();this.tone(620,.12,'square',.05,t,980);this.tone(780,.2,'square',.05,t+.13,1300);this.tone(620,.12,'triangle',.12,t,980);this.tone(780,.2,'triangle',.12,t+.13,1300);},
  oops(){const t=this.now();this.tone(720,.14,'triangle',.14,t,480);this.tone(520,.22,'triangle',.14,t+.15,330);},
  click(){this.tone(900,.05,'sine',.12,0,1200);},
  // --- music
  startMusic(){const c=this.ctx;const beat=60/100;let next=c.currentTime+.15,step=0;
    const M=[72,0,76,0,79,0,76,74,72,0,74,76,74,0,0,0, 69,0,72,0,76,0,74,72,69,0,72,0,74,0,0,0, 65,0,69,72,74,0,72,69,72,0,74,0,76,0,0,0, 74,0,76,74,71,0,74,0,79,0,76,0,74,72,0,0];
    const CH=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]];const mf=m=>440*Math.pow(2,(m-69)/12);
    const sched=(s,t)=>{const ch=CH[Math.floor(s/16)%4];const m=M[s];if(m)this.tone(mf(m),beat*.45,'triangle',.16,t,0,this.mg);
      if(s%4===0)this.tone(mf(ch[0]-24),beat*.9,'sine',.28,t,0,this.mg);
      if(s%8===2||s%8===6)for(const n of ch)this.tone(mf(n),beat*.3,'sine',.07,t,0,this.mg);
      if(s%2===1)this.nz(.03,'highpass',7000,1,.04,t,0,this.mg);};
    setInterval(()=>{if(!this.ctx)return;while(next<c.currentTime+.3){sched(step,next);next+=beat/2;step=(step+1)%64;}if(next<c.currentTime)next=c.currentTime+.05;},80);},
  setMusic(on){this.musicOn=on;if(this.mg)this.mg.gain.setTargetAtTime(on?.28:0,this.ctx.currentTime,.1);},
  setSfx(on){this.sfxOn=on;if(this.sg)this.sg.gain.setTargetAtTime(on?1:0,this.ctx.currentTime,.05);},
};
