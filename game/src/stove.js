import { CONFIG } from './config.js';

export class StoveManager {
  constructor(kitchen) {
    this.kitchen = kitchen;
    this.particles = []; // Steam, smoke, fire particles
  }

  update(dt) {
    // Update cooking progress handled in kitchen.update()

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 50 * dt; // steam rises
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      p.scale = Math.max(0.1, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Spawn continuous steam for cooking slots
    for (let i = 0; i < this.kitchen.stoveSlots.length; i++) {
      const slot = this.kitchen.stoveSlots[i];
      if (slot && slot.state === 'cooking' && Math.random() < 0.3) {
        this.spawnSteam(i);
      } else if (slot && slot.state === 'burnt' && Math.random() < 0.15) {
        this.spawnSmoke(i);
      }
    }
  }

  spawnSteam(slotIndex) {
    const k = CONFIG.KITCHEN;
    const burnerCount = 4;
    const burnerW = 80;
    const startX = k.STOVE_X + (k.STOVE_WIDTH - (burnerCount * burnerW + (burnerCount - 1) * 20)) / 2;
    const bx = startX + slotIndex * (burnerW + 20);
    const cx = bx + burnerW / 2;
    const cy = k.STOVE_Y + 20 + 80 / 2;

    this.particles.push({
      x: cx + (Math.random() - 0.5) * 20,
      y: cy - 10,
      vx: (Math.random() - 0.5) * 20,
      vy: -30 - Math.random() * 40,
      life: 0.8 + Math.random() * 0.5,
      maxLife: 1.3,
      alpha: 1,
      scale: 1,
      color: 'rgba(200, 220, 255, 0.6)',
      type: 'steam',
    });
  }

  spawnSmoke(slotIndex) {
    const k = CONFIG.KITCHEN;
    const burnerCount = 4;
    const burnerW = 80;
    const startX = k.STOVE_X + (k.STOVE_WIDTH - (burnerCount * burnerW + (burnerCount - 1) * 20)) / 2;
    const bx = startX + slotIndex * (burnerW + 20);
    const cx = bx + burnerW / 2;
    const cy = k.STOVE_Y + 20 + 80 / 2;

    this.particles.push({
      x: cx + (Math.random() - 0.5) * 30,
      y: cy - 5,
      vx: (Math.random() - 0.5) * 30,
      vy: -20 - Math.random() * 30,
      life: 1.5 + Math.random() * 1,
      maxLife: 2.5,
      alpha: 1,
      scale: 1,
      color: 'rgba(60, 40, 30, 0.5)',
      type: 'smoke',
    });
  }

  spawnFire(slotIndex) {
    const k = CONFIG.KITCHEN;
    const burnerCount = 4;
    const burnerW = 80;
    const startX = k.STOVE_X + (k.STOVE_WIDTH - (burnerCount * burnerW + (burnerCount - 1) * 20)) / 2;
    const bx = startX + slotIndex * (burnerW + 20);
    const cx = bx + burnerW / 2;
    const cy = k.STOVE_Y + 20 + 80 / 2;

    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 50,
        vy: -50 - Math.random() * 80,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        alpha: 1,
        scale: 1,
        color: `hsl(${15 + Math.random() * 30}, 100%, 50%)`,
        type: 'fire',
      });
    }
  }

  renderParticles(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'steam') {
        // Steam wisps
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'smoke') {
        // Smoke puffs
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'fire') {
        // Fire particles
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Get cooking progress for a slot (0-1)
  getProgress(slotIndex) {
    const slot = this.kitchen.stoveSlots[slotIndex];
    if (!slot || slot.state !== 'cooking') return 0;
    return Math.min(1, slot.progress / slot.recipe.cookTime);
  }

  // Get slot state
  getSlotState(slotIndex) {
    const slot = this.kitchen.stoveSlots[slotIndex];
    return slot ? slot.state : 'empty';
  }

  // Check if any slot is burning
  hasBurning() {
    return this.kitchen.stoveSlots.some(s => s && s.state === 'burnt');
  }

  // Get all items ready to serve
  getReadyItems() {
    const ready = [];
    for (let i = 0; i < this.kitchen.stoveSlots.length; i++) {
      const slot = this.kitchen.stoveSlots[i];
      if (slot && slot.state === 'done') {
        ready.push({ slotIndex: i, item: slot.item, recipe: slot.recipe });
      }
    }
    return ready;
  }
}