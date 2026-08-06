import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { TrustedBy } from "@/components/landing/trusted-by";
import { Features } from "@/components/landing/features";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { WhyChooseUs } from "@/components/landing/why-choose-us";
import { Integrations } from "@/components/landing/integrations";
import { Testimonials, type TestimonialItem } from "@/components/landing/testimonials";
import { Pricing, type PlanItem } from "@/components/landing/pricing";
import { Faq, type FaqItem } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { listPlans, listTestimonials, listFaqs } from "@/lib/data";

export const dynamic = "force-static";

export default async function HomePage() {
  let plans: PlanItem[] = [];
  let testimonials: TestimonialItem[] = [];
  let faqs: FaqItem[] = [];

  try {
    plans = await listPlans(true);
    testimonials = await listTestimonials(true);
    faqs = await listFaqs();
  } catch {
    // mock/offline fallback handled inside the section components
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <DashboardPreview />
        <WhyChooseUs />
        <Integrations />
        <Testimonials items={testimonials} />
        <Pricing plans={plans} />
        <Faq items={faqs} />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
