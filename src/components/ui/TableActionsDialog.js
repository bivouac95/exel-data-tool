"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { useEffect, useState } from "react";
import { clearDatabase, clearTable } from "@/server_components/database";

import {
  getSearchState,
  getInitialDataState,
  getReportsState,
} from "@/server_components/statesManager";

export default function TableActionsDialog() {
  const [loadedReports, setLoadedReports] = useState({});
  const [loadedSearch, setLoadedSearch] = useState({});
  const [loadedData, setLoadedData] = useState({});

  useEffect(() => {
    getSearchState().then((state) => {
      setLoadedSearch(state);
    });
    getInitialDataState().then((state) => {
      setLoadedData(state);
    });
    getReportsState().then((state) => {
      setLoadedReports(state);
    });
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost bg-background/50"
          className="w-10 h-10 justify-center items-center"
          size="icon"
        >
          <img src="/dots.svg" alt="Другое" />
        </Button>
      </DialogTrigger>
      <DialogHeader>
        <DialogTitle className="hidden">Дополнительные действия</DialogTitle>
      </DialogHeader>
      <DialogContent className="w-[500px] py-5">
        <div className="flex flex-col gap-2.5">
          <DialogClose asChild>
            <Button
              className="regular text-foreground bg-background w-full p-5"
              variant="secondary"
              onClick={async () => {
                await clearDatabase();
                loadedData.syncData();
              }}
            >
              Новая база данных
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className="regular text-foreground bg-background w-full p-5"
              variant="secondary"
              onClick={async () => {
                await clearTable();
                loadedData.syncData();
              }}
            >
              Удалить данные из таблицы
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className="regular text-foreground bg-background w-full p-5"
              variant="secondary"
              onClick={async () => {
                await clearTable();

                const input = document.createElement("input");
                input.type = "file";
                input.click();

                input.onchange = () => {
                  if (input.files) {
                    const file = input.files[0];
                    if (
                      file.type ==
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    ) {
                      loadedData.loadDataFromDocument(file);
                    } else {
                      toast("Файл должен быть в формате .xlsx или .xls");
                    }
                  }
                };
              }}
            >
              Загрузить новые данные таблицы
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
