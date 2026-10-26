/**
 * ColorBridge visual system.
 *
 * Preset: OCEAN_FRESH (the `name` field below is the preset identifier and
 * must stay verbatim). Only the accent values are overridden with the brief's
 * hexes. Style layer: BENTO_GRID — modular equal-weight tile cards, thin even
 * shadows, radii 16-20, lots of white surface on a pale water gradient.
 *
 * NOTE: deliberately NOT declared `as const`. A const-asserted theme turns
 * every gradient array into a readonly tuple, which `react-native-linear-
 * gradient` rejects under `tsc --noEmit`.
 */

export const theme = {
  name: 'OCEAN_FRESH',

  colors: {
    // Surfaces
    bgBase: '#F4F9FF',
    bgMid: '#E8F4F8',
    bgDeepWater: '#D1E7EE',
    surface: '#FFFFFF',
    surfaceAlt: '#E8F4F8',
    border: '#B8DBE5',
    borderSoft: 'rgba(0,85,139,0.14)',

    // Night surfaces (loader + result)
    night: '#0A1F33',
    nightCard: '#0E2A41',
    deep: '#00558B',

    // Accents
    azure: '#3A86FF',
    azureDark: '#1E6BE6',
    azureSoft: '#5BA4FF',
    coral: '#FF006E',
    amber: '#FFBE0B',
    mint: '#7FE8C5',

    // Text
    text: '#2B2D42',
    textMuted: '#5E6B86',
    onDark: '#FFFFFF',
    onDarkMuted: 'rgba(255,255,255,0.55)',
    onDarkFaint: 'rgba(255,255,255,0.32)',

    // Glass
    glass: 'rgba(255,255,255,0.92)',
    glassLight: 'rgba(255,255,255,0.72)',
    glassDark: 'rgba(255,255,255,0.08)',
    glassDarkBorder: 'rgba(255,255,255,0.14)',
    scrim: 'rgba(10,31,51,0.55)',
  },

  gradients: {
    loader: ['#0A1F33', '#00558B', '#0E3A5C'] as string[],
    loaderStops: [0, 0.55, 1] as number[],
    menu: ['#F4F9FF', '#E8F4F8', '#D1E7EE'] as string[],
    menuStops: [0, 0.5, 1] as number[],
    game: ['#E8F4F8', '#D1E7EE', '#B8DBE5'] as string[],
    gameStops: [0, 0.55, 1] as number[],
    result: ['#0A1F33', '#00558B', '#1E6BE6'] as string[],
    resultStops: [0, 0.6, 1] as number[],
    cta: ['#3A86FF', '#1E6BE6'] as string[],
    progress: ['#3A86FF', '#7FE8C5'] as string[],
  },

  radius: {
    chip: 14,
    tile: 16,
    card: 20,
    brand: 28,
  },

  // Bridge segment colours, keyed by the engine's colour ids.
  bridge: {
    azure: '#3A86FF',
    coral: '#FF006E',
    amber: '#FFBE0B',
  },
};

export type BridgeColorId = 'azure' | 'coral' | 'amber';

export const BRIDGE_ORDER: BridgeColorId[] = ['azure', 'coral', 'amber'];

export const BRIDGE_LABEL: Record<BridgeColorId, string> = {
  azure: 'AZURE',
  coral: 'CORAL',
  amber: 'AMBER',
};
