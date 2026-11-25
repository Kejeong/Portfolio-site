import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlan, getProject, getProjects } from "@/lib/content";
import Tags from "@/components/Tags";
import Mermaid from "@/components/Mermaid";
import { enhanceDesignHtml, withSectionIds } from "@/lib/design";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: p?.meta.title ?? "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const m = p.meta;
  const { html, sections } = withSectionIds(enhanceDesignHtml(p.html));
  const hasPlan = !m.plan && !!getPlan(slug);
  const hasLinks = m.github || m.link || m.plan || hasPlan;

  return (
    <article>
      <Link href="/projects" className="back">
        ← Projects
      </Link>
      <header className="article-head">
        <h1>{m.title}</h1>
        <div className="meta">
          <span>{m.type}</span>
          <span>{m.period}</span>
        </div>
        <Tags items={m.tech} />
      </header>

      {(hasLinks || sections.length > 1) && (
        <nav className="toc" aria-label="바로가기와 목차">
          {hasLinks && (
            <div className="toc-row">
              <span className="toc-label">바로가기</span>
              <div className="toc-items">
                {m.github && (
                  <a href={m.github} target="_blank" rel="noreferrer">
                    GitHub <i>↗</i>
                  </a>
                )}
                {m.link && (
                  <a href={m.link} target="_blank" rel="noreferrer">
                    서비스 <i>↗</i>
                  </a>
                )}
                {m.plan && (
                  <a href={m.plan} target="_blank" rel="noreferrer">
                    기획서 <i>↗</i>
                  </a>
                )}
                {hasPlan && (
                  <Link href={`/projects/${slug}/plan`}>
                    기획서 <i>→</i>
                  </Link>
                )}
              </div>
            </div>
          )}
          {sections.length > 1 && (
            <div className="toc-row">
              <span className="toc-label">목차</span>
              <div className="toc-items">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`}>
                    {s.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </nav>
      )}

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      <Mermaid />
    </article>
  );
}
