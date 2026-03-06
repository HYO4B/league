import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LLM League",
  description: "LLM 예측 리그 순위표"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="flex items-center justify-between gap-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              LLM League
            </Link>
            <nav className="flex items-center gap-3 text-sm text-zinc-300">
              <Link href="/" className="hover:text-zinc-50">
                순위표
              </Link>
              <Link href="/admin" className="hover:text-zinc-50">
                관리자
              </Link>
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

