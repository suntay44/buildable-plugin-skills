import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maya Castillo — Product Designer",
  description: "A local-first portfolio prototype generated with Buildable."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
