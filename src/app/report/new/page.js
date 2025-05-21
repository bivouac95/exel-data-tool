"use client";

import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { getViews } from "@/server_components/database";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { executeQuery } from "@/server_components/database";

const Report = observer(() => {
  // Состояния для формы
  const [reportName, setReportName] = useState("");
  const [sqlQuery, setSqlQuery] = useState(
    "CREATE VIEW [reportName] AS SELECT * FROM data"
  );
  const [columns, setColumns] = useState([]);
  const [newColumn, setNewColumn] = useState({ name: "", type: "TEXT" });

  // Обработчики для формы
  const handleAddColumn = () => {
    if (newColumn.name.trim()) {
      setColumns([...columns, newColumn]);
      setNewColumn({ name: "", type: "TEXT" });
    }
  };

  const handleSubmit = () => {
    console.log("Отчет сохранен:", {
      reportName,
      sqlQuery,
      columns,
    });
    executeQuery(sqlQuery);
  };

  return (
    <div className="col-start-2 md:col-start-3 lg:col-start-3 col-span-3 md:col-span-4 lg:col-span-5 flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <h2>Отчет</h2>
        <div className="flex flex-col gap-2.5">
          {/* Диалог с параметрами отчета */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="regular bg-gray w-max px-5 flex gap-4"
                size="lg"
                variant="secondary"
              >
                <img src="/dots_black.svg" alt="Отчет" />
                <span className="regular">Параметры отчета</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[500px] gap-10">
              <DialogTitle className="hidden">Параметры отчета</DialogTitle>

              {/* Секция добавления колонок */}
              <div className="flex flex-col gap-5">
                <h2>Колонки</h2>
                <p className="regular">
                  Добавьте необходимые колонки, выберите им имена и типы данных
                </p>

                {/* Список добавленных колонок */}
                {columns.length > 0 && (
                  <div className="border rounded p-3 flex flex-col gap-5 box-border">
                    {columns.map((col, index) => (
                      <div
                        key={index}
                        className="w-full flex flex-row justify-between items-center"
                      >
                        <span className="regular">
                          {col.name} ({col.type})
                        </span>
                        <Button
                          variant="secondary"
                          className="flex gap-2"
                          size="lg"
                          onClick={() =>
                            setColumns(columns.filter((_, i) => i !== index))
                          }
                        >
                          <img src="/close.svg" alt="Удалить" />
                          <span className="regular">Удалить</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Форма добавления новой колонки */}
                <div className="flex gap-3 ">
                  <input
                    type="text"
                    className="flex-1/2 regular bg-gray p-2 rounded-d"
                    placeholder="Имя колонки"
                    value={newColumn.name}
                    onChange={(e) =>
                      setNewColumn({ ...newColumn, name: e.target.value })
                    }
                  />
                  <select
                    className="flex-1/2 regular bg-gray p-2 rounded-d"
                    value={newColumn.type}
                    onChange={(e) =>
                      setNewColumn({ ...newColumn, type: e.target.value })
                    }
                  >
                    <option value="TEXT">Текст</option>
                    <option value="INTEGER">Число</option>
                    <option value="DATE">Дата</option>
                    <option value="BOOLEAN">Логический</option>
                  </select>
                  <Button
                    variant="secondary"
                    className="w-10 h-10 justify-center items-center"
                    size="icon"
                    onClick={handleAddColumn}
                  >
                    <img src="/plus.svg" alt="Добавить" />
                  </Button>
                </div>
              </div>

              {/* Секция SQL запроса */}
              <div className="flex flex-col gap-5">
                <h2>SQL выражение</h2>
                <p className="regular">
                  Введите SQL запрос для формирования нового отчета
                </p>
                <textarea
                  className="regular bg-gray w-full h-30 p-5 resize-none rounded-d"
                  placeholder="CREATE VIEW"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                ></textarea>
              </div>

              <DialogFooter>
                <div className="flex flex-row w-full gap-5">
                  <DialogClose asChild>
                    <Button
                      className="regular bg-gray w-max px-5 flex-1/2 flex gap-4"
                      size="lg"
                      variant="secondary"
                    >
                      <img src="/close.svg" alt="Закрыть" />
                      <span className="regular">Закрыть</span>
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      className="regular bg-gray w-max px-5 flex-1/2 flex gap-4"
                      size="lg"
                      variant="secondary"
                      onClick={handleSubmit}
                    >
                      <img src="/check.svg" alt="Применить" />
                      <span className="regular">Применить</span>
                    </Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Поле для названия отчета */}
          <input
            id="report-name"
            type="text"
            className="regular bg-gray w-full h-10 px-5 rounded-d"
            placeholder="Введите название отчета"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />

          {/* Кнопка выполнения */}
          <Button
            className="regular bg-gray w-max px-5 flex gap-4"
            size="lg"
            variant="secondary"
            onClick={handleSubmit}
          >
            <img src="/right.svg" alt="Выполнить" />
            <span className="regular">Выполнить</span>
          </Button>
        </div>

        {/* Инструкция для пользователя */}
        <div className="flex flex-col gap-5">
          <h2>Тут ничего нет</h2>
          <p className="regular">
            Создать новый отчет, на самом деле, очень просто!
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          <div className="flex flex-col gap-5 w-full">
            <img src="/digit_1.png" alt="" />
            <p className="regular">Дайте название отчету</p>
          </div>
          <div className="flex flex-col gap-5 w-full">
            <img src="/digit_2.png" alt="" />
            <p className="regular">
              Откройте <b>Параметры отчета</b> и добавьте колонки, из которых
              состоит отчет. Дайте им названия и укажите их типы данных
            </p>
          </div>
          <div className="flex flex-col gap-5 w-full">
            <img src="/digit_3.png" alt="" />
            <p className="regular">
              Напишите <b>SQL запрос</b>, с помощью которого будет формироваться
              отчет
            </p>
          </div>
          <div className="flex flex-col gap-5 w-full">
            <img src="/digit_4.png" alt="" />
            <p className="regular">
              Сохраните или экспортируйте получившиеся данные как новый отчет
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Report;
