import { nanoid } from "nanoid";

export default function Table({ headers, rows }) {
  return (
    <div className="w-full">
      <div className="w-full flex flex-col overflow-hidden gap-1.5">
        <div
          className={`grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6  gap-4 bg-gray font-semibold py-5 rounded-d`}
        >
          {headers.map((header) => (
            <div key={nanoid()} className="mx-2.5">
              <h2 className="truncate">
                {header}
              </h2>
            </div>
          ))}
        </div>
        <div className="bg-gray divide-y rounded-d">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 py-2.5 border-b-[2px] border-background`}
            >
              {row.values.map((value, idx) => (
                <div key={idx} className="regular truncate mx-2.5">
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
