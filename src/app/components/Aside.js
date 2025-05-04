"use client";

import Link from "next/link";

import InitialDataState from "@/app/server_components/InitialDataState";
import { Button } from "@/components/ui/button";

export default function Aside() {
  return (
    <aside className="fixed z-10 left-0 aside-width h-dvh flex box-border p-5 pr-0 text-background">
      <main className="w-full h-full flex flex-col bg-green rounded-d gap-10">
        <section className="flex flex-col gap-5 mx-5 mt-5">
          <Link href="/" className="regular">
            <h1>
              РосЛес
              <br />
              панель
            </h1>
          </Link>
          <p className="regular">Центр защиты леса Забайкальского края</p>
        </section>
        <div className="w-full h-[2px] bg-background" />
        <nav className="flex flex-col gap-5 mx-5">
          <h2>Ссылки</h2>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link href="/" className="regular">
                Об организации
              </Link>
            </li>
            <li>
              <Link href="/" className="regular">
                О сайте
              </Link>
            </li>
            <li>
              <Link href="/" className="regular">
                Помощь
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex flex-col gap-5 mx-5">
          <h2>Начать работу</h2>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Button
                className="regular bg-green"
                variant="ghost"
                onClick={() => {
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
                        InitialDataState.handleDocumentUpload(file);
                      } else {
                        alert("Файл должен быть в формате .xlsx или .xls");
                      }
                    }
                  };
                }}
              >
                Загрузить таблицу
              </Button>
            </li>
            <li>
              <Button className="regular bg-green" variant="ghost">
                Загрузить прессет
              </Button>
            </li>
          </ul>
        </div>
      </main>
    </aside>
  );
}
