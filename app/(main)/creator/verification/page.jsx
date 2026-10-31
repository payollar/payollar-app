import { ClipboardCheck, AlertCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function VerificationPage() {
  // Get complete user profile
  const user = await getCurrentUser();

  // If already verified, redirect to dashboard
  if (user?.verificationStatus === "VERIFIED") {
    redirect("/creator");
  }

  const isRejected = user?.verificationStatus === "REJECTED";

  return (
    <div className="-m-4 min-h-full bg-[#f4f6fb] p-4 text-slate-900 md:-m-6 md:p-5">
      <div className="mx-auto max-w-2xl py-8">
        <Card className="rounded-2xl border border-white bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <CardHeader className="text-center">
            <div
              className={`mx-auto mb-4 w-fit rounded-full p-4 ${
                isRejected ? "bg-destructive/15" : "bg-amber-500/15"
              }`}
            >
              {isRejected ? (
                <XCircle className="h-8 w-8 text-destructive" />
              ) : (
                <ClipboardCheck className="h-8 w-8 text-amber-500" />
              )}
            </div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              {isRejected
                ? "Verification Declined"
                : "Verification in Progress"}
            </CardTitle>
            <CardDescription className="text-lg">
              {isRejected
                ? "Unfortunately, your application needs revision"
                : "Thank you for submitting your information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isRejected ? (
              <div className="mb-6 flex items-start rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div className="text-muted-foreground text-left">
                  <p className="mb-2">
                    Our administrative team has reviewed your application and
                    found that it doesn&apos;t meet our current requirements.
                    Common reasons for rejection include:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>Insufficient or unclear credential documentation</li>
                    <li>Professional experience requirements not met</li>
                    <li>Incomplete or vague service description</li>
                  </ul>
                  <p>
                    You can update your application with more information and
                    resubmit for review.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6 flex items-start rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <p className="text-muted-foreground text-left">
                  Your profile is currently under review by our administrative
                  team. This process typically takes 1-2 business days.
                  You&apos;ll receive an email notification once your account is
                  verified.
                </p>
              </div>
            )}

            <p className="text-muted-foreground mb-6">
              {isRejected
                ? "You can update your doctor profile and resubmit for verification."
                : "While you wait, you can familiarize yourself with our platform or reach out to our support team if you have any questions."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isRejected ? (
                <>
                  <Button asChild variant="glass">
                    <Link href="/">Return to Home</Link>
                  </Button>
                  <Button asChild variant="marketing">
                    <Link href="/creator">Go to dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="glass">
                    <Link href="/">Return to Home</Link>
                  </Button>
                  <Button asChild variant="marketing">
                    <Link href="/contact-support">Contact support</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
