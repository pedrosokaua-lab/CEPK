'use strict';

/* ============================================================
   CÓDIGO VERDE — lógica principal e fluxo de telas
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

    this.weaponIndex = 0;
    this.tutorialParries = 0;
    this.pulseRings = [];
    this.parryFlash = 0;
    this.hurtFlash = 0;
    this.hitStop = 0;

    this.usedMelee = false;
    this.usedRanged = false;

    this.characterStart = false;

    this.lastFrame = performance.now();
    this.save = loadSave();
    this.difficulty = this.save ? clamp(this.save.difficulty ?? 1, 0, DIFFICULTIES.length - 1) : 1;
    this.diff = DIFFICULTIES[this.difficulty];
    this.selectedDifficulty = this.difficulty;
    this.characterId = this.save ? getCharacter(this.save.character).id : 'vega';
    this.character = getCharacter(this.characterId);
    this.selectedCharacter = Math.max(0, CHARACTERS.findIndex((c) => c.id === this.characterId));
    this.cutsceneIndex = 0;
    this.cutsceneTime = 0;
    this.cutsceneReveal = 0;
    this.cutsceneThenStory = false;
    this.cutsceneThenBoss = false;
    this.cutsceneMode = 'intro';
    this.bossIntroDone = false;

    this.level = null;
    this.levelIndex = 0;
    this.player = null;
    this.crates = [];
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.checkpoints = [];
    this.springs = [];
    this.crumbles = [];
    this.movers = [];
    this.kennedito = null;
    this.kenneditoAlly = null;
    this.kenneditoRescued = false;
    this.gates = [];
    this.exit = null;
    this.boss = null;
    this.bossSpawn = null;
    this.bossDefeated = false;
    this.bossActive = false;
    this.arena = null;
    this.bossGate = null;
    this.exitGate = null;
    this.cluesFound = new Set(
      this.save && this.save.clues ? Object.keys(this.save.clues).map(Number).filter((n) => n >= 1 && n <= 4) : []
    );

    this.cam = { x: 0, y: 0, shake: 0 };
    this.toasts = [];
    this.stats = { gears: 0, cores: 0, clues: 0, deaths: 0, time: 0 };
    this.totalGears = 0;
    this.totalCores = 0;
    this.checkpointPos = { x: 0, y: 0 };
    this.completeStats = null;

    this.menuRects = [];
    this.levelRects = [];
    this.pauseRects = [];
    this.completeRects = [];
    this.helpRect = null;

    window.codigoVerde = this;
    window.ferro9 = this;
    requestAnimationFrame((t) => this.loop(t));
  }

  /* ------------------------------ SAVE ------------------------------ */

  ensureSave() {
    if (!this.save) {
      this.save = {
        unlocked: 1,
        gears: {},
        cores: {},
        clues: {},
        completed: [],
        tutorialDone: false,
        character: this.characterId,
        difficulty: this.difficulty
      };
    }
    if (!this.save.clues) this.save.clues = {};
    if (!CHARACTER_IDS.includes(this.save.character)) this.save.character = this.characterId;
    return this.save;
  }

  persist() {
    const s = this.ensureSave();
    s.difficulty = this.difficulty;
    s.character = this.characterId;
    writeSave(s);
  }

  hasProgress() {
    const s = this.save;
    return !!s && (!!s.tutorialDone || s.unlocked > 1 || s.completed.length > 0);
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
    this.parryFlash = Math.max(0, this.parryFlash - dt);

    if (Input.pressed('KeyM')) {
      const muted = Sfx.toggleMute();
      if (this.state === 'playing' || this.state === 'paused') {
        this.toast(muted ? 'SOM DESLIGADO' : 'SOM LIGADO', '#7fe7ff', 1.4);
      }
    }

    switch (this.state) {
      case 'menu': this.updateMenu(dt); break;
      case 'characters': this.updateCharacterSelect(dt); break;
      case 'difficulty': this.updateDifficulty(dt); break;
      case 'levelselect': this.updateLevelSelect(dt); break;
      case 'help': this.updateHelp(dt); break;
      case 'resetconfirm': this.updateResetConfirm(dt); break;
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
      { label: 'PERSONAGEM: ' + this.character.name, action: 'character' },
      { label: 'DIFICULDADE: ' + DIFFICULTIES[this.difficulty].name, action: 'difficulty' },
      { label: 'TREINAMENTO', action: 'tutorial' },
      { label: 'SELECIONAR FASE', action: 'levels' },
      { label: 'COMO JOGAR', action: 'help' }
    ];
    if (has) items.push({ label: 'APAGAR PROGRESSO', action: 'reset' });

    const startY = 288;
    const w = 396, h = 43, gap = 7;
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
      this.selectedCharacter = Math.max(0, CHARACTERS.findIndex((c) => c.id === this.characterId));
      this.characterStart = true;
      this.state = 'characters';
      Sfx.tone(500, 0.06, { type: 'square', vol: 0.04 });
    } else if (action === 'character') {
      this.selectedCharacter = Math.max(0, CHARACTERS.findIndex((c) => c.id === this.characterId));
      this.characterStart = false;
      this.state = 'characters';
      Sfx.tone(500, 0.06, { type: 'square', vol: 0.04 });
    } else if (action === 'difficulty') {
      this.selectedDifficulty = this.difficulty;
      this.state = 'difficulty';
      Sfx.tone(500, 0.06, { type: 'square', vol: 0.04 });
    } else if (action === 'tutorial') {
      this.startTutorial();
    } else if (action === 'levels') {
      const s = this.ensureSave();
      this.selectedLevel = clamp(s.unlocked, 1, 5);
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

  /* ------------------------------ PERSONAGENS ------------------------------ */

  characterLayout() {
    const w = 268, h = 384, gap = 16;
    const total = w * CHARACTERS.length + gap * (CHARACTERS.length - 1);
    const startX = (VIEW_W - total) / 2;
    return CHARACTERS.map((ch, i) => ({
      ch,
      index: i,
      x: startX + i * (w + gap),
      y: 206,
      w, h
    }));
  }

  updateCharacterSelect() {
    const cards = this.characterLayout();
    this.characterRects = cards;

    for (const c of cards) {
      if (Input.hoverIn(c.x, c.y, c.w, c.h)) this.selectedCharacter = c.index;
    }

    if (Input.pressed('ArrowLeft', 'KeyA')) {
      this.selectedCharacter = (this.selectedCharacter - 1 + CHARACTERS.length) % CHARACTERS.length;
      Sfx.tone(420, 0.05, { type: 'square', vol: 0.03 });
    }
    if (Input.pressed('ArrowRight', 'KeyD')) {
      this.selectedCharacter = (this.selectedCharacter + 1) % CHARACTERS.length;
      Sfx.tone(420, 0.05, { type: 'square', vol: 0.03 });
    }

    if (Input.pressed('Escape')) {
      this.characterStart = false;
      this.state = 'menu';
      Sfx.tone(280, 0.07, { type: 'square', vol: 0.04 });
      return;
    }

    let pick = Input.pressed('Enter', 'Space') ? this.selectedCharacter : null;
    for (const c of cards) {
      if (Input.clickIn(c.x, c.y, c.w, c.h)) pick = c.index;
    }

    if (pick !== null) {
      this.setCharacter(CHARACTERS[pick].id);
      if (this.characterStart) {
        this.characterStart = false;
        if (this.hasProgress()) this.continueGame();
        else this.startNewGame();
      } else {
        this.state = 'menu';
      }
    }
  }

  setCharacter(id) {
    const ch = getCharacter(id);
    this.characterId = ch.id;
    this.character = ch;
    this.selectedCharacter = Math.max(0, CHARACTERS.findIndex((c) => c.id === ch.id));
    const s = this.ensureSave();
    s.character = ch.id;
    this.persist();
    if (this.player) this.applyCharacterToPlayer();
    Sfx.tone(520, 0.08, { type: 'triangle', vol: 0.08 });
    Sfx.tone(780, 0.12, { type: 'triangle', vol: 0.07, delay: 0.07 });
    this.toast('PERSONAGEM: ' + ch.name, ch.color, 2.2);
  }

  applyCharacterToPlayer() {
    const p = this.player;
    if (!p) return;
    const ch = this.character || CHARACTERS[0];
    const diff = this.diff || DIFFICULTIES[this.difficulty];
    p.character = ch;
    p.speedMul = ch.speed || 1;
    p.damageMul = ch.damage || 1;
    p.energyMul = ch.energy || 1;
    p.maxEnergy = Math.round(100 * p.energyMul);
    p.maxHp = Math.max(2, diff.playerHp + (ch.hpBonus || 0));
    p.hp = Math.min(p.hp, p.maxHp);
    if (p.hp <= 0) p.hp = p.maxHp;
    p.energy = Math.min(p.energy, p.maxEnergy);
  }

  startNewGame() {
    clearSave();
    this.save = {
      unlocked: 1,
      gears: {},
      cores: {},
      clues: {},
      completed: [],
      tutorialDone: false,
      character: this.characterId,
      difficulty: this.difficulty
    };
    this.cluesFound.clear();
    this.startTutorial();
  }

  startTutorial() {
    this.loadLevel(0);
    this.tutorialParries = 0;
    this.state = 'playing';
    Sfx.startMusic(this.level.musicRoot, this.level.musicMode);
    this.cam.x = clamp(this.player.cx - VIEW_W / 2, 0, Math.max(0, this.level.widthPx - VIEW_W));
    this.cam.y = 0;
    this.toast('TREINAMENTO — SIGA OS HOLOGRAMAS', '#6dff9e', 2.4);
  }

  finishTutorial() {
    if (this.state !== 'playing') return;
    Sfx.stopMusic();
    const s = this.ensureSave();
    s.unlocked = Math.max(s.unlocked, 1);
    s.tutorialDone = true;
    this.persist();
    this.toast('TREINAMENTO CONCLUÍDO', '#6dff9e', 2.2);
    this.loadLevel(1);
    this.startCutscene(1, true);
    Sfx.tone(660, 0.16, { type: 'triangle', vol: 0.1 });
    Sfx.tone(880, 0.24, { type: 'triangle', vol: 0.1, delay: 0.1 });
  }

  continueGame() {
    const s = this.ensureSave();
    this.beginLevel(clamp(s.unlocked, 1, 5), true);
  }

  /* ------------------------------ DIFICULDADE ------------------------------ */

  difficultyLayout() {
    const w = 250, h = 356, gap = 22;
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
    return [1, 2, 3, 4, 5].map((levelIndex, i) => ({
      x: startX + i * (w + gap),
      y: 320,
      w, h,
      index: levelIndex
    }));
  }

  updateLevelSelect() {
    const cards = this.levelLayout();
    this.levelRects = cards;
    const s = this.ensureSave();
    const unlocked = s.unlocked;
    this.selectedLevel = clamp(this.selectedLevel, 1, 5);

    for (const c of cards) {
      if (Input.hoverIn(c.x, c.y, c.w, c.h)) this.selectedLevel = c.index;
    }

    if (Input.pressed('ArrowLeft', 'KeyA')) this.selectedLevel = clamp(this.selectedLevel - 1, 1, 5);
    if (Input.pressed('ArrowRight', 'KeyD')) this.selectedLevel = clamp(this.selectedLevel + 1, 1, 5);
    if (Input.pressed('ArrowUp', 'KeyW')) this.selectedLevel = clamp(this.selectedLevel - 1, 1, 5);
    if (Input.pressed('ArrowDown', 'KeyS')) this.selectedLevel = clamp(this.selectedLevel + 1, 1, 5);

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
      if (this.selectedLevel <= unlocked) {
        this.beginLevel(this.selectedLevel, false);
      } else {
        Sfx.tone(120, 0.18, { type: 'square', vol: 0.08, slide: -40 });
        this.toast('FASE BLOQUEADA', '#ff5d6c', 1.4);
      }
    }
  }

  /* ------------------------------ AJUDA / RESET ------------------------------ */

  updateHelp() {
    if (Input.pressed('Escape', 'Enter', 'Space') || Input.clickIn(0, 0, VIEW_W, VIEW_H)) {
      this.state = 'menu';
    }
  }

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
        this.cluesFound.clear();
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
    this.arena = level.arena || null;
    this.bossGate = level.gates.find((g) => g.station === 'boss_arena') || null;
    this.exitGate = level.gates.find((g) => g.station === 'boss_exit') || null;
    this.bossIntroDone = false;
    this.cutsceneMode = 'intro';
    this.cutsceneThenBoss = false;

    this.crates = [];
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.checkpoints = [];
    this.springs = [];
    this.crumbles = [];
    this.movers = [];
    this.kennedito = null;
    this.kenneditoAlly = null;
    this.kenneditoRescued = false;
    this.gates = level.gates.slice();
    this.exit = null;
    this.boss = null;
    this.bossSpawn = null;
    this.bossDefeated = false;
    this.bossActive = false;
    this.toasts = [];
    this.pulseRings = [];
    this.parryFlash = 0;
    this.hurtFlash = 0;
    this.hitStop = 0;
    this.tutorialParries = 0;
    this.weaponIndex = 0;
    this.usedMelee = false;
    this.usedRanged = false;
    FX.clear();

    let spawn = { tx: 2, ty: 17 };
    let gears = 0, cores = 0, clues = 0;

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
          this.enemies.push(new Walker(cx, bottom, this, e));
          break;
        case 'drone':
          this.enemies.push(new Drone(cx, bottom, this, e));
          break;
        case 'turret':
          this.enemies.push(new Turret(cx, bottom, this, e));
          break;
        case 'charger':
          this.enemies.push(new Charger(cx, bottom, this, e));
          break;
        case 'swooper':
          this.enemies.push(new Swooper(cx, bottom, this, e));
          break;
        case 'spring':
          this.springs.push(new Spring(cx, bottom, this, e));
          break;
        case 'crumble':
          this.crumbles.push(new CrumblePlatform(e, this));
          break;
        case 'mover':
          this.movers.push(new MovingPlatform(e, this));
          break;
        case 'gear':
          this.pickups.push(new Pickup('gear', cx, e.ty * TILE + TILE / 2));
          gears++;
          break;
        case 'core':
          this.pickups.push(new Pickup('core', cx, e.ty * TILE + TILE / 2));
          cores++;
          break;
        case 'clue': {
          const clueId = Number(String(e.clue || '').replace(/[^0-9]/g, '')) || level.id;
          if (!this.cluesFound.has(clueId)) {
            this.pickups.push(new Pickup('clue', cx, e.ty * TILE + TILE / 2, { clue: e.clue }));
            clues++;
          }
          break;
        }
        case 'checkpoint':
          this.checkpoints.push(new Checkpoint(cx, bottom));
          break;
        case 'kennedito':
          this.kennedito = new KenneditoCage(cx, bottom, this, e);
          break;
        case 'exit':
          this.exit = new Exit(cx, bottom);
          break;
        case 'boss':
          this.bossSpawn = { x: cx, y: bottom, cfg: e.boss };
          break;
      }
    }

    this.totalGears = gears;
    this.totalCores = cores;
    this.totalClues = clues;
    this.stats = { gears: 0, cores: 0, clues: 0, deaths: 0, time: 0 };
    this.completeStats = null;

    this.player = new Player(spawn.tx * TILE + TILE / 2, spawn.ty * TILE + TILE, this);
    const diff = this.diff || DIFFICULTIES[this.difficulty];
    this.player.maxHp = diff.playerHp;
    this.player.hp = diff.playerHp;
    this.applyCharacterToPlayer();
    this.player.hp = this.player.maxHp;
    this.player.energy = this.player.maxEnergy;
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

  startCutscene(index, thenStory, mode = 'intro') {
    this.cutsceneIndex = 0;
    this.cutsceneTime = 0;
    this.cutsceneReveal = 0;
    this.cutsceneThenStory = !!thenStory;
    this.cutsceneThenBoss = false;
    this.cutsceneMode = mode;
    this.state = 'cutscene';
    Sfx.stopMusic();
    Sfx.tone(240, 0.2, { type: 'sine', vol: 0.06, slide: 180 });
  }

  cutsceneSlides() {
    if (!this.level) return [];
    if (this.cutsceneMode === 'boss') return this.level.bossCutscene || [];
    return this.level.cutscene || [];
  }

  cutsceneSlide() {
    const slides = this.cutsceneSlides();
    return slides[clamp(this.cutsceneIndex, 0, Math.max(0, slides.length - 1))] || null;
  }

  cutsceneText(slide) {
    return slide ? slide.lines.slice(0, 2).join(' ') : '';
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
    this.cutsceneReveal = Math.min(total, this.cutsceneReveal + dt * 90);

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
    if (this.cutsceneThenBoss) {
      this.cutsceneThenBoss = false;
      this.beginBossFight();
      return;
    }
    if (this.cutsceneThenStory) {
      this.state = 'story';
    } else {
      this.startPlaying();
    }
  }

  startBossIntro() {
    if (!this.level || !this.level.bossCutscene.length) {
      this.beginBossFight();
      return;
    }
    this.bossIntroDone = true;
    this.startCutscene(0, false, 'boss');
    this.cutsceneThenBoss = true;
    this.shake(0.4);
    Sfx.tone(110, 0.5, { type: 'sawtooth', vol: 0.16, slide: -40 });
    Sfx.tone(220, 0.3, { type: 'square', vol: 0.07, delay: 0.18 });
  }

  beginBossFight() {
    if (!this.boss && this.bossSpawn) {
      this.boss = new Boss(this.bossSpawn.x, this.bossSpawn.y, this.bossSpawn.cfg, this);
    }
    if (!this.boss || this.boss.dead) return;
    this.state = 'playing';
    this.bossActive = true;
    this.boss.active = true;
    this.boss.state = 'idle';
    this.boss.timer = 0.9;
    this.boss.vx = 0;
    if (this.bossGate) this.level.closeGate(this.bossGate);
    if (this.exitGate) this.level.closeGate(this.exitGate);
    Sfx.startMusic(this.level.musicRoot + 5, this.level.musicMode);
    this.shake(0.55);
    this.toast(this.boss.cfg.name + ' — LUTE!', this.boss.color, 2.4);
  }

  arenaBounds() {
    if (!this.arena) return null;
    const leftGate = this.bossGate;
    const rightGate = this.exitGate;
    const left = leftGate ? (leftGate.tx + leftGate.w) * TILE : this.arena.left * TILE;
    const right = rightGate ? rightGate.tx * TILE : this.arena.right * TILE;
    const ceiling = (this.arena.ceiling || 11) * TILE;
    return { left, right, ceiling };
  }

  /* ------------------------------ JOGO ------------------------------ */

  updatePlaying(dt) {
    const level = this.level;
    if (this.hitStop > 0) {
      this.hitStop = Math.max(0, this.hitStop - dt);
      dt *= 0.18;
    }
    level.update(dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.stats.time += dt;

    const p = this.player;

    // Gatilho da arena: o chefe só entra em cena depois da cutscene de entrada.
    if (this.arena && !this.bossDefeated && p.cx >= this.arena.trigger * TILE) {
      if (!this.bossIntroDone) {
        this.startBossIntro();
        return;
      }
      if (!this.bossActive) {
        this.beginBossFight();
      }
    }

    for (const m of this.movers) m.update(dt);

    p.update(dt);

    // Contenção da arena: ninguém atravessa os portões durante a luta.
    if (this.bossActive && !this.bossDefeated) {
      const bounds = this.arenaBounds();
      if (bounds) {
        const minX = bounds.left + 2;
        const maxX = bounds.right - p.w - 2;
        if (p.x < minX) {
          p.x = minX;
          if (p.vx < 0) p.vx = 0;
        } else if (p.x > maxX) {
          p.x = maxX;
          if (p.vx > 0) p.vx = 0;
        }
        // Não deixa o jogador ficar em cima do teto da arena durante a luta.
        if (p.y < bounds.ceiling) {
          p.y = bounds.ceiling;
          if (p.vy < 0) p.vy = 0;
        }
      }
    }

    this.updateEffects(dt);

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
    for (const sp of this.springs) sp.update(dt, this);
    for (const cr of this.crumbles) cr.update(dt, this);
    if (this.kennedito) this.kennedito.update(dt, this);
    if (this.kenneditoAlly) this.kenneditoAlly.update(dt, this);

    if (this.exit) {
      const tutorialReady = this.level.tutorial
        ? this.level.stations.every((s) => s.action === 'exit' || s.done)
        : this.bossDefeated;
      this.exit.open = tutorialReady;
      this.exit.update(dt, this);
    }

    this.crates = this.crates.filter((c) => !c.dead);
    this.enemies = this.enemies.filter((e) => !e.dead);
    this.projectiles = this.projectiles.filter((pr) => !pr.dead);
    this.pickups = this.pickups.filter((pk) => !pk.dead);

    this.updateTutorialStations(dt);

    p.justDoubleJumped = false;
    p.justDashed = false;
    p.justJumped = false;

    this.updateCamera(dt);

    if (this.state === 'playing' && Input.pressed('Escape', 'KeyP')) {
      this.state = 'paused';
      this.pauseIndex = 0;
      Sfx.tone(300, 0.08, { type: 'square', vol: 0.04 });
    }
  }

  updateEffects(dt) {
    for (let i = this.pulseRings.length - 1; i >= 0; i--) {
      const ring = this.pulseRings[i];
      ring.life -= dt;
      ring.r += 520 * dt;
      if (ring.life <= 0) this.pulseRings.splice(i, 1);
    }
  }

  onParry(p, perfect = false, chain = 1) {
    this.tutorialParries++;
    this.parryFlash = perfect ? 0.62 : 0.4;
    this.shake(perfect ? 0.62 : 0.35);
    if (perfect) this.hitStop = Math.max(this.hitStop, 0.07);
    const parryColor = perfect ? '#ffd24d' : '#6dff9e';
    Sfx.tone(perfect ? 1040 : 880, 0.12, { type: 'triangle', vol: 0.12, slide: perfect ? 320 : 240 });
    Sfx.tone(perfect ? 1560 : 1320, 0.16, { type: 'sine', vol: 0.08, delay: 0.05 });
    if (perfect) Sfx.tone(520, 0.18, { type: 'square', vol: 0.06, slide: 460 });
    FX.burst(p.cx, p.cy, perfect ? 34 : 22, {
      color: parryColor, speedMax: perfect ? 390 : 300, lifeMax: 0.6, sizeMax: 6, shape: 'line'
    });
    if (perfect) {
      this.pulseRings.push({ x: p.cx, y: p.cy, r: 26, life: 0.38, max: 0.38 });
    }

    for (const pr of this.projectiles) {
      if (pr.dead || pr.owner !== 'enemy') continue;
      if (dist(pr.x, pr.y, p.cx, p.cy) < (perfect ? 210 : 160)) {
        if (pr.parryable) pr.reflect(this, perfect);
        else pr.explode(this);
      }
    }

    for (const e of this.enemies) {
      if (e.dead) continue;
      if (dist(e.x + e.w / 2, e.y + e.h / 2, p.cx, p.cy) < (perfect ? 200 : 150) && e.stagger) {
        e.stagger(perfect ? 1.45 : 0.9);
      }
    }

    if (this.boss && !this.boss.dead &&
        dist(this.boss.cx, this.boss.cy, p.cx, p.cy) < (perfect ? 230 : 190) && this.boss.stagger) {
      this.boss.stagger(perfect ? 1.25 : 0.8, this);
    }

    if (perfect) {
      this.toast(`PARRY PERFEITO!${chain > 1 ? '  x' + chain : ''}`, '#ffd24d', 1.15);
    } else {
      this.toast('PARRY!', '#6dff9e', 0.8);
    }
  }

  onKenneditoRescued(cage) {
    this.kenneditoRescued = true;
    const allClues = this.cluesFound.size >= 4;
    const blessing = allClues ? 2 : 1;

    // Bênção de resgate: aumenta a vida máxima e cura por completo.
    this.player.maxHp += blessing;
    this.player.hp = this.player.maxHp;

    // Abre o portão de resgate que bloqueia a passagem para a diretora.
    for (const gate of this.level.gates) {
      if (gate.station === 'rescue') this.level.openGate(gate);
    }

    this.toast(
      allClues ? 'KENNEDITO LIBERTO! BÊNÇÃO COMPLETA +2 HP' : 'KENNEDITO LIBERTO! +1 HP MÁXIMO',
      '#6dff9e', 3.2
    );
    this.shake(0.5);
    Sfx.tone(880, 0.16, { type: 'triangle', vol: 0.1 });
    Sfx.tone(1040, 0.16, { type: 'sine', vol: 0.08, delay: 0.1 });
    Sfx.tone(1320, 0.22, { type: 'sine', vol: 0.07, delay: 0.2 });

    // Kennedito passa a lutar ao lado de VEGA contra a diretora.
    this.kenneditoAlly = new KenneditoAlly(cage.x + cage.w + 26, cage.bottom, this);
    this.kennedito = null;
  }

  /* ------------------------------ TUTORIAL ------------------------------ */

  completeStation(station) {
    if (station.done) return;
    station.done = true;
    station.doneAt = this.time;
    for (const gate of this.level.gates) {
      if (gate.station !== station.action || gate.open) continue;
      this.level.openGate(gate);
      const gx = gate.tx * TILE + TILE / 2;
      const gy = gate.ty * TILE + TILE / 2;
      FX.burst(gx, gy, 22, { color: '#6dff9e', speedMax: 260, lifeMax: 0.7, sizeMax: 6 });
    }
    Sfx.tone(620, 0.1, { type: 'triangle', vol: 0.09 });
    Sfx.tone(930, 0.16, { type: 'triangle', vol: 0.08, delay: 0.08 });
    this.toast(station.label + ' OK', '#6dff9e', 1.1);

    const pending = this.level.stations.some((s) => s.action !== 'exit' && !s.done);
    if (!pending) this.toast('PORTAL ABERTO', '#7fe7ff', 2);
  }

  updateTutorialStations(dt) {
    if (!this.level || !this.level.tutorial) return;
    const p = this.player;
    if (!p || p.dead) return;

    for (const s of this.level.stations) {
      if (s.done) continue;
      const sx = s.tx * TILE + TILE / 2;
      const near = Math.abs(p.cx - sx) < 6 * TILE;

      switch (s.action) {
        case 'move':
          if (near && Math.abs(p.vx) > 40) this.completeStation(s);
          break;
        case 'jump':
          if (near && p.justJumped) this.completeStation(s);
          break;
        case 'double':
          if (near && p.justDoubleJumped) this.completeStation(s);
          break;
        case 'dash':
          if (near && p.justDashed) this.completeStation(s);
          break;
        case 'attack': {
          const dummy = this.enemies.find((e) => e.tag === 'melee');
          if (!dummy || dummy.dead) this.completeStation(s);
          break;
        }
        case 'shoot': {
          const target = this.enemies.find((e) => e.tag === 'shoot');
          if (!target || target.dead) this.completeStation(s);
          break;
        }
        case 'parry':
          if (near && this.tutorialParries > 0) this.completeStation(s);
          break;
      }
    }
  }

  /* ------------------------------ CAIXAS / CÂMERA ------------------------------ */

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
      if (speed < 300) continue;
      if (this.boss && !this.boss.dead && aabb(c, this.boss)) {
        this.boss.takeDamage(6, this);
        c.impactCd = 0.55;
        c.vx *= -0.35;
        c.vy = -220;
        this.shake(0.4);
        continue;
      }
      for (const e of this.enemies) {
        if (!e.dead && aabb(c, e)) {
          e.hurt(2, this, c);
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
      color: '#6dff9e', speedMax: 320, lifeMax: 0.9, sizeMax: 6, gravity: 500
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
    p.dashTimer = 0;
    p.dashCd = 0;
    p.parryTimer = 0;
    p.parryPerfect = 0;
    p.parryCd = 0;
    p.parryChain = 0;
    p.parryChainTimer = 0;
    for (const cr of this.crumbles) cr.reset(this);
    this.projectiles = this.projectiles.filter((pr) => pr.owner === 'player');

    // Se o chefe ainda está de pé, reinicia a luta sem repetir a cutscene.
    if (this.boss && this.bossIntroDone && !this.bossDefeated) {
      this.boss.reset(this);
      this.bossActive = false;
      if (this.bossGate) this.level.openGate(this.bossGate);
      if (this.exitGate) this.level.closeGate(this.exitGate);
      if (this.exit) this.exit.open = false;
    }

    FX.burst(p.cx, p.cy, 18, { color: '#6dff9e', speedMax: 220, lifeMax: 0.7 });
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
      this.toast('NÚCLEO DO SISTEMA', '#ff5d7a', 2);
    } else if (pickup.kind === 'clue') {
      const clueId = Number(String(pickup.clue || '').replace(/[^0-9]/g, '')) || this.level.id;
      if (this.cluesFound.has(clueId)) return;
      this.cluesFound.add(clueId);
      this.stats.clues++;
      const s = this.ensureSave();
      s.clues[clueId] = true;
      this.persist();
      const total = this.cluesFound.size;
      Sfx.tone(760, 0.12, { type: 'triangle', vol: 0.09 });
      Sfx.tone(1040, 0.18, { type: 'sine', vol: 0.08, delay: 0.08 });
      FX.burst(pickup.x, pickup.y, 24, {
        color: '#b6ff9a', speedMax: 240, lifeMax: 0.7, sizeMax: 5
      });
      this.shake(0.2);
      this.toast(
        total >= 4
          ? `PISTA ${clueId}/4 — TODAS AS PEGADAS ENCONTRADAS!`
          : `PISTA ${clueId}/4 — PEGADA DE KENNEDITO`,
        '#b6ff9a', 2.8
      );
    }
  }

  onEnemyKilled(enemy) {
    FX.burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 20, {
      color: '#6dff9e', speedMax: 280, lifeMax: 0.8, sizeMax: 6, gravity: 400
    });
    Sfx.tone(140, 0.16, { type: 'square', vol: 0.08, slide: -80 });
    Sfx.noise(0.16, 0.1, { freq: 800 });
    if (this.player) {
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 8);
    }
  }

  onBossDefeated(boss) {
    this.bossDefeated = true;
    this.bossActive = false;
    if (this.bossGate) this.level.openGate(this.bossGate);
    if (this.exitGate) this.level.openGate(this.exitGate);
    if (this.exit) this.exit.open = true;
    this.toast('SAÍDA LIBERADA', '#7fe7ff', 2.6);
    this.shake(1);
    FX.burst(boss.cx, boss.cy, 40, {
      color: boss.color, speedMax: 380, lifeMax: 1.1, sizeMax: 8, gravity: 300
    });
    FX.burst(boss.cx, boss.cy, 24, {
      color: '#6dff9e', speedMax: 260, lifeMax: 1.4, sizeMax: 6, gravity: -60
    });
  }

  completeLevel() {
    if (this.state !== 'playing') return;
    if (this.level.tutorial) {
      this.finishTutorial();
      return;
    }
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
      if (this.level.tutorial) {
        this.startTutorial();
      } else {
        this.loadLevel(this.levelIndex);
        this.startPlaying();
      }
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
      if (this.levelIndex < 5) this.beginLevel(this.levelIndex + 1, true);
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

window.addEventListener('load', () => {
  new Game();
});
