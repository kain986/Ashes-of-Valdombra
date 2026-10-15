'use strict';
/* Le Ceneri di Valdombra: battle-render.js */
/* --- ora del giorno e meteo --- */
const TIMES = {
  giorno:{},
  alba:{dark:'rgba(40,20,60,.22)', tint:['rgba(255,170,190,.16)','rgba(120,140,220,.08)'], lights:1.6},
  tramonto:{dark:'rgba(40,14,30,.34)', tint:['rgba(255,130,50,.2)','rgba(90,30,100,.2)'], lights:2},
  notte:{dark:'rgba(4,8,26,.7)', tint:['rgba(40,60,140,.12)','rgba(10,10,40,.2)'], lights:2.4}
};
const lmask = document.createElement('canvas'), lmctx = lmask.getContext('2d');
let lmaskStamp = -1;
function buildLightMask(now, t){
  const T = TIMES[G.def.time||'giorno'];
  if(lmask.width!==cv.width || lmask.height!==cv.height){ lmask.width = cv.width; lmask.height = cv.height; }
  const c = lmctx;
  c.setTransform(1,0,0,1,0,0); c.globalCompositeOperation = 'source-over'; c.clearRect(0,0,lmask.width,lmask.height);
  c.fillStyle = T.dark; c.fillRect(0,0,lmask.width,lmask.height);
  c.globalCompositeOperation = 'destination-out';
  world(c, shx, shy);
  const L = (x,y,r,a=1) => { const g = c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(0,0,0,${a})`); g.addColorStop(.55,`rgba(0,0,0,${a*.6})`); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); };
  const fl = REDUCED ? 1 : 1 + Math.sin(t*9)*.03 + Math.sin(t*13.7)*.02;
  for(const u of G.units){ if(!u.alive) continue; const p = u.vis || posOf(u.c,u.r);
    if(u.side==='hero') L(p.x, p.y-.2, T.lights*fl*(u.npc?.8:1), .95);
    else if(FIG_GLOW[u.cls] || u.boss) L(p.x, p.y-.4, 1.3, .7); }
  for(let r=0;r<ROWS;r++) for(let col=0;col<COLS;col++){ const ty = tt(col,r);
    if(ty==='s'){ const p = posOf(col,r); L(p.x,p.y,1.8,.8); }
    else if(ty==='a' && G.def.time==='notte'){ const p = posOf(col,r); L(p.x,p.y,.7,.35); }
    if(isExit(col,r)){ const p = posOf(col,r); L(p.x,p.y,1,.5); } }
  if(G.chest){ const p = posOf(G.chest.c,G.chest.r); L(p.x,p.y,1,.6); }
  for(const f of fx){
    if(f.type==='orb' || f.type==='bolt'){ const x = f.a.x+(f.b.x-f.a.x)*f.k, y = f.a.y+(f.b.y-f.a.y)*f.k; L(x,y,f.type==='orb'?1.8:1.1,1); }
    else if(f.type==='blast'){ const k = (now-f.t0)/(500*spd); if(k<1){ const p = posOf(f.c,f.r); L(p.x,p.y,3.2*(1-k*.5),1-k); } }
    else if(f.type==='ring'){ const k = (now-f.t0)/(380*spd); if(k<1) L(f.x,f.y,1.4,1-k); }
  }
  if(G.flashT && now-G.flashT < 300){ c.setTransform(1,0,0,1,0,0); c.fillStyle = `rgba(0,0,0,${1-(now-G.flashT)/300})`; c.fillRect(0,0,lmask.width,lmask.height); }
  c.globalCompositeOperation = 'source-over';
}
function drawDarkness(now, t, strength){
  const T = TIMES[G.def.time||'giorno']; if(!T || !T.dark) return;
  if(lmaskStamp !== now){ buildLightMask(now, t); lmaskStamp = now; }
  ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha = strength; ctx.drawImage(lmask,0,0);
  if(strength===1 && T.tint){ const g = ctx.createLinearGradient(0,0,cv.width*.4,cv.height); g.addColorStop(0,T.tint[0]); g.addColorStop(1,T.tint[1]); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0,0,cv.width,cv.height); }
  ctx.restore();
}
function drawWeather(t, dt){
  const w = G.def.weather; if(!w || REDUCED) return;
  if(!G.wx || G.wx.kind!==w){ const A = []; const n = w==='pioggia' ? 90 : w==='neve' ? 45 : 60;
    for(let i=0;i<n;i++) A.push({x:Math.random()*BW, y:Math.random()*BH, v:.8+Math.random()*.6, s:Math.random(), p:Math.random()*6.28});
    G.wx = {kind:w, list:A}; }
  for(const f of G.wx.list){
    if(w==='pioggia'){ f.y += f.v*dt*14; f.x -= f.v*dt*3;
      ctx.strokeStyle = `rgba(200,220,255,${.25+.25*f.s})`; ctx.lineWidth = .025; ctx.beginPath(); ctx.moveTo(f.x,f.y); ctx.lineTo(f.x+.12,f.y-.55); ctx.stroke(); }
    else if(w==='neve'){ f.y += f.v*dt*1.4; f.x += Math.sin(t*1.5+f.p)*dt*.6 + dt*.5;
      ctx.fillStyle = `rgba(255,255,255,${.55+.4*f.s})`; ctx.beginPath(); ctx.arc(f.x,f.y,.035+.03*f.s,0,7); ctx.fill(); }
    else { f.y += f.v*dt*.6; f.x += Math.sin(t*.8+f.p)*dt*.4 + dt*.2;
      if(f.s>.85){ glowDot(f.x,f.y,.08,'255,120,50',.5+.4*Math.sin(t*5+f.p)); }
      else { ctx.fillStyle = `rgba(150,145,140,${.35+.35*f.s})`; ctx.fillRect(f.x,f.y,.05,.035); } }
    if(f.y>BH+.5){ f.y = -.5; f.x = Math.random()*(BW+2); } if(f.x<-1) f.x = BW+.5; if(f.x>BW+1) f.x = -.5;
  }
  if(w==='pioggia'){
    if(!G.nextFlash) G.nextFlash = performance.now() + 6000 + Math.random()*9000;
    if(performance.now() > G.nextFlash){ G.flashT = performance.now(); G.nextFlash = G.flashT + 8000 + Math.random()*12000; sfx('thunder', .4); }
    if(G.flashT){ const k = (performance.now()-G.flashT)/350; if(k<1){ ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle = `rgba(230,240,255,${.35*(1-k)})`; ctx.fillRect(0,0,cv.width,cv.height); ctx.restore(); } }
  }
}
function drawExits(t){
  if(!G.def.obj || G.def.obj.type!=='escape') return;
  const pul = .5+.5*Math.sin(t*3);
  for(let r=0;r<=1;r++) for(let c=0;c<COLS;c++){ if(!isExit(c,r)) continue;
    drawHexFill(ctx,c,r,`rgba(110,235,150,${.18+.12*pul})`,'rgba(170,255,200,.85)',.045);
    const p = posOf(c,r);
    ctx.save(); ctx.translate(p.x, p.y + .15 - ((t*.6)%1)*.3); ctx.strokeStyle = `rgba(220,255,230,${.75})`; ctx.lineWidth = .06; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(-.18,.08); ctx.lineTo(0,-.1); ctx.lineTo(.18,.08); ctx.stroke(); ctx.restore(); }
}
function drawNpcMark(x,y,t){
  const b = REDUCED ? 0 : Math.sin(t*3)*.04;
  ctx.save(); ctx.translate(x, y+b);
  ctx.beginPath(); for(let i=0;i<10;i++){ const a = -Math.PI/2+i*Math.PI/5, r = i%2 ? .07 : .17; ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r); } ctx.closePath();
  ctx.fillStyle = '#ffd86b'; ctx.fill(); ctx.lineWidth = .03; ctx.strokeStyle = '#3d2c08'; ctx.stroke(); ctx.restore();
}
function drawAreaOutline(area, t, strong, noCross){
  const inArea = (c,r) => area.some(a=>a.c===c && a.r===r);
  ctx.save();
  ctx.shadowColor = 'rgba(255,140,40,.9)'; ctx.shadowBlur = 10*DPR;
  ctx.strokeStyle = `rgba(255,214,140,${.75*strong+.25})`; ctx.lineWidth = .075; ctx.lineCap = 'round';
  for(const a of area){
    const p = posOf(a.c,a.r), cc = center(a.c,a.r);
    for(let i=0;i<6;i++){
      const a1 = Math.PI/180*(60*i-90), a2 = Math.PI/180*(60*(i+1)-90);
      const mx = (Math.cos(a1)+Math.cos(a2))/2, my = (Math.sin(a1)+Math.sin(a2))/2;
      const nx = cc.x + mx*2, ny = cc.y + my*2;
      const shared = area.some(b => { const q = center(b.c,b.r); return Math.abs(q.x-nx)<.2 && Math.abs(q.y-ny)<.2; });
      if(shared) continue;
      ctx.beginPath(); ctx.moveTo(p.x+Math.cos(a1)*.97,p.y+Math.sin(a1)*.97); ctx.lineTo(p.x+Math.cos(a2)*.97,p.y+Math.sin(a2)*.97); ctx.stroke();
    }
  }
  ctx.restore();
  // mirino al centro
  if(noCross) return;
  const c0 = area[0], p0 = posOf(c0.c,c0.r);
  ctx.save(); ctx.translate(p0.x,p0.y); ctx.rotate(-t*.6);
  ctx.strokeStyle = `rgba(255,236,190,${.9*strong})`; ctx.lineWidth=.045; ctx.setLineDash([.14,.09]);
  ctx.beginPath(); ctx.arc(0,0,.3,0,7); ctx.stroke(); ctx.setLineDash([]);
  for(let i=0;i<4;i++){ ctx.rotate(Math.PI/2); ctx.beginPath(); ctx.moveTo(.36,0); ctx.lineTo(.5,0); ctx.stroke(); }
  ctx.restore();
}

function drawShield(x,y,s,level){
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  ctx.beginPath(); ctx.moveTo(-.5,-.55); ctx.lineTo(.5,-.55); ctx.lineTo(.5,0); ctx.quadraticCurveTo(.45,.42,0,.65); ctx.quadraticCurveTo(-.45,.42,-.5,0); ctx.closePath();
  ctx.fillStyle='rgba(8,18,28,.85)'; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle='#86c9f5'; ctx.fillRect(-.6,-.7, level===2?1.2:.6, 1.5); ctx.restore();
  ctx.lineWidth=.13; ctx.strokeStyle='#d8efff'; ctx.stroke();
  ctx.restore();
}
function drawEye(x,y,s){
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  ctx.beginPath(); ctx.arc(0,0,.62,0,7); ctx.fillStyle='rgba(20,14,4,.85)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-.48,0); ctx.quadraticCurveTo(0,-.42,.48,0); ctx.quadraticCurveTo(0,.42,-.48,0); ctx.closePath();
  ctx.fillStyle='#ffe08a'; ctx.fill();
  ctx.beginPath(); ctx.arc(0,0,.15,0,7); ctx.fillStyle='#2a1a06'; ctx.fill();
  ctx.restore();
}

let shx=0, shy=0, last=performance.now();
function frame(now){
  const dt = Math.min(.05,(now-last)/1000); last = now;
  for(let i=anims.length-1;i>=0;i--){ const a=anims[i]; const k=Math.min(1,(now-a.t0)/a.dur); a.fn(k); if(k>=1){ anims.splice(i,1); a.res(); } }
  if(VIEW==='world'){ drawWorld(now); requestAnimationFrame(frame); return; }
  shake *= Math.pow(.0015, dt); if(shake<.2) shake=0;
  shx = shake ? (Math.random()-.5)*shake : 0; shy = shake ? (Math.random()-.5)*shake : 0;

  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height);
  ctx.drawImage(terr, shx*DPR, shy*DPR);
  world(ctx, shx, shy);
  const t = now/1000;

  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const ty = tt(c,r), p = posOf(c,r);
    if(ty==='w'){
      ctx.save(); hexPath(ctx,p.x,p.y,.97); ctx.clip();
      ctx.strokeStyle='rgba(190,235,230,.28)'; ctx.lineWidth=.03;
      for(let i=0;i<3;i++){
        const yy = p.y - .5 + i*.45 + Math.sin(t*1.3+c+i)*.06; const off = ((t*.25 + i*.33 + c*.17)%1)*1.6-.8;
        ctx.beginPath(); for(let s=0;s<=10;s++){ const xx=p.x+off-.35+s*.07; const yv=yy+Math.sin(s*.9+t*2.2+r)*.035; s?ctx.lineTo(xx,yv):ctx.moveTo(xx,yv);} ctx.stroke();
      }
      ctx.restore();
    } else if(ty==='s'){
      const pul = .5+.5*Math.sin(t*2);
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,.75); g.addColorStop(0,`rgba(140,240,210,${.35+.25*pul})`); g.addColorStop(1,'rgba(140,240,210,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,.75,0,7); ctx.fill();
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(t*.3);
      ctx.strokeStyle=`rgba(175,255,230,${.5+.3*pul})`; ctx.lineWidth=.035;
      ctx.beginPath(); ctx.arc(0,0,.36,0,7); ctx.stroke();
      for(let i=0;i<6;i++){ ctx.rotate(Math.PI/3); ctx.beginPath(); ctx.moveTo(.22,0); ctx.lineTo(.3,.06); ctx.lineTo(.3,-.06); ctx.closePath(); ctx.stroke(); }
      ctx.restore();
    } else if(ty==='a' && !REDUCED){
      const e = .5+.5*Math.sin(t*3+c*2+r);
      ctx.fillStyle=`rgba(255,120,40,${.25+.35*e})`;
      for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(p.x+Math.sin(c*7+i*2.1)*.45, p.y+Math.cos(r*5+i*1.7)*.4, .035, 0, 7); ctx.fill(); }
    }
  }

  if(G.chest){
    const p = posOf(G.chest.c,G.chest.r), gl = .5+.5*Math.sin(t*2.5);
    const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,.75); g.addColorStop(0,`rgba(255,215,120,${.18+.3*gl})`); g.addColorStop(1,'rgba(255,215,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x,p.y,.75,0,7); ctx.fill();
    ctx.save(); ctx.translate(p.x,p.y-.02);
    ctx.fillStyle='rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0,.25,.36,.1,0,0,7); ctx.fill();
    ctx.fillStyle='#6b4423'; ctx.fillRect(-.3,-.04,.6,.28);
    ctx.beginPath(); ctx.moveTo(-.3,-.04); ctx.quadraticCurveTo(0,-.34,.3,-.04); ctx.closePath(); ctx.fillStyle='#8a5a2e'; ctx.fill();
    ctx.strokeStyle='#d9b55a'; ctx.lineWidth=.04; ctx.strokeRect(-.3,-.04,.6,.28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-.1,-.24); ctx.lineTo(-.1,.24); ctx.moveTo(.1,-.24); ctx.lineTo(.1,.24); ctx.stroke();
    ctx.fillStyle='#f0cf72'; ctx.fillRect(-.05,-.01,.1,.1);
    ctx.restore();
  }
  drawDarkness(now, t, 1);
  drawExits(t);
  const hl = G.hl, sel = G.sel, pd = G.pending;
  const pulse = .5+.5*Math.sin(t*5);
  for(const m of hl.threat) drawHexFill(ctx,m.c,m.r,'rgba(200,60,45,.18)',null);
  for(const m of hl.move){
    const gold = m.apc===2;
    const bright = G.look && G.look.ground==='snow';
    drawHexFill(ctx,m.c,m.r, gold ? (bright?'rgba(225,140,10,.42)':'rgba(255,185,40,.3)') : (bright?'rgba(25,105,225,.42)':'rgba(70,160,255,.34)'), gold ? (bright?'rgba(170,100,0,.9)':'rgba(255,215,110,.8)') : (bright?'rgba(20,80,190,.9)':'rgba(150,210,255,.85)'), .045);
  }
  // percorso dello spostamento in anteprima
  if(pd && pd.kind==='move' && sel){
    const pts = [posOf(sel.c,sel.r), ...pd.path.map(s=>posOf(s.c,s.r))];
    ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.lineWidth=.09; ctx.lineJoin='round'; ctx.lineCap='round'; ctx.strokeStyle = pd.cost===2 ? 'rgba(250,215,130,.9)' : 'rgba(170,230,255,.9)'; ctx.stroke();
    const e = pts[pts.length-1];
    drawHexFill(ctx,pd.c,pd.r,null, pd.cost===2?'#ffd98a':'#bfeaff', .08);
    ctx.beginPath(); ctx.arc(e.x,e.y,.12,0,7); ctx.fillStyle = pd.cost===2?'#ffd98a':'#bfeaff'; ctx.fill();
  }
  if(hl.zoneKind){
    const Z = ZONE[hl.zoneKind];
    for(const m of hl.zone) drawHexFill(ctx,m.c,m.r,Z.fill,null);
    for(const m of hl.blocked){
      const p = posOf(m.c,m.r);
      ctx.save(); hexPath(ctx,p.x,p.y,.9); ctx.fillStyle='rgba(8,10,12,.42)'; ctx.fill(); ctx.clip();
      ctx.strokeStyle='rgba(200,200,200,.18)'; ctx.lineWidth=.03;
      for(let k=-2;k<=2;k+=.25){ ctx.beginPath(); ctx.moveTo(p.x+k-1,p.y-1); ctx.lineTo(p.x+k+1,p.y+1); ctx.stroke(); }
      ctx.restore();
    }
  }
  if(!hl.fireRange && !hl.areaNoCross){
    for(const m of hl.targets){ const p = posOf(m.c,m.r); ctx.beginPath(); ctx.ellipse(p.x,p.y+.28,.6+.04*pulse,.27+.02*pulse,0,0,7); ctx.lineWidth=.07; ctx.strokeStyle = hl.ally ? `rgba(120,240,160,${.6+.35*pulse})` : `rgba(240,80,60,${.6+.35*pulse})`; ctx.stroke(); }
  }
  let area = hl.area, areaPreview = null;
  if(!area.length && hl.fireRange && G.hover && hl.targets.some(m=>m.c===G.hover.c && m.r===G.hover.r)){
    area = areaOf(G.hover.c, G.hover.r); areaPreview = buildPending('fire', G.hover.c, G.hover.r);
  }
  const strong = hl.area.length ? 1 : .7;
  for(const m of area) drawHexFill(ctx,m.c,m.r,`rgba(255,105,25,${(.34+.16*pulse)*strong})`,null);

  if(sel && sel.alive){ const p = sel.vis || posOf(sel.c,sel.r);
    ctx.save(); ctx.setLineDash([.16,.09]); ctx.lineDashOffset = -t*.5; ctx.lineWidth=.06; ctx.strokeStyle='#f0cf72';
    ctx.beginPath(); ctx.ellipse(p.x,p.y+.28,.62,.28,0,0,7); ctx.stroke(); ctx.restore();
    glowDot(p.x,p.y+.28,.7,'240,207,114',.18); }
  if(G.inspect && G.inspect.alive){ const p = posOf(G.inspect.c,G.inspect.r); ctx.beginPath(); ctx.ellipse(p.x,p.y+.28,.62,.28,0,0,7); ctx.lineWidth=.05; ctx.strokeStyle='#ff9a80'; ctx.stroke(); }
  drawAmbient(t, dt, 'under');

  // unità: miniature
  const list = G.units.filter(u=>u.alive).sort((a,b)=>(a.vis?a.vis.y:posOf(a.c,a.r).y)-(b.vis?b.vis.y:posOf(b.c,b.r).y));
  for(const u of list){
    const p = u.vis || posOf(u.c,u.r), F = FIG[u.cls] || FIG.goblin, sz = F.size, face = u.face || 1;
    const fy = p.y + .28;
    const breath = REDUCED ? 1 : 1 + Math.sin(t*2.2+u.id)*.014;
    let lift = 0, alpha = 1;
    if(u.cls==='wraith'){ lift = REDUCED ? -.08 : -.1 + Math.sin(t*1.8+u.id)*.05; alpha = .8 + .12*Math.sin(t*3+u.id); }
    ctx.fillStyle='rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(p.x+.05,fy+.06,.5*sz,.2*sz,0,0,7); ctx.fill();
    if(u.cls==='necro' && !REDUCED){ const pul=.5+.5*Math.sin(t*2); ctx.beginPath(); ctx.ellipse(p.x,fy,.7+.08*pul,.3+.03*pul,0,0,7); ctx.lineWidth=.04; ctx.strokeStyle=`rgba(190,120,255,${.35+.3*pul})`; ctx.stroke(); }
    const dim = u.side==='hero' && G.phase==='player' && heroDone(u) && !u.overwatch && !u.hunker;
    ctx.globalAlpha = alpha; blit(sprite(u.cls, face, dim?'g':'n'), p.x, fy+lift, breath); ctx.globalAlpha = 1;
    if(u.flash>0){ ctx.globalAlpha = u.flash*.8; blit(sprite(u.cls, face, 'w'), p.x, fy+lift, breath); ctx.globalAlpha = 1; u.flash = Math.max(0,u.flash-dt*4); }
    if(!dim) for(const [gx,gy,rgb,gr] of (FIG_GLOW[u.cls]||[])){ const pul = .7+.3*Math.sin(t*3+u.id); glowDot(p.x+gx*face*sz, fy+lift+gy*sz*breath, gr*sz*(.85+.3*pul), rgb, .55*pul); }
    // vita
    const bw = .86, bx = p.x-bw/2, by = fy+.24;
    ctx.fillStyle='rgba(10,8,6,.88)'; ctx.beginPath(); ctx.roundRect(bx-.035,by-.035,bw+.07,.17,.06); ctx.fill();
    const hpG = ctx.createLinearGradient(0,by,0,by+.1);
    if(u.npc){ hpG.addColorStop(0,'#ffe9a0'); hpG.addColorStop(1,'#c9962a'); }
    else if(u.side==='hero'){ hpG.addColorStop(0,'#9be6c9'); hpG.addColorStop(1,'#3f9a7c'); } else { hpG.addColorStop(0,'#ff8a76'); hpG.addColorStop(1,'#b83a2e'); }
    ctx.fillStyle = hpG; ctx.fillRect(bx,by,bw*u.hp/u.maxHp,.1);
    ctx.strokeStyle='rgba(10,8,6,.9)'; ctx.lineWidth=.016;
    for(let i=1;i<u.maxHp;i++){ const xx=bx+bw*i/u.maxHp; ctx.beginPath(); ctx.moveTo(xx,by); ctx.lineTo(xx,by+.1); ctx.stroke(); }
    // stato, accanto alla testa
    const hy = fy - 1.02*sz;
    let ix = p.x + .45, iy = hy;
    if(u.npc) drawNpcMark(p.x, hy-.28, t);
    if(u.blessed){ glowDot(p.x, fy-.5*sz, .55, '255,240,170', .25); }
    if(u.overwatch){ drawEye(ix,iy,.24); iy += .3; }
    if(u.hunker){ drawShield(ix,iy,.34,2); iy += .3; }
    if(u.stuck || u.rooted){
      ctx.save(); ctx.translate(ix,iy); ctx.strokeStyle='#e8d49a'; ctx.lineWidth=.045;
      ctx.beginPath(); ctx.ellipse(-.06,0,.09,.06,.6,0,7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(.06,.06,.09,.06,.6,0,7); ctx.stroke(); ctx.restore();
    }
    if(u.side==='hero' && G.phase==='player' && u.ap>0){
      for(let i=0;i<2;i++){
        ctx.save(); ctx.translate(p.x - .46, hy + i*.2); ctx.rotate(Math.PI/4);
        ctx.fillStyle = i<u.ap ? '#f0cf72' : 'rgba(40,30,15,.8)'; ctx.fillRect(-.065,-.065,.13,.13);
        ctx.lineWidth=.025; ctx.strokeStyle='#2a2016'; ctx.strokeRect(-.065,-.065,.13,.13); ctx.restore();
      }
    }
  }

  drawDarkness(now, t, .38);
  if(hl.threat.length) zoneOutline(hl.threat, 'rgba(255,130,110,.85)', null, .05);
  if(hl.zoneKind && hl.zone.length){ const Z = ZONE[hl.zoneKind]; zoneOutline(hl.zone, Z.line, Z.glow, .06); }
  if(area.length) drawAreaOutline(area, t, strong, hl.areaNoCross);

  // copertura sulle caselle di movimento
  for(const m of hl.move){ if(!m.watched) continue; const p = posOf(m.c,m.r); drawEye(p.x+.42, p.y-.38, .16); }
  for(const m of hl.move){ if(!m.cov || (pd && pd.c===m.c && pd.r===m.r)) continue; const p = posOf(m.c,m.r); drawShield(p.x, p.y+.42, .2, m.cov); }
  if(pd && pd.kind==='move'){
    const P = posOf(pd.c,pd.r);
    if(TER[tt(pd.c,pd.r)].cover) drawShield(P.x, P.y+.32, .3, 1);
    for(const n of neighbors(pd.c,pd.r)){
      const adj = TER[tt(n.c,n.r)].adj; if(!adj) continue;
      const N = posOf(n.c,n.r);
      drawShield(P.x+(N.x-P.x)*.48, P.y+(N.y-P.y)*.48, .32, adj);
    }
    for(const f of pd.flank){
      const p = posOf(f.c,f.r);
      ctx.save(); ctx.setLineDash([.14,.1]); ctx.lineDashOffset = -t*.5; ctx.lineWidth=.06; ctx.strokeStyle='#ffd24a';
      ctx.beginPath(); ctx.ellipse(p.x,p.y+.28,.66,.3,0,0,7); ctx.stroke(); ctx.restore();
    }
  }

  // anteprima spinta
  if(pd && pd.push){
    const a = posOf(pd.push.from.c,pd.push.from.r);
    const b = inb(pd.push.to.c,pd.push.to.r) ? posOf(pd.push.to.c,pd.push.to.r) : {x:a.x+(a.x-posOf(sel.c,sel.r).x),y:a.y+(a.y-posOf(sel.c,sel.r).y)};
    const mx = a.x+(b.x-a.x)*.72, my = a.y+(b.y-a.y)*.72, ang = Math.atan2(b.y-a.y,b.x-a.x);
    ctx.beginPath(); ctx.moveTo(a.x+(b.x-a.x)*.3,a.y+(b.y-a.y)*.3); ctx.lineTo(mx,my); ctx.lineWidth=.09; ctx.strokeStyle='#f0cf72'; ctx.stroke();
    ctx.save(); ctx.translate(mx,my); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(.18,0); ctx.lineTo(-.05,-.14); ctx.lineTo(-.05,.14); ctx.closePath(); ctx.fillStyle='#f0cf72'; ctx.fill(); ctx.restore();
    if(pd.push.blocked){ ctx.save(); ctx.translate(mx+Math.cos(ang)*.25,my+Math.sin(ang)*.25); ctx.fillStyle='#ffdd88'; ctx.beginPath(); for(let i=0;i<10;i++){ const rr=i%2?.08:.2, aa=i*Math.PI/5; ctx.lineTo(Math.cos(aa)*rr,Math.sin(aa)*rr);} ctx.closePath(); ctx.fill(); ctx.restore(); }
  }

  // effetti
  for(const f of fx){
    if(f.type==='arrow' || f.type==='bolt' || f.type==='orb'){
      const k = f.k, x = f.a.x+(f.b.x-f.a.x)*k, arc = f.type==='arrow' ? Math.sin(k*Math.PI)*.45 : Math.sin(k*Math.PI)*.2;
      const y = f.a.y+(f.b.y-f.a.y)*k - arc - .15;
      if(f.type==='arrow'){
        const k2 = Math.max(0,k-.06), x2 = f.a.x+(f.b.x-f.a.x)*k2, y2 = f.a.y+(f.b.y-f.a.y)*k2 - Math.sin(k2*Math.PI)*.45 - .15;
        const ang = Math.atan2(y-y2,x-x2);
        ctx.save(); ctx.translate(x,y); ctx.rotate(ang);
        ctx.beginPath(); ctx.moveTo(-.38,0); ctx.lineTo(.1,0); ctx.lineWidth=.04; ctx.strokeStyle='#e8dcc0'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(.18,0); ctx.lineTo(.06,-.06); ctx.lineTo(.06,.06); ctx.closePath(); ctx.fillStyle='#e8dcc0'; ctx.fill();
        ctx.restore();
      } else {
        const col = f.type==='orb' ? ['rgba(255,220,140,1)','rgba(255,110,30,0)'] : ['rgba(200,255,240,1)','rgba(110,230,200,0)'];
        const rr = f.type==='orb' ? .38 : .22;
        const g = ctx.createRadialGradient(x,y,0,x,y,rr); g.addColorStop(0,col[0]); g.addColorStop(1,col[1]);
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,rr,0,7); ctx.fill();
        if(Math.random()<.8) parts.push({x,y,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,life:0,max:.3,color:f.type==='orb'?'#ff9a3c':'#a8f5e0',size:.06});
      }
    } else if(f.type==='blast'){
      const k = (now-f.t0)/(500*spd);
      if(k<1){ for(const a of areaOf(f.c,f.r)){ const p=posOf(a.c,a.r); hexPath(ctx,p.x,p.y,.95); ctx.fillStyle = f.quake ? `rgba(150,110,60,${.6*(1-k)})` : `rgba(255,140,50,${.55*(1-k)})`; ctx.fill(); } }
    } else if(f.type==='ghost'){
      const k = (now-f.t0)/(700*spd);
      if(k<1){ ctx.save(); ctx.globalAlpha = 1-k; blit(sprite(f.u.cls, f.u.face||1, 'n'), f.x, f.y+.28-k*.5, 1+k*.1);
        ctx.globalAlpha = (1-k)*.7; blit(sprite(f.u.cls, f.u.face||1, 'w'), f.x, f.y+.28-k*.5, 1+k*.1); ctx.restore(); }
    } else if(f.type==='slash'){
      const k = (now-f.t0)/(280*spd);
      if(k<1){ ctx.save(); ctx.translate(f.x,f.y); ctx.rotate(f.ang); ctx.beginPath(); ctx.arc(-.15,0,.55,-1.3+k*.7,1.0+k*.7);
        ctx.lineWidth=.13*(1-k)+.02; ctx.lineCap='round'; ctx.strokeStyle=`rgba(255,250,235,${1-k})`; ctx.shadowColor='rgba(255,230,180,.9)'; ctx.shadowBlur=8*DPR; ctx.stroke(); ctx.restore(); }
    } else if(f.type==='ring'){
      const k = (now-f.t0)/(380*spd);
      if(k<1){ ctx.beginPath(); ctx.ellipse(f.x,f.y,.2+.7*k,(.2+.7*k)*.6,0,0,7); ctx.lineWidth=.06*(1-k); ctx.strokeStyle=`rgba(${f.col},${1-k})`; ctx.stroke(); }
    }
  }
  for(let i=fx.length-1;i>=0;i--){ const f=fx[i];
    if((f.type==='blast' && now-f.t0>500*spd) || (f.type==='ghost' && now-f.t0>700*spd) || (f.type==='float' && now-f.t0>1200*spd) || (f.type==='slash' && now-f.t0>280*spd) || (f.type==='ring' && now-f.t0>380*spd)) fx.splice(i,1); }
  for(let i=parts.length-1;i>=0;i--){
    const p = parts[i]; p.life += dt; if(p.life>p.max){ parts.splice(i,1); continue; }
    p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 2.4*dt;
    ctx.globalAlpha = 1 - p.life/p.max; ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,7); ctx.fill(); ctx.globalAlpha=1;
  }
  drawAmbient(t, dt, 'over');
  drawWeather(t, dt);

  // etichette
  const lp = (pd && pd.kind!=='move') ? pd : areaPreview;
  if(!lp && !hl.fireRange){
    for(const m of hl.targets){ const si = hl.chance.get(key(m.c,m.r)); if(!si) continue; const p = posOf(m.c,m.r);
      label(p.x, p.y-1.12, pct(si.p), '#fff3e6', si.p>=70?'rgba(46,110,70,.95)':si.p>=40?'rgba(150,105,25,.95)':'rgba(150,35,28,.95)'); }
  }
  if(lp){
    for(const r of lp.results){
      const p = posOf(r.unit.c,r.unit.r), mine = r.unit.side==='hero';
      label(p.x, p.y-1.12, r.text, r.heal ? '#eafff0' : mine?'#ffd6a0':'#fff3e6', r.heal ? 'rgba(30,120,70,.95)' : mine?'rgba(140,70,10,.95)':'rgba(120,30,24,.95)', 1.15);
      if(r.sub) label(p.x, p.y+.82, r.sub+' danni', '#f3e7c8', 'rgba(20,16,10,.85)', .8);
    }
  }
  if(pd && pd.kind==='move') for(const f of pd.flank){ const p = posOf(f.c,f.r); label(p.x, p.y-1.12, 'Scoperto', '#2a1d02', 'rgba(255,210,74,.95)', .8); }
  for(const f of fx){ if(f.type!=='float') continue;
    const k = (now-f.t0)/(1200*spd);
    const pop = 1 + Math.max(0, .5 - k*4); ctx.save(); ctx.globalAlpha = Math.min(1,(1-k)*2); label(f.x, f.y-k*.6, f.text, f.color, null, (f.big?1.35:1.1)*pop); ctx.restore(); }
  ctx.setTransform(1,0,0,1,0,0);
  const vg = ctx.createRadialGradient(cv.width/2,cv.height*.45,Math.min(cv.width,cv.height)*.35,cv.width/2,cv.height/2,Math.max(cv.width,cv.height)*.75);
  vg.addColorStop(0,'rgba(5,10,9,0)'); vg.addColorStop(1,'rgba(5,10,9,.55)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,cv.width,cv.height);

  requestAnimationFrame(frame);
}

function tileFromEvent(e){
  const rect = cv.getBoundingClientRect();
  const x = (e.clientX - rect.left - PAD)/S, y = (e.clientY - rect.top - PAD)/S;
  let best = null, bd = 1e9;
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){ const p = posOf(c,r); const d = (p.x-x)**2 + (p.y-y)**2; if(d<bd){ bd=d; best={c,r}; } }
  if(!best || bd >= 1.05) return null;
  if(!unitAt(best.c,best.r)){
    for(const u of G.units.filter(u=>u.alive).sort((a,b)=>b.r-a.r)){
      const p = posOf(u.c,u.r), sz = (FIG[u.cls]||FIG.goblin).size, fy = p.y+.28;
      if(Math.abs(x-p.x) < .34*sz+.05 && y > fy-1.2*sz && y < fy) return {c:u.c, r:u.r};
    }
  }
  return best;
}
cv.addEventListener('click', e => { const t = tileFromEvent(e); if(t) onTap(t.c, t.r); });
cv.addEventListener('pointermove', e => { if(e.pointerType==='mouse') G.hover = tileFromEvent(e); });
cv.addEventListener('pointerleave', () => { G.hover = null; });

C = loadCampaign() || freshCampaign();
newGame(buildMission('story', 0));
new ResizeObserver(fit).observe($('board'));
fit();
requestAnimationFrame(frame);
if(document.fonts) document.fonts.ready.then(()=>refresh());
boot();
window.__G = () => G;
