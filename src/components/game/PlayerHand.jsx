import React from 'react';
import { CARD_TYPES } from '../../game/constants.js';

const RES_COLOR = {
  stone: '#a0907a',
  water: '#5a9ec8',
  sand: '#c8b040',
  greenery: '#5aad5a',
};

const RES_EMOJI = {
  stone: '🪨',
  water: '💧',
  sand: '🟡',
  greenery: '🌿',
};

export default function PlayerHand({
  player,
  isActive,
  availableResources,
  selectedTile,
  onSelectTile,
}) {
  const { hand, tilesToPlace } = player;

  const resourceCards = hand.filter((c) => c.cardType === CARD_TYPES.RESOURCE);
  const otherCards = hand.filter((c) => c.cardType !== CARD_TYPES.RESOURCE);

  return (
    <div className={`player-hand ${isActive ? 'player-hand--active' : ''}`}>
      <div className="hand-header">
        <span className="hand-title">{player.name}'s Hand</span>
        <span className="hand-resources">
          Available:{' '}
          {Object.entries(availableResources).map(([res, count]) =>
            count > 0 ? (
              <span key={res} className="res-badge" style={{ background: RES_COLOR[res] }}>
                {RES_EMOJI[res]} {count}
              </span>
            ) : null
          )}
        </span>
      </div>

      <div className="hand-cards">
        {/* Resource cards */}
        {resourceCards.map((card) => (
          <div
            key={card.uid}
            className="hand-card hand-card--resource"
            style={{ borderColor: RES_COLOR[card.resourceType] }}
            title={card.name}
          >
            <span className="hand-card-emoji">{RES_EMOJI[card.resourceType]}</span>
            <span className="hand-card-name">{card.name}</span>
          </div>
        ))}

        {/* Non-resource cards in hand (e.g. basic cards drawn from discard) */}
        {otherCards.map((card) => (
          <div key={card.uid} className="hand-card hand-card--other" title={card.name}>
            <span className="hand-card-name">{card.name}</span>
          </div>
        ))}
      </div>

      {/* Tiles awaiting placement */}
      {tilesToPlace.length > 0 && (
        <div className="tiles-to-place">
          <div className="tiles-label">Tiles to Place:</div>
          <div className="hand-cards">
            {tilesToPlace.map((card) => (
              <div
                key={card.uid}
                className={`hand-card hand-card--tile ${selectedTile?.uid === card.uid ? 'hand-card--selected' : ''}`}
                onClick={() => onSelectTile(selectedTile?.uid === card.uid ? null : card)}
                title={`${card.name} — click to select, then click grid`}
              >
                <span className="hand-card-name">{card.name}</span>
                <span className="hand-card-vp">{card.vp}VP</span>
                <span className="hand-card-type">{card.tileType}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
