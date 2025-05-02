import { nanoid } from "nanoid";
import { observer } from "mobx-react-lite";

const Table = observer(({ columns, rows }) => {
  return (
    <div className="absolute -z-10 flex flex-col gap-1.5">
      <div className="flex flex-row gap-4 py-5 bg-gray rounded-d">
        {columns.map((column) => (
          <div
            key={column.id}
            className="w-[var(--col-width)] flex box-border px-2.5"
          >
            <h2 className="truncate w-full">{column.name}</h2>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-[2px]">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`min-h-12 flex flex-row gap-4 py-2.5 rounded-d ${
              row.editing ? "bg-green/70" : "bg-gray"
            }`}
          >
            {row.values.map((value) => (
              <div
                key={nanoid()}
                className="w-[var(--col-width)] flex box-border px-2.5"
              >
                <span className="truncate w-full regular">{value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

export default Table;
