import { CONFIG } from './config.js';

export class ChopStation {
  constructor(kitchen) {
    this.kitchen = kitchen;
    this.chopping = false;
    this.chopTimer = 0;
    this.rhythmWindow = CONFIG.CHOP_RHYTHM_WINDOW;
    this.lastChopTime = 0;
    this.combo = 0;
    this.maxCombo = CONFIG.CHOP_COMBO_MAX;
    this.particles = [];
  }

  update(dt) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt; // gravity
      p.life -= dt;
      p.alpha = Math.max(0, p.life / 0.5);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  startChopping() {
    const station = this.kitchen.chopStation;
    if (!station) return { success: false, reason: 'Tidak ada bahan di station potong' };

    this.chopping = true;
    return { success: true };
  }

  stopChopping() {
    this.chopping = false;
    this.combo = 0;
  }

  // Called when player presses SPACE
  chop() {
    if (!this.chopping) return { success: false, reason: 'Tekan SPASI di station potong' };

    const result = this.kitchen.chop();
    if (!result.success) return result;

    // Spawn particles
    this.spawnChopParticles(result.perfect);

    // Play sound (handled by audio system)
    return {
      success: true,
      done: result.done,
      perfect: result.perfect,
      combo: result.combo,
      chops: this.kitchen.chopStation.chops,
      required: this.kitchen.chopStation.requiredChops,
    };
  }

  spawnChopParticles(perfect) {
    const k = CONFIG.KITCHEN;
    const cx = k.CHOP_X + k.CHOP_WIDTH / 2;
    const cy = k.CHOP_Y + k.CHOP_HEIGHT / 2;

    const count = perfect ? 8 : 4;
    const color = perfect ? CONFIG.COLORS.ACCENT_GOLD : CONFIG.COLORS.ACCENT_ORANGE;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 80 + Math.random() * 60;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: 0.5 + Math.random() * 0.3,
        alpha: 1,
        color,
        size: 3 + Math.random() * 3,
      });
    }
  }

  renderParticles(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Rhythm indicator
  renderRhythmIndicator(ctx) {
    if (!this.kitchen.chopStation) return;

    const station = this.kitchen.chopStation;
    const k = CONFIG.KITCHEN;
    const cx = k.CHOP_X + k.CHOP_WIDTH / 2;
    const cy = k.CHOP_Y - 30;

    const now = performance.now() / 1000;
    const timeSinceLastChop = now - station.lastChopTime;

    // Rhythm circle
    const radius = 30;
    const progress = Math.min(1, timeSinceLastChop / this.rhythmWindow);

    // Background circle
    ctx.strokeStyle = 'rgba(201, 169, 98, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Progress arc
    if (station.chops > 0 && progress < 1) {
      ctx.strokeStyle = CONFIG.COLORS.ACCENT_GOLD;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - progress));
      ctx.stroke();
    }

    // Center dot
    ctx.fillStyle = progress < 1 ? CONFIG.COLORS.ACCENT_GREEN : CONFIG.COLORS.TEXT_DIM;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    // "SPASI" hint
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPASI', cx, cy + 4);
  }

  renderCombo(ctx) {
    if (this.combo <= 1) return;

    const k = CONFIG.KITCHEN;
    const cx = k.CHOP_X + k.CHOP_WIDTH / 2;
    const cy = k.CHOP_Y - 60;

    ctx.fillStyle = CONFIG.COLORS.ACCENT_ORANGE;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`COMBO x${this.combo}!`, cx, cy);

    // Combo flames
    for (let i = 0; i < this.combo; i++) {
      const fx = cx - 40 + i * 20;
      ctx.fillStyle = `hsl(${15 + i * 10}, 100%, 50%)`;
      ctx.font = '16px sans-serif';
      ctx.fillText('🔥', fx, cy + 5);
    }
  }
}