import { CONFIG } from './config.js';

export const LEVELS = [
  {
    day: 1,
    name: 'Hari Pertama - Pelan-pelan',
    description: 'Hari buka puasa pertama, pelanggan masih sedikit.',
    maxOrders: 3,
    spawnInterval: 20,
    patienceDecay: 0.6,
    recipes: ['nasi_goreng', 'mie_goreng', 'es_teh', 'bakwan'],
    rushMultiplier: 1.0,
    tip: 'Fokus pada mempelajari resep dan ritme memotong.',
  },
  {
    day: 2,
    name: 'Hari Kedua - Makin Ramai',
    description: 'Kabaran enaknya menyebar, antrian mulai panjang.',
    maxOrders: 4,
    spawnInterval: 15,
    patienceDecay: 0.8,
    recipes: ['nasi_goreng', 'mie_goreng', 'sate', 'es_teh', 'gado_gado', 'bakwan'],
    rushMultiplier: 1.2,
    tip: 'Manfaatkan kompor 4 tungku sekaligus. Jangan biarkan gosong!',
  },
  {
    day: 3,
    name: 'Hari Ketiga - Puncak Keramaian',
    description: 'Hari paling sibuk! Semua resep diminta sekaligus.',
    maxOrders: 4,
    spawnInterval: 10,
    patienceDecay: 1.0,
    recipes: ['nasi_goreng', 'mie_goreng', 'sate', 'es_teh', 'gado_gado', 'bakwan', 'soto', 'klepon'],
    rushMultiplier: 1.5,
    tip: 'Siapkan bahan di piring dulu, baru masak. Prioritaskan pesanan hampir habis kesabaran.',
  },
];

export class LevelManager {
  constructor() {
    this.currentDay = 0;
    this.level = LEVELS[0];
  }

  nextDay() {
    this.currentDay = Math.min(this.currentDay + 1, LEVELS.length - 1);
    this.level = LEVELS[this.currentDay];
    return this.level;
  }

  getCurrentLevel() {
    return this.level;
  }

  getDay() {
    return this.currentDay + 1;
  }

  isLastDay() {
    return this.currentDay >= LEVELS.length - 1;
  }

  applyToGame(game) {
    const level = this.level;
    game.orderBoard.maxOrders = level.maxOrders;
    game.orderBoard.spawnInterval = level.spawnInterval;
    game.orderBoard.PATIENCE_DECAY = level.patienceDecay;
    // Filter available recipes for this day
    game.availableRecipes = level.recipes;
  }

  renderIntro(ctx) {
    const level = this.level;
    const x = CONFIG.CANVAS_WIDTH / 2;
    const y = CONFIG.CANVAS_HEIGHT / 2;

    ctx.save();
    ctx.translate(x, y);

    // Background panel
    const w = 500, h = 380;
    ctx.fillStyle = 'rgba(13, 10, 8, 0.95)';
    this.roundRect(ctx, -w/2, -h/2, w, h, 16, true, false);
    ctx.strokeStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.lineWidth = 3;
    this.roundRect(ctx, -w/2, -h/2, w, h, 16, false, true);

    // Day title
    ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(level.name, 0, -130);

    // Description
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = '18px sans-serif';
    ctx.fillText(level.description, 0, -80);

    // Stats
    ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
    ctx.font = '16px sans-serif';
    const stats = [
      `Pesanan Maksimal: ${level.maxOrders}`,
      `Interval Spawn: ${level.spawnInterval}s`,
      `Kecepatan Kesabaran: ${level.patienceDecay}x`,
      `Resep Tersedia: ${level.recipes.length}`,
    ];
    stats.forEach((stat, i) => {
      ctx.fillText(stat, 0, -30 + i * 28);
    });

    // Tip
    ctx.fillStyle = CONFIG.COLORS.ACCENT_GREEN;
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText(`💡 ${level.tip}`, 0, 70);

    // Start prompt
    ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('TEKAN ENTER UNTUK MEMULAI', 0, 130);

    ctx.restore();
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