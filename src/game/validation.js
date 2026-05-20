import { CARD_TYPES } from './constants.js';
import { canPlaceTileAt } from './cityGrid.js';

// ─────────────────────────────────────────────────────────────────────────────
// Resource helpers
// ─────────────────────────────────────────────────────────────────────────────

// Sum available resources: hand resource cards + tokens.
export function computeAvailableResources(player) {
  const avail = { stone: 0, water: 0, sand: 0, greenery: 0 };

  for (const card of player.hand) {
    if (card.cardType === CARD_TYPES.RESOURCE) {
      avail[card.resourceType] = (avail[card.resourceType] || 0) + 1;
    }
    // Basic cards in hand count as 'any' when spent — tracked separately
  }

  // Add tokens
  for (const res of Object.keys(player.tokens)) {
    avail[res] = (avail[res] || 0) + player.tokens[res];
  }

  return avail;
}

// Count 'any'-capable cards in hand (resource cards + basic cards).
export function countAnyCards(player) {
  return player.hand.filter(
    (c) => c.cardType === CARD_TYPES.RESOURCE || c.cardType === CARD_TYPES.BASIC
  ).length;
}

// ─────────────────────────────────────────────────────────────────────────────
// canAffordCard — checks whether a player can pay a given cost array.
// Cost is an array of resource strings, e.g. ['stone', 'any', 'any'].
// ─────────────────────────────────────────────────────────────────────────────
export function canAffordCard(player, cost) {
  if (!cost || cost.length === 0) return true;

  // Apply any cost reductions stored on the player
  const effectiveCost = applyCostReductions(player, cost);

  const avail = { ...computeAvailableResources(player) };
  // Track how many 'any' payers are available (resource + basic cards + any token)
  const totalAny = Object.values(avail).reduce((a, b) => a + b, 0);

  let anyRequired = 0;

  for (const c of effectiveCost) {
    if (c === 'any') {
      anyRequired++;
    } else {
      if (avail[c] > 0) {
        avail[c]--;
      } else {
        return false; // can't pay specific requirement
      }
    }
  }

  // Check remaining 'any' requirements against leftover resources
  const leftover = Object.values(avail).reduce((a, b) => a + b, 0);
  return leftover >= anyRequired;
}

function applyCostReductions(player, cost) {
  // If the player has a pending cost reduction effect, apply it.
  if (!player.costReduction) return cost;
  const { resource, amount } = player.costReduction;
  const result = [...cost];
  let reduced = amount;
  for (let i = result.length - 1; i >= 0 && reduced > 0; i--) {
    if (result[i] === resource || resource === 'any') {
      result.splice(i, 1);
      reduced--;
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// canBuyCard — can afford AND hasn't exceeded build limit
// ─────────────────────────────────────────────────────────────────────────────
export function canBuyCard(player, card) {
  if (player.buildActionsUsed >= player.stats.build) return false;
  return canAffordCard(player, card.cost);
}

// ─────────────────────────────────────────────────────────────────────────────
// canPlaceTile — card must be in tilesToPlace, cell must be valid
// ─────────────────────────────────────────────────────────────────────────────
export function canPlaceTile(player, cells, cardUid, row, col) {
  const inQueue = player.tilesToPlace.some((c) => c.uid === cardUid);
  if (!inQueue) return false;
  return canPlaceTileAt(cells, row, col);
}

// ─────────────────────────────────────────────────────────────────────────────
// isActivePlayer — simple index check
// ─────────────────────────────────────────────────────────────────────────────
export function isActivePlayer(state, playerId) {
  return state.activePlayer === playerId && state.phase !== 'game_over';
}
