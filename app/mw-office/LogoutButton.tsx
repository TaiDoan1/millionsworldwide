"use client";

/**
 * "Logout" for HTTP Basic Auth: there is no server-side session to end,
 * so this navigates to /mw-office with deliberately wrong credentials.
 * The browser replaces the saved login with the bogus one, gets a 401,
 * and shows the login prompt again — the next visit asks for the
 * password. (If a browser keeps the old login anyway, closing the tab
 * and reopening it clears it.)
 */
export default function LogoutButton() {
  function handleLogout() {
    const { protocol, host } = window.location;
    // Full-page navigation with bogus credentials is the whole point:
    // router.push() would reuse the saved login and stay logged in.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `${protocol}//dang-xuat:dang-xuat@${host}/mw-office`;
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="border border-neutral-300 bg-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:border-black transition-colors"
    >
      Đăng xuất
    </button>
  );
}
