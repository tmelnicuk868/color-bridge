import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {bgLoader, spriteBridgeArc} from '../assets';
import {
  LOADER_DURATION_MS,
  LOADER_FADE_MS,
  LOADER_PROGRESS_MS,
} from '../constants/config';
import {theme} from '../constants/theme';

const BAR_W = 220;

type Props = {
  onDone: () => void;
};

/**
 * Brand splash. Deep night-water palette, deliberately the visual opposite of
 * the bright menu. Every animation here is finite, so the view hierarchy is
 * idle long before the hand-off.
 */
function LoaderScreen({onDone}: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {toValue: 1, duration: 420, useNativeDriver: true}),
      Animated.spring(rise, {
        toValue: 1,
        tension: 48,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {toValue: 1, duration: 1000, useNativeDriver: true}),
        Animated.timing(breathe, {toValue: 0, duration: 1000, useNativeDriver: true}),
      ]),
      {iterations: 2},
    ).start();

    Animated.timing(bar, {
      toValue: 1,
      duration: LOADER_PROGRESS_MS,
      useNativeDriver: true,
    }).start();

    const handoff = setTimeout(() => {
      Animated.timing(out, {
        toValue: 0,
        duration: LOADER_FADE_MS,
        useNativeDriver: true,
      }).start(() => onDone());
    }, LOADER_DURATION_MS - LOADER_FADE_MS);

    return () => clearTimeout(handoff);
  }, [bar, breathe, fade, onDone, out, rise]);

  const cardScale = Animated.multiply(
    rise.interpolate({inputRange: [0, 1], outputRange: [0.82, 1]}),
    breathe.interpolate({inputRange: [0, 1], outputRange: [1, 1.04]}),
  );

  // Progress fill driven purely on the GPU: scaleX plus the matching
  // translateX so the bar grows from its left edge.
  const fillScale = bar.interpolate({inputRange: [0, 1], outputRange: [0.004, 1]});
  const fillShift = bar.interpolate({
    inputRange: [0, 1],
    outputRange: [0 - BAR_W / 2, 0],
  });

  return (
    <Animated.View style={[styles.root, {opacity: out}]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.night} />
      <ImageBackground source={bgLoader} style={styles.bg} resizeMode="cover">
        <LinearGradient
          colors={['rgba(10,31,51,0.94)', 'rgba(0,56,94,0.86)', 'rgba(10,31,51,0.96)']}
          locations={[0, 0.55, 1]}
          style={styles.wash}>
          <View style={styles.blobA} />
          <View style={styles.blobB} />
          <View style={styles.blobC} />
          <View style={styles.rule1} />
          <View style={styles.rule2} />
          <View style={styles.rule3} />

          <View style={styles.center}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.card,
                {opacity: fade, transform: [{scale: cardScale}]},
              ]}>
              <Image source={spriteBridgeArc} style={styles.sprite} resizeMode="contain" />
            </Animated.View>

            <Animated.View pointerEvents="none" style={{opacity: fade}}>
              <Text style={styles.title}>
                COLOR
                <Text style={styles.titleAccent}>BRIDGE</Text>
              </Text>
              <Text style={styles.tagline}>LINK EVERY ISLAND</Text>
            </Animated.View>
          </View>

          <View style={styles.footer}>
            <View style={styles.track}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.fillWrap,
                  {transform: [{translateX: fillShift}, {scaleX: fillScale}]},
                ]}>
                <LinearGradient
                  colors={theme.gradients.progress}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.fill}
                />
              </Animated.View>
            </View>
            <Text style={styles.loading}>LOADING...</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.night,
  },
  bg: {
    flex: 1,
  },
  wash: {
    flex: 1,
    paddingTop: 44,
    alignItems: 'center',
  },
  blobA: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(58,134,255,0.18)',
    top: -90,
    left: -110,
  },
  blobB: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0,166,203,0.14)',
    top: 260,
    right: -120,
  },
  blobC: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(127,232,197,0.10)',
    bottom: -60,
    left: -50,
  },
  rule1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 220,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rule2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 340,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rule3: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 460,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 132,
    height: 132,
    borderRadius: theme.radius.brand,
    backgroundColor: theme.colors.nightCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 10},
    elevation: 12,
  },
  sprite: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
    color: theme.colors.onDark,
    textShadowColor: 'rgba(58,134,255,0.85)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 18,
  },
  titleAccent: {
    color: theme.colors.azureSoft,
  },
  tagline: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    textAlign: 'center',
    color: theme.colors.onDarkMuted,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 72,
  },
  track: {
    width: BAR_W,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  fillWrap: {
    width: BAR_W,
    height: 6,
  },
  fill: {
    width: BAR_W,
    height: 6,
    borderRadius: 3,
  },
  loading: {
    marginTop: 14,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.onDarkFaint,
  },
});

export default LoaderScreen;
