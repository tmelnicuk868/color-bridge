import {useCallback, useState} from 'react';
import {
  MAX_LEVEL,
  START_BALANCE,
  START_BEST,
  START_STREAK,
} from '../constants/config';
import type {RoundOutcome} from '../game/scoring';

export type Progress = {
  level: number;
  streak: number;
  best: number;
  balance: number;
};

const INITIAL: Progress = {
  level: 3,
  streak: START_STREAK,
  best: START_BEST,
  balance: START_BALANCE,
};

/** Session progression. Kept in memory — no extra native storage dependency. */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(INITIAL);

  const applyOutcome = useCallback((outcome: RoundOutcome) => {
    setProgress(prev => {
      const won = outcome.won;
      const nextLevel = won && !outcome.daily
        ? Math.min(MAX_LEVEL, prev.level + 1)
        : prev.level;
      const streak = won ? prev.streak + 1 : 0;
      return {
        level: nextLevel,
        streak,
        best: Math.max(prev.best, streak),
        balance: prev.balance + outcome.payout,
      };
    });
  }, []);

  return {progress, applyOutcome};
}
