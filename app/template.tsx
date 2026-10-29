/**
 * Root template — unlike the layout, Next.js remounts this on every page
 * navigation (including between two product pages), so the CSS page
 * transition in .mw-page-transition replays on each route change. The
 * layout (global header, analytics) stays mounted and is unaffected.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="mw-page-transition">{children}</div>;
}
