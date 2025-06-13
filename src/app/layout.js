import "./globals.css";
import Aside from "@/components/ui/Aside";
import { Toaster } from "@/components/ui/sonner";

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
          <div className="max-mobile:pt-16 body-width h-dvh py-5 grid gap-5 grid-cols-4 max-mobile:grid-cols-2 md:grid-cols-6 lg:grid-cols-7 text-foreground">
            {children}
          </div>
          <Toaster />
        </main>
      </body>
    </html>
  );
}
