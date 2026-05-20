import { computeAvailableResources, canBuyCard, canAffordCard } from './validation.js';
import { validPlacementCells } from './cityGrid.js';
import { CARD_TYPES } from './constants.js';

export const selectActivePlayer = (state) => state.players[state.activePlayer];

export const selectPlayer = (state, id) => state.players[id];

export const selectAvailableResources = (state, playerId) => {
  const player = state.players[playerId];
  return computeAvailableResources(player);
};

export const selectCanBuyCard = (state, card) => {
  const player = selectActivePlayer(state);
  return canBuyCard(player, card);
};

export const selectCanAffordCard = (state, card) => {
  const player = selectActivePlayer(state);
  return canAffordCard(player, card.cost);
};

export const selectValidPlacements = (state) =>
  validPlacementCells(state.cityGrid.cells);

export const selectHasTilesToPlace = (state) => {
  const player = selectActivePlayer(state);
  return player.tilesToPlace.length > 0;
};

export const selectCanFreeRefresh = (state) => {
  const player = selectActivePlayer(state);
  return player.refreshActionsUsed < player.stats.refresh;
};

export const selectBuildsRemaining = (state) => {
  const player = selectActivePlayer(state);
  return Math.max(0, player.stats.build - player.buildActionsUsed);
};

export const selectRefreshesRemaining = (state) => {
  const player = selectActivePlayer(state);
  return Math.max(0, player.stats.refresh - player.refreshActionsUsed);
};

export const selectAvailableEngineCount = (state) => {
  const player = selectActivePlayer(state);
  return player.engineZone.filter((c) => !player.usedEngines[c.uid]).length;
};

export const selectEngineCards = (state, playerId) =>
  state.players[playerId].engineZone;

export const selectCanUseAbility = (state, cardUid) => {
  const player = selectActivePlayer(state);
  const card = player.engineZone.find((c) => c.uid === cardUid);
  if (!card) return false;
  if (player.usedEngines[cardUid]) return false;
  // Check ability cost
  const ability = card.effects.find((e) => e.type === 'ACTIVE_ABILITY');
  if (!ability) return false;
  const abilityCost = ability.cost.map((c) => c.resource);
  return canAffordCard(player, abilityCost);
};

export const selectTotalVP = (state, playerId) => state.players[playerId].vp;

export const selectRound = (state) => state.round;

export const selectIsGameOver = (state) => state.phase === 'game_over';

export const selectWinner = (state) => state.winner;

// Cards in hand split by type for display
export const selectHandByType = (state, playerId) => {
  const hand = state.players[playerId].hand;
  return {
    resources: hand.filter((c) => c.cardType === CARD_TYPES.RESOURCE),
    others: hand.filter((c) => c.cardType !== CARD_TYPES.RESOURCE),
  };
};
