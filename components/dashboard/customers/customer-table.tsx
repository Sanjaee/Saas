"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { deleteCustomerAction } from "@/actions/crm"
import { initials, formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  plan: string;
  status: string;
  joinedDate: Date;
  revenue: number;
  country: string | null;
}

const columnHelper = createColumnHelper<CustomerRow>();

const STATUS_STYLES: Record<string, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  trialing: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  past_due: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  canceled: "border-destructive/30 bg-destructive/10 text-destructive",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[status] ?? "")}>
      {status.replace("_", " ")}
    </Badge>
  );
}

function CustomerFormDialog({
  mode,
  customer,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  customer?: CustomerRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = mode === "edit";
  const [status, setStatus] = React.useState(customer?.status ?? "active");
  const [plan, setPlan] = React.useState(customer?.plan ?? "Starter");
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const form = new FormData(e.currentTarget);
    const endpoint = isEdit ? "/api/customers" : "/api/customers";
    try {
      const res = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify({
          id: customer?.id,
          name: form.get("name"),
          email: form.get("email"),
          company: form.get("company"),
          plan: form.get("plan"),
          status: form.get("status"),
          country: form.get("country"),
          revenue: form.get("revenue"),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(isEdit ? "Customer updated." : "Customer added.");
      onOpenChange(false);
      window.location.reload();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit customer" : "Add customer"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the customer's details below." : "Add a new customer to your workspace."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" defaultValue={customer?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={customer?.email} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={customer?.company ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={customer?.country ?? ""} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Free", "Starter", "Pro", "Enterprise"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="plan" value={plan} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["active", "trialing", "past_due", "canceled"].map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="status" value={status} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="revenue">Revenue (USD)</Label>
            <Input id="revenue" name="revenue" type="number" min={0} step="0.01" defaultValue={customer?.revenue ?? 0} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {isEdit ? "Save changes" : "Add customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CustomerTable({
  rows,
  total,
  page,
  pageSize,
  canWrite = true,
}: {
  rows: CustomerRow[];
  total: number;
  page: number;
  pageSize: number;
  canWrite?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CustomerRow | undefined>();
  const [deleting, setDeleting] = React.useState<CustomerRow | undefined>();
  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");
  const [status, setStatus] = React.useState(searchParams.get("status") ?? "all");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<CustomerRow[]>(rows);
  const [count, setCount] = React.useState(total);
  const [currentPage, setCurrentPage] = React.useState(page);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-500 text-[10px] text-white">
                {initials(row.original.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("company", {
        header: "Company",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() ?? "—"}</span>,
      }),
      columnHelper.accessor("plan", {
        header: "Plan",
        cell: ({ getValue }) => (
          <Badge variant="secondary" className="font-medium">{getValue()}</Badge>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      }),
      columnHelper.accessor("joinedDate", {
        header: "Joined",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>,
      }),
      columnHelper.accessor("revenue", {
        header: "Revenue",
        cell: ({ getValue }) => <span className="font-medium tabular-nums">{formatCurrency(getValue())}</span>,
      }),
      ...(canWrite
        ? [
            columnHelper.display({
              id: "actions",
              header: "",
              cell: ({ row }) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Actions">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(row.original);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleting(row.original)}
                    >
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            }),
          ]
        : []),
    ],
    [canWrite],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  function updateUrl(next: { q?: string; status?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.status !== undefined) {
      if (next.status && next.status !== "all") params.set("status", next.status);
      else params.delete("status");
    }
    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");
    }
    router.push(`/customers?${params.toString()}`, { scroll: false });
  }

  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(async () => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      if (status && status !== "all") params.set("status", status);
      else params.delete("status");
      params.set("page", "1");
      const res = await fetch(`/api/customers?${params.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json.rows);
        setCount(json.total);
        setCurrentPage(1);
      }
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query, status, searchParams]);

  const pageCount = Math.max(1, Math.ceil(count / pageSize));

  async function navigateToPage(p: number) {
    setLoading(true);
    setCurrentPage(p);
    updateUrl({ page: p });
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query);
    if (status && status !== "all") params.set("status", status);
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    const res = await fetch(`/api/customers?${params.toString()}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setData(json.rows);
      setCount(json.total);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers…"
          className="sm:max-w-xs"
        />
        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["active", "trialing", "past_due", "canceled"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-1 justify-end">
          {canWrite && (
            <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5">
              <Plus className="size-4" /> Add customer
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="uppercase tracking-wide">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full max-w-[120px]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-sm text-muted-foreground">{count} customer(s)</p>
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) navigateToPage(currentPage - 1); }} />
            </PaginationItem>
            {Array.from({ length: pageCount }).slice(0, 7).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); navigateToPage(i + 1); }}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < pageCount) navigateToPage(currentPage + 1); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {dialogOpen && (
        <CustomerFormDialog
          mode={editing ? "edit" : "create"}
          customer={editing}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleting?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                await deleteCustomerAction(deleting.id);
                toast.success("Customer deleted.");
                setDeleting(undefined);
                router.refresh();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
