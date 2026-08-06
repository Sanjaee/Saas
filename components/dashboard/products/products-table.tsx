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
import { Textarea } from "@/components/ui/textarea"
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
import { createProductAction, updateProductAction, deleteProductAction } from "@/actions/products"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sku: string | null;
  category: string | null;
  stock: number;
  active: boolean;
  createdAt: Date;
}

const columnHelper = createColumnHelper<ProductRow>();

const initialState: ActionState = { error: "", success: "" };

function ProductFormDialog({
  mode,
  product,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  product?: ProductRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [active, setActive] = React.useState(product?.active ?? true);
  const [state, formAction, pending] = useActionState(
    mode === "edit" ? updateProductAction : createProductAction,
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
          <DialogTitle>{mode === "edit" ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>Manage catalog details and stock.</DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <form action={formAction} className="space-y-4">
          {mode === "edit" && product && <input type="hidden" name="id" value={product.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" name="name" defaultValue={product?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-sku">SKU</Label>
              <Input id="p-sku" name="sku" defaultValue={product?.sku ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" name="description" rows={2} defaultValue={product?.description ?? ""} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="p-price">Price (USD)</Label>
              <Input id="p-price" name="price" type="number" min={0} step="0.01" defaultValue={product?.price ?? 0} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-stock">Stock</Label>
              <Input id="p-stock" name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-category">Category</Label>
              <Input id="p-category" name="category" defaultValue={product?.category ?? ""} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">Visible in the catalog</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
            <input type="hidden" name="active" value={active ? "on" : "off"} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {mode === "edit" ? "Save changes" : "Add product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductRow | undefined>();
  const [deleting, setDeleting] = React.useState<ProductRow | undefined>();

  const columns = React.useMemo<ColumnDef<ProductRow, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Product",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            {row.original.description && (
              <p className="max-w-xs truncate text-xs text-muted-foreground">{row.original.description}</p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() ?? "—"}</span>,
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: ({ getValue }) => (
          getValue() ? <Badge variant="secondary">{getValue()}</Badge> : <span className="text-muted-foreground">—</span>
        ),
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: ({ getValue }) => <span className="font-semibold tabular-nums">{formatCurrency(getValue())}</span>,
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        cell: ({ getValue }) => {
          const stock = getValue();
          return (
            <Badge
              variant="outline"
              className={cn(
                stock === 0
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : stock < 10
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
              )}
            >
              {stock === 0 ? "Out of stock" : `${stock} in stock`}
            </Badge>
          );
        },
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
        searchPlaceholder="Search products…"
        toolbar={
          <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5">
            <Plus className="size-4" /> Add product
          </Button>
        }
      />

      {dialogOpen && (
        <ProductFormDialog mode={editing ? "edit" : "create"} product={editing} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove {deleting?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                await deleteProductAction(deleting.id);
                toast.success("Product deleted.");
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
