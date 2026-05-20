import React from 'react';

const RES_EMOJI = {
  stone: '🪨',
  water: '💧',
  sand: '🟡',
  greenery: '🌿',
};

export default function PlayerPanel({ player, isActive }) {
  const { name, stats, tokens, vp, deck, discard, engineZone, hand } = player;

  return (
    <aside className={`player-panel ${isActive ? 'player-panel--active' : ''}`}>
      <div className="panel-name">{name}</div>
      <div className="panel-vp">{vp} VP</div>

      <section className="panel-section">
        <div className="panel-section-title">Stats</div>
        {Object.entries(stats).map(([stat, val]) => (
          <div key={stat} className="stat-row">
            <span className="stat-name">{capitalize(stat)}</span>
            <span className="stat-val">{val}</span>
          </div>
        ))}
      </section>

      <section className="panel-section">
        <div className="panel-section-title">Tokens</div>
        {Object.entries(tokens).map(([res, count]) => (
          <div key={res} className="stat-row">
            <span>{RES_EMOJI[res]} {capitalize(res)}</span>
            <span className="stat-val">{count}</span>
          </div>
        ))}
      </section>

      <section className="panel-section">
        <div className="panel-section-title">Deck</div>
        <div className="deck-counts">
          <span>Deck: {deck.length}</span>
          <span>Hand: {hand.length}</span>
          <span>Discard: {discard.length}</span>
          {engineZone.length > 0 && <span>Engines: {engineZone.length}</span>}
        </div>
      </section>

      {engineZone.length > 0 && (
        <section className="panel-section">
          <div className="panel-section-title">Engine Zone</div>
          {engineZone.map((card) => (
            <div key={card.uid} className="engine-card-mini">
              {card.name}
            </div>
          ))}
        </section>
      )}
    </aside>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
