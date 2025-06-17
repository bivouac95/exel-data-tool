"use client";

import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { SquareLoader } from "react-spinners";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Table from "@/components/ui/TableGraphics";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getReportsState } from "@/server_components/statesManager";

const Report = observer(() => {
  const [loadedReports, setLoadedReports] = useState({});
  const router = useRouter();
  const reportId = useParams().id;
  const [reportResultTable, setReportResultTable] = useState([]);
  const [reportState, setReportState] = useState({});

  useEffect(() => {
    getReportsState().then((state) => {
      setLoadedReports(state);
      const table = state.reports.find((report) => report.id == reportId);
      setReportState(table);
      setReportResultTable(table.tableState);
    });
  }, []);

  const update = () => {
    try {
      reportState.updateData();
    } catch (err) {
      toast(err);
    }
  };

  return (
    <>
      {reportResultTable.isLoaded ? (
        <div className="max-mobile:col-start-1 col-start-2 max-mobile:col-span-2 col-span-5 flex flex-col gap-10 p-2.5 box-border">
          <div className="flex flex-col gap-5">
            <h2>Отчет</h2>
            <div className="flex flex-row gap-5 items-center">
              <Button size="lg" variant="secondary" onClick={update}>
                <img src="/sync.svg" alt="Обновить" />
                <span className="regular">Обновить</span>
              </Button>

              <Button size="lg" variant="secondary" onClick={() => router.push("/manage")}>
                <img src="/trash.svg" alt="Удалить" />
                <span className="regular">Удалить</span>
              </Button>
            </div>
            <input
              disabled={true}
              type="text"
              className="regular bg-gray max-w-full h-10 px-5 flex gap-4 rounded-d mr-5"
              value={reportState.name}
            />
          </div>
          <Table tableState={reportResultTable} />
        </div>
      ) : (
        <div className="max-mobile:col-start-1 col-start-2 md:col-start-3 col-span-3 h-full flex items-center justify-center">
          <SquareLoader height="50" width="50" color="#30A65F" />
        </div>
      )}
    </>
  );
});

export default Report;
