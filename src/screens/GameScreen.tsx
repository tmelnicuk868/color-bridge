import React, {useCallback, useEffect} from 'react';
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  BackHandler,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ChevronLeft, RotateCcw, Star, Undo2} from 'lucide-react-native';
import {bgGame} from '../assets';
import {
  CONTROL_BAR_BOTTOM,
  CONTROL_BAR_H,
  GAME_AREA_BOTTOM_INSET,
} from '../constants/config';
import {BRIDGE_LABEL, BRIDGE_ORDER, theme} from '../constants/theme';
import type {Level} from '../game/types';
import BridgeBoard from '../components/BridgeBoard';
import ColorChip from '../components/ColorChip';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import Toast from '../components/Toast';
import {useBridgeGame, type FinishPayload} from '../hooks/useBridgeGame';

const ACTION_W = 166;
const TOAST_SLOT_H = 34;

type Props = {
  level: Level;
  onGameOver: (payload: FinishPayload) => void;
  onMenu: () => void;
};

/** G2 Floating Controls: board centred, every control in one floating bar. */
function GameScreen({level, onGameOver, onMenu}: Props) {
  const game = useBridgeGame(level, onGameOver);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onMenu();
      return true;
    });
    return () => sub.remove();
  }, [onMenu]);

  const segmentsLeft =
    game.stock.azure + game.stock.coral + game.stock.amber;
  const score = game.bridges.length * 10 + level.index * 100;

  const back = useCallback(() => onMenu(), [onMenu]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.bgMid} />
      <LinearGradient
        colors={theme.gradients.game}
        locations={theme.gradients.gameStops}
        style={StyleSheet.absoluteFill}
      />
      <Image source={bgGame} style={styles.bgImage} resizeMode="cover" />

      <ScreenHeader
        surface
        title={level.daily ? 'DAILY BOARD' : 'LEVEL ' + String(level.index)}
        subtitle={'SEGMENTS ' + String(segmentsLeft) + ' LEFT'}
        leftSlot={
          <Pressable
            onPress={back}
            accessibilityRole="button"
            accessibilityLabel="back to menu"
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            style={styles.backBtn}>
            <ChevronLeft size={24} color={theme.colors.text} strokeWidth={2.4} />
          </Pressable>
        }
        rightSlot={
          <View style={styles.scorePill}>
            <Star size={16} color={theme.colors.amber} strokeWidth={2.4} fill={theme.colors.amber} />
            <Text style={styles.scoreText}>{String(score)}</Text>
          </View>
        }
      />

      <View style={styles.area}>
        <View style={styles.toastSlot}>
          <Toast text={game.toast} token={game.toastToken} />
        </View>

        <BridgeBoard
          level={level}
          bridges={game.bridges}
          selectedId={game.selectedId}
          targetIds={game.targetIds}
          activeColor={game.activeColor}
          shake={game.shake}
          won={game.won}
          rippleKey={game.rippleKey}
          rippleAt={game.ripple}
          onIslandPress={game.tapIsland}
        />

        <View style={styles.statusStrip}>
          <Text style={styles.statusText}>
            {game.selectedId === null
              ? 'TAP TWO ISLANDS IN A STRAIGHT LINE'
              : 'NOW TAP THE ISLAND TO LINK WITH'}
          </Text>
          <Text style={styles.statusCount}>
            {String(game.islandsLeft) + ' OPEN'}
          </Text>
        </View>
      </View>

      <View style={styles.bar}>
        <View style={styles.chipRow}>
          {BRIDGE_ORDER.map(id => {
            if (level.stock[id] <= 0) {
              return null;
            }
            return (
              <ColorChip
                key={id}
                id={id}
                name={BRIDGE_LABEL[id]}
                left={game.stock[id]}
                active={game.activeColor === id}
                onPress={game.pickColor}
              />
            );
          })}
        </View>
        <View style={styles.actionRow}>
          <SecondaryButton
            label="UNDO"
            Icon={Undo2}
            width={ACTION_W}
            height={48}
            onPress={game.undo}
          />
          <SecondaryButton
            label="RESET"
            Icon={RotateCcw}
            width={ACTION_W}
            height={48}
            onPress={game.restart}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bgMid,
  },
  bgImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.3,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scorePill: {
    height: 44,
    minWidth: 78,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: theme.colors.text,
  },
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: GAME_AREA_BOTTOM_INSET,
    gap: 10,
  },
  toastSlot: {
    height: TOAST_SLOT_H,
    justifyContent: 'center',
  },
  statusStrip: {
    height: TOAST_SLOT_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.deep,
  },
  statusCount: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.azure,
  },
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: CONTROL_BAR_BOTTOM,
    height: CONTROL_BAR_H,
    borderRadius: 24,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.deep,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
    elevation: 10,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});

export default GameScreen;
