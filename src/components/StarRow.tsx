import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {Star} from 'lucide-react-native';
import {theme} from '../constants/theme';

type Props = {
  earned: number;
};

const SLOTS = [0, 1, 2];

/** Three stars, popped in 90ms apart. One-shot: the view tree reaches idle. */
function StarRow({earned}: Props) {
  const a0 = useRef(new Animated.Value(0)).current;
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const values = [a0, a1, a2];

  useEffect(() => {
    Animated.stagger(
      90,
      values.map(v =>
        Animated.spring(v, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ),
    ).start();
    // values is a stable tuple of refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.row}>
      {SLOTS.map(i => {
        const anim = values[i];
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.2, 1],
        });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{opacity: anim, transform: [{scale}]}}>
            <Star
              size={32}
              strokeWidth={2}
              color={i < earned ? theme.colors.amber : 'rgba(255,255,255,0.28)'}
              fill={i < earned ? theme.colors.amber : 'transparent'}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
});

export default React.memo(StarRow);
