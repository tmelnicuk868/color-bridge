import React, {useCallback} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {theme} from '../constants/theme';
import type {ColorId} from '../game/types';

type Props = {
  id: ColorId;
  name: string;
  left: number;
  active: boolean;
  onPress: (id: ColorId) => void;
};

const CHIP_W = 96;
const CHIP_H = 44;

/** Segment-stock chip. Dimmed and inert once its stock runs out. */
function ColorChip({id, name, left, active, onPress}: Props) {
  const color = theme.bridge[id];
  const empty = left <= 0;

  const handle = useCallback(() => {
    onPress(id);
  }, [id, onPress]);

  return (
    <Pressable
      onPress={handle}
      disabled={empty}
      accessibilityRole="button"
      accessibilityLabel={name.toLowerCase() + ' segments'}
      hitSlop={{top: 8, bottom: 8, left: 6, right: 6}}
      style={[
        styles.chip,
        active ? {borderColor: color, borderWidth: 2, backgroundColor: color + '1A'} : null,
        empty ? styles.empty : null,
      ]}>
      <View style={styles.row}>
        <View style={[styles.dot, {backgroundColor: color}]} />
        <Text style={[styles.count, {color}]}>{'x' + String(left)}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: CHIP_W,
    height: CHIP_H,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    opacity: 0.35,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  count: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  name: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.textMuted,
  },
});

export default React.memo(ColorChip);
