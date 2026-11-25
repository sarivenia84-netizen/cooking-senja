import { CONFIG, GAME_STATE } from './config.js';

export class HUD {
  constructor() {
    this.score = 0;
    this.money = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.day = 1;
    this.ordersServed = 0;
    this.perfectChops = 0;
  }

  addScore(amount) {
    this.score += amount;
    this.money += amount;
  }

  addCombo() {
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
  }

  resetCombo() {
    this.combo = 0;
  }

  incrementOrdersServed() {
    this.ordersServed++;
  }

  incrementPerfectChops() {
    this.perfectChops++;
  }

  setDay(day) {
    this.day = day;
  }

  getScore() {
    return this.score;
  }

  getMoney() {
    return this.money;
  }

  getCombo() {
    return this.combo;
  }

  spendMoney(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      return true;
    }
    return false;
  }

  render(ctx, gameState) {
    if (gameState === GAME_STATE.MENU) {
      this.renderMenu(ctx);
    } else if (gameState === GAME_STATE.PLAYING || gameState === GAME_STATE.PAUSED) {
      this.renderGameHUD(ctx);
    } else if (gameState === GAME_STATE.DAY_END) {
      this.renderDayEnd(ctx);
    } else if (gameState === GAME_STATE.GAME_OVER) {
      this.renderGameOver(ctx);
    }
  }

  renderMenu(ctx) {
    const x = CONFIG.CANVAS_WIDTH / 2;
    const y = CONFIG.CANVAS_HEIGHT / 2;

    ctx.save();
    ctx.translate(x, y);

    // Title
    ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DAPUR SENJA', 0, -100);

    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = '24px sans-serif';
    ctx.fillText('Simulasi Memasak Indonesia', 0, -60);

    // Start prompt
    ctx.fillStyle = CONFIG.COLORS.ACCENT_GREEN;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('TEKAN ENTER UNTUK MEMULAI', 0, 20);

    // Controls
    ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
    ctx.font = '16px sans-serif';
    ctx.fillText('WASD: Gerak  |  E: Ambil/Taruh  |  SPASI: Potong  |  Q: Antar', 0, 70);
    ctx.fillText('ESC: Pause', 0, 95);

    // Features
    ctx.font = '14px sans-serif';
    ctx.fillText('8 Resep Indonesia  •  3 Hari  •  Sistem Combo  •  Fisika Bahan', 0, 130);

    ctx.restore();
  }

  renderGameHUD(ctx) {
    // Top-left: Score & Money
    this.renderScorePanel(ctx, 20, 20);

    // Top-right: Day & Combo
    this.renderDayComboPanel(ctx, CONFIG.CANVAS_WIDTH - 220, 20);

    // Bottom-left: Controls reminder
    this.renderControlsHint(ctx, 20, CONFIG.CANVAS_HEIGHT - 80);
  }

  renderScorePanel(ctx, x, y) {
    const w = 200, h = 90;
    ctx.fillStyle = CONFIG.COLORS.HUD_BG;
    this.roundRect(ctx, x, y, w, h, 8, true, false);
    ctx.strokeStyle = CONFIG.COLORS.HUD_BORDER;
    ctx.lineWidth = 1;
    this.roundRect(ctx, x, y, w, h, 8, false, true);

    ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SKOR', x + 15, y + 22);

    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(this.score.toLocaleString(), x + 15, y + 55);

    ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.font = '14px sans-serif';
    ctx.fillText('💰', x + 15, y + 78);
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(this.money.toLocaleString(), x + 35, y + 78);
  }

  renderDayComboPanel(ctx, x, y) {
    const w = 200, h = 90;
    ctx.fillStyle = CONFIG.COLORS.HUD_BG;
    this.roundRect(ctx, x, y, w, h, 8, true, false);
    ctx.strokeStyle = CONFIG.COLORS.HUD_BORDER;
    ctx.lineWidth = 1;
    this.roundRect(ctx, x, y, w, h, 8, false, true);

    ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`HARI ${this.day}`, x + 15, y + 22);

    // Combo
    if (this.combo > 0) {
      ctx.fillStyle = CONFIG.COLORS.ACCENT_ORANGE;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`COMBO x${this.combo}`, x + 15, y + 45);

      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('🔥'.repeat(Math.min(5, this.combo)), x + 15, y + 75);
    } else {
      ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
      ctx.font = '14px sans-serif';
      ctx.fillText('Kombinasi: -', x + 15, y + 45);
    }

    // Max combo
    ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
    ctx.font = '11px sans-serif';
    ctx.fillText(`Best: x${this.maxCombo}`, x + 15, y + 78);
  }

  renderControlsHint(ctx, x, y) {
    const hints = [
      'WASD: Gerak',
      'E: Ambil/Taruh',
      'SPASI: Potong (ritme)',
      'Q: Antar Pesanan',
      'ESC: Pause',
    ];

    ctx.fillStyle = CONFIG.COLORS.HUD_BG;
    this.roundRect(ctx, x, y, 180, hints.length * 20 + 10, 8, true, false);

    ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    hints.forEach((hint, i) => {
      ctx.fillText(hint, x + 10, y + 18 + i * 20);
    });
  }

  renderDayEnd(ctx) {
    const x = CONFIG.CANVAS_WIDTH / 2;
    const y = CONFIG.CANVAS_HEIGHT / 2;

    ctx.save();
    ctx.translate(x, y);

    // Panel
    const w = 400, h = 350;
    ctx.fillStyle = CONFIG.COLORS.HUD_BG;
    this.roundRect(ctx, -w/2, -h/2, w, h, 16, true, false);
    ctx.strokeStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.lineWidth = 3;
    this.roundRect(ctx, -w/2, -h/2, w, h, 16, false, true);

    // Title
    ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`HARI ${this.day} SELESAI`, 0, -120);

    // Stats
    const stats = [
      { label: 'Pesanan Disajikan', value: this.ordersServed },
      { label: 'Potongan Sempurna', value: this.perfectChops },
      { label: 'Combo Tertinggi', value: `x${this.maxCombo}` },
      { label: 'Total Skor', value: this.score.toLocaleString() },
      { label: 'Uang', value: `💰 ${this.money.toLocaleString()}` },
    ];

    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = '18px sans-serif';
    stats.forEach((stat, i) => {
      const sy = -60 + i * 45;
      ctx.fillText(stat.label, 0, sy);
      ctx.fillStyle = CONFIG.COLORS.ACCENT_GOLD;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(String(stat.value), 0, sy + 30);
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = '18px sans-serif';
    });

    // Next day prompt
    ctx.fillStyle = CONFIG.COLORS.ACCENT_GREEN;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('TEKAN ENTER UNTUK HARI BERIKUTNYA', 0, 130);

    ctx.restore();
  }

  renderGameOver(ctx) {
    const x = CONFIG.CANVAS_WIDTH / 2;
    const y = CONFIG.CANVAS_HEIGHT / 2;

    ctx.save();
    ctx.translate(x, y);

    const w = 400, h = 300;
    ctx.fillStyle = CONFIG.COLORS.HUD_BG;
    this.roundRect(ctx, -w/2, -h/2, w, h, 16, true, false);
    ctx.strokeStyle = CONFIG.COLORS.ACCENT_RED;
    ctx.lineWidth = 3;
    this.roundRect(ctx, -w/2, -h/2, w, h, 16, false, true);

    ctx.fillStyle = CONFIG.COLORS.ACCENT_RED;
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 0, -80);

    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = '20px sans-serif';
    ctx.fillText(`Skor Akhir: ${this.score.toLocaleString()}`, 0, -20);
    ctx.fillText(`Uang: 💰 ${this.money.toLocaleString()}`, 0, 15);
    ctx.fillText(`Hari Terakhir: ${this.day}`, 0, 50);

    ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
    ctx.font = '16px sans-serif';
    ctx.fillText('Refresh halaman untuk bermain lagi', 0, 100);

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