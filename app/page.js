import { HeroSection } from "@/components/landing/hero-section"
import { TalentsSection } from "@/components/landing/talents-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CreatorsSection } from "@/components/landing/digital-products-section"
import { CampaignsSection } from "@/components/landing/campaigns-section"
import { MediaFeaturesSection } from "@/components/landing/media-features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { PartnersMarquee } from "@/components/landing/partners-marquee"
import LandingBackground from "@/components/landing/landing-background"
import { LandingNavbar } from "@/components/landing/landing-navbar"

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh bg-background text-foreground" data-landing-page>
      <LandingBackground />
      <LandingNavbar />
      <div className="relative z-10">
        <HeroSection />
        <PartnersMarquee />
        <div id="talents">
          <TalentsSection />
        </div>
        <CreatorsSection />
        <CampaignsSection />
        <MediaFeaturesSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="how-it-works" className="border-y border-border/40 bg-muted/20 py-8 lg:py-12">
          <HowItWorksSection />
        </div>
        <CTASection />
        <Footer />
      </div>
    </div>
  )
}
