import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Larder — Recipe App",
  description: "A local-first recipe app prototype generated with Buildable."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
