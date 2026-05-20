import React from 'react';
import { CARD_TYPES } from '../../game/constants.js';

const COST_EMOJI = {
  stone: '🪨',
  water: '💧',
  sand: '🟡',
  greenery: '🌿',
  any: '◇',
};

const TYPE_COLOR = {
  building: '#c8a96e',
  road: '#b5a07a',
  garden: '#6aad6a',
  water: '#5a9ec8',
};

export default function MarketRow({
  market,
  canBuy,
  canAfford,
  canRefresh,
  onBuyFromMarket,
  onBuyBasic,
  onRefreshMarket,
}) {
  return (
    <div className="market-row">
      <div className="market-section-title">Market Row</div>

      <div className="market-cards">
        {market.row.map((card) => {
          const affordable = canAfford(card);
          const buyable = canBuy(card);

          return (
            <MarketCard
              key={card.uid}
              card={card}
              affordable={affordable}
              buyable={buyable}
              canRefresh={canRefresh}
              onBuy={() => onBuyFromMarket(card.uid, 'market')}
              onRefresh={() => onRefreshMarket(card.uid)}
            />
          );
        })}
        {market.row.length === 0 && (
          <div className="market-empty">Market deck empty.</div>
        )}
      </div>

      <div className="market-deck-count">Deck: {market.deck.length} cards</div>

      {/* Basic Pool */}
      <div className="market-section-title" style={{ marginTop: '0.5rem' }}>
        Basic Pool
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
              title={def.effectText}
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

function MarketCard({ card, affordable, buyable, canRefresh, onBuy, onRefresh }) {
  const isTile = card.cardType === CARD_TYPES.TILE || card.cardType === CARD_TYPES.LANDMARK;
  const isEngine = card.cardType === CARD_TYPES.ENGINE;

  return (
    <div
      className={`market-card ${affordable ? 'market-card--affordable' : ''} ${buyable ? 'market-card--buyable' : ''}`}
      style={{ borderTopColor: isTile ? (TYPE_COLOR[card.tileType] || '#888') : '#888' }}
    >
      <div className="mc-name">{card.name}</div>

      <div className="mc-cost">
        {card.cost.map((c, i) => (
          <span key={i} className="cost-pip">{COST_EMOJI[c] || c}</span>
        ))}
      </div>

      {isTile && (
        <div className="mc-meta">
          <span className="mc-tiletype" style={{ color: TYPE_COLOR[card.tileType] }}>
            {card.tileType}
          </span>
          <span className="mc-vp">{card.vp} VP</span>
        </div>
      )}

      {isEngine && <div className="mc-meta"><span className="mc-engine-badge">Engine</span></div>}

      <div className="mc-effect">{card.effectText}</div>

      <div className="mc-actions">
        <button
          className="btn-buy"
          disabled={!buyable}
          onClick={onBuy}
          title={buyable ? 'Buy this card' : 'Cannot buy'}
        >
          Buy
        </button>
        {canRefresh && (
          <button className="btn-refresh" onClick={onRefresh} title="Refresh this card">
            ↺
          </button>
        )}
      </div>
    </div>
  );
}
