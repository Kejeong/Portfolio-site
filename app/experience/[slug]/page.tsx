import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { experience } from "@/lib/profile";
import { getProject } from "@/lib/content";
import { enhanceDesignHtml, withSectionIds } from "@/lib/design";
import Tags from "@/components/Tags";
import SideToc from "@/components/SideToc";

type Job = (typeof experience)[number] & {
  stats?: { value: string; label: string }[];
  detail?: string;
};

const jobs = experience as Job[];

export function generateStaticParams() {
  // 상세 문서가 있는 경력만 페이지를 만든다
  return jobs.filter((e) => e.detail).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: jobs.find((e) => e.slug === slug)?.company ?? "Experience" };
}

export default async function ExperienceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = jobs.find((x) => x.slug === slug);
  if (!e || !e.detail) notFound();

  const detail = e.detail ? getProject(e.detail) : null;
  const design = detail ? withSectionIds(enhanceDesignHtml(detail.html)) : null;
  const sections = [{ id: "개요", title: "개요" }, ...(design?.sections ?? [])];

  return (
    <div className="with-toc">
      <article>
        <Link href="/experience" className="back">
          ← 경력
        </Link>
        <header className="article-head">
          <h1>{e.company}</h1>
          <div className="meta">
            <span>{e.role}</span>
            <span>{e.period}</span>
          </div>
          {e.tech.length > 0 && <Tags items={e.tech} />}
        </header>

        {sections.length > 1 && (
          <nav className="toc toc-sections-only" aria-label="목차">
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
          </nav>
        )}

        <div className="prose">
          <h2 id="개요">개요</h2>
          <p>{e.summary}</p>
        </div>

        {e.stats && (
          <div className="stats">
            {e.stats.map((s) => (
              <div key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {e.points.length > 0 && (
          <>
            <h4 className="job-sub">맡은 일</h4>
            <ul className="job-points">
              {e.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </>
        )}

        {design && <div className="prose design-body" dangerouslySetInnerHTML={{ __html: design.html }} />}
      </article>
      <SideToc sections={sections} />
    </div>
  );
}
