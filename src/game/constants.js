export const RESOURCES = {
  STONE: 'stone',
  WATER: 'water',
  SAND: 'sand',
  GREENERY: 'greenery',
  ANY: 'any',
};

export const ALL_SPECIFIC_RESOURCES = ['stone', 'water', 'sand', 'greenery'];

export const TILE_TYPES = {
  BUILDING: 'building',
  ROAD: 'road',
  GARDEN: 'garden',
  WATER: 'water',
};

export const CARD_TYPES = {
  RESOURCE: 'resource',
  BASIC: 'basic',
  TILE: 'tile',
  ENGINE: 'engine',
  LANDMARK: 'landmark',
};

export const PHASES = {
  SETUP: 'setup',
  ACTION: 'action',
  GAME_OVER: 'game_over',
};

export const MARKET_ROW_SIZE = 5;
export const LANDMARK_ROW_SIZE = 3;
// Prototype win condition: 3 landmarks placed triggers end-of-round check
export const LANDMARKS_TO_WIN = 3;
export const BASIC_POOL_COUNT = 12;

// Caps from rules reference
export const STAT_CAPS = { hand: 7, build: 2, convert: 3, refresh: 2 };
