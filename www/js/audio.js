'use strict';
/* Le Ceneri di Valdombra: audio.js */
/* ================= AUDIO: musica generativa ed effetti sintetizzati ================= */
const AUDIO = (() => {
  let ctx = null, master, musicBus, sfxBus, verb, noiseBuf;
  const S = Object.assign({music:true, sfx:true, vol:.7}, (()=>{ try{ return JSON.parse(localStorage.getItem('valdombra-audio')) || {}; }catch(e){ return {}; } })());
  const save = () => { try{ localStorage.setItem('valdombra-audio', JSON.stringify(S)); }catch(e){} };
  let want = null, track = null, nextT = 0, step = 0, timer = null;
  const mtof = m => 440 * Math.pow(2, (m-69)/12);

  function init(){
    const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = S.vol;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = S.sfx ? .9 : 0; sfxBus.connect(master);
    verb = ctx.createConvolver();
    const len = ctx.sampleRate*2.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for(let ch=0; ch<2; ch++){ const d = ir.getChannelData(ch); for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/len, 3); }
    verb.buffer = ir;
    const vg = ctx.createGain(); vg.gain.value = .32; verb.connect(vg); vg.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for(let i=0;i<nd.length;i++) nd[i] = Math.random()*2-1;
  }
  function unlock(){
    const first = !ctx;
    if(first) init(); if(!ctx) return;
    if(ctx.state==='suspended') ctx.resume().then(() => { if(want && !track) startTrack(want); });
    else if(first && want) startTrack(want);
  }

  /* --- strumenti --- */
  function env(g, t, a, peak, dur, rel=.08){
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t+a);
    g.gain.setValueAtTime(peak, t+Math.max(a, dur-rel)); g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
  }
  function out(node, bus, wet=.4){ node.connect(bus); if(wet){ const s = ctx.createGain(); s.gain.value = wet; node.connect(s); s.connect(verb); } }
  function osc(type, f, t, dur, peak, bus, {a=.01, rel=.1, wet=.3, cutoff=0, q=.7, detune=0, glide=0}={}){
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune;
    if(glide) o.frequency.exponentialRampToValueAtTime(glide, t+dur);
    let n = o;
    if(cutoff){ const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cutoff; fl.Q.value = q; o.connect(fl); n = fl; }
    n.connect(g); env(g, t, a, peak, dur, rel); out(g, bus, wet); o.start(t); o.stop(t+dur+.05);
    return o;
  }
  function noise(t, dur, peak, bus, {type='lowpass', f=1000, q=.7, f2=0, a=.005, wet=.2}={}){
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q; if(f2) fl.frequency.exponentialRampToValueAtTime(f2, t+dur);
    s.connect(fl); fl.connect(g); env(g, t, a, peak, dur, dur*.6); out(g, bus, wet); s.start(t, Math.random()*.5); s.stop(t+dur+.05);
  }
  function pluck(m, t, vel=1, bus=musicBus){
    const f = mtof(m), dur = 1.6;
    const fl = ctx.createBiquadFilter(), g = ctx.createGain(); fl.type = 'lowpass'; fl.Q.value = 2;
    fl.frequency.setValueAtTime(3200, t); fl.frequency.exponentialRampToValueAtTime(500, t+.35);
    for(const [type, det, lv] of [['triangle',0,1],['sawtooth',7,.25]]){ const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det; const og = ctx.createGain(); og.gain.value = lv; o.connect(og); og.connect(fl); o.start(t); o.stop(t+dur); }
    fl.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16*vel, t+.006); g.gain.exponentialRampToValueAtTime(.0001, t+dur);
    out(g, bus, .45);
  }
  function pad(ms, t, dur, peak=.05, cutoff=650){
    for(const m of ms) for(const det of [-8, 8]) osc('sawtooth', mtof(m), t, dur, peak, musicBus, {a:dur*.35, rel:dur*.4, wet:.6, cutoff, detune:det});
  }
  function flute(m, t, dur, vel=1){
    const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'sine'; o.frequency.value = mtof(m); lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(mtof(m)*.006, t+.35);
    lfo.connect(lg); lg.connect(o.frequency); o.connect(g); env(g, t, .09, .07*vel, dur, .25); out(g, musicBus, .7);
    o.start(t); lfo.start(t); o.stop(t+dur+.05); lfo.stop(t+dur+.05);
    noise(t, .12, .012*vel, musicBus, {type:'bandpass', f:mtof(m)*2, q:3, wet:.3});
  }
  function drum(t, vel=1, bus=musicBus){
    osc('sine', 110, t, .45, .5*vel, bus, {a:.003, rel:.3, wet:.25, glide:42});
    noise(t, .12, .12*vel, bus, {f:420, wet:.15});
  }
  function str(m, t, dur, vel=1){ osc('sawtooth', mtof(m), t, dur, .06*vel, musicBus, {a:.01, rel:dur*.5, wet:.35, cutoff:1100, q:1.5}); }
  function brass(m, t, dur, vel=1){
    for(const [type,det] of [['sawtooth',-6],['square',6]]){
      const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = type; o.frequency.value = mtof(m); o.detune.value = det;
      fl.type = 'lowpass'; fl.frequency.setValueAtTime(300, t); fl.frequency.exponentialRampToValueAtTime(1700, t+.12); fl.frequency.exponentialRampToValueAtTime(800, t+dur);
      o.connect(fl); fl.connect(g); env(g, t, .04, .045*vel, dur, .2); out(g, musicBus, .45); o.start(t); o.stop(t+dur+.05);
    }
  }

  /* --- brani --- */
  const DORIAN = [62,64,65,67,69,71,72,74,76,77,79,81];
  const TRACKS = {
    map:{ step:60/72/2, bars:[[50,53,57],[48,52,55],[46,50,53],[48,52,55]],
      play(i, t, sd){
        const bar = Math.floor(i/8) % 4, s = i % 8, ch = this.bars[bar];
        if(s===0){ pad(ch.map(m=>m-12), t, sd*8.2, .028); if(bar===0) osc('sine', mtof(38), t, sd*32, .05, musicBus, {a:3, rel:3, wet:.5}); }
        const tones = [ch[0], ch[1], ch[2], ch[0]+12, ch[2], ch[1]+12, ch[0]+12, ch[2]];
        if(Math.random() > .12) pluck(tones[s] + (s>4 && Math.random()<.2 ? 12 : 0), t, s%4===0 ? 1 : .65);
        if(s===0 && bar%2===0 && Math.random()<.65){ let n = DORIAN[3+Math.floor(Math.random()*5)]; for(let k=0;k<4;k++){ if(Math.random()<.8) flute(n, t + k*sd*2, sd*2.2, .9); n = DORIAN[Math.max(0, Math.min(DORIAN.length-1, DORIAN.indexOf(n) + [-2,-1,1,2][Math.floor(Math.random()*4)]))] || n; } }
      }},
    battle:{ step:60/100/2, bars:[[38,41,45],[34,38,41],[31,34,38],[33,37,40]],
      play(i, t, sd){
        const bar = Math.floor(i/8) % 4, s = i % 8, ch = this.bars[bar];
        if(s===0) pad(ch.map(m=>m+12), t, sd*8.1, .02, 500);
        const pat = [0,0,12,0,7,0,12,7];
        str(ch[0] + pat[s] + 12, t, sd*.8, s===0 ? 1.2 : .8);
        if([0,3,6].includes(s)) drum(t, s===0 ? 1 : .6);
        if(s===4) noise(t, .08, .05, musicBus, {type:'highpass', f:3000, wet:.1});
        if(this.boss && s===0 && bar%2===0) brass(ch[0]+24, t, sd*3, 1);
        if(this.boss && s===4 && bar%2===1) brass(ch[2]+24, t, sd*2.5, .8);
        if(!this.boss && s===0 && bar===2) flute(ch[2]+24, t, sd*4, .7);
      }},
  };
  TRACKS.boss = Object.assign(Object.create(TRACKS.battle), {step:60/112/2, boss:true});

  function scheduler(){
    if(!ctx || !track) return;
    const T = TRACKS[track];
    while(nextT < ctx.currentTime + .35){ T.play(step, nextT, T.step); nextT += T.step; step++; }
  }
  function startTrack(name){
    if(!ctx) { track = null; return; }
    const now = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(now); musicBus.gain.setValueAtTime(musicBus.gain.value, now); musicBus.gain.linearRampToValueAtTime(0, now+.7);
    clearInterval(timer); timer = null; track = null;
    if(!name || !S.music) return;
    setTimeout(() => {
      if(want!==name) return;
      track = name; step = 0; nextT = ctx.currentTime + .1;
      musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.setValueAtTime(0, ctx.currentTime); musicBus.gain.linearRampToValueAtTime(.55, ctx.currentTime+2.5);
      timer = setInterval(scheduler, 90); scheduler();
    }, 750);
  }
  function music(name){ if(name===want) return; want = name; if(ctx && ctx.state==='running' && name!==track) startTrack(name); }

  /* --- effetti --- */
  const FX = {
    click(t){ osc('triangle', 1200, t, .05, .05, sfxBus, {a:.002, rel:.03, wet:0, glide:900}); },
    select(t){ osc('sine', 880, t, .09, .07, sfxBus, {a:.003, wet:.1}); osc('sine', 1320, t+.05, .1, .05, sfxBus, {a:.003, wet:.1}); },
    step(t){ noise(t, .07, .08, sfxBus, {f:500+Math.random()*300, wet:.05}); },
    swing(t){ noise(t, .22, .18, sfxBus, {type:'bandpass', f:600, f2:2400, q:1.5, a:.05, wet:.1}); },
    bow(t){ osc('triangle', 180, t, .18, .18, sfxBus, {a:.002, wet:.1, glide:120}); noise(t+.02, .25, .1, sfxBus, {type:'bandpass', f:2500, f2:900, q:2, a:.02, wet:.1}); },
    zap(t){ osc('sawtooth', 1400, t, .3, .07, sfxBus, {a:.005, wet:.4, glide:300, cutoff:3000}); osc('sine', 700, t, .35, .08, sfxBus, {a:.01, wet:.5, glide:1600}); },
    hit(t){ noise(t, .15, .35, sfxBus, {f:900, wet:.15}); osc('sine', 150, t, .18, .3, sfxBus, {a:.002, wet:.1, glide:70}); },
    clang(t){ FX.hit(t); for(const f of [1850, 2630, 3400]) osc('sine', f, t, .5, .05, sfxBus, {a:.002, rel:.4, wet:.3}); },
    crit(t){ FX.clang(t); osc('square', 220, t, .3, .07, sfxBus, {a:.005, wet:.2, cutoff:1500, glide:110}); noise(t, .35, .25, sfxBus, {f:3000, f2:400, wet:.3}); },
    miss(t){ noise(t, .3, .12, sfxBus, {type:'bandpass', f:2000, f2:500, q:1, a:.04, wet:.2}); },
    death(t){ osc('sawtooth', 220, t, .7, .08, sfxBus, {a:.01, wet:.4, glide:55, cutoff:900}); noise(t, .4, .15, sfxBus, {f:400, wet:.2}); },
    bones(t){ for(let k=0;k<7;k++) noise(t+k*.045+Math.random()*.02, .04, .2, sfxBus, {type:'bandpass', f:1800+Math.random()*1500, q:4, wet:.2}); },
    fireLaunch(t){ noise(t, .5, .2, sfxBus, {f:400, f2:2200, a:.08, wet:.3}); osc('sawtooth', 90, t, .45, .06, sfxBus, {a:.05, wet:.3, glide:180, cutoff:600}); },
    boom(t){ osc('sine', 90, t, .9, .7, sfxBus, {a:.003, rel:.6, wet:.4, glide:30}); noise(t, 1.1, .5, sfxBus, {f:1800, f2:120, wet:.5}); },
    heal(t){ [76,81,84,88].forEach((m,k)=>osc('sine', mtof(m), t+k*.07, .5, .06, sfxBus, {a:.01, rel:.3, wet:.6})); },
    summon(t){ osc('sawtooth', 300, t, 1.2, .06, sfxBus, {a:.2, wet:.7, glide:60, cutoff:800}); osc('sine', 600, t, 1.2, .05, sfxBus, {a:.3, wet:.8, glide:110}); noise(t, 1, .12, sfxBus, {type:'bandpass', f:300, f2:2000, q:3, a:.3, wet:.6}); },
    ready(t){ osc('triangle', mtof(74), t, .15, .07, sfxBus, {a:.005, wet:.3}); osc('triangle', mtof(81), t+.08, .2, .07, sfxBus, {a:.005, wet:.3}); },
    alert(t){ osc('square', mtof(84), t, .12, .05, sfxBus, {a:.003, wet:.2, cutoff:2500}); osc('square', mtof(84), t+.14, .12, .05, sfxBus, {a:.003, wet:.2, cutoff:2500}); },
    chest(t){ [79,83,86,91,95].forEach((m,k)=>osc('triangle', mtof(m), t+k*.06, .35, .06, sfxBus, {a:.004, wet:.5})); },
    thud(t){ osc('sine', 80, t, .3, .5, sfxBus, {a:.002, wet:.2, glide:40}); noise(t, .2, .3, sfxBus, {f:300, wet:.2}); },
    turn(t){ osc('sine', mtof(62), t, 1.6, .08, sfxBus, {a:.005, rel:1.3, wet:.7}); osc('sine', mtof(69), t, 1.6, .05, sfxBus, {a:.005, rel:1.3, wet:.7}); },
    foeTurn(t){ drum(t, .9, sfxBus); drum(t+.18, .6, sfxBus); drum(t+.36, 1, sfxBus); },
    victory(t){ [62,66,69,74].forEach((m,k)=>brassFx(m, t+k*.16, .3)); brassFx(74, t+.7, 1.4); brassFx(78, t+.7, 1.4); brassFx(81, t+.7, 1.4); drum(t+.7, 1, sfxBus); },
    defeat(t){ [69,65,62,57].forEach((m,k)=>osc('triangle', mtof(m), t+k*.32, .6, .1, sfxBus, {a:.02, wet:.6, cutoff:1400})); drum(t+1.2, .8, sfxBus); },
    levelup(t){ [74,78,81,86,90].forEach((m,k)=>osc('triangle', mtof(m), t+k*.08, .45, .07, sfxBus, {a:.004, wet:.6})); FX.heal(t+.45); },
    travel(t){ for(let k=0;k<4;k++) FX.step(t+k*.22); },
    page(t){ noise(t, .25, .06, sfxBus, {type:'bandpass', f:3000, f2:1500, q:.8, a:.05, wet:.2}); },
    thunder(t){ noise(t, 2.6, .5, sfxBus, {f:500, f2:60, a:.05, wet:.6}); osc('sine', 55, t, 1.8, .25, sfxBus, {a:.05, rel:1.2, wet:.4, glide:35}); }
  };
  function brassFx(m, t, dur){
    for(const [type,det] of [['sawtooth',-5],['square',5]]){
      const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = type; o.frequency.value = mtof(m); o.detune.value = det;
      fl.type = 'lowpass'; fl.frequency.setValueAtTime(400, t); fl.frequency.exponentialRampToValueAtTime(2200, t+.08); fl.frequency.exponentialRampToValueAtTime(1100, t+dur);
      o.connect(fl); fl.connect(g); env(g, t, .02, .05, dur, .25); out(g, sfxBus, .45); o.start(t); o.stop(t+dur+.05);
    }
  }
  function sfx(name, delay=0){
    if(!ctx || !S.sfx || ctx.state!=='running' || !FX[name]) return;
    try{ FX[name](ctx.currentTime + .01 + delay); }catch(e){}
  }
  function set(k, v){
    S[k] = v; save();
    if(!ctx) return;
    if(k==='vol') master.gain.setTargetAtTime(v, ctx.currentTime, .05);
    if(k==='sfx') sfxBus.gain.setTargetAtTime(v ? .9 : 0, ctx.currentTime, .05);
    if(k==='music'){ if(v){ track = null; startTrack(want); } else startTrack(null); }
  }
  return {unlock, music, sfx, set, settings:S, debug:()=>({state: ctx ? ctx.state : null, track, want, gain: musicBus ? musicBus.gain.value : 0})};
})();
const sfx = (n, d) => AUDIO.sfx(n, d);
