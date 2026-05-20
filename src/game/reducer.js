import {
  START_GAME,
  DRAW_HAND,
  FREE_REFRESH,
  BUY_CARD,
  PLACE_TILE,
  USE_ABILITY,
  END_TURN,
} from './actions.js';
import { CARD_TYPES, PHASES, LANDMARKS_TO_WIN, MARKET_ROW_SIZE } from './constants.js';
import { createInitialGameState, shuffle } from './initialGameState.js';
import { makeCardInstance } from './cards.js';
import { canAffordCard, canBuyCard, computeAvailableResources } from './validation.js';
import { canPlaceTileAt } from './cityGrid.js';
import { resolvePlacementEffects } from './scoring.js';
import { cellKey } from './cityGrid.js';

// ─────────────────────────────────────────────────────────────────────────────
// Top-level reducer
// ─────────────────────────────────────────────────────────────────────────────
export function gameReducer(state, action) {
  switch (action.type) {
    case START_GAME:
      return createInitialGameState(
        action.payload?.characterIds,
        action.payload?.seed
      );

    case DRAW_HAND:
      return handleDrawHand(state);

    case FREE_REFRESH:
      return handleFreeRefresh(state, action.payload);

    case BUY_CARD:
      return handleBuyCard(state, action.payload);

    case PLACE_TILE:
      return handlePlaceTile(state, action.payload);

    case USE_ABILITY:
      return handleUseAbility(state, action.payload);

    case END_TURN:
      return handleEndTurn(state);

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Immutable player helper
// ─────────────────────────────────────────────────────────────────────────────
function updatePlayer(state, id, patch) {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === id ? { ...p, ...patch } : p
    ),
  };
}

function addLog(state, ...lines) {
  return { ...state, log: [...state.log, ...lines] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Draw up to hand stat, cycling discard → deck if needed
// ─────────────────────────────────────────────────────────────────────────────
function handleDrawHand(state) {
  const pid = state.activePlayer;
  const player = state.players[pid];
  const needed = player.stats.hand - player.hand.length;
  if (needed <= 0) return state;

  let deck = [...player.deck];
  let discard = [...player.discard];

  if (deck.length < needed) {
    // Shuffle discard into deck
    deck = shuffle([...deck, ...discard], String(Date.now()));
    discard = [];
  }

  const drawn = deck.splice(0, needed);
  const newHand = [...player.hand, ...drawn];

  let next = updatePlayer(state, pid, { deck, discard, hand: newHand });
  return addLog(next, `${player.name} draws ${drawn.length} card(s).`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Free refresh: move a market card to bottom of deck, reveal a replacement
// ─────────────────────────────────────────────────────────────────────────────
function handleFreeRefresh(state, { marketCardUid }) {
  const pid = state.activePlayer;
  const player = state.players[pid];

  if (player.refreshActionsUsed >= player.stats.refresh) {
    return addLog(state, 'No refresh actions remaining.');
  }

  const idx = state.market.row.findIndex((c) => c.uid === marketCardUid);
  if (idx === -1) return addLog(state, 'Card not found in market row.');

  const cardToRefresh = state.market.row[idx];
  const marketDeck = [...state.market.deck, cardToRefresh];
  const newRow = [...state.market.row];

  if (marketDeck.length > 0) {
    const replacement = marketDeck.shift();
    newRow[idx] = replacement;
  } else {
    newRow.splice(idx, 1);
  }

  let next = updatePlayer(state, pid, {
    refreshActionsUsed: player.refreshActionsUsed + 1,
  });
  next = {
    ...next,
    market: { ...next.market, deck: marketDeck, row: newRow },
  };
  return addLog(next, `${player.name} refreshes market: ${cardToRefresh.name} replaced.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Buy a card from market row, landmark row, or basic pool
// ─────────────────────────────────────────────────────────────────────────────
function handleBuyCard(state, { cardUid, source }) {
  const pid = state.activePlayer;
  const player = state.players[pid];

  // Find the card in the correct source
  let card = null;
  let newMarket = { ...state.market };

  if (source === 'market') {
    card = state.market.row.find((c) => c.uid === cardUid);
    if (!card) return addLog(state, 'Card not found in market row.');
  } else if (source === 'landmark') {
    card = state.market.landmarks.find((c) => c.uid === cardUid);
    if (!card) return addLog(state, 'Card not found in landmark row.');
  } else if (source && source.startsWith('basic_')) {
    const basicId = source.replace('basic_', '') + '_supply';
    const pool = state.market.basicPool[basicId];
    if (!pool || pool.count === 0) return addLog(state, 'Basic pool empty.');
    card = makeCardInstance(basicId);
    newMarket = {
      ...newMarket,
      basicPool: {
        ...newMarket.basicPool,
        [basicId]: { ...pool, count: pool.count - 1 },
      },
    };
  }

  if (!card) return addLog(state, 'Unknown buy source.');

  if (!canBuyCard(player, card)) {
    return addLog(state, `${player.name} cannot afford ${card.name}.`);
  }

  // Deduct cost
  const updatedPlayer = deductCost(player, card.cost);

  // Remove from market source and refill row
  if (source === 'market') {
    const rowWithout = state.market.row.filter((c) => c.uid !== cardUid);
    const refillDeck = [...state.market.deck];
    if (refillDeck.length > 0) {
      rowWithout.push(refillDeck.shift());
    }
    newMarket = { ...newMarket, row: rowWithout, deck: refillDeck };
  } else if (source === 'landmark') {
    newMarket = {
      ...newMarket,
      landmarks: newMarket.landmarks.filter((c) => c.uid !== cardUid),
    };
  }

  // Route card to correct zone
  let patch = {
    ...updatedPlayer,
    buildActionsUsed: updatedPlayer.buildActionsUsed + 1,
    costReduction: null, // consume pending reduction
  };

  const isTile =
    card.cardType === CARD_TYPES.TILE || card.cardType === CARD_TYPES.LANDMARK;

  if (card.cardType === CARD_TYPES.ENGINE) {
    patch.engineZone = [...updatedPlayer.engineZone, card];
  } else if (isTile) {
    patch.tilesToPlace = [...updatedPlayer.tilesToPlace, card];
  } else {
    // BASIC card: trigger its effect immediately and send to discard
    const { player: afterEffect, market: mktAfterEffect, logs } =
      resolveBasicCardEffect(card, updatedPlayer, newMarket);
    patch = {
      ...patch,
      ...afterEffect,
      buildActionsUsed: patch.buildActionsUsed,
    };
    newMarket = mktAfterEffect;
    let next = {
      ...state,
      players: state.players.map((p) => (p.id === pid ? { ...p, ...patch } : p)),
      market: newMarket,
    };
    return addLog(next, `${player.name} buys ${card.name}.`, ...logs);
  }

  let next = {
    ...state,
    players: state.players.map((p) => (p.id === pid ? { ...p, ...patch } : p)),
    market: newMarket,
  };

  const note = isTile ? ' (select a cell to place it)' : '';
  return addLog(next, `${player.name} buys ${card.name}.${note}`);
}

// Resolve ADD_RESOURCE effects on basic cards (add resource card to discard).
function resolveBasicCardEffect(card, player, market) {
  const logs = [];
  let discard = [...player.discard, card]; // basic card goes to discard

  const addedCards = [];
  for (const effect of card.effects) {
    if (effect.type === 'ADD_RESOURCE') {
      const rc = makeCardInstance(`resource_${effect.resource}`);
      discard = [...discard, rc];
      addedCards.push(effect.resource);
    }
  }
  if (addedCards.length) {
    logs.push(`Added ${addedCards.join(', ')} card(s) to discard.`);
  }
  return { player: { ...player, discard }, market, logs };
}

// ─────────────────────────────────────────────────────────────────────────────
// Spend resources to cover a cost (hand cards first, then tokens).
// Returns updated player fields only.
// ─────────────────────────────────────────────────────────────────────────────
function deductCost(player, rawCost) {
  if (!rawCost || rawCost.length === 0) return player;

  // Apply pending cost reduction
  let cost = rawCost;
  if (player.costReduction) {
    cost = [...rawCost];
    let rem = player.costReduction.amount;
    const res = player.costReduction.resource;
    for (let i = cost.length - 1; i >= 0 && rem > 0; i--) {
      if (cost[i] === res || res === 'any') {
        cost.splice(i, 1);
        rem--;
      }
    }
  }

  let hand = [...player.hand];
  let tokens = { ...player.tokens };

  for (const c of cost) {
    if (c === 'any') {
      // Spend first available: prefer hand resource cards over tokens
      const fromHand = hand.findIndex(
        (card) => card.cardType === CARD_TYPES.RESOURCE || card.cardType === CARD_TYPES.BASIC
      );
      if (fromHand !== -1) {
        hand.splice(fromHand, 1);
      } else {
        // fall back to first token type available
        for (const res of ['stone', 'water', 'sand', 'greenery']) {
          if (tokens[res] > 0) { tokens[res]--; break; }
        }
      }
    } else {
      // Try hand first
      const fromHand = hand.findIndex(
        (card) =>
          card.cardType === CARD_TYPES.RESOURCE && card.resourceType === c
      );
      if (fromHand !== -1) {
        hand = [...hand.slice(0, fromHand), ...hand.slice(fromHand + 1)];
      } else if (tokens[c] > 0) {
        tokens[c]--;
      }
    }
  }

  return { ...player, hand, tokens };
}

// ─────────────────────────────────────────────────────────────────────────────
// Place a tile from tilesToPlace onto the city grid
// ─────────────────────────────────────────────────────────────────────────────
function handlePlaceTile(state, { cardUid, row, col }) {
  const pid = state.activePlayer;
  const player = state.players[pid];

  const card = player.tilesToPlace.find((c) => c.uid === cardUid);
  if (!card) return addLog(state, 'Tile not in placement queue.');

  if (!canPlaceTileAt(state.cityGrid.cells, row, col)) {
    return addLog(state, 'Invalid placement cell.');
  }

  // Place tile onto grid
  const newCell = {
    tileType: card.tileType,
    tileName: card.name,
    ownedBy: pid,
    cardId: card.id,
    uid: card.uid,
    vp: card.vp,
  };
  const newCells = { ...state.cityGrid.cells, [cellKey(row, col)]: newCell };

  // Resolve placement effects using the updated grid (tile is already in)
  const fx = resolvePlacementEffects(card, newCells, row, col, pid);

  // Apply effects to player
  let updatedPlayer = {
    ...player,
    tilesToPlace: player.tilesToPlace.filter((c) => c.uid !== cardUid),
    discard: [...player.discard, card],
    vp: player.vp + card.vp,
    tokens: addTokens(player.tokens, fx.tokens),
  };

  // ADD_RESOURCE: add resource cards to discard
  for (const res of fx.addResources) {
    const rc = makeCardInstance(`resource_${res}`);
    updatedPlayer = { ...updatedPlayer, discard: [...updatedPlayer.discard, rc] };
  }

  // DRAW cards
  if (fx.draw > 0) {
    updatedPlayer = drawCards(updatedPlayer, fx.draw);
  }

  // MARKET_REFRESH: auto-refresh that many market cards
  let newMarket = state.market;
  if (fx.marketRefresh > 0) {
    newMarket = autoRefreshMarket(newMarket, fx.marketRefresh);
  }

  // Track landmark count
  const isLandmark = card.cardType === CARD_TYPES.LANDMARK;
  const newLandmarkCount = isLandmark
    ? state.builtLandmarks + 1
    : state.builtLandmarks;

  let next = {
    ...state,
    players: state.players.map((p) => (p.id === pid ? updatedPlayer : p)),
    cityGrid: { cells: newCells },
    market: newMarket,
    builtLandmarks: newLandmarkCount,
  };

  const effectLog = fx.logLines.length ? fx.logLines : [];
  next = addLog(
    next,
    `${player.name} places ${card.name} at (${row},${col}) for ${card.vp} VP.`,
    ...effectLog
  );

  // Check win condition
  if (newLandmarkCount >= LANDMARKS_TO_WIN && !state.gameOverTriggeredBy) {
    next = {
      ...next,
      gameOverTriggeredBy: pid,
    };
    next = addLog(
      next,
      `${player.name} triggered the end condition! Finish the round.`
    );
  }

  return next;
}

// ─────────────────────────────────────────────────────────────────────────────
// Use an engine card's active ability
// ─────────────────────────────────────────────────────────────────────────────
function handleUseAbility(state, { cardUid }) {
  const pid = state.activePlayer;
  const player = state.players[pid];

  const card = player.engineZone.find((c) => c.uid === cardUid);
  if (!card) return addLog(state, 'Engine card not found.');
  if (player.usedEngines[cardUid]) return addLog(state, `${card.name} already used this turn.`);

  const ability = card.effects.find((e) => e.type === 'ACTIVE_ABILITY');
  if (!ability) return addLog(state, 'No active ability on this card.');

  const abilityCostArr = ability.cost.map((c) => c.resource);
  if (!canAffordCard(player, abilityCostArr)) {
    return addLog(state, `Cannot afford ability cost for ${card.name}.`);
  }

  let updatedPlayer = deductCost(player, abilityCostArr);
  updatedPlayer = {
    ...updatedPlayer,
    usedEngines: { ...updatedPlayer.usedEngines, [cardUid]: true },
  };

  // Apply the ability effect
  const abilityEffect = ability.effect;
  let logs = [`${player.name} uses ${card.name}.`];

  if (abilityEffect.type === 'COST_REDUCTION') {
    updatedPlayer = {
      ...updatedPlayer,
      costReduction: { resource: abilityEffect.resource, amount: abilityEffect.amount },
    };
    logs.push(`Next ${abilityEffect.tileType} costs ${abilityEffect.amount} less ${abilityEffect.resource}.`);
  } else if (abilityEffect.type === 'GAIN_PER_OWNED_TILE') {
    const ownedCount = Object.values(state.cityGrid.cells).filter(
      (cell) => cell.ownedBy === pid && cell.tileType === abilityEffect.tileType
    ).length;
    const gained = Math.floor(ownedCount / abilityEffect.divisor);
    updatedPlayer = {
      ...updatedPlayer,
      tokens: addTokens(updatedPlayer.tokens, { [abilityEffect.resource]: gained }),
    };
    logs.push(`Gained ${gained} ${abilityEffect.resource} (${ownedCount} buildings / ${abilityEffect.divisor}).`);
  }

  let next = {
    ...state,
    players: state.players.map((p) => (p.id === pid ? updatedPlayer : p)),
  };
  return addLog(next, ...logs);
}

// ─────────────────────────────────────────────────────────────────────────────
// End the active player's turn
// ─────────────────────────────────────────────────────────────────────────────
function handleEndTurn(state) {
  const pid = state.activePlayer;
  const player = state.players[pid];

  // Warn if tiles are still unplaced (they will be discarded)
  const unplaced = player.tilesToPlace;

  // Convert: up to stats.convert resource cards from hand to tokens
  let hand = [...player.hand];
  let tokens = { ...player.tokens };
  let converted = 0;
  const maxConvert = player.stats.convert;

  for (let i = hand.length - 1; i >= 0 && converted < maxConvert; i--) {
    const c = hand[i];
    if (c.cardType === CARD_TYPES.RESOURCE) {
      tokens[c.resourceType] = (tokens[c.resourceType] || 0) + 1;
      hand.splice(i, 1);
      converted++;
    }
  }

  // Discard rest of hand + unplaced tiles
  const newDiscard = [
    ...player.discard,
    ...hand,
    ...unplaced,
  ];

  const updatedPlayer = {
    ...player,
    hand: [],
    discard: newDiscard,
    tilesToPlace: [],
    buildActionsUsed: 0,
    refreshActionsUsed: 0,
    usedEngines: {},
    costReduction: null,
    tokens,
  };

  // Determine next player and check round end
  const numPlayers = state.players.length;
  const nextPlayer = (pid + 1) % numPlayers;
  const isRoundEnd = nextPlayer === 0;
  const newRound = isRoundEnd ? state.round + 1 : state.round;
  const newTurnNumber = state.turnNumber + 1;

  let next = {
    ...state,
    players: state.players.map((p) => (p.id === pid ? updatedPlayer : p)),
    activePlayer: nextPlayer,
    round: newRound,
    turnNumber: newTurnNumber,
  };

  const convLog = converted > 0 ? `Converted ${converted} card(s) to tokens.` : null;
  const unplacedLog =
    unplaced.length > 0
      ? `${unplaced.length} tile(s) discarded unplaced.`
      : null;

  next = addLog(
    next,
    `${player.name} ends their turn.`,
    ...[convLog, unplacedLog].filter(Boolean)
  );

  // Check game over after round completes (both players had equal turns)
  if (state.gameOverTriggeredBy !== null && isRoundEnd) {
    const scores = next.players.map((p) => ({ id: p.id, vp: p.vp }));
    const maxVP = Math.max(...scores.map((s) => s.vp));
    const winners = scores.filter((s) => s.vp === maxVP);
    const winnerNames = winners
      .map((w) => next.players[w.id].name)
      .join(' & ');

    next = {
      ...next,
      phase: PHASES.GAME_OVER,
      winner: winners.length === 1 ? winners[0].id : 'tie',
    };
    next = addLog(
      next,
      `Game over! ${winnerNames} wins with ${maxVP} VP!`
    );
  } else {
    // Start next player's turn: draw their hand
    next = handleDrawHand(next);
  }

  return next;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function addTokens(tokens, gained) {
  const result = { ...tokens };
  for (const [res, amt] of Object.entries(gained)) {
    if (res in result) result[res] += amt;
  }
  return result;
}

function drawCards(player, count) {
  let deck = [...player.deck];
  let discard = [...player.discard];

  if (deck.length < count) {
    deck = shuffle([...deck, ...discard], String(Date.now()));
    discard = [];
  }

  const drawn = deck.splice(0, count);
  return {
    ...player,
    deck,
    discard,
    hand: [...player.hand, ...drawn],
  };
}

function autoRefreshMarket(market, count) {
  const row = [...market.row];
  let deck = [...market.deck];
  const toRefresh = Math.min(count, row.length);

  for (let i = 0; i < toRefresh; i++) {
    const removed = row.shift();
    deck.push(removed);
    if (deck.length > 0) {
      row.push(deck.shift());
    }
  }

  return { ...market, row, deck };
}
