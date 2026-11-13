/**
 * VietQR image URL for a transfer payment — the QR the customer scans
 * on the POS bill (KiotViet-style): exact amount + order code as the
 * transfer note. Uses the official VietQR image API (img.vietqr.io).
 * Pure function, no Next.js imports, so it can be unit-tested.
 *
 * amountVnd is in VND (not thousands). Returns null when there is no
 * bank configured or the amount is not positive.
 */
export function vietqrImageUrl({
  bankCode,
  accountNumber,
  accountName,
  amountVnd,
  content,
}: {
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  amountVnd: number;
  content: string;
}): string | null {
  const bank = (bankCode ?? "").trim().toUpperCase();
  const account = (accountNumber ?? "").trim();
  if (!bank || !account || !(amountVnd > 0)) return null;
  const params = new URLSearchParams({
    amount: String(Math.floor(amountVnd)),
    addInfo: content,
  });
  if (accountName?.trim()) {
    params.set("accountName", accountName.trim());
  }
  return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?${params.toString()}`;
}
