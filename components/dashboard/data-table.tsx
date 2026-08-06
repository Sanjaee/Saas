"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Download, Search, Inbox } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export interface DataTablePagination {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  serverSide?: boolean;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  searchPlaceholder?: string;
  filterOptions?: { label: string; value: string }[];
  filterColumn?: keyof TData;
  exportCsv?: (rows: TData[]) => void;
  toolbar?: React.ReactNode;
  pagination?: DataTablePagination;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
  emptyMessage?: string;
}

function PaginationControls({
  pageIndex,
  pageCount,
  onPageChange,
}: {
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const current = pageIndex + 1;
  const pages: React.ReactNode[] = [];
  const push = (p: number, label?: React.ReactNode, active?: boolean) =>
    pages.push(
      <PaginationItem key={`${p}-${label}`}>
        <PaginationLink
          isActive={active}
          onClick={(e) => {
            e.preventDefault();
            onPageChange(p - 1);
          }}
        >
          {label ?? p}
        </PaginationLink>
      </PaginationItem>,
    );

  for (let p = 1; p <= pageCount; p++) {
    if (pageCount <= 7) push(p, p, p === current);
    else if (p === 1 || p === pageCount || Math.abs(p - current) <= 1) push(p, p, p === current);
    else if (Math.abs(p - current) === 2) pages.push(<PaginationEllipsis key={`e${p}`} />);
  }

  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (pageIndex > 0) onPageChange(pageIndex - 1);
            }}
          />
        </PaginationItem>
        {pages}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (pageIndex < pageCount - 1) onPageChange(pageIndex + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  searchPlaceholder = "Search…",
  filterOptions,
  filterColumn,
  exportCsv,
  toolbar,
  pagination,
  onRowClick,
  getRowId,
  emptyMessage = "No records found.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const isServerSide = !!pagination?.serverSide;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getRowId,
    initialState: {
      pagination: { pageIndex: 0, pageSize: pagination?.pageSize ?? 10 },
    },
  });

  const rows = isServerSide ? table.getRowModel().rows : table.getRowModel().rows;
  const totalPages = isServerSide
    ? pagination!.pageCount
    : Math.max(1, Math.ceil(table.getFilteredRowModel().rows.length / (pagination?.pageSize ?? 10)));

  React.useEffect(() => {
    if (!filterColumn) return;
    const col = table.getColumn(String(filterColumn));
    col?.setFilterValue(statusFilter === "all" ? undefined : statusFilter);
  }, [statusFilter, filterColumn, table]);

  const visibleData = isServerSide ? data : rows.map((r) => r.original);

  const exportAll = () => {
    if (!exportCsv) return;
    exportCsv(visibleData);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
            aria-label={searchPlaceholder}
          />
        </div>
        {filterOptions && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {filterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex flex-1 items-center justify-end gap-2">
          {toolbar}
          {exportCsv && (
            <Button variant="outline" size="sm" onClick={exportAll} className="gap-1.5">
              <Download className="size-3.5" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        className="flex items-center gap-1 uppercase tracking-wide hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="size-3 opacity-50" />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-[140px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="size-8 opacity-40" />
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
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
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} result(s)
        </p>
        <PaginationControls
          pageIndex={isServerSide ? (pagination?.pageIndex ?? 0) : table.getState().pagination.pageIndex}
          pageCount={totalPages}
          onPageChange={(p) => {
            if (isServerSide) pagination?.onPageChange(p);
            else table.setPageIndex(p);
          }}
        />
      </div>
    </div>
  );
}

export { flexRender, getCoreRowModel, getSortedRowModel, type ColumnDef };
