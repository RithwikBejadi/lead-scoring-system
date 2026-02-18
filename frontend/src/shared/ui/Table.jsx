/**
 * Table — dense developer-style data table.
 */
export function Table({ columns, rows, onRowClick, emptyMessage = "No data" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2.5 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                style={col.width ? { width: col.width } : {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-neutral-600 text-xs"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-white/[0.03] transition-colors ${
                  onRowClick
                    ? "cursor-pointer hover:bg-white/[0.03]"
                    : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-2.5 text-neutral-300 whitespace-nowrap"
                  >
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
