"use client"

import { motion } from "framer-motion"

import { SectionHeading } from "./section-heading"
import { Reveal } from "./reveal"

const INTEGRATIONS = [
  { name: "Slack", color: "#E01E5A", glyph: "#" },
  { name: "Discord", color: "#5865F2", glyph: "D" },
  { name: "GitHub", color: "#24292f", glyph: "G" },
  { name: "Google", color: "#4285F4", glyph: "G" },
  { name: "Stripe", color: "#635BFF", glyph: "S" },
  { name: "Zapier", color: "#FF4F00", glyph: "Z" },
  { name: "Notion", color: "#000000", glyph: "N" },
  { name: "Figma", color: "#F24E1E", glyph: "F" },
  { name: "Trello", color: "#0079BF", glyph: "T" },
  { name: "Airtable", color: "#18BFFF", glyph: "A" },
]

export function Integrations() {
  return (
    <section id="integrations" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Integrations"
          title={<>Works with the tools you <span className="text-gradient">already love</span></>}
          description="Connect your stack in minutes. 80+ integrations and a webhooks API for everything else."
        />
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {INTEGRATIONS.map((integration, i) => (
            <Reveal key={integration.name} delay={(i % 5) * 0.06}>
              <motion.div
                whileHover={{ y: -5 }}
                className="flex items-center gap-3 rounded-2xl border bg-card/50 p-4 transition-colors hover:border-violet-500/40 hover:bg-card"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: integration.color }}
                >
                  {integration.glyph}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
