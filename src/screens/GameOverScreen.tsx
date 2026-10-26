import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Image,
  BackHandler,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {LayoutGrid} from 'lucide-react-native';
import {spriteIslandHero} from '../assets';
import {theme} from '../constants/theme';
import type {RoundOutcome} from '../game/scoring';
import BalanceBadge from '../components/BalanceBadge';
import PrimaryButton from '../components/PrimaryButton';
import ScoreCounter from '../components/ScoreCounter';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StarRow from '../components/StarRow';
import StatTile from '../components/StatTile';

const CTA_W = 300;

type Props = {
  outcome: RoundOutcome;
  balance: number;
  nextLevel: number;
  onPlayAgain: () => void;
  onMenu: () => void;
};

/**
 * Round result. Deliberately the darkest surface in the app so it can never
 * be mistaken for the menu or the board.
 */
function GameOverScreen({
  outcome,
  balance,
  nextLevel,
  onPlayAgain,
  onMenu,
}: Props) {
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(rise, {
      toValue: 1,
      tension: 60,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [rise]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onMenu();
      return true;
    });
    return () => sub.remove();
  }, [onMenu]);

  const won = outcome.won;
  const headline = won ? 'BRIDGES LINKED' : 'NO ROUTE LEFT';
  const accent = won ? theme.colors.mint : theme.colors.coral;

  const body = {
    opacity: rise,
    transform: [
      {translateY: rise.interpolate({inputRange: [0, 1], outputRange: [18, 0]})},
    ],
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.night} />
      <LinearGradient
        colors={theme.gradients.result}
        locations={theme.gradients.resultStops}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glow, {backgroundColor: accent, opacity: won ? 0.16 : 0.12}]} />
      <View style={styles.blob} />

      <ScreenHeader
        dark
        title={outcome.daily ? 'DAILY RESULT' : 'ROUND RESULT'}
        rightSlot={<BalanceBadge value={balance} dark />}
      />

      <Animated.View pointerEvents="box-none" style={[styles.body, body]}>
        <Image source={spriteIslandHero} style={styles.hero} resizeMode="contain" />

        <View style={styles.ornament}>
          <View style={[styles.ornDot, {backgroundColor: accent}]} />
          <View style={[styles.ornBar, {backgroundColor: accent}]} />
          <View style={[styles.ornDot, {backgroundColor: accent}]} />
        </View>

        <Text style={[styles.headline, {textShadowColor: accent}]}>{headline}</Text>

        <Text style={styles.subline}>
          {outcome.assisted
            ? 'FINISHED WITH THE BUILD ASSIST'
            : outcome.usedUndo
            ? 'SOLVED WITH A FEW REWINDS'
            : won
            ? 'A CLEAN, CROSSING-FREE ROUTE'
            : 'THE LAST SEGMENTS HAD NOWHERE TO GO'}
        </Text>

        <View style={styles.stars}>
          <StarRow earned={outcome.stars} />
        </View>

        <ScoreCounter value={outcome.score} label="POINTS EARNED" />

        <View style={styles.statRow}>
          <View style={styles.slot}>
            <StatTile
              value={String(outcome.bridgesPlaced)}
              label="BRIDGES"
              color={theme.colors.azureSoft}
              height={88}
              dark
            />
          </View>
          <View style={styles.slot}>
            <StatTile
              value={String(outcome.colorsUsed) + '/' + String(outcome.colorsTotal)}
              label="COLOURS"
              color={theme.colors.amber}
              height={88}
              dark
            />
          </View>
          <View style={styles.slot}>
            <StatTile
              value={'+' + String(outcome.payout)}
              label="COINS"
              color={theme.colors.mint}
              height={88}
              dark
            />
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          {won
            ? 'NEXT UP - LEVEL ' + String(nextLevel)
            : 'TRY A DIFFERENT ROUTE ORDER'}
        </Text>
        <PrimaryButton
          label="BUILD AGAIN"
          Icon={LayoutGrid}
          width={CTA_W}
          height={60}
          onPress={onPlayAgain}
        />
        <SecondaryButton
          label="MAIN MENU"
          width={CTA_W}
          height={48}
          dark
          onPress={onMenu}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.night,
  },
  glow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    top: 70,
    alignSelf: 'center',
  },
  blob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(58,134,255,0.16)',
    bottom: -70,
    right: -90,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  subline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.4,
    textAlign: 'center',
    color: theme.colors.onDarkMuted,
  },
  hero: {
    width: 76,
    height: 76,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  ornDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  ornBar: {
    width: 54,
    height: 3,
    borderRadius: 2,
  },
  headline: {
    fontSize: 33,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    color: theme.colors.onDark,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 20,
  },
  stars: {
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 12,
  },
  slot: {
    flex: 1,
    height: 88,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    gap: 14,
  },
  hint: {
    marginBottom: 2,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: theme.colors.onDarkMuted,
  },
});

export default GameOverScreen;
