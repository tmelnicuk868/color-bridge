/** 1250 -> "1,250". Hand-rolled: Hermes ships an incomplete Intl. */
export function thousands(value: number): string {
  const neg = value < 0;
  const digits = String(Math.abs(Math.round(value)));
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    const fromEnd = digits.length - i;
    out += digits[i];
    if (fromEnd > 1 && fromEnd % 3 === 1) {
      out += ',';
    }
  }
  return neg ? '-' + out : out;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
