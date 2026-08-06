import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, User } from "lucide-react";

import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug, listPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";

export async function generateStaticParams() {
  try {
    const posts = await listPosts(true);
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Post not found" };
    return {
      title: post.title,
      description: post.excerpt ?? undefined,
    };
  } catch {
    return { title: "Blog" };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post = null;
  try {
    post = await getPostBySlug(slug);
  } catch {
    post = null;
  }
  if (!post) notFound();

  const paragraphs = (post.content ?? "…")
    .split("\n")
    .filter((p) => p.trim().length > 0)
    .slice(0, 12);

  return (
    <>
      <Nav />
      <main className="pt-28 pb-24">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to blog
          </Link>
          <div className="mt-6 flex flex-wrap gap-2">
            {(post.tags ?? []).map((tag) => (
              <Badge key={tag} variant="outline" className="text-violet-500">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-6 flex items-center gap-4 border-b pb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-4" /> {post.authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" /> {formatDate(post.publishedAt)}
            </span>
          </div>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/90">
            <p className="text-lg font-medium text-muted-foreground">{post.excerpt}</p>
            {paragraphs.length > 1 ? (
              paragraphs.slice(1).map((p, i) => (
                <p key={i}>{p}</p>
              ))
            ) : (
              <>
                <p>This is a scaffolded blog post. In production, rich content is stored in the database and rendered here.</p>
                <p>Connect Zacode to a real CMS or edit the <code>blogPosts</code> table to publish full articles.</p>
              </>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
