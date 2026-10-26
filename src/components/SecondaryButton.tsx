import React, {useCallback, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import type {LucideIcon} from 'lucide-react-native';
import {theme} from '../constants/theme';

const ICON = 24;

type Props = {
  label: string;
  onPress: () => void;
  width: number;
  height?: number;
  dark?: boolean;
  disabled?: boolean;
  Icon?: LucideIcon;
  accessibilityLabel?: string;
};

/** Tinted h48+ button. Same icon box and lineHeight as PrimaryButton. */
function SecondaryButton({
  label,
  onPress,
  width,
  height,
  dark,
  disabled,
  Icon,
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const h = height === undefined ? 48 : height;
  const tint = dark ? theme.colors.onDark : theme.colors.text;

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
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel === undefined ? label : accessibilityLabel}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      style={[styles.press, {width, height: h}, disabled ? styles.off : null]}>
      <Animated.View
        style={[
          styles.layer,
          dark ? styles.dark : styles.light,
          {width, height: h, transform: [{scale}]},
        ]}>
        <View style={styles.row}>
          {Icon ? <Icon size={ICON} color={tint} strokeWidth={2.2} /> : null}
          <Text style={[styles.label, {color: tint}]}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    borderRadius: 14,
  },
  off: {
    opacity: 0.4,
  },
  layer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  light: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
  },
  dark: {
    backgroundColor: theme.colors.glassDark,
    borderColor: theme.colors.glassDarkBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 14,
    lineHeight: ICON,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default React.memo(SecondaryButton);
