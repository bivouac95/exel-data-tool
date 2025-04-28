import Link from "next/link";

import { InitialDataState } from "@/app/server_components/InitialDataState";

export default function Aside() {
    return (
        <aside className="absolute left-0 aside-width h-dvh flex box-border p-5 pr-0 text-background">
            <main className="w-full h-full flex flex-col bg-green rounded-d gap-10">
                <section className="flex flex-col gap-5 mx-5 mt-5">
                    <h1>РосЛес<br/>панель</h1>
                    <p className="regular">Центр защиты леса Забайкальского края</p>
                </section>
                <div className="w-full h-[2px] bg-background" />
                <nav className="flex flex-col gap-5 mx-5">
                    <h2>Ссылки</h2>
                    <ul className="flex flex-col gap-2.5">
                        <li><Link href="/">Об организации</Link></li>
                        <li><Link href="/">О сайте</Link></li>
                        <li><Link href="/">Помощь</Link></li>
                    </ul>
                </nav>
                <div className="flex flex-col gap-5 mx-5">
                    <h2>Начать работу</h2>
                    <ul className="flex flex-col gap-2.5">
                        <li><button>Загрузить таблицу</button></li>
                        <li><button>Загрузить прессет</button></li>
                    </ul>
                </div>
            </main>
        </aside>
    )
}