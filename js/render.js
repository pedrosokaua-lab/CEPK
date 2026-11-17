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

const wrapMod = (v, m) => ((v % m) + m) % m;

function drawFacadeWindow(ctx, x, y, w, h, n, th, time, seed) {
  // moldura e vão
  ctx.fillStyle = withAlpha(th.wallDark, 0.9);
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);

  if (n < 0.30) {
    // sala acesa: luz âmbar, cortina e silhuetas
    ctx.fillStyle = withAlpha(th.warm, 0.52);
    ctx.fillRect(x, y, w, h);
    const wg = ctx.createLinearGradient(0, y, 0, y + h);
    wg.addColorStop(0, withAlpha(th.warm, 0.4));
    wg.addColorStop(1, withAlpha('#ff7a3c', 0.12));
    ctx.fillStyle = wg;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = withAlpha(th.mid, 0.55);
    ctx.fillRect(x, y, 7, h);
    ctx.fillRect(x + w - 7, y, 7, h);
    // mesa e abajur
    if (seed % 3 === 0) {
      ctx.fillStyle = withAlpha(th.shadow, 0.55);
      ctx.fillRect(x + 10, y + h - 9, w - 20, 4);
      ctx.fillRect(x + 14, y + h - 16, 2, 8);
      ctx.fillStyle = withAlpha(th.warm, 0.95);
      ctx.fillRect(x + 11, y + h - 19, 8, 4);
    } else if (seed % 3 === 1) {
      // planta na janela
      ctx.fillStyle = withAlpha(th.shadow, 0.5);
      ctx.fillRect(x + 10, y + h - 12, 7, 7);
      ctx.fillRect(x + 8, y + h - 18, 4, 8);
      ctx.fillRect(x + 15, y + h - 16, 4, 6);
    }
    // brilho da janela na fachada
    ctx.fillStyle = withAlpha(th.warm, 0.06);
    ctx.fillRect(x - 6, y + h + 5, w + 12, 14);
  } else if (n < 0.52) {
    // sala apagada, reflexo frio
    ctx.fillStyle = 'rgba(10,16,30,0.9)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = withAlpha(th.cool, 0.12);
    ctx.fillRect(x + 4, y + 4, w - 8, 10);
    ctx.fillStyle = withAlpha(th.cool, 0.05);
    ctx.fillRect(x + 4, y + 18, w - 8, h - 22);
  } else if (n < 0.74) {
    // janela escura
    ctx.fillStyle = 'rgba(7,11,22,0.94)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = withAlpha(th.cool, 0.05);
    ctx.fillRect(x + 5, y + 5, 2, h - 10);
  } else if (n < 0.86) {
    // janela quebrada
    ctx.fillStyle = 'rgba(6,10,20,0.96)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = withAlpha(th.cool, 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 2);
    ctx.lineTo(x + 15, y + 12);
    ctx.lineTo(x + 11, y + 20);
    ctx.lineTo(x + 21, y + 29);
    ctx.moveTo(x + 15, y + 12);
    ctx.lineTo(x + 27, y + 8);
    ctx.moveTo(x + w - 8, y + h - 2);
    ctx.lineTo(x + w - 17, y + h - 14);
    ctx.stroke();
    ctx.fillStyle = withAlpha(th.cool, 0.14);
    ctx.beginPath();
    ctx.moveTo(x + 31, y + 3);
    ctx.lineTo(x + 42, y + 3);
    ctx.lineTo(x + 37, y + 14);
    ctx.closePath();
    ctx.fill();
  } else {
    // janela tapada com madeira
    ctx.fillStyle = withAlpha(th.wood, 0.55);
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = withAlpha(th.shadow, 0.45);
    ctx.fillRect(x, y + 8, w, 2);
    ctx.fillRect(x, y + 22, w, 2);
    ctx.fillStyle = withAlpha(th.wood, 0.8);
    ctx.fillRect(x + 4, y + 1, 5, h - 2);
    ctx.fillRect(x + w - 9, y + 1, 5, h - 2);
  }

  // caixilho
  ctx.fillStyle = withAlpha(th.wallDark, 0.95);
  ctx.fillRect(x + w / 2 - 1, y, 2, h);
  ctx.fillRect(x, y + h / 2 - 1, w, 2);
  ctx.fillStyle = withAlpha(th.wallLight, 0.28);
  ctx.fillRect(x - 4, y + h + 3, w + 8, 3);
}

function drawSchoolBackdrop(ctx, theme, time, menu = false, camX = 0) {
  const th = theme || THEMES.school;
  const t = time;
  const off = camX;
  const baseY = menu ? 592 : 576;

  // céu em três camadas
  const sky = ctx.createLinearGradient(0, 0, 0, baseY + 80);
  sky.addColorStop(0, th.skyTop);
  sky.addColorStop(0.56, th.skyBottom);
  sky.addColorStop(1, th.bg);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const horizon = ctx.createLinearGradient(0, baseY - 300, 0, baseY + 20);
  horizon.addColorStop(0, withAlpha(th.cool, 0));
  horizon.addColorStop(0.72, withAlpha(th.cool, 0.10));
  horizon.addColorStop(1, withAlpha(th.warm, 0.055));
  ctx.fillStyle = horizon;
  ctx.fillRect(0, baseY - 300, VIEW_W, 320);

  // estrelas com parallax mínimo
  for (let i = 0; i < 72; i++) {
    const sx = wrapMod(i * 173 + 37 - off * 0.02, VIEW_W + 40) - 20;
    const sy = 16 + ((i * 71 + 23) % 288);
    const tw = 0.22 + 0.78 * Math.abs(Math.sin(t * 0.7 + i * 1.7));
    ctx.globalAlpha = tw * (i % 9 === 0 ? 0.9 : 0.55);
    ctx.fillStyle = i % 11 === 0 ? th.cool : th.glow;
    ctx.fillRect(sx, sy, i % 13 === 0 ? 3 : 2, i % 13 === 0 ? 3 : 2);
    if (i % 17 === 0) {
      ctx.globalAlpha *= 0.5;
      ctx.fillRect(sx - 3, sy + 1, 8, 1);
      ctx.fillRect(sx + 1, sy - 3, 1, 8);
    }
  }
  ctx.globalAlpha = 1;

  // lua fria com halo e crateras
  const moonX = 1032 - off * 0.012;
  const moonY = menu ? 116 : 106;
  const halo = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 150);
  halo.addColorStop(0, withAlpha(th.cool, 0.30));
  halo.addColorStop(0.5, withAlpha(th.cool, 0.10));
  halo.addColorStop(1, withAlpha(th.cool, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(moonX - 160, moonY - 160, 320, 320);
  ctx.fillStyle = withAlpha('#e8eeff', 0.92);
  ctx.beginPath();
  ctx.arc(moonX, moonY, 28, 0, TAU);
  ctx.fill();
  ctx.fillStyle = withAlpha('#b9c6e8', 0.55);
  ctx.beginPath();
  ctx.arc(moonX - 10, moonY - 6, 6, 0, TAU);
  ctx.arc(moonX + 9, moonY + 7, 5, 0, TAU);
  ctx.arc(moonX + 2, moonY - 13, 3, 0, TAU);
  ctx.fill();

  // nuvens escuras em parallax
  for (let i = 0; i < 7; i++) {
    const cw = 150 + (i % 3) * 90;
    const cx = wrapMod(i * 263 + t * (3 + i * 0.7) - off * 0.035, VIEW_W + 420) - 210;
    const cy = 54 + (i * 47) % 210;
    ctx.fillStyle = withAlpha(i % 2 ? th.far : th.mid, 0.42);
    ctx.fillRect(cx, cy, cw, 11);
    ctx.fillRect(cx + 24, cy - 8, cw * 0.58, 10);
    ctx.fillRect(cx + cw * 0.55, cy - 5, cw * 0.3, 9);
    ctx.fillStyle = withAlpha(th.cool, 0.05);
    ctx.fillRect(cx + 10, cy, cw * 0.7, 2);
  }

  // skyline distante
  const dOff = off * 0.07;
  for (let i = 0; i < 15; i++) {
    const bw = 76 + (i % 4) * 26;
    const bh = 66 + ((i * 53) % 7) * 19;
    const bx = wrapMod(i * 128 - dOff, VIEW_W + 260) - 130;
    const by = baseY - 26 - bh;
    ctx.fillStyle = withAlpha(th.far, 0.88);
    ctx.fillRect(bx, by, bw, bh);
    if (i % 4 === 1) {
      ctx.fillRect(bx + bw * 0.4, by - 20, 5, 20);
      ctx.fillStyle = withAlpha(th.cool, 0.55);
      ctx.fillRect(bx + bw * 0.4 - 2, by - 23, 3, 3);
    }
    for (let wy = by + 10; wy < by + bh - 8; wy += 16) {
      for (let wx = bx + 8; wx < bx + bw - 8; wx += 14) {
        if (tileNoise(i, Math.floor(wx / 14) + wy, 3) > 0.62) {
          ctx.fillStyle = withAlpha(th.warm, 0.24);
          ctx.fillRect(wx, wy, 3, 4);
        }
      }
    }
  }
  // torre d'água distante
  const wtX = wrapMod(560 - dOff * 1.4, VIEW_W + 300) - 150;
  ctx.fillStyle = withAlpha(th.far, 0.95);
  ctx.fillRect(wtX - 3, baseY - 180, 6, 120);
  ctx.fillRect(wtX - 24, baseY - 180, 3, 26);
  ctx.fillRect(wtX + 21, baseY - 180, 3, 26);
  ctx.fillRect(wtX - 28, baseY - 188, 56, 14);
  ctx.fillRect(wtX - 22, baseY - 205, 44, 20);
  ctx.beginPath();
  ctx.moveTo(wtX - 26, baseY - 205);
  ctx.lineTo(wtX, baseY - 220);
  ctx.lineTo(wtX + 26, baseY - 205);
  ctx.closePath();
  ctx.fill();

  // ---------- prédio principal: fachada contínua em segmentos ----------
  const pOff = off * 0.22;
  const seg = 1600;
  const topY = baseY - 262;
  const facadeH = 226;
  const segStart = -(wrapMod(pOff, seg) + seg);

  for (let s = segStart; s < VIEW_W + seg; s += seg) {
    const k = Math.round((s + pOff) / seg);

    // corpo de concreto
    ctx.fillStyle = withAlpha(th.mid, 0.98);
    ctx.fillRect(s - 20, topY, seg + 40, facadeH);
    ctx.fillStyle = withAlpha(th.wall, 0.45);
    ctx.fillRect(s - 20, topY + 26, seg + 40, facadeH - 26);

    // pilastras e faixas de andar
    ctx.fillStyle = withAlpha(th.wallDark, 0.42);
    for (let px = 0; px < seg; px += 336) {
      ctx.fillRect(s + px, topY, 4, facadeH);
      ctx.fillStyle = withAlpha(th.wallLight, 0.10);
      ctx.fillRect(s + px + 4, topY, 2, facadeH);
      ctx.fillStyle = withAlpha(th.wallDark, 0.42);
    }
    ctx.fillStyle = withAlpha(th.far, 0.55);
    for (let row = 0; row < 3; row++) {
      ctx.fillRect(s - 20, topY + 30 + row * 60 + 40, seg + 40, 3);
    }

    // janelas: estados determinísticos por coluna/andar
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 19; col++) {
        const wx = s + 18 + col * 84;
        const wy = topY + 32 + row * 60;
        const n = tileNoise(k * 31 + col, row, 11);
        drawFacadeWindow(ctx, wx, wy, 46, 36, n, th, t, k * 19 + col + row * 97);
        if (n > 0.55 && n < 0.68 && row < 2) {
          // ar-condicionado com mancha de infiltração
          ctx.fillStyle = withAlpha(th.metal, 0.5);
          ctx.fillRect(wx + 8, wy + 40, 28, 13);
          ctx.fillStyle = withAlpha(th.wallDark, 0.55);
          ctx.fillRect(wx + 12, wy + 43, 8, 7);
          ctx.fillRect(wx + 25, wy + 43, 5, 7);
          ctx.fillStyle = withAlpha(th.shadow, 0.16);
          ctx.fillRect(wx + 12, wy + 53, 2, 18);
        }
      }
    }

    // calhas e manchas
    for (const dx of [104, 944, 1460]) {
      const px = s + dx;
      ctx.fillStyle = withAlpha(th.metal, 0.42);
      ctx.fillRect(px, topY + 8, 5, facadeH - 8);
      ctx.fillStyle = withAlpha(th.wallLight, 0.18);
      ctx.fillRect(px + 1, topY + 8, 1, facadeH - 8);
      for (let by = topY + 28; by < baseY - 54; by += 52) {
        ctx.fillStyle = withAlpha(th.wallDark, 0.6);
        ctx.fillRect(px - 1, by, 7, 3);
      }
      ctx.fillStyle = withAlpha(th.shadow, 0.16);
      ctx.fillRect(px + 5, topY + 30, 7, facadeH - 30);
    }

    // entrada com transom iluminado
    const ex = s + 690;
    ctx.fillStyle = withAlpha(th.wallDark, 0.95);
    ctx.fillRect(ex, topY + 166, 120, 60);
    ctx.fillStyle = withAlpha(th.warm, 0.30);
    ctx.fillRect(ex + 10, topY + 170, 100, 14);
    ctx.fillStyle = withAlpha(th.metal, 0.55);
    ctx.fillRect(ex + 58, topY + 166, 4, 60);
    ctx.fillStyle = withAlpha(th.warm, 0.10);
    ctx.fillRect(ex - 8, topY + 180, 136, 40);
    drawText(ctx, 'CEPK', ex + 60, topY + 178, {
      size: 11, align: 'center', color: withAlpha(th.warm, 0.85)
    });

    // parapeito
    ctx.fillStyle = withAlpha(th.near, 0.98);
    ctx.fillRect(s - 28, topY - 15, seg + 56, 19);
    ctx.fillStyle = withAlpha(th.wallLight, 0.28);
    ctx.fillRect(s - 28, topY - 15, seg + 56, 3);
    ctx.fillStyle = withAlpha(th.shadow, 0.35);
    ctx.fillRect(s - 28, topY + 3, seg + 56, 4);

    // caixas de ar no telhado
    for (const [dx, dw] of [[420, 74], [1270, 58]]) {
      const ax = s + dx;
      ctx.fillStyle = withAlpha(th.metal, 0.65);
      ctx.fillRect(ax, topY - 46, dw, 31);
      ctx.fillStyle = withAlpha(th.wallDark, 0.8);
      ctx.fillRect(ax + 8, topY - 40, dw - 16, 18);
      ctx.strokeStyle = withAlpha(th.wallLight, 0.28);
      ctx.lineWidth = 1;
      ctx.strokeRect(ax + 8, topY - 40, dw - 16, 18);
      ctx.fillStyle = withAlpha(th.shadow, 0.3);
      ctx.fillRect(ax + 4, topY - 15, dw - 8, 3);
    }

    // caixa d'água
    const twx = s + 206;
    ctx.fillStyle = withAlpha(th.metal, 0.55);
    ctx.fillRect(twx - 32, topY - 96, 64, 50);
    ctx.fillRect(twx - 28, topY - 104, 56, 10);
    ctx.fillStyle = withAlpha(th.wallLight, 0.22);
    ctx.fillRect(twx - 28, topY - 92, 4, 40);
    ctx.fillStyle = withAlpha(th.wallDark, 0.7);
    for (let lx = 0; lx < 3; lx++) {
      ctx.fillRect(twx - 24 + lx * 22, topY - 46, 4, 46);
    }
    ctx.fillStyle = withAlpha(th.shadow, 0.3);
    ctx.fillRect(twx - 36, topY - 46, 72, 3);

    // antena com luz de sinal
    const anx = s + 1180;
    ctx.fillStyle = withAlpha(th.metal, 0.7);
    ctx.fillRect(anx, topY - 120, 3, 120);
    ctx.fillRect(anx - 18, topY - 96, 39, 2);
    ctx.fillRect(anx - 12, topY - 72, 27, 2);
    const blink = 0.45 + 0.55 * Math.abs(Math.sin(t * 2.4 + k));
    ctx.fillStyle = withAlpha(th.hazard, 0.8 * blink);
    ctx.fillRect(anx - 1, topY - 124, 5, 5);
    ctx.fillStyle = withAlpha(th.hazard, 0.18 * blink);
    ctx.fillRect(anx - 7, topY - 130, 17, 17);

    // relógio no parapeito
    const clx = s + 1010;
    ctx.fillStyle = withAlpha(th.wallDark, 0.9);
    ctx.fillRect(clx - 20, topY - 48, 40, 40);
    ctx.fillStyle = withAlpha('#d9dfd2', 0.8);
    ctx.beginPath();
    ctx.arc(clx, topY - 28, 15, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = withAlpha(th.wallDark, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(clx, topY - 28);
    ctx.lineTo(clx, topY - 38);
    ctx.moveTo(clx, topY - 28);
    ctx.lineTo(clx + 7, topY - 24);
    ctx.stroke();
  }

  // árvores silhueta atrás da cerca
  for (let i = 0; i < 5; i++) {
    const tx = wrapMod(i * 372 + 96 - off * 0.34, VIEW_W + 460) - 230;
    const th2 = 84 + (i % 3) * 20;
    ctx.fillStyle = withAlpha(th.wood, 0.45);
    ctx.fillRect(tx - 6, baseY - th2, 12, th2);
    ctx.fillStyle = withAlpha(th.near, 0.88);
    for (let j = 0; j < 5; j++) {
      const sway = Math.sin(t * 0.45 + i * 2 + j) * 5;
      ctx.fillRect(tx - 54 + j * 9 + sway, baseY - th2 - 52 - j * 13, 66 - j * 8, 24);
    }
    ctx.fillStyle = withAlpha(th.wallLight, 0.10);
    ctx.fillRect(tx - 40, baseY - th2 - 56, 30, 4);
  }

  // cerca metálica com pilares de alvenaria
  const fTop = baseY - 54;
  const fOff = off * 0.35;
  ctx.fillStyle = withAlpha(th.metal, 0.42);
  ctx.fillRect(0, fTop + 8, VIEW_W, 3);
  ctx.fillRect(0, fTop + 38, VIEW_W, 4);
  for (let x = -wrapMod(fOff, 14); x < VIEW_W; x += 14) {
    ctx.fillStyle = withAlpha(th.metal, 0.38);
    ctx.fillRect(x, fTop + 2, 2, 50);
  }
  for (let x = -wrapMod(fOff, 224); x < VIEW_W; x += 224) {
    ctx.fillStyle = withAlpha(th.wallDark, 0.96);
    ctx.fillRect(x - 5, fTop - 10, 12, 64);
    ctx.fillStyle = withAlpha(th.wallLight, 0.24);
    ctx.fillRect(x - 5, fTop - 10, 2, 64);
    ctx.fillStyle = withAlpha(th.near, 0.9);
    ctx.fillRect(x - 7, fTop - 13, 16, 4);
  }

  // calçada do pátio (fica atrás dos tiles no gameplay)
  ctx.fillStyle = th.bg;
  ctx.fillRect(0, baseY, VIEW_W, VIEW_H - baseY);
  const walk = ctx.createLinearGradient(0, baseY, 0, VIEW_H);
  walk.addColorStop(0, withAlpha(th.floor, 0.62));
  walk.addColorStop(0.45, withAlpha(th.floor, 0.35));
  walk.addColorStop(1, withAlpha(th.shadow, 0.55));
  ctx.fillStyle = walk;
  ctx.fillRect(0, baseY, VIEW_W, VIEW_H - baseY);

  // lajes contínuas da calçada
  for (let row = 0; row < 4; row++) {
    const y = baseY + row * 40;
    for (let col = -1; col < 14; col++) {
      const x = col * 96 + (row % 2) * 48 - (off * 0.22 % 96);
      const tone = tileNoise(col + row * 13, row, 5);
      ctx.fillStyle = withAlpha(tone > 0.5 ? th.floorLight : th.tileDark, 0.05 + tone * 0.04);
      ctx.fillRect(x + 1, y + 1, 94, 38);
      ctx.fillStyle = withAlpha(th.floorJoint, 0.55);
      ctx.fillRect(x, y, 1, 40);
    }
    ctx.fillStyle = withAlpha(th.floorJoint, 0.45);
    ctx.fillRect(0, y, VIEW_W, 1);
  }
  ctx.fillStyle = withAlpha(th.floorLight, 0.22);
  ctx.fillRect(0, baseY, VIEW_W, 2);

  // poças refletindo as janelas
  for (let i = 0; i < 6; i++) {
    const px = wrapMod(i * 247 + 90 - off * 0.22, VIEW_W + 120) - 60;
    const py = baseY + 20 + (i % 3) * 34;
    ctx.fillStyle = withAlpha(th.cool, 0.13);
    ctx.beginPath();
    ctx.ellipse(px, py, 34 + (i % 3) * 12, 5 + (i % 2) * 2, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = withAlpha(th.warm, 0.16);
    ctx.fillRect(px - 18, py - 1, 14 + (i % 3) * 5, 2);
    ctx.fillStyle = withAlpha(th.cool, 0.24);
    ctx.fillRect(px + 6, py - 3, 10, 1);
  }
  // ralos
  for (let i = 0; i < 3; i++) {
    const px = wrapMod(i * 430 + 260 - off * 0.22, VIEW_W + 100) - 50;
    const py = baseY + 16;
    ctx.fillStyle = withAlpha(th.metal, 0.45);
    ctx.fillRect(px, py, 22, 9);
    ctx.fillStyle = withAlpha(th.shadow, 0.7);
    for (let b = 0; b < 4; b++) ctx.fillRect(px + 3 + b * 5, py + 2, 2, 5);
  }

  // postes de luz com cone quente
  for (let i = 0; i < 4; i++) {
    const lx = wrapMod(i * 388 + 120 - off * 0.30, VIEW_W + 300) - 150;
    ctx.fillStyle = withAlpha(th.metal, 0.62);
    ctx.fillRect(lx - 2, baseY - 132, 5, 132);
    ctx.fillRect(lx - 24, baseY - 132, 26, 4);
    ctx.fillStyle = withAlpha(th.wallDark, 0.8);
    ctx.fillRect(lx - 30, baseY - 142, 18, 11);
    const flicker = 0.86 + 0.14 * Math.sin(t * 6.3 + i * 4);
    ctx.fillStyle = withAlpha(th.warm, 0.9 * flicker);
    ctx.fillRect(lx - 27, baseY - 139, 12, 4);
    const lg = ctx.createRadialGradient(lx - 21, baseY - 138, 4, lx - 21, baseY - 138, 76);
    lg.addColorStop(0, withAlpha(th.warm, 0.22 * flicker));
    lg.addColorStop(1, withAlpha(th.warm, 0));
    ctx.fillStyle = lg;
    ctx.fillRect(lx - 100, baseY - 218, 160, 160);
    const cone = ctx.createLinearGradient(lx - 21, baseY - 138, lx - 21, baseY);
    cone.addColorStop(0, withAlpha(th.warm, 0.10 * flicker));
    cone.addColorStop(1, withAlpha(th.warm, 0));
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(lx - 27, baseY - 138);
    ctx.lineTo(lx - 15, baseY - 138);
    ctx.lineTo(lx + 44, baseY);
    ctx.lineTo(lx - 86, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = withAlpha(th.warm, 0.10 * flicker);
    ctx.beginPath();
    ctx.ellipse(lx - 21, baseY + 4, 70, 8, 0, 0, TAU);
    ctx.fill();
  }

  // folhas secas e poeira
  for (let i = 0; i < 24; i++) {
    const lx = wrapMod(i * 191 + t * (14 + (i % 5) * 6) - off * 0.12, VIEW_W + 80) - 40;
    const ly = 120 + ((i * 83 + Math.sin(t * 0.8 + i) * 50) % 460);
    drawLeaf(ctx, lx, ly, 4 + (i % 3) * 2, t * (0.4 + i * 0.03) + i, i % 3 === 0 ? th.wood : th.warm, 0.10 + (i % 4) * 0.04);
  }
  for (let i = 0; i < 26; i++) {
    const px = wrapMod(i * 149 + t * (5 + i % 4) - off * 0.08, VIEW_W + 30) - 15;
    const py = 130 + ((i * 71 + Math.sin(t * 0.35 + i) * 24) % 400);
    ctx.fillStyle = withAlpha(th.cool, 0.06 + (i % 4) * 0.015);
    ctx.fillRect(px, py, 2, 2);
  }

  // névoa e vinheta
  const fog = ctx.createLinearGradient(0, baseY - 90, 0, baseY + 60);
  fog.addColorStop(0, withAlpha(th.cool, 0));
  fog.addColorStop(1, withAlpha(th.cool, 0.055));
  ctx.fillStyle = fog;
  ctx.fillRect(0, baseY - 90, VIEW_W, 150);

  if (menu) {
    const vg = ctx.createRadialGradient(VIEW_W / 2, 330, 180, VIEW_W / 2, 330, 760);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.58)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}

Game.prototype.drawMenuBackground = function (ctx, theme) {
  drawSchoolBackdrop(ctx, theme || THEMES.school, this.menuTime, true, this.menuTime * 9);
  drawScanlines(ctx, 0.08);
};

/* ------------------------------ FUNDOS INTERNOS ------------------------------ */

function drawHallBackdrop(ctx, th, t, camX) {
  const baseY = 576;
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, th.skyTop);
  g.addColorStop(0.55, th.skyBottom);
  g.addColorStop(1, th.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // teto técnico
  ctx.fillStyle = withAlpha(th.wallDark, 0.96);
  ctx.fillRect(0, 0, VIEW_W, 78);
  ctx.fillStyle = withAlpha(th.wall, 0.9);
  ctx.fillRect(0, 62, VIEW_W, 16);
  ctx.fillStyle = withAlpha(th.metal, 0.35);
  for (let x = 0; x < VIEW_W; x += 96) ctx.fillRect(x, 0, 3, 62);
  ctx.fillStyle = withAlpha(th.metal, 0.45);
  ctx.fillRect(0, 30, VIEW_W, 6);
  ctx.fillRect(0, 40, VIEW_W, 3);
  ctx.fillStyle = withAlpha(th.wallLight, 0.15);
  ctx.fillRect(0, 30, VIEW_W, 1);

  // parede
  ctx.fillStyle = withAlpha(th.wall, 0.94);
  ctx.fillRect(0, 78, VIEW_W, baseY - 78);
  const wOff = camX * 0.12;
  for (let x = -wrapMod(wOff, 148); x < VIEW_W + 148; x += 148) {
    ctx.fillStyle = withAlpha(th.wallDark, 0.22);
    ctx.fillRect(x, 80, 2, 300);
    ctx.fillStyle = withAlpha(th.wallLight, 0.08);
    ctx.fillRect(x + 2, 80, 2, 300);
  }
  ctx.fillStyle = withAlpha(th.wallLight, 0.16);
  ctx.fillRect(0, 92, VIEW_W, 3);
  ctx.fillStyle = withAlpha(th.wallDark, 0.85);
  ctx.fillRect(0, 348, VIEW_W, baseY - 348);
  ctx.fillStyle = withAlpha(th.wallLight, 0.2);
  ctx.fillRect(0, 348, VIEW_W, 3);

  // rodapé
  ctx.fillStyle = withAlpha(th.wallDark, 0.95);
  ctx.fillRect(0, baseY - 18, VIEW_W, 18);
  ctx.fillStyle = withAlpha(th.glow, 0.05);
  ctx.fillRect(0, baseY - 18, VIEW_W, 2);

  // portas de sala
  const dOff = camX * 0.2;
  for (let x = -wrapMod(dOff, 560); x < VIEW_W + 560; x += 560) {
    const dx = x + 250;
    ctx.fillStyle = withAlpha(th.wallDark, 0.9);
    ctx.fillRect(dx - 8, 218, 104, 330);
    ctx.fillStyle = withAlpha(th.wood, 0.62);
    ctx.fillRect(dx, 226, 88, 322);
    ctx.fillStyle = withAlpha(th.wallDark, 0.55);
    ctx.fillRect(dx + 8, 238, 72, 92);
    ctx.fillStyle = withAlpha(th.cool, 0.08);
    ctx.fillRect(dx + 12, 242, 64, 84);
    ctx.fillStyle = withAlpha(th.metal, 0.7);
    ctx.fillRect(dx + 74, 390, 7, 4);
    drawText(ctx, String(101 + Math.floor((x + 10000) / 560) % 8), dx + 44, 352, {
      size: 10, align: 'center', color: withAlpha(th.wallLight, 0.55)
    });
  }

  // quadro de avisos
  for (let x = -wrapMod(camX * 0.24, 820); x < VIEW_W + 820; x += 820) {
    const bx = x + 130;
    ctx.fillStyle = withAlpha(th.wood, 0.6);
    ctx.fillRect(bx, 238, 230, 120);
    ctx.fillStyle = 'rgba(107,90,62,0.55)';
    ctx.fillRect(bx + 6, 244, 218, 108);
    const papers = [
      [14, 12, 34, 28], [54, 8, 40, 32], [102, 16, 30, 26], [142, 10, 52, 34],
      [22, 54, 44, 30], [76, 50, 34, 40], [120, 56, 56, 28], [184, 14, 22, 30]
    ];
    papers.forEach((p, i) => {
      const px = bx + p[0], py = 244 + p[1];
      ctx.fillStyle = withAlpha(i % 3 === 0 ? th.wallLight : '#d8d2bd', 0.55);
      ctx.fillRect(px, py, p[2], p[3]);
      ctx.fillStyle = withAlpha(th.shadow, 0.25);
      ctx.fillRect(px + 4, py + 6, p[2] - 8, 1);
      ctx.fillRect(px + 4, py + 10, p[2] - 12, 1);
      ctx.fillStyle = withAlpha(th.hazard, 0.6);
      ctx.fillRect(px + p[2] / 2 - 2, py - 2, 4, 4);
    });
    ctx.fillStyle = withAlpha(th.wallLight, 0.15);
    ctx.fillRect(bx, 238, 230, 3);
  }

  // armários metálicos
  const lOff = camX * 0.34;
  for (let x = -wrapMod(lOff, 68); x < VIEW_W + 68; x += 68) {
    const ly = 300;
    const lh = baseY - 18 - ly;
    const tone = tileNoise(Math.floor((x + lOff) / 68), 2, 4);
    ctx.fillStyle = withAlpha(tone > 0.5 ? th.near : th.mid, 0.96);
    ctx.fillRect(x, ly, 62, lh);
    ctx.strokeStyle = withAlpha(th.wallDark, 0.85);
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, ly + 1, 60, lh - 2);
    ctx.fillStyle = withAlpha(th.wallLight, 0.22);
    ctx.fillRect(x + 5, ly + 4, 52, 2);
    ctx.fillStyle = withAlpha(th.wallDark, 0.5);
    for (let v = 0; v < 4; v++) ctx.fillRect(x + 16, ly + 16 + v * 5, 30, 2);
    ctx.fillStyle = withAlpha(th.metal, 0.8);
    ctx.fillRect(x + 48, ly + 96, 5, 18);
    ctx.fillStyle = withAlpha(th.shadow, 0.5);
    ctx.fillRect(x + 52, ly + 98, 1, 14);
    drawText(ctx, String((Math.floor((x + lOff) / 68) + 47) % 90 + 10), x + 31, ly + 70, {
      size: 9, align: 'center', color: withAlpha(th.wallLight, 0.45)
    });
    if (tone > 0.8) {
      ctx.fillStyle = withAlpha(th.shadow, 0.18);
      ctx.fillRect(x + 8, ly + 150, 18, 5);
      ctx.fillStyle = withAlpha(th.hazard, 0.35);
      ctx.fillRect(x + 34, ly + 132, 12, 3);
    }
  }

  // luminárias fluorescentes
  for (let i = 0; i < 5; i++) {
    const lx = 90 + i * 290;
    const flicker = 0.82 + 0.18 * Math.sin(t * 7 + i * 3);
    ctx.fillStyle = withAlpha(th.wallDark, 0.9);
    ctx.fillRect(lx, 52, 154, 8);
    ctx.fillStyle = withAlpha(th.glow, 0.85 * flicker);
    ctx.fillRect(lx + 4, 54, 146, 4);
    const lg = ctx.createLinearGradient(lx + 77, 58, lx + 77, 330);
    lg.addColorStop(0, withAlpha(th.glow, 0.12 * flicker));
    lg.addColorStop(1, withAlpha(th.glow, 0));
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(lx + 18, 58);
    ctx.lineTo(lx + 136, 58);
    ctx.lineTo(lx + 210, 330);
    ctx.lineTo(lx - 56, 330);
    ctx.closePath();
    ctx.fill();
  }

  // câmera de segurança
  const cx = VIEW_W - 150;
  ctx.fillStyle = withAlpha(th.wallDark, 0.95);
  ctx.fillRect(cx, 118, 58, 30);
  ctx.fillRect(cx + 12, 108, 10, 12);
  ctx.fillStyle = withAlpha(th.metal, 0.55);
  ctx.fillRect(cx + 8, 122, 34, 20);
  ctx.fillStyle = 'rgba(255,51,85,' + (0.5 + 0.5 * Math.sin(t * 4)) + ')';
  ctx.fillRect(cx + 46, 124, 4, 4);

  // planta
  const px = 640 - camX * 0.1;
  ctx.fillStyle = withAlpha(th.wood, 0.7);
  ctx.fillRect(px, 508, 30, 26);
  ctx.fillStyle = 'rgba(74,107,82,0.55)';
  ctx.fillRect(px + 8, 480, 4, 30);
  ctx.fillRect(px + 1, 470, 14, 14);
  ctx.fillRect(px + 16, 462, 12, 18);
  ctx.fillRect(px + 24, 478, 10, 12);

  // poeira
  for (let i = 0; i < 18; i++) {
    const dx = wrapMod(i * 173 + t * (6 + i % 4), VIEW_W + 20) - 10;
    const dy = 110 + ((i * 97 + Math.sin(t * 0.5 + i) * 30) % 430);
    ctx.fillStyle = withAlpha(th.glow, 0.045 + (i % 3) * 0.02);
    ctx.fillRect(dx, dy, 2, 2);
  }

  const floorGlow = ctx.createLinearGradient(0, baseY - 40, 0, baseY);
  floorGlow.addColorStop(0, withAlpha(th.glow, 0.05));
  floorGlow.addColorStop(1, withAlpha(th.glow, 0));
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, baseY - 40, VIEW_W, 40);
}

function drawLabBackdrop(ctx, th, t, camX) {
  const baseY = 576;
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, th.skyTop);
  g.addColorStop(0.58, th.skyBottom);
  g.addColorStop(1, th.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // teto com eletrocalha
  ctx.fillStyle = withAlpha(th.wallDark, 0.96);
  ctx.fillRect(0, 0, VIEW_W, 76);
  ctx.fillStyle = withAlpha(th.metal, 0.4);
  ctx.fillRect(0, 36, VIEW_W, 8);
  for (let x = 20; x < VIEW_W; x += 48) {
    ctx.fillStyle = withAlpha(th.metal, 0.28);
    ctx.fillRect(x, 20, 2, 18);
  }
  ctx.fillStyle = withAlpha(th.cool, 0.18);
  ctx.fillRect(0, 46, VIEW_W, 2);

  // parede de aço
  ctx.fillStyle = withAlpha(th.wall, 0.95);
  ctx.fillRect(0, 76, VIEW_W, baseY - 76);
  const off = camX * 0.14;
  for (let x = -wrapMod(off, 128); x < VIEW_W + 128; x += 128) {
    ctx.fillStyle = withAlpha(th.wallDark, 0.35);
    ctx.fillRect(x, 76, 2, baseY - 76);
    ctx.fillStyle = withAlpha(th.wallLight, 0.12);
    ctx.fillRect(x + 2, 76, 2, baseY - 76);
    for (let y = 96; y < baseY; y += 96) {
      ctx.fillStyle = withAlpha(th.metal, 0.35);
      ctx.fillRect(x + 8, y, 3, 3);
      ctx.fillRect(x + 116, y + 44, 3, 3);
    }
  }
  for (let y = 96; y < baseY; y += 96) {
    ctx.fillStyle = withAlpha(th.wallDark, 0.28);
    ctx.fillRect(0, y, VIEW_W, 2);
    ctx.fillStyle = withAlpha(th.wallLight, 0.07);
    ctx.fillRect(0, y + 2, VIEW_W, 2);
  }

  // janelas de observação com tanques de líquido azul
  const tOff = camX * 0.26;
  for (let x = -wrapMod(tOff, 360); x < VIEW_W + 360; x += 360) {
    const wx = x + 70;
    const wy = 146;
    const ww = 250;
    const wh = 320;
    ctx.fillStyle = withAlpha(th.wallDark, 0.9);
    ctx.fillRect(wx - 10, wy - 10, ww + 20, wh + 20);
    ctx.fillStyle = withAlpha(th.cool, 0.09);
    ctx.fillRect(wx, wy, ww, wh);
    // líquido
    const level = 0.56 + Math.sin(t * 0.6 + x * 0.01) * 0.03;
    const ly = wy + wh * (1 - level);
    ctx.fillStyle = withAlpha(th.cool, 0.20);
    ctx.fillRect(wx + 4, ly, ww - 8, wh - (ly - wy) - 4);
    ctx.fillStyle = withAlpha(th.cool, 0.34);
    ctx.fillRect(wx + 4, ly, ww - 8, 3);
    for (let b = 0; b < 7; b++) {
      const bx = wx + 20 + ((b * 37 + x) % (ww - 40));
      const by = wy + wh - 12 - ((t * (14 + b * 4) + b * 43) % (wh * level - 24));
      ctx.fillStyle = withAlpha(th.glow, 0.24);
      ctx.fillRect(bx, by, 3 + (b % 2), 3 + (b % 2));
    }
    // vidro e moldura
    ctx.strokeStyle = withAlpha(th.metal, 0.65);
    ctx.lineWidth = 4;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.strokeStyle = withAlpha(th.glow, 0.2);
    ctx.lineWidth = 1;
    ctx.strokeRect(wx + 5, wy + 5, ww - 10, wh - 10);
    ctx.fillStyle = withAlpha(th.glow, 0.35);
    ctx.fillRect(wx + 9, wy + 12, 3, wh - 24);
    // etiqueta de risco
    ctx.fillStyle = withAlpha(th.warm, 0.55);
    ctx.fillRect(wx + ww - 54, wy + 16, 38, 16);
    ctx.fillStyle = withAlpha(th.shadow, 0.8);
    ctx.fillRect(wx + ww - 48, wy + 21, 26, 2);
    ctx.fillRect(wx + ww - 48, wy + 26, 18, 2);
    // suportes
    ctx.fillStyle = withAlpha(th.metal, 0.5);
    ctx.fillRect(wx - 16, wy + 40, 16, 6);
    ctx.fillRect(wx - 16, wy + wh - 46, 16, 6);
  }

  // racks de servidores em primeiro plano
  const rOff = camX * 0.4;
  for (let x = -wrapMod(rOff, 228); x < VIEW_W + 228; x += 228) {
    const rx = x + 40;
    const ry = 348;
    ctx.fillStyle = withAlpha(th.wallDark, 0.95);
    ctx.fillRect(rx, ry, 150, 210);
    ctx.fillStyle = withAlpha(th.metal, 0.35);
    ctx.fillRect(rx + 4, ry + 4, 142, 202);
    for (let s = 0; s < 8; s++) {
      const sy = ry + 12 + s * 24;
      ctx.fillStyle = 'rgba(5,12,20,0.9)';
      ctx.fillRect(rx + 10, sy, 130, 18);
      ctx.fillStyle = withAlpha(th.wallLight, 0.12);
      ctx.fillRect(rx + 14, sy + 3, 60, 2);
      const blink = Math.sin(t * 3 + s * 1.7 + x) > 0;
      ctx.fillStyle = withAlpha(blink ? th.accent : th.cool, blink ? 0.7 : 0.2);
      ctx.fillRect(rx + 122, sy + 6, 4, 4);
      ctx.fillStyle = withAlpha(th.warm, 0.35);
      ctx.fillRect(rx + 112, sy + 6, 3, 4);
    }
    ctx.fillStyle = withAlpha(th.hazard, 0.45);
    ctx.fillRect(rx + 10, ry + 204, 130, 3);
  }

  // faixa de perigo no rodapé
  ctx.fillStyle = withAlpha(th.wallDark, 0.95);
  ctx.fillRect(0, baseY - 26, VIEW_W, 26);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, baseY - 22, VIEW_W, 12);
  ctx.clip();
  for (let x = -40; x < VIEW_W + 40; x += 36) {
    ctx.fillStyle = withAlpha(th.warm, 0.30);
    ctx.beginPath();
    ctx.moveTo(x, baseY - 10);
    ctx.lineTo(x + 16, baseY - 22);
    ctx.lineTo(x + 30, baseY - 22);
    ctx.lineTo(x + 14, baseY - 10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // luminárias frias
  for (let i = 0; i < 4; i++) {
    const lx = 130 + i * 330;
    const flicker = 0.86 + 0.14 * Math.sin(t * 6 + i);
    ctx.fillStyle = withAlpha(th.glow, 0.75 * flicker);
    ctx.fillRect(lx, 58, 120, 5);
    const lg = ctx.createLinearGradient(lx + 60, 62, lx + 60, 320);
    lg.addColorStop(0, withAlpha(th.glow, 0.11 * flicker));
    lg.addColorStop(1, withAlpha(th.glow, 0));
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(lx + 12, 62);
    ctx.lineTo(lx + 108, 62);
    ctx.lineTo(lx + 170, 320);
    ctx.lineTo(lx - 50, 320);
    ctx.closePath();
    ctx.fill();
  }

  // vapor
  for (let i = 0; i < 12; i++) {
    const sx = wrapMod(i * 197 + t * (10 + i % 5), VIEW_W + 60) - 30;
    const sy = 420 - ((t * 24 + i * 53) % 240);
    ctx.fillStyle = withAlpha(th.cool, 0.05 + (i % 3) * 0.02);
    ctx.beginPath();
    ctx.ellipse(sx, sy, 16 + (i % 4) * 8, 5 + (i % 3) * 3, 0, 0, TAU);
    ctx.fill();
  }

  // luz de emergência quente
  const ex = VIEW_W - 120;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
  ctx.fillStyle = withAlpha(th.hazard, 0.35 + pulse * 0.4);
  ctx.fillRect(ex, 112, 10, 6);
  ctx.fillStyle = withAlpha(th.hazard, 0.06 + pulse * 0.06);
  ctx.fillRect(ex - 30, 112, 70, 70);
}

function drawOfficeBackdrop(ctx, th, t, camX) {
  const baseY = 576;
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, th.skyTop);
  g.addColorStop(0.6, th.skyBottom);
  g.addColorStop(1, th.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // parede de vinho com rodapé de madeira
  ctx.fillStyle = withAlpha(th.wall, 0.95);
  ctx.fillRect(0, 0, VIEW_W, baseY);
  const wOff = camX * 0.1;
  for (let x = -wrapMod(wOff, 180); x < VIEW_W + 180; x += 180) {
    ctx.fillStyle = withAlpha(th.wallLight, 0.07);
    ctx.fillRect(x, 0, 2, 360);
    ctx.fillStyle = withAlpha(th.wallDark, 0.25);
    ctx.fillRect(x + 2, 0, 2, 360);
  }
  ctx.fillStyle = withAlpha(th.wallDark, 0.9);
  ctx.fillRect(0, 360, VIEW_W, baseY - 360);
  ctx.fillStyle = withAlpha(th.wood, 0.55);
  ctx.fillRect(0, 372, VIEW_W, baseY - 372);
  ctx.fillStyle = withAlpha(th.gold, 0.24);
  ctx.fillRect(0, 368, VIEW_W, 3);
  for (let x = -wrapMod(wOff, 120); x < VIEW_W + 120; x += 120) {
    ctx.fillStyle = withAlpha(th.wallDark, 0.35);
    ctx.fillRect(x, 372, 2, baseY - 372);
  }
  // rodapé
  ctx.fillStyle = withAlpha(th.wallDark, 0.95);
  ctx.fillRect(0, baseY - 16, VIEW_W, 16);
  ctx.fillStyle = withAlpha(th.gold, 0.2);
  ctx.fillRect(0, baseY - 16, VIEW_W, 2);

  // janelas grandes com chuva
  const winOff = camX * 0.16;
  for (let x = -wrapMod(winOff, 880); x < VIEW_W + 880; x += 880) {
    const wx = x + 120;
    const wy = 74;
    const ww = 390;
    const wh = 280;
    ctx.fillStyle = withAlpha(th.wallDark, 0.95);
    ctx.fillRect(wx - 14, wy - 14, ww + 28, wh + 28);
    ctx.fillStyle = 'rgba(8,14,30,0.95)';
    ctx.fillRect(wx, wy, ww, wh);
    // céu e cidade
    const skyg = ctx.createLinearGradient(0, wy, 0, wy + wh);
    skyg.addColorStop(0, withAlpha(th.skyTop, 0.95));
    skyg.addColorStop(1, withAlpha(th.near, 0.5));
    ctx.fillStyle = skyg;
    ctx.fillRect(wx, wy, ww, wh);
    // lua fria
    ctx.fillStyle = withAlpha(th.cool, 0.7);
    ctx.beginPath();
    ctx.arc(wx + ww - 82, wy + 62, 24, 0, TAU);
    ctx.fill();
    ctx.fillStyle = withAlpha(th.shadow, 0.25);
    ctx.beginPath();
    ctx.arc(wx + ww - 90, wy + 56, 6, 0, TAU);
    ctx.arc(wx + ww - 74, wy + 70, 4, 0, TAU);
    ctx.fill();
    // skyline
    for (let b = 0; b < 9; b++) {
      const bw = 30 + (b % 3) * 12;
      const bh = 40 + (b * 17) % 70;
      const bx = wx + 10 + b * 44;
      const by = wy + wh - bh;
      ctx.fillStyle = withAlpha(th.far, 0.95);
      ctx.fillRect(bx, by, bw, bh);
      for (let wy2 = by + 8; wy2 < by + bh - 6; wy2 += 14) {
        for (let wx2 = bx + 5; wx2 < bx + bw - 5; wx2 += 10) {
          if (tileNoise(b, Math.floor(wx2 / 10) + wy2, 9) > 0.55) {
            ctx.fillStyle = withAlpha(th.warm, 0.3);
            ctx.fillRect(wx2, wy2, 2, 3);
          }
        }
      }
    }
    // chuva
    ctx.save();
    ctx.beginPath();
    ctx.rect(wx, wy, ww, wh);
    ctx.clip();
    for (let i = 0; i < 46; i++) {
      const rx = wx + ((i * 67 + t * 26) % ww);
      const ry = wy + ((i * 91 + t * 180) % wh);
      ctx.strokeStyle = 'rgba(190,220,255,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 4, ry + 13);
      ctx.stroke();
    }
    ctx.restore();
    // caixilho
    ctx.fillStyle = withAlpha(th.wood, 0.9);
    ctx.fillRect(wx + ww / 2 - 4, wy, 8, wh);
    ctx.fillRect(wx, wy + wh / 2 - 4, ww, 8);
    ctx.fillStyle = withAlpha(th.wallLight, 0.18);
    ctx.fillRect(wx - 8, wy - 8, ww + 16, 3);
    // cortinas
    ctx.fillStyle = withAlpha(th.maroon || th.wallDark, 0.55);
    ctx.fillRect(wx - 22, wy - 10, 24, wh + 20);
    ctx.fillRect(wx + ww - 2, wy - 10, 24, wh + 20);
  }

  // estantes de livros
  const bOff = camX * 0.3;
  for (let x = -wrapMod(bOff, 390); x < VIEW_W + 390; x += 390) {
    const bx = x + 700;
    const by = 170;
    const bh = 350;
    ctx.fillStyle = withAlpha(th.wood, 0.7);
    ctx.fillRect(bx, by, 300, bh);
    ctx.fillStyle = withAlpha(th.wallDark, 0.7);
    ctx.fillRect(bx + 8, by + 8, 284, bh - 16);
    const bookColors = [th.maroon || '#5a2430', th.gold, th.wallLight, th.metal, th.near];
    for (let r = 0; r < 4; r++) {
      const sy = by + 28 + r * 78;
      ctx.fillStyle = withAlpha(th.wood, 0.8);
      ctx.fillRect(bx + 10, sy + 48, 280, 6);
      for (let b = 0; b < 14; b++) {
        const bw = 8 + (b % 3) * 4;
        const bhh = 26 + (b % 4) * 6;
        ctx.fillStyle = withAlpha(bookColors[(b + r) % bookColors.length], 0.55);
        ctx.fillRect(bx + 16 + b * 19, sy + 48 - bhh, bw, bhh);
        ctx.fillStyle = withAlpha(th.wallLight, 0.14);
        ctx.fillRect(bx + 16 + b * 19, sy + 52 - bhh, bw, 2);
      }
    }
    ctx.fillStyle = withAlpha(th.gold, 0.2);
    ctx.fillRect(bx, by, 300, 3);
  }

  // mesa e abajur
  const deskOff = camX * 0.24;
  for (let x = -wrapMod(deskOff, 1180); x < VIEW_W + 1180; x += 1180) {
    const dx = x + 270;
    ctx.fillStyle = withAlpha(th.wood, 0.9);
    ctx.fillRect(dx, 452, 400, 22);
    ctx.fillRect(dx + 26, 474, 18, 86);
    ctx.fillRect(dx + 356, 474, 18, 86);
    ctx.fillStyle = withAlpha(th.gold, 0.18);
    ctx.fillRect(dx, 452, 400, 3);
    // poltrona
    ctx.fillStyle = withAlpha(th.maroon || th.wallDark, 0.85);
    ctx.fillRect(dx + 130, 390, 120, 86);
    ctx.fillRect(dx + 112, 470, 156, 18);
    ctx.fillStyle = withAlpha(th.wallDark, 0.6);
    ctx.fillRect(dx + 146, 400, 88, 6);
    // abajur
    ctx.fillStyle = withAlpha(th.metal, 0.7);
    ctx.fillRect(dx + 58, 410, 3, 42);
    ctx.fillStyle = withAlpha(th.warm, 0.8);
    ctx.beginPath();
    ctx.moveTo(dx + 40, 414);
    ctx.lineTo(dx + 82, 414);
    ctx.lineTo(dx + 74, 394);
    ctx.lineTo(dx + 48, 394);
    ctx.closePath();
    ctx.fill();
    const lg = ctx.createRadialGradient(dx + 61, 410, 6, dx + 61, 410, 90);
    lg.addColorStop(0, withAlpha(th.warm, 0.2));
    lg.addColorStop(1, withAlpha(th.warm, 0));
    ctx.fillStyle = lg;
    ctx.fillRect(dx - 40, 310, 200, 200);
    // papéis
    ctx.fillStyle = withAlpha('#d8d2bd', 0.45);
    ctx.fillRect(dx + 190, 438, 54, 14);
    ctx.fillRect(dx + 248, 434, 44, 18);
  }

  // relógio de pé
  const clx = VIEW_W - 130;
  ctx.fillStyle = withAlpha(th.wood, 0.8);
  ctx.fillRect(clx - 26, 292, 52, 268);
  ctx.fillStyle = withAlpha(th.wallDark, 0.85);
  ctx.fillRect(clx - 20, 300, 40, 250);
  ctx.fillStyle = withAlpha('#d9dfd2', 0.7);
  ctx.beginPath();
  ctx.arc(clx, 326, 16, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = withAlpha(th.wallDark, 0.8);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(clx, 326);
  ctx.lineTo(clx, 316);
  ctx.moveTo(clx, 326);
  ctx.lineTo(clx + 8, 330);
  ctx.stroke();
  ctx.fillStyle = withAlpha(th.gold, 0.3);
  ctx.fillRect(clx - 28, 288, 56, 5);

  // lustres
  for (let i = 0; i < 3; i++) {
    const lx = 210 + i * 430;
    ctx.fillStyle = withAlpha(th.metal, 0.5);
    ctx.fillRect(lx, 0, 2, 92);
    ctx.fillStyle = withAlpha(th.gold, 0.5);
    ctx.beginPath();
    ctx.moveTo(lx - 34, 92);
    ctx.lineTo(lx + 36, 92);
    ctx.lineTo(lx + 20, 112);
    ctx.lineTo(lx - 18, 112);
    ctx.closePath();
    ctx.fill();
    const lg = ctx.createRadialGradient(lx + 1, 100, 6, lx + 1, 100, 160);
    lg.addColorStop(0, withAlpha(th.warm, 0.16));
    lg.addColorStop(1, withAlpha(th.warm, 0));
    ctx.fillStyle = lg;
    ctx.fillRect(lx - 170, 60, 340, 300);
  }

  // poeira quente
  for (let i = 0; i < 18; i++) {
    const dx = wrapMod(i * 173 + t * (5 + i % 4), VIEW_W + 20) - 10;
    const dy = 100 + ((i * 97 + Math.sin(t * 0.45 + i) * 36) % 430);
    ctx.fillStyle = withAlpha(th.warm, 0.05 + (i % 3) * 0.02);
    ctx.fillRect(dx, dy, 2, 2);
  }
}

function drawGymBackdrop(ctx, th, t, camX) {
  const baseY = 576;
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, th.skyTop);
  g.addColorStop(0.6, th.skyBottom);
  g.addColorStop(1, th.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // teto e treliças
  ctx.fillStyle = withAlpha(th.wallDark, 0.98);
  ctx.fillRect(0, 0, VIEW_W, 108);
  ctx.strokeStyle = withAlpha(th.metal, 0.35);
  ctx.lineWidth = 3;
  for (let x = -60; x < VIEW_W + 60; x += 160) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 106);
    ctx.moveTo(x, 18);
    ctx.lineTo(x + 160, 88);
    ctx.moveTo(x + 160, 18);
    ctx.lineTo(x, 88);
    ctx.stroke();
  }
  ctx.fillStyle = withAlpha(th.metal, 0.3);
  ctx.fillRect(0, 104, VIEW_W, 5);

  // parede de blocos
  ctx.fillStyle = withAlpha(th.wall, 0.95);
  ctx.fillRect(0, 109, VIEW_W, baseY - 109);
  const wOff = camX * 0.14;
  for (let y = 122; y < baseY; y += 28) {
    ctx.fillStyle = withAlpha(th.wallDark, 0.16);
    ctx.fillRect(0, y, VIEW_W, 1);
    const stagger = (Math.floor(y / 28) % 2) * 32;
    for (let x = -wrapMod(wOff + stagger, 64); x < VIEW_W + 64; x += 64) {
      ctx.fillStyle = withAlpha(th.wallDark, 0.12);
      ctx.fillRect(x, y, 1, 28);
    }
  }
  // faixa vinho
  ctx.fillStyle = withAlpha(th.maroon || th.wallDark, 0.9);
  ctx.fillRect(0, 286, VIEW_W, 20);
  ctx.fillStyle = withAlpha(th.gold, 0.35);
  ctx.fillRect(0, 286, VIEW_W, 2);
  ctx.fillRect(0, 304, VIEW_W, 2);

  // arquibancadas
  for (let row = 0; row < 6; row++) {
    const y = 334 + row * 25;
    ctx.fillStyle = withAlpha(row % 2 ? th.mid : th.near, 0.85);
    ctx.fillRect(0, y, VIEW_W, 24);
    ctx.fillStyle = withAlpha(th.wallDark, 0.5);
    ctx.fillRect(0, y + 21, VIEW_W, 3);
    for (let x = 10; x < VIEW_W; x += 34) {
      const n = tileNoise(x, row, 8);
      ctx.fillStyle = withAlpha(n > 0.72 ? th.gold : (n > 0.36 ? th.maroon || th.wallDark : th.metal), 0.45);
      ctx.fillRect(x, y + 4, 20, 12);
      ctx.fillStyle = withAlpha(th.shadow, 0.25);
      ctx.fillRect(x + 2, y + 14, 16, 2);
    }
  }
  // escadas de acesso
  for (let x = 120; x < VIEW_W; x += 430) {
    ctx.fillStyle = withAlpha(th.wallDark, 0.75);
    ctx.fillRect(x, 334, 46, 150);
    for (let s = 0; s < 6; s++) {
      ctx.fillStyle = withAlpha(th.wallLight, 0.12);
      ctx.fillRect(x + 4, 344 + s * 24, 38, 2);
    }
  }
  // corrimão
  ctx.strokeStyle = withAlpha(th.metal, 0.55);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 332);
  ctx.lineTo(VIEW_W, 332);
  ctx.stroke();

  // faixas penduradas
  for (let i = 0; i < 3; i++) {
    const bx = 210 + i * 410;
    ctx.fillStyle = withAlpha(th.maroon || th.wallDark, 0.85);
    ctx.beginPath();
    ctx.moveTo(bx - 55, 112);
    ctx.lineTo(bx + 55, 112);
    ctx.lineTo(bx + 44, 196);
    ctx.lineTo(bx, 208);
    ctx.lineTo(bx - 44, 196);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = withAlpha(th.gold, 0.35);
    ctx.fillRect(bx - 48, 120, 96, 2);
    drawText(ctx, 'CEPK', bx, 154, {
      size: 17, align: 'center', color: withAlpha(th.gold, 0.6)
    });
  }

  // placar
  const sx = VIEW_W / 2 - 150;
  ctx.fillStyle = withAlpha(th.wallDark, 0.96);
  ctx.fillRect(sx - 8, 44, 316, 92);
  ctx.fillStyle = 'rgba(8,12,18,0.95)';
  ctx.fillRect(sx, 52, 300, 76);
  ctx.strokeStyle = withAlpha(th.metal, 0.4);
  ctx.lineWidth = 2;
  ctx.strokeRect(sx, 52, 300, 76);
  drawText(ctx, 'CEPK', sx + 52, 78, { size: 14, align: 'center', color: withAlpha(th.wallLight, 0.7) });
  drawText(ctx, '00:00', sx + 202, 78, { size: 24, align: 'center', color: withAlpha(th.warm, 0.9), glow: th.warm, glowSize: 8 });
  drawText(ctx, 'SISTEMA  0  ·  0  VISITANTE', sx + 150, 108, {
    size: 9, align: 'center', color: withAlpha(th.wallLight, 0.45)
  });

  // cestas
  for (const side of [-1, 1]) {
    const hx = side < 0 ? 170 : VIEW_W - 170;
    ctx.fillStyle = withAlpha(th.metal, 0.7);
    ctx.fillRect(hx - 2, 196, 4, 250);
    ctx.fillRect(hx - 70, 192, 140, 6);
    ctx.fillStyle = withAlpha(th.wallLight, 0.35);
    ctx.fillRect(hx - 62, 200, 124, 82);
    ctx.strokeStyle = withAlpha(th.wallLight, 0.5);
    ctx.lineWidth = 3;
    ctx.strokeRect(hx - 62, 200, 124, 82);
    ctx.strokeStyle = withAlpha(th.hazard, 0.9);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(hx - 26, 296);
    ctx.lineTo(hx + 26, 296);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(220,225,235,0.5)';
    ctx.lineWidth = 1;
    for (let n = 0; n < 6; n++) {
      ctx.beginPath();
      ctx.moveTo(hx - 24 + n * 8, 298);
      ctx.lineTo(hx - 12 + n * 4, 318);
      ctx.stroke();
    }
    ctx.fillStyle = withAlpha(th.hazard, 0.75);
    ctx.beginPath();
    ctx.arc(hx, 296, 13, 0, Math.PI);
    ctx.stroke();
  }

  // luminárias suspensas
  for (let i = 0; i < 4; i++) {
    const lx = 170 + i * 320;
    ctx.fillStyle = withAlpha(th.metal, 0.5);
    ctx.fillRect(lx, 108, 2, 58);
    ctx.fillStyle = withAlpha(th.wallDark, 0.95);
    ctx.fillRect(lx - 42, 164, 86, 12);
    const flicker = 0.88 + 0.12 * Math.sin(t * 5 + i);
    ctx.fillStyle = withAlpha(th.warm, 0.85 * flicker);
    ctx.fillRect(lx - 36, 168, 72, 4);
    const lg = ctx.createLinearGradient(lx, 170, lx, 420);
    lg.addColorStop(0, withAlpha(th.warm, 0.13 * flicker));
    lg.addColorStop(1, withAlpha(th.warm, 0));
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(lx - 40, 170);
    ctx.lineTo(lx + 40, 170);
    ctx.lineTo(lx + 130, 420);
    ctx.lineTo(lx - 130, 420);
    ctx.closePath();
    ctx.fill();
  }

  // piso de quadra em perspectiva
  const floor = ctx.createLinearGradient(0, 474, 0, baseY);
  floor.addColorStop(0, withAlpha(th.floor, 0.5));
  floor.addColorStop(1, withAlpha(th.floorLight, 0.4));
  ctx.fillStyle = floor;
  ctx.fillRect(0, 474, VIEW_W, baseY - 474);
  ctx.strokeStyle = withAlpha('#f0e3c4', 0.28);
  ctx.lineWidth = 2;
  for (let x = -200; x < VIEW_W + 200; x += 200) {
    ctx.beginPath();
    ctx.moveTo(x, 474);
    ctx.lineTo(x + 300, baseY);
    ctx.stroke();
  }
  for (let y = 486; y < baseY; y += 26) {
    ctx.strokeStyle = withAlpha('#f0e3c4', 0.1);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
    ctx.stroke();
  }
  // linha central e círculo
  const centerX = VIEW_W / 2 - wrapMod(camX * 0.55, 420) + 210;
  ctx.strokeStyle = withAlpha('#f0e3c4', 0.35);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(centerX, 520, 64, 14, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX, 474);
  ctx.lineTo(centerX, baseY);
  ctx.stroke();

  // placa de saída
  ctx.fillStyle = 'rgba(4,10,12,0.9)';
  ctx.fillRect(VIEW_W - 108, 118, 72, 26);
  ctx.fillStyle = withAlpha(th.accent, 0.6);
  ctx.fillRect(VIEW_W - 102, 123, 60, 16);
  drawText(ctx, 'SAÍDA', VIEW_W - 72, 132, { size: 9, align: 'center', color: '#04140c' });
}

Game.prototype.drawBackground = function (ctx, cam) {
  const th = this.level.theme;
  const kind = th.kind;
  const t = this.time;

  if (kind === 'hall') {
    drawHallBackdrop(ctx, th, t, cam.x);
  } else if (kind === 'lab') {
    drawLabBackdrop(ctx, th, t, cam.x);
  } else if (kind === 'office') {
    drawOfficeBackdrop(ctx, th, t, cam.x);
  } else if (kind === 'gym') {
    drawGymBackdrop(ctx, th, t, cam.x);
  } else {
    drawSchoolBackdrop(ctx, th, t, false, cam.x);
  }
};


/* ------------------------------ TILES ------------------------------ */

function tileNoise(x, y, seed = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

function drawSurfaceRun(ctx, cam, th, level, tx0, tx1, ty) {
  const kind = th.kind;
  const x = tx0 * TILE - cam.x;
  const y = ty * TILE - cam.y;
  const w = (tx1 - tx0 + 1) * TILE;
  const worldX0 = tx0 * TILE;
  const worldX1 = (tx1 + 1) * TILE;
  const stripH = 14;

  // superfície contínua: um único material por trecho, sem borda por tile
  ctx.fillStyle = th.floor;
  ctx.fillRect(x, y, w, stripH);
  const g = ctx.createLinearGradient(0, y, 0, y + stripH);
  g.addColorStop(0, withAlpha(th.floorLight, 0.44));
  g.addColorStop(0.5, withAlpha(th.floorLight, 0.08));
  g.addColorStop(1, 'rgba(0,0,0,0.20)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, stripH);

  // fio de luz no topo
  ctx.fillStyle = withAlpha(th.floorLight, 0.9);
  ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(x, y, w, 1);

  // juntas alinhadas ao mundo (nunca a cada tile)
  const jointStep = kind === 'gym' ? 64 : 96;
  const firstJoint = Math.ceil(worldX0 / jointStep) * jointStep;
  for (let wx = firstJoint; wx < worldX1; wx += jointStep) {
    const jx = Math.round(wx - cam.x);
    ctx.fillStyle = withAlpha(th.floorJoint, 0.9);
    ctx.fillRect(jx, y + 2, 1, stripH - 3);
    ctx.fillStyle = withAlpha(th.floorLight, 0.22);
    ctx.fillRect(jx + 1, y + 3, 1, 4);
    if (kind === 'gym') {
      ctx.fillStyle = withAlpha(th.floorLight, 0.10);
      ctx.fillRect(jx + 3, y + 5, jointStep - 5, 1);
    }
  }
  ctx.fillStyle = withAlpha(th.floorJoint, 0.55);
  ctx.fillRect(x, y + stripH - 1, w, 1);

  // profundidade abaixo da superfície
  const sh = ctx.createLinearGradient(0, y + stripH, 0, y + stripH + 18);
  sh.addColorStop(0, 'rgba(0,0,0,0.30)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(x, y + stripH, w, 18);

  if (kind === 'gym') {
    // veios de madeira e linhas de quadra
    for (let wx = worldX0 + 12; wx < worldX1 - 8; wx += 24) {
      const n = tileNoise(wx, ty, 21);
      ctx.fillStyle = withAlpha(th.floorLight, 0.10 + n * 0.12);
      ctx.fillRect(wx - cam.x, y + 4 + Math.floor(n * 3) * 2, 18 + n * 6, 1);
    }
    if (w > 6 * TILE) {
      ctx.fillStyle = 'rgba(240,227,196,0.38)';
      ctx.fillRect(x + 18, y + 6, w - 36, 2);
      ctx.fillStyle = 'rgba(240,227,196,0.12)';
      ctx.fillRect(x + 18, y + 9, w - 36, 1);
      for (let wx = worldX0 + 40; wx < worldX1 - 20; wx += 120) {
        ctx.fillStyle = 'rgba(30,18,10,0.18)';
        ctx.fillRect(wx - cam.x, y + 3, 8, 2);
        ctx.fillRect(wx - cam.x + 4, y + 7, 5, 2);
      }
    }
  } else if (kind === 'hall') {
    // terrazzo: grãos coloridos
    for (let wx = worldX0 + 2; wx < worldX1; wx += 7) {
      const n = tileNoise(wx, ty, 31);
      const ny = y + 3 + Math.floor(n * (stripH - 6));
      ctx.fillStyle = withAlpha(n > 0.55 ? th.floorLight : (n > 0.3 ? th.edge : th.floorJoint), 0.22);
      ctx.fillRect(wx - cam.x, ny, 1, 1);
    }
    for (let wx = Math.ceil(worldX0 / 220) * 220; wx < worldX1; wx += 220) {
      const n = tileNoise(wx, ty, 32);
      if (n > 0.45) {
        ctx.fillStyle = withAlpha(th.floorJoint, 0.18);
        ctx.beginPath();
        ctx.ellipse(wx - cam.x, y + 7, 10 + n * 16, 2.5, 0, 0, TAU);
        ctx.fill();
      }
    }
  } else if (kind === 'lab') {
    // placas de aço e rebites
    for (let wx = worldX0 + 4; wx < worldX1; wx += 24) {
      ctx.fillStyle = withAlpha(th.floorLight, 0.08);
      ctx.fillRect(wx - cam.x, y + 5, 18, 1);
    }
    for (let wx = firstJoint; wx < worldX1; wx += jointStep) {
      const jx = Math.round(wx - cam.x);
      ctx.fillStyle = withAlpha(th.metal, 0.55);
      ctx.fillRect(jx + 4, y + 3, 2, 2);
      ctx.fillRect(jx + 4, y + stripH - 5, 2, 2);
    }
    if (w <= 4 * TILE) {
      for (const edge of [x, x + w - 14]) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(edge, y + 2, 14, 7);
        ctx.clip();
        for (let s = -8; s < 18; s += 7) {
          ctx.fillStyle = withAlpha(th.warm, 0.45);
          ctx.beginPath();
          ctx.moveTo(edge + s, y + 9);
          ctx.lineTo(edge + s + 5, y + 2);
          ctx.lineTo(edge + s + 9, y + 2);
          ctx.lineTo(edge + s + 4, y + 9);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }
  } else if (kind === 'office') {
    // passadeira de tapete com fio dourado
    if (w > 3 * TILE) {
      ctx.fillStyle = withAlpha(th.maroon || th.wallDark, 0.45);
      ctx.fillRect(x + 8, y + 3, w - 16, stripH - 7);
      ctx.fillStyle = withAlpha(th.gold, 0.30);
      ctx.fillRect(x + 8, y + 3, w - 16, 1);
      ctx.fillRect(x + 8, y + stripH - 5, w - 16, 1);
      for (let wx = worldX0 + 24; wx < worldX1 - 12; wx += 34) {
        ctx.fillStyle = withAlpha(th.gold, 0.10);
        ctx.fillRect(wx - cam.x, y + 6, 2, stripH - 12);
      }
    } else {
      for (let wx = worldX0 + 8; wx < worldX1; wx += 16) {
        ctx.fillStyle = withAlpha(th.floorLight, 0.12);
        ctx.fillRect(wx - cam.x, y + 4 + (wx % 5), 12, 1);
      }
    }
  } else {
    // concreto do pátio
    for (let wx = worldX0 + 3; wx < worldX1; wx += 9) {
      const n = tileNoise(wx, ty, 41);
      if (n > 0.55) {
        ctx.fillStyle = withAlpha(n > 0.82 ? th.floorLight : th.floorJoint, 0.18);
        ctx.fillRect(wx - cam.x, y + 3 + Math.floor(n * 9), 1, 1);
      }
    }
    for (let wx = Math.ceil(worldX0 / 190) * 190; wx < worldX1; wx += 190) {
      const n = tileNoise(wx, ty, 42);
      if (n > 0.35) {
        const cx = wx - cam.x + n * 26;
        ctx.strokeStyle = withAlpha(th.floorJoint, 0.55);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, y + 2);
        ctx.lineTo(cx + 3, y + 6);
        ctx.lineTo(cx - 2, y + 9);
        ctx.lineTo(cx + 4, y + 12);
        ctx.stroke();
      }
    }
    for (let wx = Math.ceil(worldX0 / 260) * 260; wx < worldX1; wx += 260) {
      const n = tileNoise(wx, ty, 43);
      if (n > 0.3) {
        ctx.fillStyle = withAlpha(th.floorJoint, 0.14);
        ctx.beginPath();
        ctx.ellipse(wx - cam.x + 40, y + 8, 18 + n * 22, 3.5, 0, 0, TAU);
        ctx.fill();
      }
    }
    if (w >= 6 * TILE) {
      // poças
      for (let wx = Math.ceil(worldX0 / 320) * 320; wx < worldX1 - 40; wx += 320) {
        const n = tileNoise(wx, ty, 44);
        if (n > 0.42) {
          const px = wx - cam.x + 20 + n * 24;
          ctx.fillStyle = withAlpha(th.cool, 0.16);
          ctx.beginPath();
          ctx.ellipse(px, y + 7, 18 + n * 16, 3.4, 0, 0, TAU);
          ctx.fill();
          ctx.fillStyle = withAlpha(th.cool, 0.28);
          ctx.fillRect(px - 10, y + 6, 9, 1);
          ctx.fillStyle = withAlpha(th.warm, 0.14);
          ctx.fillRect(px + 4, y + 8, 7, 1);
        }
      }
      // ralos
      for (let wx = Math.ceil(worldX0 / 480) * 480; wx < worldX1 - 30; wx += 480) {
        const n = tileNoise(wx, ty, 45);
        if (n > 0.4) {
          const dx = wx - cam.x + 30;
          ctx.fillStyle = withAlpha(th.metal, 0.5);
          ctx.fillRect(dx, y + 4, 20, 8);
          ctx.fillStyle = withAlpha(th.shadow, 0.65);
          for (let b = 0; b < 4; b++) ctx.fillRect(dx + 3 + b * 4, y + 6, 2, 4);
        }
      }
      // musgo desaturado
      for (let wx = Math.ceil(worldX0 / 150) * 150; wx < worldX1; wx += 150) {
        const n = tileNoise(wx, ty, 46);
        if (n > 0.62) {
          ctx.fillStyle = 'rgba(92,116,82,0.30)';
          ctx.fillRect(wx - cam.x + 4, y + 11, 5 + n * 6, 2);
          ctx.fillRect(wx - cam.x + 8, y + 9, 2, 2);
        }
      }
      // folhas secas
      for (let wx = Math.ceil(worldX0 / 210) * 210; wx < worldX1; wx += 210) {
        const n = tileNoise(wx, ty, 47);
        if (n > 0.5) {
          ctx.fillStyle = withAlpha(th.wood, 0.35);
          ctx.fillRect(wx - cam.x + 12, y + 10, 3, 2);
        }
      }
    }
  }
}

Game.prototype.drawTiles = function (ctx, cam) {
  const level = this.level;
  const th = level.theme;
  const kind = th.kind;
  const x0 = Math.max(0, Math.floor(cam.x / TILE) - 1);
  const x1 = Math.min(level.w - 1, Math.ceil((cam.x + VIEW_W) / TILE) + 1);
  const y0 = Math.max(0, Math.floor(cam.y / TILE) - 1);
  const y1 = Math.min(level.h - 1, Math.ceil((cam.y + VIEW_H) / TILE) + 1);

  // corpo contínuo, com variação sutil que não desenha bordas
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = level.tile(tx, ty);
      if (t !== TILE_SOLID) continue;
      const x = tx * TILE - cam.x;
      const y = ty * TILE - cam.y;
      ctx.fillStyle = th.tile;
      ctx.fillRect(x, y, TILE, TILE);

      const n = tileNoise(tx, ty, 1);
      if (n > 0.68) {
        ctx.fillStyle = withAlpha(th.tileTop, 0.045);
        ctx.fillRect(x, y, TILE, TILE);
      } else if (n < 0.30) {
        ctx.fillStyle = 'rgba(0,0,0,0.045)';
        ctx.fillRect(x, y, TILE, TILE);
      }

      // textura interna: pequenos grãos, nunca linhas por tile
      if (kind === 'hall') {
        for (let i = 0; i < 3; i++) {
          const nx = tileNoise(tx * 3 + i, ty, 2);
          const ny = tileNoise(tx, ty * 3 + i, 3);
          ctx.fillStyle = withAlpha(i % 2 ? th.tileTop : th.tileDark, 0.10);
          ctx.fillRect(x + 2 + nx * (TILE - 4), y + 15 + ny * 13, 1, 1);
        }
      } else if (kind === 'lab') {
        ctx.fillStyle = withAlpha(th.tileDark, 0.22);
        if (ty % 2 === 0) ctx.fillRect(x, y + 16, TILE, 1);
        for (let i = 0; i < 2; i++) {
          const nx = tileNoise(tx * 5 + i, ty, 4);
          ctx.fillStyle = withAlpha(th.metal, 0.28);
          ctx.fillRect(x + 3 + nx * 24, y + 20, 2, 2);
        }
      } else if (kind === 'gym') {
        for (let i = 0; i < 3; i++) {
          const ny = tileNoise(tx, ty * 4 + i, 5);
          ctx.fillStyle = withAlpha(th.floorLight, 0.06 + i * 0.02);
          ctx.fillRect(x + 2, y + 15 + ny * 14, TILE - 6, 1);
        }
      } else if (kind === 'office') {
        for (let i = 0; i < 2; i++) {
          const nx = tileNoise(tx * 4 + i, ty, 6);
          ctx.fillStyle = withAlpha(th.floorLight, 0.06);
          ctx.fillRect(x + 3 + nx * 24, y + 15, 1, 14);
        }
      } else {
        for (let i = 0; i < 3; i++) {
          const nx = tileNoise(tx * 6 + i, ty, 7);
          const ny = tileNoise(tx, ty * 6 + i, 8);
          ctx.fillStyle = withAlpha(nx > 0.5 ? th.tileTop : th.tileDark, 0.12);
          ctx.fillRect(x + 2 + nx * 27, y + 15 + ny * 13, 1, 1);
        }
      }
    }
  }

  // topos contínuos, agrupados em trechos
  for (let ty = y0; ty <= y1; ty++) {
    let runStart = -1;
    for (let tx = x0; tx <= x1 + 1; tx++) {
      const solidTop = tx <= x1 &&
        level.tile(tx, ty) === TILE_SOLID &&
        level.tile(tx, ty - 1) === TILE_EMPTY;
      if (solidTop && runStart < 0) runStart = tx;
      if (!solidTop && runStart >= 0) {
        drawSurfaceRun(ctx, cam, th, level, runStart, tx - 1, ty);
        runStart = -1;
      }
    }
  }

  // silhueta: laterais e bases expostas, contínuas
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (level.tile(tx, ty) !== TILE_SOLID) continue;
      const x = tx * TILE - cam.x;
      const y = ty * TILE - cam.y;
      const left = level.tile(tx - 1, ty) !== TILE_SOLID;
      const right = level.tile(tx + 1, ty) !== TILE_SOLID;
      const bottom = level.tile(tx, ty + 1) !== TILE_SOLID;

      if (left) {
        ctx.fillStyle = withAlpha(th.tileDark, 0.9);
        ctx.fillRect(x, y, 3, TILE);
        ctx.fillStyle = withAlpha(th.edge, 0.28);
        ctx.fillRect(x, y + 1, 1, TILE - 2);
      }
      if (right) {
        ctx.fillStyle = withAlpha(th.tileDark, 0.9);
        ctx.fillRect(x + TILE - 3, y, 3, TILE);
      }
      if (bottom) {
        ctx.fillStyle = withAlpha(th.tileDark, 0.92);
        ctx.fillRect(x, y + TILE - 4, TILE, 4);
        ctx.fillStyle = withAlpha(th.edge, 0.15);
        ctx.fillRect(x, y + TILE - 4, TILE, 1);
      }
    }
  }

  // perigos
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = level.tile(tx, ty);
      if (t !== TILE_SPIKE && t !== TILE_LASER) continue;
      const x = tx * TILE - cam.x;
      const y = ty * TILE - cam.y;

      if (t === TILE_SPIKE) {
        ctx.fillStyle = withAlpha(th.tileDark, 0.95);
        ctx.fillRect(x, y + TILE - 6, TILE, 6);
        ctx.fillStyle = withAlpha(th.metal, 0.45);
        ctx.fillRect(x, y + TILE - 6, TILE, 1);
        for (let i = 0; i < 4; i++) {
          const sx = x + i * 8;
          ctx.fillStyle = withAlpha(th.metal, 0.85);
          ctx.beginPath();
          ctx.moveTo(sx + 1, y + TILE - 5);
          ctx.lineTo(sx + 4, y + TILE - 20);
          ctx.lineTo(sx + 7, y + TILE - 5);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.32)';
          ctx.fillRect(sx + 4, y + TILE - 19, 1, 11);
          ctx.fillStyle = withAlpha(th.hazard, 0.75);
          ctx.fillRect(sx + 3, y + TILE - 5, 2, 2);
        }
      } else {
        ctx.fillStyle = withAlpha(th.metal, 0.75);
        ctx.fillRect(x + 2, y, TILE - 4, 7);
        ctx.fillRect(x + 2, y + TILE - 7, TILE - 4, 7);
        ctx.fillStyle = withAlpha(th.shadow, 0.8);
        ctx.fillRect(x + 4, y + 2, TILE - 8, 3);
        ctx.fillRect(x + 4, y + TILE - 5, TILE - 8, 3);
        ctx.fillStyle = withAlpha(th.hazard, 0.9);
        ctx.fillRect(x + 10, y + 3, 12, 2);
        ctx.fillRect(x + 10, y + TILE - 5, 12, 2);
        if (level.laserOn) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = withAlpha(th.hazard, 0.6);
          ctx.fillRect(x + 13, y + 6, 6, TILE - 12);
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.fillRect(x + 15, y + 6, 2, TILE - 12);
          ctx.restore();
        } else {
          ctx.fillStyle = withAlpha(th.hazard, 0.35);
          for (let sy = y + 8; sy < y + TILE - 8; sy += 6) {
            ctx.fillRect(x + 15, sy, 2, 2);
          }
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

    const special = gate.station === 'boss_arena' || gate.station === 'boss_exit';
    const accent = special ? (this.bossActive ? '#ff5d7a' : '#ffd24d') : th.accent;
    const glow = special ? '#ffe9a0' : th.glow;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, withAlpha(accent, 0.08));
    g.addColorStop(0.5, withAlpha(accent, 0.34));
    g.addColorStop(1, withAlpha(accent, 0.08));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = withAlpha(accent, 0.8);
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    const t = this.time;
    ctx.strokeStyle = withAlpha(glow, 0.55);
    ctx.lineWidth = 1;
    for (let sy = y + 8; sy < y + h - 8; sy += 12) {
      const off = Math.sin(t * 2 + sy * 0.05) * 3;
      ctx.beginPath();
      ctx.moveTo(x + 3, sy + off);
      ctx.lineTo(x + w - 3, sy + off);
      ctx.stroke();
    }
    ctx.fillStyle = withAlpha(glow, 0.9);
    ctx.fillRect(x - 3, y - 3, w + 6, 5);
    ctx.fillRect(x - 3, y + h - 2, w + 6, 5);

    // painel do portão
    if (special) {
      const cx = x + w / 2;
      const cy = y + h * 0.5;
      ctx.fillStyle = 'rgba(18,4,8,0.9)';
      roundRect(ctx, cx - 42, cy - 34, 84, 68, 6);
      ctx.fill();
      ctx.strokeStyle = withAlpha(accent, 0.9);
      ctx.lineWidth = 2;
      roundRect(ctx, cx - 42, cy - 34, 84, 68, 6);
      ctx.stroke();
      // cadeado
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy - 14, 9, Math.PI, TAU);
      ctx.stroke();
      ctx.fillStyle = withAlpha(accent, 0.9);
      ctx.fillRect(cx - 12, cy - 14, 24, 18);
      ctx.fillStyle = '#12040a';
      ctx.fillRect(cx - 2, cy - 8, 4, 7);
      drawText(ctx, gate.station === 'boss_arena' ? 'ARENA' : 'SAÍDA', cx, cy + 20, {
        size: 9, align: 'center', color: accent
      });
    } else {
      const station = this.level.stations.find((s) => s.action === gate.station);
      if (station) {
        const cx = x + w / 2;
        const cy = y + h * 0.5;
        ctx.fillStyle = 'rgba(2,14,8,0.9)';
        roundRect(ctx, cx - 44, cy - 24, 88, 48, 6);
        ctx.fill();
        ctx.strokeStyle = withAlpha(accent, 0.8);
        ctx.stroke();
        drawText(ctx, station.label, cx, cy - 9, {
          size: 10, align: 'center', color: withAlpha(glow, 0.9)
        });
        drawKeycap(ctx, station.key, cx - 28, cy + 2, accent, true, 0.72);
      }
    }
    ctx.restore();
  }
};

Game.prototype.drawArena = function (ctx, cam) {
  const arena = this.arena;
  if (!arena) return;
  const t = this.time;
  const left = arena.left * TILE - cam.x;
  const right = arena.right * TILE - cam.x;
  const ceil = 10 * TILE - cam.y;
  const floor = 18 * TILE - cam.y;
  if (right < -240 || left > VIEW_W + 240) return;

  const boss = this.boss;
  const active = this.bossActive && boss && !boss.dead;
  const cleared = this.bossDefeated;
  const color = cleared ? '#6dff9e' : (boss && boss.color) || '#6dff9e';
  const alert = active ? '#ff5d7a' : color;
  const ex = (left + right) / 2;
  const w = right - left;
  const h = floor - ceil;
  const id = this.level.id || 0;
  const gateX = this.exitGate ? this.exitGate.tx * TILE - cam.x : right;
  const exitX = arena.exit * TILE - cam.x + TILE / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(left, ceil, w + 480, h);
  ctx.clip();

  // parede de fundo da arena
  const wall = ctx.createLinearGradient(0, ceil, 0, floor);
  wall.addColorStop(0, 'rgba(3,7,13,0.72)');
  wall.addColorStop(0.55, 'rgba(4,9,16,0.52)');
  wall.addColorStop(1, 'rgba(2,5,10,0.34)');
  ctx.fillStyle = wall;
  ctx.fillRect(left, ceil, w, h);

  // tinta ambiente da arena
  const amb = ctx.createLinearGradient(0, ceil, 0, floor);
  amb.addColorStop(0, withAlpha(alert, active ? 0.08 : 0.05));
  amb.addColorStop(0.55, 'rgba(2,6,11,0.05)');
  amb.addColorStop(1, withAlpha(alert, active ? 0.09 : 0.06));
  ctx.fillStyle = amb;
  ctx.fillRect(left, ceil, w, h);

  // paineis da parede
  for (let y = ceil + 42; y < floor; y += 54) {
    ctx.fillStyle = 'rgba(150,180,215,0.025)';
    ctx.fillRect(left, y, w, 1);
  }
  for (let x = left + 48; x < right; x += 92) {
    ctx.fillStyle = 'rgba(4,9,15,0.28)';
    ctx.fillRect(x, ceil + 14, 2, h - 16);
    ctx.fillStyle = withAlpha('#bcd8ff', 0.04);
    ctx.fillRect(x + 3, ceil + 14, 1, h - 16);
  }

  // nome do chefe em marca d'agua
  if (boss) {
    ctx.save();
    ctx.globalAlpha = active ? 0.09 : 0.05;
    drawText(ctx, boss.cfg.name, ex, ceil + 60, {
      size: 34, align: 'center', color: color, weight: '900'
    });
    ctx.restore();
    drawText(ctx, cleared ? 'ARENA LIMPA' : active ? 'COMBATE // ' + boss.cfg.name : boss.cfg.name, ex, ceil + 22, {
      size: 9, align: 'center', color: withAlpha(alert, active ? 0.95 : 0.6)
    });
  }

  // selo grande da arena
  const sealY = ceil + 134;
  const sealR = 46 + (active ? Math.sin(t * 3) * 3 : 0);
  ctx.save();
  ctx.translate(ex, sealY);
  ctx.strokeStyle = withAlpha(alert, active ? 0.55 : 0.3);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, sealR, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = withAlpha(alert, 0.35);
  ctx.beginPath();
  ctx.arc(0, 0, sealR + 12, 0.3, 2.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, sealR + 12, 3.44, 5.84);
  ctx.stroke();
  ctx.rotate(t * (active ? 0.35 : 0.12));
  for (let i = 0; i < 8; i++) {
    const a = (TAU * i) / 8;
    ctx.fillStyle = withAlpha(alert, 0.32);
    ctx.fillRect(Math.cos(a) * (sealR + 6) - 2, Math.sin(a) * (sealR + 6) - 2, 4, 4);
  }
  ctx.rotate(-t * (active ? 0.35 : 0.12));
  ctx.fillStyle = withAlpha(alert, 0.16);
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(22, 0);
  ctx.lineTo(0, 26);
  ctx.lineTo(-22, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = withAlpha(alert, 0.65);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // trelica de teto
  ctx.fillStyle = 'rgba(8,13,20,0.55)';
  ctx.fillRect(left, ceil, w, 8);
  ctx.fillStyle = 'rgba(150,180,215,0.12)';
  ctx.fillRect(left, ceil + 8, w, 2);
  for (let x = left + 24; x < right; x += 64) {
    ctx.fillStyle = 'rgba(180,205,235,0.16)';
    ctx.fillRect(x, ceil + 2, 3, 5);
  }

  // lampadas e cabos
  for (let i = 0; i < 5; i++) {
    const lx = left + 62 + i * ((w - 124) / 4);
    ctx.strokeStyle = 'rgba(150,180,215,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx, ceil + 10);
    ctx.quadraticCurveTo(lx + 12, ceil + 22, lx + 6, ceil + 32);
    ctx.stroke();
    ctx.fillStyle = 'rgba(10,16,24,0.9)';
    roundRect(ctx, lx - 9, ceil + 28, 18, 8, 2);
    ctx.fill();
    ctx.fillStyle = withAlpha(active ? '#ffd24d' : '#bfe6ff', active ? 0.8 : 0.35);
    ctx.fillRect(lx - 6, ceil + 34, 12, 2);
  }

  // refletores com cones volumetricos
  const beams = 4;
  for (let i = 0; i < beams; i++) {
    const bx = left + w * (0.12 + i * 0.253);
    const sway = Math.sin(t * 0.7 + i * 1.9) * 26;
    const spread = 90 + i * 8;
    const grad = ctx.createLinearGradient(bx, ceil, bx + sway, floor);
    grad.addColorStop(0, withAlpha(alert, active ? 0.2 : 0.1));
    grad.addColorStop(0.55, withAlpha(alert, active ? 0.07 : 0.035));
    grad.addColorStop(1, withAlpha(alert, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(bx - 13, ceil + 8);
    ctx.lineTo(bx + 13, ceil + 8);
    ctx.lineTo(bx + spread + sway, floor);
    ctx.lineTo(bx - spread + sway, floor);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = withAlpha(alert, 0.12);
    ctx.beginPath();
    ctx.ellipse(bx + sway, floor - 2, spread * 0.72, 9, 0, 0, TAU);
    ctx.fill();
  }

  // holofote que segue o chefe
  if (boss && !boss.dead) {
    const bx = boss.cx - cam.x;
    const grad = ctx.createLinearGradient(bx, ceil, bx, floor);
    grad.addColorStop(0, withAlpha(alert, active ? 0.26 : 0.12));
    grad.addColorStop(1, withAlpha(alert, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(bx - 18, ceil + 8);
    ctx.lineTo(bx + 18, ceil + 8);
    ctx.lineTo(bx + 92, floor);
    ctx.lineTo(bx - 92, floor);
    ctx.closePath();
    ctx.fill();
  }

  // piso: circulo de combate, rachaduras, marcas
  const cyFloor = floor - 2;
  ctx.strokeStyle = withAlpha(alert, active ? 0.26 : 0.18);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(ex, cyFloor, Math.min(190, w * 0.34), 26, 0, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([8, 10]);
  ctx.strokeStyle = withAlpha(alert, 0.2);
  ctx.beginPath();
  ctx.ellipse(ex, cyFloor, Math.min(220, w * 0.4), 34, 0, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < 16; i++) {
    const a = (TAU * i) / 16;
    const rx = Math.min(190, w * 0.34);
    ctx.strokeStyle = withAlpha(alert, 0.14);
    ctx.beginPath();
    ctx.moveTo(ex + Math.cos(a) * (rx - 7), cyFloor + Math.sin(a) * 20);
    ctx.lineTo(ex + Math.cos(a) * (rx + 6), cyFloor + Math.sin(a) * 28);
    ctx.stroke();
  }

  // rachaduras deterministicas
  for (let i = 0; i < 7; i++) {
    const sx = ex + Math.sin(i * 12.9898 + id * 7.13) * Math.min(200, w * 0.36);
    const sy = cyFloor + Math.cos(i * 4.1415 + id) * 16;
    ctx.strokeStyle = 'rgba(2,5,9,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    let px = sx;
    let py = sy;
    for (let j = 0; j < 4; j++) {
      px += Math.sin(i * 3.7 + j * 2.1) * 18;
      py += 4 + Math.cos(i + j) * 3;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // detritos e sucata
  for (let i = 0; i < 9; i++) {
    const dx = left + 30 + ((i * 73 + id * 31) % Math.max(1, w - 60));
    const dy = floor - 4 - (i % 3) * 2;
    ctx.fillStyle = i % 2 ? 'rgba(26,36,48,0.75)' : 'rgba(14,20,28,0.8)';
    ctx.fillRect(dx, dy, 4 + (i % 3) * 3, 2 + (i % 2) * 2);
  }

  // faixas de perigo junto aos portoes
  for (const side of [-1, 1]) {
    const hx = side < 0 ? left + 2 : right - 58;
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? withAlpha(active ? '#ffd24d' : alert, 0.32) : 'rgba(8,12,16,0.7)';
      ctx.fillRect(hx + i * 12, floor - 9, 12, 9);
    }
  }

  // molduras laterais / luzes de emergencia
  for (const side of [-1, 1]) {
    const px = side < 0 ? left + 1 : right - 9;
    ctx.fillStyle = 'rgba(8,14,22,0.85)';
    ctx.fillRect(px, ceil + 12, 8, h - 14);
    ctx.fillStyle = withAlpha(alert, 0.24);
    ctx.fillRect(px + 2, ceil + 18, 4, h - 26);
    for (let i = 0; i < 3; i++) {
      const ly = ceil + 48 + i * 62;
      const blink = active ? 0.35 + 0.65 * Math.abs(Math.sin(t * 4 + i * 2 + (side > 0 ? 1.2 : 0))) : 0.18;
      ctx.fillStyle = withAlpha(active ? '#ff3355' : alert, blink);
      ctx.fillRect(px + 2, ly, 4, 8);
    }
  }

  // caminho para a saida
  if (cleared) {
    const from = Math.max(left + 8, gateX);
    const to = Math.max(from + 10, exitX);
    const pulse = 0.45 + Math.sin(t * 4) * 0.2;
    const pathGrad = ctx.createLinearGradient(from, 0, to, 0);
    pathGrad.addColorStop(0, 'rgba(109,255,158,0)');
    pathGrad.addColorStop(0.35, withAlpha('#6dff9e', 0.14));
    pathGrad.addColorStop(1, withAlpha('#6dff9e', 0.3));
    ctx.fillStyle = pathGrad;
    ctx.fillRect(from, floor - 16, to - from, 16);
    ctx.strokeStyle = withAlpha('#6dff9e', pulse);
    ctx.lineWidth = 2;
    for (let x = from + 12; x < to - 8; x += 30) {
      const off = (t * 60 + x) % 30;
      ctx.beginPath();
      ctx.moveTo(x + off - 10, floor - 15);
      ctx.lineTo(x + off, floor - 8);
      ctx.lineTo(x + off - 10, floor - 1);
      ctx.stroke();
    }
    const ax = clamp(exitX, left + 30, right + 300);
    const ay = floor - 120 + Math.sin(t * 3) * 3;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = withAlpha('#6dff9e', 0.55);
    ctx.beginPath();
    ctx.moveTo(ax + 14, ay);
    ctx.lineTo(ax - 6, ay - 10);
    ctx.lineTo(ax - 6, ay + 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // poeira suspensa
  for (let i = 0; i < 18; i++) {
    const px = left + ((i * 137 + t * (8 + (i % 3) * 5) + id * 41) % Math.max(1, w));
    const py = ceil + 40 + ((i * 89 + Math.sin(t * 0.6 + i) * 30) % Math.max(1, h - 60));
    ctx.fillStyle = withAlpha(alert, active ? 0.16 : 0.08);
    ctx.fillRect(px, py, 2, 2);
  }

  // alerta de lockdown
  if (active) {
    const a = 0.035 + 0.035 * Math.abs(Math.sin(t * 2.4));
    ctx.fillStyle = withAlpha('#ff3355', a);
    ctx.fillRect(left, ceil, w, h);
    ctx.strokeStyle = withAlpha('#ff3355', 0.18);
    ctx.lineWidth = 1;
    const scanY = ceil + ((t * 90) % Math.max(1, h));
    ctx.beginPath();
    ctx.moveTo(left, scanY);
    ctx.lineTo(right, scanY);
    ctx.stroke();
  }

  // vinheta interna
  const vg = ctx.createRadialGradient(ex, (ceil + floor) / 2, w * 0.18, ex, (ceil + floor) / 2, w * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.34)');
  ctx.fillStyle = vg;
  ctx.fillRect(left, ceil, w, h);

  ctx.restore();
};

Game.prototype.drawGameScene = function (ctx) {
  const cam = this.cam;
  ctx.save();
  if (cam.shake > 0) {
    ctx.translate(rand(-cam.shake * 7, cam.shake * 7), rand(-cam.shake * 7, cam.shake * 7));
  }
  this.drawBackground(ctx, cam);
  this.drawTiles(ctx, cam);
  this.drawArena(ctx, cam);
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
  } else if (th.kind === 'hall' || th.kind === 'lab' || th.kind === 'office') {
    // poeira suspensa nos corredores internos
    for (let i = 0; i < 20; i++) {
      const x = (i * 173 + t * (8 + (i % 4) * 4)) % (VIEW_W + 20) - 10;
      const y = 110 + ((i * 97 + Math.sin(t * 0.5 + i) * 40) % 470);
      ctx.fillStyle = withAlpha(th.glow, 0.05 + (i % 3) * 0.03);
      ctx.fillRect(x, y, 2, 2);
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
  g.addColorStop(0, 'rgba(4,7,14,0.80)');
  g.addColorStop(1, 'rgba(4,7,14,0)');
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
  ctx.fillStyle = 'rgba(5,9,16,0.85)';
  roundRect(ctx, 26, 58, ew, 15, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(130,175,215,0.28)';
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
    ctx.fillStyle = selected ? withAlpha(w.color, 0.16) : 'rgba(6,10,17,0.84)';
    roundRect(ctx, x, wy, 146, 48, 6);
    ctx.fill();
    ctx.strokeStyle = selected ? w.color : 'rgba(135,170,205,0.22)';
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

  if (kind === 'gym') {
    drawGymBackdrop(ctx, th, t, 0);
  } else if (kind === 'lab') {
    drawLabBackdrop(ctx, th, t, 0);
  } else if (kind === 'office') {
    drawOfficeBackdrop(ctx, th, t, 0);
  } else if (kind === 'hall') {
    drawHallBackdrop(ctx, th, t, 0);
  } else {
    drawSchoolBackdrop(ctx, th, t, false, 0);
  }

  // base escura para leitura dos textos da cutscene
  const vg = ctx.createLinearGradient(0, VIEW_H - 260, 0, VIEW_H);
  vg.addColorStop(0, 'rgba(3,6,12,0)');
  vg.addColorStop(1, 'rgba(3,6,12,0.78)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, VIEW_H - 260, VIEW_W, 260);
};

function drawCutsceneHero(ctx, x, groundY, t, color) {
  const accent = color || '#6dff9e';
  const bob = Math.sin(t * 1.6) * 2;
  ctx.save();

  // sombra no ch├úo
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(x, groundY + 4, 52, 9, 0, 0, TAU);
  ctx.fill();

  // aura / contraluz
  const halo = ctx.createRadialGradient(x, groundY - 90, 10, x, groundY - 90, 130);
  halo.addColorStop(0, withAlpha(accent, 0.16));
  halo.addColorStop(1, withAlpha(accent, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(x - 140, groundY - 240, 280, 260);

  // pernas e botas
  ctx.fillStyle = '#0b1710';
  ctx.fillRect(x - 20, groundY - 62, 16, 62);
  ctx.fillRect(x + 4, groundY - 62, 16, 62);
  ctx.fillStyle = '#132a1b';
  ctx.fillRect(x - 24, groundY - 9, 24, 9);
  ctx.fillRect(x + 2, groundY - 9, 24, 9);
  ctx.fillStyle = withAlpha(accent, 0.35);
  ctx.fillRect(x - 20, groundY - 58, 16, 2);
  ctx.fillRect(x + 4, groundY - 58, 16, 2);

  // jaqueta / torso
  ctx.fillStyle = '#10241a';
  roundRect(ctx, x - 28, groundY - 132 + bob, 56, 76, 8);
  ctx.fill();
  // mochila
  ctx.fillStyle = '#0a1811';
  roundRect(ctx, x - 42, groundY - 126 + bob, 16, 54, 5);
  ctx.fill();
  ctx.fillStyle = withAlpha(accent, 0.18);
  ctx.fillRect(x - 40, groundY - 120 + bob, 3, 40);
  // detalhes da jaqueta
  ctx.fillStyle = withAlpha(accent, 0.30);
  ctx.fillRect(x - 22, groundY - 118 + bob, 44, 3);
  ctx.fillRect(x - 2, groundY - 112 + bob, 3, 50);
  ctx.fillStyle = '#0a1811';
  ctx.fillRect(x - 26, groundY - 78 + bob, 52, 5);

  // bra├ºos
  ctx.fillStyle = '#0d1f16';
  ctx.fillRect(x - 38, groundY - 124 + bob, 12, 56);
  ctx.fillRect(x + 26, groundY - 124 + bob, 12, 56);
  ctx.fillStyle = '#163020';
  ctx.fillRect(x - 40, groundY - 70 + bob, 14, 10);
  ctx.fillRect(x + 26, groundY - 70 + bob, 14, 10);

  // cabe├ºa / capuz
  ctx.fillStyle = '#163020';
  roundRect(ctx, x - 18, groundY - 170 + bob, 36, 42, 11);
  ctx.fill();
  ctx.fillStyle = '#08120c';
  roundRect(ctx, x - 21, groundY - 174 + bob, 42, 18, 8);
  ctx.fill();
  // visor brilhante
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 16;
  ctx.fillRect(x - 11, groundY - 155 + bob, 22, 5);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#eafff0';
  ctx.fillRect(x - 8, groundY - 154 + bob, 6, 3);

  // bast├úo / arma
  ctx.save();
  ctx.translate(x + 34, groundY - 96 + bob);
  ctx.rotate(0.32 + Math.sin(t * 1.2) * 0.05);
  ctx.fillStyle = '#2a4a36';
  ctx.fillRect(-3, 0, 6, 64);
  ctx.fillStyle = withAlpha(accent, 0.85);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.fillStyle = '#0a1811';
  ctx.fillRect(-5, 52, 10, 8);
  ctx.restore();

  // rim light
  ctx.strokeStyle = withAlpha(accent, 0.38);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 27, groundY - 164 + bob);
  ctx.lineTo(x + 30, groundY - 122 + bob);
  ctx.lineTo(x + 24, groundY - 70 + bob);
  ctx.stroke();

  ctx.restore();
}

function drawCutsceneBoss(ctx, style, color, cx, baseY, t) {
  const pulse = 0.5 + Math.sin(t * 2.2) * 0.5;
  ctx.save();
  ctx.translate(cx, baseY);

  // aura
  const aura = ctx.createRadialGradient(0, -170, 30, 0, -170, 280);
  aura.addColorStop(0, withAlpha(color, 0.20 + pulse * 0.10));
  aura.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = aura;
  ctx.fillRect(-320, -440, 640, 480);

  // sombra no ch├úo
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 6, 150, 20, 0, 0, TAU);
  ctx.fill();

  const dark = '#0a1410';
  const mid = withAlpha(color, 0.35);
  ctx.shadowColor = color;
  ctx.shadowBlur = 18 + pulse * 14;

  if (style === 'guardian') {
    // pernas blindadas
    ctx.fillStyle = dark;
    ctx.fillRect(-56, -128, 46, 128);
    ctx.fillRect(10, -128, 46, 128);
    ctx.fillStyle = withAlpha(color, 0.22);
    ctx.fillRect(-52, -114, 38, 10);
    ctx.fillRect(14, -114, 38, 10);
    ctx.fillRect(-52, -86, 38, 6);
    ctx.fillRect(14, -86, 38, 6);
    // joelhos
    ctx.fillStyle = withAlpha(color, 0.42);
    roundRect(ctx, -62, -136, 58, 26, 8); ctx.fill();
    roundRect(ctx, 4, -136, 58, 26, 8); ctx.fill();
    // botas com travas
    ctx.fillStyle = dark;
    roundRect(ctx, -70, -24, 62, 24, 6); ctx.fill();
    roundRect(ctx, 8, -24, 62, 24, 6); ctx.fill();
    ctx.fillStyle = withAlpha(color, 0.55);
    ctx.fillRect(-66, -21, 54, 3);
    ctx.fillRect(12, -21, 54, 3);
    ctx.fillStyle = withAlpha(color, 0.3);
    ctx.fillRect(-64, -14, 8, 8);
    ctx.fillRect(14, -14, 8, 8);

    // torso blindado
    ctx.fillStyle = mid;
    roundRect(ctx, -82, -300, 164, 186, 20); ctx.fill();
    // placas de peito
    ctx.fillStyle = dark;
    roundRect(ctx, -66, -286, 132, 80, 10); ctx.fill();
    ctx.strokeStyle = withAlpha(color, 0.65);
    ctx.lineWidth = 2;
    ctx.strokeRect(-62, -282, 124, 72);
    // faixas de alerta
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? withAlpha(color, 0.5) : 'rgba(8,18,12,0.8)';
      ctx.fillRect(-60 + i * 20, -270, 12, 8);
    }
    // parafusos
    ctx.fillStyle = withAlpha('#eafff0', 0.35);
    for (const [rx, ry] of [[-58, -278], [58, -278], [-58, -214], [58, -214]]) {
      ctx.fillRect(rx, ry, 4, 4);
    }
    // n├║cleo com an├⌐is
    ctx.fillStyle = withAlpha(color, 0.18);
    ctx.beginPath(); ctx.arc(0, -238, 30 + pulse * 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = withAlpha(color, 0.7);
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -238, 20 + pulse * 3, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#eafff0';
    ctx.beginPath(); ctx.arc(0, -238, 11 + pulse * 2, 0, TAU); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, -238, 6, 0, TAU); ctx.fill();

    // ombreiras
    ctx.fillStyle = dark;
    roundRect(ctx, -132, -306, 58, 96, 14); ctx.fill();
    roundRect(ctx, 74, -306, 58, 96, 14); ctx.fill();
    ctx.fillStyle = withAlpha(color, 0.5);
    ctx.fillRect(-126, -296, 46, 5);
    ctx.fillRect(80, -296, 46, 5);
    ctx.fillStyle = withAlpha(color, 0.3);
    ctx.fillRect(-124, -262, 10, 10);
    ctx.fillRect(114, -262, 10, 10);

    // bra├ºos e punhos
    ctx.fillStyle = mid;
    roundRect(ctx, -140, -220, 54, 98, 14); ctx.fill();
    roundRect(ctx, 86, -220, 54, 98, 14); ctx.fill();
    ctx.fillStyle = dark;
    roundRect(ctx, -148, -132, 62, 40, 10); ctx.fill();
    roundRect(ctx, 86, -132, 62, 40, 10); ctx.fill();
    ctx.fillStyle = withAlpha(color, 0.55);
    ctx.fillRect(-142, -124, 50, 4);
    ctx.fillRect(92, -124, 50, 4);
    // cabos de energia
    ctx.strokeStyle = withAlpha(color, 0.35);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-96, -276); ctx.quadraticCurveTo(-118, -244, -112, -206);
    ctx.moveTo(96, -276); ctx.quadraticCurveTo(118, -244, 112, -206);
    ctx.stroke();

    // cabe├ºa / capacete
    ctx.fillStyle = dark;
    roundRect(ctx, -52, -380, 104, 84, 16); ctx.fill();
    ctx.fillStyle = withAlpha(color, 0.3);
    roundRect(ctx, -44, -370, 88, 22, 8); ctx.fill();
    // antena
    ctx.fillStyle = withAlpha(color, 0.6);
    ctx.fillRect(-2, -404, 4, 26);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, -406, 5 + pulse * 2, 0, TAU); ctx.fill();
    // visor
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16 + pulse * 10;
    ctx.fillRect(-34, -350, 26, 8);
    ctx.fillRect(8, -350, 26, 8);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#eafff0';
    ctx.fillRect(-30, -348, 10, 3);
    ctx.fillRect(12, -348, 10, 3);
    // grade de ventila├º├úo
    ctx.fillStyle = withAlpha(color, 0.25);
    for (let i = 0; i < 4; i++) ctx.fillRect(-18, -322 + i * 6, 36, 2);
  } else if (style === 'hunter') {
    ctx.fillStyle = dark;
    ctx.fillRect(-40, -130, 26, 130);
    ctx.fillRect(14, -130, 26, 130);
    ctx.fillStyle = mid;
    ctx.beginPath();
    ctx.moveTo(-58, -300);
    ctx.lineTo(58, -300);
    ctx.lineTo(74, -112);
    ctx.lineTo(30, -120);
    ctx.lineTo(0, -160);
    ctx.lineTo(-30, -120);
    ctx.lineTo(-74, -112);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-54, -304);
    ctx.lineTo(0, -262);
    ctx.lineTo(54, -304);
    ctx.lineTo(36, -330);
    ctx.lineTo(-36, -330);
    ctx.closePath();
    ctx.fill();
    roundRect(ctx, -32, -372, 64, 56, 12); ctx.fill();
    ctx.fillStyle = color;
    ctx.fillRect(-24, -352, 48, 6);
    ctx.save();
    ctx.translate(78, -190);
    ctx.rotate(-0.5 + Math.sin(t * 1.6) * 0.08);
    ctx.fillStyle = withAlpha(color, 0.8);
    ctx.fillRect(-4, -110, 8, 150);
    ctx.restore();
  } else if (style === 'bruiser') {
    ctx.fillStyle = dark;
    ctx.fillRect(-62, -110, 48, 110);
    ctx.fillRect(14, -110, 48, 110);
    ctx.fillStyle = mid;
    roundRect(ctx, -92, -300, 184, 196, 26); ctx.fill();
    ctx.fillStyle = withAlpha(color, 0.6);
    roundRect(ctx, -150, -308, 66, 100, 16); ctx.fill();
    roundRect(ctx, 84, -308, 66, 100, 16); ctx.fill();
    ctx.fillStyle = dark;
    roundRect(ctx, -142, -222, 46, 112, 14); ctx.fill();
    roundRect(ctx, 96, -222, 46, 112, 14); ctx.fill();
    roundRect(ctx, -38, -358, 76, 62, 12); ctx.fill();
    ctx.fillStyle = color;
    ctx.fillRect(-22, -334, 44, 6);
    ctx.fillStyle = '#ffd24d';
    ctx.fillRect(26, -282, 18, 12);
    ctx.strokeStyle = '#ffd24d';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -296, 34, 0.15, Math.PI - 0.15); ctx.stroke();
    drawText(ctx, '00', 0, -240, { size: 20, align: 'center', color: withAlpha(color, 0.85) });
  } else if (style === 'trickster') {
    ctx.fillStyle = mid;
    ctx.beginPath();
    ctx.moveTo(0, -380);
    ctx.quadraticCurveTo(110, -300, 90, -20 + Math.sin(t * 1.5) * 6);
    ctx.quadraticCurveTo(0, -70, -90, -20 + Math.cos(t * 1.5) * 6);
    ctx.quadraticCurveTo(-110, -300, 0, -380);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(0, -382);
    ctx.lineTo(56, -310);
    ctx.lineTo(0, -276);
    ctx.lineTo(-56, -310);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillRect(-18, -326, 12, 5);
    ctx.fillRect(6, -326, 12, 5);
    for (let i = 0; i < 5; i++) {
      const a = t * 1.2 + i * 1.26;
      const ox = Math.cos(a) * (110 + (i % 2) * 26);
      const oy = -230 + Math.sin(a * 1.4) * 90;
      ctx.fillStyle = withAlpha(color, 0.75);
      ctx.beginPath(); ctx.arc(ox, oy, 7 + (i % 3) * 2, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = color;
    ctx.fillRect(-210, -280, 70, 240);
    ctx.fillRect(140, -280, 70, 240);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = 'rgba(10,14,8,0.9)';
    ctx.fillRect(-150, -400, 300, 200);
    ctx.fillRect(-176, -220, 352, 60);
    ctx.strokeStyle = withAlpha(color, 0.35);
    ctx.strokeRect(-150, -400, 300, 200);
    ctx.fillStyle = dark;
    ctx.fillRect(-44, -140, 30, 140);
    ctx.fillRect(14, -140, 30, 140);
    ctx.fillStyle = mid;
    roundRect(ctx, -66, -330, 132, 200, 14); ctx.fill();
    ctx.fillStyle = withAlpha('#ffffff', 0.16);
    ctx.beginPath();
    ctx.moveTo(-40, -330);
    ctx.lineTo(0, -250);
    ctx.lineTo(40, -330);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = dark;
    roundRect(ctx, -34, -404, 68, 70, 12); ctx.fill();
    ctx.fillStyle = '#1a1410';
    ctx.beginPath(); ctx.arc(0, -406, 40, Math.PI, TAU); ctx.fill();
    ctx.fillRect(-40, -412, 80, 18);
    ctx.fillStyle = '#ff3355';
    ctx.shadowColor = '#ff3355';
    ctx.shadowBlur = 18;
    ctx.fillRect(-20, -378, 12, 5);
    ctx.fillRect(8, -378, 12, 5);
    ctx.fillStyle = withAlpha('#ffd24d', 0.8);
    ctx.fillRect(24, -290, 18, 12);
  }
  ctx.restore();
}

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
    case 'courtyard': {
      // prédio da escola ao fundo
      ctx.fillStyle = 'rgba(6,20,12,0.9)';
      ctx.fillRect(cx - 330, 170, 660, 340);
      ctx.fillStyle = withAlpha('#6dff9e', 0.06);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 10; c++) {
          const lit = (r * 10 + c) % 7 === 0;
          ctx.fillStyle = lit ? withAlpha('#c8ffda', 0.30) : withAlpha('#0a2a18', 0.9);
          ctx.fillRect(cx - 306 + c * 62, 194 + r * 66, 38, 42);
        }
      }
      // portão central
      ctx.fillStyle = 'rgba(3,12,8,0.85)';
      ctx.fillRect(cx - 90, 330, 180, 210);
      ctx.strokeStyle = withAlpha('#6dff9e', 0.55);
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 90, 330, 180, 210);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = withAlpha('#6dff9e', 0.12);
        ctx.fillRect(cx - 78 + i * 28, 340, 4, 190);
      }
      // árvores
      for (const side of [-1, 1]) {
        const tx = cx + side * 280;
        ctx.fillStyle = '#2a1d12';
        ctx.fillRect(tx - 8, 380, 16, 130);
        ctx.fillStyle = withAlpha('#1f6b3a', 0.85);
        ctx.beginPath();
        ctx.arc(tx, 350, 62, 0, TAU);
        ctx.arc(tx - 38, 380, 40, 0, TAU);
        ctx.arc(tx + 38, 380, 40, 0, TAU);
        ctx.fill();
      }
      // câmera
      ctx.fillStyle = '#16241a';
      ctx.fillRect(cx + 210, 130, 56, 34);
      ctx.fillStyle = '#ff3355';
      ctx.shadowColor = '#ff3355';
      ctx.shadowBlur = 12 + Math.sin(t * 6) * 6;
      ctx.fillRect(cx + 252, 142, 6, 6);
      ctx.shadowBlur = 0;
      break;
    }
    case 'hall': {
      const vx = cx;
      const vy = cy - 10;
      // corredor em perspectiva
      ctx.fillStyle = 'rgba(4,16,11,0.88)';
      ctx.beginPath();
      ctx.moveTo(0, 100);
      ctx.lineTo(VIEW_W, 100);
      ctx.lineTo(vx + 180, 560);
      ctx.lineTo(vx - 180, 560);
      ctx.closePath();
      ctx.fill();
      // linhas do piso
      ctx.strokeStyle = withAlpha('#5dffb0', 0.16);
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(vx + (i - 3.5) * 180, 100);
        ctx.lineTo(vx + (i - 3.5) * 46, 560);
        ctx.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const yy = 120 + i * i * 14;
        ctx.beginPath();
        ctx.moveTo(vx - 190 - i * 40, yy);
        ctx.lineTo(vx + 190 + i * 40, yy);
        ctx.stroke();
      }
      // armários laterais
      for (const side of [-1, 1]) {
        for (let i = 0; i < 5; i++) {
          const s = 1 - i * 0.14;
          const lx = vx + side * (180 + i * 90) - (side < 0 ? 58 * s : 0);
          const ly = 160 + i * 34;
          const lw = 58 * s;
          const lh = 220 * s;
          ctx.fillStyle = withAlpha('#1b5e48', 0.55);
          ctx.fillRect(lx, ly, lw, lh);
          ctx.strokeStyle = withAlpha('#9df7bb', 0.14);
          ctx.strokeRect(lx, ly, lw, lh);
        }
      }
      // luzes piscando
      for (let i = 0; i < 3; i++) {
        const lx = cx - 260 + i * 260;
        const fl = 0.4 + 0.6 * Math.abs(Math.sin(t * 4 + i * 2.1));
        ctx.fillStyle = withAlpha('#bfffd8', 0.10 + fl * 0.16);
        ctx.fillRect(lx - 50, 96, 100, 6);
        ctx.beginPath();
        ctx.moveTo(lx - 40, 102);
        ctx.lineTo(lx + 40, 102);
        ctx.lineTo(lx + 110, 560);
        ctx.lineTo(lx - 110, 560);
        ctx.closePath();
        ctx.fill();
      }
      // porta ao fundo
      ctx.fillStyle = 'rgba(2,10,7,0.95)';
      ctx.fillRect(vx - 46, 300, 92, 150);
      ctx.strokeStyle = withAlpha('#5dffb0', 0.5);
      ctx.lineWidth = 2;
      ctx.strokeRect(vx - 46, 300, 92, 150);
      drawText(ctx, 'SAÍDA', vx, 330, { size: 10, align: 'center', color: withAlpha('#bfffd8', 0.6) });
      break;
    }
    case 'turret': {
      // tripé
      ctx.strokeStyle = '#2d4054';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx - 60, 560);
      ctx.lineTo(cx, 420);
      ctx.lineTo(cx + 60, 560);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, 420);
      ctx.lineTo(cx, 560);
      ctx.stroke();
      // corpo
      ctx.fillStyle = '#22303f';
      roundRect(ctx, cx - 58, 330, 116, 96, 18);
      ctx.fill();
      ctx.strokeStyle = withAlpha('#ff5d6c', 0.5);
      ctx.lineWidth = 2;
      roundRect(ctx, cx - 58, 330, 116, 96, 18);
      ctx.stroke();
      // canhão
      ctx.save();
      ctx.translate(cx, 376);
      ctx.rotate(Math.sin(t * 1.4) * 0.22);
      ctx.fillStyle = '#38495c';
      ctx.fillRect(0, -10, 120, 20);
      ctx.fillStyle = '#ff5d6c';
      ctx.shadowColor = '#ff5d6c';
      ctx.shadowBlur = 14;
      ctx.fillRect(108, -5, 12, 10);
      ctx.shadowBlur = 0;
      // laser
      ctx.strokeStyle = 'rgba(255,93,108,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(120, 0);
      ctx.lineTo(520, 40);
      ctx.stroke();
      ctx.restore();
      // olho
      ctx.fillStyle = '#ff3355';
      ctx.shadowColor = '#ff3355';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx - 24, 358, 8, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }
    case 'charger': {
      // linhas de velocidade
      for (let i = 0; i < 7; i++) {
        ctx.strokeStyle = withAlpha('#ff6b4a', 0.12 + (i % 3) * 0.06);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 320 + i * 18, 280 + i * 28);
        ctx.lineTo(cx - 150, 280 + i * 28);
        ctx.stroke();
      }
      // corpo blindado
      ctx.fillStyle = '#1a2620';
      roundRect(ctx, cx - 100, 300, 200, 190, 26);
      ctx.fill();
      ctx.fillStyle = withAlpha('#ff6b4a', 0.45);
      roundRect(ctx, cx - 78, 320, 156, 80, 16);
      ctx.fill();
      // ombros com espinhos
      ctx.fillStyle = '#2a382f';
      ctx.beginPath();
      ctx.moveTo(cx - 104, 320);
      ctx.lineTo(cx - 150, 270);
      ctx.lineTo(cx - 84, 300);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 104, 320);
      ctx.lineTo(cx + 150, 270);
      ctx.lineTo(cx + 84, 300);
      ctx.closePath();
      ctx.fill();
      // cabeça/visor
      ctx.fillStyle = '#0a1410';
      roundRect(ctx, cx - 50, 250, 100, 60, 14);
      ctx.fill();
      ctx.fillStyle = '#ff5d6c';
      ctx.shadowColor = '#ff5d6c';
      ctx.shadowBlur = 18;
      ctx.fillRect(cx - 34, 272, 68, 8);
      ctx.shadowBlur = 0;
      // pernas
      ctx.fillStyle = '#1a2620';
      ctx.fillRect(cx - 66, 470, 42, 100);
      ctx.fillRect(cx + 24, 470, 42, 100);
      break;
    }
    case 'swooper': {
      // sombra no chão
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(cx, 590, 90, 16, 0, 0, TAU);
      ctx.fill();
      // asas
      const flap = Math.sin(t * 5) * 16;
      ctx.fillStyle = withAlpha('#7fe7ff', 0.35);
      ctx.beginPath();
      ctx.moveTo(cx - 40, 300);
      ctx.lineTo(cx - 170, 270 + flap);
      ctx.lineTo(cx - 120, 340);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 40, 300);
      ctx.lineTo(cx + 170, 270 + flap);
      ctx.lineTo(cx + 120, 340);
      ctx.closePath();
      ctx.fill();
      // corpo
      ctx.fillStyle = '#1b2a33';
      ctx.beginPath();
      ctx.ellipse(cx, 320 + Math.sin(t * 2) * 6, 62, 38, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = withAlpha('#7fe7ff', 0.6);
      ctx.lineWidth = 2;
      ctx.stroke();
      // olho
      ctx.fillStyle = '#ff3355';
      ctx.shadowColor = '#ff3355';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, 320 + Math.sin(t * 2) * 6, 10, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      // feixe de varredura
      ctx.fillStyle = 'rgba(255,51,85,0.10)';
      ctx.beginPath();
      ctx.moveTo(cx, 330);
      ctx.lineTo(cx - 120, 590);
      ctx.lineTo(cx + 120, 590);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'clue': {
      // quadro de pistas
      ctx.fillStyle = 'rgba(3,14,9,0.94)';
      ctx.fillRect(cx - 260, 150, 520, 320);
      ctx.strokeStyle = withAlpha('#6dff9e', 0.45);
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 260, 150, 520, 320);
      // fotos e bilhetes
      const cards = [
        [-180, 190, '#1f6b3a'], [-40, 200, '#2f8a4c'], [110, 185, '#1b5e48'],
        [-150, 330, '#2d4a12'], [20, 320, '#15502a']
      ];
      for (const [ox, oy, col] of cards) {
        ctx.fillStyle = col;
        ctx.fillRect(cx + ox, oy, 110, 80);
        ctx.strokeStyle = 'rgba(220,255,230,0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx + ox, oy, 110, 80);
        ctx.fillStyle = 'rgba(220,255,230,0.16)';
        ctx.fillRect(cx + ox + 10, oy + 12, 90, 4);
        ctx.fillRect(cx + ox + 10, oy + 24, 62, 4);
      }
      // fios vermelhos
      ctx.strokeStyle = 'rgba(255,93,108,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 125, 270);
      ctx.lineTo(cx + 15, 280);
      ctx.lineTo(cx + 165, 265);
      ctx.stroke();
      // pegada gigante
      ctx.save();
      ctx.translate(cx + 150, 420);
      ctx.rotate(-0.3);
      ctx.fillStyle = withAlpha('#6dff9e', 0.55);
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 42, 0, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(-20 + i * 20, -50, 10, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      // lupa
      ctx.strokeStyle = '#c8ffda';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx - 150, 470, 46, 0, TAU);
      ctx.stroke();
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(cx - 116, 504);
      ctx.lineTo(cx - 70, 550);
      ctx.stroke();
      break;
    }
    case 'kennedito': {
      // gaiola
      ctx.fillStyle = 'rgba(3,14,9,0.9)';
      ctx.fillRect(cx - 150, 180, 300, 380);
      ctx.strokeStyle = withAlpha('#6dff9e', 0.5);
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 150, 180, 300, 380);
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = withAlpha('#6dff9e', 0.20);
        ctx.fillRect(cx - 140 + i * 32, 186, 5, 368);
      }
      // criatura
      const bob = Math.sin(t * 2.2) * 5;
      ctx.fillStyle = withAlpha('#b6ff9a', 0.8);
      ctx.beginPath();
      ctx.ellipse(cx, 420 + bob, 54, 44, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - 34, 384 + bob, 16, 0, TAU);
      ctx.arc(cx + 34, 384 + bob, 16, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#0a1410';
      ctx.beginPath();
      ctx.arc(cx - 20, 412 + bob, 7, 0, TAU);
      ctx.arc(cx + 20, 412 + bob, 7, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(cx - 7, 432 + bob, 14, 4);
      // brilho
      ctx.fillStyle = 'rgba(109,255,158,0.12)';
      ctx.beginPath();
      ctx.arc(cx, 420 + bob, 110, 0, TAU);
      ctx.fill();
      // cadeado
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(cx - 16, 520, 32, 26);
      ctx.strokeStyle = '#ffd24d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, 520, 11, Math.PI, TAU);
      ctx.stroke();
      break;
    }
    case 'together': {
      // amanhecer
      const sun = ctx.createRadialGradient(cx, 360, 20, cx, 360, 380);
      sun.addColorStop(0, 'rgba(255,240,170,0.45)');
      sun.addColorStop(0.6, 'rgba(109,255,158,0.16)');
      sun.addColorStop(1, 'rgba(109,255,158,0)');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.fillStyle = '#ffe9a0';
      ctx.beginPath();
      ctx.arc(cx, 380, 90, 0, TAU);
      ctx.fill();
      // VEGA
      ctx.fillStyle = 'rgba(10,26,16,0.9)';
      ctx.beginPath();
      ctx.arc(cx - 80, 330, 34, 0, TAU);
      ctx.fill();
      ctx.fillRect(cx - 118, 364, 76, 150);
      ctx.fillRect(cx - 110, 510, 26, 80);
      ctx.fillRect(cx - 58, 510, 26, 80);
      // Kennedito
      ctx.fillStyle = withAlpha('#b6ff9a', 0.9);
      ctx.beginPath();
      ctx.ellipse(cx + 90, 500, 46, 40, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 58, 466, 15, 0, TAU);
      ctx.arc(cx + 122, 466, 15, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#0a1410';
      ctx.beginPath();
      ctx.arc(cx + 76, 494, 6, 0, TAU);
      ctx.arc(cx + 104, 494, 6, 0, TAU);
      ctx.fill();
      // partículas
      for (let i = 0; i < 16; i++) {
        const px = cx - 240 + ((i * 89 + t * 26) % 480);
        const py = 520 - ((i * 53 + t * 40) % 300);
        ctx.fillStyle = withAlpha(i % 2 ? '#eafff0' : '#9dffbd', 0.5);
        ctx.fillRect(px, py, 3, 3);
      }
      break;
    }
    case 'bossGuardian': {
      ctx.fillStyle = 'rgba(3,12,8,0.55)';
      ctx.fillRect(cx - 270, 120, 540, 430);
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = 'rgba(109,255,158,0.10)';
        ctx.fillRect(cx - 240 + i * 58, 126, 12, 424);
      }
      drawCutsceneBoss(ctx, 'guardian', '#6dff9e', cx, cy + 200, t);
      break;
    }
    case 'bossHunter': {
      for (let i = 0; i < 7; i++) {
        ctx.strokeStyle = withAlpha('#ffd24d', 0.10);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 360 + i * 120, 110);
        ctx.lineTo(cx - 160 + i * 90, 570);
        ctx.stroke();
      }
      drawCutsceneBoss(ctx, 'hunter', '#ffd24d', cx, cy + 200, t);
      break;
    }
    case 'bossBruiser': {
      // placar
      ctx.fillStyle = 'rgba(3,12,8,0.9)';
      ctx.fillRect(cx - 230, 120, 460, 90);
      ctx.strokeStyle = withAlpha('#ff8c42', 0.5);
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 230, 120, 460, 90);
      drawText(ctx, 'CEPK  00 : 00  TÉCNICO', cx, 170, {
        size: 24, align: 'center', color: '#ff8c42', glow: '#ff8c42', glowSize: 10
      });
      drawCutsceneBoss(ctx, 'bruiser', '#ff8c42', cx, cy + 220, t);
      break;
    }
    case 'bossTrickster': {
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = withAlpha('#b18cff', 0.16 - i * 0.03);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy + 40, 150 + i * 54 + Math.sin(t * 2 + i) * 8, 0, TAU);
        ctx.stroke();
      }
      drawCutsceneBoss(ctx, 'trickster', '#b18cff', cx, cy + 200, t);
      break;
    }
    case 'bossDirector': {
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = withAlpha('#ff5d7a', 0.06 + i * 0.015);
        ctx.fillRect(cx - 300 + i * 120, 100, 40, 470);
      }
      drawCutsceneBoss(ctx, 'director', '#ff5d7a', cx, cy + 200, t);
      break;
    }
    case 'bossArena':
    case 'bossArenaFinal': {
      const final = motif === 'bossArenaFinal';
      const col = final ? '#ff5d7a' : '#ffd24d';
      const floorY = cy + 210;
      // chão da arena
      ctx.fillStyle = 'rgba(4,10,7,0.85)';
      ctx.fillRect(cx - 430, floorY, 860, 150);
      ctx.strokeStyle = withAlpha(col, 0.5);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 430, floorY);
      ctx.lineTo(cx + 430, floorY);
      ctx.stroke();
      // faixas de perigo
      for (let i = 0; i < 22; i++) {
        ctx.fillStyle = i % 2 ? withAlpha(col, 0.35) : 'rgba(10,14,10,0.7)';
        ctx.fillRect(cx - 430 + i * 39, floorY + 8, 39, 8);
      }
      // pilares e barras laterais
      for (const side of [-1, 1]) {
        const px = cx + side * 430;
        ctx.fillStyle = '#1a2634';
        ctx.fillRect(px - 14, 150, 28, 440);
        ctx.fillStyle = withAlpha(col, 0.25);
        ctx.fillRect(px - 4, 160, 8, 420);
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = withAlpha(col, 0.12);
          ctx.fillRect(px + side * 22, 180 + i * 62, 10, 46);
        }
      }
      // refletores
      for (let i = 0; i < 3; i++) {
        const lx = cx - 280 + i * 280;
        const sway = Math.sin(t * 0.9 + i * 1.8) * 22;
        ctx.fillStyle = withAlpha(col, 0.10);
        ctx.beginPath();
        ctx.moveTo(lx - 20, 130);
        ctx.lineTo(lx + 20, 130);
        ctx.lineTo(lx + 150 + sway, floorY);
        ctx.lineTo(lx - 150 + sway, floorY);
        ctx.closePath();
        ctx.fill();
      }
      // emblema central
      ctx.strokeStyle = withAlpha(col, 0.8);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, 250, 34 + Math.sin(t * 2) * 3, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, 250, 48, 0.4, 2.7);
      ctx.stroke();
      ctx.fillStyle = withAlpha(col, 0.75);
      ctx.beginPath();
      ctx.moveTo(cx, 228);
      ctx.lineTo(cx + 18, 250);
      ctx.lineTo(cx, 272);
      ctx.lineTo(cx - 18, 250);
      ctx.closePath();
      ctx.fill();
      if (final) {
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = withAlpha('#ff3355', 0.4 + Math.sin(t * 4 + i) * 0.2);
          ctx.fillRect(cx - 36 + i * 30, 310, 18, 6);
        }
      }
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
  const boss = this.cutsceneMode === 'boss';
  const bossCfg = level.bossCfg || null;
  const accent = boss && bossCfg ? bossCfg.color : (boss ? '#ff5d7a' : '#6dff9e');
  const accent2 = boss ? '#ffd24d' : '#7fe7ff';
  const arenaSlide = slide.motif === 'bossArena' || slide.motif === 'bossArenaFinal';
  const portraitSlide = boss && !arenaSlide && String(slide.motif).indexOf('boss') === 0;

  // câmera cinematográfica: push-in lento e tremor sutil no alerta de chefe
  const push = 1 + Math.min(0.035, t * 0.012);
  const shakeX = boss ? Math.sin(t * 41) * 1.4 : 0;
  const shakeY = boss ? Math.cos(t * 37) * 0.9 : 0;
  ctx.save();
  ctx.translate(VIEW_W / 2 + shakeX, VIEW_H / 2 + shakeY);
  ctx.scale(push, push);
  ctx.translate(-VIEW_W / 2, -VIEW_H / 2);

  this.drawCutsceneBackdrop(ctx, level.theme, t);

  if (boss) {
    ctx.fillStyle = 'rgba(42,0,10,0.24)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // eixo de luz central
    const core = ctx.createLinearGradient(VIEW_W / 2, 0, VIEW_W / 2, 640);
    core.addColorStop(0, withAlpha(accent, 0.22));
    core.addColorStop(1, withAlpha(accent, 0));
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.moveTo(VIEW_W / 2 - 34, 0);
    ctx.lineTo(VIEW_W / 2 + 34, 0);
    ctx.lineTo(VIEW_W / 2 + 210, 640);
    ctx.lineTo(VIEW_W / 2 - 210, 640);
    ctx.closePath();
    ctx.fill();

    // holofotes de alerta
    for (let i = 0; i < 3; i++) {
      const bx = 260 + i * 380;
      const sway = Math.sin(t * 0.7 + i * 2.1) * 34;
      const beam = ctx.createLinearGradient(bx, 0, bx + sway, 620);
      beam.addColorStop(0, withAlpha(accent, 0.2));
      beam.addColorStop(1, withAlpha(accent, 0));
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(bx - 14, 0);
      ctx.lineTo(bx + 14, 0);
      ctx.lineTo(bx + sway + 120, 620);
      ctx.lineTo(bx + sway - 120, 620);
      ctx.closePath();
      ctx.fill();
    }

    // linhas de velocidade radiais
    ctx.save();
    ctx.translate(VIEW_W / 2, 340);
    ctx.rotate(t * 0.04);
    for (let i = 0; i < 26; i++) {
      const a = (TAU * i) / 26;
      const r0 = 310 + (i % 3) * 44;
      const r1 = r0 + 90 + Math.abs(Math.sin(t * 2.2 + i)) * 120;
      ctx.strokeStyle = withAlpha(accent, 0.035 + (i % 4) * 0.012);
      ctx.lineWidth = 1 + (i % 2);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 * 0.62);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 * 0.62);
      ctx.stroke();
    }
    ctx.restore();
  }

  // silhueta gigante do chefe nas telas de arena
  if (boss && arenaSlide && bossCfg) {
    const appear = clamp((t - 0.1) / 0.9, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.28 * appear;
    ctx.translate(VIEW_W / 2, 704);
    ctx.scale(1.26, 1.26);
    drawCutsceneBoss(ctx, bossCfg.style, accent, 0, 0, t);
    ctx.restore();
  }

  // retículo de mira nas telas de apresentação do chefe
  if (portraitSlide) {
    const cx = VIEW_W / 2;
    const cy = 340;
    const pulse = 0.5 + Math.sin(t * 3) * 0.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = withAlpha(accent, 0.22 + pulse * 0.2);
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, 184 + pulse * 8, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const bx = sx * 208;
      const by = sy * 208;
      ctx.beginPath();
      ctx.moveTo(bx - sx * 28, by);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx, by - sy * 28);
      ctx.stroke();
    }
    const scanY = Math.sin(t * 1.8) * 150;
    ctx.strokeStyle = withAlpha(accent, 0.25);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-190, scanY);
    ctx.lineTo(190, scanY);
    ctx.stroke();
    ctx.restore();
  }

  // névoa baixa
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const fy = 500 + i * 34;
    const fog = ctx.createLinearGradient(0, fy - 38, 0, fy + 38);
    fog.addColorStop(0, 'rgba(180,220,255,0)');
    fog.addColorStop(0.5, withAlpha(boss ? accent : '#7fe7ff', 0.035));
    fog.addColorStop(1, 'rgba(180,220,255,0)');
    ctx.fillStyle = fog;
    ctx.beginPath();
    ctx.ellipse(VIEW_W / 2 + Math.sin(t * 0.25 + i) * 60, fy, 520, 38, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // motivo do slide com deriva
  const driftX = Math.sin(t * 0.35) * 8;
  const driftY = Math.cos(t * 0.28) * 4;
  ctx.save();
  ctx.translate(driftX, driftY);
  this.drawCutsceneMotif(ctx, slide.motif, t);
  ctx.restore();

  // VEGA em primeiro plano, entrando pela direita
  const heroEase = 1 - Math.pow(1 - clamp(t / 0.6, 0, 1), 3);
  ctx.save();
  ctx.translate(VIEW_W - 208 + (1 - heroEase) * 90, 566);
  ctx.scale(1.24, 1.24);
  drawCutsceneHero(ctx, 0, 0, t, boss ? accent : '#6dff9e');
  ctx.restore();

  // partículas cinematográficas
  ctx.save();
  const pcount = boss ? 46 : 22;
  for (let i = 0; i < pcount; i++) {
    const seed = i * 131.7;
    const px = ((seed + Math.sin(t * 0.6 + i) * 40) % VIEW_W + VIEW_W) % VIEW_W;
    const py = 620 - ((t * (boss ? 38 : 14) + seed) % 460);
    const a = boss
      ? 0.22 + 0.5 * Math.abs(Math.sin(t * 2 + i))
      : 0.08 + 0.12 * Math.abs(Math.sin(t + i));
    ctx.fillStyle = withAlpha(boss ? (i % 3 ? accent : '#ffd24d') : '#9dffbd', a);
    const s = boss ? 2 + (i % 3) : 2;
    ctx.fillRect(px, py, s, s);
  }
  ctx.restore();

  // fade-in e flash de abertura
  const introFade = clamp(1 - t / 0.7, 0, 1);
  if (introFade > 0) {
    ctx.fillStyle = `rgba(2,4,8,${introFade * 0.92})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  const flash = Math.pow(clamp(1 - t / 0.45, 0, 1), 2);
  if (flash > 0.01) {
    ctx.fillStyle = withAlpha(accent, 0.22 * flash);
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  ctx.restore();

  // vinheta
  const vg = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, 240, VIEW_W / 2, VIEW_H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.62)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // grão de filme
  ctx.save();
  ctx.globalAlpha = 0.055;
  for (let i = 0; i < 120; i++) {
    const gx = (i * 97 + Math.floor(t * 60) * 13) % VIEW_W;
    const gy = (i * 53 + Math.floor(t * 60) * 29) % VIEW_H;
    ctx.fillStyle = i % 2 ? '#ffffff' : '#000000';
    ctx.fillRect(gx, gy, 2, 2);
  }
  ctx.restore();

  // letterbox animado
  const ease = 1 - Math.pow(1 - clamp(t / 0.45, 0, 1), 3);
  const topH = Math.max(1, 62 * ease);
  const botH = Math.max(1, 218 * ease);
  ctx.fillStyle = 'rgba(2,8,5,0.94)';
  ctx.fillRect(0, 0, VIEW_W, topH);
  const bgGrad = ctx.createLinearGradient(0, VIEW_H - botH, 0, VIEW_H);
  bgGrad.addColorStop(0, 'rgba(2,8,5,0)');
  bgGrad.addColorStop(0.32, 'rgba(2,8,5,0.9)');
  bgGrad.addColorStop(1, 'rgba(2,8,5,0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, VIEW_H - botH, VIEW_W, botH);

  // faixas de alerta no topo
  if (boss) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, VIEW_W, topH);
    ctx.clip();
    for (let x = -40; x < VIEW_W + 40; x += 48) {
      ctx.fillStyle = withAlpha(accent, 0.1);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 24, 0);
      ctx.lineTo(x + 4, topH);
      ctx.lineTo(x - 20, topH);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // linhas de acento do letterbox
  ctx.fillStyle = withAlpha(accent, 0.24);
  ctx.fillRect(0, topH, VIEW_W, 1);
  ctx.fillRect(0, VIEW_H - 1, VIEW_W, 1);

  drawScanlines(ctx, boss ? 0.14 : 0.1);

  // moldura pulsante no modo chefe
  if (boss) {
    const a = 0.1 + (0.5 + Math.sin(t * 4) * 0.5) * 0.22;
    ctx.strokeStyle = withAlpha(accent, a);
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, VIEW_W - 12, VIEW_H - 12);
  }

  // cantos de visor
  const m = 22;
  const len = 26;
  ctx.strokeStyle = withAlpha(accent, 0.4);
  ctx.lineWidth = 2;
  for (const [sx, sy] of [[m, m], [VIEW_W - m, m], [m, VIEW_H - m], [VIEW_W - m, VIEW_H - m]]) {
    const dx = sx < VIEW_W / 2 ? 1 : -1;
    const dy = sy < VIEW_H / 2 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(sx + dx * len, sy);
    ctx.lineTo(sx, sy);
    ctx.lineTo(sx, sy + dy * len);
    ctx.stroke();
  }

  // cabeçalho
  ctx.fillStyle = withAlpha(boss ? '#ff3355' : accent, 0.45 + Math.abs(Math.sin(t * 4)) * 0.55);
  ctx.fillRect(26, 26, 5, 5);
  drawText(ctx, boss ? 'CEPK // ALERTA DE CHEFE' : 'CEPK // REGISTRO ' + String(this.cutsceneIndex + 1).padStart(2, '0'), 38, 30, {
    size: 11, color: withAlpha(boss ? accent2 : '#b4e6c3', 0.78)
  });
  drawText(ctx, level.name.toUpperCase(), VIEW_W - 34, 30, {
    size: 11, align: 'right', color: 'rgba(180,230,195,0.55)'
  });

  // identificação do alvo no topo
  if (boss && bossCfg) {
    drawText(ctx, 'ALVO PRIORITÁRIO', VIEW_W / 2, 18, {
      size: 8, align: 'center', color: withAlpha(accent2, 0.7)
    });
    drawText(ctx, bossCfg.name, VIEW_W / 2, 38, {
      size: 17, align: 'center', color: '#ffffff', glow: accent, glowSize: 12
    });
  }

  // barra vertical de acento
  ctx.fillStyle = withAlpha(accent, 0.55);
  ctx.fillRect(46, VIEW_H - 205, 2, 150);

  // tag do slide
  if (slide.tag) {
    drawText(ctx, slide.tag, 64, VIEW_H - 198, {
      size: 10, color: withAlpha(accent, 0.9)
    });
  }

  drawText(ctx, slide.title, 64, VIEW_H - 168, {
    size: boss ? 32 : 28, color: '#eafff0', glow: accent, glowSize: boss ? 18 : 14
  });
  ctx.fillStyle = withAlpha(accent, 0.55);
  ctx.fillRect(64, VIEW_H - 157, 72, 3);

  let remaining = Math.floor(this.cutsceneReveal);
  slide.lines.forEach((line, i) => {
    const visible = line.slice(0, Math.max(0, remaining));
    remaining -= line.length + 1;
    drawText(ctx, visible, 64, VIEW_H - 128 + i * 24, {
      size: 14, color: 'rgba(225,248,232,0.88)'
    });
  });

  const total = this.cutsceneText(slide).length;
  const ratio = clamp(this.cutsceneReveal / Math.max(1, total), 0, 1);
  ctx.fillStyle = 'rgba(220,255,230,0.12)';
  ctx.fillRect(64, VIEW_H - 68, 320, 3);
  ctx.fillStyle = accent;
  ctx.fillRect(64, VIEW_H - 68, 320 * ratio, 3);

  if (this.cutsceneReveal >= total) {
    const a = 0.45 + Math.sin(t * 5) * 0.25;
    drawText(ctx, 'ENTER / CLIQUE PARA CONTINUAR', VIEW_W - 64, VIEW_H - 34, {
      size: 11, align: 'right', color: withAlpha(accent2, a)
    });
  } else {
    drawText(ctx, 'ENTER PARA ACELERAR', VIEW_W - 64, VIEW_H - 34, {
      size: 11, align: 'right', color: 'rgba(180,220,195,0.4)'
    });
  }

  // indicador de slides
  const slides = this.cutsceneSlides();
  const dotW = 10;
  const totalDots = slides.length * dotW + (slides.length - 1) * 8;
  for (let i = 0; i < slides.length; i++) {
    const x = VIEW_W / 2 - totalDots / 2 + i * (dotW + 8);
    ctx.fillStyle = i === this.cutsceneIndex ? accent : withAlpha(accent, 0.22);
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


