import { Inter } from "next/font/google";
import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs"; // Clerk - removed, using Better Auth
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 pt-16">
              {children}
            </main>
          </div>

          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
