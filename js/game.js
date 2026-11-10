'use strict';

/* ============================================================
   FERRO-9 — lógica principal e fluxo de telas
   ============================================================ */

class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    Input.init(this.canvas);

    this.state = 'menu';
    this.time = 0;
    this.menuTime = 0;
    this.menuIndex = 0;
    this.pauseIndex = 0;
    this.resetIndex = 0;
    this.selectedLevel = 0;
    this.tutorialStep = 0;
    this.tutorialTime = 0;
    this.usedMagnet = false;
    this.usedRepel = false;
    this.usedMelee = false;
    this.usedShot = false;
    this.lastFrame = performance.now();
    this.save = loadSave();
    this.powers = new Set(this.save ? this.save.powers : []);
    this.difficulty = this.save ? clamp(this.save.difficulty ?? 1, 0, DIFFICULTIES.length - 1) : 1;
    this.diff = DIFFICULTIES[this.difficulty];
    this.selectedDifficulty = this.difficulty;
    this.cutsceneIndex = 0;
    this.cutsceneTime = 0;
    this.cutsceneReveal = 0;

    this.level = null;
    this.levelIndex = 0;
    this.player = null;
    this.crates = [];
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.checkpoints = [];
    this.exit = null;
    this.boss = null;
    this.bossDefeated = false;
    this.bossActive = false;

    this.cam = { x: 0, y: 0, shake: 0 };
    this.toasts = [];
    this.stats = { gears: 0, cores: 0, deaths: 0, time: 0 };
    this.totalGears = 0;
    this.totalCores = 0;
    this.checkpointPos = { x: 0, y: 0 };
    this.completeStats = null;

    this.menuRects = [];
    this.levelRects = [];
    this.pauseRects = [];
    this.completeRects = [];
    this.helpRect = null;

    window.ferro9 = this;
    requestAnimationFrame((t) => this.loop(t));
  }

  /* ------------------------------ SAVE ------------------------------ */

  ensureSave() {
    if (!this.save) {
      this.save = {
        unlocked: 1,
        powers: [],
        gears: {},
        cores: {},
        completed: [],
        difficulty: this.difficulty
      };
    }
    return this.save;
  }

  persist() {
    const s = this.ensureSave();
    s.powers = [...this.powers];
    s.difficulty = this.difficulty;
    writeSave(s);
  }

  hasProgress() {
    const s = this.save;
    return !!s && (s.unlocked > 1 || s.completed.length > 0);
  }

  /* ------------------------------ LOOP ------------------------------ */

  loop(t) {
    const dt = Math.min(0.033, (t - this.lastFrame) / 1000 || 0);
    this.lastFrame = t;
    this.time += dt;
    this.menuTime += dt;

    FX.update(dt);
    Sfx.updateMusic();
    this.updateToasts(dt);

    if (Input.pressed('KeyM')) {
      const muted = Sfx.toggleMute();
      if (this.state === 'playing' || this.state === 'paused') {
        this.toast(muted ? 'SOM DESLIGADO' : 'SOM LIGADO', '#7fe7ff', 1.4);
      }
    }

    switch (this.state) {
      case 'menu': this.updateMenu(dt); break;
      case 'difficulty': this.updateDifficulty(dt); break;
      case 'levelselect': this.updateLevelSelect(dt); break;
      case 'help': this.updateHelp(dt); break;
      case 'resetconfirm': this.updateResetConfirm(dt); break;
      case 'tutorial': this.updateTutorial(dt); break;
      case 'cutscene': this.updateCutscene(dt); break;
      case 'story': this.updateStory(dt); break;
      case 'playing': this.updatePlaying(dt); break;
      case 'paused': this.updatePaused(dt); break;
      case 'complete': this.updateComplete(dt); break;
      case 'victory': this.updateVictory(dt); break;
    }

    this.render();
    Input.endFrame();
    requestAnimationFrame((nt) => this.loop(nt));
  }

  /* ------------------------------ MENU ------------------------------ */

  menuLayout() {
    const has = this.hasProgress();
    const items = [
      { label: has ? 'CONTINUAR' : 'INICIAR', action: 'start' },
      { label: 'DIFICULDADE: ' + DIFFICULTIES[this.difficulty].name, action: 'difficulty' },
      { label: 'TUTORIAL', action: 'tutorial' },
      { label: 'SELECIONAR FASE', action: 'levels' },
      { label: 'COMO JOGAR', action: 'help' }
    ];
    if (has) items.push({ label: 'APAGAR PROGRESSO', action: 'reset' });

    const startY = 298;
    const w = 380, h = 44, gap = 9;
    return items.map((it, i) => ({
      ...it,
      x: VIEW_W / 2 - w / 2,
      y: startY + i * (h + gap),
      w, h
    }));
  }

  updateMenu() {
    const rects = this.menuLayout();
    this.menuRects = rects;
    this.menuIndex = clamp(this.menuIndex, 0, rects.length - 1);

    for (let i = 0; i < rects.length; i++) {
      if (Input.hoverIn(rects[i].x, rects[i].y, rects[i].w, rects[i].h)) this.menuIndex = i;
    }

    if (Input.pressed('ArrowUp', 'KeyW')) {
      this.menuIndex = (this.menuIndex - 1 + rects.length) % rects.length;
      Sfx.tone(360, 0.05, { type: 'square', vol: 0.03 });
    }
    if (Input.pressed('ArrowDown', 'KeyS')) {
      this.menuIndex = (this.menuIndex + 1) % rects.length;
      Sfx.tone(360, 0.05, { type: 'square', vol: 0.03 });
    }

    let action = null;
    if (Input.pressed('Enter', 'Space')) action = rects[this.menuIndex].action;
    for (const r of rects) if (Input.clickIn(r.x, r.y, r.w, r.h)) action = r.action;

    if (action === 'start') {
      if (this.hasProgress()) this.continueGame();
      else this.startNewGame();
    } else if (action === 'difficulty') {
      this.selectedDifficulty = this.difficulty;
      this.state = 'difficulty';
      Sfx.tone(500, 0.06, { type: 'square', vol: 0.04 });
    } else if (action === 'tutorial') {
      this.startTutorial();
    } else if (action === 'levels') {
      const s = this.ensureSave();
      this.selectedLevel = clamp(s.unlocked - 1, 0, 4);
      this.state = 'levelselect';
      Sfx.tone(500, 0.06, { type: 'square', vol: 0.04 });
    } else if (action === 'help') {
      this.state = 'help';
      Sfx.tone(500, 0.06, { type: 'square', vol: 0.04 });
    } else if (action === 'reset') {
      this.state = 'resetconfirm';
      this.resetIndex = 0;
    }
  }

  startNewGame() {
    clearSave();
    this.save = {
      unlocked: 1,
      powers: [],
      gears: {},
      cores: {},
      completed: [],
      difficulty: this.difficulty
    };
    this.powers.clear();
    this.startTutorial();
  }

  startTutorial() {
    this.loadLevel(0);
    this.tutorialStep = 0;
    this.tutorialTime = 0;
    this.state = 'tutorial';
    Sfx.stopMusic();
  }

  tutorialSteps() {
    return [
      {
        type: 'text',
        title: 'CALIBRAGEM INICIAL',
        lines: [
          'Sistemas de FERRO-9 reiniciados.',
          'Antes de escapar, vamos testar seus circuitos.',
          'Siga as instruções usando o teclado.'
        ]
      },
      {
        type: 'action',
        title: 'MOVER',
        desc: 'Segure A ou D (ou as setas) para andar.',
        keys: ['A', 'D'],
        test: () => Input.isDown('KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight')
      },
      {
        type: 'action',
        title: 'PULAR',
        desc: 'Pressione ESPAÇO. Segure para saltar mais alto.',
        keys: ['ESPAÇO'],
        test: () => Input.pressed('Space', 'KeyW', 'ArrowUp')
      },
      {
        type: 'action',
        title: 'CORRER',
        desc: 'Segure SHIFT enquanto se move para correr.',
        keys: ['SHIFT', 'A/D'],
        test: () => Input.isDown('ShiftLeft', 'ShiftRight') &&
          Input.isDown('KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight')
      },
      {
        type: 'action',
        title: 'GOLPE',
        desc: 'Pressione J ou clique com o botão esquerdo para atacar.',
        keys: ['J', 'CLIQUE'],
        test: () => Input.pressed('KeyJ') || Input.mouse.clicked
      },
      {
        type: 'action',
        title: 'TIRO DE ENERGIA',
        desc: 'Pressione K ou clique com o botão direito para disparar.',
        keys: ['K', 'CLIQUE DIR.'],
        test: () => Input.pressed('KeyK') || Input.mouse.rightClicked
      },
      {
        type: 'text',
        title: 'ÍMÃ AZUL',
        lines: [
          'O módulo azul está logo à frente, na fábrica.',
          'Segure Q perto de caixas de metal para atraí-las.',
          'Caixas podem virar pontes sobre fossos e espinhos.'
        ],
        keys: ['Q']
      },
      {
        type: 'text',
        title: 'OUTROS PODERES',
        lines: [
          'E — ÍMÃ VERMELHO: repele inimigos e reflete projéteis.',
          'R — CAMPO MAGNÉTICO: escudo que bloqueia dano.',
          'F — SUPERCARGA: saltos gigantes por 6 segundos.',
          'Você vai desbloquear cada um nas próximas fases.'
        ]
      },
      {
        type: 'text',
        title: 'SISTEMAS PRONTOS',
        lines: [
          'Tudo calibrado.',
          'A saída fica no fim da fábrica — e algo grande a protege.',
          'Boa sorte, FERRO-9.'
        ]
      }
    ];
  }

  updateTutorial(dt) {
    this.tutorialTime += dt;
    const steps = this.tutorialSteps();
    const step = steps[Math.min(this.tutorialStep, steps.length - 1)];

    if (Input.pressed('Escape') || Input.clickIn(VIEW_W - 300, VIEW_H - 72, 260, 48)) {
      this.finishTutorial();
      return;
    }

    if (step.type === 'text') {
      if (Input.pressed('Enter', 'Space') || Input.clickIn(VIEW_W / 2 - 190, 596, 380, 54)) {
        this.advanceTutorial();
      }
    } else if (step.type === 'action' && step.test()) {
      this.advanceTutorial();
    }
  }

  advanceTutorial() {
    const steps = this.tutorialSteps();
    this.tutorialStep++;
    Sfx.tone(520 + this.tutorialStep * 40, 0.09, { type: 'square', vol: 0.06 });
    if (this.tutorialStep >= steps.length) {
      this.finishTutorial();
    }
  }

  finishTutorial() {
    this.startCutscene(0, true);
    Sfx.tone(660, 0.16, { type: 'triangle', vol: 0.1 });
    Sfx.tone(880, 0.24, { type: 'triangle', vol: 0.1, delay: 0.1 });
  }

  continueGame() {
    const s = this.ensureSave();
    this.powers = new Set(s.powers || []);
    this.beginLevel(clamp(s.unlocked - 1, 0, 4), true);
  }

  /* ------------------------------ DIFICULDADE ------------------------------ */

  difficultyLayout() {
    const w = 250, h = 320, gap = 22;
    const total = w * DIFFICULTIES.length + gap * (DIFFICULTIES.length - 1);
    const startX = (VIEW_W - total) / 2;
    return DIFFICULTIES.map((diff, i) => ({
      diff,
      index: i,
      x: startX + i * (w + gap),
      y: 236,
      w, h
    }));
  }

  updateDifficulty() {
    const cards = this.difficultyLayout();
    this.difficultyRects = cards;

    for (const c of cards) {
      if (Input.hoverIn(c.x, c.y, c.w, c.h)) this.selectedDifficulty = c.index;
    }

    if (Input.pressed('ArrowLeft', 'KeyA')) {
      this.selectedDifficulty = clamp(this.selectedDifficulty - 1, 0, DIFFICULTIES.length - 1);
      Sfx.tone(420, 0.05, { type: 'square', vol: 0.03 });
    }
    if (Input.pressed('ArrowRight', 'KeyD')) {
      this.selectedDifficulty = clamp(this.selectedDifficulty + 1, 0, DIFFICULTIES.length - 1);
      Sfx.tone(420, 0.05, { type: 'square', vol: 0.03 });
    }

    if (Input.pressed('Escape')) {
      this.state = 'menu';
      Sfx.tone(280, 0.07, { type: 'square', vol: 0.04 });
      return;
    }

    let pick = Input.pressed('Enter', 'Space') ? this.selectedDifficulty : null;
    for (const c of cards) {
      if (Input.clickIn(c.x, c.y, c.w, c.h)) pick = c.index;
    }

    if (pick !== null) {
      this.setDifficulty(pick);
      this.state = 'menu';
    }
  }

  setDifficulty(index) {
    this.difficulty = clamp(index, 0, DIFFICULTIES.length - 1);
    this.diff = DIFFICULTIES[this.difficulty];
    this.selectedDifficulty = this.difficulty;
    const s = this.ensureSave();
    s.difficulty = this.difficulty;
    this.persist();
    Sfx.tone(520, 0.08, { type: 'triangle', vol: 0.08 });
    Sfx.tone(780, 0.12, { type: 'triangle', vol: 0.07, delay: 0.07 });
    this.toast('DIFICULDADE: ' + this.diff.name, this.diff.color, 2.2);
  }

  /* ------------------------------ SELEÇÃO DE FASE ------------------------------ */

  levelLayout() {
    const w = 196, h = 250, gap = 18;
    const total = w * 5 + gap * 4;
    const startX = (VIEW_W - total) / 2;
    return LEVELS.map((fn, i) => ({
      x: startX + i * (w + gap),
      y: 320,
      w, h,
      index: i
    }));
  }

  updateLevelSelect() {
    const cards = this.levelLayout();
    this.levelRects = cards;
    const s = this.ensureSave();
    const unlocked = s.unlocked;

    for (const c of cards) {
      if (Input.hoverIn(c.x, c.y, c.w, c.h)) this.selectedLevel = c.index;
    }

    if (Input.pressed('ArrowLeft', 'KeyA')) this.selectedLevel = clamp(this.selectedLevel - 1, 0, 4);
    if (Input.pressed('ArrowRight', 'KeyD')) this.selectedLevel = clamp(this.selectedLevel + 1, 0, 4);
    if (Input.pressed('ArrowUp', 'KeyW')) this.selectedLevel = clamp(this.selectedLevel - 1, 0, 4);
    if (Input.pressed('ArrowDown', 'KeyS')) this.selectedLevel = clamp(this.selectedLevel + 1, 0, 4);

    if (Input.pressed('Escape')) {
      this.state = 'menu';
      return;
    }

    let go = Input.pressed('Enter', 'Space');
    for (const c of cards) {
      if (Input.clickIn(c.x, c.y, c.w, c.h)) {
        this.selectedLevel = c.index;
        go = true;
      }
    }

    if (go) {
      if (this.selectedLevel + 1 <= unlocked) {
        this.beginLevel(this.selectedLevel, false);
      } else {
        Sfx.tone(120, 0.18, { type: 'square', vol: 0.08, slide: -40 });
        this.toast('FASE BLOQUEADA', '#ff5d6c', 1.4);
      }
    }
  }

  /* ------------------------------ AJUDA ------------------------------ */

  updateHelp() {
    if (Input.pressed('Escape', 'Enter', 'Space') || Input.clickIn(0, 0, VIEW_W, VIEW_H)) {
      this.state = 'menu';
    }
  }

  /* ------------------------------ RESET ------------------------------ */

  updateResetConfirm() {
    if (Input.pressed('ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Tab')) {
      this.resetIndex = 1 - this.resetIndex;
    }
    if (Input.pressed('Escape')) {
      this.state = 'menu';
      return;
    }
    if (Input.pressed('Enter', 'Space')) {
      if (this.resetIndex === 1) {
        clearSave();
        this.save = null;
        this.powers.clear();
        this.toast('PROGRESSO APAGADO', '#ff5d6c', 2);
      }
      this.state = 'menu';
      this.menuIndex = 0;
    }
  }

  /* ------------------------------ HISTÓRIA ------------------------------ */

  updateStory() {
    if (Input.pressed('Enter', 'Space') || Input.clickIn(0, 0, VIEW_W, VIEW_H)) {
      this.startPlaying();
    } else if (Input.pressed('Escape')) {
      this.state = 'menu';
    }
  }

  startPlaying() {
    this.state = 'playing';
    Sfx.startMusic(this.level.musicRoot, this.level.musicMode);
    if (this.level.hint) this.toast(this.level.hint, '#7fe7ff', 4.5);
    this.cam.x = clamp(this.player.cx - VIEW_W / 2, 0, Math.max(0, this.level.widthPx - VIEW_W));
    this.cam.y = 0;
  }

  /* ------------------------------ CARREGAR FASE ------------------------------ */

  loadLevel(index) {
    this.levelIndex = index;
    const level = LEVELS[index]();
    this.level = level;

    this.crates = [];
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.checkpoints = [];
    this.exit = null;
    this.boss = null;
    this.bossDefeated = false;
    this.bossActive = false;
    this.toasts = [];
    FX.clear();

    let spawn = { tx: 2, ty: 17 };
    let gears = 0, cores = 0;

    for (const e of level.entities) {
      const cx = e.tx * TILE + TILE / 2;
      const bottom = e.ty * TILE + TILE;
      switch (e.kind) {
        case 'spawn':
          spawn = e;
          break;
        case 'crate':
          this.crates.push(new Crate(cx, bottom));
          break;
        case 'walker':
          this.enemies.push(new Walker(cx, bottom, this));
          break;
        case 'drone':
          this.enemies.push(new Drone(cx, bottom, this));
          break;
        case 'gear':
          this.pickups.push(new Pickup('gear', cx, e.ty * TILE + TILE / 2));
          gears++;
          break;
        case 'core':
          this.pickups.push(new Pickup('core', cx, e.ty * TILE + TILE / 2));
          cores++;
          break;
        case 'power':
          this.pickups.push(new Pickup('power', cx, e.ty * TILE + TILE / 2, { power: e.power }));
          break;
        case 'checkpoint':
          this.checkpoints.push(new Checkpoint(cx, bottom));
          break;
        case 'exit':
          this.exit = new Exit(cx, bottom);
          break;
        case 'boss':
          this.boss = new Boss(cx, bottom, e.boss, this);
          break;
      }
    }

    this.totalGears = gears;
    this.totalCores = cores;
    this.stats = { gears: 0, cores: 0, deaths: 0, time: 0 };
    this.completeStats = null;
    this.usedMagnet = false;
    this.usedRepel = false;
    this.usedMelee = false;
    this.usedShot = false;

    this.player = new Player(spawn.tx * TILE + TILE / 2, spawn.ty * TILE + TILE, this);
    const diff = this.diff || DIFFICULTIES[this.difficulty];
    this.player.maxHp = diff.playerHp;
    this.player.hp = diff.playerHp;
    this.checkpointPos = { x: this.player.cx, y: this.player.bottom };
    this.cam = { x: 0, y: 0, shake: 0 };
    this.cam.x = clamp(this.player.cx - VIEW_W / 2, 0, Math.max(0, level.widthPx - VIEW_W));
  }

  beginLevel(index, showStory) {
    this.loadLevel(index);
    if (showStory) {
      this.startCutscene(index, true);
    } else {
      this.startPlaying();
    }
  }

  /* ------------------------------ CUTSCENE ------------------------------ */

  startCutscene(index, thenStory) {
    this.cutsceneIndex = 0;
    this.cutsceneTime = 0;
    this.cutsceneReveal = 0;
    this.cutsceneThenStory = !!thenStory;
    this.state = 'cutscene';
    Sfx.stopMusic();
    Sfx.tone(240, 0.2, { type: 'sine', vol: 0.06, slide: 180 });
  }

  cutsceneSlides() {
    return (this.level && this.level.cutscene) || [];
  }

  cutsceneSlide() {
    const slides = this.cutsceneSlides();
    return slides[clamp(this.cutsceneIndex, 0, Math.max(0, slides.length - 1))] || null;
  }

  cutsceneText(slide) {
    return slide ? slide.lines.join('\n') : '';
  }

  updateCutscene(dt) {
    this.cutsceneTime += dt;
    const slides = this.cutsceneSlides();
    const slide = this.cutsceneSlide();

    if (!slide) {
      this.finishCutscene();
      return;
    }

    const total = this.cutsceneText(slide).length;
    this.cutsceneReveal = Math.min(total, this.cutsceneReveal + dt * 46);

    if (Input.pressed('Escape')) {
      this.finishCutscene();
      return;
    }

    const advance = Input.pressed('Enter', 'Space') || Input.mouse.clicked;
    if (!advance) return;

    if (this.cutsceneReveal < total) {
      this.cutsceneReveal = total;
      Sfx.tone(520, 0.04, { type: 'square', vol: 0.03 });
      return;
    }

    this.cutsceneIndex++;
    this.cutsceneTime = 0;
    this.cutsceneReveal = 0;
    if (this.cutsceneIndex >= slides.length) {
      this.finishCutscene();
    } else {
      Sfx.tone(460, 0.07, { type: 'triangle', vol: 0.05, slide: 80 });
    }
  }

  finishCutscene() {
    if (this.cutsceneThenStory) {
      this.state = 'story';
    } else {
      this.startPlaying();
    }
  }

  /* ------------------------------ JOGO ------------------------------ */

  updatePlaying(dt) {
    const level = this.level;
    level.update(dt);
    this.stats.time += dt;

    this.player.update(dt);
    this.updateMagnet(dt);

    if (Input.pressed('KeyJ') || Input.mouse.clicked) this.usedMelee = true;
    if (Input.pressed('KeyK') || Input.mouse.rightClicked) this.usedShot = true;

    if (this.player.attract && !this.usedMagnet) {
      this.usedMagnet = true;
      if (this.level.id === 1) {
        this.toast('ÍMÃ AZUL ATIVO — arraste as caixas para o fosso', '#4da6ff', 3.4);
      }
    }
    if (this.player.repel && !this.usedRepel) {
      this.usedRepel = true;
      this.toast('ÍMÃ VERMELHO ATIVO — inimigos e tiros são empurrados', '#ff5d6c', 3);
    }

    for (const c of this.crates) {
      c.impactCd = Math.max(0, (c.impactCd || 0) - dt);
      c.update(dt, this);
    }
    this.resolveCrates();

    for (const e of this.enemies) e.update(dt, this);
    if (this.boss) this.boss.update(dt, this);

    this.handleCrateImpacts();

    for (const pr of this.projectiles) pr.update(dt, this);
    for (const pk of this.pickups) pk.update(dt, this);
    for (const cp of this.checkpoints) cp.update(dt, this);
    if (this.exit) {
      this.exit.open = this.bossDefeated;
      this.exit.update(dt, this);
    }

    this.crates = this.crates.filter((c) => !c.dead);
    this.enemies = this.enemies.filter((e) => !e.dead);
    this.projectiles = this.projectiles.filter((p) => !p.dead);
    this.pickups = this.pickups.filter((p) => !p.dead);

    this.updateCamera(dt);

    if (this.state === 'playing' && Input.pressed('Escape', 'KeyP')) {
      this.state = 'paused';
      this.pauseIndex = 0;
      Sfx.tone(300, 0.08, { type: 'square', vol: 0.04 });
    }
  }

  updateMagnet(dt) {
    const p = this.player;
    if (!p || p.dead) return;
    const range = p.magnetRange();
    const attract = p.attract;
    const repel = p.repel;

    if (attract || repel) {
      for (const c of this.crates) {
        const dx = p.cx - (c.x + c.w / 2);
        const dy = p.cy - (c.y + c.h / 2);
        const d = Math.hypot(dx, dy);
        if (d > range || d < 1) continue;
        const nx = dx / d, ny = dy / d;
        const k = 1 - (d / range) * 0.4;
        if (attract) {
          c.vx += nx * 1700 * k * dt;
          c.vy += ny * 1500 * k * dt;
        } else {
          c.vx -= nx * 2350 * k * dt;
          c.vy -= ny * 1950 * k * dt;
        }
        c.magnetTimer = 0.18;
        c.glow = 1;
        if (Math.random() < 0.3) {
          FX.spawn(c.x + rand(0, c.w), c.y + rand(0, c.h), {
            color: attract ? '#4da6ff' : '#ff5d6c',
            life: 0.3, size: rand(1, 3), vy: rand(-40, 40)
          });
        }
      }

      for (const e of this.enemies) {
        if (e.dead) continue;
        const dx = p.cx - (e.x + e.w / 2);
        const dy = p.cy - (e.y + e.h / 2);
        const d = Math.hypot(dx, dy);
        if (d > range || d < 1) continue;
        const nx = dx / d, ny = dy / d;
        const k = 1 - (d / range) * 0.4;
        if (attract) {
          e.mx = clamp((e.mx || 0) + nx * 900 * k * dt, -620, 620);
          e.my = clamp((e.my || 0) + ny * 650 * k * dt, -620, 620);
        } else {
          e.mx = clamp((e.mx || 0) - nx * 1900 * k * dt, -700, 700);
          e.my = clamp((e.my || 0) - ny * 1250 * k * dt, -700, 700);
        }
        e.flash = Math.max(e.flash || 0, 0.04);
        if (Math.random() < 0.3) {
          FX.spawn(e.x + e.w / 2, e.y + e.h / 2, {
            color: attract ? '#4da6ff' : '#ff5d6c',
            life: 0.28, size: rand(1, 3), vx: rand(-70, 70), vy: rand(-70, 70)
          });
        }
      }

      if (repel) {
        for (const pr of this.projectiles) {
          if (pr.dead || pr.owner !== 'enemy') continue;
          if (dist(pr.x, pr.y, p.cx, p.cy) > range * 1.05) continue;
          let tx, ty;
          if (this.boss && !this.boss.dead) {
            tx = this.boss.cx;
            ty = this.boss.cy;
          } else {
            tx = pr.x - pr.vx;
            ty = pr.y - pr.vy;
          }
          const ang = Math.atan2(ty - pr.y, tx - pr.x);
          const spd = 640;
          pr.vx = Math.cos(ang) * spd;
          pr.vy = Math.sin(ang) * spd;
          pr.owner = 'player';
          pr.color = '#66e0ff';
          pr.life = 4;
          Sfx.tone(720, 0.1, { type: 'sine', vol: 0.06, slide: 260 });
          FX.burst(pr.x, pr.y, 8, { color: '#66e0ff', speedMax: 170, lifeMax: 0.35 });
        }
      }
    }

    if (p.shield) {
      for (const pr of this.projectiles) {
        if (pr.dead || pr.owner !== 'enemy') continue;
        if (dist(pr.x, pr.y, p.cx, p.cy) < 74) {
          pr.explode(this);
          FX.burst(pr.x, pr.y, 5, { color: '#b57bff', speedMax: 120, lifeMax: 0.3 });
        }
      }
      for (const e of this.enemies) {
        if (e.dead) continue;
        const dx = e.x + e.w / 2 - p.cx;
        const dy = e.y + e.h / 2 - p.cy;
        const d = Math.hypot(dx, dy);
        if (d < 90 && d > 1) {
          e.mx = clamp((e.mx || 0) + (dx / d) * 500 * dt, -500, 500);
          e.my = clamp((e.my || 0) + (dy / d) * 500 * dt, -500, 500);
        }
      }
    }
  }

  resolveCrates() {
    for (let i = 0; i < this.crates.length; i++) {
      for (let j = i + 1; j < this.crates.length; j++) {
        const a = this.crates[i];
        const b = this.crates[j];
        if (!aabb(a, b)) continue;
        const dx = (a.x + a.w / 2) - (b.x + b.w / 2);
        const dy = (a.y + a.h / 2) - (b.y + b.h / 2);
        const ox = (a.w + b.w) / 2 - Math.abs(dx);
        const oy = (a.h + b.h) / 2 - Math.abs(dy);
        if (ox < oy) {
          const push = ox / 2;
          if (dx > 0) { a.x += push; b.x -= push; }
          else { a.x -= push; b.x += push; }
          a.vx = 0;
          b.vx = 0;
        } else {
          const push = oy / 2;
          if (dy > 0) {
            a.y += push;
            b.y -= push;
            a.onGround = true;
          } else {
            a.y -= push;
            b.y += push;
            b.onGround = true;
          }
          a.vy = 0;
          b.vy = 0;
        }
      }
    }
  }

  handleCrateImpacts() {
    for (const c of this.crates) {
      if ((c.impactCd || 0) > 0) continue;
      const speed = Math.abs(c.vx) + Math.abs(c.vy);
      if (speed < 280) continue;
      if (this.boss && !this.boss.dead && aabb(c, this.boss)) {
        this.boss.takeDamage(5, this);
        c.impactCd = 0.55;
        c.vx *= -0.35;
        c.vy = -220;
        this.shake(0.4);
        continue;
      }
      for (const e of this.enemies) {
        if (!e.dead && aabb(c, e)) {
          e.hurt(2, this);
          c.impactCd = 0.3;
          c.vx *= -0.4;
        }
      }
    }
  }

  updateCamera(dt) {
    const p = this.player;
    const tx = clamp(p.cx - VIEW_W / 2, 0, Math.max(0, this.level.widthPx - VIEW_W));
    const ty = clamp(p.cy - VIEW_H * 0.58, 0, Math.max(0, this.level.heightPx - VIEW_H));
    this.cam.x = lerp(this.cam.x, tx, Math.min(1, 9 * dt));
    this.cam.y = lerp(this.cam.y, ty, Math.min(1, 7 * dt));
    this.cam.shake = Math.max(0, this.cam.shake - dt * 2.4);
  }

  shake(n) {
    this.cam.shake = Math.min(1.4, Math.max(this.cam.shake, n));
  }

  killPlayer() {
    if (!this.player || this.player.dead) return;
    this.player.dead = true;
    this.player.deadTimer = 1.25;
    this.player.hp = 0;
    this.stats.deaths++;
    this.shake(0.9);
    Sfx.tone(90, 0.5, { type: 'sawtooth', vol: 0.18, slide: -50 });
    Sfx.noise(0.35, 0.18, { freq: 420 });
    FX.burst(this.player.cx, this.player.cy, 26, {
      color: '#ff8c42', speedMax: 320, lifeMax: 0.9, sizeMax: 6, gravity: 500
    });
  }

  respawn() {
    const p = this.player;
    p.dead = false;
    p.hp = p.maxHp;
    p.energy = p.maxEnergy;
    p.invuln = 2;
    p.vx = 0;
    p.vy = 0;
    p.x = this.checkpointPos.x - p.w / 2;
    p.y = this.checkpointPos.y - p.h;
    this.projectiles = this.projectiles.filter((pr) => pr.owner === 'player');
    FX.burst(p.cx, p.cy, 18, { color: '#7fe7ff', speedMax: 220, lifeMax: 0.7 });
    Sfx.tone(440, 0.2, { type: 'sine', vol: 0.1, slide: 200 });
    this.toast('REINICIANDO...', '#7fe7ff', 1.2);
  }

  setCheckpoint(cp) {
    this.checkpointPos = { x: cp.x + cp.w / 2, y: cp.y + cp.h };
    const p = this.player;
    p.hp = p.maxHp;
    p.energy = p.maxEnergy;
    this.toast('CHECKPOINT ATIVADO', '#7fe7ff', 1.8);
  }

  collectPickup(pickup) {
    const p = this.player;
    if (pickup.kind === 'gear') {
      this.stats.gears++;
      const s = this.ensureSave();
      s.gears[this.level.id] = Math.max(s.gears[this.level.id] || 0, this.stats.gears);
      this.persist();
      Sfx.tone(880, 0.09, { type: 'sine', vol: 0.08 });
      Sfx.tone(1180, 0.12, { type: 'sine', vol: 0.07, delay: 0.06 });
      FX.burst(pickup.x, pickup.y, 12, { color: '#ffd24d', speedMax: 170, lifeMax: 0.5 });
    } else if (pickup.kind === 'core') {
      this.stats.cores++;
      const s = this.ensureSave();
      s.cores[this.level.id] = Math.max(s.cores[this.level.id] || 0, this.stats.cores);
      this.persist();
      Sfx.tone(660, 0.1, { type: 'sine', vol: 0.09 });
      Sfx.tone(990, 0.16, { type: 'sine', vol: 0.09, delay: 0.08 });
      FX.burst(pickup.x, pickup.y, 20, { color: '#ff5d7a', speedMax: 220, lifeMax: 0.7 });
      this.shake(0.25);
      this.toast('NÚCLEO ENCONTRADO', '#ff5d7a', 2);
    } else if (pickup.kind === 'power' && pickup.power) {
      const info = POWER_INFO[pickup.power];
      if (!this.powers.has(pickup.power)) {
        this.powers.add(pickup.power);
        this.persist();
        this.toast(info.name + ' DESBLOQUEADO!', info.color, 3);
        this.shake(0.4);
        Sfx.tone(330, 0.16, { type: 'triangle', vol: 0.12 });
        Sfx.tone(440, 0.16, { type: 'triangle', vol: 0.12, delay: 0.1 });
        Sfx.tone(660, 0.3, { type: 'triangle', vol: 0.12, delay: 0.2 });
        FX.burst(pickup.x, pickup.y, 30, {
          color: info.color, speedMax: 300, lifeMax: 0.9, sizeMax: 6
        });
      } else {
        p.energy = Math.min(p.maxEnergy, p.energy + 45);
        this.toast('ENERGIA RECARREGADA', info.color, 1.6);
        Sfx.tone(660, 0.14, { type: 'sine', vol: 0.08 });
        FX.burst(pickup.x, pickup.y, 14, { color: info.color, speedMax: 160, lifeMax: 0.5 });
      }
    }
  }

  onEnemyKilled(enemy) {
    FX.burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 20, {
      color: '#ffb066', speedMax: 280, lifeMax: 0.8, sizeMax: 6, gravity: 400
    });
    Sfx.tone(140, 0.16, { type: 'square', vol: 0.08, slide: -80 });
    Sfx.noise(0.16, 0.1, { freq: 800 });
    if (this.player) {
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 6);
    }
  }

  onBossDefeated(boss) {
    this.bossDefeated = true;
    if (this.exit) this.exit.open = true;
    this.toast('SAÍDA LIBERADA', '#7fe7ff', 2.6);
    this.shake(1);
    FX.burst(boss.cx, boss.cy, 40, {
      color: boss.color, speedMax: 380, lifeMax: 1.1, sizeMax: 8, gravity: 300
    });
  }

  completeLevel() {
    if (this.state !== 'playing') return;
    Sfx.stopMusic();
    this.stats.time = Math.round(this.stats.time);

    const s = this.ensureSave();
    s.unlocked = Math.max(s.unlocked, Math.min(5, this.level.id + 1));
    if (!s.completed.includes(this.level.id)) s.completed.push(this.level.id);
    s.gears[this.level.id] = Math.max(s.gears[this.level.id] || 0, this.stats.gears);
    s.cores[this.level.id] = Math.max(s.cores[this.level.id] || 0, this.stats.cores);
    this.persist();

    this.completeStats = { ...this.stats, level: this.level };
    this.state = this.level.id === 5 ? 'victory' : 'complete';
    this.shake(0.5);
    Sfx.tone(523, 0.16, { type: 'triangle', vol: 0.12 });
    Sfx.tone(659, 0.16, { type: 'triangle', vol: 0.12, delay: 0.12 });
    Sfx.tone(784, 0.4, { type: 'triangle', vol: 0.12, delay: 0.24 });
  }

  /* ------------------------------ PAUSA / FIM ------------------------------ */

  pauseLayout() {
    const items = [
      { label: 'CONTINUAR', action: 'resume' },
      { label: 'REINICIAR FASE', action: 'restart' },
      { label: 'SAIR PARA O MENU', action: 'menu' }
    ];
    const w = 360, h = 50, gap = 12;
    const startY = 400;
    return items.map((it, i) => ({
      ...it,
      x: VIEW_W / 2 - w / 2,
      y: startY + i * (h + gap),
      w, h
    }));
  }

  updatePaused() {
    const rects = this.pauseLayout();
    this.pauseRects = rects;
    if (Input.pressed('ArrowUp', 'KeyW')) this.pauseIndex = (this.pauseIndex - 1 + rects.length) % rects.length;
    if (Input.pressed('ArrowDown', 'KeyS')) this.pauseIndex = (this.pauseIndex + 1) % rects.length;
    for (let i = 0; i < rects.length; i++) {
      if (Input.hoverIn(rects[i].x, rects[i].y, rects[i].w, rects[i].h)) this.pauseIndex = i;
    }

    if (Input.pressed('Escape', 'KeyP')) {
      this.state = 'playing';
      return;
    }

    let action = Input.pressed('Enter', 'Space') ? rects[this.pauseIndex].action : null;
    for (const r of rects) if (Input.clickIn(r.x, r.y, r.w, r.h)) action = r.action;

    if (action === 'resume') {
      this.state = 'playing';
    } else if (action === 'restart') {
      this.loadLevel(this.levelIndex);
      this.startPlaying();
    } else if (action === 'menu') {
      Sfx.stopMusic();
      this.state = 'menu';
      this.menuIndex = 0;
    }
  }

  completeLayout() {
    return [{
      label: 'PRÓXIMA FASE',
      action: 'next',
      x: VIEW_W / 2 - 190,
      y: 560,
      w: 380,
      h: 54
    }];
  }

  updateComplete() {
    const rects = this.completeLayout();
    this.completeRects = rects;
    if (Input.pressed('Escape')) {
      this.state = 'menu';
      this.menuIndex = 0;
      return;
    }
    if (Input.pressed('Enter', 'Space') || Input.clickIn(rects[0].x, rects[0].y, rects[0].w, rects[0].h)) {
      if (this.levelIndex < 4) this.beginLevel(this.levelIndex + 1, true);
      else this.state = 'victory';
    }
  }

  updateVictory() {
    if (Input.pressed('Enter', 'Space', 'Escape') || Input.clickIn(0, 0, VIEW_W, VIEW_H)) {
      this.state = 'menu';
      this.menuIndex = 0;
    }
  }

  /* ------------------------------ TOASTS ------------------------------ */

  toast(text, color = '#ffffff', life = 2.2) {
    this.toasts.push({ text, color, life, max: life });
    if (this.toasts.length > 3) this.toasts.shift();
  }

  updateToasts(dt) {
    for (let i = this.toasts.length - 1; i >= 0; i--) {
      this.toasts[i].life -= dt;
      if (this.toasts[i].life <= 0) this.toasts.splice(i, 1);
    }
  }
}
