import React, {useCallback, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {LucideIcon} from 'lucide-react-native';
import {theme} from '../constants/theme';

const ICON = 24;

type Props = {
  label: string;
  onPress: () => void;
  width: number;
  height?: number;
  colors?: string[];
  Icon?: LucideIcon;
  accessibilityLabel?: string;
};

/** Gradient CTA. Pressable is the parent; the scale layer lives inside it. */
function PrimaryButton({
  label,
  onPress,
  width,
  height,
  colors,
  Icon,
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const h = height === undefined ? 60 : height;

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
      accessibilityLabel={accessibilityLabel === undefined ? label : accessibilityLabel}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      style={[styles.press, {width, height: h}]}>
      <Animated.View
        style={[styles.layer, {width, height: h, transform: [{scale}]}]}>
        <LinearGradient
          colors={colors === undefined ? theme.gradients.cta : colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.fill, {width, height: h}]}>
          <View style={styles.row}>
            {Icon ? <Icon size={ICON} color={theme.colors.onDark} strokeWidth={2.2} /> : null}
            <Text style={styles.label}>{label}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    borderRadius: 18,
    shadowColor: theme.colors.azure,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 9,
  },
  layer: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  fill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 18,
    lineHeight: ICON,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.onDark,
  },
});

export default React.memo(PrimaryButton);
