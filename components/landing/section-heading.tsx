import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-600 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
      <span className="size-1.5 rounded-full bg-violet-500" />
      {children}
    </span>
  );
}

export function SectionHeading({
  badge,
  title,
  description,
  className,
  center = true,
}: {
  badge?: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={cn(center && "mx-auto text-center", "max-w-2xl", className)}>
      {badge && (
        <div className={cn("mb-4", center && "flex justify-center")}>
          <SectionBadge>{badge}</SectionBadge>
        </div>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground text-pretty">{description}</p>
      )}
    </Reveal>
  );
}
