"use client";

import { useEffect } from "react";

// 글 본문의 ```mermaid 코드 블록을 그림으로 바꾼다.
// 라이트/다크 테마가 바뀌면 다시 그린다.
export default function Mermaid() {
  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>(".prose pre > code.language-mermaid"));
    if (blocks.length === 0) return;

    const targets = blocks.map((code) => {
      const pre = code.parentElement as HTMLElement;
      const box = document.createElement("div");
      box.className = "mermaid-box";
      pre.replaceWith(box);
      return { box, src: code.textContent ?? "" };
    });

    // 넓은 그림은 70%까지만 줄이고, 그래도 넓으면 가운데부터 보이게 스크롤
    const fit = (box: HTMLElement) => {
      const el = box.querySelector("svg");
      if (!el) return;
      const natural = parseFloat(el.getAttribute("width") ?? "") || el.viewBox.baseVal.width;
      const room = box.clientWidth - 32;
      if (!natural || natural <= room) return;
      el.style.width = `${Math.max(room, natural * 0.7)}px`;
      el.style.maxWidth = "none";
      el.removeAttribute("height");
      box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2;
    };

    let gen = 0;
    const isDark = () => {
      const t = document.documentElement.dataset.theme;
      if (t) return t === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    };

    const draw = async () => {
      const my = ++gen;
      const mermaid = (await import("mermaid")).default;
      const dark = isDark();
      const css = getComputedStyle(document.documentElement);
      const v = (name: string) => css.getPropertyValue(name).trim();
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        fontFamily: getComputedStyle(document.body).fontFamily,
        // 테이블이 많은 ERD는 줄이지 않고 원래 크기로 그린 뒤 옆으로 스크롤한다
        er: { useMaxWidth: false },
        themeVariables: {
          darkMode: dark,
          background: v("--win"),
          mainBkg: v("--soft"),
          primaryColor: v("--soft"),
          primaryTextColor: v("--ink"),
          primaryBorderColor: v("--border2"),
          lineColor: v("--muted"),
          textColor: v("--ink"),
          clusterBkg: v("--win"),
          clusterBorder: v("--border2"),
          edgeLabelBackground: v("--win"),
          attributeBackgroundColorOdd: v("--win"),
          attributeBackgroundColorEven: v("--soft"),
          fontSize: "14px",
        },
      });
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        try {
          const { svg } = await mermaid.render(`mmd-${my}-${i}`, t.src);
          if (my !== gen) return;
          t.box.innerHTML = svg;
          fit(t.box);
        } catch {
          if (my !== gen) return;
          t.box.textContent = "다이어그램을 그리지 못했어요";
        }
      }
    };

    draw();
    // 접혀 있던 그림은 펼칠 때 가운데로 맞춘다
    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement;
      if (!d.open) return;
      d.querySelectorAll<HTMLElement>(".mermaid-box").forEach((b) => {
        b.scrollLeft = (b.scrollWidth - b.clientWidth) / 2;
      });
    };
    document.addEventListener("toggle", onToggle, true);
    const obs = new MutationObserver(draw);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", draw);
    return () => {
      obs.disconnect();
      document.removeEventListener("toggle", onToggle, true);
      mq.removeEventListener("change", draw);
    };
  }, []);

  return null;
}
