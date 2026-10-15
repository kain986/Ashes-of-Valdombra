'use strict';
/* Le Ceneri di Valdombra: ui.js */
/* ================= INPUT ================= */
const $ = id => document.getElementById(id);
const canMove = u => u.ap>0 && !u.stuck;
function defaultMode(u){ return canMove(u) ? 'move' : 'attack'; }
function select(u){ sfx('select'); G.sel = u; G.inspect = null; G.mode = defaultMode(u); G.pending = null; G.terrainInfo = null; G.tileNote = null; refresh(); }
function setMode(m){ if(!G.sel || G.busy) return; G.mode = m; G.pending = null; G.tileNote = null; refresh(); }

function onTap(c, r){
  if(G.busy || G.over || G.phase!=='player') return;
  const u = unitAt(c,r), sel = G.sel;
  G.tileNote = null;
  if(G.pending && G.pending.c===c && G.pending.r===r){ execPending(); return; }
  if(sel && sel.ap>0){
    if(G.mode==='move' && !u && G.hl.move.some(m=>m.c===c && m.r===r)){ G.pending = buildPending('move',c,r); refresh(); return; }
    if(G.mode==='attack' && u && u.side==='foe' && attackTargets(sel).includes(u)){ G.pending = buildPending('attack',c,r); refresh(); return; }
    if(G.mode==='ability' && sel.cd===0){
      const ab = CLASSES[sel.cls].ability;
      if(abilityTargets(sel).some(t=>t.c===c && t.r===r)){ G.pending = buildPending(ab.id,c,r); refresh(); return; }
    }
  }
  if(u && u.side==='hero' && !u.npc){ if(u===sel && !G.pending){ G.sel=null; refresh(); return; } select(u); return; }
  if(u && (u.side==='foe' || u.npc)){ G.sel = null; G.inspect = u; G.pending = null; G.terrainInfo = null; refresh(); return; }
  if(sel){
    G.pending = null;
    const t = TER[tt(c,r)];
    const why = G.mode==='move' ? (canMove(sel) ? 'Casella non raggiungibile.' : `${sel.name} non può più muoversi.`)
              : G.mode==='ability' ? 'Fuori portata.' : 'Nessun bersaglio qui.';
    G.tileNote = `${why} <em>${t.name}: ${t.note}</em>`;
    refresh(); return;
  }
  G.inspect = null; G.pending = null; G.terrainInfo = {c,r}; refresh();
}
async function execPending(){
  const p = G.pending, u = G.sel; if(!p || !u) return;
  if(p.kind==='watch'){ G.pending = null; u.ap = 0; u.overwatch = true; G.mode = 'move'; sfx('ready'); floatText(u,'Di guardia','#ffe08a'); afterAction(u); return; }
  G.pending = null; G.busy = true; refresh();
  if(p.kind==='move'){
    u.ap -= p.cost;
    await moveUnit(u, p.path);
    G.busy = false;
    if(checkEnd()) return;
    if(u.alive && u.ap>0) G.mode = attackTargets(u).length ? 'attack' : 'move';
    afterAction(u); return;
  }
  u.ap = 0;
  const victim = unitAt(p.c,p.r);
  if(p.kind==='attack') await resolveShot(u, victim);
  else if(p.kind==='bash'){ const t = unitAt(p.c,p.r); const ok = await resolveShot(u,t,p.o); if(ok && t.alive) await doPush(u,t); }
  else if(p.kind==='pin'){ const t = unitAt(p.c,p.r); const ok = await resolveShot(u,t,p.o); if(ok && t.alive && !t.skills.has('stubborn')){ t.rooted = 1; floatText(t,'Inchiodato','#e8d49a'); } }
  else if(p.kind==='fire') await doFire(u, p.c, p.r);
  else if(p.kind==='light') await doLight(u, unitAt(p.c,p.r));
  else if(p.kind==='quake') await doQuake(u);
  if(p.kind!=='attack') u.cd = abilityCd(u);
  if(p.kind!=='fire' && p.kind!=='quake' && victim && victim.side==='foe' && !victim.alive && u.alive && u.skills.has('implacable') && !u.implUsed){ u.implUsed = true; u.ap = 1; floatText(u,'Implacabile','#ffe08a'); G.mode = 'move'; }
  G.busy = false;
  if(checkEnd()) return;
  afterAction(u);
}
function afterAction(u){
  if(!u.alive || u.ap===0){
    G.sel = null;
    const next = alive('hero').find(h => h.ap>0);
    if(next){ G.sel = next; G.mode = defaultMode(next); }
  }
  refresh();
}
const heroDone = h => h.ap===0;

$('bMove').onclick = () => setMode('move');
$('bAttack').onclick = () => setMode('attack');
$('bAbility').onclick = () => setMode('ability');
$('bWatch').onclick = () => {
  const u=G.sel; if(!u || u.ap<1 || G.busy) return;
  if(G.mode==='watch'){ G.mode = defaultMode(u); G.pending = null; refresh(); return; }
  G.mode='watch'; G.tileNote=null;
  G.pending = {kind:'watch', c:u.c, r:u.r, results:[], text:`Guardia: ${u.name} usa tutte le azioni e colpirà con −15% di mira il primo nemico che si muove nella zona gialla. <em>Premi Conferma o tocca di nuovo l'eroe.</em>`};
  refresh();
};
$('bHunker').onclick = () => { const u=G.sel; if(!u || u.ap<1 || G.busy) return; u.ap=0; u.hunker=true; G.pending=null; G.mode='move'; sfx('ready'); floatText(u,'In difesa','#bfe6ff'); afterAction(u); };
$('bConfirm').onclick = () => execPending();
$('bEnd').onclick = () => { if(G.busy || G.over || G.phase!=='player') return; enemyPhase(); };
$('helpBtn').onclick = () => { $('intro').hidden = false; $('startBtn').textContent = 'Torna alla battaglia'; $('startBtn').focus(); };
const startHandler = () => { $('intro').hidden = true; if(G && !G.started){ G.started = true; banner('Turno 1'); } };
$('startBtn').onclick = startHandler;

/* ================= UI ================= */
let bannerTimer;
function banner(text, foe){
  const b = $('banner'); b.querySelector('span').textContent = text;
  b.classList.toggle('foe', !!foe); b.classList.add('show');
  sfx(foe ? 'foeTurn' : 'turn');
  clearTimeout(bannerTimer); bannerTimer = setTimeout(()=>b.classList.remove('show'), 1100*spd);
}
function computeHL(){
  const hl = {move:[], targets:[], threat:[], area:[], chance:new Map(), fireRange:false, zone:[], blocked:[], zoneKind:null};
  const u = G.sel;
  if(u && G.phase==='player' && !G.busy && u.ap>0){
    if(G.mode==='move' && canMove(u)) { const watchers = foesOf(u).filter(f=>f.overwatch); hl.move = reachable(u, u.move*u.ap).map(m => ({...m, apc: m.cost<=u.move ? 1 : 2, cov: maxCoverOf(m.c,m.r), watched: watchers.some(f=>canTarget(f,f,m))})); }
    if(G.mode==='attack'){
      for(const t of attackTargets(u)){ hl.targets.push({c:t.c,r:t.r}); hl.chance.set(key(t.c,t.r), shotInfo(u,u,t)); }
    } else if(G.mode==='ability' && u.cd===0){
      const ab = CLASSES[u.cls].ability;
      hl.targets = abilityTargets(u); hl.fireRange = ab.id==='fire'; hl.ally = ab.id==='light';
      if(ab.id==='quake'){ hl.area = quakeArea(u); hl.areaNoCross = true; }
      if(ab.id==='bash' || ab.id==='pin') for(const t of hl.targets){ const tu = unitAt(t.c,t.r); hl.chance.set(key(t.c,t.r), shotInfo(u,u,tu, abilityOpts(u, ab.id))); }
    }
    if(G.pending && G.pending.kind==='fire') hl.area = areaOf(G.pending.c,G.pending.r);
  }
  if(u && G.phase==='player' && !G.busy){
    const setZ = (z, kind) => { hl.zone = z.zone; hl.blocked = z.blocked; hl.zoneKind = kind; };
    const ab = CLASSES[u.cls].ability;
    if(u.ap>0 && G.mode==='attack') setZ(rangeZone(u,u,u.rmin,rangeOf(u,u),true), 'attack');
    else if(u.ap>0 && G.mode==='ability' && u.cd===0){
      if(ab.id==='bash') setZ(rangeZone(u,u,1,1,true), 'ability');
      else if(ab.id==='pin') setZ(rangeZone(u,u,u.rmin,rangeOf(u,u),true), 'ability');
      else if(ab.id==='fire') setZ(rangeZone(u,u,1,ab.range+(tt(u.c,u.r)==='h'?1:0),false), 'ability');
      else if(ab.id==='light'){ const z = rangeZone(u,u,1,lightRange(u),false); z.zone.push({c:u.c,r:u.r}); setZ(z, 'heal'); }
    }
    else if((u.ap>0 && G.mode==='watch') || u.overwatch) setZ(rangeZone(u,u,u.rmin,rangeOf(u,u),true), 'watch');
  }
  if(G.inspect && G.inspect.alive && G.inspect.side==='foe') hl.threat = threatTiles(G.inspect);
  G.hl = hl;
}
function refresh(){
  computeHL();
  const O = G.def.obj || {};
  $('turnLbl').textContent = O.turns ? `Turno ${Math.min(G.turn,O.turns)}/${O.turns}` : 'Turno ' + G.turn;
  $('missionSub').textContent = objectiveText(true);
  const ph = $('phaseLbl'); ph.textContent = G.phase==='player' ? 'Il tuo turno' : 'Turno nemico'; ph.classList.toggle('foe', G.phase!=='player');
  const u = G.sel || G.inspect;
  if(u){
    $('uName').textContent = u.name; $('uTitle').textContent = u.level ? `${u.title}, liv. ${u.level}` : u.title;
    $('apPips').innerHTML = u.side==='hero' && G.phase==='player' ? `<i class="${u.ap>0?'on':''}"></i><i class="${u.ap>1?'on':''}"></i>` : '';
    $('apPips').title = `${u.ap} azioni rimaste`;
    $('hpBox').hidden = false; $('hpBox').classList.toggle('foe', u.side==='foe');
    if(u.npc) $('apPips').innerHTML = '';
    $('hpFill').style.width = (100*u.hp/u.maxHp)+'%'; $('hpText').textContent = `${u.hp} / ${u.maxHp} vita`;
    const R = rangeOf(u,u);
    const rangeTxt = u.rmin===u.rmax && R===u.rmax ? R : `${u.rmin}–${R}`;
    $('uStats').innerHTML = `<span>Mira <b>${u.aim}%</b></span><span>Danni <b>${u.dmg[0]}–${u.dmg[1]}</b></span><span>Movimento <b>${u.move}</b></span><span>Gittata <b>${rangeTxt}</b></span>`
      + (u.def ? `<span>Difesa <b>${u.def}</b></span>` : '') + (u.armor ? `<span>Armatura <b>${u.armor}</b></span>` : '');
  } else {
    $('uName').textContent = G.terrainInfo ? TER[tt(G.terrainInfo.c,G.terrainInfo.r)].name : 'Nessuna selezione';
    $('uTitle').textContent = ''; $('apPips').innerHTML = ''; $('hpBox').hidden = true; $('uStats').innerHTML = '';
  }
  drawPortrait(u);

  const showActs = !!G.sel && G.phase==='player';
  $('actions').hidden = !showActs; $('minors').hidden = !showActs;
  if(showActs){
    const s = G.sel, ab = CLASSES[s.cls].ability, none = s.ap===0 || G.busy;
    $('bMove').disabled = !canMove(s) || G.busy;
    $('bMove').setAttribute('aria-pressed', G.mode==='move' && canMove(s));
    $('bMoveSub').textContent = s.stuck ? 'Inchiodato' : s.ap===2 ? 'Blu 1, oro 2 azioni' : s.ap===1 ? '1 azione' : 'Nessuna azione';
    $('bAttack').disabled = none;
    $('bAttack').setAttribute('aria-pressed', G.mode==='attack' && s.ap>0);
    $('bAttackSub').textContent = s.pierce ? 'Dardo arcano' : (s.rmax>1 ? 'Arco' : 'Corpo a corpo');
    $('bAbilityName').textContent = ab.name;
    $('bAbilitySub').textContent = s.cd>0 ? `Tra ${s.cd} ${s.cd===1?'turno':'turni'}` : 'Pronta';
    $('bAbility').disabled = none || s.cd>0;
    $('bAbility').setAttribute('aria-pressed', G.mode==='ability' && s.ap>0);
    $('bWatch').disabled = none; $('bHunker').disabled = none;
    $('bWatch').setAttribute('aria-pressed', G.mode==='watch' && s.ap>0);
  }

  let hint = '';
  if(G.phase!=='player') hint = 'I nemici si muovono…';
  else if(G.pending) hint = G.pending.text;
  else if(G.sel && G.tileNote) hint = G.tileNote;
  else if(G.sel){
    const s = G.sel, ab = CLASSES[s.cls].ability;
    if(s.ap===0) hint = s.overwatch ? `${s.name} è di guardia: in giallo la zona che sorveglia.` : `${s.name} ha finito le azioni.`;
    else if(G.mode==='move'){
      hint = !canMove(s) ? `${s.name} è inchiodato e non può muoversi, ma può ancora agire.`
        : s.ap===2 ? 'Caselle blu: ti muovi e puoi ancora agire. Caselle dorate: scatto, usa tutte e due le azioni. Lo scudo indica le caselle con copertura.'
        + (G.hl.move.some(m=>m.watched) ? ' L\'occhio segna le caselle sorvegliate da un nemico di guardia.' : '')
        : 'Ti resta un\'azione: puoi muoverti nelle caselle blu oppure agire.';
    } else if(G.mode==='ability'){
      hint = ab.id==='light' ? `${ab.desc(s)} <em>Tocca un alleato nella zona verde.</em>`
           : ab.id==='quake' ? `${ab.desc(s)} <em>Tocca di nuovo Brokk o premi Conferma.</em>`
           : ab.id==='fire' ? `${ab.desc(s)} <em>Tocca una casella qualsiasi nella zona arancione, anche vuota.</em>`
           : `${ab.desc(s)} <em>${G.hl.targets.length ? 'La zona arancione è la sua portata.' : 'Nessun nemico nella zona arancione.'}</em>`;
    } else {
      hint = (s.rmax===1 ? 'La zona rossa sono le caselle che puoi colpire in corpo a corpo. ' : 'La zona rossa è la gittata dell\'attacco. ')
        + (G.hl.blocked.length ? 'Le caselle scure sono a portata ma senza linea di tiro. ' : '')
        + (G.hl.targets.length ? 'La percentuale sopra ogni nemico è la probabilità di colpirlo.' : 'Nessun nemico nella zona.');
      const n = CLASSES[s.cls].note; if(n) hint += ` <em>${n}</em>`;
    }
  } else if(G.inspect){
    const f = G.inspect;
    hint = f.npc ? `<b>${f.name}</b> va protetto: se cade, la missione fallisce.`
      : `${CLASSES[f.cls].note || ''}${f.overwatch?' <b>È di guardia.</b>':''} <em>In rosso le caselle che può colpire nel suo turno.</em>`;
  } else if(G.terrainInfo){
    hint = TER[tt(G.terrainInfo.c,G.terrainInfo.r)].note;
  } else hint = `<b>${objectiveText(false)}.</b> Tocca un eroe per dargli ordini, o un nemico per studiarlo.`;
  $('hint').innerHTML = hint;

  $('bConfirm').hidden = !G.pending;
  const allDone = alive('hero').every(heroDone);
  $('bEnd').disabled = G.phase!=='player' || G.busy || G.over;
  $('bEnd').classList.toggle('ready', allDone && G.phase==='player' && !G.over);
}
