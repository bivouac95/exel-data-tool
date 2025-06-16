"use client";

import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import InitialDataState from "../../server_components/InitialDataState";
import TableActionsDialog from "./TableActionsDialog";

const Hud = observer(() => {
  return (
    <div className="fixed z-10 bottom-0 left-0 w-screen flex justify-center items-center p-5">
      <nav className="flex flex-row gap-5 rounded-d bg-foreground/30  py-2.5 px-10 items-center">
        {InitialDataState.beingEdited ? (
          <>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => InitialDataState.stopEdit(false)}
            >
              <span className="regular">Добавить</span>
            </Button>

            <div className="w-[1px] h-8 border-l-[2px] border-background" />

            <Button
              variant="secondary"
              size="lg"
              onClick={() => InitialDataState.stopEdit(true)}
            >
              <span className="regular">Отменить</span>
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            className="w-10 h-10 justify-center items-center"
            size="icon"
            onClick={() => InitialDataState.addNewRow()}
          >
            <img src="/plus.svg" alt="Добавить" />
          </Button>
        )}

        <div className="w-[1px] h-8 border-l-[2px] border-background" />

        {InitialDataState.isDeleting ? (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => InitialDataState.setIsDeleting(false)}
          >
            <span className="regular">Отменить</span>
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="w-10 h-10 justify-center items-center"
            size="icon"
            onClick={() => {
              InitialDataState.setIsDeleting(true);
            }}
          >
            <img src="/trash.svg" alt="Удалить" />
          </Button>
        )}

        <div className="w-[1px] h-8 border-l-[2px] border-background" />

        <TableActionsDialog />
      </nav>
    </div>
  );
});

export default Hud;
