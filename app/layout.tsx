import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechCareers | Internships & Entry‑Level Roles",
  description:
    "Curated internships and junior positions in AI, ML, Data Science, and Software Engineering for the 2025–2026 recruiting seasons.",
  icons: "/favi.png",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics /> {/* counts visitors & page views */}
        </ThemeProvider>
      </body>
    </html>
  );
}