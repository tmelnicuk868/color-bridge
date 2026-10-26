import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {generateLevel} from './src/game/levelGen';
import {scoreRound, type RoundOutcome} from './src/game/scoring';
import {dailySeed} from './src/utils/rng';
import {theme} from './src/constants/theme';
import {useProgress} from './src/hooks/useProgress';
import type {FinishPayload} from './src/hooks/useBridgeGame';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';

type Screen = 'loader' | 'menu' | 'game' | 'result';

/** State machine only — no gameplay lives here. */
function App() {
  const [screen, setScreen] = useState<Screen>('loader');
  const [daily, setDaily] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const [outcome, setOutcome] = useState<RoundOutcome | null>(null);
  const {progress, applyOutcome} = useProgress();

  const level = useMemo(
    () =>
      daily
        ? generateLevel(progress.level, true, dailySeed())
        : generateLevel(progress.level, false),
    [daily, progress.level],
  );

  const toMenu = useCallback(() => {
    setDaily(false);
    setScreen('menu');
  }, []);

  const startRound = useCallback((isDaily: boolean) => {
    setDaily(isDaily);
    setRoundKey(k => k + 1);
    setScreen('game');
  }, []);

  const onBuild = useCallback(() => startRound(false), [startRound]);
  const onDaily = useCallback(() => startRound(true), [startRound]);
  const onAgain = useCallback(() => startRound(false), [startRound]);

  const onGameOver = useCallback(
    (payload: FinishPayload) => {
      const result = scoreRound({
        won: payload.won,
        assisted: payload.assisted,
        usedUndo: payload.usedUndo,
        bridgesPlaced: payload.bridgesPlaced,
        colorsUsed: payload.colorsUsed,
        colorsTotal: payload.colorsTotal,
        level: level.index,
        daily: level.daily,
      });
      setOutcome(result);
      applyOutcome(result);
      setScreen('result');
    },
    [applyOutcome, level],
  );

  return (
    <View style={styles.root}>
      {screen === 'loader' ? <LoaderScreen onDone={toMenu} /> : null}

      {screen === 'menu' ? (
        <MenuScreen
          progress={progress}
          level={level}
          onBuild={onBuild}
          onDaily={onDaily}
        />
      ) : null}

      {screen === 'game' ? (
        <GameScreen
          key={roundKey}
          level={level}
          onGameOver={onGameOver}
          onMenu={toMenu}
        />
      ) : null}

      {screen === 'result' && outcome ? (
        <GameOverScreen
          outcome={outcome}
          balance={progress.balance}
          nextLevel={progress.level}
          onPlayAgain={onAgain}
          onMenu={toMenu}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
});

export default App;
