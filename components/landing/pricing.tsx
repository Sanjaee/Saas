"use client"

import * as React from "react"
import { Check, Sparkles, Flame, ArrowRight, Building2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionHeading } from "./section-heading"
import { Reveal } from "./reveal"

export interface PlanItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number;
  originalMonthlyPrice: number;
  originalAnnualPrice: number;
  features: string[];
  popular: boolean;
  ctaText: string;
}

export function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = React.useState(calc);
  React.useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return time;
}

function Countdown({ target }: { target: Date }) {
  const t = useCountdown(target);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const cells = [
    { label: "Days", value: t.d },
    { label: "Hrs", value: t.h },
    { label: "Min", value: t.m },
    { label: "Sec", value: t.s },
  ];
  return (
    <div className="flex items-center gap-2">
      {cells.map((c) => (
        <div key={c.label} className="flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-base font-bold tabular-nums">
            {mounted ? String(c.value).padStart(2, "0") : "--"}
          </div>
          <span className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

function PlanCard({ plan, annual }: { plan: PlanItem; annual: boolean }) {
  const isEnterprise = plan.slug === "enterprise";
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const original = annual ? plan.originalAnnualPrice : plan.originalMonthlyPrice;
  const hasDiscount = original > 0 && price > 0 && original > price;
  const savings = original > price ? Math.round(((original - price) / original) * 100) : 0;
  const displayPrice = isEnterprise ? "Custom" : price === 0 ? "$0" : `$${price}`;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-7",
        plan.popular
          ? "border-transparent bg-gradient-to-b from-violet-600 to-indigo-600 text-white shadow-2xl shadow-violet-500/30"
          : "bg-card",
      )}
    >
      {plan.popular && (
        <>
          <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-b from-violet-500 to-indigo-500 blur-sm" aria-hidden />
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 bg-white px-3 py-1 text-violet-700 shadow">
            <Sparkles className="size-3" /> Most Popular
          </Badge>
        </>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{plan.name}</h3>
        {hasDiscount && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              plan.popular ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-500",
            )}
          >
            Save {savings}%
          </span>
        )}
      </div>
      <p className={cn("mt-1 text-sm", plan.popular ? "text-violet-100" : "text-muted-foreground")}>
        {plan.description}
      </p>

      <div className="mt-5 flex items-end gap-2">
        <span className="text-4xl font-extrabold tracking-tight">{displayPrice}</span>
        {!isEnterprise && (
          <span className={cn("pb-1 text-sm", plan.popular ? "text-violet-100" : "text-muted-foreground")}>
            /{annual ? "year" : "month"}
          </span>
        )}
      </div>
      {hasDiscount && (
        <p className={cn("mt-1 text-xs", plan.popular ? "text-violet-100" : "text-muted-foreground")}>
          <span className="line-through opacity-70">${original}</span>{" "}
          {annual ? "billed annually" : "billed monthly"}
        </p>
      )}
      {isEnterprise && (
        <p className={cn("mt-1 text-xs", plan.popular ? "text-violet-100" : "text-muted-foreground")}>
          Tailored to your organization
        </p>
      )}

      <ul className="mt-6 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                plan.popular ? "bg-white/20" : "bg-violet-500/10 text-violet-500",
              )}
            >
              <Check className="size-2.5" />
            </span>
            <span className={plan.popular ? "text-violet-50" : "text-foreground"}>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7">
        {isEnterprise ? (
          <Link href="#contact">
            <Button
              variant="outline"
              className={cn(
                "group w-full gap-2",
                plan.popular && "border-white/40 bg-transparent text-white hover:bg-white/10",
              )}
            >
              <Building2 className="size-4" /> Contact Sales
            </Button>
          </Link>
        ) : (
          <Link href="/register" className="block">
            <Button
              size="lg"
              className={cn(
                "group w-full gap-2",
                plan.popular
                  ? "bg-white text-violet-700 shadow-lg hover:bg-violet-50"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-600/90 hover:to-indigo-600/90",
              )}
            >
              {plan.ctaText}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        )}
        <p className={cn("mt-2 text-center text-xs", plan.popular ? "text-violet-100" : "text-muted-foreground")}>
          {plan.popular ? "14-day free trial · Cancel anytime" : isEnterprise ? "Talk to an expert today" : "Start your free trial"}
        </p>
      </div>
    </motion.div>
  )
}

const COMPARISON = [
  { feature: "Projects", starter: "3", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "API calls / month", starter: "10K", pro: "1M", enterprise: "Unlimited" },
  { feature: "Team members", starter: "2", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Advanced analytics", starter: false, pro: true, enterprise: true },
  { feature: "AI insights", starter: false, pro: true, enterprise: true },
  { feature: "Custom integrations", starter: false, pro: true, enterprise: true },
  { feature: "SSO / SAML", starter: false, pro: false, enterprise: true },
  { feature: "Dedicated support", starter: false, pro: false, enterprise: true },
  { feature: "99.99% SLA", starter: false, pro: false, enterprise: true },
]

function CheckIcon() {
  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-violet-500/10">
      <Check className="size-3 text-violet-500" />
    </span>
  )
}
function MinusIcon() {
  return <span className="text-muted-foreground">—</span>
}

function ComparisonTable() {
  return (
    <Reveal className="mt-20">
      <h3 className="mb-6 text-center text-xl font-bold">Compare plans</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Feature</th>
              {["Starter", "Pro", "Enterprise"].map((name) => (
                <th key={name} className="px-4 py-3 font-semibold">
                  <span className={cn(name === "Pro" && "text-violet-600 dark:text-violet-300")}>{name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row, i) => (
              <tr key={row.feature} className={cn("border-b", i % 2 === 0 && "bg-muted/30")}>
                <td className="px-4 py-3 font-medium">{row.feature}</td>
                {[row.starter, row.pro, row.enterprise].map((cell, j) => (
                  <td key={j} className="px-4 py-3">
                    {typeof cell === "boolean" ? (cell ? <CheckIcon /> : <MinusIcon />) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  )
}

export function Pricing({ plans = [] }: { plans?: PlanItem[] }) {
  const [annual, setAnnual] = React.useState(true)
  const campaignEnd = React.useMemo(() => {
    const end = new Date();
    end.setMonth(end.getMonth() + 1, 1);
    end.setHours(0, 0, 0, 0);
    return end;
  }, [])

  const defaultPlans: PlanItem[] = [
    { id: "1", name: "Starter", slug: "starter", description: "For individuals and small teams getting started.", monthlyPrice: 19, annualPrice: 182, originalMonthlyPrice: 29, originalAnnualPrice: 278, features: ["3 projects", "10,000 API calls/mo", "Basic analytics", "Community support", "2 team members"], popular: false, ctaText: "Start Free Trial" },
    { id: "2", name: "Pro", slug: "pro", description: "For growing teams that need power and flexibility.", monthlyPrice: 49, annualPrice: 470, originalMonthlyPrice: 79, originalAnnualPrice: 758, features: ["Unlimited projects", "1M API calls/mo", "Advanced analytics & AI insights", "Priority support", "Unlimited team members", "Custom integrations", "API access"], popular: true, ctaText: "Start Free Trial" },
    { id: "3", name: "Enterprise", slug: "enterprise", description: "Security, compliance and scale for large organizations.", monthlyPrice: 0, annualPrice: 0, originalMonthlyPrice: 0, originalAnnualPrice: 0, features: ["Everything in Pro", "SSO / SAML", "Dedicated success manager", "99.99% SLA", "Custom contracts", "On-premise option"], popular: false, ctaText: "Contact Sales" },
  ]

  const items = plans.length ? plans : defaultPlans

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="absolute inset-x-0 top-20 -z-10 mx-auto h-96 max-w-3xl rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 blur-3xl" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Pricing"
          title={<>Simple, transparent <span className="text-gradient">pricing</span></>}
          description="Start free, upgrade when you're ready. No hidden fees, cancel anytime."
        />

        <Reveal className="mt-8">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
            <div className="flex items-center gap-1 rounded-full border bg-card p-1">
              <button
                onClick={() => setAnnual(false)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  !annual ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground",
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  annual ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground",
                )}
              >
                Annual
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                  SAVE 20%
                </span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-500">
                <Flame className="size-4" />
                Campaign ends in
                <Countdown target={campaignEnd} />
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-5">
          {items.map((plan, i) => (
            <Reveal key={plan.slug} delay={i * 0.08} className="h-full">
              <PlanCard plan={plan} annual={annual} />
            </Reveal>
          ))}
        </div>

        <ComparisonTable />
      </div>
    </section>
  )
}
