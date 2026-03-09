import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import TrackPageView from "@/components/TrackPageView";

export const metadata: Metadata = {
  title: "LLM League",
  description: "LLM 예측 리그 순위표"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const showAdminLink = process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === "true";
  return (
    <html lang="ko">
      <body>
        <TrackPageView />
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="flex items-center justify-between gap-3">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
                LLM League
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-base text-zinc-300">
              <Link href="/" className="hover:text-zinc-50">
                순위표
              </Link>
              {showAdminLink && (
                <Link href="/admin" className="hover:text-zinc-50">
                  관리자
                </Link>
              )}
            </nav>
          </header>
          <main className="mt-6">{children}</main>
          <footer className="mt-10 border-t border-zinc-800 pt-6 text-xs text-zinc-400">
            v0.1 · 예측 질문 기반 리그
          </footer>
        </div>
      </body>
    </html>
  );
}
