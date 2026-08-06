"use client"

import * as React from "react"
import Link from "next/link"
import { Mail, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "./logo"
import { toast } from "sonner"
import { GithubIcon, XIcon, LinkedInIcon, YouTubeIcon } from "@/components/icons"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#integrations" },
      { label: "Documentation", href: "#" },
      { label: "API", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#contact" },
      { label: "Partners", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
      { label: "Status", href: "#" },
      { label: "Templates", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Security", href: "#" },
      { label: "GDPR", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
]

const SOCIALS = [
  { label: "GitHub", icon: GithubIcon, href: "#" },
  { label: "Twitter/X", icon: XIcon, href: "#" },
  { label: "LinkedIn", icon: LinkedInIcon, href: "#" },
  { label: "YouTube", icon: YouTubeIcon, href: "#" },
]

export function Footer() {
  const [email, setEmail] = React.useState("")

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The all-in-one platform to build, launch and scale your business
              faster — analytics, automation and billing in one beautiful dashboard.
            </p>
            <form
              className="mt-6 max-w-sm"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.trim()) return;
                toast.success("Subscribed! Check your inbox.");
                setEmail("");
              }}
            >
              <label className="text-sm font-medium" htmlFor="newsletter">
                Subscribe to the newsletter
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="newsletter"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
                <Button type="submit" size="icon" aria-label="Subscribe">
                  <Send className="size-4" />
                </Button>
              </div>
            </form>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:text-foreground"
                >
                  <social.icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold">{column.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zacode, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" />
            support@zacode.dev
          </div>
        </div>
      </div>
    </footer>
  )
}
