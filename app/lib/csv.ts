/** One CSV row, quoted and escaped. Pure helper — safe to import from
 *  server components (unlike helpers exported out of "use client" files,
 *  which Next forbids calling on the server). */
export function csvRow(values: (string | number)[]): string {
  return (
    values
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",") + "\n"
  );
}
