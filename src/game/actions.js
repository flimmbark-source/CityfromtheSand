// Action type constants
export const START_GAME = 'START_GAME';
export const DRAW_HAND = 'DRAW_HAND';
export const FREE_REFRESH = 'FREE_REFRESH';
export const BUY_CARD = 'BUY_CARD';
export const PLACE_TILE = 'PLACE_TILE';
export const USE_ABILITY = 'USE_ABILITY';
export const CONVERT_RESOURCES = 'CONVERT_RESOURCES';
export const END_TURN = 'END_TURN';

// Action creators
export const startGame = () => ({ type: START_GAME });

export const drawHand = () => ({ type: DRAW_HAND });

export const freeRefresh = (marketCardUid) => ({
  type: FREE_REFRESH,
  payload: { marketCardUid },
});

// source: 'market' | 'landmark' | 'basic_stone' | 'basic_water' | 'basic_sand' | 'basic_greenery'
export const buyCard = (cardUid, source) => ({
  type: BUY_CARD,
  payload: { cardUid, source },
});

// row/col are grid coordinates
export const placeTile = (cardUid, row, col) => ({
  type: PLACE_TILE,
  payload: { cardUid, row, col },
});

export const useAbility = (cardUid) => ({
  type: USE_ABILITY,
  payload: { cardUid },
});

export const convertResources = () => ({ type: CONVERT_RESOURCES });

export const endTurn = () => ({ type: END_TURN });
