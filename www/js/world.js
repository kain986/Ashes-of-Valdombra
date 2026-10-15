'use strict';
/* Le Ceneri di Valdombra: world.js */
/* ================= MONDO ================= */
const NODES = {
  campo:{name:'Campo della Lanterna', x:500, y:2720, type:'town', desc:'Il vostro punto di partenza: un fuoco, tre giacigli e lo stendardo dell\'Ordine.'},
  guado:{name:'Guado delle Ceneri', x:420, y:2600, type:'story'},
  mulino:{name:'Mulino di Brenno', x:660, y:2540, type:'story'},
  strada:{name:'Strada dei Corvi', x:520, y:2450, type:'story'},
  corvara:{name:'Corvara', x:330, y:2380, type:'story', town:4, desc:'Il villaggio liberato: ora è la vostra base.'},
  pontePietra:{name:'Ponte del Mercante', x:470, y:2300, type:'story'},
  gola:{name:'Gola delle Zanne', x:690, y:2290, type:'story'},
  zanne:{name:'Colle delle Zanne', x:860, y:2210, type:'story'},
  cimitero:{name:'Cimitero di Vallescura', x:600, y:2160, type:'story'},
  palude:{name:'Palude delle Lanterne', x:330, y:2070, type:'story'},
  santuario:{name:'Santuario Sommerso', x:140, y:1990, type:'story'},
  tele:{name:'Bosco delle Tele', x:330, y:1930, type:'story'},
  nido:{name:'Nido della Tessitrice', x:160, y:1830, type:'story'},
  velharun:{name:'Rovine di Vel\'Harun', x:470, y:1840, type:'story'},
  biblioteca:{name:'Biblioteca Sommersa', x:650, y:1930, type:'story'},
  torre:{name:'Torre dell\'Ombra', x:850, y:1840, type:'story'},
  cripta:{name:'Cripta dei Re', x:640, y:1720, type:'story'},
  carri:{name:'Strada dei Carri', x:560, y:1610, type:'story'},
  porte:{name:'Porte di Khar-Dum', x:800, y:1560, type:'story'},
  gallerie:{name:'Gallerie Profonde', x:880, y:1440, type:'story'},
  forgia:{name:'Forgia dei Sigilli', x:720, y:1380, type:'story'},
  lago:{name:'Lago Nero', x:430, y:1460, type:'story'},
  pietrabianca:{name:'Pietrabianca', x:210, y:1420, type:'story'},
  aurel:{name:'Rovine di Aurel', x:360, y:1300, type:'story'},
  abbazia:{name:'Abbazia della Lanterna', x:580, y:1220, type:'story'},
  passo:{name:'Passo del Gelo', x:620, y:1090, type:'story'},
  lamenti:{name:'Valle dei Lamenti', x:840, y:1000, type:'story'},
  frostal:{name:'Frostal', x:640, y:930, type:'story'},
  ghiacciaio:{name:'Il Ghiacciaio', x:420, y:900, type:'story'},
  torreNord:{name:'Torre del Nord', x:200, y:820, type:'story'},
  boscoMuto:{name:'Bosco Muto', x:400, y:720, type:'story'},
  ponteSpezzato:{name:'Ponte Spezzato', x:650, y:650, type:'story'},
  campoCerchio:{name:'Accampamento del Cerchio', x:600, y:540, type:'story'},
  piana:{name:'Piana di Cenere', x:390, y:450, type:'story'},
  porteCerchio:{name:'Porte del Cerchio', x:610, y:345, type:'story'},
  cerchio:{name:'Cerchio di Morvane', x:440, y:250, type:'story'},
  cittaSepolta:{name:'Città Sepolta', x:240, y:160, type:'story'},
  sale:{name:'Sale del Re', x:500, y:90, type:'story'},
  trono:{name:'Trono di Cenere', x:760, y:110, type:'story'},
  /* luoghi secondari */
  tana:{name:'Tana dei Lupi', x:880, y:2620, type:'side', repeat:true, unlock:2, biome:'bosco', pool:['lupo','lupo','goblin','gArcher'], minLevel:1,
        desc:'Una grotta nel bosco dove si radunano lupi e goblin sbandati. Torna quando vuoi: c\'è sempre qualcuno da scacciare.'},
  predoni:{name:'Accampamento predone', x:140, y:2480, type:'side', repeat:true, unlock:4, biome:'colline', pool:['goblin','goblin','gArcher','shaman','orc'], minLevel:2,
        desc:'Bande di goblin che vivono di razzie. Ripulirlo frutta esperienza e qualche oggetto.'},
  vedetta:{name:'Torre di vedetta', x:150, y:2290, type:'side', unlock:4, biome:'torre', level:3, foes:['gArcher','gArcher','gArcher','goblin','goblin','orc'], unique:'arcoL',
        desc:'Una vecchia torre occupata da tiratori goblin. Dicono che il loro capo abbia un arco elfico.'},
  fosse:{name:'Fosse dei Morti', x:820, y:2070, type:'side', repeat:true, unlock:8, biome:'cimitero', pool:['skel','skel','skelA','ghoul','cult'], minLevel:4,
        desc:'Fosse comuni della vecchia guerra. I morti continuano a uscirne finché il Cerchio è attivo.'},
  antro:{name:'Antro dei Ragni', x:80, y:1700, type:'side', repeat:true, unlock:12, biome:'bosco', pool:['ragno','ragno','cult','lupo'], minLevel:5,
        desc:'I figli della Tessitrice si sono rifugiati in questa grotta. Le loro sete valgono qualcosa, a Corvara.'},
  isola:{name:'Isola dei Canneti', x:310, y:1740, type:'side', unlock:13, biome:'palude', level:6, foes:['wraith','wraith','adept','skel','skel','skelA'], unique:'frammento',
        desc:'Un santuario sommerso dai canneti. Custodisce un frammento di un sigillo molto più antico.'},
  miniera:{name:'Miniera dei Grigi', x:940, y:1270, type:'side', unlock:20, biome:'miniera', level:9, foes:['golem','golem','ghoul','ghoul','troll','skelA'], unique:'cuoioNano',
        desc:'Una miniera nanica abbandonata. In fondo, dice Brokk, c\'è ancora l\'armeria dei suoi avi.'},
  ponteTroll:{name:'Ponte dei Troll', x:150, y:1580, type:'side', repeat:true, unlock:17, biome:'colline', pool:['troll','goblin','gArcher','lupo','ghoul'], minLevel:7,
        desc:'Un vecchio ponte di pietra dove i troll chiedono pedaggio. Si paga in sangue, o in esperienza.'},
  branco:{name:'Gola dei Lupi Bianchi', x:910, y:820, type:'side', repeat:true, unlock:26, biome:'passo', pool:['lupo','wraith','wraith','ghoul','skelA','troll'], minLevel:10,
        desc:'Una gola gelata dove gli spettri vagano tra i lupi. Avversari duri, ricompense migliori.'},
  santuarioGelo:{name:'Santuario del Gelo', x:110, y:1000, type:'side', unlock:28, biome:'passo', level:12, foes:['wraith','wraith','ashKnight','adept','skelA','skelA'], unique:'elmoGelo',
        desc:'Un antico eremo dei Silvani, sepolto nella neve. Lyra dice che vi si conservava l\'armatura di un loro eroe.'},
  campiCenere:{name:'Campi di Cenere', x:880, y:450, type:'side', repeat:true, unlock:33, biome:'cenere', pool:['ashKnight','ghoul','wraith','skelA','cult'], minLevel:13,
        desc:'Distese di cenere dove i resti dell\'esercito del Re continuano a combattere una guerra finita.'}
};
const LINKS = [['campo','guado'],['guado','mulino'],['guado','strada'],['mulino','strada'],['strada','corvara'],['corvara','pontePietra'],['pontePietra','gola'],['gola','zanne'],['zanne','cimitero'],
  ['cimitero','palude'],['palude','santuario'],['santuario','tele'],['palude','tele'],['tele','nido'],['nido','velharun'],['tele','velharun'],['velharun','biblioteca'],['biblioteca','torre'],['torre','cripta'],['velharun','cripta'],
  ['cripta','carri'],['carri','porte'],['porte','gallerie'],['gallerie','forgia'],['forgia','lago'],['carri','lago'],['lago','pietrabianca'],['pietrabianca','aurel'],['aurel','abbazia'],['lago','aurel'],
  ['abbazia','passo'],['passo','lamenti'],['lamenti','frostal'],['passo','frostal'],['frostal','ghiacciaio'],['ghiacciaio','torreNord'],['torreNord','boscoMuto'],['boscoMuto','ponteSpezzato'],
  ['ponteSpezzato','campoCerchio'],['campoCerchio','piana'],['piana','porteCerchio'],['porteCerchio','cerchio'],['cerchio','cittaSepolta'],['cittaSepolta','sale'],['sale','trono'],
  ['mulino','tana'],['corvara','predoni'],['corvara','vedetta'],['cimitero','fosse'],['nido','antro'],['velharun','isola'],['nido','isola'],['forgia','miniera'],['pietrabianca','ponteTroll'],
  ['lamenti','branco'],['ghiacciaio','santuarioGelo'],['torreNord','santuarioGelo'],['campoCerchio','campiCenere']];

/* ================= OGGETTI ================= */
const SLOTS = [['arma','Arma'],['armatura','Armatura'],['amuleto','Amuleto']];
const RARITY = {c:'comune', r:'raro', u:'unico'};
const ITEMS = {
  spadaT:{name:'Spada temprata', slot:'arma', cls:'knight', r:'c', mods:{aim:5, crit:5}},
  lama:{name:'Lama runica', slot:'arma', cls:'knight', r:'r', mods:{dmg:1, crit:10}},
  mannaia:{name:'Mannaia di Skarn', slot:'arma', cls:'knight', r:'u', mods:{dmg:2, aim:-5, crit:5}},
  spadaLanterna:{name:'Spada della Lanterna', slot:'arma', cls:'knight', r:'u', mods:{dmg:2, aim:10, holy:2}},
  arcoC:{name:'Arco del cacciatore', slot:'arma', cls:'archer', r:'c', mods:{crit:10}},
  tasso:{name:'Arco di tasso', slot:'arma', cls:'archer', r:'r', mods:{aim:10, dmg:1}},
  arcoL:{name:'Arco lungo elfico', slot:'arma', cls:'archer', r:'u', mods:{range:1, aim:10, crit:5}},
  arcoBosco:{name:'Arco di Ysa', slot:'arma', cls:'archer', r:'u', mods:{range:1, dmg:2, crit:15}},
  verga:{name:'Verga di frassino', slot:'arma', cls:'mage', r:'c', mods:{aim:10}},
  brace:{name:'Bastone di brace', slot:'arma', cls:'mage', r:'r', mods:{dmg:1, ab:1}},
  bastoneIlvar:{name:'Bastone di Ilvar', slot:'arma', cls:'mage', r:'u', mods:{ab:2, abCd:-1, aim:5}},
  mazzaF:{name:'Mazza del fedele', slot:'arma', cls:'priest', r:'c', mods:{aim:5, holy:1}},
  aspersorio:{name:'Aspersorio d\'argento', slot:'arma', cls:'priest', r:'r', mods:{ab:1, dmg:1}},
  scettroAlba:{name:'Scettro dell\'alba', slot:'arma', cls:'priest', r:'u', mods:{ab:2, holy:2, abRange:1}},
  martelloF:{name:'Martello da forgia', slot:'arma', cls:'dwarf', r:'c', mods:{dmg:1}},
  mazzaRune:{name:'Mazza runica', slot:'arma', cls:'dwarf', r:'r', mods:{dmg:1, crit:10}},
  martelloAvi:{name:'Martello degli Avi', slot:'arma', cls:'dwarf', r:'u', mods:{dmg:2, ab:2, armor:1}},
  giaco:{name:'Giaco di cuoio', slot:'armatura', r:'c', mods:{def:5, hp:2}},
  pelle:{name:'Pelle di lupo', slot:'armatura', r:'c', mods:{def:10}},
  cotta:{name:'Cotta di maglia', slot:'armatura', r:'r', mods:{armor:1}},
  mantello:{name:'Mantello elfico', slot:'armatura', r:'r', mods:{def:15}},
  corazza:{name:'Corazza di piastre', slot:'armatura', r:'r', mods:{armor:1, hp:3}},
  giacoBrina:{name:'Giaco della brina', slot:'armatura', r:'r', mods:{def:10, hp:3}},
  pellicciaOrso:{name:'Pelliccia d\'orso', slot:'armatura', r:'r', mods:{hp:5, def:5}},
  cappuccioRagno:{name:'Cappuccio di seta', slot:'armatura', r:'r', mods:{def:15, hp:2}},
  cuoioNano:{name:'Usbergo dei nani', slot:'armatura', r:'u', mods:{armor:2, hp:2}},
  vesteCerchio:{name:'Veste del Cerchio', slot:'armatura', r:'u', mods:{def:15, crit:10}},
  corazzaCenere:{name:'Corazza di cenere', slot:'armatura', r:'r', mods:{armor:1, def:10, hp:2}},
  elmoGelo:{name:'Armatura di Ysmar', slot:'armatura', r:'u', mods:{armor:1, def:15, hp:4}},
  vita:{name:'Amuleto di vita', slot:'amuleto', r:'c', mods:{hp:3}},
  falco:{name:'Pietra del falco', slot:'amuleto', r:'c', mods:{aim:10}},
  rapido:{name:'Talismano rapido', slot:'amuleto', r:'r', mods:{move:1}},
  sangue:{name:'Anello del sangue', slot:'amuleto', r:'r', mods:{crit:15}},
  occhio:{name:'Occhio di corvo', slot:'amuleto', r:'r', mods:{aim:5, crit:10}},
  sigillino:{name:'Sigillo di Ilvar', slot:'amuleto', r:'r', mods:{def:10, hp:2}},
  occhioGolem:{name:'Occhio di golem', slot:'amuleto', r:'r', mods:{armor:1}},
  lacrimaSilvana:{name:'Lacrima silvana', slot:'amuleto', r:'r', mods:{def:10, hp:4}},
  anelloRe:{name:'Anello dei Re', slot:'amuleto', r:'r', mods:{crit:10, aim:5, hp:2}},
  anelloRagno:{name:'Anello della Tessitrice', slot:'amuleto', r:'u', mods:{def:15, crit:10}},
  frammento:{name:'Frammento di sigillo', slot:'amuleto', r:'u', mods:{hp:5, def:10}},
  cuoreBosco:{name:'Cuore del bosco', slot:'amuleto', r:'u', mods:{hp:4, move:1}},
  sigilloSpezzato:{name:'Sigillo spezzato', slot:'amuleto', r:'u', mods:{ab:2, aim:5}},
  amuletoAlba:{name:'Amuleto dell\'alba', slot:'amuleto', r:'u', mods:{holy:2, aim:5}}
};
const LOOT_POOL = Object.keys(ITEMS).filter(k => ITEMS[k].r!=='u');
const MOD_NAMES = {aim:'% mira', def:' difesa', dmg:' danni', crit:'% critico', move:' movimento', armor:' armatura', range:' gittata', ab:' potenza dell\'abilità', abCd:' turni di ricarica', critDmg:' danni da critico', holy:' danni ai non morti', abRange:' portata dell\'abilità'};
function modsText(m){ return Object.entries(m).map(([k,v]) => (v>0?'+':'−')+Math.abs(v)+(k==='hp'?' vita':MOD_NAMES[k])).join(', '); }

/* ================= ABILITÀ ================= */
const SKILLS = {
  bastion:{name:'Bastione', mods:{def:15}, desc:'+15 difesa a sé e agli alleati accanto a lui.'},
  counter:{name:'Contrattacco', desc:'Quando un nemico lo attacca in corpo a corpo, risponde con un colpo da 2 danni.'},
  implacable:{name:'Implacabile', desc:'Dopo aver abbattuto un nemico recupera un\'azione, una volta per turno.'},
  oath:{name:'Furia del giuramento', mods:{dmg:1, crit:10}, desc:'+1 danni e +10% critico.'},
  shieldwall:{name:'Muro di scudi', mods:{ab:2, abCd:-1}, desc:'Colpo di scudo: +2 danni e un turno di ricarica in meno.'},
  vigor:{name:'Tempra d\'acciaio', mods:{hp:5, armor:1}, desc:'+5 vita e +1 armatura.'},
  holyblade:{name:'Lama consacrata', mods:{holy:3}, desc:'+3 danni contro i non morti.'},
  laststand:{name:'Ultimo baluardo', desc:'Sotto metà vita ottiene +20 difesa e +1 armatura.'},
  champion:{name:'Campione della Lanterna', mods:{hp:4, dmg:1, aim:5}, desc:'+4 vita, +1 danni e +5% mira.'},
  guardian:{name:'Guardiano', desc:'Gli alleati accanto a lui subiscono 1 danno in meno da ogni colpo.'},
  hawkeye:{name:'Occhio di falco', mods:{aim:10, range:1}, desc:'+10% mira e gittata +1.'},
  lightstep:{name:'Passo leggero', mods:{move:1}, desc:'+1 movimento.'},
  sentinel:{name:'Sentinella', desc:'I tiri di guardia non hanno penalità di mira.'},
  executioner:{name:'Giustiziera', desc:'+25% mira contro i nemici sotto metà vita.'},
  deadly:{name:'Tiro mortale', mods:{crit:20}, desc:'+20% critico.'},
  volley:{name:'Frecce barbate', mods:{ab:1, abCd:-1}, desc:'Freccia inchiodante: +1 danni e un turno di ricarica in meno.'},
  piercer:{name:'Freccia penetrante', desc:'I suoi tiri ignorano la mezza copertura.'},
  forestshade:{name:'Ombra del bosco', desc:'+25 difesa quando si trova in un bosco o tra le rovine.'},
  eagle:{name:'Occhio d\'aquila', mods:{range:1, crit:10}, desc:'Gittata +1 e +10% critico.'},
  windrunner:{name:'Corsa del vento', mods:{move:1, def:10}, desc:'+1 movimento e +10 difesa.'},
  livingflame:{name:'Fiamma viva', mods:{ab:1}, desc:'Palla di fuoco: +1 danni.'},
  healaura:{name:'Aura curativa', desc:'A inizio turno cura 2 vita agli alleati accanto a lei.'},
  channel:{name:'Canalizzare', mods:{abCd:-1}, desc:'Palla di fuoco: un turno di ricarica in meno.'},
  piercing:{name:'Dardo affilato', mods:{aim:10, dmg:1}, desc:'Dardo arcano: +10% mira e +1 danni.'},
  focus:{name:'Concentrazione', mods:{crit:15, critDmg:2}, desc:'+15% critico e i critici fanno 2 danni in più.'},
  shadowcloak:{name:'Mantello d\'ombra', mods:{def:20}, desc:'+20 difesa.'},
  sacredfire:{name:'Fuoco sacro', mods:{holy:3}, desc:'+3 danni contro i non morti, anche con la palla di fuoco.'},
  rebirth:{name:'Ultima scintilla', desc:'Una volta per battaglia, il primo alleato che cadrebbe resta in piedi con 1 vita.'},
  archmage:{name:'Arcimaga', mods:{ab:2, aim:10}, desc:'Palla di fuoco +2 danni, +10% mira.'},
  stormcall:{name:'Richiamo della tempesta', mods:{range:1, dmg:1}, desc:'Dardo arcano: gittata +1 e +1 danni.'},
  blessing:{name:'Benedizione', mods:{ab:1}, desc:'Luce sacra cura 1 vita in più.'},
  mace:{name:'Mazza consacrata', mods:{holy:2, dmg:1}, desc:'+1 danni, +2 contro i non morti.'},
  sanctuary:{name:'Santuario', desc:'Chi riceve Luce sacra ottiene anche −20% a essere colpito fino al suo prossimo turno.'},
  zeal:{name:'Zelo', mods:{aim:10, crit:10}, desc:'+10% mira e +10% critico.'},
  mercy:{name:'Misericordia', mods:{abCd:-1}, desc:'Luce sacra: un turno di ricarica in meno.'},
  aegis:{name:'Egida', mods:{armor:1, hp:4}, desc:'+1 armatura e +4 vita.'},
  radiance:{name:'Radianza', desc:'Luce sacra brucia anche i non morti accanto al bersaglio: 3 danni.'},
  pilgrim:{name:'Passo del pellegrino', mods:{move:1}, desc:'+1 movimento.'},
  miracle:{name:'Miracolo', mods:{ab:2, abRange:2}, desc:'Luce sacra: +2 cura e portata +2.'},
  lanternfire:{name:'Fuoco della Lanterna', mods:{holy:3, dmg:1}, desc:'+1 danni, +3 contro i non morti.'},
  ironskin:{name:'Pelle di ferro', mods:{armor:1}, desc:'+1 armatura.'},
  tremor:{name:'Scossa', mods:{ab:1}, desc:'Terremoto: +1 danni.'},
  stubborn:{name:'Testardo', desc:'Non può essere inchiodato né bloccato dalle ragnatele.'},
  berserk:{name:'Furia nanica', desc:'+2 danni quando è sotto metà vita.'},
  quarry:{name:'Spaccapietre', mods:{dmg:1, crit:10}, desc:'+1 danni e +10% critico.'},
  stonewall:{name:'Muro di pietra', mods:{def:10}, desc:'+10 difesa a sé e −15% a colpire gli alleati accanto a lui.'},
  aftershock:{name:'Onda d\'urto', mods:{abCd:-1}, desc:'Terremoto: un turno di ricarica in meno.'},
  mountain:{name:'Cuore di montagna', mods:{hp:6}, desc:'+6 vita.'},
  runehammer:{name:'Martello runico', mods:{dmg:2, holy:2}, desc:'+2 danni, +2 contro i non morti.'},
  avalanche:{name:'Valanga', desc:'Terremoto colpisce fino a 2 caselle di distanza.'}
};
const TREE = {
  knight:[['bastion','counter'],['implacable','oath'],['shieldwall','vigor'],['holyblade','laststand'],['champion','guardian']],
  archer:[['hawkeye','lightstep'],['sentinel','executioner'],['deadly','volley'],['piercer','forestshade'],['eagle','windrunner']],
  mage:[['livingflame','healaura'],['channel','piercing'],['focus','shadowcloak'],['sacredfire','rebirth'],['archmage','stormcall']],
  priest:[['blessing','mace'],['sanctuary','zeal'],['mercy','aegis'],['radiance','pilgrim'],['miracle','lanternfire']],
  dwarf:[['ironskin','tremor'],['stubborn','berserk'],['quarry','stonewall'],['aftershock','mountain'],['runehammer','avalanche']]
};
const RANK_LEVELS = [2,4,7,10,13];
const HERO_IDS = ['knight','archer','mage','priest','dwarf'];
const JOIN = {priest:10, dwarf:18};
const MAX_LEVEL = 15;
const xpForLevel = n => 90*n*(n-1);
function levelFromXp(xp){ let l = 1; while(l<MAX_LEVEL && xp >= xpForLevel(l+1)) l++; return l; }

/* ================= STATO DELLA CAMPAGNA ================= */
const SAVE_KEY = 'valdombra-campagna-v3';
let C = null;
function freshCampaign(){
  const h = {}; for(const id of HERO_IDS) h[id] = {skills:[], equip:{arma:null, armatura:null, amuleto:null}};
  return {chapter:0, at:'campo', xp:0, heroes:h, inventory:[], cleared:{}, runs:{}, seenRules:false, seen:{}};
}
function saveCampaign(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(C)); }catch(e){} }
function loadCampaign(){ try{ const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; }catch(e){ return null; } }
const partyLevel = () => levelFromXp(C.xp);
const activeHeroes = () => HERO_IDS.filter(id => !JOIN[id] || C.chapter >= JOIN[id]);
const pendingPromos = id => RANK_LEVELS.filter(l => partyLevel() >= l).length - C.heroes[id].skills.length;
function heroStats(id){
  const d = CLASSES[id], h = C.heroes[id], L = partyLevel();
  const s = {hp:d.hp + (L-1), armor:d.armor||0, def:d.def, aim:d.aim + Math.round(1.5*(L-1)), dmg:[...d.dmg], crit:d.crit, move:d.move, rmax:d.rmax, ab:0, abCd:0, critDmg:2, holy:d.holy||0, abRange:0};
  const add = m => { for(const k in m){ if(k==='dmg'){ s.dmg[0]+=m.dmg; s.dmg[1]+=m.dmg; } else if(k==='range') s.rmax += m.range; else s[k] = (s[k]||0) + m[k]; } };
  for(const [slot] of SLOTS){ const it = h.equip[slot]; if(it) add(ITEMS[it].mods); }
  for(const sk of h.skills) add(SKILLS[sk].mods || {});
  return s;
}
function nodeRevealed(id){
  const N = NODES[id];
  if(N.type==='town' && !N.town) return true;
  if(N.type==='side') return C.chapter >= N.unlock;
  const first = STORY.findIndex(s => s.node===id);
  return first >= 0 && first <= C.chapter;
}
function nodeChapters(id){ return STORY.map((s,i)=>i).filter(i => STORY[i].node===id); }

/* ================= GENERAZIONE DELLE MAPPE ================= */
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s){ let h = 2166136261; for(const ch of s){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const BIOMES = {
  prato:{f:6, r:5, h:3, u:2},
  campi:{f:3, r:3, h:2, u:7, a:4, pools:1},
  villaggio:{f:2, r:4, h:1, u:12, s:1},
  colline:{f:3, r:9, h:9},
  bosco:{f:18, r:5, h:2, u:1},
  cimitero:{f:1, r:5, u:13, a:5, s:1},
  palude:{f:8, pools:6, u:2},
  rovine:{r:7, u:12, h:2, s:1},
  torre:{r:8, u:9, h:3},
  cripta:{r:16, u:6},
  miniera:{r:15, u:5, h:2},
  forgia:{r:12, u:5, a:6, pools:1},
  passo:{r:11, h:11, f:2},
  fiume:{f:7, r:4, river:1},
  boscoMuto:{f:11, a:10, r:4},
  cenere:{a:16, r:7, u:4, h:2},
  cerchio:{r:13, u:4, h:2}
};
const passableT = t => TER[t].cost > 0;
function genMap(biome, seed){
  const B = BIOMES[biome] || BIOMES.prato;
  for(let attempt=0; attempt<80; attempt++){
    const R = mulberry32(seed + attempt*7919);
    const ri = n => Math.floor(R()*n);
    const m = Array.from({length:ROWS}, () => Array(COLS).fill('g'));
    if(B.river){
      let rr = 4 + ri(2); const gaps = new Set([1+ri(3), 4+ri(3)]);
      for(let c=0;c<COLS;c++){ if(!gaps.has(c)) m[rr][c] = 'w'; if(R()<.25 && rr<6 && !gaps.has(c)){ rr++; m[rr][c] = 'w'; } }
    }
    for(let k=0;k<(B.pools||0);k++){
      const c = ri(COLS), r = 2 + ri(6); m[r][c] = 'w';
      for(const n of neighbors(c,r)) if(R()<.4) m[n.r][n.c] = 'w';
    }
    const scatter = (t, n, cl) => { for(let k=0;k<n;k++){ const c = ri(COLS), r = 1 + ri(8); if(m[r][c]!=='g') continue; m[r][c] = t; if(R()<cl){ const nb = neighbors(c,r); const q = nb[ri(nb.length)]; if(m[q.r][q.c]==='g') m[q.r][q.c] = t; } } };
    scatter('r', B.r||0, .35); scatter('f', B.f||0, .5); scatter('h', B.h||0, .3); scatter('u', B.u||0, .2); scatter('a', B.a||0, .4);
    if(B.s) m[4+ri(2)][3+ri(2)] = 's';
    for(const [c,r] of [[1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[3,8],[4,8],[2,0],[3,0],[4,0],[5,0],[3,1],[4,1]]) if(!passableT(m[r][c])) m[r][c] = 'g';
    const seen = new Set([key(3,9)]), q = [{c:3,r:9}];
    while(q.length){ const cur = q.shift(); for(const n of neighbors(cur.c,cur.r)){ const k = key(n.c,n.r); if(seen.has(k) || !passableT(m[n.r][n.c])) continue; seen.add(k); q.push(n); } }
    let top = 0, bottom = 0;
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(passableT(m[r][c])){ if(!seen.has(key(c,r))) m[r][c] = (B.river||B.pools) ? 'w' : 'r'; else { if(r<=2) top++; if(r>=8) bottom++; } }
    if(seen.size < 46 || top < 10 || bottom < 9) continue;
    return {map: m.map(r=>r.join('')), reach: seen};
  }
  return {map: HANDMADE.guado.map, reach: null};
}
function reachOf(map){
  const seen = new Set([key(3,9)]), q = [{c:3,r:9}];
  while(q.length){ const cur = q.shift(); for(const n of neighbors(cur.c,cur.r)){ const k = key(n.c,n.r); if(seen.has(k) || !passableT(map[n.r][n.c])) continue; seen.add(k); q.push(n); } }
  return seen;
}
function placeUnits(map, reach, foes, seed, opt={}){
  const R = mulberry32(seed ^ 0x9e3779b9);
  const ok = (c,r,taken) => passableT(map[r][c]) && (!reach || reach.has(key(c,r))) && !taken.has(key(c,r));
  const taken = new Set(), heroes = [];
  let npc = null;
  if(opt.npc){
    const cand = []; for(const r of [9,8]) for(let c=1;c<7;c++) if(ok(c,r,taken)) cand.push({c,r,d:Math.abs(c-3.5)+(9-r)*.4+R()*.3});
    cand.sort((a,b)=>a.d-b.d); if(cand[0]){ npc = [cand[0].c, cand[0].r]; taken.add(key(npc[0],npc[1])); }
  }
  for(const h of (opt.fixed||[])){ if(heroes.length >= opt.n) break; if(ok(h[0],h[1],taken)){ heroes.push(h); taken.add(key(h[0],h[1])); } }
  const hs = []; for(const r of [9,8,7]) for(let c=0;c<COLS;c++) hs.push({c,r,d:Math.abs(c-3.5)+(9-r)*.6+R()*.3});
  hs.sort((a,b)=>a.d-b.d);
  for(const s of hs){ if(heroes.length >= opt.n) break; if(ok(s.c,s.r,taken)){ heroes.push([s.c,s.r]); taken.add(key(s.c,s.r)); } }
  const out = [];
  if(opt.fixedFoes){ for(const f of opt.fixedFoes){ if(ok(f[1],f[2],taken)){ out.push(f); taken.add(key(f[1],f[2])); } } }
  else {
    const order = [...foes].sort((a,b)=> (CLASSES[b].leader?1:0)-(CLASSES[a].leader?1:0));
    for(const cls of order){
      const d = CLASSES[cls];
      let rows = d.leader ? [0,1] : d.rmax>1 ? [0,1,2] : [1,2,3,0];
      if(opt.escape) rows = d.rmax>1 ? [2,3,4] : [3,4,2,5];
      const cand = [];
      for(const r of rows) for(let c=0;c<COLS;c++) if(ok(c,r,taken)) cand.push({c,r,w:R() + (d.leader?-Math.abs(c-3.5)*.3:0) - rows.indexOf(r)*.15});
      cand.sort((a,b)=>b.w-a.w);
      const s = cand[0]; if(!s) continue;
      out.push([cls, s.c, s.r]); taken.add(key(s.c,s.r));
    }
  }
  let chest = null;
  const chestCand = []; for(let r=3;r<=6;r++) for(const c of [0,1,6,7]) if(ok(c,r,taken)) chestCand.push([c,r]);
  if(chestCand.length) chest = chestCand[Math.floor(R()*chestCand.length)];
  return {heroes, foes: out, chest, npc};
}
function rollLoot(level, R){
  const pool = LOOT_POOL.filter(k => ITEMS[k].r==='c' || level >= 3);
  const weights = pool.map(k => ITEMS[k].r==='c' ? Math.max(1, 6-level) : 2 + level*.4);
  let t = R()*weights.reduce((a,b)=>a+b,0);
  for(let i=0;i<pool.length;i++){ t -= weights[i]; if(t<=0) return pool[i]; }
  return pool[0];
}
function buildMission(kind, ref){
  const n = activeHeroes().filter(id => !(kind==='story' && STORY[ref].obj && STORY[ref].obj.npc===id)).length;
  if(kind==='story'){
    const S = STORY[ref], seed = 1000 + ref*101, obj = S.obj || {type:'kill'};
    let map, reach, p;
    if(S.hand){
      const H = HANDMADE[S.hand]; map = H.map; reach = reachOf(map);
      p = placeUnits(map, reach, [], seed, {n, fixed:H.heroes, fixedFoes:H.foes, npc:obj.npc});
      if(H.chest) p.chest = H.chest;
    } else {
      const g = genMap(S.biome, seed); map = g.map; reach = g.reach;
      p = placeUnits(map, reach, S.foes, seed, {n, npc:obj.npc, escape:obj.type==='escape'});
    }
    return {kind, ref, title:S.title, level:S.level, biome:S.biome || (S.hand && HANDMADE[S.hand].biome), time:S.time||'giorno', weather:S.weather||null, obj,
      map, heroes:p.heroes, foes:p.foes, npc:p.npc, chest: S.chestItem && p.chest ? [...p.chest, S.chestItem] : null};
  }
  const N = NODES[ref], run = (C.runs[ref]||0), seed = hashStr(ref) + run*977;
  const R = mulberry32(seed);
  const level = N.repeat ? Math.max(N.minLevel, partyLevel()) : N.level;
  let foes = N.foes;
  if(!foes){ const k = Math.min(9, 3 + n + Math.floor(level/4)); foes = Array.from({length:k}, () => N.pool[Math.floor(R()*N.pool.length)]); }
  const times = ['giorno','giorno','tramonto','notte','alba'];
  const g = genMap(N.biome, seed), p = placeUnits(g.map, g.reach, foes, seed, {n});
  const chestItem = N.unique ? null : (R() < .6 ? rollLoot(level, R) : null);
  return {kind, ref, biome:N.biome, title:N.name, level, time:times[Math.floor(R()*times.length)], weather:N.biome==='passo'?'neve':N.biome==='cenere'?'cenere':null, obj:{type:'kill'},
    map:g.map, heroes:p.heroes, foes:p.foes, npc:null, chest: chestItem && p.chest ? [...p.chest, chestItem] : null};
}

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
