'use strict';

/* ============================================================
   FERRO-9 — núcleo: constantes, utilidades, input, áudio e FX
   ============================================================ */

const VIEW_W = 1280;
const VIEW_H = 720;
const TILE = 32;
const TAU = Math.PI * 2;

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const approach = (v, target, step) =>
  v < target ? Math.min(v + step, target) : Math.max(v - step, target);
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const dist2 = (x1, y1, x2, y2) => {
  const dx = x2 - x1, dy = y2 - y1;
  return dx * dx + dy * dy;
};

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function circleRect(cx, cy, r, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  return dist2(cx, cy, nx, ny) <= r * r;
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function withAlpha(hex, alpha) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function hexShade(hex, amount) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = clamp(((n >> 16) & 255) + amount, 0, 255);
  const g = clamp(((n >> 8) & 255) + amount, 0, 255);
  const b = clamp((n & 255) + amount, 0, 255);
  return `rgb(${r},${g},${b})`;
}

/* ------------------------------ INPUT ------------------------------ */

const Input = {
  down: new Set(),
  just: new Set(),
  mouse: { x: 0, y: 0, down: false, clicked: false },
  init(canvas) {
    this.canvas = canvas;
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
        e.preventDefault();
      }
      if (!e.repeat) this.just.add(e.code);
      this.down.add(e.code);
      Sfx.unlock();
    });
    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => {
      this.down.clear();
      this.mouse.down = false;
    });

    const updateMouse = (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - r.left) / r.width) * VIEW_W;
      this.mouse.y = ((e.clientY - r.top) / r.height) * VIEW_H;
    };
    canvas.addEventListener('mousemove', updateMouse);
    canvas.addEventListener('mousedown', (e) => {
      updateMouse(e);
      this.mouse.down = true;
      this.mouse.clicked = true;
      Sfx.unlock();
    });
    window.addEventListener('mouseup', () => { this.mouse.down = false; });
  },
  isDown(...codes) {
    for (const c of codes) if (this.down.has(c)) return true;
    return false;
  },
  pressed(...codes) {
    for (const c of codes) if (this.just.has(c)) return true;
    return false;
  },
  clickIn(x, y, w, h) {
    const m = this.mouse;
    return m.clicked && m.x >= x && m.x <= x + w && m.y >= y && m.y <= y + h;
  },
  hoverIn(x, y, w, h) {
    const m = this.mouse;
    return m.x >= x && m.x <= x + w && m.y >= y && m.y <= y + h;
  },
  endFrame() {
    this.just.clear();
    this.mouse.clicked = false;
  }
};

/* ------------------------------ ÁUDIO ------------------------------ */

const Sfx = {
  ctx: null,
  master: null,
  muted: false,
  noiseBuf: null,
  music: { on: false, step: 0, nextTime: 0, tempo: 0.26, root: 55, mode: 0 },

  unlock() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.5;
        this.master.connect(this.ctx.destination);
        const len = this.ctx.sampleRate;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      } catch (err) {
        return;
      }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  },

  tone(freq, dur = 0.12, opts = {}) {
    if (!this.ctx || this.muted) return;
    const { type = 'square', vol = 0.14, slide = 0, delay = 0, attack = 0.005 } = opts;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  },

  noise(dur = 0.2, vol = 0.18, opts = {}) {
    if (!this.ctx || this.muted || !this.noiseBuf) return;
    const { delay = 0, freq = 900, type = 'lowpass' } = opts;
    const t0 = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  },

  startMusic(root = 55, mode = 0) {
    this.music.on = true;
    this.music.root = root;
    this.music.mode = mode;
    this.music.step = 0;
    this.music.nextTime = 0;
  },

  stopMusic() {
    this.music.on = false;
  },

  updateMusic() {
    if (!this.ctx || this.muted || !this.music.on) return;
    const m = this.music;
    if (!m.nextTime) m.nextTime = this.ctx.currentTime + 0.08;
    while (m.nextTime < this.ctx.currentTime + 0.22) {
      const delay = Math.max(0, m.nextTime - this.ctx.currentTime);
      this.playStep(m.step, delay, m.root, m.mode);
      m.step = (m.step + 1) % 32;
      m.nextTime += m.tempo;
    }
  },

  playStep(step, delay, root, mode) {
    const scales = [
      [0, 3, 7, 10, 12, 10, 7, 3],
      [0, 2, 5, 7, 10, 7, 5, 2],
      [0, 3, 5, 7, 10, 12, 10, 7],
      [0, 5, 7, 12, 10, 7, 5, 0],
      [0, 1, 5, 7, 8, 7, 5, 1]
    ];
    const scale = scales[mode % scales.length];
    const beat = step % 8;
    const semi = scale[beat];
    const freq = root * Math.pow(2, semi / 12);
    if (beat === 0 || beat === 4) {
      this.tone(root * 0.5, 0.34, { type: 'triangle', vol: 0.05, delay });
    }
    if (beat % 2 === 0) {
      this.tone(freq * 2, 0.16, { type: 'sine', vol: 0.022, delay });
    }
    if (beat === 6 && Math.random() < 0.5) {
      this.tone(freq * 3, 0.1, { type: 'triangle', vol: 0.012, delay });
    }
  }
};

/* ------------------------------ PARTÍCULAS ------------------------------ */

const FX = {
  list: [],
  max: 900,

  spawn(x, y, opts = {}) {
    if (this.list.length >= this.max) this.list.shift();
    this.list.push({
      x, y,
      vx: opts.vx ?? rand(-60, 60),
      vy: opts.vy ?? rand(-60, 60),
      life: opts.life ?? rand(0.3, 0.7),
      max: 0,
      size: opts.size ?? rand(2, 4),
      color: opts.color ?? '#ffffff',
      gravity: opts.gravity ?? 0,
      drag: opts.drag ?? 0,
      glow: opts.glow !== false,
      shape: opts.shape ?? 'circle'
    });
    const p = this.list[this.list.length - 1];
    p.max = p.life;
  },

  burst(x, y, n, opts = {}) {
    for (let i = 0; i < n; i++) {
      const a = opts.angle ?? rand(0, TAU);
      const spread = opts.spread ?? TAU;
      const ang = a + rand(-spread / 2, spread / 2);
      const spd = rand(opts.speedMin ?? 40, opts.speedMax ?? 240);
      this.spawn(x, y, {
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: rand(opts.lifeMin ?? 0.25, opts.lifeMax ?? 0.8),
        size: rand(opts.sizeMin ?? 2, opts.sizeMax ?? 5),
        color: opts.color ?? '#ffd24d',
        gravity: opts.gravity ?? 0,
        drag: opts.drag ?? 0.9,
        shape: opts.shape ?? 'circle'
      });
    }
  },

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.list.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      if (p.drag) {
        const f = Math.pow(p.drag, dt);
        p.vx *= f;
        p.vy *= f;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  },

  draw(ctx, cam) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.list) {
      const t = clamp(p.life / p.max, 0, 1);
      ctx.globalAlpha = t * (p.glow ? 0.9 : 0.7);
      ctx.fillStyle = p.color;
      const x = p.x - cam.x;
      const y = p.y - cam.y;
      if (p.shape === 'square') {
        ctx.fillRect(x - p.size / 2, y - p.size / 2, p.size, p.size);
      } else if (p.shape === 'line') {
        ctx.fillRect(x - p.size / 2, y - p.size / 2, p.size, p.size * 2.4);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, p.size * (0.5 + t * 0.5), 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  clear() {
    this.list.length = 0;
  }
};

/* --------------------------- COLISÃO COM TILES --------------------------- */

function resolveAxis(body, level, axis) {
  const eps = 0.01;
  const tx0 = Math.floor(body.x / TILE);
  const tx1 = Math.floor((body.x + body.w - eps) / TILE);
  const ty0 = Math.floor(body.y / TILE);
  const ty1 = Math.floor((body.y + body.h - eps) / TILE);

  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      if (level.tile(tx, ty) !== 1) continue;
      const left = tx * TILE, right = left + TILE;
      const top = ty * TILE, bottom = top + TILE;
      if (!(body.x < right && body.x + body.w > left && body.y < bottom && body.y + body.h > top)) continue;

      if (axis === 'x') {
        if (body.vx > 0) {
          body.x = left - body.w;
          body.hitWall = 1;
        } else if (body.vx < 0) {
          body.x = right;
          body.hitWall = -1;
        } else {
          const pushL = right - body.x;
          const pushR = body.x + body.w - left;
          if (pushL < pushR) body.x = right;
          else body.x = left - body.w;
        }
        body.vx = 0;
      } else {
        if (body.vy > 0) {
          body.y = top - body.h;
          body.onGround = true;
        } else if (body.vy < 0) {
          body.y = bottom;
        } else {
          const pushU = bottom - body.y;
          const pushD = body.y + body.h - top;
          if (pushU < pushD) body.y = bottom;
          else {
            body.y = top - body.h;
            body.onGround = true;
          }
        }
        body.vy = 0;
      }
    }
  }
}

function moveBody(body, level, dt) {
  body.onGround = false;
  body.hitWall = 0;

  body.x += body.vx * dt;
  resolveAxis(body, level, 'x');

  body.y += body.vy * dt;
  resolveAxis(body, level, 'y');
}

/* ------------------------------ SAVE ------------------------------ */

const SAVE_KEY = 'ferro9_save_v1';

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    return {
      unlocked: clamp(Number(data.unlocked) || 1, 1, 5),
      powers: Array.isArray(data.powers) ? data.powers : [],
      gears: data.gears || {},
      cores: data.cores || {},
      completed: Array.isArray(data.completed) ? data.completed : []
    };
  } catch (err) {
    return null;
  }
}

function writeSave(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    /* armazenamento indisponível — segue sem salvar */
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    /* ignora */
  }
}
