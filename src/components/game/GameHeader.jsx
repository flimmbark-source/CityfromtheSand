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
          <span key={p.id} className={`vp-chip ${state.activePlayer === p.id && !isOver ? 'active' : ''}`}>
            {p.name}: <strong>{p.vp} VP</strong>
          </span>
        ))}
        <span className="label">
          Landmarks: <strong>{state.builtLandmarks}</strong> / 3
        </span>
      </div>
    </header>
  );
}
