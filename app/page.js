import { HeroSection } from "@/components/landing/hero-section"
import { TalentsSection } from "@/components/landing/talents-section"
import { StatsSection } from "@/components/landing/stats-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CreatorsSection } from "@/components/landing/digital-products-section"
import { CampaignsSection } from "@/components/landing/campaigns-section"
import { HowItWorksSection } from "@/components/landing/how-it-works"
import { TestimonialsSection } from "@/components/landing/testimonials"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { PartnersMarquee } from "@/components/landing/partners-marquee"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        {/* <StatsSection /> */}
        <PartnersMarquee />
        <div id="talents">
          <TalentsSection />
        </div>
        <CreatorsSection />
        <CampaignsSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
