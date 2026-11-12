'use strict';

/* ============================================================
   CÓDIGO VERDE — entidades do jogo
   ============================================================ */

/* ------------------------------ KENNEDITO ------------------------------ */

function drawPawPrint(ctx, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.18, size * 0.55, size * 0.42, 0, 0, TAU);
  ctx.fill();
  const toes = [
    [-0.55, -0.28, 0.22],
    [-0.2, -0.5, 0.24],
    [0.2, -0.5, 0.24],
    [0.55, -0.28, 0.22]
  ];
  for (const [dx, dy, r] of toes) {
    ctx.beginPath();
    ctx.arc(x + dx * size, y + dy * size, r * size, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// Kennedito: lobo furry verde, mascote do CEPK. Desenhado em pixel-art.
function drawKenneditoSprite(ctx, x, y, scale = 1, t = 0, opts = {}) {
  const s = scale;
  const happy = opts.happy !== false;
  const wag = Math.sin(t * 6) * 0.35;
  const bob = opts.bob === false ? 0 : Math.sin(t * 4) * 2 * s;
  const baseY = y + bob;
  ctx.save();

  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2 * s, 27 * s, 6 * s, 0, 0, TAU);
  ctx.fill();

  // cauda
  ctx.save();
  ctx.translate(x + 23 * s, baseY - 22 * s);
  ctx.rotate(wag);
  ctx.fillStyle = '#2f8a4c';
  ctx.fillRect(0, -5 * s, 23 * s, 10 * s);
  ctx.fillStyle = '#4fc46a';
  ctx.fillRect(2 * s, -4 * s, 20 * s, 8 * s);
  ctx.fillStyle = '#a8f0a0';
  ctx.fillRect(18 * s, -5 * s, 7 * s, 10 * s);
  ctx.restore();

  // pernas e patas
  ctx.fillStyle = '#2f8a4c';
  ctx.fillRect(x - 17 * s, baseY - 17 * s, 10 * s, 15 * s);
  ctx.fillRect(x + 7 * s, baseY - 17 * s, 10 * s, 15 * s);
  ctx.fillStyle = '#183d24';
  ctx.fillRect(x - 19 * s, baseY - 4 * s, 13 * s, 5 * s);
  ctx.fillRect(x + 5 * s, baseY - 4 * s, 13 * s, 5 * s);

  // corpo
  ctx.fillStyle = '#3fae5c';
  ctx.fillRect(x - 20 * s, baseY - 38 * s, 40 * s, 24 * s);
  ctx.fillStyle = '#a8f0a0';
  ctx.fillRect(x - 12 * s, baseY - 32 * s, 24 * s, 16 * s);
  ctx.fillStyle = '#2f8a4c';
  ctx.fillRect(x - 25 * s, baseY - 34 * s, 8 * s, 16 * s);
  ctx.fillRect(x + 17 * s, baseY - 34 * s, 8 * s, 16 * s);

  // bandana amarela
  ctx.fillStyle = '#ffd24d';
  ctx.fillRect(x - 18 * s, baseY - 42 * s, 36 * s, 6 * s);
  ctx.fillStyle = '#ffb52e';
  ctx.fillRect(x - 18 * s, baseY - 38 * s, 36 * s, 2 * s);
  ctx.beginPath();
  ctx.moveTo(x + 12 * s, baseY - 38 * s);
  ctx.lineTo(x + 23 * s, baseY - 30 * s);
  ctx.lineTo(x + 14 * s, baseY - 27 * s);
  ctx.closePath();
  ctx.fill();

  // cabeça
  ctx.fillStyle = '#3fae5c';
  ctx.fillRect(x - 22 * s, baseY - 70 * s, 44 * s, 32 * s);

  // orelhas
  ctx.fillStyle = '#2f8a4c';
  ctx.beginPath();
  ctx.moveTo(x - 20 * s, baseY - 68 * s);
  ctx.lineTo(x - 29 * s, baseY - 89 * s);
  ctx.lineTo(x - 8 * s, baseY - 70 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 8 * s, baseY - 70 * s);
  ctx.lineTo(x + 27 * s, baseY - 87 * s);
  ctx.lineTo(x + 22 * s, baseY - 66 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1c5c32';
  ctx.beginPath();
  ctx.moveTo(x - 18 * s, baseY - 70 * s);
  ctx.lineTo(x - 24 * s, baseY - 82 * s);
  ctx.lineTo(x - 11 * s, baseY - 71 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 12 * s, baseY - 70 * s);
  ctx.lineTo(x + 23 * s, baseY - 81 * s);
  ctx.lineTo(x + 20 * s, baseY - 68 * s);
  ctx.closePath();
  ctx.fill();

  // focinho
  ctx.fillStyle = '#a8f0a0';
  ctx.fillRect(x - 13 * s, baseY - 56 * s, 26 * s, 15 * s);
  ctx.fillStyle = '#d9ffcf';
  ctx.fillRect(x - 8 * s, baseY - 52 * s, 16 * s, 8 * s);

  // olhos
  ctx.fillStyle = '#10261a';
  const eyeY = baseY - 60 * s;
  if (happy) {
    ctx.fillRect(x - 13 * s, eyeY, 7 * s, 5 * s);
    ctx.fillRect(x + 6 * s, eyeY, 7 * s, 5 * s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 11 * s, eyeY + 1 * s, 2 * s, 2 * s);
    ctx.fillRect(x + 8 * s, eyeY + 1 * s, 2 * s, 2 * s);
  } else {
    ctx.fillRect(x - 12 * s, eyeY + 1 * s, 7 * s, 3 * s);
    ctx.fillRect(x + 5 * s, eyeY + 1 * s, 7 * s, 3 * s);
  }

  // nariz e boca
  ctx.fillStyle = '#1b2a1f';
  ctx.fillRect(x - 4 * s, baseY - 49 * s, 8 * s, 5 * s);
  ctx.fillStyle = '#0b140d';
  ctx.fillRect(x - 2 * s, baseY - 47 * s, 4 * s, 2 * s);
  ctx.strokeStyle = '#1b2a1f';
  ctx.lineWidth = Math.max(1, 1.5 * s);
  ctx.beginPath();
  if (happy) {
    ctx.arc(x, baseY - 43 * s, 5 * s, 0.15, Math.PI - 0.15);
  } else {
    ctx.moveTo(x - 4 * s, baseY - 43 * s);
    ctx.lineTo(x + 4 * s, baseY - 43 * s);
  }
  ctx.stroke();

  // colar / joia verde
  ctx.fillStyle = '#6dff9e';
  ctx.fillRect(x - 4 * s, baseY - 40 * s, 8 * s, 6 * s);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 2 * s, baseY - 39 * s, 2 * s, 2 * s);

  // tufo de pelo
  ctx.fillStyle = '#a8f0a0';
  ctx.fillRect(x - 3 * s, baseY - 75 * s, 6 * s, 7 * s);
  ctx.restore();
}

/* ------------------------------ JOGADOR ------------------------------ */

class Player {
  constructor(x, y, game) {
    this.game = game;
    this.w = 28;
    this.h = 42;
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
    this.jumpsLeft = 2;
    this.anim = 0;
    this.landSquash = 0;
    this.prevVy = 0;

    this.dashTimer = 0;
    this.dashCd = 0;
    this.airDash = 1;
    this.justDashed = false;

    this.parryTimer = 0;
    this.parryPerfect = 0;
    this.parryCd = 0;
    this.parryFlash = 0;
    this.parryChain = 0;
    this.parryChainTimer = 0;
    this.parryAngle = 0;

    this.attackCd = 0;
    this.attackTimer = 0;
    this.attackDuration = 0.2;
    this.attackWeapon = 0;
    this.attackAimX = 1;
    this.attackAimY = 0;
    this.attackAngle = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.recoil = 0;

    this.pulseCd = 0;
    this.pulseFlash = 0;
    this.superTimer = 0;
    this.shield = false;
    this.focus = false;

    this.dead = false;
    this.deadTimer = 0;
    this.justDoubleJumped = false;
    this.justJumped = false;
    this.justSpring = false;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get bottom() { return this.y + this.h; }
  get superActive() { return this.superTimer > 0; }

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
    this.dashCd = Math.max(0, this.dashCd - dt);
    this.dashTimer = Math.max(0, this.dashTimer - dt);
    this.parryCd = Math.max(0, this.parryCd - dt);
    this.parryTimer = Math.max(0, this.parryTimer - dt);
    this.parryPerfect = Math.max(0, this.parryPerfect - dt);
    this.parryFlash = Math.max(0, this.parryFlash - dt);
    this.parryChainTimer = Math.max(0, this.parryChainTimer - dt);
    if (this.parryChainTimer <= 0) this.parryChain = 0;
    this.attackCd = Math.max(0, this.attackCd - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    this.recoil = Math.max(0, this.recoil - dt);
    this.pulseCd = Math.max(0, this.pulseCd - dt);
    this.pulseFlash = Math.max(0, this.pulseFlash - dt);
    if (this.comboTimer <= 0) this.combo = 0;

    /* ------- armas ------- */
    if (Input.pressed('Digit1', 'Numpad1')) game.weaponIndex = 0;
    if (Input.pressed('Digit2', 'Numpad2')) game.weaponIndex = 1;
    if (Input.pressed('Digit3', 'Numpad3')) game.weaponIndex = 2;
    game.weaponIndex = clamp(game.weaponIndex, 0, WEAPONS.length - 1);

    /* ------- movimento ------- */
    const left = Input.isDown('ArrowLeft', 'KeyA');
    const right = Input.isDown('ArrowRight', 'KeyD');
    const running = Input.isDown('ShiftLeft', 'ShiftRight');
    const superOn = this.superActive;
    const maxSpeed = (running ? 338 : 226) * (superOn ? 1.2 : 1);
    const accel = this.onGround ? 3400 : 2350;

    // Mira de 8 direções: WASD/setas definem o lado do golpe e do tiro.
    const aimRawX = (right ? 1 : 0) - (left ? 1 : 0);
    const aimRawY = (Input.isDown('KeyS', 'ArrowDown') ? 1 : 0) -
      (Input.isDown('KeyW', 'ArrowUp') ? 1 : 0);
    const aimLen = Math.hypot(aimRawX, aimRawY);
    if (aimLen > 0) {
      this.attackAimX = aimRawX / aimLen;
      this.attackAimY = aimRawY / aimLen;
      if (Math.abs(this.attackAimX) > 0.15) this.face = this.attackAimX > 0 ? 1 : -1;
    } else {
      this.attackAimX = this.face;
      this.attackAimY = 0;
    }
    this.attackAngle = Math.atan2(this.attackAimY, this.attackAimX);

    if (this.dashTimer <= 0) {
      if (left && !right) {
        this.vx -= accel * dt;
        this.face = -1;
      } else if (right && !left) {
        this.vx += accel * dt;
        this.face = 1;
      } else {
        this.vx = approach(this.vx, 0, (this.onGround ? 3100 : 540) * dt);
      }
      this.vx = clamp(this.vx, -maxSpeed, maxSpeed);
    }

    /* ------- impulso ------- */
    if (Input.pressed('ShiftLeft', 'ShiftRight', 'KeyL') && this.dashCd <= 0 && (this.onGround || this.airDash > 0)) {
      if (!this.onGround) this.airDash--;
      this.dashTimer = 0.16;
      this.dashCd = 0.65;
      this.justDashed = true;
      this.invuln = Math.max(this.invuln, 0.22);
      this.vx = this.face * 720;
      this.vy = 0;
      Sfx.tone(300, 0.14, { type: 'sawtooth', vol: 0.08, slide: 260 });
      Sfx.noise(0.12, 0.06, { freq: 1200 });
      FX.burst(this.cx, this.cy, 14, {
        color: '#6dff9e', speedMax: 260, lifeMax: 0.4, shape: 'line',
        angle: this.face > 0 ? Math.PI : 0, spread: 0.8
      });
    }

    if (this.dashTimer > 0) {
      this.vx = this.face * 720;
      this.vy = Math.min(this.vy, 30);
    }

    /* ------- pulo / pulo duplo ------- */
    const jumpDown = Input.isDown('Space', 'KeyW', 'ArrowUp');
    if (Input.pressed('Space', 'KeyW', 'ArrowUp')) this.jumpBuf = 0.13;
    this.jumpBuf -= dt;

    if (this.onGround) {
      this.coyote = 0.1;
      this.jumpsLeft = 2;
      this.airDash = 1;
    } else {
      this.coyote -= dt;
    }

    if (this.jumpBuf > 0 && this.dashTimer <= 0) {
      if (this.onGround || this.coyote > 0) {
        this.vy = superOn ? -780 : -665;
        this.jumpBuf = 0;
        this.coyote = 0;
        this.onGround = false;
        this.jumpsLeft = 1;
        this.justJumped = true;
        this.landSquash = 0.2;
        Sfx.tone(superOn ? 340 : 220, 0.16, { type: 'square', vol: 0.1, slide: superOn ? 340 : 130 });
        FX.burst(this.cx, this.bottom, superOn ? 14 : 7, {
          color: superOn ? '#ffd24d' : '#6dff9e',
          speedMax: 180, lifeMax: 0.5, gravity: 500
        });
      } else if (this.jumpsLeft > 0) {
        this.vy = superOn ? -720 : -610;
        this.jumpsLeft--;
        this.jumpBuf = 0;
        this.justDoubleJumped = true;
        this.landSquash = 0.2;
        Sfx.tone(420, 0.14, { type: 'triangle', vol: 0.1, slide: 180 });
        FX.burst(this.cx, this.cy + 8, 16, {
          color: '#7fe7ff', speedMax: 180, lifeMax: 0.5, shape: 'line'
        });
        FX.spawn(this.cx, this.cy + 8, {
          vx: 0, vy: 0, life: 0.35, size: 10, color: '#7fe7ff'
        });
      }
    }
    if (!jumpDown && this.vy < -240) this.vy = -240;

    const gravity = (this.dashTimer > 0 ? 0 : 2000) * (this.vy > 0 ? 1.1 : 1);
    this.vy = Math.min(this.vy + gravity * dt, 1080);

    /* ------- poderes ------- */
    const powers = game.powers;
    const hasEnergy = this.energy > 0 && this.energyLock <= 0;

    this.focus = powers.has('focus') && hasEnergy && Input.isDown('KeyK');
    this.shield = powers.has('shield') && hasEnergy && Input.isDown('KeyR');

    let drain = 0;
    if (this.focus) drain += 13;
    if (this.shield) drain += 24;

    if (Input.pressed('KeyQ') && powers.has('pulse')) game.playerPulse();

    if (Input.pressed('KeyF') && powers.has('super') && this.energy >= 30 && this.superTimer <= 0) {
      this.energy -= 30;
      this.superTimer = 6;
      game.toast('ADRENALINA ATIVADA', '#ffd24d');
      game.shake(0.35);
      Sfx.tone(180, 0.4, { type: 'sawtooth', vol: 0.12, slide: 620 });
      FX.burst(this.cx, this.cy, 26, {
        color: '#ffd24d', speedMax: 320, lifeMax: 0.8, sizeMax: 6
      });
    }

    if (this.focus) game.usedFocus = true;
    if (this.shield) game.usedShield = true;

    /* ------- combate ------- */
    const weapon = WEAPONS[game.weaponIndex];
    if ((Input.pressed('KeyJ') || Input.mouse.clicked) && this.attackCd <= 0) {
      if (weapon.melee) this.meleeAttack(game, weapon, this.attackAimX, this.attackAimY);
      else this.rangedAttack(game, weapon, this.attackAimX, this.attackAimY);
    }

    if ((Input.pressed('KeyE') || Input.mouse.rightClicked) && this.parryCd <= 0) {
      this.parryTimer = 0.34;
      this.parryPerfect = 0.14;
      this.parryCd = 0.46;
      this.parryChainTimer = 1.8;
      this.parryAngle = this.attackAngle;
      Sfx.tone(520, 0.08, { type: 'triangle', vol: 0.07, slide: 180 });
      FX.burst(this.cx + this.attackAimX * 22, this.cy + this.attackAimY * 22, 7, {
        color: '#6dff9e', speedMax: 120, lifeMax: 0.25,
        angle: this.attackAngle, spread: 0.7
      });
    }

    if (drain > 0) {
      this.energy = Math.max(0, this.energy - drain * dt);
      if (this.energy <= 0) {
        this.energyLock = 0.8;
        this.focus = this.shield = false;
      }
    } else {
      const regen = game.diff ? game.diff.energyRegen : 1;
      this.energy = Math.min(this.maxEnergy, this.energy + 10 * regen * dt);
    }

    /* ------- física ------- */
    this.prevVy = this.vy;
    moveBody(this, game.level, dt);

    for (const c of game.crates) this.collideCrate(c);

    if (game.level.hazardRect(this.x + 4, this.y + 4, this.w - 8, this.h - 8)) {
      this.hurt(2, null, null, false);
      this.vy = -470;
      if (this.vx === 0) this.vx = -this.face * 120;
    }

    if (this.y > game.level.heightPx + 140) game.killPlayer();

    if (this.onGround) {
      this.anim += Math.abs(this.vx) * dt * 0.045;
      if (this.prevVy > 620) {
        this.landSquash = 0.35;
        FX.burst(this.cx, this.bottom, 6, {
          color: '#6dff9e', speedMax: 90, lifeMax: 0.35, gravity: 300
        });
      }
    } else {
      this.anim += dt * 2;
    }
  }

  meleeAttack(game, weapon, aimX = this.face, aimY = 0) {
    this.attackCd = weapon.cd;
    this.attackTimer = Math.min(0.28, weapon.cd * 0.8);
    this.attackDuration = this.attackTimer;
    this.attackWeapon = game.weaponIndex;
    this.combo = this.comboTimer > 0 ? Math.min(weapon.comboMax, this.combo + 1) : 1;
    this.comboTimer = 0.85;

    const len = Math.hypot(aimX, aimY) || 1;
    const ax = aimX / len;
    const ay = aimY / len;
    this.attackAimX = ax;
    this.attackAimY = ay;
    this.attackAngle = Math.atan2(ay, ax);
    if (Math.abs(ax) > 0.15) this.face = ax > 0 ? 1 : -1;

    const finisher = weapon.id === 'bastao' && this.combo === 3;
    const reach = weapon.range + (finisher ? 10 : 0) + (this.superActive ? 8 : 0);
    const horizontal = Math.abs(ax) > 0.35;
    const vertical = Math.abs(ay) > 0.35;
    const boxW = horizontal ? reach : Math.max(20, this.w * 0.92);
    const boxH = vertical ? reach : Math.max(20, this.h * 0.92);
    const box = {
      x: this.cx + ax * (reach * 0.52) - boxW / 2,
      y: this.cy + ay * (reach * 0.52) - boxH / 2,
      w: boxW,
      h: boxH
    };
    const damage = weapon.damage + (finisher ? 1 : 0) + (this.superActive ? 2 : 0);
    const bossDamage = weapon.bossDamage + (finisher ? 2 : 0) + (this.superActive ? 3 : 0);
    const force = weapon.id === 'martelo' ? 700 : 420;
    let hit = false;

    for (const e of game.enemies) {
      if (e.dead || !aabb(box, e)) continue;
      e.hurt(damage, game, this);
      e.mx = clamp((e.mx || 0) + ax * force, -760, 760);
      e.my = clamp((e.my || 0) + ay * force - (weapon.id === 'martelo' ? 220 : 120), -760, 760);
      hit = true;
    }

    if (game.boss && !game.boss.dead && aabb(box, game.boss)) {
      game.boss.takeDamage(bossDamage, game);
      hit = true;
    }

    for (const c of game.crates) {
      if (!aabb(box, c)) continue;
      c.vx += ax * (weapon.id === 'martelo' ? 460 : 300);
      c.vy = Math.min(c.vy, ay < -0.2 ? -320 : -140);
      c.glow = 1;
      hit = true;
    }

    for (const pr of game.projectiles) {
      if (pr.dead || pr.owner !== 'enemy') continue;
      if (!circleRect(pr.x, pr.y, pr.r, box)) continue;
      if (pr.parryable) pr.reflect(game);
      else pr.explode(game);
      hit = true;
    }

    const sx = this.cx + ax * (reach * 0.78);
    const sy = this.cy + ay * (reach * 0.78);
    const color = weapon.id === 'martelo' ? '#ff8c42' : finisher ? '#ffd24d' : '#7fe7ff';
    FX.burst(sx, sy, hit ? 12 : 6, {
      color, speedMax: hit ? 260 : 140, lifeMax: 0.4, shape: 'line',
      angle: this.attackAngle, spread: 0.9
    });
    Sfx.tone(weapon.id === 'martelo' ? 170 : finisher ? 300 : 240, 0.08, {
      type: 'square', vol: 0.07, slide: weapon.id === 'martelo' ? -60 : finisher ? 240 : 90
    });
    if (hit) {
      game.shake(weapon.id === 'martelo' ? 0.32 : 0.16 + this.combo * 0.03);
      Sfx.noise(0.08, 0.06, { freq: 1100 });
    }
    game.usedMelee = true;
  }

  rangedAttack(game, weapon, aimX = this.face, aimY = 0) {
    this.attackCd = weapon.cd;
    this.attackTimer = 0.18;
    this.attackDuration = 0.18;
    this.attackWeapon = game.weaponIndex;
    if (this.energy < weapon.energy) {
      this.attackCd = 0.24;
      game.toast('ENERGIA INSUFICIENTE', '#ff8fa5', 0.9);
      Sfx.tone(120, 0.08, { type: 'square', vol: 0.04, slide: -40 });
      return;
    }
    this.energy -= weapon.energy;
    this.recoil = 0.14;
    const len = Math.hypot(aimX, aimY) || 1;
    const dx = aimX / len;
    const dy = aimY / len;
    this.attackAimX = dx;
    this.attackAimY = dy;
    this.attackAngle = Math.atan2(dy, dx);
    if (Math.abs(dx) > 0.15) this.face = dx > 0 ? 1 : -1;
    const px = this.cx + dx * 22;
    const py = this.cy + dy * 18 - 4;
    game.projectiles.push(new Projectile(px, py, dx * weapon.speed, dy * weapon.speed, 'player', {
      color: weapon.color,
      r: 5,
      damage: weapon.damage + (this.superActive ? 2 : 0),
      bossDamage: weapon.bossDamage + (this.superActive ? 3 : 0),
      life: 1.2,
      kind: 'pellet',
      parryable: false
    }));
    Sfx.tone(620, 0.08, { type: 'square', vol: 0.06, slide: 220 });
    FX.burst(px, py, 7, {
      color: weapon.color, speedMax: 180, lifeMax: 0.3,
      angle: this.attackAngle, spread: 0.9
    });
    game.usedRanged = true;
  }

  parrySuccess() {
    const perfect = this.parryPerfect > 0;
    this.parryTimer = 0;
    this.parryPerfect = 0;
    this.parryChain = perfect ? this.parryChain + 1 : Math.max(1, this.parryChain);
    this.parryChainTimer = 2.2;
    this.parryCd = perfect ? 0.2 : 0.36;
    this.parryFlash = perfect ? 0.55 : 0.34;
    this.invuln = Math.max(this.invuln, perfect ? 0.8 : 0.45);
    this.energy = Math.min(this.maxEnergy, this.energy + (perfect ? 24 : 12));
    if (perfect) {
      this.dashCd = 0;
      this.airDash = Math.max(this.airDash, 1);
    }
    this.game.onParry(this, perfect, this.parryChain);
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

  hurt(amount, sourceX = null, source = null, parryable = true) {
    if (this.dead || this.invuln > 0) return false;
    if (parryable && this.parryTimer > 0) {
      this.parrySuccess();
      return false;
    }
    if (this.shield) {
      this.energy = Math.max(0, this.energy - 9);
      this.invuln = Math.max(this.invuln, 0.32);
      FX.burst(this.cx, this.cy, 9, { color: '#b57bff', speedMax: 160, lifeMax: 0.4 });
      Sfx.tone(420, 0.1, { type: 'sine', vol: 0.06, slide: -120 });
      return false;
    }
    const diff = this.game.diff;
    if (diff && diff.dmg !== 1) amount = Math.max(1, Math.round(amount * diff.dmg));
    this.hp -= amount;
    this.invuln = 1.2;
    this.hurtFlash = 0.25;
    this.game.shake(0.45);
    Sfx.tone(120, 0.22, { type: 'sawtooth', vol: 0.16, slide: -70 });
    Sfx.noise(0.16, 0.12, { freq: 700 });
    FX.burst(this.cx, this.cy, 14, {
      color: '#ff5d6c', speedMax: 260, lifeMax: 0.6, gravity: 500
    });
    if (sourceX !== null) {
      this.vx = this.cx < sourceX ? -270 : 270;
      this.vy = -320;
    }
    if (this.hp <= 0) {
      this.hp = 0;
      this.game.killPlayer();
    }
    return true;
  }

  render(ctx, cam) {
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    if (this.dead) return;

    const blink = this.invuln > 0 && Math.floor(this.invuln * 24) % 2 === 0;
    ctx.save();
    if (blink) ctx.globalAlpha = 0.42;

    const walk = this.onGround && Math.abs(this.vx) > 30 ? Math.sin(this.anim * 14) * 3 : 0;
    const bob = this.onGround ? 0 : Math.sin(this.anim * 5) * 1.5;
    const squash = 1 - this.landSquash * 0.12;

    // rastro do dash
    if (this.dashTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#6dff9e';
      for (let i = 1; i <= 3; i++) {
        ctx.fillRect(x - this.face * i * 18, y + 10, this.w, this.h - 10);
      }
      ctx.restore();
    }

    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    ctx.beginPath();
    ctx.ellipse(x + this.w / 2, y + this.h + 3, 16, 5, 0, 0, TAU);
    ctx.fill();

    const skin = '#e8b07a';
    const skinDark = '#c98b58';
    const blazer = this.superActive ? '#4a9c3c' : '#2f8a4c';
    const blazerDark = this.superActive ? '#2d6826' : '#1c5c32';

    // pernas
    ctx.fillStyle = '#22304a';
    ctx.fillRect(x + 5, y + 30 + walk, 7, 10 - walk);
    ctx.fillRect(x + 17, y + 30 - walk, 7, 10 + walk);
    ctx.fillStyle = '#111a2c';
    ctx.fillRect(x + 3, y + 39 + walk, 10, 4);
    ctx.fillRect(x + 16, y + 39 - walk, 10, 4);

    // corpo / blazer
    ctx.fillStyle = blazer;
    ctx.fillRect(x + 3, y + 14 + bob, 22, 19 * squash);
    ctx.fillStyle = blazerDark;
    ctx.fillRect(x + 3, y + 29 + bob, 22, 4);
    ctx.fillStyle = '#f2f7ef';
    ctx.fillRect(x + 11, y + 14 + bob, 7, 13);
    ctx.fillStyle = '#d7e2d2';
    ctx.fillRect(x + 13, y + 14 + bob, 2, 13);
    // crachá
    ctx.fillStyle = '#ffd24d';
    ctx.fillRect(x + 19, y + 19 + bob, 4, 4);
    ctx.fillStyle = '#2a2410';
    ctx.fillRect(x + 20, y + 20 + bob, 2, 2);

    // braços
    ctx.fillStyle = blazer;
    ctx.fillRect(x - 1, y + 17 + bob, 5, 10);
    ctx.fillRect(x + 24, y + 17 + bob, 5, 10);
    ctx.fillStyle = skin;
    ctx.fillRect(x - 1, y + 26 + bob, 5, 4);
    ctx.fillRect(x + 24, y + 26 + bob, 5, 4);

    // cabeça
    ctx.fillStyle = skin;
    ctx.fillRect(x + 6, y + 3 + bob, 16, 12);
    ctx.fillStyle = skinDark;
    ctx.fillRect(x + 6, y + 12 + bob, 16, 3);
    // cabelo
    ctx.fillStyle = '#2a1d16';
    ctx.fillRect(x + 5, y + 1 + bob, 18, 5);
    ctx.fillRect(x + (this.face > 0 ? 5 : 20), y + 5 + bob, 3, 3);
    // olho
    ctx.fillStyle = '#f7fbf2';
    ctx.fillRect(x + (this.face > 0 ? 16 : 8), y + 7 + bob, 4, 3);
    ctx.fillStyle = '#183020';
    ctx.fillRect(x + (this.face > 0 ? 18 : 8), y + 8 + bob, 2, 2);
    // orelha
    ctx.fillStyle = skinDark;
    ctx.fillRect(x + (this.face > 0 ? 21 : 5), y + 8 + bob, 2, 3);

    // faixa de monitor no braço
    ctx.fillStyle = '#ffd24d';
    ctx.fillRect(x + 24, y + 20 + bob, 5, 2);

    /* ------- arma ------- */
    const weapon = WEAPONS[this.attackWeapon] || WEAPONS[0];
    const handX = x + (this.face > 0 ? this.w - 2 : 2);
    const handY = y + 26 + bob;
    ctx.save();
    ctx.translate(handX, handY);
    ctx.scale(this.face, 1);
    if (this.attackTimer > 0) {
      if (this.attackAimY < -0.35) ctx.rotate(-0.85);
      else if (this.attackAimY > 0.35) ctx.rotate(1.05);
    }
    if (weapon.id === 'bastao') {
      ctx.strokeStyle = '#d9b06a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(20, -18);
      ctx.stroke();
      ctx.fillStyle = '#7fe7ff';
      ctx.fillRect(18, -21, 5, 5);
    } else if (weapon.id === 'estilingue') {
      ctx.strokeStyle = '#8a5a2b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(9, -10);
      ctx.moveTo(9, -10);
      ctx.lineTo(16, -6);
      ctx.moveTo(9, -10);
      ctx.lineTo(11, -18);
      ctx.stroke();
      ctx.strokeStyle = '#ffd24d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(16, -6);
      ctx.lineTo(11, -18);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#8a5a2b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(15, -16);
      ctx.stroke();
      ctx.fillStyle = '#ff8c42';
      ctx.fillRect(12, -24, 12, 9);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(12, -24, 12, 2);
    }
    ctx.restore();

    /* ------- efeitos ------- */
    if (this.attackTimer > 0) {
      const prog = 1 - this.attackTimer / Math.max(0.01, this.attackDuration);
      const ang = this.attackAngle;
      const cx = x + this.w / 2 + Math.cos(ang) * 10;
      const cy = y + this.h / 2 + Math.sin(ang) * 7;
      const color = weapon.id === 'martelo' ? '#ff8c42' : this.combo === 3 ? '#ffd24d' : '#7fe7ff';
      const sweep = weapon.id === 'martelo' ? 2.1 : 1.65;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.max(0, 1 - prog) * 0.95;
      ctx.strokeStyle = color;
      ctx.lineWidth = weapon.id === 'martelo' ? 8 - prog * 3 : 5 - prog * 2;
      ctx.beginPath();
      ctx.arc(
        cx, cy,
        (weapon.id === 'martelo' ? 40 : 32) + prog * 20,
        ang - sweep / 2 + prog * 1.1,
        ang + sweep / 2 + prog * 1.1
      );
      ctx.stroke();
      ctx.globalAlpha *= 0.45;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, (weapon.id === 'martelo' ? 50 : 42) + prog * 18, ang - sweep * 0.4 + prog, ang + sweep * 0.4 + prog);
      ctx.stroke();
      ctx.restore();
    }

    if (this.parryTimer > 0 || this.parryFlash > 0) {
      const active = this.parryTimer > 0;
      const perfect = this.parryPerfect > 0;
      const a = active ? 0.95 : clamp(this.parryFlash / 0.55, 0, 1);
      const cx = x + this.w / 2;
      const cy = y + this.h / 2;
      const t = performance.now() / 1000;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = perfect ? '#ffd24d' : '#6dff9e';
      ctx.globalAlpha = a;

      // anel de guarda
      ctx.lineWidth = active ? 4 : 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 39, 0, TAU);
      ctx.stroke();

      // runas girando ao redor do corpo
      for (let i = 0; i < 6; i++) {
        const ra = t * 3.2 + i * (TAU / 6);
        ctx.lineWidth = perfect ? 4 : 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, perfect ? 47 : 44, ra, ra + 0.34);
        ctx.stroke();
      }

      // crescente na direção da mira
      const base = this.parryAngle || 0;
      ctx.lineWidth = active ? 6 : 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, base - 0.8, base + 0.8);
      ctx.stroke();

      // onda de choque do parry bem-sucedido
      if (!active && this.parryFlash > 0) {
        const k = 1 - this.parryFlash / 0.55;
        ctx.globalAlpha = (1 - k) * 0.8;
        ctx.lineWidth = 5 * (1 - k) + 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 39 + k * 95, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (this.shield) {
      const t = performance.now() / 1000;
      const rr = 52 + Math.sin(t * 5) * 3;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(181,123,255,0.9)';
      ctx.fillStyle = 'rgba(181,123,255,0.10)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + this.w / 2, y + 20, rr, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (this.focus) {
      const t = performance.now() / 1000;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(127,231,255,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + this.w / 2, y + 20, 40 + Math.sin(t * 6) * 4, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    if (this.superActive) {
      const t = performance.now() / 1000;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
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
      ctx.restore();
    }

    if (this.hurtFlash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = this.hurtFlash * 2;
      ctx.fillStyle = '#ff5d6c';
      ctx.fillRect(x - 2, y - 2, this.w + 4, this.h + 4);
      ctx.restore();
    }

    ctx.restore();
  }
}

/* ------------------------------ CAIXA ------------------------------ */

class Crate {
  constructor(x, y) {
    this.w = 32;
    this.h = 32;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.hitWall = 0;
    this.glow = 0;
    this.spin = 0;
    this.impactCd = 0;
    this.dead = false;
  }

  update(dt, game) {
    this.glow = Math.max(0, this.glow - dt * 3);

    this.vy = Math.min(this.vy + 1900 * dt, 1000);
    this.vx = clamp(this.vx, -560, 560);
    this.vy = clamp(this.vy, -560, 1000);

    moveBody(this, game.level, dt);

    if (this.onGround) {
      this.vx = approach(this.vx, 0, 1500 * dt);
      if (Math.abs(this.vx) < 4) this.vx = 0;
      if (this.vy > 0) this.vy = 0;
    }

    if (this.y > game.level.heightPx + 160) this.dead = true;
    this.spin += this.vx * dt * 0.01;
  }

  render(ctx, cam) {
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 34, 17, 4, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#3d7a4a';
    ctx.fillRect(x, y, 32, 32);
    ctx.fillStyle = '#2b5a36';
    ctx.fillRect(x, y + 26, 32, 6);
    ctx.fillStyle = '#8fe0a0';
    ctx.fillRect(x + 2, y + 2, 28, 3);
    ctx.strokeStyle = '#183d24';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, 30, 30);

    // folha estampada
    ctx.fillStyle = '#b6ff9a';
    ctx.fillRect(x + 12, y + 13, 8, 3);
    ctx.fillRect(x + 15, y + 10, 3, 9);
    ctx.fillStyle = '#6dff9e';
    ctx.fillRect(x + 10, y + 15, 3, 3);
    ctx.fillRect(x + 20, y + 10, 3, 3);

    if (this.glow > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#6dff9e';
      ctx.globalAlpha = 0.35 + this.glow * 0.4;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, 36, 36);
    }
    ctx.restore();
  }
}

/* ------------------------------ MOLA ------------------------------ */

class Spring {
  constructor(x, y, game, opts = {}) {
    this.w = 54;
    this.h = 22;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.power = opts.power || 950;
    this.pulse = 0;
    this.cd = 0;
    this.phase = rand(0, TAU);
    this.dead = false;
  }

  update(dt, game) {
    this.phase += dt * 4;
    this.pulse = Math.max(0, this.pulse - dt * 4);
    this.cd = Math.max(0, this.cd - dt);
    const p = game.player;
    if (!p || p.dead || this.cd > 0) return;

    const overX = p.cx > this.x - 8 && p.cx < this.x + this.w + 8;
    const falling = p.vy >= 0 && p.prevVy >= 0;
    const atTop = p.bottom >= this.y - 12 && p.bottom <= this.y + this.h + 8;
    if (!overX || !falling || !atTop) return;

    p.y = this.y - p.h - 1;
    p.vy = -this.power;
    p.onGround = false;
    p.jumpsLeft = Math.max(p.jumpsLeft, 1);
    p.airDash = Math.max(p.airDash, 1);
    p.justSpring = true;
    this.pulse = 1;
    this.cd = 0.22;
    game.shake(0.14);
    Sfx.tone(260, 0.16, { type: 'triangle', vol: 0.12, slide: 520 });
    Sfx.tone(520, 0.12, { type: 'square', vol: 0.06, slide: 260 });
    FX.burst(p.cx, this.y, 16, {
      color: '#b6ff9a', speedMax: 260, lifeMax: 0.5, gravity: 600, shape: 'line'
    });
  }

  render(ctx, cam) {
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    const squash = this.pulse * 0.35;
    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + this.w / 2, y + this.h + 2, 28, 5, 0, 0, TAU);
    ctx.fill();

    // base
    ctx.fillStyle = '#183d24';
    ctx.fillRect(x + 3, y + this.h - 7, this.w - 6, 7);
    ctx.fillStyle = '#2f8a4c';
    ctx.fillRect(x + 6, y + this.h - 11, this.w - 12, 4);

    // molas
    ctx.strokeStyle = '#6dff9e';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const yy = y + 8 + i * 4 + squash * 4;
      ctx.beginPath();
      ctx.moveTo(x + 12, yy);
      ctx.lineTo(x + this.w - 12, yy + 2);
      ctx.stroke();
    }

    // plataforma
    ctx.fillStyle = '#c8ffda';
    ctx.fillRect(x + 2, y + 2 + squash * 6, this.w - 4, 8);
    ctx.fillStyle = '#6dff9e';
    ctx.fillRect(x + 5, y + 3 + squash * 6, this.w - 10, 3);
    ctx.fillStyle = '#2f8a4c';
    ctx.fillRect(x + 2, y + 9 + squash * 6, this.w - 4, 3);

    // setas
    ctx.globalAlpha = 0.55 + Math.sin(this.phase) * 0.25;
    ctx.fillStyle = '#b6ff9a';
    for (let i = 0; i < 3; i++) {
      const ax = x + 14 + i * 13;
      const ay = y - 6 - Math.sin(this.phase + i) * 3;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + 5, ay + 6);
      ctx.lineTo(ax + 10, ay);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

/* ------------------------------ PLATAFORMA QUE DESMORONA ------------------------------ */

class CrumblePlatform {
  constructor(entity, game) {
    this.tx = entity.tx;
    this.ty = entity.ty;
    this.tiles = entity.w || 3;
    this.x = this.tx * TILE;
    this.y = this.ty * TILE;
    this.w = this.tiles * TILE;
    this.h = 18;
    this.state = 'idle';
    this.timer = 0;
    this.shake = 0;
    this.fall = 0;
    this.respawnTimer = 0;
    this.dead = false;
  }

  update(dt, game) {
    const p = game.player;
    if (this.state === 'idle') {
      if (!p || p.dead) return;
      const standing = p.onGround &&
        p.bottom >= this.y - 5 && p.bottom <= this.y + 16 &&
        p.x + p.w > this.x + 5 && p.x < this.x + this.w - 5;
      if (standing) {
        this.state = 'shake';
        this.timer = 0.55;
        Sfx.tone(190, 0.08, { type: 'square', vol: 0.05, slide: -40 });
        FX.burst(p.cx, this.y, 7, { color: '#ffd24d', speedMax: 100, lifeMax: 0.35 });
      }
    } else if (this.state === 'shake') {
      this.timer -= dt;
      this.shake = Math.sin(this.timer * 70) * 2.5;
      if (this.timer <= 0) this.collapse(game);
    } else if (this.state === 'collapsed') {
      this.fall += dt * 220;
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this.restore(game);
    }
  }

  collapse(game) {
    if (this.state === 'collapsed') return;
    this.state = 'collapsed';
    this.shake = 0;
    this.fall = 0;
    this.respawnTimer = 4.2;
    for (let i = 0; i < this.tiles; i++) {
      game.level.setTile(this.tx + i, this.ty, TILE_EMPTY);
    }
    const cx = this.x + this.w / 2;
    game.shake(0.22);
    Sfx.noise(0.22, 0.12, { freq: 260 });
    Sfx.tone(110, 0.18, { type: 'sawtooth', vol: 0.07, slide: -40 });
    FX.burst(cx, this.y + 8, 16, {
      color: '#9bffb0', speedMax: 180, lifeMax: 0.6, gravity: 900
    });
  }

  restore(game) {
    for (let i = 0; i < this.tiles; i++) {
      game.level.setTile(this.tx + i, this.ty, TILE_SOLID);
    }
    this.state = 'idle';
    this.timer = 0;
    this.shake = 0;
    this.fall = 0;
    this.respawnTimer = 0;
    FX.burst(this.x + this.w / 2, this.y + 8, 8, {
      color: '#6dff9e', speedMax: 100, lifeMax: 0.4
    });
  }

  reset(game) {
    if (this.state === 'collapsed') {
      for (let i = 0; i < this.tiles; i++) {
        game.level.setTile(this.tx + i, this.ty, TILE_SOLID);
      }
    }
    this.state = 'idle';
    this.timer = 0;
    this.shake = 0;
    this.fall = 0;
    this.respawnTimer = 0;
  }

  render(ctx, cam) {
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    ctx.save();
    if (this.state === 'collapsed') {
      ctx.globalAlpha = clamp(this.respawnTimer / 4.2, 0, 1) * 0.8;
      ctx.fillStyle = '#2f8a4c';
      for (let i = 0; i < this.tiles; i++) {
        const dx = i * TILE + (i % 2 ? 4 : -3);
        ctx.fillRect(x + dx, y + this.fall + i * 3, TILE - 8, 8);
      }
      ctx.restore();
      return;
    }

    const sh = this.state === 'shake' ? this.shake : 0;
    ctx.translate(sh, 0);
    // base
    ctx.fillStyle = '#183d24';
    ctx.fillRect(x, y + 7, this.w, 11);
    // topo
    ctx.fillStyle = this.state === 'shake' ? '#ffd24d' : '#8dffb0';
    ctx.fillRect(x, y, this.w, 6);
    ctx.fillStyle = this.state === 'shake' ? '#ff8c42' : '#2f8a4c';
    ctx.fillRect(x, y + 6, this.w, 3);
    // rachaduras
    ctx.strokeStyle = 'rgba(10,30,18,0.85)';
    ctx.lineWidth = 2;
    for (let i = 0; i < this.tiles; i++) {
      const cx = x + i * TILE + TILE * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - 8, y + 1);
      ctx.lineTo(cx - 2, y + 8);
      ctx.lineTo(cx + 5, y + 3);
      ctx.lineTo(cx + 9, y + 10);
      ctx.stroke();
    }
    if (this.state === 'shake') {
      ctx.globalAlpha = 0.5 + Math.sin(this.timer * 30) * 0.3;
      ctx.fillStyle = '#ffd24d';
      drawText(ctx, '!', x + this.w / 2, y - 12, {
        size: 14, align: 'center', color: '#ffd24d', glow: '#ffd24d', glowSize: 8
      });
    }
    ctx.restore();
  }
}

/* ------------------------------ VIGIA (WALKER) ------------------------------ */

class Walker {
  constructor(x, y, game, opts = {}) {
    const diff = (game && game.diff) || DIFFICULTIES[1];
    this.game = game;
    this.opts = opts;
    this.w = 38;
    this.h = 38;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.vx = 0;
    this.vy = 0;
    this.mx = 0;
    this.my = 0;
    this.onGround = false;
    this.hitWall = 0;
    this.dir = -1;
    this.training = !!opts.training;
    this.tag = opts.tag || null;
    this.invulnerable = !!opts.invulnerable;
    this.hp = Math.max(1, Math.round((opts.hp || 3) * (this.training ? 1 : diff.enemyHp)));
    this.maxHp = this.hp;
    this.speed = 78 * diff.enemySpeed;
    this.aggro = diff.aggression;
    this.flash = 0;
    this.dead = false;
    this.anim = 0;
    this.state = this.training ? 'dummy' : 'patrol';
    this.timer = 0;
    this.attackCd = rand(0.8, 1.8);
    this.alerted = false;
    this.staggerTimer = 0;
  }

  update(dt, game) {
    if (this.dead) return;
    this.flash = Math.max(0, this.flash - dt);
    this.anim += dt * (2 + Math.abs(this.vx) * 0.02);
    this.mx *= Math.pow(0.05, dt);
    this.my *= Math.pow(0.05, dt);
    this.vy = Math.min(this.vy + 1900 * dt, 1000);

    const p = game.player;
    const dx = p ? p.cx - (this.x + this.w / 2) : 0;
    const dy = p ? p.cy - (this.y + this.h / 2) : 0;
    const d = p ? Math.hypot(dx, dy) : 9999;
    this.alerted = !!p && !p.dead && d < 420;

    if (this.training) {
      this.vx = 0;
      if (p) this.dir = dx > 0 ? 1 : -1;
      moveBody(this, game.level, dt);
      return;
    }

    if (this.staggerTimer > 0) {
      this.staggerTimer -= dt;
      this.vx = approach(this.vx, 0, 2600 * dt);
      if (this.staggerTimer <= 0) {
        this.state = this.alerted ? 'chase' : 'patrol';
        this.attackCd = 0.5;
      }
      moveBody(this, game.level, dt);
      return;
    }

    this.attackCd = Math.max(0, this.attackCd - dt);
    this.timer = Math.max(0, this.timer - dt);

    if (this.state === 'patrol') {
      this.vx = this.dir * this.speed + this.mx;
      if (this.alerted) {
        this.state = 'chase';
        this.dir = dx > 0 ? 1 : -1;
      }
    } else if (this.state === 'chase') {
      if (!this.alerted) {
        this.state = 'patrol';
      } else {
        this.dir = dx > 0 ? 1 : -1;
        this.vx = this.dir * this.speed * 1.7 + this.mx;
        if (d < 128 && Math.abs(dy) < 76 && this.attackCd <= 0) {
          this.state = 'windup';
          this.timer = 0.42 / this.aggro;
          this.vx = 0;
          Sfx.tone(150, 0.12, { type: 'sawtooth', vol: 0.05, slide: 80 });
          FX.burst(this.x + this.w / 2, this.y + this.h / 2, 5, {
            color: '#ffb066', speedMax: 80, lifeMax: 0.3
          });
        }
      }
    } else if (this.state === 'windup') {
      this.vx = approach(this.vx, 0, 3000 * dt);
      if (this.timer <= 0) {
        this.state = 'strike';
        this.timer = 0.28;
        this.vx = this.dir * 520;
        this.attackCd = 2.1 / this.aggro;
        Sfx.tone(220, 0.1, { type: 'square', vol: 0.06, slide: -80 });
      }
    } else if (this.state === 'strike') {
      this.vx = approach(this.vx, this.dir * 520, 1600 * dt);
      if (p && !p.dead && aabb(this, p)) {
        if (p.parryTimer > 0) {
          p.parrySuccess();
          this.stagger(1.0);
        } else {
          p.hurt(2, this.x + this.w / 2, this, true);
        }
        this.state = 'recover';
        this.timer = 0.4;
        this.vx *= -0.25;
      }
      if (this.timer <= 0) {
        this.state = 'recover';
        this.timer = 0.45;
      }
    } else if (this.state === 'recover') {
      this.vx = approach(this.vx, 0, 2400 * dt);
      if (this.timer <= 0) this.state = this.alerted ? 'chase' : 'patrol';
    }

    this.vy += this.my;
    moveBody(this, game.level, dt);

    if (this.hitWall) {
      if (this.state === 'strike') {
        this.state = 'recover';
        this.timer = 0.35;
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

    if (p && !p.dead && aabb(this, p) && this.state !== 'strike') {
      p.hurt(1, this.x + this.w / 2, this, false);
    }

    if (this.y > game.level.heightPx + 120) this.dead = true;
  }

  stagger(seconds) {
    this.staggerTimer = Math.max(this.staggerTimer, seconds);
    this.state = 'stagger';
    this.flash = Math.max(this.flash, 0.2);
    this.vx = 0;
  }

  hurt(n, game, source = null) {
    if (this.dead) return;
    if (this.invulnerable) {
      this.flash = 0.12;
      FX.burst(this.x + this.w / 2, this.y + this.h / 2, 4, {
        color: '#ffd24d', speedMax: 100, lifeMax: 0.25
      });
      Sfx.tone(900, 0.05, { type: 'square', vol: 0.03 });
      return;
    }
    this.hp -= n;
    this.flash = 0.15;
    FX.burst(this.x + this.w / 2, this.y + this.h / 2, 6, {
      color: '#6dff9e', speedMax: 160, lifeMax: 0.4
    });
    if (source) {
      const dir = Math.sign((this.x + this.w / 2) - (source.cx || source.x + source.w / 2)) || 1;
      this.mx = clamp((this.mx || 0) + dir * 140, -500, 500);
    }
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
    const striking = this.state === 'strike';
    const stagger = this.state === 'stagger';

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 19, y + 39, 17, 4, 0, 0, TAU);
    ctx.fill();

    if (this.training) {
      // boneco de treino
      ctx.fillStyle = '#5c8a28';
      ctx.fillRect(x + 13, y + 30, 12, 8);
      ctx.fillStyle = '#c6f06a';
      ctx.fillRect(x + 9, y + 10 + bob, 20, 22);
      ctx.fillStyle = '#e4ff9a';
      ctx.fillRect(x + 9, y + 10 + bob, 20, 3);
      ctx.fillStyle = '#ff5d6c';
      ctx.fillRect(x + 13, y + 16 + bob, 12, 12);
      ctx.fillStyle = '#fff2c0';
      ctx.fillRect(x + 16, y + 19 + bob, 6, 6);
      ctx.fillStyle = '#ff8c42';
      ctx.fillRect(x + 4, y + 16 + bob, 6, 18);
      ctx.fillRect(x + 28, y + 16 + bob, 6, 18);
      ctx.fillStyle = '#5c8a28';
      ctx.fillRect(x + 17, y + 2 + bob, 4, 8);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(x + 15, y - 2 + bob, 8, 4);
      if (this.flash > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = this.flash * 4;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, y + 2 + bob, 30, 36);
      }
      ctx.restore();
      return;
    }

    const body = this.flash > 0 ? '#ffffff' : charging ? '#b84a2a' : '#2f7a48';
    const dark = this.flash > 0 ? '#ffffff' : '#173d26';
    const eye = charging ? '#ff2d4a' : '#c6ff6a';

    // pernas
    ctx.fillStyle = dark;
    ctx.fillRect(x + 7, y + 28, 8, 10);
    ctx.fillRect(x + 23, y + 28, 8, 10);
    ctx.fillStyle = '#0f2618';
    ctx.fillRect(x + 5, y + 36, 12, 3);
    ctx.fillRect(x + 21, y + 36, 12, 3);

    // corpo
    ctx.fillStyle = body;
    ctx.fillRect(x + 4, y + 9 + bob, 30, 21);
    ctx.fillStyle = dark;
    ctx.fillRect(x + 4, y + 26 + bob, 30, 4);
    ctx.fillStyle = '#8fe0a0';
    ctx.fillRect(x + 7, y + 11 + bob, 24, 2);

    // braços
    ctx.fillStyle = dark;
    ctx.fillRect(x - 2, y + 13 + bob, 6, 13);
    ctx.fillRect(x + 34, y + 13 + bob, 6, 13);
    // cassetete
    ctx.fillStyle = '#ffb066';
    ctx.fillRect(x + (this.dir > 0 ? 37 : -5), y + 20 + bob, 4, 14);

    // cabeça
    ctx.fillStyle = this.flash > 0 ? '#ffffff' : '#3f8f56';
    ctx.fillRect(x + 7, y + 1 + bob, 24, 10);
    ctx.fillStyle = '#14331f';
    ctx.fillRect(x + 9, y + 4 + bob, 20, 5);
    ctx.fillStyle = eye;
    ctx.shadowColor = eye;
    ctx.shadowBlur = charging ? 16 : 8;
    ctx.fillRect(this.dir > 0 ? x + 23 : x + 11, y + 5 + bob, 6, 3);
    ctx.shadowBlur = 0;

    // quepe de monitor
    ctx.fillStyle = '#1c5c32';
    ctx.fillRect(x + 5, y - 1 + bob, 28, 4);
    ctx.fillStyle = '#2f8a4c';
    ctx.fillRect(x + 8, y - 3 + bob, 22, 3);
    ctx.fillStyle = '#ffd24d';
    ctx.fillRect(x + 17, y - 2 + bob, 4, 2);

    if (charging) {
      ctx.fillStyle = '#ff5d6c';
      ctx.shadowColor = '#ff2d4a';
      ctx.shadowBlur = 12;
      ctx.font = 'bold 20px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x + 19, y - 16 + bob);
      ctx.shadowBlur = 0;
    } else if (striking) {
      ctx.strokeStyle = 'rgba(255,120,80,0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const tx = x + 19 - this.dir * (22 + i * 9);
        ctx.beginPath();
        ctx.moveTo(tx, y + 12 + i * 6);
        ctx.lineTo(tx - this.dir * 12, y + 12 + i * 6);
        ctx.stroke();
      }
    } else if (stagger) {
      ctx.fillStyle = '#ffd24d';
      ctx.font = 'bold 14px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', x + 19, y - 8 + bob);
    }

    ctx.restore();
  }
}

/* ------------------------------ DRONE ------------------------------ */

class Drone {
  constructor(x, y, game, opts = {}) {
    const diff = (game && game.diff) || DIFFICULTIES[1];
    this.game = game;
    this.opts = opts;
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
    this.training = !!opts.training;
    this.tag = opts.tag || null;
    this.parryTrainer = !!opts.parryTrainer;
    this.fixed = !!opts.fixed;
    this.invulnerable = !!opts.invulnerable;
    this.hp = Math.max(1, Math.round((opts.hp || 2) * (this.training ? 1 : diff.enemyHp)));
    this.maxHp = this.hp;
    this.projSpeed = (this.parryTrainer ? 210 : 300) * diff.projSpeed;
    this.burstCount = this.parryTrainer ? 1 : diff.burst;
    this.aggro = diff.aggression;
    this.flash = 0;
    this.dead = false;
    this.phase = rand(0, TAU);
    this.shootTimer = this.training ? 0.8 : rand(1.2, 2.4) / this.aggro;
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
      if (!this.fixed && d < 470) {
        const ang = Math.atan2(cy - p.cy, cx - p.cx) + Math.sin(this.orbit) * 0.55;
        tx = lerp(tx, p.cx + Math.cos(ang) * 155 - this.w / 2, 0.35);
        ty = lerp(ty, p.cy + Math.sin(ang) * 120 - this.h / 2, 0.3);
      }

      if (!this.training && d < 540 && this.mode === 'hover' && this.shootTimer <= 0) {
        this.mode = 'aim';
        this.aimTimer = (this.parryTrainer ? 0.8 : 0.5) / this.aggro;
        Sfx.tone(700, 0.08, { type: 'square', vol: 0.03, slide: 120 });
      }

      if (this.training && this.tag === 'shoot') {
        this.mode = 'hover';
      }

      if (this.parryTrainer && d < 700 && this.mode === 'hover' && this.shootTimer <= 0) {
        this.mode = 'aim';
        this.aimTimer = 0.8;
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
        this.burstTimer = this.parryTrainer ? 0.5 : 0.12;
        if (this.burstLeft <= 0) {
          this.mode = 'hover';
          this.shootTimer = this.parryTrainer ? 1.8 : rand(1.9, 3.0) / this.aggro;
        }
      }
    }

    const moveScale = this.mode === 'aim' ? 0.35 : 1;
    const targetVx = clamp((tx - this.x) * 2.2, -150, 150) * moveScale + this.mx;
    const targetVy = clamp((ty - this.y) * 2.2, -150, 150) * moveScale + this.my;
    this.vx = targetVx;
    this.vy = targetVy;

    moveBody(this, game.level, dt);

    if (this.hitWall) {
      this.mx = 0;
    }

    if (p && !p.dead && aabb(this, p)) p.hurt(1, this.x + this.w / 2, this, false);
    if (this.y > game.level.heightPx + 120) this.dead = true;
  }

  fire(game) {
    const p = game.player;
    if (!p || p.dead) return;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const lead = this.parryTrainer ? 0 : 0.14;
    const ang = Math.atan2((p.cy + p.vy * lead) - cy, (p.cx + p.vx * lead) - cx);
    const a = ang + (this.parryTrainer ? 0 : (Math.random() - 0.5) * 0.06);
    const spd = this.projSpeed;
    game.projectiles.push(new Projectile(cx, cy, Math.cos(a) * spd, Math.sin(a) * spd, 'enemy', {
      color: this.parryTrainer ? '#ffd24d' : '#ff5a6e',
      r: this.parryTrainer ? 9 : 6,
      damage: 1,
      parryable: true,
      life: this.parryTrainer ? 4 : 3
    }));
    this.muzzle = 0.12;
    Sfx.tone(this.parryTrainer ? 640 : 520, 0.07, { type: 'square', vol: 0.045, slide: -160 });
    FX.burst(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12, 4, {
      color: this.parryTrainer ? '#ffd24d' : '#ff5a6e', speedMax: 110, lifeMax: 0.25
    });
  }

  hurt(n, game, source = null) {
    if (this.dead) return;
    const shotTarget = this.training && this.tag === 'shoot';
    if (this.invulnerable || (shotTarget && !(source && source.owner === 'player'))) {
      this.flash = 0.12;
      FX.burst(this.x + this.w / 2, this.y + this.h / 2, 5, {
        color: '#ffd24d', speedMax: 100, lifeMax: 0.25
      });
      Sfx.tone(900, 0.05, { type: 'square', vol: 0.03 });
      return;
    }
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
    const eye = this.parryTrainer ? '#ffd24d' : alert ? '#ff5a6e' : '#7ffff0';

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + 18, y + 42, 14, 4, 0, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = 'rgba(127,255,240,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 6 + bob);
    ctx.lineTo(x + 30, y + 6 + bob);
    ctx.stroke();

    ctx.fillStyle = this.flash > 0 ? '#ffffff' : this.parryTrainer ? '#7a6a20' : '#2f5f66';
    ctx.fillRect(x + 3, y + 7 + bob, 30, 15);
    ctx.strokeStyle = '#123a40';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, y + 7 + bob, 30, 15);

    ctx.fillStyle = eye;
    ctx.shadowColor = eye;
    ctx.shadowBlur = alert ? 18 : 12;
    ctx.fillRect(x + 13, y + 11 + bob, 10, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 16, y + 12 + bob, 3, 2);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0b262b';
    ctx.fillRect(x + 1, y + 10 + bob, 3, 10);
    ctx.fillRect(x + 32, y + 10 + bob, 3, 10);

    // hélice
    ctx.strokeStyle = 'rgba(200,255,240,0.5)';
    ctx.lineWidth = 2;
    const spin = this.phase * 20;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 1 + bob);
    ctx.lineTo(x + 28, y + 1 + bob);
    ctx.moveTo(x + 18 + Math.cos(spin) * 10, y + 1 + bob);
    ctx.lineTo(x + 18 - Math.cos(spin) * 10, y + 1 + bob);
    ctx.stroke();

    if (this.mode === 'aim' && this.game && this.game.player && !this.game.player.dead) {
      const p = this.game.player;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = this.parryTrainer ? 'rgba(255,210,77,0.6)' : 'rgba(255,90,110,0.5)';
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

    if (this.training && this.tag === 'shoot') {
      ctx.strokeStyle = 'rgba(109,255,158,0.7)';
      ctx.lineWidth = 2;
      const rr = 24 + Math.sin(this.phase * 2) * 3;
      ctx.beginPath();
      ctx.arc(x + 18, y + 14 + bob, rr, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 18 - rr - 5, y + 14 + bob);
      ctx.lineTo(x + 18 + rr + 5, y + 14 + bob);
      ctx.moveTo(x + 18, y + 14 + bob - rr - 5);
      ctx.lineTo(x + 18, y + 14 + bob + rr + 5);
      ctx.stroke();
    }

    if (this.parryTrainer) {
      ctx.strokeStyle = '#ffd24d';
      ctx.globalAlpha = 0.5 + Math.sin(this.phase * 3) * 0.3;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + 18, y + 14 + bob, 30 + Math.sin(this.phase * 3) * 4, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (this.muzzle > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = this.muzzle / 0.12;
      ctx.fillStyle = this.parryTrainer ? '#ffd24d' : '#ff5a6e';
      ctx.shadowColor = this.parryTrainer ? '#ffd24d' : '#ff5a6e';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(x + 18, y + 15 + bob, 9, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

/* ------------------------------ NOVOS INIMIGOS ------------------------------ */

function lerpAngle(a, b, t) {
  const d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
  return a + d * t;
}

/* Sentinela: torreta fixa, mira devagar e dispara orbes paráveis. */
class Turret {
  constructor(x, y, game, opts = {}) {
    const diff = (game && game.diff) || DIFFICULTIES[1];
    this.game = game;
    this.opts = opts;
    this.w = 42;
    this.h = 48;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.cx = this.x + this.w / 2;
    this.cy = this.y + this.h * 0.38;
    this.hp = Math.max(1, Math.round((opts.hp || 4) * diff.enemyHp));
    this.maxHp = this.hp;
    this.range = opts.range || 560;
    this.damage = opts.damage || 1;
    this.color = opts.color || '#ffd24d';
    this.aggro = diff.aggression;
    this.angle = Math.PI;
    this.cd = rand(0.7, 1.4);
    this.charge = 0;
    this.staggerTimer = 0;
    this.flash = 0;
    this.phase = rand(0, TAU);
    this.dead = false;
  }

  update(dt, game) {
    if (this.dead) return;
    this.flash = Math.max(0, this.flash - dt);
    this.phase += dt * 2;
    if (this.staggerTimer > 0) {
      this.staggerTimer -= dt;
      this.charge = 0;
      return;
    }

    const p = game.player;
    if (!p || p.dead) return;
    const target = Math.atan2(p.cy - this.cy, p.cx - this.cx);
    this.angle = lerpAngle(this.angle, target, clamp(dt * 5.5, 0, 1));
    const d = dist(this.cx, this.cy, p.cx, p.cy);
    this.cd -= dt;

    if (this.charge > 0) {
      this.charge -= dt;
      if (this.charge <= 0) this.fire(game);
    } else if (d < this.range && this.cd <= 0) {
      this.charge = 0.55 / this.aggro;
      this.cd = 2.15 / this.aggro + rand(0, 0.35);
      Sfx.tone(620, 0.08, { type: 'square', vol: 0.035, slide: 120 });
      FX.burst(this.cx + Math.cos(this.angle) * 24, this.cy + Math.sin(this.angle) * 24, 5, {
        color: this.color, speedMax: 80, lifeMax: 0.25
      });
    }
  }

  fire(game) {
    const spd = 285 * (game.diff ? game.diff.projSpeed : 1);
    const bx = this.cx + Math.cos(this.angle) * 25;
    const by = this.cy + Math.sin(this.angle) * 25;
    game.projectiles.push(new Projectile(bx, by, Math.cos(this.angle) * spd, Math.sin(this.angle) * spd, 'enemy', {
      color: this.color,
      r: 7,
      damage: this.damage,
      parryable: true,
      life: 3.2
    }));
    this.charge = 0;
    this.flash = 0.1;
    FX.burst(bx, by, 8, { color: this.color, speedMax: 150, lifeMax: 0.3 });
    Sfx.tone(520, 0.08, { type: 'square', vol: 0.04, slide: -140 });
  }

  stagger(seconds) {
    this.staggerTimer = Math.max(this.staggerTimer, seconds);
    this.charge = 0;
    this.cd = Math.max(this.cd, 0.7);
    this.flash = Math.max(this.flash, 0.2);
  }

  hurt(n, game, source = null) {
    if (this.dead) return;
    this.hp -= n;
    this.flash = 0.16;
    FX.burst(this.cx, this.cy, 6, { color: this.color, speedMax: 160, lifeMax: 0.4 });
    if (this.hp <= 0) {
      this.dead = true;
      game.onEnemyKilled(this);
    }
  }

  render(ctx, cam) {
    if (this.dead) return;
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    const cx = this.cx - cam.x;
    const cy = this.cy - cam.y;
    const charge = this.charge > 0 ? 1 - this.charge / 0.7 : 0;
    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, y + this.h + 2, 22, 5, 0, 0, TAU);
    ctx.fill();

    // base
    ctx.fillStyle = '#1b2b22';
    ctx.fillRect(x + 3, y + this.h - 14, this.w - 6, 14);
    ctx.fillStyle = this.flash > 0 ? '#ffffff' : '#315b42';
    ctx.fillRect(x + 6, y + this.h - 20, this.w - 12, 8);
    ctx.fillStyle = withAlpha(this.color, 0.35);
    ctx.fillRect(x + 10, y + this.h - 18, this.w - 20, 2);

    // corpo
    ctx.fillStyle = this.flash > 0 ? '#ffffff' : '#254434';
    ctx.fillRect(x + 8, y + 8, this.w - 16, 26);
    ctx.fillStyle = '#12241a';
    ctx.fillRect(x + 12, y + 12, this.w - 24, 16);
    ctx.fillStyle = withAlpha(this.color, 0.9);
    ctx.fillRect(x + 16, y + 17, 10, 6);

    // cano
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle);
    ctx.fillStyle = '#18291f';
    ctx.fillRect(0, -6, 26, 12);
    ctx.fillStyle = this.flash > 0 ? '#ffffff' : '#3e6e50';
    ctx.fillRect(2, -4, 22, 8);
    ctx.fillStyle = this.color;
    ctx.fillRect(20, -3, 8, 6);
    if (this.charge > 0) {
      ctx.fillStyle = withAlpha(this.color, 0.55 + Math.sin(this.phase * 9) * 0.25);
      ctx.beginPath();
      ctx.arc(29, 0, 5 + charge * 7, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // anel de carga
    if (this.charge > 0) {
      ctx.strokeStyle = withAlpha(this.color, 0.55);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 18 + charge * 10, 0, TAU);
      ctx.stroke();
    }

    // vida
    if (this.hp < this.maxHp) {
      const bw = 34;
      ctx.fillStyle = 'rgba(2,10,6,0.8)';
      ctx.fillRect(cx - bw / 2, y - 9, bw, 4);
      ctx.fillStyle = this.color;
      ctx.fillRect(cx - bw / 2, y - 9, bw * clamp(this.hp / this.maxHp, 0, 1), 4);
    }
    ctx.restore();
  }
}

/* Corredor: patrulha, trava a mira e investe em linha reta. */
class Charger {
  constructor(x, y, game, opts = {}) {
    const diff = (game && game.diff) || DIFFICULTIES[1];
    this.game = game;
    this.opts = opts;
    this.w = 44;
    this.h = 32;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.vx = 0;
    this.vy = 0;
    this.mx = 0;
    this.my = 0;
    this.onGround = false;
    this.hitWall = 0;
    this.dir = -1;
    this.hp = Math.max(1, Math.round((opts.hp || 5) * diff.enemyHp));
    this.maxHp = this.hp;
    this.speed = 74 * diff.enemySpeed;
    this.aggro = diff.aggression;
    this.state = 'patrol';
    this.timer = 0;
    this.flash = 0;
    this.anim = 0;
    this.dead = false;
  }

  update(dt, game) {
    if (this.dead) return;
    this.flash = Math.max(0, this.flash - dt);
    this.anim += dt * (4 + Math.abs(this.vx) * 0.02);
    this.mx *= Math.pow(0.05, dt);
    this.my *= Math.pow(0.05, dt);
    this.vy = Math.min(this.vy + 1900 * dt, 1000);

    const p = game.player;
    const dx = p ? p.cx - (this.x + this.w / 2) : 0;
    const dy = p ? p.cy - (this.y + this.h / 2) : 0;
    const d = p ? Math.hypot(dx, dy) : 9999;
    this.timer = Math.max(0, this.timer - dt);

    if (this.state === 'patrol') {
      this.vx = this.dir * this.speed;
      if (p && !p.dead && d < 500 && Math.abs(dy) < 110) {
        this.state = 'windup';
        this.timer = 0.48 / this.aggro;
        this.dir = dx > 0 ? 1 : -1;
        this.vx = 0;
        Sfx.tone(150, 0.12, { type: 'sawtooth', vol: 0.05, slide: 90 });
        FX.burst(this.x + this.w / 2, this.y + this.h / 2, 6, {
          color: '#ff8c42', speedMax: 90, lifeMax: 0.3
        });
      }
    } else if (this.state === 'windup') {
      this.vx = approach(this.vx, 0, 2600 * dt);
      if (this.timer <= 0) {
        this.state = 'charge';
        this.timer = 0.62;
        this.vx = this.dir * 610 * (game.diff ? game.diff.enemySpeed : 1);
        Sfx.tone(230, 0.12, { type: 'square', vol: 0.07, slide: -90 });
        FX.burst(this.x + this.w / 2, this.y + this.h / 2, 10, {
          color: '#ff8c42', speedMax: 200, lifeMax: 0.35, shape: 'line'
        });
      }
    } else if (this.state === 'charge') {
      this.vx = this.dir * 610 * (game.diff ? game.diff.enemySpeed : 1);
      if (this.timer <= 0 || this.hitWall) {
        this.state = 'stun';
        this.timer = 0.55;
        this.vx = -this.dir * 120;
        if (this.hitWall) {
          game.shake(0.16);
          FX.burst(this.x + this.w / 2, this.y + this.h / 2, 10, {
            color: '#ffd24d', speedMax: 160, lifeMax: 0.35
          });
        }
      }
    } else if (this.state === 'stun') {
      this.vx = approach(this.vx, 0, 2200 * dt);
      if (this.timer <= 0) this.state = 'patrol';
    }

    moveBody(this, game.level, dt);

    if (this.hitWall && this.state === 'charge') {
      this.state = 'stun';
      this.timer = 0.55;
      this.vx = -this.dir * 100;
    }

    if (this.onGround && this.state === 'patrol') {
      const aheadX = this.dir > 0 ? this.x + this.w + 4 : this.x - 4;
      if (!game.level.isSolid(aheadX, this.y + this.h + 8)) this.dir *= -1;
    }

    if (p && !p.dead && aabb(this, p) && this.state !== 'stun') {
      if (p.parryTimer > 0) {
        p.parrySuccess();
        this.stagger(1.1);
      } else {
        p.hurt(2, this.x + this.w / 2, this, true);
        this.state = 'stun';
        this.timer = 0.5;
        this.vx = -this.dir * 180;
      }
    }

    if (this.y > game.level.heightPx + 120) this.dead = true;
  }

  stagger(seconds) {
    this.state = 'stun';
    this.timer = Math.max(this.timer, seconds);
    this.vx = 0;
    this.flash = Math.max(this.flash, 0.2);
  }

  hurt(n, game, source = null) {
    if (this.dead) return;
    this.hp -= n;
    this.flash = 0.16;
    FX.burst(this.x + this.w / 2, this.y + this.h / 2, 6, {
      color: '#ff8c42', speedMax: 170, lifeMax: 0.4
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
    const charge = this.state === 'charge';
    const windup = this.state === 'windup';
    const stun = this.state === 'stun';
    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + this.w / 2, y + this.h + 2, 22, 5, 0, 0, TAU);
    ctx.fill();

    if (charge) {
      ctx.fillStyle = 'rgba(255,140,66,0.18)';
      for (let i = 1; i < 5; i++) {
        ctx.fillRect(x - i * 12 + (this.dir > 0 ? 0 : this.w), y + 8 + i * 3, 18, 3);
      }
    }

    // rodas
    ctx.fillStyle = '#18231a';
    ctx.fillRect(x + 4, y + this.h - 8, 12, 8);
    ctx.fillRect(x + this.w - 16, y + this.h - 8, 12, 8);
    ctx.fillStyle = '#3e6e50';
    ctx.fillRect(x + 7, y + this.h - 6, 6, 4);
    ctx.fillRect(x + this.w - 13, y + this.h - 6, 6, 4);

    // chassi
    ctx.fillStyle = this.flash > 0 ? '#ffffff' : '#3a2418';
    ctx.fillRect(x + 4, y + 6, this.w - 8, this.h - 14);
    ctx.fillStyle = '#ff8c42';
    ctx.fillRect(x + 8, y + 9, this.w - 16, 4);
    ctx.fillStyle = '#20140e';
    ctx.fillRect(x + 10, y + 15, this.w - 20, 8);

    // visor
    ctx.fillStyle = stun ? '#7a5a20' : windup ? '#ffd24d' : '#ff5d4a';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = windup || charge ? 12 : 5;
    ctx.fillRect(this.dir > 0 ? x + this.w - 18 : x + 8, y + 13, 10, 5);
    ctx.shadowBlur = 0;

    // antenas
    ctx.fillStyle = '#315b42';
    ctx.fillRect(x + 10, y + 2, 3, 6);
    ctx.fillRect(x + this.w - 13, y + 2, 3, 6);
    ctx.fillStyle = windup ? '#ffd24d' : '#6dff9e';
    ctx.fillRect(x + 10, y, 3, 3);
    ctx.fillRect(x + this.w - 13, y, 3, 3);

    if (this.hp < this.maxHp) {
      const bw = 36;
      ctx.fillStyle = 'rgba(2,10,6,0.8)';
      ctx.fillRect(x + this.w / 2 - bw / 2, y - 9, bw, 4);
      ctx.fillStyle = '#ff8c42';
      ctx.fillRect(x + this.w / 2 - bw / 2, y - 9, bw * clamp(this.hp / this.maxHp, 0, 1), 4);
    }
    ctx.restore();
  }
}

/* Vigia: drone de asas que ronda e mergulha no jogador. */
class Swooper {
  constructor(x, y, game, opts = {}) {
    const diff = (game && game.diff) || DIFFICULTIES[1];
    this.game = game;
    this.opts = opts;
    this.w = 46;
    this.h = 32;
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
    this.hp = Math.max(1, Math.round((opts.hp || 3) * diff.enemyHp));
    this.maxHp = this.hp;
    this.aggro = diff.aggression;
    this.state = 'hover';
    this.timer = rand(0.4, 1.1);
    this.phase = rand(0, TAU);
    this.anim = 0;
    this.flash = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.dead = false;
  }

  update(dt, game) {
    if (this.dead) return;
    this.flash = Math.max(0, this.flash - dt);
    this.phase += dt * 1.6;
    this.anim += dt * 8;
    this.mx *= Math.pow(0.06, dt);
    this.my *= Math.pow(0.06, dt);

    const p = game.player;
    const dx = p ? p.cx - (this.x + this.w / 2) : 0;
    const dy = p ? p.cy - (this.y + this.h / 2) : 0;
    const d = p ? Math.hypot(dx, dy) : 9999;
    this.timer -= dt;

    if (this.state === 'hover') {
      const tx = this.homeX + Math.sin(this.phase) * 78;
      const ty = this.homeY + Math.sin(this.phase * 1.7) * 20;
      this.vx = lerp(this.vx, clamp((tx - this.x) * 2.4, -180, 180), clamp(dt * 3, 0, 1));
      this.vy = lerp(this.vy, clamp((ty - this.y) * 2.4, -160, 160), clamp(dt * 3, 0, 1));
      if (p && !p.dead && d < 500 && this.timer <= 0) {
        this.state = 'windup';
        this.timer = 0.5 / this.aggro;
        this.targetX = p.cx;
        this.targetY = p.cy;
        this.vx *= 0.2;
        this.vy *= 0.2;
        Sfx.tone(760, 0.1, { type: 'square', vol: 0.04, slide: 200 });
        FX.burst(this.x + this.w / 2, this.y + this.h / 2, 8, {
          color: '#ff5d4a', speedMax: 120, lifeMax: 0.3
        });
      }
    } else if (this.state === 'windup') {
      this.vx = approach(this.vx, 0, 1600 * dt);
      this.vy = approach(this.vy, 0, 1600 * dt);
      if (this.timer <= 0) {
        const ang = Math.atan2(this.targetY - (this.y + this.h / 2), this.targetX - (this.x + this.w / 2));
        const spd = 610 * (game.diff ? game.diff.enemySpeed : 1);
        this.vx = Math.cos(ang) * spd;
        this.vy = Math.sin(ang) * spd;
        this.state = 'dive';
        this.timer = 0.85;
        Sfx.tone(260, 0.14, { type: 'sawtooth', vol: 0.07, slide: -120 });
      }
    } else if (this.state === 'dive') {
      if (this.timer <= 0 || this.hitWall || this.onGround) {
        this.state = 'return';
        this.timer = 1.1;
        this.vx *= 0.2;
        this.vy = -210;
      }
    } else if (this.state === 'return') {
      const tx = this.homeX + Math.sin(this.phase) * 70;
      const ty = this.homeY;
      this.vx = lerp(this.vx, clamp((tx - this.x) * 2.8, -210, 210), clamp(dt * 3.5, 0, 1));
      this.vy = lerp(this.vy, clamp((ty - this.y) * 2.8, -240, 240), clamp(dt * 3.5, 0, 1));
      if (this.timer <= 0 || (Math.abs(this.x - tx) < 14 && Math.abs(this.y - ty) < 14)) {
        this.state = 'hover';
        this.timer = 1.3;
      }
    }

    moveBody(this, game.level, dt);

    if (this.hitWall && this.state === 'dive') {
      this.state = 'return';
      this.timer = 0.9;
      this.vy = -180;
    }

    if (p && !p.dead && this.state === 'dive' && aabb(this, p)) {
      if (p.parryTimer > 0) {
        p.parrySuccess();
        this.stagger(1);
      } else {
        p.hurt(2, this.x + this.w / 2, this, true);
        this.state = 'return';
        this.timer = 0.8;
        this.vx *= -0.4;
        this.vy = -220;
      }
    }

    if (this.y > game.level.heightPx + 120) this.dead = true;
  }

  stagger(seconds) {
    this.state = 'return';
    this.timer = Math.max(this.timer, seconds);
    this.vx = 0;
    this.vy = -140;
    this.flash = Math.max(this.flash, 0.2);
  }

  hurt(n, game, source = null) {
    if (this.dead) return;
    this.hp -= n;
    this.flash = 0.16;
    FX.burst(this.x + this.w / 2, this.y + this.h / 2, 6, {
      color: '#ff5d4a', speedMax: 180, lifeMax: 0.4
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
    const cx = x + this.w / 2;
    const cy = y + this.h / 2;
    const diving = this.state === 'dive';
    const windup = this.state === 'windup';
    const wing = Math.sin(this.anim) * 8;
    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, y + this.h + 6, 18, 4, 0, 0, TAU);
    ctx.fill();

    // asas
    ctx.fillStyle = this.flash > 0 ? '#ffffff' : '#3a2418';
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 10);
    ctx.lineTo(x - 12, y + 2 + wing);
    ctx.lineTo(x + 10, y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + this.w - 4, y + 10);
    ctx.lineTo(x + this.w + 12, y + 2 - wing);
    ctx.lineTo(x + this.w - 10, y + 20);
    ctx.closePath();
    ctx.fill();

    // corpo
    ctx.fillStyle = this.flash > 0 ? '#ffffff' : '#3b2a1e';
    ctx.fillRect(x + 8, y + 8, this.w - 16, 18);
    ctx.fillStyle = '#ff8c42';
    ctx.fillRect(x + 12, y + 11, this.w - 24, 3);
    ctx.fillStyle = '#1a110a';
    ctx.fillRect(x + 13, y + 16, this.w - 26, 6);

    // olho
    ctx.fillStyle = diving ? '#ff3355' : windup ? '#ffd24d' : '#7ffff0';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = diving || windup ? 14 : 6;
    ctx.beginPath();
    ctx.arc(cx, y + 19, 4, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    // hélice
    ctx.strokeStyle = withAlpha('#7ffff0', 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 9, y + 4);
    ctx.lineTo(cx + 9, y + 4);
    ctx.stroke();

    if (this.hp < this.maxHp) {
      const bw = 34;
      ctx.fillStyle = 'rgba(2,10,6,0.8)';
      ctx.fillRect(cx - bw / 2, y - 8, bw, 4);
      ctx.fillStyle = '#ff5d4a';
      ctx.fillRect(cx - bw / 2, y - 8, bw * clamp(this.hp / this.maxHp, 0, 1), 4);
    }
    ctx.restore();
  }
}

/* ------------------------------ CHEFE ------------------------------ */

const BOSS_PATTERNS = {
  guardian: [
    ['slam', 'charge'],
    ['slam', 'charge', 'bash', 'summon'],
    ['slam', 'summon', 'bash', 'charge']
  ],
  hunter: [
    ['fan', 'slash'],
    ['fan', 'slash', 'blink', 'rain'],
    ['slash', 'rain', 'fan', 'blink']
  ],
  bruiser: [
    ['jump', 'spin'],
    ['jump', 'spin', 'rocks', 'shock'],
    ['jump', 'rocks', 'shock', 'spin']
  ],
  trickster: [
    ['fan', 'blink'],
    ['fan', 'blink', 'clones', 'rain'],
    ['clones', 'blink', 'fan', 'ring']
  ],
  director: [
    ['fan', 'slash', 'summon'],
    ['ring', 'beam', 'summon', 'slash'],
    ['ring', 'beam', 'clones', 'rain', 'slash']
  ]
};

class Boss {
  constructor(x, y, cfg, game) {
    this.game = game;
    this.cfg = cfg;
    this.style = cfg.style || 'guardian';
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
    this.color = cfg.color || '#6dff9e';
    this.state = 'dormant';
    this.attack = null;
    this.lastAttack = null;
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
    this.staggerTimer = 0;
    this.airborne = false;
    this.parried = false;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get bottom() { return this.y + this.h; }

  begin(state, timer) {
    this.state = state;
    this.timer = timer;
  }

  chooseAttack(game) {
    const table = BOSS_PATTERNS[this.style] || BOSS_PATTERNS.guardian;
    const pool = table[clamp(this.phase - 1, 0, table.length - 1)].slice();
    if (pool.length > 1 && this.lastAttack) {
      const filtered = pool.filter((a) => a !== this.lastAttack);
      if (filtered.length) {
        pool.length = 0;
        pool.push(...filtered);
      }
    }
    this.attack = pick(pool);
    this.lastAttack = this.attack;
    this.attackCycle++;
    this.parried = false;
    this.state = 'tele';
    this.timer = this.teleTime(this.attack);
    this.vx = approach(this.vx, 0, 3000);
    Sfx.tone(180, 0.16, { type: 'square', vol: 0.08, slide: -40 });
    FX.burst(this.cx, this.cy, 10, { color: this.color, speedMax: 140, lifeMax: 0.4 });
  }

  teleTime(attack) {
    const base = {
      slam: 0.62, charge: 0.5, bash: 0.42, summon: 0.7,
      fan: 0.48, slash: 0.36, blink: 0.32, rain: 0.6,
      jump: 0.56, spin: 0.5, rocks: 0.46, shock: 0.55,
      clones: 0.6, ring: 0.56, beam: 0.6
    }[attack] || 0.5;
    return Math.max(0.2, base / this.aggro);
  }

  update(dt, game) {
    if (this.dead) {
      this.deathTimer -= dt;
      this.explosionTimer -= dt;
      if (this.explosionTimer <= 0 && this.deathTimer > 0) {
        this.explosionTimer = 0.12;
        FX.burst(this.cx + rand(-this.w / 2, this.w / 2), this.cy + rand(-this.h / 2, this.h / 2), 10, {
          color: pick([this.color, '#ffd24d', '#ffffff']),
          speedMax: 260, lifeMax: 0.7, sizeMax: 6
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
    this.timer -= dt;
    this.vy = Math.min(this.vy + 1900 * dt, 1000);

    const d = Math.abs(p.cx - this.cx);
    if (!this.active) {
      if (d < 760) {
        this.active = true;
        game.bossActive = true;
        game.toast(this.cfg.name + ' BLOQUEOU A SAÍDA', this.color, 2.8);
        game.shake(0.6);
        Sfx.tone(70, 0.7, { type: 'sawtooth', vol: 0.16, slide: -30 });
        this.begin('idle', 1.0 / this.aggro);
      }
      return;
    }

    if (this.phase === 1 && this.hp <= this.maxHp * 0.6) {
      this.phase = 2;
      this.speed *= 1.18;
      game.toast('FASE 2 — ' + this.cfg.name, this.color);
      game.shake(0.5);
      Sfx.tone(90, 0.5, { type: 'sawtooth', vol: 0.16, slide: 120 });
      FX.burst(this.cx, this.cy, 30, { color: this.color, speedMax: 340, lifeMax: 0.9, sizeMax: 7 });
    }

    if (this.phase === 2 && this.cfg.final && this.hp <= this.maxHp * 0.3) {
      this.phase = 3;
      this.speed *= 1.12;
      game.toast('FASE 3 — SINAL VERMELHO', '#ff5d7a');
      game.shake(0.7);
      Sfx.tone(80, 0.7, { type: 'sawtooth', vol: 0.18, slide: 180 });
      FX.burst(this.cx, this.cy, 40, { color: '#ff5d7a', speedMax: 400, lifeMax: 1.0, sizeMax: 8 });
    }

    if (this.staggerTimer > 0) {
      this.staggerTimer -= dt;
      this.vx = approach(this.vx, 0, 2400 * dt);
      moveBody(this, game.level, dt);
      if (this.staggerTimer <= 0) this.begin('idle', 0.5);
      return;
    }

    this.dir = p.cx < this.cx ? -1 : 1;

    if (this.state === 'idle') {
      this.vx = approach(this.vx, this.dir * this.speed * 0.75, 520 * dt);
      if (this.timer <= 0) this.chooseAttack(game);
    } else if (this.state === 'tele') {
      this.vx = approach(this.vx, 0, 2800 * dt);
      if (this.timer <= 0) this.startAttack(game);
    } else if (this.state === 'recover') {
      this.vx = approach(this.vx, 0, 2200 * dt);
      if (this.timer <= 0) this.begin('idle', rand(0.65, 1.15) / this.aggro);
    } else {
      this.updateAttack(dt, game);
    }

    moveBody(this, game.level, dt);

    const contact = ['charge', 'bash', 'slash', 'spin', 'slam', 'jump'].includes(this.state);
    if (contact && !this.parried) {
      const parryable = this.state === 'bash' || this.state === 'slash';
      this.contactDamage(game, parryable, this.state === 'charge' || this.state === 'slam' || this.state === 'jump' ? 2 : 1);
    }

    if (this.y > game.level.heightPx + 200) {
      this.hp = 0;
      this.die(game);
    }
  }

  updateAttack(dt, game) {
    if (this.state === 'slam' || this.state === 'jump') {
      if (this.airborne && this.vy >= 0 && this.onGround) {
        this.airborne = false;
        this.impact(game, 1.2);
        this.begin('recover', 0.5);
      } else if (this.timer <= 0) {
        this.airborne = false;
        this.impact(game, 1);
        this.begin('recover', 0.5);
      }
    } else if (this.state === 'charge') {
      if (this.hitWall || this.timer <= 0) {
        this.impact(game, 0.9);
        this.begin('recover', 0.5);
      }
    } else if (this.state === 'bash' || this.state === 'slash' || this.state === 'spin') {
      if (this.timer <= 0) this.begin('recover', 0.42);
    } else {
      this.begin('recover', 0.4);
    }
  }

  startAttack(game) {
    const p = game.player;
    const projMul = game.diff ? game.diff.projSpeed : 1;

    switch (this.attack) {
      case 'slam':
        this.vy = -780;
        this.vx = this.dir * 220;
        this.airborne = true;
        this.begin('slam', 1.2);
        game.shake(0.3);
        Sfx.tone(110, 0.24, { type: 'sawtooth', vol: 0.1, slide: 80 });
        break;
      case 'jump':
        this.vy = -820;
        this.vx = clamp((p.cx - this.cx) / 0.8, -420, 420);
        this.airborne = true;
        this.begin('jump', 1.3);
        game.shake(0.3);
        Sfx.tone(110, 0.24, { type: 'sawtooth', vol: 0.1, slide: 80 });
        break;
      case 'charge':
        this.vx = this.dir * 560;
        this.begin('charge', 0.9);
        game.shake(0.25);
        Sfx.tone(140, 0.2, { type: 'square', vol: 0.1, slide: 60 });
        break;
      case 'bash':
        this.vx = this.dir * 380;
        this.begin('bash', 0.35);
        Sfx.tone(260, 0.1, { type: 'square', vol: 0.08, slide: -60 });
        break;
      case 'slash':
        this.x = clamp(p.cx + (p.face > 0 ? -110 : 110) - this.w / 2, 64, game.level.widthPx - this.w - 64);
        this.vx = this.dir * 560;
        this.begin('slash', 0.32);
        FX.burst(this.cx, this.cy, 16, { color: this.color, speedMax: 240, lifeMax: 0.5 });
        Sfx.tone(520, 0.12, { type: 'sawtooth', vol: 0.08, slide: -180 });
        break;
      case 'fan': {
        const count = this.phase === 1 ? 3 : this.phase === 2 ? 5 : 7;
        const spread = 0.34;
        const base = Math.atan2(p.cy - (this.cy - 10), p.cx - this.cx);
        for (let i = 0; i < count; i++) {
          const ang = base + (i - (count - 1) / 2) * spread;
          const red = this.style === 'director' && this.phase === 3 && i % 2 === 0;
          const spd = (this.phase === 3 ? 400 : 340) * projMul;
          game.projectiles.push(new Projectile(
            this.cx + Math.cos(ang) * (this.w / 2 + 8),
            this.cy - 10 + Math.sin(ang) * 20,
            Math.cos(ang) * spd, Math.sin(ang) * spd,
            'enemy',
            {
              color: red ? '#ff3355' : this.color,
              r: red ? 9 : 7,
              life: 4,
              parryable: !red,
              damage: 1
            }
          ));
        }
        this.begin('recover', 0.45);
        Sfx.tone(300, 0.14, { type: 'square', vol: 0.08, slide: -100 });
        break;
      }
      case 'summon':
        this.summon(game);
        this.begin('recover', 0.55);
        break;
      case 'rain': {
        const count = this.phase === 1 ? 5 : this.phase === 2 ? 7 : 9;
        for (let i = 0; i < count; i++) {
          const x = clamp(p.cx + rand(-320, 320), 48, game.level.widthPx - 48);
          const y = Math.max(60, this.y - rand(100, 320));
          game.projectiles.push(new Projectile(
            x, y, rand(-30, 30), 430 * projMul, 'enemy',
            { color: this.color, r: 8, damage: 1, life: 4, parryable: true, gravity: 220 }
          ));
          FX.burst(x, y, 5, { color: this.color, speedMax: 90, lifeMax: 0.3 });
        }
        this.begin('recover', 0.55);
        Sfx.tone(180, 0.3, { type: 'sawtooth', vol: 0.1, slide: -80 });
        break;
      }
      case 'shock':
        this.impact(game, 1.25);
        this.begin('recover', 0.55);
        break;
      case 'rocks': {
        for (let i = 0; i < 3; i++) {
          const ang = Math.atan2(p.cy - this.cy, p.cx - this.cx) + rand(-0.18, 0.18);
          game.projectiles.push(new Projectile(
            this.cx, this.cy - 20,
            Math.cos(ang) * rand(280, 380), -rand(420, 560),
            'enemy',
            { color: '#ff8c42', r: 10, damage: 1, life: 4, parryable: true, gravity: 900, kind: 'rock' }
          ));
        }
        this.begin('recover', 0.55);
        Sfx.tone(160, 0.2, { type: 'square', vol: 0.08, slide: -60 });
        break;
      }
      case 'blink':
        this.blink(game);
        this.begin('recover', 0.4);
        break;
      case 'clones': {
        for (let i = 0; i < 3; i++) {
          const ang = rand(0, TAU);
          game.projectiles.push(new Projectile(
            this.cx, this.cy - 10,
            Math.cos(ang) * 180, Math.sin(ang) * 180,
            'enemy',
            {
              color: '#b18cff', r: 8, damage: 1, life: 4,
              parryable: true, homing: 1.4
            }
          ));
        }
        this.begin('recover', 0.5);
        Sfx.tone(420, 0.24, { type: 'triangle', vol: 0.08, slide: -220 });
        break;
      }
      case 'ring': {
        const count = this.phase === 1 ? 10 : this.phase === 2 ? 14 : 18;
        const skip = Math.round(Math.atan2(p.cy - this.cy, p.cx - this.cx) / TAU * count);
        for (let i = 0; i < count; i++) {
          if (i === skip || i === (skip + 1) % count) continue;
          const ang = (TAU * i) / count + this.anim * 0.35;
          const spd = 270 * projMul;
          game.projectiles.push(new Projectile(
            this.cx, this.cy - 10,
            Math.cos(ang) * spd, Math.sin(ang) * spd,
            'enemy',
            { color: this.color, r: 7, life: 5, parryable: true, damage: 1 }
          ));
        }
        this.begin('recover', 0.5);
        Sfx.tone(260, 0.2, { type: 'square', vol: 0.08, slide: -120 });
        break;
      }
      case 'beam': {
        const rows = this.phase === 1 ? 2 : 3;
        for (let i = 0; i < rows; i++) {
          const y = p.cy - 24 + i * 24;
          game.projectiles.push(new Projectile(
            this.cx + this.dir * (this.w / 2 + 10), y,
            this.dir * 720 * projMul, 0, 'enemy',
            { color: this.phase === 3 ? '#ff3355' : '#ffd24d', r: 8, damage: 1, life: 3, parryable: this.phase < 3 }
          ));
        }
        this.begin('recover', 0.5);
        Sfx.tone(700, 0.18, { type: 'sawtooth', vol: 0.08, slide: -400 });
        break;
      }
      default:
        this.begin('recover', 0.4);
    }
  }

  contactDamage(game, parryable, dmg) {
    const p = game.player;
    if (!p || p.dead || !aabb(this, p)) return;
    if (parryable && p.parryTimer > 0) {
      p.parrySuccess();
      this.parried = true;
      this.stagger(1.0, game);
      return;
    }
    p.hurt(dmg, this.cx, this, parryable);
  }

  shockwaves(game, mul = 1) {
    const spd = 460 * mul * (game.diff ? game.diff.projSpeed : 1);
    for (const dir of [-1, 1]) {
      game.projectiles.push(new Projectile(
        this.cx + dir * this.w * 0.34,
        this.bottom - 18,
        dir * spd, 0, 'enemy',
        { color: this.color, r: 13, life: 1.8, damage: 1, wave: true, parryable: true }
      ));
    }
  }

  impact(game, mul = 1) {
    game.shake(0.8);
    Sfx.noise(0.4, 0.2, { freq: 220 });
    Sfx.tone(70, 0.3, { type: 'sawtooth', vol: 0.14, slide: -30 });
    this.shockwaves(game, mul);
    FX.burst(this.cx, this.bottom - 10, 22, {
      color: this.color, speedMax: 320, lifeMax: 0.5, gravity: 600
    });
  }

  summon(game) {
    game.toast(this.cfg.name + ' CHAMOU REFORÇOS', this.color, 1.4);
    for (const off of [-170, 170]) {
      const x = clamp(this.cx + off, 80, game.level.widthPx - 80);
      const d = new Drone(x, this.y + 60, game, {});
      game.enemies.push(d);
      FX.burst(x, this.y + 30, 14, { color: this.color, speedMax: 180, lifeMax: 0.6 });
    }
    Sfx.tone(320, 0.3, { type: 'sawtooth', vol: 0.1, slide: -200 });
  }

  blink(game) {
    const p = game.player;
    const arena = 380;
    let x = this.cx < p.cx ? p.cx + arena : p.cx - arena;
    x = clamp(x, 90, game.level.widthPx - 90);
    FX.burst(this.cx, this.cy, 20, { color: this.color, speedMax: 260, lifeMax: 0.5 });
    this.x = x - this.w / 2;
    this.y = Math.min(this.y, game.level.heightPx - this.h - TILE * 4);
    FX.burst(this.cx, this.cy, 20, { color: this.color, speedMax: 260, lifeMax: 0.5 });
    Sfx.tone(700, 0.16, { type: 'sine', vol: 0.08, slide: -420 });
  }

  stagger(seconds, game) {
    if (this.dead) return;
    this.staggerTimer = Math.max(this.staggerTimer, seconds);
    this.state = 'stagger';
    this.vx = 0;
    this.flash = Math.max(this.flash, 0.2);
    FX.burst(this.cx, this.cy, 12, { color: '#ffd24d', speedMax: 220, lifeMax: 0.5 });
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
    const body = flash ? '#ffffff' : this.color;
    const dark = flash ? '#ffffff' : hexShade(this.color, -80);
    const light = flash ? '#ffffff' : hexShade(this.color, 40);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x + this.w / 2, y + this.h + 4, this.w * 0.45, 8, 0, 0, TAU);
    ctx.fill();

    // pernas
    ctx.fillStyle = dark;
    ctx.fillRect(x + this.w * 0.18, y + this.h - 34, this.w * 0.22, 34);
    ctx.fillRect(x + this.w * 0.60, y + this.h - 34, this.w * 0.22, 34);
    ctx.fillStyle = '#111a2c';
    ctx.fillRect(x + this.w * 0.15, y + this.h - 7, this.w * 0.28, 7);
    ctx.fillRect(x + this.w * 0.57, y + this.h - 7, this.w * 0.28, 7);

    // torso
    ctx.fillStyle = body;
    ctx.fillRect(x + this.w * 0.14, y + 28 + bob, this.w * 0.72, this.h - 66);
    ctx.fillStyle = dark;
    ctx.fillRect(x + this.w * 0.14, y + this.h - 46 + bob, this.w * 0.72, 6);
    ctx.fillStyle = light;
    ctx.fillRect(x + this.w * 0.18, y + 30 + bob, this.w * 0.64, 3);

    // braços
    ctx.fillStyle = dark;
    ctx.fillRect(x + 2, y + 36 + bob, this.w * 0.13, this.h * 0.34);
    ctx.fillRect(x + this.w - 2 - this.w * 0.13, y + 36 + bob, this.w * 0.13, this.h * 0.34);

    // cabeça
    ctx.fillStyle = flash ? '#ffffff' : '#e8b07a';
    ctx.fillRect(x + this.w / 2 - 24, y + 4 + bob, 48, 28);
    ctx.fillStyle = flash ? '#ffffff' : '#c98b58';
    ctx.fillRect(x + this.w / 2 - 24, y + 27 + bob, 48, 5);

    // estilo
    this.drawStyle(ctx, x, y, bob, body, dark, light, flash);

    // olho / visor
    if (this.style !== 'director') {
      ctx.fillStyle = '#1b1020';
      ctx.fillRect(x + this.w / 2 - 17, y + 12 + bob, 34, 9);
      ctx.fillStyle = this.dead ? '#555' : '#ff2d4a';
      ctx.shadowColor = '#ff2d4a';
      ctx.shadowBlur = 14;
      ctx.fillRect(x + this.w / 2 - 8 + this.dir * 5, y + 14 + bob, 9, 5);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#1b1020';
      ctx.fillRect(x + this.w / 2 - 18, y + 12 + bob, 15, 9);
      ctx.fillRect(x + this.w / 2 + 3, y + 12 + bob, 15, 9);
      ctx.fillStyle = '#d9ff6d';
      ctx.shadowColor = '#d9ff6d';
      ctx.shadowBlur = 10;
      ctx.fillRect(x + this.w / 2 - 15 + this.dir * 3, y + 14 + bob, 6, 4);
      ctx.fillRect(x + this.w / 2 + 6 + this.dir * 3, y + 14 + bob, 6, 4);
      ctx.shadowBlur = 0;
    }

    // fase 2/3 aura
    if (this.phase >= 2 && !this.dead) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = this.phase === 3 ? '#ff5d7a' : this.color;
      ctx.globalAlpha = 0.35 + Math.sin(this.anim * 8) * 0.12;
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 5, y - 5, this.w + 10, this.h + 10);
      ctx.restore();
    }

    // telegrafia
    if (this.state === 'tele') {
      const pulse = 0.5 + Math.sin(this.anim * 20) * 0.35;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = withAlpha(this.color, 0.5 + pulse * 0.4);
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 7, y - 7, this.w + 14, this.h + 14);
      ctx.restore();
      ctx.fillStyle = '#ffd24d';
      ctx.shadowColor = '#ffd24d';
      ctx.shadowBlur = 14;
      ctx.font = 'bold 28px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x + this.w / 2, y - 26 + bob);
      ctx.shadowBlur = 0;
      this.drawWarning(ctx, cam);
    }

    if (this.state === 'stagger') {
      ctx.fillStyle = '#ffd24d';
      ctx.font = 'bold 20px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ ★', x + this.w / 2, y - 14 + bob);
    }

    ctx.restore();
  }

  drawStyle(ctx, x, y, bob, body, dark, light, flash) {
    const cx = x + this.w / 2;
    if (this.style === 'guardian') {
      // quepe de porteiro
      ctx.fillStyle = dark;
      ctx.fillRect(cx - 28, y - 2 + bob, 56, 6);
      ctx.fillStyle = body;
      ctx.fillRect(cx - 22, y - 5 + bob, 44, 6);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(cx - 4, y - 4 + bob, 8, 4);
      // escudo
      ctx.fillStyle = '#9aa8bc';
      ctx.fillRect(x + this.w - 10, y + 52 + bob, 16, 42);
      ctx.fillStyle = '#c9d6e8';
      ctx.fillRect(x + this.w - 7, y + 58 + bob, 10, 30);
      ctx.fillStyle = this.color;
      ctx.fillRect(cx - 8, y + 64 + bob, 16, 12);
    } else if (this.style === 'hunter') {
      // rabo de cavalo e viseira
      ctx.fillStyle = '#2a1d16';
      ctx.fillRect(cx + 16, y + 2 + bob, 12, 26);
      ctx.fillRect(cx + 22, y + 20 + bob, 8, 16);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(cx - 24, y + 10 + bob, 48, 4);
      // cassetete
      ctx.strokeStyle = '#d9b06a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x + this.w - 4, y + 50 + bob);
      ctx.lineTo(x + this.w + 20, y + 18 + bob);
      ctx.stroke();
    } else if (this.style === 'bruiser') {
      // ombreiras e apito
      ctx.fillStyle = dark;
      ctx.fillRect(x - 4, y + 30 + bob, 22, 26);
      ctx.fillRect(x + this.w - 18, y + 30 + bob, 22, 26);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(cx - 6, y + 30 + bob, 12, 5);
      ctx.fillStyle = '#ff8c42';
      ctx.fillRect(cx - 2, y + 38 + bob, 4, 8);
      // halter
      ctx.fillStyle = '#9aa8bc';
      ctx.fillRect(x + this.w + 4, y + 54 + bob, 20, 8);
      ctx.fillRect(x + this.w, y + 48 + bob, 8, 20);
    } else if (this.style === 'trickster') {
      // capa e tablet
      ctx.fillStyle = withAlpha('#2a1240', 0.8);
      ctx.fillRect(x + 6, y + 44 + bob, this.w - 12, this.h - 70);
      ctx.fillStyle = '#b18cff';
      ctx.fillRect(x + this.w - 24, y + 58 + bob, 22, 16);
      ctx.fillStyle = '#e8dcff';
      ctx.fillRect(x + this.w - 21, y + 61 + bob, 16, 3);
      ctx.fillRect(x + this.w - 21, y + 67 + bob, 10, 3);
      // orbe flutuante
      const t = this.anim * 3;
      ctx.fillStyle = '#b18cff';
      ctx.shadowColor = '#b18cff';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(x - 8, y + 40 + Math.sin(t) * 5, 7, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // diretora: blazer, gravata e chave
      ctx.fillStyle = '#1b2a1a';
      ctx.fillRect(cx - 8, y + 28 + bob, 16, this.h - 66);
      ctx.fillStyle = '#d9ff6d';
      ctx.fillRect(cx - 3, y + 30 + bob, 6, 22);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(cx - 4, y + 56 + bob, 8, 8);
      ctx.fillStyle = '#1b2a1a';
      ctx.fillRect(cx - 2, y + 58 + bob, 4, 4);
      // cabelo
      ctx.fillStyle = '#2a1d16';
      ctx.fillRect(cx - 26, y + 1 + bob, 52, 8);
      ctx.fillRect(cx - 26, y + 8 + bob, 8, 20);
      ctx.fillRect(cx + 18, y + 8 + bob, 8, 20);
    }
  }

  drawWarning(ctx, cam) {
    const p = this.game.player;
    if (!p) return;
    const px = p.cx - cam.x;
    const py = p.cy - cam.y;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (this.attack === 'slam' || this.attack === 'jump') {
      const rr = 58 + Math.sin(this.anim * 18) * 6;
      ctx.strokeStyle = withAlpha('#ff5a3c', 0.7);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(px, p.bottom - cam.y, rr, 18, 0, 0, TAU);
      ctx.stroke();
    } else if (this.attack === 'charge' || this.attack === 'slash') {
      ctx.strokeStyle = withAlpha(this.color, 0.6);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px - 34, py);
      ctx.lineTo(px - 10, py);
      ctx.moveTo(px + 10, py);
      ctx.lineTo(px + 34, py);
      ctx.stroke();
    } else if (this.attack === 'fan' || this.attack === 'beam') {
      const ex = this.cx - cam.x;
      const ey = this.cy - cam.y - 10;
      ctx.strokeStyle = withAlpha(this.color, 0.55);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(px, py);
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
    this.color = opts.color || (owner === 'enemy' ? '#ff5a6e' : '#6dff9e');
    this.damage = opts.damage || 1;
    this.bossDamage = opts.bossDamage ?? 5;
    this.wave = opts.wave || false;
    this.parryable = opts.parryable !== false;
    this.homing = opts.homing || 0;
    this.gravity = opts.gravity || 0;
    this.kind = opts.kind || 'orb';
    this.dead = false;
    this.trail = 0;
    this.spin = rand(0, TAU);
  }

  update(dt, game) {
    if (this.dead) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.dead = true;
      return;
    }

    if (this.homing > 0 && this.owner === 'enemy' && game.player && !game.player.dead) {
      const p = game.player;
      const ang = Math.atan2(p.cy - this.y, p.cx - this.x);
      const spd = Math.hypot(this.vx, this.vy) || 220;
      this.vx = lerp(this.vx, Math.cos(ang) * spd, clamp(this.homing * dt, 0, 1));
      this.vy = lerp(this.vy, Math.sin(ang) * spd, clamp(this.homing * dt, 0, 1));
    }

    if (this.gravity) this.vy += this.gravity * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.spin += dt * 6;

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
        if (p.parryTimer > 0 && this.parryable) {
          p.parrySuccess();
          if (this.owner === 'enemy') this.reflect(game);
          return;
        }
        if (p.shield) {
          p.energy = Math.max(0, p.energy - 6);
          this.explode(game);
          FX.burst(this.x, this.y, 6, { color: '#b57bff', speedMax: 140, lifeMax: 0.35 });
          return;
        }
        p.hurt(this.damage, this.x, this, this.parryable);
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
          e.hurt(this.damage, game, this);
          this.explode(game);
          return;
        }
      }
    }
  }

  reflect(game, perfect = false) {
    if (this.dead) return;
    this.owner = 'player';
    this.color = perfect ? '#ffd24d' : '#6dff9e';
    this.damage = perfect ? 5 : 3;
    this.bossDamage = perfect ? 12 : 7;
    this.parryable = false;
    this.wave = false;
    this.homing = 0;
    this.gravity = 0;
    this.life = 3;

    let tx = this.x - this.vx;
    let ty = this.y - this.vy;
    let best = null;
    let bestD = Infinity;
    if (game.boss && !game.boss.dead) {
      tx = game.boss.cx;
      ty = game.boss.cy;
    } else {
      for (const e of game.enemies) {
        if (e.dead) continue;
        const d = dist(this.x, this.y, e.x + e.w / 2, e.y + e.h / 2);
        if (d < bestD) {
          bestD = d;
          best = e;
        }
      }
      if (best) {
        tx = best.x + best.w / 2;
        ty = best.y + best.h / 2;
      }
    }

    const ang = Math.atan2(ty - this.y, tx - this.x);
    const spd = perfect ? 930 : 760;
    this.vx = Math.cos(ang) * spd;
    this.vy = Math.sin(ang) * spd;
    Sfx.tone(720, 0.1, { type: 'sine', vol: 0.07, slide: 260 });
    FX.burst(this.x, this.y, perfect ? 16 : 9, {
      color: perfect ? '#ffd24d' : '#6dff9e', speedMax: perfect ? 280 : 200, lifeMax: 0.4
    });
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
    } else if (this.kind === 'pellet') {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 14;
      ctx.fillRect(x - this.r, y - this.r, this.r * 2, this.r * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 2, y - 2, 4, 4);
    } else if (this.kind === 'rock') {
      ctx.fillStyle = '#ff8c42';
      ctx.shadowColor = '#ff8c42';
      ctx.shadowBlur = 10;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(this.spin);
      ctx.fillRect(-this.r, -this.r * 0.8, this.r * 2, this.r * 1.6);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(-this.r * 0.4, -this.r * 0.4, this.r * 0.8, this.r * 0.8);
      ctx.restore();
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
      if (this.parryable) {
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y - this.r - 5);
        ctx.lineTo(x + 4, y - this.r - 1);
        ctx.lineTo(x, y - this.r + 3);
        ctx.lineTo(x - 4, y - this.r - 1);
        ctx.closePath();
        ctx.stroke();
      }
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
    this.clue = extra.clue || '';
    this.dead = false;
  }

  update(dt, game) {
    if (this.dead) return;
    this.phase += dt * 2.2;
    this.y = this.baseY + Math.sin(this.phase) * 4;
    this.x = this.baseX;

    const p = game.player;
    const radius = this.kind === 'power' ? 30 : this.kind === 'clue' ? 30 : 24;
    if (p && !p.dead && dist(this.x, this.y, p.cx, p.cy) < radius) {
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
      // crachá escolar
      ctx.translate(x, y + Math.sin(t) * 2);
      ctx.rotate(Math.sin(t * 0.8) * 0.15);
      ctx.fillStyle = '#ffd24d';
      ctx.shadowColor = '#ffd24d';
      ctx.shadowBlur = 12;
      ctx.fillRect(-11, -8, 22, 16);
      ctx.fillStyle = '#3a2c05';
      ctx.fillRect(-7, -4, 14, 8);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(-5, -2, 10, 2);
      ctx.fillRect(-3, 1, 6, 2);
      ctx.fillStyle = '#6dff9e';
      ctx.fillRect(-2, -12, 4, 4);
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
    } else if (this.kind === 'clue') {
      const glow = ctx.createRadialGradient(x, y, 2, x, y, 28);
      glow.addColorStop(0, 'rgba(109,255,158,0.8)');
      glow.addColorStop(1, 'rgba(109,255,158,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, TAU);
      ctx.fill();
      drawPawPrint(ctx, x, y, 17 + Math.sin(t * 2) * 1.5, '#b6ff9a', 0.95);
      ctx.strokeStyle = 'rgba(255,210,77,0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 24 + Math.sin(t * 1.6) * 2, 0, TAU);
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

/* ------------------------------ KENNEDITO NA JAULA ------------------------------ */

class KenneditoCage {
  constructor(x, y, game, opts = {}) {
    this.w = 74;
    this.h = 78;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.bottom = y;
    this.phase = rand(0, TAU);
    this.near = false;
    this.rescued = false;
    this.open = 0;
    this.heartTimer = 0;
    this.dead = false;
  }

  update(dt, game) {
    this.phase += dt * 2;
    this.open = Math.max(0, this.open - dt * 1.4);
    this.heartTimer = Math.max(0, this.heartTimer - dt);
    if (this.rescued) return;
    const p = game.player;
    this.near = !!p && !p.dead && dist(p.cx, p.cy, this.x + this.w / 2, this.y + this.h / 2) < 120;
    if (this.near && Input.pressed('KeyE', 'KeyJ', 'Enter')) this.rescue(game);
  }

  rescue(game) {
    if (this.rescued) return;
    this.rescued = true;
    this.open = 1;
    this.heartTimer = 2.5;
    game.onKenneditoRescued(this);
  }

  render(ctx, cam) {
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    const cx = x + this.w / 2;
    const t = this.phase;
    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(cx, y + this.h + 2, 34, 7, 0, 0, TAU);
    ctx.fill();

    // base da jaula
    ctx.fillStyle = '#183d24';
    ctx.fillRect(x + 2, y + this.h - 12, this.w - 4, 12);
    ctx.fillStyle = '#2f8a4c';
    ctx.fillRect(x + 6, y + this.h - 16, this.w - 12, 5);

    // campo de energia
    if (!this.rescued) {
      const field = ctx.createLinearGradient(x, y, x + this.w, y + this.h);
      field.addColorStop(0, 'rgba(109,255,158,0.16)');
      field.addColorStop(0.5, 'rgba(109,255,158,0.04)');
      field.addColorStop(1, 'rgba(109,255,158,0.2)');
      ctx.fillStyle = field;
      ctx.fillRect(x + 5, y + 4, this.w - 10, this.h - 16);
      ctx.strokeStyle = withAlpha('#6dff9e', 0.55 + Math.sin(t * 3) * 0.2);
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 5, y + 4, this.w - 10, this.h - 16);
    }

    // Kennedito dentro (ou comemorando fora)
    const kx = this.rescued ? cx + 46 : cx;
    const ky = this.rescued ? y + this.h - 4 + Math.sin(t * 6) * 3 : y + this.h - 10;
    if (this.rescued) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#6dff9e';
      ctx.beginPath();
      ctx.arc(kx, ky - 34, 38, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    drawKenneditoSprite(ctx, kx, ky, this.rescued ? 0.82 : 0.72, t, { happy: true });

    // grades
    if (!this.rescued || this.open > 0.05) {
      const a = this.rescued ? this.open : 1;
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#9bffb0';
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        const bx = x + 9 + i * ((this.w - 18) / 4);
        ctx.beginPath();
        ctx.moveTo(bx, y + 6);
        ctx.lineTo(bx, y + this.h - 12);
        ctx.stroke();
      }
      ctx.strokeStyle = '#6dff9e';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 5, y + 5, this.w - 10, this.h - 16);
      // fechadura
      if (!this.rescued) {
        ctx.fillStyle = '#ffd24d';
        ctx.fillRect(cx - 8, y + this.h * 0.52, 16, 12);
        ctx.fillStyle = '#1b2a1f';
        ctx.fillRect(cx - 2, y + this.h * 0.52 + 4, 4, 5);
      }
      ctx.globalAlpha = 1;
    }

    // pegadas opcionais ao redor da jaula
    for (let i = 0; i < 4; i++) {
      const px = x + 12 + i * 16;
      const py = y + this.h + 10 + Math.sin(t + i) * 2;
      drawPawPrint(ctx, px, py, 5, '#6dff9e', 0.28);
    }

    if (!this.rescued && this.near) {
      const prompt = 'E / J PARA LIBERTAR';
      ctx.font = 'bold 12px Consolas, monospace';
      const pw = Math.max(220, ctx.measureText(prompt).width + 40);
      const px = cx - pw / 2;
      const py = y - 42;
      ctx.fillStyle = 'rgba(2,18,10,0.92)';
      roundRect(ctx, px, py, pw, 28, 5);
      ctx.fill();
      ctx.strokeStyle = '#ffd24d';
      ctx.lineWidth = 1.5;
      roundRect(ctx, px, py, pw, 28, 5);
      ctx.stroke();
      drawText(ctx, prompt, cx, py + 15, {
        size: 11, align: 'center', color: '#ffd24d', glow: '#ffd24d', glowSize: 8
      });
    }

    if (this.rescued) {
      drawText(ctx, 'KENNEDITO LIVRE', cx + 30, y - 18, {
        size: 12, align: 'center', color: '#b6ff9a', glow: '#6dff9e', glowSize: 8
      });
      if (this.heartTimer > 0) {
        for (let i = 0; i < 3; i++) {
          const hx = cx + 20 + Math.sin(t * 2 + i) * 14 + i * 8;
          const hy = y - 40 - i * 12 - Math.sin(t * 3 + i) * 4;
          drawPixelHeart(ctx, hx, hy, 9, '#ff8fa5');
        }
      }
    }
    ctx.restore();
  }
}

/* ------------------------------ KENNEDITO ALIADO ------------------------------ */

class KenneditoAlly {
  constructor(x, y, game) {
    this.w = 44;
    this.h = 58;
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.phase = rand(0, TAU);
    this.shootCd = 1.1;
    this.facing = 1;
    this.dead = false;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  update(dt, game) {
    this.phase += dt;
    this.shootCd -= dt;
    const p = game.player;
    if (!p || p.dead) return;

    // Fica ao lado de VEGA, alternando o lado conforme a direção do olhar.
    const side = p.face >= 0 ? -1 : 1;
    const targetX = p.cx + side * 54;
    const targetY = p.bottom;
    this.facing = p.cx < this.cx ? -1 : 1;
    this.x = approach(this.x, targetX - this.w / 2, 360 * dt);
    this.y = approach(this.y, targetY - this.h, 460 * dt);
    this.x = clamp(this.x, 0, Math.max(0, game.level.widthPx - this.w));
    this.y = clamp(this.y, 0, Math.max(0, game.level.heightPx - this.h));

    if (this.shootCd > 0) return;
    let best = null;
    let bestD = 620;
    if (game.boss && !game.boss.dead) {
      const d = dist(this.cx, this.cy, game.boss.cx, game.boss.cy);
      if (d < bestD) {
        bestD = d;
        best = game.boss;
      }
    }
    for (const e of game.enemies) {
      if (e.dead) continue;
      const d = dist(this.cx, this.cy, e.x + e.w / 2, e.y + e.h / 2);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }

    if (best) {
      this.shoot(game, best);
      this.shootCd = 1.55;
    } else {
      this.shootCd = 0.35;
    }
  }

  shoot(game, target) {
    const tx = target.cx ?? (target.x + target.w / 2);
    const ty = target.cy ?? (target.y + target.h / 2);
    const dx = tx - this.cx;
    const dy = ty - this.cy;
    const len = Math.hypot(dx, dy) || 1;
    const sx = this.cx + (dx / len) * 18;
    const sy = this.cy + (dy / len) * 12 - 6;
    game.projectiles.push(new Projectile(sx, sy, (dx / len) * 620, (dy / len) * 620, 'player', {
      color: '#b6ff9a',
      r: 6,
      damage: 1,
      bossDamage: 2,
      life: 1.3,
      kind: 'paw',
      parryable: false
    }));
    Sfx.tone(880, 0.08, { type: 'triangle', vol: 0.05, slide: 220 });
    FX.burst(sx, sy, 5, { color: '#b6ff9a', speedMax: 120, lifeMax: 0.3 });
  }

  render(ctx, cam) {
    const x = this.cx - cam.x;
    const y = this.y + this.h - cam.y;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(x, y - 28, 2, x, y - 28, 48);
    glow.addColorStop(0, 'rgba(109,255,158,0.28)');
    glow.addColorStop(1, 'rgba(109,255,158,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - 28, 48, 0, TAU);
    ctx.fill();
    ctx.restore();
    drawKenneditoSprite(ctx, x, y, 0.78, this.phase, { happy: true });
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
        color: '#6dff9e', speedMax: 200, lifeMax: 0.6
      });
    }
  }

  render(ctx, cam) {
    const x = this.x - cam.x;
    const y = this.y - cam.y;
    ctx.save();
    ctx.fillStyle = '#2a3648';
    ctx.fillRect(x + 17, y + 10, 6, 48);
    ctx.fillStyle = this.active ? '#6dff9e' : '#4a5568';
    ctx.shadowColor = '#6dff9e';
    ctx.shadowBlur = this.active ? 16 : 0;
    ctx.fillRect(x + 4, y + 8, 22, 14);
    ctx.fillStyle = this.active ? '#0f4a28' : '#28323f';
    ctx.fillRect(x + 8, y + 12, 14, 4);
    ctx.shadowBlur = 0;
    if (this.active) {
      ctx.strokeStyle = 'rgba(109,255,158,0.4)';
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
    ctx.fillRect(x, y, this.w, this.h);
    ctx.strokeStyle = this.open ? '#6dff9e' : '#4a5568';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, this.w, this.h);

    if (this.open) {
      const g = ctx.createLinearGradient(x, y, x, y + this.h);
      g.addColorStop(0, 'rgba(109,255,158,0.35)');
      g.addColorStop(1, 'rgba(109,255,158,0.05)');
      ctx.fillStyle = g;
      ctx.fillRect(x + 5, y + 5, this.w - 10, this.h - 10);
      ctx.fillStyle = '#6dff9e';
      ctx.shadowColor = '#6dff9e';
      ctx.shadowBlur = 18;
      ctx.font = 'bold 13px "Consolas", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PORTAL', x + this.w / 2, y + this.h / 2 + 4);
      ctx.shadowBlur = 0;
      // folhas subindo
      for (let i = 0; i < 4; i++) {
        const a = this.phase + i * 1.6;
        const px = x + this.w / 2 + Math.sin(a) * 14;
        const py = y + this.h - ((this.phase * 18 + i * 20) % this.h);
        ctx.fillStyle = '#b6ff9a';
        ctx.fillRect(px, py, 4, 4);
      }
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
