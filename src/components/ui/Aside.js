"use client";

import Link from "next/link";
import { observer } from "mobx-react-lite";
import InitialDataState from "@/server_components/InitialDataState";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Search } from "lucide-react";

const Aside = observer(() => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <>
      <header className="mobile:hidden fixed top-0 p-2.5 flex flex-row gap-5 w-full bg-green text-background items-center z-20">
        <Link href="/" className="regular">
          <h2>РосЛес панель</h2>
        </Link>

        {pathname !== "/" && (
          <Button
            className="w-max regular bg-gray p-2.5"
            variant="secondary"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft width={18} hanging={18} color="#30A65F" />
          </Button>
        )}

        {!InitialDataState.isLoaded ? (
          <>
            <span
              className="cursor-pointer regular text-background"
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
                      toast("Файл должен быть в формате .xlsx или .xls");
                    }
                  }
                };
              }}
            >
              Загрузить таблицу
            </span>

            <span className="cursor-pointer regular text-background">
              Загрузить прессет
            </span>
          </>
        ) : (
          <>
            <Button
              className="w-max regular bg-gray p-2.5"
              variant="secondary"
              size="icon"
              onClick={() => router.push("/search/new")}
            >
              <Search width={18} hanging={18} color="#30A65F" />
            </Button>

            <Link href="/manage" className="regular">
              Менеджер таблиц
            </Link>

            <Link href="/report/new" className="regular">
              Новый отчет
            </Link>
          </>
        )}
      </header>

      <aside className="max-mobile:hidden fixed z-10 left-0 aside-width h-dvh flex box-border p-5 pr-0 text-background">
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
            {pathname !== "/" && (
              <Button
                className="w-max regular bg-gray"
                variant="secondary"
                size="lg"
                onClick={() => router.back()}
              >
                <span className="regular">Вернуться</span>
              </Button>
            )}
          </nav>

          {!InitialDataState.isLoaded ? (
            <div className="flex flex-col gap-5 mx-5">
              <h2>Начать работу</h2>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <span
                    className="cursor-pointer regular text-background"
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
                            toast("Файл должен быть в формате .xlsx или .xls");
                          }
                        }
                      };
                    }}
                  >
                    Загрузить таблицу
                  </span>
                </li>
                <li>
                  <span className="cursor-pointer regular text-background">
                    Загрузить прессет
                  </span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-5 mx-5">
              <h2>Навигация</h2>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link href="/manage" className="regular">
                    Менеджер таблиц
                  </Link>
                </li>
                <li>
                  <Link href="/report/new" className="regular">
                    Создать новый отчет
                  </Link>
                </li>
                <li>
                  <Link href="/search/new" className="regular">
                    Поиск
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </main>
      </aside>
    </>
  );
});

export default Aside;
