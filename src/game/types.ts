import type {BridgeColorId} from '../constants/theme';

export type ColorId = BridgeColorId;

export type Island = {
  id: number;
  col: number;
  row: number;
  /** Bridge ends this island must receive to be satisfied. */
  need: number;
  /** Segment colours this island accepts. */
  allowed: ColorId[];
};

export type Bridge = {
  a: number;
  b: number;
  color: ColorId;
};

export type Stock = Record<ColorId, number>;

export type Level = {
  index: number;
  seed: number;
  daily: boolean;
  islands: Island[];
  stock: Stock;
  /** The generator's own solution — drives the assisted finish and the mini-map. */
  solution: Bridge[];
};

export type IllegalReason =
  | 'cross'
  | 'empty'
  | 'color'
  | 'line'
  | 'blocked'
  | 'full'
  | 'max';

export const ILLEGAL_TEXT: Record<IllegalReason, string> = {
  cross: 'BRIDGES CANNOT CROSS',
  empty: 'NO SEGMENTS LEFT',
  color: 'WRONG COLOUR HERE',
  line: 'PICK A STRAIGHT LINE',
  blocked: 'AN ISLAND IS IN THE WAY',
  full: 'THAT ISLAND IS FULL',
  max: 'ONLY TWO BRIDGES PER PAIR',
};
