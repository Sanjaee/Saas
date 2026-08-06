"use client"
import type { ActionState } from "@/lib/action-state";

import * as React from "react"
import { useActionState } from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, Package, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
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
import { createPlanAction, updatePlanAction, deletePlanAction } from "@/actions/admin"
import { cn } from "@/lib/utils"

export interface AdminPlanRow {
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
  active: boolean;
  ctaText: string;
  sortOrder: number;
}

const columnHelper = createColumnHelper<AdminPlanRow>();
const initialState: ActionState = { error: "", success: "" };

function PlanFormDialog({
  mode,
  plan,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  plan?: AdminPlanRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [popular, setPopular] = React.useState(plan?.popular ?? false);
  const [active, setActive] = React.useState(plan?.active ?? true);
  const [state, formAction, pending] = useActionState(
    mode === "edit" ? updatePlanAction : createPlanAction,
    initialState,
  );

  React.useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit plan" : "Create plan"}</DialogTitle>
          <DialogDescription>Define pricing and features for this tier.</DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={formAction} className="space-y-4">
          {mode === "edit" && plan && <input type="hidden" name="id" value={plan.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pl-name">Name</Label>
              <Input id="pl-name" name="name" defaultValue={plan?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-slug">Slug</Label>
              <Input id="pl-slug" name="slug" defaultValue={plan?.slug} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pl-desc">Description</Label>
            <Textarea id="pl-desc" name="description" rows={2} defaultValue={plan?.description ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="pl-mp">Monthly $</Label>
              <Input id="pl-mp" name="monthlyPrice" type="number" min={0} defaultValue={plan?.monthlyPrice ?? 0} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-ap">Annual $</Label>
              <Input id="pl-ap" name="annualPrice" type="number" min={0} defaultValue={plan?.annualPrice ?? 0} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-omp">Orig. month $</Label>
              <Input id="pl-omp" name="originalMonthlyPrice" type="number" min={0} defaultValue={plan?.originalMonthlyPrice ?? 0} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-oap">Orig. annual $</Label>
              <Input id="pl-oap" name="originalAnnualPrice" type="number" min={0} defaultValue={plan?.originalAnnualPrice ?? 0} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pl-features">Features (one per line)</Label>
            <Textarea
              id="pl-features"
              name="features"
              rows={4}
              defaultValue={plan?.features.join("\n") ?? ""}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pl-cta">CTA text</Label>
              <Input id="pl-cta" name="ctaText" defaultValue={plan?.ctaText ?? "Get Started"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-sort">Sort order</Label>
              <Input id="pl-sort" name="sortOrder" type="number" defaultValue={plan?.sortOrder ?? 0} />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={popular} onCheckedChange={setPopular} id="pl-popular" />
              <Label htmlFor="pl-popular" className="flex items-center gap-1">
                <Sparkles className="size-3 text-violet-500" /> Popular
              </Label>
              <input type="hidden" name="popular" value={popular ? "on" : "off"} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={active} onCheckedChange={setActive} id="pl-active" />
              <Label htmlFor="pl-active">Active</Label>
              <input type="hidden" name="active" value={active ? "on" : "off"} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {mode === "edit" ? "Save changes" : "Create plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminPlansTable({ rows }: { rows: AdminPlanRow[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminPlanRow | undefined>();
  const [deleting, setDeleting] = React.useState<AdminPlanRow | undefined>();

  const columns = React.useMemo<ColumnDef<AdminPlanRow, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Plan",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10">
              <Package className="size-4 text-violet-500" />
            </span>
            <div>
              <p className="text-sm font-medium">{row.original.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{row.original.slug}</p>
            </div>
            {row.original.popular && (
              <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-500">
                <Sparkles className="size-3" /> Popular
              </Badge>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("monthlyPrice", {
        header: "Pricing",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-medium">
              ${row.original.monthlyPrice}
              <span className="text-xs text-muted-foreground">/mo</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.originalMonthlyPrice > row.original.monthlyPrice && (
                <span className="line-through">${row.original.originalMonthlyPrice}</span>
              )}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("annualPrice", {
        header: "Annual",
        cell: ({ getValue }) => <span className="font-medium">${getValue()}</span>,
      }),
      columnHelper.accessor("active", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge variant="outline" className={getValue() ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}>
            {getValue() ? "Active" : "Inactive"}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => { setEditing(row.original); setDialogOpen(true); }}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label="Delete" onClick={() => setDeleting(row.original)}>
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
        searchPlaceholder="Search plans…"
        toolbar={
          <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5">
            <Plus className="size-4" /> Create plan
          </Button>
        }
      />

      {dialogOpen && (
        <PlanFormDialog mode={editing ? "edit" : "create"} plan={editing} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting {deleting?.name} will remove it from the pricing page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                await deletePlanAction(deleting.id);
                toast.success("Plan deleted.");
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
