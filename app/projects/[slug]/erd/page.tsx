import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getErd, getErdSlugs, getProject } from "@/lib/content";
import { enhanceDesignHtml } from "@/lib/design";
import Mermaid from "@/components/Mermaid";

export function generateStaticParams() {
  return getErdSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: getErd(slug)?.title ?? "ERD" };
}

export default async function ErdPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const erd = getErd(slug);
  if (!erd) notFound();
  const project = getProject(slug);

  return (
    <article>
      <Link href={`/projects/${slug}`} className="back">
        ← {project?.meta.title ?? "프로젝트"}
      </Link>
      <header className="article-head">
        <h1>{erd.title}</h1>
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: enhanceDesignHtml(erd.html) }} />
      <Mermaid />
    </article>
  );
}
