"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Play,
  TrendingUp,
  Users,
  Zap,
  Bell,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useCountUp } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const revenueData = [
  { m: "Jan", v: 42 }, { m: "Feb", v: 48 }, { m: "Mar", v: 45 },
  { m: "Apr", v: 58 }, { m: "May", v: 63 }, { m: "Jun", v: 61 },
  { m: "Jul", v: 74 }, { m: "Aug", v: 82 }, { m: "Sep", v: 79 },
  { m: "Oct", v: 95 }, { m: "Nov", v: 108 }, { m: "Dec", v: 124 },
]

function LiveUsers() {
  const { ref, formatted } = useCountUp(12847, 2500)
  return (
    <span ref={ref} className="tabular-nums">
      {formatted}
    </span>
  )
}

function DashboardMockup() {
  return (
    <div className="glass relative overflow-hidden rounded-2xl shadow-2xl shadow-violet-500/10 ring-1 ring-black/5 dark:ring-white/10">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-violet-500" />
          app.zacode.dev/dashboard
        </div>
        <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">
          Live
        </Badge>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-12">
        <div className="hidden flex-col gap-2 sm:flex sm:col-span-2">
          {[
            { icon: TrendingUp, label: "Overview", active: true },
            { icon: Users, label: "Customers" },
            { icon: Zap, label: "Automations" },
            { icon: Bell, label: "Alerts" },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium",
                item.active
                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                  : "text-muted-foreground",
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:col-span-10">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "MRR", value: "$92,450", delta: "+11.7%", up: true },
              { label: "Active Users", value: "18.4k", delta: "+8.2%", up: true },
              { label: "Conversion", value: "3.42%", delta: "+0.4%", up: true },
              { label: "Churn", value: "1.8%", delta: "-0.3%", up: true },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-card/60 p-3">
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-sm font-bold">{stat.value}</p>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    stat.up ? "text-emerald-500" : "text-destructive",
                  )}
                >
                  {stat.delta}
                </span>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-5">
            <div className="rounded-xl border bg-card/60 p-3 lg:col-span-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">Revenue</p>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                  ▲ 24.2%
                </span>
              </div>
              <div className="mt-2 h-24">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="heroRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={[30, "dataMax + 10"]} />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      fill="url(#heroRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border bg-card/60 p-3 lg:col-span-2">
              <p className="text-xs font-medium">Recent activity</p>
              {[
                { name: "SL", text: "Paid Pro invoice", time: "2m", color: "bg-violet-500" },
                { name: "MK", text: "Joined workspace", time: "9m", color: "bg-indigo-500" },
                { name: "AR", text: "Upgraded to annual", time: "24m", color: "bg-emerald-500" },
              ].map((a) => (
                <div key={a.name} className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className={cn("text-[9px] text-white", a.color)}>
                      {a.name}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium">{a.text}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{a.time}</span>
                </div>
              ))}
              <div className="mt-auto rounded-lg bg-violet-500/10 px-3 py-2 text-[11px] font-medium text-violet-600 dark:text-violet-300">
                <Sparkles className="mr-1 inline size-3" /> AI insight: Revenue up 24% MoM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section id="solutions" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 bg-grid mask-fade-b" aria-hidden />
      <div
        className="animate-aurora absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/30 via-fuchsia-500/20 to-indigo-500/30 blur-3xl"
        aria-hidden
      />
      <div
        className="animate-glow-pulse absolute top-24 left-[15%] h-64 w-64 rounded-full bg-violet-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="animate-glow-pulse absolute top-40 right-[12%] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex justify-center"
          >
            <Badge className="gap-1.5 rounded-full py-1.5 pl-2 pr-3 text-xs font-medium">
              <span className="flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-600 dark:text-violet-300">
                <Sparkles className="size-3" /> New
              </span>
              AI-powered insights are here
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            Build Your Business Faster With{" "}
            <span className="text-gradient">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty sm:text-xl"
          >
            Zacode unifies your analytics, automation, billing and team — so you
            can launch faster, decide smarter, and scale without the chaos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="group w-full gap-2 px-8 text-base sm:w-auto">
                Start Free Trial
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="w-full gap-2 px-8 text-base sm:w-auto">
                  <span className="flex size-6 items-center justify-center rounded-full bg-violet-500/10">
                    <Play className="size-3.5 text-violet-500" />
                  </span>
                  Watch Demo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20 ring-1 ring-border">
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Play className="size-12 text-violet-500" />
                    <p className="text-sm font-medium">Product demo — 2 min</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" /> 14-day free trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <LiveUsers /> users online
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="absolute -inset-x-8 top-6 bottom-0 rounded-3xl bg-gradient-to-b from-violet-500/30 to-transparent blur-2xl" aria-hidden />
          <DashboardMockup />

          <div className="animate-float absolute -top-8 -left-4 hidden rounded-xl border bg-background p-3 shadow-xl sm:block lg:-left-12">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue this month</p>
                <p className="text-sm font-bold tabular-nums">+$12,480</p>
              </div>
            </div>
          </div>

          <div className="animate-float-delayed absolute -bottom-6 -right-4 hidden rounded-xl border bg-background p-3 shadow-xl sm:block lg:-right-12">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                <Bell className="size-5 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">New notification</p>
                <p className="text-sm font-medium">Invoice INV-20260012 paid</p>
              </div>
              <span className="size-2 rounded-full bg-violet-500" />
            </div>
          </div>

          <div className="animate-float absolute top-1/2 -left-6 hidden -translate-y-1/2 rounded-xl border bg-background p-3 shadow-xl lg:block lg:-left-20">
            <div className="flex items-center gap-2">
              <span className="flex -space-x-2">
                {["bg-violet-500", "bg-indigo-500", "bg-emerald-500"].map((c) => (
                  <span key={c} className={`size-5 rounded-full ring-2 ring-background ${c}`} />
                ))}
              </span>
              <div>
                <p className="text-xs font-bold">+18 new members</p>
                <p className="text-[10px] text-muted-foreground">this week</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
