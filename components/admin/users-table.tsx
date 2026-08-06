"use client"

import * as React from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { adminUpdateUserRoleAction, adminDeleteUserAction } from "@/actions/admin"
import { formatDate } from "@/lib/format"

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
}

const columnHelper = createColumnHelper<AdminUserRow>();

export function AdminUsersTable({ rows }: { rows: AdminUserRow[] }) {
  const [deleting, setDeleting] = React.useState<AdminUserRow | undefined>();

  const columns = React.useMemo<ColumnDef<AdminUserRow, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "User",
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
      columnHelper.accessor("emailVerified", {
        header: "Verified",
        cell: ({ getValue }) => (
          <Badge variant="outline" className={getValue() ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-amber-500/30 bg-amber-500/10 text-amber-500"}>
            {getValue() ? "Verified" : "Unverified"}
          </Badge>
        ),
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: ({ row }) => (
          <Select
            defaultValue={row.original.role}
            onValueChange={async (value) => {
              const result = await adminUpdateUserRoleAction(row.original.id, value);
              if ("error" in result) toast.error(result.error as string);
              else {
                toast.success("Role updated.");
                window.location.reload();
              }
            }}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["owner", "admin", "manager", "member"].map((r) => (
                <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Joined",
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>,
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              aria-label="Delete user"
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
        searchPlaceholder="Search users…"
        filterOptions={["owner", "admin", "manager", "member"].map((r) => ({ label: r, value: r }))}
        filterColumn="role"
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete {deleting?.email} and all their data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                await adminDeleteUserAction(deleting.id);
                toast.success("User deleted.");
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
