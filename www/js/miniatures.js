'use strict';
/* Le Ceneri di Valdombra: miniatures.js */
/* ================= MINIATURE ================= */
const OL = '#1a120c', LW = .035;
function P(c, path, fill, lw=LW, ol=OL){ c.beginPath(); path(); if(fill){ c.fillStyle = fill; c.fill(); } if(lw){ c.lineWidth = lw; c.strokeStyle = ol; c.lineJoin = 'round'; c.stroke(); } }
function lg(c,x0,y0,x1,y1,a,b){ const g = c.createLinearGradient(x0,y0,x1,y1); g.addColorStop(0,a); g.addColorStop(1,b); return g; }
function limb(c,x1,y1,x2,y2,col,w=.1){ c.lineCap='round'; c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.lineWidth=w+.06; c.strokeStyle=OL; c.stroke(); c.lineWidth=w; c.strokeStyle=col; c.stroke(); }
function dot(c,x,y,r,col,lw=LW*.8){ P(c,()=>c.arc(x,y,r,0,7),col,lw); }

const TEAM = {hero:['#2f6f62','#163a32','#e2c06a'], foe:['#6a2a22','#2a100c','#d0574a'], undead:['#3d3650','#1a1624','#a99bd0'], boss:['#4a2a66','#1a0c26','#d3a6ff']};
function teamOf(cls){ const d = CLASSES[cls]; return d.side==='hero' ? 'hero' : (d.boss||d.leader) ? 'boss' : d.undead ? 'undead' : 'foe'; }
function base(c, s, team){
  const T = TEAM[team];
  c.save(); c.scale(s,s);
  P(c,()=>c.ellipse(0,.06,.45,.18,0,0,7),'#100c08');
  P(c,()=>c.ellipse(0,0,.45,.18,0,0,7), lg(c,-.4,-.18,.4,.18,T[0],T[1]), 0);
  c.beginPath(); c.ellipse(0,0,.45,.18,0,0,7); c.lineWidth=.045; c.strokeStyle=T[2]; c.stroke();
  c.beginPath(); c.ellipse(0,0,.36,.13,0,Math.PI*1.1,Math.PI*1.6); c.lineWidth=.025; c.strokeStyle='rgba(255,250,230,.25)'; c.stroke();
  c.restore();
}

/* --- parti --- */
function torso(c,sw,hw,fill){ P(c,()=>{ c.moveTo(-sw,-.82); c.quadraticCurveTo(0,-.88,sw,-.82); c.lineTo(hw,-.38); c.lineTo(-hw,-.38); c.closePath(); }, fill); }
function robe(c,sw,fl,fill){ P(c,()=>{ c.moveTo(-sw,-.82); c.quadraticCurveTo(0,-.88,sw,-.82); c.lineTo(sw+fl,-.03); c.quadraticCurveTo(0,.04,-sw-fl,-.03); c.closePath(); }, fill); }
function legs(c,legCol,bootCol,hw){ for(const x of [-hw*.5, hw*.5]){ P(c,()=>c.rect(x-.06,-.42,.12,.32),legCol); P(c,()=>{ c.moveTo(x-.07,-.14); c.lineTo(x+.07,-.14); c.lineTo(x+.12,0); c.lineTo(x-.07,0); c.closePath(); }, bootCol); } }
function belt(c,hw,col,buckle='#d9b55a'){ P(c,()=>c.rect(-hw-.01,-.45,2*hw+.02,.07),col); P(c,()=>c.rect(-.03,-.455,.06,.08),buckle,.02); }
function cape(c,sw,a,b,jag){ P(c,()=>{ c.moveTo(-sw+.04,-.84); c.lineTo(sw-.08,-.84); c.quadraticCurveTo(sw*.2,-.4,sw-.04,-.06);
  if(jag){ for(let i=0;i<5;i++){ const x = sw-.04 - (i+.5)*(2*sw+.1)/5; c.lineTo(x,-.16); c.lineTo(x-.05,-.04); } } else c.lineTo(-sw-.14,-.08);
  c.quadraticCurveTo(-sw-.14,-.5,-sw+.04,-.84); c.closePath(); }, lg(c,0,-.85,0,0,a,b)); }
function hand(c,x,y,col){ dot(c,x,y,.05,col); }
function face(c,skin,x=.02,y=-.98,r=.155){ P(c,()=>c.arc(x,y,r,0,7), lg(c,x-r,y-r,x+r,y+r,skin,shade(skin,-.25))); dot(c,x+.075,y-.01,.02,'#1a120c',0); }
function shade(hex,f){ const n = parseInt(hex.slice(1),16); let r=n>>16, g=n>>8&255, b=n&255; const t = f<0 ? 0 : 255, k = Math.abs(f); r=Math.round(r+(t-r)*k); g=Math.round(g+(t-g)*k); b=Math.round(b+(t-b)*k); return `rgb(${r},${g},${b})`; }
function helmet(c,metal,plume){
  if(plume) P(c,()=>{ c.moveTo(-.02,-1.15); c.quadraticCurveTo(-.26,-1.32,-.4,-1.0); c.quadraticCurveTo(-.22,-1.12,-.02,-1.07); c.closePath(); }, plume);
  P(c,()=>{ c.arc(0,-.99,.185,Math.PI,0); c.lineTo(.185,-.88); c.quadraticCurveTo(0,-.83,-.185,-.88); c.closePath(); }, lg(c,-.2,-1.17,.2,-.85,'#eef2f4',metal));
  P(c,()=>c.rect(.02,-.99,.165,.035),'#14100c',0);
  limb(c,.1,-1.02,.1,-.9,metal,.025);
}
function hood(c,a,b,skin,eyes){
  P(c,()=>c.arc(.04,-.97,.135,0,7), skin||'#0e0a10', 0);
  if(eyes){ c.fillStyle = eyes; for(const x of [.0,.09]){ c.beginPath(); c.arc(x+.02,-.98,.024,0,7); c.fill(); } }
  else dot(c,.1,-.99,.02,'#1a120c',0);
  P(c,()=>{ c.moveTo(-.2,-.8); c.quadraticCurveTo(-.27,-1.12,-.06,-1.21); c.quadraticCurveTo(.17,-1.25,.22,-1.0); c.lineTo(.21,-.86); c.quadraticCurveTo(.18,-1.1,.0,-1.11); c.quadraticCurveTo(-.11,-1.06,-.1,-.82); c.closePath(); }, lg(c,-.2,-1.2,.2,-.85,a,b));
}
function hair(c,skin,col,long){
  if(long) P(c,()=>{ c.moveTo(-.15,-1.05); c.quadraticCurveTo(-.27,-.75,-.14,-.6); c.lineTo(.02,-.72); c.lineTo(-.02,-1.0); c.closePath(); }, col);
  face(c,skin);
  P(c,()=>{ c.arc(.02,-.99,.165,Math.PI*1.02,Math.PI*1.92); c.quadraticCurveTo(.06,-1.07,-.14,-.93); c.closePath(); }, col);
}
function goblinHead(c,skin){
  P(c,()=>{ c.moveTo(-.08,-.95); c.lineTo(-.38,-1.08); c.lineTo(-.1,-.85); c.closePath(); }, shade(skin,-.15));
  P(c,()=>c.arc(.03,-.93,.15,0,7), lg(c,-.12,-1.08,.18,-.78,skin,shade(skin,-.3)));
  P(c,()=>{ c.moveTo(.1,-.97); c.lineTo(.38,-1.1); c.lineTo(.14,-.86); c.closePath(); }, skin);
  P(c,()=>{ c.moveTo(.15,-.94); c.lineTo(.26,-.88); c.lineTo(.15,-.86); c.closePath(); }, skin, .02);
  dot(c,.09,-.96,.034,'#ffd23a',.015); dot(c,.1,-.96,.014,'#1a120c',0);
  c.beginPath(); c.moveTo(.05,-.84); c.lineTo(.15,-.85); c.lineWidth=.018; c.strokeStyle=OL; c.stroke();
}
function orcHead(c,skin){
  P(c,()=>c.ellipse(.02,-.98,.2,.18,0,0,7), lg(c,-.18,-1.15,.2,-.8,skin,shade(skin,-.3)));
  P(c,()=>{ c.moveTo(-.1,-.93); c.lineTo(.21,-.93); c.lineTo(.18,-.81); c.lineTo(-.05,-.81); c.closePath(); }, shade(skin,-.2));
  for(const x of [.06,.15]) P(c,()=>{ c.moveTo(x,-.88); c.lineTo(x+.025,-.97); c.lineTo(x+.05,-.88); c.closePath(); }, '#efe6cf', .015);
  P(c,()=>{ c.moveTo(.0,-1.04); c.lineTo(.2,-1.02); c.lineTo(.2,-.99); c.lineTo(.0,-1.0); c.closePath(); }, shade(skin,-.4), 0);
  dot(c,.13,-.99,.025,'#ffb02e',.012);
  P(c,()=>{ c.moveTo(-.08,-1.15); c.quadraticCurveTo(-.2,-1.3,-.28,-1.18); c.quadraticCurveTo(-.16,-1.2,-.04,-1.12); c.closePath(); }, '#1d1612');
}
function skull(c,bone='#e8e1cf',glow){
  P(c,()=>c.arc(.02,-1.0,.155,0,7), lg(c,-.12,-1.15,.16,-.85,'#fffaf0',bone));
  P(c,()=>c.rect(-.03,-.9,.16,.075), bone);
  c.fillStyle='#1a120c'; for(const [x,r] of [[.0,.042],[.1,.036]]){ c.beginPath(); c.arc(x,-1.0,r,0,7); c.fill(); }
  if(glow){ c.fillStyle=glow; for(const x of [.0,.1]){ c.beginPath(); c.arc(x,-1.0,.016,0,7); c.fill(); } }
  c.beginPath(); c.moveTo(.06,-.95); c.lineTo(.04,-.92); c.lineTo(.08,-.92); c.closePath(); c.fill();
  c.strokeStyle='#1a120c'; c.lineWidth=.014; for(const x of [.01,.05,.09]){ c.beginPath(); c.moveTo(x,-.9); c.lineTo(x,-.83); c.stroke(); }
}
function sword(c,hx,hy,ang,len=.6,blade='#dfe4e8',hilt='#d9b55a'){
  c.save(); c.translate(hx,hy); c.rotate(ang);
  P(c,()=>{ c.moveTo(-.035,-.07); c.lineTo(-.035,-len); c.lineTo(0,-len-.08); c.lineTo(.035,-len); c.lineTo(.035,-.07); c.closePath(); }, lg(c,-.04,0,.04,0,'#ffffff',blade));
  c.beginPath(); c.moveTo(0,-.1); c.lineTo(0,-len+.02); c.lineWidth=.012; c.strokeStyle='rgba(0,0,0,.3)'; c.stroke();
  P(c,()=>c.rect(-.12,-.09,.24,.05),hilt); P(c,()=>c.rect(-.025,-.04,.05,.13),'#5a3a22',.02); dot(c,0,.11,.035,hilt,.02);
  c.restore();
}
function axe(c,hx,hy,ang,len=.75,metal='#c9ced2',cleaver){
  c.save(); c.translate(hx,hy); c.rotate(ang);
  limb(c,0,.14,0,-len,'#6b4a2a',.06);
  if(cleaver) P(c,()=>{ c.moveTo(.02,-len+.02); c.lineTo(.36,-len-.04); c.lineTo(.38,-len+.3); c.lineTo(.02,-len+.26); c.closePath(); }, lg(c,0,0,.38,0,'#f2f4f5',metal));
  else for(const s of [1,-1]) P(c,()=>{ c.moveTo(0,-len+.04); c.quadraticCurveTo(s*.2,-len-.06,s*.3,-len-.16); c.quadraticCurveTo(s*.24,-len+.08,s*.3,-len+.3); c.quadraticCurveTo(s*.18,-len+.16,0,-len+.2); c.closePath(); }, lg(c,0,0,s*.3,0,'#f2f4f5',metal));
  c.restore();
}
function bow(c,hx,hy,h=.42,wood='#8a5a2e'){
  const cx = hx-.18;
  c.lineCap='round'; c.beginPath(); c.arc(cx,hy,h,-1.0,1.0); c.lineWidth=.09; c.strokeStyle=OL; c.stroke(); c.lineWidth=.055; c.strokeStyle=wood; c.stroke();
  const ex = cx+h*Math.cos(1.0), ey = h*Math.sin(1.0);
  c.beginPath(); c.moveTo(ex,hy-ey); c.lineTo(ex,hy+ey); c.lineWidth=.014; c.strokeStyle='#efe6cf'; c.stroke();
}
function staff(c,x,top,wood,orb,orn){
  limb(c,x+.03,-.01,x-.02,top,wood,.05);
  if(orn) for(const s of [-1,1]){ c.beginPath(); c.moveTo(x-.02,top+.04); c.quadraticCurveTo(x-.02+s*.1,top-.05,x-.02+s*.03,top-.15); c.lineWidth=.03; c.strokeStyle=orn; c.stroke(); }
  if(orb) P(c,()=>c.arc(x-.02,top-.07,.07,0,7), lg(c,x-.08,top-.14,x+.04,top,'#ffffff',orb), .025);
}
function kite(c,x,y,field,trim='#e2c06a',emblem=true){
  P(c,()=>{ c.moveTo(x-.17,y-.2); c.lineTo(x+.17,y-.2); c.lineTo(x+.17,y+.02); c.quadraticCurveTo(x+.12,y+.22,x,y+.3); c.quadraticCurveTo(x-.12,y+.22,x-.17,y+.02); c.closePath(); }, lg(c,x-.17,y-.2,x+.17,y+.3,shade(field,.15),shade(field,-.3)));
  c.beginPath(); c.moveTo(x-.13,y-.16); c.lineTo(x+.13,y-.16); c.lineTo(x+.13,y+.01); c.quadraticCurveTo(x+.09,y+.17,x,y+.24); c.quadraticCurveTo(x-.09,y+.17,x-.13,y+.01); c.closePath(); c.lineWidth=.025; c.strokeStyle=trim; c.stroke();
  if(emblem){ P(c,()=>c.rect(x-.04,y-.04,.08,.1),trim,.015); P(c,()=>c.arc(x,y-.06,.04,Math.PI,0),trim,.015); dot(c,x,y+.01,.02,'#fff3c0',0); }
}
function roundShield(c,x,y,r=.19){
  P(c,()=>c.arc(x,y,r,0,7), lg(c,x-r,y-r,x+r,y+r,'#7a5a3a','#3e2a1a'));
  for(const a of [.5,2.4]){ c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r); c.lineWidth=.015; c.strokeStyle='rgba(0,0,0,.6)'; c.stroke(); }
  dot(c,x,y,.05,'#9aa0a5',.02);
}
function quiver(c){
  c.save(); c.translate(-.17,-.72); c.rotate(-.35);
  P(c,()=>c.roundRect(-.06,-.25,.12,.42,.04),'#6b4423');
  for(let i=0;i<3;i++) P(c,()=>{ c.moveTo(-.05+i*.04,-.25); c.lineTo(-.03+i*.04,-.37); c.lineTo(-.01+i*.04,-.25); c.closePath(); },'#c9533f',.015);
  c.restore();
}
function ribs(c,sw,hw,bone){
  torso(c,sw,hw,'#2a2420');
  c.strokeStyle=bone; c.lineCap='round';
  limb(c,.0,-.84,.0,-.38,bone,.05);
  for(let i=0;i<3;i++){ const y = -.76+i*.11, w = sw-.04-i*.03; c.beginPath(); c.moveTo(-w,y+.03); c.quadraticCurveTo(0,y-.05,w,y+.03); c.lineWidth=.04; c.strokeStyle=bone; c.stroke(); }
  P(c,()=>{ c.moveTo(-hw,-.4); c.lineTo(hw,-.4); c.lineTo(hw-.04,-.3); c.lineTo(-hw+.04,-.3); c.closePath(); }, bone);
}
function boneLegs(c,hw,bone){ for(const x of [-hw*.5,hw*.5]){ limb(c,x,-.32,x+.02,-.04,bone,.05); P(c,()=>c.ellipse(x+.05,-.02,.07,.03,0,0,7),bone,.02); } }

/* --- figure --- */
const SKIN = '#e7b98f';
const FIG = {
  knight:{size:1.05, draw(c){ const sw=.27, hw=.2, metal='#6d757c';
    cape(c,sw,'#2a7565','#0f2e28');
    limb(c,-sw+.03,-.78,-sw-.04,-.45,'#8d959c',.1); hand(c,-sw-.04,-.43,metal);
    legs(c,'#7d858c','#3a3f45',hw);
    torso(c,sw,hw,lg(c,-sw,-.85,sw,-.4,'#e3e8ec','#5f676e'));
    P(c,()=>{ c.moveTo(-.12,-.78); c.lineTo(.12,-.78); c.lineTo(.14,-.3); c.lineTo(0,-.22); c.lineTo(-.14,-.3); c.closePath(); }, lg(c,0,-.8,0,-.2,'#3a8a78','#1d4d43'));
    belt(c,hw,'#4a3020');
    for(const x of [-sw+.03, sw-.03]) P(c,()=>c.ellipse(x,-.8,.1,.07,0,0,7), lg(c,x-.1,-.87,x+.1,-.73,'#eef2f4',metal));
    helmet(c,metal,'#2f9f88');
    kite(c,-.07,-.58,'#2f6f62');
    limb(c,sw-.03,-.78,sw+.08,-.52,'#8d959c',.1); sword(c,sw+.08,-.5,.42,.62); hand(c,sw+.08,-.5,metal);
  }},
  archer:{size:1, draw(c){ const sw=.24, hw=.18;
    cape(c,sw,'#4a6a42','#1f331d');
    quiver(c);
    legs(c,'#5d4a33','#3b2a1c',hw);
    torso(c,sw,hw,lg(c,-sw,-.85,sw,-.4,'#9a7248','#4e3420'));
    c.beginPath(); c.moveTo(-sw+.05,-.8); c.lineTo(hw,-.44); c.lineWidth=.035; c.strokeStyle='#3b2a1c'; c.stroke();
    belt(c,hw,'#3b2a1c','#b9a46a');
    hood(c,'#56794c','#2c4428',SKIN);
    P(c,()=>{ c.moveTo(.13,-.88); c.quadraticCurveTo(.17,-.8,.12,-.72); c.lineTo(.08,-.86); c.closePath(); },'#a8532c',.015);
    limb(c,sw-.03,-.78,sw+.2,-.66,'#4c6e44',.09); bow(c,sw+.2,-.66,.42); hand(c,sw+.2,-.66,SKIN);
    limb(c,-sw+.05,-.78,.04,-.64,'#4c6e44',.09); hand(c,.04,-.64,SKIN);
    c.beginPath(); c.moveTo(.04,-.64); c.lineTo(sw+.3,-.66); c.lineWidth=.018; c.strokeStyle='#e8dcc0'; c.stroke();
    P(c,()=>{ c.moveTo(sw+.36,-.66); c.lineTo(sw+.28,-.70); c.lineTo(sw+.28,-.62); c.closePath(); },'#d9dde0',.012);
  }},
  mage:{size:1, draw(c){ const sw=.25;
    P(c,()=>{ c.moveTo(-.15,-1.05); c.quadraticCurveTo(-.32,-.7,-.2,-.5); c.lineTo(.0,-.66); c.lineTo(-.02,-1.0); c.closePath(); },'#f0e2b6');
    limb(c,-sw+.03,-.78,-sw-.03,-.46,'#2c3c74',.13); hand(c,-sw-.03,-.44,'#f0cba8');
    robe(c,sw,.1,lg(c,-sw,-.85,sw,0,'#4c66b8','#18214a'));
    c.beginPath(); c.moveTo(.01,-.8); c.lineTo(.05,-.03); c.moveTo(-sw-.08,-.07); c.quadraticCurveTo(0,0,sw+.08,-.07); c.lineWidth=.03; c.strokeStyle='#d6dcf0'; c.stroke();
    P(c,()=>c.rect(-.2,-.5,.4,.06),'#d6dcf0',.02);
    hair(c,'#f0cba8','#f0e2b6',false);
    c.beginPath(); c.arc(.02,-.99,.155,Math.PI*1.15,Math.PI*1.85); c.lineWidth=.025; c.strokeStyle='#e2c06a'; c.stroke();
    staff(c,sw+.08,-1.3,'#7a5530','#8ff5df','#c9a46a');
    limb(c,sw-.03,-.78,sw+.07,-.55,'#2c3c74',.13); hand(c,sw+.07,-.55,'#f0cba8');
  }},
  goblin:{size:.8, draw(c){ const sw=.22, hw=.16, sk='#86a84a';
    limb(c,-sw+.03,-.78,-sw-.04,-.48,sk,.08); hand(c,-sw-.04,-.46,sk);
    legs(c,sk,shade(sk,-.2),hw);
    torso(c,sw,hw,lg(c,-sw,-.85,sw,-.4,'#8a6440','#4a3220'));
    P(c,()=>{ c.moveTo(-hw,-.4); for(let i=0;i<4;i++){ c.lineTo(-hw+(i+.5)*hw/2,-.3); c.lineTo(-hw+(i+1)*hw/2,-.4); } c.closePath(); },'#5a3d26',.02);
    belt(c,hw,'#3b2a1c','#9a8a73');
    goblinHead(c,sk);
    limb(c,sw-.03,-.78,sw+.08,-.55,sk,.08); sword(c,sw+.08,-.53,1.0,.26,'#c8c8c8','#6b4a2a'); hand(c,sw+.08,-.53,sk);
  }},
  gArcher:{size:.8, draw(c){ const sw=.22, hw=.16, sk='#86a84a';
    quiver(c);
    legs(c,sk,shade(sk,-.2),hw);
    torso(c,sw,hw,lg(c,-sw,-.85,sw,-.4,'#6f7a46','#3a4020'));
    belt(c,hw,'#3b2a1c','#9a8a73');
    goblinHead(c,sk);
    P(c,()=>{ c.arc(.03,-.95,.17,Math.PI*1.05,Math.PI*1.9); c.closePath(); },'#5a4632');
    limb(c,sw-.03,-.78,sw+.18,-.66,sk,.08); bow(c,sw+.18,-.66,.36,'#6b4a2a'); hand(c,sw+.18,-.66,sk);
    limb(c,-sw+.05,-.78,.03,-.64,sk,.08); hand(c,.03,-.64,sk);
  }},
  shaman:{size:.84, draw(c){ const sw=.22, sk='#86a84a';
    for(const [a,col] of [[-.5,'#c9533f'],[-.15,'#e2c06a'],[.2,'#c9533f']]){ c.save(); c.translate(-.02,-1.05); c.rotate(a); P(c,()=>c.ellipse(0,-.18,.045,.16,0,0,7),col,.02); c.restore(); }
    limb(c,-sw+.03,-.78,-sw-.04,-.5,sk,.08); hand(c,-sw-.04,-.48,sk);
    robe(c,sw,.06,lg(c,-sw,-.85,sw,0,'#9a4428','#4a1c12'));
    P(c,()=>{ c.moveTo(-sw-.06,-.06); for(let i=0;i<6;i++){ const x=-sw-.06+(i+.5)*(2*sw+.12)/6; c.lineTo(x,.0); c.lineTo(x+(2*sw+.12)/12,-.06); } c.closePath(); },'#4a1c12',.015);
    for(let i=0;i<5;i++) dot(c,-.12+i*.06,-.74+Math.abs(i-2)*.025,.025,'#efe6cf',.012);
    goblinHead(c,sk);
    staff(c,sw+.07,-1.18,'#5a3d26',null);
    P(c,()=>c.arc(sw+.05,-1.24,.075,0,7),'#efe6cf',.025); dot(c,sw+.03,-1.25,.018,'#9cf58a',0); dot(c,sw+.08,-1.25,.016,'#9cf58a',0);
    limb(c,sw-.03,-.78,sw+.07,-.56,sk,.08); hand(c,sw+.07,-.56,sk);
  }},
  orc:{size:1.15, draw(c){ const sw=.32, hw=.24, sk='#6f8f45';
    limb(c,-sw+.04,-.78,-sw-.04,-.44,sk,.13); hand(c,-sw-.04,-.42,sk);
    legs(c,'#4a3828','#2a1f16',hw);
    torso(c,sw,hw,lg(c,-sw,-.85,sw,-.4,shade(sk,.15),shade(sk,-.35)));
    c.lineWidth=.04; c.strokeStyle='#4a3020'; c.beginPath(); c.moveTo(-sw+.04,-.82); c.lineTo(hw,-.44); c.moveTo(sw-.04,-.82); c.lineTo(-hw,-.44); c.stroke();
    belt(c,hw,'#4a3020','#9aa0a5');
    P(c,()=>{ c.moveTo(-.12,-.42); c.lineTo(.12,-.42); c.lineTo(.09,-.2); c.lineTo(-.09,-.2); c.closePath(); },'#5a3d26');
    P(c,()=>c.ellipse(sw-.04,-.8,.13,.08,-.3,0,7), lg(c,sw-.17,-.88,sw+.09,-.72,'#c9ced2','#5d6267'));
    for(const x of [-.06,.04]) P(c,()=>{ c.moveTo(sw+x-.02,-.86); c.lineTo(sw+x,-.97); c.lineTo(sw+x+.03,-.86); c.closePath(); },'#e8ecef',.015);
    orcHead(c,sk);
    limb(c,sw-.04,-.78,sw+.08,-.5,sk,.13); axe(c,sw+.08,-.48,.25,.75); hand(c,sw+.08,-.48,sk);
  }},
  warlord:{size:1.22, draw(c){ const sw=.32, hw=.24, sk='#7f8a55';
    cape(c,sw,'#7a6650','#3e3226',true);
    limb(c,-sw+.04,-.78,-sw-.04,-.44,sk,.13); hand(c,-sw-.04,-.42,sk);
    legs(c,'#4d4f54','#2a1f16',hw);
    torso(c,sw,hw,lg(c,-sw,-.85,sw,-.4,'#9a9da2','#3d3f43'));
    for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(-hw-.04+i*.01,-.72+i*.1); c.lineTo(hw+.04-i*.01,-.72+i*.1); c.lineWidth=.02; c.strokeStyle='rgba(0,0,0,.45)'; c.stroke(); }
    belt(c,hw,'#3b2a1c','#d9b55a');
    P(c,()=>c.ellipse(-sw+.02,-.82,.13,.09,0,0,7),'#8a7458'); P(c,()=>c.ellipse(sw-.02,-.82,.13,.09,0,0,7),'#8a7458');
    orcHead(c,sk);
    P(c,()=>{ c.arc(.02,-1.0,.2,Math.PI,0); c.closePath(); }, lg(c,-.2,-1.2,.2,-1.0,'#b8bcc0','#4d5054'));
    for(const s of [-1,1]) P(c,()=>{ c.moveTo(.02+s*.15,-1.1); c.quadraticCurveTo(.02+s*.34,-1.18,.02+s*.3,-1.42); c.quadraticCurveTo(.02+s*.24,-1.2,.02+s*.08,-1.16); c.closePath(); },'#efe6cf');
    limb(c,sw-.04,-.78,sw+.08,-.5,sk,.13); axe(c,sw+.08,-.48,.3,.72,'#c9ced2',true); hand(c,sw+.08,-.48,sk);
  }},
  skel:{size:.98, draw(c){ const sw=.22, hw=.15, bone='#e3dccb';
    limb(c,-sw+.03,-.78,-sw-.04,-.5,bone,.05); roundShield(c,-sw-.03,-.56);
    boneLegs(c,hw,bone); ribs(c,sw,hw,bone);
    skull(c,bone,'#ff7a5a');
    limb(c,sw-.03,-.78,sw+.08,-.52,bone,.05); sword(c,sw+.08,-.5,.5,.5,'#a39276','#6b5a44'); dot(c,sw+.08,-.5,.04,bone);
  }},
  skelA:{size:.98, draw(c){ const sw=.22, hw=.15, bone='#e3dccb';
    quiver(c);
    boneLegs(c,hw,bone); ribs(c,sw,hw,bone);
    P(c,()=>{ c.moveTo(-sw,-.82); c.lineTo(sw,-.82); c.lineTo(sw-.02,-.66); c.lineTo(-sw+.02,-.6); c.closePath(); },'#5b5048');
    skull(c,bone,'#ff7a5a');
    P(c,()=>{ c.arc(.02,-1.0,.175,Math.PI*1.0,Math.PI*1.75); c.lineTo(-.2,-.86); c.closePath(); },'#5b5048');
    limb(c,sw-.03,-.78,sw+.18,-.66,bone,.05); bow(c,sw+.18,-.66,.38,'#5a4632'); dot(c,sw+.18,-.66,.04,bone);
    limb(c,-sw+.05,-.78,.03,-.64,bone,.05); dot(c,.03,-.64,.035,bone);
  }},
  boneKnight:{size:1.2, draw(c){ const sw=.28, hw=.2, metal='#3a3c45';
    cape(c,sw,'#3a2f45','#140f1a',true);
    limb(c,-sw+.03,-.78,-sw-.04,-.45,'#4a4c55',.1); kite(c,-sw-.02,-.55,'#3d5a55','#7b8c88',true);
    legs(c,'#4a4c55','#22232a',hw);
    torso(c,sw,hw,lg(c,-sw,-.85,sw,-.4,'#6a6c76','#1e1f25'));
    P(c,()=>{ c.moveTo(-.11,-.78); c.lineTo(.11,-.78); c.lineTo(.13,-.3); c.lineTo(0,-.22); c.lineTo(-.13,-.3); c.closePath(); },'#2e4440');
    belt(c,hw,'#22232a','#7b8c88');
    for(const x of [-sw+.03, sw-.03]) P(c,()=>c.ellipse(x,-.8,.11,.08,0,0,7), lg(c,x-.1,-.88,x+.1,-.72,'#8a8c96',metal));
    P(c,()=>c.roundRect(-.16,-1.18,.34,.36,.08), lg(c,-.16,-1.18,.18,-.82,'#7a7c86','#22232a'));
    P(c,()=>c.rect(-.02,-1.03,.18,.04),'#0a0c10',0);
    limb(c,sw-.03,-.78,sw+.08,-.52,'#4a4c55',.1); sword(c,sw+.08,-.5,.15,.85,'#c5d3dc','#7b8c88'); hand(c,sw+.08,-.5,metal);
  }},
  cult:{size:1, draw(c){ const sw=.24;
    limb(c,-sw+.03,-.78,-sw-.03,-.47,'#3a2050',.12); hand(c,-sw-.03,-.45,'#c9b8d8');
    robe(c,sw,.08,lg(c,-sw,-.85,sw,0,'#5a3478','#1e1030'));
    c.beginPath(); c.moveTo(.0,-.78); c.lineTo(.04,-.04); c.lineWidth=.025; c.strokeStyle='#8a5ab0'; c.stroke();
    hood(c,'#5a3478','#1e1030','#120a18','#e0b8ff');
    staff(c,sw+.08,-1.28,'#3a2a20','#c08cff','#6b4a8a');
    limb(c,sw-.03,-.78,sw+.07,-.55,'#3a2050',.12); hand(c,sw+.07,-.55,'#c9b8d8');
  }},
  adept:{size:1, draw(c){ const sw=.24;
    limb(c,-sw+.03,-.78,-sw-.03,-.47,'#4a3068',.12); hand(c,-sw-.03,-.45,'#c9b8d8');
    robe(c,sw,.08,lg(c,-sw,-.85,sw,0,'#7a58a4','#2a1a40'));
    c.beginPath(); c.moveTo(-sw-.07,-.07); c.quadraticCurveTo(0,0,sw+.07,-.07); c.moveTo(.0,-.78); c.lineTo(.04,-.04); c.lineWidth=.03; c.strokeStyle='#e2c06a'; c.stroke();
    hood(c,'#7a58a4','#2a1a40','#120a18','#a6ffb8');
    limb(c,sw-.03,-.78,sw+.12,-.98,'#4a3068',.12); hand(c,sw+.12,-1.0,'#c9b8d8');
  }},
  necro:{size:1.25, draw(c){ const sw=.27;
    P(c,()=>{ c.moveTo(-.26,-.8); for(let i=0;i<6;i++){ const a = Math.PI*(1.05+i*.18); c.lineTo(.02+Math.cos(a)*.32,-.92+Math.sin(a)*.3); c.lineTo(.02+Math.cos(a+.09)*.2,-.92+Math.sin(a+.09)*.2); } c.lineTo(.26,-.8); c.closePath(); },'#6b3fa0');
    limb(c,-sw+.03,-.78,-sw-.04,-.47,'#2a1838',.13); hand(c,-sw-.04,-.45,'#d8cfe0');
    robe(c,sw,.14,lg(c,-sw,-.85,sw,0,'#3e2654','#0c0612'));
    c.fillStyle='#c08cff'; for(let i=0;i<5;i++){ c.beginPath(); c.arc(-sw-.06+i*(2*sw+.12)/4,-.1,.018,0,7); c.fill(); }
    c.beginPath(); c.moveTo(.0,-.78); c.lineTo(.05,-.04); c.lineWidth=.03; c.strokeStyle='#8a5ab0'; c.stroke();
    hood(c,'#4a2c66','#140a1e','#d8cfe0','#c58cff');
    limb(c,sw+.1,-.02,sw+.04,-1.38,'#2a1d2a',.05);
    P(c,()=>{ c.moveTo(sw+.04,-1.62); c.lineTo(sw+.12,-1.48); c.lineTo(sw+.04,-1.34); c.lineTo(sw-.04,-1.48); c.closePath(); }, lg(c,sw-.04,-1.62,sw+.12,-1.34,'#f3e0ff','#9a5ad8'), .025);
    limb(c,sw-.03,-.78,sw+.07,-.56,'#2a1838',.13); hand(c,sw+.07,-.56,'#d8cfe0');
  }},
  wraith:{size:1.05, draw(c){
    P(c,()=>{ c.moveTo(.18,-.78); c.quadraticCurveTo(.34,-.72,.44,-.6); c.lineTo(.36,-.58); c.lineTo(.4,-.52); c.lineTo(.3,-.56); c.quadraticCurveTo(.22,-.62,.12,-.62); c.closePath(); }, 'rgba(200,220,250,.85)', .025, '#2a3550');
    P(c,()=>{ c.moveTo(-.05,-1.24); c.quadraticCurveTo(.26,-1.22,.24,-.86); c.quadraticCurveTo(.3,-.52,.22,-.22); c.lineTo(.12,-.34); c.lineTo(.06,-.14); c.lineTo(-.04,-.32); c.lineTo(-.12,-.12); c.lineTo(-.18,-.34); c.lineTo(-.3,-.18); c.quadraticCurveTo(-.33,-.6,-.25,-.96); c.quadraticCurveTo(-.22,-1.22,-.05,-1.24); c.closePath(); },
      lg(c,0,-1.24,0,-.12,'rgba(232,242,255,.97)','rgba(130,160,215,.3)'), .03, '#2a3550');
    P(c,()=>c.ellipse(.08,-.97,.12,.14,0,0,7),'#0d1220',0);
    c.fillStyle='#cfefff'; for(const x of [.04,.13]){ c.beginPath(); c.arc(x,-.99,.022,0,7); c.fill(); }
  }},
  lupo:{size:1, draw(c){ const fur='#4a4442', fur2='#1c1918';
    P(c,()=>{ c.moveTo(-.3,-.44); c.quadraticCurveTo(-.52,-.5,-.55,-.72); c.quadraticCurveTo(-.42,-.54,-.28,-.36); c.closePath(); }, fur);
    limb(c,-.22,-.36,-.27,-.03,fur2,.07); limb(c,-.1,-.36,-.08,-.03,fur2,.07);
    P(c,()=>c.ellipse(0,-.42,.34,.15,0,0,7), lg(c,0,-.57,0,-.27,'#6a625e',fur2));
    P(c,()=>c.ellipse(.02,-.33,.22,.05,0,0,7),'rgba(140,130,120,.5)',0);
    limb(c,.16,-.36,.18,-.03,fur,.07); limb(c,.25,-.36,.3,-.03,fur,.07);
    P(c,()=>{ c.moveTo(.16,-.52); c.quadraticCurveTo(.24,-.74,.38,-.72); c.lineTo(.58,-.62); c.lineTo(.57,-.55); c.lineTo(.42,-.51); c.quadraticCurveTo(.32,-.4,.22,-.36); c.closePath(); }, lg(c,.16,-.75,.58,-.4,'#6a625e',fur2));
    P(c,()=>{ c.moveTo(.31,-.71); c.lineTo(.29,-.88); c.lineTo(.38,-.73); c.closePath(); }, fur);
    P(c,()=>{ c.moveTo(.37,-.72); c.lineTo(.41,-.86); c.lineTo(.44,-.7); c.closePath(); }, fur);
    dot(c,.43,-.65,.026,'#ffcf5a',.012); dot(c,.58,-.6,.025,'#0a0806',0);
    P(c,()=>{ c.moveTo(.5,-.55); c.lineTo(.52,-.5); c.lineTo(.54,-.55); c.closePath(); },'#ffffff',0);
  }}
};
/* bagliori animati, in coordinate della figura (prima del ribaltamento) */
const FIG_GLOW = {
  mage:[[.31,-1.37,'143,245,223',.22]], cult:[[.30,-1.35,'192,140,255',.2]], adept:[[.37,-1.08,'166,255,184',.24]],
  shaman:[[.26,-1.24,'156,245,138',.16]], necro:[[.31,-1.48,'200,140,255',.3],[.04,-.98,'197,140,255',.12]], boneKnight:[[.08,-1.01,'143,211,255',.14]]
};
/* --- nuove miniature --- */
function bent(c, pts, col, w=.06){
  c.lineCap='round'; c.lineJoin='round';
  for(const [lw,cl] of [[w+.05,OL],[w,col]]){ c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.lineWidth=lw; c.strokeStyle=cl; c.stroke(); }
}
function mace(c,hx,hy,ang,len=.5,metal='#c9ced2'){
  c.save(); c.translate(hx,hy); c.rotate(ang);
  limb(c,0,.12,0,-len,'#6b4a2a',.05);
  for(let i=0;i<6;i++){ const a = i*Math.PI/3; P(c,()=>{ c.moveTo(Math.cos(a)*.05,-len-.06+Math.sin(a)*.05); c.lineTo(Math.cos(a)*.13,-len-.06+Math.sin(a)*.13); c.lineTo(Math.cos(a+.5)*.06,-len-.06+Math.sin(a+.5)*.06); c.closePath(); }, metal, .015); }
  P(c,()=>c.arc(0,-len-.06,.08,0,7), lg(c,-.08,-len-.14,.08,-len,'#ffffff',metal), .025);
  c.restore();
}
function hammer(c,hx,hy,ang,len=.6,metal='#aab0b6'){
  c.save(); c.translate(hx,hy); c.rotate(ang);
  limb(c,0,.14,0,-len,'#6b4a2a',.06);
  P(c,()=>c.roundRect(-.19,-len-.1,.38,.2,.03), lg(c,-.19,-len-.1,.19,-len+.1,'#eef1f3',metal));
  c.beginPath(); c.moveTo(-.12,-len); c.lineTo(.12,-len); c.lineWidth=.02; c.strokeStyle='#7ff0ff'; c.stroke();
  P(c,()=>c.rect(-.04,-len+.1,.08,.06),'#d9b55a',.015);
  c.restore();
}
function spider(c, body, mark, queen){
  const legC = shade(body,-.15);
  const legs = s => { for(let i=0;i<4;i++){ const x0 = .02 + i*.05 - .08, y0 = -.36;
    bent(c, [[x0,y0],[x0 + s*(.28+i*.04), y0-.22+i*.03],[x0 + s*(.42+i*.06), -.02]], legC, .045); } };
  legs(-1);
  P(c,()=>c.ellipse(-.2,-.38,.28,.22,-.15,0,7), lg(c,-.4,-.6,-.05,-.16,shade(body,.25),shade(body,-.35)));
  P(c,()=>{ c.moveTo(-.26,-.5); c.lineTo(-.18,-.4); c.lineTo(-.26,-.3); c.lineTo(-.34,-.4); c.closePath(); }, mark, .015);
  P(c,()=>c.ellipse(.1,-.36,.15,.12,0,0,7), lg(c,-.05,-.48,.25,-.24,shade(body,.2),shade(body,-.3)));
  P(c,()=>c.arc(.25,-.37,.09,0,7), shade(body,-.1));
  c.fillStyle = queen ? '#ffb02e' : '#ff4a3a'; for(const [x,y] of [[.28,-.41],[.32,-.37],[.27,-.35],[.31,-.32]]){ c.beginPath(); c.arc(x,y,.018,0,7); c.fill(); }
  for(const s of [-1,1]) bent(c, [[.31,-.32],[.34+.02*s,-.22],[.3,-.18]], '#d8d0c0', .02);
  if(queen) for(let i=0;i<5;i++) P(c,()=>{ const x = -.36+i*.08; c.moveTo(x-.03,-.56+Math.abs(i-2)*.02); c.lineTo(x,-.68+Math.abs(i-2)*.03); c.lineTo(x+.03,-.56+Math.abs(i-2)*.02); c.closePath(); }, '#d6c2e8', .015);
  legs(1);
}
Object.assign(FIG, {
  priest:{size:1, draw(c){ const sw=.24;
    P(c,()=>{ c.moveTo(-.14,-1.05); c.quadraticCurveTo(-.32,-.78,-.2,-.56); c.lineTo(.0,-.68); c.lineTo(-.02,-1.0); c.closePath(); }, '#8a3f22');
    limb(c,-sw+.03,-.78,-sw-.03,-.48,'#ece4d0',.12); hand(c,-sw-.03,-.46,SKIN);
    robe(c,sw,.08,lg(c,-sw,-.85,sw,0,'#fbf6ea','#a99f86'));
    P(c,()=>{ c.moveTo(-.1,-.8); c.lineTo(.12,-.8); c.lineTo(.13,-.1); c.lineTo(.01,-.04); c.lineTo(-.11,-.1); c.closePath(); }, lg(c,0,-.8,0,-.05,'#2f7f6c','#174438'));
    c.beginPath(); c.moveTo(-sw-.07,-.07); c.quadraticCurveTo(0,0,sw+.07,-.07); c.lineWidth=.03; c.strokeStyle='#d9b55a'; c.stroke();
    P(c,()=>c.rect(-.035,-.6,.07,.09),'#e2c06a',.015); P(c,()=>c.arc(0,-.61,.035,Math.PI,0),'#e2c06a',.015); dot(c,0,-.555,.018,'#fff3c0',0);
    belt(c,.17,'#5a3a22');
    hair(c,SKIN,'#8a3f22',false);
    c.beginPath(); c.arc(.02,-.99,.16,Math.PI*1.12,Math.PI*1.88); c.lineWidth=.025; c.strokeStyle='#e2c06a'; c.stroke();
    limb(c,sw-.03,-.78,sw+.07,-.54,'#ece4d0',.12); mace(c,sw+.07,-.52,.35,.42); hand(c,sw+.07,-.52,SKIN);
  }},
  dwarf:{size:1.04, draw(c){ const sw=.31, hw=.24, sk='#e2a983', metal='#7a7f86';
    limb(c,-sw+.04,-.64,-sw-.06,-.36,'#8d939a',.13); hand(c,-sw-.06,-.34,sk);
    for(const x of [-hw*.5,hw*.5]){ P(c,()=>c.rect(x-.075,-.3,.15,.2),'#5a4030'); P(c,()=>{ c.moveTo(x-.09,-.12); c.lineTo(x+.09,-.12); c.lineTo(x+.15,0); c.lineTo(x-.09,0); c.closePath(); },'#3a2a1c'); }
    P(c,()=>{ c.moveTo(-sw,-.7); c.quadraticCurveTo(0,-.76,sw,-.7); c.lineTo(hw+.03,-.27); c.lineTo(-hw-.03,-.27); c.closePath(); }, lg(c,-sw,-.75,sw,-.27,'#c8cdd2','#4f555b'));
    c.strokeStyle='rgba(30,30,35,.45)'; c.lineWidth=.015; for(let y=-.64;y<-.3;y+=.06){ c.beginPath(); c.moveTo(-sw+.04,y); c.lineTo(sw-.04,y); c.stroke(); }
    P(c,()=>c.rect(-hw-.03,-.38,2*hw+.06,.08),'#5a3a22'); P(c,()=>c.rect(-.05,-.39,.1,.1),'#d9b55a',.02);
    for(const x of [-sw+.03, sw-.03]) P(c,()=>c.ellipse(x,-.69,.11,.07,0,0,7), lg(c,x-.1,-.76,x+.1,-.62,'#eef2f4',metal));
    P(c,()=>c.arc(.03,-.84,.15,0,7), lg(c,-.12,-.99,.18,-.69,sk,shade(sk,-.25)));
    P(c,()=>{ c.moveTo(-.1,-.84); c.quadraticCurveTo(-.15,-.55,.02,-.42); c.quadraticCurveTo(.21,-.55,.18,-.84); c.quadraticCurveTo(.05,-.74,-.1,-.84); c.closePath(); }, lg(c,0,-.84,0,-.42,'#e07d3e','#a64b1e'));
    c.strokeStyle='rgba(90,30,10,.6)'; c.lineWidth=.015; for(const x of [-.03,.05,.12]){ c.beginPath(); c.moveTo(x,-.78); c.lineTo(x+.01,-.5); c.stroke(); }
    dot(c,.1,-.88,.02,'#1a120c',0);
    P(c,()=>{ c.arc(.03,-.88,.17,Math.PI,0); c.closePath(); }, lg(c,-.15,-1.05,.2,-.88,'#e5e9ec',metal));
    P(c,()=>c.rect(.07,-.9,.04,.13),metal,.015);
    for(const s of [-1,1]) P(c,()=>{ c.moveTo(.03+s*.14,-.95); c.quadraticCurveTo(.03+s*.3,-1.02,.03+s*.27,-1.16); c.quadraticCurveTo(.03+s*.2,-1.02,.03+s*.08,-1.0); c.closePath(); },'#efe6cf');
    limb(c,sw-.04,-.64,sw+.08,-.4,'#8d939a',.13); hammer(c,sw+.08,-.38,.28,.6); hand(c,sw+.08,-.38,sk);
  }},
  villager:{size:.95, draw(c){ const sw=.22, hw=.17;
    limb(c,-sw+.03,-.78,-sw-.03,-.5,'#a5824c',.1); hand(c,-sw-.03,-.48,SKIN);
    legs(c,'#6b5a40','#3a2a1c',hw);
    torso(c,sw,hw,lg(c,-sw,-.85,sw,-.4,'#b8925a','#6a4e2a'));
    P(c,()=>{ c.moveTo(-hw,-.4); c.lineTo(hw,-.4); c.lineTo(hw+.04,-.24); c.lineTo(-hw-.04,-.24); c.closePath(); },'#8a6a3a');
    belt(c,hw,'#4a3020','#9a8a73');
    face(c,SKIN);
    P(c,()=>{ c.moveTo(-.02,-.88); c.quadraticCurveTo(.08,-.8,.16,-.9); c.quadraticCurveTo(.08,-.84,-.02,-.88); c.closePath(); },'#8a6a4a',.015);
    P(c,()=>c.ellipse(.02,-1.08,.27,.06,0,0,7),'#e1c57a'); P(c,()=>{ c.moveTo(-.12,-1.08); c.quadraticCurveTo(-.1,-1.24,.02,-1.24); c.quadraticCurveTo(.14,-1.24,.16,-1.08); c.closePath(); },'#d9bf73');
    c.beginPath(); c.moveTo(-.12,-1.11); c.lineTo(.16,-1.11); c.lineWidth=.03; c.strokeStyle='#8a3f22'; c.stroke();
    limb(c,sw+.1,-.02,sw+.05,-1.25,'#8a6a3a',.04);
    for(const dx of [-.07,0,.07]) limb(c,sw+.05+dx,-1.25,sw+.05+dx,-1.42,'#9aa0a5',.02);
    limb(c,sw-.1,-1.25,sw+.2,-1.25,'#9aa0a5',.02);
    limb(c,sw-.03,-.78,sw+.07,-.6,'#a5824c',.1); hand(c,sw+.07,-.6,SKIN);
  }},
  ilvar:{size:1.05, draw(c){ const sw=.25;
    limb(c,-sw+.03,-.78,-sw-.03,-.47,'#2c2f58',.12); hand(c,-sw-.03,-.45,'#e6c3a3');
    robe(c,sw,.12,lg(c,-sw,-.85,sw,0,'#535a96','#141734'));
    c.fillStyle='#e2c06a'; for(const [x,y] of [[-.1,-.6],[.12,-.4],[-.05,-.25],[.08,-.68]]){ c.beginPath(); c.arc(x,y,.02,0,7); c.fill(); }
    c.beginPath(); c.moveTo(-sw-.11,-.04); c.quadraticCurveTo(0,.02,sw+.11,-.04); c.lineWidth=.03; c.strokeStyle='#e2c06a'; c.stroke();
    face(c,'#e6c3a3');
    P(c,()=>{ c.moveTo(-.05,-.94); c.quadraticCurveTo(-.12,-.6,.04,-.42); c.quadraticCurveTo(.2,-.62,.16,-.94); c.quadraticCurveTo(.06,-.86,-.05,-.94); c.closePath(); }, lg(c,0,-.94,0,-.42,'#ffffff','#b9b4a8'));
    P(c,()=>c.ellipse(.02,-1.1,.28,.06,0,0,7),'#353b72');
    P(c,()=>{ c.moveTo(-.14,-1.1); c.quadraticCurveTo(-.02,-1.3,.0,-1.48); c.quadraticCurveTo(.06,-1.52,.16,-1.44); c.quadraticCurveTo(.06,-1.42,.06,-1.36); c.quadraticCurveTo(.14,-1.2,.18,-1.1); c.closePath(); }, lg(c,-.14,-1.5,.18,-1.1,'#4a52a0','#22265a'));
    c.beginPath(); c.moveTo(-.13,-1.14); c.lineTo(.17,-1.14); c.lineWidth=.03; c.strokeStyle='#e2c06a'; c.stroke();
    staff(c,sw+.08,-1.3,'#5a3d26','#ffcf6a','#c9a46a');
    limb(c,sw-.03,-.78,sw+.07,-.55,'#2c2f58',.12); hand(c,sw+.07,-.55,'#e6c3a3');
  }},
  ragno:{size:.95, draw(c){ spider(c,'#3c302c','#c9533f',false); }},
  regina:{size:1.45, draw(c){ spider(c,'#3e2a44','#e8e0f0',true); }},
  troll:{size:1.3, draw(c){ const sk='#7d8c6a', sw=.32, hw=.24;
    limb(c,-sw+.06,-.78,-sw-.1,-.22,sk,.15); dot(c,-sw-.1,-.2,.07,sk);
    for(const x of [-hw*.55,hw*.55]){ P(c,()=>c.roundRect(x-.09,-.36,.18,.3,.05),shade(sk,-.15)); P(c,()=>c.ellipse(x+.04,-.04,.13,.05,0,0,7),shade(sk,-.3)); }
    P(c,()=>{ c.moveTo(-sw,-.84); c.quadraticCurveTo(.05,-.98,sw,-.8); c.quadraticCurveTo(sw+.08,-.5,hw,-.34); c.quadraticCurveTo(0,-.26,-hw,-.34); c.quadraticCurveTo(-sw-.06,-.55,-sw,-.84); c.closePath(); }, lg(c,-sw,-.95,sw,-.3,shade(sk,.15),shade(sk,-.35)));
    P(c,()=>c.ellipse(.02,-.5,.17,.13,0,0,7),'rgba(220,230,190,.25)',0);
    P(c,()=>{ c.moveTo(-hw,-.38); c.lineTo(hw,-.38); c.lineTo(hw-.02,-.2); c.lineTo(.05,-.24); c.lineTo(-.05,-.18); c.lineTo(-hw+.02,-.22); c.closePath(); },'#6b4a2a');
    P(c,()=>c.arc(.14,-.86,.15,0,7), lg(c,0,-1.0,.28,-.72,shade(sk,.1),shade(sk,-.3)));
    P(c,()=>{ c.moveTo(.22,-.88); c.quadraticCurveTo(.36,-.86,.3,-.76); c.lineTo(.22,-.8); c.closePath(); }, shade(sk,-.1));
    P(c,()=>{ c.moveTo(.0,-.92); c.lineTo(-.14,-1.0); c.lineTo(-.02,-.84); c.closePath(); }, sk);
    dot(c,.19,-.9,.025,'#ffd23a',.012);
    for(const x of [.12,.2]) P(c,()=>{ c.moveTo(x,-.77); c.lineTo(x+.02,-.84); c.lineTo(x+.04,-.77); c.closePath(); },'#efe6cf',.012);
    c.save(); c.translate(sw+.1,-.42); c.rotate(.35);
    P(c,()=>{ c.moveTo(-.04,.12); c.lineTo(-.1,-.62); c.quadraticCurveTo(0,-.74,.1,-.62); c.lineTo(.04,.12); c.closePath(); }, lg(c,-.1,0,.1,0,'#8a6440','#4a3220'));
    for(const [x,y] of [[-.05,-.45],[.05,-.3],[-.03,-.15]]) dot(c,x,y,.025,'#3a2818',0);
    c.restore();
    limb(c,sw-.06,-.78,sw+.1,-.44,sk,.15); dot(c,sw+.1,-.42,.07,sk);
  }},
  ghoul:{size:.95, draw(c){ const sk='#9aa58c';
    bent(c,[[-.1,-.36],[-.22,-.2],[-.12,0]],shade(sk,-.15),.07);
    limb(c,-.12,-.66,-.02,-.3,shade(sk,-.15),.06); bent(c,[[-.02,-.3],[.06,-.24],[.1,-.27]],'#e8e2d0',.02);
    P(c,()=>{ c.moveTo(-.2,-.74); c.quadraticCurveTo(.05,-.86,.2,-.68); c.lineTo(.1,-.38); c.lineTo(-.12,-.36); c.closePath(); }, lg(c,-.2,-.84,.2,-.36,shade(sk,.1),shade(sk,-.35)));
    c.strokeStyle='rgba(30,35,25,.55)'; c.lineWidth=.015; for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(-.12,-.66+i*.08); c.quadraticCurveTo(0,-.7+i*.08,.12,-.62+i*.08); c.stroke(); }
    P(c,()=>{ c.moveTo(-.14,-.4); c.lineTo(.12,-.4); c.lineTo(.16,-.22); c.lineTo(.04,-.28); c.lineTo(-.04,-.2); c.lineTo(-.16,-.26); c.closePath(); },'#4a4238');
    bent(c,[[.06,-.38],[.2,-.2],[.12,0]],sk,.07);
    P(c,()=>c.ellipse(.24,-.78,.13,.12,.2,0,7), lg(c,.12,-.9,.36,-.66,shade(sk,.15),shade(sk,-.3)));
    P(c,()=>{ c.moveTo(.22,-.7); c.lineTo(.36,-.72); c.lineTo(.32,-.62); c.closePath(); },'#2a1414',.015);
    for(const x of [.27,.32]) P(c,()=>{ c.moveTo(x,-.71); c.lineTo(x+.01,-.67); c.lineTo(x+.02,-.71); c.closePath(); },'#efe6cf',0);
    dot(c,.28,-.82,.026,'#d6ff6a',.012);
    bent(c,[[.12,-.66],[.3,-.5],[.38,-.44]],sk,.06); for(const a of [-.4,0,.4]) bent(c,[[.38,-.44],[.44+.04*Math.cos(a),-.4+.06*Math.sin(a)]],'#e8e2d0',.015);
  }},
  golem:{size:1.25, draw(c){ const st='#8d877a';
    for(const x of [-.14,.14]) P(c,()=>c.roundRect(x-.1,-.38,.2,.38,.03), lg(c,x-.1,-.38,x+.1,0,shade(st,.1),shade(st,-.35)));
    P(c,()=>c.roundRect(-.48,-.82,.22,.5,.06), lg(c,-.48,-.82,-.26,-.32,shade(st,.1),shade(st,-.3)));
    P(c,()=>c.roundRect(-.3,-.9,.6,.56,.08), lg(c,-.3,-.9,.3,-.34,shade(st,.25),shade(st,-.3)));
    c.strokeStyle='rgba(40,35,30,.6)'; c.lineWidth=.02; c.beginPath(); c.moveTo(-.2,-.75); c.lineTo(-.05,-.62); c.lineTo(-.12,-.45); c.moveTo(.15,-.85); c.lineTo(.1,-.68); c.stroke();
    c.strokeStyle='#7ff0ff'; c.lineWidth=.025; c.beginPath(); c.moveTo(-.08,-.7); c.lineTo(.08,-.7); c.lineTo(0,-.56); c.closePath(); c.moveTo(0,-.66); c.lineTo(0,-.48); c.stroke();
    P(c,()=>c.ellipse(-.18,-.88,.12,.05,0,0,7),'rgba(110,140,80,.75)',0);
    P(c,()=>c.roundRect(-.12,-1.12,.28,.24,.05), lg(c,-.12,-1.12,.16,-.88,shade(st,.25),shade(st,-.25)));
    P(c,()=>c.rect(-.02,-1.03,.16,.04),'#7ff0ff',0);
    P(c,()=>c.roundRect(.26,-.82,.22,.5,.06), lg(c,.26,-.82,.48,-.32,shade(st,.15),shade(st,-.3)));
    P(c,()=>c.roundRect(.24,-.36,.26,.14,.04),shade(st,-.1));
  }},
  ashKnight:{size:1.08, draw(c){ const sw=.27, hw=.2, metal='#4a4440';
    cape(c,sw,'#5a2a20','#1a0c0a',true);
    limb(c,-sw+.03,-.78,-sw-.04,-.45,'#4a4440',.1); hand(c,-sw-.04,-.43,metal);
    legs(c,'#3a3532','#1c1816',hw);
    torso(c,sw,hw,lg(c,-sw,-.85,sw,-.4,'#6a625c','#1e1a18'));
    c.strokeStyle='#ff8a3a'; c.lineWidth=.02; c.beginPath(); c.moveTo(-.1,-.75); c.lineTo(-.02,-.6); c.lineTo(-.08,-.48); c.moveTo(.1,-.7); c.lineTo(.04,-.56); c.stroke();
    belt(c,hw,'#1c1816','#8a5a3a');
    for(const x of [-sw+.03, sw-.03]) P(c,()=>c.ellipse(x,-.8,.11,.08,0,0,7), lg(c,x-.1,-.88,x+.1,-.72,'#7a726c',metal));
    P(c,()=>{ c.moveTo(-.02,-1.18); c.quadraticCurveTo(-.24,-1.3,-.38,-1.12); c.quadraticCurveTo(-.2,-1.18,-.02,-1.12); c.closePath(); },'#8a8580');
    P(c,()=>{ c.arc(0,-.99,.185,Math.PI,0); c.lineTo(.185,-.86); c.quadraticCurveTo(0,-.81,-.185,-.86); c.closePath(); }, lg(c,-.2,-1.17,.2,-.85,'#8a827c','#24201e'));
    P(c,()=>c.rect(.02,-1.0,.165,.035),'#ff8a3a',0);
    limb(c,sw-.03,-.78,sw+.08,-.52,'#4a4440',.1); sword(c,sw+.08,-.5,.35,.72,'#6a625c','#8a5a3a'); hand(c,sw+.08,-.5,metal);
  }},
  king:{size:1.42, draw(c){ const sw=.3, hw=.22, metal='#5a5450';
    P(c,()=>{ c.moveTo(-sw+.02,-.86); c.lineTo(sw-.06,-.86); c.quadraticCurveTo(sw*.3,-.4,sw+.02,-.02); for(let i=0;i<6;i++){ const x = sw+.02 - (i+.5)*(2*sw+.2)/6; c.lineTo(x,-.12); c.lineTo(x-.05,0); } c.quadraticCurveTo(-sw-.18,-.5,-sw+.02,-.86); c.closePath(); }, lg(c,0,-.86,0,0,'#8a1e1a','#2a0606'));
    limb(c,-sw+.03,-.8,-sw-.04,-.46,'#5a5450',.12); hand(c,-sw-.04,-.44,'#d8d0c0');
    legs(c,'#4a4440','#1c1816',hw);
    torso(c,sw,hw,lg(c,-sw,-.88,sw,-.4,'#8a827a','#26221f'));
    P(c,()=>c.ellipse(0,-.62,.11,.13,0,0,7),'#1a1210',.02); c.fillStyle='#ff6a2a'; c.beginPath(); c.arc(0,-.62,.05,0,7); c.fill();
    belt(c,hw,'#1c1816','#d9b55a');
    for(const x of [-sw+.02, sw-.02]){ P(c,()=>c.ellipse(x,-.83,.14,.09,0,0,7), lg(c,x-.12,-.92,x+.12,-.74,'#9a928a',metal)); for(const d of [-.06,.04]) P(c,()=>{ c.moveTo(x+d-.02,-.9); c.lineTo(x+d,-1.0); c.lineTo(x+d+.025,-.9); c.closePath(); },'#d8d0c0',.012); }
    skull(c,'#d8d0c0','#ff7a3a');
    P(c,()=>{ c.moveTo(-.15,-1.1); c.lineTo(-.15,-1.24); c.lineTo(-.08,-1.16); c.lineTo(.02,-1.3); c.lineTo(.12,-1.16); c.lineTo(.19,-1.24); c.lineTo(.19,-1.1); c.closePath(); }, lg(c,-.15,-1.3,.19,-1.1,'#fff0a0','#a87a1a'), .025);
    dot(c,.02,-1.16,.025,'#ff4a3a',.012);
    limb(c,sw-.03,-.8,sw+.08,-.5,'#5a5450',.12);
    sword(c,sw+.08,-.48,.12,1.0,'#8a827a','#d9b55a'); hand(c,sw+.08,-.48,'#d8d0c0');
  }}
});
FIG.ilvarAlly = FIG.ilvar;
Object.assign(FIG_GLOW, {
  priest:[[0,-.56,'255,225,150',.14]], ilvar:[[.31,-1.37,'255,210,120',.22]], ilvarAlly:[[.31,-1.37,'255,210,120',.22]],
  golem:[[.06,-1.01,'127,240,255',.16],[0,-.62,'127,240,255',.12]], ashKnight:[[.1,-.99,'255,140,60',.12]],
  king:[[.06,-1.0,'255,120,50',.16],[0,-.62,'255,110,40',.16]], ghoul:[[.28,-.82,'214,255,106',.07]], regina:[[.3,-.36,'255,176,46',.08]]
});

function drawFigure(c, cls, face=1){
  const F = FIG[cls] || FIG.goblin, s = F.size;
  base(c, s, teamOf(cls));
  c.save(); c.scale(face*s, s); c.lineCap='round'; F.draw(c); c.restore();
}

/* --- sprite in cache --- */
const SPR = new Map();
function sprite(cls, face, variant){
  const k = cls+'|'+face+'|'+variant;
  let s = SPR.get(k); if(s) return s;
  const ppu = S*DPR, W = 2.6, H = 2.6, ox = 1.3, oy = 2.15;
  const cvs = document.createElement('canvas'); cvs.width = Math.ceil(W*ppu); cvs.height = Math.ceil(H*ppu);
  const c = cvs.getContext('2d'); c.setTransform(ppu,0,0,ppu,ox*ppu,oy*ppu);
  drawFigure(c, cls, face);
  c.setTransform(1,0,0,1,0,0);
  if(variant==='w'){ c.globalCompositeOperation='source-atop'; c.fillStyle='#fff8ec'; c.fillRect(0,0,cvs.width,cvs.height); }
  if(variant==='g'){ const im = c.getImageData(0,0,cvs.width,cvs.height), d = im.data;
    for(let i=0;i<d.length;i+=4){ const l = d[i]*.3+d[i+1]*.59+d[i+2]*.11; d[i] = l*.7+d[i]*.3; d[i+1] = l*.7+d[i+1]*.3; d[i+2] = l*.7+d[i+2]*.3; d[i+3] *= .75; }
    c.putImageData(im,0,0); }
  s = {cvs, W:cvs.width/ppu, H:cvs.height/ppu, ox, oy}; SPR.set(k,s); return s;
}
function blit(spr, x, y, b=1){ ctx.drawImage(spr.cvs, x-spr.ox, y-spr.oy*b, spr.W, spr.H*b); }
function drawPortraitTo(c, cls, W){
  const team = TEAM[teamOf(cls)], F = FIG[cls] || FIG.goblin;
  c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,W,W);
  c.save(); c.translate(W/2,W/2); hexPath(c,0,0,W*.47);
  const g = c.createRadialGradient(0,-W*.15,W*.05,0,0,W*.5); g.addColorStop(0,shade(team[0],.25)); g.addColorStop(1,team[1]);
  c.fillStyle = g; c.fill(); c.save(); c.clip();
  c.translate(0,W*.4); const k = W*.52/Math.max(1,F.size); c.scale(k,k); drawFigure(c, cls, 1);
  c.restore();
  hexPath(c,0,0,W*.47); c.lineWidth = W*.035; c.strokeStyle = team[2]; c.stroke();
  c.restore();
}

function drawHexFill(c,col,r,fill,stroke,lw){
  const p = posOf(col,r); hexPath(c,p.x,p.y,.9);
  if(fill){ c.fillStyle=fill; c.fill(); }
  if(stroke){ c.lineWidth=lw||.05; c.strokeStyle=stroke; c.stroke(); }
}
function label(x, y, text, color, bg, sc=1){
  ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0);
  const px = PAD + x*S + shx, py = PAD + y*S + shy;
  const fs = Math.max(11, S*.42)*sc;
  ctx.font = `700 ${fs}px "IM Fell English", Georgia, serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
  if(bg){ const w = ctx.measureText(text).width + fs*.7; ctx.fillStyle=bg; ctx.beginPath(); ctx.roundRect(px-w/2,py-fs*.62,w,fs*1.24,fs*.3); ctx.fill(); ctx.lineWidth=1; ctx.strokeStyle='rgba(0,0,0,.6)'; ctx.stroke(); }
  else { ctx.lineWidth = 3; ctx.strokeStyle='rgba(10,8,6,.85)'; ctx.strokeText(text,px,py); }
  ctx.fillStyle=color; ctx.fillText(text,px,py+fs*.04);
  ctx.restore();
}

function zoneOutline(area, color, glow, lw){
  ctx.save();
  if(glow){ ctx.shadowColor = glow; ctx.shadowBlur = 8*DPR; }
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  for(const a of area){
    const p = posOf(a.c,a.r), cc = center(a.c,a.r);
    for(let i=0;i<6;i++){
      const a1 = Math.PI/180*(60*i-90), a2 = Math.PI/180*(60*(i+1)-90);
      const nx = cc.x + (Math.cos(a1)+Math.cos(a2)), ny = cc.y + (Math.sin(a1)+Math.sin(a2));
      if(area.some(b => { const q = center(b.c,b.r); return Math.abs(q.x-nx)<.2 && Math.abs(q.y-ny)<.2; })) continue;
      ctx.beginPath(); ctx.moveTo(p.x+Math.cos(a1)*.97,p.y+Math.sin(a1)*.97); ctx.lineTo(p.x+Math.cos(a2)*.97,p.y+Math.sin(a2)*.97); ctx.stroke();
    }
  }
  ctx.restore();
}
const ZONE = {
  attack:  {fill:'rgba(230,70,50,.2)',  line:'rgba(255,140,115,.95)', glow:'rgba(255,60,40,.8)'},
  ability: {fill:'rgba(255,150,50,.2)', line:'rgba(255,200,120,.95)', glow:'rgba(255,130,30,.8)'},
  watch:   {fill:'rgba(255,215,80,.2)', line:'rgba(255,230,140,.95)', glow:'rgba(255,200,40,.8)'},
  heal:    {fill:'rgba(110,230,150,.2)', line:'rgba(170,255,200,.95)', glow:'rgba(60,220,120,.8)'}
};
