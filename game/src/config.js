// Game configuration constants
export const CONFIG = {
  // Canvas
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,

  // Game timing
  PREP_TIME: 60,       // seconds
  RUSH_TIME: 120,      // seconds
  DAY_DURATION: 180,   // total seconds per day

  // Player
  PLAYER_SPEED: 3.5,
  PLAYER_SIZE: 32,

  // Kitchen layout
  KITCHEN: {
    STOVE_X: 100,
    STOVE_Y: 120,
    STOVE_WIDTH: 480,
    STOVE_HEIGHT: 180,
    COUNTER_X: 620,
    COUNTER_Y: 120,
    COUNTER_WIDTH: 560,
    COUNTER_HEIGHT: 180,
    CHOP_X: 100,
    CHOP_Y: 340,
    CHOP_WIDTH: 280,
    CHOP_HEIGHT: 180,
    PLATE_X: 420,
    PLATE_Y: 340,
    PLATE_WIDTH: 280,
    PLATE_HEIGHT: 180,
    SINK_X: 740,
    SINK_Y: 340,
    SINK_WIDTH: 280,
    SINK_HEIGHT: 180,
    SERVE_X: 1060,
    SERVE_Y: 340,
    SERVE_WIDTH: 180,
    SERVE_HEIGHT: 180,
  },

  // Order board
  ORDER_BOARD: {
    X: 880,
    Y: 20,
    WIDTH: 380,
    HEIGHT: 680,
    MAX_ORDERS: 4,
    PATIENCE_DECAY: 0.8,  // per second
  },

  // Ingredients
  INGREDIENT_SIZE: 36,
  INGREDIENT_SPAWN_INTERVAL: 8,  // seconds
  MAX_INGREDIENTS_ON_COUNTER: 12,

  // Cooking
  STOVE_SLOTS: 4,
  COOK_TIME: {
    nasi_goreng: 5,
    mie_goreng: 4,
    sate: 6,
    es_teh: 3,
    gado_gado: 5,
    bakwan: 4,
    soto: 7,
    klepon: 5,
  },
  BURN_TIME: 3,  // seconds after done before burning

  // Chopping
  CHOP_RHYTHM_WINDOW: 0.4,  // seconds for perfect chop
  CHOP_COMBO_MAX: 5,
  CHOP_HITS_NEEDED: {
    bawang: 3,
    cabai: 2,
    daging: 4,
    sayur: 3,
    tepung: 2,
  },

  // Plating
  PLATE_SLOTS: 4,

  // Scoring
  BASE_SCORE: 100,
  PERFECT_BONUS: 50,
  COMBO_MULTIPLIER: 1.2,
  TIP_BASE: 20,
  TIP_PATIENCE_FACTOR: 0.5,

  // Colors - Warm sunset palette
  COLORS: {
    BG: '#0d0a08',
    WALL: '#2d1f16',
    FLOOR: '#1a120d',
    COUNTER_TOP: '#3d2f24',
    COUNTER_EDGE: '#5d4a3a',
    STOVE_BODY: '#2a1a12',
    STOVE_TOP: '#3a2a1a',
    BURNER_OFF: '#4a3a2a',
    BURNER_ON: '#e86c1a',
    BURNER_HOT: '#ff4400',
    SINK_BASIN: '#1a3a4a',
    SINK_TAP: '#8a9a9a',
    PLATE_WHITE: '#f5f0e8',
    PLATE_RIM: '#d4c4a8',
    TEXT: '#f5e6c8',
    TEXT_DIM: '#a89478',
    ACCENT_GOLD: '#c9a962',
    ACCENT_ORANGE: '#e87a2a',
    ACCENT_RED: '#c84a2a',
    ACCENT_GREEN: '#4a8a3a',
    PATIENCE_HIGH: '#4a8a3a',
    PATIENCE_MID: '#e8a82a',
    PATIENCE_LOW: '#c84a2a',
    ORDER_BG: '#1a1512',
    ORDER_BORDER: '#3a2f24',
    HUD_BG: 'rgba(26, 18, 13, 0.85)',
    HUD_BORDER: '#3a2f24',
    PLAYER_SHIRT: '#c85a2a',
    PLAYER_PANTS: '#2a1f1a',
    PLAYER_SKIN: '#e8c8a8',
    INGREDIENT: {
      nasi: '#f5f0e8',
      mie: '#f0d8a8',
      telur: '#fff8e8',
      bawang: '#e8d8c8',
      cabai: '#c83a2a',
      daging: '#a84a3a',
      sayur: '#3a7a3a',
      kecap: '#1a1512',
      saus: '#c83a2a',
      tepung: '#f0e8d8',
      gula: '#f5f0e8',
      kelapa: '#f0e8d8',
    },
    FOOD: {
      nasi_goreng: '#d4a84a',
      mie_goreng: '#c8984a',
      sate: '#a85a2a',
      es_teh: '#8a6a3a',
      gado_gado: '#4a7a3a',
      bakwan: '#c88a3a',
      soto: '#d4a83a',
      klepon: '#3a7a3a',
    },
  },

  // Z-index layers
  LAYERS: {
    FLOOR: 0,
    FURNITURE: 1,
    ITEMS: 2,
    PLAYER: 3,
    UI: 4,
    OVERLAY: 5,
  },
};

// Export LAYERS for other modules
export const LAYERS = CONFIG.LAYERS;

// Game states
export const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  DAY_END: 'day_end',
  GAME_OVER: 'game_over',
};

// Input keys
export const KEYS = {
  UP: 'w',
  DOWN: 's',
  LEFT: 'a',
  RIGHT: 'd',
  INTERACT: 'e',
  CHOP: ' ',
  SERVE: 'q',
  PAUSE: 'escape',
  START: 'enter',
};