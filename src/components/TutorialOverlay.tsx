import React, {useEffect} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {TUTORIAL_AUTO_DISMISS_MS} from '../constants/config';
import {theme} from '../constants/theme';
import SecondaryButton from './SecondaryButton';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

const LINES = [
  'TAP TWO ISLANDS IN A LINE',
  'MATCH THE ACTIVE COLOUR',
  'BRIDGES NEVER CROSS',
];

/**
 * How-to card. Auto-dismisses and swallows no taps for long, so an automated
 * walkthrough can never get stuck behind it.
 */
function TutorialOverlay({visible, onDismiss}: Props) {
  useEffect(() => {
    if (!visible) {
      return;
    }
    const timer = setTimeout(onDismiss, TUTORIAL_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <Pressable
      style={styles.scrim}
      accessibilityRole="button"
      accessibilityLabel="close how to build"
      onPress={onDismiss}>
      <View style={styles.card}>
        <Text style={styles.title}>BRIDGE RULES</Text>
        {LINES.map(line => (
          <View key={line} style={styles.line}>
            <Text style={styles.bullet}>·</Text>
            <Text style={styles.lineText}>{line}</Text>
          </View>
        ))}
        <SecondaryButton label="GOT IT" onPress={onDismiss} width={220} height={48} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.scrim,
  },
  card: {
    width: 300,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: theme.colors.text,
    marginBottom: 2,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
    color: theme.colors.azure,
  },
  lineText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
});

export default React.memo(TutorialOverlay);
