import React, { useReducer, useState } from 'react';
import { gameReducer } from '../../game/reducer.js';
import { createInitialGameState } from '../../game/initialGameState.js';
import {
  buyCard,
  buildCardOnCell,
  placeTile,
  freeRefresh,
  endTurn,
  useAbility,
  applyUpgrade,
} from '../../game/actions.js';
import {
  selectActivePlayer,
  selectAvailableResources,
  selectValidPlacements,
  selectCanBuyCard,
  selectCanAffordCard,
  selectIsGameOver,
  selectBuildsRemaining,
  selectRefreshesRemaining,
  selectAvailableEngineCount,
} from '../../game/selectors.js';

import GameHeader from './GameHeader.jsx';
import CityBoard from './CityBoard.jsx';
import PlayerPanel from './PlayerPanel.jsx';
import PlayerHand from './PlayerHand.jsx';
import MarketRow from './MarketRow.jsx';
import LandmarkRow from './LandmarkRow.jsx';
import ActionLog from './ActionLog.jsx';
import TurnGuide from './TurnGuide.jsx';

export default function CityGamePrototype() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => createInitialGameState(['mason', 'water_planner'])
  );

  const [selectedTile, setSelectedTile] = useState(null);
  const [draggingBuild, setDraggingBuild] = useState(null);

  const isGameOver = selectIsGameOver(state);
  const activePlayer = selectActivePlayer(state);
  const availableRes = selectAvailableResources(state, activePlayer.id);
  const validPlacements = selectValidPlacements(state);
  const buildsRemaining = selectBuildsRemaining(state);
  const refreshesLeft = selectRefreshesRemaining(state);
  const enginesAvailable = selectAvailableEngineCount(state);

  function handleBuyFromMarket(uid, source) {
    dispatch(buyCard(uid, source));
    setSelectedTile(null);
  }

  function handleBuyBasic(defId) {
    const resource = defId.replace('_supply', '');
    dispatch(buyCard(defId, `basic_${resource}`));
  }

  function handleBuyLandmark(uid) {
    dispatch(buyCard(uid, 'landmark'));
    setSelectedTile(null);
  }

  function handlePlaceTile(uid, row, col) {
    dispatch(placeTile(uid, row, col));
    setSelectedTile(null);
  }

  function handleDropBuildCard(cardUid, source, row, col) {
    dispatch(buildCardOnCell(cardUid, source, row, col));
    setSelectedTile(null);
    setDraggingBuild(null);
  }

  function handleRefreshMarket(uid) {
    dispatch(freeRefresh(uid));
  }

  function handleEndTurn() {
    dispatch(endTurn());
    setSelectedTile(null);
    setDraggingBuild(null);
  }

  function handleUseAbility(uid) {
    dispatch(useAbility(uid));
  }

  function handleApplyUpgrade(stat) {
    dispatch(applyUpgrade(stat));
  }

  const canBuyFn = (card) => !isGameOver && selectCanBuyCard(state, card);
  const canAffordFn = (card) => selectCanAffordCard(state, card);

  return (
    <div className="game-root">
      <GameHeader state={state} />

      <div className="player-huds">
        {state.players.map((p) => (
          <PlayerPanel
            key={p.id}
            player={p}
            isActive={state.activePlayer === p.id}
            onApplyUpgrade={handleApplyUpgrade}
          />
        ))}
      </div>

      <div className="game-layout">
        <aside className="left-utility-rail">
          <section className="game-panel tile-stack-panel">
            <div className="panel-section-title">Tile Stack</div>
            <div className="tile-stack-card">
              <span className="tile-stack-emblem">Palm</span>
              <strong>28</strong>
              <small>city tiles</small>
            </div>
            <button className="rail-button" type="button">Draw Tile</button>
          </section>

          <section className="game-panel token-panel">
            <div className="panel-section-title">City Tokens</div>
            <div className="token-grid">
              <span><b>Building</b></span>
              <span><b>Garden</b></span>
              <span><b>Civic</b></span>
              <span><b>Water</b></span>
            </div>
            <p className="rail-note">Upgrade tokens and city type markers will live here once the visual asset kit is added.</p>
          </section>

          {activePlayer.engineZone.length > 0 && (
            <section className="game-panel engine-actions">
              <div className="panel-section-title">
                Engine Abilities
                <span className="once-per-turn"> once/turn</span>
              </div>
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
                    {card.name} {used ? '(used)' : 'Use'}
                  </button>
                );
              })}
            </section>
          )}
        </aside>

        <main className="center-area">
          <CityBoard
            cells={state.cityGrid.cells}
            validPlacements={validPlacements}
            selectedTile={selectedTile}
            draggingBuild={draggingBuild}
            onPlaceTile={handlePlaceTile}
            onDropBuildCard={handleDropBuildCard}
          />

          <TurnGuide
            player={activePlayer}
            buildsRemaining={buildsRemaining}
            refreshesRemaining={refreshesLeft}
            availableEngineCount={enginesAvailable}
            isGameOver={isGameOver}
          />

          <PlayerHand
            player={activePlayer}
            isActive
            availableResources={availableRes}
            selectedTile={selectedTile}
            onSelectTile={setSelectedTile}
          />
        </main>

        <aside className="right-panels">
          <MarketRow
            market={state.market}
            canBuy={canBuyFn}
            canAfford={canAffordFn}
            buildsRemaining={buildsRemaining}
            buildTotal={activePlayer.stats.build}
            refreshesRemaining={refreshesLeft}
            refreshTotal={activePlayer.stats.refresh}
            onBuyFromMarket={handleBuyFromMarket}
            onBuyBasic={handleBuyBasic}
            onRefreshMarket={handleRefreshMarket}
            onDragBuildStart={setDraggingBuild}
            onDragBuildEnd={() => setDraggingBuild(null)}
          />
          <LandmarkRow
            landmarks={state.market.landmarks}
            canBuy={canBuyFn}
            canAfford={canAffordFn}
            onBuyLandmark={handleBuyLandmark}
            onDragBuildStart={setDraggingBuild}
            onDragBuildEnd={() => setDraggingBuild(null)}
          />
          <div className="command-deck game-panel">
            <div className="panel-section-title">Actions</div>
            <div className="command-buttons">
              <button className="action-button" type="button" title="Drag a buildable market card onto the city">Build</button>
              <button className={`action-button ${selectedTile || draggingBuild ? 'action-button--active' : ''}`} type="button" title="Buildable cards can be dropped on any empty square">Place Tile</button>
              <button className="action-button" type="button" title="Use refresh buttons on Market cards">Refresh {refreshesLeft}</button>
              <button
                className="action-button action-button--end"
                onClick={handleEndTurn}
                disabled={isGameOver}
                title="Convert leftovers, discard hand, refill market, then pass to opponent"
              >
                End Turn
              </button>
            </div>
            {draggingBuild && <p className="command-note">Drop {draggingBuild.name} on any empty city square.</p>}
            {activePlayer.tilesToPlace.length > 0 && (
              <p className="command-warning">{activePlayer.tilesToPlace.length} queued tile(s) can still be placed by clicking the board.</p>
            )}
          </div>
          <ActionLog log={state.log} />
        </aside>
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
                    <td><strong>{p.vp} VP</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="btn-end-turn"
              onClick={() => dispatch({ type: 'START_GAME', payload: { characterIds: ['mason', 'water_planner'] } })}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
