import React from 'react';
import { selectActivePlayer, selectRound, selectIsGameOver, selectWinner } from '../../game/selectors.js';

export default function GameHeader({ state }) {
  const activePlayer = selectActivePlayer(state);
  const round = selectRound(state);
  const isOver = selectIsGameOver(state);
  const winner = selectWinner(state);

  return (
    <header className="game-header">
      <div className="header-section">
        <span className="label">Round</span>
        <span className="value">{round}</span>
      </div>

      <div className="header-center">
        {isOver ? (
          <span className="game-over-banner">
            {winner === 'tie'
              ? 'Game Over — Tie!'
              : `Game Over — ${state.players[winner]?.name} wins!`}
          </span>
        ) : (
          <span className="active-player-banner">
            {activePlayer.name}'s Turn
          </span>
        )}
      </div>

      <div className="header-section header-vp-row">
        {state.players.map((p) => (
          <div
            key={p.id}
            className={`vp-chip ${state.activePlayer === p.id && !isOver ? 'active' : ''}`}
          >
            <span className="vp-chip-name">{p.name}</span>
            <span className="vp-chip-score">{p.vp} VP</span>
            {p.upgradeTokens > 0 && (
              <span className="vp-chip-upgrade" title="Upgrade tokens available">
                ⬆{p.upgradeTokens}
              </span>
            )}
          </div>
        ))}
        <div className="landmark-counter">
          <span className="label">Landmarks</span>
          <span className="value">{state.builtLandmarks}/3</span>
        </div>
      </div>
    </header>
  );
}
