import { HeroSection } from "@/components/landing/hero-section"
import { TalentsSection } from "@/components/landing/talents-section"
import { StatsSection } from "@/components/landing/stats-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CreatorsSection } from "@/components/landing/digital-products-section"
import { CampaignsSection } from "@/components/landing/campaigns-section"
import { MediaFeaturesSection } from "@/components/landing/media-features-section"
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
        <div className="bg-white py-8 lg:py-12">
          <MediaFeaturesSection />
        </div>
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="how-it-works" className="bg-white py-8 lg:py-12">
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
