import type { Metadata } from "next";
import Link from "next/link";
import { certificates, education, experience } from "@/lib/profile";
import Tags from "@/components/Tags";

export const metadata: Metadata = { title: "경력 및 교육" };

export default function ExperiencePage() {
  // 최근 교육이 먼저 오도록 뒤집는다
  const edu = [...education].reverse();
  return (
    <>
    <section className="sec">
      <h2 className="sec-title">EXPERIENCE</h2>
      {experience.map((e) => {
        const body = (
          <>
            <span className="when">{e.period}</span>
            <div>
              <h3>
                {e.company}
                <small>{e.role}</small>
              </h3>
              <p>{e.summary}</p>
              {/* 상세 페이지가 없는 경력은 맡은 일을 목록에서 바로 보여준다 */}
              {!("detail" in e && e.detail) && e.points.length > 0 && (
                <ul>
                  {e.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              )}
              {e.tech.length > 0 && <Tags items={e.tech} />}
            </div>
          </>
        );
        // 상세 문서(detail)가 있는 경력만 상세 페이지로 이동한다
        return "detail" in e && e.detail ? (
          <Link key={e.slug} href={`/experience/${e.slug}`} className="item">
            {body}
          </Link>
        ) : (
          <div key={e.slug} className="item">
            {body}
          </div>
        );
      })}
    </section>

    <section className="sec">
      <h2 className="sec-title">EDUCATION</h2>
      {edu.map((e) => (
        <div key={e.title} className="item">
          <span className="when">{e.period}</span>
          <div>
            <h3>{e.title}</h3>
            <p>{e.sub}</p>
          </div>
        </div>
      ))}
    </section>

    <section className="sec">
      <h2 className="sec-title">CERTIFICATE</h2>
      {certificates.map((c) => (
        <div key={c.title} className="item">
          <span className="when">{c.date}</span>
          <div>
            <h3>
              {c.title}
              <small>{c.org}</small>
            </h3>
          </div>
        </div>
      ))}
    </section>
    </>
  );
}
