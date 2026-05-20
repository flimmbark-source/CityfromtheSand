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
  draggingBuild,
  onPlaceTile,
  onDropBuildCard,
}) {
  const { minRow, maxRow, minCol, maxCol } = gridBoundingBox(cells);
  const pad = 3;
  const displayMinRow = Math.min(minRow - pad, -3);
  const displayMaxRow = Math.max(maxRow + pad, 3);
  const displayMinCol = Math.min(minCol - pad, -3);
  const displayMaxCol = Math.max(maxCol + pad, 3);

  const validSet = new Set(
    validPlacements.map(({ row, col }) => cellKey(row, col))
  );

  function readDragPayload(event) {
    const raw = event.dataTransfer.getData('application/city-sand-card');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function handleDragOver(event, isDropTarget) {
    if (!isDropTarget) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copyMove';
  }

  function handleDrop(event, row, col, isDropTarget) {
    if (!isDropTarget) return;
    event.preventDefault();
    const payload = readDragPayload(event) || draggingBuild;
    if (!payload) return;
    onDropBuildCard?.(payload.cardUid, payload.source, row, col);
  }

  const rows = [];
  for (let r = displayMinRow; r <= displayMaxRow; r++) {
    const cols = [];
    for (let c = displayMinCol; c <= displayMaxCol; c++) {
      const key = cellKey(r, c);
      const cell = cells[key];
      const isValidQueuedPlacement = validSet.has(key) && Boolean(selectedTile);
      const isDropTarget = validSet.has(key) && Boolean(draggingBuild) && !cell;
      const isActiveTarget = isValidQueuedPlacement || isDropTarget;

      cols.push(
        <div
          key={key}
          className={`grid-cell ${cell ? 'grid-cell--occupied' : ''} ${isActiveTarget ? 'grid-cell--valid' : ''} ${isDropTarget ? 'grid-cell--drop-target' : ''}`}
          style={
            cell
              ? {
                  backgroundColor: TILE_COLORS[cell.tileType] || '#888',
                  borderColor: PLAYER_BORDER[cell.ownedBy] || '#aaa',
                }
              : {}
          }
          onClick={() => isValidQueuedPlacement && onPlaceTile(selectedTile.uid, r, c)}
          onDragOver={(event) => handleDragOver(event, isDropTarget)}
          onDrop={(event) => handleDrop(event, r, c, isDropTarget)}
          title={
            cell
              ? `${cell.tileName} (${cell.tileType}) — ${cell.vp} VP — P${cell.ownedBy + 1}`
              : isDropTarget
                ? `Drop ${draggingBuild?.name || 'card'} here to build`
                : isValidQueuedPlacement
                  ? 'Click to place'
                  : 'Empty build square'
          }
        >
          {cell ? (
            <div className="cell-content">
              <span className="cell-emoji">{TILE_EMOJI[cell.tileType]}</span>
              <span className="cell-name">{abbreviate(cell.tileName)}</span>
              <span className="cell-vp">{cell.vp}VP</span>
              <span className={`cell-owner owner-${cell.ownedBy}`}>P{cell.ownedBy + 1}</span>
            </div>
          ) : isDropTarget ? (
            <div className="cell-valid-hint">⬇</div>
          ) : isValidQueuedPlacement ? (
            <div className="cell-valid-hint">+</div>
          ) : null}
        </div>
      );
    }
    rows.push(
      <div key={r} className="grid-row">
        {cols}
      </div>
    );
  }

  return (
    <div className={`city-board ${draggingBuild ? 'city-board--dragging-build' : ''}`}>
      <div className="city-board-title">
        Shared City Grid
        {draggingBuild ? (
          <span className="placement-hint"> — Drop {draggingBuild.name} on any empty square</span>
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
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: '#f0c040' }} />P1
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: '#6aadcc' }} />P2
        </span>
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
