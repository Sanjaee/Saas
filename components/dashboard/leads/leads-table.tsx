"use client"
import type { ActionState } from "@/lib/action-state";

import * as React from "react"
import { useActionState } from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createLeadAction, updateLeadAction, deleteLeadAction } from "@/actions/crm"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface LeadRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: string;
  source: string | null;
  score: number;
  createdAt: Date;
}

const columnHelper = createColumnHelper<LeadRow>();

const STATUS_STYLES: Record<string, string> = {
  new: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  contacted: "border-violet-500/30 bg-violet-500/10 text-violet-500",
  qualified: "border-indigo-500/30 bg-indigo-500/10 text-indigo-500",
  proposal: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  won: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  lost: "border-destructive/30 bg-destructive/10 text-destructive",
};

const initialState: ActionState = { error: "", success: "" };

function LeadFormDialog({
  mode,
  lead,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  lead?: LeadRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [status, setStatus] = React.useState(lead?.status ?? "new");
  const [state, formAction, pending] = useActionState(
    mode === "edit" ? updateLeadAction : createLeadAction,
    initialState,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit lead" : "Add lead"}</DialogTitle>
          <DialogDescription>Manage lead details and pipeline stage.</DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={formAction} className="space-y-4">
          {mode === "edit" && lead && <input type="hidden" name="id" value={lead.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Full name</Label>
              <Input id="lead-name" name="name" defaultValue={lead?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email</Label>
              <Input id="lead-email" name="email" type="email" defaultValue={lead?.email} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-company">Company</Label>
              <Input id="lead-company" name="company" defaultValue={lead?.company ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-source">Source</Label>
              <Input id="lead-source" name="source" defaultValue={lead?.source ?? ""} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["new", "contacted", "qualified", "proposal", "won", "lost"].map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="status" value={status} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-score">Score (0–100)</Label>
              <Input id="lead-score" name="score" type="number" min={0} max={100} defaultValue={lead?.score ?? 0} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {mode === "edit" ? "Save changes" : "Add lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LeadsTable({ rows }: { rows: LeadRow[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LeadRow | undefined>();
  const [deleting, setDeleting] = React.useState<LeadRow | undefined>();

  const columns = React.useMemo<ColumnDef<LeadRow, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Lead",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      }),
      columnHelper.accessor("company", {
        header: "Company",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() ?? "—"}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[getValue()] ?? "")}>
            {getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("source", {
        header: "Source",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() ?? "—"}</span>,
      }),
      columnHelper.accessor("score", {
        header: "Score",
        cell: ({ getValue }) => {
          const score = getValue();
          return (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-destructive",
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-xs font-medium">{score}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>,
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit lead"
              onClick={() => { setEditing(row.original); setDialogOpen(true); }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              aria-label="Delete lead"
              onClick={() => setDeleting(row.original)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search leads…"
        filterOptions={["new", "contacted", "qualified", "proposal", "won", "lost"].map((s) => ({ label: s, value: s }))}
        filterColumn="status"
        toolbar={
          <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5">
            <Plus className="size-4" /> Add lead
          </Button>
        }
      />

      {dialogOpen && (
        <LeadFormDialog mode={editing ? "edit" : "create"} lead={editing} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {deleting?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                await deleteLeadAction(deleting.id);
                toast.success("Lead deleted.");
                setDeleting(undefined);
                window.location.reload();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
