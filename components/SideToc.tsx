"use client";

import { useEffect, useState } from "react";

type Section = { id: string; title: string };

// 오른쪽에 붙어 다니는 목차. 지금 읽고 있는 섹션을 표시한다.
export default function SideToc({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const heads = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (heads.length === 0) return;

    // 화면 위쪽 1/3 지점을 지난 마지막 제목을 "지금 보는 섹션"으로 본다
    const update = () => {
      const line = window.innerHeight / 3;
      let current = heads[0].id;
      for (const h of heads) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(atBottom ? heads[heads.length - 1].id : current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <aside className="side-toc" aria-label="이 페이지 목차">
      <p>목차</p>
      <ol>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className={active === s.id ? "on" : ""} aria-current={active === s.id ? "true" : undefined}>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
      <button type="button" className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        ↑ 맨 위로
      </button>
    </aside>
  );
}
