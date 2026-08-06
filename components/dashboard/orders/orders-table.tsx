"use client"

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface OrderRow {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  interval: string;
  createdAt: Date;
}

const columnHelper = createColumnHelper<OrderRow>();

const STATUS_STYLES: Record<string, string> = {
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
  refunded: "border-sky-500/30 bg-sky-500/10 text-sky-500",
};

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const columns: ColumnDef<OrderRow, any>[] = [
    columnHelper.accessor("customerName", {
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.customerName}</p>
          <p className="text-xs text-muted-foreground">{row.original.customerEmail}</p>
        </div>
      ),
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(row.original.amount, row.original.currency)}
        </span>
      ),
    }),
    columnHelper.accessor("interval", {
      header: "Billing",
      cell: ({ getValue }) => <Badge variant="secondary" className="capitalize">{getValue()}</Badge>,
    }),
    columnHelper.accessor("provider", {
      header: "Provider",
      cell: ({ getValue }) => <span className="text-sm capitalize text-muted-foreground">{getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => (
        <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[getValue()] ?? "")}>{getValue()}</Badge>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDateTime(getValue())}</span>,
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Search orders…"
      filterOptions={[
        { label: "Paid", value: "paid" },
        { label: "Pending", value: "pending" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ]}
      filterColumn="status"
    />
  );
}
