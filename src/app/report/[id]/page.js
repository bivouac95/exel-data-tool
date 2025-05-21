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
} from "@/components/ui/dialog";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Report = observer(() => {
  useEffect(() => {
    const getView = async () => {
      const views = await getViews();
      console.log(views);
    };

    getView();
  }, []);

  return (
    <div className="col-start-2 md:col-start-3 lg:col-start-3 col-span-3 md:col-span-4 lg:col-span-5 flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <h2>Отчет</h2>
        <div className="flex flex-col gap-2.5">
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
              <div className="flex flex-col gap-5">
                <h2>Колонки</h2>
                <p className="regular">
                  Добавьте необходимые вам колонки, выберите им имена и типы
                  данных
                </p>
                <Button
                  variant="secondary"
                  className="w-full flex gap-5"
                  size="lg"
                >
                  <img src="/plus.svg" alt="Добавить" />
                  <span className="regular">Добавить колонку</span>
                </Button>
              </div>

              <div className="flex flex-col gap-5">
                <h2>SQL выражение</h2>
                <p className="regular">
                  Введите SQL запрос для формирования нового отчета,
                  ориентируясь на подсказки
                </p>
                <textarea
                  className="regular bg-gray w-full h-30 p-5 resize-none rounded-d"
                  placeholder="SELECT * FROM table"
                ></textarea>
              </div>
              <DialogFooter>
                <div className="flex flex-row w-full gap-5">
                  <Button
                    className="regular bg-gray w-max px-5 flex-1/2 flex gap-4"
                    size="lg"
                    variant="secondary"
                  >
                    <img src="/close.svg" alt="Закрыть" />
                    <span className="regular">Закрыть</span>
                  </Button>
                  <Button
                    className="regular bg-gray w-max px-5 flex-1/2 flex gap-4"
                    size="lg"
                    variant="secondary"
                  >
                    <img src="/check.svg" alt="Применить" />
                    <span className="regular">Применить</span>
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <input
            type="text"
            className="regular bg-gray w-full h-10 px-5 flex gap-4 rounded-d"
            placeholder="Название отчета"
          />
          <Button
            className="regular bg-gray w-max px-5 flex gap-4"
            size="lg"
            variant="secondary"
          >
            <img src="/right.svg" alt="Выполнить" />
            <span className="regular">Выполнить</span>
          </Button>
        </div>

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
