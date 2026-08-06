"use client"
import type { ActionState } from "@/lib/action-state";

import * as React from "react"
import { useActionState } from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, TicketPercent } from "lucide-react"
import { toast } from "sonner"

import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { createCouponAction, updateCouponAction, deleteCouponAction } from "@/actions/admin"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface AdminCouponRow {
  id: string;
  code: string;
  type: string;
  value: number;
  maxUses: number;
  uses: number;
  expiresAt: Date | null;
  active: boolean;
}

const columnHelper = createColumnHelper<AdminCouponRow>();
const initialState: ActionState = { error: "", success: "" };

function CouponFormDialog({
  mode,
  coupon,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  coupon?: AdminCouponRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [type, setType] = React.useState(coupon?.type ?? "percent");
  const [active, setActive] = React.useState(coupon?.active ?? true);
  const [state, formAction, pending] = useActionState(
    mode === "edit" ? updateCouponAction : createCouponAction,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit coupon" : "Create coupon"}</DialogTitle>
          <DialogDescription>Discount codes customers can apply at checkout.</DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={formAction} className="space-y-4">
          {mode === "edit" && coupon && <input type="hidden" name="id" value={coupon.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-code">Code</Label>
              <Input id="c-code" name="code" defaultValue={coupon?.code} placeholder="LAUNCH35" className="font-mono uppercase" required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent (%)</SelectItem>
                  <SelectItem value="fixed">Fixed ($)</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="type" value={type} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="c-value">Value</Label>
              <Input id="c-value" name="value" type="number" min={0} step="0.01" defaultValue={coupon?.value ?? 0} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-max">Max uses</Label>
              <Input id="c-max" name="maxUses" type="number" min={0} defaultValue={coupon?.maxUses ?? 0} required />
              <p className="text-[10px] text-muted-foreground">0 = unlimited</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-expires">Expires</Label>
              <Input
                id="c-expires"
                name="expiresAt"
                type="date"
                defaultValue={coupon?.expiresAt ? formatDate(coupon.expiresAt) : ""}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">Customers can redeem this code</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
            <input type="hidden" name="active" value={active ? "on" : "off"} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {mode === "edit" ? "Save changes" : "Create coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminCouponsTable({ rows }: { rows: AdminCouponRow[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminCouponRow | undefined>();
  const [deleting, setDeleting] = React.useState<AdminCouponRow | undefined>();

  const columns = React.useMemo<ColumnDef<AdminCouponRow, any>[]>(
    () => [
      columnHelper.accessor("code", {
        header: "Code",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10">
              <TicketPercent className="size-4 text-violet-500" />
            </span>
            <code className="rounded bg-muted px-2 py-0.5 font-mono text-sm font-bold">{row.original.code}</code>
          </div>
        ),
      }),
      columnHelper.accessor("value", {
        header: "Discount",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.type === "percent" ? `${row.original.value}%` : `$${row.original.value}`}
          </span>
        ),
      }),
      columnHelper.accessor("uses", {
        header: "Redemptions",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.uses}
            {row.original.maxUses > 0 && ` / ${row.original.maxUses}`}
          </span>
        ),
      }),
      columnHelper.accessor("expiresAt", {
        header: "Expires",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue() ? formatDate(getValue()) : "Never"}</span>
        ),
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
        searchPlaceholder="Search coupon codes…"
        toolbar={
          <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5">
            <Plus className="size-4" /> Create coupon
          </Button>
        }
      />

      {dialogOpen && (
        <CouponFormDialog mode={editing ? "edit" : "create"} coupon={editing} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
            <AlertDialogDescription>Coupon {deleting?.code} will no longer be redeemable.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                await deleteCouponAction(deleting.id);
                toast.success("Coupon deleted.");
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
