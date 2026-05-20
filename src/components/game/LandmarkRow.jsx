import React from 'react';

const COST_EMOJI = {
  stone: '🪨',
  water: '💧',
  sand: '🟡',
  greenery: '🌿',
  any: '◇',
};

export default function LandmarkRow({ landmarks, canBuy, canAfford, onBuyLandmark, onDragBuildStart, onDragBuildEnd }) {
  return (
    <div className="landmark-row">
      <div className="market-section-title">Landmarks <span className="drag-hint">drag onto the city</span></div>
      <div className="landmark-cards">
        {landmarks.map((card) => {
          const affordable = canAfford(card);
          const buyable = canBuy(card);
          const canDragBuild = buyable;

          function handleDragStart(event) {
            if (!canDragBuild) {
              event.preventDefault();
              return;
            }
            const payload = { cardUid: card.uid, source: 'landmark', name: card.name };
            event.dataTransfer.effectAllowed = 'copyMove';
            event.dataTransfer.setData('application/city-sand-card', JSON.stringify(payload));
            event.dataTransfer.setData('text/plain', card.name);
            onDragBuildStart?.(payload);
          }

          return (
            <div
              key={card.uid}
              className={`landmark-card ${affordable ? 'affordable' : ''} ${buyable ? 'buyable' : ''} ${canDragBuild ? 'market-card--draggable' : ''}`}
              draggable={canDragBuild}
              onDragStart={handleDragStart}
              onDragEnd={() => onDragBuildEnd?.()}
              title={canDragBuild ? `Drag ${card.name} onto any empty city square to build it` : undefined}
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
              <div className="mc-actions">
                <button
                  className="btn-buy"
                  disabled={!buyable}
                  onClick={() => onBuyLandmark(card.uid, 'landmark')}
                >
                  Queue
                </button>
                {canDragBuild && <span className="drag-build-label">Drag to build</span>}
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
