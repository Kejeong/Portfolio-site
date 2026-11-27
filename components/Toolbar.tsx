"use client";

import { usePathname, useRouter } from "next/navigation";
import { categories } from "@/lib/categories";

function titleOf(path: string) {
  if (path === "/") return "소개";
  if (path.startsWith("/projects/") && path.endsWith("/plan")) return "기획서";
  if (path.startsWith("/projects/") && path.endsWith("/erd")) return "ERD";
  if (path.startsWith("/projects")) return "프로젝트";
  if (path.startsWith("/experience")) return "경력 및 교육";
  if (path.startsWith("/blog/category/")) {
    const slug = path.slice("/blog/category/".length);
    return categories.find((c) => c.slug === slug)?.name ?? "기록";
  }
  if (path.startsWith("/blog/tag/")) return `#${path.slice("/blog/tag/".length)}`;
  if (path.startsWith("/blog/")) return "글";
  if (path.startsWith("/blog")) return "전체 글";
  return "";
}

export default function Toolbar() {
  const router = useRouter();
  const path = decodeURI(usePathname());

  return (
    <div className="tb">
      <div className="chev">
        <button type="button" onClick={() => router.back()} aria-label="뒤로">
          ‹
        </button>
        <button type="button" onClick={() => router.forward()} aria-label="앞으로">
          ›
        </button>
      </div>
      <b>{titleOf(path)}</b>
    </div>
  );
}
