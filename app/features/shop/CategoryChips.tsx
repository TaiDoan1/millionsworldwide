import { CHIPS, type FilterKey } from "./shop-options";

/** Category chips — swipeable row on mobile, centred wrap on desktop. */
export default function CategoryChips({
  filter,
  onFilter,
}: {
  filter: FilterKey;
  onFilter: (key: FilterKey) => void;
}) {
  return (
    <div className="flex flex-nowrap items-center gap-[0.6875rem] overflow-x-auto pb-1 min-[1040px]:flex-wrap min-[1040px]:justify-center min-[1040px]:gap-[1.09375rem] min-[1040px]:overflow-visible">
      {CHIPS.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onFilter(chip.key)}
          className={`whitespace-nowrap rounded-full border border-black px-[max(0.9375rem,1.38889vw)] py-[max(0.5rem,0.694444vw)] text-[max(0.75rem,1.22917vw)] font-normal uppercase leading-[1.2] transition-colors duration-300 ${
            filter === chip.key
              ? "bg-[#67645e] text-white"
              : "bg-white text-black hover:bg-black hover:text-white"
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
