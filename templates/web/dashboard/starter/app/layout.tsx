import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalBoard",
  description: "A local-first SaaS analytics dashboard prototype generated with Buildable."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
