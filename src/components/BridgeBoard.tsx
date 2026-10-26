import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Line, Rect} from 'react-native-svg';
import {
  BOARD_BORDER,
  BOARD_H,
  BOARD_PAD,
  BOARD_W,
  ISLAND_SIZE,
  LATTICE_H,
  LATTICE_W,
  TILE,
} from '../constants/config';
import {theme} from '../constants/theme';
import {remainingNeed} from '../game/rules';
import type {Bridge, ColorId, Island, Level} from '../game/types';

type Props = {
  level: Level;
  bridges: Bridge[];
  selectedId: number | null;
  targetIds: number[];
  activeColor: ColorId;
  shake: Animated.Value;
  won: boolean;
  rippleKey: number;
  rippleAt: {x: number; y: number} | null;
  onIslandPress: (id: number) => void;
};

const cx = (col: number) => (col + 0.5) * TILE;
const cy = (row: number) => (row + 0.5) * TILE;

function Ripple({x, y, color, token}: {x: number; y: number; color: string; token: number}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [anim, token]);

  const scale = anim.interpolate({inputRange: [0, 1], outputRange: [0.5, 1.7]});
  const opacity = anim.interpolate({inputRange: [0, 1], outputRange: [0.5, 0]});

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        {
          left: x - ISLAND_SIZE / 2,
          top: y - ISLAND_SIZE / 2,
          borderColor: color,
          opacity,
          transform: [{scale}],
        },
      ]}
    />
  );
}

function IslandNode({
  island,
  left,
  top,
  left_need,
  color,
  selected,
  target,
  onPress,
}: {
  island: Island;
  left: number;
  top: number;
  left_need: number;
  color: string;
  selected: boolean;
  target: boolean;
  onPress: (id: number) => void;
}) {
  const pop = useRef(new Animated.Value(1)).current;
  const id = island.id;

  const handle = useCallback(() => {
    Animated.sequence([
      Animated.timing(pop, {toValue: 1.1, duration: 80, useNativeDriver: true}),
      Animated.spring(pop, {
        toValue: 1,
        tension: 220,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    onPress(id);
  }, [id, onPress, pop]);

  const satisfied = left_need === 0;

  return (
    <Pressable
      onPress={handle}
      accessibilityRole="button"
      accessibilityLabel={'island ' + String(id + 1)}
      hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
      style={[styles.islandPress, {left, top, width: ISLAND_SIZE, height: ISLAND_SIZE}]}>
      <Animated.View
        style={[
          styles.island,
          {
            width: ISLAND_SIZE,
            height: ISLAND_SIZE,
            borderColor: satisfied ? theme.colors.mint : color,
            borderWidth: satisfied ? 5 : 4,
            transform: [{scale: pop}],
          },
          selected ? styles.islandSelected : null,
          target ? styles.islandTarget : null,
        ]}>
        <Text
          style={[
            styles.islandText,
            {color: satisfied ? theme.colors.mint : color},
          ]}>
          {satisfied ? '✓' : String(left_need)}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function BridgeBoard({
  level,
  bridges,
  selectedId,
  targetIds,
  activeColor,
  shake,
  won,
  rippleKey,
  rippleAt,
  onIslandPress,
}: Props) {
  const byId = useMemo(() => {
    const map: Record<number, Island> = {};
    for (const island of level.islands) {
      map[island.id] = island;
    }
    return map;
  }, [level]);

  const lattice = useMemo(() => {
    const lines: Array<{key: string; x1: number; y1: number; x2: number; y2: number}> = [];
    for (let c = 0; c <= LATTICE_W / TILE; c++) {
      lines.push({key: 'v' + c, x1: c * TILE, y1: 0, x2: c * TILE, y2: LATTICE_H});
    }
    for (let r = 0; r <= LATTICE_H / TILE; r++) {
      lines.push({key: 'h' + r, x1: 0, y1: r * TILE, x2: LATTICE_W, y2: r * TILE});
    }
    return lines;
  }, []);

  // Parallel offset for the second bridge of a pair.
  const drawn = useMemo(() => {
    const seen: Record<string, number> = {};
    return bridges.map((b, index) => {
      const key = Math.min(b.a, b.b) + '-' + Math.max(b.a, b.b);
      const n = seen[key] === undefined ? 0 : seen[key];
      seen[key] = n + 1;
      const a = byId[b.a];
      const z = byId[b.b];
      const horizontal = a.row === z.row;
      const shift = n === 0 ? 0 : 10;
      const dx = horizontal ? 0 : shift;
      const dy = horizontal ? shift : 0;
      return {
        key: 'b' + index,
        color: theme.bridge[b.color],
        x1: cx(a.col) + dx,
        y1: cy(a.row) + dy,
        x2: cx(z.col) + dx,
        y2: cy(z.row) + dy,
      };
    });
  }, [bridges, byId]);

  const guides = useMemo(() => {
    if (selectedId === null) {
      return [];
    }
    const from = byId[selectedId];
    if (!from) {
      return [];
    }
    return targetIds.map(id => {
      const to = byId[id];
      return {
        key: 'g' + id,
        x1: cx(from.col),
        y1: cy(from.row),
        x2: cx(to.col),
        y2: cy(to.row),
      };
    });
  }, [byId, selectedId, targetIds]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.board,
        won ? styles.boardWon : null,
        {transform: [{translateX: shake}]},
      ]}>
      <View style={styles.lattice}>
        <Svg
          width={LATTICE_W}
          height={LATTICE_H}
          style={StyleSheet.absoluteFill}
          pointerEvents="none">
          <Rect
            x={0}
            y={0}
            width={LATTICE_W}
            height={LATTICE_H}
            fill="rgba(232,244,248,0.55)"
            rx={12}
          />
          {lattice.map(l => (
            <Line
              key={l.key}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="rgba(0,85,139,0.10)"
              strokeWidth={1}
            />
          ))}
          {guides.map(g => (
            <Line
              key={g.key}
              x1={g.x1}
              y1={g.y1}
              x2={g.x2}
              y2={g.y2}
              stroke={theme.bridge[activeColor]}
              strokeWidth={2}
              strokeDasharray="5 6"
              strokeLinecap="round"
              opacity={0.65}
            />
          ))}
          {drawn.map(b => (
            <Line
              key={b.key}
              x1={b.x1}
              y1={b.y1}
              x2={b.x2}
              y2={b.y2}
              stroke={b.color}
              strokeWidth={9}
              strokeLinecap="round"
            />
          ))}
          {drawn.map(b => (
            <Line
              key={b.key + 'i'}
              x1={b.x1}
              y1={b.y1}
              x2={b.x2}
              y2={b.y2}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
        </Svg>

        {rippleAt ? (
          <Ripple
            x={rippleAt.x}
            y={rippleAt.y}
            color={theme.bridge[activeColor]}
            token={rippleKey}
          />
        ) : null}

        {level.islands.map(island => (
          <IslandNode
            key={island.id}
            island={island}
            left={cx(island.col) - ISLAND_SIZE / 2}
            top={cy(island.row) - ISLAND_SIZE / 2}
            left_need={remainingNeed(island, bridges)}
            color={theme.bridge[island.allowed[island.id % island.allowed.length]]}
            selected={selectedId === island.id}
            target={targetIds.indexOf(island.id) >= 0}
            onPress={onIslandPress}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_W,
    height: BOARD_H,
    padding: BOARD_PAD,
    borderWidth: BOARD_BORDER,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.deep,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
    elevation: 7,
  },
  boardWon: {
    borderColor: theme.colors.mint,
  },
  lattice: {
    width: LATTICE_W,
    height: LATTICE_H,
  },
  islandPress: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  island: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.deep,
    shadowOpacity: 0.16,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
  },
  islandSelected: {
    backgroundColor: '#EAF2FF',
    shadowOpacity: 0.3,
    elevation: 8,
  },
  islandTarget: {
    backgroundColor: '#F2F8FF',
  },
  islandText: {
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  ripple: {
    position: 'absolute',
    width: ISLAND_SIZE,
    height: ISLAND_SIZE,
    borderRadius: ISLAND_SIZE / 2,
    borderWidth: 3,
  },
});

export default React.memo(BridgeBoard);
