import {DAILY_PAYOUT, LEVEL_PAYOUT} from '../constants/config';

export type RoundOutcome = {
  won: boolean;
  assisted: boolean;
  usedUndo: boolean;
  bridgesPlaced: number;
  colorsUsed: number;
  colorsTotal: number;
  level: number;
  daily: boolean;
  score: number;
  stars: number;
  payout: number;
};

export function scoreRound(input: {
  won: boolean;
  assisted: boolean;
  usedUndo: boolean;
  bridgesPlaced: number;
  colorsUsed: number;
  colorsTotal: number;
  level: number;
  daily: boolean;
}): RoundOutcome {
  const base = input.won ? 100 * input.level : 20 * input.level;
  const perBridge = 10 * input.bridgesPlaced;
  const cleanBonus = input.won && !input.usedUndo && !input.assisted ? 80 : 0;
  const score = base + perBridge + cleanBonus;

  let stars = 0;
  if (input.won) {
    stars = input.assisted ? 1 : input.usedUndo ? 2 : 3;
  }

  const payout = !input.won
    ? 0
    : input.daily
    ? DAILY_PAYOUT
    : LEVEL_PAYOUT * input.level;

  return {...input, score, stars, payout};
}
