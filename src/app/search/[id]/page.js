"use client";

import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { Grid } from "react-loader-spinner";
import { useState, useEffect } from "react";
import SearchState from "@/server_components/SearchState";
import { useParams } from "next/navigation";
import Table from "@/components/ui/TableGraphics";

const Search = observer(() => {
  const searchId = useParams().id;
  const [searchResultTable, setSearchResultTable] = useState([]);
  const [searchQuery, setSearchQuery] = useState({});

  useEffect(() => {
    const table = SearchState.searchQueries.get(searchId);
    setSearchQuery(table);
    setSearchResultTable(table.tableState);
  }, []);

  return (
    <>
      {searchResultTable.isLoaded ? (
        <div className="col-start-1 md:col-start-2 lg:col-start-2 col-span-5 lg:col-span-6 flex flex-col gap-10">
          <div className={`flex flex-col gap-5 col-left-gap`}>
            <h2>Поиск</h2>
            <div className="flex flex-row gap-5 items-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={searchQuery.updateData}
              >
                <img src="/sync.svg" alt="Обновить" />
                <span className="regular">Обновить</span>
              </Button>

              <Button size="lg" variant="secondary">
                <img src="/trash.svg" alt="Удалить" />
                <span className="regular">Удалить</span>
              </Button>
            </div>
            <input
              disabled={true}
              type="text"
              className="regular bg-gray w-full h-10 px-5 flex gap-4 rounded-d"
              value={searchQuery.name}
            />
          </div>
          <Table tableState={searchResultTable} />
        </div>
      ) : (
        <div className="col-start-2 md:col-start-3 col-span-3 h-full flex items-center justify-center">
          <Grid height="50" width="50" className="bg-green" />
        </div>
      )}
    </>
  );
});

export default Search;
