"use client"

import { motion } from "framer-motion"
import { ArrowRight, MessageCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function Cta() {
  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid mask-fade-b opacity-60" aria-hidden />
      <div className="animate-aurora absolute -top-20 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/30 to-indigo-500/30 blur-3xl" aria-hidden />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
      >
        <div className="glass glow-violet rounded-3xl px-6 py-16 sm:px-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Start <span className="text-gradient">Growing</span> Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Join 12,000+ teams building faster with Zacode. Free for 14 days — no
            credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="group w-full gap-2 px-10 text-base sm:w-auto">
                Start Free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="w-full gap-2 px-10 text-base sm:w-auto">
                <MessageCircle className="size-4" /> Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
