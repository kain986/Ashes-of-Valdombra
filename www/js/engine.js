'use strict';
/* Le Ceneri di Valdombra: engine.js */
/* ================= HEX ================= */
const key = (c,r) => c+','+r;
const inb = (c,r) => c>=0 && c<COLS && r>=0 && r<ROWS;
const tt = (c,r) => G.map[r][c];
function toCube(c,r){ const x = c - (r - (r&1))/2; return {x, y:-x-r, z:r}; }
function fromCube(x,z){ return {c: x + (z - (z&1))/2, r: z}; }
const DIRS = [[1,-1,0],[1,0,-1],[0,1,-1],[-1,1,0],[-1,0,1],[0,-1,1]];
function dist(a,b){ const A=toCube(a.c,a.r), B=toCube(b.c,b.r); return Math.max(Math.abs(A.x-B.x),Math.abs(A.y-B.y),Math.abs(A.z-B.z)); }
function neighbors(c,r){ const A=toCube(c,r); const out=[]; for(const d of DIRS){ const p=fromCube(A.x+d[0],A.z+d[2]); if(inb(p.c,p.r)) out.push(p);} return out; }
function cubeDir(a,b){ const A=toCube(a.c,a.r), B=toCube(b.c,b.r); return [B.x-A.x,B.y-A.y,B.z-A.z]; }
function stepDir(p,d){ const A=toCube(p.c,p.r); return fromCube(A.x+d[0],A.z+d[2]); }
function center(c,r){ return {x: SQ3*(c + 0.5*(r&1)) + SQ3/2, y: 1 + 1.5*r}; }
function posOf(c,r){ const p=center(c,r); p.y -= TER[tt(c,r)].elev; return p; }
function hexAtPoint(x,y){
  const r0 = Math.round((y-1)/1.5); let best=null, bd=1e9;
  for(let r=r0-1;r<=r0+1;r++){ if(r<0||r>=ROWS) continue;
    const c0 = Math.round((x-SQ3/2)/SQ3 - 0.5*(r&1));
    for(let c=c0-1;c<=c0+1;c++){ if(!inb(c,r)) continue; const p=center(c,r); const d=(p.x-x)**2+(p.y-y)**2; if(d<bd){ bd=d; best={c,r}; } } }
  return best;
}
const randInt = (a,b) => a + Math.floor(Math.random()*(b-a+1));

/* ================= STATO ================= */
let G, uid = 0;
function mk(cls,c,r,L=1,opt={}){
  const d = CLASSES[cls];
  const u = {id:uid++, cls, name:d.name, title:d.title, side:d.side, icon:d.icon, maxHp:d.hp, hp:d.hp, armor:d.armor||0, def:d.def, aim:d.aim,
    dmg:[...d.dmg], crit:d.crit, move:d.move, rmin:d.rmin, rmax:d.rmax, pierce:!!d.pierce, heal:d.heal||0, rage:!!d.rage, big:!!d.big, reach:!!d.reach, webs:!!d.webs,
    undead:!!d.undead, noCrit:!!d.noCrit, boss:!!d.boss, leader:!!d.leader, summon:!!d.summon, summonCls:d.summonCls||'skel', regen:d.regen||0, skills:new Set(), ab:0, abCd:0, critDmg:2, holy:d.holy||0, abRange:0,
    c, r, face: d.side==='hero' ? 1 : -1, ap:2, cd:0, rooted:0, stuck:false, overwatch:false, hunker:false, blessed:false, alive:true, vis:null, flash:0, implUsed:false, xp:FOE_XP[cls]||0, npc:false};
  if(opt.npc){
    u.side = 'hero'; u.npc = true; u.ap = 0; u.move = 0; u.title = 'Da proteggere';
    if(opt.name) u.name = opt.name;
    u.maxHp = Math.round(d.hp*1.4) + 2*(L-1); u.hp = u.maxHp; u.def = Math.max(u.def, 15);
  } else if(d.side==='hero' && C && C.heroes[cls]){
    const st = heroStats(cls);
    Object.assign(u, {maxHp:st.hp, hp:st.hp, armor:st.armor, def:st.def, aim:st.aim, dmg:st.dmg, crit:st.crit, move:st.move, rmax:st.rmax, ab:st.ab, abCd:st.abCd, critDmg:st.critDmg, holy:st.holy, abRange:st.abRange||0});
    u.skills = new Set(C.heroes[cls].skills); u.level = partyLevel();
    if(u.skills.has('berserk')) u.rage = true;
  } else if(L>1){
    const bonus = Math.floor((L-1)*0.6);
    u.maxHp += bonus; u.hp = u.maxHp; u.aim += Math.round(1.5*(L-1));
    const db = Math.floor((L-1)/3); u.dmg = [u.dmg[0]+db, u.dmg[1]+db];
    u.xp = Math.round(u.xp * (1 + .1*(L-1)));
  }
  return u;
}
const OBJ_TEXT = {kill:'Sconfiggi tutti i nemici', survive:'Resisti fino all\'alba', escape:'Porta tutti gli eroi al bordo nord', protect:'Proteggi'};
function objectiveText(short){
  const O = G.def.obj || {type:'kill'};
  if(O.type==='survive') return short ? `Resisti: turno ${Math.min(G.turn,O.turns)} di ${O.turns}` : `Resisti per ${O.turns} turni`;
  if(O.type==='protect') return `Proteggi ${O.npcName}` + (O.turns ? (short ? `: turno ${Math.min(G.turn,O.turns)} di ${O.turns}` : ` per ${O.turns} turni`) : '');
  if(O.type==='escape') return 'Porta tutti gli eroi alle caselle verdi a nord';
  if(G.units.some(u=>u.leader && u.side==='foe')) return 'Abbatti il capo nemico, o tutti i nemici';
  return 'Sconfiggi tutti i nemici';
}
const isExit = (c,r) => G.def.obj && G.def.obj.type==='escape' && r<=1 && passableT(G.map[r][c]);
function newGame(def){
  const ids = activeHeroes().filter(id => !(def.obj && def.obj.npc===id));
  const units = ids.map((id,i)=>mk(id, ...def.heroes[i])).concat(def.foes.map(f=>mk(f[0], f[1], f[2], def.level)));
  if(def.npc && def.obj && def.obj.npc) units.push(mk(def.obj.npc, def.npc[0], def.npc[1], def.level, {npc:true, name:def.obj.npcName}));
  G = {def, map: def.map.map(row=>row.split('')), units, turn:1, phase:'player', sel:null, inspect:null, mode:'move',
       pending:null, busy:false, over:false, hl:{move:[],targets:[],threat:[],area:[],chance:new Map(),fireRange:false,zone:[],blocked:[],zoneKind:null},
       terrainInfo:null, tileNote:null, lost:0, hover:null, chest: def.chest ? {c:def.chest[0], r:def.chest[1], item:def.chest[2]} : null, found:[], xp:0, rebirthUsed:false};
  startSide('hero', true);
  applyLook();
  $('missionTitle').textContent = def.title;
  if(typeof terr!=='undefined' && terr.width) drawTerrain();
  refresh();
}
const abilityCd = u => Math.max(1, CLASSES[u.cls].ability.cd + u.abCd);
function abilityOpts(u, id){ return id==='bash' ? {aimMod:10, dmg:[2+u.ab,3+u.ab]} : {dmg:[2+u.ab,3+u.ab]}; }
const unitAt = (c,r) => G.units.find(u => u.alive && u.c===c && u.r===r);
const alive = side => G.units.filter(u => u.alive && u.side===side);
const foesOf = u => alive(u.side==='hero' ? 'foe' : 'hero');
function rangeOf(u,p){ return u.rmax + (u.rmax>1 && tt(p.c,p.r)==='h' ? 1 : 0); }

function reachable(u, maxCost){
  const dmap = new Map([[key(u.c,u.r),0]]), prev = new Map();
  const open = [{c:u.c,r:u.r,d:0}];
  while(open.length){
    open.sort((a,b)=>a.d-b.d);
    const cur = open.shift();
    if(cur.d > dmap.get(key(cur.c,cur.r))) continue;
    for(const n of neighbors(cur.c,cur.r)){
      const cost = TER[tt(n.c,n.r)].cost; if(!cost) continue;
      const occ = unitAt(n.c,n.r); if(occ && occ.side!==u.side) continue;
      const nd = cur.d + cost; if(nd > maxCost) continue;
      const k = key(n.c,n.r);
      if(!dmap.has(k) || nd < dmap.get(k)){ dmap.set(k,nd); prev.set(k,key(cur.c,cur.r)); open.push({c:n.c,r:n.r,d:nd}); }
    }
  }
  const out = [], sk = key(u.c,u.r);
  for(const [k,d] of dmap){
    if(k===sk) continue;
    const [c,r] = k.split(',').map(Number);
    if(unitAt(c,r)) continue;
    const path = []; let cur = k;
    while(cur && cur!==sk){ const [pc,pr]=cur.split(',').map(Number); path.unshift({c:pc,r:pr}); cur = prev.get(cur); }
    out.push({c,r,path,cost:d});
  }
  return out;
}

/* --- copertura, linea di tiro, probabilità --- */
function coverAt(pos, from){
  let cv = TER[tt(pos.c,pos.r)].cover || 0;
  const P = center(pos.c,pos.r), A = center(from.c,from.r);
  const ax = A.x-P.x, ay = A.y-P.y, al = Math.hypot(ax,ay);
  if(al < 1e-6) return cv;
  for(const n of neighbors(pos.c,pos.r)){
    const adj = TER[tt(n.c,n.r)].adj; if(!adj || adj<=cv) continue;
    const N = center(n.c,n.r), nx = N.x-P.x, ny = N.y-P.y;
    if((nx*ax+ny*ay)/(Math.hypot(nx,ny)*al) >= 0.49) cv = adj;
  }
  return cv;
}
function maxCoverOf(c,r){
  let cv = TER[tt(c,r)].cover || 0;
  for(const n of neighbors(c,r)) cv = Math.max(cv, TER[tt(n.c,n.r)].adj || 0);
  return cv;
}
function hasLOS(a,b){
  const A = center(a.c,a.r), B = center(b.c,b.r), n = Math.ceil(dist(a,b)*5);
  for(let i=1;i<n;i++){
    const k = i/n, h = hexAtPoint(A.x+(B.x-A.x)*k+1e-3, A.y+(B.y-A.y)*k+1e-3);
    if(!h || (h.c===a.c&&h.r===a.r) || (h.c===b.c&&h.r===b.r)) continue;
    if(TER[tt(h.c,h.r)].blocksLos) return false;
  }
  return true;
}
function canTarget(u, from, t){
  const d = dist(from,t);
  return d>=u.rmin && d<=rangeOf(u,from) && (d===1 || hasLOS(from,t));
}
function shotInfo(att, from, tgt, o={}){
  const melee = att.rmax===1;
  const mods = [['mira', att.aim]];
  let p = att.aim;
  if(o.aimMod){ p += o.aimMod; mods.push(['abilità', o.aimMod]); }
  if(tgt.def){ p -= tgt.def; mods.push(['difesa', -tgt.def]); }
  if(tgt.skills.has('laststand') && tgt.hp <= tgt.maxHp/2){ p -= 20; mods.push(['ultimo baluardo', -20]); }
  if(tgt.skills.has('forestshade') && 'fu'.includes(tt(tgt.c,tgt.r))){ p -= 25; mods.push(['ombra del bosco', -25]); }
  if(neighbors(tgt.c,tgt.r).some(n=>{ const a=unitAt(n.c,n.r); return a && a!==tgt && a.side===tgt.side && (a.skills.has('bastion') || a.skills.has('stonewall')); })){ p -= 15; mods.push(['bastione', -15]); }
  if(tgt.blessed){ p -= 20; mods.push(['santuario', -20]); }
  if(att.skills.has('executioner') && tgt.hp <= tgt.maxHp/2){ p += 25; mods.push(['giustiziera', 25]); }
  const cov = coverAt(tgt, from);
  if(!melee && cov && !(cov===1 && att.skills.has('piercer'))){ const v = cov===2 ? 40 : 20; p -= v; mods.push([cov===2?'copertura piena':'mezza copertura', -v]); }
  if(tgt.hunker){ p -= 30; mods.push(['in difesa', -30]); }
  const high = !melee && tt(from.c,from.r)==='h' && tt(tgt.c,tgt.r)!=='h';
  if(high){ p += 15; mods.push(['altura', 15]); }
  if(!melee && dist(from,tgt)>4){ p -= 10; mods.push(['distanza', -10]); }
  if(o.reaction && !att.skills.has('sentinel')){ p -= 15; mods.push(['tiro di reazione', -15]); }
  p = Math.max(5, Math.min(100, Math.round(p)));
  const flanked = cov===0;
  let crit = o.reaction ? 0 : att.crit + (flanked ? 40 : 0) + (high ? 10 : 0);
  if(tgt.hunker || tgt.noCrit) crit = 0;
  crit = Math.min(100, crit);
  const guard = neighbors(tgt.c,tgt.r).some(n=>{ const a=unitAt(n.c,n.r); return a && a!==tgt && a.side===tgt.side && a.skills.has('guardian'); }) ? 1 : 0;
  const base = o.dmg || att.dmg, arm = (att.pierce ? 0 : tgt.armor + (tgt.skills.has('laststand') && tgt.hp<=tgt.maxHp/2 ? 1 : 0)) + guard, rage = ((att.rage && att.hp<=att.maxHp/2) ? 2 : 0) + (tgt.undead ? att.holy : 0);
  const dmin = Math.max(1, base[0]-arm+rage), dmax = Math.max(1, base[1]-arm+rage);
  return {p, crit, dmin, dmax, mods, cov, flanked};
}
function fireDamage(att,t){ const h = t.undead ? att.holy : 0; return {dmin: Math.max(1,3+att.ab+h-t.armor), dmax: Math.max(1,5+att.ab+h-t.armor)}; }

function attackTargets(u){ return foesOf(u).filter(t => canTarget(u,u,t)); }
function abilityTargets(u){
  const ab = CLASSES[u.cls].ability; if(!ab) return [];
  if(ab.id==='bash') return foesOf(u).filter(t=>dist(u,t)===1).map(t=>({c:t.c,r:t.r}));
  if(ab.id==='pin') return attackTargets(u).map(t=>({c:t.c,r:t.r}));
  if(ab.id==='light') return alive('hero').filter(t=>dist(u,t)<=lightRange(u)).map(t=>({c:t.c,r:t.r}));
  if(ab.id==='quake') return [{c:u.c, r:u.r}];
  if(ab.id==='fire'){
    const out=[]; const R = ab.range + (tt(u.c,u.r)==='h'?1:0);
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){ const d=dist(u,{c,r}); if(d>=1 && d<=R) out.push({c,r}); }
    return out;
  }
  return [];
}
function rangeZone(u, from, rmin, rmax, needLos){
  const zone = [], blocked = [];
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    if(c===from.c && r===from.r) continue;
    const d = dist(from,{c,r}); if(d<rmin || d>rmax) continue;
    if(!TER[tt(c,r)].cost && needLos) continue;
    if(!needLos || d===1 || hasLOS(from,{c,r})) zone.push({c,r}); else blocked.push({c,r});
  }
  return {zone, blocked};
}
function quakeArea(u){ const R = u.skills.has('avalanche') ? 2 : 1, out = []; for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){ const d = dist(u,{c,r}); if(d>=1 && d<=R) out.push({c,r}); } return out; }
function lightRange(u){ return (CLASSES[u.cls].ability.range||3) + (u.abRange||0); }
function areaOf(c,r){ return [{c,r}, ...neighbors(c,r)]; }
function pushInfo(att,tgt){
  const d = cubeDir(att,tgt); const dest = stepDir(tgt,d);
  let blocked=false, occ=null, why='';
  if(!inb(dest.c,dest.r)){ blocked=true; why='il bordo'; }
  else if(!TER[tt(dest.c,dest.r)].cost){ blocked=true; why = tt(dest.c,dest.r)==='w' ? 'il fiume' : 'le rocce'; }
  else if((occ=unitAt(dest.c,dest.r))){ blocked=true; why = occ.name; }
  return {dest, blocked, occ, why};
}
function threatTiles(u){
  const set = new Map();
  const spots = [{c:u.c,r:u.r}, ...(u.stuck||u.rooted ? [] : reachable(u,u.move))];
  for(const s of spots){
    const R = rangeOf(u,s);
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
      if(set.has(key(c,r)) || !TER[tt(c,r)].cost) continue;
      const d = dist(s,{c,r}); if(d<u.rmin || d>R) continue;
      if(d>1 && !hasLOS(s,{c,r})) continue;
      set.set(key(c,r),{c,r});
    }
  }
  return [...set.values()];
}

/* ================= ANTEPRIMA ================= */
const pct = n => n+'%';
function shotText(si, who){
  const parts = si.mods.slice(1).map(([n,v]) => `${n} ${v>0?'+':'−'}${Math.abs(v)}`);
  return `<b>${si.p}%</b> di colpire ${who}${parts.length?` (${parts.join(', ')})`:''}, ${si.dmin}–${si.dmax} danni, ${si.crit}% di critico${si.flanked && si.crit>0?' perché è scoperto':''}.`;
}
function buildPending(kind, c, r){
  const u = G.sel; const p = {kind, c, r, results:[], push:null, text:''};
  if(kind==='move'){
    const m = G.hl.move.find(m=>m.c===c && m.r===r);
    p.path = m.path; p.cost = m.apc;
    const at = {c,r};
    const seen = foesOf(u).filter(f => dist(at,f) <= 7 && hasLOS(f,at));
    const exposed = seen.filter(f => f.rmax>1 && coverAt(at,f)===0);
    p.flank = foesOf(u).filter(f => canTarget(u,at,f) && coverAt(f,at)===0);
    p.text = m.apc===1 ? 'Spostamento: 1 azione, poi potrai ancora agire. ' : 'Scatto: usa entrambe le azioni. ';
    p.text += exposed.length ? `Da qui sei scoperto per ${exposed.map(f=>f.name+(f.title==='Tiratore'?' tiratore':'')).join(', ')}.` : 'Da qui sei al riparo dai tiratori in vista.';
    if(p.flank.length) p.text += ` Potrai colpire scoperti: ${p.flank.map(f=>f.name).join(', ')}.`;
    const watch = foesOf(u).filter(f => f.overwatch && m.path.some(s => canTarget(f,f,s)));
    if(watch.length) p.text += ` <b>Attenzione:</b> ${watch.map(f=>f.name).join(' e ')} di guardia ti tirerà addosso.`;
  } else if(kind==='attack' || kind==='bash' || kind==='pin'){
    const t = unitAt(c,r);
    const o = kind==='attack' ? {} : abilityOpts(u, kind);
    const si = shotInfo(u,u,t,o); p.si = si; p.o = o;
    p.results.push({unit:t, text: pct(si.p), sub: `${si.dmin}–${si.dmax}`});
    const names = {attack:'Attacco', bash:'Colpo di scudo', pin:'Freccia inchiodante'};
    p.text = `${names[kind]}: ${shotText(si, t.name)}`;
    if(si.dmax >= t.hp) p.text += ' Può abbatterlo.';
    if(kind==='bash'){
      const pi = pushInfo(u,t); p.push = {from:{c,r}, to:pi.dest, blocked:pi.blocked};
      p.text += pi.blocked ? ` Se colpisce, lo schianta contro ${pi.why}: +3 danni.` : ' Se colpisce, lo spinge indietro.';
    }
    if(kind==='pin') p.text += ' Se colpisce, resta fermo un turno.';
  } else if(kind==='light'){
    const t = unitAt(c,r), amt = Math.min(4+u.ab, t.maxHp-t.hp);
    p.results.push({unit:t, text:'+'+amt, heal:true});
    p.text = `Luce sacra su ${t===u?'se stessa':t.name}: <b>+${amt} vita</b>${t.stuck||t.rooted?', e la libera dalle ragnatele':''}${u.skills.has('sanctuary')?', e −20% a essere colpito fino al prossimo turno':''}.`;
    if(u.skills.has('radiance')){ const n = neighbors(t.c,t.r).map(q=>unitAt(q.c,q.r)).filter(x=>x && x.side==='foe' && x.undead).length; if(n) p.text += ` La luce brucia ${n} ${n===1?'non morto':'non morti'} vicino.`; }
  } else if(kind==='quake'){
    const hits = quakeArea(u).map(a=>unitAt(a.c,a.r)).filter(x=>x && x.side==='foe');
    for(const t of hits) p.results.push({unit:t, text:`${3+u.ab}–${4+u.ab}`});
    p.text = hits.length ? `Terremoto: colpisce di sicuro ${hits.length} ${hits.length===1?'nemico':'nemici'} e li blocca a terra.` : 'Terremoto: nessun nemico nella zona.';
  } else if(kind==='fire'){
    const hits = areaOf(c,r).map(a=>unitAt(a.c,a.r)).filter(Boolean);
    for(const t of hits){ const d = fireDamage(u,t); p.results.push({unit:t, text:`${d.dmin}–${d.dmax}`}); }
    const foes = hits.filter(x=>x.side==='foe'), friends = hits.filter(x=>x.side==='hero');
    const names = friends.map(f=>f.name).join(' e ');
    const trees = areaOf(c,r).filter(a=>tt(a.c,a.r)==='f').length;
    if(!hits.length) p.text = 'Palla di fuoco: nessuno nell\'area.';
    else if(!foes.length) p.text = `Palla di fuoco: nessun nemico nell'area, colpiresti solo <b>${names}</b>.`;
    else p.text = `Palla di fuoco: colpisce di sicuro ${foes.length} ${foes.length===1?'nemico':'nemici'}${friends.length?`, ma anche <b>${names}</b>`:''}.`;
    if(trees) p.text += ` Brucia ${trees===1?'un bosco':trees+' boschi'}.`;
  }
  p.text += ' <em>Tocca di nuovo o premi Conferma.</em>';
  return p;
}

/* ================= ANIMAZIONE ================= */
const anims = [], fx = [], parts = [];
let shake = 0;
const spd = REDUCED ? 0.45 : 1;
function tween(dur, fn){ return new Promise(res => anims.push({t0:performance.now(), dur:dur*spd, fn, res})); }
const sleep = ms => new Promise(r => setTimeout(r, ms*spd));
const ease = k => k<.5 ? 2*k*k : 1-Math.pow(-2*k+2,2)/2;

async function moveUnit(u, path){
  for(const p of path){
    const a = posOf(u.c,u.r), b = posOf(p.c,p.r);
    if(Math.abs(b.x-a.x)>.05) u.face = Math.sign(b.x-a.x);
    await tween(125, k => { u.vis = {x:a.x+(b.x-a.x)*k, y:a.y+(b.y-a.y)*k - Math.sin(k*Math.PI)*0.14}; });
    u.c = p.c; u.r = p.r; u.vis = null; sfx('step');
    if(u.side==='hero' && G.chest && G.chest.c===u.c && G.chest.r===u.r){
      G.found.push(G.chest.item); sfx('chest'); floatText(u, 'Trovato: '+ITEMS[G.chest.item].name, '#ffe08a');
      const cp = posOf(u.c,u.r); burst(cp.x,cp.y-.2,'#ffe08a',16,1.6,.07); G.chest = null; await sleep(350);
    }
    await reactions(u);
    if(!u.alive) return false;
  }
  return true;
}
async function reactions(mover){
  const watchers = G.units.filter(w => w.alive && w.side!==mover.side && w.overwatch && canTarget(w,w,mover));
  for(const w of watchers){
    if(!mover.alive) break;
    w.overwatch = false;
    sfx('alert'); floatText(w,'Reazione!','#ffe08a');
    await sleep(320);
    await resolveShot(w, mover, {reaction:true});
    await sleep(200);
  }
}
async function lunge(u, t){
  const a = posOf(u.c,u.r), b = posOf(t.c,t.r);
  if(Math.abs(b.x-a.x)>.05) u.face = Math.sign(b.x-a.x);
  await tween(110, k => { const e=ease(k)*0.38; u.vis={x:a.x+(b.x-a.x)*e, y:a.y+(b.y-a.y)*e}; });
  fx.push({type:'slash', x:b.x, y:b.y-.45, ang:Math.atan2(b.y-a.y,b.x-a.x), t0:performance.now()});
  tween(160, k => { const e=(1-ease(k))*0.38; u.vis={x:a.x+(b.x-a.x)*e, y:a.y+(b.y-a.y)*e}; if(k>=1) u.vis=null; });
}
async function shoot(u, t, type, miss){
  const a0 = posOf(u.c,u.r), b0 = posOf(t.c,t.r);
  if(u.c!==undefined && Math.abs(b0.x-a0.x)>.05 && u.face) u.face = Math.sign(b0.x-a0.x);
  const a = {x:a0.x + .3*(u.face||1), y:a0.y-.45}; let b = {x:b0.x, y:b0.y-.3};
  if(miss){ const dx=b.x-a.x, dy=b.y-a.y, l=Math.hypot(dx,dy)||1, side=Math.random()<.5?-1:1; b = {x:b.x - dy/l*.55*side + dx/l*.5, y:b.y + dx/l*.55*side + dy/l*.5}; }
  const f = {type, a, b, k:0}; fx.push(f);
  const len = Math.hypot(b.x-a.x,b.y-a.y);
  await tween(type==='orb'?420:180+len*40, k => { f.k = k; });
  fx.splice(fx.indexOf(f),1);
}
function burst(x,y,color,n,spdv=2.2,size=.07){
  if(REDUCED) n = Math.ceil(n/3);
  for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, s=(.4+Math.random())*spdv;
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:0,max:.45+Math.random()*.45,color,size:size*(.6+Math.random())}); }
}
function floatText(u, text, color){
  const p = posOf(u.c,u.r);
  fx.push({type:'float', x:p.x, y:p.y-1.0, text, color, big:/Critico/.test(text), t0:performance.now()});
}
function hit(u, dmg, crit){
  if(!u.alive) return;
  u.hp -= dmg; u.flash = 1;
  const p = posOf(u.c,u.r);
  floatText(u, (crit?'Critico −':'−')+dmg, crit?'#ffd86b':'#ffb4a2');
  burst(p.x, p.y-.35, u.side==='foe'?'#ffcf8a':'#ff9a8a', crit?18:10);
  fx.push({type:'ring', x:p.x, y:p.y-.35, t0:performance.now(), col: crit ? '255,215,110' : '255,235,215'});
  if(!REDUCED) shake = Math.max(shake, Math.min(8, 2+dmg+(crit?2:0)));
  if(u.hp <= 0 && u.side==='hero' && !G.rebirthUsed && G.units.some(h=>h.alive && h.side==='hero' && h.skills.has('rebirth'))){
    G.rebirthUsed = true; u.hp = 1; floatText(u,'Ultima scintilla','#ffe08a'); return;
  }
  if(u.hp <= 0){
    u.hp = 0; u.alive = false;
    if(u.side==='foe') G.xp += u.xp;
    sfx(u.undead ? 'bones' : 'death', .08);
    if(u.side==='hero') G.lost++;
    fx.push({type:'ghost', u:{...u}, x:p.x, y:p.y, t0:performance.now()});
    burst(p.x, p.y-.2, '#d9cfb3', 18, 1.6, .09);
    if(G.sel===u) G.sel=null;
    if(G.inspect===u) G.inspect=null;
    if(u.leader){
      for(const o of G.units) if(o.alive && o.undead){ o.alive = false; const q = posOf(o.c,o.r); fx.push({type:'ghost', u:{...o}, x:q.x, y:q.y, t0:performance.now()}); burst(q.x,q.y-.2,'#cfc6b8',14,1.4,.09); }
      for(const o of G.units) if(o.alive && o.side==='foe'){ o.alive = false; G.xp += o.xp/2; floatText(o,'Fugge','#e6dcc2'); }
    }
  }
}
function healUnit(u, n){
  const amt = Math.min(n, u.maxHp-u.hp); if(amt<=0) return;
  u.hp += amt; sfx('heal'); floatText(u, '+'+amt, '#a6f0c8');
  const p = posOf(u.c,u.r); burst(p.x,p.y-.3,'#9ff0d0',10,1.2,.06);
}

/* ================= AZIONI ================= */
async function resolveShot(att, tgt, o={}){
  const si = shotInfo(att, att, tgt, o);
  const ok = Math.random()*100 < si.p;
  const crit = ok && Math.random()*100 < si.crit;
  const close = att.rmax===1 || att.reach;
  sfx(close ? 'swing' : att.pierce ? 'zap' : 'bow');
  if(close) await lunge(att,tgt); else await shoot(att, tgt, att.pierce ? 'bolt' : 'arrow', !ok);
  if(ok){ sfx(crit ? 'crit' : tgt.armor>0 ? 'clang' : 'hit'); hit(tgt, randInt(si.dmin, si.dmax) + (crit?att.critDmg:0), crit); }
  else { sfx('miss'); floatText(tgt, 'Mancato', '#e6dcc2'); }
  if(ok && att.webs && tgt.alive && !tgt.skills.has('stubborn') && Math.random() < .5){ tgt.rooted = 1; await sleep(200); floatText(tgt, 'Ragnatela', '#e8e2d0'); }
  if(att.rmax===1 && att.alive && tgt.alive && dist(att,tgt)===1 && tgt.skills.has('counter')){
    await sleep(380); floatText(tgt,'Contrattacco','#ffe08a'); sfx('swing'); await lunge(tgt,att); sfx('hit'); hit(att, 2);
  }
  return ok;
}
async function doPush(att, tgt){
  await sleep(120);
  const pi = pushInfo(att,tgt);
  const a = posOf(tgt.c,tgt.r);
  if(pi.blocked){
    const ap = posOf(att.c,att.r);
    const b = inb(pi.dest.c,pi.dest.r) ? posOf(pi.dest.c,pi.dest.r) : {x:a.x+(a.x-ap.x), y:a.y+(a.y-ap.y)};
    await tween(90, k => { const e=k*.3; tgt.vis={x:a.x+(b.x-a.x)*e,y:a.y+(b.y-a.y)*e}; });
    sfx('thud'); hit(tgt,3); if(pi.occ) hit(pi.occ,2);
    await tween(110, k => { const e=(1-k)*.3; tgt.vis={x:a.x+(b.x-a.x)*e,y:a.y+(b.y-a.y)*e}; });
    tgt.vis = null;
  } else {
    const b = posOf(pi.dest.c,pi.dest.r);
    await tween(170, k => { const e=ease(k); tgt.vis={x:a.x+(b.x-a.x)*e,y:a.y+(b.y-a.y)*e}; });
    tgt.c = pi.dest.c; tgt.r = pi.dest.r; tgt.vis = null;
    await reactions(tgt);
  }
}
async function doFire(att, c, r){
  const area = areaOf(c,r);
  const hits = area.map(a=>unitAt(a.c,a.r)).filter(Boolean);
  sfx('fireLaunch');
  await shoot(att,{c,r},'orb');
  sfx('boom');
  for(const a of area){ const p=posOf(a.c,a.r); burst(p.x,p.y,'#ffb347',7,2.6,.09); burst(p.x,p.y,'#ff6a2b',5,1.8,.08); }
  fx.push({type:'blast', c, r, t0:performance.now()});
  if(!REDUCED) shake = 9;
  let burnt = false;
  for(const a of area) if(tt(a.c,a.r)==='f'){ G.map[a.r][a.c] = 'a'; burnt = true; const p=posOf(a.c,a.r); burst(p.x,p.y-.3,'#3a3430',10,1.2,.1); }
  if(burnt) drawTerrain();
  for(const t of hits){ const d = fireDamage(att,t); hit(t, randInt(d.dmin,d.dmax)); }
}
async function doLight(u, t){
  const p = posOf(t.c,t.r);
  sfx('heal'); burst(p.x,p.y-.5,'#fff2b0',16,1.2,.07); fx.push({type:'ring', x:p.x, y:p.y-.35, t0:performance.now(), col:'255,240,170'});
  await sleep(250);
  healUnit(t, 4+u.ab); t.rooted = 0; t.stuck = false;
  if(u.skills.has('sanctuary')){ t.blessed = true; floatText(t,'Santuario','#fff2b0'); }
  if(u.skills.has('radiance')) for(const q of neighbors(t.c,t.r)){ const x = unitAt(q.c,q.r); if(x && x.side==='foe' && x.undead){ await sleep(150); sfx('hit'); hit(x,3); } }
  await sleep(200);
}
async function doQuake(u){
  const area = quakeArea(u);
  sfx('boom'); if(!REDUCED) shake = 10;
  await lunge(u, {c:u.c, r:Math.max(0,u.r-1)});
  for(const a of area){ const p = posOf(a.c,a.r); burst(p.x,p.y+.2,'#8a7458',7,1.8,.08); }
  fx.push({type:'blast', c:u.c, r:u.r, t0:performance.now(), quake:true});
  for(const a of area){ const t = unitAt(a.c,a.r); if(t && t.side==='foe'){ hit(t, randInt(3+u.ab, 4+u.ab)); if(t.alive){ t.rooted = 1; } } }
  await sleep(300);
}
async function spawnFoes(list, from){
  const rows = from==='s' ? [9,8,7] : [0,1,2];
  const spots = [];
  for(const r of rows) for(let c=0;c<COLS;c++) if(passableT(G.map[r][c]) && !unitAt(c,r)) spots.push({c,r,w:Math.random()+rows.indexOf(r)});
  spots.sort((a,b)=>a.w-b.w);
  for(const cls of list){
    const sp = spots.shift(); if(!sp) break;
    const u = mk(cls, sp.c, sp.r, G.def.level); u.ap = 0; G.units.push(u);
    const p = posOf(sp.c,sp.r); burst(p.x,p.y-.2,'#d8ccb0',12,1.3,.08);
  }
}
async function doSummon(f){
  const spots = neighbors(f.c,f.r).filter(n => TER[tt(n.c,n.r)].cost && !unitAt(n.c,n.r));
  if(!spots.length) return false;
  const sp = spots[Math.floor(Math.random()*spots.length)];
  const p = posOf(sp.c,sp.r);
  sfx('summon'); floatText(f, f.summonCls==='ragno' ? 'Uova!' : 'Evoca!', '#d7b8ff'); burst(p.x,p.y,'#b48cff',18,1.4,.08); burst(p.x,p.y,'#2a1a3a',10,1,.1);
  await sleep(300);
  const u = mk(f.summonCls||'skel', sp.c, sp.r, G.def.level); u.ap = 0; G.units.push(u);
  f.cd = 3; await sleep(250);
  return true;
}
async function doHeal(f, t){
  const a = posOf(f.c,f.r);
  burst(a.x,a.y-.3,'#9ff0d0',8,1,.06);
  await sleep(200);
  healUnit(t, f.heal); f.cd = 2;
  await sleep(250);
}

function startSide(side, silent){
  for(const u of alive(side)){
    u.ap = u.npc ? 0 : 2;
    if(u.cd>0) u.cd--;
    u.stuck = u.rooted>0 && !u.skills.has('stubborn'); u.rooted = 0;
    u.overwatch = false; u.hunker = false; u.implUsed = false; u.blessed = false;
    if(!silent && u.regen && u.hp<u.maxHp) healUnit(u, u.regen);
    if(!silent && tt(u.c,u.r)==='s') healUnit(u,2);
  }
  if(!silent) for(const u of alive(side)) if(u.skills.has('healaura')) for(const n of neighbors(u.c,u.r)){ const a = unitAt(n.c,n.r); if(a && a.side===side) healUnit(a,2); }
}
function wavesLeft(){ const W = (G.def.obj && G.def.obj.waves) || {}; return Object.keys(W).some(t => +t > G.turn); }
function checkEnd(){
  if(G.over) return true;
  const O = G.def.obj || {type:'kill'};
  if(!alive('hero').filter(h=>!h.npc).length){ finish(false); return true; }
  const lostNpc = G.units.find(u=>u.npc && !u.alive);
  if(lostNpc){ finish(false, lostNpc.name); return true; }
  if(!alive('foe').length && !wavesLeft()){ finish(true); return true; }
  if(O.type==='escape'){ const hs = alive('hero').filter(h=>!h.npc); if(hs.length && hs.every(h=>isExit(h.c,h.r))){ finish(true); return true; } }
  return false;
}
function finish(win, why){
  G.over = true; G.sel = null; G.pending = null; G.busy = false; refresh();
  setTimeout(()=> win ? missionWon() : missionLost(why), 1000*spd);
}

/* ================= TURNO NEMICO ================= */
function distField(){
  const d = new Map(); const open = [];
  for(const h of alive('hero')){ d.set(key(h.c,h.r),0); open.push({c:h.c,r:h.r,v:0}); }
  while(open.length){
    open.sort((a,b)=>a.v-b.v); const cur = open.shift();
    for(const n of neighbors(cur.c,cur.r)){
      const cost = TER[tt(n.c,n.r)].cost; if(!cost) continue;
      const nv = cur.v + cost, k = key(n.c,n.r);
      if(!d.has(k) || nv < d.get(k)){ d.set(k,nv); open.push({c:n.c,r:n.r,v:nv}); }
    }
  }
  return d;
}
function safety(o, heroes){
  let s = 0, n = 0;
  for(const h of heroes){ if(dist(o,h)>6) continue; n++; s += h.rmax>1 ? coverAt(o,h) : 0; }
  return n ? s/n : 0;
}
async function foeAct(f){
  if(!f.alive || G.over) return;
  if(f.stuck) floatText(f,'Inchiodato','#e8d49a');
  let heroes = alive('hero'); if(!heroes.length) return;
  if(f.summon && f.cd===0 && G.units.filter(u=>u.alive && u.cls===f.summonCls).length < (f.summonCls==='ragno' ? 3 : 4)){ if(await doSummon(f)) f.ap = 1; }
  const one = [{c:f.c,r:f.r,path:[],cost:0}, ...(f.stuck || f.ap<2 ? [] : reachable(f, f.move))];
  let best = null;
  for(const o of one){
    const safe = safety(o, heroes);
    if(f.heal && f.cd===0){
      for(const a of alive('foe')){
        const miss = a.maxHp - a.hp; if(miss<2) continue;
        const d = a===f ? 0 : dist(o,a); if(d>2) continue;
        const s = Math.min(f.heal,miss)*1.1 + (a.hp<=a.maxHp/2?1.5:0) + safe;
        if(!best || s>best.s) best = {s, o, kind:'heal', t:a};
      }
    }
    for(const h of heroes){
      if(!canTarget(f,o,h)) continue;
      const si = shotInfo(f,o,h);
      const avg = (si.dmin+si.dmax)/2, kill = si.dmin>=h.hp ? 1 : si.dmax>=h.hp ? .5 : 0;
      let s = si.p/100*(avg + kill*6 + si.crit/50) + safe*1.2 - o.cost*.02;
      if(tt(o.c,o.r)==='s') s += .3;
      if(!best || s>best.s) best = {s, o, kind:'attack', t:h};
    }
  }
  if(best && best.s > 0.9){
    if(best.o.path.length){ f.ap--; const ok = await moveUnit(f, best.o.path); if(!ok || G.over) return; await sleep(90); }
    heroes = alive('hero');
    if(best.kind==='attack'){
      if(best.t.alive && canTarget(f,f,best.t)) await resolveShot(f, best.t);
    } else if(best.t.alive) await doHeal(f, best.t);
    f.ap = 0;
    return;
  }
  // nessun bersaglio: avanza cercando copertura
  const field = distField();
  const ranged = f.rmax > 1;
  const opts = [{c:f.c,r:f.r,path:[],cost:0}, ...(f.stuck || f.ap<2 ? [] : reachable(f, ranged ? f.move : f.move*2))];
  let bo = null, bv = Infinity;
  for(const o of opts){
    let v = field.has(key(o.c,o.r)) ? field.get(key(o.c,o.r)) : 99;
    if(ranged) v = Math.abs(v-4)*.7 + v*.15;
    v -= safety(o, heroes)*1.6 + (tt(o.c,o.r)==='s'?.5:0);
    if(v < bv){ bv = v; bo = o; }
  }
  if(bo && bo.path.length){ const ok = await moveUnit(f, bo.path); if(!ok || G.over) return; }
  if(ranged && f.alive){ f.overwatch = true; sfx('ready'); floatText(f,'Di guardia','#ffe08a'); await sleep(250); }
  f.ap = 0;
}
async function enemyPhase(){
  G.phase = 'foe'; G.sel = null; G.inspect = null; G.pending = null; G.busy = true; refresh();
  banner('Turno nemico', true);
  await sleep(750);
  startSide('foe');
  const order = {gArcher:0, skelA:0, shaman:1, cult:1, adept:1, necro:1, ilvar:1, regina:1, goblin:2, lupo:2, skel:2, wraith:2, ragno:2, ghoul:2, orc:3, warlord:3, boneKnight:3, troll:3, golem:3, ashKnight:3, king:3};
  const foes = alive('foe').sort((a,b)=>order[a.cls]-order[b.cls]);
  for(const f of foes){
    if(G.over) return;
    await foeAct(f); refresh();
    await sleep(260);
    if(checkEnd()) return;
  }
  G.turn++;
  const O = G.def.obj || {}, W = (O.waves||{})[G.turn];
  if(O.turns && G.turn > O.turns){ G.phase = 'player'; G.busy = false; sfx('turn'); finish(true); return; }
  if(W){ await spawnFoes(W, O.type==='escape' ? 's' : 'n'); banner('Rinforzi nemici!', true); await sleep(900); }
  G.phase = 'player'; G.busy = false;
  startSide('hero');
  banner(O.turns ? `Turno ${G.turn} di ${O.turns}` : 'Turno '+G.turn, false);
  refresh();
}
