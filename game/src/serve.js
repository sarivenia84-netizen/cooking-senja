import { CONFIG } from './config.js';

export class ServeManager {
  constructor(kitchen, orderBoard) {
    this.kitchen = kitchen;
    this.orderBoard = orderBoard;
    this.serveParticles = [];
    this.lastServeResult = null;
  }

  update(dt) {
    // Update serve particles
    for (let i = this.serveParticles.length - 1; i >= 0; i--) {
      const p = this.serveParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 100 * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.serveParticles.splice(i, 1);
      }
    }

    // Clear last serve result after display time
    if (this.lastServeResult) {
      this.lastServeResult.timer -= dt;
      if (this.lastServeResult.timer <= 0) {
        this.lastServeResult = null;
      }
    }
  }

  // Try to serve current plate to matching order
  tryServe() {
    const plateItems = this.kitchen.getPlateItems();
    if (plateItems.length === 0) {
      this.lastServeResult = {
        success: false,
        message: 'Piring kosong!',
        timer: 2,
      };
      return this.lastServeResult;
    }

    // Find matching order
    const matchingOrder = this.orderBoard.findMatchingOrder(plateItems);
    if (!matchingOrder) {
      this.lastServeResult = {
        success: false,
        message: 'Tidak cocok pesanan manapun!',
        timer: 2,
      };
      return this.lastServeResult;
    }

    // Calculate score
    const patience = Math.max(0, matchingOrder.patience);
    const patienceBonus = Math.floor(patience * CONFIG.TIP_PATIENCE_FACTOR);
    const baseScore = CONFIG.BASE_SCORE;
    const tip = CONFIG.TIP_BASE + patienceBonus;
    const totalScore = baseScore + tip + matchingOrder.recipe.reward;

    // Clear plate
    this.kitchen.clearPlate();

    // Complete order
    this.orderBoard.completeOrder(matchingOrder);

    // Spawn celebration particles
    this.spawnServeParticles(true);

    this.lastServeResult = {
      success: true,
      message: 'TERANTAR!',
      score: totalScore,
      baseScore,
      tip,
      recipeReward: matchingOrder.recipe.reward,
      patience: Math.ceil(patience),
      timer: 3,
    };

    return this.lastServeResult;
  }

  spawnServeParticles(success) {
    const k = CONFIG.KITCHEN;
    const cx = k.SERVE_X + k.SERVE_WIDTH / 2;
    const cy = k.SERVE_Y + k.SERVE_HEIGHT / 2;

    const count = success ? 20 : 8;
    const colors = success
      ? [CONFIG.COLORS.ACCENT_GOLD, CONFIG.COLORS.ACCENT_GREEN, '#fff8c8', '#c8f8a8']
      : [CONFIG.COLORS.ACCENT_RED, '#f8a8a8'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 100 + Math.random() * 150;
      this.serveParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        life: 1 + Math.random() * 1,
        maxLife: 2,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        type: success ? 'star' : 'poof',
      });
    }
  }

  renderParticles(ctx) {
    for (const p of this.serveParticles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'star') {
        // Star shape
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(performance.now() / 200);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? p.size : p.size / 2;
          ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  renderServeFeedback(ctx) {
    if (!this.lastServeResult) return;

    const k = CONFIG.KITCHEN;
    const cx = k.SERVE_X + k.SERVE_WIDTH / 2;
    const cy = k.SERVE_Y - 40;

    ctx.save();
    ctx.translate(cx, cy);

    if (this.lastServeResult.success) {
      // Score popup
      ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`+${this.lastServeResult.score}`, 0, 0);

      // Breakdown
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = '12px sans-serif';
      ctx.fillText(`Dasar: ${this.lastServeResult.baseScore}  Tip: ${this.lastServeResult.tip}  Hadiah: ${this.lastServeResult.recipeReward}`, 0, 20);
      ctx.fillText(`Kesabaran: ${this.lastServeResult.patience}%`, 0, 35);
    } else {
      ctx.fillStyle = CONFIG.COLORS.ACCENT_RED;
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.lastServeResult.message, 0, 0);
    }

    ctx.restore();
  }

  getLastServeResult() {
    return this.lastServeResult;
  }
}