/**
 * lib/money.ts
 *
 * ALL monetary math lives here. We use INTEGER CENTS throughout the app to
 * avoid IEEE-754 floating-point errors (0.1 + 0.2 ≠ 0.3 in JS floats).
 *
 * Rule: amounts enter the system as strings (from HTML inputs), are parsed
 * into cent integers immediately, and are only converted back to display
 * strings at render time. Never do arithmetic on floats.
 */

/** Display R 150.00 from 15000 cents */
export function formatMoney(cents: number): string {
  // Math.round prevents any residual float drift (e.g. 14999.9999...)
  const rounded = Math.round(cents);
  const rands = Math.floor(Math.abs(rounded) / 100);
  const centPart = Math.abs(rounded) % 100;
  const sign = rounded < 0 ? "-" : "";
  const formatted = rands.toLocaleString("en-ZA") + "." + String(centPart).padStart(2, "0");
  return `${sign}R\u00a0${formatted}`;
}

/**
 * Parse a user-typed amount string into integer cents.
 * Accepts: "150", "150.00", "1 500,00" (SA format), "R150", "1,500.00"
 * Returns null if the value is not a valid positive number.
 */
export function parseMoney(input: string): number | null {
  // Strip currency symbols, spaces, and commas used as thousand separators
  const cleaned = input
    .replace(/[R\s]/g, "")        // remove R and whitespace
    .replace(/,(?=\d{3}(?!\d))/g, "") // remove thousand-sep commas: 1,500 → 1500
    .replace(/,/g, ".");           // remaining commas are decimal: 150,50 → 150.50

  const float = parseFloat(cleaned);

  if (isNaN(float) || float <= 0 || !isFinite(float)) return null;

  // Convert to cents with rounding to handle floating-point parse artifacts
  return Math.round(float * 100);
}

/** Format cents as a plain number string for input default values: 15000 → "150.00" */
export function centsToInputString(cents: number): string {
  const rounded = Math.round(cents);
  const rands = Math.floor(rounded / 100);
  const centPart = rounded % 100;
  return `${rands}.${String(centPart).padStart(2, "0")}`;
}

/** Quick check: is this a valid positive money string? */
export function isValidMoneyString(input: string): boolean {
  return parseMoney(input) !== null;
}

/** Sum an array of cent integers safely */
export function sumCents(amounts: number[]): number {
  return amounts.reduce((acc, val) => acc + Math.round(val), 0);
}

/** Average of cent amounts, returns 0 for empty arrays */
export function avgCents(amounts: number[]): number {
  if (amounts.length === 0) return 0;
  return Math.round(sumCents(amounts) / amounts.length);
}
