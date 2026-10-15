'use strict';
/* Le Ceneri di Valdombra: terrain.js */
/* ================= RENDERING ================= */
const cv = $('cv'), ctx = cv.getContext('2d');
const terr = document.createElement('canvas'), tctx = terr.getContext('2d');
let S = 30, PAD = 12, DPR = 1, BW = SQ3*(COLS+0.5), BH = 1.5*(ROWS-1) + 2 + .35;

function fit(){
  const b = $('board');
  const w = b.clientWidth - 24, h = b.clientHeight - 22;
  S = Math.max(14, Math.min((w-2*PAD)/BW, (h-2*PAD)/BH, 52));
  DPR = Math.min(window.devicePixelRatio || 1, 2.5);
  const cw = Math.round(BW*S + 2*PAD), ch = Math.round(BH*S + 2*PAD);
  cv.style.width = cw+'px'; cv.style.height = ch+'px';
  cv.width = cw*DPR; cv.height = ch*DPR;
  terr.width = cv.width; terr.height = cv.height;
  SPR.clear();
  drawTerrain();
}
function world(c, sx=0, sy=0){ c.setTransform(DPR*S,0,0,DPR*S,DPR*(PAD+sx),DPR*(PAD+sy)); }

function rng(seed){ let s = seed*9301+49297; return () => { s = (s*9301+49297)%233280; return s/233280; }; }
function hexPath(c,x,y,rad){
  c.beginPath();
  for(let i=0;i<6;i++){ const a=Math.PI/180*(60*i-90); const px=x+rad*Math.cos(a), py=y+rad*Math.sin(a); i?c.lineTo(px,py):c.moveTo(px,py); }
  c.closePath();
}
const PAL = {
  g:['#7c9a55','#4f6c38'], f:['#4c6c40','#2c4a2e'], h:['#a59a63','#6d6a40'], u:['#7f9258','#506339'],
  w:['#2f7f8a','#143d48'], r:['#8a877c','#55534b'], s:['#a8a28e','#6b6858'], a:['#5b5249','#2c2723']
};
const LOOKS = {
  prato:{ground:'grass', tuft:'rgba(170,200,110,.55)', flowers:['#efe6b8','#d9a7c7','#f3f0e8'], tree:'pine', fx:'flies', bg:['#1e302b','#0b1412'], tint:null},
  campi:{g:['#93a052','#5e6b33'], tuft:'rgba(210,200,110,.55)', flowers:['#f5d55a','#e9e0b5'], h:['#b3a463','#76693c'], fx:'embers', tint:'rgba(255,170,80,.07)', bg:['#2e2a1a','#100c06']},
  villaggio:{ground:'dirt', g:['#9a8a62','#5e5038'], tuft:'rgba(150,160,90,.5)', flowers:[], u:['#8f8468','#5a5240'], fx:'embers', tint:'rgba(255,140,60,.09)', bg:['#2a201a','#0f0b08']},
  colline:{g:['#959a5c','#5f6236'], tuft:'rgba(190,190,110,.55)', flowers:['#e9e0b5'], h:['#b3a46a','#77683f'], fx:'motes', bg:['#2a2a1c','#0e0e08']},
  bosco:{g:['#5f8448','#33502b'], tuft:'rgba(140,190,100,.5)', f:['#3f6236','#20381e'], fx:'flies', bg:['#14261c','#060e0a'], tint:'rgba(20,60,30,.1)'},
  cimitero:{g:['#6e7564','#3d4338'], tuft:'rgba(150,160,140,.45)', flowers:[], u:['#727466','#45473d'], fx:'mist', bg:['#1d2224','#08090a'], tint:'rgba(60,70,95,.16)'},
  palude:{ground:'mud', g:['#62704a','#353f27'], tuft:'rgba(140,160,90,.55)', flowers:[], f:['#3f5534','#1f2d1a'], w:['#3d6050','#132219'], fx:'mist', bg:['#16201a','#060a07'], tint:'rgba(40,70,50,.14)'},
  rovine:{g:['#7d8c5a','#4c5a35'], u:['#8a9066','#565c3e'], fx:'motes', bg:['#24281c','#0b0c08']},
  torre:{ground:'stone', g:['#8a867a','#4d4a42'], u:['#8a8578','#55524a'], fx:'motes', bg:['#1f1e22','#0a0a0c'], tint:'rgba(40,40,70,.1)'},
  cripta:{ground:'stone', g:['#66626f','#302d38'], u:['#6c6676','#3a3542'], r:['#77737e','#3c3842'], fx:'motesP', bg:['#17141e','#060509'], tint:'rgba(70,40,110,.18)'},
  passo:{ground:'snow', g:['#eef3f7','#a8b6c4'], tuft:'rgba(160,180,200,.5)', flowers:[], f:['#d4dee6','#8a9cac'], tree:'snowpine', h:['#dde5ec','#94a4b3'], u:['#bac4cd','#7c8894'], w:['#6a9cb5','#2a4a5e'], fx:'snow', bg:['#2a3644','#0c1118'], tint:'rgba(120,160,220,.1)', snowRocks:true},
  fiume:{fx:'flies'},
  boscoMuto:{g:['#727a6a','#41473b'], tuft:'rgba(160,165,150,.45)', flowers:[], f:['#5d6158','#2e312a'], tree:'dead', fx:'mist', bg:['#1d201c','#08090a'], tint:'rgba(80,80,95,.16)'},
  miniera:{ground:'stone', g:['#6f675c','#3a342c'], u:['#76705f','#45403a'], r:['#837a6c','#45403a'], tuft:'rgba(140,130,110,.4)', flowers:[], fx:'motes', bg:['#1e1a16','#080706'], tint:'rgba(120,80,40,.12)'},
  forgia:{ground:'stone', g:['#6a5048','#33221c'], u:['#6c5a50','#3a2c26'], r:['#7a6458','#3c2c24'], a:['#5a3428','#2a140c'], w:['#ff8a2a','#b0300a'], tuft:'rgba(140,110,90,.4)', flowers:[], fx:'embers', bg:['#2a140c','#0c0503'], tint:'rgba(255,100,30,.12)'},
  cenere:{g:['#7a726c','#433d3a'], tuft:'rgba(150,140,135,.4)', flowers:[], f:['#5d5a55','#2e2c2a'], tree:'dead', h:['#8a827a','#544c46'], a:['#4a3a34','#22160f'], u:['#6e6660','#3e3834'], fx:'embers', bg:['#2a201e','#0c0807'], tint:'rgba(140,60,30,.12)'},
  cerchio:{g:['#6e6c5c','#3d3b32'], tuft:'rgba(150,150,120,.45)', flowers:[], u:['#77746a','#47453d'], fx:'embersP', bg:['#1e1426','#08040c'], tint:'rgba(110,40,140,.13)'}
};
function lookOf(){ const b = (G && G.def && G.def.biome) || 'prato'; const L = Object.assign({}, LOOKS.prato, LOOKS[b]); for(const k in PAL) if(!L[k]) L[k] = PAL[k]; return L; }
function applyLook(){
  const L = lookOf(); G.look = L;
  $('map').style.background = `radial-gradient(ellipse at 50% 40%, ${L.bg[0]} 0%, ${L.bg[1]} 78%)`;
  const R = Math.random, A = [];
  const n = {flies:14, snow:55, embers:24, embersP:24, mist:7, motes:26, motesP:26}[L.fx] || 0;
  for(let i=0;i<n;i++) A.push({x:R()*BW, y:R()*BH, p:R()*6.28, s:.2+R()*.3, v:.2+R()*.4, r:L.fx==='mist' ? 2+R()*2 : .015+R()*.035});
  G.amb = {kind:L.fx, list:A};
}
function drawAmbient(t, dt, layer){
  const A = G.amb; if(!A || REDUCED) return;
  const k = A.kind;
  if((k==='mist') !== (layer==='under')) return;
  for(const f of A.list){
    if(k==='flies'){
      f.x += Math.cos(t*.3+f.p)*f.s*dt; f.y += Math.sin(t*.4+f.p*1.3)*f.s*dt;
      const a = .25+.5*Math.max(0,Math.sin(t*1.7+f.p*3)); glowDot(f.x,f.y,.14,`255,240,170`,a);
    } else if(k==='snow'){
      f.y += f.v*dt*.9; f.x += Math.sin(t+f.p)*.15*dt;
      ctx.fillStyle = `rgba(255,255,255,${.5+.4*f.s})`; ctx.beginPath(); ctx.arc(f.x,f.y,f.r*1.4,0,7); ctx.fill();
    } else if(k==='embers' || k==='embersP'){
      f.y -= f.v*dt*.7; f.x += Math.sin(t*2+f.p)*.12*dt;
      const a = .4+.5*Math.max(0,Math.sin(t*4+f.p*5)); glowDot(f.x,f.y,.07, k==='embers' ? '255,150,60' : '200,130,255', a);
    } else if(k==='mist'){
      f.x += f.v*.12*dt;
      const g = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r); g.addColorStop(0,'rgba(220,230,235,.11)'); g.addColorStop(1,'rgba(220,230,235,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(f.x,f.y,f.r,f.r*.45,0,0,7); ctx.fill();
    } else {
      f.x += Math.cos(t*.2+f.p)*.08*dt; f.y += Math.sin(t*.25+f.p)*.06*dt - .03*dt;
      const a = .25+.3*Math.max(0,Math.sin(t*.9+f.p*2)); glowDot(f.x,f.y,.06, k==='motesP' ? '200,170,255' : '255,245,220', a);
    }
    const m = k==='mist' ? 4 : .2;
    if(f.x<-m) f.x=BW+m; if(f.x>BW+m) f.x=-m; if(f.y<-m) f.y=BH+m; if(f.y>BH+m) f.y=-m;
  }
}
function glowDot(x,y,r,rgb,a){ const g = ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(${rgb},${a})`); g.addColorStop(1,`rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); }

const EDGE = i => { const a1 = Math.PI/180*(60*i-90), a2 = Math.PI/180*(60*(i+1)-90); return {a1, a2, mx:(Math.cos(a1)+Math.cos(a2)), my:(Math.sin(a1)+Math.sin(a2))}; };
function drawTerrain(){
  const c = tctx, L = lookOf();
  c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,terr.width,terr.height);
  world(c);
  for(let r=0;r<ROWS;r++) for(let col=0;col<COLS;col++){
    const t = tt(col,r), base = center(col,r), el = TER[t].elev, x = base.x, y = base.y - el;
    const R = rng(col*131 + r*71 + 7);
    if(t!=='w'){
      const th = .22 + Math.max(0,el);
      hexPath(c,x,y+th,.985);
      const sg = c.createLinearGradient(0,y,0,y+th+1);
      sg.addColorStop(0, t==='r'?'#45433c':L.ground==='snow'?'#6d7a86':'#3b3022'); sg.addColorStop(1,'#120d08');
      c.fillStyle = sg; c.fill();
    }
    const pal = L[t] || PAL[t];
    hexPath(c,x,y,.985);
    const g = c.createRadialGradient(x-.35,y-.5,.1,x,y,1.15);
    g.addColorStop(0,pal[0]); g.addColorStop(1,pal[1]);
    c.fillStyle = g; c.fill();
    c.save(); hexPath(c,x,y,.985); c.clip();
    if('gfhua'.includes(t)) ground(c,t,x,y,R,L);
    decorate(c,t,x,y,R,L);
    c.restore();
    // bordi in rilievo: luce da in alto a sinistra
    if(t!=='w') for(let i=0;i<6;i++){
      const e = EDGE(i), nl = Math.hypot(e.mx,e.my), d = (e.mx*-.55 + e.my*-.83)/nl;
      c.beginPath(); c.moveTo(x+Math.cos(e.a1)*.93,y+Math.sin(e.a1)*.93); c.lineTo(x+Math.cos(e.a2)*.93,y+Math.sin(e.a2)*.93);
      c.lineWidth = .05; c.strokeStyle = d>0 ? `rgba(255,245,215,${.3*d})` : `rgba(0,0,0,${.32*-d})`; c.stroke();
    } else for(let i=0;i<6;i++){
      const e = EDGE(i), n = hexAtPoint(base.x+e.mx, base.y+e.my);
      if(!n || !inb(n.c,n.r) || tt(n.c,n.r)==='w' || Math.hypot(center(n.c,n.r).x-base.x-e.mx, center(n.c,n.r).y-base.y-e.my) > .3) continue;
      for(const [rad,lw,a] of [[.92,.07,.35],[.8,.03,.18]]){
        c.beginPath(); c.moveTo(x+Math.cos(e.a1)*rad,y+Math.sin(e.a1)*rad); c.lineTo(x+Math.cos(e.a2)*rad,y+Math.sin(e.a2)*rad);
        c.lineWidth = lw; c.lineCap='round'; c.strokeStyle = `rgba(230,245,240,${a})`; c.stroke();
      }
    }
    hexPath(c,x,y,.985); c.lineWidth = .035; c.strokeStyle = 'rgba(8,12,9,.6)'; c.stroke();
    if(t==='f') trees(c,x,y,R,L.tree);
    if(t==='r') boulders(c,x,y,R,L);
    if(t==='u') ruins(c,x,y,R);
  }
  // luce generale e tinta dell'ambiente, solo sulle caselle
  c.setTransform(1,0,0,1,0,0); c.globalCompositeOperation = 'source-atop';
  const lgr = c.createLinearGradient(0,0,terr.width,terr.height);
  lgr.addColorStop(0,'rgba(255,240,200,.12)'); lgr.addColorStop(.55,'rgba(255,240,200,0)'); lgr.addColorStop(1,'rgba(0,0,25,.2)');
  c.fillStyle = lgr; c.fillRect(0,0,terr.width,terr.height);
  if(L.tint){ c.fillStyle = L.tint; c.fillRect(0,0,terr.width,terr.height); }
  c.globalCompositeOperation = 'source-over';
}
function ground(c,t,x,y,R,L){
  const st = L.ground;
  if(st==='stone' && t==='g'){
    for(let yy=y-1.05, row=0; yy<y+1; yy+=.34, row++){
      let xx = x-1.1 + (row%2)*.18;
      while(xx < x+1.1){ const w = .3+R()*.22;
        c.fillStyle = `rgba(${R()<.5?'255,255,255':'0,0,0'},${.04+R()*.07})`; c.fillRect(xx+.02,yy+.02,w-.04,.3);
        c.strokeStyle='rgba(12,10,14,.5)'; c.lineWidth=.025; c.strokeRect(xx+.02,yy+.02,w-.04,.3);
        if(R()<.12){ c.fillStyle='rgba(90,120,70,.35)'; c.beginPath(); c.ellipse(xx+.1,yy+.27,.09,.03,0,0,7); c.fill(); }
        xx += w; }
    }
    return;
  }
  for(let i=0;i<30;i++){ c.fillStyle = R()<.5 ? 'rgba(255,255,230,.07)' : 'rgba(0,0,0,.09)'; c.fillRect(x+(R()-.5)*1.8, y+(R()-.5)*1.8, .04+R()*.07, .04+R()*.07); }
  if(st==='snow'){
    for(let i=0;i<3;i++){ c.fillStyle='rgba(110,140,185,.16)'; c.beginPath(); c.ellipse(x+(R()-.5)*1.2,y+(R()-.5)*1.1,.3+R()*.3,.1+R()*.08,0,0,7); c.fill(); }
    for(let i=0;i<8;i++){ c.fillStyle='rgba(255,255,255,.9)'; c.fillRect(x+(R()-.5)*1.5,y+(R()-.5)*1.5,.03,.03); }
  } else if(st==='dirt' && t==='g'){
    c.strokeStyle='rgba(60,45,30,.35)'; c.lineWidth=.05;
    const a = R()*Math.PI; for(const o of [-.15,.15]){ c.beginPath(); c.moveTo(x-Math.cos(a)*1.2+o*Math.sin(a),y-Math.sin(a)*1.2-o*Math.cos(a)); c.lineTo(x+Math.cos(a)*1.2+o*Math.sin(a),y+Math.sin(a)*1.2-o*Math.cos(a)); c.stroke(); }
    for(let i=0;i<6;i++){ c.fillStyle='rgba(170,155,130,.55)'; c.beginPath(); c.arc(x+(R()-.5)*1.4,y+(R()-.5)*1.3,.025+R()*.02,0,7); c.fill(); }
  } else if(st==='mud'){
    for(let i=0;i<2;i++){ const px = x+(R()-.5)*1.1, py = y+(R()-.5)*1.0; c.fillStyle='rgba(28,36,22,.55)'; c.beginPath(); c.ellipse(px,py,.22+R()*.15,.08+R()*.05,0,0,7); c.fill();
      c.strokeStyle='rgba(200,220,200,.18)'; c.lineWidth=.02; c.beginPath(); c.ellipse(px-.03,py-.02,.12,.03,0,Math.PI*1.1,Math.PI*1.8); c.stroke(); }
  }
}
function tufts(c,x,y,R,n,col){
  c.strokeStyle = col; c.lineWidth = .028; c.lineCap = 'round';
  for(let i=0;i<n;i++){
    const px = x+(R()-.5)*1.4, py = y+(R()-.5)*1.3;
    c.beginPath(); c.moveTo(px-.06,py); c.lineTo(px-.02,py-.1); c.moveTo(px,py); c.lineTo(px+.01,py-.13); c.moveTo(px+.06,py); c.lineTo(px+.04,py-.09); c.stroke();
  }
}
function decorate(c,t,x,y,R,L){
  const stone = L.ground==='stone';
  if(t==='g'){
    if(!stone) tufts(c,x,y,R,6,L.tuft);
    for(let i=0;i<3;i++){ if(L.flowers.length && R()<.5){ c.fillStyle = L.flowers[Math.floor(R()*L.flowers.length)]; c.beginPath(); c.arc(x+(R()-.5)*1.2,y+(R()-.5)*1.1,.035,0,7); c.fill(); } }
  } else if(t==='f'){
    tufts(c,x,y,R,4,L.tuft);
  } else if(t==='h'){
    const hc = L.h || PAL.h;
    for(const [ox,oy,s] of [[-.25,.15,.55],[.3,.05,.45]]){
      c.beginPath(); c.ellipse(x+ox,y+oy+.1,s,s*.55,0,Math.PI,0); c.fillStyle='rgba(30,25,15,.35)'; c.fill();
      c.beginPath(); c.ellipse(x+ox,y+oy,s,s*.55,0,Math.PI,0); c.fillStyle=lgPal(c,x+ox,y+oy-s*.55,y+oy,shade(hc[0],.15),hc[0]); c.fill();
      c.beginPath(); c.ellipse(x+ox,y+oy,s,s*.55,0,Math.PI*1.1,Math.PI*1.7); c.lineWidth=.04; c.strokeStyle='rgba(255,250,220,.4)'; c.stroke();
    }
    if(!stone) tufts(c,x,y+.25,R,4,L.tuft);
  } else if(t==='u'){
    if(!stone) tufts(c,x,y,R,5,L.tuft);
    c.fillStyle = 'rgba(150,145,125,.55)';
    for(let i=0;i<4;i++){ c.fillRect(x+(R()-.5)*1.1, y+(R()-.2)*.7, .16, .1); }
  } else if(t==='w'){
    c.fillStyle = 'rgba(255,255,255,.05)';
    c.beginPath(); c.ellipse(x-.2,y-.3,.6,.25,-.3,0,7); c.fill();
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x+.25,y+.35,.55,.3,0,0,7); c.fill();
  } else if(t==='r'){
    c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x,y+.25,.7,.3,0,0,7); c.fill();
  } else if(t==='a'){
    c.strokeStyle='rgba(20,16,12,.8)'; c.lineCap='round';
    for(const [ox,oy] of [[-.35,.05],[.3,-.15],[.05,.35]]){ c.lineWidth=.07; c.beginPath(); c.moveTo(x+ox,y+oy); c.lineTo(x+ox+.03,y+oy-.28); c.stroke(); c.lineWidth=.035; c.beginPath(); c.moveTo(x+ox+.02,y+oy-.15); c.lineTo(x+ox+.12,y+oy-.24); c.stroke(); }
    c.fillStyle='rgba(160,150,140,.25)'; for(let i=0;i<6;i++){ c.beginPath(); c.arc(x+(R()-.5)*1.3,y+(R()-.5)*1.2,.05+R()*.05,0,7); c.fill(); }
  } else if(t==='s'){
    hexPath(c,x,y,.72); c.fillStyle='#b9b39d'; c.fill(); c.lineWidth=.05; c.strokeStyle='#6f6a57'; c.stroke();
    hexPath(c,x,y,.5); c.fillStyle='#8f8a75'; c.fill();
    c.strokeStyle='rgba(60,58,48,.6)'; c.lineWidth=.03;
    for(let i=0;i<6;i++){ const a=Math.PI/3*i-Math.PI/2; c.beginPath(); c.moveTo(x+Math.cos(a)*.5,y+Math.sin(a)*.5); c.lineTo(x+Math.cos(a)*.72,y+Math.sin(a)*.72); c.stroke(); }
  }
}
function lgPal(c,x,y0,y1,a,b){ const g = c.createLinearGradient(x,y0,x,y1); g.addColorStop(0,a); g.addColorStop(1,b); return g; }
function trees(c,x,y,R,kind='pine'){
  const spots = [[-.38,.05],[.32,-.12],[.02,.38],[-.05,-.4]].sort((a,b)=>a[1]-b[1]);
  for(const [ox,oy] of spots){
    const s = .85 + R()*.35, tx = x+ox, ty = y+oy;
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(tx+.08,ty+.08,.24*s,.09*s,0,0,7); c.fill();
    if(kind==='dead'){
      c.lineCap='round'; c.strokeStyle='#3d3833'; c.lineWidth=.06*s; c.beginPath(); c.moveTo(tx,ty+.04); c.lineTo(tx+.02,ty-.62*s); c.stroke();
      c.lineWidth=.03*s; for(const [h,dx,dy] of [[-.3,-.16,-.14],[-.42,.15,-.12],[-.52,-.1,-.1],[-.2,.12,-.08]]){ c.beginPath(); c.moveTo(tx+.01,ty+h*s); c.lineTo(tx+dx*s,ty+(h+dy)*s); c.stroke(); }
      c.strokeStyle='rgba(200,200,190,.25)'; c.lineWidth=.015; c.beginPath(); c.moveTo(tx-.015,ty); c.lineTo(tx,ty-.55*s); c.stroke();
      continue;
    }
    c.fillStyle = '#3a2a1a'; c.fillRect(tx-.03*s,ty-.05*s,.06*s,.12*s);
    for(let k=0;k<3;k++){
      const w = (.27-.06*k)*s, top = ty - (.25+.17*k)*s, bot = ty - (.02+.15*k)*s;
      c.beginPath(); c.moveTo(tx,top); c.lineTo(tx+w,bot); c.lineTo(tx-w,bot); c.closePath();
      c.fillStyle = kind==='snowpine' ? (k===2 ? '#3d5c4a' : '#2e4a3b') : (k===2 ? '#3f6b46' : '#2f5638'); c.fill();
      c.beginPath(); c.moveTo(tx,top); c.lineTo(tx+w,bot); c.lineTo(tx+w*.15,bot); c.closePath();
      c.fillStyle = 'rgba(0,0,0,.24)'; c.fill();
      if(kind==='snowpine'){ c.beginPath(); c.moveTo(tx,top); c.lineTo(tx+w*.55,top+(bot-top)*.5); c.lineTo(tx+w*.1,top+(bot-top)*.42); c.lineTo(tx-w*.5,top+(bot-top)*.55); c.closePath(); c.fillStyle='#f4f8fb'; c.fill(); }
      else { c.beginPath(); c.moveTo(tx,top); c.lineTo(tx-w*.55,bot-(bot-top)*.45); c.lineWidth=.02; c.strokeStyle='rgba(190,220,160,.3)'; c.stroke(); }
    }
  }
}
function boulders(c,x,y,R,L){
  const rocks = [[-.3,.1,.42],[.28,.18,.34],[.05,-.22,.38]].sort((a,b)=>a[1]-b[1]);
  const rc = L.r || PAL.r;
  for(const [ox,oy,s] of rocks){
    const bx = x+ox, by = y+oy, n = 7, pts = [];
    for(let i=0;i<n;i++){ const a = Math.PI*2*i/n - Math.PI/2; const rr = s*(.75+R()*.3)*(i>n/2?.95:1); pts.push([bx+Math.cos(a)*rr, by+Math.sin(a)*rr*.8 - (Math.sin(a)<0? s*.35 : 0)]); }
    c.fillStyle='rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(bx+.06,by+s*.55,s*.95,s*.3,0,0,7); c.fill();
    c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p)); c.closePath();
    const g = c.createLinearGradient(bx-s,by-s,bx+s,by+s); g.addColorStop(0,shade(rc[0],.25)); g.addColorStop(.55,rc[0]); g.addColorStop(1,rc[1]);
    c.fillStyle = g; c.fill(); c.lineWidth=.03; c.strokeStyle='#211f1b'; c.stroke();
    c.beginPath(); c.moveTo(pts[5][0],pts[5][1]); c.lineTo(bx,by-s*.1); c.lineTo(pts[1][0],pts[1][1]); c.strokeStyle='rgba(255,255,240,.2)'; c.lineWidth=.025; c.stroke();
    if(L.snowRocks){ c.beginPath(); c.moveTo(pts[5][0],pts[5][1]); c.lineTo(pts[6][0],pts[6][1]); c.lineTo(pts[0][0],pts[0][1]); c.lineTo(pts[1][0],pts[1][1]); c.quadraticCurveTo(bx,by-s*.25,pts[5][0],pts[5][1]); c.fillStyle='#f2f6f9'; c.fill(); }
    else if(R()<.4){ c.fillStyle='rgba(110,140,80,.45)'; c.beginPath(); c.ellipse(bx-s*.2,by-s*.45,s*.25,s*.08,-.3,0,7); c.fill(); }
  }
}
function ruins(c,x,y){
  const col = (cx,cy,h) => {
    c.fillStyle='rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(cx+.06,cy+.03,.18,.07,0,0,7); c.fill();
    const g = c.createLinearGradient(cx-.13,0,cx+.13,0); g.addColorStop(0,'#d8d1b8'); g.addColorStop(1,'#7a7563');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(cx-.12,cy); c.lineTo(cx-.12,cy-h); c.lineTo(cx-.04,cy-h+.07); c.lineTo(cx+.03,cy-h-.03); c.lineTo(cx+.12,cy-h+.05); c.lineTo(cx+.12,cy); c.closePath(); c.fill();
    c.lineWidth=.025; c.strokeStyle='#2a261e'; c.stroke();
    c.strokeStyle='rgba(60,55,45,.5)'; c.lineWidth=.02; for(const fx of [-.05,.03]){ c.beginPath(); c.moveTo(cx+fx,cy); c.lineTo(cx+fx,cy-h+.08); c.stroke(); }
    c.fillStyle='#bdb69d'; c.fillRect(cx-.15,cy-.04,.3,.06);
  };
  col(x-.3,y+.05,.55); col(x+.32,y-.12,.32);
  c.save(); c.translate(x+.05,y+.36); c.rotate(-.25); c.fillStyle='#a49e86'; c.fillRect(-.3,-.07,.6,.14); c.fillStyle='rgba(255,255,255,.15)'; c.fillRect(-.3,-.07,.6,.04); c.restore();
}

/* --- icone (spazio -1..1) --- */
const INK = '#f1e6c6', INK_D = '#2a2016';
const ICONS = {
  ghost(c){
    const g = c.createLinearGradient(0,-.8,0,.8); g.addColorStop(0,'rgba(220,235,255,.95)'); g.addColorStop(1,'rgba(160,190,230,.2)');
    c.fillStyle=g; c.strokeStyle='rgba(235,245,255,.9)'; c.lineWidth=.05;
    c.beginPath(); c.moveTo(-.45,.75); c.lineTo(-.45,-.2); c.quadraticCurveTo(-.45,-.82,0,-.82); c.quadraticCurveTo(.45,-.82,.45,-.2); c.lineTo(.45,.75);
    c.lineTo(.27,.55); c.lineTo(.09,.75); c.lineTo(-.09,.55); c.lineTo(-.27,.75); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#1a2233'; c.beginPath(); c.ellipse(-.16,-.25,.09,.13,0,0,7); c.fill(); c.beginPath(); c.ellipse(.16,-.25,.09,.13,0,0,7); c.fill();
    c.beginPath(); c.ellipse(0,.12,.1,.14,0,0,7); c.fill();
  },
  fang(c){
    c.fillStyle='#2f2b29'; c.strokeStyle=INK; c.lineWidth=.06; c.lineJoin='round';
    c.beginPath(); c.moveTo(-.58,-.8); c.lineTo(-.24,-.38); c.lineTo(.24,-.38); c.lineTo(.58,-.8); c.lineTo(.62,-.08); c.lineTo(.3,.36); c.lineTo(0,.72); c.lineTo(-.3,.36); c.lineTo(-.62,-.08); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#ffcf5a';
    c.beginPath(); c.moveTo(-.38,-.14); c.lineTo(-.1,-.04); c.lineTo(-.32,.02); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(.38,-.14); c.lineTo(.1,-.04); c.lineTo(.32,.02); c.closePath(); c.fill();
    c.fillStyle=INK; c.beginPath(); c.arc(0,.44,.09,0,7); c.fill();
    c.beginPath(); c.moveTo(-.14,.52); c.lineTo(-.09,.7); c.lineTo(-.04,.54); c.moveTo(.14,.52); c.lineTo(.09,.7); c.lineTo(.04,.54); c.fill();
  },
  hood(c){
    c.fillStyle='#2b1f3a'; c.strokeStyle='#e0c8ff'; c.lineWidth=.06;
    c.beginPath(); c.moveTo(0,-.88); c.quadraticCurveTo(.64,-.62,.6,.2); c.lineTo(.74,.76); c.lineTo(-.74,.76); c.lineTo(-.6,.2); c.quadraticCurveTo(-.64,-.62,0,-.88); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#07040b'; c.beginPath(); c.ellipse(0,-.08,.34,.44,0,0,7); c.fill();
    const g = c.createRadialGradient(0,-.14,0,0,-.14,.4); g.addColorStop(0,'rgba(200,150,255,.55)'); g.addColorStop(1,'rgba(200,150,255,0)');
    c.fillStyle=g; c.beginPath(); c.arc(0,-.14,.4,0,7); c.fill();
    c.fillStyle='#e6ccff'; c.beginPath(); c.ellipse(-.13,-.16,.07,.04,0,0,7); c.fill(); c.beginPath(); c.ellipse(.13,-.16,.07,.04,0,0,7); c.fill();
  },
  sword(c){
    c.rotate(-Math.PI/4);
    c.fillStyle=INK; c.strokeStyle=INK_D; c.lineWidth=.05;
    c.beginPath(); c.moveTo(-.1,.22); c.lineTo(-.1,-.55); c.lineTo(0,-.78); c.lineTo(.1,-.55); c.lineTo(.1,.22); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(0,-.6); c.lineTo(0,.18); c.strokeStyle='rgba(42,32,22,.45)'; c.lineWidth=.035; c.stroke();
    c.fillStyle='#d9b55a'; c.strokeStyle=INK_D; c.lineWidth=.05;
    c.beginPath(); c.roundRect(-.34,.2,.68,.12,.05); c.fill(); c.stroke();
    c.fillStyle='#6b4a2a'; c.fillRect(-.06,.32,.12,.26);
    c.fillStyle='#d9b55a'; c.beginPath(); c.arc(0,.64,.09,0,7); c.fill(); c.stroke();
  },
  bow(c){
    c.lineCap='round';
    c.beginPath(); c.arc(-.35,0,.68,-1.05,1.05); c.lineWidth=.16; c.strokeStyle=INK_D; c.stroke(); c.lineWidth=.1; c.strokeStyle='#c9a46a'; c.stroke();
    const ex=-.35+.68*Math.cos(1.05), ey=.68*Math.sin(1.05);
    c.beginPath(); c.moveTo(ex,-ey); c.lineTo(-.05,0); c.lineTo(ex,ey); c.lineWidth=.03; c.strokeStyle=INK; c.stroke();
    c.beginPath(); c.moveTo(-.12,0); c.lineTo(.6,0); c.lineWidth=.06; c.strokeStyle=INK; c.stroke();
    c.beginPath(); c.moveTo(.76,0); c.lineTo(.56,-.1); c.lineTo(.56,.1); c.closePath(); c.fillStyle=INK; c.fill();
    c.beginPath(); c.moveTo(-.12,0); c.lineTo(-.24,-.1); c.moveTo(-.12,0); c.lineTo(-.24,.1); c.lineWidth=.05; c.strokeStyle='#c96a5a'; c.stroke();
  },
  staff(c){
    c.lineCap='round';
    c.beginPath(); c.moveTo(-.38,.72); c.lineTo(.2,-.36); c.lineWidth=.15; c.strokeStyle=INK_D; c.stroke(); c.lineWidth=.09; c.strokeStyle='#b88a58'; c.stroke();
    const g = c.createRadialGradient(.28,-.5,0,.28,-.5,.42); g.addColorStop(0,'rgba(170,255,230,.95)'); g.addColorStop(1,'rgba(120,230,200,0)');
    c.fillStyle=g; c.beginPath(); c.arc(.28,-.5,.42,0,7); c.fill();
    c.fillStyle='#dffcf2'; c.beginPath(); c.arc(.28,-.5,.16,0,7); c.fill();
    c.fillStyle=INK;
    for(const [sx,sy,s] of [[-.35,-.35,.1],[.5,.12,.08]]){ c.beginPath(); c.moveTo(sx,sy-s); c.lineTo(sx+s*.3,sy); c.lineTo(sx,sy+s); c.lineTo(sx-s*.3,sy); c.closePath(); c.fill(); c.beginPath(); c.moveTo(sx-s,sy); c.lineTo(sx,sy+s*.3); c.lineTo(sx+s,sy); c.lineTo(sx,sy-s*.3); c.closePath(); c.fill(); }
  },
  dagger(c){
    c.rotate(Math.PI/5);
    c.fillStyle=INK; c.strokeStyle=INK_D; c.lineWidth=.05;
    c.beginPath(); c.moveTo(-.09,.1); c.quadraticCurveTo(-.16,-.3,.05,-.66); c.quadraticCurveTo(.06,-.3,.09,.1); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#8a6a3a'; c.beginPath(); c.roundRect(-.26,.08,.52,.1,.04); c.fill(); c.stroke();
    c.fillStyle='#5a3d22'; c.fillRect(-.055,.18,.11,.32);
    c.rotate(-Math.PI/5);
    c.fillStyle='#9ab36a'; c.strokeStyle=INK_D; c.lineWidth=.04;
    c.beginPath(); c.moveTo(-.45,.35); c.lineTo(-.82,.15); c.lineTo(-.5,.5); c.closePath(); c.fill(); c.stroke();
  },
  axe(c){
    c.rotate(-Math.PI/6);
    c.lineCap='round';
    c.beginPath(); c.moveTo(0,.78); c.lineTo(0,-.7); c.lineWidth=.15; c.strokeStyle=INK_D; c.stroke(); c.lineWidth=.09; c.strokeStyle='#7a5532'; c.stroke();
    c.fillStyle=INK; c.strokeStyle=INK_D; c.lineWidth=.05;
    for(const s of [-1,1]){
      c.beginPath(); c.moveTo(0,-.62); c.quadraticCurveTo(s*.35,-.7,s*.62,-.9); c.quadraticCurveTo(s*.48,-.45,s*.62,-.02); c.quadraticCurveTo(s*.35,-.2,0,-.25); c.closePath(); c.fill(); c.stroke();
    }
  },
  skull(c){
    c.fillStyle=INK; c.strokeStyle=INK_D; c.lineWidth=.05;
    c.beginPath(); c.arc(0,-.12,.48,Math.PI*.82,Math.PI*2.18); c.lineTo(.24,.42); c.lineTo(-.24,.42); c.closePath(); c.fill(); c.stroke();
    c.fillStyle=INK_D;
    c.beginPath(); c.ellipse(-.18,-.08,.12,.14,0,0,7); c.fill(); c.beginPath(); c.ellipse(.18,-.08,.12,.14,0,0,7); c.fill();
    c.fillStyle='#8fe3cf'; c.beginPath(); c.arc(-.18,-.07,.045,0,7); c.fill(); c.beginPath(); c.arc(.18,-.07,.045,0,7); c.fill();
    c.fillStyle=INK_D; c.beginPath(); c.moveTo(0,.06); c.lineTo(-.06,.17); c.lineTo(.06,.17); c.closePath(); c.fill();
    c.strokeStyle=INK_D; c.lineWidth=.035; for(const x of [-.12,0,.12]){ c.beginPath(); c.moveTo(x,.28); c.lineTo(x,.42); c.stroke(); }
    c.strokeStyle='#c96a5a'; c.lineWidth=.08; c.lineCap='round';
    c.beginPath(); c.moveTo(.32,-.5); c.quadraticCurveTo(.6,-.75,.55,-.95); c.stroke();
    c.strokeStyle='#d9b55a'; c.beginPath(); c.moveTo(.2,-.58); c.quadraticCurveTo(.35,-.85,.25,-1); c.stroke();
  }
};
function drawToken(c, u, x, y, rad, dim){
  const hero = u.side==='hero';
  c.save(); c.translate(x,y);
  const g = c.createRadialGradient(-rad*.35,-rad*.45,rad*.1,0,0,rad);
  const pal = hero ? ['#41635a','#122019','#5fa392','#d9b55a'] : (u.boss||u.leader) ? ['#4a2a66','#120a1c','#b06cff','#e0c8ff'] : u.undead ? ['#4d4858','#121016','#a9a3b8','#2a2433'] : ['#6a3129','#1d0c0a','#b8453a','#3a1a14'];
  g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
  c.beginPath(); c.arc(0,0,rad,0,Math.PI*2); c.fillStyle=g; c.fill();
  c.lineWidth = rad*.15; c.strokeStyle = pal[2]; c.stroke();
  c.beginPath(); c.arc(0,0,rad*1.08,0,Math.PI*2); c.lineWidth=rad*.06; c.strokeStyle = pal[3]; c.stroke();
  c.beginPath(); c.arc(0,0,rad*.86,Math.PI*1.1,Math.PI*1.6); c.lineWidth=rad*.05; c.strokeStyle='rgba(255,250,230,.25)'; c.stroke();
  c.save(); c.scale(rad*.78,rad*.78); ICONS[u.icon](c); c.restore();
  if(dim){ c.beginPath(); c.arc(0,0,rad*1.12,0,Math.PI*2); c.fillStyle='rgba(10,16,14,.45)'; c.fill(); }
  c.restore();
}
function drawPortrait(u){
  const p = $('portrait'), c = p.getContext('2d');
  c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,p.width,p.height);
  if(!u){
    c.translate(72,72); hexPath(c,0,0,58); c.lineWidth=3; c.strokeStyle='rgba(140,120,80,.5)'; c.setLineDash([6,6]); c.stroke(); c.setLineDash([]);
    return;
  }
  drawPortraitTo(c,u.cls,144);
}
