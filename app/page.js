import { HeroSection } from "@/components/landing/hero-section"
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
import { LandingThemeProvider } from "@/components/landing/landing-theme"

export default function LandingPage() {
  return (
    <LandingThemeProvider>
      <LandingBackground />
      <LandingNavbar />
      <div className="relative z-10">
        <HeroSection />
        <PartnersMarquee />
        <div data-landing-band>
          <CreatorsSection />
        </div>
        <CampaignsSection />
        <MediaFeaturesSection />
        <div id="features" data-landing-band>
          <FeaturesSection />
        </div>
        <div
          id="how-it-works"
          className="border-y border-border/40 py-8 lg:py-12"
          data-landing-howto
        >
          <HowItWorksSection />
        </div>
        <CTASection />
        <Footer />
      </div>
    </LandingThemeProvider>
  )
}
