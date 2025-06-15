"use client";

import { observer, useLocalObservable } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { makeAutoObservable } from "mobx";
import InitialDataState from "@/server_components/InitialDataState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import {
  asyncTransliterate,
  getTables,
  getBetterColumns,
} from "@/server_components/database";
import { getReportsState } from "@/server_components/statesManager";
import { nanoid } from "nanoid";
import PressetsForm from "@/components/ui/PressetsForm";
import ReportsStete from "@/server_components/ReportsStete";
import { useRouter } from "next/navigation";
import { SquareLoader } from "react-spinners";

class FormColumn {
  constructor(defaultColumns) {
    this.id = nanoid();
    this.name = "";
    this.sqlName = "";
    this.sqlQuery = "";

    this.formationMethod = "table"; // table || sql
    this.tableName = "data";
    this.tableColumns = defaultColumns;
    this.columnName = "";
    makeAutoObservable(this);
  }

  async setName(name) {
    this.name = name;
    this.sqlName = await asyncTransliterate(name);
  }

  setSqlQuery(sqlQuery) {
    this.sqlQuery = sqlQuery;
  }

  async setFormationMethod(method) {
    this.formationMethod = method;
    if (method == "table") this.setTableName("data");
    if (method == "sql") {
      this.sqlQuery = "";
      this.tableName = "";
      this.columnName = "";
    }
  }

  async setTableName(name) {
    this.tableName = name;
    this.tableColumns = await getBetterColumns(this.tableName);
  }

  async setColumnName(name) {
    this.columnName = name;
    this.sqlName = name;
    this.name = this.tableColumns.find((c) => c.sqlName == name).name;
    if (this.formationMethod == "table") this.sqlQuery = `${name}`;
  }
}

class FormColumns {
  constructor() {
    this.columns = new Map();
    this.columnsOrder = [];
    this.reportName = "";
    makeAutoObservable(this);
  }

  setReportName(name) {
    this.reportName = name;
  }

  async addColumn() {
    const defaultColumns = InitialDataState.columns;
    const column = new FormColumn(defaultColumns);
    this.columns.set(column.id, column);
    this.columnsOrder.push(column.id);
  }

  deleteColumn(id) {
    this.columns.delete(id);
    this.columnsOrder = this.columnsOrder.filter((colId) => colId !== id);
  }

  async handleSubmit(state) {
    let res = [];
    for (let formColumnId of this.columnsOrder) {
      const column = this.columns.get(formColumnId);
      const criteria = {
        name: column.name,
        table: column.tableName,
        sqlName: column.sqlName,
        sqlQuery: column.sqlQuery,
      };
      res.push(criteria);
    }

    const report = await state.addReport(this.reportName, res);
    return report;
  }

  get isDisabled() {
    if (!this.reportName.trim()) return true;
    if (this.columns.size === 0) return true;

    for (const columnId of this.columnsOrder) {
      const col = this.columns.get(columnId);
      if (col.formationMethod === "table") {
        if (!col.tableName || !col.columnName) return true;
      } else if (col.formationMethod === "sql") {
        if (!col.name.trim() || !col.sqlQuery.trim()) return true;
      }
    }

    return false;
  }
}

const Report = observer(() => {
  const [loadedReports, setLoadedReports] = useState({});
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(true);
  const [tableList, setTableList] = useState([]);
  const forms = useLocalObservable(() => new FormColumns());

  useEffect(() => {
    getTables().then((tables) => {
      setTableList(tables);
    });
    getReportsState().then((state) => {
      setLoadedReports(state);
    });
  }, []);

  async function onSubmit() {
    setIsLoaded(false);
    const report = await forms.handleSubmit(loadedReports);
    router.push(`/report/${report.id}`);
  }

  return (
    <>
      {isLoaded ? (
        <div className="max-mobile:col-start-1 col-start-2 md:col-start-3 lg:col-start-3 max-mobile:col-span-2 col-span-3 md:col-span-4 lg:col-span-5 flex flex-col gap-10 px-2.5">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <h2>Отчет</h2>
              <div className="flex flex-col gap-5">
                <input
                  id="report-name"
                  type="text"
                  className="regular bg-gray w-full h-10 px-5 rounded-d"
                  placeholder="Введите название отчета"
                  value={forms.reportName}
                  onChange={(e) => forms.setReportName(e.target.value)}
                />
                <div className="flex flex-col gap-2.5">
                  <h2>Колонки</h2>
                  <p>
                    Добавьте новые колонки и укажите правила, по которым они
                    формируются
                  </p>
                </div>
                <div className="flex flex-row gap-5">
                  <Button
                    onClick={() => {
                      forms.addColumn();
                    }}
                    className="regular bg-gray w-max px-5 flex gap-4"
                    size="lg"
                    variant="secondary"
                  >
                    <img src="/plus.svg" alt="Выполнить" />
                    <span className="regular">Добавить колонку</span>
                  </Button>

                  <Button
                    onClick={onSubmit}
                    disabled={forms.isDisabled}
                    className="regular bg-gray w-max px-5 flex gap-4"
                    size="lg"
                    variant="secondary"
                  >
                    <img src="/right.svg" alt="Выполнить" />
                    <span className="regular">Выполнить</span>
                  </Button>
                </div>
              </div>
            </div>

            {forms.columns.size != 0 ? (
              <div className="flex flex-row gap-5">
                {forms.columnsOrder.map((columnId) => (
                  <div
                    key={columnId}
                    className="flex flex-col gap-10 bg-gray p-5 rounded-d w-full max-w-[230px] md:max-w-[200px] lg:max-w-[230px] h-min"
                  >
                    <Button
                      onClick={() => forms.deleteColumn(columnId)}
                      className="regular bg-background w-full px-5 flex gap-4"
                      size="lg"
                      variant="secondary"
                    >
                      <img
                        src="/trash.svg"
                        width={18}
                        height={18}
                        alt="Удалить"
                      />
                      <span className="regular">Удалить</span>
                    </Button>

                    <div className="flex flex-col gap-5">
                      <label className="regular">Метод формиования</label>
                      <Select
                        onValueChange={(e) =>
                          forms.columns.get(columnId).setFormationMethod(e)
                        }
                        value={forms.columns.get(columnId).formationMethod}
                      >
                        <SelectTrigger
                          className="w-full regular bg-background"
                          size="lg"
                        >
                          <SelectValue placeholder="Выберите метод формиования" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className="regular" value="table">
                            Из другой таблицы
                          </SelectItem>
                          <SelectItem className="regular" value="sql">
                            SQL запрос
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {forms.columns.get(columnId).formationMethod === "table" ? (
                      <>
                        <div className="flex flex-col gap-5">
                          <label className="regular">Таблица</label>
                          <Select
                            onValueChange={(e) =>
                              forms.columns.get(columnId).setTableName(e)
                            }
                            value={forms.columns.get(columnId).tableName}
                          >
                            <SelectTrigger
                              className="w-full regular bg-background"
                              size="lg"
                            >
                              <SelectValue placeholder="Выберите таблицу" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                key="initialdata"
                                className="regular"
                                value="data"
                              >
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
                        </div>

                        <div className="flex flex-col gap-5">
                          <label className="regular">Колонка</label>
                          <Select
                            value={forms.columns.get(columnId).columnName}
                            onValueChange={(e) =>
                              forms.columns.get(columnId).setColumnName(e)
                            }
                          >
                            <SelectTrigger
                              className="w-full regular bg-background"
                              size="lg"
                            >
                              <SelectValue placeholder="Выберите колонку" />
                            </SelectTrigger>
                            <SelectContent>
                              {forms.columns
                                .get(columnId)
                                .tableColumns.map((col) => (
                                  <SelectItem
                                    className="regular"
                                    key={col.id}
                                    value={col.sqlName}
                                  >
                                    {col.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col gap-5">
                          <label className="regular">Название</label>
                          <input
                            value={forms.columns.get(columnId).name}
                            onChange={(e) =>
                              forms.columns
                                .get(columnId)
                                .setName(e.target.value)
                            }
                            className="bg-background regular rounded-d px-5 py-1"
                            placeholder="Название"
                          />
                        </div>
                        <div className="flex flex-col gap-5">
                          <label className="regular">Текст запроса</label>
                          <textarea
                            value={forms.columns.get(columnId).sqlQuery}
                            onChange={(e) =>
                              forms.columns
                                .get(columnId)
                                .setSqlQuery(e.target.value)
                            }
                            className="bg-background regular rounded-d px-5 py-1 h-32"
                            placeholder="SQL..."
                          />
                          <PressetsForm
                            setString={(string) =>
                              forms.columns.get(columnId).setSqlQuery(string)
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2.5">
                  <h2>Тут ничего нет</h2>
                  <p className="regular">
                    Создать новый отчет, на самом деле, очень просто!
                  </p>
                </div>

                <div className="grid max-mobile-sm:grid-cols-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  <div className="flex flex-col gap-5 w-full">
                    <img src="/digit_1.png" alt="" />
                    <p className="regular">Дайте название отчету</p>
                  </div>
                  <div className="flex flex-col gap-5 w-full">
                    <img src="/digit_2.png" alt="" />
                    <p className="regular">
                      Откройте <b>Параметры отчета</b> и добавьте колонки, из
                      которых состоит отчет. Дайте им названия и укажите их типы
                      данных
                    </p>
                  </div>
                  <div className="flex flex-col gap-5 w-full">
                    <img src="/digit_3.png" alt="" />
                    <p className="regular">
                      Напишите <b>SQL запрос</b>, с помощью которого будет
                      формироваться отчет
                    </p>
                  </div>
                  <div className="flex flex-col gap-5 w-full">
                    <img src="/digit_4.png" alt="" />
                    <p className="regular">
                      Сохраните или экспортируйте получившиеся данные как новый
                      отчет
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="max-mobile:col-start-1 col-start-2 md:col-start-3 col-span-3 h-full flex items-center justify-center">
          <SquareLoader height="50" width="50" color="#30A65F" />
        </div>
      )}
    </>
  );
});

export default Report;
