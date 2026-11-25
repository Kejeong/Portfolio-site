import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/content";
import Tags from "@/components/Tags";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  const projects = getProjects().filter((p) => p.slug !== "cloudlab");
  return (
    <section className="sec">
      <h2 className="sec-title">PROJECTS</h2>
      {projects.map((p) => (
        <Link key={p.slug} href={`/projects/${p.slug}`} className="item">
          <span className="when">{p.period}</span>
          <div>
            <h3>
              {p.title}
              <small>{p.type}</small>
            </h3>
            <p>{p.summary}</p>
            <Tags items={p.tech} />
          </div>
        </Link>
      ))}
    </section>
  );
}
