import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts, getTags } from "@/lib/content";
import PostList from "@/components/PostList";
import TagChips from "@/components/TagChips";

export function generateStaticParams() {
  return getTags().map((t) => ({ tag: t.tag }));
}

async function tagOf(params: Promise<{ tag: string }>) {
  return decodeURIComponent((await params).tag);
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  return { title: `#${await tagOf(params)}` };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const tag = await tagOf(params);
  const posts = getPosts().filter((p) => p.tags.includes(tag));
  if (posts.length === 0) notFound();

  return (
    <>
      <h2 className="page-title">#{tag}</h2>
      <p className="page-lead">{tag} 주제로 쓴 글 {posts.length}편</p>
      <TagChips tags={getTags().map((t) => t.tag)} active={tag} />
      <PostList posts={posts} />
    </>
  );
}
