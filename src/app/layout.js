import "./globals.css";
import Aside from "@/app/components/Aside";

export const metadata = {
  title: "Forest Panel | bivouac95",
  description: "A tool to manage your forest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="relative flex justify-center">
          <Aside />
          <div className="body-width h-dvh py-5 grid gap-5 grid-cols-4 md:grid-cols-6 lg:grid-cols-7 text-foreground">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
