// 경력 페이지의 "설계 상세" 마크다운(HTML)을 읽기 쉬운 모양으로 바꾼다.
// 마크다운은 그대로 쓰고, 아래 규칙에 맞는 부분만 모양이 바뀐다.
//  - "## 설계 기준"(또는 ###) 바로 아래 목록 → 2칸 카드
//  - "- **제목**: 설명" 형태의 목록 → 왼쪽 제목, 오른쪽 설명
//  - "A → B → C" 한 줄짜리 문단 → 단계 흐름
//  - 첫 칸이 "단계"인 2줄짜리 표 → 단계 흐름 + 상태 배지

const strip = (s: string) => s.replace(/<[^>]+>/g, "").trim();

function flowHtml(steps: { name: string; state?: string }[]) {
  const items = steps
    .map(
      (s, i) =>
        `<li><span class="flow-n">${i + 1}</span><span class="flow-name">${s.name}</span>${
          s.state ? `<span class="flow-state">${s.state}</span>` : ""
        }</li>`,
    )
    .join("");
  return `<ol class="flow">${items}</ol>`;
}

export function enhanceDesignHtml(html: string) {
  let out = html;

  // 설계 기준 목록 → 카드
  out = out.replace(/(<h[23][^>]*>설계 기준<\/h[23]>\s*)<ul>/, '$1<ul class="criteria">');

  // "**제목**: 설명" 목록 → 제목/설명 두 칸
  out = out.replace(/<li><strong>([^<]+)<\/strong>:\s*([\s\S]*?)<\/li>/g, '<li class="kv"><strong>$1</strong><span>$2</span></li>');
  out = out.replace(/<ul>(\s*<li class="kv">)/g, '<ul class="kv-list">$1');

  // "A → B → C" 문단 → 흐름
  out = out.replace(/<p>([^<]*?(?:→[^<]*?){2,})<\/p>/g, (m, text: string) => {
    if (/[.다]\s*$/.test(text.trim())) return m; // 문장으로 끝나면 그대로 둔다
    return flowHtml(text.split("→").map((t) => ({ name: t.trim() })));
  });

  // 단계/상태 표 → 흐름 + 상태
  out = out.replace(/<table>([\s\S]*?)<\/table>/g, (m, inner: string) => {
    const rows = [...inner.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) =>
      [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => strip(c[1])),
    );
    if (rows.length !== 2 || rows[0][0] !== "단계") return m;
    const [head, body] = rows;
    return flowHtml(head.slice(1).map((name, i) => ({ name, state: body[i + 1] || undefined })));
  });

  return out;
}

// h2에 id를 붙이고 목차 목록을 돌려준다
export function withSectionIds(html: string) {
  const sections: { id: string; title: string }[] = [];
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner: string) => {
    const title = strip(inner);
    const id = title.replace(/\s+/g, "-");
    sections.push({ id, title });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, sections };
}
