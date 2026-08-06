"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Plus, FolderKanban, Users, CalendarDays, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/dashboard/page-header"
import { cn } from "@/lib/utils"

const PROJECTS = [
  { id: "1", name: "Website Redesign", description: "Rebuild marketing site with new brand.", color: "from-violet-500 to-indigo-500", status: "In progress", progress: 72, members: ["SL", "MK", "AR"], due: "Mar 14" },
  { id: "2", name: "Mobile App v2", description: "Native apps for iOS & Android.", color: "from-emerald-500 to-teal-500", status: "On track", progress: 45, members: ["DK", "EJ"], due: "Apr 02" },
  { id: "3", name: "API v2.4", description: "Rate limits, webhooks & SDK refresh.", color: "from-amber-500 to-orange-500", status: "Review", progress: 88, members: ["MK", "SL"], due: "Mar 08" },
  { id: "4", name: "Enterprise SSO", description: "SAML SSO for enterprise customers.", color: "from-sky-500 to-blue-500", status: "Blocked", progress: 30, members: ["AR"], due: "May 01" },
  { id: "5", name: "Pricing Experiment", description: "A/B test annual pricing page.", color: "from-rose-500 to-pink-500", status: "Planning", progress: 10, members: ["EJ", "DK"], due: "Jun 10" },
  { id: "6", name: "Q3 Roadmap", description: "Define and scope Q3 initiatives.", color: "from-fuchsia-500 to-purple-500", status: "Planning", progress: 5, members: ["SL"], due: "Jul 01" },
]

const STATUS_COLORS: Record<string, string> = {
  "In progress": "border-violet-500/30 bg-violet-500/10 text-violet-500",
  "On track": "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  Review: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  Blocked: "border-destructive/30 bg-destructive/10 text-destructive",
  Planning: "border-sky-500/30 bg-sky-500/10 text-sky-500",
}

export function ProjectsGrid() {
  return (
    <div>
      <PageHeader title="Projects" description="Organize and track every initiative.">
        <Button className="gap-1.5"><Plus className="size-4" /> New project</Button>
      </PageHeader>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group h-full transition-shadow hover:shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={cn("flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg", project.color)}>
                    <FolderKanban className="size-5" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Project actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="font-semibold">{project.name}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                <div className="mt-3">
                  <Badge variant="outline" className={cn("capitalize", STATUS_COLORS[project.status])}>
                    {project.status}
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="mt-1.5 h-2" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.map((m) => (
                      <Avatar key={m} className="size-6 ring-2 ring-card">
                        <AvatarFallback className="bg-violet-500/20 text-[8px] font-bold text-violet-500">{m}</AvatarFallback>
                      </Avatar>
                    ))}
                    <span className="flex size-6 items-center justify-center rounded-full border border-dashed text-muted-foreground">
                      <Users className="size-3" />
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="size-3" /> {project.due}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
