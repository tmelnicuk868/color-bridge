import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../constants/theme';

type Props = {
  title: string;
  titleAccent?: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  dark?: boolean;
  surface?: boolean;
};

/**
 * The one header used by every screen. Keeps the status-bar inset, the title
 * weight and the slot geometry identical across Menu / Game / Result.
 */
function ScreenHeader({
  title,
  titleAccent,
  subtitle,
  leftSlot,
  rightSlot,
  dark,
  surface,
}: Props) {
  return (
    <View style={[styles.wrap, surface ? styles.surface : null]}>
      <View style={styles.row}>
        <View style={styles.side}>{leftSlot ? leftSlot : null}</View>
        <View style={styles.center}>
          <Text
            style={[styles.title, dark ? styles.titleDark : null]}
            numberOfLines={1}>
            {title}
            {titleAccent ? (
              <Text style={styles.titleAccent}>{titleAccent}</Text>
            ) : null}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, dark ? styles.subtitleDark : null]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={[styles.side, styles.sideRight]}>
          {rightSlot ? rightSlot : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 44,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  surface: {
    backgroundColor: theme.colors.glassLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: 92,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
    color: theme.colors.text,
  },
  titleDark: {
    color: theme.colors.onDark,
  },
  titleAccent: {
    color: theme.colors.azure,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: theme.colors.textMuted,
  },
  subtitleDark: {
    color: theme.colors.onDarkMuted,
  },
});

export default React.memo(ScreenHeader);
