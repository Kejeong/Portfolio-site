import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/content";
import Tags from "@/components/Tags";
import Mermaid from "@/components/Mermaid";
import { enhanceDesignHtml } from "@/lib/design";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  return { title: p?.meta.title ?? "Blog", description: p?.meta.summary };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  return (
    <article>
      <Link href="/blog" className="back">
        ← Blog
      </Link>
      <header className="article-head">
        <h1>{p.meta.title}</h1>
        <div className="meta">
          <time>{p.meta.date.replaceAll("-", ".")}</time>
          <Tags items={p.meta.tags} />
        </div>
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: enhanceDesignHtml(p.html) }} />
      <Mermaid />
    </article>
  );
}
