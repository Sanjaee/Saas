import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/landing/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r bg-muted/40 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <div className="animate-aurora absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" aria-hidden />
        <div className="animate-glow-pulse absolute bottom-10 left-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden />

        <Link href="/" className="relative flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to home
        </Link>

        <div className="relative">
          <Logo />
          <h2 className="mt-8 max-w-md text-3xl font-bold leading-tight tracking-tight text-balance">
            The all-in-one platform to <span className="text-gradient">launch faster</span> and scale smarter.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Analytics, automation, billing and AI insights — beautifully unified in one dashboard your team will love.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { title: "Join 12,000+ teams", text: "From solo founders to Fortune 500." },
              { title: "SOC 2 · GDPR · SSO", text: "Enterprise-grade security, out of the box." },
              { title: "14-day free trial", text: "No credit card required. Cancel anytime." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="mt-1 flex size-5 items-center justify-center rounded-full bg-emerald-500/15">
                  <svg viewBox="0 0 24 24" fill="none" className="size-3 text-emerald-500">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-muted-foreground">
          © {new Date().getFullYear()} Zacode, Inc.
        </p>
      </div>

      <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="mb-8 lg:hidden">
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
