"use client"

import {
  Rocket,
  MousePointerClick,
  ShieldCheck,
  Wallet,
  Sparkles,
  Scale,
  Headphones,
  Building2,
} from "lucide-react"
import { motion } from "framer-motion"

import { SectionHeading } from "./section-heading"
import { Reveal } from "./reveal"

const REASONS = [
  { icon: Rocket, title: "Fast Setup", text: "Live in under 5 minutes. Import data from anywhere, invite your team, done." },
  { icon: MousePointerClick, title: "Easy to Use", text: "A clean, opinionated interface your team will adopt without training." },
  { icon: ShieldCheck, title: "Secure", text: "SOC 2 controls, encryption everywhere and granular access permissions." },
  { icon: Wallet, title: "Affordable", text: "Transparent pricing that grows with you. Save 35% on annual plans." },
  { icon: Sparkles, title: "AI Powered", text: "Insights and automation built in — not bolted on as an upsell." },
  { icon: Scale, title: "Scalable", text: "From a side project to 1M requests a minute without a migration." },
  { icon: Headphones, title: "24/7 Support", text: "Real humans, median first reply under 4 minutes. Day or night." },
  { icon: Building2, title: "Enterprise Ready", text: "SSO, audit logs, custom SLAs and dedicated success managers." },
]

export function WhyChooseUs() {
  return (
    <section className="border-y bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Why Choose Us"
          title={<>The unfair advantage your <span className="text-gradient">team deserves</span></>}
          description="We obsessed over the details so you can focus on shipping."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={(i % 4) * 0.07}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 350, damping: 24 }}
                className="h-full rounded-2xl border bg-card p-6 text-center"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <r.icon className="size-6" />
                </div>
                <h3 className="mt-4 font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
