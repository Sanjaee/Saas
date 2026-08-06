"use client"
import type { ActionState } from "@/lib/action-state";

import * as React from "react"
import { useActionState } from "react"
import {
  LifeBuoy,
  MessagesSquare,
  BookOpen,
  FileCode2,
  Send,
  Loader2,
  Search,
  MessageCircle,
  Zap,
  CreditCard,
  Shield,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { submitTicketAction } from "@/actions/tickets"

const initialState: ActionState = { error: "", success: "" };

const ARTICLES = [
  { icon: Zap, title: "Getting started", desc: "Set up your workspace in 5 minutes.", articles: 12 },
  { icon: CreditCard, title: "Billing & payments", desc: "Plans, invoices, coupons and refunds.", articles: 8 },
  { icon: Shield, title: "Security", desc: "2FA, SSO, API keys and permissions.", articles: 6 },
  { icon: FileCode2, title: "API reference", desc: "Endpoints, webhooks and SDKs.", articles: 9 },
];

function TicketForm() {
  const [category, setCategory] = React.useState("Billing");
  const [priority, setPriority] = React.useState("normal");
  const [state, formAction, pending] = useActionState(submitTicketAction, initialState);

  React.useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-semibold">Submit a ticket</h3>
        <p className="mb-4 text-sm text-muted-foreground">Average first response: under 4 minutes.</p>
        <form action={formAction} className="space-y-4">
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Billing", "Account", "API", "Integrations", "Feature request", "Other"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="category" value={category} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["low", "normal", "high", "urgent"].map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="priority" value={priority} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-subject">Subject</Label>
            <Input id="t-subject" name="subject" placeholder="How can we help?" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-message">Message</Label>
            <Textarea id="t-message" name="message" rows={4} placeholder="Describe your issue in detail…" required />
          </div>
          <Button type="submit" className="gap-1.5" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Submit ticket
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function HelpCenter() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-white">
        <h2 className="text-2xl font-bold">How can we help you today?</h2>
        <p className="mt-1 text-violet-100">Search the knowledge base, read the docs, or talk to a human.</p>
        <div className="relative mt-4 max-w-lg">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-violet-200" />
          <Input placeholder="Search articles, e.g. 'export customers'…" className="border-white/20 bg-white/10 pl-9 text-white placeholder:text-violet-200" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ARTICLES.map((article) => (
          <button key={article.title} className="group rounded-xl border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <span className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
              <article.icon className="size-5 text-violet-500" />
            </span>
            <h3 className="mt-3 font-semibold group-hover:text-violet-500">{article.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{article.desc}</p>
            <p className="mt-2 text-xs font-medium text-violet-500">{article.articles} articles →</p>
          </button>
        ))}
      </div>

      <Tabs defaultValue="ticket">
        <TabsList>
          <TabsTrigger value="ticket" className="gap-1.5"><MessagesSquare className="size-4" /> Submit a ticket</TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5"><MessageCircle className="size-4" /> Live chat</TabsTrigger>
          <TabsTrigger value="docs" className="gap-1.5"><BookOpen className="size-4" /> Documentation</TabsTrigger>
        </TabsList>
        <TabsContent value="ticket" className="mt-4">
          <TicketForm />
        </TabsContent>
        <TabsContent value="chat" className="mt-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-violet-500/10">
                <MessagesSquare className="size-7 text-violet-500" />
              </span>
              <h3 className="font-semibold">Chat with support</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Our team is online now. Median first reply is under 4 minutes, 24/7.
              </p>
              <Button className="gap-1.5"><MessageCircle className="size-4" /> Start live chat</Button>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                4 agents online
              </Badge>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="docs" className="mt-4">
          <Card>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
              {[
                "REST API quickstart",
                "Webhooks guide",
                "Authentication & API keys",
                "Data export & import",
                "Multi-currency billing",
                "Role-based permissions",
              ].map((doc) => (
                <a key={doc} href="#" className="flex items-center justify-between rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted/40">
                  {doc}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </a>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
