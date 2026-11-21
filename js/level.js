'use strict';

/* ============================================================
   CÓDIGO VERDE — construção das fases do CEPK
   ============================================================ */

const TILE_EMPTY = 0;
const TILE_SOLID = 1;
const TILE_SPIKE = 2;
const TILE_LASER = 3;

class LevelBuilder {
  constructor(cfg) {
    this.cfg = cfg;
    this.w = cfg.width;
    this.h = cfg.height || 22;
    this.tiles = new Uint8Array(this.w * this.h);
    this.entities = [];
  }

  set(x, y, t) {
    if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
      this.tiles[y * this.w + x] = t;
    }
  }

  solid(x, y, w = 1, h = 1) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, TILE_SOLID);
    return this;
  }

  ground(x, w) {
    return this.solid(x, 18, w, 4);
  }

  spikes(x, y, w = 1, h = 1) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, TILE_SPIKE);
    return this;
  }

  laser(x, y, w = 1, h = 1) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, TILE_LASER);
    return this;
  }

  add(kind, tx, ty, data = {}) {
    this.entities.push({ kind, tx, ty, ...data });
    return this;
  }

  spawn(tx, ty) { return this.add('spawn', tx, ty); }
  crate(tx, ty) { return this.add('crate', tx, ty); }
  enemy(tx, ty, data = {}) { return this.add('walker', tx, ty, data); }
  drone(tx, ty, data = {}) { return this.add('drone', tx, ty, data); }
  turret(tx, ty, data = {}) { return this.add('turret', tx, ty, data); }
  charger(tx, ty, data = {}) { return this.add('charger', tx, ty, data); }
  swooper(tx, ty, data = {}) { return this.add('swooper', tx, ty, data); }
  spring(tx, ty, data = {}) { return this.add('spring', tx, ty, data); }
  mover(tx, ty, w = 3, data = {}) { return this.add('mover', tx, ty, { w, ...data }); }
  crumble(tx, ty, w = 3, data = {}) {
    this.solid(tx, ty, w, 1);
    return this.add('crumble', tx, ty, { w, ...data });
  }
  clue(tx, ty, clue = '') { return this.add('clue', tx, ty, { clue }); }
  kennedito(tx, ty) { return this.add('kennedito', tx, ty); }
  gear(tx, ty) { return this.add('gear', tx, ty); }
  core(tx, ty) { return this.add('core', tx, ty); }
  checkpoint(tx, ty) { return this.add('checkpoint', tx, ty); }
  boss(tx, ty, cfg) { return this.add('boss', tx, ty, { boss: cfg }); }
  exit(tx, ty) { return this.add('exit', tx, ty); }
  gate(tx, ty, w, h, station = null, closed = true) {
    if (closed) this.solid(tx, ty, w, h);
    return this.add('gate', tx, ty, { w, h, station, open: !closed });
  }

  build() {
    return new Level(this);
  }
}

class Level {
  constructor(builder) {
    const cfg = builder.cfg;
    this.id = cfg.id;
    this.name = cfg.name;
    this.short = cfg.short || cfg.name;
    this.subtitle = cfg.subtitle || '';
    this.theme = cfg.theme;
    this.story = cfg.story || [];
    this.cutscene = cfg.cutscene || [];
    this.bossCutscene = cfg.bossCutscene || [];
    this.arena = cfg.arena || null;
    this.hint = cfg.hint || '';
    this.bossCfg = cfg.boss || null;
    this.musicRoot = cfg.musicRoot || 55;
    this.musicMode = cfg.musicMode || 0;
    this.tutorial = !!cfg.tutorial;
    this.stations = cfg.stations || [];
    this.w = builder.w;
    this.h = builder.h;
    this.tiles = builder.tiles;
    this.entities = builder.entities;
    this.gates = this.entities.filter((e) => e.kind === 'gate');
    this.widthPx = this.w * TILE;
    this.heightPx = this.h * TILE;
    this.time = 0;
    this.laserOn = true;
  }

  update(dt) {
    this.time += dt;
    this.laserOn = (this.time % 2.8) < 1.4;
  }

  tile(tx, ty) {
    if (tx < 0 || tx >= this.w) return TILE_SOLID;
    if (ty < 0 || ty >= this.h) return TILE_EMPTY;
    return this.tiles[ty * this.w + tx];
  }

  tileAtPx(px, py) {
    return this.tile(Math.floor(px / TILE), Math.floor(py / TILE));
  }

  isSolid(px, py) {
    return this.tileAtPx(px, py) === TILE_SOLID;
  }

  setTile(tx, ty, type) {
    if (tx >= 0 && tx < this.w && ty >= 0 && ty < this.h) {
      this.tiles[ty * this.w + tx] = type;
    }
  }

  isHazard(px, py) {
    const t = this.tileAtPx(px, py);
    return t === TILE_SPIKE || (t === TILE_LASER && this.laserOn);
  }

  solidRect(x, y, w, h) {
    const tx0 = Math.floor(x / TILE);
    const tx1 = Math.floor((x + w - 0.01) / TILE);
    const ty0 = Math.floor(y / TILE);
    const ty1 = Math.floor((y + h - 0.01) / TILE);
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        if (this.tile(tx, ty) === TILE_SOLID) return true;
      }
    }
    return false;
  }

  hazardRect(x, y, w, h) {
    const tx0 = Math.floor(x / TILE);
    const tx1 = Math.floor((x + w - 0.01) / TILE);
    const ty0 = Math.floor(y / TILE);
    const ty1 = Math.floor((y + h - 0.01) / TILE);
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = this.tile(tx, ty);
        if (t === TILE_SPIKE || (t === TILE_LASER && this.laserOn)) return true;
      }
    }
    return false;
  }

  openGate(gate) {
    if (gate.open) return;
    gate.open = true;
    for (let y = 0; y < gate.h; y++) {
      for (let x = 0; x < gate.w; x++) {
        const tx = gate.tx + x;
        const ty = gate.ty + y;
        if (tx >= 0 && tx < this.w && ty >= 0 && ty < this.h) {
          this.tiles[ty * this.w + tx] = TILE_EMPTY;
        }
      }
    }
  }

  closeGate(gate) {
    if (!gate.open) return;
    gate.open = false;
    for (let y = 0; y < gate.h; y++) {
      for (let x = 0; x < gate.w; x++) {
        const tx = gate.tx + x;
        const ty = gate.ty + y;
        if (tx >= 0 && tx < this.w && ty >= 0 && ty < this.h) {
          this.tiles[ty * this.w + tx] = TILE_SOLID;
        }
      }
    }
  }
}

/* ------------------------------ TEMAS DO CEPK ------------------------------ */

const THEMES = {
  training: {
    kind: 'training',
    skyTop: '#080d1c', skyBottom: '#1a2a4a', bg: '#0a101d',
    far: '#0e1729', mid: '#18243c', near: '#283a56',
    tileTop: '#56667c', tile: '#242e3d', tileDark: '#121925', edge: '#93a3b8',
    floor: '#3c4759', floorLight: '#66788e', floorJoint: '#1d2634',
    wall: '#283344', wallLight: '#3d4d63', wallDark: '#141c28',
    accent: '#6dff9e', glow: '#dbe8ff', hazard: '#ff5a6c',
    warm: '#ffbf6b', cool: '#8fb8ff', metal: '#7589a3', wood: '#7a5a3a',
    shadow: '#060a12'
  },
  school: {
    kind: 'courtyard',
    skyTop: '#060a18', skyBottom: '#18214a', bg: '#090f20',
    far: '#0d152b', mid: '#18213d', near: '#283454',
    tileTop: '#5b6a82', tile: '#272e3e', tileDark: '#151b28', edge: '#8d9db5',
    floor: '#394356', floorLight: '#607089', floorJoint: '#1e2635',
    wall: '#293147', wallLight: '#3f4c68', wallDark: '#151b2a',
    accent: '#6dff9e', glow: '#dbe8ff', hazard: '#ff5a5a',
    warm: '#ffb45e', cool: '#93b4ff', metal: '#7286a2', wood: '#7a5a3a',
    shadow: '#060a14'
  },
  hall: {
    kind: 'hall',
    skyTop: '#071219', skyBottom: '#12303a', bg: '#081117',
    far: '#0c1f27', mid: '#16333d', near: '#224c58',
    tileTop: '#918b78', tile: '#3c3f3a', tileDark: '#20231f', edge: '#bcb39d',
    floor: '#52534a', floorLight: '#8f8977', floorJoint: '#2b2e29',
    wall: '#1f3c45', wallLight: '#32606b', wallDark: '#102329',
    accent: '#5dffb0', glow: '#d8f4f0', hazard: '#ff6b4a',
    warm: '#ffcf87', cool: '#8fe0e8', metal: '#7a9299', wood: '#7a5636',
    shadow: '#050c10'
  },
  gym: {
    kind: 'gym',
    skyTop: '#100b12', skyBottom: '#261a18', bg: '#130e0e',
    far: '#1e1512', mid: '#33231e', near: '#4a3329',
    tileTop: '#b07c46', tile: '#4a3424', tileDark: '#2a1c12', edge: '#e0b075',
    floor: '#8a5f36', floorLight: '#c08a50', floorJoint: '#5b3c22',
    wall: '#3a2f28', wallLight: '#5c4b3d', wallDark: '#211a16',
    accent: '#6dff9e', glow: '#ffe9c0', hazard: '#ff7a3c',
    warm: '#ffd27a', cool: '#9fd4ff', metal: '#8a8f96', wood: '#8a5f36',
    maroon: '#5a2430', gold: '#ffcf6d', shadow: '#0a0706'
  },
  lab: {
    kind: 'lab',
    skyTop: '#050b14', skyBottom: '#0b2033', bg: '#06101a',
    far: '#0a1826', mid: '#102a40', near: '#183c58',
    tileTop: '#6f879c', tile: '#2b3947', tileDark: '#16202a', edge: '#a4bed2',
    floor: '#394756', floorLight: '#64798c', floorJoint: '#202a35',
    wall: '#12304a', wallLight: '#1d4a6b', wallDark: '#081a2b',
    accent: '#4fffd0', glow: '#c8f4ff', hazard: '#ff5d7a',
    warm: '#ffb066', cool: '#8fe4ff', metal: '#7d94a8', wood: '#6a4a30',
    shadow: '#040a10'
  },
  office: {
    kind: 'office',
    skyTop: '#140a10', skyBottom: '#2a141c', bg: '#150b11',
    far: '#200e14', mid: '#351720', near: '#4e2230',
    tileTop: '#7c5a4a', tile: '#3b242a', tileDark: '#1f1114', edge: '#b08a6a',
    floor: '#4a2a2c', floorLight: '#7a4a42', floorJoint: '#2a1417',
    wall: '#341b24', wallLight: '#552b37', wallDark: '#1c0e13',
    accent: '#6dff9e', glow: '#ffe0b0', hazard: '#ff5d6c',
    warm: '#ffcf87', cool: '#b48cff', metal: '#9a7b63', wood: '#6a3a2c',
    gold: '#ffcf6d', shadow: '#0d0609'
  }
};

/* ------------------------------ TREINAMENTO ------------------------------ */

function tutorialLevel() {
  const b = new LevelBuilder({
    id: 0,
    name: 'Treinamento',
    short: 'Treinamento',
    subtitle: 'Aprenda no pátio',
    width: 100,
    height: 22,
    theme: THEMES.training,
    musicRoot: 58,
    musicMode: 0,
    tutorial: true,
    hint: '',
    stations: [
      { action: 'move', label: 'MOVER', key: 'A / D', tx: 7, ty: 17 },
      { action: 'jump', label: 'PULAR', key: 'ESPAÇO', tx: 16, ty: 17 },
      { action: 'double', label: 'PULO DUPLO', key: 'ESPAÇO ×2', tx: 32, ty: 17 },
      { action: 'dash', label: 'IMPULSO (SHIFT)', key: 'SHIFT', tx: 44, ty: 17 },
      { action: 'attack', label: 'GOLPE (8 lados)', key: 'J', tx: 54, ty: 17 },
      { action: 'shoot', label: 'ESTILINGUE', key: '2 + J', tx: 67, ty: 17 },
      { action: 'parry', label: 'PARRY (E)', key: 'E', tx: 80, ty: 17 },
      { action: 'exit', label: 'PORTAL', key: '→', tx: 96, ty: 17 }
    ]
  });

  // Pátio contínuo: nada de cair do mapa no tutorial.
  b.ground(0, 100);
  b.spawn(2, 17);

  // 1) MOVER — portão de energia
  b.gate(12, 11, 1, 7, 'move');

  // 2) PULAR — muro baixo de verdade
  b.solid(19, 16, 3, 2);
  b.gate(29, 11, 1, 7, 'jump');

  // 3) PULO DUPLO — barreira alta
  b.gate(37, 11, 1, 7, 'double');
  b.checkpoint(33, 17);

  // 4) IMPULSO — barreira que abre com o dash (SHIFT)
  b.gate(49, 11, 1, 7, 'dash');

  // 5) GOLPE — boneco de treino
  b.enemy(57, 17, { training: true, tag: 'melee', hp: 4 });
  b.gate(63, 11, 1, 7, 'attack');

  // 6) ESTILINGUE — alvo fixo imune a golpes, só cai com tiro
  b.drone(71, 17, { training: true, tag: 'shoot', hp: 2, fixed: true });
  b.gate(77, 11, 1, 7, 'shoot');
  b.checkpoint(74, 17);

  // 7) PARRY — orbe lento e parável (com janela perfeita de 0.14s)
  b.drone(85, 14, { training: true, tag: 'parry', parryTrainer: true, invulnerable: true, fixed: true });
  b.gate(91, 11, 1, 7, 'parry');

  // 8) PORTAL
  b.exit(96, 17);

  return b.build();
}

const TUTORIAL_LEVEL = tutorialLevel;

/* ------------------------------ FASE 1 ------------------------------ */

function level1() {
  const b = new LevelBuilder({
    id: 1,
    name: 'Pátio Central',
    short: 'Pátio',
    subtitle: 'Onde o sinal começou',
    width: 162,
    height: 22,
    theme: THEMES.school,
    musicRoot: 55,
    musicMode: 0,
    story: [
      'O sinal de emergência do CEPK disparou às 6h12.',
      'Você é VEGA, monitor de segurança da escola.',
      'O Sistema Verde trancou portões e corredores.',
      'Atravesse o pátio e alcance a diretoria.'
    ],
    cutscene: [
      {
        title: 'O SINAL',
        speaker: 'KENNEDITO',
        hint: 'VEGA! Acorde! O Sistema Verde tomou a escola. Precisamos sair daqui.',
        motif: 'gate',
        lines: [
          'O colégio amanhece vazio.',
          'As câmeras giram para você ao mesmo tempo.',
          'O Sistema Verde assumiu o CEPK.'
        ]
      },
      {
        title: 'PÁTIO',
        speaker: 'KENNEDITO',
        hint: 'Siga pelo patio. A e D para andar, ESPACO para pular.',
        motif: 'courtyard',
        lines: [
          'Grama, quadras e árvores. Tudo parado.',
          'Os alto-falantes repetem uma ordem: EVACUAR.',
          'Mas ninguém mais está aqui.'
        ]
      },
      {
        title: 'O CAMINHO',
        speaker: 'KENNEDITO',
        hint: 'Use o pulo duplo e o dash (SHIFT) para cruzar os vaos. O movimento abre as portas.',
        motif: 'module',
        lines: [
          'As portas se fecharam uma a uma.',
          'Pule, use o dash e abra espaço com as armas.',
          'O caminho até a diretoria começa agora.'
        ]
      },
      {
        title: 'RONDA TURRET',
        speaker: 'KENNEDITO',
        hint: 'A torre dispara tiros verdes. Aperte E no impacto para aparar e devolver.',
        motif: 'turret',
        lines: [
          'Uma torre verde surgiu no perímetro.',
          'Ela vigia o pátio e dispara projéteis paráveis.',
          'Use o parry para devolvê-las.'
        ]
      }
    ],
    bossCutscene: [
      {
        title: 'O PORTEIRO',
        speaker: 'KENNEDITO',
        hint: 'O Porteiro trancou o portao. Observe o aviso antes de cada golpe!',
        tag: 'CHEFE 1/5',
        motif: 'bossGuardian',
        lines: [
          'O portão se fecha atrás de você.',
          'A sombra do pátio se ergue do chão.',
          'O PORTEIRO finalmente saiu da guarita.'
        ]
      },
      {
        title: 'GUARDIÃO DO PÁTIO',
        speaker: 'KENNEDITO',
        hint: 'Ataque com J, apare com E e use o dash. A saida abre quando ele cair.',
        tag: 'ARENA DE COMBATE',
        motif: 'bossArena',
        lines: [
          'Investidas, ondas de choque e punhos de concreto.',
          'Apare os golpes marcados e devolva o impacto.',
          'A saída só abre quando ele cair.'
        ]
      }
    ],
    hint: 'SHIFT dá o impulso. E faz o parry. Use os dois para atravessar o pátio.',
    boss: { name: 'O PORTEIRO', hp: 48, speed: 62, color: '#6dff9e', w: 116, h: 122, style: 'guardian' },
    arena: { left: 107, right: 133, trigger: 109, exit: 138, ceiling: 11 }
  });

  b.ground(0, 20);
  b.solid(20, 21, 1); b.spikes(20, 20, 1);
  b.spawn(2, 17);
  b.enemy(16, 17, { variant: 'runner' });
  b.enemy(36, 17, { variant: 'brute' });
  b.enemy(56, 17, { variant: 'shield' });
  b.enemy(78, 17, { variant: 'stalker' });
  b.enemy(100, 17, { variant: 'samurai' });
  b.drone(68, 9, { variant: 'sniper' });
  b.solid(4, 14, 3);
  b.gear(5, 12);
  b.solid(9, 13, 3);
  b.gear(10, 11);
  b.crate(14, 17);
  b.crate(15, 17);
  b.crate(16, 17);

  // fosso do jardim: um salto longo e limpo, sem plataforma no meio
  b.solid(21, 21, 7);
  b.spikes(21, 20, 7);
  b.gear(25, 13);

  b.ground(28, 18);
  b.solid(46, 21, 6); b.spikes(46, 20, 6);
  b.solid(33, 13, 5);
  b.gear(35, 11);
  b.clue(36, 12, 'pista1');
  b.checkpoint(36, 17);
  b.spikes(43, 17, 2);

  b.solid(47, 15, 2);
  b.gear(47, 13);

  b.ground(52, 24);
  b.solid(54, 16, 4);
  b.solid(59, 13, 4);
  b.solid(64, 16, 4);
  b.gear(60, 11);
  b.core(65, 14);

  // Fosso largo: só o salto, sem mover nem ledge.
  b.solid(76, 21, 5);
  b.spikes(76, 20, 5);
  b.gear(78, 12);

  b.ground(81, 20);
  b.laser(84, 13, 1, 5);
  b.laser(92, 13, 1, 5);
  b.solid(87, 14, 3);
  b.gear(88, 12);
  b.spikes(95, 17, 3);

  // Crachá no chão, sem escada de plataformas.
  b.gear(97, 15);

  b.ground(101, 41);
  b.ground(142, 20);
  b.solid(104, 14, 3);
  b.gear(105, 12);
  b.checkpoint(104, 17);

  // Arena do chefe + sala de saída
  b.gate(107, 11, 2, 7, 'boss_arena', false);
  b.gate(133, 11, 2, 7, 'boss_exit', true);
  b.solid(107, 10, 35, 1);
  b.gear(130, 12);
  b.boss(117, 17, { name: 'O PORTEIRO', hp: 100, speed: 84, color: '#6dff9e', w: 116, h: 122, style: 'guardian' });
  b.exit(138, 17);

  return b.build();
}

/* ------------------------------ FASE 2 ------------------------------ */

function level2() {
  const b = new LevelBuilder({
    id: 2,
    name: 'Corredores',
    short: 'Corredores',
    subtitle: 'Depois do último sinal',
    width: 162,
    height: 22,
    theme: THEMES.hall,
    musicRoot: 58,
    musicMode: 1,
    story: [
      'Os corredores do CEPK viraram um labirinto.',
      'Monitores e câmeras patrulham cada esquina.',
      'Cada corredor tem um ritmo. Observe e avance.',
      'Chegue ao ginásio antes que as portas fechem.'
    ],
    cutscene: [
      {
        title: 'CORREDORES',
        speaker: 'KENNEDITO',
        hint: 'Os corredores estao vigiados. Mire com o mouse e atire com J.',
        motif: 'hall',
        lines: [
          'Armários verdes se alinham até o fim do corredor.',
          'As luzes piscam em um ritmo que não é humano.',
          'O Sistema Verde observa cada passo.'
        ]
      },
      {
        title: 'O SISTEMA',
        speaker: 'KENNEDITO',
        hint: 'O Sistema te observa. Aparar os tiros e o melhor caminho.',
        motif: 'observation',
        lines: [
          'Telas mostram sua ficha escolar.',
          'Nome: VEGA. Função: monitor.',
          'Status: ameaça.'
        ]
      },
      {
        title: 'A RONDA',
        speaker: 'KENNEDITO',
        hint: 'Espere a abertura e avance. O dash da um instante de invencibilidade.',
        motif: 'observation',
        lines: [
          'Drones cruzam o corredor em padrões fixos.',
          'Espere o momento certo e avance.',
          'O ginásio fica no fim do hall.'
        ]
      },
      {
        title: 'CORRIDOR CARREGADOR',
        speaker: 'KENNEDITO',
        hint: 'Carregadores atacam em linha reta. Desvie ou apare no momento certo.',
        motif: 'charger',
        lines: [
          'Um corredor bloqueado por um Carregador.',
          'Ele acelera quando vê o jogador.',
          'Use o parry para atordoá-lo e passar.'
        ]
      }
    ],
    bossCutscene: [
      {
        title: 'A INSPETORA',
        speaker: 'KENNEDITO',
        hint: 'A Inspetora e rapida com as laminas. Use dash e parry.',
        tag: 'CHEFE 2/5',
        motif: 'bossHunter',
        lines: [
          'As luzes do corredor morrem uma a uma.',
          'Uma silhueta alta se destaca no fim do hall.',
          'A INSPETORA já leu todos os seus movimentos.'
        ]
      },
      {
        title: 'CORREDOR SEM SAÍDA',
        speaker: 'KENNEDITO',
        hint: 'Nao fique parado. Ataque entre os golpes dela para abrir a saida.',
        tag: 'ARENA DE COMBATE',
        motif: 'bossArena',
        lines: [
          'Leques de lâminas, investidas e chuva de projéteis.',
          'Use o dash para abrir espaço e o parry para refletir.',
          'O corredor é dela. A saída é sua.'
        ]
      }
    ],
    hint: 'SHIFT dá o impulso e E faz o parry. Use o dash para escapar dos leques.',
    boss: { name: 'A INSPETORA', hp: 64, speed: 72, color: '#ffd24d', w: 112, h: 126, style: 'hunter' },
    arena: { left: 114, right: 140, trigger: 116, exit: 146, ceiling: 11 }
  });

  b.ground(0, 17);
  b.spawn(2, 17);
  b.enemy(16, 17, { variant: 'brute' });
  b.enemy(38, 17, { variant: 'shield' });
  b.enemy(62, 17, { variant: 'samurai' });
  b.enemy(86, 17, { variant: 'stalker' });
  b.enemy(108, 17, { variant: 'runner' });
  b.drone(96, 10, { variant: 'sniper' });
  b.solid(8, 14, 4);
  b.gear(9, 12);
  b.crate(14, 17);
  b.crate(15, 17);
  b.crate(16, 17);

  b.solid(17, 21, 8);
  b.spikes(17, 20, 8);

  b.ground(25, 22);
  b.solid(47, 21, 5); b.spikes(47, 20, 5);
  b.checkpoint(28, 17);
  b.solid(30, 15, 5);
  b.gear(31, 13);
  b.laser(37, 12, 1, 6);
  b.spikes(44, 17, 2);

  b.solid(47, 15, 2);
  b.gear(47, 13);

  b.ground(52, 25);
  b.solid(54, 16, 4);
  b.clue(55, 15, 'pista2');
  b.solid(60, 13, 4);
  b.solid(66, 16, 4);
  b.gear(61, 11);
  b.core(67, 14);
  b.laser(72, 13, 1, 5);
  b.crate(74, 17);
  b.crate(75, 17);

  // Fosso do hall: uma única plataforma no meio, rota óbvia.
  b.solid(77, 21, 12);
  b.spikes(77, 20, 12);
  b.solid(81, 15, 4);
  b.gear(82, 13);

  b.ground(89, 18);
  b.solid(88, 14, 4);
  b.gear(89, 12);
  b.spikes(98, 17, 2);
  b.laser(101, 13, 1, 5);
  b.checkpoint(103, 17);

  b.ground(107, 45);
  b.ground(152, 10);
  b.solid(110, 14, 3);

  // Arena do chefe + sala de saída
  b.gate(114, 11, 2, 7, 'boss_arena', false);
  b.gate(140, 11, 2, 7, 'boss_exit', true);
  b.solid(114, 10, 38, 1);
  b.gear(136, 12);
  b.boss(126, 17, { name: 'A INSPETORA', hp: 150, speed: 96, color: '#ffd24d', w: 112, h: 126, style: 'hunter' });
  b.exit(146, 17);

  return b.build();
}

/* ------------------------------ FASE 3 ------------------------------ */

function level3() {
  const b = new LevelBuilder({
    id: 3,
    name: 'Ginásio',
    short: 'Ginásio',
    subtitle: 'Jogo decisivo',
    width: 162,
    height: 22,
    theme: THEMES.gym,
    musicRoot: 62,
    musicMode: 2,
    story: [
      'O ginásio virou arena de treinamento do Sistema.',
      'As arquibancadas estão vazias, mas as máquinas não.',
      'Plataformas e refletores bloqueiam a quadra.',
      'Atravesse a quadra e alcance a ala técnica.'
    ],
    cutscene: [
      {
        title: 'GINÁSIO',
        speaker: 'KENNEDITO',
        hint: 'A quadra virou armadilha. Pule com cuidado e observe o chao.',
        motif: 'gym',
        lines: [
          'A quadra verde brilha sob os refletores.',
          'Cestas e traves se movem sozinhas.',
          'O placar marca uma partida sem fim.'
        ]
      },
      {
        title: 'TREINO',
        speaker: 'KENNEDITO',
        hint: 'Treine o golpe carregado: segure J para liberar o ataque forte.',
        motif: 'training',
        lines: [
          'Máquinas de treino ganharam vida.',
          'Elas não querem sua nota. Querem sua queda.',
          'A arquibancada inteira assiste.'
        ]
      },
      {
        title: 'ARQUIBANCADA',
        speaker: 'KENNEDITO',
        hint: 'As arquibancadas escondem inimigos. Olhe para cima antes de avancar.',
        motif: 'training',
        lines: [
          'As arquibancadas escondem refletores e armadilhas.',
          'O placar acompanha cada movimento seu.',
          'A ala técnica fica atrás da quadra.'
        ]
      },
      {
        title: 'SWOOPER NO GINÁSIO',
        speaker: 'KENNEDITO',
        hint: 'Swoopers mergulham do alto. Espere o mergulho e contra-atague.',
        motif: 'swooper',
        lines: [
          'Um Swooper patrulha o galpão.',
          'Ele mergulha do alto da arquibancada.',
          'Use o parry no timing certo para refletir.'
        ]
      }
    ],
    bossCutscene: [
      {
        title: 'O TÉCNICO',
        speaker: 'KENNEDITO',
        hint: 'O Tecnico e pesado e gira. Desvie das rochas e responda com o martelo.',
        tag: 'CHEFE 3/5',
        motif: 'bossBruiser',
        lines: [
          'O placar trava em 00:00.',
          'A arquibancada inteira prende a respiração.',
          'O TÉCNICO apita e entra na quadra.'
        ]
      },
      {
        title: 'QUADRA FECHADA',
        speaker: 'KENNEDITO',
        hint: 'O placar marca o fim do treino. O Tecnico cai e a ala tecnica abre.',
        tag: 'ARENA DE COMBATE',
        motif: 'bossArena',
        lines: [
          'Saltos, rochas e ondas de impacto sacodem o ginásio.',
          'O dash abre espaço. O parry devolve o impacto.',
          'Vença a partida e libere a ala técnica.'
        ]
      }
    ],
    hint: 'SHIFT dá o impulso. Use o dash para atravessar os vãos e escapar dos saltos.',
    boss: { name: 'O TÉCNICO', hp: 80, speed: 68, color: '#ff8c42', w: 124, h: 136, style: 'bruiser' },
    arena: { left: 122, right: 148, trigger: 124, exit: 154, ceiling: 11 }
  });

  b.ground(0, 20);
  b.solid(20, 21, 7); b.spikes(20, 20, 7);
  b.spawn(2, 17);
  b.solid(4, 14, 4);
  b.gear(5, 12);
  b.enemy(16, 17, { variant: 'runner' });
  b.enemy(38, 17, { variant: 'brute' });
  b.enemy(62, 17, { variant: 'shield' });
  b.enemy(86, 17, { variant: 'bomber' });
  b.enemy(108, 17, { variant: 'brute' });
  b.drone(96, 9, { variant: 'sniper' });

  b.solid(22, 15, 3);
  b.gear(23, 13);

  b.ground(27, 18);
  b.solid(45, 21, 8); b.spikes(45, 20, 8);
  b.checkpoint(30, 17);
  b.solid(32, 16, 4);
  b.solid(38, 13, 4);
  b.gear(39, 11);
  b.clue(40, 12, 'pista3');
  b.spikes(42, 17, 2);

  b.solid(47, 16, 2);
  b.solid(50, 13, 2);
  b.gear(50, 11);

  b.ground(53, 24);
  b.laser(59, 12, 1, 6);
  b.laser(65, 12, 1, 6);
  b.laser(71, 12, 1, 6);
  b.solid(61, 14, 3);
  b.gear(62, 12);
  b.solid(67, 14, 3);
  b.gear(68, 12);
  b.crate(74, 17);
  b.crate(75, 17);
  b.crate(76, 17);

  // Vão do ginásio: uma plataforma central, o resto é salto.
  b.solid(77, 21, 14);
  b.spikes(77, 20, 14);
  b.solid(82, 15, 4);
  b.gear(83, 13);

  b.ground(91, 18);
  b.checkpoint(92, 17);
  b.solid(97, 12, 4);
  b.core(98, 10);
  b.spikes(105, 17, 2);

  b.ground(109, 53);
  b.solid(112, 14, 3);

  // Arena do chefe + sala de saída
  b.gate(122, 11, 2, 7, 'boss_arena', false);
  b.gate(148, 11, 2, 7, 'boss_exit', true);
  b.solid(122, 10, 40, 1);
  b.gear(145, 12);
  b.boss(134, 17, { name: 'O TÉCNICO', hp: 210, speed: 92, color: '#ff8c42', w: 124, h: 136, style: 'bruiser' });
  b.exit(154, 17);

  return b.build();
}

/* ------------------------------ FASE 4 ------------------------------ */

function level4() {
  const b = new LevelBuilder({
    id: 4,
    name: 'Laboratório',
    short: 'Laboratório',
    subtitle: 'Experimentos do CEPK',
    width: 168,
    height: 22,
    theme: THEMES.lab,
    musicRoot: 65,
    musicMode: 3,
    story: [
      'O laboratório do CEPK guarda os projetos do Sistema.',
      'Feixes de energia cortam os corredores.',
      'Lasers e reatores bloqueiam cada passagem.',
      'Desligue os reatores e chegue à diretoria.'
    ],
    cutscene: [
      {
        title: 'LABORATÓRIO',
        speaker: 'KENNEDITO',
        hint: 'O laboratorio esta cheio de lasers. Cronometre o dash.',
        motif: 'lab',
        lines: [
          'Bancadas, vidrarias e quadros verdes.',
          'Experimentos que nunca deveriam sair do papel.',
          'O Sistema aprendeu rápido demais.'
        ]
      },
      {
        title: 'PROJETO VEGA',
        speaker: 'KENNEDITO',
        hint: 'O Projeto VEGA e voce. Mostre que o Sistema nao te controla.',
        motif: 'project',
        lines: [
          'Sua ficha aparece em todos os monitores.',
          'Você não é só um monitor. É a chave.',
          'E o Sistema sabe disso.'
        ]
      },
      {
        title: 'REATOR',
        speaker: 'KENNEDITO',
        hint: 'Os reatores alimentam as defesas. Desvie dos feixes e avance.',
        motif: 'module',
        lines: [
          'O reator principal ainda pulsa no fim do corredor.',
          'Cada plataforma é uma peça do caminho.',
          'A diretoria está logo acima.'
        ]
      },
      {
        title: 'PISTA 4/4: PEGADA VERDE',
        speaker: 'KENNEDITO',
        hint: 'Pistas de Kennedito... acho que ele passou por aqui. Siga o rastro!',
        motif: 'clue',
        lines: [
          'Uma pegada verde marca o caminho.',
          'Colete todas as quatro pegadas para abençoar o resgate.',
          'O collar de Kennedito responderá.'
        ]
      }
    ],
    bossCutscene: [
      {
        title: 'A COORDENADORA',
        speaker: 'KENNEDITO',
        hint: 'A Coordenadora lanca runas e clones. Aparar e contra-atacar.',
        tag: 'CHEFE 4/5',
        motif: 'bossTrickster',
        lines: [
          'Os reatores param. O laboratório fica em silêncio.',
          'Uma voz sai de todos os alto-falantes ao mesmo tempo.',
          'A COORDENADORA nunca esteve sozinha.'
        ]
      },
      {
        title: 'PROTOCOLO DE CONTENÇÃO',
        speaker: 'KENNEDITO',
        hint: 'Quebre os clones, desvie das runas e derrube a Coordenadora.',
        tag: 'ARENA DE COMBATE',
        motif: 'bossArena',
        lines: [
          'Clones, anéis de energia e chuva de detritos.',
          'Ache a coordenadora real. O parry revela a diferença.',
          'Desligue o protocolo para chegar à diretoria.'
        ]
      }
    ],
    hint: 'SHIFT dá o impulso e E faz o parry. Use o dash para cruzar os feixes.',
    boss: { name: 'A COORDENADORA', hp: 98, speed: 76, color: '#b18cff', w: 120, h: 132, style: 'trickster' },
    arena: { left: 128, right: 154, trigger: 130, exit: 160, ceiling: 11 }
  });

  b.ground(0, 16);
  b.spawn(2, 17);
  b.enemy(15, 17, { variant: 'runner' });
  b.enemy(38, 17, { variant: 'shield' });
  b.enemy(62, 17, { variant: 'brute' });
  b.enemy(86, 17, { variant: 'bomber' });
  b.enemy(108, 17, { variant: 'samurai' });
  b.drone(96, 9, { variant: 'sniper' });
  b.solid(8, 14, 3);
  b.gear(9, 12);

  b.solid(16, 21, 10);
  b.spikes(16, 20, 10);
  b.gear(21, 13);

  b.ground(26, 20);
  b.solid(46, 21, 10); b.spikes(46, 20, 10);
  b.checkpoint(29, 17);
  b.laser(32, 12, 1, 6);
  b.laser(38, 12, 1, 6);
  b.solid(34, 14, 3);
  b.gear(35, 12);

  b.solid(47, 15, 3);
  b.gear(47, 13);

  b.ground(56, 22);
  b.solid(78, 21, 10); b.spikes(78, 20, 10);
  b.solid(61, 16, 4);
  b.solid(73, 16, 4);
  b.gear(62, 14);
  b.core(74, 14);
  b.spikes(75, 17, 3);

  // Vão do laboratório: uma plataforma central.
  b.solid(82, 15, 3);
  b.gear(82, 13);

  b.ground(88, 22);
  b.laser(91, 12, 1, 6);
  b.laser(98, 12, 1, 6);
  b.solid(94, 14, 3);
  b.gear(95, 12);
  b.checkpoint(104, 17);

  // Pista 4/4 — pegada de Kennedito
  b.clue(105, 16, 'pista4');

  b.solid(111, 15, 3);
  b.gear(111, 13);
  b.solid(110, 21, 10);
  b.spikes(110, 20, 10);
  b.solid(114, 15, 3);

  b.ground(120, 48);
  b.solid(124, 14, 3);
  b.gear(125, 12);

  // Arena do chefe + sala de saída
  b.gate(128, 11, 2, 7, 'boss_arena', false);
  b.gate(154, 11, 2, 7, 'boss_exit', true);
  b.solid(128, 10, 40, 1);
  b.gear(151, 12);
  b.boss(140, 17, { name: 'A COORDENADORA', hp: 280, speed: 104, color: '#b18cff', w: 120, h: 132, style: 'trickster' });
  b.exit(160, 17);

  return b.build();
}

/* ------------------------------ FASE 5 ------------------------------ */

function level5() {
  const b = new LevelBuilder({
    id: 5,
    name: 'Diretoria',
    short: 'Diretoria',
    subtitle: 'A sala da diretora',
    width: 140,
    height: 22,
    theme: THEMES.office,
    musicRoot: 52,
    musicMode: 4,
    story: [
      'A diretoria fica no topo do CEPK.',
      'A DIRETORA controla o Sistema Verde.',
      'As armas, o dash e o parry são tudo o que você tem.',
      'Liberte a escola.'
    ],
    cutscene: [
      {
        title: 'DIRETORIA',
        motif: 'office',
        lines: [
          'A porta da diretoria se abre sozinha.',
          'Um escritório verde, impecável e vazio.',
          'Atrás da mesa, uma voz: "VEGA. Você chegou."'
        ]
      },
      {
        title: 'A DIRETORA',
        motif: 'confrontation',
        lines: [
          'O Sistema não é uma máquina. É uma decisão.',
          'E a decisão foi trancar todos para sempre.',
          'Você carrega a chave para mudar isso.'
        ]
      },
      {
        title: 'SINAL VERDE',
        motif: 'final',
        lines: [
          'Se a diretora cair, o CEPK acorda.',
          'Portões, luzes, sinos. Tudo volta.',
          'E a escola finalmente fica em silêncio.'
        ]
      },
      {
        title: 'RESGATE KENNEDITO',
        motif: 'kennedito',
        lines: [
          'A jaula de Kennedito está na última sala antes da diretora.',
          'O collar verde é a chave mestra.',
          'Aperte E ou J perto da jaula para libertá-lo.',
          'Kennedito lutará ao seu lado contra a diretora.'
        ]
      },
      {
        title: 'JUNTO',
        motif: 'together',
        lines: [
          'VEGA e Kennedito juntos.',
          'O Sistema Verde desmorona.',
          'A escola está livre.'
        ]
      }
    ],
    bossCutscene: [
      {
        title: 'A DIRETORA',
        tag: 'CHEFE FINAL',
        motif: 'bossDirector',
        lines: [
          'A cadeira da diretoria gira devagar.',
          'O Sistema Verde inteiro cabe em um único olhar.',
          'A DIRETORA se levanta. A escola prende a respiração.'
        ]
      },
      {
        title: 'SINAL VERMELHO',
        tag: 'ARENA FINAL',
        motif: 'bossArenaFinal',
        lines: [
          'Três fases. Nenhuma piedade. Nenhuma saída.',
          'Use tudo o que aprendeu. Kennedito está com você.',
          'Esta é a última porta do CEPK.'
        ]
      }
    ],
    hint: 'Salto de parede, plataformas móveis e dash abrem o caminho até a diretoria.',
    boss: { name: 'A DIRETORA', hp: 156, speed: 82, color: '#ff5d7a', w: 140, h: 150, final: true, style: 'director' },
    arena: { left: 102, right: 128, trigger: 104, exit: 134, ceiling: 11 }
  });

  b.ground(0, 16);
  b.spawn(2, 17);
  b.enemy(15, 17, { variant: 'brute' });
  b.enemy(35, 17, { variant: 'runner' });
  b.enemy(55, 17, { variant: 'shield' });
  b.enemy(75, 17, { variant: 'stalker' });
  b.enemy(95, 17, { variant: 'bomber' });
  b.drone(45, 9, { variant: 'sniper' });
  b.gear(5, 15);
  b.laser(14, 12, 1, 6);

  b.ground(16, 10);
  b.solid(18, 15, 4);
  b.gear(19, 13);
  b.checkpoint(22, 17);

  b.ground(26, 10);
  b.laser(28, 12, 1, 6);
  b.laser(33, 12, 1, 6);
  b.gear(30, 15);

  b.ground(36, 10);
  b.solid(38, 15, 4);
  b.gear(39, 13);

  b.ground(46, 10);
  b.laser(48, 12, 1, 6);

  // Torre final: chaminé de salto de parede com apoios.
  b.ground(56, 84);
  b.solid(57, 6, 1, 6);
  b.solid(60, 6, 1, 12);
  b.gear(59, 3);

  // Corredor de espinhos: um único salto sobre uma plataforma fixa.
  b.spikes(66, 17, 7);
  b.solid(69, 14, 4);
  b.solid(75, 13, 2);

  b.solid(90, 14, 3);
  b.gear(61, 12);
  b.gear(81, 12);
  b.core(91, 12);
  b.solid(80, 13, 3);

  // Kennedito cage at tile 94-112, position 17
  b.kennedito(94, 17);  // New Kennedito Cage

  // Uma única passagem de plataformas quebradiças antes da gaiola
  b.crumble(82, 17, 5);

  // Turret and charger before the cage

  // Portão de resgate: só abre depois de libertar Kennedito.
  b.gate(99, 11, 1, 7, 'rescue');
  b.checkpoint(101, 17);

  // Arena final + sala de saída
  b.gate(102, 11, 2, 7, 'boss_arena', false);
  b.gate(128, 11, 2, 7, 'boss_exit', true);
  b.solid(102, 10, 38, 1);
  b.gear(124, 12);
  b.boss(114, 17, { name: 'A DIRETORA', hp: 420, speed: 112, color: '#ff5d7a', w: 140, h: 150, final: true, style: 'director' });
  b.exit(134, 17);

  return b.build();
}

const LEVELS = [tutorialLevel, level1, level2, level3, level4, level5];
