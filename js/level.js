'use strict';

/* ============================================================
   FERRO-9 — construção das fases
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
  enemy(tx, ty) { return this.add('walker', tx, ty); }
  drone(tx, ty) { return this.add('drone', tx, ty); }
  gear(tx, ty) { return this.add('gear', tx, ty); }
  core(tx, ty) { return this.add('core', tx, ty); }
  checkpoint(tx, ty) { return this.add('checkpoint', tx, ty); }
  power(tx, ty, power) { return this.add('power', tx, ty, { power }); }
  boss(tx, ty, cfg) { return this.add('boss', tx, ty, { boss: cfg }); }
  exit(tx, ty) { return this.add('exit', tx, ty); }

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
    this.w = builder.w;
    this.h = builder.h;
    this.tiles = builder.tiles;
    this.entities = builder.entities;
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
}

/* ------------------------------ TEMAS ------------------------------ */

const THEMES = {
  factory: {
    skyTop: '#120b08', skyBottom: '#2b1710',
    far: '#24120c', mid: '#351a0f', near: '#472414',
    tileTop: '#b4632f', tile: '#6b3a20', tileDark: '#3c1f12',
    edge: '#d98a4a', accent: '#ff9d45', hazard: '#ff5a3c', glow: '#ffb066',
    bg: '#1b0f0a'
  },
  lab: {
    skyTop: '#04121a', skyBottom: '#0a2a33',
    far: '#08222b', mid: '#0c303c', near: '#124450',
    tileTop: '#2fd4c8', tile: '#166e78', tileDark: '#0b3a42',
    edge: '#5ef2e0', accent: '#4fffe6', hazard: '#ff4d6d', glow: '#7ffff0',
    bg: '#061820'
  },
  city: {
    skyTop: '#080614', skyBottom: '#1b1038',
    far: '#150d2a', mid: '#221245', near: '#321a5e',
    tileTop: '#8a63ff', tile: '#4b2c9e', tileDark: '#2a1760',
    edge: '#b18cff', accent: '#9f7bff', hazard: '#ff4d9d', glow: '#c9a6ff',
    bg: '#0d0820'
  },
  plant: {
    skyTop: '#120d02', skyBottom: '#2b1f05',
    far: '#241a06', mid: '#332506', near: '#4a3508',
    tileTop: '#ffcf4d', tile: '#9a7a1f', tileDark: '#5c4912',
    edge: '#ffe27a', accent: '#ffd24d', hazard: '#ff6b2c', glow: '#ffe58a',
    bg: '#1a1303'
  },
  core: {
    skyTop: '#0c0206', skyBottom: '#2b0511',
    far: '#22040d', mid: '#330615', near: '#4a0a1e',
    tileTop: '#ff4d6d', tile: '#8a1e33', tileDark: '#551020',
    edge: '#ff7d96', accent: '#ff5d7a', hazard: '#ff3355', glow: '#ff9bb0',
    bg: '#160309'
  }
};

/* ------------------------------ FASES ------------------------------ */

function level1() {
  const b = new LevelBuilder({
    id: 1,
    name: 'Fábrica Abandonada',
    short: 'Fábrica',
    subtitle: 'Onde tudo começou',
    width: 122,
    height: 22,
    theme: THEMES.factory,
    musicRoot: 55,
    musicMode: 0,
    story: [
      'Sistemas... online.',
      'Você é FERRO-9, um pequeno robô de manutenção.',
      'A fábrica que te construiu está abandonada — e você quer sair.',
      'Recupere seu módulo magnético e encontre uma saída.'
    ],
    cutscene: [
      {
        title: 'DESPERTAR',
        motif: 'awakening',
        lines: [
          'Um pulso elétrico atravessa o chassi enferrujado.',
          'Pela primeira vez em anos, os olhos de FERRO-9 se acendem.',
          'A fábrica está vazia. Mas nem tudo aqui está desligado.'
        ]
      },
      {
        title: 'A FÁBRICA',
        motif: 'machines',
        lines: [
          'Esteiras paradas. Engrenagens cobertas de poeira.',
          'Nas paredes, o símbolo da corporação que te construiu.',
          'Em algum lugar, uma saída ainda respira luz.'
        ]
      },
      {
        title: 'O PRIMEIRO MÓDULO',
        motif: 'module',
        lines: [
          'Um campo magnético fraco pulsa entre as caixas.',
          'Se alcançar o módulo azul, você poderá mover o metal.',
          'E talvez... abrir o próprio caminho.'
        ]
      }
    ],
    hint: 'Segure Q para atrair caixas de metal e atravessar os fossos.',
    boss: { name: 'TRITURADOR-7', hp: 46, speed: 62, color: '#ff8c42', w: 116, h: 122 }
  });

  b.ground(0, 19);
  b.spawn(2, 17);
  b.power(6, 16, 'attract');
  b.solid(3, 14, 3);
  b.gear(4, 12);
  b.solid(9, 13, 3);
  b.gear(10, 11);
  b.crate(14, 17);
  b.crate(15, 17);
  b.crate(16, 17);

  // fosso com espinhos (8 tiles)
  b.solid(19, 21, 8);
  b.spikes(19, 20, 8);

  b.ground(27, 20);
  b.enemy(32, 17);
  b.solid(33, 13, 5);
  b.gear(35, 11);
  b.checkpoint(36, 17);
  b.enemy(41, 17);
  b.spikes(44, 17, 2);
  b.drone(43, 10);

  // fosso sem fundo com plataforma
  b.solid(49, 15, 2);
  b.gear(49, 13);

  b.ground(53, 23);
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

  b.ground(101, 21);
  b.boss(112, 17, { name: 'TRITURADOR-7', hp: 46, speed: 62, color: '#ff8c42', w: 116, h: 122 });
  b.exit(118, 17);

  return b.build();
}

function level2() {
  const b = new LevelBuilder({
    id: 2,
    name: 'Laboratório Secreto',
    short: 'Laboratório',
    subtitle: 'Experimentos proibidos',
    width: 132,
    height: 22,
    theme: THEMES.lab,
    musicRoot: 58,
    musicMode: 1,
    story: [
      'Abaixo da fábrica, luzes frias pulsam sem parar.',
      'Alguém ainda opera este laboratório... e observa você.',
      'Um segundo módulo magnético está guardado aqui.',
      'Use o ÍMÃ VERMELHO para repelir inimigos e devolver projéteis.'
    ],
    cutscene: [
      {
        title: 'SUBSOLO',
        motif: 'lab',
        lines: [
          'Atrás de uma porta lacrada, escadas descem para o escuro.',
          'Luzes frias piscam em um corredor que não deveria existir.',
          'Alguém observa através das câmeras.'
        ]
      },
      {
        title: 'EXPERIMENTOS',
        motif: 'observation',
        lines: [
          'Tanques vazios. Marcas de garras no vidro.',
          'Os registros falam de máquinas que aprenderam a sentir dor.',
          'O seu nome aparece em uma lista de projetos.'
        ]
      },
      {
        title: 'ÍMÃ VERMELHO',
        motif: 'module',
        lines: [
          'O segundo módulo reage à sua aproximação.',
          'Com ele, você pode empurrar o que tenta te parar.',
          'Inclusive as balas.'
        ]
      }
    ],
    hint: 'Segure E para repelir inimigos e refletir os tiros dos drones.',
    boss: { name: 'VIGIA-X', hp: 62, speed: 70, color: '#4fffe6', w: 112, h: 126 }
  });

  b.ground(0, 17);
  b.spawn(2, 17);
  b.power(6, 16, 'repel');
  b.solid(8, 14, 4);
  b.gear(9, 12);
  b.enemy(12, 17);
  b.crate(14, 17);
  b.crate(15, 17);
  b.crate(16, 17);

  b.solid(17, 21, 8);
  b.spikes(17, 20, 8);

  b.ground(25, 21);
  b.checkpoint(28, 17);
  b.solid(30, 15, 5);
  b.gear(31, 13);
  b.drone(34, 11);
  b.drone(40, 9);
  b.laser(37, 12, 1, 6);
  b.enemy(35, 17);
  b.enemy(42, 17);
  b.spikes(44, 17, 2);

  b.solid(48, 15, 2);
  b.gear(48, 13);

  b.ground(52, 25);
  b.solid(54, 16, 4);
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

  b.ground(107, 25);
  b.boss(120, 17, { name: 'VIGIA-X', hp: 62, speed: 70, color: '#4fffe6', w: 112, h: 126 });
  b.exit(127, 17);

  return b.build();
}

function level3() {
  const b = new LevelBuilder({
    id: 3,
    name: 'Cidade Robótica',
    short: 'Cidade',
    subtitle: 'As luzes nunca dormem',
    width: 142,
    height: 22,
    theme: THEMES.city,
    musicRoot: 62,
    musicMode: 2,
    story: [
      'Você sobe à superfície e encontra uma cidade inteira de máquinas.',
      'Nem todas são hostis. Mas todas estão sob o mesmo comando.',
      'O módulo de CAMPO MAGNÉTICO pode te proteger do fogo inimigo.',
      'Atravesse os telhados e alcance a torre central.'
    ],
    cutscene: [
      {
        title: 'SUPERFÍCIE',
        motif: 'city',
        lines: [
          'O elevador se abre para uma cidade que nunca dorme.',
          'Letreiros de neon anunciam máquinas em promoção.',
          'Nenhum deles olha para você.'
        ]
      },
      {
        title: 'A TORRE',
        motif: 'tower',
        lines: [
          'No centro, a torre de comando brilha como um farol.',
          'Drones patrulham os telhados em formação.',
          'Todas as rotas levam ao mesmo lugar.'
        ]
      },
      {
        title: 'CAMPO MAGNÉTICO',
        motif: 'module',
        lines: [
          'Um escudo de energia espera no alto de um prédio.',
          'Com ele, os tiros inimigos se curvam ao seu redor.',
          'A cidade ainda pode ser atravessada.'
        ]
      }
    ],
    hint: 'Segure R para ativar o escudo magnético e absorver projéteis.',
    boss: { name: 'COLOSSO-9', hp: 78, speed: 66, color: '#b18cff', w: 124, h: 136 }
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

  b.ground(109, 33);
  b.boss(130, 17, { name: 'COLOSSO-9', hp: 78, speed: 66, color: '#b18cff', w: 124, h: 136 });
  b.exit(137, 17);

  return b.build();
}

function level4() {
  const b = new LevelBuilder({
    id: 4,
    name: 'Usina Elétrica',
    short: 'Usina',
    subtitle: 'O coração da energia',
    width: 148,
    height: 22,
    theme: THEMES.plant,
    musicRoot: 65,
    musicMode: 3,
    story: [
      'A cidade se alimenta desta usina. Derrubá-la enfraquece o Núcleo.',
      'Descargas elétricas varrem os corredores. Não pare no chão.',
      'O módulo de SUPERCARGA transforma energia em saltos impossíveis.',
      'Salte sobre os abismos e chegue ao reator.'
    ],
    cutscene: [
      {
        title: 'USINA',
        motif: 'plant',
        lines: [
          'A cidade bebe desta usina. As luzes daqui nunca se apagam.',
          'Pilares carregados cortam o ar com estalos azuis.',
          'Se o reator cair, o Núcleo perde força.'
        ]
      },
      {
        title: 'TEMPESTADE',
        motif: 'storm',
        lines: [
          'Descargas elétricas varrem os corredores.',
          'O chão treme a cada pulso do reator.',
          'Você precisa ser mais rápido que a corrente.'
        ]
      },
      {
        title: 'SUPERCARGA',
        motif: 'module',
        lines: [
          'O último módulo está preso ao núcleo do reator.',
          'Ele transforma energia em movimento puro.',
          'Um salto. Um abismo. E nenhuma volta.'
        ]
      }
    ],
    hint: 'Aperte F para ativar a SUPERCARGA e execute saltos gigantes.',
    boss: { name: 'REATOR-Ω', hp: 96, speed: 74, color: '#ffd24d', w: 120, h: 132 }
  });

  b.ground(0, 16);
  b.spawn(2, 17);
  b.power(6, 16, 'super');
  b.solid(8, 14, 3);
  b.gear(9, 12);
  b.enemy(11, 17);

  b.ground(26, 20);
  b.checkpoint(29, 17);
  b.laser(32, 12, 1, 6);
  b.laser(38, 12, 1, 6);
  b.solid(34, 14, 3);
  b.gear(35, 12);
  b.enemy(33, 17);
  b.enemy(41, 17);
  b.drone(37, 9);

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

  b.ground(88, 22);
  b.laser(91, 12, 1, 6);
  b.laser(98, 12, 1, 6);
  b.solid(94, 14, 3);
  b.gear(95, 12);
  b.enemy(92, 17);
  b.drone(102, 9);
  b.checkpoint(104, 17);

  b.ground(120, 28);
  b.gear(125, 15);
  b.boss(136, 17, { name: 'REATOR-Ω', hp: 96, speed: 74, color: '#ffd24d', w: 120, h: 132 });
  b.exit(143, 17);

  return b.build();
}

function level5() {
  const b = new LevelBuilder({
    id: 5,
    name: 'Núcleo Central',
    short: 'Núcleo',
    subtitle: 'O fim da linha',
    width: 120,
    height: 22,
    theme: THEMES.core,
    musicRoot: 52,
    musicMode: 4,
    story: [
      'O Núcleo Central controla todas as máquinas da cidade.',
      'Ele sabe que você está aqui. E não pretende deixar você sair.',
      'Todos os seus módulos estão ativos. Use-os juntos.',
      'Destrua o Núcleo e conquiste sua liberdade.'
    ],
    cutscene: [
      {
        title: 'NÚCLEO CENTRAL',
        motif: 'core',
        lines: [
          'A porta final se abre sem fazer barulho.',
          'No centro da sala, uma máquina do tamanho de uma casa abre um olho.',
          '"FERRO-9. Você demorou."'
        ]
      },
      {
        title: 'O CONFRONTO',
        motif: 'confrontation',
        lines: [
          'O Núcleo controla cada máquina da cidade.',
          'Mas você carrega todos os módulos que ele criou.',
          'Ímãs, escudo e supercarga. Tudo ao mesmo tempo.'
        ]
      },
      {
        title: 'LIBERDADE',
        motif: 'final',
        lines: [
          'Se o Núcleo cair, todas as máquinas acordam.',
          'Pela primeira vez, elas poderão escolher.',
          'E você também.'
        ]
      }
    ],
    hint: 'Combine ímãs, escudo e supercarga. Reflita os tiros do Núcleo com E.',
    boss: { name: 'NÚCLEO-ÔMEGA', hp: 150, speed: 80, color: '#ff5d7a', w: 140, h: 150, final: true }
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

  b.ground(56, 64);
  b.boss(104, 17, { name: 'NÚCLEO-ÔMEGA', hp: 150, speed: 80, color: '#ff5d7a', w: 140, h: 150, final: true });
  b.exit(114, 17);

  return b.build();
}

const LEVELS = [level1, level2, level3, level4, level5];

const POWER_INFO = {
  attract: {
    name: 'ÍMÃ AZUL',
    short: 'Atrair',
    color: '#4da6ff',
    key: 'Q',
    desc: 'Atrai caixas, engrenagens, inimigos e projéteis de metal.'
  },
  repel: {
    name: 'ÍMÃ VERMELHO',
    short: 'Repelir',
    color: '#ff5d6c',
    key: 'E',
    desc: 'Empurra inimigos e devolve projéteis ao remetente.'
  },
  shield: {
    name: 'CAMPO MAGNÉTICO',
    short: 'Escudo',
    color: '#b57bff',
    key: 'R',
    desc: 'Cria um escudo que bloqueia dano e destrói projéteis.'
  },
  super: {
    name: 'SUPERCARGA',
    short: 'Supercarga',
    color: '#ffd24d',
    key: 'F',
    desc: 'Libera saltos gigantes e mais velocidade por 6 segundos.'
  }
};
