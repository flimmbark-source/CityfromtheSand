// Action type constants
export const START_GAME = 'START_GAME';
export const DRAW_HAND = 'DRAW_HAND';
export const FREE_REFRESH = 'FREE_REFRESH';
export const BUY_CARD = 'BUY_CARD';
export const BUILD_CARD_ON_CELL = 'BUILD_CARD_ON_CELL';
export const PLACE_TILE = 'PLACE_TILE';
export const USE_ABILITY = 'USE_ABILITY';
export const CONVERT_RESOURCES = 'CONVERT_RESOURCES';
export const END_TURN = 'END_TURN';
// Spend 1 upgrade token to raise a character stat by 1 (up to its cap)
export const APPLY_UPGRADE = 'APPLY_UPGRADE';

// Action creators
export const startGame = () => ({ type: START_GAME });
export const drawHand = () => ({ type: DRAW_HAND });
export const freeRefresh = (marketCardUid) => ({ type: FREE_REFRESH, payload: { marketCardUid } });
export const buyCard = (cardUid, source) => ({ type: BUY_CARD, payload: { cardUid, source } });
export const buildCardOnCell = (cardUid, source, row, col) => ({
  type: BUILD_CARD_ON_CELL,
  payload: { cardUid, source, row, col },
});
export const placeTile = (cardUid, row, col) => ({ type: PLACE_TILE, payload: { cardUid, row, col } });
export const useAbility = (cardUid) => ({ type: USE_ABILITY, payload: { cardUid } });
export const convertResources = () => ({ type: CONVERT_RESOURCES });
export const endTurn = () => ({ type: END_TURN });
// stat: 'hand' | 'build' | 'convert' | 'refresh'
export const applyUpgrade = (stat) => ({ type: APPLY_UPGRADE, payload: { stat } });
