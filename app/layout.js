import { Inter, DM_Sans, Caveat } from "next/font/google";
import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs"; // Clerk - removed, using Better Auth
import { Toaster } from "sonner";
import ConditionalHeader from "@/components/conditional-header";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingChat } from "@/components/FloatingChat";
import { MainWrapper } from "@/components/main-wrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
  weight: ["500", "600", "700"],
});

export const metadata = {
  title: "Payollar App",
  description: "Connect with talents anytime, anywhere",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
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
