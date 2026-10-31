import localFont from "next/font/local";
import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs"; // Clerk - removed, using Better Auth
import { Toaster } from "sonner";
import ConditionalHeader from "@/components/conditional-header";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingChat } from "@/components/FloatingChat";
import { MainWrapper } from "@/components/main-wrapper";

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist-sans",
});
const dmSans = localFont({
  src: "./fonts/dm-sans-latin.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-heading",
});
const caveat = localFont({
  src: "./fonts/caveat-latin.woff2",
  weight: "500 700",
  display: "swap",
  variable: "--font-handwriting",
});

export const metadata = {
  title: "Payollar App",
  description: "Connect with talents anytime, anywhere",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${inter.variable} ${dmSans.variable} ${caveat.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <ConditionalHeader />

            <MainWrapper>
              {children}
            </MainWrapper>
          </div>

          <FloatingChat />
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
