import React from 'react';
import { CARD_TYPES } from '../../game/constants.js';

const COST_EMOJI = {
  stone:    '🪨',
  water:    '💧',
  sand:     '🟡',
  greenery: '🌿',
  any:      '◇',
};

const TYPE_COLOR = {
  building: '#c8a96e',
  road:     '#b5a07a',
  garden:   '#6aad6a',
  water:    '#5a9ec8',
};

export default function MarketRow({
  market,
  canBuy,
  canAfford,
  buildsRemaining,
  buildTotal,
  refreshesRemaining,
  refreshTotal,
  onBuyFromMarket,
  onBuyBasic,
  onRefreshMarket,
  selectedBuildCard,
  onSelectBuildCard,
}) {
  const canRefresh = refreshesRemaining > 0;

  return (
    <div className="market-row">
      <div className="market-action-counters">
        <div className={`action-counter ${buildsRemaining > 0 ? 'counter--available' : 'counter--spent'}`}>
          <span className="counter-icon">🔨</span>
          <span className="counter-label">Buy/Build</span>
          <span className="counter-val">{buildsRemaining}/{buildTotal}</span>
        </div>
        {refreshTotal > 0 && (
          <div className={`action-counter ${canRefresh ? 'counter--available' : 'counter--spent'}`}>
            <span className="counter-icon">↺</span>
            <span className="counter-label">Free Refresh</span>
            <span className="counter-val">{refreshesRemaining}/{refreshTotal}</span>
          </div>
        )}
      </div>

      <div className="market-section-title">Main Market <span className="drag-hint">select a card, then choose a map square</span></div>

      <div className="market-cards">
        {market.row.map((card) => (
          <MarketCard
            key={card.uid}
            card={card}
            source="market"
            affordable={canAfford(card)}
            buyable={canBuy(card)}
            selected={selectedBuildCard?.cardUid === card.uid && selectedBuildCard?.source === 'market'}
            canRefresh={canRefresh}
            onBuy={() => onBuyFromMarket(card.uid, 'market')}
            onRefresh={() => onRefreshMarket(card.uid)}
            onSelectBuildCard={onSelectBuildCard}
          />
        ))}
        {market.row.length === 0 && (
          <div className="market-empty">Market deck empty.</div>
        )}
      </div>

      <div className="market-deck-count">Deck: {market.deck.length} remaining</div>

      <div className="market-section-title" style={{ marginTop: '0.5rem' }}>
        Basic Cards <span className="basic-note">(fallback — no tile)</span>
      </div>
      <div className="basic-pool">
        {Object.entries(market.basicPool).map(([id, { count, def }]) => {
          const buyable = canBuy(def);
          const affordable = canAfford(def);
          return (
            <div
              key={id}
              className={`basic-card ${affordable ? 'affordable' : ''} ${buyable ? 'buyable' : ''}`}
              onClick={() => buyable && onBuyBasic(def.id, id)}
              title={`${def.effectText} — goes to your discard, no tile placed`}
            >
              <div className="basic-card-name">{def.name}</div>
              <div className="basic-card-cost">
                {def.cost.map((c, i) => (
                  <span key={i} className="cost-pip">{COST_EMOJI[c] || c}</span>
                ))}
              </div>
              <div className="basic-card-effect">{def.effectText}</div>
              <div className="basic-card-count">×{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarketCard({ card, source, affordable, buyable, selected, canRefresh, onBuy, onRefresh, onSelectBuildCard }) {
  const isTile = card.cardType === CARD_TYPES.TILE || card.cardType === CARD_TYPES.LANDMARK;
  const isEngine = card.cardType === CARD_TYPES.ENGINE;
  const tileColor = TYPE_COLOR[card.tileType] || '#888';
  const canDirectBuild = isTile && buyable;

  function handleSelect() {
    if (!canDirectBuild) return;
    onSelectBuildCard(selected ? null : { cardUid: card.uid, source, name: card.name });
  }

  return (
    <div
      className={`market-card ${affordable ? 'market-card--affordable' : ''} ${buyable ? 'market-card--buyable' : ''} ${canDirectBuild ? 'market-card--selectable' : ''} ${selected ? 'market-card--selected-build' : ''}`}
      style={{ borderTopColor: isTile ? tileColor : '#888' }}
      onClick={handleSelect}
      title={canDirectBuild ? `Select ${card.name}, then click a city square to build it` : undefined}
    >
      <div className="mc-name">{card.name}</div>

      <div className="mc-cost">
        {card.cost.map((c, i) => (
          <span key={i} className="cost-pip">{COST_EMOJI[c] || c}</span>
        ))}
      </div>

      {isTile && (
        <div className="mc-meta">
          <span
            className="mc-tiletype"
            style={{ background: tileColor + '33', borderColor: tileColor, color: tileColor }}
          >
            {tileTypeIcon(card.tileType)} {card.tileType}
          </span>
          <span className="mc-vp">{card.vp} VP</span>
        </div>
      )}

      {isEngine && (
        <div className="mc-meta">
          <span className="mc-engine-badge">⚙ Engine (0 VP)</span>
        </div>
      )}

      <div className="mc-effect">{card.effectText}</div>

      <div className="mc-actions" onClick={(event) => event.stopPropagation()}>
        {canDirectBuild ? (
          <button className="btn-buy" onClick={handleSelect}>
            {selected ? 'Cancel' : 'Build'}
          </button>
        ) : (
          <button className="btn-buy" disabled={!buyable} onClick={onBuy}>
            {isTile ? 'Queue' : 'Buy'}
          </button>
        )}
        {canDirectBuild && <span className="drag-build-label">choose square</span>}
        {canRefresh && (
          <button
            className="btn-refresh"
            onClick={onRefresh}
            title="Free Refresh: send to bottom of deck, reveal replacement"
          >
            ↺
          </button>
        )}
      </div>
    </div>
  );
}

function tileTypeIcon(tileType) {
  const icons = { building: '🏛', road: '🛣', garden: '🌸', water: '💧' };
  return icons[tileType] || '';
}
