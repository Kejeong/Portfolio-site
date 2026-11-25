"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const fmt = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

export default function MenuBar() {
  // 서버와 브라우저 시간이 달라 생기는 불일치를 피하려고 화면에 뜬 뒤에 시계를 채운다
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="menubar">
      <div className="mb-left">
        <Link href="/" className="mb-name">
          eunjeong.log
        </Link>
        <Link href="/blog">글</Link>
        <Link href="/projects">프로젝트</Link>
        <Link href="/experience">이력</Link>
      </div>
      <div className="mb-right">
        <ThemeToggle />
        <span className="clock">{now}</span>
      </div>
    </div>
  );
}
