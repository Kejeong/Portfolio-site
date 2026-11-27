import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const root = path.join(process.cwd(), "content");

function toDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v ?? "");
}

import { categories } from "./categories";

export { categories };

function toCategorySlug(v: unknown): string | undefined {
  const key = String(v ?? "").toLowerCase().replace(/[\s-]/g, "");
  return categories.find((c) => c.slug === key)?.slug;
}

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  cover?: string;
  category?: string; // categories의 slug
  minutes: number;
};

export type ProjectMeta = {
  slug: string;
  title: string;
  period: string;
  type: string;
  summary: string;
  tech: string[];
  github?: string;
  link?: string;
  plan?: string; // 기획서 주소
  order: number;
};

function readingMinutes(content: string) {
  return Math.max(1, Math.round(content.replace(/\s/g, "").length / 500));
}

function toPostMeta(slug: string, data: Record<string, any>, content: string): PostMeta {
  return {
    slug,
    title: data.title,
    date: toDate(data.date),
    tags: data.tags ?? [],
    summary: data.summary ?? "",
    cover: data.cover,
    category: toCategorySlug(data.category),
    minutes: readingMinutes(content),
  };
}

function readDir(dir: string) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(full, f), "utf8");
      const { data, content } = matter(raw);
      return { slug: f.replace(/\.md$/, ""), data, content };
    });
}

export function getPosts(): PostMeta[] {
  return readDir("posts")
    .filter((p) => !p.data.draft)
    .map((p) => toPostMeta(p.slug, p.data, p.content))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string) {
  const p = readDir("posts").find((x) => x.slug === slug);
  if (!p) return null;
  return {
    meta: toPostMeta(slug, p.data, p.content),
    html: marked.parse(p.content) as string,
  };
}

export function getTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of getPosts()) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "ko"));
}

export function getCategoryCounts() {
  const posts = getPosts();
  return categories.map((c) => ({ ...c, count: posts.filter((p) => p.category === c.slug).length }));
}

export function getProjects(): ProjectMeta[] {
  return readDir("projects")
    .map((p) => ({ slug: p.slug, ...(p.data as Omit<ProjectMeta, "slug">) }))
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string) {
  const p = readDir("projects").find((x) => x.slug === slug);
  if (!p) return null;
  return {
    meta: { slug, ...(p.data as Omit<ProjectMeta, "slug">) },
    html: marked.parse(p.content) as string,
  };
}

// 프로젝트 기획서: content/plans/{프로젝트 slug}.md
export function getPlan(slug: string) {
  const p = readDir("plans").find((x) => x.slug === slug);
  if (!p) return null;
  return { title: (p.data.title as string) ?? "기획서", html: marked.parse(p.content) as string };
}

export function getPlanSlugs() {
  return readDir("plans").map((p) => p.slug);
}

// 프로젝트 ERD: content/erds/{프로젝트 slug}.md (mermaid 다이어그램)
export function getErd(slug: string) {
  const p = readDir("erds").find((x) => x.slug === slug);
  if (!p) return null;
  return { title: (p.data.title as string) ?? "ERD", html: marked.parse(p.content) as string };
}

export function getErdSlugs() {
  return readDir("erds").map((p) => p.slug);
}
