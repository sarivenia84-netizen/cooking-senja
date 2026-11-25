// Dapur Senja - Main Game Entry Point
console.log('[main.js] Loading modules...');
import { CONFIG, GAME_STATE, KEYS, LAYERS } from './config.js';
import { Kitchen } from './kitchen.js';
import { OrderBoard } from './orders.js';
import { IngredientManager } from './ingredients.js';
import { ChopStation } from './chop.js';
import { StoveManager } from './stove.js';
import { PlatingManager } from './plating.js';
import { ServeManager } from './serve.js';
import { Timer } from './timer.js';
import { HUD } from './hud.js';
import { audio } from './audio.js';
import { LevelManager, LEVELS } from './levels.js';
import { RECIPES, AVAILABLE_INGREDIENTS } from './recipes.js';
console.log('[main.js] All modules loaded');

// ============ Player Class ============
class Player {
  constructor() {
    this.x = CONFIG.CANVAS_WIDTH / 2;
    this.y = CONFIG.CANVAS_HEIGHT / 2;
    this.width = CONFIG.PLAYER_SIZE;
    this.height = CONFIG.PLAYER_SIZE;
    this.speed = CONFIG.PLAYER_SPEED;
    this.facing = 'down'; // up, down, left, right
    this.carrying = null;
    this.animTimer = 0;
    this.walkCycle = 0;
  }

  update(dt, input, game) {
    // Movement
    let dx = 0, dy = 0;
    if (input[KEYS.UP]) { dy = -1; this.facing = 'up'; }
    if (input[KEYS.DOWN]) { dy = 1; this.facing = 'down'; }
    if (input[KEYS.LEFT]) { dx = -1; this.facing = 'left'; }
    if (input[KEYS.RIGHT]) { dx = 1; this.facing = 'right'; }

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len; dy /= len;
      this.x += dx * this.speed * dt * 60;
      this.y += dy * this.speed * dt * 60;
      this.walkCycle += dt * 8;
    } else {
      this.walkCycle = 0;
    }

    // Clamp to kitchen bounds
    const margin = 60;
    this.x = Math.max(margin, Math.min(CONFIG.CANVAS_WIDTH - margin, this.x));
    this.y = Math.max(margin, Math.min(CONFIG.CANVAS_HEIGHT - margin, this.y));

    // Animation timer
    this.animTimer += dt;

    // Update carried item position
    if (this.carrying) {
      this.carrying.x = this.x;
      this.carrying.y = this.y - 25;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Bobbing when walking
    const bob = Math.sin(this.walkCycle) * 2;
    const legOffset = Math.sin(this.walkCycle * 2) * 4;
    ctx.translate(0, bob);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, this.height/2, this.width/2, this.height/6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = CONFIG.COLORS.PLAYER_PANTS;
    const legW = 8, legH = 16;
    ctx.fillRect(-this.width/2 + 6, this.height/2 - legH, legW, legH + legOffset);
    ctx.fillRect(this.width/2 - 14, this.height/2 - legH, legW, legH - legOffset);

    // Body
    ctx.fillStyle = CONFIG.COLORS.PLAYER_SHIRT;
    ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height/2);

    // Arms
    const armW = 6, armH = 18;
    const armSwing = Math.sin(this.walkCycle * 2) * 6;
    // Left arm
    ctx.fillStyle = CONFIG.COLORS.PLAYER_SHIRT;
    ctx.fillRect(-this.width/2 - armW, -this.height/2 + 4, armW, armH - armSwing);
    // Right arm
    ctx.fillRect(this.width/2, -this.height/2 + 4, armW, armH + armSwing);

    // Hands
    ctx.fillStyle = CONFIG.COLORS.PLAYER_SKIN;
    ctx.beginPath();
    ctx.arc(-this.width/2 - armW/2, -this.height/2 + armH + 4 - armSwing, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.width/2 + armW/2, -this.height/2 + armH + 4 + armSwing, 6, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = CONFIG.COLORS.PLAYER_SKIN;
    ctx.beginPath();
    ctx.arc(0, -this.height/2 - 8, 14, 0, Math.PI * 2);
    ctx.fill();

    // Face direction indicator
    ctx.fillStyle = '#2a1a1a';
    let eyeX = 0, eyeY = -this.height/2 - 10;
    if (this.facing === 'left') eyeX = -4;
    else if (this.facing === 'right') eyeX = 4;
    else if (this.facing === 'up') eyeY = -this.height/2 - 14;
    else eyeY = -this.height/2 - 6;
    ctx.beginPath();
    ctx.arc(eyeX - 3, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeX + 3, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Chef hat
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(-16, -this.height/2 - 28, 32, 10);
    ctx.fillRect(-10, -this.height/2 - 38, 20, 12);

    ctx.restore();
  }

  getCenter() {
    return { x: this.x, y: this.y };
  }

  getReach() {
    // Reach forward based on facing
    const reach = 50;
    switch (this.facing) {
      case 'up': return { x: this.x, y: this.y - reach };
      case 'down': return { x: this.x, y: this.y + reach };
      case 'left': return { x: this.x - reach, y: this.y };
      case 'right': return { x: this.x + reach, y: this.y };
    }
  }
}

// ============ Game Class ============
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.state = GAME_STATE.MENU;
    this.lastTime = 0;

    // Shot mode from URL params
    this.shotMode = null;
    this.shotSeed = 1;
    this.parseShotParams();

    // Systems
    this.kitchen = new Kitchen();
    this.orderBoard = new OrderBoard();
    this.ingredients = new IngredientManager();
    this.chopStation = new ChopStation(this.kitchen);
    this.stoveManager = new StoveManager(this.kitchen);
    this.platingManager = new PlatingManager(this.kitchen);
    this.serveManager = new ServeManager(this.kitchen, this.orderBoard);
    this.timer = new Timer();
    this.hud = new HUD();
    this.levelManager = new LevelManager();
    this.player = new Player();

    // Input
    this.input = {};
    this.prevInput = {};

    // Available recipes for current day
    this.availableRecipes = [...Object.keys(RECIPES)];

    // Day end callback
    this.dayEndCallback = null;

    this.initInput();
    this.hideOverlay();
  }

  parseShotParams() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    const seed = params.get('seed');
    if (shot) this.shotMode = shot;
    if (seed) this.shotSeed = parseInt(seed, 10) || 1;
    // Seed Math.random for deterministic shots
    if (this.shotMode) {
      Math.seedrandom = Math.seedrandom || (() => {
        let s = this.shotSeed;
        return () => {
          s = (s * 1664525 + 1013904223) >>> 0;
          return s / 4294967296;
        };
      });
      Math.random = Math.seedrandom(this.shotSeed);
    }
  }

  setupShotMode() {
    if (!this.shotMode) return;

    // Skip normal game initialization for shot modes
    this.state = GAME_STATE.PLAYING;
    this.timer.state = GAME_STATE.PLAYING;
    this.timer.day = 1;
    this.timer.phase = 'rush'; // All shots show rush phase activity
    this.timer.prepTimeLeft = 0;
    this.timer.rushTimeLeft = 60;
    this.timer.totalTimeLeft = 60;
    this.levelManager.currentDay = 0;
    this.levelManager.level = LEVELS[2]; // Day 3 - max content
    this.levelManager.applyToGame(this);

    switch (this.shotMode) {
      case 'cover':
        this.setupCoverShot();
        break;
      case 'chop':
        this.setupChopShot();
        break;
      case 'plate':
        this.setupPlateShot();
        break;
      case 'rush':
        this.setupRushShot();
        break;
    }

    // Start BGM for shot modes (muted but initialized)
    audio.startBGM();
    this.hideOverlay();
  }

  setupCoverShot() {
    // Full kitchen + order board + ingredients + timer
    // Player at center, stove cooking, ingredients on counter, orders active

    // Add ingredients to counter
    const baseIngredients = ['nasi', 'mie', 'telur', 'bawang', 'cabai', 'daging', 'sayur', 'kecap', 'tepung', 'gula', 'kelapa', 'teh', 'es', 'kacang'];
    const k = CONFIG.KITCHEN;
    const margin = 40;
    baseIngredients.forEach((type, i) => {
      const x = k.COUNTER_X + margin + (i % 4) * 120 + Math.random() * 20;
      const y = k.COUNTER_Y + margin + Math.floor(i / 4) * 60 + Math.random() * 20;
      this.ingredients.ingredients.push({
        type,
        id: type,
        x, y,
        vx: 0, vy: 0,
        name: type,
        bobOffset: Math.random() * Math.PI * 2,
      });
    });

    // Start cooking on 2 burners
    this.kitchen.placeOnStove(0, { type: 'nasi', id: 'nasi_goreng', recipe: { id: 'nasi_goreng' } }, RECIPES.nasi_goreng);
    this.kitchen.stoveSlots[0].state = 'cooking';
    this.kitchen.stoveSlots[0].progress = 2.5;

    this.kitchen.placeOnStove(1, { type: 'mie', id: 'mie_goreng', recipe: { id: 'mie_goreng' } }, RECIPES.mie_goreng);
    this.kitchen.stoveSlots[1].state = 'cooking';
    this.kitchen.stoveSlots[1].progress = 1.8;

    // Player at center
    this.player.x = CONFIG.CANVAS_WIDTH / 2;
    this.player.y = CONFIG.CANVAS_HEIGHT / 2 + 50;

    // Spawn some orders
    this.orderBoard.orders = [];
    this.orderBoard.spawnOrder();
    this.orderBoard.spawnOrder();
    this.orderBoard.spawnOrder();
    this.orderBoard.orders.forEach(o => o.patience = 80 + Math.random() * 20);
  }

  setupChopShot() {
    // Player at chop station, actively chopping
    const k = CONFIG.KITCHEN;
    const chopX = k.CHOP_X + k.CHOP_WIDTH / 2;
    const chopY = k.CHOP_Y + k.CHOP_HEIGHT / 2;

    // Player at chop station
    this.player.x = chopX;
    this.player.y = chopY + 60;
    this.player.facing = 'up';

    // Place item on chop station
    this.kitchen.placeOnChop({ type: 'bawang', id: 'bawang', name: 'Bawang Merah' });
    this.kitchen.chopStation.chops = 2;
    this.kitchen.chopStation.requiredChops = 3;
    this.kitchen.chopStation.lastChopTime = performance.now() / 1000 - 0.3;
    this.kitchen.chopStation.combo = 3;
    this.chopStation.combo = 3;

    // Some ingredients on counter
    ['bawang', 'cabai', 'daging', 'sayur', 'tepung'].forEach((type, i) => {
      const x = k.COUNTER_X + 80 + i * 100;
      const y = k.COUNTER_Y + 60;
      this.ingredients.ingredients.push({
        type, id: type, x, y, vx: 0, vy: 0, name: type, bobOffset: i * 0.5,
      });
    });

    // Stove with something cooking
    this.kitchen.placeOnStove(0, { type: 'daging', id: 'sate', recipe: { id: 'sate' } }, RECIPES.sate);
    this.kitchen.stoveSlots[0].state = 'cooking';
    this.kitchen.stoveSlots[0].progress = 3;

    // Orders
    this.orderBoard.orders = [];
    this.orderBoard.spawnOrder();
    this.orderBoard.orders[0].patience = 60;
  }

  setupPlateShot() {
    // Player at plate station, plate assembled and ready to serve
    const k = CONFIG.KITCHEN;
    const plateX = k.PLATE_X + k.PLATE_WIDTH / 2;
    const plateY = k.PLATE_Y + 80;

    // Player at plate station
    this.player.x = plateX;
    this.player.y = plateY + 50;
    this.player.facing = 'down';

    // Assemble a complete nasi goreng plate
    const nasiGorengIngredients = ['nasi', 'telur', 'bawang', 'cabai', 'kecap'];
    nasiGorengIngredients.forEach((type, i) => {
      this.kitchen.addToPlate({ type, id: type, cooked: type === 'nasi', chopped: ['bawang', 'cabai'].includes(type) });
    });

    // Serve zone has the order
    const order = { id: 1, recipe: RECIPES.nasi_goreng, patience: 90, maxPatience: 100, expired: false };
    this.kitchen.placeServeOrder(order);

    // Other stove items cooking
    this.kitchen.placeOnStove(1, { type: 'mie', id: 'mie_goreng', recipe: { id: 'mie_goreng' } }, RECIPES.mie_goreng);
    this.kitchen.stoveSlots[1].state = 'cooking';
    this.kitchen.stoveSlots[1].progress = 2;

    this.kitchen.placeOnStove(2, { type: 'sayur', id: 'gado_gado', recipe: { id: 'gado_gado' } }, RECIPES.gado_gado);
    this.kitchen.stoveSlots[2].state = 'cooking';
    this.kitchen.stoveSlots[2].progress = 1.5;

    // Ingredients on counter
    ['nasi', 'mie', 'telur', 'bawang', 'cabai', 'kecap', 'sayur', 'tepung', 'daging'].forEach((type, i) => {
      const x = k.COUNTER_X + 60 + (i % 4) * 110;
      const y = k.COUNTER_Y + 50 + Math.floor(i / 4) * 60;
      this.ingredients.ingredients.push({ type, id: type, x, y, vx: 0, vy: 0, name: type, bobOffset: i * 0.3 });
    });

    // Orders
    this.orderBoard.orders = [order];
    this.orderBoard.orders[0].patience = 85;
  }

  setupRushShot() {
    // Rush hour - many orders, all stations busy
    const k = CONFIG.KITCHEN;

    // Player moving between stations
    this.player.x = CONFIG.CANVAS_WIDTH / 2;
    this.player.y = CONFIG.CANVAS_HEIGHT / 2;
    this.player.facing = 'right';

    // All 4 burners cooking
    const cookingRecipes = [RECIPES.nasi_goreng, RECIPES.mie_goreng, RECIPES.sate, RECIPES.gado_gado];
    cookingRecipes.forEach((recipe, i) => {
      this.kitchen.placeOnStove(i, { type: recipe.ingredients[0], id: recipe.id, recipe: { id: recipe.id } }, recipe);
      this.kitchen.stoveSlots[i].state = 'cooking';
      this.kitchen.stoveSlots[i].progress = recipe.cookTime * (0.3 + Math.random() * 0.5);
    });

    // Chop station active
    this.kitchen.placeOnChop({ type: 'sayur', id: 'sayur', name: 'Sayur Campur' });
    this.kitchen.chopStation.chops = 2;
    this.kitchen.chopStation.requiredChops = 3;
    this.kitchen.chopStation.combo = 4;
    this.chopStation.combo = 4;

    // Plate station with partial assembly
    this.kitchen.addToPlate({ type: 'nasi', id: 'nasi', cooked: true });
    this.kitchen.addToPlate({ type: 'telur', id: 'telur', cooked: true });
    this.kitchen.addToPlate({ type: 'bawang', id: 'bawang', chopped: true });

    // Many ingredients on counter
    ['nasi', 'mie', 'telur', 'bawang', 'cabai', 'daging', 'sayur', 'kecap', 'tepung', 'gula', 'kelapa', 'teh', 'es', 'kacang', 'saus'].forEach((type, i) => {
      const x = k.COUNTER_X + 40 + (i % 5) * 100;
      const y = k.COUNTER_Y + 40 + Math.floor(i / 5) * 60;
      this.ingredients.ingredients.push({ type, id: type, x, y, vx: 0, vy: 0, name: type, bobOffset: i * 0.2 });
    });

    // Max orders (4) with low patience
    this.orderBoard.orders = [];
    for (let i = 0; i < 4; i++) {
      this.orderBoard.spawnOrder();
    }
    this.orderBoard.orders.forEach((o, i) => {
      o.patience = 15 + i * 15; // Very low patience
    });

    // Rush hour timer
    this.timer.phase = 'rush';
    this.timer.rushTimeLeft = 30;
    this.timer.totalTimeLeft = 30;
  }

  initInput() {
    window.addEventListener('keydown', (e) => {
      this.input[e.key.toLowerCase()] = true;
      // Prevent default for game keys
      if (Object.values(KEYS).includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input[e.key.toLowerCase()] = false;
    });

    // Resume audio on first interaction
    document.addEventListener('click', () => audio.resume(), { once: true });
    document.addEventListener('keydown', () => audio.resume(), { once: true });
  }

  hideOverlay() {
    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  showOverlay() {
    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.classList.remove('hidden');
  }

  startGame() {
    this.state = GAME_STATE.PLAYING;
    this.timer.start();
    this.levelManager.applyToGame(this);
    this.orderBoard.orders = []; // Clear any stale orders
    audio.startBGM();
    this.hideOverlay();
  }

  nextDay() {
    this.levelManager.nextDay();
    this.levelManager.applyToGame(this);
    this.timer.nextDay();
    this.hud.setDay(this.timer.getDay());
    this.orderBoard.orders = [];
    this.ingredients.ingredients = [];
    this.kitchen.stoveSlots = Array(CONFIG.STOVE_SLOTS).fill(null);
    this.kitchen.plateStation.items = [];
    this.kitchen.chopStation = null;
    this.player.carrying = null;
    audio.startBGM();
  }

  endGame() {
    this.state = GAME_STATE.GAME_OVER;
    audio.stopBGM();
    this.showOverlay();
  }

  update(dt) {
    if (this.state !== GAME_STATE.PLAYING) return;

    // Update timer
    this.timer.update(dt);

    // Check for phase change (prep -> rush)
    if (this.timer.isRushPhase() && !this.rushMusicStarted) {
      audio.startRushBGM();
      this.rushMusicStarted = true;
    }

    // Update systems
    this.kitchen.update(dt);
    this.orderBoard.update(dt, CONFIG.DAY_DURATION - this.timer.getTotalTimeLeft());
    this.ingredients.update(dt);
    this.chopStation.update(dt);
    this.stoveManager.update(dt);
    this.serveManager.update(dt);

    // Update player
    this.player.update(dt, this.input, this);

    // Handle input actions (on key press, not hold)
    this.handleActions();

    // Check day end
    if (this.timer.getState() === GAME_STATE.DAY_END) {
      this.state = GAME_STATE.DAY_END;
      audio.stopBGM();
      audio.playDayEnd();
      this.showDayEnd();
    }

    // Update previous input
    this.prevInput = { ...this.input };
  }

  handleActions() {
    // Interact (E) - Pick up / Place
    if (this.justPressed(KEYS.INTERACT)) {
      this.handleInteract();
    }

    // Chop (SPACE)
    if (this.justPressed(KEYS.CHOP)) {
      this.handleChop();
    }

    // Serve (Q)
    if (this.justPressed(KEYS.SERVE)) {
      this.handleServe();
    }

    // Pause (ESC)
    if (this.justPressed(KEYS.PAUSE)) {
      this.togglePause();
    }
  }

  justPressed(key) {
    return this.input[key] && !this.prevInput[key];
  }

  handleInteract() {
    const reach = this.player.getReach();

    // If carrying, try to place
    if (this.player.carrying) {
      const item = this.player.carrying;

      // Try stove
      if (this.tryPlaceOnStove(reach, item)) return;

      // Try chop station
      if (this.tryPlaceOnChop(reach, item)) return;

      // Try plate station
      if (this.tryPlaceOnPlate(reach, item)) return;

      // Try serve zone
      if (this.tryPlaceOnServe(reach, item)) return;

      // Try counter (put back)
      if (this.tryPlaceOnCounter(reach, item)) return;
    } else {
      // Not carrying - try to pick up
      this.tryPickup(reach);
    }
  }

  tryPickup(reach) {
    // Priority: stove (ready), chop (done), plate, serve, counter, ingredients
    // Check stove for done items
    for (let i = 0; i < this.kitchen.stoveSlots.length; i++) {
      const slot = this.kitchen.stoveSlots[i];
      if (slot && slot.state === 'done' && this.isNear(reach, this.getStoveSlotPos(i))) {
        const taken = this.kitchen.takeFromStove(i);
        if (taken) {
          this.player.carrying = taken.item;
          this.player.carrying.recipe = taken.recipe;
          this.player.carrying.cooked = true;
          audio.playPickup();
          return true;
        }
      }
    }

    // Check chop station for done chopping
    if (this.kitchen.chopStation && this.kitchen.chopStation.chops >= this.kitchen.chopStation.requiredChops) {
      const chopPos = this.getChopPos();
      if (this.isNear(reach, chopPos)) {
        const item = this.kitchen.takeFromChop();
        if (item) {
          this.player.carrying = item.item;
          this.player.carrying.chopped = true;
          audio.playPickup();
          return true;
        }
      }
    }

    // Check plate station
    const plateItems = this.kitchen.getPlateItems();
    for (let i = plateItems.length - 1; i >= 0; i--) {
      const platePos = this.getPlateSlotPos(i);
      if (this.isNear(reach, platePos)) {
        const item = this.kitchen.removeFromPlate(i);
        if (item) {
          this.player.carrying = item;
          audio.playPickup();
          return true;
        }
      }
    }

    // Check serve zone
    if (this.kitchen.hasServeOrder()) {
      const servePos = this.getServePos();
      if (this.isNear(reach, servePos)) {
        const order = this.kitchen.takeServeOrder();
        if (order) {
          this.player.carrying = { type: 'order', order };
          audio.playPickup();
          return true;
        }
      }
    }

    // Check counter ingredients
    const picked = this.ingredients.tryPickup(reach.x, reach.y);
    if (picked) {
      this.player.carrying = picked;
      audio.playPickup();
      return true;
    }

    return false;
  }

  tryPlaceOnStove(reach, item) {
    for (let i = 0; i < this.kitchen.stoveSlots.length; i++) {
      const slot = this.kitchen.stoveSlots[i];
      const pos = this.getStoveSlotPos(i);
      if (!slot && this.isNear(reach, pos) && item.recipe && RECIPES[item.recipe.id]) {
        const recipe = RECIPES[item.recipe.id];
        if (this.kitchen.placeOnStove(i, item, recipe)) {
          this.player.carrying = null;
          audio.playPlace();
          audio.playSizzle();
          return true;
        }
      }
    }
    return false;
  }

  tryPlaceOnChop(reach, item) {
    const chopPos = this.getChopPos();
    const chopableTypes = ['bawang', 'cabai', 'daging', 'sayur', 'tepung'];
    if (!this.kitchen.chopStation && this.isNear(reach, chopPos) && chopableTypes.includes(item.type)) {
      if (this.kitchen.placeOnChop(item)) {
        this.player.carrying = null;
        audio.playPlace();
        return true;
      }
    }
    return false;
  }

  tryPlaceOnPlate(reach, item) {
    for (let i = 0; i < CONFIG.PLATE_SLOTS; i++) {
      const platePos = this.getPlateSlotPos(i);
      if (this.isNear(reach, platePos) && !this.kitchen.plateStation.items[i]) {
        if (this.kitchen.addToPlate(item)) {
          this.player.carrying = null;
          audio.playPlace();
          return true;
        }
      }
    }
    return false;
  }

  tryPlaceOnServe(reach, item) {
    const servePos = this.getServePos();
    if (this.isNear(reach, servePos) && item.type === 'order') {
      this.kitchen.placeServeOrder(item.order);
      this.player.carrying = null;
      audio.playPlace();
      return true;
    }
    return false;
  }

  tryPlaceOnCounter(reach, item) {
    const k = CONFIG.KITCHEN;
    const counterX = k.COUNTER_X + k.COUNTER_WIDTH / 2;
    const counterY = k.COUNTER_Y + k.COUNTER_HEIGHT / 2;
    if (this.isNear(reach, { x: counterX, y: counterY })) {
      if (this.ingredients.placeHeldItem(counterX, counterY)) {
        this.player.carrying = null;
        audio.playPlace();
        return true;
      }
    }
    return false;
  }

  handleChop() {
    const chopPos = this.getChopPos();
    const reach = this.player.getReach();

    if (this.isNear(reach, chopPos)) {
      if (this.kitchen.chopStation) {
        // Already chopping - do a chop
        const result = this.chopStation.chop();
        if (result.success) {
          audio.playChop(result.perfect);
          if (result.perfect) {
            this.hud.incrementPerfectChops();
            this.chopStation.combo++;
            if (this.chopStation.combo > 1) {
              this.hud.addCombo();
              audio.playCombo(this.chopStation.combo);
            }
          } else {
            this.chopStation.combo = 0;
            this.hud.resetCombo();
          }
        }
      } else if (this.player.carrying) {
        // Try to place on chop station
        this.tryPlaceOnChop(reach, this.player.carrying);
      }
    }
  }

  handleServe() {
    const servePos = this.getServePos();
    const reach = this.player.getReach();

    if (this.isNear(reach, servePos)) {
      if (this.kitchen.hasServeOrder()) {
        // Already has order at serve zone - serve it!
        const result = this.serveManager.tryServe();
        if (result.success) {
          this.hud.addScore(result.score);
          this.hud.incrementOrdersServed();
          this.hud.addCombo();
          audio.playServe(true);
        } else {
          audio.playServe(false);
          this.hud.resetCombo();
        }
      } else if (this.player.carrying && this.player.carrying.type === 'order') {
        // Place order at serve zone
        this.tryPlaceOnServe(reach, this.player.carrying);
      } else {
        // Check if plate matches any order
        const plateItems = this.kitchen.getPlateItems();
        if (plateItems.length > 0) {
          const matchingOrder = this.orderBoard.findMatchingOrder(plateItems);
          if (matchingOrder) {
            this.kitchen.placeServeOrder(matchingOrder);
            this.kitchen.clearPlate();
            audio.playPlace();
          }
        }
      }
    }
  }

  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
      this.timer.pause();
      audio.stopBGM();
      this.showOverlay();
    } else if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
      this.timer.resume();
      if (this.timer.isRushPhase()) audio.startRushBGM();
      else audio.startBGM();
      this.hideOverlay();
    }
  }

  showDayEnd() {
    this.showOverlay();
    // Update HUD with day stats
    this.hud.setDay(this.timer.getDay());
  }

  isNear(pos1, pos2, threshold = 50) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy) <= threshold;
  }

  getStoveSlotPos(index) {
    const k = CONFIG.KITCHEN;
    const burnerCount = 4;
    const burnerW = 80;
    const startX = k.STOVE_X + (k.STOVE_WIDTH - (burnerCount * burnerW + (burnerCount - 1) * 20)) / 2;
    const bx = startX + index * (burnerW + 20);
    return { x: bx + burnerW/2, y: k.STOVE_Y + 20 + 80/2 };
  }

  getChopPos() {
    const k = CONFIG.KITCHEN;
    return { x: k.CHOP_X + k.CHOP_WIDTH/2, y: k.CHOP_Y + k.CHOP_HEIGHT/2 };
  }

  getPlateSlotPos(index) {
    const k = CONFIG.KITCHEN;
    const slotSize = 56;
    const startX = k.PLATE_X + (k.PLATE_WIDTH - (slotSize * CONFIG.PLATE_SLOTS + (CONFIG.PLATE_SLOTS - 1) * 12)) / 2;
    const sx = startX + index * (slotSize + 12);
    return { x: sx + slotSize/2, y: k.PLATE_Y + 30 + slotSize/2 };
  }

  getServePos() {
    const k = CONFIG.KITCHEN;
    return { x: k.SERVE_X + k.SERVE_WIDTH/2, y: k.SERVE_Y + k.SERVE_HEIGHT/2 };
  }

  render() {
    // Clear
    this.ctx.fillStyle = CONFIG.COLORS.BG;
    this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Render kitchen (floor, walls, stations)
    this.kitchen.render(this.ctx);

    // Render stove particles (steam, smoke, fire)
    this.stoveManager.renderParticles(this.ctx);

    // Render ingredients on counter
    this.ingredients.render(this.ctx);

    // Render chop particles
    this.chopStation.renderParticles(this.ctx);

    // Render serve particles
    this.serveManager.renderParticles(this.ctx);

    // Render player
    this.player.render(this.ctx);

    // Render carried item
    if (this.player.carrying) {
      this.ingredients.renderIngredient(this.ctx, this.player.carrying, this.player.carrying.x, this.player.carrying.y, true);
    }

    // Render UI layers
    this.orderBoard.render(this.ctx);
    this.timer.render(this.ctx);
    this.hud.render(this.ctx, this.state);

    // Render day intro if at menu/start of day
    if (this.state === GAME_STATE.MENU || this.state === GAME_STATE.DAY_END) {
      this.levelManager.renderIntro(this.ctx);
    }

    // Render serve feedback
    this.serveManager.renderServeFeedback(this.ctx);

    // Render chop rhythm indicator
    this.chopStation.renderRhythmIndicator(this.ctx);
    this.chopStation.renderCombo(this.ctx);
  }

  gameLoop(timestamp) {
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Cap dt to prevent spiral of death
    const cappedDt = Math.min(dt, 1/30);

    this.update(cappedDt);
    this.render();

    // For shot modes, only render one frame then stop
    if (this.shotMode) {
      return;
    }
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  start() {
    if (this.shotMode) {
      this.setupShotMode();
      // Render one frame for shot mode
      this.lastTime = performance.now();
      this.update(0);
      this.render();
      return;
    }
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
}

// ============ Initialize Game ============
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();

  // Handle Enter key for menu/day transitions
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (game.state === GAME_STATE.MENU) {
        game.startGame();
      } else if (game.state === GAME_STATE.DAY_END) {
        if (game.levelManager.isLastDay()) {
          game.endGame();
        } else {
          game.nextDay();
          game.state = GAME_STATE.PLAYING;
          game.hideOverlay();
        }
      } else if (game.state === GAME_STATE.GAME_OVER) {
        // Restart
        location.reload();
      }
    }
  });

  // Make game globally accessible for debugging
  window.game = game;
});