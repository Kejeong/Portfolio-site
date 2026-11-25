import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlan, getPlanSlugs, getProject } from "@/lib/content";
import { enhanceDesignHtml } from "@/lib/design";

export function generateStaticParams() {
  return getPlanSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: getPlan(slug)?.title ?? "기획서" };
}

export default async function PlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = getPlan(slug);
  if (!plan) notFound();
  const project = getProject(slug);

  return (
    <article>
      <Link href={`/projects/${slug}`} className="back">
        ← {project?.meta.title ?? "프로젝트"}
      </Link>
      <header className="article-head">
        <h1>{plan.title}</h1>
      </header>
      <div className="prose plan" dangerouslySetInnerHTML={{ __html: enhanceDesignHtml(plan.html) }} />
    </article>
  );
}
