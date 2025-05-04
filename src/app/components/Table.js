"use client";

import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";
import InitialDataState from "../server_components/InitialDataState";

const Table = observer(({ tableState }) => {
  const columns = tableState.columns;
  const rows = tableState.rows;
  const inputRef = useRef(null);
  const [editingCell, setEditingCell] = useState(null); // { rowId, cellId }
  
  // Автоматически фокусируем инпут при появлении
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleCellClick = (rowId, cellId) => {
    setEditingCell({ rowId, cellId});
  };

  const handleCellChange = (rowId, cellId, newValue) => {
    tableState.rows.find(row => row.id === rowId).changeValue(cellId, newValue);
  };
  
  const handleCellKeyDown = (e) => {
    if (e.key === "Enter") {
      setEditingCell(null);
    }
  };

  return (
    <div className="absolute flex flex-col gap-1.5">
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
                key={value.id}
                className="relative w-[var(--col-width)] flex box-border px-2.5 cursor-pointer"
                onClick={() => handleCellClick(row.id, value.id)}
              >
                {editingCell?.rowId === row.id && editingCell?.cellId === value.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={value.value}
                    onChange={(e) => handleCellChange(row.id, value.id, e.target.value)}
                    onKeyDown={(e) => handleCellKeyDown(e)}
                    className="absolute left-0 -top-2.5 regular w-full min-h-12 px-2.5 py-1.5 border-2 bg-background border-green"
                  />
                ) : (
                  <span className="truncate w-full regular">{value.value}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

export default Table;
