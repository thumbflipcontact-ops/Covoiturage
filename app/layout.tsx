import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CovoiCam - Covoiturage moderne",
  description:
    "Plateforme de covoiturage moderne avec interface élégante en dégradé violet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className + " bg-slate-50 text-slate-900"}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

