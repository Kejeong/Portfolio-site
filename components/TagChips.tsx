import Link from "next/link";

export default function TagChips({ tags, active }: { tags: string[]; active?: string }) {
  return (
    <div className="chips">
      <Link href="/blog" className={!active ? "on" : ""}>
        전체
      </Link>
      {tags.map((t) => (
        <Link key={t} href={`/blog/tag/${encodeURIComponent(t)}`} className={active === t ? "on" : ""}>
          {t}
        </Link>
      ))}
    </div>
  );
}
