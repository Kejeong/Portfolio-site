import Link from "next/link";
import type { PostMeta } from "@/lib/content";

export default function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return <p className="muted">아직 글이 없어요</p>;
  return (
    <div className="posts">
      {posts.map((p, i) => (
        <Link key={p.slug} href={`/blog/${p.slug}`} className="post">
          <div className="post-body">
            <time>
              {p.date.replaceAll("-", ".")} · {p.minutes}분 읽기
            </time>
            <h3>{p.title}</h3>
            {p.summary && <p>{p.summary}</p>}
            <div className="hash">
              {p.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
          </div>
          {p.cover && <div className={`thumb t${(i % 3) + 1}`}>{p.cover}</div>}
        </Link>
      ))}
    </div>
  );
}
