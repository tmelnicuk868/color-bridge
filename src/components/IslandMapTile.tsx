import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Line, Rect} from 'react-native-svg';
import {COLS, ROWS} from '../constants/config';
import {BRIDGE_LABEL, BRIDGE_ORDER, theme} from '../constants/theme';
import type {Level} from '../game/types';

type Props = {
  level: Level;
  mapHeight: number;
};

const MAP_W = 132;

/** Live miniature of the current board, drawn from the same level data. */
function IslandMapTile({level, mapHeight}: Props) {
  const step = useMemo(
    () => Math.min(MAP_W / COLS, mapHeight / ROWS),
    [mapHeight],
  );
  const w = step * COLS;
  const h = step * ROWS;
  const px = (c: number) => (c + 0.5) * step;
  const py = (r: number) => (r + 0.5) * step;

  const byId = useMemo(() => {
    const map: Record<number, {col: number; row: number}> = {};
    for (const island of level.islands) {
      map[island.id] = {col: island.col, row: island.row};
    }
    return map;
  }, [level]);

  return (
    <View style={styles.row}>
      <View style={[styles.mapWrap, {width: MAP_W, height: mapHeight}]}>
        <Svg width={w} height={h}>
          <Rect x={0} y={0} width={w} height={h} rx={10} fill={theme.colors.surfaceAlt} />
          {level.solution.map((b, i) => {
            const a = byId[b.a];
            const z = byId[b.b];
            return (
              <Line
                key={'s' + i}
                x1={px(a.col)}
                y1={py(a.row)}
                x2={px(z.col)}
                y2={py(z.row)}
                stroke={theme.bridge[b.color]}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.22}
              />
            );
          })}
          {level.islands.map(island => (
            <Circle
              key={island.id}
              cx={px(island.col)}
              cy={py(island.row)}
              r={5}
              fill={theme.colors.surface}
              stroke={theme.bridge[island.allowed[island.id % island.allowed.length]]}
              strokeWidth={2.5}
            />
          ))}
        </Svg>
      </View>

      <View style={styles.info}>
        <Text style={styles.caption}>CURRENT BOARD</Text>
        <Text style={styles.big}>
          {'LEVEL '}
          <Text style={styles.bigAccent}>{String(level.index)}</Text>
        </Text>
        <Text style={styles.sub}>
          {String(level.islands.length) + ' ISLANDS ON A ' + String(COLS) + ' x ' + String(ROWS) + ' LATTICE'}
        </Text>
        <View style={styles.legend}>
          {BRIDGE_ORDER.map(id => {
            const count = level.stock[id];
            if (count <= 0) {
              return null;
            }
            return (
              <View key={id} style={styles.legendRow}>
                <View style={[styles.swatch, {backgroundColor: theme.bridge[id]}]} />
                <Text style={styles.legendText}>
                  {BRIDGE_LABEL[id] + '  x' + String(count)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 16,
  },
  mapWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.textMuted,
  },
  big: {
    marginTop: 4,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.text,
  },
  bigAccent: {
    color: theme.colors.azure,
  },
  sub: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: theme.colors.textMuted,
  },
  legend: {
    marginTop: 10,
    gap: 5,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.text,
  },
});

export default React.memo(IslandMapTile);
