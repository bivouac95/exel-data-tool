"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { toast } from "sonner";

const Table = observer(({ tableState }) => {
  const { columns, rows, rowOrder } = tableState;
  const inputRef = useRef(null);
  const [editingCell, setEditingCell] = useState(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (editingCell && inputRef.current) {
      const row = rows.get(editingCell.rowId);
      const cell = row?.values.find((v) => v.id === editingCell.cellId);
      setInputValue(cell?.value || "");

      inputRef.current.focus();
      inputRef.current.select();
    } else {
      setInputValue("");
    }
  }, [editingCell, rows]);

  const handleCellClick = (rowId, cellId) => setEditingCell({ rowId, cellId });

  const sanitizeInput = (input) =>
    String(input)
      .replace(/<script.*?>.*?<\/script>/gi, "")
      .trim();

  const isValidInput = (input) =>
    typeof input === "string" && input.length <= 255;

  const handleSubmit = () => {
    if (!editingCell) return;

    const sanitizedValue = sanitizeInput(inputValue);
    if (!isValidInput(sanitizedValue)) return;
    // Валидация по типу столбца
    const { rowId, cellId } = editingCell;
    const row = rows.get(rowId);
    const cellIndex = row.values.findIndex((v) => v.id === cellId);
    const columnType = columns[cellIndex].type;
    const columnName = columns[cellIndex].name;

    if (columnType === "REAL" && !/^[-+]?\d+(\.\d+)?$/.test(sanitizedValue)) {
      toast(
        `Значение ячейки ${columnName} должно быть числом с плавающей точкой, получено: "${sanitizedValue}"`
      );
      return;
    }

    // Общий код для обоих случаев
    handleCellChange(rowId, cellId, sanitizedValue);
    tableState.updateRowSQL(rowId);
    setEditingCell(null);
  };

  const handleCellChange = (rowId, cellId, newValue) => {
    const row = rows.get(rowId);
    row?.changeValue(cellId, newValue);
  };

  const handleCellKeyDown = (e) => {
    if (e.key === "Enter" && editingCell) {
      try {
        handleSubmit();
      } catch (err) {
        console.error(err.message);
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const memoizedRows = useMemo(
    () =>
      rowOrder.map((rowId) => {
        const row = rows.get(rowId);
        return (
          <div
            key={row.id}
            className="min-h-12 flex flex-row gap-4 py-2.5 box-border rounded-d bg-gray"
          >
            {row.values.map((value) => {
              const isEditing =
                editingCell?.rowId === row.id &&
                editingCell?.cellId === value.id;
              return (
                <div
                  key={value.id}
                  className="relative w-[var(--col-width)] flex box-border px-2.5 cursor-pointer"
                  onClick={() => handleCellClick(row.id, value.id)}
                >
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleCellKeyDown}
                      onBlur={handleSubmit}
                      className="absolute left-0 -top-2.5 regular w-full min-h-12 px-2.5 py-1.5 border-2 bg-background border-green"
                    />
                  ) : (
                    <span className="truncate w-full regular">
                      {value.value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      }),
    [rowOrder, rows, editingCell, inputValue]
  );

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
      <div className="flex flex-col gap-[2px]">{memoizedRows}</div>
    </div>
  );
});

export default Table;
