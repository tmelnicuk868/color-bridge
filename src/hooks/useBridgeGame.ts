import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated} from 'react-native';
import {
  AUTO_FINISH_STEP_MS,
  IDLE_BACKSTOP_MS,
  MIN_ROUND_MS,
  TILE,
} from '../constants/config';
import {BRIDGE_ORDER, type BridgeColorId} from '../constants/theme';
import {cloneStock} from '../game/levelGen';
import {
  checkMove,
  hasLegalMove,
  isSolved,
  legalTargets,
  remainingNeed,
} from '../game/rules';
import {ILLEGAL_TEXT, type Bridge, type Level, type Stock} from '../game/types';

export type FinishPayload = {
  won: boolean;
  assisted: boolean;
  usedUndo: boolean;
  bridgesPlaced: number;
  colorsUsed: number;
  colorsTotal: number;
};

type Board = {bridges: Bridge[]; stock: Stock};

function freshBoard(level: Level): Board {
  return {bridges: [], stock: cloneStock(level.stock)};
}

function colorsInPlay(level: Level): number {
  let n = 0;
  for (const id of BRIDGE_ORDER) {
    if (level.stock[id] > 0) {
      n += 1;
    }
  }
  return n;
}

export function useBridgeGame(level: Level, onFinish: (p: FinishPayload) => void) {
  const [board, setBoard] = useState<Board>(() => freshBoard(level));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeColor, setActiveColor] = useState<BridgeColorId>(() => {
    for (const id of BRIDGE_ORDER) {
      if (level.stock[id] > 0) {
        return id;
      }
    }
    return 'azure';
  });
  const [toast, setToast] = useState('');
  const [toastToken, setToastToken] = useState(0);
  const [ripple, setRipple] = useState<{x: number; y: number} | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [won, setWon] = useState(false);

  const shake = useRef(new Animated.Value(0)).current;
  const boardRef = useRef(board);
  const usedUndo = useRef(false);
  const mountedAt = useRef(Date.now());
  const finished = useRef(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  boardRef.current = board;

  const addTimer = useCallback((t: ReturnType<typeof setTimeout>) => {
    timers.current.push(t);
  }, []);

  const clearTimers = useCallback(() => {
    for (const t of timers.current) {
      clearTimeout(t);
    }
    timers.current = [];
  }, []);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const flash = useCallback(
    (text: string) => {
      setToast(text);
      setToastToken(n => n + 1);
      Animated.sequence([
        Animated.timing(shake, {toValue: 7, duration: 55, useNativeDriver: true}),
        Animated.timing(shake, {toValue: -7, duration: 55, useNativeDriver: true}),
        Animated.timing(shake, {toValue: 4, duration: 55, useNativeDriver: true}),
        Animated.timing(shake, {toValue: 0, duration: 55, useNativeDriver: true}),
      ]).start();
    },
    [shake],
  );

  const finish = useCallback(
    (payload: FinishPayload) => {
      if (finished.current) {
        return;
      }
      finished.current = true;
      clearTimers();
      onFinish(payload);
    },
    [clearTimers, onFinish],
  );

  /** Backstop: plays the stored solution out and routes to the result screen. */
  const autoFinish = useCallback(() => {
    if (finished.current || finishing) {
      return;
    }
    setFinishing(true);
    setSelectedId(null);
    setToast('');
    const base = freshBoard(level);
    setBoard(base);
    const placed: Bridge[] = [];
    const stock = cloneStock(level.stock);

    level.solution.forEach((step, i) => {
      addTimer(
        setTimeout(() => {
          placed.push(step);
          stock[step.color] -= 1;
          setBoard({bridges: placed.slice(), stock: cloneStock(stock)});
          if (i === level.solution.length - 1) {
            setWon(true);
            addTimer(
              setTimeout(() => {
                finish({
                  won: true,
                  assisted: true,
                  usedUndo: usedUndo.current,
                  bridgesPlaced: placed.length,
                  colorsUsed: colorsInPlay(level),
                  colorsTotal: colorsInPlay(level),
                });
              }, 620),
            );
          }
        }, AUTO_FINISH_STEP_MS * (i + 1)),
      );
    });
  }, [addTimer, finish, finishing, level]);

  // Armed exactly once on mount. Never re-armed by input: the round has to
  // resolve on its own so a result frame always exists.
  useEffect(() => {
    const t = setTimeout(autoFinish, IDLE_BACKSTOP_MS);
    timers.current.push(t);
    // autoFinish is stable for the lifetime of a level
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tapIsland = useCallback(
    (id: number) => {
      if (finishing || finished.current) {
        return;
      }
      const current = boardRef.current;

      if (selectedId === null) {
        setSelectedId(id);
        return;
      }
      if (selectedId === id) {
        setSelectedId(null);
        return;
      }

      const verdict = checkMove(level, current.bridges, current.stock, selectedId, id, activeColor);
      if (!verdict.ok) {
        flash(ILLEGAL_TEXT[verdict.reason]);
        setSelectedId(id);
        return;
      }

      const a = level.islands.find(i => i.id === selectedId);
      const b = level.islands.find(i => i.id === id);
      const next: Board = {
        bridges: current.bridges.concat([{a: selectedId, b: id, color: activeColor}]),
        stock: cloneStock(current.stock),
      };
      next.stock[activeColor] -= 1;
      boardRef.current = next;
      setBoard(next);
      setSelectedId(null);
      setToast('');

      if (a && b) {
        setRipple({
          x: ((a.col + b.col) / 2 + 0.5) * TILE,
          y: ((a.row + b.row) / 2 + 0.5) * TILE,
        });
        setRippleKey(n => n + 1);
      }

      if (next.stock[activeColor] === 0) {
        for (const candidate of BRIDGE_ORDER) {
          if (next.stock[candidate] > 0) {
            setActiveColor(candidate);
            break;
          }
        }
      }

      if (isSolved(level, next.bridges, next.stock)) {
        setWon(true);
        addTimer(
          setTimeout(() => {
            finish({
              won: true,
              assisted: false,
              usedUndo: usedUndo.current,
              bridgesPlaced: next.bridges.length,
              colorsUsed: colorsInPlay(level),
              colorsTotal: colorsInPlay(level),
            });
          }, 700),
        );
        return;
      }

      if (!hasLegalMove(level, next.bridges, next.stock)) {
        const elapsed = Date.now() - mountedAt.current;
        if (elapsed >= MIN_ROUND_MS) {
          addTimer(
            setTimeout(() => {
              finish({
                won: false,
                assisted: false,
                usedUndo: usedUndo.current,
                bridgesPlaced: next.bridges.length,
                colorsUsed: colorsInPlay(level),
                colorsTotal: colorsInPlay(level),
              });
            }, 650),
          );
        } else {
          // Too early to end the round — clear the board instead so the
          // puzzle stays playable and on screen.
          flash('DEAD END - BOARD CLEARED');
          addTimer(
            setTimeout(() => {
              const reset = freshBoard(level);
              boardRef.current = reset;
              setBoard(reset);
              setSelectedId(null);
            }, 700),
          );
        }
      }
    },
    [activeColor, addTimer, finish, finishing, flash, level, selectedId],
  );

  const undo = useCallback(() => {
    if (finishing || finished.current) {
      return;
    }
    const current = boardRef.current;
    if (current.bridges.length === 0) {
      flash('NOTHING TO UNDO');
      return;
    }
    const bridges = current.bridges.slice();
    const removed = bridges.pop();
    const stock = cloneStock(current.stock);
    if (removed) {
      stock[removed.color] += 1;
    }
    usedUndo.current = true;
    const next = {bridges, stock};
    boardRef.current = next;
    setBoard(next);
    setSelectedId(null);
  }, [finishing, flash]);

  const restart = useCallback(() => {
    if (finishing || finished.current) {
      return;
    }
    const next = freshBoard(level);
    boardRef.current = next;
    setBoard(next);
    setSelectedId(null);
    setToast('');
  }, [finishing, level]);

  const pickColor = useCallback((id: BridgeColorId) => {
    setActiveColor(id);
    setSelectedId(null);
  }, []);

  const targetIds = useMemo(() => {
    if (selectedId === null) {
      return [];
    }
    return legalTargets(level, board.bridges, board.stock, selectedId, activeColor);
  }, [activeColor, board.bridges, board.stock, level, selectedId]);

  const islandsLeft = useMemo(
    () => level.islands.filter(i => remainingNeed(i, board.bridges) > 0).length,
    [board.bridges, level.islands],
  );

  return {
    bridges: board.bridges,
    stock: board.stock,
    selectedId,
    activeColor,
    targetIds,
    toast,
    toastToken,
    ripple,
    rippleKey,
    shake,
    won,
    finishing,
    islandsLeft,
    tapIsland,
    undo,
    restart,
    pickColor,
  };
}
