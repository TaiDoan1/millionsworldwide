import { SORT_OPTIONS, type SortKey } from "./shop-options";

function GridIcon({ cols, active }: { cols: 2 | 3; active: boolean }) {
  const cells = cols === 2 ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <span
      className={`grid gap-[3px] ${cols === 2 ? "grid-cols-2" : "grid-cols-3"} ${
        active ? "opacity-100" : "opacity-30"
      }`}
    >
      {cells.map((c) => (
        <span key={c} className="h-[7px] w-[7px] bg-black" />
      ))}
    </span>
  );
}

/** Sort control + result count + 2/3-column layout toggle. */
export default function ShopToolbar({
  sort,
  sortLabel,
  sortOpen,
  onToggleSort,
  onCloseSort,
  onSelectSort,
  count,
  cols,
  onCols,
}: {
  sort: SortKey;
  sortLabel?: string;
  sortOpen: boolean;
  onToggleSort: () => void;
  onCloseSort: () => void;
  onSelectSort: (key: SortKey) => void;
  count: number;
  cols: 2 | 3;
  onCols: (cols: 2 | 3) => void;
}) {
  return (
    <div className="relative mt-5 flex items-center justify-between text-[#67645e] sm:mt-[2.25vw]">
      <div className="relative">
        <button
          type="button"
          onClick={onToggleSort}
          className="text-[clamp(0.875rem,0.830986rem+0.187793vw,1.25rem)] text-[#67645e]"
        >
          Sort: <span className="font-bold underline underline-offset-4">{sortLabel}</span>{" "}
          <span aria-hidden>▾</span>
        </button>
        <div
          className={`absolute left-0 top-full z-40 mt-3 w-[375px] max-w-[80vw] overflow-hidden rounded-[10px] bg-[#f1f0ed]/90 shadow-[0_24px_60px_rgba(0,0,0,0.15)] backdrop-blur-md transition-[max-height,opacity,visibility] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            sortOpen
              ? "visible max-h-[430px] opacity-100"
              : "invisible max-h-0 opacity-0"
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Sort by
              </span>
              <button
                type="button"
                aria-label="Close sort"
                onClick={onCloseSort}
                className="text-xl leading-none text-black"
              >
                –
              </button>
            </div>
            <ul className="max-h-[300px] overflow-y-auto">
              {SORT_OPTIONS.map((o) => (
                <li key={o.key}>
                  <button
                    type="button"
                    onClick={() => onSelectSort(o.key)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-lg lowercase transition-colors hover:bg-black/5 ${
                      sort === o.key ? "font-bold" : ""
                    }`}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-[clamp(0.875rem,0.830986rem+0.187793vw,1.25rem)] text-[#67645e]">{count} products</span>
        <button
          type="button"
          aria-label="2 column layout"
          onClick={() => onCols(2)}
        >
          <GridIcon cols={2} active={cols === 2} />
        </button>
        <button
          type="button"
          aria-label="3 column layout"
          onClick={() => onCols(3)}
        >
          <GridIcon cols={3} active={cols === 3} />
        </button>
      </div>
    </div>
  );
}
