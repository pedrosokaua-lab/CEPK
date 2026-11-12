'use strict';

/* ============================================================
   CÓDIGO VERDE — renderização (cenário, HUD, menus)
   Estética pixel-art com tiles de 32px e cenários escolares.
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

function wrapTextLines(ctx, text, maxWidth, size = 14) {
  ctx.save();
  ctx.font = `bold ${size}px Consolas, monospace`;
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  ctx.restore();
  return lines;
}

function drawPixelHeart(ctx, x, y, s, color) {
  const rows = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  const u = s / 8;
  ctx.save();
  ctx.fillStyle = color;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c] === '#') ctx.fillRect(Math.round(x + c * u), Math.round(y + r * u), Math.ceil(u), Math.ceil(u));
    }
  }
  ctx.restore();
}

function drawKeycap(ctx, label, x, y, color = '#6dff9e', active = true, scale = 1) {
  const w = Math.max(34, String(label).length * 10 + 18) * scale;
  const h = 24 * scale;
  ctx.save();
  ctx.globalAlpha = active ? 1 : 0.38;
  ctx.fillStyle = 'rgba(4,16,10,0.92)';
  roundRect(ctx, x, y, w, h, 4 * scale);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(x + 2 * scale, y + 2 * scale, w - 4 * scale, 2 * scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 4 * scale);
  ctx.stroke();
  drawText(ctx, label, x + w / 2, y + h / 2 + 1, {
    size: 11 * scale, align: 'center', color, font: 'Consolas, monospace'
  });
  ctx.restore();
  return w;
}

function drawLeaf(ctx, x, y, s, rot, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.fillRect(-s / 2, -s / 2, s, s);
  ctx.fillRect(0, -s, s * 0.7, s * 0.7);
  ctx.fillRect(-s, 0, s * 0.7, s * 0.7);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-s / 2, -s / 2, s * 0.35, s * 0.35);
  ctx.restore();
}

function drawGear(ctx, x, y, r, teeth, rot, color, lw = 3) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  for (let i = 0; i < teeth; i++) {
    ctx.rotate(TAU / teeth);
    ctx.fillRect(-2.5, -r - 5, 5, 7);
  }
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawPowerIcon(ctx, x, y, s, power, color, state) {
  const info = POWER_INFO[power] || { key: '?', name: power };
  const active = state === 'active';
  const unlocked = state !== 'locked';
  ctx.save();
  ctx.globalAlpha = unlocked ? 1 : 0.32;
  ctx.fillStyle = active ? withAlpha(color, 0.32) : 'rgba(4,16,10,0.84)';
  roundRect(ctx, x, y, s, s, 6);
  ctx.fill();
  ctx.strokeStyle = active ? color : withAlpha(color, unlocked ? 0.75 : 0.4);
  ctx.lineWidth = active ? 2.5 : 1.5;
  if (active) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
  }
  roundRect(ctx, x, y, s, s, 6);
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (!unlocked) {
    ctx.strokeStyle = 'rgba(190,220,200,0.6)';
    ctx.lineWidth = 2;
    roundRect(ctx, x + s / 2 - 8, y + s / 2 - 3, 16, 13, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + s / 2, y + s / 2 - 3, 6, Math.PI, 0);
    ctx.stroke();
  } else {
    drawText(ctx, info.key, x + s / 2, y + s / 2 - 1, {
      size: 17, align: 'center', color, glow: active ? color : null, glowSize: 8
    });
  }
  drawText(ctx, info.name, x + s / 2, y + s + 13, {
    size: 9, align: 'center', color: unlocked ? 'rgba(210,245,220,0.8)' : 'rgba(160,190,170,0.4)'
  });
  ctx.restore();
}

function drawPanel(ctx, x, y, w, h, opts = {}) {
  const {
    fill = 'rgba(5,20,12,0.88)', stroke = 'rgba(109,255,158,0.25)',
    radius = 10, line = 1.5, glow = null
  } = opts;
  ctx.save();
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 22;
  }
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = line;
  roundRect(ctx, x, y, w, h, radius);
  ctx.stroke();
  ctx.restore();
}

function drawScanlines(ctx, alpha = 0.12) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000000';
  for (let y = 0; y < VIEW_H; y += 4) ctx.fillRect(0, y, VIEW_W, 1);
  ctx.restore();
}

/* ------------------------------ CENÁRIO ------------------------------ */

function drawSchoolBackdrop(ctx, theme, time, menu = false) {
  const th = theme || THEMES.school;
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, th.skyTop);
  sky.addColorStop(0.65, th.skyBottom);
  sky.addColorStop(1, th.bg);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // lua / sinal verde
  const moonX = menu ? 1060 : 1030;
  const moonY = menu ? 118 : 108;
  const halo = ctx.createRadialGradient(moonX, moonY, 8, moonX, moonY, 120);
  halo.addColorStop(0, withAlpha(th.glow, 0.28));
  halo.addColorStop(1, withAlpha(th.glow, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(moonX - 130, moonY - 130, 260, 260);
  ctx.fillStyle = withAlpha(th.glow, 0.85);
  ctx.beginPath();
  ctx.arc(moonX, moonY, 30, 0, TAU);
  ctx.fill();
  ctx.fillStyle = withAlpha(th.tileDark, 0.55);
  ctx.beginPath();
  ctx.arc(moonX - 9, moonY - 5, 7, 0, TAU);
  ctx.arc(moonX + 10, moonY + 8, 5, 0, TAU);
  ctx.fill();

  // estrelas pixeladas
  for (let i = 0; i < 46; i++) {
    const sx = (i * 137 + 53) % VIEW_W;
    const sy = (i * 71 + 23) % 300;
    const tw = 0.25 + 0.75 * Math.abs(Math.sin(time * 0.7 + i));
    ctx.globalAlpha = tw * 0.7;
    ctx.fillStyle = th.glow;
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;

  // prédio escolar ao fundo
  const baseY = 596;
  const bx = 86;
  const bw = VIEW_W - 172;
  const bh = menu ? 250 : 230;
  ctx.fillStyle = withAlpha(th.far, 0.9);
  ctx.fillRect(bx, baseY - bh, bw, bh);
  ctx.fillStyle = withAlpha(th.mid, 0.9);
  ctx.fillRect(bx + 22, baseY - bh + 18, bw - 44, bh - 18);

  // telhado
  ctx.fillStyle = withAlpha(th.near, 0.95);
  ctx.fillRect(bx - 18, baseY - bh - 16, bw + 36, 20);
  ctx.fillStyle = withAlpha(th.accent, 0.22);
  ctx.fillRect(bx - 18, baseY - bh - 16, bw + 36, 3);

  // janelas acesas
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 13; col++) {
      const wx = bx + 44 + col * 72;
      const wy = baseY - bh + 42 + row * 54;
      if (wx + 42 > bx + bw - 20) continue;
      const lit = ((row * 13 + col * 7) % 5) !== 0;
      ctx.fillStyle = lit ? withAlpha(th.glow, 0.62) : 'rgba(3,16,9,0.72)';
      ctx.fillRect(wx, wy, 38, 30);
      ctx.fillStyle = lit ? withAlpha(th.accent, 0.24) : 'rgba(255,255,255,0.05)';
      ctx.fillRect(wx + 3, wy + 3, 32, 3);
      ctx.fillStyle = withAlpha(th.tileDark, 0.8);
      ctx.fillRect(wx + 18, wy, 2, 30);
    }
  }

  // porta central e letreiro CEPK
  const doorW = 104;
  const doorX = VIEW_W / 2 - doorW / 2;
  ctx.fillStyle = 'rgba(2,12,7,0.9)';
  ctx.fillRect(doorX, baseY - 108, doorW, 108);
  ctx.fillStyle = withAlpha(th.accent, 0.55);
  ctx.fillRect(doorX + 8, baseY - 98, doorW - 16, 3);
  drawText(ctx, 'CEPK', VIEW_W / 2, baseY - 126, {
    size: 24, align: 'center', color: withAlpha(th.glow, 0.8), font: 'Consolas, monospace'
  });

  // árvores laterais
  for (const side of [-1, 1]) {
    const tx = side < 0 ? 58 : VIEW_W - 58;
    ctx.fillStyle = '#1a3b24';
    ctx.fillRect(tx - 7, baseY - 118, 14, 118);
    ctx.fillStyle = withAlpha(th.near, 0.95);
    for (let i = 0; i < 5; i++) {
      const ox = Math.sin(i * 1.7 + time * 0.4) * 10;
      ctx.fillRect(tx - 54 + i * 8 + ox, baseY - 170 - i * 17, 62 - i * 8, 30);
    }
    ctx.fillStyle = withAlpha(th.accent, 0.18);
    ctx.fillRect(tx - 46, baseY - 168, 36, 4);
  }

  // cerca / muro
  ctx.fillStyle = withAlpha(th.tileDark, 0.95);
  ctx.fillRect(0, baseY - 36, VIEW_W, 36);
  ctx.fillStyle = withAlpha(th.tile, 0.7);
  for (let x = 0; x < VIEW_W; x += 64) ctx.fillRect(x + 6, baseY - 32, 3, 26);
  ctx.fillStyle = withAlpha(th.accent, 0.20);
  ctx.fillRect(0, baseY - 38, VIEW_W, 3);

  // chão
  ctx.fillStyle = th.bg;
  ctx.fillRect(0, baseY, VIEW_W, VIEW_H - baseY);
  ctx.fillStyle = withAlpha(th.tileDark, 0.9);
  for (let x = 0; x < VIEW_W; x += 32) {
    ctx.fillRect(x, baseY, 30, 8);
  }

  // folhas flutuantes
  for (let i = 0; i < 26; i++) {
    const lx = (i * 191 + time * (18 + (i % 5) * 7)) % (VIEW_W + 80) - 40;
    const ly = 120 + ((i * 83 + Math.sin(time * 0.8 + i) * 50) % 470);
    drawLeaf(ctx, lx, ly, 5 + (i % 3) * 2, time * (0.4 + i * 0.03) + i, th.accent, 0.16 + (i % 4) * 0.05);
  }

  if (menu) {
    const vg = ctx.createRadialGradient(VIEW_W / 2, 330, 160, VIEW_W / 2, 330, 760);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}

Game.prototype.drawMenuBackground = function (ctx, theme) {
  drawSchoolBackdrop(ctx, theme || THEMES.school, this.menuTime, true);
  drawScanlines(ctx, 0.08);
};

Game.prototype.drawBackground = function (ctx, cam) {
  const th = this.level.theme;
  const kind = th.kind;
  const t = this.time;

  if (kind === 'hall' || kind === 'lab' || kind === 'office') {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, th.skyTop);
    g.addColorStop(1, th.bg);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // paredes com parallax
    const off = cam.x * 0.18;
    ctx.fillStyle = withAlpha(th.far, 0.95);
    ctx.fillRect(0, 80, VIEW_W, 520);
    for (let x = -((off % 96) + 96); x < VIEW_W + 96; x += 96) {
      ctx.fillStyle = withAlpha(th.mid, 0.65);
      ctx.fillRect(x, 110, 74, 470);
      ctx.fillStyle = withAlpha(th.tileDark, 0.8);
      ctx.fillRect(x + 4, 118, 66, 2);
      ctx.fillStyle = withAlpha(th.accent, 0.10);
      ctx.fillRect(x + 8, 130, 3, 430);
    }

    // rodapé / faixa
    ctx.fillStyle = withAlpha(th.near, 0.9);
    ctx.fillRect(0, 566, VIEW_W, 22);
    ctx.fillStyle = withAlpha(th.accent, 0.2);
    ctx.fillRect(0, 566, VIEW_W, 3);

    if (kind === 'hall') {
      // armários
      const off2 = cam.x * 0.34;
      for (let x = -((off2 % 72) + 72); x < VIEW_W + 72; x += 72) {
        ctx.fillStyle = withAlpha(th.near, 0.95);
        ctx.fillRect(x, 210, 64, 300);
        ctx.strokeStyle = withAlpha(th.tileDark, 0.9);
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, 211, 62, 298);
        ctx.fillStyle = withAlpha(th.tileTop, 0.45);
        ctx.fillRect(x + 7, 220, 50, 3);
        ctx.fillRect(x + 12, 250, 3, 22);
        ctx.fillRect(x + 49, 250, 3, 22);
        ctx.fillStyle = withAlpha(th.accent, 0.55);
        ctx.fillRect(x + 30, 330, 4, 8);
        // número
        drawText(ctx, String((Math.floor((x + off2) / 72) + 40) % 100), x + 32, 238, {
          size: 10, align: 'center', color: withAlpha(th.glow, 0.5)
        });
      }
      // luzes do teto
      for (let x = 90; x < VIEW_W; x += 260) {
        const flicker = 0.5 + 0.5 * Math.sin(t * 5 + x);
        ctx.fillStyle = withAlpha(th.glow, 0.12 + flicker * 0.1);
        ctx.fillRect(x, 54, 150, 8);
        ctx.fillStyle = withAlpha(th.glow, 0.05 + flicker * 0.05);
        ctx.beginPath();
        ctx.moveTo(x + 20, 62);
        ctx.lineTo(x + 130, 62);
        ctx.lineTo(x + 200, 330);
        ctx.lineTo(x - 50, 330);
        ctx.closePath();
        ctx.fill();
      }
    } else if (kind === 'lab') {
      // painéis e tubos
      const off2 = cam.x * 0.3;
      for (let x = -((off2 % 150) + 150); x < VIEW_W + 150; x += 150) {
        ctx.fillStyle = withAlpha(th.near, 0.7);
        ctx.fillRect(x, 150, 128, 390);
        ctx.strokeStyle = withAlpha(th.accent, 0.18);
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, 154, 120, 382);
        // vidro com líquido verde
        ctx.fillStyle = withAlpha(th.accent, 0.12);
        ctx.fillRect(x + 20, 200, 88, 220);
        const fill = 0.45 + Math.sin(t * 0.9 + x) * 0.12;
        ctx.fillStyle = withAlpha(th.accent, 0.22);
        ctx.fillRect(x + 20, 200 + 220 * (1 - fill), 88, 220 * fill);
        ctx.fillStyle = withAlpha(th.glow, 0.5);
        ctx.fillRect(x + 26, 208, 3, 204);
        // monitores
        ctx.fillStyle = 'rgba(2,14,10,0.9)';
        ctx.fillRect(x + 34, 444, 60, 34);
        ctx.fillStyle = withAlpha(th.accent, 0.5);
        ctx.fillRect(x + 39, 449, 50, 2);
        ctx.fillRect(x + 39, 455, 34, 2);
      }
      // tubos no teto
      ctx.fillStyle = withAlpha(th.tileDark, 0.9);
      ctx.fillRect(0, 84, VIEW_W, 14);
      ctx.fillStyle = withAlpha(th.accent, 0.22);
      ctx.fillRect(0, 86, VIEW_W, 2);
    } else {
      // diretoria: estantes e janelas
      const off2 = cam.x * 0.3;
      for (let x = -((off2 % 180) + 180); x < VIEW_W + 180; x += 180) {
        ctx.fillStyle = withAlpha(th.near, 0.8);
        ctx.fillRect(x, 180, 150, 370);
        ctx.strokeStyle = withAlpha(th.tileDark, 0.9);
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, 184, 142, 362);
        for (let r = 0; r < 4; r++) {
          ctx.fillStyle = withAlpha(th.tileDark, 0.7);
          ctx.fillRect(x + 8, 220 + r * 74, 134, 5);
          for (let b = 0; b < 7; b++) {
            ctx.fillStyle = withAlpha(r % 2 ? th.tile : th.tileTop, 0.28);
            ctx.fillRect(x + 12 + b * 18, 192 + r * 74, 13, 28);
          }
        }
      }
      // janelas altas
      for (let x = 180; x < VIEW_W; x += 320) {
        ctx.fillStyle = withAlpha(th.accent, 0.12);
        ctx.fillRect(x, 100, 90, 100);
        ctx.strokeStyle = withAlpha(th.glow, 0.25);
        ctx.strokeRect(x, 100, 90, 100);
        ctx.fillStyle = withAlpha(th.tileDark, 0.9);
        ctx.fillRect(x + 43, 100, 4, 100);
        ctx.fillRect(x, 146, 90, 4);
      }
    }
    return;
  }

  // pátio / quadra / treinamento
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, th.skyTop);
  g.addColorStop(0.62, th.skyBottom);
  g.addColorStop(1, th.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // lua
  const mx = 1030 - cam.x * 0.02;
  const my = 108;
  const halo = ctx.createRadialGradient(mx, my, 8, mx, my, 130);
  halo.addColorStop(0, withAlpha(th.glow, 0.22));
  halo.addColorStop(1, withAlpha(th.glow, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(mx - 140, my - 140, 280, 280);
  ctx.fillStyle = withAlpha(th.glow, 0.8);
  ctx.beginPath();
  ctx.arc(mx, my, 28, 0, TAU);
  ctx.fill();

  // estrelas
  for (let i = 0; i < 34; i++) {
    const sx = (i * 149 + 41) % VIEW_W;
    const sy = (i * 59 + 17) % 280;
    ctx.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.6 + i));
    ctx.fillStyle = th.glow;
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;

  // prédio escolar com parallax
  const off = cam.x * 0.22;
  const baseY = 570;
  ctx.fillStyle = withAlpha(th.far, 0.9);
  ctx.fillRect(60 - off * 0.2, baseY - 230, 1160, 230);
  ctx.fillStyle = withAlpha(th.mid, 0.8);
  ctx.fillRect(82 - off * 0.2, baseY - 210, 1116, 210);
  ctx.fillStyle = withAlpha(th.near, 0.9);
  ctx.fillRect(42 - off * 0.2, baseY - 246, 1196, 18);
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 12; col++) {
      const wx = 120 - off * 0.2 + col * 88;
      const wy = baseY - 184 + row * 58;
      ctx.fillStyle = withAlpha(th.glow, ((row + col) % 4 === 0) ? 0.45 : 0.16);
      ctx.fillRect(wx, wy, 42, 32);
      ctx.fillStyle = withAlpha(th.tileDark, 0.8);
      ctx.fillRect(wx + 20, wy, 2, 32);
    }
  }

  // árvores em parallax
  for (let i = 0; i < 9; i++) {
    const tx = i * 190 - (off * 0.6 % 190);
    const th2 = 70 + (i % 3) * 18;
    ctx.fillStyle = withAlpha(th.tileDark, 0.85);
    ctx.fillRect(tx - 6, baseY - 110, 12, 110);
    ctx.fillStyle = withAlpha(th.near, 0.9);
    for (let j = 0; j < 4; j++) {
      const ox = Math.sin(i * 2 + t * 0.5) * 6;
      ctx.fillRect(tx - 50 + j * 9 + ox, baseY - 160 - j * 16, 58 - j * 8, 26);
    }
  }

  // cerca
  ctx.fillStyle = withAlpha(th.tileDark, 0.9);
  ctx.fillRect(0, baseY - 44, VIEW_W, 44);
  ctx.fillStyle = withAlpha(th.tile, 0.6);
  for (let x = 0; x < VIEW_W; x += 48) ctx.fillRect(x + 6, baseY - 40, 3, 32);
  ctx.fillStyle = withAlpha(th.accent, 0.18);
  ctx.fillRect(0, baseY - 46, VIEW_W, 3);

  // chão
  ctx.fillStyle = th.bg;
  ctx.fillRect(0, baseY, VIEW_W, VIEW_H - baseY);

  // folhas
  for (let i = 0; i < 20; i++) {
    const lx = (i * 173 + t * (14 + (i % 4) * 8)) % (VIEW_W + 60) - 30;
    const ly = 160 + ((i * 97 + Math.sin(t * 0.7 + i) * 40) % 380);
    drawLeaf(ctx, lx, ly, 4 + (i % 3) * 2, t * 0.6 + i, th.accent, 0.12 + (i % 3) * 0.04);
  }
};

/* ------------------------------ TILES ------------------------------ */

Game.prototype.drawTiles = function (ctx, cam) {
  const level = this.level;
  const th = level.theme;
  const x0 = Math.max(0, Math.floor(cam.x / TILE) - 1);
  const x1 = Math.min(level.w - 1, Math.ceil((cam.x + VIEW_W) / TILE) + 1);
  const y0 = Math.max(0, Math.floor(cam.y / TILE) - 1);
  const y1 = Math.min(level.h - 1, Math.ceil((cam.y + VIEW_H) / TILE) + 1);

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = level.tile(tx, ty);
      if (t === TILE_EMPTY) continue;
      const x = tx * TILE - cam.x;
      const y = ty * TILE - cam.y;

      if (t === TILE_SOLID) {
        ctx.fillStyle = th.tile;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = th.tileDark;
        ctx.fillRect(x, y + TILE - 5, TILE, 5);
        ctx.fillRect(x + TILE - 4, y, 4, TILE);

        // topo iluminado apenas quando exposto
        if (level.tile(tx, ty - 1) === TILE_EMPTY) {
          ctx.fillStyle = th.tileTop;
          ctx.fillRect(x, y, TILE, 5);
          ctx.fillStyle = th.edge;
          ctx.fillRect(x, y, TILE, 2);
          if (th.kind === 'courtyard' || th.kind === 'training') {
            ctx.fillStyle = withAlpha(th.accent, 0.35);
            for (let i = 0; i < 4; i++) {
              ctx.fillRect(x + 5 + i * 7, y - 4, 2, 4);
            }
          }
        }

        // textura de piso / parede
        if (th.kind === 'hall') {
          ctx.fillStyle = 'rgba(0,0,0,0.14)';
          ctx.fillRect(x + 4, y + 12, TILE - 8, 2);
          ctx.fillRect(x + 4, y + 23, TILE - 8, 2);
        } else if (th.kind === 'lab') {
          ctx.fillStyle = withAlpha(th.accent, 0.12);
          ctx.fillRect(x + 6, y + 8, 6, 2);
          ctx.fillRect(x + 18, y + 18, 8, 2);
        } else if (th.kind === 'gym') {
          ctx.fillStyle = withAlpha(th.edge, 0.16);
          ctx.fillRect(x + 3, y + 10, TILE - 6, 2);
        } else if (th.kind === 'office') {
          ctx.fillStyle = 'rgba(0,0,0,0.12)';
          ctx.fillRect(x + 6, y + 9, 18, 2);
        } else {
          ctx.fillStyle = withAlpha(th.tileDark, 0.5);
          ctx.fillRect(x + 7, y + 15, 6, 3);
          ctx.fillRect(x + 20, y + 22, 5, 3);
        }

        // borda esquerda exposta
        if (level.tile(tx - 1, ty) === TILE_EMPTY) {
          ctx.fillStyle = withAlpha(th.edge, 0.45);
          ctx.fillRect(x, y + 4, 2, TILE - 8);
        }
      } else if (t === TILE_SPIKE) {
        ctx.fillStyle = th.hazard;
        const spikeH = 18;
        for (let i = 0; i < 4; i++) {
          const sx = x + i * 8;
          ctx.beginPath();
          ctx.moveTo(sx, y + TILE);
          ctx.lineTo(sx + 4, y + TILE - spikeH);
          ctx.lineTo(sx + 8, y + TILE);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = withAlpha('#ffffff', 0.35);
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x + i * 8 + 3, y + TILE - spikeH + 3, 2, 6);
        }
      } else if (t === TILE_LASER) {
        // emissores
        ctx.fillStyle = withAlpha(th.tileDark, 0.95);
        ctx.fillRect(x + 2, y, TILE - 4, 7);
        ctx.fillRect(x + 2, y + TILE - 7, TILE - 4, 7);
        ctx.fillStyle = withAlpha(th.hazard, 0.8);
        ctx.fillRect(x + 10, y + 2, 12, 3);
        ctx.fillRect(x + 10, y + TILE - 5, 12, 3);
        if (level.laserOn) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = withAlpha(th.hazard, 0.75);
          ctx.fillRect(x + 13, y + 6, 6, TILE - 12);
          ctx.fillStyle = withAlpha('#ffffff', 0.6);
          ctx.fillRect(x + 15, y + 6, 2, TILE - 12);
          ctx.restore();
        }
      }
    }
  }
};

Game.prototype.drawGates = function (ctx, cam) {
  const th = this.level.theme;
  for (const gate of this.level.gates) {
    if (gate.open) continue;
    const x = gate.tx * TILE - cam.x;
    const y = gate.ty * TILE - cam.y;
    const w = gate.w * TILE;
    const h = gate.h * TILE;
    if (x + w < -20 || x > VIEW_W + 20) continue;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, withAlpha(th.accent, 0.08));
    g.addColorStop(0.5, withAlpha(th.accent, 0.34));
    g.addColorStop(1, withAlpha(th.accent, 0.08));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = withAlpha(th.accent, 0.8);
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    const t = this.time;
    ctx.strokeStyle = withAlpha(th.glow, 0.55);
    ctx.lineWidth = 1;
    for (let sy = y + 8; sy < y + h - 8; sy += 12) {
      const off = Math.sin(t * 2 + sy * 0.05) * 3;
      ctx.beginPath();
      ctx.moveTo(x + 3, sy + off);
      ctx.lineTo(x + w - 3, sy + off);
      ctx.stroke();
    }
    ctx.fillStyle = withAlpha(th.glow, 0.9);
    ctx.fillRect(x - 3, y - 3, w + 6, 5);
    ctx.fillRect(x - 3, y + h - 2, w + 6, 5);

    // fechadura / tecla do treinamento
    const station = this.level.stations.find((s) => s.action === gate.station);
    if (station) {
      const cx = x + w / 2;
      const cy = y + h * 0.5;
      ctx.fillStyle = 'rgba(2,14,8,0.9)';
      roundRect(ctx, cx - 44, cy - 24, 88, 48, 6);
      ctx.fill();
      ctx.strokeStyle = withAlpha(th.accent, 0.8);
      ctx.stroke();
      drawText(ctx, station.label, cx, cy - 9, {
        size: 10, align: 'center', color: withAlpha(th.glow, 0.9)
      });
      drawKeycap(ctx, station.key, cx - 28, cy + 2, th.accent, true, 0.72);
    }
    ctx.restore();
  }
};

Game.prototype.drawGameScene = function (ctx) {
  const cam = this.cam;
  ctx.save();
  if (cam.shake > 0) {
    ctx.translate(rand(-cam.shake * 7, cam.shake * 7), rand(-cam.shake * 7, cam.shake * 7));
  }
  this.drawBackground(ctx, cam);
  this.drawTiles(ctx, cam);
  this.drawGates(ctx, cam);
  if (this.level.tutorial) this.drawTutorialWorld(ctx);

  for (const cp of this.checkpoints) cp.render(ctx, cam);
  if (this.exit) this.exit.render(ctx, cam);
  for (const cr of this.crumbles) cr.render(ctx, cam);
  for (const sp of this.springs) sp.render(ctx, cam);
  if (this.kennedito) this.kennedito.render(ctx, cam);
  for (const pk of this.pickups) pk.render(ctx, cam);
  for (const c of this.crates) c.render(ctx, cam);
  for (const e of this.enemies) e.render(ctx, cam);
  if (this.boss) this.boss.render(ctx, cam);
  if (this.kenneditoAlly) this.kenneditoAlly.render(ctx, cam);
  if (this.player) this.player.render(ctx, cam);
  for (const pr of this.projectiles) pr.render(ctx, cam);

  // anéis do pulso
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const ring of this.pulseRings) {
    const a = clamp(ring.life / ring.max, 0, 1);
    ctx.strokeStyle = withAlpha('#6dff9e', a * 0.8);
    ctx.lineWidth = 3 + a * 4;
    ctx.beginPath();
    ctx.arc(ring.x - cam.x, ring.y - cam.y, ring.r, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = withAlpha('#ffffff', a * 0.3);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ring.x - cam.x, ring.y - cam.y, ring.r * 0.86, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();

  FX.draw(ctx, cam);
  this.drawForeground(ctx, cam);
  ctx.restore();
};

Game.prototype.drawForeground = function (ctx, cam) {
  const th = this.level.theme;
  const t = this.time;
  if (th.kind === 'courtyard' || th.kind === 'training' || th.kind === 'gym') {
    for (let i = 0; i < 12; i++) {
      const x = (i * 211 + t * (20 + (i % 3) * 10)) % (VIEW_W + 40) - 20;
      const y = 120 + ((i * 127 + Math.sin(t * 0.9 + i) * 60) % 500);
      drawLeaf(ctx, x, y, 4 + (i % 3) * 2, t * 0.8 + i, th.accent, 0.10);
    }
  }
};

/* ------------------------------ HUD ------------------------------ */

Game.prototype.drawHUD = function (ctx) {
  const p = this.player;
  if (!p) return;
  const th = this.level.theme;

  // topo
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, 0, 120);
  g.addColorStop(0, 'rgba(2,10,6,0.78)');
  g.addColorStop(1, 'rgba(2,10,6,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, 120);
  ctx.restore();

  // vida
  drawText(ctx, 'VEGA', 26, 20, { size: 12, color: withAlpha(th.glow, 0.8) });
  for (let i = 0; i < p.maxHp; i++) {
    const filled = i < p.hp;
    drawPixelHeart(ctx, 26 + i * 22, 34, 16, filled ? '#6dff9e' : 'rgba(30,60,42,0.9)');
    if (filled) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      drawPixelHeart(ctx, 26 + i * 22, 34, 16, '#ffffff');
      ctx.restore();
    }
  }

  // energia
  const ew = 230;
  ctx.fillStyle = 'rgba(3,14,9,0.85)';
  roundRect(ctx, 26, 58, ew, 15, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(109,255,158,0.25)';
  ctx.lineWidth = 1;
  roundRect(ctx, 26, 58, ew, 15, 4);
  ctx.stroke();
  const ep = clamp(p.energy / p.maxEnergy, 0, 1);
  const eg = ctx.createLinearGradient(26, 0, 26 + ew, 0);
  eg.addColorStop(0, '#2f8a4c');
  eg.addColorStop(1, p.energyLock > 0 ? '#ff8c42' : '#7fe7ff');
  ctx.fillStyle = eg;
  roundRect(ctx, 28, 60, (ew - 4) * ep, 11, 3);
  ctx.fill();
  drawText(ctx, 'ENERGIA', 30, 66, { size: 8, color: 'rgba(3,18,10,0.9)' });

  // fase / dificuldade
  const diff = DIFFICULTIES[this.difficulty];
  drawText(ctx, this.level.name.toUpperCase(), VIEW_W - 26, 22, {
    size: 15, align: 'right', color: withAlpha(th.glow, 0.9)
  });
  drawText(ctx, `${diff.name}  ·  ${this.level.subtitle || ''}`, VIEW_W - 26, 42, {
    size: 10, align: 'right', color: withAlpha(diff.color, 0.7)
  });

  // contadores
  drawText(ctx, `◆ ${this.stats.gears}/${this.totalGears}   ● ${this.stats.cores}/${this.totalCores}   ✦ ${this.cluesFound.size}/4`, VIEW_W - 26, 62, {
    size: 11, align: 'right', color: 'rgba(210,240,220,0.7)'
  });

  // barra do chefe
  if (this.boss && this.boss.active && !this.boss.dead) {
    const bw = 500;
    const bx = VIEW_W / 2 - bw / 2;
    const by = 24;
    drawText(ctx, this.boss.cfg.name, VIEW_W / 2, by - 10, {
      size: 14, align: 'center', color: this.boss.color, glow: this.boss.color, glowSize: 8
    });
    ctx.fillStyle = 'rgba(3,10,7,0.9)';
    roundRect(ctx, bx, by, bw, 16, 4);
    ctx.fill();
    ctx.strokeStyle = withAlpha(this.boss.color, 0.65);
    ctx.lineWidth = 1.5;
    roundRect(ctx, bx, by, bw, 16, 4);
    ctx.stroke();
    const bp = clamp(this.boss.hp / this.boss.maxHp, 0, 1);
    ctx.fillStyle = this.boss.phase === 3 ? '#ff3355' : this.boss.phase === 2 ? '#ffd24d' : this.boss.color;
    roundRect(ctx, bx + 2, by + 2, (bw - 4) * bp, 12, 3);
    ctx.fill();
    drawText(ctx, `FASE ${this.boss.phase}`, bx + bw + 14, by + 8, {
      size: 10, color: withAlpha(this.boss.color, 0.8)
    });
  }

  // armas
  const wy = 646;
  drawText(ctx, 'ARMAS', 26, wy - 12, { size: 9, color: 'rgba(180,220,190,0.6)' });
  for (let i = 0; i < WEAPONS.length; i++) {
    const w = WEAPONS[i];
    const x = 26 + i * 156;
    const selected = i === this.weaponIndex;
    ctx.save();
    ctx.fillStyle = selected ? withAlpha(w.color, 0.16) : 'rgba(4,16,10,0.82)';
    roundRect(ctx, x, wy, 146, 48, 6);
    ctx.fill();
    ctx.strokeStyle = selected ? w.color : 'rgba(120,180,140,0.22)';
    ctx.lineWidth = selected ? 2 : 1;
    if (selected) {
      ctx.shadowColor = w.color;
      ctx.shadowBlur = 12;
    }
    roundRect(ctx, x, wy, 146, 48, 6);
    ctx.stroke();
    ctx.shadowBlur = 0;
    drawKeycap(ctx, String(i + 1), x + 8, wy + 12, w.color, true, 0.9);
    drawText(ctx, w.name, x + 38, wy + 20, {
      size: 12, color: selected ? w.color : 'rgba(205,235,215,0.72)'
    });
    drawText(ctx, w.melee ? 'CORPO A CORPO' : `TIRO · ${w.energy} ENERGIA`, x + 38, wy + 35, {
      size: 8, color: 'rgba(170,210,185,0.55)'
    });
    ctx.restore();
  }

  // poderes
  const pw = 46;
  const powers = ['pulse', 'focus', 'shield', 'super'];
  const px = VIEW_W - 26 - powers.length * (pw + 12) + 12;
  drawText(ctx, 'PODERES', px, wy - 12, { size: 9, color: 'rgba(180,220,190,0.6)' });
  powers.forEach((id, i) => {
    const info = POWER_INFO[id];
    const unlocked = this.powers.has(id);
    let state = unlocked ? 'ready' : 'locked';
    if (id === 'focus' && p.focus) state = 'active';
    if (id === 'shield' && p.shield) state = 'active';
    if (id === 'super' && p.superActive) state = 'active';
    drawPowerIcon(ctx, px + i * (pw + 12), wy, pw, id, info.color, state);
  });

  // impulso / parry
  const cdy = wy - 12;
  drawText(ctx, 'IMPULSO', 500, cdy - 2, { size: 8, color: 'rgba(170,210,185,0.55)' });
  drawKeycap(ctx, 'SHIFT', 500, cdy + 7, '#7fe7ff', p.dashCd <= 0, 0.9);
  drawText(ctx, 'PARRY', 590, cdy - 2, { size: 8, color: 'rgba(170,210,185,0.55)' });
  drawKeycap(ctx, 'E', 590, cdy + 7, '#6dff9e', p.parryCd <= 0, 0.9);
  if (p.parryChain > 1 && p.parryChainTimer > 0) {
    drawText(ctx, 'x' + p.parryChain, 626, cdy + 15, {
      size: 12, color: '#ffd24d', glow: '#ffd24d', glowSize: 8
    });
  }
  if (p.dashCd > 0) {
    ctx.fillStyle = 'rgba(3,14,9,0.7)';
    ctx.fillRect(500, cdy + 31, 58, 3);
    ctx.fillStyle = '#7fe7ff';
    ctx.fillRect(500, cdy + 31, 58 * (1 - p.dashCd / 0.65), 3);
  }

  // tutorial
  if (this.level.tutorial) this.drawTutorialHUD(ctx);

  // mudo
  drawText(ctx, Sfx.muted ? 'SOM OFF' : 'M · SOM', VIEW_W - 26, VIEW_H - 16, {
    size: 9, align: 'right', color: 'rgba(150,190,165,0.45)'
  });

  // morte
  if (p.dead) {
    ctx.fillStyle = 'rgba(2,8,5,0.55)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    drawText(ctx, 'SINAL PERDIDO', VIEW_W / 2, VIEW_H / 2 - 10, {
      size: 38, align: 'center', color: '#ff5d6c', glow: '#ff5d6c', glowSize: 18
    });
    drawText(ctx, 'Reiniciando no último checkpoint...', VIEW_W / 2, VIEW_H / 2 + 34, {
      size: 13, align: 'center', color: 'rgba(220,240,230,0.7)'
    });
  }
};

Game.prototype.drawToasts = function (ctx) {
  this.toasts.forEach((toast, i) => {
    const a = clamp(toast.life / Math.min(0.5, toast.max), 0, 1);
    const y = 104 + i * 34;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = 'bold 14px Consolas, monospace';
    const w = Math.max(220, ctx.measureText(toast.text).width + 44);
    const x = VIEW_W / 2 - w / 2;
    ctx.fillStyle = 'rgba(3,14,9,0.86)';
    roundRect(ctx, x, y - 15, w, 30, 5);
    ctx.fill();
    ctx.strokeStyle = withAlpha(toast.color, 0.55);
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y - 15, w, 30, 5);
    ctx.stroke();
    drawText(ctx, toast.text, VIEW_W / 2, y + 1, {
      size: 13, align: 'center', color: toast.color, glow: toast.color, glowSize: 8
    });
    ctx.restore();
  });
};

/* ------------------------------ DISPATCH ------------------------------ */

Game.prototype.render = function () {
  const ctx = this.ctx;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.imageSmoothingEnabled = false;

  switch (this.state) {
    case 'menu':
      this.renderMenu(ctx);
      break;
    case 'difficulty':
      this.renderDifficulty(ctx);
      break;
    case 'levelselect':
      this.renderLevelSelect(ctx);
      break;
    case 'help':
      this.renderHelp(ctx);
      break;
    case 'resetconfirm':
      this.renderResetConfirm(ctx);
      break;
    case 'cutscene':
      this.renderCutscene(ctx);
      break;
    case 'story':
      this.renderStory(ctx);
      break;
    case 'playing':
      this.drawGameScene(ctx);
      this.drawHUD(ctx);
      this.drawToasts(ctx);
      break;
    case 'paused':
      this.drawGameScene(ctx);
      this.drawHUD(ctx);
      this.renderPause(ctx);
      break;
    case 'complete':
      this.drawGameScene(ctx);
      this.drawHUD(ctx);
      this.renderComplete(ctx);
      break;
    case 'victory':
      this.renderVictory(ctx);
      break;
  }
};

/* ------------------------------ MENU ------------------------------ */

Game.prototype.renderMenu = function (ctx) {
  this.drawMenuBackground(ctx, THEMES.school);
  const t = this.menuTime;

  // selo escolar
  ctx.save();
  ctx.globalAlpha = 0.55;
  drawGear(ctx, 86, 92, 34, 12, t * 0.18, withAlpha('#6dff9e', 0.25), 3);
  drawGear(ctx, VIEW_W - 86, 92, 28, 10, -t * 0.14, withAlpha('#7fe7ff', 0.22), 3);
  ctx.restore();
  drawText(ctx, 'CEPK  //  PROTOCOLO VERDE', VIEW_W / 2, 48, {
    size: 12, align: 'center', color: 'rgba(180,240,200,0.62)'
  });

  // título pixel
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 84px "Arial Black", Impact, sans-serif';
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(2,18,10,0.9)';
  ctx.strokeText('CÓDIGO VERDE', VIEW_W / 2, 154);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#0d3a22';
  ctx.strokeText('CÓDIGO VERDE', VIEW_W / 2, 154);
  const titleG = ctx.createLinearGradient(0, 112, 0, 196);
  titleG.addColorStop(0, '#d9ffb0');
  titleG.addColorStop(0.45, '#6dff9e');
  titleG.addColorStop(1, '#2f8a4c');
  ctx.fillStyle = titleG;
  ctx.shadowColor = '#6dff9e';
  ctx.shadowBlur = 26;
  ctx.fillText('CÓDIGO VERDE', VIEW_W / 2, 154);
  ctx.restore();

  drawText(ctx, 'COLÉGIO PRESIDENTE KENNEDY', VIEW_W / 2, 210, {
    size: 18, align: 'center', color: '#c8ffda', glow: '#2f8a4c', glowSize: 12
  });
  drawText(ctx, 'VEGA · MONITOR DE SEGURANÇA · TURNO DA MADRUGADA', VIEW_W / 2, 242, {
    size: 11, align: 'center', color: 'rgba(180,230,195,0.58)'
  });

  const rects = this.menuLayout();
  this.menuRects = rects;
  rects.forEach((r, i) => {
    const selected = i === this.menuIndex;
    ctx.save();
    if (selected) {
      ctx.shadowColor = '#6dff9e';
      ctx.shadowBlur = 22;
    }
    ctx.fillStyle = selected ? 'rgba(31,105,58,0.55)' : 'rgba(3,16,10,0.78)';
    roundRect(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = selected ? '#8dffb0' : 'rgba(130,200,150,0.22)';
    ctx.lineWidth = selected ? 2 : 1.2;
    roundRect(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.stroke();

    // marcador lateral
    ctx.fillStyle = selected ? '#b6ff9a' : 'rgba(109,255,158,0.25)';
    ctx.fillRect(r.x + 14, r.y + 12, 3, r.h - 24);
    if (selected) {
      ctx.fillStyle = '#6dff9e';
      ctx.fillRect(r.x - 10, r.y + r.h / 2 - 3, 6, 6);
    }
    ctx.restore();
    drawText(ctx, r.label, r.x + 34, r.y + r.h / 2 + 1, {
      size: 17, color: selected ? '#e4ffe8' : 'rgba(205,235,215,0.78)'
    });
  });

  const s = this.save;
  if (s) {
    const gears = Object.values(s.gears || {}).reduce((a, b) => a + b, 0);
    const cores = Object.values(s.cores || {}).reduce((a, b) => a + b, 0);
    drawText(ctx, `FASES ${s.unlocked}/5   ·   CRACHÁS ${gears}   ·   NÚCLEOS ${cores}`, VIEW_W / 2, 642, {
      size: 11, align: 'center', color: 'rgba(165,220,180,0.55)'
    });
  } else {
    drawText(ctx, 'NOVO JOGO  ·  O TREINAMENTO ENSINA TUDO EM 2 MINUTOS', VIEW_W / 2, 642, {
      size: 11, align: 'center', color: 'rgba(165,220,180,0.55)'
    });
  }

  drawText(ctx, '↑ ↓ NAVEGAR   ·   ENTER CONFIRMAR   ·   M SOM', VIEW_W / 2, 676, {
    size: 11, align: 'center', color: 'rgba(150,200,165,0.52)'
  });
  drawText(ctx, Sfx.muted ? 'SOM: OFF' : 'SOM: ON', 24, VIEW_H - 18, {
    size: 9, color: 'rgba(150,200,165,0.4)'
  });
};

/* ------------------------------ DIFICULDADE ------------------------------ */

Game.prototype.renderDifficulty = function (ctx) {
  this.drawMenuBackground(ctx, THEMES.school);
  drawText(ctx, 'DIFICULDADE', VIEW_W / 2, 86, {
    size: 40, align: 'center', color: '#e4ffe8', glow: '#6dff9e', glowSize: 20
  });
  drawText(ctx, 'Escolha o quanto o CEPK vai resistir. Você pode mudar depois.', VIEW_W / 2, 128, {
    size: 12, align: 'center', color: 'rgba(180,225,195,0.6)'
  });
  const current = DIFFICULTIES[this.difficulty];
  drawText(ctx, 'ATUAL: ' + current.name, VIEW_W / 2, 176, {
    size: 13, align: 'center', color: current.color, glow: current.color, glowSize: 8
  });

  const cards = this.difficultyLayout();
  this.difficultyRects = cards;

  cards.forEach((card) => {
    const d = card.diff;
    const sel = card.index === this.selectedDifficulty;
    const cur = card.index === this.difficulty;

    ctx.save();
    if (sel) {
      ctx.shadowColor = d.color;
      ctx.shadowBlur = 24;
    }
    ctx.fillStyle = 'rgba(3,16,10,0.92)';
    roundRect(ctx, card.x, card.y, card.w, card.h, 10);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = sel ? d.color : 'rgba(130,200,150,0.2)';
    ctx.lineWidth = sel ? 2.5 : 1.2;
    roundRect(ctx, card.x, card.y, card.w, card.h, 10);
    ctx.stroke();

    ctx.fillStyle = withAlpha(d.color, sel ? 0.18 : 0.08);
    roundRect(ctx, card.x, card.y, card.w, 66, 10);
    ctx.fill();
    ctx.fillStyle = withAlpha(d.color, sel ? 0.10 : 0.04);
    ctx.fillRect(card.x, card.y + 38, card.w, 28);

    drawText(ctx, d.name, card.x + 16, card.y + 30, {
      size: 22, color: d.color, glow: sel ? d.color : null, glowSize: 10
    });
    if (cur) {
      drawText(ctx, 'ATUAL', card.x + card.w - 16, card.y + 24, {
        size: 9, align: 'right', color: '#ffffff'
      });
    }

    const descLines = wrapTextLines(ctx, d.desc, card.w - 32, 11);
    descLines.slice(0, 4).forEach((line, i) => {
      drawText(ctx, line, card.x + 16, card.y + 88 + i * 16, {
        size: 11, color: 'rgba(195,225,205,0.72)'
      });
    });

    const stats = [
      ['VIDA DO JOGADOR', String(d.playerHp), d.playerHp / 8, '#ff7a8a'],
      ['DANO RECEBIDO', Math.round(d.dmg * 100) + '%', d.dmg / 2, '#ffb066'],
      ['RESISTÊNCIA INIMIGA', Math.round(d.enemyHp * 100) + '%', d.enemyHp / 1.7, '#ffd24d'],
      ['VIDA DOS CHEFES', Math.round(d.bossHp * 100) + '%', d.bossHp / 1.5, '#ff5d7a']
    ];
    stats.forEach((row, i) => {
      const y = card.y + 178 + i * 34;
      drawText(ctx, row[0], card.x + 16, y, {
        size: 9, color: 'rgba(165,200,180,0.65)'
      });
      drawText(ctx, row[1], card.x + card.w - 16, y, {
        size: 11, align: 'right', color: row[3]
      });
      ctx.fillStyle = 'rgba(12,32,20,0.9)';
      roundRect(ctx, card.x + 16, y + 9, card.w - 32, 6, 3);
      ctx.fill();
      ctx.fillStyle = row[3];
      roundRect(ctx, card.x + 16, y + 9, Math.max(3, (card.w - 32) * clamp(row[2], 0, 1)), 6, 3);
      ctx.fill();
    });

    drawText(ctx, sel ? 'SELECIONADA' : 'CLIQUE PARA ESCOLHER', card.x + card.w / 2, card.y + card.h - 20, {
      size: 9, align: 'center', color: sel ? d.color : 'rgba(160,200,175,0.45)'
    });
    ctx.restore();
  });

  drawText(ctx, '← → ESCOLHER   ·   ENTER APLICAR   ·   ESC VOLTAR', VIEW_W / 2, 650, {
    size: 11, align: 'center', color: 'rgba(160,210,175,0.55)'
  });
};

/* ------------------------------ SELEÇÃO DE FASE ------------------------------ */

Game.prototype.renderLevelSelect = function (ctx) {
  this.drawMenuBackground(ctx, THEMES.school);
  drawText(ctx, 'SELECIONAR FASE', VIEW_W / 2, 116, {
    size: 40, align: 'center', color: '#e4ffe8', glow: '#6dff9e', glowSize: 20
  });
  drawText(ctx, 'Cada ala do CEPK guarda uma parte do Sistema Verde.', VIEW_W / 2, 158, {
    size: 12, align: 'center', color: 'rgba(180,225,195,0.6)'
  });

  const s = this.ensureSave();
  const cards = this.levelLayout();
  this.levelRects = cards;

  cards.forEach((card) => {
    const meta = LEVELS[card.index]();
    const theme = meta.theme;
    const unlocked = card.index <= s.unlocked;
    const selected = card.index === this.selectedLevel;
    const yOff = selected ? -8 : 0;

    ctx.save();
    if (selected) {
      ctx.shadowColor = theme.accent;
      ctx.shadowBlur = 26;
    }
    ctx.fillStyle = unlocked ? 'rgba(3,16,10,0.92)' : 'rgba(3,12,8,0.86)';
    roundRect(ctx, card.x, card.y + yOff, card.w, card.h, 10);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = selected ? theme.accent : 'rgba(130,200,150,0.2)';
    ctx.lineWidth = selected ? 2.5 : 1.2;
    roundRect(ctx, card.x, card.y + yOff, card.w, card.h, 10);
    ctx.stroke();

    // faixa visual do tema
    ctx.fillStyle = withAlpha(theme.accent, unlocked ? 0.20 : 0.06);
    roundRect(ctx, card.x, card.y + yOff, card.w, 74, 10);
    ctx.fill();
    ctx.fillStyle = withAlpha(theme.tile, unlocked ? 0.35 : 0.12);
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(card.x + 8 + i * 24, card.y + yOff + 58, 18, 8);
    }

    drawText(ctx, `FASE ${card.index}`, card.x + 14, card.y + yOff + 20, {
      size: 10, color: withAlpha(theme.accent, 0.95)
    });
    drawText(ctx, meta.short.toUpperCase(), card.x + 14, card.y + yOff + 46, {
      size: 20, color: unlocked ? '#e4ffe8' : 'rgba(140,170,150,0.5)'
    });

    if (unlocked) {
      drawText(ctx, meta.subtitle, card.x + 14, card.y + yOff + 92, {
        size: 10, color: 'rgba(180,215,195,0.62)'
      });
      const g = s.gears[meta.id] || 0;
      const c = s.cores[meta.id] || 0;
      drawText(ctx, `◆ ${g}    ● ${c}`, card.x + 14, card.y + yOff + 136, {
        size: 14, color: '#ffd24d'
      });
      const done = s.completed.includes(meta.id);
      drawText(ctx, done ? 'CONCLUÍDA' : 'NÃO CONCLUÍDA', card.x + 14, card.y + yOff + 172, {
        size: 10, color: done ? '#7fe7ff' : 'rgba(165,200,180,0.5)'
      });
      drawText(ctx, selected ? 'ENTER PARA JOGAR' : 'CLIQUE PARA JOGAR', card.x + 14, card.y + yOff + 218, {
        size: 9, color: selected ? theme.accent : 'rgba(150,195,165,0.45)'
      });
    } else {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = 'rgba(190,220,200,0.65)';
      ctx.lineWidth = 2;
      roundRect(ctx, card.x + card.w / 2 - 12, card.y + yOff + 106, 24, 20, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(card.x + card.w / 2, card.y + yOff + 106, 9, Math.PI, 0);
      ctx.stroke();
      ctx.restore();
      drawText(ctx, 'BLOQUEADA', card.x + card.w / 2, card.y + yOff + 154, {
        size: 11, align: 'center', color: 'rgba(190,220,200,0.55)'
      });
    }
    ctx.restore();
  });

  drawText(ctx, '← → ESCOLHER   ·   ENTER JOGAR   ·   ESC VOLTAR', VIEW_W / 2, 640, {
    size: 11, align: 'center', color: 'rgba(160,210,175,0.55)'
  });
};

/* ------------------------------ AJUDA ------------------------------ */

Game.prototype.renderHelp = function (ctx) {
  this.drawMenuBackground(ctx, THEMES.hall);
  drawText(ctx, 'COMO JOGAR', VIEW_W / 2, 74, {
    size: 38, align: 'center', color: '#e4ffe8', glow: '#6dff9e', glowSize: 18
  });

  drawPanel(ctx, 58, 108, 1164, 520, {
    fill: 'rgba(3,16,10,0.9)', stroke: 'rgba(109,255,158,0.22)', radius: 12
  });

  drawText(ctx, 'CONTROLES', 90, 142, { size: 15, color: '#7fe7ff' });
  const controls = [
    ['A / D  ·  ← / →', 'Andar'],
    ['SHIFT', 'Impulso (dash) · segure para correr'],
    ['ESPAÇO / W / ↑', 'Pular · aperte 2× para pulo duplo'],
    ['J  ·  CLIQUE ESQ.', 'Atacar na direção da mira (8 lados)'],
    ['E  ·  CLIQUE DIR.', 'Parry: aparar ataques verdes'],
    ['1 / 2 / 3', 'Bastão · Estilingue · Martelo'],
    ['Q', 'PULSO (após desbloquear)'],
    ['K', 'FOCO (segure)'],
    ['R', 'ESCUDO (segure)'],
    ['F', 'ADRENALINA'],
    ['M  ·  ESC / P', 'Som · Pausar']
  ];
  controls.forEach((row, i) => {
    const y = 174 + i * 29;
    drawText(ctx, row[0], 90, y, { size: 10, color: '#ffd24d' });
    drawText(ctx, row[1], 300, y, { size: 10, color: 'rgba(205,235,215,0.78)' });
  });

  drawText(ctx, 'PARRY', 90, 540, { size: 13, color: '#6dff9e' });
  const parryLines = wrapTextLines(ctx, 'Aperte E pouco antes do impacto. Os primeiros instantes são um PARRY PERFEITO: reflete tudo em volta, atordoa mais e recarrega o dash. Ataques vermelhos não podem ser aparados: use o dash ou o escudo.', 340, 10);
  parryLines.forEach((line, i) => {
    drawText(ctx, line, 90, 562 + i * 15, { size: 10, color: 'rgba(185,225,195,0.7)' });
  });

  drawText(ctx, 'ARMAS', 486, 142, { size: 15, color: '#7fe7ff' });
  WEAPONS.forEach((w, i) => {
    const y = 180 + i * 100;
    drawKeycap(ctx, String(i + 1), 486, y - 10, w.color, true, 0.95);
    drawText(ctx, w.name, 526, y, { size: 14, color: w.color });
    const lines = wrapTextLines(ctx, w.desc, 300, 10);
    lines.forEach((line, j) => {
      drawText(ctx, line, 526, y + 20 + j * 14, { size: 10, color: 'rgba(195,225,205,0.68)' });
    });
  });
  drawText(ctx, 'Dica: martelo arremessa caixas e quebra a guarda.', 486, 500, {
    size: 9, color: 'rgba(255,210,77,0.65)'
  });

  drawText(ctx, 'PODERES', 878, 142, { size: 15, color: '#7fe7ff' });
  const powers = ['pulse', 'focus', 'shield', 'super'];
  powers.forEach((id, i) => {
    const info = POWER_INFO[id];
    const y = 174 + i * 84;
    drawPowerIcon(ctx, 878, y, 38, id, info.color, 'ready');
    drawText(ctx, info.name, 928, y + 10, { size: 13, color: info.color });
    const lines = wrapTextLines(ctx, info.desc, 260, 9);
    lines.slice(0, 2).forEach((line, j) => {
      drawText(ctx, line, 928, y + 28 + j * 13, { size: 9, color: 'rgba(190,225,200,0.65)' });
    });
  });
  drawText(ctx, 'Dificuldade ajusta vida, dano, velocidade e agressividade.', 878, 520, {
    size: 9, color: 'rgba(180,220,190,0.55)'
  });

  drawText(ctx, 'ESC / ENTER / CLIQUE PARA VOLTAR', VIEW_W / 2, 660, {
    size: 11, align: 'center', color: 'rgba(160,210,175,0.55)'
  });
};

/* ------------------------------ RESET ------------------------------ */

Game.prototype.renderResetConfirm = function (ctx) {
  this.drawMenuBackground(ctx, THEMES.office);
  ctx.fillStyle = 'rgba(2,8,5,0.66)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const x = VIEW_W / 2 - 260;
  const y = 236;
  drawPanel(ctx, x, y, 520, 250, {
    fill: 'rgba(12,22,14,0.96)', stroke: 'rgba(255,93,108,0.55)', radius: 12, glow: '#ff5d6c'
  });
  drawText(ctx, 'APAGAR PROGRESSO?', VIEW_W / 2, y + 46, {
    size: 26, align: 'center', color: '#ff8f9a', glow: '#ff5d6c', glowSize: 12
  });
  drawText(ctx, 'Fases, poderes e colecionáveis serão perdidos.', VIEW_W / 2, y + 88, {
    size: 11, align: 'center', color: 'rgba(230,210,215,0.7)'
  });
  drawText(ctx, 'Essa ação não pode ser desfeita.', VIEW_W / 2, y + 110, {
    size: 11, align: 'center', color: 'rgba(230,210,215,0.55)'
  });

  const options = [
    { label: 'NÃO, VOLTAR', x: x + 48, color: '#7fe7ff' },
    { label: 'SIM, APAGAR', x: x + 286, color: '#ff5d6c' }
  ];
  options.forEach((o, i) => {
    const sel = i === this.resetIndex;
    ctx.save();
    if (sel) {
      ctx.shadowColor = o.color;
      ctx.shadowBlur = 16;
    }
    ctx.fillStyle = sel ? withAlpha(o.color, 0.18) : 'rgba(4,16,10,0.85)';
    roundRect(ctx, o.x, y + 154, 186, 50, 7);
    ctx.fill();
    ctx.strokeStyle = sel ? o.color : 'rgba(130,200,150,0.25)';
    ctx.lineWidth = sel ? 2 : 1;
    roundRect(ctx, o.x, y + 154, 186, 50, 7);
    ctx.stroke();
    ctx.restore();
    drawText(ctx, o.label, o.x + 93, y + 180, {
      size: 13, align: 'center', color: sel ? '#ffffff' : 'rgba(205,235,215,0.65)'
    });
  });
  drawText(ctx, '← → ESCOLHER   ·   ENTER CONFIRMAR   ·   ESC CANCELAR', VIEW_W / 2, y + 232, {
    size: 9, align: 'center', color: 'rgba(190,220,200,0.45)'
  });
};

/* ------------------------------ TREINAMENTO ------------------------------ */

Game.prototype.drawTutorialWorld = function (ctx) {
  const cam = this.cam;
  const t = this.time;
  const stations = this.level.stations;
  const next = stations.find((s) => !s.done && s.action !== 'exit');

  for (const s of stations) {
    const sx = s.tx * TILE + TILE / 2 - cam.x;
    const sy = s.ty * TILE - cam.y;
    if (sx < -220 || sx > VIEW_W + 220) continue;
    const active = next === s;
    const done = !!s.done;
    const color = done ? 'rgba(109,255,158,0.35)' : active ? '#c8ffda' : '#6dff9e';
    const alpha = done ? 0.32 : active ? 1 : 0.7;

    ctx.save();
    ctx.globalAlpha = alpha;

    // feixe holográfico
    const beam = ctx.createLinearGradient(sx, sy - 210, sx, sy);
    beam.addColorStop(0, withAlpha('#6dff9e', 0));
    beam.addColorStop(1, withAlpha('#6dff9e', done ? 0.03 : 0.12));
    ctx.fillStyle = beam;
    ctx.fillRect(sx - 30, sy - 210, 60, 210);

    // marcador no chão
    ctx.strokeStyle = withAlpha(color, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 34, 10, 0, 0, TAU);
    ctx.stroke();
    if (active) {
      ctx.globalAlpha = 0.4 + Math.sin(t * 5) * 0.2;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 44 + Math.sin(t * 4) * 5, 13, 0, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }

    // painel suspenso
    const py = sy - 176;
    const pw = 156;
    const ph = 58;
    ctx.fillStyle = 'rgba(2,18,10,0.88)';
    roundRect(ctx, sx - pw / 2, py, pw, ph, 7);
    ctx.fill();
    ctx.strokeStyle = withAlpha(color, active ? 0.95 : 0.5);
    ctx.lineWidth = active ? 2 : 1;
    roundRect(ctx, sx - pw / 2, py, pw, ph, 7);
    ctx.stroke();
    ctx.fillStyle = withAlpha(color, active ? 0.18 : 0.06);
    roundRect(ctx, sx - pw / 2 + 4, py + 4, pw - 8, 16, 4);
    ctx.fill();

    drawText(ctx, s.label, sx, py + 15, {
      size: 11, align: 'center', color, glow: active ? color : null, glowSize: 8
    });
    const kw = Math.max(34, s.key.length * 10 + 18) * 0.82;
    drawKeycap(ctx, s.key, sx - kw / 2, py + 27, color, true, 0.82);
    if (done) {
      ctx.strokeStyle = '#6dff9e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx + 52, py + 12);
      ctx.lineTo(sx + 59, py + 19);
      ctx.lineTo(sx + 71, py + 5);
      ctx.stroke();
    }

    // holo do chão até o painel
    ctx.strokeStyle = withAlpha(color, active ? 0.55 : 0.2);
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx, py + ph);
    ctx.stroke();
    ctx.setLineDash([]);

    // pequena demonstração fantasma
    this.drawTutorialGhost(ctx, s, sx, sy - 44, t, color, active);
    ctx.restore();
  }
};

Game.prototype.drawTutorialGhost = function (ctx, station, x, y, t, color, active) {
  ctx.save();
  ctx.globalAlpha = active ? 0.5 : 0.22;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  const bob = Math.sin(t * 4) * 3;
  const fig = (fx, fy, f) => {
    ctx.fillRect(fx - 5, fy - 18 + bob, 10, 12);
    ctx.fillRect(fx - 3, fy - 6 + bob, 3, 7);
    ctx.fillRect(fx + 1, fy - 6 + bob, 3, 7);
    ctx.fillRect(fx + (f > 0 ? 6 : -10), fy - 16 + bob, 5, 3);
  };

  switch (station.action) {
    case 'move':
      fig(x - 30, y, 1);
      fig(x - 10, y, 1);
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = 0.18 + i * 0.06;
        ctx.fillRect(x - 56 + i * 14, y - 3, 8, 3);
      }
      break;
    case 'jump':
    case 'double': {
      const arcY = y - 46 - Math.sin(t * 2.2) * 12;
      fig(x, arcY, 1);
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(x - 24, y, 44, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
      if (station.action === 'double') {
        ctx.beginPath();
        ctx.arc(x + 8, y - 20, 36, Math.PI * 1.08, Math.PI * 1.92);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      break;
    }
    case 'dash':
      fig(x - 24, y, 1);
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(x - 10 + i * 12, y - 20 + i * 2, 18, 3);
      }
      break;
    case 'attack':
      fig(x - 12, y, 1);
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + 8, y - 14, 28, -1.2, 0.9);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + 8, y - 14, 36, -1.1, 0.8);
      ctx.stroke();
      break;
    case 'shoot':
      fig(x - 20, y, 1);
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 12);
      ctx.lineTo(x + 48, y - 46);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(x + 50, y - 48, 12 + Math.sin(t * 3) * 2, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 38, y - 48);
      ctx.lineTo(x + 62, y - 48);
      ctx.moveTo(x + 50, y - 60);
      ctx.lineTo(x + 50, y - 36);
      ctx.stroke();
      break;
    case 'parry':
      fig(x - 12, y, 1);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + 12, y - 14, 26 + Math.sin(t * 4) * 2, -1.1, 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 12, y - 14, 34, -0.9, 0.6);
      ctx.stroke();
      ctx.fillStyle = '#ffd24d';
      ctx.beginPath();
      ctx.arc(x + 46, y - 36, 7, 0, TAU);
      ctx.fill();
      break;
    case 'exit':
      ctx.beginPath();
      ctx.arc(x, y - 24, 26 + Math.sin(t * 2) * 3, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y - 24, 16, 0, TAU);
      ctx.stroke();
      break;
  }
  ctx.restore();
};

Game.prototype.drawTutorialHUD = function (ctx) {
  const stations = this.level.stations.filter((s) => s.action !== 'exit');
  const done = stations.filter((s) => s.done).length;
  const next = stations.find((s) => !s.done);
  const x = VIEW_W - 306;
  const y = 82;

  drawPanel(ctx, x, y, 280, 64, {
    fill: 'rgba(3,16,10,0.82)', stroke: 'rgba(109,255,158,0.22)', radius: 8
  });
  drawText(ctx, 'TREINAMENTO', x + 14, y + 16, { size: 10, color: '#8dffb0' });
  drawText(ctx, `${done}/${stations.length}`, x + 266, y + 16, {
    size: 10, align: 'right', color: '#c8ffda'
  });
  for (let i = 0; i < stations.length; i++) {
    const dx = x + 14 + i * 34;
    ctx.fillStyle = stations[i].done ? '#6dff9e' : 'rgba(109,255,158,0.18)';
    ctx.fillRect(dx, y + 28, 26, 6);
  }
  if (next) {
    drawText(ctx, 'PRÓXIMO: ' + next.label, x + 14, y + 50, {
      size: 10, color: 'rgba(205,240,215,0.8)'
    });
  } else {
    drawText(ctx, 'PORTAL LIBERADO', x + 14, y + 50, {
      size: 10, color: '#ffd24d'
    });
  }

  if (next) {
    const label = `PRÓXIMO: ${next.label}  ·  ${next.key}`;
    ctx.save();
    ctx.font = 'bold 11px Consolas, monospace';
    const w = ctx.measureText(label).width + 44;
    ctx.restore();
    drawPanel(ctx, VIEW_W / 2 - w / 2, 606, w, 32, {
      fill: 'rgba(3,16,10,0.82)', stroke: 'rgba(109,255,158,0.25)', radius: 6
    });
    drawText(ctx, label, VIEW_W / 2, 622, {
      size: 11, align: 'center', color: '#c8ffda'
    });
  }
};

/* ------------------------------ CUTSCENES ------------------------------ */

Game.prototype.drawCutsceneBackdrop = function (ctx, theme, t) {
  const th = theme || THEMES.school;
  const kind = th.kind;

  if (kind === 'courtyard' || kind === 'training') {
    drawSchoolBackdrop(ctx, th, t, false);
    return;
  }

  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, th.skyTop);
  g.addColorStop(1, th.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  if (kind === 'gym') {
    // quadra
    ctx.fillStyle = withAlpha(th.tileDark, 0.9);
    ctx.fillRect(0, 300, VIEW_W, 420);
    ctx.fillStyle = withAlpha(th.tile, 0.55);
    ctx.fillRect(80, 330, VIEW_W - 160, 340);
    ctx.strokeStyle = withAlpha(th.edge, 0.5);
    ctx.lineWidth = 3;
    ctx.strokeRect(110, 350, VIEW_W - 220, 300);
    ctx.beginPath();
    ctx.moveTo(VIEW_W / 2, 350);
    ctx.lineTo(VIEW_W / 2, 650);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(VIEW_W / 2, 500, 70, 0, TAU);
    ctx.stroke();
    // arquibancadas
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = withAlpha(th.mid, 0.85);
      ctx.fillRect(0, 220 + i * 26, VIEW_W, 20);
      ctx.fillStyle = withAlpha(th.accent, 0.12);
      ctx.fillRect(0, 220 + i * 26, VIEW_W, 3);
    }
    // cestas
    for (const side of [-1, 1]) {
      const x = side < 0 ? 120 : VIEW_W - 120;
      ctx.fillStyle = '#d9d9c0';
      ctx.fillRect(x - 3, 150, 6, 140);
      ctx.fillRect(x - 24, 286, 48, 5);
      ctx.strokeStyle = '#ff8c42';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, 306, 20, 0, Math.PI);
      ctx.stroke();
    }
    // placar
    ctx.fillStyle = 'rgba(3,12,8,0.9)';
    ctx.fillRect(VIEW_W / 2 - 150, 60, 300, 80);
    ctx.strokeStyle = withAlpha(th.accent, 0.5);
    ctx.strokeRect(VIEW_W / 2 - 150, 60, 300, 80);
    drawText(ctx, 'CEPK  00 : 00  SISTEMA', VIEW_W / 2, 100, {
      size: 20, align: 'center', color: '#ffd24d', glow: '#ffd24d', glowSize: 10
    });
    // refletores
    for (let i = 0; i < 3; i++) {
      const lx = 200 + i * 440;
      ctx.fillStyle = withAlpha(th.glow, 0.13);
      ctx.beginPath();
      ctx.moveTo(lx - 24, 40);
      ctx.lineTo(lx + 24, 40);
      ctx.lineTo(lx + 160, 340);
      ctx.lineTo(lx - 160, 340);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }

  if (kind === 'lab') {
    ctx.fillStyle = withAlpha(th.far, 0.95);
    ctx.fillRect(0, 60, VIEW_W, 620);
    for (let x = 40; x < VIEW_W; x += 190) {
      ctx.fillStyle = withAlpha(th.near, 0.7);
      ctx.fillRect(x, 120, 150, 500);
      ctx.strokeStyle = withAlpha(th.accent, 0.2);
      ctx.strokeRect(x + 4, 124, 142, 492);
      ctx.fillStyle = withAlpha(th.accent, 0.12);
      ctx.fillRect(x + 22, 180, 106, 300);
      ctx.fillStyle = withAlpha(th.accent, 0.28);
      ctx.fillRect(x + 22, 320, 106, 160);
      ctx.fillStyle = withAlpha(th.glow, 0.5);
      ctx.fillRect(x + 30, 190, 4, 280);
    }
    ctx.fillStyle = withAlpha(th.tileDark, 0.95);
    ctx.fillRect(0, 70, VIEW_W, 18);
    for (let x = 0; x < VIEW_W; x += 120) {
      ctx.fillStyle = withAlpha(th.accent, 0.3);
      ctx.fillRect(x, 74, 60, 4);
    }
    return;
  }

  if (kind === 'office') {
    // janela grande
    ctx.fillStyle = withAlpha(th.accent, 0.14);
    ctx.fillRect(160, 90, 480, 300);
    ctx.strokeStyle = withAlpha(th.glow, 0.35);
    ctx.lineWidth = 5;
    ctx.strokeRect(160, 90, 480, 300);
    ctx.fillStyle = withAlpha(th.tileDark, 0.95);
    ctx.fillRect(396, 90, 8, 300);
    ctx.fillRect(160, 236, 480, 8);
    // lua
    ctx.fillStyle = withAlpha(th.glow, 0.7);
    ctx.beginPath();
    ctx.arc(520, 160, 34, 0, TAU);
    ctx.fill();
    // estantes
    for (let x = 760; x < VIEW_W; x += 170) {
      ctx.fillStyle = withAlpha(th.near, 0.8);
      ctx.fillRect(x, 140, 140, 380);
      for (let r = 0; r < 4; r++) {
        ctx.fillStyle = withAlpha(th.tileDark, 0.9);
        ctx.fillRect(x + 6, 200 + r * 74, 128, 5);
        for (let b = 0; b < 6; b++) {
          ctx.fillStyle = withAlpha(r % 2 ? th.tile : th.tileTop, 0.25);
          ctx.fillRect(x + 12 + b * 19, 174 + r * 74, 13, 24);
        }
      }
    }
    // mesa
    ctx.fillStyle = '#2a2418';
    ctx.fillRect(300, 470, 620, 32);
    ctx.fillRect(340, 500, 24, 140);
    ctx.fillRect(856, 500, 24, 140);
    ctx.fillStyle = withAlpha(th.accent, 0.25);
    ctx.fillRect(300, 470, 620, 4);
    // poltrona
    ctx.fillStyle = '#1b1a14';
    ctx.fillRect(540, 380, 130, 130);
    ctx.fillRect(520, 500, 170, 24);
    return;
  }

  // corredor
  ctx.fillStyle = withAlpha(th.far, 0.95);
  ctx.fillRect(0, 60, VIEW_W, 620);
  const horizonX = VIEW_W / 2;
  ctx.strokeStyle = withAlpha(th.accent, 0.12);
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const x = 80 + i * 190;
    ctx.beginPath();
    ctx.moveTo(x, 80);
    ctx.lineTo(horizonX + (x - horizonX) * 0.2, 360);
    ctx.stroke();
  }
  for (let x = 40; x < VIEW_W; x += 120) {
    ctx.fillStyle = withAlpha(th.near, 0.85);
    ctx.fillRect(x, 210, 104, 330);
    ctx.strokeStyle = withAlpha(th.tileDark, 0.9);
    ctx.strokeRect(x + 2, 212, 100, 326);
    ctx.fillStyle = withAlpha(th.accent, 0.3);
    ctx.fillRect(x + 16, 228, 72, 3);
    ctx.fillRect(x + 30, 260, 3, 18);
    ctx.fillRect(x + 70, 260, 3, 18);
  }
  for (let x = 140; x < VIEW_W; x += 300) {
    const fl = 0.5 + Math.sin(t * 6 + x) * 0.5;
    ctx.fillStyle = withAlpha(th.glow, 0.08 + fl * 0.12);
    ctx.fillRect(x, 52, 150, 7);
    ctx.beginPath();
    ctx.moveTo(x + 20, 60);
    ctx.lineTo(x + 130, 60);
    ctx.lineTo(x + 230, 380);
    ctx.lineTo(x - 80, 380);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = withAlpha(th.tileDark, 0.95);
  ctx.fillRect(0, 540, VIEW_W, 180);
};

Game.prototype.drawCutsceneMotif = function (ctx, motif, t) {
  const cx = VIEW_W / 2;
  const cy = 340;
  ctx.save();
  switch (motif) {
    case 'gate': {
      ctx.fillStyle = 'rgba(3,12,8,0.8)';
      ctx.fillRect(cx - 180, 220, 360, 300);
      ctx.strokeStyle = '#6dff9e';
      ctx.lineWidth = 4;
      ctx.strokeRect(cx - 180, 220, 360, 300);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = withAlpha('#6dff9e', 0.12 + (i % 2) * 0.06);
        ctx.fillRect(cx - 170 + i * 58, 230, 4, 280);
      }
      ctx.fillStyle = '#6dff9e';
      ctx.shadowColor = '#6dff9e';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(cx, 300, 18, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      drawText(ctx, 'ACESSO NEGADO', cx, 500, {
        size: 18, align: 'center', color: '#ff5d6c', glow: '#ff5d6c', glowSize: 12
      });
      // câmera
      ctx.fillStyle = '#1a2a20';
      ctx.fillRect(cx + 240, 180, 54, 34);
      ctx.fillStyle = '#ff3355';
      ctx.fillRect(cx + 282, 192, 5, 5);
      break;
    }
    case 'module': {
      const rr = 42 + Math.sin(t * 2.4) * 6;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = withAlpha('#6dff9e', 0.5 - i * 0.12);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, rr + i * 26 + Math.sin(t * 2 + i) * 4, 0, TAU);
        ctx.stroke();
      }
      ctx.fillStyle = '#c8ffda';
      ctx.shadowColor = '#6dff9e';
      ctx.shadowBlur = 40;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.8);
      ctx.fillRect(-20, -20, 40, 40);
      ctx.restore();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#2f8a4c';
      ctx.fillRect(cx - 7, cy - 7, 14, 14);
      break;
    }
    case 'observation': {
      for (let i = 0; i < 3; i++) {
        const x = cx - 270 + i * 270;
        ctx.fillStyle = 'rgba(3,14,9,0.95)';
        ctx.fillRect(x - 100, 230, 200, 150);
        ctx.strokeStyle = withAlpha('#7fe7ff', 0.5);
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 100, 230, 200, 150);
        ctx.fillStyle = withAlpha('#6dff9e', 0.12);
        ctx.fillRect(x - 90, 240, 180, 130);
        drawText(ctx, 'VEGA', x, 280, {
          size: 22, align: 'center', color: '#c8ffda', glow: '#6dff9e', glowSize: 10
        });
        drawText(ctx, 'MONITOR', x, 306, {
          size: 10, align: 'center', color: 'rgba(180,230,195,0.7)'
        });
        ctx.strokeStyle = '#ff3355';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, 342, 14, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 10, 332);
        ctx.lineTo(x + 10, 352);
        ctx.stroke();
      }
      break;
    }
    case 'training': {
      for (let i = 0; i < 3; i++) {
        const x = cx - 220 + i * 220;
        ctx.fillStyle = withAlpha('#5c8a28', 0.8);
        ctx.fillRect(x - 28, 300, 56, 120);
        ctx.fillStyle = '#c6f06a';
        ctx.fillRect(x - 22, 280, 44, 60);
        ctx.fillStyle = '#ff5d6c';
        ctx.fillRect(x - 12, 292, 24, 24);
        ctx.fillStyle = '#5c8a28';
        ctx.fillRect(x - 6, 250, 12, 34);
        ctx.fillStyle = '#ffd24d';
        ctx.fillRect(x - 10, 240, 20, 10);
        ctx.strokeStyle = 'rgba(109,255,158,0.4)';
        ctx.beginPath();
        ctx.arc(x, 320, 54 + Math.sin(t * 3 + i) * 4, 0, TAU);
        ctx.stroke();
      }
      break;
    }
    case 'gym': {
      ctx.fillStyle = '#ffd24d';
      ctx.font = '900 64px "Arial Black", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('00 : 00', cx, cy - 20);
      drawText(ctx, 'PARTIDA INFINITA', cx, cy + 40, {
        size: 16, align: 'center', color: '#ff8c42'
      });
      break;
    }
    case 'lab': {
      // reator
      ctx.fillStyle = 'rgba(3,14,10,0.9)';
      ctx.fillRect(cx - 90, 200, 180, 280);
      ctx.strokeStyle = withAlpha('#4fffd0', 0.6);
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 90, 200, 180, 280);
      const rr = 36 + Math.sin(t * 4) * 5;
      ctx.fillStyle = withAlpha('#4fffd0', 0.2);
      ctx.beginPath();
      ctx.arc(cx, cy - 30, rr + 24, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#4fffd0';
      ctx.shadowColor = '#4fffd0';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(cx, cy - 30, rr, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = withAlpha('#4fffd0', 0.4);
        ctx.beginPath();
        ctx.arc(cx, cy - 30, 58 + i * 16 + Math.sin(t * 3 + i) * 4, 0, TAU);
        ctx.stroke();
      }
      break;
    }
    case 'project': {
      ctx.fillStyle = 'rgba(3,14,9,0.95)';
      ctx.fillRect(cx - 220, 170, 440, 300);
      ctx.strokeStyle = withAlpha('#6dff9e', 0.5);
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 220, 170, 440, 300);
      ctx.fillStyle = withAlpha('#6dff9e', 0.10);
      ctx.fillRect(cx - 208, 182, 416, 276);
      drawText(ctx, 'PROJETO VEGA', cx, 230, {
        size: 24, align: 'center', color: '#c8ffda', glow: '#6dff9e', glowSize: 14
      });
      // silhueta
      ctx.fillStyle = 'rgba(200,255,218,0.35)';
      ctx.beginPath();
      ctx.arc(cx, 310, 30, 0, TAU);
      ctx.fill();
      ctx.fillRect(cx - 26, 340, 52, 90);
      drawText(ctx, 'STATUS: CHAVE', cx, 460, {
        size: 13, align: 'center', color: '#ffd24d'
      });
      break;
    }
    case 'office': {
      // diretora
      ctx.fillStyle = 'rgba(4,10,6,0.9)';
      ctx.fillRect(cx - 70, 250, 140, 180);
      ctx.fillStyle = '#1b2a1a';
      ctx.fillRect(cx - 80, 420, 160, 80);
      ctx.fillStyle = '#e8b07a';
      ctx.fillRect(cx - 34, 210, 68, 46);
      ctx.fillStyle = '#2a1d16';
      ctx.fillRect(cx - 38, 200, 76, 16);
      ctx.fillStyle = '#ff3355';
      ctx.fillRect(cx - 20, 228, 10, 5);
      ctx.fillRect(cx + 10, 228, 10, 5);
      ctx.fillStyle = '#d9ff6d';
      ctx.fillRect(cx - 4, 320, 8, 34);
      break;
    }
    case 'confrontation': {
      ctx.fillStyle = 'rgba(2,8,5,0.8)';
      ctx.fillRect(cx - 300, 180, 600, 380);
      ctx.strokeStyle = 'rgba(255,93,122,0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 300, 180, 600, 380);
      ctx.fillStyle = 'rgba(255,93,122,0.12)';
      ctx.fillRect(cx - 290, 190, 580, 360);
      // duas silhuetas
      ctx.fillStyle = 'rgba(200,255,218,0.55)';
      ctx.beginPath();
      ctx.arc(cx - 150, 300, 26, 0, TAU);
      ctx.fill();
      ctx.fillRect(cx - 174, 326, 48, 100);
      ctx.fillStyle = 'rgba(255,93,122,0.6)';
      ctx.beginPath();
      ctx.arc(cx + 150, 280, 32, 0, TAU);
      ctx.fill();
      ctx.fillRect(cx + 120, 312, 60, 120);
      ctx.strokeStyle = 'rgba(255,93,122,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 100, 340);
      ctx.lineTo(cx + 90, 320);
      ctx.stroke();
      break;
    }
    case 'final': {
      const sun = ctx.createRadialGradient(cx, 300, 20, cx, 300, 360);
      sun.addColorStop(0, 'rgba(255,240,170,0.55)');
      sun.addColorStop(0.5, 'rgba(109,255,158,0.18)');
      sun.addColorStop(1, 'rgba(109,255,158,0)');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.fillStyle = '#ffe9a0';
      ctx.beginPath();
      ctx.arc(cx, 300, 52 + Math.sin(t) * 4, 0, TAU);
      ctx.fill();
      // portão aberto
      ctx.strokeStyle = withAlpha('#6dff9e', 0.8);
      ctx.lineWidth = 6;
      ctx.strokeRect(cx - 120, 260, 240, 300);
      ctx.fillStyle = 'rgba(109,255,158,0.12)';
      ctx.fillRect(cx - 114, 266, 228, 288);
      drawText(ctx, 'ESCOLA LIVRE', cx, 600, {
        size: 22, align: 'center', color: '#e4ffe8', glow: '#6dff9e', glowSize: 16
      });
      break;
    }
  }
  ctx.restore();
};

Game.prototype.renderCutscene = function (ctx) {
  const level = this.level;
  const slide = this.cutsceneSlide();
  if (!level || !slide) return;
  const t = this.cutsceneTime;

  this.drawCutsceneBackdrop(ctx, level.theme, t);
  this.drawCutsceneMotif(ctx, slide.motif, t);

  // vinheta e letterbox
  const vg = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, 240, VIEW_W / 2, VIEW_H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = 'rgba(2,8,5,0.92)';
  ctx.fillRect(0, 0, VIEW_W, 58);
  ctx.fillRect(0, VIEW_H - 210, VIEW_W, 210);
  drawScanlines(ctx, 0.10);

  drawText(ctx, 'CEPK // REGISTRO ' + String(this.cutsceneIndex + 1).padStart(2, '0'), 34, 30, {
    size: 11, color: 'rgba(180,230,195,0.55)'
  });
  drawText(ctx, level.name.toUpperCase(), VIEW_W - 34, 30, {
    size: 11, align: 'right', color: 'rgba(180,230,195,0.55)'
  });

  drawText(ctx, slide.title, 64, VIEW_H - 166, {
    size: 28, color: '#c8ffda', glow: '#6dff9e', glowSize: 14
  });

  let remaining = Math.floor(this.cutsceneReveal);
  slide.lines.forEach((line, i) => {
    const visible = line.slice(0, Math.max(0, remaining));
    remaining -= line.length + 1;
    drawText(ctx, visible, 64, VIEW_H - 128 + i * 24, {
      size: 14, color: 'rgba(220,245,230,0.86)'
    });
  });

  const total = this.cutsceneText(slide).length;
  if (this.cutsceneReveal >= total) {
    const a = 0.45 + Math.sin(t * 5) * 0.25;
    drawText(ctx, 'ENTER / CLIQUE PARA CONTINUAR', VIEW_W - 64, VIEW_H - 34, {
      size: 11, align: 'right', color: withAlpha('#c8ffda', a)
    });
  } else {
    drawText(ctx, 'ENTER PARA ACELERAR', VIEW_W - 64, VIEW_H - 34, {
      size: 11, align: 'right', color: 'rgba(180,220,195,0.4)'
    });
  }

  // bolinhas
  const slides = this.cutsceneSlides();
  const dotW = 10;
  const totalDots = slides.length * dotW + (slides.length - 1) * 8;
  for (let i = 0; i < slides.length; i++) {
    const x = VIEW_W / 2 - totalDots / 2 + i * (dotW + 8);
    ctx.fillStyle = i === this.cutsceneIndex ? '#6dff9e' : 'rgba(109,255,158,0.22)';
    ctx.fillRect(x, VIEW_H - 30, dotW, 4);
  }
};

Game.prototype.renderStory = function (ctx) {
  const level = this.level;
  this.drawCutsceneBackdrop(ctx, level.theme, this.time);
  ctx.fillStyle = 'rgba(2,8,5,0.62)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawScanlines(ctx, 0.08);

  drawText(ctx, 'CEPK // BRIEFING', VIEW_W / 2, 90, {
    size: 11, align: 'center', color: 'rgba(180,230,195,0.5)'
  });
  drawText(ctx, level.name.toUpperCase(), VIEW_W / 2, 152, {
    size: 44, align: 'center', color: '#e4ffe8', glow: level.theme.accent, glowSize: 22
  });
  drawText(ctx, level.subtitle, VIEW_W / 2, 194, {
    size: 13, align: 'center', color: 'rgba(200,240,210,0.65)'
  });

  drawPanel(ctx, VIEW_W / 2 - 390, 242, 780, 262, {
    fill: 'rgba(3,16,10,0.82)', stroke: withAlpha(level.theme.accent, 0.25), radius: 12
  });
  level.story.forEach((line, i) => {
    drawText(ctx, line, VIEW_W / 2, 292 + i * 44, {
      size: 16, align: 'center', color: 'rgba(225,248,232,0.9)'
    });
  });

  drawText(ctx, 'ENTER / CLIQUE PARA COMEÇAR', VIEW_W / 2, 580, {
    size: 13, align: 'center', color: withAlpha(level.theme.accent, 0.85), glow: level.theme.accent, glowSize: 10
  });
  drawText(ctx, 'ESC VOLTA AO MENU', VIEW_W / 2, 618, {
    size: 10, align: 'center', color: 'rgba(170,210,185,0.45)'
  });
};

/* ------------------------------ PAUSA ------------------------------ */

Game.prototype.renderPause = function (ctx) {
  ctx.fillStyle = 'rgba(2,8,5,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawScanlines(ctx, 0.10);

  drawText(ctx, 'PAUSA', VIEW_W / 2, 276, {
    size: 46, align: 'center', color: '#e4ffe8', glow: '#6dff9e', glowSize: 22
  });
  drawText(ctx, this.level.name.toUpperCase(), VIEW_W / 2, 322, {
    size: 12, align: 'center', color: 'rgba(200,240,210,0.6)'
  });

  const rects = this.pauseLayout();
  this.pauseRects = rects;
  rects.forEach((r, i) => {
    const sel = i === this.pauseIndex;
    ctx.save();
    if (sel) {
      ctx.shadowColor = '#6dff9e';
      ctx.shadowBlur = 18;
    }
    ctx.fillStyle = sel ? 'rgba(31,105,58,0.55)' : 'rgba(3,16,10,0.86)';
    roundRect(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.strokeStyle = sel ? '#8dffb0' : 'rgba(130,200,150,0.22)';
    ctx.lineWidth = sel ? 2 : 1;
    roundRect(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.stroke();
    ctx.restore();
    drawText(ctx, r.label, r.x + r.w / 2, r.y + r.h / 2 + 1, {
      size: 15, align: 'center', color: sel ? '#e4ffe8' : 'rgba(205,235,215,0.72)'
    });
  });

  drawText(ctx, 'Q PULSO · K FOCO · R ESCUDO · F ADRENALINA · E PARRY · SHIFT DASH', VIEW_W / 2, 628, {
    size: 10, align: 'center', color: 'rgba(175,220,190,0.5)'
  });
  drawText(ctx, 'ESC / P CONTINUAR', VIEW_W / 2, 660, {
    size: 10, align: 'center', color: 'rgba(175,220,190,0.4)'
  });
};

/* ------------------------------ FIM DE FASE ------------------------------ */

Game.prototype.renderComplete = function (ctx) {
  const stats = this.completeStats || { gears: 0, cores: 0, deaths: 0, time: 0, level: this.level };
  const level = stats.level || this.level;
  const th = level.theme;

  ctx.fillStyle = 'rgba(2,8,5,0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawScanlines(ctx, 0.08);

  drawText(ctx, 'FASE CONCLUÍDA', VIEW_W / 2, 138, {
    size: 48, align: 'center', color: '#e4ffe8', glow: th.accent, glowSize: 26
  });
  drawText(ctx, level.name.toUpperCase(), VIEW_W / 2, 190, {
    size: 15, align: 'center', color: th.accent
  });

  drawPanel(ctx, VIEW_W / 2 - 310, 242, 620, 262, {
    fill: 'rgba(3,16,10,0.88)', stroke: withAlpha(th.accent, 0.3), radius: 12
  });
  const rows = [
    ['CRACHÁS', `${stats.gears} / ${this.totalGears}`, '#ffd24d'],
    ['NÚCLEOS', `${stats.cores} / ${this.totalCores}`, '#ff5d7a'],
    ['PISTAS', `${this.cluesFound.size} / 4`, '#b6ff9a'],
    ['QUEDAS', String(stats.deaths), '#ff8c42'],
    ['TEMPO', this.formatTime(stats.time), '#7fe7ff'],
    ['DIFICULDADE', DIFFICULTIES[this.difficulty].name, DIFFICULTIES[this.difficulty].color]
  ];
  rows.forEach((row, i) => {
    const y = 282 + i * 38;
    drawText(ctx, row[0], VIEW_W / 2 - 250, y, {
      size: 11, color: 'rgba(185,225,195,0.65)'
    });
    drawText(ctx, row[1], VIEW_W / 2 + 250, y, {
      size: 14, align: 'right', color: row[2]
    });
    ctx.fillStyle = 'rgba(130,200,150,0.12)';
    ctx.fillRect(VIEW_W / 2 - 250, y + 14, 500, 1);
  });

  const rects = this.completeLayout();
  this.completeRects = rects;
  const r = rects[0];
  const sel = true;
  ctx.save();
  ctx.shadowColor = th.accent;
  ctx.shadowBlur = 20;
  ctx.fillStyle = withAlpha(th.accent, 0.18);
  roundRect(ctx, r.x, r.y, r.w, r.h, 8);
  ctx.fill();
  ctx.strokeStyle = th.accent;
  ctx.lineWidth = 2;
  roundRect(ctx, r.x, r.y, r.w, r.h, 8);
  ctx.stroke();
  ctx.restore();
  drawText(ctx, r.label, r.x + r.w / 2, r.y + r.h / 2 + 1, {
    size: 16, align: 'center', color: '#e4ffe8'
  });
  drawText(ctx, 'ENTER / CLIQUE', VIEW_W / 2, 638, {
    size: 10, align: 'center', color: 'rgba(180,220,190,0.45)'
  });
};

Game.prototype.formatTime = function (seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};

Game.prototype.renderVictory = function (ctx) {
  const t = this.time;
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, '#071a0e');
  g.addColorStop(0.45, '#1f5c32');
  g.addColorStop(0.72, '#7dbb56');
  g.addColorStop(1, '#d9ff9a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // sol
  const sun = ctx.createRadialGradient(VIEW_W / 2, 400, 20, VIEW_W / 2, 400, 420);
  sun.addColorStop(0, 'rgba(255,245,190,0.8)');
  sun.addColorStop(0.4, 'rgba(255,220,120,0.24)');
  sun.addColorStop(1, 'rgba(255,220,120,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fff2b0';
  ctx.beginPath();
  ctx.arc(VIEW_W / 2, 410, 64 + Math.sin(t * 0.8) * 3, 0, TAU);
  ctx.fill();

  // escola ao fundo
  ctx.fillStyle = 'rgba(14,48,26,0.8)';
  ctx.fillRect(210, 310, 860, 230);
  ctx.fillStyle = 'rgba(28,84,44,0.8)';
  ctx.fillRect(232, 330, 816, 210);
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = 'rgba(255,245,190,0.28)';
    ctx.fillRect(250 + i * 66, 356, 34, 28);
    ctx.fillRect(250 + i * 66, 406, 34, 28);
  }
  ctx.fillStyle = 'rgba(10,34,18,0.9)';
  ctx.fillRect(VIEW_W / 2 - 50, 440, 100, 100);

  // portão aberto
  ctx.strokeStyle = 'rgba(230,255,210,0.8)';
  ctx.lineWidth = 5;
  ctx.strokeRect(VIEW_W / 2 - 120, 430, 240, 170);
  ctx.fillStyle = 'rgba(230,255,210,0.12)';
  ctx.fillRect(VIEW_W / 2 - 116, 434, 232, 162);

  // folhas
  for (let i = 0; i < 40; i++) {
    const lx = (i * 173 + t * (22 + (i % 4) * 10)) % (VIEW_W + 80) - 40;
    const ly = 100 + ((i * 97 + Math.sin(t * 0.8 + i) * 80) % 560);
    drawLeaf(ctx, lx, ly, 5 + (i % 3) * 2, t * 0.6 + i, i % 3 ? '#d9ff9a' : '#6dff9e', 0.4);
  }

  ctx.fillStyle = 'rgba(2,12,6,0.42)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawScanlines(ctx, 0.07);

  drawText(ctx, 'CÓDIGO VERDE', VIEW_W / 2, 96, {
    size: 16, align: 'center', color: 'rgba(230,255,210,0.7)'
  });
  drawText(ctx, 'ESCOLA LIVRE', VIEW_W / 2, 172, {
    size: 58, align: 'center', color: '#f4ffe0', glow: '#d9ff9a', glowSize: 26
  });
  drawText(ctx, 'O Sistema Verde caiu. O CEPK voltou a respirar.', VIEW_W / 2, 224, {
    size: 14, align: 'center', color: 'rgba(235,255,220,0.82)'
  });

  const stats = this.completeStats;
  if (stats) {
    drawPanel(ctx, VIEW_W / 2 - 260, 270, 520, 92, {
      fill: 'rgba(3,16,10,0.72)', stroke: 'rgba(217,255,154,0.3)', radius: 10
    });
    drawText(ctx, `CRACHÁS ${stats.gears}   ·   NÚCLEOS ${stats.cores}   ·   PISTAS ${this.cluesFound.size}/4   ·   TEMPO ${this.formatTime(stats.time)}`, VIEW_W / 2, 304, {
      size: 12, align: 'center', color: '#ffd24d'
    });
    drawText(ctx, `DIFICULDADE: ${DIFFICULTIES[this.difficulty].name}`, VIEW_W / 2, 332, {
      size: 10, align: 'center', color: 'rgba(220,250,220,0.6)'
    });
  }

  drawText(ctx, 'VEGA · MONITOR DE SEGURANÇA', VIEW_W / 2, 646, {
    size: 11, align: 'center', color: 'rgba(230,255,210,0.6)'
  });
  drawText(ctx, 'ENTER / CLIQUE PARA VOLTAR AO MENU', VIEW_W / 2, 678, {
    size: 11, align: 'center', color: withAlpha('#f4ffe0', 0.55 + Math.sin(t * 4) * 0.2)
  });
};


