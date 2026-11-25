import { CONFIG } from './config.js';
import { RECIPES } from './recipes.js';

export class OrderBoard {
  constructor() {
    this.orders = [];
    this.maxOrders = CONFIG.ORDER_BOARD.MAX_ORDERS;
    this.spawnTimer = 0;
    this.spawnInterval = 15; // seconds
    this.orderIdCounter = 0;
  }

  update(dt, gameTime) {
    this.spawnTimer += dt;

    // Spawn new orders
    if (this.orders.length < this.maxOrders && this.spawnTimer >= this.spawnInterval) {
      this.spawnOrder();
      this.spawnTimer = 0;
      // Decrease spawn interval over time (rush hour)
      this.spawnInterval = Math.max(8, 15 - gameTime / 60);
    }

    // Update patience
    for (const order of this.orders) {
      order.patience -= dt * CONFIG.ORDER_BOARD.PATIENCE_DECAY;
      if (order.patience <= 0) {
        order.expired = true;
      }
    }

    // Remove expired orders
    this.orders = this.orders.filter(o => !o.expired);
  }

  spawnOrder() {
    const recipeKeys = Object.keys(RECIPES);
    const recipe = RECIPES[recipeKeys[Math.floor(Math.random() * recipeKeys.length)]];

    const order = {
      id: ++this.orderIdCounter,
      recipe,
      patience: 100,
      maxPatience: 100,
      expired: false,
      spawnTime: performance.now() / 1000,
    };

    this.orders.push(order);
    return order;
  }

  getOrders() {
    return this.orders;
  }

  findMatchingOrder(plateItems) {
    // Check if plate items match any order's recipe
    for (const order of this.orders) {
      if (this.matchesRecipe(plateItems, order.recipe)) {
        return order;
      }
    }
    return null;
  }

  matchesRecipe(plateItems, recipe) {
    if (plateItems.length !== recipe.ingredients.length) return false;

    // Check if all required ingredients are present (order doesn't matter)
    const required = [...recipe.ingredients];
    for (const item of plateItems) {
      const idx = required.findIndex(r => r === item.type || r === item.id);
      if (idx >= 0) {
        required.splice(idx, 1);
      }
    }
    return required.length === 0;
  }

  completeOrder(order) {
    const idx = this.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      this.orders.splice(idx, 1);
      return true;
    }
    return false;
  }

  getPatienceColor(patience) {
    if (patience > 60) return CONFIG.COLORS.PATIENCE_HIGH;
    if (patience > 30) return CONFIG.COLORS.PATIENCE_MID;
    return CONFIG.COLORS.PATIENCE_LOW;
  }

  render(ctx) {
    const b = CONFIG.ORDER_BOARD;
    const x = b.X, y = b.Y, w = b.WIDTH, h = b.HEIGHT;

    // Board background
    ctx.fillStyle = CONFIG.COLORS.ORDER_BG;
    this.roundRect(ctx, x, y, w, h, 8, true, false);

    ctx.strokeStyle = CONFIG.COLORS.ORDER_BORDER;
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, w, h, 8, false, true);

    // Title
    ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PESANAN', x + w/2, y + 35);

    // Orders
    const orderHeight = 150;
    const startY = y + 50;

    for (let i = 0; i < this.orders.length; i++) {
      const order = this.orders[i];
      const oy = startY + i * (orderHeight + 10);

      this.renderOrder(ctx, x + 10, oy, w - 20, orderHeight, order);
    }

    // Empty slots hint
    if (this.orders.length === 0) {
      ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Menunggu pelanggan...', x + w/2, y + h/2);
    }
  }

  renderOrder(ctx, x, y, w, h, order) {
    const recipe = order.recipe;
    const patience = Math.max(0, order.patience);
    const patienceColor = this.getPatienceColor(patience);

    // Order card
    ctx.fillStyle = '#1a1512';
    this.roundRect(ctx, x, y, w, h, 6, true, false);

    ctx.strokeStyle = patienceColor;
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, w, h, 6, false, true);

    // Recipe name
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(recipe.name, x + 15, y + 25);

    // Ingredients
    ctx.font = '13px sans-serif';
    const ingStartX = x + 15;
    const ingStartY = y + 45;
    const ingSize = 28;
    const ingGap = 34;

    for (let i = 0; i < recipe.ingredients.length; i++) {
      const ing = recipe.ingredients[i];
      const ix = ingStartX + i * ingGap;
      const iy = ingStartY;

      // Ingredient icon
      const color = CONFIG.COLORS.INGREDIENT[ing] || CONFIG.COLORS.FOOD[ing] || '#888';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(ix + ingSize/2, iy + ingSize/2, ingSize/2 - 2, ingSize/3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#3a2f24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ix + ingSize/2, iy + ingSize/2, ingSize/2 - 2, ingSize/3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.formatIngredientName(ing), ix + ingSize/2, iy + ingSize + 14);
    }

    // Patience bar
    const barY = y + h - 25;
    const barW = w - 30;
    const barH = 10;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.roundRect(ctx, x + 15, barY, barW, barH, barH/2, true, false);

    ctx.fillStyle = patienceColor;
    this.roundRect(ctx, x + 15, barY, barW * (patience / 100), barH, barH/2, true, false);

    // Patience text
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(patience)}%`, x + w - 15, barY + 7);

    // Reward preview
    ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`+${recipe.reward} 💰`, x + 15, y + h - 35);
  }

  formatIngredientName(ing) {
    const names = {
      nasi: 'Nasi',
      mie: 'Mie',
      telur: 'Telur',
      bawang: 'Bawang',
      cabai: 'Cabai',
      daging: 'Daging',
      sayur: 'Sayur',
      kecap: 'Kecap',
      saus: 'Saus',
      tepung: 'Tepung',
      gula: 'Gula',
      kelapa: 'Kelapa',
    };
    return names[ing] || ing;
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