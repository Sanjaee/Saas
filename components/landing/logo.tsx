import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/30">
        <svg viewBox="0 0 24 24" fill="none" className="size-5 text-white">
          <path
            d="M6 14.5 3 8l3-6h8l-3 6 3 6H6Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path d="M12 21c0-1.8-1.2-3-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight">Zacode</span>
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/30",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5 text-white">
        <path
          d="M6 14.5 3 8l3-6h8l-3 6 3 6H6Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path d="M12 21c0-1.8-1.2-3-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
