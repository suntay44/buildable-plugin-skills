import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalMarket",
  description: "A local-first services marketplace prototype generated with Buildable."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
