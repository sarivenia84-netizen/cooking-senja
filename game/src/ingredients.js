import { CONFIG } from './config.js';
import { AVAILABLE_INGREDIENTS, INGREDIENT_NAMES, INGREDIENT_CATEGORIES } from './recipes.js';

export class IngredientManager {
  constructor() {
    this.ingredients = []; // Ingredients on counter
    this.spawnTimer = 0;
    this.spawnInterval = CONFIG.INGREDIENT_SPAWN_INTERVAL;
    this.maxOnCounter = CONFIG.MAX_INGREDIENTS_ON_COUNTER;
    this.heldItem = null; // Item player is carrying
  }

  update(dt) {
    this.spawnTimer += dt;

    // Spawn ingredients on counter
    if (this.ingredients.length < this.maxOnCounter && this.spawnTimer >= this.spawnInterval) {
      this.spawnIngredient();
      this.spawnTimer = 0;
    }

    // Update held item position (follows player)
    // Handled in player render
  }

  spawnIngredient() {
    // Weighted random selection - more base ingredients
    const weights = {
      nasi: 3, mie: 3, tepung: 2,
      telur: 2, daging: 2,
      bawang: 3, cabai: 2,
      sayur: 2,
      kecap: 2, saus: 1,
      gula: 1, kelapa: 1,
      teh: 1, es: 1, kacang: 1,
    };

    const items = Object.keys(weights);
    const totalWeight = items.reduce((sum, k) => sum + weights[k], 0);
    let rand = Math.random() * totalWeight;

    let selected = 'nasi';
    for (const item of items) {
      rand -= weights[item];
      if (rand <= 0) {
        selected = item;
        break;
      }
    }

    // Random position on counter
    const k = CONFIG.KITCHEN;
    const margin = 40;
    const x = k.COUNTER_X + margin + Math.random() * (k.COUNTER_WIDTH - margin * 2);
    const y = k.COUNTER_Y + margin + Math.random() * (k.COUNTER_HEIGHT - margin * 2);

    this.ingredients.push({
      type: selected,
      id: selected,
      x,
      y,
      vx: 0,
      vy: 0,
      name: INGREDIENT_NAMES[selected] || selected,
      bobOffset: Math.random() * Math.PI * 2,
    });
  }

  // Try to pick up ingredient at position
  tryPickup(px, py, reach = 40) {
    for (let i = 0; i < this.ingredients.length; i++) {
      const ing = this.ingredients[i];
      const dx = ing.x - px;
      const dy = ing.y - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= reach) {
        this.heldItem = this.ingredients.splice(i, 1)[0];
        return this.heldItem;
      }
    }
    return null;
  }

  // Place held item at position (on counter, plate, stove, etc.)
  placeHeldItem(x, y) {
    if (!this.heldItem) return false;

    this.heldItem.x = x;
    this.heldItem.y = y;
    this.ingredients.push(this.heldItem);
    this.heldItem = null;
    return true;
  }

  // Give held item to another system (stove, chop, plate)
  takeHeldItem() {
    const item = this.heldItem;
    this.heldItem = null;
    return item;
  }

  // Receive item back (from stove, plate, etc.)
  receiveItem(item, x, y) {
    if (this.ingredients.length >= this.maxOnCounter) return false;
    item.x = x;
    item.y = y;
    this.ingredients.push(item);
    return true;
  }

  getHeldItem() {
    return this.heldItem;
  }

  hasHeldItem() {
    return !!this.heldItem;
  }

  getIngredients() {
    return this.ingredients;
  }

  render(ctx) {
    // Render ingredients on counter
    for (const ing of this.ingredients) {
      this.renderIngredient(ctx, ing, ing.x, ing.y);
    }

    // Render held item (follows mouse/player)
    if (this.heldItem) {
      // Position will be set by player render
      this.renderIngredient(ctx, this.heldItem, this.heldItem.x, this.heldItem.y, true);
    }
  }

  renderIngredient(ctx, ing, x, y, held = false) {
    const color = CONFIG.COLORS.INGREDIENT[ing.type] || '#888';
    const size = CONFIG.INGREDIENT_SIZE;
    const time = performance.now() / 300;

    ctx.save();
    ctx.translate(x, y);

    if (held) {
      // Held item floats slightly
      ctx.translate(0, Math.sin(time) * 3 - 20);
      ctx.scale(1.1, 1.1);
    } else {
      // Bobbing animation
      ctx.translate(0, Math.sin(time + ing.bobOffset) * 2);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, size/2, size/2, size/6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ingredient shape based on type
    this.drawIngredientShape(ctx, ing.type, color, size);

    // Name label (when not held)
    if (!held) {
      ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ing.name, 0, size + 14);
    }

    ctx.restore();
  }

  drawIngredientShape(ctx, type, color, size) {
    const half = size / 2;

    switch (type) {
      case 'nasi':
        // Rice mound
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, half - 2, half - 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Rice grains
        ctx.fillStyle = '#fff8e8';
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * (half - 8);
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'mie':
        // Noodle bundle
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const offset = (i - 2) * 5;
          ctx.moveTo(-half + 4, offset);
          ctx.quadraticCurveTo(0, offset + Math.sin(i) * 4, half - 4, offset);
          ctx.stroke();
        }
        break;

      case 'telur':
        // Egg
        ctx.fillStyle = '#fff8e8';
        ctx.beginPath();
        ctx.ellipse(0, 0, half - 2, half, 0, 0, Math.PI * 2);
        ctx.fill();
        // Yolk
        ctx.fillStyle = '#f8c84a';
        ctx.beginPath();
        ctx.arc(0, -2, half - 8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'bawang':
        // Onion
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, half - 2, 0, Math.PI * 2);
        ctx.fill();
        // Layers
        ctx.strokeStyle = '#d8c8b8';
        ctx.lineWidth = 1;
        for (let r = 4; r < half - 2; r += 4) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'cabai':
        // Chili
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -half + 2);
        ctx.quadraticCurveTo(half - 4, -half/2, half - 4, 0);
        ctx.quadraticCurveTo(half - 4, half/2, 0, half - 2);
        ctx.quadraticCurveTo(-half + 4, half/2, -half + 4, 0);
        ctx.quadraticCurveTo(-half + 4, -half/2, 0, -half + 2);
        ctx.fill();
        // Stem
        ctx.fillStyle = '#3a7a3a';
        ctx.fillRect(-2, -half + 2, 4, 6);
        break;

      case 'daging':
        // Meat chunk
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, half - 2, half - 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Marbling
        ctx.fillStyle = '#c86a5a';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc((Math.random() - 0.5) * half, (Math.random() - 0.5) * half, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'sayur':
        // Mixed veg
        ctx.fillStyle = color;
        // Carrot
        ctx.beginPath();
        ctx.moveTo(-half + 4, -2);
        ctx.lineTo(-half + 4, half - 4);
        ctx.lineTo(-4, half - 4);
        ctx.lineTo(-4, -2);
        ctx.fill();
        // Green bean
        ctx.fillStyle = '#5a9a4a';
        ctx.fillRect(2, -half + 4, 6, half - 2);
        // Cabbage
        ctx.fillStyle = '#7ac86a';
        ctx.beginPath();
        ctx.arc(half - 6, -half + 6, half - 8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'kecap':
        // Soy sauce bottle
        ctx.fillStyle = '#1a1512';
        ctx.fillRect(-6, -half + 4, 12, half * 1.5);
        ctx.fillStyle = '#c9a962';
        ctx.fillRect(-6, -half + 4, 12, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(-4, -half + 16, 8, half);
        break;

      case 'saus':
        // Sauce bottle
        ctx.fillStyle = '#c83a2a';
        ctx.fillRect(-6, -half + 4, 12, half * 1.5);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-4, -half + 4, 8, 8);
        break;

      case 'tepung':
        // Flour bag
        ctx.fillStyle = '#f0e8d8';
        ctx.fillRect(-half + 2, -half + 4, size - 4, size - 8);
        ctx.strokeStyle = '#d0c8b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(-half + 2, -half + 4, size - 4, size - 8);
        ctx.fillStyle = '#8a7a6a';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TEPUNG', 0, 3);
        break;

      case 'gula':
        // Palm sugar
        ctx.fillStyle = '#a85a2a';
        ctx.beginPath();
        ctx.moveTo(0, -half + 2);
        ctx.lineTo(half - 4, 0);
        ctx.lineTo(0, half - 2);
        ctx.lineTo(-half + 4, 0);
        ctx.closePath();
        ctx.fill();
        break;

      case 'kelapa':
        // Coconut flakes
        ctx.fillStyle = '#f0e8d8';
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * (half - 4);
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'teh':
        // Tea bag
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(-half + 4, -half + 4, size - 8, size - 8);
        ctx.fillStyle = '#8a7a5a';
        ctx.fillRect(-half + 8, -half + 8, size - 16, 6);
        // String
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -half + 4);
        ctx.lineTo(0, -half - 8);
        ctx.stroke();
        break;

      case 'es':
        // Ice cubes
        ctx.fillStyle = 'rgba(180, 220, 240, 0.8)';
        for (let i = 0; i < 4; i++) {
          const x = (i % 2) * (half - 4) - half/2 + 4;
          const y = Math.floor(i / 2) * (half - 4) - half/2 + 4;
          ctx.fillRect(x, y, half - 6, half - 6);
          // Highlight
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillRect(x, y, half - 6, 2);
          ctx.fillStyle = 'rgba(180, 220, 240, 0.8)';
        }
        break;

      case 'kacang':
        // Peanuts
        ctx.fillStyle = '#c8a86a';
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const r = half - 8;
          ctx.beginPath();
          ctx.ellipse(Math.cos(angle) * r, Math.sin(angle) * r, 6, 4, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      default:
        // Generic circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, half - 2, 0, Math.PI * 2);
        ctx.fill();
    }
  }
}