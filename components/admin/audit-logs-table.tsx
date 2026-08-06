"use client"

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface AuditLogRow {
  id: string;
  actorEmail: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  ip: string | null;
  createdAt: Date;
}

const columnHelper = createColumnHelper<AuditLogRow>();

function actionStyle(action: string) {
  if (action.includes("delete")) return "border-destructive/30 bg-destructive/10 text-destructive";
  if (action.includes("create")) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
  if (action.includes("update") || action.includes("settings")) return "border-amber-500/30 bg-amber-500/10 text-amber-500";
  if (action.includes("login") || action.includes("payment.succeeded")) return "border-sky-500/30 bg-sky-500/10 text-sky-500";
  return "text-muted-foreground";
}

export function AuditLogsTable({ rows }: { rows: AuditLogRow[] }) {
  const columns: ColumnDef<AuditLogRow, any>[] = [
    columnHelper.accessor("action", {
      header: "Action",
      cell: ({ getValue }) => (
        <Badge variant="outline" className={cn("font-mono", actionStyle(getValue()))}>
          {getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("actorEmail", {
      header: "Actor",
      cell: ({ getValue }) => <span className="text-sm">{getValue() ?? "system"}</span>,
    }),
    columnHelper.accessor("entity", {
      header: "Entity",
      cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() ?? "—"}</span>,
    }),
    columnHelper.accessor("entityId", {
      header: "Entity ID",
      cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() ?? "—"}</span>,
    }),
    columnHelper.accessor("ip", {
      header: "IP",
      cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() ?? "—"}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Timestamp",
      cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDateTime(getValue())}</span>,
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Search audit logs…"
    />
  );
}
