"use client";

import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { SquareLoader } from "react-spinners";
import { useState, useEffect } from "react";
import SearchState from "@/server_components/SearchState";
import { useParams } from "next/navigation";
import Table from "@/components/ui/TableGraphics";
import { toast } from "sonner";

const Search = observer(() => {
  const searchId = useParams().id;
  const [searchResultTable, setSearchResultTable] = useState([]);
  const [searchQuery, setSearchQuery] = useState({});

  useEffect(() => {
    const table = SearchState.searchQueries.get(searchId);
    setSearchQuery(table);
    setSearchResultTable(table.tableState);
  }, []);

  const update = () => {
    try {
      searchQuery.updateData();
    } catch (err) {
      toast(err);
    }
  };

  const deleteSearch = () => {
    const confirmed = confirm(
      "Вы уверены, что хотите удалить этот поисковой запрос?"
    );
    if (!confirmed) return;

    SearchState.deleteSearchQuery(searchId);
    router.push("seacrh/new");
  };

  return (
    <>
      {searchResultTable.isLoaded ? (
        <div className="col-start-2 col-span-5 flex flex-col gap-10 p-2.5 box-border">
          <div className="flex flex-col gap-5">
            <h2>Поиск</h2>
            <div className="flex flex-row gap-5 items-center">
              <Button size="lg" variant="secondary" onClick={update}>
                <img src="/sync.svg" alt="Обновить" />
                <span className="regular">Обновить</span>
              </Button>

              <Button size="lg" variant="secondary" onClick={deleteSearch}>
                <img src="/trash.svg" alt="Удалить" />
                <span className="regular">Удалить</span>
              </Button>
            </div>
            <input
              disabled={true}
              type="text"
              className="regular bg-gray max-w-full h-10 px-5 flex gap-4 rounded-d mr-5"
              value={searchQuery.name}
            />
          </div>
          <Table tableState={searchResultTable} />
        </div>
      ) : (
        <div className="col-start-2 md:col-start-3 col-span-3 h-full flex items-center justify-center">
          <SquareLoader height="50" width="50" color="#30A65F" />
        </div>
      )}
    </>
  );
});

export default Search;
