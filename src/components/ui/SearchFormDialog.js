"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getTables, getColumns } from "@/server_components/database";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

const SearchFormDialog = ({ onSubmit }) => {
  const [tableList, setTableList] = useState([]);
  const [columnList, setColumnList] = useState([]);

  useEffect(() => {
    getTables().then((tables) => {
      setTableList(tables);
    });
  }, []);

  const {
    control,
    handleSubmit: rhfSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      tableName: "data",
      column: "",
      regex: false,
    },
  });

  const selectedTable = useWatch({ control, name: "tableName" });

  useEffect(() => {
    if (selectedTable) {
      getColumns(selectedTable).then((columns) => {
        setColumnList(columns.map((c) => ({ id: nanoid(), name: c })));
      });
    } else {
      setColumnList([]);
    }
  }, [selectedTable]);

  // Обёртка для отправки: формируем массив столбцов
  const onFormSubmit = (data) => {
    const cols = data.column ? [data.column] : columnList.map((c) => c.name);
    onSubmit({
      tableName: data.tableName,
      columns: cols,
      regex: data.regex,
    });
  };

  return (
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
      <DialogContent className="w-[500px]">
        <form
          onSubmit={rhfSubmit(onFormSubmit)}
          className="flex flex-col gap-10"
        >
          <DialogTitle className="hidden">Параметры поиска</DialogTitle>
          <div className="flex flex-col gap-5">
            <h2>Таблица</h2>
            <p className="regular">
              Выберите таблицу, по которой будет производиться поиск
            </p>
            <Controller
              name="tableName"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full regular bg-gray" size="lg">
                    <SelectValue placeholder="Таблица" />
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
              )}
            />
            {errors.tableName && (
              <span className="text-red-500">Обязательное поле</span>
            )}
          </div>

          {/* Выбор столбца */}
          <div className="flex flex-col gap-5">
            <h2>Столбец</h2>
            <p className="regular">Выберите столбец для более точной выборки</p>
            <Controller
              name="column"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedTable}
                >
                  <SelectTrigger
                    className="w-full regular bg-gray"
                    size="lg"
                    disabled={!selectedTable}
                  >
                    <SelectValue placeholder="Столбец" />
                  </SelectTrigger>
                  <SelectContent>
                    {columnList.map((col) => (
                      <SelectItem
                        key={col.id}
                        className="regular"
                        value={col.name}
                      >
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Регулярные выражения */}
          <div className="flex flex-row gap-5 items-center">
            <p className="regular">Регулярные выражения</p>
            <Controller
              name="regex"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="w-6 h-6 stroke-0 bg-gray rounded-d"
                />
              )}
            />
          </div>

          <DialogFooter>
            <div className="flex flex-row w-full gap-5">
              <DialogClose asChild>
                <Button
                  className="regular bg-gray w-max px-5 gap-4"
                  size="lg"
                  variant="secondary"
                  type="button"
                >
                  <img src="/close.svg" alt="Закрыть" />
                  <span className="regular">Закрыть</span>
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  className="regular bg-gray w-max px-5 gap-4"
                  size="lg"
                  variant="secondary"
                  type="submit"
                >
                  <img src="/check.svg" alt="Применить" />
                  <span className="regular">Применить</span>
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SearchFormDialog;
