"use client"

import * as React from "react"
import { CheckSquare, Plus, Trash2, Flag, Circle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { cn } from "@/lib/utils"

interface Task {
  id: string;
  title: string;
  tag: string;
  priority: "low" | "normal" | "high";
  done: boolean;
}

const INITIAL: Task[] = [
  { id: "1", title: "Ship Q3 roadmap", tag: "Product", priority: "high", done: false },
  { id: "2", title: "Review MRR report", tag: "Finance", priority: "normal", done: false },
  { id: "3", title: "Hire 2nd AE", tag: "Sales", priority: "high", done: false },
  { id: "4", title: "Update pricing page", tag: "Marketing", priority: "normal", done: true },
  { id: "5", title: "Fix Stripe webhook", tag: "Engineering", priority: "high", done: false },
  { id: "6", title: "Prepare Q2 metrics deck", tag: "Finance", priority: "low", done: true },
]

const PRIORITY_COLORS: Record<string, string> = {
  high: "border-destructive/30 bg-destructive/10 text-destructive",
  normal: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  low: "border-sky-500/30 bg-sky-500/10 text-sky-500",
}

export function TasksBoard() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL);
  const [title, setTitle] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "active" | "done">("all");

  const visible = tasks.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done,
  );
  const remaining = tasks.filter((t) => !t.done).length;

  function addTask() {
    if (!title.trim()) return;
    setTasks([
      { id: crypto.randomUUID(), title: title.trim(), tag: "Personal", priority: "normal", done: false },
      ...tasks,
    ]);
    setTitle("");
    toast.success("Task added.");
  }

  function toggleTask(id: string) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
    toast.success("Task removed.");
  }

  return (
    <div>
      <PageHeader title="Tasks" description="Stay on top of everything that matters.">
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1 text-sm">
          <span className="size-2 rounded-full bg-violet-500" />
          {remaining} open
        </div>
      </PageHeader>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task…"
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <Button onClick={addTask} className="gap-1.5"><Plus className="size-4" /> Add</Button>
        </div>
        <div className="flex gap-1 rounded-full border bg-card p-1">
          {(["all", "active", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {visible.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            <CheckSquare className="mx-auto mb-2 size-8 opacity-40" />
            Nothing here — you&apos;re all caught up!
          </div>
        )}
        {visible.map((task) => (
          <Card key={task.id} className={cn("transition-opacity", task.done && "opacity-60")}>
            <CardContent className="flex items-center gap-3 p-4">
              <button
                aria-label="Toggle task"
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                  task.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-border hover:border-violet-500",
                )}
              >
                {task.done && <span className="text-[10px]">✓</span>}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium", task.done && "text-muted-foreground line-through")}>
                  {task.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">{task.tag}</Badge>
                  <Badge variant="outline" className={cn("text-[10px] capitalize", PRIORITY_COLORS[task.priority])}>
                    <Flag className="size-2.5" /> {task.priority}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Delete task" onClick={() => removeTask(task.id)}>
                <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
