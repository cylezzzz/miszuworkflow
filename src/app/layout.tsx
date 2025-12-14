// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "../app/globals.css";
import { Toaster } from "../components/ui/toaster"; // FIX: Alias @/ war kaputt -> relativer Import ist garantiert

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "miszu",
  description: "FlowCanvasAI"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
