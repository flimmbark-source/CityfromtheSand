import React from 'react';
import { gridBoundingBox, cellKey } from '../../game/cityGrid.js';

const TILE_COLORS = {
  building: '#c8a96e',
  road: '#b5a07a',
  garden: '#6aad6a',
  water: '#5a9ec8',
};

const TILE_EMOJI = {
  building: '🏛',
  road: '🛣',
  garden: '🌸',
  water: '💧',
};

const PLAYER_BORDER = ['#f0c040', '#6aadcc'];

export default function CityBoard({
  cells,
  validPlacements,
  selectedTile,
  selectedBuildCard,
  onPlaceTile,
  onBuildCardOnCell,
}) {
  const { minRow, maxRow, minCol, maxCol } = gridBoundingBox(cells);
  const pad = 3;
  const displayMinRow = Math.min(minRow - pad, -3);
  const displayMaxRow = Math.max(maxRow + pad, 3);
  const displayMinCol = Math.min(minCol - pad, -3);
  const displayMaxCol = Math.max(maxCol + pad, 3);

  const validSet = new Set(validPlacements.map(({ row, col }) => cellKey(row, col)));
  const buildMode = Boolean(selectedBuildCard);

  const rows = [];
  for (let r = displayMinRow; r <= displayMaxRow; r++) {
    const cols = [];
    for (let c = displayMinCol; c <= displayMaxCol; c++) {
      const key = cellKey(r, c);
      const cell = cells[key];
      const isEmpty = !cell;
      const canQueuePlace = validSet.has(key) && Boolean(selectedTile) && isEmpty;
      const canBuildHere = validSet.has(key) && buildMode && isEmpty;
      const isTarget = canQueuePlace || canBuildHere;

      function handleClick() {
        if (canBuildHere) {
          onBuildCardOnCell(selectedBuildCard.cardUid, selectedBuildCard.source, r, c);
        } else if (canQueuePlace) {
          onPlaceTile(selectedTile.uid, r, c);
        }
      }

      cols.push(
        <button
          key={key}
          type="button"
          className={`grid-cell ${cell ? 'grid-cell--occupied' : ''} ${isTarget ? 'grid-cell--build-target' : ''}`}
          style={
            cell
              ? {
                  backgroundColor: TILE_COLORS[cell.tileType] || '#888',
                  borderColor: PLAYER_BORDER[cell.ownedBy] || '#aaa',
                }
              : {}
          }
          onClick={handleClick}
          disabled={!isTarget && !cell}
          title={
            cell
              ? `${cell.tileName} (${cell.tileType}) — ${cell.vp} VP — P${cell.ownedBy + 1}`
              : canBuildHere
                ? `Build ${selectedBuildCard.name} here`
                : canQueuePlace
                  ? `Place ${selectedTile.name} here`
                  : 'Empty square'
          }
        >
          {cell ? (
            <div className="cell-content">
              <span className="cell-emoji">{TILE_EMOJI[cell.tileType]}</span>
              <span className="cell-name">{abbreviate(cell.tileName)}</span>
              <span className="cell-vp">{cell.vp}VP</span>
              <span className={`cell-owner owner-${cell.ownedBy}`}>P{cell.ownedBy + 1}</span>
            </div>
          ) : canBuildHere ? (
            <div className="build-target-label">Build</div>
          ) : canQueuePlace ? (
            <div className="cell-valid-hint">+</div>
          ) : null}
        </button>
      );
    }
    rows.push(<div key={r} className="grid-row">{cols}</div>);
  }

  return (
    <div className={`city-board ${buildMode ? 'city-board--build-mode' : ''}`}>
      <div className="city-board-title">
        Shared City Grid
        {buildMode ? (
          <span className="placement-hint"> — Choose where to build {selectedBuildCard.name}</span>
        ) : selectedTile ? (
          <span className="placement-hint"> — Click a highlighted cell to place {selectedTile.name}</span>
        ) : null}
      </div>
      <div className="grid-container">{rows}</div>
      <div className="city-board-legend">
        {Object.entries(TILE_COLORS).map(([type, color]) => (
          <span key={type} className="legend-item">
            <span className="legend-swatch" style={{ background: color }} />
            {type}
          </span>
        ))}
        <span className="legend-item"><span className="legend-swatch" style={{ background: '#f0c040' }} />P1</span>
        <span className="legend-item"><span className="legend-swatch" style={{ background: '#6aadcc' }} />P2</span>
      </div>
    </div>
  );
}

function abbreviate(name) {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length === 1) return name.slice(0, 6);
  return words.map((w) => w[0]).join('');
}
