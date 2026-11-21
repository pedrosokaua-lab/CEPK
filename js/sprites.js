'use strict';

/* ============================================================
   CÓDIGO VERDE — sprites dos chefes (assets locais, sem dependências)
   ============================================================ */

const Sprites = (() => {
  const SHEET = { file: 'assets/monsters.png', fw: 152, fh: 140, cols: 6 };

  // Retinas apertadas dos chefes dentro da folha 6x4 (x, y, w, h na célula).
  const MONSTER_RECTS = {
    armor: [35, 24, 98, 116],
    assassin: [28, 16, 116, 118],
    ogre: [14, 26, 122, 112],
    necro: [18, 24, 118, 116],
    spiderQueen: [13, 15, 116, 111]
  };

  // Cada chefe também "fala" com um tipo de projétil e uma cor próprios.
  const BOSS_SPRITES = {
    guardian: { monster: 'armor', color: '#a9d8ff', kind: 'blade', wave: '#bfe6ff' },
    hunter: { monster: 'assassin', color: '#b7ecff', kind: 'blade', wave: '#cfeeff' },
    bruiser: { monster: 'ogre', color: '#ff9a4d', kind: 'rock', wave: '#ffb066' },
    trickster: { monster: 'necro', color: '#b18cff', kind: 'rune', wave: '#cdabff' },
    director: { monster: 'spiderQueen', color: '#c86bff', kind: 'web', wave: '#d8a0ff' }
  };

  const MONSTER_CELLS = {
    armor: 0, assassin: 13, ogre: 10, necro: 9, spiderQueen: 23
  };

  const img = new Image();
  img.src = SHEET.file;

  function ok() {
    return !!(img.complete && img.naturalWidth > 0);
  }

  function monsterRect(name) {
    const r = MONSTER_RECTS[name] || MONSTER_RECTS.armor;
    const i = MONSTER_CELLS[name] == null ? 0 : MONSTER_CELLS[name];
    return [
      (i % SHEET.cols) * SHEET.fw + r[0],
      Math.floor(i / SHEET.cols) * SHEET.fh + r[1],
      r[2], r[3]
    ];
  }

  function drawBoss(ctx, b, x, y, alpha) {
    if (!ok()) return false;
    const style = BOSS_SPRITES[b.style] ? b.style : 'guardian';
    const w = b.w * 1.16;
    const h = b.h * 1.16;
    const dx = x - (w - b.w) / 2;
    const dy = y - (h - b.h) / 2 + Math.sin(b.anim * 2.4) * 2;
    const src = monsterRect(BOSS_SPRITES[style].monster);
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    if (b.flash > 0) ctx.filter = 'brightness(0) invert(1)';
    ctx.drawImage(img, src[0], src[1], src[2], src[3], dx, dy, w, h);
    ctx.restore();
    return true;
  }

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

  return { MONSTER_RECTS, BOSS_SPRITES, ok, monsterRect, drawBoss, styleBossProjectile };
})();
