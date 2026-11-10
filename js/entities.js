'use strict';

/* ============================================================
   FERRO-9 — entidades do jogo
   ============================================================ */

/* ------------------------------ JOGADOR ------------------------------ */

class Player {
  constructor(x, y, game) {
    this.game = game;
    this.w = 26;
    this.h = 40;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.hitWall = 0;
    this.face = 1;
    this.maxHp = 5;
    this.hp = 5;
    this.maxEnergy = 100;
    this.energy = 100;
    this.energyLock = 0;
    this.invuln = 0;
    this.hurtFlash = 0;
    this.coyote = 0;
    this.jumpBuf = 0;
    this.anim = 0;
    this.superTimer = 0;
    this.attract = false;
    this.repel = false;
    this.shield = false;
    this.dead = false;
    this.deadTimer = 0;
    this.magnetSfx = 0;
    this.landSquash = 0;
    this.prevVy = 0;
    this.attackCd = 0;
    this.attackTimer = 0;
    this.shotCd = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.recoil = 0;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get bottom() { return this.y + this.h; }
  get superActive() { return this.superTimer > 0; }

  magnetRange() {
    return 205 * (this.superActive ? 1.35 : 1);
  }

  update(dt) {
    const game = this.game;

    if (this.dead) {
      this.deadTimer -= dt;
      if (this.deadTimer <= 0) game.respawn();
      return;
    }

    this.invuln = Math.max(0, this.invuln - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.energyLock = Math.max(0, this.energyLock - dt);
    this.landSquash = Math.max(0, this.landSquash - dt * 4);
    this.superTimer = Math.max(0, this.superTimer - dt);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.shotCd = Math.max(0, this.shotCd - dt);
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    this.recoil = Math.max(0, this.recoil - dt);
    if (this.comboTimer <= 0) this.combo = 0;

    /* ------- movimento ------- */
    const left = Input.isDown('ArrowLeft', 'KeyA');
    const right = Input.isDown('ArrowRight', 'KeyD');
    const running = Input.isDown('ShiftLeft', 'ShiftRight');
    const superOn = this.superActive;
    const maxSpeed = (running ? 340 : 222) * (superOn ? 1.22 : 1);
    const accel = this.onGround ? 3300 : 2300;

    if (left && !right) {
      this.vx -= accel * dt;
      this.face = -1;
    } else if (right && !left) {
      this.vx += accel * dt;
      this.face = 1;
    } else {
      this.vx = approach(this.vx, 0, (this.onGround ? 3000 : 520) * dt);
    }
    this.vx = clamp(this.vx, -maxSpeed, maxSpeed);

    /* ------- pulo ------- */
    const jumpDown = Input.isDown('Space', 'KeyW', 'ArrowUp');
    if (Input.pressed('Space', 'KeyW', 'ArrowUp')) this.jumpBuf = 0.13;
    this.jumpBuf -= dt;

    if (this.onGround) this.coyote = 0.1;
    else this.coyote -= dt;

    if (this.jumpBuf > 0 && this.coyote > 0) {
      this.vy = superOn ? -1000 : -642;
      this.jumpBuf = 0;
      this.coyote = 0;
      this.onGround = false;
      this.landSquash = 0.2;
      Sfx.tone(superOn ? 330 : 215, 0.16, { type: 'square', vol: 0.1, slide: superOn ? 340 : 130 });
      FX.burst(this.cx, this.bottom, superOn ? 14 : 7, {
        color: superOn ? '#ffd24d' : '#9fc7ff',
        speedMax: 180,
        lifeMax: 0.5,
        gravity: 500
      });
    }
    if (!jumpDown && this.vy < -220) this.vy = -220;

    const gravity = 1980 * (this.vy > 0 ? 1.12 : 1);
    this.vy = Math.min(this.vy + gravity * dt, 1050);

    /* ------- poderes ------- */
    const powers = game.powers;
    const hasEnergy = this.energy > 0 && this.energyLock <= 0;

    this.attract = powers.has('attract') && hasEnergy && Input.isDown('KeyQ', 'Digit1');
    this.repel = powers.has('repel') && hasEnergy && Input.isDown('KeyE', 'Digit2');
    this.shield = powers.has('shield') && hasEnergy && Input.isDown('KeyR', 'Digit3');

    let drain = 0;
    if (this.attract) drain += 16;
    if (this.repel) drain += 14;
    if (this.shield) drain += 27;

    if (Input.pressed('KeyF', 'Digit4') && powers.has('super') && this.energy >= 30 && this.superTimer <= 0) {
      this.energy -= 30;
      this.superTimer = 6;
      game.toast('SUPERCARGA ATIVADA', '#ffd24d');
      game.shake(0.35);
      Sfx.tone(180, 0.4, { type: 'sawtooth', vol: 0.12, slide: 620 });
      FX.burst(this.cx, this.cy, 26, {
        color: '#ffd24d', speedMax: 320, lifeMax: 0.8, sizeMax: 6
      });
    }

    /* ------- combate ------- */
    const meleePressed = Input.pressed('KeyJ') || Input.mouse.clicked;
    if (meleePressed && this.attackCd <= 0) this.meleeAttack(game);

    const shotPressed = Input.pressed('KeyK') || Input.mouse.rightClicked;
    if (shotPressed && this.shotCd <= 0) this.shootBolt(game);

    if (drain > 0) {
      this.energy = Math.max(0, this.energy - drain * dt);
      if (this.energy <= 0) {
        this.energyLock = 0.8;
        this.attract = this.repel = this.shield = false;
      }
    } else {
      const regen = game.diff ? game.diff.energyRegen : 1;
      this.energy = Math.min(this.maxEnergy, this.energy + 11 * regen * dt);
    }

    /* ------- som contínuo dos ímãs ------- */
    if (this.attract || this.repel) {
      this.magnetSfx -= dt;
      if (this.magnetSfx <= 0) {
        this.magnetSfx = 0.16;
        Sfx.tone(this.attract ? 150 : 110, 0.12, {
          type: 'sine', vol: 0.03, slide: this.attract ? 60 : -40
        });
      }
    }

    /* ------- física ------- */
    this.prevVy = this.vy;
    moveBody(this, game.level, dt);

    for (const c of game.crates) this.collideCrate(c);

    /* ------- perigos ------- */
    if (game.level.hazardRect(this.x + 4, this.y + 4, this.w - 8, this.h - 8)) {
      this.hurt(2);
      this.vy = -470;
      if (this.vx === 0) this.vx = -this.face * 120;
    }

    if (this.y > game.level.heightPx + 140) game.killPlayer();

    if (this.onGround) {
      this.anim += Math.abs(this.vx) * dt * 0.045;
      if (this.prevVy > 620) {
        this.landSquash = 0.35;
        FX.burst(this.cx, this.bottom, 6, {
          color: '#9fc7ff', speedMax: 90, lifeMax: 0.35, gravity: 300
        });
      }
    } else {
      this.anim += dt * 2;
    }
  }

  meleeAttack(game) {
    this.attackCd = 0.34;
    this.attackTimer = 0.2;
    this.combo = this.comboTimer > 0 ? Math.min(3, this.combo + 1) : 1;
    this.comboTimer = 0.9;

    const reach = 54 + (this.combo === 3 ? 8 : 0);
    const box = {
      x: this.face > 0 ? this.x + this.w - 6 : this.x - reach + 6,
      y: this.y + 2,
      w: reach,
      h: this.h - 4
    };
    const baseDamage = 2 + (this.combo === 3 ? 2 : 0) + (this.superActive ? 2 : 0);
    const bossDamage = 4 + (this.combo === 3 ? 2 : 0) + (this.superActive ? 2 : 0);
    let hit = false;

    for (const e of game.enemies) {
      if (e.dead || !aabb(box, e)) continue;
      e.hurt(baseDamage, game);
      const dir = Math.sign((e.x + e.w / 2) - this.cx) || this.face;
      e.mx = clamp((e.mx || 0) + dir * 440, -720, 720);
      e.my = clamp((e.my || 0) - 180, -720, 720);
      hit = true;
    }

    if (game.boss && !game.boss.dead && aabb(box, game.boss)) {
      game.boss.takeDamage(bossDamage, game);
      hit = true;
    }

    for (const c of game.crates) {
      if (!aabb(box, c)) continue;
      c.vx += this.face * 320;
      c.vy = Math.min(c.vy, -140);
      c.magnetTimer = 0.25;
      c.glow = 1;
      hit = true;
    }

    for (const pr of game.projectiles) {
      if (pr.dead || pr.owner !== 'enemy') continue;
      if (!circleRect(pr.x, pr.y, pr.r, box)) continue;
      pr.owner = 'player';
      pr.color = '#66e0ff';
      pr.damage = 2;
      pr.bossDamage = 5;
      pr.vx = -pr.vx * 1.15;
      pr.vy = -pr.vy * 1.15;
      pr.life = 4;
      hit = true;
    }

    const sx = this.face > 0 ? this.x + this.w + 8 : this.x - 8;
    FX.burst(sx, this.y + this.h * 0.45, hit ? 12 : 6, {
      color: this.combo === 3 ? '#ffd24d' : '#7fe7ff',
      speedMax: hit ? 260 : 140,
      lifeMax: 0.4,
      shape: 'line'
    });
    Sfx.tone(this.combo === 3 ? 300 : 240, 0.08, {
      type: 'square', vol: 0.07, slide: this.combo === 3 ? 240 : 90
    });
    if (hit) {
      game.shake(0.16 + this.combo * 0.03);
      Sfx.noise(0.08, 0.06, { freq: 1100 });
    }
  }

  shootBolt(game) {
    this.shotCd = 0.3;
    if (this.energy < 8) {
      this.shotCd = 0.24;
      game.toast('ENERGIA INSUFICIENTE', '#ff8fa5', 0.9);
      Sfx.tone(120, 0.08, { type: 'square', vol: 0.04, slide: -40 });
      return;
    }
    this.energy -= 8;
    this.recoil = 0.12;
    const dir = this.face;
    const px = this.cx + dir * 22;
    const py = this.cy - 2;
    game.projectiles.push(new Projectile(px, py, dir * 780, 0, 'player', {
      color: '#7fe7ff',
      r: 6,
      damage: 2,
      bossDamage: 4,
      life: 1.1
    }));
    Sfx.tone(620, 0.08, { type: 'square', vol: 0.06, slide: 220 });
    FX.burst(px, py, 7, {
      color: '#7fe7ff', speedMax: 180, lifeMax: 0.3, angle: dir > 0 ? 0 : Math.PI, spread: 0.9
    });
  }

  collideCrate(c) {
    if (!aabb(this, c)) return;

    const penetration = this.y + this.h - c.y;
    if (this.vy >= 0 && this.y < c.y && penetration > 0 && penetration < 26) {
      this.y = c.y - this.h;
      this.vy = 0;
      this.onGround = true;
      return;
    }

    if (this.cx < c.x + c.w / 2) {
      this.x = c.x - this.w;
      this.vx = Math.min(0, this.vx);
    } else {
      this.x = c.x + c.w;
      this.vx = Math.max(0, this.vx);
    }
  }

  hurt(amount, sourceX = null) {
    if (this.dead || this.invuln > 0) return;
    if (this.shield) {
      FX.burst(this.cx, this.cy, 8, { color: '#b57bff', speedMax: 160, lifeMax: 0.4 });
      Sfx.tone(420, 0.1, { type: 'sine', vol: 0.06, slide: -120 });
      return;
    }
    const diff = this.game.diff;
    if (diff && diff.dmg !== 1) amount = Math.max(1, Math.round(amount * diff.dmg));
    this.hp -= amount;
    this.invuln = 1.25;
    this.hurtFlash = 0.25;
    this.game.shake(0.45);
    Sfx.tone(120, 0.22, { type: 'sawtooth', vol: 0.16, slide: -70 });
    Sfx.noise(0.16, 0.12, { freq: 700 });
    FX.burst(this.cx, this.cy, 14, {
      color: '#ff5d6c', speedMax: 260, lifeMax: 0.6, gravity: 500
    });
    if (sourceX !== null) {
      this.vx = this.cx < sourceX ? -260 : 260;
      this.vy = -320;
    }
    if (this.hp <= 0) {
      this.hp = 0;
      this.game.killPlayer();
    }
  }

  render(ctx, cam) {
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    if (this.dead) return;

    ctx.save();
    if (this.invuln > 0 && Math.floor(this.invuln * 24) % 2 === 0) ctx.globalAlpha = 0.4;

    const walk = this.onGround && Math.abs(this.vx) > 30 ? Math.sin(this.anim * 14) * 3 : 0;
    const squash = 1 - this.landSquash * 0.12;

    // sombra
    ctx.globalAlpha *= 0.9;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x + this.w / 2, y + this.h + 3, 16, 5, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = this.invuln > 0 && Math.floor(this.invuln * 24) % 2 === 0 ? 0.4 : 1;

    // pernas
    ctx.fillStyle = '#6d7a92';
    ctx.fillRect(x + 3, y + 28 + walk, 7, 12 - walk);
    ctx.fillRect(x + 16, y + 28 - walk, 7, 12 + walk);
    ctx.fillStyle = '#3b4559';
    ctx.fillRect(x + 2, y + 38 + walk, 9, 4);
    ctx.fillRect(x + 15, y + 38 - walk, 9, 4);

    // corpo
    const grad = ctx.createLinearGradient(x, y + 10, x, y + 30);
    grad.addColorStop(0, '#d7e2f2');
    grad.addColorStop(1, '#8b99b0');
    ctx.fillStyle = grad;
    roundRect(ctx, x + 1, y + 10, this.w - 2, 20 * squash, 5);
    ctx.fill();
    ctx.strokeStyle = '#3c465a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // braços
    ctx.fillStyle = '#aab8cc';
    roundRect(ctx, x - 4, y + 14, 6, 13, 3);
    ctx.fill();
    roundRect(ctx, x + this.w - 2, y + 14, 6, 13, 3);
    ctx.fill();

    // cabeça
    ctx.fillStyle = '#c7d3e6';
    roundRect(ctx, x + 2, y, this.w - 4, 14, 4);
    ctx.fill();
    ctx.strokeStyle = '#3c465a';
    ctx.stroke();

    // visor
    ctx.fillStyle = '#15202f';
    roundRect(ctx, x + 4, y + 3, this.w - 8, 7, 3);
    ctx.fill();
    const eyeColor = this.superActive ? '#ffd24d' : '#7fe7ff';
    ctx.fillStyle = eyeColor;
    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 10;
    const eyeX = this.face > 0 ? x + this.w - 10 : x + 6;
    ctx.fillRect(eyeX, y + 5, 4, 3);
    ctx.shadowBlur = 0;

    // antena
    ctx.strokeStyle = '#8b99b0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + this.w / 2, y);
    ctx.lineTo(x + this.w / 2 + this.face * 3, y - 7);
    ctx.stroke();
    ctx.fillStyle = '#ff8c42';
    ctx.beginPath();
    ctx.arc(x + this.w / 2 + this.face * 3, y - 8, 2.5, 0, TAU);
    ctx.fill();

    // núcleo no peito
    const coreColor = this.attract ? '#4da6ff' : this.repel ? '#ff5d6c' : this.shield ? '#b57bff' : '#7fe7ff';
    ctx.fillStyle = coreColor;
    ctx.shadowColor = coreColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(x + this.w / 2, y + 20, 4.5, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    /* ------- auras ------- */
    const t = performance.now() / 1000;
    if (this.attract || this.repel) {
      const color = this.attract ? '#4da6ff' : '#ff5d6c';
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const rr = 34 + i * 11 + Math.sin(t * 8 + i) * 3;
        ctx.beginPath();
        ctx.arc(x + this.w / 2, y + 20, rr, t * (this.attract ? 3 : -3) + i * 1.4, t * (this.attract ? 3 : -3) + i * 1.4 + 1.5);
        ctx.stroke();
      }
      ctx.globalAlpha = this.invuln > 0 && Math.floor(this.invuln * 24) % 2 === 0 ? 0.4 : 1;
    }

    if (this.shield) {
      const rr = 52 + Math.sin(t * 5) * 3;
      const g = ctx.createRadialGradient(x + this.w / 2, y + 20, rr * 0.4, x + this.w / 2, y + 20, rr);
      g.addColorStop(0, 'rgba(181,123,255,0)');
      g.addColorStop(0.75, 'rgba(181,123,255,0.12)');
      g.addColorStop(1, 'rgba(181,123,255,0.55)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x + this.w / 2, y + 20, rr, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(210,180,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + this.w / 2, y + 20, rr, 0, TAU);
      ctx.stroke();
    }

    if (this.superActive) {
      ctx.strokeStyle = '#ffd24d';
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = t * 6 + i * 1.7;
        const rr = 24 + Math.sin(t * 9 + i) * 8;
        ctx.beginPath();
        ctx.arc(x + this.w / 2, y + 20, rr, a, a + 0.5);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    if (this.attackTimer > 0) {
      const prog = 1 - this.attackTimer / 0.2;
      const cx = x + this.w / 2;
      const cy = y + 20;
      const color = this.combo === 3 ? '#ffd24d' : '#7fe7ff';
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.max(0, 1 - prog) * 0.95;
      ctx.strokeStyle = color;
      ctx.lineWidth = 5 - prog * 2;
      const base = this.face > 0 ? -1.1 : Math.PI - 1.1;
      ctx.beginPath();
      ctx.arc(cx, cy, 32 + prog * 20, base + prog * 1.4, base + 1.5 + prog * 1.4);
      ctx.stroke();
      ctx.globalAlpha *= 0.5;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 24 + prog * 16, base + prog * 1.4, base + 1.5 + prog * 1.4);
      ctx.stroke();
      ctx.restore();
    }

    if (this.recoil > 0) {
      const mx = x + (this.face > 0 ? this.w + 10 : -10);
      const my = y + 19;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = this.recoil / 0.12;
      ctx.fillStyle = '#7fe7ff';
      ctx.shadowColor = '#7fe7ff';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(mx, my, 7, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    if (this.hurtFlash > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = this.hurtFlash * 2;
      ctx.fillStyle = '#ff5d6c';
      roundRect(ctx, x - 2, y - 2, this.w + 4, this.h + 4, 6);
      ctx.fill();
    }

    ctx.restore();
  }
}

/* ------------------------------ CAIXA DE METAL ------------------------------ */

class Crate {
  constructor(x, y) {
    this.w = 30;
    this.h = 30;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.hitWall = 0;
    this.magnetTimer = 0;
    this.glow = 0;
    this.spin = 0;
  }

  update(dt, game) {
    this.magnetTimer = Math.max(0, this.magnetTimer - dt);
    this.glow = Math.max(0, this.glow - dt * 3);

    this.vy = Math.min(this.vy + 1900 * dt, 1000);
    this.vx = clamp(this.vx, -560, 560);
    this.vy = clamp(this.vy, -560, 1000);

    moveBody(this, game.level, dt);

    if (this.onGround && this.magnetTimer <= 0) {
      this.vx = approach(this.vx, 0, 1500 * dt);
      if (Math.abs(this.vx) < 4) this.vx = 0;
    }
    if (this.onGround && this.vy > 0) this.vy = 0;

    if (this.y > game.level.heightPx + 160) {
      this.dead = true;
    }
    this.spin += this.vx * dt * 0.01;
  }

  render(ctx, cam) {
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 32, 16, 4, 0, 0, TAU);
    ctx.fill();

    const g = ctx.createLinearGradient(x, y, x + 30, y + 30);
    g.addColorStop(0, '#9aa8bc');
    g.addColorStop(0.5, '#6f7d92');
    g.addColorStop(1, '#4a5568');
    ctx.fillStyle = g;
    roundRect(ctx, x, y, 30, 30, 4);
    ctx.fill();
    ctx.strokeStyle = '#2e3646';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(200,220,245,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + 26, y + 26);
    ctx.moveTo(x + 26, y + 4);
    ctx.lineTo(x + 4, y + 26);
    ctx.stroke();

    ctx.fillStyle = '#c9d6e8';
    for (const [rx, ry] of [[4, 4], [23, 4], [4, 23], [23, 23]]) {
      ctx.beginPath();
      ctx.arc(x + rx + 1.5, y + ry + 1.5, 1.6, 0, TAU);
      ctx.fill();
    }

    if (this.glow > 0) {
      const color = this.glow > 0.5 ? '#4da6ff' : '#ff5d6c';
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.4 + this.glow * 0.4;
      ctx.lineWidth = 2;
      roundRect(ctx, x - 2, y - 2, 34, 34, 5);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* ------------------------------ INIMIGOS ------------------------------ */

class Walker {
  constructor(x, y, game) {
    const diff = (game && game.diff) || DIFFICULTIES[1];
    this.game = game;
    this.w = 34;
    this.h = 30;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.vx = -70;
    this.vy = 0;
    this.mx = 0;
    this.my = 0;
    this.onGround = false;
    this.hitWall = 0;
    this.dir = -1;
    this.hp = Math.max(1, Math.round(2 * diff.enemyHp));
    this.maxHp = this.hp;
    this.speed = 70 * diff.enemySpeed;
    this.aggro = diff.aggression;
    this.flash = 0;
    this.dead = false;
    this.anim = 0;
    this.state = 'patrol';
    this.stateTimer = 0;
    this.attackCd = rand(1.2, 2.2);
    this.alerted = false;
  }

  update(dt, game) {
    if (this.dead) return;
    this.flash = Math.max(0, this.flash - dt);
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.stateTimer = Math.max(0, this.stateTimer - dt);
    this.mx *= Math.pow(0.05, dt);
    this.my *= Math.pow(0.05, dt);

    this.vy = Math.min(this.vy + 1900 * dt, 1000);

    const p = game.player;
    const dx = p ? p.cx - (this.x + this.w / 2) : 0;
    const dy = p ? p.cy - (this.y + this.h / 2) : 0;
    const d = p ? Math.hypot(dx, dy) : 9999;
    this.alerted = !!p && !p.dead && d < 360;

    if (this.state === 'patrol') {
      this.vx = this.dir * this.speed + this.mx;
      if (this.alerted) {
        this.state = 'chase';
        this.dir = dx > 0 ? 1 : -1;
      }
    } else if (this.state === 'chase') {
      if (!this.alerted) {
        this.state = 'patrol';
        this.vx = this.dir * this.speed + this.mx;
      } else {
        this.dir = dx > 0 ? 1 : -1;
        this.vx = this.dir * this.speed * 1.7 + this.mx;
        if (d < 125 && Math.abs(dy) < 82 && this.attackCd <= 0) {
          this.state = 'windup';
          this.stateTimer = 0.34 / this.aggro;
          this.vx = 0;
          Sfx.tone(150, 0.12, { type: 'sawtooth', vol: 0.05, slide: 80 });
          FX.burst(this.x + this.w / 2, this.y + this.h / 2, 5, {
            color: '#ff5a3c', speedMax: 80, lifeMax: 0.3
          });
        }
      }
    } else if (this.state === 'windup') {
      this.vx = approach(this.vx, 0, 3000 * dt);
      if (this.stateTimer <= 0) {
        this.state = 'lunge';
        this.stateTimer = 0.3;
        this.vx = this.dir * 480;
        this.attackCd = 2.4 / this.aggro;
        Sfx.tone(220, 0.1, { type: 'square', vol: 0.06, slide: -80 });
      }
    } else if (this.state === 'lunge') {
      this.vx = approach(this.vx, this.dir * 480, 1400 * dt);
      if (this.stateTimer <= 0) {
        this.state = 'recover';
        this.stateTimer = 0.42;
      }
    } else if (this.state === 'recover') {
      this.vx = approach(this.vx, 0, 2400 * dt);
      if (this.stateTimer <= 0) this.state = this.alerted ? 'chase' : 'patrol';
    }

    this.vy += this.my;
    const speed = Math.abs(this.mx);
    moveBody(this, game.level, dt);

    if (this.hitWall) {
      if (speed > 250) this.hurt(1, game);
      if (this.state === 'lunge') {
        this.state = 'recover';
        this.stateTimer = 0.35;
        game.shake(0.14);
        FX.burst(this.x + this.w / 2, this.y + this.h / 2, 8, {
          color: '#ffb066', speedMax: 160, lifeMax: 0.4
        });
      }
      this.dir *= -1;
      this.mx = 0;
      this.vx = 0;
    }

    if (this.onGround) {
      const aheadX = this.dir > 0 ? this.x + this.w + 4 : this.x - 4;
      if (!game.level.isSolid(aheadX, this.y + this.h + 8)) {
        if (this.state === 'patrol') this.dir *= -1;
        else this.vx = 0;
      }
    }

    if (game.level.hazardRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4)) {
      this.hurt(3, game);
    }

    if (p && !p.dead && aabb(this, p)) {
      const dmg = this.state === 'lunge' ? 2 : 1;
      p.hurt(dmg, this.x + this.w / 2);
      if (this.state === 'lunge') {
        this.state = 'recover';
        this.stateTimer = 0.3;
        this.vx *= -0.25;
      }
    }

    if (this.y > game.level.heightPx + 120) {
      this.dead = true;
    }
    this.anim += dt * (2 + Math.abs(this.vx) * 0.02);
  }

  hurt(n, game) {
    if (this.dead) return;
    this.hp -= n;
    this.flash = 0.15;
    FX.burst(this.x + this.w / 2, this.y + this.h / 2, 6, {
      color: '#ffb066', speedMax: 160, lifeMax: 0.4
    });
    if (this.hp <= 0) {
      this.dead = true;
      game.onEnemyKilled(this);
    }
  }

  render(ctx, cam) {
    if (this.dead) return;
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    const bob = Math.sin(this.anim * 6) * 1.5;
    const charging = this.state === 'windup';
    const lunging = this.state === 'lunge';

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 17, y + 31, 16, 4, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = this.flash > 0 ? '#ffffff' : charging ? '#c0392b' : '#8a4b2a';
    roundRect(ctx, x + 2, y + 8 + bob, 30, 18, 5);
    ctx.fill();
    ctx.strokeStyle = '#4a2414';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#c9d6e8';
    ctx.fillRect(x + 5, y + 26, 8, 4);
    ctx.fillRect(x + 21, y + 26, 8, 4);

    ctx.fillStyle = '#2a1a12';
    roundRect(ctx, x + 7, y + 12 + bob, 20, 8, 3);
    ctx.fill();
    ctx.fillStyle = charging ? '#ff2d4a' : '#ff5a3c';
    ctx.shadowColor = charging ? '#ff2d4a' : '#ff5a3c';
    ctx.shadowBlur = charging ? 16 : 8;
    ctx.fillRect(this.dir > 0 ? x + 21 : x + 9, y + 14 + bob, 5, 4);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#4a2414';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 17, y + 8 + bob);
    ctx.lineTo(x + 17, y + 2 + bob);
    ctx.stroke();
    ctx.fillStyle = '#ffb066';
    ctx.beginPath();
    ctx.arc(x + 17, y + 2 + bob, 2, 0, TAU);
    ctx.fill();

    if (charging) {
      ctx.fillStyle = '#ff5d6c';
      ctx.shadowColor = '#ff2d4a';
      ctx.shadowBlur = 12;
      ctx.font = 'bold 18px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x + 17, y - 14 + bob);
      ctx.shadowBlur = 0;
    } else if (lunging) {
      ctx.strokeStyle = 'rgba(255,90,60,0.55)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const tx = x + 17 - this.dir * (22 + i * 9);
        ctx.beginPath();
        ctx.moveTo(tx, y + 12 + i * 6);
        ctx.lineTo(tx - this.dir * 12, y + 12 + i * 6);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

class Drone {
  constructor(x, y, game) {
    const diff = (game && game.diff) || DIFFICULTIES[1];
    this.game = game;
    this.w = 36;
    this.h = 26;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.homeX = this.x;
    this.homeY = this.y;
    this.vx = 0;
    this.vy = 0;
    this.mx = 0;
    this.my = 0;
    this.onGround = false;
    this.hitWall = 0;
    this.hp = Math.max(1, Math.round(2 * diff.enemyHp));
    this.maxHp = this.hp;
    this.projSpeed = 300 * diff.projSpeed;
    this.burstCount = diff.burst;
    this.aggro = diff.aggression;
    this.flash = 0;
    this.dead = false;
    this.phase = rand(0, TAU);
    this.shootTimer = rand(1.2, 2.4) / this.aggro;
    this.mode = 'hover';
    this.aimTimer = 0;
    this.burstLeft = 0;
    this.burstTimer = 0;
    this.strafe = Math.random() < 0.5 ? -1 : 1;
    this.orbit = rand(0, TAU);
    this.muzzle = 0;
  }

  update(dt, game) {
    if (this.dead) return;
    this.flash = Math.max(0, this.flash - dt);
    this.phase += dt * 2;
    this.mx *= Math.pow(0.06, dt);
    this.my *= Math.pow(0.06, dt);
    this.shootTimer -= dt;
    this.aimTimer -= dt;
    this.burstTimer -= dt;
    this.muzzle = Math.max(0, this.muzzle - dt);
    this.orbit += dt * 1.2 * this.strafe;

    const p = game.player;
    let tx = this.homeX + Math.sin(this.phase * 0.7) * 30;
    let ty = this.homeY + Math.sin(this.phase) * 18;
    let d = 9999;

    if (p && !p.dead) {
      const cx = this.x + this.w / 2;
      const cy = this.y + this.h / 2;
      d = dist(cx, cy, p.cx, p.cy);
      if (d < 470) {
        const ang = Math.atan2(cy - p.cy, cx - p.cx) + Math.sin(this.orbit) * 0.55;
        tx = lerp(tx, p.cx + Math.cos(ang) * 155 - this.w / 2, 0.35);
        ty = lerp(ty, p.cy + Math.sin(ang) * 120 - this.h / 2, 0.3);
      }
      if (d < 540 && this.mode === 'hover' && this.shootTimer <= 0) {
        this.mode = 'aim';
        this.aimTimer = 0.42 / this.aggro;
        Sfx.tone(700, 0.08, { type: 'square', vol: 0.03, slide: 120 });
      }
    }

    if (this.mode === 'aim') {
      if (this.aimTimer <= 0) {
        this.mode = 'fire';
        this.burstLeft = this.burstCount;
        this.burstTimer = 0;
      }
    } else if (this.mode === 'fire') {
      if (this.burstTimer <= 0) {
        this.fire(game);
        this.burstLeft--;
        this.burstTimer = 0.11;
        if (this.burstLeft <= 0) {
          this.mode = 'hover';
          this.shootTimer = rand(1.9, 3.0) / this.aggro;
        }
      }
    }

    const moveScale = this.mode === 'aim' ? 0.35 : 1;
    const targetVx = clamp((tx - this.x) * 2.2, -150, 150) * moveScale + this.mx;
    const targetVy = clamp((ty - this.y) * 2.2, -150, 150) * moveScale + this.my;
    this.vx = targetVx;
    this.vy = targetVy;

    const speed = Math.hypot(this.mx, this.my);
    moveBody(this, game.level, dt);

    if (this.hitWall) {
      if (speed > 230) this.hurt(1, game);
      this.mx = 0;
    }

    if (p && !p.dead && aabb(this, p)) p.hurt(1, this.x + this.w / 2);
    if (this.y > game.level.heightPx + 120) this.dead = true;
  }

  fire(game) {
    const p = game.player;
    if (!p || p.dead) return;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const lead = 0.14;
    const ang = Math.atan2((p.cy + p.vy * lead) - cy, (p.cx + p.vx * lead) - cx);
    const a = ang + (Math.random() - 0.5) * 0.06;
    const spd = this.projSpeed;
    game.projectiles.push(new Projectile(cx, cy, Math.cos(a) * spd, Math.sin(a) * spd, 'enemy', {
      color: '#ff5a6e', r: 6, damage: 1
    }));
    this.muzzle = 0.12;
    Sfx.tone(520, 0.07, { type: 'square', vol: 0.045, slide: -160 });
    FX.burst(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12, 4, {
      color: '#ff5a6e', speedMax: 110, lifeMax: 0.25
    });
  }

  hurt(n, game) {
    if (this.dead) return;
    this.hp -= n;
    this.flash = 0.15;
    FX.burst(this.x + this.w / 2, this.y + this.h / 2, 6, {
      color: '#7ffff0', speedMax: 180, lifeMax: 0.4
    });
    if (this.hp <= 0) {
      this.dead = true;
      game.onEnemyKilled(this);
    }
  }

  render(ctx, cam) {
    if (this.dead) return;
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    const bob = Math.sin(this.phase) * 2;
    const alert = this.mode === 'aim' || this.mode === 'fire';
    const eye = alert ? '#ff5a6e' : '#7ffff0';

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + 18, y + 40, 14, 4, 0, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = 'rgba(127,255,240,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 6 + bob);
    ctx.lineTo(x + 30, y + 6 + bob);
    ctx.stroke();

    ctx.fillStyle = this.flash > 0 ? '#ffffff' : '#2f5f66';
    roundRect(ctx, x + 3, y + 7 + bob, 30, 15, 6);
    ctx.fill();
    ctx.strokeStyle = '#123a40';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = eye;
    ctx.shadowColor = eye;
    ctx.shadowBlur = alert ? 18 : 12;
    ctx.beginPath();
    ctx.arc(x + 18, y + 14 + bob, 4, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0b262b';
    ctx.fillRect(x + 1, y + 10 + bob, 3, 10);
    ctx.fillRect(x + 32, y + 10 + bob, 3, 10);

    if (this.mode === 'aim' && this.game && this.game.player && !this.game.player.dead) {
      const p = this.game.player;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,90,110,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 7]);
      ctx.lineDashOffset = -this.phase * 20;
      ctx.beginPath();
      ctx.moveTo(x + 18, y + 14 + bob);
      ctx.lineTo(p.cx - cam.x, p.cy - cam.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    if (this.muzzle > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = this.muzzle / 0.12;
      ctx.fillStyle = '#ff5a6e';
      ctx.shadowColor = '#ff5a6e';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(x + 18, y + 15 + bob, 9, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

/* ------------------------------ CHEFE ------------------------------ */

class Boss {
  constructor(x, y, cfg, game) {
    this.game = game;
    this.cfg = cfg;
    this.w = cfg.w || 120;
    this.h = cfg.h || 132;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.hitWall = 0;
    const diff = (game && game.diff) || DIFFICULTIES[1];
    this.maxHp = Math.max(1, Math.round(cfg.hp * diff.bossHp));
    this.hp = this.maxHp;
    this.speed = (cfg.speed || 70) * diff.enemySpeed;
    this.aggro = diff.aggression;
    this.color = cfg.color || '#ff8c42';
    this.state = 'idle';
    this.timer = 1.4;
    this.phase = 1;
    this.active = false;
    this.dead = false;
    this.deathTimer = 0;
    this.flash = 0;
    this.dir = 1;
    this.anim = 0;
    this.summoned = 0;
    this.explosionTimer = 0;
    this.attackCycle = 0;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  begin(state, timer) {
    this.state = state;
    this.timer = timer;
  }

  update(dt, game) {
    if (this.dead) {
      this.deathTimer -= dt;
      this.explosionTimer -= dt;
      if (this.explosionTimer <= 0 && this.deathTimer > 0) {
        this.explosionTimer = 0.12;
        FX.burst(this.cx + rand(-this.w / 2, this.w / 2), this.cy + rand(-this.h / 2, this.h / 2), 10, {
          color: pick([this.color, '#ffd24d', '#ffffff']),
          speedMax: 260,
          lifeMax: 0.7,
          sizeMax: 6
        });
        game.shake(0.2);
        Sfx.noise(0.12, 0.1, { freq: 500 });
      }
      return;
    }

    const p = game.player;
    if (!p || p.dead) return;

    this.flash = Math.max(0, this.flash - dt);
    this.anim += dt;
    this.vy = Math.min(this.vy + 1900 * dt, 1000);
    this.timer -= dt;

    const d = Math.abs(p.cx - this.cx);
    if (!this.active) {
      if (d < 760) {
        this.active = true;
        game.bossActive = true;
        game.toast(this.cfg.name + ' DESPERTOU', this.color);
        game.shake(0.6);
        Sfx.tone(70, 0.7, { type: 'sawtooth', vol: 0.16, slide: -30 });
        this.begin('idle', 1.0 / this.aggro);
      }
      return;
    }

    if (this.phase === 1 && this.hp <= this.maxHp * 0.5) {
      this.phase = 2;
      this.speed *= 1.25;
      game.toast('FASE 2 — ' + this.cfg.name, this.color);
      game.shake(0.5);
      Sfx.tone(90, 0.5, { type: 'sawtooth', vol: 0.16, slide: 120 });
      FX.burst(this.cx, this.cy, 30, { color: this.color, speedMax: 340, lifeMax: 0.9, sizeMax: 7 });
    }

    if (this.phase === 2 && this.cfg.final) {
      const thresholds = [0.66, 0.33];
      for (let i = 0; i < thresholds.length; i++) {
        if (this.summoned <= i && this.hp <= this.maxHp * thresholds[i]) {
          this.summoned = i + 1;
          this.summon(game);
        }
      }
    }

    this.dir = p.cx < this.cx ? -1 : 1;

    switch (this.state) {
      case 'idle':
        this.vx = approach(this.vx, this.dir * this.speed, 420 * dt);
        if (this.timer <= 0) {
          const roll = Math.random();
          if (this.phase === 2 && d > 280 && roll < 0.3) {
            this.begin('rainTele', 0.6 / this.aggro);
          } else if (d < 250 && roll < 0.62) {
            this.begin('chargeTele', 0.45 / this.aggro);
          } else if (d < 430 && roll < 0.82) {
            this.begin('slamTele', 0.55 / this.aggro);
          } else {
            this.begin('shootTele', 0.5 / this.aggro);
          }
        }
        break;
      case 'shootTele':
        this.vx = approach(this.vx, 0, 2200 * dt);
        if (this.timer <= 0) {
          this.shoot(game);
          this.begin('idle', rand(0.9, 1.4) / this.aggro);
        }
        break;
      case 'chargeTele':
        this.vx = approach(this.vx, 0, 2200 * dt);
        if (this.timer <= 0) {
          this.vx = this.dir * (this.phase === 2 ? 560 : 470);
          this.begin('charge', 0.9);
          game.shake(0.3);
          Sfx.tone(140, 0.2, { type: 'square', vol: 0.1, slide: 60 });
        }
        break;
      case 'charge':
        if (this.hitWall || this.timer <= 0) {
          this.vx = 0;
          if (this.hitWall) this.shockwaves(game, 1.05);
          this.begin('recover', 0.7 / this.aggro);
          game.shake(0.45);
          Sfx.noise(0.2, 0.12, { freq: 300 });
          FX.burst(this.cx + this.dir * this.w / 2, this.cy, 12, {
            color: this.color, speedMax: 220, lifeMax: 0.5
          });
        }
        break;
      case 'slamTele':
        this.vx = approach(this.vx, 0, 2600 * dt);
        if (this.timer <= 0) {
          this.slam(game);
          this.begin('recover', 0.6 / this.aggro);
        }
        break;
      case 'rainTele':
        this.vx = approach(this.vx, 0, 2600 * dt);
        if (this.timer <= 0) {
          this.rain(game);
          this.begin('recover', 0.6 / this.aggro);
        }
        break;
      case 'recover':
        this.vx = approach(this.vx, 0, 1600 * dt);
        if (this.timer <= 0) this.begin('idle', rand(0.8, 1.3) / this.aggro);
        break;
      default:
        this.begin('idle', 1);
    }

    moveBody(this, game.level, dt);

    if (aabb(this, p)) p.hurt(1, this.cx);

    if (this.y > game.level.heightPx + 200) {
      this.hp = 0;
      this.die(game);
    }
  }

  shoot(game) {
    const p = game.player;
    if (!p) return;
    this.attackCycle++;
    const projMul = game.diff ? game.diff.projSpeed : 1;

    if (this.phase === 2 && this.attackCycle % 3 === 0) {
      const count = 10;
      const spd = 250 * projMul;
      for (let i = 0; i < count; i++) {
        const ang = (TAU * i) / count + this.anim * 0.5;
        game.projectiles.push(new Projectile(
          this.cx,
          this.cy - 10,
          Math.cos(ang) * spd,
          Math.sin(ang) * spd,
          'enemy',
          { color: this.color, r: 8, life: 5 }
        ));
      }
      game.toast('DESCARGA RADIAL', this.color, 1.2);
      game.shake(0.25);
    } else {
      const count = this.phase === 2 ? 5 : 3;
      const spread = this.phase === 2 ? 0.42 : 0.3;
      const lead = 0.12;
      const base = Math.atan2(
        (p.cy + p.vy * lead) - (this.cy - 10),
        (p.cx + p.vx * lead) - this.cx
      );
      for (let i = 0; i < count; i++) {
        const ang = base + (i - (count - 1) / 2) * spread;
        const spd = (this.phase === 2 ? 380 : 330) * projMul;
        game.projectiles.push(new Projectile(
          this.cx + Math.cos(ang) * (this.w / 2 + 8),
          this.cy - 10 + Math.sin(ang) * 20,
          Math.cos(ang) * spd,
          Math.sin(ang) * spd,
          'enemy',
          { color: this.color, r: 9, life: 5 }
        ));
      }
    }
    Sfx.tone(260, 0.16, { type: 'square', vol: 0.09, slide: -100 });
    FX.burst(this.cx + this.dir * 30, this.cy - 10, 8, { color: this.color, speedMax: 140, lifeMax: 0.4 });
  }

  shockwaves(game, mul = 1) {
    const spd = 430 * mul * (game.diff ? game.diff.projSpeed : 1);
    for (const dir of [-1, 1]) {
      game.projectiles.push(new Projectile(
        this.cx + dir * this.w * 0.34,
        this.bottom - 20,
        dir * spd,
        0,
        'enemy',
        { color: this.color, r: 12, life: 2.0, damage: 1, wave: true }
      ));
    }
    FX.burst(this.cx, this.bottom - 10, 20, {
      color: this.color, speedMax: 300, lifeMax: 0.5, gravity: 600
    });
  }

  slam(game) {
    game.shake(0.8);
    Sfx.noise(0.4, 0.2, { freq: 220 });
    Sfx.tone(70, 0.3, { type: 'sawtooth', vol: 0.14, slide: -30 });
    this.shockwaves(game, 1);
  }

  rain(game) {
    const p = game.player;
    if (!p) return;
    const count = this.phase === 2 ? 7 : 5;
    const projMul = game.diff ? game.diff.projSpeed : 1;
    for (let i = 0; i < count; i++) {
      const x = clamp(p.cx + rand(-300, 300), 48, game.level.widthPx - 48);
      const y = Math.max(60, this.y - rand(120, 320));
      game.projectiles.push(new Projectile(
        x,
        y,
        rand(-30, 30),
        430 * projMul,
        'enemy',
        { color: this.color, r: 8, damage: 1, life: 4 }
      ));
      FX.burst(x, y, 5, { color: this.color, speedMax: 90, lifeMax: 0.3 });
    }
    game.toast('CHUVA DE METAIS', this.color, 1.4);
    Sfx.tone(180, 0.3, { type: 'sawtooth', vol: 0.1, slide: -80 });
  }

  summon(game) {
    game.toast('O NÚCLEO CHAMA REFORÇOS', '#ff5d7a');
    for (const off of [-180, 180]) {
      const x = clamp(this.cx + off, 80, game.level.widthPx - 80);
      const d = new Drone(x, this.y + 40, game);
      game.enemies.push(d);
      FX.burst(x, this.y + 30, 14, { color: '#ff5d7a', speedMax: 180, lifeMax: 0.6 });
    }
    Sfx.tone(320, 0.3, { type: 'sawtooth', vol: 0.1, slide: -200 });
  }

  takeDamage(n, game) {
    if (this.dead) return;
    this.hp -= n;
    this.flash = 0.16;
    game.shake(0.25);
    Sfx.tone(160, 0.12, { type: 'square', vol: 0.1, slide: -60 });
    FX.burst(this.cx, this.cy, 10, { color: '#ffffff', speedMax: 220, lifeMax: 0.4 });
    if (this.hp <= 0) {
      this.hp = 0;
      this.die(game);
    }
  }

  die(game) {
    if (this.dead) return;
    this.dead = true;
    this.deathTimer = 2.4;
    this.explosionTimer = 0;
    game.onBossDefeated(this);
    game.shake(1.2);
    Sfx.noise(0.8, 0.25, { freq: 260 });
    Sfx.tone(60, 0.9, { type: 'sawtooth', vol: 0.18, slide: -30 });
  }

  render(ctx, cam) {
    if (this.dead && this.deathTimer <= 0) return;
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    const alpha = this.dead ? clamp(this.deathTimer / 2.4, 0, 1) : 1;
    const flash = this.flash > 0;
    const bob = Math.sin(this.anim * 2.4) * 2;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x + this.w / 2, y + this.h + 4, this.w * 0.45, 8, 0, 0, TAU);
    ctx.fill();

    const body = flash ? '#ffffff' : this.color;
    const dark = flash ? '#ffffff' : hexShade(this.color, -70);

    // pernas / base
    ctx.fillStyle = dark;
    roundRect(ctx, x + 10, y + this.h - 38, 26, 38, 6);
    ctx.fill();
    roundRect(ctx, x + this.w - 36, y + this.h - 38, 26, 38, 6);
    ctx.fill();

    // torso
    const g = ctx.createLinearGradient(x, y, x, y + this.h);
    g.addColorStop(0, hexShade(this.color, 20));
    g.addColorStop(1, hexShade(this.color, -45));
    ctx.fillStyle = flash ? '#ffffff' : g;
    roundRect(ctx, x + 6, y + 22 + bob, this.w - 12, this.h - 62, 12);
    ctx.fill();
    ctx.strokeStyle = flash ? '#ffffff' : hexShade(this.color, -90);
    ctx.lineWidth = 3;
    ctx.stroke();

    // ombros
    ctx.fillStyle = dark;
    roundRect(ctx, x - 4, y + 34 + bob, 20, 34, 7);
    ctx.fill();
    roundRect(ctx, x + this.w - 16, y + 34 + bob, 20, 34, 7);
    ctx.fill();

    // cabeça
    ctx.fillStyle = flash ? '#ffffff' : hexShade(this.color, -20);
    roundRect(ctx, x + this.w / 2 - 26, y + 2 + bob, 52, 34, 9);
    ctx.fill();
    ctx.strokeStyle = hexShade(this.color, -80);
    ctx.lineWidth = 2;
    ctx.stroke();

    // olho
    const eyeGlow = (this.state === 'shootTele' || this.state === 'slamTele' || this.state === 'rainTele')
      ? 1
      : 0.55 + Math.sin(this.anim * 6) * 0.2;
    ctx.fillStyle = this.dead ? '#333' : '#12060a';
    roundRect(ctx, x + this.w / 2 - 19, y + 10 + bob, 38, 13, 5);
    ctx.fill();
    ctx.fillStyle = this.dead ? '#666' : '#ff2d4a';
    ctx.shadowColor = '#ff2d4a';
    ctx.shadowBlur = 16 * eyeGlow;
    ctx.fillRect(x + this.w / 2 - 12 + this.dir * 6, y + 13 + bob, 10, 7);
    ctx.shadowBlur = 0;

    // núcleo
    ctx.fillStyle = this.dead ? '#555' : '#ffe27a';
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x + this.w / 2, y + this.h * 0.58 + bob, 12, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    // canhão
    ctx.fillStyle = dark;
    roundRect(ctx, x + (this.dir > 0 ? this.w - 10 : -18), y + 52 + bob, 28, 14, 5);
    ctx.fill();

    if (this.state === 'chargeTele' || this.state === 'charge') {
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = 0.5 + Math.sin(this.anim * 20) * 0.3;
      ctx.lineWidth = 3;
      roundRect(ctx, x - 6, y - 4, this.w + 12, this.h + 8, 14);
      ctx.stroke();
    }

    if (this.state === 'slamTele') {
      const pulse = 0.5 + Math.sin(this.anim * 18) * 0.3;
      ctx.strokeStyle = withAlpha('#ff5a3c', 0.55 + pulse * 0.35);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x + this.w / 2, y + this.h, this.w * 0.9, 18, 0, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.18 + pulse * 0.12;
      ctx.fillStyle = '#ff5a3c';
      ctx.beginPath();
      ctx.ellipse(x + this.w / 2, y + this.h, this.w * 0.8, 14, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = alpha;
    }

    if (this.state === 'rainTele' && this.game.player && !this.game.player.dead) {
      const p = this.game.player;
      const px = p.cx - cam.x;
      const py = p.cy - cam.y;
      const rr = 44 + Math.sin(this.anim * 16) * 5;
      ctx.strokeStyle = withAlpha('#ff2d4a', 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, rr, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px - rr - 8, py);
      ctx.lineTo(px + rr + 8, py);
      ctx.moveTo(px, py - rr - 8);
      ctx.lineTo(px, py + rr + 8);
      ctx.stroke();
    }

    ctx.restore();
  }
}

/* ------------------------------ PROJÉTEIS ------------------------------ */

class Projectile {
  constructor(x, y, vx, vy, owner, opts = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.owner = owner;
    this.r = opts.r || 8;
    this.life = opts.life || 4;
    this.color = opts.color || (owner === 'enemy' ? '#ff5a6e' : '#66e0ff');
    this.damage = opts.damage || 1;
    this.bossDamage = opts.bossDamage ?? 5;
    this.wave = opts.wave || false;
    this.dead = false;
    this.trail = 0;
  }

  update(dt, game) {
    if (this.dead) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.dead = true;
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.trail -= dt;
    if (this.trail <= 0) {
      this.trail = 0.025;
      FX.spawn(this.x, this.y, {
        vx: -this.vx * 0.05,
        vy: -this.vy * 0.05,
        life: 0.24,
        size: this.r * 0.5,
        color: this.color,
        glow: true
      });
    }

    if (game.level.tileAtPx(this.x, this.y) === TILE_SOLID) {
      this.explode(game);
      return;
    }

    const p = game.player;
    if (this.owner === 'enemy') {
      if (p && !p.dead && circleRect(this.x, this.y, this.r, p)) {
        if (p.shield) {
          this.explode(game);
          return;
        }
        p.hurt(this.damage, this.x);
        this.explode(game);
      }
    } else {
      if (game.boss && !game.boss.dead && circleRect(this.x, this.y, this.r, game.boss)) {
        game.boss.takeDamage(this.bossDamage, game);
        this.explode(game);
        return;
      }
      for (const e of game.enemies) {
        if (!e.dead && circleRect(this.x, this.y, this.r, e)) {
          e.hurt(this.damage, game);
          this.explode(game);
          return;
        }
      }
    }
  }

  explode(game) {
    this.dead = true;
    FX.burst(this.x, this.y, 8, {
      color: this.color, speedMax: 180, lifeMax: 0.4, sizeMax: 4
    });
    Sfx.tone(this.owner === 'enemy' ? 220 : 520, 0.08, { type: 'square', vol: 0.04, slide: -100 });
  }

  render(ctx, cam) {
    if (this.dead) return;
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (this.wave) {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.ellipse(x, y, this.r * 1.7, this.r * 0.55, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, y, this.r * 0.8, this.r * 0.22, 0, 0, TAU);
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(x, y, this.r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, this.r * 0.45, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}

/* ------------------------------ COLETÁVEIS ------------------------------ */

class Pickup {
  constructor(kind, x, y, extra = {}) {
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.phase = rand(0, TAU);
    this.collected = false;
    this.power = extra.power || null;
    this.dead = false;
  }

  update(dt, game) {
    if (this.dead) return;
    this.phase += dt * 2.2;
    this.y = this.baseY + Math.sin(this.phase) * 4;
    this.x = this.baseX;

    const p = game.player;
    if (p && !p.dead && p.attract) {
      const d = dist(this.x, this.y, p.cx, p.cy);
      if (d < p.magnetRange()) {
        const k = 380 * dt;
        this.x += ((p.cx - this.x) / Math.max(1, d)) * k;
        this.y += ((p.cy - this.y) / Math.max(1, d)) * k;
        this.baseX = this.x;
        this.baseY = this.y - Math.sin(this.phase) * 4;
      }
    }

    if (p && !p.dead && dist(this.x, this.y, p.cx, p.cy) < (this.kind === 'power' ? 30 : 24)) {
      this.collect(game);
    }
  }

  collect(game) {
    if (this.collected) return;
    this.collected = true;
    this.dead = true;
    game.collectPickup(this);
  }

  render(ctx, cam) {
    if (this.dead) return;
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    const t = this.phase;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    if (this.kind === 'gear') {
      ctx.translate(x, y);
      ctx.rotate(t * 0.8);
      ctx.fillStyle = '#ffd24d';
      ctx.shadowColor = '#ffd24d';
      ctx.shadowBlur = 12;
      for (let i = 0; i < 8; i++) {
        ctx.rotate(TAU / 8);
        ctx.fillRect(-2.5, -13, 5, 5);
      }
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#3a2c05';
      ctx.beginPath();
      ctx.arc(0, 0, 3.4, 0, TAU);
      ctx.fill();
    } else if (this.kind === 'core') {
      ctx.fillStyle = '#ff5d7a';
      ctx.shadowColor = '#ff5d7a';
      ctx.shadowBlur = 20;
      const pulse = 9 + Math.sin(t * 3) * 2;
      ctx.beginPath();
      ctx.arc(x, y, pulse, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffe27a';
      ctx.beginPath();
      ctx.arc(x, y, pulse * 0.45, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,93,122,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, pulse + 6 + Math.sin(t * 2) * 2, 0, TAU);
      ctx.stroke();
    } else if (this.kind === 'power' && this.power) {
      const info = POWER_INFO[this.power];
      const rr = 17 + Math.sin(t * 3) * 2;
      const g = ctx.createRadialGradient(x, y, 2, x, y, rr * 2.2);
      g.addColorStop(0, info.color);
      g.addColorStop(0.4, withAlpha(info.color, 0.7));
      g.addColorStop(1, withAlpha(info.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rr * 2.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#0a0f18';
      ctx.beginPath();
      ctx.arc(x, y, rr * 0.8, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = info.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = info.color;
      ctx.font = 'bold 15px "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(info.key, x, y + 1);
    }
    ctx.restore();
  }
}

/* ------------------------------ CHECKPOINT ------------------------------ */

class Checkpoint {
  constructor(x, y) {
    this.w = 40;
    this.h = 58;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.active = false;
    this.phase = 0;
  }

  update(dt, game) {
    this.phase += dt * 3;
    const p = game.player;
    if (!this.active && p && !p.dead && aabb(this, p)) {
      this.active = true;
      game.setCheckpoint(this);
      Sfx.tone(440, 0.12, { type: 'sine', vol: 0.1 });
      Sfx.tone(660, 0.18, { type: 'sine', vol: 0.1, delay: 0.1 });
      FX.burst(this.x + this.w / 2, this.y + 8, 16, {
        color: '#7fe7ff', speedMax: 200, lifeMax: 0.6
      });
    }
  }

  render(ctx, cam) {
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    ctx.save();
    ctx.fillStyle = '#2a3648';
    ctx.fillRect(x + 17, y + 10, 6, 48);
    ctx.fillStyle = this.active ? '#7fe7ff' : '#4a5568';
    ctx.shadowColor = '#7fe7ff';
    ctx.shadowBlur = this.active ? 16 : 0;
    ctx.beginPath();
    ctx.arc(x + 20, y + 10, 7, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (this.active) {
      ctx.strokeStyle = 'rgba(127,231,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + 20, y + 10, 12 + Math.sin(this.phase) * 3, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* ------------------------------ SAÍDA ------------------------------ */

class Exit {
  constructor(x, y) {
    this.w = 52;
    this.h = 74;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.open = false;
    this.phase = 0;
  }

  update(dt, game) {
    this.phase += dt * 2;
    const p = game.player;
    if (this.open && p && !p.dead && aabb(this, p)) {
      game.completeLevel();
    }
  }

  render(ctx, cam) {
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    ctx.save();
    ctx.fillStyle = '#0a111c';
    roundRect(ctx, x, y, this.w, this.h, 6);
    ctx.fill();
    ctx.strokeStyle = this.open ? '#7fe7ff' : '#4a5568';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (this.open) {
      const g = ctx.createLinearGradient(x, y, x, y + this.h);
      g.addColorStop(0, 'rgba(127,231,255,0.35)');
      g.addColorStop(1, 'rgba(127,231,255,0.05)');
      ctx.fillStyle = g;
      roundRect(ctx, x + 5, y + 5, this.w - 10, this.h - 10, 4);
      ctx.fill();
      ctx.fillStyle = '#7fe7ff';
      ctx.shadowColor = '#7fe7ff';
      ctx.shadowBlur = 18;
      ctx.font = 'bold 13px "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SAÍDA', x + this.w / 2, y + this.h / 2 + 4);
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = '#ff5d6c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + this.w / 2, y + this.h / 2, 9, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + this.w / 2, y + this.h / 2 - 9);
      ctx.lineTo(x + this.w / 2, y + this.h / 2 + 9);
      ctx.stroke();
      ctx.fillStyle = '#ff5d6c';
      ctx.font = '11px "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BLOQUEADA', x + this.w / 2, y + this.h + 16);
    }
    ctx.restore();
  }
}
