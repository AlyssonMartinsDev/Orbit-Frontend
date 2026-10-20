export type PricingMode = "SIMPLE" | "ITEMIZED";
export interface LineItem { description: string; quantity: string; unit_price: string }

function scaled(value: string, places: number): bigint | null {
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > places || whole.length > 10) return null;
  return BigInt(whole) * (10n ** BigInt(places)) + BigInt(fraction.padEnd(places, "0"));
}
export function lineCents(item: LineItem): bigint | null {
  const quantity = scaled(item.quantity, 3);
  const unit = scaled(item.unit_price, 2);
  if (quantity === null || unit === null || quantity <= 0n || quantity > 999999999n || unit > 9999999999n) return null;
  return (quantity * unit + 500n) / 1000n;
}
function decimal(cents: bigint): string {
  return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}
export function lineAmount(item: LineItem): string | null {
  const cents = lineCents(item);
  return cents === null ? null : decimal(cents);
}
export function itemsTotal(items: LineItem[]): string | null {
  if (!items.length || items.length > 100) return null;
  let sum = 0n;
  for (const item of items) {
    const cents = lineCents(item);
    if (cents === null) return null;
    sum += cents;
  }
  return sum > 9999999999n ? null : decimal(sum);
}
