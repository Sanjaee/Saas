import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompactNumber, formatCurrency } from "@/lib/format";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  iconClassName,
  hint,
}: {
  label: string;
  value: number | string;
  delta?: number;
  icon: LucideIcon;
  iconClassName?: string;
  hint?: string;
}) {
  const isCurrency = typeof value === "number" && value > 10000 && value % 1 === 0 && label.match(/revenue|mrr|arr/i);
  const display = typeof value === "number" ? (isCurrency ? formatCurrency(value) : formatCompactNumber(value)) : value;
  const up = (delta ?? 0) >= 0;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            iconClassName ?? "bg-primary/10 text-primary",
          )}>
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{display}</p>
        <div className="mt-1 flex items-center gap-2">
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                up ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive",
              )}
            >
              {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
