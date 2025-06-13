"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getTables, getBetterColumns } from "@/server_components/database";
import InitialDataState from "@/server_components/InitialDataState";
import SearchState from "@/server_components/SearchState";
import ReportsStete from "@/server_components/ReportsStete";

export default function PressetsForm({ setString }) {
  const [tableList, setTableList] = useState([]);
  const [columnList, setColumnList] = useState([]);

  const [tableName, setTableName] = useState("data");
  const [columnName, setColumnName] = useState("");

  useEffect(() => {
    getTables().then((tables) => {
      setTableList(tables);
    });
    getBetterColumns("data").then((cols) => setColumnList(cols));
  }, []);

  useEffect(() => {
    getBetterColumns(tableName).then((cols) => setColumnList(cols));
  }, [tableName]);

  const methods = [
    {
      name: "Колличество строк таблицы",
      sql: `COUNT(*) FROM ${tableName}`,
      disabled: false,
    },
    {
      name: "Колличество строк с условием",
      sql: `COUNT(*) FROM ${tableName} WHERE [condition]`,
      disabled: false,
    },
    {
      name: "Результат проверка условия",
      sql: `[condition]`,
      disabled: false,
    },
    {
      name: "Сумма значений",
      sql: `SUM(${columnName}) FROM ${tableName}`,
      disabled: columnName == "",
    },
    {
      name: "Среднее значение",
      sql: `AVG(${columnName}) FROM ${tableName}`,
      disabled: columnName == "",
    },
    {
      name: "Максимальное значение",
      sql: `MAX(${columnName}) FROM ${tableName}`,
      disabled: columnName == "",
    },
    {
      name: "Минимальное значение",
      sql: `MIN(${columnName}) FROM ${tableName}`,
      disabled: columnName == "",
    },
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="regular text-foreground bg-background w-full px-5"
          size="lg"
          variant="secondary"
        >
          <span className="regular">Варианты</span>
        </Button>
      </DialogTrigger>
      <DialogHeader>
        <DialogTitle className="hidden">Готовые прессеты</DialogTitle>
      </DialogHeader>
      <DialogContent className="w-[500px] py-10">
        <div className="flex flex-col gap-5">
          <Select value={tableName} onValueChange={setTableName}>
            <SelectTrigger className="w-full regular bg-gray" size="lg">
              <SelectValue placeholder="Таблица" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="initialdata" className="regular" value="data">
                Таблица загруженных данных
              </SelectItem>
              {tableList.map((table) => (
                <SelectItem
                  key={table.id}
                  className="regular"
                  value={table.name}
                >
                  {table.readable_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={columnName} onValueChange={setColumnName}>
            <SelectTrigger className="w-full regular bg-gray" size="lg">
              <SelectValue placeholder="Колонка" />
            </SelectTrigger>
            <SelectContent>
              {columnList.map((column) => (
                <SelectItem
                  key={column.id}
                  className="regular"
                  value={column.sqlName}
                >
                  {column.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {methods.map((m) => {
            return (
              <Button
                key={m.name}
                className="regular text-foreground bg-background w-full px-5"
                variant="secondary"
                disabled={m.disabled}
                onClick={() => {
                  setString(m.sql);
                }}
              >
                {m.name}
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
