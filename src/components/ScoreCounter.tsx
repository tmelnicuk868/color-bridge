import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../constants/theme';
import {thousands} from '../utils/format';

type Props = {
  value: number;
  label: string;
  durationMs?: number;
};

/** Count-up on tabular figures so the digits do not jitter. */
function ScoreCounter({value, label, durationMs}: Props) {
  const [shown, setShown] = useState(0);
  const frame = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const total = durationMs === undefined ? 700 : durationMs;
    const steps = 28;
    const tick = Math.max(16, Math.round(total / steps));
    let i = 0;
    setShown(0);
    frame.current = setInterval(() => {
      i += 1;
      const t = Math.min(1, i / steps);
      setShown(Math.round(value * t));
      if (t >= 1 && frame.current) {
        clearInterval(frame.current);
        frame.current = null;
      }
    }, tick);
    return () => {
      if (frame.current) {
        clearInterval(frame.current);
        frame.current = null;
      }
    };
  }, [value, durationMs]);

  return (
    <View style={styles.card}>
      <Text style={styles.value}>{'+' + thousands(shown)}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.glassDark,
    borderWidth: 1,
    borderColor: theme.colors.glassDarkBorder,
  },
  value: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.mint,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.onDarkMuted,
  },
});

export default React.memo(ScoreCounter);
