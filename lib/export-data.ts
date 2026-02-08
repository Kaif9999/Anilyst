/**
 * Export data as CSV or JSON (#19 - Data export functionality).
 */

export function downloadCSV(data: Record<string, unknown>[] | unknown[], filename = "export.csv") {
  if (data.length === 0) return;
  const keys = Object.keys(data[0] as Record<string, unknown>);
  const header = keys.join(",");
  const rows = (data as Record<string, unknown>[]).map((row) =>
    keys.map((k) => {
      const v = row[k];
      const s = v === null || v === undefined ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/\.csv$/i, "") + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: unknown, filename = "export.json") {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/\.json$/i, "") + ".json";
  a.click();
  URL.revokeObjectURL(url);
}
