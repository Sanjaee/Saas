import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";

import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { SectionHeading } from "@/components/landing/section-heading";
import { Badge } from "@/components/ui/badge";
import { listPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog",
  description: "Growth, product and engineering insights from the Zacode team.",
};

const FALLBACK_POSTS: {
  title: string;
  slug: string;
  excerpt: string | null;
  authorName: string;
  tags: string[];
  publishedAt: Date;
  coverImage: string | null;
}[] = [
  { title: "The 2026 Guide to AI-Powered Growth", slug: "ai-powered-growth-2026", excerpt: "How modern SaaS teams use AI to compound growth.", authorName: "Alex Morgan", tags: ["AI", "Growth"], publishedAt: new Date(), coverImage: null },
  { title: "10 Automation Workflows That Save 20 Hours a Week", slug: "automation-workflows", excerpt: "Battle-tested automation recipes for busy operators.", authorName: "Priya Sharma", tags: ["Automation", "Productivity"], publishedAt: new Date(), coverImage: null },
  { title: "From Free Trial to Paying Customer", slug: "trial-to-paying", excerpt: "A playbook for turning trial users into revenue.", authorName: "Tom Becker", tags: ["Growth", "Pricing"], publishedAt: new Date(), coverImage: null },
];

export default async function BlogPage() {
  let posts = FALLBACK_POSTS;
  try {
    const fetched = await listPosts(true);
    if (fetched.length) posts = fetched;
  } catch {
    // fallback
  }

  return (
    <>
      <Nav />
      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Blog"
            title={<>Insights for builders &amp; <span className="text-gradient">operators</span></>}
            description="Practical lessons on growth, product and engineering."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10"
              >
                <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-indigo-500/15 text-violet-500/40">
                  <svg viewBox="0 0 24 24" fill="none" className="size-12">
                    <path d="M6 14.5 3 8l3-6h8l-3 6 3 6H6Z" fill="currentColor" />
                    <path d="M12 21c0-1.8-1.2-3-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {formatDate(post.publishedAt)}
                    <span className="ml-auto flex items-center gap-1">
                      <Tag className="size-3" />
                      {post.tags?.[0] ?? "Product"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-snug group-hover:text-violet-500">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-medium">{post.authorName}</span>
                    <span className="flex items-center gap-1 text-violet-500 opacity-0 transition-opacity group-hover:opacity-100">
                      Read <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
