"use client"

import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { downloadCsv, toCsv } from "@/lib/csv"

export function ExportCsvButton({
  filename,
  columns,
  rows,
}: {
  filename: string
  columns: { key: string; label: string }[]
  rows: Record<string, unknown>[]
}) {
  return (
    <Button
      variant="outline"
      className="gap-1.5"
      onClick={() => downloadCsv(filename, toCsv(rows, columns))}
    >
      <Download className="size-4" /> Export CSV
    </Button>
  )
}
