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
  crumble(tx, ty, w = 3, data = {}) {
    this.solid(tx, ty, w, 1);
    return this.add('crumble', tx, ty, { w, ...data });
  }
  clue(tx, ty, clue = '') { return this.add('clue', tx, ty, { clue }); }
  kennedito(tx, ty) { return this.add('kennedito', tx, ty); }
  gear(tx, ty) { return this.add('gear', tx, ty); }
  core(tx, ty) { return this.add('core', tx, ty); }
  checkpoint(tx, ty) { return this.add('checkpoint', tx, ty); }
  power(tx, ty, power) { return this.add('power', tx, ty, { power }); }
  boss(tx, ty, cfg) { return this.add('boss', tx, ty, { boss: cfg }); }
  exit(tx, ty) { return this.add('exit', tx, ty); }
  gate(tx, ty, w, h, station = null) {
    this.solid(tx, ty, w, h);
    return this.add('gate', tx, ty, { w, h, station });
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
}

/* ------------------------------ TEMAS DO CEPK ------------------------------ */

const THEMES = {
  training: {
    kind: 'training',
    skyTop: '#061a10', skyBottom: '#0f4a28',
    far: '#0b2c19', mid: '#13502c', near: '#1d6b3a',
    tileTop: '#9bffb0', tile: '#2f8a4c', tileDark: '#15502a',
    edge: '#b8ffd0', accent: '#6dff9e', hazard: '#ff5a6c', glow: '#c8ffda',
    bg: '#071c10'
  },
  school: {
    kind: 'courtyard',
    skyTop: '#07160d', skyBottom: '#1c4d2a',
    far: '#0d2b18', mid: '#17482a', near: '#236b3c',
    tileTop: '#7ddf88', tile: '#347347', tileDark: '#183d24',
    edge: '#a8f0b0', accent: '#6dff9e', hazard: '#ff5a5a', glow: '#c4ffd2',
    bg: '#081a0e'
  },
  hall: {
    kind: 'hall',
    skyTop: '#06130e', skyBottom: '#123d2c',
    far: '#0a261d', mid: '#114434', near: '#1b5e48',
    tileTop: '#65d68b', tile: '#276b52', tileDark: '#12382a',
    edge: '#9df7bb', accent: '#5dffb0', hazard: '#ff6b4a', glow: '#bfffd8',
    bg: '#06170f'
  },
  gym: {
    kind: 'gym',
    skyTop: '#0a1706', skyBottom: '#2b4a12',
    far: '#13270a', mid: '#234312', near: '#35631c',
    tileTop: '#c6f06a', tile: '#5c8a28', tileDark: '#2d4a12',
    edge: '#e4ff9a', accent: '#b6ff5d', hazard: '#ff7a3c', glow: '#e8ffb0',
    bg: '#0b1c08'
  },
  lab: {
    kind: 'lab',
    skyTop: '#04140f', skyBottom: '#0b3a32',
    far: '#08251f', mid: '#0d3f36', near: '#155a4c',
    tileTop: '#5ef2c8', tile: '#1f7765', tileDark: '#0d3a31',
    edge: '#9dffe2', accent: '#4fffd0', hazard: '#ff5d7a', glow: '#c0fff0',
    bg: '#061b16'
  },
  office: {
    kind: 'office',
    skyTop: '#0b1207', skyBottom: '#26330f',
    far: '#141d0a', mid: '#233312', near: '#35491a',
    tileTop: '#d7d98a', tile: '#6c7030', tileDark: '#363a18',
    edge: '#f2f2b0', accent: '#d9ff6d', hazard: '#ff5d6c', glow: '#f4ffb0',
    bg: '#0d1508'
  }
};

/* ------------------------------ TREINAMENTO ------------------------------ */

function tutorialLevel() {
  const b = new LevelBuilder({
    id: 0,
    name: 'Treinamento',
    short: 'Treinamento',
    subtitle: 'Aprenda no pátio',
    width: 112,
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
      { action: 'focus', label: 'FOCO (K)', key: 'K', tx: 102, ty: 17 },
      { action: 'dash_alt', label: 'DASH (L)', key: 'L', tx: 107, ty: 17 },
      { action: 'exit', label: 'PORTAL', key: '→', tx: 110, ty: 17 }
    ]
  });

  // Pátio contínuo: nada de cair do mapa no tutorial.
  b.ground(0, 112);
  b.spawn(2, 17);
  b.checkpoint(10, 17);

  // 1) MOVER — portão de energia
  b.gate(12, 11, 1, 7, 'move');

  // 2) PULAR — muro baixo de verdade
  b.solid(19, 16, 3, 2);
  b.gate(29, 11, 1, 7, 'jump');

  // 3) PULO DUPLO — barreira alta + spring
  b.gate(37, 11, 1, 7, 'double');
  b.checkpoint(33, 17);
  b.spring(38, 17);  // Spring for double jump

  // 4) IMPULSO — barreira que abre com o dash (SHIFT)
  b.gate(49, 11, 1, 7, 'dash');
  b.checkpoint(45, 17);

  // 5) GOLPE — boneco de treino
  b.enemy(57, 17, { training: true, tag: 'melee', hp: 4 });
  b.gate(63, 11, 1, 7, 'attack');
  b.checkpoint(60, 17);

  // 6) ESTILINGUE — alvo fixo imune a golpes, só cai com tiro
  b.drone(71, 17, { training: true, tag: 'shoot', hp: 2, fixed: true });
  b.gate(77, 11, 1, 7, 'shoot');
  b.checkpoint(74, 17);

  // 7) PARRY — orbe lento e parável (com janela perfeita de 0.14s)
  b.drone(85, 14, { training: true, tag: 'parry', parryTrainer: true, invulnerable: true, fixed: true });
  b.gate(91, 11, 1, 7, 'parry');
  b.checkpoint(88, 17);

  // 8) FOCUS — módulo de foco (agora em K)
  b.power(100, 16, 'focus');
  b.gate(105, 11, 1, 7, 'focus');
  b.checkpoint(102, 17);

  // 9) DASH ALTERNADO (L)
  b.gate(108, 11, 1, 7, 'dash_alt');
  b.checkpoint(106, 17);

  // 10) PORTAL
  b.exit(110, 17);

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
    width: 126,
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
        motif: 'gate',
        lines: [
          'O colégio amanhece vazio.',
          'As câmeras giram para você ao mesmo tempo.',
          'O Sistema Verde assumiu o CEPK.'
        ]
      },
      {
        title: 'PÁTIO',
        motif: 'courtyard',
        lines: [
          'Grama, quadras e árvores. Tudo parado.',
          'Os alto-falantes repetem uma ordem: EVACUAR.',
          'Mas ninguém mais está aqui.'
        ]
      },
      {
        title: 'O PRIMEIRO PODER',
        motif: 'module',
        lines: [
          'Um pulso de energia verde atravessa o pátio.',
          'Com ele, você pode quebrar o cerco.',
          'O caminho até a diretoria começa agora.'
        ]
      },
      {
        title: 'RONDA TURRET',
        motif: 'turret',
        lines: [
          'Uma torre verde surgiu no perímetro.',
          'Ela vigia o pátio e dispara projéteis paráveis.',
          'Use o parry para devolvê-las.'
        ]
      }
    ],
    hint: 'Q libera o PULSO: destrói projéteis e empurra inimigos.',
    boss: { name: 'O PORTEIRO', hp: 48, speed: 62, color: '#6dff9e', w: 116, h: 122, style: 'guardian' }
  });

  b.ground(0, 20);
  b.spawn(2, 17);
  b.power(6, 16, 'pulse');
  b.solid(4, 14, 3);
  b.gear(5, 12);
  b.solid(9, 13, 3);
  b.gear(10, 11);
  b.crate(14, 17);
  b.crate(15, 17);
  b.crate(16, 17);

  // fosso do jardim
  b.solid(21, 21, 7);
  b.spikes(21, 20, 7);

  b.ground(28, 18);
  b.turret(32, 17, { hp: 3, damage: 1, range: 500 });  // New Turret enemy
  b.solid(33, 13, 5);
  b.gear(35, 11);
  b.clue(36, 12, 'pista1');
  b.checkpoint(36, 17);
  b.enemy(41, 17);
  b.spikes(43, 17, 2);
  b.drone(44, 10);

  b.solid(47, 15, 2);
  b.gear(47, 13);

  b.ground(52, 24);
  b.solid(54, 16, 4);
  b.solid(59, 13, 4);
  b.solid(64, 16, 4);
  b.gear(60, 11);
  b.core(65, 14);
  b.drone(61, 9);
  b.enemy(57, 17);
  b.enemy(68, 17);
  b.checkpoint(70, 17);

  b.solid(77, 15, 3);

  b.ground(81, 20);
  b.laser(84, 13, 1, 5);
  b.laser(92, 13, 1, 5);
  b.solid(87, 14, 3);
  b.gear(88, 12);
  b.enemy(88, 17);
  b.spikes(95, 17, 3);

  // Pulo duplo com spring
  b.spring(90, 17);  // New Spring for double jump training

  b.ground(101, 25);
  b.solid(104, 14, 3);
  b.gear(105, 12);
  b.boss(112, 17, { name: 'O PORTEIRO', hp: 48, speed: 62, color: '#6dff9e', w: 116, h: 122, style: 'guardian' });
  b.exit(120, 17);

  return b.build();
}

/* ------------------------------ FASE 2 ------------------------------ */

function level2() {
  const b = new LevelBuilder({
    id: 2,
    name: 'Corredores',
    short: 'Corredores',
    subtitle: 'Depois do último sinal',
    width: 136,
    height: 22,
    theme: THEMES.hall,
    musicRoot: 58,
    musicMode: 1,
    story: [
      'Os corredores do CEPK viraram um labirinto.',
      'Monitores e câmeras patrulham cada esquina.',
      'O FOCO permite enxergar o perigo em câmera lenta.',
      'Chegue ao ginásio antes que as portas fechem.'
    ],
    cutscene: [
      {
        title: 'CORREDORES',
        motif: 'hall',
        lines: [
          'Armários verdes se alinham até o fim do corredor.',
          'As luzes piscam em um ritmo que não é humano.',
          'O Sistema Verde observa cada passo.'
        ]
      },
      {
        title: 'O SISTEMA',
        motif: 'observation',
        lines: [
          'Telas mostram sua ficha escolar.',
          'Nome: VEGA. Função: monitor.',
          'Status: ameaça.'
        ]
      },
      {
        title: 'FOCO',
        motif: 'module',
        lines: [
          'Um módulo de processamento pulsa atrás de um vidro.',
          'Com ele, o mundo desacelera.',
          'E você vê a saída antes de todo mundo.'
        ]
      },
      {
        title: 'CORRIDOR CARREGADOR',
        motif: 'charger',
        lines: [
          'Um corredor bloqueado por um Carregador.',
          'Ele acelera quando vê o jogador.',
          'Use o parry para atordoá-lo e passar.'
        ]
      }
    ],
    hint: 'Segure K para ativar o FOCO e desacelerar inimigos e projéteis.',
    boss: { name: 'A INSPETORA', hp: 64, speed: 72, color: '#ffd24d', w: 112, h: 126, style: 'hunter' }
  });

  b.ground(0, 17);
  b.spawn(2, 17);
  b.power(6, 16, 'focus');
  b.solid(8, 14, 4);
  b.gear(9, 12);
  b.enemy(12, 17);
  b.crate(14, 17);
  b.crate(15, 17);
  b.crate(16, 17);

  b.solid(17, 21, 8);
  b.spikes(17, 20, 8);

  b.ground(25, 22);
  b.checkpoint(28, 17);
  b.solid(30, 15, 5);
  b.gear(31, 13);
  b.drone(34, 11);
  b.drone(40, 9);
  b.laser(37, 12, 1, 6);
  b.enemy(35, 17);
  b.enemy(42, 17);
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
  b.drone(58, 9);
  b.enemy(56, 17);
  b.enemy(64, 17);
  b.checkpoint(69, 17);
  b.laser(72, 13, 1, 5);
  b.crate(74, 17);
  b.crate(75, 17);

  b.solid(77, 21, 8);
  b.spikes(77, 20, 8);

  b.ground(85, 22);
  b.solid(88, 14, 4);
  b.gear(89, 12);
  b.enemy(90, 17);
  b.drone(96, 10);
  b.spikes(98, 17, 2);
  b.laser(101, 13, 1, 5);
  b.checkpoint(103, 17);

  b.ground(107, 29);
  b.solid(110, 14, 3);
  b.solid(124, 14, 3);
  b.gear(125, 12);
  b.turret(118, 17, { hp: 3, damage: 1, range: 550 });  // New Turret
  b.boss(120, 17, { name: 'A INSPETORA', hp: 64, speed: 72, color: '#ffd24d', w: 112, h: 126, style: 'hunter' });
  b.exit(130, 17);

  return b.build();
}

/* ------------------------------ FASE 3 ------------------------------ */

function level3() {
  const b = new LevelBuilder({
    id: 3,
    name: 'Ginásio',
    short: 'Ginásio',
    subtitle: 'Jogo decisivo',
    width: 146,
    height: 22,
    theme: THEMES.gym,
    musicRoot: 62,
    musicMode: 2,
    story: [
      'O ginásio virou arena de treinamento do Sistema.',
      'As arquibancadas estão vazias, mas as máquinas não.',
      'O ESCUDO protege contra os ataques mais pesados.',
      'Atravesse a quadra e alcance a ala técnica.'
    ],
    cutscene: [
      {
        title: 'GINÁSIO',
        motif: 'gym',
        lines: [
          'A quadra verde brilha sob os refletores.',
          'Cestas e traves se movem sozinhas.',
          'O placar marca uma partida sem fim.'
        ]
      },
      {
        title: 'TREINO',
        motif: 'training',
        lines: [
          'Máquinas de treino ganharam vida.',
          'Elas não querem sua nota. Querem sua queda.',
          'A arquibancada inteira assiste.'
        ]
      },
      {
        title: 'ESCUDO',
        motif: 'module',
        lines: [
          'Um campo de força espera no alto da arquibancada.',
          'Ele absorve o impacto e devolve o silêncio.',
          'O ginásio não vai te parar.'
        ]
      },
      {
        title: 'SWOOPER NO GINÁSIO',
        motif: 'swooper',
        lines: [
          'Um Swooper patrulha o galpão.',
          'Ele mergulha do alto da arquibancada.',
          'Use o parry no timing certo para refletir.'
        ]
      }
    ],
    hint: 'Segure R para ativar o ESCUDO e absorver os ataques.',
    boss: { name: 'O TÉCNICO', hp: 80, speed: 68, color: '#ff8c42', w: 124, h: 136, style: 'bruiser' }
  });

  b.ground(0, 20);
  b.spawn(2, 17);
  b.power(7, 16, 'shield');
  b.solid(4, 14, 4);
  b.gear(5, 12);
  b.enemy(12, 17);
  b.drone(15, 10);

  b.solid(22, 15, 3);
  b.gear(23, 13);

  b.ground(27, 18);
  b.checkpoint(30, 17);
  b.solid(32, 16, 4);
  b.solid(38, 13, 4);
  b.gear(39, 11);
  b.clue(40, 12, 'pista3');
  b.drone(35, 9);
  b.enemy(36, 17);
  b.spikes(42, 17, 2);

  b.solid(47, 16, 2);
  b.solid(50, 13, 2);
  b.gear(50, 11);

  b.ground(53, 24);
  b.checkpoint(56, 17);
  b.laser(59, 12, 1, 6);
  b.laser(65, 12, 1, 6);
  b.laser(71, 12, 1, 6);
  b.solid(61, 14, 3);
  b.gear(62, 12);
  b.solid(67, 14, 3);
  b.gear(68, 12);
  b.enemy(63, 17);
  b.enemy(69, 17);
  b.crate(74, 17);
  b.crate(75, 17);
  b.crate(76, 17);

  b.solid(77, 21, 8);
  b.spikes(77, 20, 8);

  b.ground(85, 24);
  b.checkpoint(88, 17);
  b.solid(90, 15, 5);
  b.solid(97, 12, 5);
  b.gear(91, 13);
  b.core(98, 10);
  b.drone(94, 8);
  b.drone(103, 10);
  b.enemy(95, 17);
  b.enemy(101, 17);
  b.spikes(105, 17, 2);

  // Spring for high jump training
  b.spring(110, 17);  // New Spring

  b.ground(109, 37);
  b.solid(112, 14, 3);
  b.solid(126, 14, 3);
  b.gear(127, 12);
  b.boss(130, 17, { name: 'O TÉCNICO', hp: 80, speed: 68, color: '#ff8c42', w: 124, h: 136, style: 'bruiser' });
  b.exit(140, 17);

  return b.build();
}

/* ------------------------------ FASE 4 ------------------------------ */

function level4() {
  const b = new LevelBuilder({
    id: 4,
    name: 'Laboratório',
    short: 'Laboratório',
    subtitle: 'Experimentos do CEPK',
    width: 152,
    height: 22,
    theme: THEMES.lab,
    musicRoot: 65,
    musicMode: 3,
    story: [
      'O laboratório do CEPK guarda os projetos do Sistema.',
      'Feixes de energia cortam os corredores.',
      'A ADRENALINA transforma energia em velocidade.',
      'Desligue os reatores e chegue à diretoria.'
    ],
    cutscene: [
      {
        title: 'LABORATÓRIO',
        motif: 'lab',
        lines: [
          'Bancadas, vidrarias e quadros verdes.',
          'Experimentos que nunca deveriam sair do papel.',
          'O Sistema aprendeu rápido demais.'
        ]
      },
      {
        title: 'PROJETO VEGA',
        motif: 'project',
        lines: [
          'Sua ficha aparece em todos os monitores.',
          'Você não é só um monitor. É a chave.',
          'E o Sistema sabe disso.'
        ]
      },
      {
        title: 'ADRENALINA',
        motif: 'module',
        lines: [
          'O último módulo está preso ao reator.',
          'Com ele, cada passo vira um trovão.',
          'A diretoria está logo acima.'
        ]
      },
      {
        title: 'PISTA 4/4: PEGADA VERDE',
        motif: 'clue',
        lines: [
          'Uma pegada verde marca o caminho.',
          'Colete todas as quatro pegadas para abençoar o resgate.',
          'O collar de Kennedito responderá.'
        ]
      }
    ],
    hint: 'F ativa a ADRENALINA: mais velocidade, salto e dano por 6s.',
    boss: { name: 'A COORDENADORA', hp: 98, speed: 76, color: '#b18cff', w: 120, h: 132, style: 'trickster' }
  });

  b.ground(0, 16);
  b.spawn(2, 17);
  b.power(6, 16, 'super');
  b.solid(8, 14, 3);
  b.gear(9, 12);
  b.enemy(11, 17);

  b.solid(16, 21, 10);
  b.spikes(16, 20, 10);
  b.solid(21, 15, 3);
  b.gear(21, 13);

  b.ground(26, 20);
  b.checkpoint(29, 17);
  b.laser(32, 12, 1, 6);
  b.laser(38, 12, 1, 6);
  b.solid(34, 14, 3);
  b.gear(35, 12);
  b.turret(33, 17, { hp: 3, damage: 1, range: 500 });  // New Turret
  b.enemy(41, 17);
  b.drone(37, 9);

  b.solid(47, 15, 3);
  b.solid(51, 13, 2);
  b.gear(51, 11);

  b.ground(56, 22);
  b.checkpoint(59, 17);
  b.solid(61, 16, 4);
  b.solid(67, 13, 4);
  b.solid(73, 16, 4);
  b.gear(68, 11);
  b.core(74, 14);
  b.drone(64, 8);
  b.drone(71, 10);
  b.spikes(75, 17, 3);

  b.solid(79, 15, 3);
  b.solid(83, 13, 2);
  b.gear(83, 11);

  b.ground(88, 22);
  b.laser(91, 12, 1, 6);
  b.laser(98, 12, 1, 6);
  b.solid(94, 14, 3);
  b.gear(95, 12);
  b.charger(92, 17, { hp: 5, speed: 76 });  // New Charger
  b.enemy(92, 17);  // Keep existing
  b.drone(102, 9);
  b.checkpoint(104, 17);

  // Pista 4/4 — pegada de Kennedito
  b.clue(105, 16, 'pista4');

  b.solid(111, 15, 3);
  b.solid(115, 13, 2);
  b.gear(115, 11);

  b.ground(120, 32);
  b.solid(124, 14, 3);
  b.gear(125, 12);
  b.boss(136, 17, { name: 'A COORDENADORA', hp: 98, speed: 76, color: '#b18cff', w: 120, h: 132, style: 'trickster' });
  b.exit(146, 17);

  return b.build();
}

/* ------------------------------ FASE 5 ------------------------------ */

function level5() {
  const b = new LevelBuilder({
    id: 5,
    name: 'Diretoria',
    short: 'Diretoria',
    subtitle: 'A sala da diretora',
    width: 124,
    height: 22,
    theme: THEMES.office,
    musicRoot: 52,
    musicMode: 4,
    story: [
      'A diretoria fica no topo do CEPK.',
      'A DIRETORA controla o Sistema Verde.',
      'Todos os poderes estão com você.',
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
    hint: 'Combine PULSO, FOCO, ESCUDO e ADRENALINA. O parry é a chave.',
    boss: { name: 'A DIRETORA', hp: 156, speed: 82, color: '#ff5d7a', w: 140, h: 150, final: true, style: 'director' }
  });

  b.ground(0, 16);
  b.spawn(2, 17);
  b.gear(5, 15);
  b.enemy(9, 17);
  b.drone(12, 10);
  b.laser(14, 12, 1, 6);

  b.ground(16, 10);
  b.solid(18, 15, 4);
  b.gear(19, 13);
  b.checkpoint(22, 17);

  b.ground(26, 10);
  b.laser(28, 12, 1, 6);
  b.laser(33, 12, 1, 6);
  b.enemy(30, 17);
  b.drone(31, 8);
  b.gear(30, 15);

  b.ground(36, 10);
  b.solid(38, 15, 4);
  b.gear(39, 13);
  b.enemy(42, 17);

  b.ground(46, 10);
  b.laser(48, 12, 1, 6);
  b.checkpoint(51, 17);
  b.drone(53, 9);

  // Section with crumble platforms
  b.ground(56, 68);
  b.solid(60, 14, 3);
  b.solid(70, 14, 3);
  b.solid(80, 14, 3);
  b.solid(90, 14, 3);
  b.solid(110, 14, 3);
  b.gear(61, 12);
  b.gear(81, 12);
  b.core(91, 12);

  // Kennedito cage at tile 94-112, position 17
  b.kennedito(94, 17);  // New Kennedito Cage

  // Crumble platforms before the cage
  b.crumble(82, 17, 5);  // Crumble section
  b.crumble(88, 17, 3);  // Another crumble section

  // Turret and charger before the cage
  b.turret(78, 17, { hp: 3, damage: 1, range: 500 });  // New Turret
  b.charger(84, 17, { hp: 5, speed: 74 });  // New Charger

  b.boss(104, 17, { name: 'A DIRETORA', hp: 156, speed: 82, color: '#ff5d7a', w: 140, h: 150, final: true, style: 'director' });
  
  // Rescue gate before the boss - at tiles 99-103
  b.gate(99, 11, 1, 7, 'rescue');  // New rescue gate

  b.exit(118, 17);

  return b.build();
}

const LEVELS = [tutorialLevel, level1, level2, level3, level4, level5];

const POWER_INFO = {
  pulse: {
    name: 'PULSO',
    short: 'Pulso',
    color: '#6dff9e',
    key: 'Q',
    desc: 'Onda de choque que destrói projéteis e empurra inimigos.'
  },
  focus: {
    name: 'FOCO',
    short: 'Foco',
    color: '#7fe7ff',
    key: 'K',
    desc: 'Desacelera inimigos e projéteis enquanto você segura.'
  },
  shield: {
    name: 'ESCUDO',
    short: 'Escudo',
    color: '#b57bff',
    key: 'R',
    desc: 'Barreira de energia que bloqueia dano.'
  },
  super: {
    name: 'ADRENALINA',
    short: 'Adrenalina',
    color: '#ffd24d',
    key: 'F',
    desc: 'Aumenta velocidade, salto e dano por 6 segundos.'
  }
};
