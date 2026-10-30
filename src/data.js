'use strict';
/* ================= Game data ================= */
const ITEMS={
  // Kulkas
  es:{n:'Es Batu',e:'🧊',src:'kulkas'}, jeruk:{n:'Jeruk',e:'🍊',src:'kulkas'}, telur:{n:'Telur',e:'🥚',src:'kulkas'},
  ayam:{n:'Ayam',e:'🍗',src:'kulkas',bg:'#ffd6dc'}, daging:{n:'Daging',e:'🥩',src:'kulkas'}, sayur:{n:'Sayur',e:'🥬',src:'kulkas'},
  santan:{n:'Santan',e:'🥥',src:'kulkas'}, pisang:{n:'Pisang',e:'🍌',src:'kulkas'}, susu:{n:'Susu',e:'🥛',src:'kulkas'},
  sirup:{n:'Sirup Merah',e:'🍓',src:'kulkas'},
  // Lemari
  teh:{n:'Daun Teh',e:'🍃',src:'lemari'}, gula:{n:'Gula',e:'🍬',src:'lemari'}, gulamerah:{n:'Gula Merah',e:'🟤',src:'lemari'},
  roti:{n:'Roti',e:'🍞',src:'lemari'}, nasi:{n:'Nasi',e:'🍚',src:'lemari'}, mie:{n:'Mie',e:'🍜',src:'lemari'},
  tepung:{n:'Tepung',e:'🌾',src:'lemari'}, kacang:{n:'Kacang',e:'🥜',src:'lemari'}, bumbu:{n:'Bumbu',e:'🌶️',src:'lemari'},
  kecap:{n:'Kecap',e:'🍶',src:'lemari'}, tusuk:{n:'Tusuk Sate',e:'🥢',src:'lemari'}, pandan:{n:'Daun Pandan',e:'🌿',src:'lemari'},
  cokelat:{n:'Cokelat',e:'🍫',src:'lemari'},
  // Setengah jadi
  mie_rebus:{n:'Mie Rebus',e:'🍜',bg:'#ffe6a8'}, adonan:{n:'Adonan Martabak',e:'🥣',bg:'#fff1c9'},
  sate_mentah:{n:'Sate Mentah',e:'🍢',bg:'#ffd0d6'}, cendol:{n:'Cendol',draw:{t:'bowl',soup:'#d8f5c4',blobs:'#43a047'}},
  kuah_soto:{n:'Kuah Soto',e:'🍲',bg:'#ffe08a'}, adonan_klepon:{n:'Adonan Klepon',e:'🟢',bg:'#d9f5c9'},
  pentol:{n:'Pentol',e:'🧆',bg:'#f1d9c0'}, sayur_rebus:{n:'Sayur Rebus',e:'🥬',bg:'#c9f0c0'},
  daging_bumbu:{n:'Daging Bumbu',e:'🥩',bg:'#ffc89a'}, campuran_doger:{n:'Campuran Doger',draw:{t:'bowl',soup:'#ff9fc4'}},
  nasi_kuning:{n:'Nasi Kuning',e:'🍚',bg:'#ffe14d'}, ayam_goreng:{n:'Ayam Goreng',e:'🍗',bg:'#ffcf70'},
  // Makanan & minuman jadi
  es_teh:{n:'Es Teh Manis',dish:1,draw:{t:'glass',liq:'#a85a1c',top:'#e3a25a',ice:1}},
  pisang_goreng:{n:'Pisang Goreng',e:'🍌',dish:1,fried:1},
  es_jeruk:{n:'Es Jeruk',dish:1,draw:{t:'glass',liq:'#ff9416',top:'#ffc860',ice:1,slice:1}},
  roti_bakar:{n:'Roti Bakar',e:'🍞',dish:1},
  telur_dadar:{n:'Telur Dadar',e:'🍳',dish:1},
  teh_hangat:{n:'Teh Hangat',e:'🍵',dish:1},
  nasi_goreng:{n:'Nasi Goreng',e:'🍛',dish:1},
  es_campur:{n:'Es Campur',e:'🍧',dish:1},
  mie_goreng:{n:'Mie Goreng',e:'🍝',dish:1},
  martabak:{n:'Martabak Manis',e:'🥞',dish:1},
  sate_ayam:{n:'Sate Ayam',e:'🍢',dish:1},
  es_cendol:{n:'Es Cendol',dish:1,draw:{t:'glass',liq:'#7b4a26',top:'#f5ecd8',ice:1,cendol:1}},
  soto_ayam:{n:'Soto Ayam',e:'🍲',dish:1},
  klepon:{n:'Klepon',e:'🍡',dish:1},
  bakso:{n:'Bakso',dish:1,draw:{t:'bowl',soup:'#e9b867',balls:1,noodles:1,greens:1}},
  gado_gado:{n:'Gado-gado',e:'🥗',dish:1},
  rendang:{n:'Rendang',e:'🍖',dish:1},
  es_doger:{n:'Es Doger',e:'🍨',dish:1},
  tumpeng:{n:'Nasi Tumpeng Mini',dish:1,draw:{t:'tumpeng'}},
};
const VNAME={gelas:'Gelas',talenan:'Talenan',wajan:'Wajan',panci:'Panci',oven:'Oven'};
const RECIPES=[
  {out:'es_teh',v:'gelas',in:['teh','gula','es'],t:0},
  {out:'pisang_goreng',v:'wajan',in:['pisang','tepung'],t:4},
  {out:'es_jeruk',v:'gelas',in:['jeruk','gula','es'],t:0},
  {out:'roti_bakar',v:'oven',in:['roti','cokelat'],t:5},
  {out:'telur_dadar',v:'wajan',in:['telur','bumbu'],t:4},
  {out:'teh_hangat',v:'panci',in:['teh','gula'],t:4},
  {out:'nasi_goreng',v:'wajan',in:['nasi','telur','kecap'],t:5},
  {out:'es_campur',v:'gelas',in:['es','susu','pisang'],t:0},
  {out:'mie_rebus',v:'panci',in:['mie'],t:4},
  {out:'mie_goreng',v:'wajan',in:['mie_rebus','kecap','sayur'],t:4},
  {out:'adonan',v:'talenan',in:['tepung','telur','susu'],t:0},
  {out:'martabak',v:'wajan',in:['adonan','cokelat'],t:5},
  {out:'sate_mentah',v:'talenan',in:['ayam','tusuk'],t:0},
  {out:'sate_ayam',v:'oven',in:['sate_mentah','kacang'],t:5},
  {out:'cendol',v:'panci',in:['tepung','pandan'],t:4},
  {out:'es_cendol',v:'gelas',in:['cendol','santan','gulamerah','es'],t:0},
  {out:'kuah_soto',v:'panci',in:['ayam','bumbu','sayur'],t:5},
  {out:'soto_ayam',v:'talenan',in:['kuah_soto','nasi','telur'],t:0},
  {out:'adonan_klepon',v:'talenan',in:['tepung','pandan','gulamerah'],t:0},
  {out:'klepon',v:'panci',in:['adonan_klepon'],t:4},
  {out:'pentol',v:'talenan',in:['daging','tepung'],t:0},
  {out:'bakso',v:'panci',in:['pentol','bumbu','sayur'],t:5},
  {out:'sayur_rebus',v:'panci',in:['sayur','telur'],t:4},
  {out:'gado_gado',v:'talenan',in:['sayur_rebus','kacang','kecap'],t:0},
  {out:'daging_bumbu',v:'talenan',in:['daging','bumbu','santan'],t:0},
  {out:'rendang',v:'wajan',in:['daging_bumbu'],t:7},
  {out:'campuran_doger',v:'talenan',in:['santan','sirup'],t:0},
  {out:'es_doger',v:'gelas',in:['campuran_doger','es','susu'],t:0},
  {out:'nasi_kuning',v:'talenan',in:['nasi','bumbu'],t:0},
  {out:'ayam_goreng',v:'wajan',in:['ayam','bumbu'],t:4},
  {out:'tumpeng',v:'talenan',in:['nasi_kuning','ayam_goreng','sayur'],t:0},
];
const RBY={};for(const r of RECIPES)RBY[r.out]=r;
const ALL_DISHES=Object.keys(ITEMS).filter(k=>ITEMS[k].dish);
const LEVELS=[
  {house:'Rumah Kayu',     dishes:['es_teh','pisang_goreng'], cust:3,conc:1,multi:0,  bugEvery:24,bugFly:7.5,bugs:['lalat'],maxBugs:1,pat:75,wall:'#ffe4d6',acc:'#ff9eb0'},
  {house:'Rumah Joglo',    dishes:['es_jeruk','roti_bakar'],  cust:3,conc:1,multi:0,  bugEvery:22,bugFly:7,  bugs:['lalat'],maxBugs:1,pat:70,wall:'#e8f3dc',acc:'#8cc97a'},
  {house:'Rumah Gadang',   dishes:['telur_dadar','teh_hangat'],cust:4,conc:1,multi:0, bugEvery:20,bugFly:6.8,bugs:['lalat','nyamuk'],maxBugs:1,pat:70,wall:'#fff0cc',acc:'#f2b544'},
  {house:'Rumah Panggung', dishes:['nasi_goreng','es_campur'],cust:4,conc:2,multi:0,  bugEvery:18,bugFly:6.4,bugs:['lalat','nyamuk'],maxBugs:2,pat:70,wall:'#dff1f7',acc:'#6cc1de'},
  {house:'Rumah Kebaya',   dishes:['mie_goreng','martabak'],  cust:5,conc:2,multi:0,  bugEvery:16,bugFly:6,  bugs:['lalat','nyamuk'],maxBugs:2,pat:65,wall:'#f3e6fb',acc:'#b98be0'},
  {house:'Rumah Limas',    dishes:['sate_ayam','es_cendol'],  cust:5,conc:2,multi:0,  bugEvery:15,bugFly:5.6,bugs:['lalat','nyamuk','semut'],maxBugs:2,pat:65,wall:'#ffe0e0',acc:'#e57373'},
  {house:'Rumah Honai',    dishes:['soto_ayam','klepon'],     cust:6,conc:2,multi:.3, bugEvery:14,bugFly:5.2,bugs:['lalat','nyamuk','semut'],maxBugs:2,pat:60,wall:'#f5ead8',acc:'#c89a5a'},
  {house:'Rumah Tongkonan',dishes:['bakso','gado_gado'],      cust:6,conc:3,multi:.35,bugEvery:12,bugFly:4.8,bugs:['lalat','nyamuk','semut'],maxBugs:3,pat:60,wall:'#e3ecff',acc:'#7d97e8'},
  {house:'Rumah Lamin',    dishes:['rendang','es_doger'],     cust:7,conc:3,multi:.4, bugEvery:11,bugFly:4.5,bugs:['lalat','nyamuk','semut'],maxBugs:3,pat:55,wall:'#fff6d6',acc:'#e0b83a'},
  {house:'Rumah Bali',     dishes:ALL_DISHES,                 cust:7,conc:3,multi:.45,bugEvery:10,bugFly:4.2,bugs:['lalat','nyamuk','semut'],maxBugs:3,pat:55,wall:'#ffe9f0',acc:'#ff8fb1',final:1},
];
function chainOf(dish){const out=[];const seen={};const go=id=>{const r=RBY[id];if(!r||seen[id])return;seen[id]=1;for(const x of r.in)go(x);out.push(r);};go(dish);return out;}
function levelRecipes(L){const s=new Set();for(const d of L.dishes)for(const r of chainOf(d))s.add(r);return [...s];}
function levelIngredients(L){const s=new Set();for(const r of levelRecipes(L))for(const x of r.in)if(ITEMS[x].src)s.add(x);return [...s];}
function dishEst(d){let t=2.5;for(const r of chainOf(d)){t+=r.in.length*2.2+r.t+1.2;}return t;}
function msSub(a,b){const c={};for(const x of b)c[x]=(c[x]||0)+1;for(const x of a){if(!c[x])return false;c[x]--;}return true;}
function msEq(a,b){return a.length===b.length&&msSub(a,b);}
