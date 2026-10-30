import { redirect } from "next/navigation";

/**
 * Old admin path — kept only as a redirect. The admin panel moved to
 * /mw-office; this path must never serve admin content again, so it sends
 * everyone to the homepage instead of revealing where the panel went.
 */
export default function AdminLegacyPage() {
  redirect("/");
}
