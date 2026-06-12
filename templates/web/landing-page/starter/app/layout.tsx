import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clarity — Customer feedback that writes the roadmap",
  description: "A local-first SaaS landing page prototype generated with Buildable."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
