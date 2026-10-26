import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../constants/theme';

type Props = {
  value: string;
  label: string;
  color: string;
  height?: number;
  dark?: boolean;
};

/**
 * Bento stat pill. No raster icon on purpose: an accent dot has predictable
 * geometry, so a row of these stays visually identical apart from the colour.
 * Width comes from the parent slot (`width: '100%'`), never from `flex: 1`,
 * which would collapse inside an already-flexed parent.
 */
function StatTile({value, label, color, height, dark}: Props) {
  return (
    <View
      style={[
        styles.card,
        dark ? styles.cardDark : styles.cardLight,
        {borderColor: dark ? 'rgba(255,255,255,0.16)' : color + '55'},
        height === undefined ? null : {height},
      ]}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <Text style={[styles.value, {color}]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.label, dark ? styles.labelDark : null]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.tile,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.deep,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  cardDark: {
    backgroundColor: theme.colors.glassDark,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 7,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  label: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
  },
  labelDark: {
    color: theme.colors.onDarkMuted,
  },
});

export default React.memo(StatTile);
