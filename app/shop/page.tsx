import { redirect } from "next/navigation";

/**
 * The storefront page moved from /shop to /trangchu (2026-10-20) so the
 * homepage and the shop are no longer confused. Keep old links working.
 */
export default function ShopPage() {
  redirect("/trangchu");
}
