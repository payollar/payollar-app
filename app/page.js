// import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { TalentsSection } from "@/components/landing/talents-section"
// import { FeaturedCarousel } from "@/components/landing/featured-carousel"
// import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works"
import { TestimonialsSection } from "@/components/landing/testimonials"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* <Navbar /> */}
      <main>
        <HeroSection />
        <div id="talents">
          <TalentsSection />
        </div>
        {/* <FeaturedCarousel /> */}
        <div id="features">
          {/* <FeaturesSection /> */}
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
