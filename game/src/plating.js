import { CONFIG } from './config.js';

export class PlatingManager {
  constructor(kitchen) {
    this.kitchen = kitchen;
    this.platePreview = null;
  }

  // Try to add held item to plate
  addToPlate(item) {
    return this.kitchen.addToPlate(item);
  }

  // Remove item from plate by index
  removeFromPlate(index) {
    return this.kitchen.removeFromPlate(index);
  }

  // Get current plate items
  getPlateItems() {
    return this.kitchen.getPlateItems();
  }

  // Clear plate and return items
  clearPlate() {
    return this.kitchen.clearPlate();
  }

  // Check if plate matches a recipe
  checkRecipeMatch(recipe) {
    const items = this.getPlateItems();
    if (items.length !== recipe.ingredients.length) return false;

    const required = [...recipe.ingredients];
    for (const item of items) {
      const idx = required.findIndex(r => r === item.type || r === item.id);
      if (idx >= 0) {
        required.splice(idx, 1);
      }
    }
    return required.length === 0;
  }

  // Find matching recipe
  findMatchingRecipe(recipes) {
    const items = this.getPlateItems();
    for (const recipe of Object.values(recipes)) {
      if (this.checkRecipeMatch(recipe)) {
        return recipe;
      }
    }
    return null;
  }

  // Check if plate is ready to serve (matches any active order)
  isReadyToServe(orders) {
    const recipe = this.findMatchingRecipe(orders.RECIPES || {});
    return !!recipe;
  }

  render(ctx) {
    // Plate station rendering is handled by kitchen.render()
    // This manager just handles logic
  }

  // Render plate preview (what the final dish looks like)
  renderPlatePreview(ctx, x, y, recipe) {
    if (!recipe) return;

    const color = CONFIG.COLORS.FOOD[recipe.id] || '#888';
    const size = 60;

    ctx.save();
    ctx.translate(x, y);

    // Plate
    ctx.fillStyle = CONFIG.COLORS.PLATE_WHITE;
    ctx.beginPath();
    ctx.ellipse(0, 0, size/2, size/3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = CONFIG.COLORS.PLATE_RIM;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, size/2, size/3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Food representation
    this.drawFood(ctx, recipe.id, color, size);

    ctx.restore();
  }

  drawFood(ctx, recipeId, color, size) {
    const half = size / 2;

    switch (recipeId) {
      case 'nasi_goreng':
        // Fried rice mound
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, -4, half - 8, half - 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Egg on top
        ctx.fillStyle = '#fff8e8';
        ctx.beginPath();
        ctx.ellipse(-6, -18, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8c84a';
        ctx.beginPath();
        ctx.arc(-6, -18, 4, 0, Math.PI * 2);
        ctx.fill();
        // Green onions
        ctx.fillStyle = '#4a8a3a';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(-10 + i * 6, -20, 2, 8);
        }
        break;

      case 'mie_goreng':
        // Noodles
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          const y = -10 + i * 4;
          ctx.moveTo(-half + 10, y);
          ctx.quadraticCurveTo(0, y + 2, half - 10, y);
          ctx.stroke();
        }
        // Veg garnish
        ctx.fillStyle = '#4a8a3a';
        ctx.fillRect(-4, -16, 8, 2);
        break;

      case 'sate':
        // Skewers
        ctx.strokeStyle = '#4a3a2a';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          const x = -15 + i * 15;
          ctx.beginPath();
          ctx.moveTo(x, half - 5);
          ctx.lineTo(x, -half + 5);
          ctx.stroke();
          // Meat pieces
          ctx.fillStyle = '#a85a2a';
          for (let j = 0; j < 4; j++) {
            ctx.beginPath();
            ctx.ellipse(x, -half + 10 + j * 12, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Peanut sauce drizzle
        ctx.strokeStyle = '#8a6a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-half + 5, 0);
        ctx.quadraticCurveTo(0, 10, half - 5, 0);
        ctx.stroke();
        break;

      case 'es_teh':
        // Glass
        ctx.strokeStyle = '#8a9a9a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-half + 8, half - 5);
        ctx.lineTo(-half + 8, -half + 5);
        ctx.lineTo(half - 8, -half + 5);
        ctx.lineTo(half - 8, half - 5);
        ctx.stroke();
        // Tea liquid
        ctx.fillStyle = '#8a6a3a';
        ctx.fillRect(-half + 10, -half + 7, size - 20, size - 14);
        // Ice cubes
        ctx.fillStyle = 'rgba(180,220,240,0.8)';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(-half + 12 + i * 14, -half + 10, 10, 10);
        }
        // Straw
        ctx.strokeStyle = '#c9a962';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(half - 6, -half + 5);
        ctx.lineTo(half + 8, -half - 10);
        ctx.stroke();
        break;

      case 'gado_gado':
        // Veg pile
        ctx.fillStyle = '#4a7a3a';
        ctx.beginPath();
        ctx.ellipse(0, 0, half - 6, half - 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Egg slices
        ctx.fillStyle = '#fff8e8';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(-10 + i * 10, -6, 8, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f8c84a';
          ctx.beginPath();
          ctx.arc(-10 + i * 10, -6, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff8e8';
        }
        // Peanut sauce
        ctx.fillStyle = '#8a6a3a';
        ctx.beginPath();
        ctx.ellipse(0, 10, half - 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'bakwan':
        // Fritters
        ctx.fillStyle = '#c88a3a';
        for (let i = 0; i < 3; i++) {
          const x = -15 + i * 15;
          ctx.beginPath();
          ctx.ellipse(x, 0, 14, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          // Texture
          ctx.fillStyle = '#a87a2a';
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.arc(x + (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#c88a3a';
        }
        break;

      case 'soto':
        // Bowl
        ctx.strokeStyle = '#8a7a6a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 6, half - 4, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = '#d4a83a';
        ctx.beginPath();
        ctx.arc(0, 6, half - 6, Math.PI, 0);
        ctx.fill();
        // Noodles
        ctx.strokeStyle = '#f0d8a8';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(-half + 12, -2 + i * 5);
          ctx.lineTo(half - 12, -2 + i * 5);
          ctx.stroke();
        }
        // Meat
        ctx.fillStyle = '#a85a2a';
        ctx.beginPath();
        ctx.arc(-6, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        // Egg
        ctx.fillStyle = '#fff8e8';
        ctx.beginPath();
        ctx.ellipse(8, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8c84a';
        ctx.beginPath();
        ctx.arc(8, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        // Green onions
        ctx.fillStyle = '#4a8a3a';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(-8 + i * 8, -6, 2, 10);
        }
        break;

      case 'klepon':
        // Green balls
        ctx.fillStyle = '#3a7a3a';
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const x = Math.cos(angle) * 18;
          const y = Math.sin(angle) * 18;
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fill();
          // Coconut coating
          ctx.fillStyle = '#f0e8d8';
          for (let j = 0; j < 4; j++) {
            const a = Math.random() * Math.PI * 2;
            const r = 6 + Math.random() * 4;
            ctx.beginPath();
            ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#3a7a3a';
        }
        break;
    }
  }
}