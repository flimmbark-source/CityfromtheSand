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

// A tile can be placed at (row,col) if:
//   - the cell is empty, AND
//   - the grid is empty (first tile) OR at least one orthogonal neighbor is occupied.
export function canPlaceTileAt(cells, row, col) {
  if (cells[cellKey(row, col)]) return false; // occupied
  if (Object.keys(cells).length === 0) return true; // first tile
  return getNeighborKeys(row, col).some((k) => Boolean(cells[k]));
}

// Returns array of all valid empty cells adjacent to existing tiles.
export function validPlacementCells(cells) {
  if (Object.keys(cells).length === 0) {
    return [{ row: 0, col: 0 }];
  }
  const candidates = new Set();
  for (const key of Object.keys(cells)) {
    const { row, col } = parseKey(key);
    for (const [dr, dc] of ORTHOGONAL_DELTAS) {
      const nk = cellKey(row + dr, col + dc);
      if (!cells[nk]) candidates.add(nk);
    }
  }
  return [...candidates].map(parseKey);
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
