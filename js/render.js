'use strict';

/* ============================================================
   FERRO-9 — renderização (cenário, HUD, menus)
   ============================================================ */

function drawText(ctx, str, x, y, opts = {}) {
  const {
    size = 20, color = '#ffffff', align = 'left', baseline = 'middle',
    font = 'Consolas, monospace', weight = 'bold', alpha = 1, glow = null, glowSize = 14
  } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = glowSize;
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function drawGear(ctx, x, y, r, teeth, rot, color, lw = 3) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  for (let i = 0; i < teeth; i++) {
    ctx.rotate(TAU / teeth);
    ctx.strokeRect(-r * 0.11, -r - 6, r * 0.22, 9);
  }
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawHeart(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 16, s / 16);
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-9, -5, -17, 3, 0, 15);
  ctx.bezierCurveTo(17, 3, 9, -5, 0, 5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawPowerIcon(ctx, x, y, s, type, color, active, locked) {
  ctx.save();
  ctx.translate(x + s / 2, y + s / 2);
  ctx.globalAlpha = locked ? 0.28 : 1;

  ctx.fillStyle = 'rgba(8,14,24,0.85)';
  roundRect(ctx, -s / 2, -s / 2, s, s, 8);
  ctx.fill();
  ctx.strokeStyle = active ? color : 'rgba(150,180,210,0.25)';
  ctx.lineWidth = active ? 2.5 : 1.5;
  roundRect(ctx, -s / 2, -s / 2, s, s, 8);
  ctx.stroke();

  if (active) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
  }
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  if (type === 'attract' || type === 'repel') {
    ctx.beginPath();
    ctx.moveTo(-8, 8);
    ctx.lineTo(-8, -2);
    ctx.arc(0, -2, 8, Math.PI, 0, false);
    ctx.lineTo(8, 8);
    ctx.stroke();
    ctx.lineWidth = 2.5;
    const dir = type === 'attract' ? 1 : -1;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 8, 8 - dir * 5);
      ctx.lineTo(side * 8, 8);
      ctx.lineTo(side * 8 + dir * 4, 8);
      ctx.stroke();
    }
  } else if (type === 'shield') {
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha *= 0.7;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, TAU);
    ctx.stroke();
  } else if (type === 'super') {
    ctx.beginPath();
    ctx.moveTo(2, -11);
    ctx.lineTo(-7, 1);
    ctx.lineTo(-1, 1);
    ctx.lineTo(-3, 11);
    ctx.lineTo(7, -2);
    ctx.lineTo(1, -2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/* ------------------------------ FUNDO ------------------------------ */

Game.prototype.drawMenuBackground = function (ctx, theme) {
  const th = theme || THEMES.factory;
  const t = this.menuTime;

  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, th.skyTop);
  g.addColorStop(1, th.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // brilho central
  const rg = ctx.createRadialGradient(VIEW_W / 2, 380, 40, VIEW_W / 2, 380, 620);
  rg.addColorStop(0, withAlpha(th.accent, 0.10));
  rg.addColorStop(1, withAlpha(th.accent, 0));
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // engrenagens gigantes ao fundo
  for (let i = 0; i < 5; i++) {
    const x = 120 + i * 290 + Math.sin(t * 0.12 + i) * 22;
    const y = 220 + ((i * 97) % 180);
    const r = 70 + ((i * 53) % 70);
    drawGear(ctx, x, y, r, 10 + (i % 3) * 2, t * (0.08 + i * 0.02) * (i % 2 ? -1 : 1),
      withAlpha(th.accent, 0.10), 5);
  }

  // silhuetas de chaminés
  ctx.fillStyle = th.far;
  for (let i = 0; i < 9; i++) {
    const x = i * 170 - 60;
    const h = 150 + ((i * 73 + 41) % 190);
    ctx.fillRect(x, VIEW_H - 150 - h, 74, h + 150);
    ctx.fillRect(x + 8, VIEW_H - 160 - h, 58, 14);
    ctx.fillStyle = withAlpha(th.accent, 0.05);
    for (let k = 0; k < 3; k++) ctx.fillRect(x + 14, VIEW_H - 130 - h + k * 34, 46, 4);
    ctx.fillStyle = th.far;
  }

  // tubos
  ctx.strokeStyle = withAlpha(th.accent, 0.08);
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 620);
  ctx.lineTo(VIEW_W, 620);
  ctx.stroke();
  ctx.lineWidth = 4;
  for (let i = 0; i < 14; i++) {
    const x = i * 96 + ((t * 8) % 96);
    ctx.beginPath();
    ctx.moveTo(x, 612);
    ctx.lineTo(x, 640);
    ctx.stroke();
  }

  // piso
  const fg = ctx.createLinearGradient(0, 640, 0, VIEW_H);
  fg.addColorStop(0, 'rgba(0,0,0,0)');
  fg.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 620, VIEW_W, 100);

  // poeira
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 60; i++) {
    const x = ((i * 197 + t * (8 + (i % 5) * 4)) % (VIEW_W + 80)) - 40;
    const y = 100 + ((i * 127 + Math.sin(t * 0.5 + i) * 20) % 540);
    ctx.globalAlpha = 0.08 + (i % 4) * 0.03;
    ctx.fillStyle = th.accent;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();
};

Game.prototype.drawBackground = function (ctx, cam) {
  const level = this.level;
  const th = level.theme;
  const t = level.time;

  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, th.skyTop);
  g.addColorStop(1, th.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const glowY = 576 - cam.y;
  const rg = ctx.createRadialGradient(VIEW_W / 2, glowY - 80, 60, VIEW_W / 2, glowY - 80, 720);
  rg.addColorStop(0, withAlpha(th.accent, 0.07));
  rg.addColorStop(1, withAlpha(th.accent, 0));
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // camada distante
  const farSpacing = 260;
  const farOff = (cam.x * 0.15) % farSpacing;
  for (let i = -1; i < VIEW_W / farSpacing + 2; i++) {
    const x = i * farSpacing - farOff;
    const h = 160 + ((i * 73 + level.id * 41 + 900) % 150);
    const w = 120 + ((i * 37) % 80);
    ctx.fillStyle = th.far;
    ctx.fillRect(x, VIEW_H - 120 - h - cam.y * 0.15, w, h + 200);
    ctx.fillStyle = withAlpha(th.accent, 0.05);
    for (let k = 0; k < 4; k++) {
      ctx.fillRect(x + 16, VIEW_H - 100 - h + k * 30 - cam.y * 0.15, w - 32, 4);
    }
  }

  // engrenagens distantes
  for (let i = 0; i < 4; i++) {
    const x = i * 400 - ((cam.x * 0.12) % 400) - 80;
    const y = 200 + ((i * 89 + level.id * 33) % 170) - cam.y * 0.2;
    drawGear(ctx, x, y, 52 + (i % 3) * 16, 9 + (i % 2) * 3,
      t * 0.12 * (i % 2 ? -1 : 1), withAlpha(th.accent, 0.08), 4);
  }

  // camada média — prédios
  const midSpacing = 190;
  const midOff = (cam.x * 0.35) % midSpacing;
  for (let i = -1; i < VIEW_W / midSpacing + 2; i++) {
    const x = i * midSpacing - midOff;
    const h = 130 + ((i * 53 + level.id * 77 + 500) % 170);
    const w = 130 + ((i * 31) % 40);
    ctx.fillStyle = th.mid;
    ctx.fillRect(x, VIEW_H - 130 - h - cam.y * 0.3, w, h + 220);
    ctx.fillStyle = withAlpha(th.accent, 0.10);
    for (let wy = 0; wy < 5; wy++) {
      for (let wx = 0; wx < 3; wx++) {
        if ((i + wx + wy) % 3 === 0) continue;
        ctx.fillRect(x + 16 + wx * 36, VIEW_H - 110 - h + wy * 30 - cam.y * 0.3, 18, 10);
      }
    }
  }

  // camada próxima — tubos
  ctx.strokeStyle = withAlpha(th.near, 0.9);
  ctx.lineWidth = 14;
  const pipeY = 640 - cam.y * 0.55;
  ctx.beginPath();
  ctx.moveTo(0, pipeY);
  ctx.lineTo(VIEW_W, pipeY);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = withAlpha(th.accent, 0.10);
  const pipeOff = (cam.x * 0.55) % 120;
  for (let i = -1; i < VIEW_W / 120 + 2; i++) {
    const x = i * 120 - pipeOff;
    ctx.beginPath();
    ctx.moveTo(x, pipeY - 9);
    ctx.lineTo(x, pipeY + 9);
    ctx.stroke();
  }

  // linha do chão
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const floorG = ctx.createLinearGradient(0, 0, VIEW_W, 0);
  floorG.addColorStop(0, withAlpha(th.accent, 0));
  floorG.addColorStop(0.5, withAlpha(th.accent, 0.22));
  floorG.addColorStop(1, withAlpha(th.accent, 0));
  ctx.fillStyle = floorG;
  ctx.fillRect(0, 576 - cam.y - 2, VIEW_W, 3);
  ctx.restore();
};

/* ------------------------------ TILES ------------------------------ */

Game.prototype.drawTiles = function (ctx, cam) {
  const level = this.level;
  const th = level.theme;
  const tx0 = Math.max(0, Math.floor(cam.x / TILE) - 1);
  const tx1 = Math.min(level.w - 1, Math.ceil((cam.x + VIEW_W) / TILE) + 1);
  const ty0 = Math.max(0, Math.floor(cam.y / TILE) - 1);
  const ty1 = Math.min(level.h - 1, Math.ceil((cam.y + VIEW_H) / TILE) + 1);

  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const tile = level.tile(tx, ty);
      if (tile === TILE_EMPTY) continue;
      const x = tx * TILE - cam.x;
      const y = ty * TILE - cam.y;

      if (tile === TILE_SOLID) {
        ctx.fillStyle = th.tile;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = th.tileDark;
        ctx.fillRect(x, y + TILE - 5, TILE, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(x, y, 2, TILE);
        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.fillRect(x + TILE - 2, y, 2, TILE);

        if ((tx * 7 + ty * 13) % 9 === 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.14)';
          ctx.fillRect(x + 7, y + 7, TILE - 14, TILE - 14);
        }

        if (level.tile(tx, ty - 1) !== TILE_SOLID) {
          ctx.fillStyle = th.tileTop;
          ctx.fillRect(x, y, TILE, 6);
          ctx.fillStyle = withAlpha(th.edge, 0.35);
          ctx.fillRect(x, y, TILE, 2);
        }

        if ((tx + ty * 3) % 4 === 0) {
          ctx.fillStyle = withAlpha(th.edge, 0.35);
          ctx.beginPath();
          ctx.arc(x + 8, y + 12, 1.6, 0, TAU);
          ctx.arc(x + 24, y + 12, 1.6, 0, TAU);
          ctx.fill();
        }
      } else if (tile === TILE_SPIKE) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(x, y + TILE - 6, TILE, 6);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = th.hazard;
        ctx.shadowColor = th.hazard;
        ctx.shadowBlur = 8;
        for (let i = 0; i < 4; i++) {
          const sx = x + i * 8;
          ctx.beginPath();
          ctx.moveTo(sx, y + TILE);
          ctx.lineTo(sx + 4, y + 10);
          ctx.lineTo(sx + 8, y + TILE);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      } else if (tile === TILE_LASER) {
        if (level.laserOn) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const pulse = 0.7 + Math.sin(level.time * 18) * 0.15;
          const lg = ctx.createLinearGradient(x + 8, 0, x + 24, 0);
          lg.addColorStop(0, withAlpha(th.hazard, 0));
          lg.addColorStop(0.5, withAlpha(th.hazard, 0.55 * pulse));
          lg.addColorStop(1, withAlpha(th.hazard, 0));
          ctx.fillStyle = lg;
          ctx.fillRect(x + 4, y, 24, TILE);
          ctx.fillStyle = withAlpha('#ffffff', 0.75 * pulse);
          ctx.fillRect(x + 14, y, 4, TILE);
          ctx.restore();
        } else {
          ctx.fillStyle = withAlpha(th.hazard, 0.10);
          ctx.fillRect(x + 15, y, 2, TILE);
        }
      }
    }
  }
};

/* ------------------------------ CENA ------------------------------ */

Game.prototype.drawGameScene = function (ctx) {
  const shakeX = (Math.random() * 2 - 1) * this.cam.shake * 9;
  const shakeY = (Math.random() * 2 - 1) * this.cam.shake * 9;
  const cam = { x: this.cam.x + shakeX, y: this.cam.y + shakeY };

  this.drawBackground(ctx, cam);
  this.drawTiles(ctx, cam);

  if (this.exit) this.exit.render(ctx, cam);
  for (const cp of this.checkpoints) cp.render(ctx, cam);
  for (const pk of this.pickups) pk.render(ctx, cam);
  for (const c of this.crates) c.render(ctx, cam);
  for (const e of this.enemies) e.render(ctx, cam);
  if (this.boss) this.boss.render(ctx, cam);
  for (const pr of this.projectiles) pr.render(ctx, cam);
  if (this.player) this.player.render(ctx, cam);
  FX.draw(ctx, cam);
};

/* ------------------------------ HUD ------------------------------ */

Game.prototype.drawHUD = function (ctx) {
  const p = this.player;
  if (!p) return;

  // painel esquerdo
  ctx.fillStyle = 'rgba(5,9,16,0.62)';
  roundRect(ctx, 18, 16, 356, 148, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,190,255,0.16)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  for (let i = 0; i < p.maxHp; i++) {
    const filled = i < p.hp;
    drawHeart(ctx, 44 + i * 34, 40, 22, filled ? '#ff5d6c' : 'rgba(90,110,130,0.35)');
    if (filled) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.25;
      drawHeart(ctx, 44 + i * 34, 40, 26, '#ff5d6c');
      ctx.restore();
    }
  }

  drawText(ctx, 'ENERGIA', 36, 72, { size: 12, color: 'rgba(180,210,240,0.7)' });
  ctx.fillStyle = 'rgba(20,32,48,0.9)';
  roundRect(ctx, 36, 80, 318, 14, 7);
  ctx.fill();
  const eg = ctx.createLinearGradient(36, 0, 354, 0);
  eg.addColorStop(0, '#2f9dff');
  eg.addColorStop(0.6, '#4fffe6');
  eg.addColorStop(1, '#ffd24d');
  ctx.fillStyle = eg;
  roundRect(ctx, 36, 80, Math.max(3, 318 * (p.energy / p.maxEnergy)), 14, 7);
  ctx.fill();
  ctx.strokeStyle = 'rgba(140,220,255,0.25)';
  ctx.lineWidth = 1;
  roundRect(ctx, 36, 80, 318, 14, 7);
  ctx.stroke();

  const order = ['attract', 'repel', 'shield', 'super'];
  order.forEach((type, i) => {
    const info = POWER_INFO[type];
    const x = 36 + i * 82;
    const y = 106;
    const unlocked = this.powers.has(type);
    const active = type === 'attract' ? p.attract : type === 'repel' ? p.repel : type === 'shield' ? p.shield : p.superActive;
    drawPowerIcon(ctx, x, y, 38, type, info.color, active, !unlocked);
    drawText(ctx, info.key, x + 19, y + 46, {
      size: 11, align: 'center', color: unlocked ? 'rgba(210,230,250,0.8)' : 'rgba(120,140,160,0.4)'
    });
  });

  // contadores
  ctx.fillStyle = 'rgba(5,9,16,0.62)';
  roundRect(ctx, VIEW_W - 270, 16, 252, 56, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,190,255,0.16)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.save();
  ctx.translate(VIEW_W - 240, 44);
  ctx.rotate(this.time * 0.6);
  ctx.fillStyle = '#ffd24d';
  for (let i = 0; i < 8; i++) {
    ctx.rotate(TAU / 8);
    ctx.fillRect(-2, -11, 4, 4);
  }
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#1a1303';
  ctx.beginPath();
  ctx.arc(0, 0, 2.6, 0, TAU);
  ctx.fill();
  ctx.restore();
  drawText(ctx, `${this.stats.gears} / ${this.totalGears}`, VIEW_W - 222, 45, { size: 18, color: '#ffd24d' });

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = '#ff5d7a';
  ctx.shadowColor = '#ff5d7a';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(VIEW_W - 110, 44, 8, 0, TAU);
  ctx.fill();
  ctx.restore();
  drawText(ctx, `${this.stats.cores} / ${this.totalCores}`, VIEW_W - 92, 45, { size: 18, color: '#ff8fa5' });

  // nome da fase
  drawText(ctx, `FASE ${this.level.id} · ${this.level.name.toUpperCase()}`, VIEW_W / 2, 28, {
    size: 16, align: 'center', color: 'rgba(210,235,255,0.75)'
  });

  // barra do chefe
  const boss = this.boss;
  if (boss && boss.active && !boss.dead) {
    const bw = 540, bh = 16, bx = VIEW_W / 2 - bw / 2, by = 664;
    drawText(ctx, boss.cfg.name, VIEW_W / 2, by - 14, {
      size: 15, align: 'center', color: boss.color, glow: boss.color, glowSize: 10
    });
    ctx.fillStyle = 'rgba(5,9,16,0.8)';
    roundRect(ctx, bx - 4, by - 4, bw + 8, bh + 8, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(40,16,24,0.9)';
    roundRect(ctx, bx, by, bw, bh, 6);
    ctx.fill();
    const ratio = clamp(boss.hp / boss.maxHp, 0, 1);
    const bg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    bg.addColorStop(0, boss.color);
    bg.addColorStop(1, '#ff2d4a');
    ctx.fillStyle = bg;
    roundRect(ctx, bx, by, Math.max(4, bw * ratio), bh, 6);
    ctx.fill();
    if (boss.phase === 2) {
      drawText(ctx, 'FASE 2', bx + bw + 24, by + 8, { size: 11, color: '#ff8fa5' });
    }
  }

  // dica de controles
  drawText(ctx, 'ESC pausa · M som', VIEW_W - 20, VIEW_H - 18, {
    size: 12, align: 'right', color: 'rgba(170,200,230,0.5)'
  });

  // dicas contextuais da primeira fase
  if (this.level && this.level.id === 1) {
    let tip = null;
    if (!this.powers.has('attract')) {
      tip = 'Siga em frente e colete o MÓDULO AZUL';
    } else if (!this.usedMagnet) {
      tip = 'Segure Q perto das caixas de metal para atraí-las';
    }
    if (tip) {
      const tw = 470;
      ctx.fillStyle = 'rgba(5,10,18,0.78)';
      roundRect(ctx, 20, VIEW_H - 90, tw, 38, 19);
      ctx.fill();
      ctx.strokeStyle = 'rgba(77,166,255,0.45)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, 20, VIEW_H - 90, tw, 38, 19);
      ctx.stroke();
      drawText(ctx, tip, 42, VIEW_H - 70, {
        size: 13, color: '#9fd2ff'
      });
    }
  }

  // aviso de vida baixa
  if (p.hp <= 2 && !p.dead) {
    const a = 0.10 + Math.sin(this.time * 6) * 0.06;
    const vg = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, 240, VIEW_W / 2, VIEW_H / 2, 760);
    vg.addColorStop(0, 'rgba(255,40,60,0)');
    vg.addColorStop(1, `rgba(255,40,60,${Math.max(0, a)})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  // toasts
  this.drawToasts(ctx);
};

Game.prototype.drawToasts = function (ctx) {
  let y = 178;
  for (const t of this.toasts) {
    const fade = Math.min(1, t.life / 0.4);
    const w = Math.min(820, 120 + t.text.length * 10.5);
    const x = VIEW_W / 2 - w / 2;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(5,10,18,0.82)';
    roundRect(ctx, x, y - 19, w, 38, 19);
    ctx.fill();
    ctx.strokeStyle = withAlpha(t.color, 0.55);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawText(ctx, t.text, VIEW_W / 2, y + 1, {
      size: 15, align: 'center', color: t.color, glow: t.color, glowSize: 8
    });
    ctx.restore();
    y += 48;
  }
};

/* ------------------------------ TELAS ------------------------------ */

Game.prototype.render = function () {
  const ctx = this.ctx;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  switch (this.state) {
    case 'menu': this.renderMenu(ctx); break;
    case 'levelselect': this.renderLevelSelect(ctx); break;
    case 'help': this.renderHelp(ctx); break;
    case 'resetconfirm': this.renderResetConfirm(ctx); break;
    case 'tutorial': this.renderTutorial(ctx); break;
    case 'story': this.renderStory(ctx); break;
    case 'playing':
      this.drawGameScene(ctx);
      this.drawHUD(ctx);
      break;
    case 'paused':
      this.drawGameScene(ctx);
      this.drawHUD(ctx);
      this.renderPause(ctx);
      break;
    case 'complete':
      this.drawGameScene(ctx);
      this.renderComplete(ctx);
      break;
    case 'victory': this.renderVictory(ctx); break;
  }
};

Game.prototype.renderMenu = function (ctx) {
  this.drawMenuBackground(ctx);

  const t = this.menuTime;
  drawGear(ctx, VIEW_W / 2 - 330, 190, 78, 12, t * 0.25, 'rgba(255,157,69,0.16)', 4);
  drawGear(ctx, VIEW_W / 2 + 330, 200, 58, 10, -t * 0.32, 'rgba(255,157,69,0.14)', 4);

  drawText(ctx, 'FERRO-9', VIEW_W / 2, 168, {
    size: 104, align: 'center', color: '#ffb066', glow: '#ff6b2c', glowSize: 36, font: 'Segoe UI, system-ui, sans-serif'
  });
  drawText(ctx, 'F U G A   D A   F Á B R I C A', VIEW_W / 2, 240, {
    size: 24, align: 'center', color: 'rgba(220,235,255,0.9)'
  });
  drawText(ctx, 'plataforma · ação · puzzle magnético', VIEW_W / 2, 278, {
    size: 14, align: 'center', color: 'rgba(160,190,220,0.55)'
  });

  const rects = this.menuLayout();
  this.menuRects = rects;
  rects.forEach((r, i) => {
    const selected = i === this.menuIndex;
    ctx.save();
    if (selected) {
      ctx.shadowColor = '#ff8c42';
      ctx.shadowBlur = 24;
    }
    ctx.fillStyle = selected ? 'rgba(255,140,66,0.16)' : 'rgba(8,14,24,0.72)';
    roundRect(ctx, r.x, r.y, r.w, r.h, 9);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = selected ? '#ffb066' : 'rgba(150,180,210,0.22)';
    ctx.lineWidth = selected ? 2 : 1.5;
    roundRect(ctx, r.x, r.y, r.w, r.h, 9);
    ctx.stroke();
    ctx.restore();
    drawText(ctx, r.label, r.x + r.w / 2, r.y + r.h / 2 + 1, {
      size: 19, align: 'center', color: selected ? '#ffe0c0' : 'rgba(200,220,240,0.8)'
    });
  });

  const s = this.save;
  if (s) {
    const gears = Object.values(s.gears || {}).reduce((a, b) => a + b, 0);
    const cores = Object.values(s.cores || {}).reduce((a, b) => a + b, 0);
    drawText(ctx, `FASES LIBERADAS ${s.unlocked}/5   ·   ENGRENAGENS ${gears}   ·   NÚCLEOS ${cores}`,
      VIEW_W / 2, 596, { size: 13, align: 'center', color: 'rgba(160,190,220,0.55)' });
  }

  drawText(ctx, '↑ ↓ navegar   ·   ENTER confirmar   ·   M som', VIEW_W / 2, 668, {
    size: 14, align: 'center', color: 'rgba(170,200,230,0.6)'
  });
  drawText(ctx, Sfx.muted ? 'SOM: DESLIGADO' : 'SOM: LIGADO', 24, VIEW_H - 22, {
    size: 12, color: 'rgba(150,180,210,0.5)'
  });
};

Game.prototype.renderLevelSelect = function (ctx) {
  this.drawMenuBackground(ctx);
  drawText(ctx, 'SELECIONAR FASE', VIEW_W / 2, 130, {
    size: 42, align: 'center', color: '#e8f4ff', glow: '#4da6ff', glowSize: 20
  });
  drawText(ctx, 'Complete uma fase para liberar a próxima.', VIEW_W / 2, 176, {
    size: 14, align: 'center', color: 'rgba(170,200,230,0.6)'
  });

  const s = this.ensureSave();
  const cards = this.levelLayout();
  this.levelRects = cards;

  cards.forEach((card, i) => {
    const meta = LEVELS[i]();
    const theme = meta.theme;
    const unlocked = i + 1 <= s.unlocked;
    const selected = i === this.selectedLevel;
    const yOff = selected ? -8 : 0;

    ctx.save();
    if (selected) {
      ctx.shadowColor = theme.accent;
      ctx.shadowBlur = 30;
    }
    ctx.fillStyle = unlocked ? 'rgba(8,14,24,0.9)' : 'rgba(8,12,18,0.82)';
    roundRect(ctx, card.x, card.y + yOff, card.w, card.h, 12);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = selected ? theme.accent : 'rgba(150,180,210,0.18)';
    ctx.lineWidth = selected ? 2.5 : 1.5;
    roundRect(ctx, card.x, card.y + yOff, card.w, card.h, 12);
    ctx.stroke();

    ctx.fillStyle = withAlpha(theme.accent, unlocked ? 0.20 : 0.06);
    roundRect(ctx, card.x, card.y + yOff, card.w, 78, 12);
    ctx.fill();

    drawText(ctx, `FASE ${i + 1}`, card.x + 16, card.y + yOff + 24, {
      size: 13, color: withAlpha(theme.accent, 0.9)
    });
    drawText(ctx, meta.short.toUpperCase(), card.x + 16, card.y + yOff + 54, {
      size: 21, color: unlocked ? '#e8f4ff' : 'rgba(140,160,180,0.5)'
    });

    if (unlocked) {
      drawText(ctx, meta.subtitle, card.x + 16, card.y + yOff + 100, {
        size: 12, color: 'rgba(180,205,230,0.6)'
      });
      const g = s.gears[meta.id] || 0;
      const c = s.cores[meta.id] || 0;
      drawText(ctx, `⚙ ${g}    ◈ ${c}`, card.x + 16, card.y + yOff + 150, {
        size: 16, color: '#ffd24d'
      });
      const done = s.completed.includes(meta.id);
      drawText(ctx, done ? 'CONCLUÍDA' : 'NÃO CONCLUÍDA', card.x + 16, card.y + yOff + 190, {
        size: 12, color: done ? '#7fe7ff' : 'rgba(160,185,210,0.5)'
      });
      drawText(ctx, 'ENTER para jogar', card.x + 16, card.y + yOff + 222, {
        size: 11, color: 'rgba(150,180,210,0.5)'
      });
    } else {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = 'rgba(180,200,220,0.6)';
      ctx.lineWidth = 2;
      roundRect(ctx, card.x + card.w / 2 - 13, card.y + yOff + 112, 26, 22, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(card.x + card.w / 2, card.y + yOff + 112, 10, Math.PI, 0);
      ctx.stroke();
      ctx.restore();
      drawText(ctx, 'BLOQUEADA', card.x + card.w / 2, card.y + yOff + 160, {
        size: 13, align: 'center', color: 'rgba(180,200,220,0.55)'
      });
    }
    ctx.restore();
  });

  drawText(ctx, '← → escolher   ·   ENTER jogar   ·   ESC voltar', VIEW_W / 2, 640, {
    size: 14, align: 'center', color: 'rgba(170,200,230,0.6)'
  });
};

Game.prototype.renderHelp = function (ctx) {
  this.drawMenuBackground(ctx);
  drawText(ctx, 'COMO JOGAR', VIEW_W / 2, 96, {
    size: 40, align: 'center', color: '#e8f4ff', glow: '#4da6ff', glowSize: 18
  });

  const px = 90, py = 150, pw = 1100, ph = 470;
  ctx.fillStyle = 'rgba(6,11,20,0.82)';
  roundRect(ctx, px, py, pw, ph, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,190,255,0.18)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawText(ctx, 'CONTROLES', px + 36, py + 40, { size: 18, color: '#7fe7ff' });
  const controls = [
    ['A / D  ou  ← / →', 'Mover'],
    ['SHIFT', 'Correr'],
    ['ESPAÇO / W / ↑', 'Pular'],
    ['Q  ou  1', 'Ímã azul — atrair metal'],
    ['E  ou  2', 'Ímã vermelho — repelir e refletir'],
    ['R  ou  3', 'Campo magnético — escudo'],
    ['F  ou  4', 'Supercarga — saltos gigantes'],
    ['M', 'Ligar / desligar som'],
    ['ESC / P', 'Pausar']
  ];
  controls.forEach((row, i) => {
    const y = py + 82 + i * 36;
    drawText(ctx, row[0], px + 36, y, { size: 14, color: '#ffd24d' });
    drawText(ctx, row[1], px + 300, y, { size: 14, color: 'rgba(200,220,240,0.8)' });
  });

  drawText(ctx, 'PODERES', px + 610, py + 40, { size: 18, color: '#7fe7ff' });
  const powers = ['attract', 'repel', 'shield', 'super'];
  powers.forEach((type, i) => {
    const info = POWER_INFO[type];
    const y = py + 88 + i * 86;
    drawPowerIcon(ctx, px + 610, y - 22, 40, type, info.color, true, false);
    drawText(ctx, info.name, px + 664, y - 12, { size: 15, color: info.color });
    drawText(ctx, info.desc, px + 664, y + 12, {
      size: 12, color: 'rgba(190,210,230,0.7)'
    });
  });

  drawText(ctx, 'Dica: caixas de metal podem virar pontes. Puxe-as com o ÍMÃ AZUL.', px + 36, py + ph - 34, {
    size: 13, color: 'rgba(170,200,230,0.65)'
  });

  drawText(ctx, 'ESC ou ENTER para voltar', VIEW_W / 2, 668, {
    size: 14, align: 'center', color: 'rgba(170,200,230,0.6)'
  });
};

Game.prototype.renderResetConfirm = function (ctx) {
  this.drawMenuBackground(ctx);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawText(ctx, 'APAGAR PROGRESSO?', VIEW_W / 2, 250, {
    size: 40, align: 'center', color: '#ff8fa5', glow: '#ff2d4a', glowSize: 20
  });
  drawText(ctx, 'Todas as fases, poderes e coletáveis serão perdidos.', VIEW_W / 2, 306, {
    size: 16, align: 'center', color: 'rgba(200,220,240,0.75)'
  });

  const opts = ['NÃO, VOLTAR', 'SIM, APAGAR'];
  opts.forEach((label, i) => {
    const x = VIEW_W / 2 - 300 + i * 320;
    const y = 400;
    const sel = i === this.resetIndex;
    ctx.fillStyle = sel ? 'rgba(255,93,108,0.18)' : 'rgba(8,14,24,0.8)';
    roundRect(ctx, x, y, 280, 60, 10);
    ctx.fill();
    ctx.strokeStyle = sel ? '#ff5d6c' : 'rgba(150,180,210,0.25)';
    ctx.lineWidth = sel ? 2 : 1.5;
    roundRect(ctx, x, y, 280, 60, 10);
    ctx.stroke();
    drawText(ctx, label, x + 140, y + 31, {
      size: 16, align: 'center', color: sel ? '#ffb0bc' : 'rgba(200,220,240,0.8)'
    });
  });
  drawText(ctx, '← → escolher · ENTER confirmar · ESC cancelar', VIEW_W / 2, 560, {
    size: 14, align: 'center', color: 'rgba(170,200,230,0.6)'
  });
};

function drawKeycap(ctx, label, x, y, color, active) {
  const w = label.length > 3 ? 150 : 82;
  const h = 58;
  ctx.save();
  if (active) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 26;
  }
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, active ? withAlpha(color, 0.32) : 'rgba(30,42,60,0.95)');
  g.addColorStop(1, active ? withAlpha(color, 0.12) : 'rgba(12,20,32,0.95)');
  ctx.fillStyle = g;
  roundRect(ctx, x - w / 2, y, w, h, 9);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = active ? color : 'rgba(150,185,220,0.35)';
  ctx.lineWidth = active ? 2.5 : 1.5;
  roundRect(ctx, x - w / 2, y, w, h, 9);
  ctx.stroke();
  drawText(ctx, label, x, y + h / 2 + 1, {
    size: 20, align: 'center', color: active ? '#ffffff' : 'rgba(215,232,250,0.85)'
  });
  ctx.restore();
  return { x: x - w / 2, y, w, h };
}

Game.prototype.renderTutorial = function (ctx) {
  const steps = this.tutorialSteps();
  const idx = Math.min(this.tutorialStep, steps.length - 1);
  const step = steps[idx];

  this.drawGameScene(ctx);
  ctx.fillStyle = 'rgba(2,5,10,0.84)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const pw = 900, ph = 470;
  const px = VIEW_W / 2 - pw / 2, py = 100;

  ctx.save();
  ctx.shadowColor = '#4da6ff';
  ctx.shadowBlur = 30;
  ctx.fillStyle = 'rgba(6,12,22,0.94)';
  roundRect(ctx, px, py, pw, ph, 18);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(127,231,255,0.3)';
  ctx.lineWidth = 2;
  roundRect(ctx, px, py, pw, ph, 18);
  ctx.stroke();

  drawText(ctx, 'TUTORIAL', px + 40, py + 42, {
    size: 15, color: '#7fe7ff', glow: '#4da6ff', glowSize: 10
  });
  drawText(ctx, `PASSO ${idx + 1} DE ${steps.length}`, px + pw - 40, py + 42, {
    size: 13, align: 'right', color: 'rgba(170,200,230,0.55)'
  });

  // indicador de progresso
  const dotY = py + 76;
  for (let i = 0; i < steps.length; i++) {
    const dx = px + 40 + i * 22;
    ctx.beginPath();
    ctx.arc(dx, dotY, 5, 0, TAU);
    ctx.fillStyle = i < idx ? '#4da6ff' : i === idx ? '#7fe7ff' : 'rgba(120,150,180,0.28)';
    if (i === idx) {
      ctx.shadowColor = '#7fe7ff';
      ctx.shadowBlur = 12;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawText(ctx, step.title, VIEW_W / 2, py + 150, {
    size: 42, align: 'center', color: '#f0f7ff', glow: '#4da6ff', glowSize: 18
  });

  if (step.type === 'text') {
    step.lines.forEach((line, i) => {
      drawText(ctx, line, VIEW_W / 2, py + 220 + i * 34, {
        size: 17, align: 'center', color: 'rgba(220,235,250,0.9)'
      });
    });
  } else {
    drawText(ctx, step.desc, VIEW_W / 2, py + 226, {
      size: 19, align: 'center', color: 'rgba(220,235,250,0.92)'
    });
  }

  const t = this.tutorialTime;
  const pulse = 0.5 + Math.sin(t * 5) * 0.5;
  const keys = step.keys || [];
  if (keys.length) {
    const totalW = keys.reduce((sum, k) => sum + (k.length > 3 ? 150 : 82) + 26, -26);
    let kx = VIEW_W / 2 - totalW / 2;
    for (const k of keys) {
      const kw = k.length > 3 ? 150 : 82;
      drawKeycap(ctx, k, kx + kw / 2, py + 300, '#7fe7ff', step.type === 'text' || pulse > 0.35);
      kx += kw + 26;
    }
  }

  if (step.type === 'text') {
    const blink = 0.55 + Math.sin(t * 4) * 0.35;
    drawText(ctx, 'ENTER para continuar', VIEW_W / 2, py + 400, {
      size: 15, align: 'center', color: withAlpha('#ffffff', blink)
    });
  } else {
    drawText(ctx, 'Pressione a tecla para continuar', VIEW_W / 2, py + 400, {
      size: 15, align: 'center', color: 'rgba(170,200,230,0.65)'
    });
  }

  // botão continuar (etapas de texto)
  if (step.type === 'text') {
    const bx = VIEW_W / 2 - 190, by = py + ph + 24;
    ctx.fillStyle = 'rgba(77,166,255,0.16)';
    roundRect(ctx, bx, by, 380, 48, 9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(127,231,255,0.6)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, bx, by, 380, 48, 9);
    ctx.stroke();
    drawText(ctx, 'ENTER — CONTINUAR', VIEW_W / 2, by + 25, {
      size: 15, align: 'center', color: '#d8f4ff'
    });
  }

  // pular tutorial
  const sx = VIEW_W - 300, sy = VIEW_H - 72;
  ctx.fillStyle = 'rgba(8,14,24,0.85)';
  roundRect(ctx, sx, sy, 260, 48, 9);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,180,210,0.3)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, sx, sy, 260, 48, 9);
  ctx.stroke();
  drawText(ctx, 'ESC — PULAR TUTORIAL', sx + 130, sy + 25, {
    size: 13, align: 'center', color: 'rgba(190,210,230,0.7)'
  });
};

Game.prototype.renderStory = function (ctx) {
  this.drawMenuBackground(ctx, this.level.theme);
  const level = this.level;

  const pw = 860, ph = 460;
  const px = VIEW_W / 2 - pw / 2, py = 130;
  ctx.fillStyle = 'rgba(6,11,20,0.86)';
  roundRect(ctx, px, py, pw, ph, 16);
  ctx.fill();
  ctx.strokeStyle = withAlpha(level.theme.accent, 0.35);
  ctx.lineWidth = 2;
  ctx.stroke();

  drawText(ctx, `FASE ${level.id}`, VIEW_W / 2, py + 42, {
    size: 14, align: 'center', color: withAlpha(level.theme.accent, 0.9)
  });
  drawText(ctx, level.name.toUpperCase(), VIEW_W / 2, py + 84, {
    size: 36, align: 'center', color: '#f0f7ff', glow: level.theme.accent, glowSize: 18
  });
  drawText(ctx, level.subtitle, VIEW_W / 2, py + 120, {
    size: 14, align: 'center', color: 'rgba(180,205,230,0.65)'
  });

  level.story.forEach((line, i) => {
    drawText(ctx, line, VIEW_W / 2, py + 178 + i * 32, {
      size: 17, align: 'center', color: 'rgba(220,235,250,0.9)'
    });
  });

  ctx.fillStyle = withAlpha(level.theme.accent, 0.08);
  roundRect(ctx, px + 70, py + ph - 100, pw - 140, 46, 8);
  ctx.fill();
  drawText(ctx, level.hint, VIEW_W / 2, py + ph - 77, {
    size: 13, align: 'center', color: withAlpha(level.theme.accent, 0.9)
  });

  drawText(ctx, 'ENTER começar   ·   ESC voltar ao menu', VIEW_W / 2, py + ph + 36, {
    size: 15, align: 'center', color: 'rgba(170,200,230,0.7)'
  });
};

Game.prototype.renderPause = function (ctx) {
  ctx.fillStyle = 'rgba(2,5,10,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  drawText(ctx, 'PAUSADO', VIEW_W / 2, 300, {
    size: 52, align: 'center', color: '#e8f4ff', glow: '#4da6ff', glowSize: 24
  });

  const rects = this.pauseLayout();
  this.pauseRects = rects;
  rects.forEach((r, i) => {
    const sel = i === this.pauseIndex;
    ctx.fillStyle = sel ? 'rgba(77,166,255,0.18)' : 'rgba(8,14,24,0.85)';
    roundRect(ctx, r.x, r.y, r.w, r.h, 9);
    ctx.fill();
    ctx.strokeStyle = sel ? '#7fe7ff' : 'rgba(150,180,210,0.22)';
    ctx.lineWidth = sel ? 2 : 1.5;
    roundRect(ctx, r.x, r.y, r.w, r.h, 9);
    ctx.stroke();
    drawText(ctx, r.label, r.x + r.w / 2, r.y + r.h / 2 + 1, {
      size: 17, align: 'center', color: sel ? '#d8f4ff' : 'rgba(200,220,240,0.8)'
    });
  });

  drawText(ctx, 'ESC continuar', VIEW_W / 2, 600, {
    size: 13, align: 'center', color: 'rgba(170,200,230,0.6)'
  });
};

Game.prototype.renderComplete = function (ctx) {
  ctx.fillStyle = 'rgba(2,5,10,0.76)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const st = this.completeStats;
  const level = st.level;
  const pw = 700, ph = 420;
  const px = VIEW_W / 2 - pw / 2, py = 110;

  ctx.fillStyle = 'rgba(6,11,20,0.9)';
  roundRect(ctx, px, py, pw, ph, 16);
  ctx.fill();
  ctx.strokeStyle = withAlpha(level.theme.accent, 0.45);
  ctx.lineWidth = 2;
  ctx.stroke();

  drawText(ctx, 'FASE CONCLUÍDA', VIEW_W / 2, py + 54, {
    size: 38, align: 'center', color: '#7fe7ff', glow: '#4da6ff', glowSize: 22
  });
  drawText(ctx, level.name.toUpperCase(), VIEW_W / 2, py + 96, {
    size: 18, align: 'center', color: withAlpha(level.theme.accent, 0.9)
  });

  const rows = [
    ['ENGRENAGENS', `${st.gears} / ${this.totalGears}`],
    ['NÚCLEOS', `${st.cores} / ${this.totalCores}`],
    ['QUEDAS', `${st.deaths}`],
    ['TEMPO', this.formatTime(st.time)]
  ];
  rows.forEach((row, i) => {
    const y = py + 150 + i * 42;
    drawText(ctx, row[0], px + 150, y, { size: 15, color: 'rgba(170,200,230,0.65)' });
    drawText(ctx, row[1], px + pw - 150, y, {
      size: 20, align: 'right', color: i < 2 ? '#ffd24d' : '#d8f4ff'
    });
  });

  const btn = this.completeLayout()[0];
  this.completeRects = [btn];
  ctx.save();
  ctx.shadowColor = '#4da6ff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = 'rgba(77,166,255,0.18)';
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 10);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#7fe7ff';
  ctx.lineWidth = 2;
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 10);
  ctx.stroke();
  ctx.restore();
  drawText(ctx, 'ENTER — PRÓXIMA FASE', btn.x + btn.w / 2, btn.y + btn.h / 2 + 1, {
    size: 17, align: 'center', color: '#d8f4ff'
  });

  drawText(ctx, 'ESC — menu', VIEW_W / 2, 650, {
    size: 13, align: 'center', color: 'rgba(170,200,230,0.6)'
  });
};

Game.prototype.formatTime = function (seconds) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
};

Game.prototype.renderVictory = function (ctx) {
  this.drawMenuBackground(ctx, THEMES.core);
  const t = this.menuTime;

  for (let i = 0; i < 26; i++) {
    const x = (i * 157 + t * 30) % VIEW_W;
    const y = (i * 83 + t * 18) % VIEW_H;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = i % 2 ? '#ffd24d' : '#ff5d7a';
    ctx.fillRect(x, y, 3, 3);
    ctx.restore();
  }

  drawText(ctx, 'VOCÊ ESCAPOU', VIEW_W / 2, 150, {
    size: 64, align: 'center', color: '#ffe27a', glow: '#ff5d7a', glowSize: 30,
    font: 'Segoe UI, system-ui, sans-serif'
  });
  drawText(ctx, 'O Núcleo se cala. A cidade desperta.', VIEW_W / 2, 214, {
    size: 18, align: 'center', color: 'rgba(230,240,255,0.9)'
  });

  const lines = [
    'FERRO-9 atravessa os portões da fábrica pela primeira vez.',
    'Atrás de si, as máquinas param. À frente, o mundo é imenso.',
    'Talvez outros robôs também mereçam escolher o próprio caminho.',
    'Fim — por enquanto.'
  ];
  lines.forEach((line, i) => {
    drawText(ctx, line, VIEW_W / 2, 296 + i * 34, {
      size: 16, align: 'center', color: 'rgba(220,235,250,0.8)'
    });
  });

  const s = this.ensureSave();
  const gears = Object.values(s.gears || {}).reduce((a, b) => a + b, 0);
  const cores = Object.values(s.cores || {}).reduce((a, b) => a + b, 0);
  drawText(ctx, `ENGRENAGENS ${gears}   ·   NÚCLEOS ${cores}`, VIEW_W / 2, 470, {
    size: 18, align: 'center', color: '#ffd24d'
  });

  drawText(ctx, 'ENTER para voltar ao menu', VIEW_W / 2, 590, {
    size: 15, align: 'center', color: 'rgba(190,215,240,0.7)'
  });
};

/* ------------------------------ INICIALIZAÇÃO ------------------------------ */

new Game();
