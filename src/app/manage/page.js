"use client";

import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { Grid } from "react-loader-spinner";
import { useState, useEffect } from "react";
import SearchState from "@/server_components/SearchState";
import InitialDataState from "@/server_components/InitialDataState";
import ReportsStete from "@/server_components/ReportsStete";
import { toast } from "sonner";
import { getTables } from "@/server_components/database";
import Link from "next/link";
import { X } from "lucide-react";
import * as XLSX from "xlsx";

const Manage = observer(() => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [isInitialTableSelected, setIsInitialTableSelected] = useState(false);

  function onSelect(table) {
    setSelectedTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  }

  function deleteTables() {
    if (selectedTables.length === 0) {
      toast.warning("Выберите таблицы для удаления");
      return;
    }

    const confirmed = confirm(
      "Вы уверены, что хотите удалить выбранные таблицы?"
    );
    if (!confirmed) return;

    selectedTables.forEach((table) => {
      switch (table.type) {
        case "data":
          InitialDataState.database.clearTable(table.id);
          break;
        case "search":
          SearchState.deleteSearchQuery(table.id);
          break;
        case "report":
          ReportsStete.deleteReport(table.id);
          break;
      }
    });

    // Обновляем список таблиц
    setTables((prev) =>
      prev.filter((t) => !selectedTables.some((s) => s.id === t.id))
    );

    // Очищаем выбор
    setSelectedTables([]);

    toast.success("Удаление завершено");
  }

  function syncTables() {
    if (selectedTables.length === 0) {
      toast.warning("Выберите таблицы для синхронизации");
      return;
    }

    selectedTables.forEach((table) => {
      switch (table.type) {
        case "search":
          const searchQuery = SearchState.searchQueries.get(table.id);
          if (searchQuery?.updateData) searchQuery.updateData();
          break;
        case "report":
          const report = ReportsStete.reports.find((r) => r.id === table.id);
          if (report?.updateData) report.updateData();
          break;
        case "data":
          // ничего не делать
          break;
      }
    });

    toast.success("Синхронизация завершена");
  }

  function exportTables() {
    if (selectedTables.length === 0) {
      toast.warning("Выберите таблицы для экспорта");
      return;
    }

    const wb = XLSX.utils.book_new();
    selectedTables.forEach((table) => {
      let data;

      try {
        switch (table.type) {
          case "search":
            data = SearchState.searchQueries.get(table.id).tableState.jsonData;
            break;
          case "report":
            data = ReportsStete.reports.find((r) => r.id === table.id)
              .tableState.jsonData;
            break;
          case "data":
            data = InitialDataState.jsonData;
            break;
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const sheetName = table.name;
        XLSX.utils.book_append_sheet(wb, worksheet, sheetName.slice(0, 31)); // Excel ограничивает длину имени листа
      } catch (error) {
        console.error("Ошибка экспорта таблицы", table, error);
        toast.error(`Ошибка при экспорте таблицы: ${table.name}`);
      }
    });

    XLSX.writeFile(wb, "tables_export.xlsx");
    toast.success("Экспорт завершён");
  }

  useEffect(() => {
    let result = [];
    getTables().then((tables) => {
      for (let table of tables) {
        let tableData = {
          id: table.id,
          sqlName: table.name,
          name: "",
          type: table.type,
        };
        switch (table.type) {
          case "search":
            tableData.name = SearchState.searchQueries.get(table.id).name;
            break;
          case "report":
            tableData.name = ReportsStete.reports.find(
              (t) => t.id == table.id
            ).name;
            break;
        }
        result.push(tableData);
      }
      setTables(result);
      console.log(result);
      setIsLoaded(true);
    });
  }, []);

  return (
    <>
      {isLoaded ? (
        <div className="col-start-2 col-span-5 flex flex-col gap-10 p-2.5 box-border pb-40">
          <div className="flex flex-col gap-5">
            <h2>Менеджен таблиц</h2>
            <span className="regular">
              Редактируйте, удаляйте и добавляейте новые таблицы в свою базу
              данных
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <h2>Загруженные таблицы</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-5">
              <div className="h-80 bg-gray flex box-border p-5 flex-col justify-between rounded-d">
                <header className="flex flex-col gap-2.5">
                  <Link href="/">
                    <h2>Исходные данные</h2>
                  </Link>
                  <span className="regular">data</span>
                </header>
                <Button
                  className={`w-full ${
                    isInitialTableSelected
                      ? "bg-green text-background"
                      : "bg-background"
                  }`}
                  variant="ghost"
                  size="lg"
                  onClick={() =>
                    setIsInitialTableSelected(!isInitialTableSelected)
                  }
                >
                  {isInitialTableSelected ? (
                    <X color="background" width={12} height={12} />
                  ) : (
                    <img src="/check.svg" alt="Выбрать" />
                  )}
                  <span className="regular">
                    {isInitialTableSelected ? "Отменить" : "Выбрать"}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div
            className={
              tables.filter((t) => t.type == "report").length != 0
                ? "flex flex-col gap-5"
                : "hidden"
            }
          >
            <h2>Сформированные отчеты</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-5">
              {tables.map((t) => {
                if (t.type == "report")
                  return (
                    <div
                      key={t.id}
                      className="h-80 bg-gray flex box-border p-5 flex-col justify-between rounded-d"
                    >
                      <header className="flex flex-col gap-2.5">
                        <Link href={`/report/${t.id}`}>
                          <h2>{t.name}</h2>
                        </Link>
                        <span className="regular">{t.sqlName}</span>
                      </header>
                      <Button
                        className={`w-full ${
                          selectedTables.includes(t)
                            ? "bg-green text-background"
                            : "bg-background"
                        }`}
                        variant="ghost"
                        size="lg"
                        onClick={() => onSelect(t)}
                      >
                        {selectedTables.includes(t) ? (
                          <X color="background" width={12} height={12} />
                        ) : (
                          <img src="/check.svg" alt="Выбрать" />
                        )}
                        <span className="regular">
                          {selectedTables.includes(t) ? "Отменить" : "Выбрать"}
                        </span>
                      </Button>
                    </div>
                  );
              })}
            </div>
          </div>

          <div
            className={
              tables.filter((t) => t.type == "search").length != 0
                ? "flex flex-col gap-5"
                : "hidden"
            }
          >
            <h2>Поисковые запросы</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-5">
              {tables.map((t) => {
                if (t.type == "search")
                  return (
                    <div
                      key={t.id}
                      className="h-80 bg-gray flex box-border p-5 flex-col justify-between rounded-d"
                    >
                      <header className="flex flex-col gap-2.5">
                        <Link href={`/search/${t.id}`}>
                          <h2>{t.name}</h2>
                        </Link>
                        <span className="regular">{t.sqlName}</span>
                      </header>
                      <Button
                        className={`w-full ${
                          selectedTables.includes(t)
                            ? "bg-green text-background"
                            : "bg-background"
                        }`}
                        variant="ghost"
                        size="lg"
                        onClick={() => onSelect(t)}
                      >
                        {selectedTables.includes(t) ? (
                          <X color="background" width={12} height={12} />
                        ) : (
                          <img src="/check.svg" alt="Выбрать" />
                        )}
                        <span className="regular">
                          {selectedTables.includes(t) ? "Отменить" : "Выбрать"}
                        </span>
                      </Button>
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="col-start-2 md:col-start-3 col-span-3 h-full flex items-center justify-center">
          <Grid height="50" width="50" className="bg-green" />
        </div>
      )}

      <div className="fixed z-10 bottom-0 left-0 w-screen flex justify-center items-center p-5">
        <nav className="flex flex-row gap-5 rounded-d bg-foreground/30 py-2.5 px-10 items-center">
          <Button
            variant="secondary"
            className="w-10 h-10 justify-center items-center"
            size="icon"
            onClick={() => toast.info("Создание пока не реализовано")}
          >
            <img src="/plus.svg" alt="Создать" />
          </Button>

          <div className="w-[1px] h-8 border-l-[2px] border-background" />

          <Button
            variant="secondary"
            className="w-10 h-10 justify-center items-center"
            size="icon"
            disabled={selectedTables.length == 0 && !isInitialTableSelected}
            onClick={deleteTables}
          >
            <img src="/trash.svg" alt="Удалить" />
          </Button>

          <div className="w-[1px] h-8 border-l-[2px] border-background" />

          <Button
            variant="secondary"
            className="w-10 h-10 justify-center items-center"
            size="icon"
            disabled={selectedTables.length == 0 && !isInitialTableSelected}
            onClick={syncTables}
          >
            <img src="/sync.svg" width={22} height={22} alt="Обновить" />
          </Button>

          <div className="w-[1px] h-8 border-l-[2px] border-background" />

          <Button
            variant="secondary"
            className="w-10 h-10 justify-center items-center"
            size="icon"
            disabled={selectedTables.length == 0 && !isInitialTableSelected}
            onClick={exportTables}
          >
            <img src="/download.svg" alt="Экспортировать" />
          </Button>

          <div className="w-[1px] h-8 border-l-[2px] border-background" />

          <Button
            variant="ghost bg-background/50"
            className="w-10 h-10 justify-center items-center"
            size="icon"
            onClick={() => toast("Дополнительные действия пока не реализованы")}
          >
            <img src="/dots.svg" alt="Другое" />
          </Button>
        </nav>
      </div>
    </>
  );
});

export default Manage;
