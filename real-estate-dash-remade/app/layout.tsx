import type React from "react";

import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

import { Providers } from "@/providers/providers";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Property Finder",
//   description: "Find your perfect property",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
            <>
              <Header />
              <main className="flex-1">
                <Providers>{children}</Providers>
              </main>
            </>
          </div>
        </body>
      }
    </html>
  );
}
