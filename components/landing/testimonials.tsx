"use client"

import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SectionHeading } from "./section-heading"
import { Reveal } from "./reveal"
import { initials } from "@/lib/format"

export interface TestimonialItem {
  name: string;
  position?: string | null;
  company?: string | null;
  rating: number;
  content: string;
}

const FALLBACK: TestimonialItem[] = [
  { name: "Sarah Lee", position: "CEO", company: "Acme Inc", rating: 5, content: "Zacode cut our onboarding time in half. The AI insights feel like having an extra analyst on the team." },
  { name: "Marcus Chen", position: "Head of Growth", company: "Pied Piper", rating: 5, content: "We moved from a patchwork of tools to Zacode. MRR is up 38% since we started using the revenue analytics." },
  { name: "Amelia Rodriguez", position: "Product Manager", company: "Hooli", rating: 5, content: "The cleanest dashboard we've used. Setup took minutes, and the API is a joy to work with." },
]

export function Testimonials({ items = [] }: { items?: TestimonialItem[] }) {
  const testimonials = items.length ? items : FALLBACK

  return (
    <section id="testimonials" className="border-y bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Testimonials"
          title={<>Loved by teams, <span className="text-gradient">backed by results</span></>}
          description="Don't take our word for it — here's what our customers say."
        />
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.08}>
              <motion.figure
                whileHover={{ y: -5 }}
                className="relative flex h-full flex-col rounded-2xl border bg-card p-6"
              >
                <Quote className="absolute top-5 right-5 size-8 text-violet-500/10" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`size-4 ${s < t.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 font-sans text-sm leading-relaxed text-muted-foreground not-italic">
                  “{t.content}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-500 text-xs text-white">
                      {initials(t.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.position}{t.position && t.company ? " · " : ""}{t.company}
                    </p>
                  </div>
                </figcaption>
              </motion.figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
