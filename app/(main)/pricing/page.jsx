import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="flex justify-start mb-2">
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="max-w-full mx-auto mb-12 text-center">
        <Badge
          variant="outline"
          className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4"
        >
          Coming Soon
        </Badge>

        <h1 className="text-4xl md:text-5xl font-bold gradient-title mb-4">
          Subscription Plans Coming Soon
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We're currently transitioning to a subscription model. Subscription plans will be available soon. 
          In the meantime, you can book sessions directly with our talented creators.
        </p>
      </div>

      {/* Coming Soon Message */}
      <Card className="border-emerald-900/30 shadow-lg bg-gradient-to-b from-emerald-950/30 to-transparent max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <p className="text-muted-foreground text-lg">
              Our subscription plans are currently under development. 
              We'll notify you as soon as they're available!
            </p>
            <p className="text-sm text-muted-foreground">
              For now, you can book sessions directly with creators through their profiles.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Questions? We're Here to Help
        </h2>
        <p className="text-muted-foreground mb-4">
          Contact our support team at hey@payollar.com
        </p>
      </div>
    </div>
  );
}
