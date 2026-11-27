import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getErd, getPlan, getProject, getProjects } from "@/lib/content";
import Tags from "@/components/Tags";
import Mermaid from "@/components/Mermaid";
import SideToc from "@/components/SideToc";
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
  const erdPage = !!getErd(slug);
  const hasErd = sections.some((x) => x.id === "ERD");
  const hasLinks = m.github || m.link || m.plan || hasPlan || hasErd || erdPage;

  return (
    <div className="with-toc">
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
                {erdPage ? (
                  <Link href={`/projects/${slug}/erd`}>
                    ERD <i>→</i>
                  </Link>
                ) : (
                  hasErd && (
                    <a href="#ERD">
                      ERD <i>↓</i>
                    </a>
                  )
                )}
              </div>
            </div>
          )}
          {sections.length > 1 && (
            <div className="toc-row toc-sections">
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
    <SideToc sections={sections} />
    </div>
  );
}
