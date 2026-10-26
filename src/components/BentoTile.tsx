import React, {useCallback, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View, type ViewStyle} from 'react-native';
import {theme} from '../constants/theme';

type Props = {
  height: number;
  children: React.ReactNode;
  onPress?: () => void;
  accentBorder?: string;
  tone?: 'surface' | 'alt';
  style?: ViewStyle;
  accessibilityLabel?: string;
};

/**
 * Base modular card of the bento grid. Interactive tiles use Pressable as the
 * OUTER element and animate an inner Animated.View, which is the arrangement
 * that keeps onPress alive on Android release builds.
 */
function BentoTile({
  height,
  children,
  onPress,
  accentBorder,
  tone,
  style,
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.97,
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

  const surface = [
    styles.tile,
    tone === 'alt' ? styles.alt : styles.surface,
    accentBorder ? {borderColor: accentBorder} : null,
    {height},
  ];

  if (!onPress) {
    return <View style={[surface, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      style={[styles.press, style, {height}]}>
      <Animated.View style={[surface, styles.fill, {transform: [{scale}]}]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
  },
  fill: {
    width: '100%',
  },
  tile: {
    width: '100%',
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: theme.colors.deep,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  surface: {
    backgroundColor: theme.colors.surface,
  },
  alt: {
    backgroundColor: theme.colors.surfaceAlt,
  },
});

export default React.memo(BentoTile);
