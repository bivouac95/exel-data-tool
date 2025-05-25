"use client";

import { observer } from "mobx-react-lite";
import { useMemo } from "react";

const Table = observer(({ tableState }) => {
  const { columns, rows, rowOrder } = tableState;

  const memoizedRows = useMemo(
    () =>
      rowOrder.map((rowId) => {
        const row = rows.get(rowId);
        return (
          <div
            key={row.id}
            className="min-h-12 flex flex-row gap-4 py-2.5 box-border rounded-d bg-gray"
          >
            {row.values.map((value) => (
              <div
                key={value.id}
                className="w-[var(--col-width)] flex box-border px-2.5"
              >
                <span className="truncate w-full regular">{value.value}</span>
              </div>
            ))}
          </div>
        );
      }),
    [rowOrder, rows]
  );

  return (
    <div className="w-min flex flex-col gap-1.5">
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
      <div className="flex flex-col gap-[2px]">{memoizedRows}</div>
    </div>
  );
});

export default Table;
