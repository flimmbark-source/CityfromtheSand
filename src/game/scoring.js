import {
  countNearbyOfType,
  countNearbyAny,
  countLinkedOfType,
  isOnEdge,
  getNeighborCells,
} from './cityGrid.js';

// ─────────────────────────────────────────────────────────────────────────────
// Effect resolution — called when a tile is placed.
// Returns { tokens, draw, marketRefresh, upgrade, addResources, logLines }
// describing immediate rewards. The reducer applies these.
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_RESULT = () => ({
  tokens: { stone: 0, water: 0, sand: 0, greenery: 0 },
  draw: 0,
  marketRefresh: 0,
  upgrade: 0,
  addResources: [],  // array of resource types to add to discard
  logLines: [],
});

export function resolvePlacementEffects(card, cells, row, col, playerId) {
  const result = EMPTY_RESULT();

  for (const effect of card.effects) {
    applyEffect(effect, card, cells, row, col, result);
  }

  return result;
}

function applyEffect(effect, card, cells, row, col, result) {
  switch (effect.type) {
    case 'ADD_RESOURCE':
      result.addResources.push(effect.resource);
      result.logLines.push(`Add ${effect.resource} card to discard.`);
      break;

    case 'GAIN_TOKEN':
      if (effect.resource === 'any') {
        // Default to the tile's primary resource affinity or stone
        const anyRes = primaryResource(card);
        result.tokens[anyRes] = (result.tokens[anyRes] || 0) + effect.amount;
        result.logLines.push(`Gain ${effect.amount} ${anyRes} token (any).`);
      } else {
        result.tokens[effect.resource] = (result.tokens[effect.resource] || 0) + effect.amount;
        result.logLines.push(`Gain ${effect.amount} ${effect.resource} token.`);
      }
      break;

    case 'DRAW':
      result.draw += effect.amount;
      result.logLines.push(`Draw ${effect.amount} card(s).`);
      break;

    case 'MARKET_REFRESH':
      result.marketRefresh += effect.amount;
      result.logLines.push(`Refresh ${effect.amount} market card(s).`);
      break;

    case 'UPGRADE':
      result.upgrade += effect.amount;
      result.logLines.push(`Upgrade 1 (stub — not yet applied).`);
      break;

    case 'IF_NEARBY_TILE': {
      const count = countNearbyOfType(cells, row, col, effect.tileType);
      if (count > 0) {
        applyEffect(effect.effect, card, cells, row, col, result);
      }
      break;
    }

    case 'IF_NEARBY_TILE_AND': {
      const hasA = countNearbyOfType(cells, row, col, effect.tileTypeA) > 0;
      const hasB = countNearbyOfType(cells, row, col, effect.tileTypeB) > 0;
      if (hasA && hasB) {
        applyEffect(effect.effect, card, cells, row, col, result);
      }
      break;
    }

    case 'FOR_EACH_NEARBY_TILE': {
      const n = countNearbyOfType(cells, row, col, effect.tileType);
      for (let i = 0; i < n; i++) {
        applyEffect(effect.effect, card, cells, row, col, result);
      }
      break;
    }

    case 'FOR_EACH_NEARBY_ANY': {
      const n = countNearbyAny(cells, row, col);
      for (let i = 0; i < n; i++) {
        applyEffect(effect.effect, card, cells, row, col, result);
      }
      break;
    }

    case 'FOR_EACH_LINKED_TILE': {
      // Count includes the placed tile itself, so subtract 1 for "each other linked"
      const linked = countLinkedOfType(cells, row, col, effect.tileType);
      const bonus = Math.max(0, linked - 1);
      for (let i = 0; i < bonus; i++) {
        applyEffect(effect.effect, card, cells, row, col, result);
      }
      break;
    }

    case 'IF_ON_EDGE':
      if (isOnEdge(cells, row, col)) {
        applyEffect(effect.effect, card, cells, row, col, result);
      }
      break;

    case 'IF_3PLUS_NEARBY':
      if (countNearbyAny(cells, row, col) >= 3) {
        applyEffect(effect.effect, card, cells, row, col, result);
      }
      break;

    // Engine active abilities — resolved separately in reducer
    case 'ACTIVE_ABILITY':
      break;

    // Gain per owned tile — resolved in reducer (needs full state)
    case 'GAIN_PER_OWNED_TILE':
      break;

    // Cost reduction — applied before buying
    case 'COST_REDUCTION':
      break;

    default:
      break;
  }
}

// Determine primary resource affinity of a card for 'any' token resolution.
function primaryResource(card) {
  for (const c of card.cost) {
    if (c !== 'any') return c;
  }
  return 'stone';
}

// Final VP tally (called at game end).
export function computeFinalVP(state) {
  return state.players.map((p) => ({
    id: p.id,
    name: p.name,
    vp: p.vp,
  }));
}
