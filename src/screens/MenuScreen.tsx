import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  BackHandler,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {CalendarDays, GraduationCap, LayoutGrid} from 'lucide-react-native';
import {bgMenu} from '../assets';
import {MAX_LEVEL} from '../constants/config';
import {theme} from '../constants/theme';
import type {Level} from '../game/types';
import BalanceBadge from '../components/BalanceBadge';
import BentoTile from '../components/BentoTile';
import IslandMapTile from '../components/IslandMapTile';
import PrimaryCtaTile from '../components/PrimaryCtaTile';
import ScreenHeader from '../components/ScreenHeader';
import StatTile from '../components/StatTile';
import TutorialOverlay from '../components/TutorialOverlay';
import type {Progress} from '../hooks/useProgress';

const MAP_TILE_H = 232;
const STAT_H = 104;
const PROGRESS_H = 64;
const CTA_H = 160;
const GUIDE_H = 56;

type Props = {
  progress: Progress;
  level: Level;
  onBuild: () => void;
  onDaily: () => void;
};

function useRiseIn(delay: number) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      tension: 60,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);
  return {
    opacity: anim,
    transform: [
      {translateY: anim.interpolate({inputRange: [0, 1], outputRange: [16, 0]})},
    ],
  };
}

/** M3 Bento-Hub. The hero tile is bottom-anchored so it stays easy to reach. */
function MenuScreen({progress, level, onBuild, onDaily}: Props) {
  const [tutorial, setTutorial] = useState(false);

  const mapIn = useRiseIn(60);
  const statsIn = useRiseIn(130);
  const progIn = useRiseIn(200);
  const ctaIn = useRiseIn(270);
  const guideIn = useRiseIn(340);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const openTutorial = useCallback(() => setTutorial(true), []);
  const closeTutorial = useCallback(() => setTutorial(false), []);

  const pct = Math.round((progress.level / MAX_LEVEL) * 100);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.bgBase} />
      <ImageBackground source={bgMenu} style={styles.bg} resizeMode="cover">
        <LinearGradient
          colors={['rgba(244,249,255,0.90)', 'rgba(232,244,248,0.88)', 'rgba(209,231,238,0.94)']}
          locations={theme.gradients.menuStops}
          style={styles.wash}>
          <View style={styles.blobA} />
          <View style={styles.blobB} />

          <ScreenHeader
            title="COLOR"
            titleAccent="BRIDGE"
            rightSlot={<BalanceBadge value={progress.balance} />}
          />

          <Text style={styles.hint}>LINK EVERY ISLAND - BRIDGES NEVER CROSS</Text>

          <View style={styles.grid}>
            <Animated.View pointerEvents="box-none" style={mapIn}>
              <BentoTile height={MAP_TILE_H}>
                <IslandMapTile level={level} mapHeight={MAP_TILE_H - 24} />
              </BentoTile>
            </Animated.View>

            <Animated.View pointerEvents="box-none" style={[styles.row, statsIn]}>
              <View style={styles.slot}>
                <StatTile
                  value={String(progress.streak)}
                  label="STREAK"
                  color={theme.colors.coral}
                  height={STAT_H}
                />
              </View>
              <View style={styles.slot}>
                <StatTile
                  value={String(progress.best)}
                  label="BEST RUN"
                  color={theme.colors.amber}
                  height={STAT_H}
                />
              </View>
              <View style={styles.slot}>
                <BentoTile
                  height={STAT_H}
                  onPress={onDaily}
                  accentBorder={theme.colors.amber}
                  accessibilityLabel="daily board"
                  style={styles.dailyTile}>
                  <View style={styles.dailyInner}>
                    <CalendarDays size={24} color={theme.colors.amber} strokeWidth={2.2} />
                    <Text style={styles.dailyLabel}>DAILY</Text>
                    <Text style={styles.dailySub}>TODAY</Text>
                  </View>
                </BentoTile>
              </View>
            </Animated.View>

            <Animated.View pointerEvents="box-none" style={progIn}>
              <BentoTile height={PROGRESS_H} tone="alt">
                <View style={styles.progressInner}>
                  <View style={styles.progressTop}>
                    <Text style={styles.progressLabel}>CAMPAIGN PROGRESS</Text>
                    <Text style={styles.progressValue}>
                      {String(progress.level) + ' / ' + String(MAX_LEVEL)}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <LinearGradient
                      colors={theme.gradients.cta}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={[styles.progressFill, {flex: pct}]}
                    />
                    <View style={{flex: Math.max(1, 100 - pct)}} />
                  </View>
                </View>
              </BentoTile>
            </Animated.View>

            <View style={styles.spacer} />

            <Animated.View pointerEvents="box-none" style={ctaIn}>
              <PrimaryCtaTile
                label="START BUILDING"
                sublabel={'LEVEL ' + String(level.index) + ' - ' + String(level.islands.length) + ' ISLANDS'}
                height={CTA_H}
                Icon={LayoutGrid}
                onPress={onBuild}
              />
            </Animated.View>

            <Animated.View pointerEvents="box-none" style={[styles.guideWrap, guideIn]}>
              <BentoTile
                height={GUIDE_H}
                tone="alt"
                onPress={openTutorial}
                accessibilityLabel="how to build">
                <View style={styles.guideInner}>
                  <GraduationCap size={24} color={theme.colors.azure} strokeWidth={2.2} />
                  <Text style={styles.guideLabel}>HOW TO BUILD</Text>
                </View>
              </BentoTile>
            </Animated.View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <TutorialOverlay visible={tutorial} onDismiss={closeTutorial} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
  bg: {
    flex: 1,
  },
  wash: {
    flex: 1,
  },
  blobA: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(58,134,255,0.10)',
    top: -70,
    right: -80,
  },
  blobB: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,190,11,0.10)',
    bottom: 60,
    left: -70,
  },
  hint: {
    marginTop: 2,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.textMuted,
  },
  grid: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  slot: {
    flex: 1,
    height: STAT_H,
  },
  spacer: {
    flex: 1,
    minHeight: 8,
  },
  dailyTile: {
    width: '100%',
  },
  dailyInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyLabel: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.text,
  },
  dailySub: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
  },
  progressInner: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: 8,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: theme.colors.textMuted,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.azure,
  },
  progressTrack: {
    height: 7,
    flexDirection: 'row',
    borderRadius: 4,
    backgroundColor: 'rgba(0,85,139,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    borderRadius: 4,
  },
  guideWrap: {
    width: '100%',
  },
  guideInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  guideLabel: {
    fontSize: 13,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.azure,
  },
});

export default MenuScreen;
