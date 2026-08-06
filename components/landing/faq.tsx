"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionHeading } from "./section-heading"
import { Reveal } from "./reveal"

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
}

const FALLBACK: FaqItem[] = [
  { id: "1", question: "Is there a free trial?", answer: "Yes! Every paid plan includes a 14-day free trial with full access to every feature. No credit card required." },
  { id: "2", question: "Can I cancel anytime?", answer: "Absolutely. You can cancel your subscription from the Billing page at any time — no cancellation fees." },
  { id: "3", question: "Which payment methods do you support?", answer: "We accept all major credit cards via Stripe, and offer local methods through Midtrans, Xendit and PayPal." },
  { id: "4", question: "Do you have an API?", answer: "Yes. We ship a REST API with generous rate limits, webhooks, and SDKs for JavaScript, Python, Go and more." },
  { id: "5", question: "Do you support teams?", answer: "Every plan includes team collaboration. Invite unlimited members with granular roles: Owner, Admin, Manager and Member." },
  { id: "6", question: "What is your refund policy?", answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not happy, email us and we'll refund you in full." },
]

export function Faq({ items = [] }: { items?: FaqItem[] }) {
  const faqs = items.length ? items : FALLBACK

  return (
    <section id="faq" className="border-t bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="FAQ"
          title={<>Frequently asked <span className="text-gradient">questions</span></>}
          description="Everything you need to know. Can't find an answer? Contact us anytime."
        />

        <Reveal className="mt-12">
          <Accordion type="single" collapsible defaultValue={faqs[0]?.id}>
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="gap-4 text-left text-base font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
