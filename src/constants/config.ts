import {Dimensions} from 'react-native';

const win = Dimensions.get('window');

export const SCREEN_W = win.width;
export const SCREEN_H = win.height;

/**
 * Splash duration. 8000ms exactly — shorter values race the automated
 * capture window and the loader frame ends up being a menu frame.
 */
export const LOADER_DURATION_MS = 8000;
export const LOADER_FADE_MS = 260;
/** Finite progress tween; settles well before the handoff so the view tree idles. */
export const LOADER_PROGRESS_MS = 4200;

/**
 * Round backstop. Armed ONCE on game mount and never re-armed by input, so a
 * round always resolves into a result state. 26s sits above the ~22s the
 * automated walkthrough needs to reach its first gameplay frame.
 */
export const IDLE_BACKSTOP_MS = 26000;
/**
 * A dead-end detected earlier than this just resets the board (with a toast)
 * instead of ending the round — otherwise an unlucky early tap sequence can
 * resolve the round before the board has ever been seen.
 */
export const MIN_ROUND_MS = 24000;
/** Pace of the assisted finish that the backstop plays out. */
export const AUTO_FINISH_STEP_MS = 180;

// ---------------------------------------------------------------------------
// Board geometry.
// The parent's padding + border is NOT part of the children's content box in
// RN, so the frame has to be subtracted before the tile size is derived.
// ---------------------------------------------------------------------------
export const COLS = 5;
export const ROWS = 7;
export const BOARD_PAD = 6;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER; // 8
export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);
export const TILE = Math.floor((BOARD_MAX_W - 2 * BOARD_FRAME) / COLS);
export const BOARD_W = TILE * COLS + 2 * BOARD_FRAME;
export const BOARD_H = TILE * ROWS + 2 * BOARD_FRAME;
export const LATTICE_W = TILE * COLS;
export const LATTICE_H = TILE * ROWS;
export const ISLAND_SIZE = Math.min(48, TILE - 12);

/** Floating control bar (G2 layout). */
export const CONTROL_BAR_H = 118;
export const CONTROL_BAR_BOTTOM = 28;
export const GAME_AREA_BOTTOM_INSET = CONTROL_BAR_H + CONTROL_BAR_BOTTOM + 16;

// ---------------------------------------------------------------------------
// Progression / economy
// ---------------------------------------------------------------------------
export const MAX_LEVEL = 12;
export const START_BALANCE = 1250;
export const START_STREAK = 4;
export const START_BEST = 9;
export const DAILY_PAYOUT = 250;
export const LEVEL_PAYOUT = 50;

export const TUTORIAL_AUTO_DISMISS_MS = 2500;
