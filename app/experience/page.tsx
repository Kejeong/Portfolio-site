import type { Metadata } from "next";
import { experience } from "@/lib/profile";
import { getProject } from "@/lib/content";
import { enhanceDesignHtml } from "@/lib/design";
import Tags from "@/components/Tags";

export const metadata: Metadata = { title: "Experience" };

type Job = (typeof experience)[number] & {
  stats?: { value: string; label: string }[];
  detail?: string;
};

export default function ExperiencePage() {
  return (
    <>
      <h2 className="page-title">경력</h2>
      <p className="page-lead">실제 서비스를 만들고 운영하며 해온 일</p>

      {(experience as Job[]).map((e) => {
        const detail = e.detail ? getProject(e.detail) : null;
        return (
          <section key={e.company} className="job">
            <header className="job-head">
              <div className="job-title">
                <h3>{e.company}</h3>
                <p>
                  {e.role}
                  <span className="job-period-m"> · {e.period}</span>
                </p>
              </div>
              <time>{e.period}</time>
            </header>

            <p className="job-summary">{e.summary}</p>

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

            {e.tech.length > 0 && <Tags items={e.tech} />}

            {detail && (
              <div className="design">
                <h4 className="design-title">설계 상세</h4>
                <div className="prose" dangerouslySetInnerHTML={{ __html: enhanceDesignHtml(detail.html) }} />
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
