/**
 * Shared formatting helpers. Prices are stored in thousands of VND
 * (300 -> 300,000₫) everywhere in the catalogue and in orders.
 */
export function formatPrice(thousands: number): string {
  return `${(thousands * 1000).toLocaleString("en-US")}₫`;
}
