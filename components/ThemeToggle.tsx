"use client";

// 처음에는 시스템 설정(라이트/다크)을 따르고, 버튼을 누르면 그 선택을 브라우저에 기억한다.
// 아이콘(해/달)은 CSS가 현재 테마에 맞춰 보여준다.
export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <button type="button" className="theme-btn" onClick={toggle} aria-label="라이트/다크 모드 바꾸기" title="라이트/다크 모드">
      <svg className="moon" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z" />
      </svg>
      <svg className="sun" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
      </svg>
    </button>
  );
}
