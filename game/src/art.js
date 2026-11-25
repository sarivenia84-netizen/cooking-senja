// Sprite canvas generator - creates food sprites programmatically
export class ArtGenerator {
  constructor() {
    this.spriteCache = new Map();
    this.spriteSize = 64;
  }

  // Generate a sprite for a food item
  getSprite(recipeId) {
    if (this.spriteCache.has(recipeId)) {
      return this.spriteCache.get(recipeId);
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.spriteSize;
    canvas.height = this.spriteSize;
    const ctx = canvas.getContext('2d');

    this.drawFoodSprite(ctx, recipeId);

    this.spriteCache.set(recipeId, canvas);
    return canvas;
  }

  // Generate ingredient sprite
  getIngredientSprite(type) {
    const key = `ing_${type}`;
    if (this.spriteCache.has(key)) {
      return this.spriteCache.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.spriteSize;
    canvas.height = this.spriteSize;
    const ctx = canvas.getContext('2d');

    this.drawIngredientSprite(ctx, type);

    this.spriteCache.set(key, canvas);
    return canvas;
  }

  drawFoodSprite(ctx, recipeId) {
    const size = this.spriteSize;
    const half = size / 2;

    // Colors for each dish
    const colors = {
      nasi_goreng: { main: '#d4a84a', accent: '#c8983a', detail: '#4a8a3a' },
      mie_goreng: { main: '#c8984a', accent: '#b8883a', detail: '#4a8a3a' },
      sate: { main: '#a85a2a', accent: '#984a1a', detail: '#8a6a3a' },
      es_teh: { main: '#8a6a3a', accent: '#7a5a2a', detail: '#a8c8e8' },
      gado_gado: { main: '#4a7a3a', accent: '#3a6a2a', detail: '#8a6a3a' },
      bakwan: { main: '#c88a3a', accent: '#b87a2a', detail: '#a87a2a' },
      soto: { main: '#d4a83a', accent: '#c4982a', detail: '#4a8a3a' },
      klepon: { main: '#3a7a3a', accent: '#2a6a2a', detail: '#f0e8d8' },
    };

    const c = colors[recipeId] || { main: '#888', accent: '#666', detail: '#aaa' };

    ctx.save();
    ctx.translate(half, half);

    switch (recipeId) {
      case 'nasi_goreng':
        this.drawNasiGoreng(ctx, c, half);
        break;
      case 'mie_goreng':
        this.drawMieGoreng(ctx, c, half);
        break;
      case 'sate':
        this.drawSate(ctx, c, half);
        break;
      case 'es_teh':
        this.drawEsTeh(ctx, c, half);
        break;
      case 'gado_gado':
        this.drawGadoGado(ctx, c, half);
        break;
      case 'bakwan':
        this.drawBakwan(ctx, c, half);
        break;
      case 'soto':
        this.drawSoto(ctx, c, half);
        break;
      case 'klepon':
        this.drawKlepon(ctx, c, half);
        break;
    }

    ctx.restore();
  }

  drawNasiGoreng(ctx, c, half) {
    // Rice mound
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.ellipse(0, 2, half - 6, half - 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Texture
    ctx.fillStyle = c.accent;
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (half - 14);
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r + 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fried egg
    ctx.fillStyle = '#fff8e8';
    ctx.beginPath();
    ctx.ellipse(-8, -14, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8c84a';
    ctx.beginPath();
    ctx.arc(-8, -14, 4, 0, Math.PI * 2);
    ctx.fill();

    // Green onions
    ctx.fillStyle = c.detail;
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-12 + i * 5, -20, 2, 10);
    }

    // Krupuk
    ctx.fillStyle = '#f0e8d8';
    ctx.beginPath();
    ctx.ellipse(half - 8, -half + 8, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawMieGoreng(ctx, c, half) {
    // Noodles
    ctx.strokeStyle = c.main;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const y = -half + 8 + i * (half * 2 / 8);
      ctx.moveTo(-half + 8, y);
      ctx.quadraticCurveTo(0, y + Math.sin(i) * 4, half - 8, y);
      ctx.stroke();
    }

    // Veggies
    ctx.fillStyle = c.detail;
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(-6 + i * 4, -half + 6, 3, 3);
    }

    // Egg strips
    ctx.fillStyle = '#fff8e8';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-half + 10 + i * 10, -4, 8, 2);
    }
  }

  drawSate(ctx, c, half) {
    // Skewers
    ctx.strokeStyle = '#4a3a2a';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const x = -16 + i * 16;
      ctx.beginPath();
      ctx.moveTo(x, half - 4);
      ctx.lineTo(x, -half + 4);
      ctx.stroke();

      // Meat pieces
      ctx.fillStyle = c.main;
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.ellipse(x, -half + 8 + j * 14, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Char marks
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(x - 4, -half + 6 + j * 14, 8, 1);
        ctx.fillStyle = c.main;
      }
    }

    // Peanut sauce drizzle
    ctx.strokeStyle = '#8a6a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-half + 6, 4);
    ctx.quadraticCurveTo(0, 12, half - 6, 4);
    ctx.stroke();
  }

  drawEsTeh(ctx, c, half) {
    // Glass
    ctx.strokeStyle = '#a8b8b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-half + 8, half - 6);
    ctx.lineTo(-half + 8, -half + 6);
    ctx.lineTo(half - 8, -half + 6);
    ctx.lineTo(half - 8, half - 6);
    ctx.stroke();

    // Tea
    const gradient = ctx.createLinearGradient(0, -half + 6, 0, half - 6);
    gradient.addColorStop(0, '#a87a3a');
    gradient.addColorStop(1, '#6a4a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(-half + 10, -half + 8, size - 20, size - 16);

    // Ice cubes
    ctx.fillStyle = 'rgba(180, 220, 240, 0.9)';
    for (let i = 0; i < 4; i++) {
      const x = (i % 2) * (half - 12) - half/2 + 6;
      const y = Math.floor(i / 2) * (half - 12) - half/2 + 6;
      ctx.fillRect(x, y, half/2 - 4, half/2 - 4);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x, y, half/2 - 4, 2);
      ctx.fillStyle = 'rgba(180, 220, 240, 0.9)';
    }

    // Straw
    ctx.strokeStyle = '#c9a962';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(half - 6, -half + 6);
    ctx.lineTo(half + 10, -half - 12);
    ctx.stroke();
  }

  drawGadoGado(ctx, c, half) {
    // Veg base
    ctx.fillStyle = c.main;
    ctx.beginPath();
    ctx.ellipse(0, 2, half - 8, half - 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Egg slices
    ctx.fillStyle = '#fff8e8';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(-12 + i * 12, -4, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8c84a';
      ctx.beginPath();
      ctx.arc(-12 + i * 12, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff8e8';
    }

    // Tofu/tempe
    ctx.fillStyle = '#d8c8a8';
    for (let i = 0; i < 2; i++) {
      ctx.fillRect(-6 + i * 12, 10, 10, 10);
    }

    // Peanut sauce
    ctx.fillStyle = '#8a6a3a';
    ctx.beginPath();
    ctx.ellipse(0, 18, half - 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Krupuk
    ctx.fillStyle = '#f0e8d8';
    ctx.beginPath();
    ctx.ellipse(half - 10, -half + 10, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBakwan(ctx, c, half) {
    // Three fritters
    for (let i = 0; i < 3; i++) {
      const x = -18 + i * 18;
      // Fritter body
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.ellipse(x, 0, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Texture/bubbles
      ctx.fillStyle = c.accent;
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.arc(x + (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Veg visible inside
      ctx.fillStyle = c.detail;
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(x - 8 + j * 6, -2, 3, 4);
      }
    }
  }

  drawSoto(ctx, c, half) {
    // Bowl
    ctx.strokeStyle = '#8a7a6a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 8, half - 4, Math.PI, 0);
    ctx.stroke();

    // Broth
    const gradient = ctx.createRadialGradient(0, 8, 0, 0, 8, half - 6);
    gradient.addColorStop(0, '#e8b84a');
    gradient.addColorStop(1, '#c8982a');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 8, half - 6, Math.PI, 0);
    ctx.fill();

    // Noodles
    ctx.strokeStyle = '#f0d8a8';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(-half + 12, -2 + i * 6);
      ctx.lineTo(half - 12, -2 + i * 6);
      ctx.stroke();
    }

    // Meat
    ctx.fillStyle = '#a85a2a';
    ctx.beginPath();
    ctx.arc(-8, 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Egg half
    ctx.fillStyle = '#fff8e8';
    ctx.beginPath();
    ctx.ellipse(8, 2, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8c84a';
    ctx.beginPath();
    ctx.arc(8, 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Green onions
    ctx.fillStyle = c.detail;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-10 + i * 6, -8, 2, 12);
    }

    // Sambal
    ctx.fillStyle = '#c83a2a';
    ctx.beginPath();
    ctx.arc(half - 10, -2, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawKlepon(ctx, c, half) {
    // Four balls
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * 20;
      const y = Math.sin(angle) * 20;

      // Ball
      ctx.fillStyle = c.main;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();

      // Coconut coating
      ctx.fillStyle = c.detail;
      for (let j = 0; j < 6; j++) {
        const a = Math.random() * Math.PI * 2;
        const r = 8 + Math.random() * 6;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glaze highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(x - 4, y - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawIngredientSprite(ctx, type) {
    const size = this.spriteSize;
    const half = size / 2;

    const colors = {
      nasi: '#f5f0e8', mie: '#f0d8a8', telur: '#fff8e8',
      bawang: '#e8d8c8', cabai: '#c83a2a', daging: '#a84a3a',
      sayur: '#3a7a3a', kecap: '#1a1512', saus: '#c83a2a',
      tepung: '#f0e8d8', gula: '#a85a2a', kelapa: '#f0e8d8',
      teh: '#5a4a3a', es: 'rgba(180,220,240,0.8)', kacang: '#c8a86a',
    };

    const color = colors[type] || '#888';

    ctx.save();
    ctx.translate(half, half);

    switch (type) {
      case 'nasi':
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, half - 4, half - 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff8e8';
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * (half - 12);
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'mie':
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          const y = (i - 2.5) * 6;
          ctx.moveTo(-half + 6, y);
          ctx.quadraticCurveTo(0, y + Math.sin(i) * 3, half - 6, y);
          ctx.stroke();
        }
        break;

      case 'telur':
        ctx.fillStyle = '#fff8e8';
        ctx.beginPath();
        ctx.ellipse(0, 0, half - 4, half - 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8c84a';
        ctx.beginPath();
        ctx.arc(0, -2, half - 10, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'bawang':
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, half - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d8c8b8';
        ctx.lineWidth = 1;
        for (let r = 6; r < half - 4; r += 6) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'cabai':
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -half + 4);
        ctx.quadraticCurveTo(half - 6, -half/2, half - 6, 0);
        ctx.quadraticCurveTo(half - 6, half/2, 0, half - 4);
        ctx.quadraticCurveTo(-half + 6, half/2, -half + 6, 0);
        ctx.quadraticCurveTo(-half + 6, -half/2, 0, -half + 4);
        ctx.fill();
        ctx.fillStyle = '#3a7a3a';
        ctx.fillRect(-2, -half + 4, 4, 8);
        break;

      case 'daging':
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, half - 4, half - 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c86a5a';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc((Math.random() - 0.5) * half, (Math.random() - 0.5) * half, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'sayur':
        ctx.fillStyle = '#4a8a3a';
        ctx.fillRect(-6, -half + 4, 12, half - 2);
        ctx.fillStyle = '#5a9a4a';
        ctx.fillRect(-2, -half + 6, 4, half - 6);
        ctx.fillStyle = '#7ac86a';
        ctx.beginPath();
        ctx.arc(half - 8, -half + 8, half - 10, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'kecap':
        ctx.fillStyle = '#1a1512';
        ctx.fillRect(-8, -half + 6, 16, half * 1.4);
        ctx.fillStyle = '#c9a962';
        ctx.fillRect(-8, -half + 6, 16, 10);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(-6, -half + 20, 12, half);
        break;

      case 'saus':
        ctx.fillStyle = '#c83a2a';
        ctx.fillRect(-8, -half + 6, 16, half * 1.4);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-6, -half + 6, 12, 10);
        break;

      case 'tepung':
        ctx.fillStyle = '#f0e8d8';
        ctx.fillRect(-half + 4, -half + 6, size - 8, size - 12);
        ctx.strokeStyle = '#d0c8b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-half + 4, -half + 6, size - 8, size - 12);
        ctx.fillStyle = '#8a7a6a';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TEPUNG', 0, 4);
        break;

      case 'gula':
        ctx.fillStyle = '#a85a2a';
        ctx.beginPath();
        ctx.moveTo(0, -half + 4);
        ctx.lineTo(half - 6, 0);
        ctx.lineTo(0, half - 4);
        ctx.lineTo(-half + 6, 0);
        ctx.closePath();
        ctx.fill();
        break;

      case 'kelapa':
        ctx.fillStyle = '#f0e8d8';
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * (half - 6);
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'teh':
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(-half + 6, -half + 6, size - 12, size - 12);
        ctx.fillStyle = '#8a7a5a';
        ctx.fillRect(-half + 10, -half + 10, size - 20, 8);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -half + 6);
        ctx.lineTo(0, -half - 10);
        ctx.stroke();
        break;

      case 'es':
        ctx.fillStyle = 'rgba(180, 220, 240, 0.9)';
        for (let i = 0; i < 4; i++) {
          const x = (i % 2) * (half - 6) - half/2 + 6;
          const y = Math.floor(i / 2) * (half - 6) - half/2 + 6;
          ctx.fillRect(x, y, half - 8, half - 8);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillRect(x, y, half - 8, 2);
          ctx.fillStyle = 'rgba(180, 220, 240, 0.9)';
        }
        break;

      case 'kacang':
        ctx.fillStyle = '#c8a86a';
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const r = half - 10;
          ctx.beginPath();
          ctx.ellipse(Math.cos(angle) * r, Math.sin(angle) * r, 7, 4, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      default:
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, half - 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
  }

  // Clear cache
  clearCache() {
    this.spriteCache.clear();
  }
}

// Export singleton
export const art = new ArtGenerator();