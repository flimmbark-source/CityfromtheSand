import { CHARACTERS } from './characters.js';
import {
  CARD_DEFINITIONS,
  MARKET_CARD_IDS,
  LANDMARK_CARD_IDS,
  BASIC_CARD_IDS,
  makeCardInstance,
} from './cards.js';
import {
  PHASES,
  MARKET_ROW_SIZE,
  LANDMARK_ROW_SIZE,
  BASIC_POOL_COUNT,
} from './constants.js';

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic shuffle (Fisher-Yates) — accepts an optional seed string.
// For online sync, the seed would come from the server.
// ─────────────────────────────────────────────────────────────────────────────
export function shuffle(arr, seed) {
  const a = [...arr];
  let s = hashSeed(seed || String(Date.now()));
  for (let i = a.length - 1; i > 0; i--) {
    s = lcg(s);
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h || 1;
}

function lcg(s) {
  return Math.imul(1664525, s) + 1013904223 >>> 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build a player's starting deck from the character definition.
// ─────────────────────────────────────────────────────────────────────────────
function buildStartingDeck(characterId, seed) {
  const char = CHARACTERS[characterId];
  const cards = [];
  for (const { resource, count } of char.startingDeck) {
    for (let i = 0; i < count; i++) {
      cards.push(makeCardInstance(`resource_${resource}`));
    }
  }
  return shuffle(cards, seed + characterId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Build player state
// ─────────────────────────────────────────────────────────────────────────────
function makePlayer(id, characterId, seed) {
  const char = CHARACTERS[characterId];
  const deck = buildStartingDeck(characterId, seed);
  const handSize = char.stats.hand;
  const hand = deck.slice(0, handSize);
  const remainingDeck = deck.slice(handSize);

  return {
    id,
    character: characterId,
    name: char.name,
    stats: { ...char.stats },
    deck: remainingDeck,
    hand,
    discard: [],
    engineZone: [],
    tilesToPlace: [],
    tokens: { stone: 0, water: 0, sand: 0, greenery: 0 },
    vp: 0,
    buildActionsUsed: 0,
    refreshActionsUsed: 0,
    usedEngines: {},      // uid -> true
    costReduction: null,  // { resource, amount } — cleared after one buy
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the shared market
// ─────────────────────────────────────────────────────────────────────────────
function buildMarket(seed) {
  // Market deck = 2 copies of each market card
  const deckCards = [];
  for (const id of MARKET_CARD_IDS) {
    deckCards.push(makeCardInstance(id));
    deckCards.push(makeCardInstance(id));
  }
  const shuffledDeck = shuffle(deckCards, seed + 'market');

  const row = shuffledDeck.slice(0, MARKET_ROW_SIZE);
  const deck = shuffledDeck.slice(MARKET_ROW_SIZE);

  // Landmarks are a separate draw pile
  const landmarkCards = LANDMARK_CARD_IDS.map((id) => makeCardInstance(id));
  const landmarks = shuffle(landmarkCards, seed + 'landmarks').slice(
    0,
    LANDMARK_ROW_SIZE
  );

  // Basic pool — unlimited supply modelled as count + template
  const basicPool = {};
  for (const id of BASIC_CARD_IDS) {
    basicPool[id] = {
      count: BASIC_POOL_COUNT,
      def: CARD_DEFINITIONS[id],
    };
  }

  return { deck, row, landmarks, basicPool };
}

// ─────────────────────────────────────────────────────────────────────────────
// createInitialGameState
// characterIds: [p0CharId, p1CharId]
// seed: optional string for deterministic shuffle
// ─────────────────────────────────────────────────────────────────────────────
export function createInitialGameState(
  characterIds = ['mason', 'water_planner'],
  seed
) {
  const gameSeed = seed || String(Date.now());

  const players = characterIds.map((charId, idx) =>
    makePlayer(idx, charId, gameSeed + idx)
  );

  return {
    phase: PHASES.ACTION,
    round: 1,
    turnNumber: 1,
    activePlayer: 0,
    builtLandmarks: 0,
    // When the win condition triggers mid-round, track who triggered it so both
    // players get an equal number of turns before scoring.
    gameOverTriggeredBy: null,
    winner: null,

    players,
    market: buildMarket(gameSeed),
    cityGrid: { cells: {} },
    log: ['Game started. Player 1 (The Mason) goes first.'],
  };
}
