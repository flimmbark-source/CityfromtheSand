import React, { useReducer, useState } from 'react';
import { gameReducer } from '../../game/reducer.js';
import { createInitialGameState } from '../../game/initialGameState.js';
import {
  buyCard,
  placeTile,
  freeRefresh,
  endTurn,
  useAbility,
} from '../../game/actions.js';
import {
  selectActivePlayer,
  selectAvailableResources,
  selectValidPlacements,
  selectCanFreeRefresh,
  selectCanBuyCard,
  selectCanAffordCard,
  selectIsGameOver,
} from '../../game/selectors.js';

import GameHeader from './GameHeader.jsx';
import CityBoard from './CityBoard.jsx';
import PlayerPanel from './PlayerPanel.jsx';
import PlayerHand from './PlayerHand.jsx';
import MarketRow from './MarketRow.jsx';
import LandmarkRow from './LandmarkRow.jsx';
import ActionLog from './ActionLog.jsx';

export default function CityGamePrototype() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => createInitialGameState(['mason', 'water_planner'])
  );

  // The tile the active player has selected for placement
  const [selectedTile, setSelectedTile] = useState(null);

  const isGameOver = selectIsGameOver(state);
  const activePlayer = selectActivePlayer(state);
  const availableResources = selectAvailableResources(state, activePlayer.id);
  const validPlacements = selectValidPlacements(state);
  const canRefresh = selectCanFreeRefresh(state);

  function handleBuyFromMarket(uid, source) {
    dispatch(buyCard(uid, source));
    setSelectedTile(null);
  }

  function handleBuyBasic(defId, poolKey) {
    // poolKey is like 'stone_supply'; source convention is 'basic_stone'
    const resource = defId.replace('_supply', '');
    dispatch(buyCard(defId, `basic_${resource}`));
  }

  function handleBuyLandmark(uid, source) {
    dispatch(buyCard(uid, source));
    setSelectedTile(null);
  }

  function handlePlaceTile(uid, row, col) {
    dispatch(placeTile(uid, row, col));
    setSelectedTile(null);
  }

  function handleRefreshMarket(uid) {
    dispatch(freeRefresh(uid));
  }

  function handleEndTurn() {
    dispatch(endTurn());
    setSelectedTile(null);
  }

  function handleUseAbility(uid) {
    dispatch(useAbility(uid));
  }

  function handleSelectTile(tile) {
    setSelectedTile(tile);
  }

  const canBuyFn = (card) => !isGameOver && selectCanBuyCard(state, card);
  const canAffordFn = (card) => selectCanAffordCard(state, card);

  return (
    <div className="game-root">
      <GameHeader state={state} />

      <div className="game-layout">
        {/* Left: both player panels */}
        <div className="left-panels">
          {state.players.map((p) => (
            <PlayerPanel
              key={p.id}
              player={p}
              isActive={state.activePlayer === p.id}
            />
          ))}

          {/* Engine zone actions for active player */}
          {activePlayer.engineZone.length > 0 && (
            <div className="engine-actions">
              <div className="panel-section-title">Engine Abilities</div>
              {activePlayer.engineZone.map((card) => {
                const used = activePlayer.usedEngines[card.uid];
                return (
                  <button
                    key={card.uid}
                    className={`btn-engine ${used ? 'btn-engine--used' : ''}`}
                    disabled={used || isGameOver}
                    onClick={() => handleUseAbility(card.uid)}
                    title={card.effectText}
                  >
                    {card.name} {used ? '(used)' : '→ Use'}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Center: city board */}
        <div className="center-area">
          <CityBoard
            cells={state.cityGrid.cells}
            validPlacements={validPlacements}
            selectedTile={selectedTile}
            onPlaceTile={handlePlaceTile}
          />

          <PlayerHand
            player={activePlayer}
            isActive
            availableResources={availableResources}
            selectedTile={selectedTile}
            onSelectTile={handleSelectTile}
          />

          <div className="turn-controls">
            <button
              className="btn-end-turn"
              onClick={handleEndTurn}
              disabled={isGameOver}
            >
              End Turn →
            </button>
            {activePlayer.tilesToPlace.length > 0 && (
              <span className="tiles-reminder">
                ⚠ You have {activePlayer.tilesToPlace.length} unplaced tile(s)!
              </span>
            )}
          </div>
        </div>

        {/* Right: market, landmarks, log */}
        <div className="right-panels">
          <MarketRow
            market={state.market}
            canBuy={canBuyFn}
            canAfford={canAffordFn}
            canRefresh={canRefresh}
            onBuyFromMarket={handleBuyFromMarket}
            onBuyBasic={handleBuyBasic}
            onRefreshMarket={handleRefreshMarket}
          />
          <LandmarkRow
            landmarks={state.market.landmarks}
            canBuy={canBuyFn}
            canAfford={canAffordFn}
            onBuyLandmark={handleBuyLandmark}
          />
          <ActionLog log={state.log} />
        </div>
      </div>

      {isGameOver && (
        <div className="game-over-overlay">
          <div className="game-over-box">
            <h2>Game Over</h2>
            {state.winner === 'tie' ? (
              <p>It's a tie!</p>
            ) : (
              <p>{state.players[state.winner]?.name} wins!</p>
            )}
            <table className="score-table">
              <tbody>
                {state.players.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.vp} VP</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="btn-end-turn"
              onClick={() =>
                dispatch({ type: 'START_GAME', payload: { characterIds: ['mason', 'water_planner'] } })
              }
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
