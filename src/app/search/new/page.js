"use client";

import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";
import SearchFormDialog from "@/components/ui/SearchFormDialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getBetterColumns } from "@/server_components/database";
import { SquareLoader } from "react-spinners";
import { getSearchState } from "@/server_components/statesManager";
import Link from "next/link";

const Search = observer(() => {
  const [loadedSearch, setLoadedSearch] = useState({});

  useEffect(() => {
    getSearchState().then((state) => {
      setLoadedSearch(state);
    });
  });

  const [searchCreteria, setSearchCriteria] = useState({
    tableName: "data",
    columns: loadedSearch.sqlColumnNames,
    regex: false,
  });
  const [key, setKey] = useState("");
  const [isLoaded, setIsLoaded] = useState(true);
  const router = useRouter();

  const onSubmit = (criteria) => {
    setSearchCriteria(criteria);
  };

  const onSearch = async () => {
    setIsLoaded(false);
    let columns = [];

    columns = await getBetterColumns(searchCreteria.tableName);

    const newQuery = await loadedSearch.addSearchQuery(
      key,
      searchCreteria,
      columns
    );

    router.push(`/search/${newQuery.id}`);
  };

  return (
    <>
      {isLoaded ? (
        <div className="max-mobile:col-start-1 col-start-2 md:col-start-3 lg:col-start-3 max-mobile:col-span-2 col-span-4 lg:col-span-5 flex flex-col gap-10 px-2.5">
          <div className="flex flex-col gap-5">
            <h2>Поиск</h2>
            <SearchFormDialog onSubmit={onSubmit} />
            <div className="flex flex-row gap-2.5 items-center">
              <input
                type="text"
                className="regular bg-gray w-full h-10 px-5 flex gap-4 rounded-d"
                placeholder="Поиск..."
                onChange={(e) => setKey(e.target.value)}
              />
              <Button
                variant="secondary"
                className="w-10 h-10 justify-center items-center"
                size="icon"
                disabled={!key}
                onClick={onSearch}
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

          <div className="grid max-mobile-sm:grid-cols-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            <div className="flex flex-col gap-5 w-full">
              <img src="/digit_1.png" alt="" />
              <p className="regular">Дайте название отчету</p>
            </div>
            <div className="flex flex-col gap-5 w-full">
              <img src="/digit_2.png" alt="" />
              <p className="regular">
                Откройте{" "}
                <Link href="/help#searchParams" className="font-bold">
                  Параметры поиска
                </Link>{" "}
                и выберите таблицу, по которой будет проводиться поиск. По
                умолчанию - это таблица с исходными данными
              </p>
            </div>
            <div className="flex flex-col gap-5 w-full">
              <img src="/digit_3.png" alt="" />
              <p className="regular">
                Используйте синтаксис{" "}
                <Link href="/help#regex" className="font-bold">
                  Регулярных выражения
                </Link>
                , если столбец в вашей строке содержит много лишних символов.
                Для этого включите эту функцию в{" "}
                <Link href="/help#searchParams" className="font-bold">
                  Параметрах поиска
                </Link>
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
      ) : (
        <div className="max-mobile:col-start-1 col-start-2 md:col-start-3 col-span-3 h-full flex items-center justify-center">
          <SquareLoader height="50" width="50" color="#30A65F" />
        </div>
      )}
    </>
  );
});

export default Search;
