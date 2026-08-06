"use client"

import * as React from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adminUpdateSubscriptionAction } from "@/actions/admin"
import { formatDate } from "@/lib/format"

export interface AdminSubscriptionRow {
  id: string;
  status: string;
  provider: string;
  interval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
}

const columnHelper = createColumnHelper<AdminSubscriptionRow>();

export function AdminSubscriptionsTable({ rows }: { rows: AdminSubscriptionRow[] }) {
  const columns = React.useMemo<ColumnDef<AdminSubscriptionRow, any>[]>(
    () => [
      columnHelper.accessor("interval", {
        header: "Plan",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium capitalize">{row.original.interval} billing</p>
            <p className="text-xs text-muted-foreground capitalize">{row.original.provider}</p>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <Select
            defaultValue={row.original.status}
            onValueChange={async (value) => {
              const result = await adminUpdateSubscriptionAction(row.original.id, value);
              if ("error" in result) toast.error(result.error as string);
              else {
                toast.success("Subscription updated.");
                window.location.reload();
              }
            }}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["active", "trialing", "past_due", "canceled", "expired"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      }),
      columnHelper.accessor("currentPeriodStart", {
        header: "Period start",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>,
      }),
      columnHelper.accessor("currentPeriodEnd", {
        header: "Period end",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>,
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>,
      }),
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      filterOptions={["active", "trialing", "past_due", "canceled", "expired"].map((s) => ({ label: s, value: s }))}
      filterColumn="status"
    />
  );
}
