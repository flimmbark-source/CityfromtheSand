// City grid helpers — pure functions, no state mutation.
// Grid coordinates: { row, col } where row increases downward.
// Cells keyed as "row,col".

export const cellKey = (row, col) => `${row},${col}`;

export const parseKey = (key) => {
  const [r, c] = key.split(',').map(Number);
  return { row: r, col: c };
};

const ORTHOGONAL_DELTAS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function getNeighborKeys(row, col) {
  return ORTHOGONAL_DELTAS.map(([dr, dc]) => cellKey(row + dr, col + dc));
}

export function getNeighborCells(cells, row, col) {
  return getNeighborKeys(row, col)
    .filter((k) => cells[k])
    .map((k) => cells[k]);
}

// Digital prototype rule: a purchased tile can be built on any empty visible map cell.
// This intentionally removes the tabletop-style adjacency restriction so the app can
// support direct drag-from-market placement anywhere on the board.
export function canPlaceTileAt(cells, row, col) {
  return !cells[cellKey(row, col)];
}

// Returns all empty cells inside the current visible board window.
// The window expands with the city but starts as a useful 7×7 buildable map.
export function validPlacementCells(cells) {
  const { minRow, maxRow, minCol, maxCol } = gridBoundingBox(cells);
  const pad = 3;
  const displayMinRow = Math.min(minRow - pad, -3);
  const displayMaxRow = Math.max(maxRow + pad, 3);
  const displayMinCol = Math.min(minCol - pad, -3);
  const displayMaxCol = Math.max(maxCol + pad, 3);

  const result = [];
  for (let row = displayMinRow; row <= displayMaxRow; row++) {
    for (let col = displayMinCol; col <= displayMaxCol; col++) {
      if (!cells[cellKey(row, col)]) result.push({ row, col });
    }
  }
  return result;
}

// A tile is "on edge" if at least one orthogonal neighbor is empty (no tile).
export function isOnEdge(cells, row, col) {
  return getNeighborKeys(row, col).some((k) => !cells[k]);
}

// Count orthogonally adjacent tiles matching a given tile type.
export function countNearbyOfType(cells, row, col, tileType) {
  return getNeighborCells(cells, row, col).filter(
    (c) => c.tileType === tileType
  ).length;
}

// Count ALL orthogonally adjacent tiles (any type).
export function countNearbyAny(cells, row, col) {
  return getNeighborCells(cells, row, col).length;
}

// BFS to count all connected tiles of the same type (including the origin tile).
export function countLinkedOfType(cells, row, col, tileType) {
  const origin = cells[cellKey(row, col)];
  if (!origin || origin.tileType !== tileType) return 0;

  const visited = new Set();
  const queue = [cellKey(row, col)];
  visited.add(cellKey(row, col));

  while (queue.length) {
    const key = queue.shift();
    const { row: r, col: c } = parseKey(key);
    for (const nk of getNeighborKeys(r, c)) {
      if (!visited.has(nk) && cells[nk] && cells[nk].tileType === tileType) {
        visited.add(nk);
        queue.push(nk);
      }
    }
  }
  return visited.size;
}

// Compute bounding box of all placed tiles (rows and cols min/max).
export function gridBoundingBox(cells) {
  const keys = Object.keys(cells);
  if (keys.length === 0) return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };

  let minRow = Infinity, maxRow = -Infinity;
  let minCol = Infinity, maxCol = -Infinity;

  for (const k of keys) {
    const { row, col } = parseKey(k);
    minRow = Math.min(minRow, row);
    maxRow = Math.max(maxRow, row);
    minCol = Math.min(minCol, col);
    maxCol = Math.max(maxCol, col);
  }
  return { minRow, maxRow, minCol, maxCol };
}
