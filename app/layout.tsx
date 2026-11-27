import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import MenuBar from "@/components/MenuBar";
import Sidebar from "@/components/Sidebar";
import Toolbar from "@/components/Toolbar";
import { getCategoryCounts, getPosts, getProjects } from "@/lib/content";
import { profile } from "@/lib/profile";
import { hasPublicFile } from "@/lib/files";
import "./globals.css";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
});

// 모바일 브라우저 주소창·위쪽 바깥 영역 색을 메뉴바 색에 맞춘다
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1b1d" },
  ],
};

export const metadata: Metadata = {
  title: { default: "김은정 | 백엔드 개발자", template: "%s | 김은정" },
  description: "설계로 문제를 끝내는 백엔드 개발자 김은정의 이력, 프로젝트, 공부 기록",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const postCount = getPosts().length;
  const projectCount = getProjects().filter((p) => p.slug !== "cloudlab").length;
  const pdfs = { resume: hasPublicFile(profile.resumePdf), portfolio: hasPublicFile(profile.portfolioPdf) };

  return (
    <html lang="ko" className={pretendard.className} suppressHydrationWarning>
      <head>
        {/* 화면이 그려지기 전에 저장된 테마를 적용해서 깜빡임을 막는다 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>
        <MenuBar />
        <div className="desk">
          <div className="win">
            <Sidebar categories={getCategoryCounts()} postCount={postCount} projectCount={projectCount} pdfs={pdfs} />
            <div className="pane">
              <Toolbar />
              <main className="main">{children}</main>
            </div>
          </div>
        </div>
        {/* 방문 통계: Vercel 대시보드 → 프로젝트 → Analytics에서 확인 */}
        <Analytics />
      </body>
    </html>
  );
}
