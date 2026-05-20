import React from 'react';

const COST_EMOJI = {
  stone: '🪨',
  water: '💧',
  sand: '🟡',
  greenery: '🌿',
  any: '◇',
};

export default function LandmarkRow({
  landmarks,
  canBuy,
  canAfford,
  onBuyLandmark,
  selectedBuildCard,
  onSelectBuildCard,
}) {
  return (
    <div className="landmark-row">
      <div className="market-section-title">Landmarks <span className="drag-hint">select, then choose a map square</span></div>
      <div className="landmark-cards">
        {landmarks.map((card) => {
          const affordable = canAfford(card);
          const buyable = canBuy(card);
          const selected = selectedBuildCard?.cardUid === card.uid && selectedBuildCard?.source === 'landmark';

          function handleSelect() {
            if (!buyable) return;
            onSelectBuildCard(selected ? null : { cardUid: card.uid, source: 'landmark', name: card.name });
          }

          return (
            <div
              key={card.uid}
              className={`landmark-card ${affordable ? 'affordable' : ''} ${buyable ? 'buyable' : ''} ${buyable ? 'market-card--selectable' : ''} ${selected ? 'market-card--selected-build' : ''}`}
              onClick={handleSelect}
              title={buyable ? `Select ${card.name}, then click a city square to build it` : undefined}
            >
              <div className="lm-name">⭐ {card.name}</div>
              <div className="lm-cost">
                {card.cost.map((c, i) => (
                  <span key={i} className="cost-pip">{COST_EMOJI[c] || c}</span>
                ))}
              </div>
              <div className="lm-meta">
                <span className="lm-tiletype">{card.tileType}</span>
                <span className="lm-vp">{card.vp} VP</span>
              </div>
              <div className="lm-effect">{card.effectText}</div>
              <div className="mc-actions" onClick={(event) => event.stopPropagation()}>
                <button
                  className="btn-buy"
                  disabled={!buyable}
                  onClick={handleSelect}
                >
                  {selected ? 'Cancel' : 'Build'}
                </button>
                {buyable && <span className="drag-build-label">choose square</span>}
              </div>
            </div>
          );
        })}
        {landmarks.length === 0 && (
          <div className="market-empty">No landmarks available.</div>
        )}
      </div>
    </div>
  );
}
