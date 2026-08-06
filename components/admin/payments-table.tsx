"use client"

import * as React from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { adminRefundPaymentAction } from "@/actions/billing"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface AdminPaymentRow {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  providerTransactionId: string | null;
  createdAt: Date;
}

const columnHelper = createColumnHelper<AdminPaymentRow>();

const STATUS_STYLES: Record<string, string> = {
  succeeded: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
  refunded: "border-sky-500/30 bg-sky-500/10 text-sky-500",
};

export function AdminPaymentsTable({ rows }: { rows: AdminPaymentRow[] }) {
  const columns = React.useMemo<ColumnDef<AdminPaymentRow, any>[]>(
    () => [
      columnHelper.accessor("providerTransactionId", {
        header: "Transaction",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{getValue() ?? "—"}</span>
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
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.status === "succeeded" ? (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Refund"
                onClick={async () => {
                  const result = await adminRefundPaymentAction(row.original.id);
                  if ("error" in result) toast.error(result.error as string);
                  else {
                    toast.success("Payment refunded.");
                    window.location.reload();
                  }
                }}
              >
                <RotateCcw className="size-4 text-sky-500" />
              </Button>
            </div>
          ) : null,
      }),
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      filterOptions={["succeeded", "pending", "failed", "refunded"].map((s) => ({ label: s, value: s }))}
      filterColumn="status"
    />
  );
}
