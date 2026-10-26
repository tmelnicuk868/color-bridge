import React, {useCallback, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {LucideIcon} from 'lucide-react-native';
import {theme} from '../constants/theme';

type Props = {
  label: string;
  sublabel: string;
  onPress: () => void;
  height: number;
  Icon: LucideIcon;
};

/**
 * The hero tile of the bento grid. Bottom-anchored by its parent so its centre
 * stays inside the vertical band the automated walkthrough actually taps.
 */
function PrimaryCtaTile({label, sublabel, onPress, height, Icon}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.96,
      tension: 300,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 300,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
      style={[styles.press, {height}]}>
      <Animated.View style={[styles.layer, {height, transform: [{scale}]}]}>
        <LinearGradient
          colors={theme.gradients.cta}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.fill, {height}]}>
          <View style={styles.glowA} />
          <View style={styles.glowB} />
          <View style={styles.iconWrap}>
            <Icon size={28} color={theme.colors.onDark} strokeWidth={2.2} />
          </View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.sublabel}>{sublabel}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: theme.radius.card,
    shadowColor: theme.colors.azure,
    shadowOpacity: 0.38,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
    elevation: 9,
  },
  layer: {
    width: '100%',
    borderRadius: theme.radius.card,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  glowA: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -74,
    right: -48,
  },
  glowB: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(127,232,197,0.14)',
    bottom: -58,
    left: -32,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  label: {
    marginTop: 12,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.onDark,
  },
  sublabel: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.78)',
  },
});

export default React.memo(PrimaryCtaTile);
