"use client";

import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Checkbox } from "@/components/ui/checkbox";

const Search = observer(() => {
  return (
    <div className="col-start-2 md:col-start-3 lg:col-start-3 col-span-4 lg:col-span-5 flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <h2>Поиск</h2>

        <div className="flex flex-col gap-2.5">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="regular bg-gray w-max px-5 flex gap-4"
                size="lg"
                variant="secondary"
              >
                <img src="/dots_black.svg" alt="Отчет" />
                <span className="regular">Параметры поиска</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[500px] gap-10">
              <DialogTitle className="hidden">Параметры поиска</DialogTitle>
              <div className="flex flex-col gap-5">
                <h2>Таблица</h2>
                <p className="regular">
                  Выберите таблицу, по которой будет производиться поиск
                </p>
                <Select>
                  <SelectTrigger className="w-full regular bg-gray" size="lg">
                    <SelectValue placeholder="Таблица" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="regular" value="table1">
                      Таблица 1
                    </SelectItem>
                    <SelectItem className="regular" value="table2">
                      Таблица 2
                    </SelectItem>
                    <SelectItem className="regular" value="table3">
                      Таблица 3
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-5">
                <h2>Столбец</h2>
                <p className="regular">
                  Выберите столбец, по которому проводится поиск, если вам нужна
                  более точная выборка
                </p>
                <Select>
                  <SelectTrigger className="w-full regular bg-gray" size="lg">
                    <SelectValue placeholder="Столбец" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="regular" value="table1">
                      Столбец 1
                    </SelectItem>
                    <SelectItem className="regular" value="table2">
                      Столбец 2
                    </SelectItem>
                    <SelectItem className="regular" value="table3">
                      Столбец 3
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-row gap-5 items-center">
                <p className="regular">Регулярные выражения</p>
                <Checkbox className="w-6 h-6 stroke-0 bg-gray rounded-d" />
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

          <div className="flex flex-row gap-2.5 items-center">
            <input
              type="text"
              className="regular bg-gray w-full h-10 px-5 flex gap-4 rounded-d"
              placeholder="Поиск..."
            />
            <Button
              variant="secondary"
              className="w-10 h-10 justify-center items-center"
              size="icon"
              onClick={() => router.push("/report")}
            >
              <img src="/right.svg" alt="Отчет" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <h2>Тут ничего нет</h2>
          <p className="regular">
            Совершить поиск по строкам таблицы, на самом деле, очень просто!
          </p>
        </div>
        <div className="flex flex-row gap-5">
          <div className="flex flex-col gap-5 w-full">
            <img src="/digit_1.png" alt="" />
            <p className="regular">
              Откройте <b>Параметры поиска</b> и выберите таблицу, по которой
              будет проводиться поиск. По умолчанию - это таблица с исходными
              данными
            </p>
          </div>
          <div className="flex flex-col gap-5 w-full">
            <img src="/digit_2.png" alt="" />
            <p className="regular">
              Также вы можете отметить столбец, по которому проводится поиск,
              если вам нужна более точная выборка
            </p>
          </div>
          <div className="flex flex-col gap-5 w-full">
            <img src="/digit_3.png" alt="" />
            <p className="regular">
              Используйте синтаксис <b>Регулярных выражений</b>, если столбец в
              вашей строке содержит много лишних символов. Для этого включите
              эту функцию в <b>Параметрах поиска</b>
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

export default Search;
