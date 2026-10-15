'use strict';
/* Le Ceneri di Valdombra: campaign.js */
/* ================= STORIA, ACCAMPAMENTO E MAPPA ================= */
const esc = t => String(t).replace(/[&<>]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
let VIEW = 'battle';
function hideOverlays(){ for(const id of ['story','camp','intro']) $(id).hidden = true; }

/* --- illustrazioni delle scene --- */
const SKY = {
  giorno:['#7fa9cf','#d9e3d6','#fff3d0'], alba:['#2e3a6e','#f3a58a','#ffe0b8'], tramonto:['#2a2246','#ee8a4a','#ffcf8a'], notte:['#05081a','#1c2a50','#e8eefa']
};
const ART = {
  prato:{far:'#6f8c74', mid:'#557a48', near:'#3f5e33', items:'river'}, campi:{far:'#7d8a6a', mid:'#8c8a4a', near:'#6a6a33', items:'mill'},
  villaggio:{far:'#6e7a6c', mid:'#5e6a48', near:'#3e4630', items:'houses'}, colline:{far:'#7a7a6a', mid:'#6a6a4a', near:'#4a4632', items:'rocks'},
  bosco:{far:'#3f5e50', mid:'#2d4a38', near:'#1c3024', items:'pines'}, boscoMuto:{far:'#5e6260', mid:'#474a46', near:'#2e302c', items:'dead'},
  cimitero:{far:'#4e5662', mid:'#3a4048', near:'#24282c', items:'graves'}, palude:{far:'#45584e', mid:'#33463a', near:'#1f2c22', items:'marsh'},
  rovine:{far:'#6a6c5c', mid:'#545a44', near:'#363a2a', items:'ruins'}, torre:{far:'#4a5060', mid:'#363a48', near:'#22242c', items:'tower'},
  cripta:{far:'#3e3a4a', mid:'#2c2836', near:'#1a1622', items:'crypt'}, miniera:{far:'#5a5650', mid:'#423e38', near:'#2a2622', items:'gate'},
  forgia:{far:'#5a4038', mid:'#40281f', near:'#24140e', items:'forge'}, passo:{far:'#c8d4e0', mid:'#9aaabb', near:'#6e7e90', items:'peaks'},
  fiume:{far:'#5e7a6e', mid:'#486250', near:'#2e4230', items:'bridge'}, cenere:{far:'#6a625e', mid:'#4e4644', near:'#2e2826', items:'volcano'},
  cerchio:{far:'#4a4058', mid:'#352e40', near:'#1e1a26', items:'stones'}, titolo:{far:'#3a4660', mid:'#28324a', near:'#141a28', items:'castle'}
};
function paintScene(cvs, o){
  const W = cvs.width, H = cvs.height, c = cvs.getContext('2d');
  const sky = SKY[o.time||'giorno'], A = ART[o.biome] || ART.prato, R = mulberry32(hashStr((o.biome||'')+(o.time||'')+(o.seed||0)));
  const g = c.createLinearGradient(0,0,0,H); g.addColorStop(0,sky[0]); g.addColorStop(.75,sky[1]); g.addColorStop(1,sky[1]);
  c.fillStyle = g; c.fillRect(0,0,W,H);
  const night = o.time==='notte';
  if(night) for(let i=0;i<70;i++){ c.fillStyle = `rgba(255,255,255,${.3+R()*.6})`; c.fillRect(R()*W, R()*H*.6, R()<.9?1:2, R()<.9?1:2); }
  const sx = W*(.62+R()*.25), sy = H*(night ? .24 : o.time==='giorno' ? .2 : .52);
  const sg = c.createRadialGradient(sx,sy,0,sx,sy,H*.5); sg.addColorStop(0, night ? 'rgba(220,230,255,.35)' : 'rgba(255,240,200,.55)'); sg.addColorStop(1,'rgba(255,240,200,0)');
  c.fillStyle = sg; c.fillRect(0,0,W,H);
  c.fillStyle = sky[2]; c.beginPath(); c.arc(sx,sy,H*(night?.07:.09),0,7); c.fill();
  if(night){ c.fillStyle = sky[0]; c.beginPath(); c.arc(sx+H*.03,sy-H*.015,H*.065,0,7); c.fill(); }
  if(o.biome==='cerchio' || o.biome==='cenere' || o.biome==='titolo'){
    c.save(); c.translate(W*.5,H*.3); c.strokeStyle = o.biome==='titolo' ? 'rgba(200,180,255,.08)' : 'rgba(200,140,255,.12)'; c.lineWidth = 2;
    for(let i=0;i<7;i++){ c.beginPath(); c.ellipse(0,0,W*(.08+i*.06),H*(.03+i*.022),i*.2,0,5.6); c.stroke(); } c.restore();
  }
  const ridge = (base, amp, col, fr, peaky) => {
    const ph = R()*10; c.fillStyle = col; c.beginPath(); c.moveTo(0,H);
    for(let x=0;x<=W;x+=W/80){ const k = x/W; let y = base - amp*(Math.sin(k*fr+ph)*.5+.5) - amp*.4*Math.sin(k*fr*2.7+ph*1.7);
      if(peaky) y -= amp*.7*Math.pow(Math.abs(Math.sin(k*fr*1.3+ph)),6); c.lineTo(x,y); }
    c.lineTo(W,H); c.closePath(); c.fill(); };
  const fog = (y, a) => { const f = c.createLinearGradient(0,y-H*.1,0,y+H*.06); f.addColorStop(0,'rgba(0,0,0,0)'); f.addColorStop(.6, hexA(sky[1],a)); f.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle = f; c.fillRect(0,y-H*.1,W,H*.16); };
  const peaks = A.items==='peaks' || o.biome==='titolo';
  ridge(H*.62, H*.22, mix(A.far, sky[1], .45), 5, peaks);
  if(peaks){ c.save(); c.globalCompositeOperation='source-atop'; c.restore(); }
  fog(H*.62, .5);
  ridge(H*.74, H*.14, mix(A.mid, sky[1], .2), 8);
  fog(H*.74, .35);
  // elementi caratteristici
  const silh = mix(A.near, '#000000', .25);
  c.fillStyle = silh; c.strokeStyle = silh;
  const tree = (x,y,s) => { c.beginPath(); c.moveTo(x,y-s*2.2); c.lineTo(x+s*.7,y); c.lineTo(x-s*.7,y); c.closePath(); c.fill(); };
  const dead = (x,y,s) => { c.lineWidth = s*.18; c.lineCap='round'; c.beginPath(); c.moveTo(x,y); c.lineTo(x+s*.05,y-s*2); c.moveTo(x+s*.03,y-s*1.2); c.lineTo(x-s*.5,y-s*1.7); c.moveTo(x+s*.04,y-s*1.5); c.lineTo(x+s*.5,y-s*2.0); c.stroke(); };
  const it = A.items, base = H*.8;
  if(it==='pines' || it==='river' || it==='mill') for(let i=0;i<26;i++){ const x = R()*W; tree(x, base+R()*H*.05, H*(.03+R()*.03)); }
  if(it==='dead' || it==='marsh' || it==='graves') for(let i=0;i<10;i++) dead(R()*W, base+R()*H*.04, H*(.04+R()*.03));
  if(it==='mill'){ const x = W*.25, y = base; c.fillRect(x-W*.02,y-H*.2,W*.04,H*.2); c.save(); c.translate(x,y-H*.19); c.rotate(.3); for(let i=0;i<4;i++){ c.rotate(Math.PI/2); c.fillRect(-W*.006,0,W*.012,H*.16); } c.restore(); }
  if(it==='houses') for(let i=0;i<6;i++){ const x = W*(.1+i*.15)+R()*W*.04, w = W*.07, h = H*(.08+R()*.04); c.fillRect(x,base-h,w,h); c.beginPath(); c.moveTo(x-w*.1,base-h); c.lineTo(x+w/2,base-h-h*.6); c.lineTo(x+w*1.1,base-h); c.closePath(); c.fill(); if(night || o.time==='tramonto'){ c.fillStyle='#ffb85a'; c.fillRect(x+w*.35,base-h*.6,w*.2,h*.25); c.fillStyle = silh; } }
  if(it==='graves') for(let i=0;i<12;i++){ const x = R()*W, y = base+H*.04+R()*H*.06, s = H*(.025+R()*.02); if(R()<.5){ c.fillRect(x-s*.12,y-s*1.4,s*.24,s*1.4); c.fillRect(x-s*.5,y-s*1.05,s,s*.22); } else { c.beginPath(); c.arc(x,y-s*.8,s*.4,Math.PI,0); c.lineTo(x+s*.4,y); c.lineTo(x-s*.4,y); c.closePath(); c.fill(); } }
  if(it==='ruins' || it==='crypt'){ for(let i=0;i<7;i++){ const x = W*(.08+i*.14), h = H*(.08+R()*.18); c.fillRect(x,base-h,W*.03,h); if(R()<.4) c.fillRect(x-W*.01,base-h-H*.015,W*.05,H*.015); } c.fillRect(W*.4,base-H*.22,W*.2,H*.025); }
  if(it==='tower' || it==='castle'){ const x = W*(it==='castle'?.28:.7), w = W*.07, h = H*.46;
    c.beginPath(); c.moveTo(x-w*1.8,base); c.lineTo(x-w*.8,base-H*.08); c.lineTo(x+w*1.4,base-H*.06); c.lineTo(x+w*2.2,base); c.closePath(); c.fill();
    c.fillRect(x-w/2,base-h,w,h); c.beginPath(); c.moveTo(x-w*.75,base-h); c.lineTo(x,base-h-H*.12); c.lineTo(x+w*.75,base-h); c.closePath(); c.fill();
    if(it==='castle') for(const dx of [-.12,.12,.2]){ const xx = x+W*dx, hh = h*(.5+R()*.2); c.fillRect(xx-w*.35,base-hh,w*.7,hh); for(let k=0;k<3;k++) c.fillRect(xx-w*.35+k*w*.27,base-hh-H*.02,w*.16,H*.02); }
    c.fillStyle = '#ffd27a'; c.fillRect(x-w*.12,base-h*.78,w*.24,h*.08); const lg2 = c.createRadialGradient(x,base-h*.74,0,x,base-h*.74,H*.1); lg2.addColorStop(0,'rgba(255,210,120,.5)'); lg2.addColorStop(1,'rgba(255,210,120,0)'); c.fillStyle = lg2; c.fillRect(x-H*.1,base-h*.74-H*.1,H*.2,H*.2); c.fillStyle = silh; }
  if(it==='gate' || it==='forge'){ c.beginPath(); c.moveTo(0,base); c.lineTo(W*.3,base-H*.4); c.lineTo(W*.55,base-H*.46); c.lineTo(W*.85,base-H*.32); c.lineTo(W,base-H*.2); c.lineTo(W,base); c.closePath(); c.fill();
    const gx = W*.5, gw = W*.12, gh = H*.2; const gg = c.createRadialGradient(gx,base-gh*.4,0,gx,base-gh*.4,gh); gg.addColorStop(0, it==='forge'?'rgba(255,120,40,.9)':'rgba(255,200,120,.5)'); gg.addColorStop(1,'rgba(255,120,40,0)');
    c.fillStyle = it==='forge' ? '#ff7a2a' : '#1a1410'; c.beginPath(); c.moveTo(gx-gw/2,base); c.lineTo(gx-gw/2,base-gh*.6); c.quadraticCurveTo(gx,base-gh*1.1,gx+gw/2,base-gh*.6); c.lineTo(gx+gw/2,base); c.closePath(); c.fill(); c.fillStyle = gg; c.fillRect(gx-gh,base-gh*1.4,gh*2,gh*1.5); c.fillStyle = silh; }
  if(it==='peaks'){ for(let i=0;i<5;i++){ const x = R()*W, s = H*(.05+R()*.04); c.fillStyle = mix(A.near,'#000',.1); tree(x, base+H*.03, s); c.fillStyle = '#eef3f8'; c.beginPath(); c.moveTo(x,base+H*.03-s*2.2); c.lineTo(x+s*.3,base+H*.03-s*1.3); c.lineTo(x-s*.3,base+H*.03-s*1.3); c.closePath(); c.fill(); } c.fillStyle = silh; }
  if(it==='bridge'){ c.fillRect(0,base-H*.12,W*.38,H*.03); c.fillRect(W*.62,base-H*.12,W*.38,H*.03); for(const x of [.12,.3,.7,.88]){ c.fillRect(W*x-W*.015,base-H*.12,W*.03,H*.14); } }
  if(it==='volcano'){ c.beginPath(); c.moveTo(W*.45,base-H*.05); c.lineTo(W*.68,base-H*.42); c.lineTo(W*.76,base-H*.42); c.lineTo(W*.98,base-H*.05); c.closePath(); c.fill(); const vg = c.createRadialGradient(W*.72,base-H*.44,0,W*.72,base-H*.44,H*.3); vg.addColorStop(0,'rgba(255,110,40,.75)'); vg.addColorStop(1,'rgba(255,90,30,0)'); c.fillStyle = vg; c.fillRect(W*.4,base-H*.8,W*.6,H*.6); c.fillStyle = silh; }
  if(it==='stones' || it==='castle' && false){ const cx = W*.5, cy = base-H*.12; c.beginPath(); c.ellipse(cx,base,W*.36,H*.14,0,Math.PI,0); c.fill(); for(let i=0;i<9;i++){ const a = Math.PI*(i/8), x = cx+Math.cos(a)*W*.26, h = H*(.08+R()*.06); c.fillRect(x-W*.012,cy-h-Math.sin(a)*H*.05,W*.024,h); } const gg = c.createRadialGradient(cx,cy-H*.1,0,cx,cy-H*.1,H*.25); gg.addColorStop(0,'rgba(200,140,255,.55)'); gg.addColorStop(1,'rgba(200,140,255,0)'); c.fillStyle = gg; c.fillRect(cx-H*.3,cy-H*.4,H*.6,H*.5); c.fillStyle = silh; }
  if(it==='rocks') for(let i=0;i<8;i++){ const x = R()*W, s = H*(.04+R()*.05); c.beginPath(); c.moveTo(x-s,base+H*.03); c.lineTo(x-s*.4,base+H*.03-s); c.lineTo(x+s*.5,base+H*.03-s*.8); c.lineTo(x+s,base+H*.03); c.closePath(); c.fill(); }
  // primo piano
  ridge(H*.9, H*.07, silh, 11);
  if(it==='marsh' || it==='river' || it==='bridge'){ const wy = H*.86; const wg = c.createLinearGradient(0,wy,0,H); wg.addColorStop(0,hexA(sky[1],.55)); wg.addColorStop(1,hexA(sky[0],.6)); c.fillStyle = wg; c.fillRect(0,wy,W,H-wy);
    c.strokeStyle = hexA(sky[2],.35); c.lineWidth = 1; for(let i=0;i<14;i++){ const y = wy+R()*(H-wy), x = R()*W; c.beginPath(); c.moveTo(x,y); c.lineTo(x+W*(.03+R()*.06),y); c.stroke(); } }
  // meteo
  if(o.weather==='pioggia'){ c.strokeStyle = 'rgba(200,215,240,.35)'; c.lineWidth = 1; for(let i=0;i<160;i++){ const x = R()*W, y = R()*H; c.beginPath(); c.moveTo(x,y); c.lineTo(x-3,y+12); c.stroke(); } }
  if(o.weather==='neve' || it==='peaks'){ c.fillStyle = 'rgba(255,255,255,.8)'; for(let i=0;i<120;i++){ c.beginPath(); c.arc(R()*W,R()*H,R()*1.6+.4,0,7); c.fill(); } }
  if(o.weather==='cenere'){ for(let i=0;i<110;i++){ c.fillStyle = R()<.12 ? 'rgba(255,130,60,.8)' : 'rgba(170,160,150,.55)'; c.fillRect(R()*W,R()*H,2,1.5); } }
  const vg = c.createRadialGradient(W/2,H*.55,H*.3,W/2,H*.55,W*.75); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.45)'); c.fillStyle = vg; c.fillRect(0,0,W,H);
}
function mix(a,b,k){ const p = h => { const n = parseInt(h.slice(1),16); return [n>>16, n>>8&255, n&255]; }; const A = p(a), B = p(b); return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')})`; }
function hexA(h,a){ const n = parseInt(h.slice(1),16); return `rgba(${n>>16},${n>>8&255},${n&255},${a})`; }
function talkHtml(lines){
  if(!lines || !lines.length) return '';
  return '<div class="talk">' + lines.map(([who,txt]) => `<div class="line"><canvas class="pf" width="96" height="96" data-cls="${SPEAKER_CLS[who]||''}"></canvas><div><b>${esc(who)}</b><p>${esc(txt)}</p></div></div>`).join('') + '</div>';
}
function showStory({kicker, title, paras=[], talk=null, after=null, art=null, extra='', buttons=[]}){
  hideOverlays();
  $('storyKicker').textContent = kicker; $('storyTitle').textContent = title;
  $('storyBody').innerHTML = paras.map(t=>`<p>${esc(t)}</p>`).join('') + talkHtml(talk) + talkHtml(after) + extra;
  const cv2 = $('storyArt');
  const sizeArt = () => { const cw = cv2.clientWidth, ch = cv2.clientHeight; if(!cw || !ch) return false; const k = Math.min(2, devicePixelRatio||1); cv2.width = Math.min(1600, Math.round(cw*k)); cv2.height = Math.round(cv2.width*ch/cw); paintScene(cv2, art); return true; };
  if(art) cv2.hidden = false; else cv2.hidden = true;
  $('storyBody').querySelectorAll('canvas.pf').forEach(pc => { if(pc.dataset.cls) drawPortraitTo(pc.getContext('2d'), pc.dataset.cls, 96); else pc.remove(); });
  const bx = $('storyBtns'); bx.innerHTML = '';
  buttons.forEach((b,i) => { const el = document.createElement('button'); el.className = 'big' + (i ? ' alt' : ''); el.textContent = b.label; el.onclick = b.fn; bx.appendChild(el); });
  $('story').hidden = false; $('story').querySelector('.scroll').scrollTop = 0; sfx('page');
  if(art && !sizeArt()) requestAnimationFrame(sizeArt);
  const f = bx.querySelector('button'); if(f) f.focus({preventScroll:true});
}
const itemLine = it => `<li><b>${esc(ITEMS[it].name)}</b> <span class="muted">${RARITY[ITEMS[it].r]}</span>: ${modsText(ITEMS[it].mods)}${ITEMS[it].cls?`, solo per ${CLASSES[ITEMS[it].cls].name}`:''}.</li>`;
const artOf = S => ({biome: S.biome || (S.hand && HANDMADE[S.hand].biome), time: S.time||'giorno', weather: S.weather});
const OBJ_BRIEF = {kill:'Sconfiggi tutti i nemici.', survive:'Resisti fino alla fine dei turni indicati.', escape:'Porta tutti gli eroi alle caselle verdi a nord.', protect:'Proteggi l\'alleato indicato dalla stella dorata.'};

/* --- missioni --- */
let lastMission = null;
function showBriefing(i){
  const S = STORY[i], a = actOf(i), A = ACTS[a];
  if(i === A.from && !C.seen['act'+a]){
    C.seen['act'+a] = true; saveCampaign();
    showStory({kicker:A.n, title:A.title, art:{...artOf(S), seed:a}, paras:[], buttons:[{label:'Continua', fn:()=>showBriefing(i)}]});
    return;
  }
  const O = S.obj || {type:'kill'};
  const objTxt = O.type==='survive' ? `Resisti per ${O.turns} turni.` : O.type==='protect' ? `Proteggi ${O.npcName}${O.turns?` per ${O.turns} turni`:''}: se cade, la missione fallisce.` : O.type==='escape' ? 'Porta tutti gli eroi alle caselle verdi a nord.' : S.foes && S.foes.some(f=>CLASSES[f].leader) || (S.hand==='cerchio') ? 'Abbatti il capo nemico.' : 'Sconfiggi tutti i nemici.';
  const waves = O.waves ? ' Arriveranno rinforzi nemici.' : '';
  showStory({kicker:`${A.n}, capitolo ${i+1} di ${STORY.length}`, title:S.title, art:artOf(S), paras:S.brief, talk:S.talk,
    extra: `<p class="objline"><b>Obiettivo:</b> ${objTxt}${waves} <span class="muted">Livello consigliato ${S.level}.</span></p>` + (S.chestItem ? '<p class="muted">Si dice che da queste parti ci sia un forziere: porta un eroe sulla sua casella per prenderlo.</p>' : ''),
    buttons:[{label:'Alla battaglia', fn:()=>startMission(buildMission('story', i))}, {label:'Torna alla mappa', fn:showWorld}]});
}
function showSideBrief(id){
  const N = NODES[id], def = buildMission('side', id);
  showStory({kicker: N.repeat ? `Scontro ripetibile, livello ${def.level}` : `Luogo da esplorare, livello ${def.level}`, title:N.name, paras:[N.desc], art:{biome:N.biome, time:def.time, weather:def.weather, seed:id},
    extra: N.unique ? `<p class="muted">Ricompensa: un oggetto unico.</p>` : '<p class="muted">Esperienza garantita e, con un po\' di fortuna, un forziere.</p>',
    buttons:[{label:'Alla battaglia', fn:()=>startMission(def)}, {label:'Torna alla mappa', fn:showWorld}]});
}
function startMission(def){
  lastMission = def; hideOverlays(); setView('battle'); newGame(def);
  AUDIO.music(def.foes.some(f=>CLASSES[f[0]].leader) ? 'boss' : 'battle');
  if(!C.seenRules){ C.seenRules = true; saveCampaign(); $('intro').hidden = false; $('startBtn').textContent = 'Inizia la battaglia'; }
  else { G.started = true; banner(objectiveText(false)); }
}
function grantXp(n){
  const before = partyLevel(); C.xp += n; const after = partyLevel();
  return after > before ? after : 0;
}
function missionWon(){
  const def = G.def, items = [...G.found];
  let paras, title = def.title, kicker, after = null, joined = null;
  const missionXp = def.kind==='story' ? 60 + 22*def.level : 40 + 16*def.level;
  if(def.kind==='story'){
    const S = STORY[def.ref];
    items.push(...S.reward);
    const first = C.chapter <= def.ref;
    C.chapter = Math.max(C.chapter, def.ref + 1);
    if(STORY[C.chapter]) wSel = STORY[C.chapter].node;
    kicker = `Capitolo ${def.ref+1}: vittoria`;
    paras = S.final ? [] : S.debrief; after = S.final ? null : S.after;
    if(S.join && first) joined = S.join;
  } else {
    const N = NODES[def.ref];
    C.runs[def.ref] = (C.runs[def.ref]||0) + 1;
    if(N.unique && !C.cleared[def.ref]){ items.push(N.unique); }
    if(!N.repeat) C.cleared[def.ref] = true;
    kicker = 'Scontro vinto'; paras = [N.repeat ? 'La zona è sgombra, per ora. Altri torneranno.' : 'Il luogo è stato ripulito.'];
  }
  C.inventory.push(...items);
  const xp = missionXp + Math.round(G.xp);
  const newLevel = grantXp(xp);
  AUDIO.music(null); sfx('victory'); if(newLevel) sfx('levelup', 1.9);
  saveCampaign();
  const fallen = G.units.filter(u=>u.side==='hero' && !u.npc && !u.alive).map(u=>u.name);
  const stats = `Battaglia vinta in ${G.turn} ${G.turn===1?'turno':'turni'}.` + (fallen.length ? ` ${fallen.join(' e ')} ${fallen.length>1?'erano a terra, ma si sono ripresi':'era a terra, ma si è ripreso'}.` : '');
  let extra = '';
  if(joined) extra += `<p class="joined"><b>${CLASSES[joined].name}</b> si unisce al gruppo!</p>`;
  extra += `<h4>Esperienza</h4><p>+${xp} punti esperienza. ${newLevel ? `<b>Il gruppo sale al livello ${newLevel}!</b>` : partyLevel()>=MAX_LEVEL ? 'Livello massimo.' : `Livello ${partyLevel()}: mancano ${xpForLevel(partyLevel()+1)-C.xp} punti al prossimo.`}</p>`;
  if(activeHeroes().some(id=>pendingPromos(id)>0)) extra += '<p>Ci sono nuove abilità da scegliere all\'accampamento.</p>';
  if(items.length) extra += `<h4>Bottino</h4><ul>${items.map(itemLine).join('')}</ul>`;
  const art = def.kind==='story' ? artOf(STORY[def.ref]) : {biome:def.biome, time:'alba'};
  if(def.kind==='story' && STORY[def.ref].final){
    showStory({kicker:'Epilogo', title:'Le Ceneri di Valdombra', art:{biome:'titolo', time:'alba'}, paras:[stats, ...EPILOGUE], extra,
      buttons:[{label:'Continua a esplorare', fn:showWorld}, {label:'Nuova campagna', fn:newCampaign}]});
    return;
  }
  showStory({kicker, title, art:{...art, time: art.time==='notte' ? 'alba' : art.time}, paras:[stats, ...paras], after, extra, buttons:[{label:'Torna alla mappa', fn:showWorld}]});
}
function missionLost(why){
  AUDIO.music(null); sfx('defeat');
  showStory({kicker:'Ritirata', title:G.def.title, art:{biome:G.def.biome, time:'notte'},
    paras:[why ? `${why} è caduto, e senza di lui non ha più senso restare. Vi ritirate.` : 'I tuoi eroi si ritirano, feriti ma vivi. Il nemico tiene ancora il campo.',
           'Se lo scontro è troppo duro, gli scontri secondari sulla mappa aiutano a salire di livello e a trovare equipaggiamento migliore.'],
    buttons:[{label:'Riprova', fn:()=>startMission(buildMission(lastMission.kind, lastMission.ref))}, {label:'Torna alla mappa', fn:showWorld}]});
}
function showJournal(){
  let html = '';
  ACTS.forEach((A,k) => {
    const chs = STORY.map((s,i)=>i).filter(i => actOf(i)===k && i < C.chapter);
    if(!chs.length) return;
    html += `<h4>${A.n}: ${esc(A.title)}</h4>` + chs.map(i => `<details><summary>${i+1}. ${esc(STORY[i].title)}</summary>${(STORY[i].final?EPILOGUE:STORY[i].debrief).map(t=>`<p>${esc(t)}</p>`).join('')}</details>`).join('');
  });
  showStory({kicker:'Diario', title:'Il racconto finora', art:null, paras: C.chapter ? [] : ['Il diario è ancora vuoto: la storia comincia al Guado delle Ceneri.'], extra:html, buttons:[{label:'Torna alla mappa', fn:showWorld}]});
}

/* --- accampamento --- */
function gearOptions(id, slot){
  const cur = C.heroes[id].equip[slot];
  const counts = {}; for(const it of C.inventory) counts[it] = (counts[it]||0) + 1;
  for(const o of HERO_IDS) if(o!==id){ const e = C.heroes[o].equip[slot]; if(e) counts[e]--; }
  const own = Object.keys(counts).filter(it => counts[it]>0 && ITEMS[it].slot===slot && (!ITEMS[it].cls || ITEMS[it].cls===id));
  own.sort((a,b)=>'cru'.indexOf(ITEMS[b].r)-'cru'.indexOf(ITEMS[a].r));
  return `<option value="">${own.length ? 'Nessuno' : 'Nessun oggetto disponibile'}</option>` +
    own.map(it => `<option value="${it}"${it===cur?' selected':''}>${esc(ITEMS[it].name)} (${modsText(ITEMS[it].mods)})</option>`).join('');
}
function statsHtml(st, d){
  const rng = d.rmin===st.rmax ? st.rmax : `${d.rmin}–${st.rmax}`;
  return `<span>Vita <b>${st.hp}</b></span><span>Mira <b>${st.aim}%</b></span><span>Danni <b>${st.dmg[0]}–${st.dmg[1]}</b></span><span>Critico <b>${st.crit}%</b></span><span>Movimento <b>${st.move}</b></span><span>Gittata <b>${rng}</b></span>`
    + (st.def ? `<span>Difesa <b>${st.def}</b></span>` : '') + (st.armor ? `<span>Armatura <b>${st.armor}</b></span>` : '');
}
function showCamp(){
  hideOverlays();
  const box = $('campHeroes'); box.innerHTML = '';
  const L = partyLevel();
  for(const id of activeHeroes()){
    const h = C.heroes[id], d = CLASSES[id], st = heroStats(id);
    const promo = pendingPromos(id) > 0 ? TREE[id][h.skills.length] : null;
    const nextRank = RANK_LEVELS[h.skills.length];
    const sec = document.createElement('section'); sec.className = 'hcard';
    sec.innerHTML = `<div class="hhead"><canvas width="112" height="112"></canvas><div><h3>${d.name} <small>${d.title}, livello ${L}</small></h3>
        <p class="stats">${statsHtml(st,d)}</p></div></div>
      ${promo ? `<div class="promo"><p><b>Promozione.</b> Scegli una nuova abilità: la scelta è definitiva.</p><div class="opts">${promo.map(k=>`<button data-skill="${k}"><b>${SKILLS[k].name}</b><small>${SKILLS[k].desc}</small></button>`).join('')}</div></div>` : ''}
      <div class="sk"><span><b>${d.ability.name}</b>: ${d.ability.desc({ab:st.ab, abRange:st.abRange, skills:new Set(h.skills)})}</span>${h.skills.map(k=>`<span><b>${SKILLS[k].name}</b>: ${SKILLS[k].desc}</span>`).join('')}
        ${!promo && nextRank ? `<span class="muted">Prossima abilità al livello ${nextRank}.</span>` : ''}</div>
      <div class="gear">${SLOTS.map(([slot,lab])=>`<label><span>${lab}</span><select data-slot="${slot}">${gearOptions(id,slot)}</select></label>`).join('')}</div>`;
    drawPortraitTo(sec.querySelector('canvas').getContext('2d'), id, 112);
    sec.querySelectorAll('[data-skill]').forEach(b => b.onclick = () => { h.skills.push(b.dataset.skill); saveCampaign(); showCamp(); });
    sec.querySelectorAll('select').forEach(sl => sl.onchange = () => { h.equip[sl.dataset.slot] = sl.value || null; saveCampaign(); showCamp(); });
    box.appendChild(sec);
  }
  const n = C.inventory.length;
  $('campLead').textContent = `Livello ${L}, ${C.xp} punti esperienza${L<MAX_LEVEL?` (${xpForLevel(L+1)} per il livello successivo)`:''}. Nella sacca ci sono ${n} ${n===1?'oggetto':'oggetti'}.`;
  const waiting = activeHeroes().some(id => pendingPromos(id) > 0);
  $('campGo').disabled = waiting;
  $('campGo').textContent = waiting ? 'Scegli prima le promozioni' : 'Torna alla mappa';
  $('campGo').onclick = showWorld;
  $('camp').hidden = false; $('camp').querySelector('.scroll').scrollTop = 0;
}

/* --- mappa del mondo --- */
const WW = 1000, WH = 2800;
const wcv = $('wcv'), wctx = wcv.getContext('2d');
const wbg = document.createElement('canvas'), wfog = document.createElement('canvas');
let WS = 1, WDPR = 1, wcw = 0, wch = 0, camX = 0, camY = 0, wSel = null, party = null, wTravel = false;
function setView(v){
  VIEW = v;
  if(v==='world') AUDIO.music('map');
  $('world').hidden = v!=='world';
  if(v==='world') requestAnimationFrame(()=>{ fitWorld(); });
}
function showWorld(){
  hideOverlays(); setView('world');
  if(!wSel || !nodeRevealed(wSel)) wSel = currentStoryNode() || C.at;
  party = null;
  updateWorldUI(); fitWorld(); centerOn(NODES[C.at]); renderFog();
}
function currentStoryNode(){ const S = STORY[C.chapter]; return S ? S.node : null; }
function fitWorld(){
  const box = $('wmap'); const w = box.clientWidth, h = box.clientHeight; if(!w || !h) return;
  const fx = wcw ? (camX + wcw/2)/WS : null, fy = wcw ? (camY + wch/2)/WS : null;
  const ws = Math.min(1.1, w/WW*1.5);
  const dpr = Math.min(window.devicePixelRatio||1, 2, Math.sqrt(5e6/(WW*ws*WH*ws)));
  const scaleChanged = ws !== WS || Math.abs(dpr-WDPR)>.01 || !wbg.width;
  WDPR = dpr; WS = ws;
  if(w !== wcw || h !== wch || scaleChanged){ wcv.style.width = w+'px'; wcv.style.height = h+'px'; wcv.width = Math.round(w*WDPR); wcv.height = Math.round(h*WDPR); }
  wcw = w; wch = h;
  if(fx!==null){ camX = fx*WS - w/2; camY = fy*WS - h/2; }
  if(scaleChanged){
    wbg.width = Math.ceil(WW*WS*WDPR); wbg.height = Math.ceil(WH*WS*WDPR); wfog.width = wbg.width; wfog.height = wbg.height;
    drawWorldBg(); renderFog();
  }
  clampCam();
}
function clampCam(){
  camX = Math.max(0, Math.min(camX, WW*WS - wcw)); camY = Math.max(0, Math.min(camY, WH*WS - wch));
  if(WW*WS < wcw) camX = (WW*WS - wcw)/2;
}
function centerOn(p){ camX = p.x*WS - wcw/2; camY = p.y*WS - wch/2; clampCam(); }

function drawWorldBg(){
  const c = wbg.getContext('2d'); c.setTransform(WS*WDPR,0,0,WS*WDPR,0,0);
  const R = mulberry32(12345);
  const g = c.createLinearGradient(0,0,0,WH);
  g.addColorStop(0,'#6a625c'); g.addColorStop(.17,'#7a7068'); g.addColorStop(.205,'#c9d3db'); g.addColorStop(.38,'#d7dfe6'); g.addColorStop(.41,'#7d8460');
  g.addColorStop(.58,'#6c7a52'); g.addColorStop(.62,'#4f6a4c'); g.addColorStop(.76,'#56704a'); g.addColorStop(.8,'#6a8a50'); g.addColorStop(1,'#7a9658');
  c.fillStyle = g; c.fillRect(0,0,WW,WH);
  for(let i=0;i<5200;i++){ const y = R()*WH; c.fillStyle = `rgba(${R()<.5?'255,250,220':'20,25,15'},${.03+R()*.04})`; c.fillRect(R()*WW, y, 2+R()*4, 2+R()*4); }
  // campi (atto I)
  for(let i=0;i<40;i++){ const x = R()*WW, y = 2250+R()*520; if(Math.hypot(x-500,y-2450)<90) continue; c.save(); c.translate(x,y); c.rotate((R()-.5)*.6);
    c.fillStyle = ['rgba(200,180,90,.35)','rgba(140,170,80,.3)','rgba(170,140,80,.28)'][Math.floor(R()*3)]; c.fillRect(-30,-16,40+R()*30,24+R()*14);
    c.strokeStyle='rgba(80,70,40,.25)'; c.lineWidth=1; for(let k=-14;k<20;k+=5){ c.beginPath(); c.moveTo(-30,k); c.lineTo(30,k); c.stroke(); } c.restore(); }
  // paludi (atto II)
  for(let i=0;i<46;i++){ const x = 30+R()*360, y = 1900+R()*240; c.fillStyle = 'rgba(52,96,104,.55)'; c.beginPath(); c.ellipse(x,y,14+R()*26,8+R()*14,R()*3,0,7); c.fill(); }
  for(let i=0;i<90;i++){ const x = 30+R()*360, y = 1880+R()*280; c.strokeStyle='rgba(150,170,90,.6)'; c.lineWidth=2; c.beginPath(); c.moveTo(x,y); c.lineTo(x+2,y-10); c.stroke(); }
  // lago nero
  c.fillStyle = '#1f2f36'; c.beginPath(); c.ellipse(430,1500,95,45,-.1,0,7); c.fill(); c.strokeStyle='rgba(180,210,210,.25)'; c.lineWidth=3; c.stroke();
  // ghiacciaio
  c.fillStyle = 'rgba(190,220,240,.85)'; c.beginPath(); c.moveTo(300,820); c.quadraticCurveTo(420,760,540,840); c.quadraticCurveTo(520,960,420,980); c.quadraticCurveTo(320,960,300,820); c.fill();
  c.strokeStyle = 'rgba(120,160,190,.5)'; c.lineWidth = 2; for(let i=0;i<8;i++){ const x = 330+R()*180, y = 840+R()*110; c.beginPath(); c.moveTo(x,y); c.lineTo(x+20+R()*20,y+5); c.stroke(); }
  // fiumi
  const river = (pts, w, col='#3c7c86') => { c.lineCap='round'; c.lineJoin='round';
    for(const [lw,cl] of [[w+8,'rgba(40,60,45,.45)'],[w,col],[w*.45,'rgba(170,220,215,.35)']]){ c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length-1;i++){ const mx=(pts[i][0]+pts[i+1][0])/2, my=(pts[i][1]+pts[i+1][1])/2; c.quadraticCurveTo(pts[i][0],pts[i][1],mx,my); } c.lineTo(...pts[pts.length-1]); c.lineWidth=lw; c.strokeStyle=cl; c.stroke(); } };
  river([[0,2640],[200,2620],[420,2598],[600,2570],[800,2600],[1000,2570]], 22);
  river([[0,2330],[180,2320],[360,2310],[470,2300],[620,2330],[800,2310],[1000,2330]], 16);
  river([[620,2330],[640,2200],[600,2060],[650,1950],[700,1800],[760,1700]], 9);
  river([[0,1560],[150,1570],[300,1520],[430,1500]], 10);
  river([[0,660],[200,640],[400,660],[650,650],[850,620],[1000,640]], 16, '#5a8a9a');
  // montagne: colline di ferro (est) e nord
  const mountain = (x,y,s,snow,col='#7d786c') => { c.fillStyle='rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x,y+4,s*.9,s*.2,0,0,7); c.fill();
    c.beginPath(); c.moveTo(x-s,y); c.lineTo(x,y-s*1.2); c.lineTo(x+s,y); c.closePath(); c.fillStyle=col; c.fill();
    c.beginPath(); c.moveTo(x,y-s*1.2); c.lineTo(x+s,y); c.lineTo(x+s*.15,y); c.closePath(); c.fillStyle='rgba(0,0,0,.25)'; c.fill();
    if(snow){ c.beginPath(); c.moveTo(x-s*.32,y-s*.8); c.lineTo(x,y-s*1.2); c.lineTo(x+s*.32,y-s*.8); c.lineTo(x+s*.1,y-s*.7); c.lineTo(x-s*.05,y-s*.85); c.closePath(); c.fillStyle='#eef0ea'; c.fill(); } };
  const avoid = (x,y,r=70) => Object.values(NODES).some(N => Math.hypot(N.x-x,N.y-y) < r);
  const mts = [];
  for(let i=0;i<70;i++){ const x = 640+R()*360, y = 1150+R()*480; if(avoid(x,y)) continue; mts.push([x,y,18+R()*24,false]); }
  for(let i=0;i<40;i++){ const x = 620+R()*380, y = 2120+R()*200; if(avoid(x,y,60)) continue; mts.push([x,y,12+R()*14,false]); }
  for(let i=0;i<120;i++){ const x = R()*WW, y = 580+R()*520; if(avoid(x,y)) continue; mts.push([x,y,20+R()*28,true,'#8a96a2']); }
  for(let i=0;i<40;i++){ const x = R()*WW, y = 20+R()*140; if(avoid(x,y,90)) continue; mts.push([x,y,24+R()*30,false,'#4a4240']); }
  mts.sort((a,b)=>a[1]-b[1]).forEach(m=>mountain(...m));
  // piana di cenere
  for(let i=0;i<60;i++){ const x = R()*WW, y = 160+R()*400; c.strokeStyle = `rgba(255,${90+R()*60},40,${.25+R()*.3})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x,y); for(let k=0;k<4;k++) c.lineTo(x+(R()-.5)*40, y+(R()-.5)*20); c.stroke(); }
  const vg = c.createRadialGradient(760,100,10,760,100,220); vg.addColorStop(0,'rgba(255,90,30,.45)'); vg.addColorStop(1,'rgba(255,90,30,0)'); c.fillStyle = vg; c.fillRect(500,0,500,350);
  // boschi
  const tree = (x,y,s,kind) => { c.fillStyle='rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x+2,y+2,s*.6,s*.25,0,0,7); c.fill();
    if(kind==='dead'){ c.strokeStyle='#5d5a52'; c.lineWidth=2; c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-s*1.4); c.moveTo(x,y-s*.8); c.lineTo(x-s*.4,y-s*1.1); c.moveTo(x,y-s); c.lineTo(x+s*.4,y-s*1.3); c.stroke(); return; }
    c.beginPath(); c.moveTo(x,y-s*1.4); c.lineTo(x+s*.6,y); c.lineTo(x-s*.6,y); c.closePath(); c.fillStyle = kind==='snow' ? '#3d5c4a' : kind==='dark' ? '#22382a' : (R()<.5?'#2f5232':'#3a6339'); c.fill();
    if(kind==='snow'){ c.beginPath(); c.moveTo(x,y-s*1.4); c.lineTo(x+s*.3,y-s*.8); c.lineTo(x-s*.3,y-s*.8); c.closePath(); c.fillStyle='#f2f6f9'; c.fill(); } };
  const forest = (cx,cy,rx,ry,n,kind) => { const t=[]; for(let i=0;i<n;i++){ const a=R()*6.28, d=Math.sqrt(R()); const x = cx+Math.cos(a)*rx*d, y = cy+Math.sin(a)*ry*d; if(avoid(x,y,34)) continue; t.push([x,y,7+R()*6,kind]); } t.sort((a,b)=>a[1]-b[1]).forEach(q=>tree(...q)); };
  forest(560,2440,170,70,90); forest(880,2560,110,80,60); forest(150,2400,120,70,40); forest(260,1880,160,100,140,'dark'); forest(500,1990,90,50,40);
  forest(820,1960,80,60,30); forest(300,1380,120,60,40); forest(180,960,110,70,50,'snow'); forest(400,700,170,80,120,'dead'); forest(760,800,100,60,40,'snow');
  // ragnatele nel bosco delle tele
  c.strokeStyle = 'rgba(235,235,225,.35)'; c.lineWidth = 1; for(let i=0;i<10;i++){ const x = 160+R()*220, y = 1800+R()*160; for(let k=0;k<6;k++){ const a = k*Math.PI/3; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*14,y+Math.sin(a)*14); c.stroke(); } for(const r of [5,10]){ c.beginPath(); c.arc(x,y,r,0,7); c.stroke(); } }
  // cerchio di pietre
  for(let i=0;i<10;i++){ const a = i/10*Math.PI*2, x = 440+Math.cos(a)*55, y = 250+Math.sin(a)*24; c.fillStyle = '#2c2630'; c.fillRect(x-4,y-16,8,16); }
  // titoli delle regioni
  c.save(); c.textAlign = 'center'; c.font = 'italic 30px "IM Fell English", Georgia, serif';
  for(const [txt,x,y,col] of [['Il Fiume Ombra',260,2770,'rgba(30,25,10,.35)'],['Le Terre Basse',760,2120,'rgba(20,25,15,.3)'],['Le Colline di Ferro',300,1640,'rgba(20,20,10,.3)'],['Il Nord',800,1110,'rgba(30,40,60,.35)'],['La Piana di Cenere',250,540,'rgba(255,220,200,.25)']]){ c.fillStyle = col; c.fillText(txt,x,y); }
  c.restore();
  c.save(); c.translate(920,2730); c.strokeStyle='rgba(30,25,15,.45)'; c.lineWidth=2; c.beginPath(); c.arc(0,0,34,0,7); c.stroke();
  c.fillStyle='rgba(30,25,15,.5)'; c.beginPath(); c.moveTo(0,-44); c.lineTo(7,0); c.lineTo(0,44); c.lineTo(-7,0); c.closePath(); c.fill();
  c.font='18px "IM Fell English SC", Georgia, serif'; c.textAlign='center'; c.fillText('N',0,-50); c.restore();
}
function renderFog(){
  const c = wfog.getContext('2d'); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,wfog.width,wfog.height);
  c.setTransform(WS*WDPR,0,0,WS*WDPR,0,0);
  c.fillStyle = 'rgba(14,20,18,.88)'; c.fillRect(0,0,WW,WH);
  c.globalCompositeOperation = 'destination-out';
  for(const id in NODES){ if(!nodeRevealed(id)) continue; const N = NODES[id];
    const g = c.createRadialGradient(N.x,N.y,40,N.x,N.y,200); g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(N.x,N.y,200,0,7); c.fill(); }
  c.globalCompositeOperation = 'source-over';
}
function linkCurve(a,b){ const A = NODES[a], B = NODES[b]; const mx=(A.x+B.x)/2, my=(A.y+B.y)/2; const dx=B.x-A.x, dy=B.y-A.y; const off = ((hashStr(a+b)%7)-3)*6; return {A, B, cx: mx - dy/Math.hypot(dx,dy)*off, cy: my + dx/Math.hypot(dx,dy)*off}; }
function routeTo(target){
  const prev = {[C.at]:null}, q = [C.at];
  while(q.length){ const cur = q.shift(); if(cur===target) break;
    for(const [a,b] of LINKS){ const n = a===cur ? b : b===cur ? a : null; if(!n || n in prev || !nodeRevealed(n)) continue; prev[n] = cur; q.push(n); } }
  if(!(target in prev)) return null;
  const path = []; let cur = target; while(cur){ path.unshift(cur); cur = prev[cur]; }
  return path;
}
async function travelTo(target){
  const path = routeTo(target); if(!path || path.length<2 || wTravel) return;
  wTravel = true; updateWorldUI();
  for(let i=1;i<path.length;i++){
    const L = linkCurve(path[i-1], path[i]);
    const dist = Math.hypot(L.B.x-L.A.x, L.B.y-L.A.y);
    sfx('travel');
    await tween(Math.max(240, dist*(path.length>4?1.4:2.2)), k => { const e = ease(k), u = 1-e;
      party = {x: u*u*L.A.x + 2*u*e*L.cx + e*e*L.B.x, y: u*u*L.A.y + 2*u*e*L.cy + e*e*L.B.y};
      const tx = party.x*WS - wcw/2, ty = party.y*WS - wch/2; camX += (tx-camX)*.08; camY += (ty-camY)*.08; clampCam(); });
    C.at = path[i];
  }
  party = null; wTravel = false; saveCampaign(); updateWorldUI();
}
function nodeState(id){
  const N = NODES[id];
  if(N.type==='story'){
    const chs = nodeChapters(id), cur = chs.find(i => i===C.chapter);
    if(cur!==undefined) return {kind:'current', chapter:cur};
    if(chs.every(i => i < C.chapter)){ if(N.town && C.chapter>=N.town) return {kind:'town'}; return {kind:'done'}; }
    return {kind:'locked'};
  }
  if(N.type==='town') return {kind:'town'};
  if(N.repeat) return {kind:'repeat'};
  return {kind: C.cleared[id] ? 'cleared' : 'side'};
}
function updateWorldUI(){
  const L = partyLevel();
  $('wLevel').textContent = `Livello ${L}`;
  const lo = xpForLevel(L), hi = xpForLevel(Math.min(MAX_LEVEL, L+1));
  $('wXp').style.width = (L>=MAX_LEVEL ? 100 : 100*(C.xp-lo)/(hi-lo)) + '%';
  $('wSub').textContent = C.chapter < STORY.length ? `${ACTS[actOf(C.chapter)].n}, capitolo ${C.chapter+1}: ${STORY[C.chapter].title}` : 'Campagna completata';
  const promos = activeHeroes().some(id=>pendingPromos(id)>0);
  $('wCamp').classList.toggle('ready', promos);
  $('wCamp').title = promos ? 'Nuove abilità da scegliere' : '';
  const id = wSel, N = NODES[id], st = nodeState(id), here = C.at===id;
  const go = $('wGo');
  let kind = '', desc = N.desc || '', meta = '';
  go.hidden = false; go.disabled = wTravel;
  if(st.kind==='current'){ const S = STORY[st.chapter]; kind = `Capitolo ${st.chapter+1}, missione della storia`; desc = S.brief[0]; meta = `Livello consigliato ${S.level}.`; }
  else if(st.kind==='done'){ kind = 'Storia, completato'; desc = desc || 'Qui la storia è già passata.'; }
  else if(st.kind==='town'){ kind = 'Luogo sicuro'; }
  else if(st.kind==='repeat'){ kind = 'Scontro secondario ripetibile'; meta = `I nemici si adattano al vostro livello (minimo ${N.minLevel}). Vittorie qui: ${C.runs[id]||0}.`; }
  else if(st.kind==='side'){ kind = 'Luogo da esplorare'; meta = `Livello consigliato ${N.level}. Ricompensa: un oggetto unico.`; }
  else if(st.kind==='cleared'){ kind = 'Luogo esplorato'; meta = 'Non c\'è più niente da trovare qui.'; }
  $('wKind').textContent = kind; $('wName').textContent = N.name; $('wDesc').textContent = desc; $('wMeta').textContent = here ? (meta + ' Il gruppo è qui.').trim() : meta;
  if(!here){
    const route = routeTo(id);
    if(route){ go.textContent = `Viaggia fin qui (${route.length-1} ${route.length===2?'tappa':'tappe'})`; go.onclick = () => travelTo(id); }
    else { go.textContent = 'Strada sconosciuta'; go.disabled = true; }
  } else if(st.kind==='current'){ go.textContent = 'Inizia il capitolo'; go.onclick = () => showBriefing(st.chapter); }
  else if(st.kind==='repeat' || st.kind==='side'){ go.textContent = 'Combatti'; go.onclick = () => showSideBrief(id); }
  else if(st.kind==='town'){ go.textContent = 'Riposa all\'accampamento'; go.onclick = showCamp; }
  else go.hidden = true;
}
function landmark(c, id, x, y){
  c.save(); c.translate(x, y-30); c.fillStyle = 'rgba(25,20,15,.75)'; c.strokeStyle = 'rgba(25,20,15,.75)';
  if(/torre|vedetta|torreNord/.test(id)){ c.fillRect(-5,-22,10,22); c.beginPath(); c.moveTo(-7,-22); c.lineTo(0,-32); c.lineTo(7,-22); c.closePath(); c.fill(); c.fillStyle='#ffd27a'; c.fillRect(-1.5,-16,3,4); }
  else if(id==='abbazia' || id==='santuario'){ c.fillRect(-10,-12,20,12); c.beginPath(); c.moveTo(-12,-12); c.lineTo(0,-22); c.lineTo(12,-12); c.closePath(); c.fill(); c.fillRect(-1,-30,2,9); c.fillRect(-4,-27,8,2); }
  else if(id==='mulino'){ c.fillRect(-4,-18,8,18); c.save(); c.translate(0,-17); for(let i=0;i<4;i++){ c.rotate(Math.PI/2); c.fillRect(-1,0,2,13); } c.restore(); }
  else if(id==='corvara' || id==='pietrabianca' || id==='frostal'){ for(const dx of [-10,4]){ c.fillRect(dx,-8,9,8); c.beginPath(); c.moveTo(dx-1,-8); c.lineTo(dx+4.5,-14); c.lineTo(dx+10,-8); c.closePath(); c.fill(); } }
  else if(id==='cerchio' || id==='porteCerchio' || id==='trono'){ for(let i=0;i<5;i++) c.fillRect(-12+i*6,-12-(i%2)*3,3,12+(i%2)*3); }
  c.restore();
}
function drawWorld(now){
  const c = wctx, t = now/1000;
  c.setTransform(1,0,0,1,0,0); c.fillStyle = '#0e1614'; c.fillRect(0,0,wcv.width,wcv.height);
  c.drawImage(wbg, -camX*WDPR, -camY*WDPR);
  c.setTransform(WS*WDPR,0,0,WS*WDPR,-camX*WDPR,-camY*WDPR);
  for(const [a,b] of LINKS){
    if(!nodeRevealed(a) || !nodeRevealed(b)) continue;
    const L = linkCurve(a,b), side = NODES[a].type==='side' || NODES[b].type==='side';
    for(const [w,col,dash] of [[7,'rgba(30,22,12,.55)',[]],[4,side?'#cbb98f':'#e2c88a',side?[4,8]:[10,8]]]){
      c.beginPath(); c.moveTo(L.A.x,L.A.y); c.quadraticCurveTo(L.cx,L.cy,L.B.x,L.B.y); c.lineWidth=w; c.strokeStyle=col; c.setLineDash(dash); c.stroke();
    }
    c.setLineDash([]);
  }
  c.setTransform(1,0,0,1,0,0); c.drawImage(wfog, -camX*WDPR, -camY*WDPR);
  c.setTransform(WS*WDPR,0,0,WS*WDPR,-camX*WDPR,-camY*WDPR);
  const vx0 = camX/WS - 60, vx1 = (camX+wcw)/WS + 60, vy0 = camY/WS - 60, vy1 = (camY+wch)/WS + 60;
  for(const id in NODES){
    if(!nodeRevealed(id)) continue;
    const N = NODES[id]; if(N.x<vx0 || N.x>vx1 || N.y<vy0 || N.y>vy1) continue;
    const st = nodeState(id), sel = id===wSel;
    const col = st.kind==='current' ? ['#f0cf72','#3d2c08'] : st.kind==='done' ? ['#b9a46a','#3a3220'] : st.kind==='town' ? ['#8fd3c0','#173a32'] :
                st.kind==='repeat' ? ['#d9d4c7','#3a3833'] : st.kind==='side' ? ['#c9a6ff','#2e1c4a'] : ['#8a877c','#2a2925'];
    landmark(c, id, N.x, N.y);
    if(st.kind==='current'){ const p = .5+.5*Math.sin(t*3); c.beginPath(); c.arc(N.x,N.y,30+p*10,0,7); c.strokeStyle=`rgba(240,207,114,${.7-.5*p})`; c.lineWidth=4; c.stroke(); }
    if(sel){ c.save(); c.translate(N.x,N.y); c.rotate(t*.6); c.setLineDash([8,6]); c.beginPath(); c.arc(0,0,34,0,7); c.strokeStyle='#fff3d0'; c.lineWidth=3; c.stroke(); c.restore(); }
    c.fillStyle='rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(N.x+3,N.y+20,20,7,0,0,7); c.fill();
    c.beginPath(); c.arc(N.x,N.y,22,0,7); c.fillStyle=col[1]; c.fill(); c.lineWidth=4; c.strokeStyle=col[0]; c.stroke();
    c.fillStyle=col[0]; c.strokeStyle=col[0]; c.lineWidth=3; c.lineCap='round';
    if(st.kind==='current'){ c.font='bold 24px "IM Fell English", Georgia, serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(String(st.chapter+1), N.x, N.y+1); }
    else if(st.kind==='done' || st.kind==='cleared'){ c.beginPath(); c.moveTo(N.x-9,N.y); c.lineTo(N.x-2,N.y+8); c.lineTo(N.x+10,N.y-8); c.stroke(); }
    else if(st.kind==='town'){ c.beginPath(); c.moveTo(N.x-11,N.y+9); c.lineTo(N.x-11,N.y-2); c.lineTo(N.x,N.y-11); c.lineTo(N.x+11,N.y-2); c.lineTo(N.x+11,N.y+9); c.closePath(); c.fill(); }
    else if(st.kind==='repeat'){ c.beginPath(); c.moveTo(N.x-10,N.y-10); c.lineTo(N.x+10,N.y+10); c.moveTo(N.x+10,N.y-10); c.lineTo(N.x-10,N.y+10); c.stroke(); }
    else if(st.kind==='side'){ c.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?5:12; c.lineTo(N.x+Math.cos(a)*r, N.y+Math.sin(a)*r); } c.closePath(); c.fill(); }
    c.font='18px "IM Fell English", Georgia, serif'; c.textAlign='center'; c.textBaseline='top';
    c.lineWidth=4; c.strokeStyle='rgba(15,12,8,.85)'; c.strokeText(N.name, N.x, N.y+28); c.fillStyle = st.kind==='done'||st.kind==='cleared' ? '#d8d0bc' : '#fff6dc'; c.fillText(N.name, N.x, N.y+28);
  }
  const P = party || NODES[C.at];
  const bob = REDUCED ? 0 : Math.sin(t*3)*2;
  c.save(); c.translate(P.x+20, P.y-26+bob);
  c.strokeStyle='#2a2016'; c.lineWidth=3; c.beginPath(); c.moveTo(0,22); c.lineTo(0,-22); c.stroke();
  c.beginPath(); c.moveTo(0,-22); c.lineTo(24,-15); c.lineTo(0,-6); c.closePath(); c.fillStyle='#d9b55a'; c.fill(); c.lineWidth=1.5; c.stroke();
  c.beginPath(); c.arc(9,-14,3,0,7); c.fillStyle='#fff3c0'; c.fill();
  c.restore();
}
(() => {
  let down = null;
  wcv.addEventListener('pointerdown', e => { down = {x:e.clientX, y:e.clientY, cx:camX, cy:camY, moved:false}; wcv.setPointerCapture(e.pointerId); });
  wcv.addEventListener('pointermove', e => { if(!down) return; const dx = e.clientX-down.x, dy = e.clientY-down.y; if(Math.hypot(dx,dy)>8) down.moved = true; if(down.moved){ camX = down.cx-dx; camY = down.cy-dy; clampCam(); } });
  wcv.addEventListener('pointerup', e => {
    if(down && !down.moved){
      const r = wcv.getBoundingClientRect(); const x = (e.clientX - r.left + camX)/WS, y = (e.clientY - r.top + camY)/WS;
      let best = null, bd = 44/Math.min(1,WS);
      for(const id in NODES){ if(!nodeRevealed(id)) continue; const d = Math.hypot(NODES[id].x-x, NODES[id].y-y); if(d<bd){ bd = d; best = id; } }
      if(best){ wSel = best; sfx('select'); updateWorldUI(); }
    }
    down = null;
  });
  wcv.addEventListener('wheel', e => { camX += e.deltaX; camY += e.deltaY; clampCam(); e.preventDefault(); }, {passive:false});
})();
new ResizeObserver(() => { if(VIEW==='world') fitWorld(); }).observe($('wmap'));
$('wCamp').onclick = showCamp;
$('wJournal').onclick = showJournal;
$('wHelp').onclick = () => { $('intro').hidden = false; $('startBtn').textContent = 'Ho capito'; };

function newCampaign(){
  C = freshCampaign(); saveCampaign();
  showStory({kicker:'Prologo', title:'Le Ceneri di Valdombra', art:{biome:'titolo', time:'tramonto'}, paras:PROLOGUE,
    buttons:[{label:'Apri la mappa', fn:()=>{ wSel = 'guado'; showWorld(); }}]});
}
function openAudio(){ $('aMusic').checked = AUDIO.settings.music; $('aSfx').checked = AUDIO.settings.sfx; $('aVol').value = AUDIO.settings.vol; $('audioPanel').hidden = false; }
$('audioBtn').onclick = openAudio; $('wAudio').onclick = openAudio;
$('aClose').onclick = () => { $('audioPanel').hidden = true; };
$('aMusic').onchange = e => AUDIO.set('music', e.target.checked);
$('aSfx').onchange = e => AUDIO.set('sfx', e.target.checked);
$('aVol').oninput = e => AUDIO.set('vol', +e.target.value);
document.addEventListener('pointerdown', () => AUDIO.unlock(), true);
document.addEventListener('keydown', () => AUDIO.unlock(), true);
document.addEventListener('click', e => { if(e.target.closest('button')) sfx('click'); }, true);
function boot(){
  AUDIO.music('map');
  const saved = loadCampaign();
  const btns = [];
  if(saved && (saved.chapter>0 || saved.xp>0)) btns.push({label:`Continua: livello ${(C=saved, partyLevel())}, capitolo ${Math.min(saved.chapter+1, STORY.length)}`, fn:()=>{ C = saved; showWorld(); }});
  btns.push({label:'Nuova campagna', fn:newCampaign});
  btns.push({label:'Come si gioca', fn:()=>{ $('intro').hidden = false; $('startBtn').textContent = 'Ho capito'; }});
  showStory({kicker:`Una campagna in ${ACTS.length} atti e ${STORY.length} capitoli`, title:'Le Ceneri di Valdombra', art:{biome:'titolo', time:'notte'},
    paras:['Esplora la valle sulla mappa, segui la storia capitolo dopo capitolo e affronta gli scontri secondari per far crescere gli eroi e trovare equipaggiamento.'], buttons:btns});
}
