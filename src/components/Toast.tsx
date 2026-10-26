import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {theme} from '../constants/theme';

type Props = {
  text: string;
  token: number;
};

/** One-line board notice. One-shot fade, never a loop. */
function Toast({text, token}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!text) {
      return;
    }
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, {toValue: 1, duration: 140, useNativeDriver: true}),
      Animated.delay(900),
      Animated.timing(anim, {toValue: 0, duration: 220, useNativeDriver: true}),
    ]).start();
  }, [anim, text, token]);

  if (!text) {
    return null;
  }

  const translateY = anim.interpolate({inputRange: [0, 1], outputRange: [8, 0]});

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, {opacity: anim, transform: [{translateY}]}]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.deep,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  text: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.coral,
  },
});

export default React.memo(Toast);
