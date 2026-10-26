import {BRIDGE_ORDER} from '../constants/theme';
import type {Bridge, ColorId, IllegalReason, Island, Level, Stock} from './types';

export type MoveCheck = {ok: true} | {ok: false; reason: IllegalReason};

export function findIsland(islands: Island[], id: number): Island | undefined {
  return islands.find(i => i.id === id);
}

export function islandAtCell(islands: Island[], col: number, row: number): Island | undefined {
  return islands.find(i => i.col === col && i.row === row);
}

/** Bridge ends already attached to an island. */
export function degree(bridges: Bridge[], id: number): number {
  let d = 0;
  for (const b of bridges) {
    if (b.a === id || b.b === id) {
      d += 1;
    }
  }
  return d;
}

export function remainingNeed(island: Island, bridges: Bridge[]): number {
  return Math.max(0, island.need - degree(bridges, island.id));
}

export function isSatisfied(island: Island, bridges: Bridge[]): boolean {
  return remainingNeed(island, bridges) === 0;
}

export function pairCount(bridges: Bridge[], a: number, b: number): number {
  let n = 0;
  for (const br of bridges) {
    if ((br.a === a && br.b === b) || (br.a === b && br.b === a)) {
      n += 1;
    }
  }
  return n;
}

export function sameLine(a: Island, b: Island): boolean {
  return (a.col === b.col) !== (a.row === b.row);
}

/** Lattice cells strictly between two aligned islands. */
export function cellsBetween(a: Island, b: Island): Array<{col: number; row: number}> {
  const out: Array<{col: number; row: number}> = [];
  if (a.row === b.row) {
    const lo = Math.min(a.col, b.col);
    const hi = Math.max(a.col, b.col);
    for (let c = lo + 1; c < hi; c++) {
      out.push({col: c, row: a.row});
    }
  } else if (a.col === b.col) {
    const lo = Math.min(a.row, b.row);
    const hi = Math.max(a.row, b.row);
    for (let r = lo + 1; r < hi; r++) {
      out.push({col: a.col, row: r});
    }
  }
  return out;
}

function span(a: Island, b: Island) {
  return {
    horizontal: a.row === b.row,
    row: a.row,
    col: a.col,
    minCol: Math.min(a.col, b.col),
    maxCol: Math.max(a.col, b.col),
    minRow: Math.min(a.row, b.row),
    maxRow: Math.max(a.row, b.row),
  };
}

/** True when the straight run a-b geometrically crosses the existing bridge. */
export function crosses(
  islands: Island[],
  existing: Bridge,
  a: Island,
  b: Island,
): boolean {
  const ea = findIsland(islands, existing.a);
  const eb = findIsland(islands, existing.b);
  if (!ea || !eb) {
    return false;
  }
  const s1 = span(a, b);
  const s2 = span(ea, eb);
  if (s1.horizontal === s2.horizontal) {
    return false; // parallel runs never cross on a lattice
  }
  const h = s1.horizontal ? s1 : s2;
  const v = s1.horizontal ? s2 : s1;
  return (
    v.col > h.minCol &&
    v.col < h.maxCol &&
    h.row > v.minRow &&
    h.row < v.maxRow
  );
}

export function checkMove(
  level: Level,
  bridges: Bridge[],
  stock: Stock,
  aId: number,
  bId: number,
  color: ColorId,
): MoveCheck {
  const a = findIsland(level.islands, aId);
  const b = findIsland(level.islands, bId);
  if (!a || !b || a.id === b.id) {
    return {ok: false, reason: 'line'};
  }
  if (!sameLine(a, b)) {
    return {ok: false, reason: 'line'};
  }
  if (stock[color] <= 0) {
    return {ok: false, reason: 'empty'};
  }
  if (a.allowed.indexOf(color) < 0 || b.allowed.indexOf(color) < 0) {
    return {ok: false, reason: 'color'};
  }
  if (isSatisfied(a, bridges) || isSatisfied(b, bridges)) {
    return {ok: false, reason: 'full'};
  }
  if (pairCount(bridges, aId, bId) >= 2) {
    return {ok: false, reason: 'max'};
  }
  for (const cell of cellsBetween(a, b)) {
    if (islandAtCell(level.islands, cell.col, cell.row)) {
      return {ok: false, reason: 'blocked'};
    }
  }
  for (const existing of bridges) {
    if (crosses(level.islands, existing, a, b)) {
      return {ok: false, reason: 'cross'};
    }
  }
  return {ok: true};
}

export function isSolved(level: Level, bridges: Bridge[], stock: Stock): boolean {
  for (const island of level.islands) {
    if (remainingNeed(island, bridges) > 0) {
      return false;
    }
  }
  for (const key of BRIDGE_ORDER) {
    if (stock[key] > 0) {
      return false;
    }
  }
  return true;
}

/** Any legal placement left, in any colour that still has stock. */
export function hasLegalMove(level: Level, bridges: Bridge[], stock: Stock): boolean {
  const open = level.islands.filter(i => remainingNeed(i, bridges) > 0);
  for (let i = 0; i < open.length; i++) {
    for (let j = i + 1; j < open.length; j++) {
      for (const color of BRIDGE_ORDER) {
        if (stock[color] <= 0) {
          continue;
        }
        const res = checkMove(level, bridges, stock, open[i].id, open[j].id, color);
        if (res.ok) {
          return true;
        }
      }
    }
  }
  return false;
}

/** Islands reachable from `fromId` with the active colour — drives the guide lines. */
export function legalTargets(
  level: Level,
  bridges: Bridge[],
  stock: Stock,
  fromId: number,
  color: ColorId,
): number[] {
  const out: number[] = [];
  for (const island of level.islands) {
    if (island.id === fromId) {
      continue;
    }
    if (checkMove(level, bridges, stock, fromId, island.id, color).ok) {
      out.push(island.id);
    }
  }
  return out;
}

/** The next solution bridge that is not placed yet (assisted finish). */
export function nextSolutionBridge(level: Level, bridges: Bridge[]): Bridge | null {
  const placed = bridges.slice();
  for (const sol of level.solution) {
    const have = pairCount(placed, sol.a, sol.b);
    const want = level.solution.filter(
      s => (s.a === sol.a && s.b === sol.b) || (s.a === sol.b && s.b === sol.a),
    ).length;
    if (have < want) {
      return sol;
    }
  }
  return null;
}
