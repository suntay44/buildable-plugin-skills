import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Editorial — Blog Workspace",
  description: "A local-first blog/CMS prototype generated with Buildable."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
