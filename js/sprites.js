'use strict';

/* ============================================================
   CÓDIGO VERDE — sprites pixel-art (assets externos, sem dependências)
   ============================================================ */

const Sprites = (() => {
  const SHEETS = {
    minion: { file: 'assets/minion-45x66.png', fw: 45, fh: 66, cols: 3, frames: 6 },
    disciple: { file: 'assets/disciple-45x51.png', fw: 45, fh: 51, cols: 4, frames: 11 },
    mage: { file: 'assets/mage-1-85x94.png', fw: 62, fh: 69, cols: 4, frames: 8 },
    monsters: { file: 'assets/monsters.png', fw: 152, fh: 140, cols: 6, frames: 24 }
  };

  // Retinas apertadas de cada criatura dentro da folha 6x4 (x, y, w, h no célula).
  const MONSTER_RECTS = {
    armor: [35, 24, 98, 116], banshee: [34, 30, 78, 110],
    ooze: [21, 28, 110, 104], hound: [24, 36, 102, 104],
    statue: [29, 25, 100, 115], priest: [39, 26, 83, 114],
    warlock: [42, 26, 107, 103], flesh: [35, 30, 80, 108],
    centipede: [24, 22, 103, 112], necro: [18, 24, 118, 116],
    ogre: [14, 26, 122, 112], rats: [15, 28, 114, 112],
    rust: [22, 16, 124, 118], assassin: [28, 16, 116, 118],
    skelMage: [30, 18, 104, 116], golem: [26, 24, 97, 97],
    torturer: [21, 22, 104, 116], worm: [27, 28, 92, 112],
    vampire: [29, 18, 110, 118], wight: [25, 11, 116, 118],
    boneDragon: [24, 11, 109, 105], demonLord: [16, 20, 124, 114],
    minotaur: [21, 16, 105, 109], spiderQueen: [13, 15, 116, 111]
  };

  const MONSTER_ORDER = Object.keys(MONSTER_RECTS);

  // Aparência dos inimigos por classe/variante.
  const ENEMY_SPRITES = {
    walker: { standard: 'minion', runner: 'minion', bomber: 'minion', brute: 'golem', shield: 'statue' },
    drone: { standard: 'skelMage', sniper: 'skelMage', sprayer: 'disciple', trainer: 'ooze' },
    turret: { standard: 'statue', mortar: 'golem', laser: 'centipede' },
    charger: { standard: 'hound', armored: 'minotaur', berserk: 'demonLord' },
    swooper: { standard: 'mage', bomber: 'banshee', swarm: 'vampire' }
  };

  // Aparência dos chefes e a "língua" dos seus ataques.
  const BOSS_SPRITES = {
    guardian: { monster: 'armor', color: '#a9d8ff', kind: 'blade', wave: '#bfe6ff' },
    hunter: { monster: 'assassin', color: '#b7ecff', kind: 'blade', wave: '#cfeeff' },
    bruiser: { monster: 'ogre', color: '#ff9a4d', kind: 'rock', wave: '#ffb066' },
    trickster: { monster: 'necro', color: '#b18cff', kind: 'rune', wave: '#cdabff' },
    director: { monster: 'spiderQueen', color: '#c86bff', kind: 'web', wave: '#d8a0ff' }
  };

  const imgs = {};

  function load() {
    for (const key in SHEETS) {
      if (imgs[key]) continue;
      const img = new Image();
      img.src = SHEETS[key].file;
      imgs[key] = img;
    }
  }

  function ok(key) {
    const img = imgs[key];
    return !!(img && img.complete && img.naturalWidth > 0);
  }

  function frameRect(key, frame) {
    const def = SHEETS[key];
    const i = Math.max(0, Math.floor(frame) % def.frames);
    const col = i % def.cols;
    const row = Math.floor(i / def.cols);
    return [col * def.fw, row * def.fh, def.fw, def.fh];
  }

  function monsterRect(name) {
    const i = Math.max(0, MONSTER_ORDER.indexOf(name));
    const r = MONSTER_RECTS[MONSTER_ORDER[i]] || MONSTER_RECTS.armor;
    const col = i % 6;
    const row = Math.floor(i / 6);
    return [col * SHEETS.monsters.fw + r[0], row * SHEETS.monsters.fh + r[1], r[2], r[3]];
  }

  function drawFit(ctx, key, src, x, y, w, h, flip, flash, alpha) {
    const img = imgs[key];
    if (!img || !img.complete || !img.naturalWidth) return false;
    const s = Math.min(w / src[2], h / src[3]);
    const dw = src[2] * s;
    const dh = src[3] * s;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    if (flash > 0) ctx.filter = 'brightness(0) invert(1)';
    if (flip) {
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, src[0], src[1], src[2], src[3], 0, 0, dw, dh);
    } else {
      ctx.drawImage(img, src[0], src[1], src[2], src[3], dx, dy, dw, dh);
    }
    ctx.restore();
    return true;
  }

  function enemyKey(kind, variant, opts) {
    if (opts && opts.training) return null;
    if (kind === 'drone' && opts && (opts.parryTrainer || opts.tag === 'parry')) return 'ooze';
    const table = ENEMY_SPRITES[kind] || {};
    return table[variant] || table.standard || null;
  }

  function enemyFrame(kind, e) {
    if (kind === 'walker') {
      if (e.state === 'strike' || e.state === 'windup') return 3 + (Math.floor(e.anim * 5) % 3);
      return Math.floor(e.anim * 2.4) % 6;
    }
    if (kind === 'drone') {
      if (e.mode === 'aim' || e.mode === 'fire') return 4 + (Math.floor(e.phase * 2.2) % 7);
      return Math.floor(e.phase * 1.5) % 4;
    }
    if (kind === 'swooper') return Math.floor(e.anim) % 8;
    return 0;
  }

  function flipFor(e) {
    if (typeof e.dir === 'number') return e.dir < 0;
    if (typeof e.face === 'number') return e.face < 0;
    return (e.vx || 0) < 0;
  }

  // Desenha o corpo sprite de um inimigo. Retorna true quando usou sprite.
  function drawEnemy(ctx, e, x, y, kind) {
    const key = enemyKey(kind, e.variant, e.opts);
    if (!key) return false;
    const anim = key === 'minion' || key === 'disciple' || key === 'mage';
    if (!ok(anim ? key : 'monsters')) return false;

    const pad = kind === 'walker' ? 1.25 : 1.35;
    const w = e.w * pad;
    const h = e.h * pad;
    const dx = x - (w - e.w) / 2;
    const dy = y - (h - e.h) / 2 - (key === 'disciple' ? 4 : 0);
    const src = key === 'minion' || key === 'disciple' || key === 'mage'
      ? frameRect(key, enemyFrame(kind, e))
      : monsterRect(key);
    return drawFit(ctx, key === 'minion' || key === 'disciple' || key === 'mage' ? key : 'monsters',
      src, dx, dy, w, h, flipFor(e), e.flash || 0);
  }

  function drawBoss(ctx, b, x, y, alpha) {
    const style = BOSS_SPRITES[b.style] ? b.style : 'guardian';
    if (!ok('monsters')) return false;
    const w = b.w * 1.16;
    const h = b.h * 1.16;
    const dx = x - (w - b.w) / 2;
    const dy = y - (h - b.h) / 2 + Math.sin(b.anim * 2.4) * 2;
    return drawFit(ctx, 'monsters', monsterRect(BOSS_SPRITES[style].monster),
      dx, dy, w, h, b.dir < 0, b.flash > 0 ? 1 : 0, alpha);
  }

  // Ajuda o ataque a "falar" a mesma língua da criatura.
  function bossShot(style, opts) {
    const s = BOSS_SPRITES[style] || BOSS_SPRITES.guardian;
    const o = Object.assign({}, opts);
    if (o.color === '#ff3355') return o; // perigo imparável preserva o aviso vermelho
    if (o.kind === 'wave') {
      o.color = s.wave;
      return o;
    }
    if (!o.kind || o.kind === 'orb') {
      o.kind = s.kind;
      o.color = s.color;
    } else if (o.kind === 'rock' || o.kind === 'meteor') {
      o.color = s.color;
    } else if (o.kind === 'laser') {
      o.color = style === 'hunter' ? '#b7ecff' : s.color;
    }
    return o;
  }

  // Aplica a paleta/armas da criatura a um projétil já criado.
  function styleBossProjectile(p, style) {
    const s = BOSS_SPRITES[style] || BOSS_SPRITES.guardian;
    if (p.color === '#ff3355') return;
    if (p.wave) {
      p.color = s.wave;
      return;
    }
    if (!p.kind || p.kind === 'orb') {
      p.kind = s.kind;
      p.color = s.color;
    } else if (p.kind === 'rock' || p.kind === 'meteor') {
      p.color = s.color;
    } else if (p.kind === 'laser') {
      p.color = style === 'hunter' ? '#b7ecff' : s.color;
    }
  }

  function styleEnemyProjectile(p, kind, variant) {
    if (kind === 'drone') {
      if (variant === 'sniper') { p.color = '#c9a6ff'; p.kind = 'laser'; }
      else if (variant === 'sprayer') { p.color = '#ffd24d'; p.kind = 'orb'; }
      else p.color = '#ffd24d'; // orbe de parry
    } else if (kind === 'turret') {
      p.color = variant === 'laser' ? '#ff9a4d' : '#9aa7b8';
    } else if (kind === 'swooper') {
      p.color = '#b18cff';
    }
  }

  function enemyShot(kind, variant, opts) {
    const o = Object.assign({}, opts);
    if (kind === 'drone') {
      if (variant === 'sprayer') { o.color = '#ffd24d'; o.kind = 'orb'; }
      else if (variant === 'sniper') { o.color = '#c9a6ff'; o.kind = 'laser'; }
      else o.color = '#ffd24d';
    } else if (kind === 'turret') {
      if (variant === 'laser') o.color = '#ff9a4d';
      else o.color = '#9aa7b8';
    } else if (kind === 'swooper') {
      o.color = '#b18cff';
    }
    return o;
  }

  load();

  return {
    SHEETS, MONSTER_RECTS, BOSS_SPRITES,
    load, ok, frameRect, monsterRect, drawFit,
    enemyKey, enemyFrame, drawEnemy, drawBoss,
    bossShot, styleBossProjectile, styleEnemyProjectile, enemyShot
  };
})();
