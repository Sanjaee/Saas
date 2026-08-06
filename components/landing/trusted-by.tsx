import { Reveal } from "./reveal";

const LOGOS = [
  { name: "Google", className: "font-bold tracking-tight" },
  { name: "Microsoft", className: "font-semibold" },
  { name: "Stripe", className: "font-bold" },
  { name: "Shopify", className: "font-bold" },
  { name: "Discord", className: "font-bold" },
  { name: "Vercel", className: "font-bold" },
  { name: "Notion", className: "font-semibold" },
  { name: "Figma", className: "font-bold" },
];

export function TrustedBy() {
  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by 12,000+ teams at the world&apos;s fastest-growing companies
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mask-fade-x mt-8 overflow-hidden">
            <div className="animate-marquee flex w-max items-center gap-14 pr-14">
              {[...LOGOS, ...LOGOS].map((logo, i) => (
                <div
                  key={`${logo.name}-${i}`}
                  className="flex items-center gap-2 text-xl text-muted-foreground/70 transition-colors hover:text-foreground"
                >
                  <span className="flex size-6 items-center justify-center rounded bg-foreground/10">
                    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
                      <circle cx="12" cy="12" r="10" opacity="0.35" />
                    </svg>
                  </span>
                  <span className={logo.className}>{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
