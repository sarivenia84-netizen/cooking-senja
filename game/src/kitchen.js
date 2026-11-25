import { CONFIG, LAYERS } from './config.js';

export class Kitchen {
  constructor() {
    this.stoveSlots = Array(CONFIG.STOVE_SLOTS).fill(null);
    this.chopStation = null;
    this.plateStation = { items: [], maxSlots: CONFIG.PLATE_SLOTS };
    this.sinkDirty = [];
    this.serveZone = null;
  }

  update(dt) {
    // Update stove cooking progress
    for (let i = 0; i < this.stoveSlots.length; i++) {
      const slot = this.stoveSlots[i];
      if (slot && slot.state === 'cooking') {
        slot.progress += dt;
        if (slot.progress >= slot.recipe.cookTime) {
          slot.state = 'done';
          slot.progress = slot.recipe.cookTime;
          slot.burnTimer = 0;
        }
      } else if (slot && slot.state === 'done') {
        slot.burnTimer += dt;
        if (slot.burnTimer >= CONFIG.BURN_TIME) {
          slot.state = 'burnt';
        }
      }
    }
  }

  // Stove interaction
  placeOnStove(slotIndex, item, recipe) {
    if (slotIndex < 0 || slotIndex >= this.stoveSlots.length) return false;
    if (this.stoveSlots[slotIndex]) return false;

    this.stoveSlots[slotIndex] = {
      item,
      recipe,
      state: 'cooking',
      progress: 0,
      burnTimer: 0,
    };
    return true;
  }

  takeFromStove(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.stoveSlots.length) return null;
    const slot = this.stoveSlots[slotIndex];
    if (!slot) return null;
    this.stoveSlots[slotIndex] = null;
    return slot;
  }

  // Chop station
  placeOnChop(item) {
    if (this.chopStation) return false;
    this.chopStation = {
      item,
      chops: 0,
      requiredChops: CONFIG.CHOP_HITS_NEEDED[item.type] || 3,
      lastChopTime: 0,
      combo: 0,
    };
    return true;
  }

  takeFromChop() {
    const item = this.chopStation;
    this.chopStation = null;
    return item;
  }

  chop() {
    if (!this.chopStation) return { success: false, perfect: false };

    const now = performance.now() / 1000;
    const timeSinceLastChop = now - this.chopStation.lastChopTime;
    const perfect = timeSinceLastChop <= CONFIG.CHOP_RHYTHM_WINDOW && this.chopStation.chops > 0;

    this.chopStation.chops++;
    this.chopStation.lastChopTime = now;

    if (perfect) {
      this.chopStation.combo = Math.min(this.chopStation.combo + 1, CONFIG.CHOP_COMBO_MAX);
    } else {
      this.chopStation.combo = 0;
    }

    const done = this.chopStation.chops >= this.chopStation.requiredChops;
    return { success: true, perfect, done, combo: this.chopStation.combo };
  }

  // Plate station
  addToPlate(item) {
    if (this.plateStation.items.length >= this.plateStation.maxSlots) return false;
    this.plateStation.items.push(item);
    return true;
  }

  removeFromPlate(index) {
    if (index < 0 || index >= this.plateStation.items.length) return null;
    return this.plateStation.items.splice(index, 1)[0];
  }

  clearPlate() {
    const items = this.plateStation.items;
    this.plateStation.items = [];
    return items;
  }

  getPlateItems() {
    return this.plateStation.items;
  }

  // Sink
  addDirtyDish() {
    this.sinkDirty.push({ time: performance.now() / 1000 });
  }

  washDish() {
    return this.sinkDirty.pop();
  }

  getDirtyCount() {
    return this.sinkDirty.length;
  }

  // Serve zone
  placeServeOrder(order) {
    this.serveZone = order;
  }

  takeServeOrder() {
    const order = this.serveZone;
    this.serveZone = null;
    return order;
  }

  hasServeOrder() {
    return !!this.serveZone;
  }

  // Rendering
  render(ctx) {
    this.renderFloor(ctx);
    this.renderWalls(ctx);
    this.renderStove(ctx);
    this.renderCounter(ctx);
    this.renderChopStation(ctx);
    this.renderPlateStation(ctx);
    this.renderSink(ctx);
    this.renderServeZone(ctx);
  }

  renderFloor(ctx) {
    ctx.fillStyle = CONFIG.COLORS.FLOOR;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Floor tiles pattern
    ctx.fillStyle = '#15100c';
    const tileSize = 64;
    for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += tileSize) {
      for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += tileSize) {
        if ((x + y) % (tileSize * 2) === 0) {
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }
  }

  renderWalls(ctx) {
    ctx.fillStyle = CONFIG.COLORS.WALL;
    // Top wall
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, 80);
    // Left wall
    ctx.fillRect(0, 0, 80, CONFIG.CANVAS_HEIGHT);
    // Right wall
    ctx.fillRect(CONFIG.CANVAS_WIDTH - 80, 0, 80, CONFIG.CANVAS_HEIGHT);
    // Bottom wall
    ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 80, CONFIG.CANVAS_WIDTH, 80);

    // Wall decoration - hanging utensils
    ctx.strokeStyle = '#6a5a4a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 200;
      ctx.beginPath();
      ctx.moveTo(x, 80);
      ctx.lineTo(x + 20, 40);
      ctx.stroke();
    }
  }

  renderStove(ctx) {
    const k = CONFIG.KITCHEN;
    const x = k.STOVE_X, y = k.STOVE_Y, w = k.STOVE_WIDTH, h = k.STOVE_HEIGHT;

    // Stove body
    ctx.fillStyle = CONFIG.COLORS.STOVE_BODY;
    this.roundRect(ctx, x, y, w, h, 8, true, false);

    // Stove top
    ctx.fillStyle = CONFIG.COLORS.STOVE_TOP;
    this.roundRect(ctx, x + 4, y + 4, w - 8, h - 40, 4, true, false);

    // Burners
    const burnerCount = 4;
    const burnerW = 80, burnerH = 80;
    const startX = x + (w - (burnerCount * burnerW + (burnerCount - 1) * 20)) / 2;
    const burnerY = y + 20;

    for (let i = 0; i < burnerCount; i++) {
      const bx = startX + i * (burnerW + 20);
      const slot = this.stoveSlots[i];

      // Burner base
      ctx.fillStyle = CONFIG.COLORS.BURNER_OFF;
      this.roundRect(ctx, bx, burnerY, burnerW, burnerH, 8, true, false);

      // Burner ring
      ctx.strokeStyle = '#5a4a3a';
      ctx.lineWidth = 3;
      this.roundRect(ctx, bx + 8, burnerY + 8, burnerW - 16, burnerH - 16, 6, false, true);

      if (slot) {
        // Flame
        this.renderFlame(ctx, bx + burnerW/2, burnerY + burnerH/2, slot.state);

        // Progress bar
        if (slot.state === 'cooking') {
          const prog = slot.progress / slot.recipe.cookTime;
          this.renderProgressBar(ctx, bx + 10, burnerY - 10, burnerW - 20, 6, prog, '#e8a82a');
        } else if (slot.state === 'done') {
          // Ready indicator
          ctx.fillStyle = CONFIG.COLORS.ACCENT_GREEN;
          ctx.beginPath();
          ctx.arc(bx + burnerW/2, burnerY - 5, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✓', bx + burnerW/2, burnerY + 2);
        } else if (slot.state === 'burnt') {
          ctx.fillStyle = CONFIG.COLORS.ACCENT_RED;
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔥', bx + burnerW/2, burnerY + 20);
        }

        // Food preview on burner
        this.renderFoodOnBurner(ctx, bx + burnerW/2, burnerY + burnerH/2, slot.item);
      }

      // Slot number
      ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, bx + burnerW/2, burnerY + burnerH + 18);
    }

    // Stove label
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KOMPOR', x + w/2, y + h - 8);
  }

  renderFlame(ctx, cx, cy, state) {
    const time = performance.now() / 200;
    const intensity = state === 'cooking' ? 1 : (state === 'done' ? 0.3 : 0);

    if (intensity === 0) return;

    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(time + i) * 4 * intensity;
      const height = 20 + Math.sin(time * 1.5 + i) * 8 * intensity;

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, -height, 25);
      if (state === 'cooking') {
        gradient.addColorStop(0, '#ffaa00');
        gradient.addColorStop(0.5, '#ff6600');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      } else {
        gradient.addColorStop(0, '#ff8844');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-12 + offset, 0);
      ctx.quadraticCurveTo(offset, -height, 12 + offset, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  renderFoodOnBurner(ctx, cx, cy, item) {
    if (!item) return;
    const color = CONFIG.COLORS.FOOD[item.id] || CONFIG.COLORS.INGREDIENT[item.type] || '#888';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 10, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Steam
    if (this.stoveSlots.some(s => s && s.state === 'cooking')) {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const t = performance.now() / 1000 + i * 0.5;
        ctx.beginPath();
        ctx.moveTo(cx - 8 + i * 8, cy - 15);
        ctx.quadraticCurveTo(cx - 8 + i * 8 + Math.sin(t) * 4, cy - 35, cx - 8 + i * 8, cy - 40);
        ctx.stroke();
      }
    }
  }

  renderCounter(ctx) {
    const k = CONFIG.KITCHEN;
    const x = k.COUNTER_X, y = k.COUNTER_Y, w = k.COUNTER_WIDTH, h = k.COUNTER_HEIGHT;

    // Counter base
    ctx.fillStyle = CONFIG.COLORS.COUNTER_TOP;
    this.roundRect(ctx, x, y, w, h, 8, true, false);

    // Counter edge
    ctx.fillStyle = CONFIG.COLORS.COUNTER_EDGE;
    ctx.fillRect(x, y + h - 12, w, 12);

    // Counter label
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('KOUNTER BAHAN', x + 10, y + 24);
  }

  renderChopStation(ctx) {
    const k = CONFIG.KITCHEN;
    const x = k.CHOP_X, y = k.CHOP_Y, w = k.CHOP_WIDTH, h = k.CHOP_HEIGHT;

    // Station base
    ctx.fillStyle = CONFIG.COLORS.COUNTER_TOP;
    this.roundRect(ctx, x, y, w, h, 8, true, false);

    // Cutting board
    const boardX = x + 20, boardY = y + 20, boardW = w - 40, boardH = h - 60;
    ctx.fillStyle = '#4a3a2a';
    this.roundRect(ctx, boardX, boardY, boardW, boardH, 4, true, false);
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    this.roundRect(ctx, boardX, boardY, boardW, boardH, 4, false, true);

    // Wood grain
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const gy = boardY + 20 + i * 25;
      ctx.beginPath();
      ctx.moveTo(boardX + 5, gy);
      ctx.lineTo(boardX + boardW - 5, gy + Math.sin(i) * 3);
      ctx.stroke();
    }

    // Knife
    ctx.fillStyle = '#8a9a9a';
    ctx.fillRect(boardX + boardW - 30, boardY + 10, 8, 40);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(boardX + boardW - 34, boardY + 10, 16, 12);

    if (this.chopStation) {
      // Item being chopped
      const item = this.chopStation.item;
      const color = CONFIG.COLORS.INGREDIENT[item.type] || '#888';
      const cx = boardX + boardW / 2;
      const cy = boardY + boardH / 2;

      // Show chopped pieces
      const pieces = Math.min(this.chopStation.chops, this.chopStation.requiredChops);
      for (let i = 0; i < pieces; i++) {
        const angle = (i / Math.max(1, this.chopStation.requiredChops)) * Math.PI * 2;
        const px = cx + Math.cos(angle) * 15;
        const py = cy + Math.sin(angle) * 15;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(px, py, 12, 8, angle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Progress
      const prog = this.chopStation.chops / this.chopStation.requiredChops;
      this.renderProgressBar(ctx, boardX, boardY - 10, boardW, 6, prog, '#e8a82a');

      // Combo indicator
      if (this.chopStation.combo > 1) {
        ctx.fillStyle = CONFIG.COLORS.ACCENT_ORANGE;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`COMBO x${this.chopStation.combo}!`, cx, boardY - 15);
      }
    }

    // Label
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STATION POTONG [SPASI]', x + w/2, y + h - 10);
  }

  renderPlateStation(ctx) {
    const k = CONFIG.KITCHEN;
    const x = k.PLATE_X, y = k.PLATE_Y, w = k.PLATE_WIDTH, h = k.PLATE_HEIGHT;

    // Station base
    ctx.fillStyle = CONFIG.COLORS.COUNTER_TOP;
    this.roundRect(ctx, x, y, w, h, 8, true, false);

    // Plate slots
    const slotSize = 56;
    const startX = x + (w - (slotSize * CONFIG.PLATE_SLOTS + (CONFIG.PLATE_SLOTS - 1) * 12)) / 2;
    const slotY = y + 30;

    for (let i = 0; i < CONFIG.PLATE_SLOTS; i++) {
      const sx = startX + i * (slotSize + 12);

      // Plate
      ctx.fillStyle = CONFIG.COLORS.PLATE_WHITE;
      ctx.beginPath();
      ctx.ellipse(sx + slotSize/2, slotY + slotSize/2, slotSize/2 - 4, slotSize/3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = CONFIG.COLORS.PLATE_RIM;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(sx + slotSize/2, slotY + slotSize/2, slotSize/2 - 4, slotSize/3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Item on plate
      if (this.plateStation.items[i]) {
        const item = this.plateStation.items[i];
        const color = CONFIG.COLORS.INGREDIENT[item.type] || CONFIG.COLORS.FOOD[item.id] || '#888';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(sx + slotSize/2, slotY + slotSize/2 - 8, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Slot number
      ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, sx + slotSize/2, slotY + slotSize + 14);
    }

    // Label
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PIRING SAJI [E: taruh/ambil]', x + w/2, y + h - 10);
  }

  renderSink(ctx) {
    const k = CONFIG.KITCHEN;
    const x = k.SINK_X, y = k.SINK_Y, w = k.SINK_WIDTH, h = k.SINK_HEIGHT;

    // Station base
    ctx.fillStyle = CONFIG.COLORS.COUNTER_TOP;
    this.roundRect(ctx, x, y, w, h, 8, true, false);

    // Sink basin
    const basinX = x + 20, basinY = y + 20, basinW = w - 40, basinH = h - 60;
    ctx.fillStyle = CONFIG.COLORS.SINK_BASIN;
    this.roundRect(ctx, basinX, basinY, basinW, basinH, 6, true, false);

    // Drain
    ctx.fillStyle = '#2a3a4a';
    ctx.beginPath();
    ctx.arc(basinX + basinW/2, basinY + basinH - 20, 12, 0, Math.PI * 2);
    ctx.fill();

    // Tap
    const tapX = basinX + basinW - 30;
    const tapY = basinY - 10;
    ctx.strokeStyle = CONFIG.COLORS.SINK_TAP;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tapX, tapY);
    ctx.lineTo(tapX, basinY + 10);
    ctx.quadraticCurveTo(tapX, basinY + 25, tapX - 25, basinY + 25);
    ctx.stroke();

    // Water droplets when washing
    if (this.sinkDirty.length > 0) {
      ctx.fillStyle = 'rgba(180, 220, 240, 0.7)';
      for (let i = 0; i < 5; i++) {
        const t = performance.now() / 300 + i;
        const dx = Math.sin(t) * 8;
        const dy = (t * 50) % basinH;
        ctx.beginPath();
        ctx.arc(basinX + basinW/2 + dx, basinY + dy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dirty count
    if (this.sinkDirty.length > 0) {
      ctx.fillStyle = CONFIG.COLORS.ACCENT_ORANGE;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.sinkDirty.length} KOTOR`, basinX + basinW/2, basinY - 5);
    }

    // Label
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WASAFEL [E: cuci]', x + w/2, y + h - 10);
  }

  renderServeZone(ctx) {
    const k = CONFIG.KITCHEN;
    const x = k.SERVE_X, y = k.SERVE_Y, w = k.SERVE_WIDTH, h = k.SERVE_HEIGHT;

    // Zone base
    ctx.fillStyle = CONFIG.COLORS.COUNTER_TOP;
    this.roundRect(ctx, x, y, w, h, 8, true, false);

    // Serving window
    const winX = x + 15, winY = y + 20, winW = w - 30, winH = h - 60;
    ctx.fillStyle = '#1a1512';
    this.roundRect(ctx, winX, winY, winW, winH, 4, true, false);

    // Window frame
    ctx.strokeStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.lineWidth = 3;
    this.roundRect(ctx, winX, winY, winW, winH, 4, false, true);

    if (this.serveZone) {
      // Show order being served
      const order = this.serveZone;
      ctx.fillStyle = CONFIG.COLORS.ACCENT_GREEN;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SIAP ANTAR!', x + w/2, winY + 30);

      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = '12px sans-serif';
      ctx.fillText(order.recipe.name, x + w/2, winY + 55);

      // Arrow animation
      const t = performance.now() / 300;
      const ay = winY + winH - 40 + Math.sin(t) * 5;
      ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
      ctx.font = '24px sans-serif';
      ctx.fillText('⬇', x + w/2, ay);
    } else {
      ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JENDELA', x + w/2, winY + 30);
      ctx.fillText('ANTAR [Q]', x + w/2, winY + 55);
    }

    // Label
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ANTAR PESANAN', x + w/2, y + h - 10);
  }

  renderProgressBar(ctx, x, y, w, h, progress, color) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.roundRect(ctx, x, y, w, h, h/2, true, false);

    ctx.fillStyle = color;
    this.roundRect(ctx, x, y, w * Math.max(0, Math.min(1, progress)), h, h/2, true, false);
  }

  roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}