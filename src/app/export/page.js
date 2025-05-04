"use client";

import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Export = observer(() => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div className="col-start-2 md:col-start-3 lg:col-start-3 col-span-3 md:col-span-4 lg:col-span-5 flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <h2>Экспорт</h2>
        <p className="regular">
        Выберите отчеты и таблицы, которые хотите экспортировать
        </p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        <div className={`flex flex-col justify-between box-border p-5 bg-gray rounded-d h-72 ${isSelected ? "border-green border-2" : ""}`}>
          <div className="flex flex-col gap-5">
            <h2>Отчеты</h2>
            <p>Какое-то описание отчета</p>
          </div>
          {!isSelected ? (
            <Button className="w-full regular bg-background" variant="secondary" size="lg" onClick={() => setIsSelected(!isSelected)}>
              <img src="/check.svg" alt="add" />
              <span className="regular">Выбрать</span>
            </Button>
          ) : (
            <Button className="w-full regular bg-green" variant="secondary" size="lg" onClick={() => setIsSelected(!isSelected)}>
              <img src="/close_white.svg" alt="remove" />
              <span className="regular text-white">Отменить</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

export default Export;
