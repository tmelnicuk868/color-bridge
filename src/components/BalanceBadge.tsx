import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {Zap} from 'lucide-react-native';
import {theme} from '../constants/theme';
import {thousands} from '../utils/format';

type Props = {
  value: number;
  dark?: boolean;
};

/** Coin pill. Pulses once whenever the balance changes. */
function BalanceBadge({value, dark}: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1.12,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(pulse, {
        toValue: 1,
        tension: 160,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, pulse]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.pill,
        dark ? styles.dark : styles.light,
        {transform: [{scale: pulse}]},
      ]}>
      <Zap size={16} color={theme.colors.amber} strokeWidth={2.4} />
      <Text style={[styles.value, dark ? styles.valueDark : null]}>
        {thousands(value)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    minWidth: 86,
    paddingHorizontal: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  light: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  dark: {
    backgroundColor: theme.colors.glassDark,
    borderColor: theme.colors.glassDarkBorder,
  },
  value: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: theme.colors.text,
  },
  valueDark: {
    color: theme.colors.onDark,
  },
});

export default React.memo(BalanceBadge);
