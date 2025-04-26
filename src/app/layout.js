import "./globals.css";

export const metadata = {
  title: "Forest Panel | bivouac95",
  description: "A tool to manage your forest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
