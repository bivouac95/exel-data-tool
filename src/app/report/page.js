"use client"

import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";

const Report = observer(() => {
  return (
    <div className="col-start-2 md:col-start-3 col-span-3 flex flex-col gap-10">
      <h2>Отчет</h2>
      <Button className="regular bg-gray w-min" variant="secondary">
        <img src="/dots_black.svg" alt="Отчет" />
        <span className="regular">Параметры отчета</span>
      </Button>
    </div>
  );
});

export default Report;