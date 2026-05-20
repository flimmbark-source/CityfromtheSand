import React from 'react';
import { selectActivePlayer, selectRound, selectIsGameOver, selectWinner } from '../../game/selectors.js';

export default function GameHeader({ state }) {
  const activePlayer = selectActivePlayer(state);
  const round = selectRound(state);
  const isOver = selectIsGameOver(state);
  const winner = selectWinner(state);

  return (
    <header className="game-header">
      <div className="header-room-chip">
        <span className="online-dot" />
        <span>Room: Desert Table</span>
      </div>

      <div className="header-title-block">
        <div className="game-title">City from the Sand</div>
        <div className="header-subline">
          <span>Round {round}</span>
          <span>•</span>
          <span>{state.builtLandmarks}/3 Landmarks Built</span>
        </div>
        <div className="turn-banner">
          {isOver ? (
            <span>
              {winner === 'tie'
                ? 'Game Over — Tie!'
                : `Game Over — ${state.players[winner]?.name} wins!`}
            </span>
          ) : (
            <span>🔨 {activePlayer.name}'s Turn</span>
          )}
        </div>
      </div>

      <div className="header-vp-row">
        {state.players.map((p, index) => (
          <div
            key={p.id}
            className={`vp-chip player-${index + 1} ${state.activePlayer === p.id && !isOver ? 'active' : ''}`}
          >
            <span className="vp-chip-name">{p.name}</span>
            <span className="vp-chip-score">{p.vp}</span>
            <span className="vp-chip-label">VP</span>
            {p.upgradeTokens > 0 && (
              <span className="vp-chip-upgrade" title="Upgrade tokens available">
                ⬆{p.upgradeTokens}
              </span>
            )}
          </div>
        ))}
      </div>
    </header>
  );
}
