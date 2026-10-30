"use client";

/** Download a CSV string as a file (BOM included so Excel reads UTF-8). */
export default function CsvButton({
  filename,
  csv,
  label,
}: {
  filename: string;
  csv: string;
  label: string;
}) {
  function handleClick() {
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="border border-black bg-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
    >
      {label}
    </button>
  );
}
