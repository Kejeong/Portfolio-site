import type { Metadata } from "next";
import { getPosts, getTags } from "@/lib/content";
import PostList from "@/components/PostList";
import TagChips from "@/components/TagChips";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  return (
    <>
      <h2 className="page-title">공부 노트</h2>
      <p className="page-lead">공부하고 부딪히며 정리한 내용</p>
      <TagChips tags={getTags().map((t) => t.tag)} />
      <PostList posts={getPosts()} />
    </>
  );
}
