import { Button } from "@/components/ui/button";
import InitialDataState from "../server_components/InitialDataState";

export default function Hud() {
  return (
    <div className="fixed bottom-0 left-0 w-screen flex justify-center items-center p-5">
      <nav className="flex flex-row gap-5 rounded-d bg-foreground/70  py-2.5 px-10 items-center">
        <div>
          <Button
            variant="secondary"
            className="w-10 h-10"
            size="icon"
            onClick={() => InitialDataState.addNewRow()}
          >
            <img src="/plus.svg" alt="Добавить" />
          </Button>
        </div>

        <div className="w-[1px] h-8 border-l-[2px] border-background" />

        <div>
          <Button variant="secondary" className="w-10 h-10" size="icon">
            <img src="/report.svg" alt="Отчет" />
          </Button>
        </div>

        <div className="w-[1px] h-8 border-l-[2px] border-background" />

        <div>
          <Button variant="secondary" className="w-10 h-10" size="icon">
            <img src="/search.svg" alt="Поиск" />
          </Button>
        </div>

        <div className="w-[1px] h-8 border-l-[2px] border-background" />

        <div>
          <Button variant="secondary" className="w-10 h-10" size="icon">
            <img src="/download.svg" alt="Экспорт" />
          </Button>
        </div>

        <div className="w-[1px] h-8 border-l-[2px] border-background" />

        <div>
          <Button
            variant="ghost bg-background/50"
            className="w-10 h-10"
            size="icon"
          >
            <img src="/dots.svg" alt="Другое" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
