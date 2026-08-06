"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CalendarDays,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"

import { SectionHeading } from "./section-heading"
import { Reveal } from "./reveal"
import { cn } from "@/lib/utils"

const revenue = [
  { m: "Jan", v: 42 }, { m: "Feb", v: 48 }, { m: "Mar", v: 45 }, { m: "Apr", v: 58 },
  { m: "May", v: 63 }, { m: "Jun", v: 61 }, { m: "Jul", v: 74 }, { m: "Aug", v: 82 },
]
const growth = [
  { m: "W1", v: 2100 }, { m: "W2", v: 2600 }, { m: "W3", v: 3200 }, { m: "W4", v: 4100 },
  { m: "W5", v: 4600 }, { m: "W6", v: 5200 },
]
const sessions = [
  { name: "Desktop", value: 54, color: "#7c3aed" },
  { name: "Mobile", value: 34, color: "#6366f1" },
  { name: "Tablet", value: 12, color: "#10b981" },
]
const team = [
  { name: "SL", color: "bg-violet-500" },
  { name: "MK", color: "bg-indigo-500" },
  { name: "AR", color: "bg-emerald-500" },
  { name: "DK", color: "bg-amber-500" },
  { name: "EJ", color: "bg-rose-500" },
]
const tasks = [
  { title: "Ship Q3 roadmap", tag: "Product", done: false },
  { title: "Review MRR report", tag: "Finance", done: true },
  { title: "Hire 2nd AE", tag: "Sales", done: false },
]
const insights = [
  "Enterprise pipeline up 18% this week — follow up with 3 warm leads.",
  "Churn risk detected for 5 accounts on Starter. Consider a win-back email.",
]

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border bg-card/60 p-4", className)}>
      {children}
    </div>
  )
}

export function DashboardPreview() {
  return (
    <section id="dashboard" className="relative py-24 sm:py-32">
      <div className="absolute inset-x-0 top-1/2 -z-10 mx-auto h-[500px] max-w-4xl rounded-full bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10 blur-3xl" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Dashboard Preview"
          title={<>A command center that actually <span className="text-gradient">runs your business</span></>}
          description="Every metric that matters — revenue, growth, sessions and team — in one real-time view."
        />

        <Reveal className="mt-16" y={40}>
          <div className="rounded-3xl border bg-background/80 p-2 shadow-2xl shadow-violet-500/10 backdrop-blur">
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-400/80" />
                <span className="size-2.5 rounded-full bg-amber-400/80" />
                <span className="size-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="ml-3 hidden rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground sm:block">
                app.zacode.dev/analytics
              </span>
            </div>

            <div className="grid gap-4 p-4 lg:grid-cols-3">
              <Panel className="lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Revenue Overview</p>
                    <p className="text-xs text-muted-foreground">vs. last period</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                    ▲ 24.2%
                  </span>
                </div>
                <div className="mt-4 h-52">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={revenue}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                      <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: "currentColor", opacity: 0.06 }}
                        contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }}
                      />
                      <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                        {revenue.map((_, i) => (
                          <Cell key={i} fill={i === revenue.length - 1 ? "#7c3aed" : "var(--chart-2)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <div className="grid gap-4">
                <Panel>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="size-4 text-violet-500" /> User Growth
                  </div>
                  <div className="mt-2 h-24">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <LineChart data={growth}>
                        <Line type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2} dot={false} />
                        <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">+4,600 new users in 6 weeks</p>
                </Panel>
                <Panel>
                  <div className="text-sm font-medium">Active Sessions</div>
                  <div className="flex items-center gap-3">
                    <div className="h-20 w-20">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                          <Pie data={sessions} dataKey="value" innerRadius={24} outerRadius={36} strokeWidth={0}>
                            {sessions.map((s) => (
                              <Cell key={s.name} fill={s.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1 text-xs">
                      {sessions.map((s) => (
                        <div key={s.name} className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ background: s.color }} />
                          {s.name}
                          <span className="ml-auto font-medium">{s.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>
              </div>

              <Panel>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-violet-500" /> AI Insights
                </div>
                <div className="mt-3 space-y-2">
                  {insights.map((insight, i) => (
                    <div key={i} className="rounded-lg bg-violet-500/5 p-3 text-xs leading-relaxed text-muted-foreground ring-1 ring-violet-500/10">
                      {insight}
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckSquare className="size-4 text-indigo-500" /> Tasks
                </div>
                <div className="mt-3 space-y-2">
                  {tasks.map((task) => (
                    <div key={task.title} className="flex items-center gap-2 text-xs">
                      <span className={cn(
                        "flex size-4 items-center justify-center rounded border",
                        task.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-border",
                      )}>
                        {task.done && <span className="text-[9px]">✓</span>}
                      </span>
                      <span className={cn(task.done && "text-muted-foreground line-through")}>{task.title}</span>
                      <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{task.tag}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CalendarDays className="size-4 text-emerald-500" /> This Week
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  {[
                    { d: "Mon 10", e: "Growth review" },
                    { d: "Tue 11", e: "Customer call — Acme" },
                    { d: "Wed 12", e: "Release v2.4" },
                    { d: "Thu 13", e: "Board sync" },
                  ].map((ev) => (
                    <div key={ev.d} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <span className="font-medium">{ev.d}</span>
                      <span className="text-muted-foreground">{ev.e}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="size-4 text-amber-500" /> Team Members
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {team.map((t) => (
                      <span key={t.name} className={cn("flex size-8 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-card", t.color)}>
                        {t.name}
                      </span>
                    ))}
                  </div>
                  <span className="flex size-8 items-center justify-center rounded-full border border-dashed text-muted-foreground">
                    +
                  </span>
                  <p className="ml-auto text-xs text-muted-foreground">9 online</p>
                </div>
              </Panel>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
