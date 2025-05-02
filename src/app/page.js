"use client";

import { observer } from "mobx-react-lite";
import InitialDataState from "@/app/server_components/InitialDataState";
import Table from "@/app/components/Table";
import Hud from "./components/Hud";
import { Grid } from "react-loader-spinner";

const Home = observer(() => {
  return (
    <>
      {!InitialDataState.isLoaded ? (
        !InitialDataState.isLoading ? (
          <div className="col-start-2 md:col-start-3 col-span-3 flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <h2>Тут ничего нет</h2>
              <p className="regular">Начните работу за 3 простых шага</p>
            </div>
            <div className="flex flex-row gap-5">
              <div className="flex flex-col gap-5 w-full">
                <img src="/digit_1.png" alt="" />
                <p className="regular">
                  Загрузите <b>Приложение 1</b> или любую другую таблицу в
                  формате Exel, с которой вы собираетесь работать
                </p>
              </div>
              <div className="flex flex-col gap-5 w-full">
                <img src="/digit_2.png" alt="" />
                <p className="regular">
                  Если вы уже проделывали работу с такой таблицей, загрузите{" "}
                  <b>прессет проекта</b>, чтобы сохранить вид итоговых таблиц и
                  способ их заполнения
                </p>
              </div>
              <div className="flex flex-col gap-5 w-full">
                <img src="/digit_3.png" alt="" />
                <p className="regular">
                  Изменяйте итоговую таблицу, формируйте отчеты, выполняйте
                  поиск и аналитику
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-start-2 md:col-start-3 col-span-3 h-full flex items-center justify-center">
            <Grid height="50" width="50" className="bg-green"/>
          </div>
        )
      ) : (
        <div className="col-start-2 md:col-start-2 lg:col-start-2">
          <Table
            columns={InitialDataState.columns}
            rows={InitialDataState.rows}
          />
          <Hud />
        </div>
      )}
    </>
  );
});

export default Home;
