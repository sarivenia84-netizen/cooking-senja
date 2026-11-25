import { CONFIG, GAME_STATE } from './config.js';

export class Timer {
  constructor() {
    this.state = GAME_STATE.MENU;
    this.day = 1;
    this.prepTimeLeft = CONFIG.PREP_TIME;
    this.rushTimeLeft = CONFIG.RUSH_TIME;
    this.totalTimeLeft = CONFIG.DAY_DURATION;
    this.phase = 'prep'; // 'prep' or 'rush'
    this.paused = false;
  }

  start() {
    this.state = GAME_STATE.PLAYING;
    this.paused = false;
    this.prepTimeLeft = CONFIG.PREP_TIME;
    this.rushTimeLeft = CONFIG.RUSH_TIME;
    this.totalTimeLeft = CONFIG.DAY_DURATION;
    this.phase = 'prep';
  }

  nextDay() {
    this.day++;
    this.prepTimeLeft = CONFIG.PREP_TIME;
    this.rushTimeLeft = CONFIG.RUSH_TIME;
    this.totalTimeLeft = CONFIG.DAY_DURATION;
    this.phase = 'prep';
  }

  update(dt) {
    if (this.paused || this.state !== GAME_STATE.PLAYING) return;

    this.totalTimeLeft -= dt;

    if (this.phase === 'prep') {
      this.prepTimeLeft -= dt;
      if (this.prepTimeLeft <= 0) {
        this.phase = 'rush';
        this.prepTimeLeft = 0;
      }
    } else {
      this.rushTimeLeft -= dt;
      if (this.rushTimeLeft <= 0) {
        this.rushTimeLeft = 0;
        this.endDay();
      }
    }
  }

  endDay() {
    this.state = GAME_STATE.DAY_END;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  getPhase() {
    return this.phase;
  }

  getTimeLeft() {
    return this.phase === 'prep' ? this.prepTimeLeft : this.rushTimeLeft;
  }

  getTotalTimeLeft() {
    return this.totalTimeLeft;
  }

  getProgress() {
    return 1 - (this.totalTimeLeft / CONFIG.DAY_DURATION);
  }

  isPrepPhase() {
    return this.phase === 'prep';
  }

  isRushPhase() {
    return this.phase === 'rush';
  }

  isTimeUp() {
    return this.totalTimeLeft <= 0;
  }

  getDay() {
    return this.day;
  }

  getState() {
    return this.state;
  }

  setState(state) {
    this.state = state;
  }

  // Format time as MM:SS
  formatTime(seconds) {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  render(ctx) {
    const x = CONFIG.CANVAS_WIDTH / 2;
    const y = 60;

    ctx.save();
    ctx.translate(x, y);

    // Timer background
    const bgWidth = 280;
    const bgHeight = 70;
    ctx.fillStyle = CONFIG.COLORS.HUD_BG;
    this.roundRect(ctx, -bgWidth/2, -bgHeight/2, bgWidth, bgHeight, 12, true, false);

    ctx.strokeStyle = this.phase === 'rush' ? CONFIG.COLORS.ACCENT_RED : CONFIG.COLORS.ACCENT_GOLD;
    ctx.lineWidth = 3;
    this.roundRect(ctx, -bgWidth/2, -bgHeight/2, bgWidth, bgHeight, 12, false, true);

    // Phase label
    ctx.fillStyle = this.phase === 'rush' ? CONFIG.COLORS.ACCENT_RED : CONFIG.COLORS.ACCENT_GREEN;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.phase === 'prep' ? 'PERSIAPAN' : 'RUSH HOUR!', 0, -18);

    // Time
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.formatTime(this.getTimeLeft()), 0, 16);

    // Day indicator
    ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
    ctx.font = '14px sans-serif';
    ctx.fillText(`HARI ${this.day}`, 0, 38);

    // Progress bar
    const barY = 42;
    const barW = bgWidth - 40;
    const barH = 6;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.roundRect(ctx, -barW/2, barY, barW, barH, barH/2, true, false);

    const progressColor = this.phase === 'rush' ? CONFIG.COLORS.ACCENT_RED : CONFIG.COLORS.ACCENT_GOLD;
    ctx.fillStyle = progressColor;
    this.roundRect(ctx, -barW/2, barY, barW * this.getProgress(), barH, barH/2, true, false);

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