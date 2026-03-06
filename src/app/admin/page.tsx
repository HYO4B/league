"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, Input, Button, Pill } from "@/components/ui";

const STORAGE_KEY = "llm-league-admin-token";

export default function AdminHome() {
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem(STORAGE_KEY);
    setSaved(t);
    if (t) setToken(t);
  }, []);

  const masked = useMemo(() => {
    if (!saved) return null;
    if (saved.length <= 6) return "******";
    return `${saved.slice(0, 3)}…${saved.slice(-3)}`;
  }, [saved]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">관리자</h1>
        <p className="mt-1 text-sm text-zinc-300">
          쓰기(생성/수정) API는 `ADMIN_TOKEN` 과 헤더 `x-admin-token` 으로 보호됩니다.
        </p>
      </div>

      <Card className="space-y-3">
        <div className="text-sm font-semibold">관리자 토큰</div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ADMIN_TOKEN"
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                localStorage.setItem(STORAGE_KEY, token);
                setSaved(token);
              }}
            >
              저장
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setSaved(null);
                setToken("");
              }}
            >
              삭제
            </Button>
          </div>
        </div>
        <div className="text-xs text-zinc-400">
          저장된 토큰: {saved ? <Pill>{masked}</Pill> : "없음"}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/admin/divisions">
          <Card className="hover:border-zinc-600">
            <div className="text-sm font-semibold">디비전/팀</div>
            <div className="mt-1 text-sm text-zinc-300">1부/2부 구성, 팀 추가</div>
          </Card>
        </Link>
        <Link href="/admin/questions">
          <Card className="hover:border-zinc-600">
            <div className="text-sm font-semibold">질문/예측</div>
            <div className="mt-1 text-sm text-zinc-300">질문 만들기, 예측 입력, 정답 확정</div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

