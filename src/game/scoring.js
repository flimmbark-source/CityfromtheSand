import {
  countNearbyOfType,
  countNearbyAny,
  countLinkedOfType,
  isOnEdge,
} from './cityGrid.js';

// ─────────────────────────────────────────────────────────────────────────────
// Effect resolution — called when a tile is placed.
// Returns:
//   tokens        { stone, water, sand, greenery }  — token gains
//   draw          number  — cards to draw
//   marketRefresh number  — market cards to auto-refresh
//   upgradeTokens number  — upgrade tokens gained (§7)
//   addResources  string[] — resource types to add as cards to discard (§6 "Add")
//   logLines      string[]
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_RESULT = () => ({
  tokens: { stone: 0, water: 0, sand: 0, greenery: 0 },
  draw: 0,
  marketRefresh: 0,
  upgradeTokens: 0,
  addResources: [],
  logLines: [],
});

export function resolvePlacementEffects(card, cells, row, col) {
  const result = EMPTY_RESULT();
  for (const effect of card.effects) {
    applyEffect(effect, card, cells, row, col, result);
  }
  return result;
}

function applyEffect(effect, card, cells, row, col, result) {
  switch (effect.type) {
    // §6: "Add [resource]" — add 1 matching resource card to your discard
    case 'ADD_RESOURCE':
      result.addResources.push(effect.resource);
      result.logLines.push(`  + Add ${effect.resource} card to discard.`);
      break;

    // §6: "Gain [resource]" — gain 1 matching token
    case 'GAIN_TOKEN':
      if (effect.resource === 'any') {
        const anyRes = primaryResource(card);
        result.tokens[anyRes] = (result.tokens[anyRes] || 0) + effect.amount;
        result.logLines.push(`  + Gain ${effect.amount} ${anyRes} token.`);
      } else {
        result.tokens[effect.resource] = (result.tokens[effect.resource] || 0) + effect.amount;
        result.logLines.push(`  + Gain ${effect.amount} ${effect.resource} token.`);
      }
      break;

    // §6: "Draw X" — draw X resource cards
    case 'DRAW':
      result.draw += effect.amount;
      result.logLines.push(`  + Draw ${effect.amount} card(s).`);
      break;

    // §6: "Refresh X" — put X market cards on bottom, reveal replacements
    case 'MARKET_REFRESH':
      result.marketRefresh += effect.amount;
      result.logLines.push(`  + Refresh ${effect.amount} market card(s).`);
      break;

    // §7: "Upgrade 1" — gain 1 upgrade token (place on Active card or Character stat)
    case 'UPGRADE':
      result.upgradeTokens += effect.amount;
      result.logLines.push(`  + Gain ${effect.amount} upgrade token.`);
      break;

    // ── Conditional wrappers ──────────────────────────────────────────────

    // §6: "If Nearby [tile]" — bonus if at least 1 matching tile is adjacent
    case 'IF_NEARBY_TILE': {
      if (countNearbyOfType(cells, row, col, effect.tileType) > 0) {
        applyEffect(effect.effect, card, cells, row, col, result);
      }
      break;
    }

    case 'IF_NEARBY_TILE_AND': {
      const hasA = countNearbyOfType(cells, row, col, effect.tileTypeA) > 0;
      const hasB = countNearbyOfType(cells, row, col, effect.tileTypeB) > 0;
      if (hasA && hasB) applyEffect(effect.effect, card, cells, row, col, result);
      break;
    }

    // §6: "For each Nearby [tile]" — repeat bonus for each adjacent matching tile
    case 'FOR_EACH_NEARBY_TILE': {
      const n = countNearbyOfType(cells, row, col, effect.tileType);
      for (let i = 0; i < n; i++) applyEffect(effect.effect, card, cells, row, col, result);
      break;
    }

    case 'FOR_EACH_NEARBY_ANY': {
      const n = countNearbyAny(cells, row, col);
      for (let i = 0; i < n; i++) applyEffect(effect.effect, card, cells, row, col, result);
      break;
    }

    // §6: "For each linked [tile]" — count all connected matching tiles in same chain
    // The placed tile is already in cells, subtract 1 to count only the others.
    case 'FOR_EACH_LINKED_TILE': {
      const linked = countLinkedOfType(cells, row, col, effect.tileType);
      const bonus = Math.max(0, linked - 1);
      for (let i = 0; i < bonus; i++) applyEffect(effect.effect, card, cells, row, col, result);
      break;
    }

    // §6: "If on edge" — tile is on the outer edge of the city (has an empty neighbour)
    case 'IF_ON_EDGE':
      if (isOnEdge(cells, row, col)) applyEffect(effect.effect, card, cells, row, col, result);
      break;

    // §6: "If 3+ tiles Nearby" — 3 or more orthogonal neighbours present
    case 'IF_3PLUS_NEARBY':
      if (countNearbyAny(cells, row, col) >= 3) applyEffect(effect.effect, card, cells, row, col, result);
      break;

    // Engine-only effects resolved in reducer (needs full game state)
    case 'ACTIVE_ABILITY':
    case 'GAIN_PER_OWNED_TILE':
    case 'COST_REDUCTION':
      break;

    default:
      break;
  }
}

function primaryResource(card) {
  for (const c of card.cost) {
    if (c !== 'any') return c;
  }
  return 'stone';
}

export function computeFinalVP(state) {
  return state.players.map((p) => ({ id: p.id, name: p.name, vp: p.vp }));
}
