import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Openings — Job Board",
  description: "A local-first job board prototype generated with Buildable."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
