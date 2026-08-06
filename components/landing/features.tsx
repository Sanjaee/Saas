"use client"

import {
  Bot,
  Users,
  BarChart3,
  Code2,
  Cloud,
  ShieldCheck,
  Blocks,
  Smartphone,
  Workflow,
  FileBarChart,
  ArrowUpRight,
} from "lucide-react"
import { motion } from "framer-motion"

import { SectionHeading } from "./section-heading"
import { Reveal } from "./reveal"
import { cn } from "@/lib/utils"

const FEATURES = [
  { icon: Bot, title: "AI Automation", description: "Automate repetitive work with AI agents that learn from your data and take action on autopilot." },
  { icon: Users, title: "Team Collaboration", description: "Work together in real time with roles, permissions, comments and shared workspaces." },
  { icon: BarChart3, title: "Analytics", description: "Revenue, retention and growth analytics that answer the questions you actually have." },
  { icon: Code2, title: "API Access", description: "A clean REST API with SDKs for JavaScript, Python, Go and more — plus typed webhooks." },
  { icon: Cloud, title: "Cloud Storage", description: "Secure, redundant storage that scales automatically. Your data, always available." },
  { icon: ShieldCheck, title: "Security", description: "SOC 2 ready, SSO/SAML, audit logs and encryption in transit and at rest." },
  { icon: Blocks, title: "Integrations", description: "Connect Slack, GitHub, Stripe, Notion and 80+ tools in a couple of clicks." },
  { icon: Smartphone, title: "Mobile App", description: "Native apps for iOS and Android keep your metrics one thumb-tap away." },
  { icon: Workflow, title: "Workflow Builder", description: "Drag-and-drop pipelines that trigger on any event — no code required." },
  { icon: FileBarChart, title: "Reporting", description: "Beautiful, scheduled reports your whole team actually reads." },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Features"
          title={<>Everything you need to <span className="text-gradient">grow</span></>}
          description="Powerful capabilities that replace a dozen tools — designed to be loved by founders, operators and engineers alike."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative h-full overflow-hidden rounded-2xl border bg-card/50 p-6 transition-colors hover:border-violet-500/40 hover:bg-card"
              >
                <div className="absolute -top-16 -right-16 size-32 rounded-full bg-violet-500/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className={cn(
                  "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/25 transition-transform duration-300 group-hover:scale-110",
                )}>
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-4 flex items-center gap-1.5 text-lg font-semibold">
                  {feature.title}
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-violet-500 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
