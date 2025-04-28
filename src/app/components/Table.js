import { nanoid } from "nanoid";

export default function Table({ headers, rows }) {
  return (
    <div className="w-full">
      <div className="w-full bg-gray rounded-[var(--radius-d)] overflow-hidden">

        <div className="grid grid-cols-5 gap-4 bg-gray text-dark-gray text-sm font-semibold px-6 py-3">
          {headers.map((header) => (
            <div key={nanoid()} className="truncate">
              {header}
            </div>
          ))}
        </div>

        <div className="bg-background divide-y divide-gray">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-5 gap-4 px-6 py-3 text-foreground text-sm"
            >
              {row.values.map((value, idx) => (
                <div key={idx} className="truncate">
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
