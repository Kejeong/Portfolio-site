"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/lib/profile";

type Props = {
  categories: { slug: string; name: string; count: number }[];
  postCount: number;
  projectCount: number;
  pdfs: { resume: boolean; portfolio: boolean };
};

const icons = {
  person: (
    <svg viewBox="0 0 16 16"><circle cx="8" cy="5.5" r="2.5" /><path d="M3 13.5c.8-2.5 2.7-3.5 5-3.5s4.2 1 5 3.5" /></svg>
  ),
  folder: <svg viewBox="0 0 16 16"><path d="M2 4.5h4.5l1.5 1.5H14v7H2z" /></svg>,
  case: (
    <svg viewBox="0 0 16 16"><rect x="2.5" y="4.5" width="11" height="8.5" rx="1.5" /><path d="M6 4.5V3h4v1.5" /></svg>
  ),
  doc: <svg viewBox="0 0 16 16"><path d="M3 2.5h7l3 3v8H3z" /><path d="M5.5 8h5M5.5 10.5h5" /></svg>,
  notion: (
    <svg viewBox="0 0 16 16"><rect x="2.5" y="2" width="11" height="12" rx="2" /><path d="M5.5 11V5l5 6V5" /></svg>
  ),
  pdf: (
    <svg viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9z" /><path d="M9.5 1.5v3h3" /><path d="M5.5 9h5M5.5 11.5h3" /></svg>
  ),
  database: (
    <svg viewBox="0 0 16 16"><ellipse cx="8" cy="3.8" rx="5" ry="1.8" /><path d="M3 3.8v8.4c0 1 2.2 1.8 5 1.8s5-.8 5-1.8V3.8" /><path d="M3 8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8" /></svg>
  ),
  backend: (
    <svg viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="4.5" rx="1" /><rect x="2.5" y="9" width="11" height="4.5" rx="1" /><path d="M5 4.75h.01M5 11.25h.01" /></svg>
  ),
  frontend: (
    <svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M2 6h12" /><path d="M6.5 8.5l-1.5 1.5 1.5 1.5M9.5 8.5l1.5 1.5-1.5 1.5" /></svg>
  ),
  infra: <svg viewBox="0 0 16 16"><path d="M4.5 12.5a3 3 0 0 1-.3-6 4 4 0 0 1 7.6-.8 3.4 3.4 0 0 1 .2 6.8z" /></svg>,
  monitoring: <svg viewBox="0 0 16 16"><rect x="2" y="2.5" width="12" height="11" rx="1.5" /><path d="M4 10l2.2-2.5 2 1.8L12 5" /></svg>,
};

export default function Sidebar({ categories, postCount, projectCount, pdfs }: Props) {
  const pathname = decodeURI(usePathname());

  const item = (href: string, icon: React.ReactNode, label: string, count?: number, active?: boolean) => (
    <Link key={href} href={href} className={`sb-link${active ? " on" : ""}`}>
      {icon}
      <span>{label}</span>
      {count !== undefined && <small>{count}</small>}
    </Link>
  );

  // PDF는 새 탭에서 연다. 파일이 아직 없으면 "준비 중"으로 보여준다
  const pdfItem = (href: string, label: string, ready: boolean) =>
    ready ? (
      <a key={href} href={href} target="_blank" rel="noreferrer" className="sb-link">
        {icons.pdf}
        <span>{label}</span>
        <small>PDF ↗</small>
      </a>
    ) : (
      <span key={href} className="sb-link off" title={`public${href} 파일을 넣으면 열려요`}>
        {icons.pdf}
        <span>{label}</span>
        <small>준비 중</small>
      </span>
    );

  return (
    <aside className="sb">
      <div className="sb-in">
        <div className="lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>

        <div className="me">
          <Link href="/" className="photo">
            <Image src={profile.photo} alt={`${profile.name} 프로필 사진`} width={156} height={156} priority />
          </Link>
          <h1>{profile.name}</h1>
          <div className="role">{profile.role}</div>
          <p>{profile.sideIntro}</p>
          <div className="sns">
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={`mailto:${profile.email}`}>Email</a>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="grp">포트폴리오</div>
          {item("/", icons.person, "소개", undefined, pathname === "/")}
          {pdfItem(profile.resumePdf, "이력서", pdfs.resume)}
          {pdfItem(profile.portfolioPdf, "포트폴리오", pdfs.portfolio)}
          {item("/projects", icons.folder, "프로젝트", projectCount, pathname.startsWith("/projects"))}
          {item("/experience", icons.case, "경력 및 교육", undefined, pathname.startsWith("/experience"))}

          <div className="grp">기록</div>
          {item(
            "/blog",
            icons.doc,
            "전체 글",
            postCount,
            pathname === "/blog" || pathname.startsWith("/blog/tag/") || (pathname.startsWith("/blog/") && !pathname.startsWith("/blog/category/")),
          )}
          {categories.map((c) =>
            item(
              `/blog/category/${c.slug}`,
              icons[c.slug as keyof typeof icons],
              c.name,
              c.count,
              pathname === `/blog/category/${c.slug}`,
            ),
          )}
          <a href={profile.notion} target="_blank" rel="noreferrer" className="sb-link sb-notion">
            {icons.notion}
            <span>스터디 노트</span>
            <small>Notion ↗</small>
          </a>
        </nav>
      </div>
    </aside>
  );
}
