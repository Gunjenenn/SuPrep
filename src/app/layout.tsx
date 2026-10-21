import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { PublicNav } from "@/components/Nav";
import { getOptionalUser } from "@/lib/auth";

const inter = Inter({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-inter" });
const nunito = Nunito({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "СууPrep — SAT математикийг монгол хэлээр",
  description: "AI багш, AI төлөвлөгөө, AI шинжилгээтэй SAT математикийн бэлтгэл.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalUser();
  return (
    <html lang="mn">
      <body className={`${inter.variable} ${nunito.variable} min-h-screen font-sans`}>
        {user ? (
          <AppShell user={user}>{children}</AppShell>
        ) : (
          <>
            <PublicNav />
            <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">{children}</main>
            <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-ink/45">
              © {new Date().getFullYear()} СууPrep · SAT нь College Board-ийн бүртгэлтэй барааны тэмдэг бөгөөд энэ
              сайттай холбоогүй.
            </footer>
          </>
        )}
      </body>
    </html>
  );
}
