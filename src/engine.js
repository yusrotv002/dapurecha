'use strict';
/* ================= Mini WebGL toon engine ================= */
const V3={
  sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],
  scale:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
  dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  len:a=>Math.hypot(a[0],a[1],a[2]),
  norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];},
  lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],
  dist:(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),
};
const M4={
  I(){const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m;},
  mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++){const b0=b[c*4],b1=b[c*4+1],b2=b[c*4+2],b3=b[c*4+3];
    o[c*4]=a[0]*b0+a[4]*b1+a[8]*b2+a[12]*b3;o[c*4+1]=a[1]*b0+a[5]*b1+a[9]*b2+a[13]*b3;
    o[c*4+2]=a[2]*b0+a[6]*b1+a[10]*b2+a[14]*b3;o[c*4+3]=a[3]*b0+a[7]*b1+a[11]*b2+a[15]*b3;}return o;},
  trs(p,r,s){const cx=Math.cos(r[0]),sx=Math.sin(r[0]),cy=Math.cos(r[1]),sy=Math.sin(r[1]),cz=Math.cos(r[2]),sz=Math.sin(r[2]);
    const m=new Float32Array(16);
    const r00=cy*cz+sy*sx*sz,r01=-cy*sz+sy*sx*cz,r02=sy*cx,r10=cx*sz,r11=cx*cz,r12=-sx,r20=-sy*cz+cy*sx*sz,r21=sy*sz+cy*sx*cz,r22=cy*cx;
    m[0]=r00*s[0];m[1]=r10*s[0];m[2]=r20*s[0];m[4]=r01*s[1];m[5]=r11*s[1];m[6]=r21*s[1];
    m[8]=r02*s[2];m[9]=r12*s[2];m[10]=r22*s[2];m[12]=p[0];m[13]=p[1];m[14]=p[2];m[15]=1;return m;},
  persp(fovy,asp,n,f){const t=1/Math.tan(fovy/2),m=new Float32Array(16);m[0]=t/asp;m[5]=t;m[10]=(f+n)/(n-f);m[11]=-1;m[14]=2*f*n/(n-f);return m;},
  lookAt(e,c,u){const z=V3.norm(V3.sub(e,c)),x=V3.norm(V3.cross(u,z)),y=V3.cross(z,x);const m=new Float32Array(16);
    m[0]=x[0];m[4]=x[1];m[8]=x[2];m[1]=y[0];m[5]=y[1];m[9]=y[2];m[2]=z[0];m[6]=z[1];m[10]=z[2];
    m[12]=-V3.dot(x,e);m[13]=-V3.dot(y,e);m[14]=-V3.dot(z,e);m[15]=1;return m;},
  inv(a){const a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15];
    const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
    let det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;det=1/det;const o=new Float32Array(16);
    o[0]=(a11*b11-a12*b10+a13*b09)*det;o[1]=(a02*b10-a01*b11-a03*b09)*det;o[2]=(a31*b05-a32*b04+a33*b03)*det;o[3]=(a22*b04-a21*b05-a23*b03)*det;
    o[4]=(a12*b08-a10*b11-a13*b07)*det;o[5]=(a00*b11-a02*b08+a03*b07)*det;o[6]=(a32*b02-a30*b05-a33*b01)*det;o[7]=(a20*b05-a22*b02+a23*b01)*det;
    o[8]=(a10*b10-a11*b08+a13*b06)*det;o[9]=(a01*b08-a00*b10-a03*b06)*det;o[10]=(a30*b04-a31*b02+a33*b00)*det;o[11]=(a21*b02-a20*b04-a23*b00)*det;
    o[12]=(a11*b07-a10*b09-a12*b06)*det;o[13]=(a00*b09-a01*b07+a02*b06)*det;o[14]=(a31*b01-a30*b03-a32*b00)*det;o[15]=(a20*b03-a21*b01+a22*b00)*det;return o;},
  nmat(m){const a00=m[0],a01=m[1],a02=m[2],a10=m[4],a11=m[5],a12=m[6],a20=m[8],a21=m[9],a22=m[10];
    const b01=a22*a11-a12*a21,b11=-a22*a10+a12*a20,b21=a21*a10-a11*a20;let det=a00*b01+a01*b11+a02*b21;det=1/(det||1e-9);
    const o0=b01*det,o1=(-a22*a01+a02*a21)*det,o2=(a12*a01-a02*a11)*det,o3=b11*det,o4=(a22*a00-a02*a20)*det,o5=(-a12*a00+a02*a10)*det,o6=b21*det,o7=(-a21*a00+a01*a20)*det,o8=(a11*a00-a01*a10)*det;
    return new Float32Array([o0,o3,o6,o1,o4,o7,o2,o5,o8]);},
  xp(m,p){const x=p[0],y=p[1],z=p[2];return [m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];},
  xh(m,p){const x=p[0],y=p[1],z=p[2];const w=m[3]*x+m[7]*y+m[11]*z+m[15];return [(m[0]*x+m[4]*y+m[8]*z+m[12])/w,(m[1]*x+m[5]*y+m[9]*z+m[13])/w,(m[2]*x+m[6]*y+m[10]*z+m[14])/w];},
};
function hex(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];}

/* ---------- geometry generators (interleaved pos,normal,uv) ---------- */
const GEN={
  sphere(ws=24,hs=16,la0=-Math.PI/2,la1=Math.PI/2,lo0=-Math.PI,lo1=Math.PI){const P=[],I=[];
    for(let j=0;j<=hs;j++){const la=la0+(la1-la0)*j/hs,cl=Math.cos(la),sl=Math.sin(la);
      for(let i=0;i<=ws;i++){const lo=lo0+(lo1-lo0)*i/ws;const x=cl*Math.sin(lo),y=sl,z=cl*Math.cos(lo);P.push(x,y,z,x,y,z,i/ws,j/hs);}}
    for(let j=0;j<hs;j++)for(let i=0;i<ws;i++){const a=j*(ws+1)+i,b=a+ws+1;I.push(a,a+1,b,a+1,b+1,b);}return {v:P,i:I};},
  cyl(rt,rb,h,seg=24,caps=true){const P=[],I=[];const ny=rb-rt,nl=Math.hypot(h,ny);
    for(let j=0;j<=1;j++){const y=-h/2+j*h,r=j?rt:rb;for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2,s=Math.sin(a),c=Math.cos(a);P.push(r*s,y,r*c,s*h/nl,ny/nl,c*h/nl,i/seg,j);}}
    for(let i=0;i<seg;i++){const a=i,b=i+seg+1;I.push(a,a+1,b,a+1,b+1,b);}
    if(caps){for(const top of [0,1]){const y=top?h/2:-h/2,r=top?rt:rb;if(r<=0)continue;const c0=P.length/8;P.push(0,y,0,0,top?1:-1,0,.5,.5);
      for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2;P.push(r*Math.sin(a),y,r*Math.cos(a),0,top?1:-1,0,.5+.5*Math.sin(a),.5+.5*Math.cos(a));}
      for(let i=0;i<seg;i++){if(top)I.push(c0,c0+1+i,c0+2+i);else I.push(c0,c0+2+i,c0+1+i);}}}
    return {v:P,i:I};},
  torus(R,r,seg=32,ts=12){const P=[],I=[];for(let j=0;j<=ts;j++){const v=j/ts*Math.PI*2,cv=Math.cos(v),sv=Math.sin(v);
      for(let i=0;i<=seg;i++){const u=i/seg*Math.PI*2,su=Math.sin(u),cu=Math.cos(u);const nx=su*cv,ny=sv,nz=cu*cv;P.push(R*su+r*nx,r*ny,R*cu+r*nz,nx,ny,nz,i/seg,j/ts);}}
    for(let j=0;j<ts;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,a+1,b,a+1,b+1,b);}return {v:P,i:I};},
  plane(w,h){const x=w/2,y=h/2;return {v:[-x,-y,0,0,0,1,0,0, x,-y,0,0,0,1,1,0, x,y,0,0,0,1,1,1, -x,y,0,0,0,1,0,1],i:[0,1,2,0,2,3]};},
  rbox(w,h,d,r,m=3){const e=[w/2,h/2,d/2];r=Math.min(r,e[0],e[1],e[2]);
    const list=k=>{const E=e[k],L=[];for(let s=0;s<=m;s++)L.push(-(E-r)-r*Math.cos(s/m*Math.PI/2));
      for(let s=0;s<=m;s++){if(s===0&&E-r<1e-5)continue;L.push((E-r)+r*Math.sin(s/m*Math.PI/2));}return L;};
    const faces=[[0,1,[0,0,-1],[0,1,0]],[0,-1,[0,0,1],[0,1,0]],[1,1,[1,0,0],[0,0,-1]],[1,-1,[1,0,0],[0,0,1]],[2,1,[1,0,0],[0,1,0]],[2,-1,[-1,0,0],[0,1,0]]];
    const P=[],I=[];
    for(const [ax,sg,U,Vv] of faces){const uk=U.findIndex(x=>x!==0),vk=Vv.findIndex(x=>x!==0);const Lu=list(uk),Lv=list(vk);const base=P.length/8;
      for(let j=0;j<Lv.length;j++)for(let i=0;i<Lu.length;i++){const p=[0,0,0];p[ax]=sg*e[ax];p[uk]=U[uk]*Lu[i];p[vk]=Vv[vk]*Lv[j];
        const inn=[0,1,2].map(k=>Math.max(-(e[k]-r),Math.min(e[k]-r,p[k])));let n=V3.sub(p,inn);const l=V3.len(n);
        if(l<1e-7){n=[0,0,0];n[ax]=sg;}else n=V3.scale(n,1/l);const q=r>0?V3.add(inn,V3.scale(n,r)):p;
        const uu=U[uk]>0?(Lu[i]+e[uk])/(2*e[uk]):1-(Lu[i]+e[uk])/(2*e[uk]);
        P.push(q[0],q[1],q[2],n[0],n[1],n[2],uu,(Lv[j]+e[vk])/(2*e[vk]));}
      const nu=Lu.length;for(let j=0;j<Lv.length-1;j++)for(let i=0;i<nu-1;i++){const a=base+j*nu+i,b=a+nu;I.push(a,a+1,b,a+1,b+1,b);}}
    return {v:P,i:I};},
};

class Node{
  constructor(geo,color){this.geo=geo||null;this.color=color||[1,1,1];this.pos=[0,0,0];this.rot=[0,0,0];this.scl=[1,1,1];
    this.children=[];this.alpha=1;this.outline=0;this.tex=null;this.emis=[0,0,0];this.visible=true;this.flat=0;this.bill=false;this.dbl=false;this.parent=null;}
  add(...c){for(const n of c){n.parent=this;this.children.push(n);}return this;}
  remove(n){const i=this.children.indexOf(n);if(i>=0)this.children.splice(i,1);n.parent=null;}
}
const OLC=hex('#4a3038');

class Renderer{
  constructor(cv){this.cv=cv;const gl=cv.getContext('webgl',{antialias:true,alpha:false})||cv.getContext('experimental-webgl');if(!gl)throw new Error('NO_WEBGL');this.gl=gl;
    const vs=`attribute vec3 aP;attribute vec3 aN;attribute vec2 aU;uniform mat4 uM,uVP;uniform mat3 uNM;uniform float uOut;
varying vec3 vN;varying vec3 vW;varying vec2 vU;
void main(){vec3 n=normalize(uNM*aN);vec4 w=uM*vec4(aP,1.0);w.xyz+=n*uOut;vN=n;vW=w.xyz;vU=aU;gl_Position=uVP*w;}`;
    const fs=`precision mediump float;varying vec3 vN;varying vec3 vW;varying vec2 vU;
uniform vec3 uC;uniform float uA;uniform vec3 uE;uniform sampler2D uT;uniform float uTM;uniform vec3 uL;uniform vec3 uCam;uniform float uFlat;uniform float uOL;
void main(){vec4 tc=texture2D(uT,vU);vec3 base=mix(uC,tc.rgb*uC,uTM);float a=uA*mix(1.0,tc.a,uTM);if(a<0.03)discard;
if(uOL>0.5){gl_FragColor=vec4(uC,1.0);return;}
vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;float d=dot(n,normalize(uL));
float s=mix(0.70,1.0,smoothstep(-0.02,0.12,d))+0.07*smoothstep(0.72,0.78,d);
vec3 v=normalize(uCam-vW);float rim=pow(1.0-max(dot(n,v),0.0),3.0)*0.16;float hemi=0.5+0.5*n.y;
vec3 col=base*s*vec3(1.0,0.97,0.93)*(0.92+0.08*hemi)+rim*vec3(1.0,0.93,0.88);
col=mix(col,base,uFlat)+uE;gl_FragColor=vec4(col,a);}`;
    const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
    const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);gl.useProgram(p);this.p=p;
    const L={};for(const n of ['aP','aN','aU'])L[n]=gl.getAttribLocation(p,n);
    for(const n of ['uM','uVP','uNM','uOut','uC','uA','uE','uT','uTM','uL','uCam','uFlat','uOL'])L[n]=gl.getUniformLocation(p,n);this.L=L;
    gl.enableVertexAttribArray(L.aP);gl.enableVertexAttribArray(L.aN);gl.enableVertexAttribArray(L.aU);
    this.white=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.white);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));
    gl.uniform1i(L.uT,0);gl.enable(gl.DEPTH_TEST);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);this.cache={};this.bg=[1,.9,.85];}
  geo(key,fn){if(this.cache[key])return this.cache[key];const d=fn();const gl=this.gl;
    const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d.v),gl.STATIC_DRAW);
    const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(d.i),gl.STATIC_DRAW);
    return this.cache[key]={vb,ib,n:d.i.length};}
  tex(cv){if(cv._t&&!cv._dirty)return cv._t;const gl=this.gl;const t=cv._t||gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    const pot=(cv.width&(cv.width-1))===0&&(cv.height&(cv.height-1))===0;
    if(pot){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);}else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    cv._t=t;cv._dirty=false;return t;}
  setCam(cam){const W=this.cv.width,H=this.cv.height;cam.aspect=W/H;cam.proj=M4.persp(cam.fovy,cam.aspect,0.1,80);cam.view=M4.lookAt(cam.eye,cam.target,[0,1,0]);
    cam.vp=M4.mul(cam.proj,cam.view);cam.inv=M4.inv(cam.vp);const v=cam.view;cam.right=[v[0],v[4],v[8]];cam.up=[v[1],v[5],v[9]];cam.back=[v[2],v[6],v[10]];}
  render(root,cam){const gl=this.gl;this.setCam(cam);gl.viewport(0,0,this.cv.width,this.cv.height);gl.clearColor(this.bg[0],this.bg[1],this.bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const L=this.L;gl.uniformMatrix4fv(L.uVP,false,cam.vp);gl.uniform3fv(L.uL,V3.norm([-0.45,1.0,0.65]));gl.uniform3fv(L.uCam,cam.eye);
    const op=[],tr=[],ov=[];
    const walk=(n,pm)=>{if(!n.visible)return;let m;
      if(n.bill){const wp=M4.xp(pm,n.pos);const a=n.rot[2],ca=Math.cos(a),sa=Math.sin(a);const r=V3.add(V3.scale(cam.right,ca),V3.scale(cam.up,sa)),u=V3.add(V3.scale(cam.right,-sa),V3.scale(cam.up,ca)),b=cam.back;
        m=new Float32Array([r[0]*n.scl[0],r[1]*n.scl[0],r[2]*n.scl[0],0,u[0]*n.scl[1],u[1]*n.scl[1],u[2]*n.scl[1],0,b[0],b[1],b[2],0,wp[0],wp[1],wp[2],1]);}
      else m=M4.mul(pm,M4.trs(n.pos,n.rot,n.scl));
      if(n.geo){const it={n,m};if(n.top){ov.push(it);}else if(n.alpha<1||n.tex&&n.trans!==false||n.trans){const c=[m[12],m[13],m[14]];it.d=V3.dot(V3.sub(c,cam.eye),V3.scale(cam.back,-1));tr.push(it);}else op.push(it);}
      for(const c of n.children)walk(c,m);};
    walk(root,M4.I());
    gl.disable(gl.BLEND);gl.depthMask(true);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
    for(const it of op)this.draw(it,false);
    gl.cullFace(gl.FRONT);for(const it of op)if(it.n.outline>0)this.draw(it,true);
    gl.cullFace(gl.BACK);gl.enable(gl.BLEND);gl.depthMask(false);tr.sort((a,b)=>b.d-a.d);
    for(const it of tr){this.draw(it,false);}gl.disable(gl.DEPTH_TEST);for(const it of ov)this.draw(it,false);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);}
  draw(it,ol){const n=it.n,gl=this.gl,L=this.L;
    if(n.dbl&&!ol)gl.disable(gl.CULL_FACE);
    gl.uniformMatrix4fv(L.uM,false,it.m);gl.uniformMatrix3fv(L.uNM,false,M4.nmat(it.m));gl.uniform1f(L.uOut,ol?n.outline:0);gl.uniform1f(L.uOL,ol?1:0);
    gl.uniform3fv(L.uC,ol?(n.olc||OLC):n.color);gl.uniform1f(L.uA,ol?1:n.alpha);gl.uniform3fv(L.uE,n.emis);gl.uniform1f(L.uFlat,n.flat||0);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,n.tex&&!ol?this.tex(n.tex):this.white);gl.uniform1f(L.uTM,n.tex&&!ol?1:0);
    const g=n.geo;gl.bindBuffer(gl.ARRAY_BUFFER,g.vb);gl.vertexAttribPointer(L.aP,3,gl.FLOAT,false,32,0);gl.vertexAttribPointer(L.aN,3,gl.FLOAT,false,32,12);gl.vertexAttribPointer(L.aU,2,gl.FLOAT,false,32,24);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.ib);gl.drawElements(gl.TRIANGLES,g.n,gl.UNSIGNED_SHORT,0);
    if(n.dbl&&!ol)gl.enable(gl.CULL_FACE);}
}
