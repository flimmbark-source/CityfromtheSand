import { CARD_TYPES, STAT_CAPS } from './constants.js';
import { canPlaceTileAt } from './cityGrid.js';

// ─────────────────────────────────────────────────────────────────────────────
// Resource helpers
// ─────────────────────────────────────────────────────────────────────────────

// Sum available resources: hand resource cards + tokens.
// Basic cards in hand are NOT counted here — they are tracked separately as
// any-payers in canAffordCard below.
export function computeAvailableResources(player) {
  const avail = { stone: 0, water: 0, sand: 0, greenery: 0 };
  for (const card of player.hand) {
    if (card.cardType === CARD_TYPES.RESOURCE) {
      avail[card.resourceType] = (avail[card.resourceType] || 0) + 1;
    }
  }
  for (const res of Object.keys(player.tokens)) {
    avail[res] = (avail[res] || 0) + player.tokens[res];
  }
  return avail;
}

// ─────────────────────────────────────────────────────────────────────────────
// canAffordCard
// Basic cards in hand count as "any" payers (§4: spent resource cards / tokens).
// ─────────────────────────────────────────────────────────────────────────────
export function canAffordCard(player, cost) {
  if (!cost || cost.length === 0) return true;

  const effectiveCost = applyCostReductions(player, cost);
  const avail = { ...computeAvailableResources(player) };
  // Basic cards in hand can satisfy 'any' requirements
  const basicInHand = player.hand.filter((c) => c.cardType === CARD_TYPES.BASIC).length;

  let anyRequired = 0;
  for (const c of effectiveCost) {
    if (c === 'any') {
      anyRequired++;
    } else {
      if ((avail[c] || 0) > 0) {
        avail[c]--;
      } else {
        return false;
      }
    }
  }

  // Remaining specific resources + basic cards can all satisfy 'any' costs
  const leftover = Object.values(avail).reduce((a, b) => a + b, 0);
  return leftover + basicInHand >= anyRequired;
}

function applyCostReductions(player, cost) {
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
// canBuyCard — can afford AND has build actions remaining
// ─────────────────────────────────────────────────────────────────────────────
export function canBuyCard(player, card) {
  if (player.buildActionsUsed >= player.stats.build) return false;
  return canAffordCard(player, card.cost);
}

// ─────────────────────────────────────────────────────────────────────────────
// canPlaceTile
// ─────────────────────────────────────────────────────────────────────────────
export function canPlaceTile(player, cells, cardUid, row, col) {
  const inQueue = player.tilesToPlace.some((c) => c.uid === cardUid);
  if (!inQueue) return false;
  return canPlaceTileAt(cells, row, col);
}

// ─────────────────────────────────────────────────────────────────────────────
// isActivePlayer
// ─────────────────────────────────────────────────────────────────────────────
export function isActivePlayer(state, playerId) {
  return state.activePlayer === playerId && state.phase !== 'game_over';
}

// ─────────────────────────────────────────────────────────────────────────────
// canApplyUpgrade — must have an upgrade token and stat below its cap
// ─────────────────────────────────────────────────────────────────────────────
export function canApplyUpgrade(player, stat) {
  if (player.upgradeTokens < 1) return false;
  const cap = STAT_CAPS[stat];
  return cap !== undefined && player.stats[stat] < cap;
}
