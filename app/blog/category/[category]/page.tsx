import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getPosts } from "@/lib/content";
import PostList from "@/components/PostList";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

async function categoryOf(params: Promise<{ category: string }>) {
  const slug = (await params).category;
  return categories.find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  return { title: (await categoryOf(params))?.name ?? "기록" };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const category = await categoryOf(params);
  if (!category) notFound();
  const posts = getPosts().filter((p) => p.category === category.slug);

  return (
    <>
      <h2 className="page-title">{category.name}</h2>
      <p className="page-lead">
        {posts.length > 0 ? `${category.name} 분야 기록 ${posts.length}편` : `${category.name} 분야 기록을 준비하고 있어요`}
      </p>
      <PostList posts={posts} />
    </>
  );
}
