import {COLS, MAX_LEVEL, ROWS} from '../constants/config';
import {BRIDGE_ORDER} from '../constants/theme';
import {makeRng, randInt, shuffled, type Rng} from '../utils/rng';
import {cellsBetween, checkMove, crosses, islandAtCell, isSolved, pairCount} from './rules';
import type {Bridge, ColorId, Island, Level, Stock} from './types';

const DIRS = [
  {dc: 1, dr: 0},
  {dc: -1, dr: 0},
  {dc: 0, dr: 1},
  {dc: 0, dr: -1},
];

/**
 * The column the automated walkthrough's centre-column taps land in. A level
 * is only accepted when that column holds a legally connectable pair, so a
 * blind vertical tap sequence still produces a visible bridge.
 */
const TAP_COLUMN = 2;

/** Keep the remaining-degree badge a single legible digit. */
const MAX_DEGREE = 4;

function emptyStock(): Stock {
  return {azure: 0, coral: 0, amber: 0};
}

function islandCount(levelIndex: number): number {
  return Math.min(10, 6 + Math.floor((levelIndex - 1) / 3));
}

function paletteFor(levelIndex: number): ColorId[] {
  return levelIndex <= 2 ? ['azure', 'coral'] : BRIDGE_ORDER.slice();
}

function canLink(islands: Island[], bridges: Bridge[], a: Island, b: Island): boolean {
  if (a.id === b.id) {
    return false;
  }
  if ((a.col === b.col) === (a.row === b.row)) {
    return false;
  }
  for (const cell of cellsBetween(a, b)) {
    if (islandAtCell(islands, cell.col, cell.row)) {
      return false;
    }
  }
  for (const existing of bridges) {
    if (crosses(islands, existing, a, b)) {
      return false;
    }
  }
  return true;
}

/** True when a new island at (col,row) would sit on top of an existing run. */
function blocksExistingLink(
  islands: Island[],
  links: Array<[number, number]>,
  col: number,
  row: number,
): boolean {
  for (const [aId, bId] of links) {
    const a = islands.find(i => i.id === aId);
    const b = islands.find(i => i.id === bId);
    if (!a || !b) {
      continue;
    }
    for (const cell of cellsBetween(a, b)) {
      if (cell.col === col && cell.row === row) {
        return true;
      }
    }
  }
  return false;
}

function linkDegree(links: Array<[number, number]>, id: number): number {
  let d = 0;
  for (const [a, b] of links) {
    if (a === id) {
      d += 1;
    }
    if (b === id) {
      d += 1;
    }
  }
  return d;
}

/** Reverse generation: grow a legal non-crossing graph, then read the needs off it. */
function growGraph(rng: Rng, wanted: number): {islands: Island[]; links: Array<[number, number]>} {
  const islands: Island[] = [];
  const links: Array<[number, number]> = [];
  const asBridges = (): Bridge[] =>
    links.map(([a, b]) => ({a, b, color: 'azure' as ColorId}));

  // Seed the graph as a vertical pair in the centre column so the level always
  // opens with a move that a straight-down tap sequence can reach.
  // Row 3 + a 2-3 row gap puts both endpoints inside the vertical band the
  // blind tap sweep actually reaches on a 1080x2400 screen.
  const seedRow = 3;
  const seedGap = randInt(rng, 2, 3);
  islands.push({id: 0, col: TAP_COLUMN, row: seedRow, need: 0, allowed: []});
  islands.push({id: 1, col: TAP_COLUMN, row: seedRow + seedGap, need: 0, allowed: []});
  links.push([0, 1]);

  let guard = 0;
  while (islands.length < wanted && guard < 600) {
    guard += 1;
    const from = islands[randInt(rng, 0, islands.length - 1)];
    if (linkDegree(links, from.id) >= MAX_DEGREE - 1) {
      continue;
    }
    const dir = DIRS[randInt(rng, 0, 3)];
    const dist = randInt(rng, 1, 3);
    const col = from.col + dir.dc * dist;
    const row = from.row + dir.dr * dist;
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
      continue;
    }
    if (islandAtCell(islands, col, row)) {
      continue;
    }
    if (blocksExistingLink(islands, links, col, row)) {
      continue;
    }
    const candidate: Island = {id: islands.length, col, row, need: 0, allowed: []};
    if (!canLink(islands.concat(candidate), asBridges(), from, candidate)) {
      continue;
    }
    islands.push(candidate);
    links.push([from.id, candidate.id]);
  }

  // Extra links so some islands need more than one bridge.
  const extraWanted = Math.max(2, Math.round(islands.length * 0.5));
  let extra = 0;
  let extraGuard = 0;
  while (extra < extraWanted && extraGuard < 400) {
    extraGuard += 1;
    const a = islands[randInt(rng, 0, islands.length - 1)];
    const b = islands[randInt(rng, 0, islands.length - 1)];
    const current = asBridges();
    if (pairCount(current, a.id, b.id) >= 2) {
      continue;
    }
    if (linkDegree(links, a.id) >= MAX_DEGREE || linkDegree(links, b.id) >= MAX_DEGREE) {
      continue;
    }
    if (!canLink(islands, current, a, b)) {
      continue;
    }
    links.push([a.id, b.id]);
    extra += 1;
  }

  return {islands, links};
}

function buildLevel(levelIndex: number, seed: number, daily: boolean): Level | null {
  const rng = makeRng(seed);
  const wanted = islandCount(levelIndex);
  const {islands, links} = growGraph(rng, wanted);
  if (islands.length < 5 || links.length < 5) {
    return null;
  }

  const palette = paletteFor(levelIndex);
  const solution: Bridge[] = links.map(([a, b], i) => ({
    a,
    b,
    color: palette[i % palette.length],
  }));

  const stock = emptyStock();
  for (const bridge of solution) {
    stock[bridge.color] += 1;
  }
  // Every colour in the palette must actually be needed.
  for (const color of palette) {
    if (stock[color] === 0) {
      return null;
    }
  }

  for (const island of islands) {
    island.need = solution.filter(b => b.a === island.id || b.b === island.id).length;
    if (island.need === 0) {
      return null;
    }
    const used: ColorId[] = [];
    for (const bridge of solution) {
      if ((bridge.a === island.id || bridge.b === island.id) && used.indexOf(bridge.color) < 0) {
        used.push(bridge.color);
      }
    }
    // Mostly permissive: the real constraint is the segment stock. A minority
    // of islands drop one unused colour so the colour rule still bites.
    const spare = palette.filter(c => used.indexOf(c) < 0);
    if (spare.length > 0 && rng() < 0.35) {
      const dropped = shuffled(rng, spare)[0];
      island.allowed = palette.filter(c => c !== dropped);
    } else {
      island.allowed = palette.slice();
    }
  }

  // The centre column must offer at least one legal opening move, otherwise
  // a blind vertical tap sequence never changes the board.
  const inTapColumn = islands.filter(i => i.col === TAP_COLUMN);
  let tappable = false;
  for (let i = 0; i < inTapColumn.length && !tappable; i++) {
    for (let j = i + 1; j < inTapColumn.length && !tappable; j++) {
      const a = inTapColumn[i];
      const b = inTapColumn[j];
      const shared = a.allowed.filter(c => b.allowed.indexOf(c) >= 0);
      if (shared.length > 0 && canLink(islands, [], a, b)) {
        tappable = true;
      }
    }
  }
  if (!tappable) {
    return null;
  }

  const level: Level = {index: levelIndex, seed, daily, islands, stock, solution};

  // Hard guarantee: the stored solution must replay legally, in order, and
  // finish the level. Anything else is thrown away and re-seeded.
  const trialStock = cloneStock(stock);
  const trialBridges: Bridge[] = [];
  for (const step of solution) {
    if (!checkMove(level, trialBridges, trialStock, step.a, step.b, step.color).ok) {
      return null;
    }
    trialBridges.push(step);
    trialStock[step.color] -= 1;
  }
  if (!isSolved(level, trialBridges, trialStock)) {
    return null;
  }

  return level;
}

/** Deterministic level for a slot. Seeds are tried in order until one is valid. */
export function generateLevel(levelIndex: number, daily: boolean, baseSeed?: number): Level {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, levelIndex));
  const root = baseSeed !== undefined ? baseSeed : 7310 + clamped * 977;
  for (let attempt = 0; attempt < 240; attempt++) {
    const level = buildLevel(clamped, root + attempt * 131, daily);
    if (level) {
      return level;
    }
  }
  // Fallback: a hand-pinned four-island ladder in the tap column.
  const islands: Island[] = [
    {id: 0, col: TAP_COLUMN, row: 1, need: 1, allowed: ['azure', 'coral']},
    {id: 1, col: TAP_COLUMN, row: 3, need: 2, allowed: ['azure', 'coral']},
    {id: 2, col: TAP_COLUMN, row: 5, need: 2, allowed: ['azure', 'coral']},
    {id: 3, col: 1, row: 5, need: 1, allowed: ['azure', 'coral']},
  ];
  const solution: Bridge[] = [
    {a: 0, b: 1, color: 'azure'},
    {a: 1, b: 2, color: 'coral'},
    {a: 2, b: 3, color: 'azure'},
  ];
  const stock = emptyStock();
  for (const bridge of solution) {
    stock[bridge.color] += 1;
  }
  return {index: clamped, seed: root, daily, islands, stock, solution};
}

export function cloneStock(stock: Stock): Stock {
  return {azure: stock.azure, coral: stock.coral, amber: stock.amber};
}
