import React from 'react';
import { STAT_CAPS } from '../../game/constants.js';
import { canApplyUpgrade } from '../../game/validation.js';

const RES_COLOR = {
  stone:    '#a0907a',
  water:    '#5a9ec8',
  sand:     '#c8b040',
  greenery: '#5aad5a',
};

const RES_EMOJI = {
  stone:    '🪨',
  water:    '💧',
  sand:     '🟡',
  greenery: '🌿',
};

const STAT_LABELS = {
  hand:    'Hand',
  build:   'Build',
  convert: 'Convert',
  refresh: 'Refresh',
};

// §2: what each stat does — shown as tooltip
const STAT_TIPS = {
  hand:    'Draw this many cards at start of turn',
  build:   'Buy/build up to this many cards per turn',
  convert: 'Convert up to this many leftover hand cards to tokens at end of turn',
  refresh: 'Refresh up to this many Market cards for free (step 2, before buying)',
};

export default function PlayerPanel({ player, isActive, onApplyUpgrade }) {
  const { name, stats, tokens, upgradeTokens, vp, deck, discard, engineZone, hand } = player;

  return (
    <aside className={`player-panel ${isActive ? 'player-panel--active' : ''}`}>
      <div className="panel-name">{name}</div>
      <div className="panel-vp">{vp} <span className="vp-label">VP</span></div>

      {/* §2 Character Stats */}
      <section className="panel-section">
        <div className="panel-section-title">Character Stats</div>
        {Object.entries(stats).map(([stat, val]) => {
          const cap = STAT_CAPS[stat];
          const atCap = val >= cap;
          const canUpgrade = isActive && canApplyUpgrade(player, stat);
          return (
            <div key={stat} className="stat-row" title={STAT_TIPS[stat]}>
              <span className="stat-name">{STAT_LABELS[stat]}</span>
              <span className={`stat-val ${atCap ? 'stat-val--cap' : ''}`}>
                {val}
                <span className="stat-cap">/{cap}</span>
              </span>
              {canUpgrade && (
                <button
                  className="btn-upgrade-stat"
                  onClick={() => onApplyUpgrade(stat)}
                  title={`Spend 1 upgrade token: ${stat} ${val} → ${val + 1}`}
                >
                  ⬆
                </button>
              )}
            </div>
          );
        })}
      </section>

      {/* §7 Upgrade tokens */}
      {(upgradeTokens > 0 || isActive) && (
        <section className="panel-section">
          <div className="panel-section-title" title="§7: Place on a stat to increase it by 1">
            Upgrade Tokens
          </div>
          <div className="upgrade-token-row">
            <span className="upgrade-token-count">⬆ {upgradeTokens}</span>
            {upgradeTokens > 0 && isActive && (
              <span className="upgrade-hint">← click a stat above</span>
            )}
          </div>
        </section>
      )}

      {/* §6 Tokens — persist between turns; spent tokens are removed */}
      <section className="panel-section">
        <div
          className="panel-section-title"
          title="Tokens persist between turns. Spent tokens are removed from the game."
        >
          Tokens <span className="persist-label">(persist)</span>
        </div>
        {Object.entries(tokens).map(([res, count]) => (
          <div key={res} className="stat-row">
            <span className="res-label">
              <span className="res-dot" style={{ background: RES_COLOR[res] }} />
              {RES_EMOJI[res]} {res}
            </span>
            <span className="stat-val" style={{ color: count > 0 ? RES_COLOR[res] : '#555' }}>
              {count}
            </span>
          </div>
        ))}
        <div className="token-footnote">Spent tokens are removed.</div>
      </section>

      {/* Deck counts */}
      <section className="panel-section">
        <div className="panel-section-title">Deck</div>
        <div className="deck-counts">
          <span>Deck: <strong>{deck.length}</strong></span>
          <span>Hand: <strong>{hand.length}</strong></span>
          <span>Discard: <strong>{discard.length}</strong></span>
        </div>
      </section>

      {/* Engine zone */}
      {engineZone.length > 0 && (
        <section className="panel-section">
          <div className="panel-section-title">
            Engine Zone <span className="once-per-turn">(once/turn)</span>
          </div>
          {engineZone.map((card) => (
            <div key={card.uid} className="engine-card-mini" title={card.effectText}>
              ⚙ {card.name}
            </div>
          ))}
        </section>
      )}
    </aside>
  );
}
