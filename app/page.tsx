import Link from "next/link";
import { about, profile } from "@/lib/profile";
import { getPosts, getProjects } from "@/lib/content";
import { hasPublicFile } from "@/lib/files";

// 맥 설정 앱처럼 색 타일 안에 흰 아이콘
const glyphs: Record<string, React.ReactNode> = {
  person: <><circle cx="10" cy="7" r="3" /><path d="M4 16.5c1-3 3.3-4.3 6-4.3s5 1.3 6 4.3" /></>,
  car: <><path d="M3.5 12.5l1.3-4.2A1.8 1.8 0 0 1 6.5 7h7a1.8 1.8 0 0 1 1.7 1.3l1.3 4.2v3h-13z" /><path d="M3.5 12.5h13" /><circle cx="6.5" cy="15.5" r="1" /><circle cx="13.5" cy="15.5" r="1" /></>,
  coffee: <><path d="M4 8h10v4.5A3.5 3.5 0 0 1 10.5 16h-3A3.5 3.5 0 0 1 4 12.5z" /><path d="M14 9.5h1.2a1.8 1.8 0 0 1 0 3.6H14" /><path d="M7 3.5v2M10 3.5v2" /></>,
  list: <><path d="M8 6h8M8 10h8M8 14h8" /><path d="M4 6l.8.8L6 5.5M4 10l.8.8L6 9.5M4 14l.8.8L6 13.5" /></>,
  sparkle: <><path d="M10 2.5l1.6 4.4 4.4 1.6-4.4 1.6L10 14.5l-1.6-4.4L4 8.5l4.4-1.6z" /><path d="M15.5 13.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" /></>,
  pencil: <><path d="M13.5 3.5l3 3-9 9H4.5v-3z" /><path d="M11.5 5.5l3 3" /></>,
  doc: <><path d="M5 2.5h6.5l3.5 3.5v11.5H5z" /><path d="M11.5 2.5V6H15" /><path d="M7.5 10.5h5M7.5 13.5h3.5" /></>,
  folder: <><path d="M3 5.5h5l1.5 1.5H17v9H3z" /></>,
  case: <><rect x="3" y="6.5" width="14" height="10" rx="2" /><path d="M7.5 6.5V4.5h5v2" /></>,
  book: <><path d="M3.5 4.5h4.5a2 2 0 0 1 2 2v10a1.5 1.5 0 0 0-1.5-1.5H3.5z" /><path d="M16.5 4.5H12a2 2 0 0 0-2 2v10a1.5 1.5 0 0 1 1.5-1.5h5z" /></>,
};

function AppIcon({ icon }: { icon: string; color?: string }) {
  return (
    <span className="app-icon" aria-hidden="true">
      <svg viewBox="0 0 20 20">{glyphs[icon]}</svg>
    </span>
  );
}

export default function Home() {
  const posts = getPosts();
  const projects = getProjects().filter((p) => p.slug !== "cloudlab");
  const names = projects.slice(0, 2).map((p) => p.title.replace(/\s*\(.*\)$/, ""));
  const rest = projects.length - names.length;

  type Row = { href: string; icon: string; color: string; title: string; desc: string; pdf?: boolean };
  const rows: Row[] = [
    ...(hasPublicFile(profile.resumePdf)
      ? [{ href: profile.resumePdf, icon: "doc", color: "blue", title: "이력서", desc: "한 장으로 보는 이력", pdf: true }]
      : []),
    ...(hasPublicFile(profile.portfolioPdf)
      ? [{ href: profile.portfolioPdf, icon: "doc", color: "teal", title: "포트폴리오", desc: "프로젝트 정리본", pdf: true }]
      : []),
    { href: "/projects", icon: "folder", color: "orange", title: "프로젝트", desc: `${names.join(", ")}${rest > 0 ? ` 외 ${rest}개` : ""}` },
    { href: "/experience", icon: "case", color: "green", title: "경력", desc: "어떤 일을 해왔는지" },
    { href: "/blog", icon: "book", color: "purple", title: "블로그", desc: `공부하며 정리한 글 ${posts.length}편` },
  ];

  return (
    <div className="about">
      <header className="hero">
        <p className="hello">{about.hello}</p>
        <h2 className="big">
          {about.titleBefore}
          <mark>{about.titleName}</mark>
          {about.titleAfter}
        </h2>
        <p className="intro">{about.text}</p>
      </header>

      <h3 className="sub">저는 이런 사람이에요</h3>

      <div className="mbti">
        <div className="mbti-head">
          <AppIcon icon="person" color="blue" />
          <div>
            <small>MBTI</small>
            <b>{about.mbti.type}</b>
            <p>{about.mbti.desc}</p>
          </div>
        </div>
        <div className="mbti-letters">
          {about.mbti.letters.map((l) => (
            <div key={l.letter}>
              <b>{l.letter}</b>
              <span>{l.word}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="likes">
        <small className="likes-label">좋아하는 것</small>
        <div className="me-grid three">
          {about.likes.map((c) => (
            <div key={c.value} className="me-card">
              <AppIcon icon={c.icon} />
              <b>{c.value}</b>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="me-grid">
        {about.cards.map((c) => (
          <div key={c.value} className="me-card">
            <AppIcon icon={c.icon} />
            <small>{c.label}</small>
            <b>{c.value}</b>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>

      <h3 className="sub">키워드</h3>
      <div className="keywords">
        {about.keywords.map((k) => (
          <span key={k}>#{k}</span>
        ))}
      </div>

      <h3 className="sub">더 알아보기</h3>
      <div className="rows">
        {rows.map((r) => {
          const inner = (
            <>
              <AppIcon icon={r.icon} color={r.color} />
              <span className="row-text">
                <b>{r.title}</b>
                <span>{r.desc}</span>
              </span>
              <i>{r.pdf ? "PDF ↗" : "›"}</i>
            </>
          );
          return r.pdf ? (
            <a key={r.href} href={r.href} target="_blank" rel="noreferrer" className="row">
              {inner}
            </a>
          ) : (
            <Link key={r.href} href={r.href} className="row">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
