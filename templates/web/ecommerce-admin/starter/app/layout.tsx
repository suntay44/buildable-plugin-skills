import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommerceDesk",
  description: "A local-first ecommerce admin prototype generated with Buildable."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
