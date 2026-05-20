import { CARD_TYPES, TILE_TYPES } from './constants.js';

// ─────────────────────────────────────────────────────────────────────────────
// Card definitions — templates (not instances).
// Each bought/placed card in game state gets a unique `uid` suffix.
// ─────────────────────────────────────────────────────────────────────────────

export const CARD_DEFINITIONS = {
  // ── Resource cards (starting deck currency) ──────────────────────────────
  resource_stone: {
    id: 'resource_stone',
    name: 'Stone',
    cardType: CARD_TYPES.RESOURCE,
    resourceType: 'stone',
    cost: [],
    vp: 0,
    effectText: '',
    effects: [],
  },
  resource_water: {
    id: 'resource_water',
    name: 'Water',
    cardType: CARD_TYPES.RESOURCE,
    resourceType: 'water',
    cost: [],
    vp: 0,
    effectText: '',
    effects: [],
  },
  resource_sand: {
    id: 'resource_sand',
    name: 'Sand',
    cardType: CARD_TYPES.RESOURCE,
    resourceType: 'sand',
    cost: [],
    vp: 0,
    effectText: '',
    effects: [],
  },
  resource_greenery: {
    id: 'resource_greenery',
    name: 'Greenery',
    cardType: CARD_TYPES.RESOURCE,
    resourceType: 'greenery',
    cost: [],
    vp: 0,
    effectText: '',
    effects: [],
  },

  // ── Basic cards (always-available fallback pool) ──────────────────────────
  stone_supply: {
    id: 'stone_supply',
    name: 'Stone Supply',
    cardType: CARD_TYPES.BASIC,
    cost: ['any', 'any'],
    vp: 0,
    effectText: 'Add Stone',
    effects: [{ type: 'ADD_RESOURCE', resource: 'stone' }],
  },
  water_supply: {
    id: 'water_supply',
    name: 'Water Supply',
    cardType: CARD_TYPES.BASIC,
    cost: ['any', 'any'],
    vp: 0,
    effectText: 'Add Water',
    effects: [{ type: 'ADD_RESOURCE', resource: 'water' }],
  },
  sand_supply: {
    id: 'sand_supply',
    name: 'Sand Supply',
    cardType: CARD_TYPES.BASIC,
    cost: ['any', 'any'],
    vp: 0,
    effectText: 'Add Sand',
    effects: [{ type: 'ADD_RESOURCE', resource: 'sand' }],
  },
  greenery_supply: {
    id: 'greenery_supply',
    name: 'Greenery Supply',
    cardType: CARD_TYPES.BASIC,
    cost: ['any', 'any', 'any'],
    vp: 0,
    effectText: 'Add Greenery',
    effects: [{ type: 'ADD_RESOURCE', resource: 'greenery' }],
  },

  // ── Market tile cards — Buildings ─────────────────────────────────────────

  stone_yard: {
    id: 'stone_yard',
    name: 'Stone Yard',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.BUILDING,
    cost: ['stone', 'any'],
    vp: 1,
    effectText: 'Add Stone; If Nearby Building: Gain Stone',
    effects: [
      { type: 'ADD_RESOURCE', resource: 'stone' },
      {
        type: 'IF_NEARBY_TILE',
        tileType: 'building',
        effect: { type: 'GAIN_TOKEN', resource: 'stone', amount: 1 },
      },
    ],
  },

  work_shed: {
    id: 'work_shed',
    name: 'Work Shed',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.BUILDING,
    cost: ['stone', 'any'],
    vp: 1,
    effectText: 'Gain Stone; If 3+ tiles Nearby: Upgrade 1',
    effects: [
      { type: 'GAIN_TOKEN', resource: 'stone', amount: 1 },
      {
        type: 'IF_3PLUS_NEARBY',
        effect: { type: 'UPGRADE', amount: 1 },
      },
    ],
  },

  mason_row: {
    id: 'mason_row',
    name: 'Mason Row',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.BUILDING,
    cost: ['any', 'stone', 'any'],
    vp: 2,
    effectText: 'Add Stone; For each Nearby Building: Gain Stone',
    effects: [
      { type: 'ADD_RESOURCE', resource: 'stone' },
      {
        type: 'FOR_EACH_NEARBY_TILE',
        tileType: 'building',
        effect: { type: 'GAIN_TOKEN', resource: 'stone', amount: 1 },
      },
    ],
  },

  bathhouse: {
    id: 'bathhouse',
    name: 'Bathhouse',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.WATER,
    cost: ['stone', 'any', 'any'],
    vp: 2,
    effectText: 'Draw 1; If Nearby Building and Garden: Upgrade 1',
    effects: [
      { type: 'DRAW', amount: 1 },
      {
        type: 'IF_NEARBY_TILE_AND',
        tileTypeA: 'building',
        tileTypeB: 'garden',
        effect: { type: 'UPGRADE', amount: 1 },
      },
    ],
  },

  // ── Market tile cards — Water ─────────────────────────────────────────────

  well: {
    id: 'well',
    name: 'Well',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.WATER,
    cost: ['water', 'any'],
    vp: 1,
    effectText: 'Gain Water; For each Nearby Garden: Draw 1',
    effects: [
      { type: 'GAIN_TOKEN', resource: 'water', amount: 1 },
      {
        type: 'FOR_EACH_NEARBY_TILE',
        tileType: 'garden',
        effect: { type: 'DRAW', amount: 1 },
      },
    ],
  },

  canal: {
    id: 'canal',
    name: 'Canal',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.WATER,
    cost: ['water', 'any'],
    vp: 1,
    effectText: 'Draw 1; For each linked Water: Gain Water',
    effects: [
      { type: 'DRAW', amount: 1 },
      {
        type: 'FOR_EACH_LINKED_TILE',
        tileType: 'water',
        effect: { type: 'GAIN_TOKEN', resource: 'water', amount: 1 },
      },
    ],
  },

  // ── Market tile cards — Roads ─────────────────────────────────────────────

  dune_survey: {
    id: 'dune_survey',
    name: 'Dune Survey',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.ROAD,
    cost: ['sand', 'any'],
    vp: 1,
    effectText: 'Add Sand; If on edge: Gain 1 any',
    effects: [
      { type: 'ADD_RESOURCE', resource: 'sand' },
      {
        type: 'IF_ON_EDGE',
        effect: { type: 'GAIN_TOKEN', resource: 'any', amount: 1 },
      },
    ],
  },

  market_street: {
    id: 'market_street',
    name: 'Market Street',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.ROAD,
    cost: ['sand', 'any'],
    vp: 1,
    effectText: 'Refresh 2; If Nearby Building: Gain Sand',
    effects: [
      { type: 'MARKET_REFRESH', amount: 2 },
      {
        type: 'IF_NEARBY_TILE',
        tileType: 'building',
        effect: { type: 'GAIN_TOKEN', resource: 'sand', amount: 1 },
      },
    ],
  },

  trade_route: {
    id: 'trade_route',
    name: 'Trade Route',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.ROAD,
    cost: ['sand', 'water', 'any'],
    vp: 2,
    effectText: 'Gain Sand; For each linked Road: Refresh 1',
    effects: [
      { type: 'GAIN_TOKEN', resource: 'sand', amount: 1 },
      {
        type: 'FOR_EACH_LINKED_TILE',
        tileType: 'road',
        effect: { type: 'MARKET_REFRESH', amount: 1 },
      },
    ],
  },

  // ── Market tile cards — Gardens ───────────────────────────────────────────

  garden_plot: {
    id: 'garden_plot',
    name: 'Garden Plot',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.GARDEN,
    cost: ['greenery', 'any'],
    vp: 1,
    effectText: 'Add Greenery; If Nearby Water: Upgrade 1',
    effects: [
      { type: 'ADD_RESOURCE', resource: 'greenery' },
      {
        type: 'IF_NEARBY_TILE',
        tileType: 'water',
        effect: { type: 'UPGRADE', amount: 1 },
      },
    ],
  },

  public_garden: {
    id: 'public_garden',
    name: 'Public Garden',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.GARDEN,
    cost: ['greenery', 'any'],
    vp: 1,
    effectText: 'Gain Greenery; If 3+ tiles Nearby: Draw 1',
    effects: [
      { type: 'GAIN_TOKEN', resource: 'greenery', amount: 1 },
      {
        type: 'IF_3PLUS_NEARBY',
        effect: { type: 'DRAW', amount: 1 },
      },
    ],
  },

  orchard_path: {
    id: 'orchard_path',
    name: 'Orchard Path',
    cardType: CARD_TYPES.TILE,
    tileType: TILE_TYPES.GARDEN,
    cost: ['greenery', 'sand', 'any'],
    vp: 2,
    effectText: 'Draw 1; For each Nearby Road: Gain Greenery',
    effects: [
      { type: 'DRAW', amount: 1 },
      {
        type: 'FOR_EACH_NEARBY_TILE',
        tileType: 'road',
        effect: { type: 'GAIN_TOKEN', resource: 'greenery', amount: 1 },
      },
    ],
  },

  // ── Engine cards (stay in play, 0 VP) ────────────────────────────────────

  mason_engine: {
    id: 'mason_engine',
    name: 'Mason',
    cardType: CARD_TYPES.ENGINE,
    cost: ['stone', 'any'],
    vp: 0,
    effectText: 'Use: Spend Stone — Next Building costs 1 less Any',
    effects: [
      {
        type: 'ACTIVE_ABILITY',
        cost: [{ resource: 'stone', amount: 1 }],
        effect: { type: 'COST_REDUCTION', tileType: 'building', resource: 'any', amount: 1 },
      },
    ],
  },

  foreman: {
    id: 'foreman',
    name: 'Foreman',
    cardType: CARD_TYPES.ENGINE,
    cost: ['stone', 'stone'],
    vp: 0,
    effectText: 'Use: Spend Stone — Gain Stone for each 2 Buildings you own',
    effects: [
      {
        type: 'ACTIVE_ABILITY',
        cost: [{ resource: 'stone', amount: 1 }],
        effect: { type: 'GAIN_PER_OWNED_TILE', tileType: 'building', divisor: 2, resource: 'stone' },
      },
    ],
  },

  // ── Landmark cards (prototype) ────────────────────────────────────────────

  central_garden: {
    id: 'central_garden',
    name: 'Central Garden',
    cardType: CARD_TYPES.LANDMARK,
    tileType: TILE_TYPES.GARDEN,
    cost: ['greenery', 'greenery', 'water', 'any'],
    vp: 5,
    effectText: 'For each Nearby tile: Gain Greenery',
    effects: [
      {
        type: 'FOR_EACH_NEARBY_ANY',
        effect: { type: 'GAIN_TOKEN', resource: 'greenery', amount: 1 },
      },
    ],
  },

  trade_gate: {
    id: 'trade_gate',
    name: 'Trade Gate',
    cardType: CARD_TYPES.LANDMARK,
    tileType: TILE_TYPES.ROAD,
    cost: ['stone', 'sand', 'water', 'any'],
    vp: 5,
    effectText: 'Gain Sand; Refresh 3',
    effects: [
      { type: 'GAIN_TOKEN', resource: 'sand', amount: 2 },
      { type: 'MARKET_REFRESH', amount: 3 },
    ],
  },

  city_hall: {
    id: 'city_hall',
    name: 'City Hall',
    cardType: CARD_TYPES.LANDMARK,
    tileType: TILE_TYPES.BUILDING,
    cost: ['stone', 'stone', 'stone', 'any'],
    vp: 6,
    effectText: 'Gain Stone; For each Nearby Building: Draw 1',
    effects: [
      { type: 'GAIN_TOKEN', resource: 'stone', amount: 2 },
      {
        type: 'FOR_EACH_NEARBY_TILE',
        tileType: 'building',
        effect: { type: 'DRAW', amount: 1 },
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

let _uidCounter = 0;
export function makeCardInstance(defId) {
  const def = CARD_DEFINITIONS[defId];
  if (!def) throw new Error(`Unknown card definition: ${defId}`);
  return { ...def, uid: `${defId}_${++_uidCounter}` };
}

export const MARKET_CARD_IDS = [
  'stone_yard',
  'work_shed',
  'mason_row',
  'well',
  'canal',
  'bathhouse',
  'dune_survey',
  'market_street',
  'trade_route',
  'garden_plot',
  'public_garden',
  'orchard_path',
  'mason_engine',
  'foreman',
];

export const LANDMARK_CARD_IDS = ['central_garden', 'trade_gate', 'city_hall'];

export const BASIC_CARD_IDS = [
  'stone_supply',
  'water_supply',
  'sand_supply',
  'greenery_supply',
];
